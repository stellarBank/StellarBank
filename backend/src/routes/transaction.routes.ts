import { Router, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { AuthedRequest } from '../middleware/auth.middleware';
import { db, config } from '../config/database';
import { AppError } from '../utils/AppError';
import {
  buildRemitTransaction,
  submitSignedTransaction,
  getExchangeRate,
  getPoolInfo,
} from '../services/soroban.service';
import { logger } from '../utils/logger';

const router = Router();

interface WalletRow {
  stellar_public_key: string;
}

function primaryWallet(userId: string): string {
  const row = db
    .prepare('SELECT stellar_public_key FROM wallets WHERE user_id = ? AND is_primary = 1')
    .get(userId) as WalletRow | undefined;
  if (!row) {
    throw new AppError(
      'NO_WALLET_LINKED',
      'Link a Stellar wallet via POST /wallets/link before sending a remittance',
      400
    );
  }
  return row.stellar_public_key;
}

router.get('/pool-info', async (req: AuthedRequest, res: Response) => {
  const source = primaryWallet(req.userId!);
  const info = await getPoolInfo(source);
  res.json({
    tokenA: info.token_a,
    tokenB: info.token_b,
    reserveA: info.reserve_a.toString(),
    reserveB: info.reserve_b.toString(),
    totalLpSupply: info.total_lp_supply.toString(),
    feeRate: info.fee_rate,
    active: info.active,
  });
});

router.get(
  '/rate',
  [query('from').isString().notEmpty(), query('to').isString().notEmpty()],
  async (req: AuthedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('VALIDATION_ERROR', 'from and to token contract IDs are required', 400);
    }
    const source = primaryWallet(req.userId!);
    const { from, to } = req.query as { from: string; to: string };
    const rate = await getExchangeRate(from, to, source);
    res.json({
      rate: rate.rate.toString(),
      inverseRate: rate.inverse_rate.toString(),
      updatedAt: rate.updated_at.toString(),
    });
  }
);

router.post(
  '/build',
  [
    body('recipientPublicKey').isString().notEmpty(),
    body('amount').isString().notEmpty(),
    body('destinationTokenContractId').isString().notEmpty(),
    body('minAmountOut').isString().notEmpty(),
  ],
  async (req: AuthedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('VALIDATION_ERROR', errors.array()[0].msg, 400);
    }

    const senderPublicKey = primaryWallet(req.userId!);
    const { recipientPublicKey, amount, destinationTokenContractId, minAmountOut } = req.body;

    const xdr = await buildRemitTransaction({
      senderPublicKey,
      recipientPublicKey,
      amount,
      destinationTokenContractId,
      minAmountOut,
    });

    res.json({ xdr, networkPassphrase: config.stellar.networkPassphrase });
  }
);

router.post(
  '/submit',
  [
    body('signedXdr').isString().notEmpty(),
    body('recipientPublicKey').isString().notEmpty(),
    body('amount').isString().notEmpty(),
    body('sourceAsset').isString().notEmpty(),
    body('destinationAsset').isString().notEmpty(),
  ],
  async (req: AuthedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('VALIDATION_ERROR', errors.array()[0].msg, 400);
    }

    const senderPublicKey = primaryWallet(req.userId!);
    const { signedXdr, recipientPublicKey, amount, sourceAsset, destinationAsset } = req.body;

    const id = uuidv4();
    db.prepare(
      `INSERT INTO transactions
        (id, user_id, sender_address, recipient_address, source_asset, destination_asset, amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`
    ).run(id, req.userId!, senderPublicKey, recipientPublicKey, sourceAsset, destinationAsset, amount);

    try {
      const result = await submitSignedTransaction(signedXdr);

      db.prepare(
        `UPDATE transactions
         SET status = ?, stellar_tx_hash = ?, amount_out = ?, fee_charged = ?, updated_at = datetime('now')
         WHERE id = ?`
      ).run(
        result.status.toLowerCase(),
        result.hash,
        result.amountOut ?? null,
        result.feeCharged ?? null,
        id
      );

      res.json({ id, ...result });
    } catch (err) {
      const message = (err as Error).message;
      logger.error('Remittance submission failed', { error: message, transactionId: id });
      db.prepare(
        "UPDATE transactions SET status = 'failed', error = ?, updated_at = datetime('now') WHERE id = ?"
      ).run(message, id);
      throw err;
    }
  }
);

router.get('/', async (req: AuthedRequest, res: Response) => {
  const rows = db
    .prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 100')
    .all(req.userId!);
  res.json({ transactions: rows });
});

export default router;
