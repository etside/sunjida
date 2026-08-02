# AI Providers

Bring your own AI provider keys to power your agent's inference. This is the MCP-style manual connection — you provide the key, SalesDaddy uses it only for your tenant's agent.

## Supported Providers

| Provider | Default Models | Notes |
|----------|---------------|-------|
| **OpenAI** | `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `o1` | Standard OpenAI API |
| **Anthropic** | `claude-sonnet-4-20250514`, `claude-3-5-haiku-20241022` | Anthropic Messages API |
| **Google AI** | `gemini-2.0-flash`, `gemini-1.5-pro`, `gemini-1.5-flash` | Google AI Studio |
| **DeepSeek** | `deepseek-chat`, `deepseek-reasoner` | DeepSeek API |
| **Custom** | Any model name | OpenAI-compatible endpoints (e.g., local Ollama, Together AI) |

## Adding a Provider

1. Go to **AI Providers** in the dashboard
2. Select the provider from the dropdown
3. Paste your API key
4. Select a model (or enter a custom model name)
5. For custom providers, enter the base URL
6. Click **Add Provider**

The first provider added is automatically set as the default.

## Testing Connections

Click **Test** on any provider card to verify the API key is valid. The test result is logged with a timestamp.

## Setting a Default

The default provider is used for all agent inference. Click the star icon to set a provider as default.

## Key Security

- Keys are stored encrypted (AES-256-GCM) in `business_ai_providers`
- A SHA-256 hash is stored for deduplication
- Only the last 4 characters are shown in the dashboard preview
- Keys are never shared between tenants
- RLS policies enforce owner-only access

## Usage Tracking

Each provider card shows:
- Total tokens consumed
- Estimated cost (USD)
- Last test status and timestamp

Usage is logged in `ai_provider_audit_log` for billing and monitoring.
