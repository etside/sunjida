# Security Overview

SalesDaddy is a multi-tenant SaaS platform. Every feature is scoped to a single `business_id` — tenants cannot see or modify each other's data.

## Authentication Layers

| Layer | Mechanism | Scope |
|-------|-----------|-------|
| **Tenant login** | Supabase Auth (email/password or OAuth) | Business dashboard access |
| **Super Admin** | 5-digit PIN (85677) stored client-side | Admin panel, all businesses |
| **API keys** | `sd_xxxx.yyyy` header auth | External integrations (website, webhooks) |
| **AI providers** | Per-tenant encrypted API keys | Agent inference |

## Row-Level Security (RLS)

All tenant tables have RLS enabled. Policies enforce:

- **Owner-only access**: `businesses.owner_id = auth.uid()`
- **Super admin override**: `user_roles.role = 'super_admin'`
- **No cross-tenant data leakage**: Queries filter by `business_id`

## API Key Security

Keys use the format `sd_<8-random>.<16-random>` and are:

- **SHA-256 hashed** before storage — plaintext is never persisted
- **Scoped** to specific operations (`read`, `write`, `admin`, `webhooks`, `orders`, `products`, `leads`)
- **Rate-limited** per key (default 60 req/min, configurable)
- **Expirable** with optional expiration datetime
- **Rotatable** — old key is revoked, new key issued
- **Audited** — every API call is logged with timestamp, action, and key metadata

## AI Provider Key Security

AI provider keys (OpenAI, Anthropic, Google, DeepSeek, custom) are:

- **Stored encrypted** (AES-256-GCM) per business
- **Never shared** between tenants
- **Hashed** for lookup deduplication
- **Tracked** with usage tokens and cost per key

## Social OAuth Security

Social platform connections use standard OAuth 2.0 flows:

- **State tokens** are random UUIDs stored in `social_oauth_sessions` with expiry
- **Redirect URIs** are validated against the Supabase function URL
- **Scopes** are minimal and platform-specific (see Social Connections docs)
- **Tokens** are stored encrypted in `social_platform_connections`
- **Disconnect** deactivates the connection without deleting audit history
