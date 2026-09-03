# StellarBank API

Reference for the routes actually implemented in `backend/src`. For the full
request/response shapes, read the route + controller source directly — this
doc is a map, not a spec generator.

Base URL: `http://localhost:8000/api/v1` (local dev). Swagger UI for the
`/auth` routes (the only ones with `@swagger` JSDoc annotations so far) is at
`http://localhost:8000/docs`.

## Authentication

JWT bearer tokens. `POST /auth/login` returns `{ tokens: { accessToken,
refreshToken, expiresIn } }`; send `Authorization: Bearer <accessToken>` on
every subsequent request. All routes below except `/auth/register` and
`/auth/login` require this header.

| Method | Path | Notes |
|---|---|---|
| POST | `/auth/register` | Creates a user. Password hashed with bcrypt; no real email/SMS is sent (see `NotificationService` — it's a logging stub). |
| POST | `/auth/login` | Returns access + refresh tokens. Supports an optional `twoFactorCode` if 2FA is enabled. |
| POST | `/auth/refresh` | Exchange a refresh token for a new pair. |
| POST | `/auth/logout` | Blacklists the current access token. |
| POST | `/auth/2fa/enable` | Generates a TOTP secret + QR code (speakeasy/qrcode). |
| POST | `/auth/2fa/verify` | Verifies a TOTP code and turns 2FA on, returns backup codes. |

## Users

| Method | Path | Notes |
|---|---|---|
| GET | `/users/me` | Current user's profile. |

## Wallets

| Method | Path | Notes |
|---|---|---|
| POST | `/wallets/link` | Associates a Stellar public key (`G...`) with the logged-in user. First linked wallet becomes primary. |
| GET | `/wallets` | List the user's linked wallets. |
| GET | `/wallets/:publicKey/balance` | Live Horizon balance lookup for that account. |

## Transactions (the actual remittance flow)

| Method | Path | Notes |
|---|---|---|
| GET | `/transactions/pool-info` | Reads the deployed `remittance-pool` contract's reserves/fee via Soroban RPC simulation. Returns `503 CONTRACT_NOT_CONFIGURED` if `REMITTANCE_POOL_CONTRACT_ID` isn't set, `400 ACCOUNT_NOT_FUNDED` if the caller's linked wallet doesn't exist on-chain yet. |
| GET | `/transactions/rate?from=&to=` | Current pool-implied exchange rate between two token contract IDs. |
| POST | `/transactions/build` | Builds and Soroban-prepares an unsigned `transfer_cross_border` transaction, returns XDR for the frontend to sign with Freighter. The backend never sees a private key. |
| POST | `/transactions/submit` | Accepts a Freighter-signed XDR, submits it, polls for the on-chain result, and records the outcome. |
| GET | `/transactions` | The user's remittance history (from the local SQLite mirror, not a chain query). |

## Compliance

| Method | Path | Notes |
|---|---|---|
| GET | `/compliance/status` | Returns the user's `kycStatus`/`kycLevel` and a deterministic limits table keyed off level. This is a placeholder — see `contracts/README.md`'s note on the unimplemented `compliance-oracle` contract. Not real KYC/AML/sanctions screening. |

## Error shape

Every error response is `{ "error": "<CODE>", "message": "<human-readable>" }`
with an appropriate HTTP status, produced by `middleware/error.middleware.ts`
via a thrown `AppError`.

## What's not here

No webhooks, no SDKs, no multi-currency wallets beyond the two tokens the
deployed pool trades, no analytics endpoints. These were in an earlier,
much larger draft of this doc describing a product vision well beyond the
hackathon MVP's scope — removed rather than left as aspirational fiction.
