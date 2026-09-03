import {
  rpc,
  Contract,
  TransactionBuilder,
  Address,
  nativeToScVal,
  scValToNative,
  BASE_FEE,
  Account,
  xdr,
} from '@stellar/stellar-sdk';
import { config } from '../config/database';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

const server = new rpc.Server(config.stellar.sorobanRpcUrl, { allowHttp: true });

function poolContract(): Contract {
  if (!config.stellar.poolContractId) {
    throw new AppError(
      'CONTRACT_NOT_CONFIGURED',
      'REMITTANCE_POOL_CONTRACT_ID is not set. Deploy the contract and set it in .env.',
      503
    );
  }
  return new Contract(config.stellar.poolContractId);
}

/**
 * Simulate a read-only contract call (no auth, no submission). Soroban still
 * requires a valid source account to build the transaction envelope even for
 * a simulation, so callers pass any existing funded account's public key.
 */
async function getAccountOrThrow(publicKey: string) {
  try {
    return await server.getAccount(publicKey);
  } catch (err) {
    throw new AppError(
      'ACCOUNT_NOT_FUNDED',
      `${publicKey} isn't a funded account on ${config.stellar.network} yet. Fund it (e.g. via Friendbot on testnet) and try again.`,
      400
    );
  }
}

async function simulateRead<T>(
  method: string,
  args: xdr.ScVal[],
  simulationSourcePublicKey: string
): Promise<T> {
  const account = await getAccountOrThrow(simulationSourcePublicKey);
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: config.stellar.networkPassphrase,
  })
    .addOperation(poolContract().call(method, ...args))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    throw new AppError('SOROBAN_SIMULATION_FAILED', sim.error, 502);
  }
  if (!sim.result) {
    throw new AppError('SOROBAN_SIMULATION_FAILED', 'Simulation returned no result', 502);
  }
  return scValToNative(sim.result.retval) as T;
}

export interface PoolInfo {
  token_a: string;
  token_b: string;
  reserve_a: bigint;
  reserve_b: bigint;
  total_lp_supply: bigint;
  fee_rate: number;
  active: boolean;
}

export async function getPoolInfo(simulationSourcePublicKey: string): Promise<PoolInfo> {
  return simulateRead<PoolInfo>('get_pool_info', [], simulationSourcePublicKey);
}

export async function getExchangeRate(
  fromToken: string,
  toToken: string,
  simulationSourcePublicKey: string
): Promise<{ rate: bigint; inverse_rate: bigint; updated_at: bigint }> {
  return simulateRead(
    'get_exchange_rate',
    [
      nativeToScVal(Address.fromString(fromToken), { type: 'address' }),
      nativeToScVal(Address.fromString(toToken), { type: 'address' }),
    ],
    simulationSourcePublicKey
  );
}

/**
 * Build (and server-side "prepare", i.e. simulate + attach the resulting
 * auth/footprint) an unsigned transfer_cross_border invocation. The backend
 * never holds user secret keys — this XDR goes back to the frontend, gets
 * signed there with Freighter, and comes back via submitSignedTransaction.
 */
export async function buildRemitTransaction(params: {
  senderPublicKey: string;
  recipientPublicKey: string;
  amount: string;
  destinationTokenContractId: string;
  minAmountOut: string;
}): Promise<string> {
  const account = await getAccountOrThrow(params.senderPublicKey);
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: config.stellar.networkPassphrase,
  })
    .addOperation(
      poolContract().call(
        'transfer_cross_border',
        nativeToScVal(Address.fromString(params.senderPublicKey), { type: 'address' }),
        nativeToScVal(Address.fromString(params.recipientPublicKey), { type: 'address' }),
        nativeToScVal(BigInt(params.amount), { type: 'i128' }),
        nativeToScVal(Address.fromString(params.destinationTokenContractId), { type: 'address' }),
        nativeToScVal(BigInt(params.minAmountOut), { type: 'i128' })
      )
    )
    .setTimeout(60)
    .build();

  const prepared = await server.prepareTransaction(tx);
  return prepared.toXDR();
}

export interface SubmitResult {
  hash: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  amountOut?: string;
  feeCharged?: string;
}

export async function submitSignedTransaction(signedXdr: string): Promise<SubmitResult> {
  const tx = TransactionBuilder.fromXDR(signedXdr, config.stellar.networkPassphrase);
  const sendResult = await server.sendTransaction(tx);

  if (sendResult.status === 'ERROR') {
    throw new AppError(
      'TRANSACTION_SUBMIT_FAILED',
      `Soroban RPC rejected the transaction: ${JSON.stringify(sendResult.errorResult)}`,
      502
    );
  }

  const hash = sendResult.hash;

  // Poll until the network reports a final status. In practice this
  // resolves in a few ledgers (a handful of seconds) on testnet.
  for (let attempt = 0; attempt < 15; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const result = await server.getTransaction(hash);

    if (result.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      let amountOut: string | undefined;
      let feeCharged: string | undefined;
      try {
        const returnValue = result.returnValue ? scValToNative(result.returnValue) : null;
        if (returnValue) {
          amountOut = String(returnValue.amount_out ?? '');
          feeCharged = String(returnValue.fee_charged ?? '');
        }
      } catch (err) {
        logger.warn('Could not decode transfer_cross_border return value', {
          error: (err as Error).message,
        });
      }
      return { hash, status: 'SUCCESS', amountOut, feeCharged };
    }

    if (result.status === rpc.Api.GetTransactionStatus.FAILED) {
      return { hash, status: 'FAILED' };
    }
  }

  return { hash, status: 'PENDING' };
}

export function accountFromPublicKey(publicKey: string): Account {
  return new Account(publicKey, '0');
}
