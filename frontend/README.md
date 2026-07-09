# StellarBank Frontend

Next.js 14 (App Router) web client for the StellarBank remittance MVP.

## Pages

| Route | What it does |
|---|---|
| `/` | Landing page. |
| `/auth/register`, `/auth/login` | Email/password auth against the backend. |
| `/connect` | Connects a Stellar wallet via the Freighter browser extension. |
| `/dashboard` | Shows live pool reserves/fee (from the deployed contract) and a form to send a remittance: builds an unsigned transaction on the backend, signs it in Freighter, submits it, shows the result. |
| `/dashboard/history` | Past remittances, from the backend's SQLite-backed history. |

## Stack

- Next.js 14, React 18, TypeScript
- Tailwind CSS
- `@stellar/freighter-api` for wallet connect + transaction signing
- `@stellar/stellar-sdk` (client-side XDR handling)
- `@tanstack/react-query` for data fetching
- `zustand` (with `persist`) for auth/wallet session state

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Requires the backend running at
`NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`).

Sending an actual remittance additionally requires:
1. The `remittance-pool` contract deployed (`contracts/scripts/deploy-testnet.sh`)
2. `REMITTANCE_POOL_CONTRACT_ID` set in `backend/.env`
3. `NEXT_PUBLIC_TOKEN_A_CONTRACT_ID` / `NEXT_PUBLIC_TOKEN_B_CONTRACT_ID` set here in `.env.local`
4. The [Freighter](https://www.freighter.app/) browser extension, set to Testnet

Without those, every other page and flow (auth, wallet linking, compliance
status) still works — the dashboard just shows a clear "pool not configured"
message instead of pretending there's data.

## Notes

- No custodial anything: the backend builds transactions, Freighter signs
  them client-side, the backend only ever sees a signed XDR blob.
- `useAuthStore`'s `hasHydrated` flag exists to avoid a real bug we hit during
  testing: `zustand`'s `persist` middleware reads `localStorage`
  asynchronously, so on first render a logged-in user briefly looks logged
  out. Every auth-guarded page waits for `hasHydrated` before deciding to
  redirect.
