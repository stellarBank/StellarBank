# StellarBank API Documentation

## Overview

The StellarBank API provides a comprehensive set of endpoints for cross-border remittance operations powered by Stellar blockchain technology. This RESTful API is designed specifically for emerging markets with focus on reliability, security, and performance.

## Base URL

- **Production:** `https://api.stellarbank.io/v1`
- **Staging:** `https://api-staging.stellarbank.io/v1`  
- **Development:** `http://localhost:8000/api/v1`

## Authentication

StellarBank API uses JWT (JSON Web Token) based authentication with refresh token rotation for enhanced security.

### Authentication Flow

1. **Register/Login** → Get access token + refresh token
2. **API Requests** → Include `Authorization: Bearer <access_token>`
3. **Token Refresh** → Use refresh token to get new access token
4. **Logout** → Blacklist tokens

### Headers

```http
Authorization: Bearer <access_token>
Content-Type: application/json
X-API-Version: v1
```

## Rate Limiting

API endpoints are rate limited to ensure fair usage and prevent abuse:

- **Authentication endpoints:** 10 requests per minute per IP
- **Transaction endpoints:** 30 requests per minute per user
- **General endpoints:** 100 requests per minute per user

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1640995200
```

## Response Format

All API responses follow a consistent JSON structure:

### Success Response
```json
{
  "status": "success",
  "data": {
    // Response payload
  },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response
```json
{
  "status": "error", 
  "error": "ValidationError",
  "message": "Invalid input parameters",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_1234567890"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid or missing auth token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Unexpected error |
| 502 | Bad Gateway - Stellar network issues |
| 503 | Service Unavailable - Maintenance mode |

## Supported Countries & Currencies

### Countries
- 🇳🇬 Nigeria (NG) 
- 🇬🇭 Ghana (GH)
- 🇰🇪 Kenya (KE)
- 🇺🇬 Uganda (UG)
- 🇿🇦 South Africa (ZA)
- 🇺🇸 United States (US)
- 🇬🇧 United Kingdom (GB)
- 🇨🇦 Canada (CA)
- 🇩🇪 Germany (DE)
- 🇫🇷 France (FR)

### Currencies
- **USD** - US Dollar
- **EUR** - Euro
- **GBP** - British Pound
- **NGN** - Nigerian Naira
- **GHS** - Ghanaian Cedi  
- **KES** - Kenyan Shilling
- **UGX** - Ugandan Shilling
- **ZAR** - South African Rand

### Stablecoins (Stellar Network)
- **USDC** - USD Coin
- **USDT** - Tether USD
- **NGNT** - Nigerian Naira Token
- **GNGN** - Green Nigerian Naira

## Core Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create new user account |
| POST | `/auth/login` | User authentication |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Invalidate tokens |
| POST | `/auth/verify-email` | Verify email address |
| POST | `/auth/forgot-password` | Password reset request |
| POST | `/auth/reset-password` | Reset password with token |
| POST | `/auth/2fa/enable` | Enable two-factor auth |
| POST | `/auth/2fa/verify` | Verify 2FA setup |
| POST | `/auth/2fa/disable` | Disable two-factor auth |

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/profile` | Get user profile |
| PUT | `/users/profile` | Update profile |
| POST | `/users/kyc` | Submit KYC documents |
| GET | `/users/kyc/status` | Get KYC verification status |
| POST | `/users/settings` | Update user settings |
| GET | `/users/activity` | Get account activity |
| POST | `/users/close-account` | Close user account |

### Wallets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/wallets` | List user wallets |
| POST | `/wallets` | Create new wallet |
| GET | `/wallets/{id}` | Get wallet details |
| PUT | `/wallets/{id}` | Update wallet settings |
| DELETE | `/wallets/{id}` | Delete wallet |
| POST | `/wallets/{id}/fund` | Fund wallet |
| GET | `/wallets/{id}/balance` | Get wallet balance |
| GET | `/wallets/{id}/history` | Get transaction history |

### Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/transactions` | Create new transaction |
| GET | `/transactions` | List user transactions |
| GET | `/transactions/{id}` | Get transaction details |
| PUT | `/transactions/{id}/cancel` | Cancel pending transaction |
| GET | `/transactions/rates` | Get current exchange rates |
| POST | `/transactions/quote` | Get transaction quote |
| GET | `/transactions/fees` | Get fee structure |
| POST | `/transactions/batch` | Create batch transfer |

### Compliance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/compliance/limits` | Get transaction limits |
| POST | `/compliance/screen` | Screen transaction |
| GET | `/compliance/countries` | Get supported countries |
| POST | `/compliance/report` | Report suspicious activity |
| GET | `/compliance/status/{userId}` | Get compliance status |

## Webhooks

StellarBank supports webhooks to notify your application of important events:

### Webhook Events
- `transaction.completed` - Transaction successfully processed
- `transaction.failed` - Transaction failed
- `kyc.approved` - KYC verification approved  
- `kyc.rejected` - KYC verification rejected
- `wallet.funded` - Wallet received funds
- `compliance.flagged` - Transaction flagged by compliance

### Webhook Payload
```json
{
  "event": "transaction.completed",
  "data": {
    "id": "txn_1234567890",
    "amount": "1000.00",
    "currency": "USD",
    "status": "completed",
    "stellar_hash": "abc123..."
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "signature": "sha256=..."
}
```

### Webhook Security
Verify webhook signatures using HMAC-SHA256:

```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from('sha256=' + expectedSignature)
  );
}
```

## SDKs & Libraries

Official SDKs available for popular programming languages:

- **Node.js:** `npm install @stellarbank/sdk-node`
- **Python:** `pip install stellarbank-sdk`  
- **PHP:** `composer require stellarbank/sdk-php`
- **Ruby:** `gem install stellarbank-sdk`
- **Go:** `go get github.com/stellarbank/sdk-go`
- **Java:** Maven/Gradle dependency available

## Testing

### Test Environment
Use our sandbox environment for testing:
- **Base URL:** `https://api-sandbox.stellarbank.io/v1`
- **Stellar Network:** Testnet
- **Test Tokens:** Available for all supported currencies

### Test Credentials
```json
{
  "testUser": {
    "email": "test@stellarbank.io",
    "password": "test123456",
    "apiKey": "sk_test_1234567890"
  }
}
```

### Test Cards (for funding)
```
Visa: 4242424242424242 (Any CVC, Any future date)
Mastercard: 5555555555554444
Declined: 4000000000000002
```

## Examples

### Send Money from US to Nigeria

```javascript
// 1. Get exchange rate
const rateResponse = await stellarbank.get('/transactions/rates', {
  from: 'USD',
  to: 'NGN',
  amount: 1000
});

// 2. Create transaction
const transaction = await stellarbank.post('/transactions', {
  sender_wallet_id: 'wallet_us_123',
  recipient_address: 'GXXXXX...', // Stellar address
  amount: 1000,
  source_currency: 'USD', 
  destination_currency: 'NGN',
  recipient_info: {
    name: 'John Doe',
    phone: '+234801234567',
    country: 'NG'
  }
});

// 3. Monitor transaction status
const status = await stellarbank.get(`/transactions/${transaction.id}`);
```

### Create Multi-Currency Wallet

```python
import stellarbank

# Initialize client
client = stellarbank.Client(api_key='your_api_key')

# Create wallet
wallet = client.wallets.create({
    'currency': 'USDC',
    'name': 'Main USDC Wallet',
    'type': 'stellar'
})

# Fund wallet
funding = client.wallets.fund(wallet.id, {
    'amount': 1000,
    'source': 'bank_transfer',
    'source_details': {
        'account_number': '1234567890',
        'routing_number': '021000021'
    }
})
```

## Support

### Developer Resources
- **Documentation:** https://docs.stellarbank.io
- **API Reference:** https://api-docs.stellarbank.io  
- **Status Page:** https://status.stellarbank.io
- **GitHub:** https://github.com/presidojay1/StellarBank

### Contact
- **Email:** api-support@stellarbank.io
- **Discord:** https://discord.gg/stellarbank
- **Twitter:** @StellarBankAPI

### SLA
- **Uptime:** 99.9% guaranteed
- **Response Time:** <200ms average
- **Support:** 24/7 for critical issues