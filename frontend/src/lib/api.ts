import { apiUrl } from './config';
import { useAuthStore } from '@/store/auth';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, init: RequestInit = {}, auth = true): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');

  if (auth) {
    const token = useAuthStore.getState().accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${apiUrl}/api/v1${path}`, { ...init, headers });
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message = body?.message || body?.error || `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, body?.error);
  }

  return body as T;
}

// ---------- Auth ----------

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  countryCode: string;
}

export interface LoginInput {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface AuthResponse {
  message: string;
  tokens: { accessToken: string; refreshToken: string; expiresIn: string };
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    kycStatus: string;
    kycLevel: number;
  };
}

export function register(input: RegisterInput) {
  return request<{ message: string; user: unknown }>(
    '/auth/register',
    { method: 'POST', body: JSON.stringify(input) },
    false
  );
}

export function login(input: LoginInput) {
  return request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(input) }, false);
}

// ---------- Wallets ----------

export function linkWallet(publicKey: string) {
  return request<{ id: string; publicKey: string; alreadyLinked: boolean }>('/wallets/link', {
    method: 'POST',
    body: JSON.stringify({ publicKey }),
  });
}

export function listWallets() {
  return request<{ wallets: { id: string; publicKey: string; isPrimary: boolean }[] }>('/wallets');
}

export function getWalletBalance(publicKey: string) {
  return request<{ balances: Array<Record<string, string>> }>(
    `/wallets/${publicKey}/balance`
  );
}

// ---------- Transactions / remittance ----------

export interface PoolInfo {
  tokenA: string;
  tokenB: string;
  reserveA: string;
  reserveB: string;
  totalLpSupply: string;
  feeRate: number;
  active: boolean;
}

export function getPoolInfo() {
  return request<PoolInfo>('/transactions/pool-info');
}

export function getRate(from: string, to: string) {
  return request<{ rate: string; inverseRate: string; updatedAt: string }>(
    `/transactions/rate?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
  );
}

export function buildRemitTransaction(input: {
  recipientPublicKey: string;
  amount: string;
  destinationTokenContractId: string;
  minAmountOut: string;
}) {
  return request<{ xdr: string; networkPassphrase: string }>('/transactions/build', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function submitRemitTransaction(input: {
  signedXdr: string;
  recipientPublicKey: string;
  amount: string;
  sourceAsset: string;
  destinationAsset: string;
}) {
  return request<{
    id: string;
    hash: string;
    status: string;
    amountOut?: string;
    feeCharged?: string;
  }>('/transactions/submit', { method: 'POST', body: JSON.stringify(input) });
}

export interface TransactionRecord {
  id: string;
  stellar_tx_hash: string | null;
  sender_address: string;
  recipient_address: string;
  source_asset: string;
  destination_asset: string;
  amount: string;
  amount_out: string | null;
  fee_charged: string | null;
  status: string;
  error: string | null;
  created_at: string;
}

export function listTransactions() {
  return request<{ transactions: TransactionRecord[] }>('/transactions');
}

// ---------- Compliance ----------

export function getComplianceStatus() {
  return request<{
    kycStatus: string;
    kycLevel: number;
    limits: { dailyUsd: number; monthlyUsd: number };
  }>('/compliance/status');
}
