export const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const stellarNetwork = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'TESTNET';
export const stellarNetworkPassphrase =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015';

// The two Stellar Asset Contract IDs the deployed remittance-pool trades
// between. Set these once the pool is deployed (see contracts/README.md).
export const tokenAContractId = process.env.NEXT_PUBLIC_TOKEN_A_CONTRACT_ID || '';
export const tokenBContractId = process.env.NEXT_PUBLIC_TOKEN_B_CONTRACT_ID || '';
export const tokenACode = process.env.NEXT_PUBLIC_TOKEN_A_CODE || 'Asset A';
export const tokenBCode = process.env.NEXT_PUBLIC_TOKEN_B_CODE || 'Asset B';
