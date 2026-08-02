# API Keys

SalesDaddy exposes a REST API at `https://<project>.supabase.co/functions/v1/business-api` for external integrations.

## Authentication

All requests require the header:

```
X-SalesDaddy-Key: sd_xxxx.yyyy
```

The key identifies your business and is validated against stored SHA-256 hashes.

## Creating a Key

1. Go to **Website API** in the dashboard
2. Enter a key name, select scopes, and optionally set rate limit and expiration
3. Click **Create API key**
4. Copy the key immediately — it is shown only once

## Scopes

| Scope | Access |
|-------|--------|
| `read` | Read products, leads, orders |
| `write` | Push products, update inventory |
| `admin` | Full API access |
| `webhooks` | Register and manage webhooks |
| `orders` | View and retry orders |
| `products` | Product catalog operations |
| `leads` | Lead management |

## Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/ping` | Health check, returns business info |
| POST | `/products` | Push product catalog |
| POST | `/products/sync` | Pull products from configured feed URL |
| GET | `/products` | List current products |
| GET | `/leads` | List captured leads (optional `?stage=` filter) |
| GET | `/orders` | List agent-closed orders |
| POST | `/orders/retry` | Retry failed order delivery |

## Rate Limiting

Default: 60 requests per minute per key. Configurable at creation time (1-1000 req/min).

Rate is enforced by counting audit log entries per key per minute window.

## Key Rotation

Rotate keys from the dashboard. Rotation:

1. Creates a new key with the same scopes and settings
2. Revokes the old key
3. Returns the new plaintext key (shown once)

## Expiration

Keys can optionally have an expiration date. Expired keys are rejected with a clear error message.

## Audit Trail

Every API call is logged in `api_key_audit_log` with:
- Key ID and business ID
- Action type (`created`, `used`, `rotated`, `revoked`)
- Timestamp
- Metadata (IP, endpoint, etc.)

Access the audit log via the dashboard or the `GET /audit` endpoint on the `api-keys` edge function.
