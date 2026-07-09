# StellarBank Smart Contracts

Soroban contracts powering StellarBank's cross-border remittance MVP.

[![Rust](https://img.shields.io/badge/Rust-1.81%2B-orange)](https://rustlang.org)
[![Soroban SDK](https://img.shields.io/badge/soroban--sdk-26.1-blue)](https://soroban.stellar.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What's implemented

**`remittance-pool`** — a constant-product AMM (Uniswap-v2-style, `x * y = k`) between two Stellar assets:

- `initialize(admin, token_a, token_b, fee_rate)` — set up the pool once, admin-authorized.
- `add_liquidity(user, amount_a, amount_b)` — deposit both assets, mint LP tokens tracking the depositor's share. Pulls real tokens from the user via the Stellar Asset Contract's `transfer`.
- `remove_liquidity(user, lp_amount)` — burn LP tokens, withdraw a proportional share of both reserves.
- `transfer_cross_border(sender, recipient, amount, destination_currency, min_amount_out)` — swap one asset for the other and send the output directly to `recipient`, with slippage protection via `min_amount_out`. This is the core remittance primitive: a sender holding asset A can pay a recipient who only ever touches asset B, atomically, in one call.
- `get_exchange_rate(from_token, to_token)` — current pool-implied rate, 7-decimal precision (Stellar convention).
- `get_pool_info` / `get_lp_balance` — read-only views.

12 unit tests cover initialization, liquidity provision/removal, swaps in both directions, slippage rejection, invalid-pair rejection, and the pre-liquidity error state. Run them with `cargo test`.

## What's not implemented (yet)

The original design sketched four contracts: this pool, an `exchange-handler` (DEX routing/atomic swaps), a `compliance-oracle` (KYC/sanctions screening), and a `multi-sig-escrow` (dispute resolution). Only `remittance-pool` has real code — the other three are noted here as the natural next step, not built for the hackathon MVP. Do not assume they exist; they are not workspace members and nothing in `backend/` or `frontend/` calls them.

## Building

Soroban's SDK requires the `wasm32v1-none` target (Rust 1.84+), not the older `wasm32-unknown-unknown`:

```bash
rustup target add wasm32v1-none
cargo test                                          # unit tests
cargo build --target wasm32v1-none --release        # produces target/wasm32v1-none/release/remittance_pool.wasm
```

### A dependency-resolution gotcha

If you delete `Cargo.lock` and re-resolve from scratch, you may hit a compile error inside `soroban-env-host`'s test utilities:

```
the trait bound `ChaCha20Rng: ed25519_dalek::rand_core::CryptoRng` is not satisfied
```

This happens because `soroban-env-host` depends on `ed25519-dalek = ">=2.0.0"` (unbounded), and a fresh resolve can pick `ed25519-dalek 3.0.0`, whose `CryptoRng` bound is incompatible with the `rand_chacha`-based PRNG `soroban-env-host`'s own test helpers use internally. `Cargo.toml` pins `ed25519-dalek`, `rand_core`, and `rand_chacha` to older compatible versions to avoid this, and this repo's `Cargo.lock` is committed so you shouldn't hit it in practice. If you do (e.g. after `cargo update`), the fix is:

```bash
cargo update -p ed25519-dalek --precise 2.2.0
```

## Deploying to testnet

```bash
stellar keys generate deployer --network testnet --fund

stellar contract deploy \
  --wasm target/wasm32v1-none/release/remittance_pool.wasm \
  --source deployer \
  --network testnet

# Wrap two Stellar assets as SAC tokens to trade between (e.g. native XLM and
# a test credit asset), then initialize:
stellar contract invoke --id <POOL_ID> --source deployer --network testnet -- \
  initialize --admin <ADMIN_ADDRESS> --token_a <TOKEN_A_SAC> --token_b <TOKEN_B_SAC> --fee_rate 30
```

See the root README for how the deployed pool's contract ID and network config flow into `backend/.env`.

## License

MIT — see [LICENSE](../LICENSE).
