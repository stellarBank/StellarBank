#![cfg(test)]

use super::*;
use soroban_sdk::testutils::{Address as _};
use soroban_sdk::token::{StellarAssetClient, TokenClient};

fn create_token<'a>(env: &Env, admin: &Address) -> (Address, TokenClient<'a>, StellarAssetClient<'a>) {
    let sac = env.register_stellar_asset_contract_v2(admin.clone());
    let address = sac.address();
    let client = TokenClient::new(env, &address);
    let asset_client = StellarAssetClient::new(env, &address);
    (address, client, asset_client)
}

fn setup(env: &Env) -> (Address, Address, Address, TokenClient<'_>, TokenClient<'_>) {
    let admin = Address::generate(env);
    let (token_a_addr, token_a, token_a_admin) = create_token(env, &admin);
    let (token_b_addr, token_b, token_b_admin) = create_token(env, &admin);

    let contract_id = env.register(RemittancePool, ());
    let client = RemittancePoolClient::new(env, &contract_id);
    client.initialize(&admin, &token_a_addr, &token_b_addr, &30u32);

    // Mint plenty of both assets to play with in tests.
    token_a_admin.mint(&admin, &1_000_000_000);
    token_b_admin.mint(&admin, &1_000_000_000);

    let _ = (token_a, token_b);
    (contract_id, token_a_addr.clone(), token_b_addr.clone(), TokenClient::new(env, &token_a_addr), TokenClient::new(env, &token_b_addr))
}

#[test]
fn test_initialize_sets_pool_info() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let (token_a_addr, _, _) = create_token(&env, &admin);
    let (token_b_addr, _, _) = create_token(&env, &admin);

    let contract_id = env.register(RemittancePool, ());
    let client = RemittancePoolClient::new(&env, &contract_id);
    client.initialize(&admin, &token_a_addr, &token_b_addr, &30u32);

    let info = client.get_pool_info();
    assert_eq!(info.token_a, token_a_addr);
    assert_eq!(info.token_b, token_b_addr);
    assert_eq!(info.reserve_a, 0);
    assert_eq!(info.reserve_b, 0);
    assert_eq!(info.fee_rate, 30);
    assert!(info.active);
}

#[test]
fn test_initialize_rejects_double_init() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let (token_a_addr, _, _) = create_token(&env, &admin);
    let (token_b_addr, _, _) = create_token(&env, &admin);

    let contract_id = env.register(RemittancePool, ());
    let client = RemittancePoolClient::new(&env, &contract_id);
    client.initialize(&admin, &token_a_addr, &token_b_addr, &30u32);

    let result = client.try_initialize(&admin, &token_a_addr, &token_b_addr, &30u32);
    assert_eq!(result, Err(Ok(PoolError::AlreadyInitialized)));
}

#[test]
fn test_initialize_rejects_excessive_fee() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let (token_a_addr, _, _) = create_token(&env, &admin);
    let (token_b_addr, _, _) = create_token(&env, &admin);

    let contract_id = env.register(RemittancePool, ());
    let client = RemittancePoolClient::new(&env, &contract_id);
    let result = client.try_initialize(&admin, &token_a_addr, &token_b_addr, &1001u32);
    assert_eq!(result, Err(Ok(PoolError::InvalidAmount)));
}

#[test]
fn test_add_liquidity_mints_lp_tokens_and_moves_funds() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let (token_a_addr, token_a, token_a_admin) = create_token(&env, &admin);
    let (token_b_addr, token_b, token_b_admin) = create_token(&env, &admin);

    let contract_id = env.register(RemittancePool, ());
    let client = RemittancePoolClient::new(&env, &contract_id);
    client.initialize(&admin, &token_a_addr, &token_b_addr, &30u32);

    let lp = Address::generate(&env);
    token_a_admin.mint(&lp, &1_000_000);
    token_b_admin.mint(&lp, &1_000_000);

    let lp_tokens = client.add_liquidity(&lp, &100_000, &100_000);
    assert!(lp_tokens > 0);

    assert_eq!(token_a.balance(&lp), 900_000);
    assert_eq!(token_b.balance(&lp), 900_000);
    assert_eq!(token_a.balance(&contract_id), 100_000);
    assert_eq!(token_b.balance(&contract_id), 100_000);

    let info = client.get_pool_info();
    assert_eq!(info.reserve_a, 100_000);
    assert_eq!(info.reserve_b, 100_000);
    assert_eq!(client.get_lp_balance(&lp), lp_tokens);
}

#[test]
fn test_add_liquidity_rejects_dust_initial_deposit() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let (token_a_addr, _, token_a_admin) = create_token(&env, &admin);
    let (token_b_addr, _, token_b_admin) = create_token(&env, &admin);

    let contract_id = env.register(RemittancePool, ());
    let client = RemittancePoolClient::new(&env, &contract_id);
    client.initialize(&admin, &token_a_addr, &token_b_addr, &30u32);

    let lp = Address::generate(&env);
    token_a_admin.mint(&lp, &10);
    token_b_admin.mint(&lp, &10);

    let result = client.try_add_liquidity(&lp, &10, &10);
    assert_eq!(result, Err(Ok(PoolError::MinimumLiquidityNotMet)));
}

#[test]
fn test_transfer_cross_border_swaps_a_to_b() {
    let env = Env::default();
    env.mock_all_auths();

    let (contract_id, token_a_addr, token_b_addr, token_a, token_b) = setup(&env);
    let client = RemittancePoolClient::new(&env, &contract_id);

    let lp = Address::generate(&env);
    StellarAssetClient::new(&env, &token_a_addr).mint(&lp, &10_000_000);
    StellarAssetClient::new(&env, &token_b_addr).mint(&lp, &10_000_000);
    client.add_liquidity(&lp, &1_000_000, &1_000_000);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    StellarAssetClient::new(&env, &token_a_addr).mint(&sender, &10_000);

    let result = client.transfer_cross_border(&sender, &recipient, &10_000, &token_b_addr, &1);

    assert!(result.amount_out > 0);
    assert_eq!(result.amount_in, 10_000);
    assert_eq!(token_a.balance(&sender), 0);
    assert_eq!(token_b.balance(&recipient), result.amount_out);
}

#[test]
fn test_transfer_cross_border_rejects_slippage() {
    let env = Env::default();
    env.mock_all_auths();

    let (contract_id, token_a_addr, token_b_addr, _token_a, _token_b) = setup(&env);
    let client = RemittancePoolClient::new(&env, &contract_id);

    let lp = Address::generate(&env);
    StellarAssetClient::new(&env, &token_a_addr).mint(&lp, &10_000_000);
    StellarAssetClient::new(&env, &token_b_addr).mint(&lp, &10_000_000);
    client.add_liquidity(&lp, &1_000_000, &1_000_000);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    StellarAssetClient::new(&env, &token_a_addr).mint(&sender, &10_000);

    // Impossibly high minimum output should fail with SlippageExceeded.
    let result = client.try_transfer_cross_border(&sender, &recipient, &10_000, &token_b_addr, &1_000_000);
    assert_eq!(result, Err(Ok(PoolError::SlippageExceeded)));
}

#[test]
fn test_transfer_cross_border_rejects_invalid_currency_pair() {
    let env = Env::default();
    env.mock_all_auths();

    let (contract_id, token_a_addr, token_b_addr, _token_a, _token_b) = setup(&env);
    let client = RemittancePoolClient::new(&env, &contract_id);

    let lp = Address::generate(&env);
    StellarAssetClient::new(&env, &token_a_addr).mint(&lp, &10_000_000);
    StellarAssetClient::new(&env, &token_b_addr).mint(&lp, &10_000_000);
    client.add_liquidity(&lp, &1_000_000, &1_000_000);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    let unrelated_token = Address::generate(&env);
    StellarAssetClient::new(&env, &token_a_addr).mint(&sender, &10_000);

    let result = client.try_transfer_cross_border(&sender, &recipient, &10_000, &unrelated_token, &1);
    assert_eq!(result, Err(Ok(PoolError::InvalidCurrencyPair)));
}

#[test]
fn test_get_exchange_rate_reflects_reserves() {
    let env = Env::default();
    env.mock_all_auths();

    let (contract_id, token_a_addr, token_b_addr, _token_a, _token_b) = setup(&env);
    let client = RemittancePoolClient::new(&env, &contract_id);

    let lp = Address::generate(&env);
    StellarAssetClient::new(&env, &token_a_addr).mint(&lp, &10_000_000);
    StellarAssetClient::new(&env, &token_b_addr).mint(&lp, &10_000_000);
    // Equal reserves -> ~1:1 rate (7 decimal precision).
    client.add_liquidity(&lp, &500_000, &500_000);

    let rate = client.get_exchange_rate(&token_a_addr, &token_b_addr);
    assert_eq!(rate.rate, 10_000_000);
    assert_eq!(rate.inverse_rate, 10_000_000);
}

#[test]
fn test_get_exchange_rate_before_liquidity_is_insufficient_liquidity() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let (token_a_addr, _, _) = create_token(&env, &admin);
    let (token_b_addr, _, _) = create_token(&env, &admin);

    let contract_id = env.register(RemittancePool, ());
    let client = RemittancePoolClient::new(&env, &contract_id);
    client.initialize(&admin, &token_a_addr, &token_b_addr, &30u32);

    let result = client.try_get_exchange_rate(&token_a_addr, &token_b_addr);
    assert_eq!(result, Err(Ok(PoolError::InsufficientLiquidity)));
}

#[test]
fn test_remove_liquidity_returns_proportional_share() {
    let env = Env::default();
    env.mock_all_auths();

    let (contract_id, token_a_addr, token_b_addr, token_a, token_b) = setup(&env);
    let client = RemittancePoolClient::new(&env, &contract_id);

    let lp = Address::generate(&env);
    StellarAssetClient::new(&env, &token_a_addr).mint(&lp, &10_000_000);
    StellarAssetClient::new(&env, &token_b_addr).mint(&lp, &10_000_000);
    let lp_tokens = client.add_liquidity(&lp, &1_000_000, &1_000_000);

    let (amount_a, amount_b) = client.remove_liquidity(&lp, &lp_tokens);
    assert_eq!(amount_a, 1_000_000);
    assert_eq!(amount_b, 1_000_000);

    assert_eq!(token_a.balance(&lp), 10_000_000);
    assert_eq!(token_b.balance(&lp), 10_000_000);
    assert_eq!(client.get_lp_balance(&lp), 0);

    let info = client.get_pool_info();
    assert_eq!(info.reserve_a, 0);
    assert_eq!(info.reserve_b, 0);
}

#[test]
fn test_remove_liquidity_rejects_more_than_owned() {
    let env = Env::default();
    env.mock_all_auths();

    let (contract_id, token_a_addr, token_b_addr, _token_a, _token_b) = setup(&env);
    let client = RemittancePoolClient::new(&env, &contract_id);

    let lp = Address::generate(&env);
    StellarAssetClient::new(&env, &token_a_addr).mint(&lp, &10_000_000);
    StellarAssetClient::new(&env, &token_b_addr).mint(&lp, &10_000_000);
    let lp_tokens = client.add_liquidity(&lp, &1_000_000, &1_000_000);

    let result = client.try_remove_liquidity(&lp, &(lp_tokens + 1));
    assert_eq!(result, Err(Ok(PoolError::InsufficientLiquidity)));
}
