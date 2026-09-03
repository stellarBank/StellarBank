#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror, contractmeta,
    token, xdr::ToXdr,
    Address, Env, BytesN, log, symbol_short
};

// Contract metadata
contractmeta!(
    key = "Description",
    val = "StellarBank Remittance Pool - Cross-border liquidity management"
);

contractmeta!(
    key = "Version", 
    val = "1.2.1"
);

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum PoolError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    InsufficientLiquidity = 4,
    InvalidAmount = 5,
    InvalidAddress = 6,
    SlippageExceeded = 7,
    PoolNotActive = 8,
    InvalidCurrencyPair = 9,
    MinimumLiquidityNotMet = 10,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    Initialized,
    TokenA,
    TokenB,
    ReserveA,
    ReserveB,
    TotalLpSupply,
    FeeRate,
    Active,
    LpBalance(Address),
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PoolInfo {
    pub token_a: Address,
    pub token_b: Address,
    pub reserve_a: i128,
    pub reserve_b: i128,
    pub total_lp_supply: i128,
    pub fee_rate: u32,
    pub active: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TransferResult {
    pub amount_in: i128,
    pub amount_out: i128,
    pub fee_charged: i128,
    pub exchange_rate: i128,
    pub tx_hash: BytesN<32>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Rate {
    pub from_token: Address,
    pub to_token: Address,
    pub rate: i128,        // Rate with 7 decimal precision (Stellar standard)
    pub inverse_rate: i128,
    pub updated_at: u64,
}

#[contract]
pub struct RemittancePool;

#[contractimpl]
impl RemittancePool {
    /// Initialize the remittance pool with currency pair and fee structure
    /// 
    /// # Arguments
    /// * `admin` - Admin address with management privileges
    /// * `token_a` - First token in the trading pair (e.g., USDC)
    /// * `token_b` - Second token in the trading pair (e.g., NGNT)
    /// * `fee_rate` - Fee rate in basis points (e.g., 30 = 0.3%)
    pub fn initialize(
        env: Env,
        admin: Address,
        token_a: Address,
        token_b: Address,
        fee_rate: u32,
    ) -> Result<(), PoolError> {
        // Check if already initialized
        if env.storage().instance().has(&DataKey::Initialized) {
            return Err(PoolError::AlreadyInitialized);
        }

        // Validate inputs
        if fee_rate > 1000 { // Max 10% fee
            return Err(PoolError::InvalidAmount);
        }

        // Require admin authorization
        admin.require_auth();

        // Store configuration
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TokenA, &token_a);
        env.storage().instance().set(&DataKey::TokenB, &token_b);
        env.storage().instance().set(&DataKey::ReserveA, &0i128);
        env.storage().instance().set(&DataKey::ReserveB, &0i128);
        env.storage().instance().set(&DataKey::TotalLpSupply, &0i128);
        env.storage().instance().set(&DataKey::FeeRate, &fee_rate);
        env.storage().instance().set(&DataKey::Active, &true);
        env.storage().instance().set(&DataKey::Initialized, &true);

        // Emit initialization event
        env.events().publish((symbol_short!("init"), &admin), (token_a.clone(), token_b.clone(), fee_rate));

        log!(&env, "RemittancePool initialized: admin={}, tokenA={}, tokenB={}, fee={}", 
             admin, token_a, token_b, fee_rate);

        Ok(())
    }

    /// Add liquidity to the pool
    /// Returns the amount of LP tokens minted
    pub fn add_liquidity(
        env: Env,
        user: Address,
        amount_a: i128,
        amount_b: i128,
    ) -> Result<i128, PoolError> {
        user.require_auth();
        Self::require_initialized(&env)?;
        Self::require_active(&env)?;

        if amount_a <= 0 || amount_b <= 0 {
            return Err(PoolError::InvalidAmount);
        }

        let token_a = Self::get_token_a(&env);
        let token_b = Self::get_token_b(&env);
        let reserve_a = Self::get_reserve_a(&env);
        let reserve_b = Self::get_reserve_b(&env);
        let total_supply = Self::get_total_lp_supply(&env);

        // Calculate LP tokens to mint
        let lp_tokens = if total_supply == 0 {
            // Initial liquidity
            let initial_liquidity = Self::sqrt(amount_a * amount_b);
            if initial_liquidity < 1000 { // Minimum liquidity requirement
                return Err(PoolError::MinimumLiquidityNotMet);
            }
            initial_liquidity
        } else {
            // Proportional liquidity
            let lp_from_a = (amount_a * total_supply) / reserve_a;
            let lp_from_b = (amount_b * total_supply) / reserve_b;
            lp_from_a.min(lp_from_b)
        };

        if lp_tokens <= 0 {
            return Err(PoolError::InvalidAmount);
        }

        // Update reserves
        env.storage().instance().set(&DataKey::ReserveA, &(reserve_a + amount_a));
        env.storage().instance().set(&DataKey::ReserveB, &(reserve_b + amount_b));
        env.storage().instance().set(&DataKey::TotalLpSupply, &(total_supply + lp_tokens));

        // Update user LP balance
        let current_balance = Self::get_lp_balance(env.clone(), user.clone());
        env.storage().persistent().set(&DataKey::LpBalance(user.clone()), &(current_balance + lp_tokens));

        // Pull the actual tokens from the user into the pool
        token::Client::new(&env, &token_a).transfer(&user, &env.current_contract_address(), &amount_a);
        token::Client::new(&env, &token_b).transfer(&user, &env.current_contract_address(), &amount_b);

        // Emit liquidity addition event
        env.events().publish(
            (symbol_short!("add_liq"), &user), 
            (amount_a, amount_b, lp_tokens)
        );

        log!(&env, "Liquidity added: user={}, amountA={}, amountB={}, lpTokens={}", 
             user, amount_a, amount_b, lp_tokens);

        Ok(lp_tokens)
    }

    /// Remove liquidity from the pool, burning LP tokens and returning the
    /// proportional share of both reserves to the user.
    pub fn remove_liquidity(
        env: Env,
        user: Address,
        lp_amount: i128,
    ) -> Result<(i128, i128), PoolError> {
        user.require_auth();
        Self::require_initialized(&env)?;

        if lp_amount <= 0 {
            return Err(PoolError::InvalidAmount);
        }

        let current_balance = Self::get_lp_balance(env.clone(), user.clone());
        if lp_amount > current_balance {
            return Err(PoolError::InsufficientLiquidity);
        }

        let token_a = Self::get_token_a(&env);
        let token_b = Self::get_token_b(&env);
        let reserve_a = Self::get_reserve_a(&env);
        let reserve_b = Self::get_reserve_b(&env);
        let total_supply = Self::get_total_lp_supply(&env);

        if total_supply == 0 {
            return Err(PoolError::InsufficientLiquidity);
        }

        let amount_a = (lp_amount * reserve_a) / total_supply;
        let amount_b = (lp_amount * reserve_b) / total_supply;

        if amount_a <= 0 || amount_b <= 0 {
            return Err(PoolError::InvalidAmount);
        }

        env.storage().instance().set(&DataKey::ReserveA, &(reserve_a - amount_a));
        env.storage().instance().set(&DataKey::ReserveB, &(reserve_b - amount_b));
        env.storage().instance().set(&DataKey::TotalLpSupply, &(total_supply - lp_amount));
        env.storage().persistent().set(&DataKey::LpBalance(user.clone()), &(current_balance - lp_amount));

        token::Client::new(&env, &token_a).transfer(&env.current_contract_address(), &user, &amount_a);
        token::Client::new(&env, &token_b).transfer(&env.current_contract_address(), &user, &amount_b);

        env.events().publish(
            (symbol_short!("rem_liq"), &user),
            (amount_a, amount_b, lp_amount),
        );

        log!(&env, "Liquidity removed: user={}, amountA={}, amountB={}, lpTokens={}",
             user, amount_a, amount_b, lp_amount);

        Ok((amount_a, amount_b))
    }

    /// Execute cross-border transfer with automatic currency conversion
    pub fn transfer_cross_border(
        env: Env,
        sender: Address,
        recipient: Address,
        amount: i128,
        destination_currency: Address,
        min_amount_out: i128,
    ) -> Result<TransferResult, PoolError> {
        sender.require_auth();
        Self::require_initialized(&env)?;
        Self::require_active(&env)?;

        if amount <= 0 || min_amount_out <= 0 {
            return Err(PoolError::InvalidAmount);
        }

        let token_a = Self::get_token_a(&env);
        let token_b = Self::get_token_b(&env);
        let reserve_a = Self::get_reserve_a(&env);
        let reserve_b = Self::get_reserve_b(&env);
        let fee_rate = Self::get_fee_rate(&env);

        // Determine swap direction
        let (amount_out, new_reserve_a, new_reserve_b, input_token, output_token) = if destination_currency == token_b {
            // Swapping A -> B
            let fee = (amount * fee_rate as i128) / 10000;
            let amount_after_fee = amount - fee;
            let amount_out = Self::get_amount_out(amount_after_fee, reserve_a, reserve_b);

            if amount_out < min_amount_out {
                return Err(PoolError::SlippageExceeded);
            }

            (amount_out, reserve_a + amount, reserve_b - amount_out, token_a.clone(), token_b.clone())
        } else if destination_currency == token_a {
            // Swapping B -> A
            let fee = (amount * fee_rate as i128) / 10000;
            let amount_after_fee = amount - fee;
            let amount_out = Self::get_amount_out(amount_after_fee, reserve_b, reserve_a);

            if amount_out < min_amount_out {
                return Err(PoolError::SlippageExceeded);
            }

            (amount_out, reserve_a - amount_out, reserve_b + amount, token_b.clone(), token_a.clone())
        } else {
            return Err(PoolError::InvalidCurrencyPair);
        };

        // Check sufficient liquidity
        if new_reserve_a < 0 || new_reserve_b < 0 {
            return Err(PoolError::InsufficientLiquidity);
        }

        // Update reserves
        env.storage().instance().set(&DataKey::ReserveA, &new_reserve_a);
        env.storage().instance().set(&DataKey::ReserveB, &new_reserve_b);

        // Move the actual tokens: sender -> pool, pool -> recipient
        token::Client::new(&env, &input_token).transfer(&sender, &env.current_contract_address(), &amount);
        token::Client::new(&env, &output_token).transfer(&env.current_contract_address(), &recipient, &amount_out);

        // Calculate exchange rate and fee
        let exchange_rate = (amount_out * 10_000_000) / amount; // 7 decimal precision
        let fee_charged = (amount * fee_rate as i128) / 10000;

        // Generate transaction hash (simplified)
        let tx_hash = env.crypto().keccak256(&env.current_contract_address().to_xdr(&env));

        let result = TransferResult {
            amount_in: amount,
            amount_out,
            fee_charged,
            exchange_rate,
            tx_hash: BytesN::from_array(&env, &tx_hash.to_array()),
        };

        // Emit transfer event
        env.events().publish(
            (symbol_short!("transfer"), &sender, &recipient),
            (amount, amount_out, destination_currency.clone())
        );

        log!(&env, "Cross-border transfer: sender={}, recipient={}, amount={}, amountOut={}", 
             sender, recipient, amount, amount_out);

        Ok(result)
    }

    /// Get current exchange rate between tokens
    pub fn get_exchange_rate(
        env: Env,
        from_token: Address,
        to_token: Address,
    ) -> Result<Rate, PoolError> {
        Self::require_initialized(&env)?;

        let token_a = Self::get_token_a(&env);
        let token_b = Self::get_token_b(&env);
        let reserve_a = Self::get_reserve_a(&env);
        let reserve_b = Self::get_reserve_b(&env);

        if reserve_a == 0 || reserve_b == 0 {
            return Err(PoolError::InsufficientLiquidity);
        }

        let (rate, inverse_rate) = if from_token == token_a && to_token == token_b {
            let rate = (reserve_b * 10_000_000) / reserve_a; // 7 decimal precision
            let inverse = (reserve_a * 10_000_000) / reserve_b;
            (rate, inverse)
        } else if from_token == token_b && to_token == token_a {
            let rate = (reserve_a * 10_000_000) / reserve_b;
            let inverse = (reserve_b * 10_000_000) / reserve_a;
            (rate, inverse)
        } else {
            return Err(PoolError::InvalidCurrencyPair);
        };

        Ok(Rate {
            from_token,
            to_token,
            rate,
            inverse_rate,
            updated_at: env.ledger().timestamp(),
        })
    }

    /// Get pool information
    pub fn get_pool_info(env: Env) -> Result<PoolInfo, PoolError> {
        Self::require_initialized(&env)?;

        Ok(PoolInfo {
            token_a: Self::get_token_a(&env),
            token_b: Self::get_token_b(&env),
            reserve_a: Self::get_reserve_a(&env),
            reserve_b: Self::get_reserve_b(&env),
            total_lp_supply: Self::get_total_lp_supply(&env),
            fee_rate: Self::get_fee_rate(&env),
            active: Self::is_active(&env),
        })
    }

    /// Get user's LP token balance
    pub fn get_lp_balance(env: Env, user: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::LpBalance(user))
            .unwrap_or(0)
    }

    // Internal helper functions

    fn require_initialized(env: &Env) -> Result<(), PoolError> {
        if !env.storage().instance().has(&DataKey::Initialized) {
            return Err(PoolError::NotInitialized);
        }
        Ok(())
    }

    fn require_active(env: &Env) -> Result<(), PoolError> {
        if !Self::is_active(env) {
            return Err(PoolError::PoolNotActive);
        }
        Ok(())
    }

    fn get_token_a(env: &Env) -> Address {
        env.storage().instance().get(&DataKey::TokenA).unwrap()
    }

    fn get_token_b(env: &Env) -> Address {
        env.storage().instance().get(&DataKey::TokenB).unwrap()
    }

    fn get_reserve_a(env: &Env) -> i128 {
        env.storage().instance().get(&DataKey::ReserveA).unwrap_or(0)
    }

    fn get_reserve_b(env: &Env) -> i128 {
        env.storage().instance().get(&DataKey::ReserveB).unwrap_or(0)
    }

    fn get_total_lp_supply(env: &Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalLpSupply).unwrap_or(0)
    }

    fn get_fee_rate(env: &Env) -> u32 {
        env.storage().instance().get(&DataKey::FeeRate).unwrap_or(30) // Default 0.3%
    }

    fn is_active(env: &Env) -> bool {
        env.storage().instance().get(&DataKey::Active).unwrap_or(false)
    }

    /// Calculate output amount for constant product AMM
    fn get_amount_out(amount_in: i128, reserve_in: i128, reserve_out: i128) -> i128 {
        if amount_in <= 0 || reserve_in <= 0 || reserve_out <= 0 {
            return 0;
        }
        
        let amount_in_with_fee = amount_in * 997; // 0.3% fee
        let numerator = amount_in_with_fee * reserve_out;
        let denominator = (reserve_in * 1000) + amount_in_with_fee;
        
        numerator / denominator
    }

    /// Simple square root implementation for initial liquidity calculation
    fn sqrt(y: i128) -> i128 {
        if y == 0 {
            return 0;
        }

        let mut x = y;
        let mut result = (x + 1) / 2;

        while result < x {
            x = result;
            result = (x + y / x) / 2;
        }

        x
    }
}

mod test;