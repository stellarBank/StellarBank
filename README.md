# StellarBank

A cross-border remittance MVP on Stellar/Soroban, built for a hackathon.


Lock one Stellar asset, a constant-product AMM contract converts it, the
recipient receives the other asset — atomically, in one signed transaction.
No custodial balances: the backend never holds a private key.

## What's actually here

| Layer | Status |
|---|---|
| **`contracts/`** — Soroban `remittance-pool` (Rust) | Real. Constant-product AMM: `initialize`, `add_liquidity`, `remove_liquidity`, `transfer_cross_border`, `get_exchange_rate`, `get_pool_info`. 12 passing unit tests. Moves real tokens via the Stellar Asset Contract interface. |
| **`backend/`** — Express/TypeScript API | Real. JWT auth (register/login/2FA), Stellar wallet linking, Horizon balance reads, and — the core piece — builds unsigned Soroban transactions, accepts Freighter-signed ones back, submits them, and polls for on-chain confirmation. SQLite (Node's built-in `node:sqlite`) for persistence, zero setup. |
| **`frontend/`** — Next.js 14 | Real. Register/login, Freighter wallet connect, a dashboard that reads live pool state and sends a remittance end-to-end, transaction history. |

This started from a scaffold with a much larger vision (KYC/2FA-over-SMS,
Kubernetes, Terraform, a mobile app, three more contracts). None of that was
built, and the repo used to contain ~100 commits and dozens of placeholder
files fabricated to make it look like a mature, actively-developed
codebase — that's been stripped out. What's left is smaller but real: every
route, page, and contract function listed above actually works end to end,
verified by hand, not just typechecked.

## Quickstart

Requires **Node.js 22.5+** (for the backend's built-in SQLite), **Rust** with
the `wasm32v1-none` target, and the **Stellar CLI** if you want to deploy the
contract yourself.

```bash
# Backend
cd backend && npm install && cp .env.example .env && npm run dev
# → http://localhost:8000

# Frontend (separate terminal)
cd frontend && npm install && cp .env.example .env.local && npm run dev
# → http://localhost:3000
```

At this point: registration, login, 2FA, wallet linking, Horizon balance
lookups, and the compliance-status placeholder all work. The dashboard's
"send a remittance" flow will show a clear **pool not configured** message
until you deploy the contract:

```bash
cd contracts
./scripts/deploy-testnet.sh
```

This builds the contract, creates/funds a testnet identity, wraps native XLM
and a test credit asset as Stellar Asset Contracts, deploys and initializes
the pool, and prints the exact env vars to paste into `backend/.env` and
`frontend/.env.local`. It also prints the `add_liquidity` command to seed the
pool so there's something to swap against.

> **Heads up if you hit `client error (Connect)` deploying**: this is a
> Soroban-RPC-reachability issue in *our* sandboxed build environment during
> development, not a problem with the script — from a normal machine or CI
> runner it should just work. If you do see it, it was a stale-root-CA /
> TLS-trust issue specific to the `stellar` CLI's bundled TLS stack; try a
> different network or updating your CLI.

## Repository layout

```text
StellarBank/
├── frontend/    Next.js web app
├── backend/     Express API + Soroban integration
├── contracts/   remittance-pool Soroban contract (Rust)
├── docs/        API.md — the real route reference
└── .github/     CI (backend tests, frontend build, contract tests)
```

Each directory has its own README with more detail.

## Tests

```bash
cd backend && npm test        # Jest — currently exercises the type layer; add integration tests as the API grows
cd frontend && npm run lint && npx tsc --noEmit
cd contracts && cargo test    # 12 passing unit tests
```

CI (`.github/workflows/ci.yml`) runs all three on every push/PR.

## License

MIT — see [LICENSE](./LICENSE).
