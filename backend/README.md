# StellarBank Backend

Node.js/Express/TypeScript API for the StellarBank remittance MVP. Auth,
wallet linking, and — the part that actually matters — building, and
submitting `remittance-pool` Soroban contract calls on behalf of a signed-in
user.

## Stack

- **Express 4** + **TypeScript**
- **SQLite via `node:sqlite`** (Node's built-in module, stable since Node
  22.5) — no Docker, no Postgres, no native compilation step. This is a
  deliberate choice: the original scaffold called for Postgres + Redis, but
  for a hackathon MVP, "clone and run" mattered more than that infrastructure.
- **`@stellar/stellar-sdk`** for Horizon (balances) and Soroban RPC (contract
  reads, transaction building, submission)
- **JWT** (`jsonwebtoken`) auth, **bcryptjs** password hashing, **speakeasy**
  + **qrcode** for optional TOTP 2FA

See `../docs/API.md` for the actual route list.

## Local development

Requires **Node.js 22.5+** (for `node:sqlite`).

```bash
npm install
cp .env.example .env
npm run dev
```

Server starts on `http://localhost:8000`. Health check: `/health`. Swagger UI
for the auth routes: `/docs`.

Set `REMITTANCE_POOL_CONTRACT_ID`, `TOKEN_A_CONTRACT_ID`, and
`TOKEN_B_CONTRACT_ID` in `.env` after running
`contracts/scripts/deploy-testnet.sh` — until then, `/transactions/pool-info`,
`/rate`, `/build`, and `/submit` return `503 CONTRACT_NOT_CONFIGURED`. Auth,
wallet linking, and compliance-status all work with zero contract
configuration.

## What's real vs. what's a stub

- **Real**: JWT auth (register/login/refresh/logout/2FA), Stellar wallet
  linking, Horizon balance lookups, building/submitting/polling actual
  Soroban contract transactions, transaction history persisted to SQLite.
- **Stub, clearly marked in code**: `NotificationService` logs instead of
  sending real email/SMS (no Twilio/SMTP wired up). `/compliance/status`
  computes limits from a hardcoded table keyed by KYC level — it is not real
  KYC/AML/sanctions screening (see `contracts/README.md`'s note on the
  unimplemented `compliance-oracle` contract).

## Tests

```bash
npm test
```

## Production build

```bash
npm run build   # tsc + tsc-alias -> dist/
npm start
```
