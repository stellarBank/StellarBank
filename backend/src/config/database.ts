// Node's built-in SQLite (stable since Node 22.5) — no native compilation
// step, unlike better-sqlite3, which makes this a much more reliable choice
// for a project meant to just work when someone clones it.
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

const dataDir = process.env.SQLITE_DATA_DIR || path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath =
  process.env.NODE_ENV === 'test'
    ? ':memory:'
    : path.join(dataDir, process.env.SQLITE_DB_NAME || 'stellarbank.db');

export const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    country_code TEXT NOT NULL,
    kyc_status TEXT NOT NULL DEFAULT 'pending',
    kyc_level INTEGER NOT NULL DEFAULT 1,
    is_active INTEGER NOT NULL DEFAULT 1,
    email_verified INTEGER NOT NULL DEFAULT 0,
    phone_verified INTEGER NOT NULL DEFAULT 0,
    two_fa_enabled INTEGER NOT NULL DEFAULT 0,
    two_fa_secret TEXT,
    last_login_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS wallets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    stellar_public_key TEXT UNIQUE NOT NULL,
    is_primary INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    stellar_tx_hash TEXT,
    sender_address TEXT NOT NULL,
    recipient_address TEXT NOT NULL,
    source_asset TEXT NOT NULL,
    destination_asset TEXT NOT NULL,
    amount TEXT NOT NULL,
    amount_out TEXT,
    fee_charged TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    error TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS token_blacklist (
    token TEXT PRIMARY KEY,
    blacklisted_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
  CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
`);

export const config = {
  port: Number(process.env.PORT) || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret_change_me',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  stellar: {
    network: process.env.STELLAR_NETWORK || 'testnet',
    horizonUrl: process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
    sorobanRpcUrl: process.env.STELLAR_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org',
    networkPassphrase:
      process.env.STELLAR_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
    poolContractId: process.env.REMITTANCE_POOL_CONTRACT_ID || '',
    tokenAContractId: process.env.TOKEN_A_CONTRACT_ID || '',
    tokenBContractId: process.env.TOKEN_B_CONTRACT_ID || '',
  },
};
