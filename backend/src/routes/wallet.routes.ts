import { Router, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { Horizon, StrKey } from '@stellar/stellar-sdk';
import { v4 as uuidv4 } from 'uuid';
import { AuthedRequest } from '../middleware/auth.middleware';
import { config, db } from '../config/database';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

const router = Router();
const horizon = new Horizon.Server(config.stellar.horizonUrl);

interface WalletRow {
  id: string;
  user_id: string;
  stellar_public_key: string;
  is_primary: number;
  created_at: string;
}

router.post(
  '/link',
  [body('publicKey').custom((value) => StrKey.isValidEd25519PublicKey(value))],
  async (req: AuthedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('VALIDATION_ERROR', 'A valid Stellar public key is required', 400);
    }

    const { publicKey } = req.body as { publicKey: string };

    const existing = db
      .prepare('SELECT * FROM wallets WHERE stellar_public_key = ?')
      .get(publicKey) as unknown as WalletRow | undefined;
    if (existing) {
      if (existing.user_id !== req.userId) {
        throw new AppError('CONFLICT', 'This wallet is already linked to another account', 409);
      }
      res.json({ id: existing.id, publicKey: existing.stellar_public_key, alreadyLinked: true });
      return;
    }

    const hasPrimary = db
      .prepare('SELECT 1 FROM wallets WHERE user_id = ? AND is_primary = 1')
      .get(req.userId!);

    const id = uuidv4();
    db.prepare(
      'INSERT INTO wallets (id, user_id, stellar_public_key, is_primary) VALUES (?, ?, ?, ?)'
    ).run(id, req.userId!, publicKey, hasPrimary ? 0 : 1);

    res.status(201).json({ id, publicKey, alreadyLinked: false });
  }
);

router.get('/', async (req: AuthedRequest, res: Response) => {
  const rows = db
    .prepare('SELECT * FROM wallets WHERE user_id = ? ORDER BY created_at ASC')
    .all(req.userId!) as unknown as WalletRow[];

  res.json({
    wallets: rows.map((row) => ({
      id: row.id,
      publicKey: row.stellar_public_key,
      isPrimary: !!row.is_primary,
      createdAt: row.created_at,
    })),
  });
});

router.get(
  '/:publicKey/balance',
  [param('publicKey').custom((value) => StrKey.isValidEd25519PublicKey(value))],
  async (req: AuthedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('VALIDATION_ERROR', 'A valid Stellar public key is required', 400);
    }

    try {
      const account = await horizon.loadAccount(req.params.publicKey);
      res.json({ balances: account.balances });
    } catch (err) {
      logger.warn('Horizon account lookup failed', { error: (err as Error).message });
      throw new AppError(
        'ACCOUNT_NOT_FOUND',
        'Stellar account not found or not yet funded on this network',
        404
      );
    }
  }
);

export default router;
