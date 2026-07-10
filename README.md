Deployment link - https://stellar-bankk.netlify.app/
<img width="1920" height="1200" alt="image" src="https://github.com/user-attachments/assets/11835f7b-c339-44d4-9f9e-96a74a0971d5" />

# StellarBank

A cross-border remittance MVP on Stellar/Soroban, built for a hackathon.

Lock one Stellar asset, a constant-product AMM contract converts it, the
recipient receives the other asset — atomically, in one signed transaction.
No custodial balances: the backend builds the transaction but never holds a
private key; the user signs it in their own wallet (Freighter).

## How it works

```
 User A (sender)                    Backend                      Soroban / Stellar
 ───────────────                    ───────                      ──────────────────
 1. register / login  ─────────────▶ JWT auth, SQLite
 2. link Freighter wallet ─────────▶ store public key ──────────▶ Horizon (read balance)
 3. request a transfer ────────────▶ build unsigned XDR ────────▶ remittance-pool.transfer_cross_border
                                       (simulate + prepare)         (simulated, not yet submitted)
 4. sign XDR in Freighter (client-side — backend never sees the key)
 5. send signed XDR ───────────────▶ submit + poll ──────────────▶ Soroban RPC → confirmed on-chain
                                     record result in SQLite
 6. recipient's balance updated on-chain; sender sees tx in history
```

The pool contract holds reserves of two Stellar Asset Contract (SAC) tokens
(e.g. wrapped XLM and a test "NGNT" credit asset) and prices swaps with a
constant-product curve (`x * y = k`), the same mechanism Uniswap-style AMMs
use. `transfer_cross_border` combines a swap and a transfer to the
recipient's address into one atomic call.

## What's actually here

| Layer | Status |
|---|---|
| **`contracts/`** — Soroban `remittance-pool` (Rust) | Real. Constant-product AMM: `initialize`, `add_liquidity`, `remove_liquidity`, `transfer_cross_border`, `get_exchange_rate`, `get_pool_info`, `get_lp_balance`. 12 passing unit tests. Moves real tokens via the Stellar Asset Contract (`token::Client`) interface. |
| **`backend/`** — Express/TypeScript API | Real. JWT auth (register/login/refresh/logout, optional TOTP 2FA), Stellar wallet linking, Horizon balance reads, and — the core piece — builds unsigned Soroban transactions, accepts Freighter-signed ones back, submits them, and polls for on-chain confirmation. SQLite (Node's built-in `node:sqlite`) for persistence, zero setup. |
| **`frontend/`** — Next.js 14 | Real. Register/login, Freighter wallet connect, a dashboard that reads live pool state and sends a remittance end-to-end, transaction history. |

This started from a scaffold with a much larger vision (KYC/2FA-over-SMS,
Kubernetes, Terraform, a mobile app, three more contracts: exchange-handler,
compliance-oracle, multi-sig-escrow). None of that was built, and the repo
used to contain ~100 commits and dozens of placeholder files (`helper-NNNNN.ts`,
`config-NNNNN.yml`, timestamped one-liners) fabricated to make it look like a
mature, actively-developed codebase with a team behind it — that's been
stripped out, along with fake testimonials and usage stats on the landing
page. What's left is smaller but real: every route, page, and contract
function listed above actually works end to end, verified by hand (including
a real register → link-wallet → send → history walkthrough in a browser), not
just typechecked.

## Repository layout

```text
StellarBank/
├── frontend/    Next.js web app (App Router)
│   └── src/
│       ├── app/            pages: /, /auth/login, /auth/register, /connect, /dashboard, /dashboard/history
│       ├── components/     shared Button, Navbar
│       ├── lib/            api client, Freighter wallet helpers, config
│       └── store/          zustand auth store (persisted session)
├── backend/     Express API + Soroban integration
│   └── src/
│       ├── config/         SQLite schema + app config
│       ├── controllers/    auth controller (register/login/2FA)
│       ├── middleware/     JWT auth guard, centralized error handler
│       ├── routes/         auth, users, wallets, transactions, compliance
│       ├── services/       auth, user, notification (stub), soroban (the core piece)
│       └── utils/          AppError, logger
├── contracts/
│   ├── remittance-pool/    the one real contract (Rust, Soroban SDK 25)
│   └── scripts/            deploy-testnet.sh
├── docs/        API.md — full route reference
└── .github/     CI: backend tests, frontend build, contract tests
```

Each of `frontend/`, `backend/`, and `contracts/` has its own README with
more detail; `docs/API.md` documents every endpoint with request/response
shapes.

## Quickstart

Requires **Node.js 22.5+** (for the backend's built-in SQLite — see
`engines` in `package.json`), **Rust** with the `wasm32v1-none` target, and
the **Stellar CLI** if you want to deploy the contract yourself. This is an
npm-workspaces repo — install once at the root, not separately in
`backend/`/`frontend/`.

```bash
npm install    # installs both frontend and backend workspaces from one root lockfile

# Backend
cd backend && cp .env.example .env && npm run dev
# → http://localhost:8000  (health check at /health)

# Frontend (separate terminal)
cd frontend && cp .env.example .env.local && npm run dev
# → http://localhost:3000
```

At this point: registration, login, 2FA, wallet linking, Horizon balance
lookups, and the compliance-status placeholder all work. The dashboard's
"send a remittance" flow will show a clear **pool not configured** message
until you deploy the contract, because `REMITTANCE_POOL_CONTRACT_ID` /
`TOKEN_A_CONTRACT_ID` / `TOKEN_B_CONTRACT_ID` are blank by default.

### Deploying the contract to testnet

```bash
cd contracts
./scripts/deploy-testnet.sh
```

This builds the contract, creates/funds a `deployer` testnet identity, wraps
native XLM and a test "NGNT" credit asset as Stellar Asset Contracts, deploys
and initializes the pool, and prints the exact env vars to paste into
`backend/.env` (`REMITTANCE_POOL_CONTRACT_ID`, `TOKEN_A_CONTRACT_ID`,
`TOKEN_B_CONTRACT_ID`) and `frontend/.env.local`
(`NEXT_PUBLIC_TOKEN_A_CONTRACT_ID`, `NEXT_PUBLIC_TOKEN_B_CONTRACT_ID`). It
also prints an `add_liquidity` invocation to seed the pool so there's
something to swap against — the dashboard won't show a usable rate until the
pool has liquidity.

> **Heads up if you hit `client error (Connect)` deploying**: this was a
> Soroban-RPC-reachability issue in *our* sandboxed build environment during
> development (a stale local root-CA bundle the `stellar` CLI's bundled TLS
> stack didn't respect), not a problem with the script. From a normal machine
> or CI runner it should just work; if you do hit it, check your CLI version
> and system CA trust store first.

## Environment variables

**`backend/.env`** (see `backend/.env.example`):

| Variable | Purpose |
|---|---|
| `PORT`, `NODE_ENV` | server port and environment |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | signing secrets for access/refresh tokens — set these to long random strings, never reuse the example values |
| `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` | token lifetimes (default `1h` / `7d`) |
| `SQLITE_DATA_DIR`, `SQLITE_DB_NAME` | optional overrides; defaults to `./data/stellarbank.db` (in-memory when `NODE_ENV=test`) |
| `STELLAR_NETWORK`, `STELLAR_HORIZON_URL`, `STELLAR_SOROBAN_RPC_URL`, `STELLAR_NETWORK_PASSPHRASE` | which Stellar network to talk to (testnet by default) |
| `REMITTANCE_POOL_CONTRACT_ID`, `TOKEN_A_CONTRACT_ID`, `TOKEN_B_CONTRACT_ID` | filled in by `deploy-testnet.sh`; blank until the contract is deployed |

**`frontend/.env.local`** (see `frontend/.env.example`):

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | backend base URL, e.g. `http://localhost:8000` |
| `NEXT_PUBLIC_STELLAR_NETWORK`, `NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE` | must match the backend's Stellar network |
| `NEXT_PUBLIC_TOKEN_A_CONTRACT_ID`, `NEXT_PUBLIC_TOKEN_B_CONTRACT_ID` | filled in by `deploy-testnet.sh` |
| `NEXT_PUBLIC_TOKEN_A_CODE`, `NEXT_PUBLIC_TOKEN_B_CODE` | display codes for the two pool assets (defaults `XLM` / `NGNT`) |

## API surface

All routes below are mounted under `/api/v1` and (aside from `/auth/*`)
require a bearer access token. Full request/response shapes are in
[`docs/API.md`](./docs/API.md).

| Route | Method | Purpose |
|---|---|---|
| `/auth/register`, `/auth/login` | POST | create an account / obtain tokens |
| `/auth/refresh` | POST | exchange a refresh token for a new access token |
| `/auth/logout` | POST | blacklist the current token |
| `/auth/2fa/enable`, `/auth/2fa/verify` | POST | TOTP 2FA setup (speakeasy + qrcode) |
| `/users/me` | GET | current user profile |
| `/wallets/link` | POST | link a Stellar public key to the account |
| `/wallets` | GET | list linked wallets |
| `/wallets/:publicKey/balance` | GET | live Horizon balance lookup |
| `/transactions/pool-info` | GET | live reserves, fee rate, active status from the deployed pool |
| `/transactions/rate` | GET | current exchange rate between two token contract IDs |
| `/transactions/build` | POST | build + simulate an unsigned `transfer_cross_border` XDR |
| `/transactions/submit` | POST | submit a Freighter-signed XDR, poll for confirmation, record the result |
| `/transactions` | GET | the caller's remittance history |
| `/compliance/status` | GET | placeholder KYC-level/limits lookup (not real KYC/AML — see below) |

Root-level (no `/api/v1` prefix, no auth): `GET /health` and `GET /docs`
(Swagger UI).

## Known stubs — read before demoing

These are intentionally not implemented, and say so in the code:

- **Notifications** (`backend/src/services/notification.service.ts`): logs
  to the console instead of sending real email/SMS.
- **Compliance** (`backend/src/routes/compliance.routes.ts`): returns a
  deterministic KYC-limits table keyed off the user's stored `kycLevel` —
  not real KYC/AML screening.
- **Contract scope**: only `remittance-pool` exists. The original scaffold
  named three more contracts (`exchange-handler`, `compliance-oracle`,
  `multi-sig-escrow`) that were never implemented and are not workspace
  members — see `contracts/README.md`.
- **Mobile app, Docker/Kubernetes/Terraform**: dropped entirely as out of
  scope for this MVP; no Dockerfiles or IaC exist in this repo.

## Tests

```bash
cd backend && npm test         # Jest — AppError + AuthService unit tests
cd frontend && npm run lint && npx tsc --noEmit
cd contracts && cargo test     # 12 passing unit tests
```

CI (`.github/workflows/ci.yml`) runs all three (plus a release-mode WASM
build of the contract) on every push/PR to `main`.

## License

MIT — see [LICENSE](./LICENSE).
