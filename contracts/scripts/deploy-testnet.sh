#!/usr/bin/env bash
# Deploys the remittance-pool contract to Stellar Testnet, wraps two assets
# as Stellar Asset Contracts (SAC) to trade between, and initializes the pool.
#
# Usage: ./scripts/deploy-testnet.sh
# Requires: stellar CLI (https://developers.stellar.org/docs/tools/developer-tools)
#
# Prints the values to paste into backend/.env and frontend/.env.local at the end.

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

IDENTITY="${STELLAR_IDENTITY:-deployer}"
FEE_RATE="${FEE_RATE:-30}" # basis points, 30 = 0.3%
ASSET_B_CODE="${ASSET_B_CODE:-NGNT}" # a test credit asset, issued by the deployer itself

echo "==> Building contract (wasm32v1-none)..."
cargo build --target wasm32v1-none --release

if ! stellar keys address "$IDENTITY" >/dev/null 2>&1; then
  echo "==> Creating and funding identity '$IDENTITY'..."
  stellar keys generate "$IDENTITY" --network testnet --fund
else
  echo "==> Reusing existing identity '$IDENTITY'"
fi

ADMIN=$(stellar keys address "$IDENTITY")
echo "==> Admin / issuer address: $ADMIN"

echo "==> Deploying remittance-pool WASM..."
POOL_ID=$(stellar contract deploy \
  --wasm target/wasm32v1-none/release/remittance_pool.wasm \
  --source "$IDENTITY" \
  --network testnet)
echo "==> Pool contract ID: $POOL_ID"

echo "==> Wrapping native XLM as Token A (SAC)..."
TOKEN_A=$(stellar contract asset deploy \
  --asset native \
  --source "$IDENTITY" \
  --network testnet)
echo "==> Token A ($TOKEN_A) = native XLM"

echo "==> Wrapping test credit asset '$ASSET_B_CODE:$ADMIN' as Token B (SAC)..."
TOKEN_B=$(stellar contract asset deploy \
  --asset "$ASSET_B_CODE:$ADMIN" \
  --source "$IDENTITY" \
  --network testnet)
echo "==> Token B ($TOKEN_B) = $ASSET_B_CODE issued by $ADMIN"

echo "==> Initializing pool (fee_rate=$FEE_RATE bps)..."
stellar contract invoke \
  --id "$POOL_ID" \
  --source "$IDENTITY" \
  --network testnet \
  -- initialize \
  --admin "$ADMIN" \
  --token_a "$TOKEN_A" \
  --token_b "$TOKEN_B" \
  --fee_rate "$FEE_RATE"

cat <<EOF

======================================================================
 Deployed. Paste these into backend/.env:

REMITTANCE_POOL_CONTRACT_ID=$POOL_ID
TOKEN_A_CONTRACT_ID=$TOKEN_A
TOKEN_B_CONTRACT_ID=$TOKEN_B

 ...and these into frontend/.env.local:

NEXT_PUBLIC_TOKEN_A_CONTRACT_ID=$TOKEN_A
NEXT_PUBLIC_TOKEN_B_CONTRACT_ID=$TOKEN_B
NEXT_PUBLIC_TOKEN_A_CODE=XLM
NEXT_PUBLIC_TOKEN_B_CODE=$ASSET_B_CODE

 The pool has zero liquidity until someone calls add_liquidity. The
 admin identity ('$IDENTITY', $ADMIN) is both the pool admin and the
 $ASSET_B_CODE issuer, so it can seed both sides:

   stellar contract invoke --id $POOL_ID --source $IDENTITY --network testnet -- \\
     add_liquidity --user $ADMIN --amount_a 10000000000 --amount_b 10000000000
======================================================================
EOF
