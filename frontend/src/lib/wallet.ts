import {
  isConnected as freighterIsConnected,
  requestAccess,
  getAddress,
  signTransaction as freighterSignTransaction,
} from '@stellar/freighter-api';
import { stellarNetworkPassphrase } from './config';

export async function isFreighterInstalled(): Promise<boolean> {
  const result = await freighterIsConnected();
  return !result.error;
}

export async function connectFreighter(): Promise<string> {
  const access = await requestAccess();
  if (access.error) {
    throw new Error(access.error);
  }
  return access.address;
}

export async function getFreighterAddress(): Promise<string | null> {
  const result = await getAddress();
  if (result.error || !result.address) return null;
  return result.address;
}

export async function signXdr(xdr: string, publicKey: string): Promise<string> {
  const result = await freighterSignTransaction(xdr, {
    networkPassphrase: stellarNetworkPassphrase,
    address: publicKey,
  });
  if (result.error) {
    throw new Error(result.error.message || 'Freighter declined to sign the transaction');
  }
  return result.signedTxXdr;
}
