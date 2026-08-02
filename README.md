# Sales Daddy — Bangla & English AI Voice and Chat Agents

Multi-tenant SaaS platform for AI-powered customer service with voice and chat capabilities. Built for Bangladeshi businesses.

## Live

- **Dashboard:** https://salesdaddy.lovable.app
- **Supabase:** Your Supabase project URL

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui
- **Backend:** Supabase (PostgreSQL + Edge Functions + Auth)
- **Hosting:** Lovable (Netlify under the hood)
- **CI/CD:** GitHub Actions

## Project Structure

```
src/
├── components/
│   ├── admin/           # SuperAdminPanel, CredentialsManager, LLMSwitcher, TenantOverview
│   ├── chat/            # Chat UI components
│   ├── dashboard/       # InventoryPanel, order/product management
│   ├── onboarding/      # OnboardingChat flow
│   └── ui/              # shadcn/ui primitives
├── contexts/
│   ├── TenantContext.tsx # Multi-tenant context (tenant_id from profiles)
│   └── FeatureGateContext.tsx # Plan-based feature gating
├── pages/tenant/        # ClientPanel (per-tenant dashboard)
├── services/
│   └── tenantApi.ts     # All Supabase + Edge Function calls
└── integrations/supabase/
    ├── client.ts        # Supabase client
    └── types.ts         # Auto-generated database types

supabase/
├── functions/
│   ├── agent-chat/      # AI chat endpoint
│   ├── meta-webhook/    # WhatsApp/Messenger webhook
│   ├── super-admin/     # Platform admin API
│   ├── voice-agent/     # Voice processing with OpenAI
│   └── google-sheets-sync/ # Import inventory from Google Sheets
└── migrations/          # Database migrations
```

## Features

- **Multi-tenancy:** Each business gets isolated data via `tenant_id`
- **Feature Gating:** Plan-based access (free → starter → pro → enterprise)
- **AI Agent:** Chat and voice support in Bangla and English
- **Inventory Management:** Manual entry or Google Sheets sync
- **Super Admin Panel:** Tenant management, credentials, audit logs
- **Meta Channels:** WhatsApp, Messenger, Instagram integration
- **Onboarding:** Guided setup flow for new tenants

## Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Start dev server
npm run dev
# Opens at http://localhost:8080

# Type check
npx tsc --noEmit

# Build
npm run build
```

## Environment Variables

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

## Deployment

### Frontend (Automatic)

Push to `main` triggers GitHub Actions which:
1. Runs lint + type check + build
2. Deploys to Lovable → live at https://salesdaddy.lovable.app

### Supabase Edge Functions (Automatic)

Push to `main` with changes in `supabase/` triggers:
1. Runs database migrations
2. Deploys all Edge Functions
3. Sets function secrets

### Required GitHub Secrets

| Secret | Purpose |
|--------|---------|
| `LOVABLE_TOKEN` | Lovable deployment auth |
| `LOVABLE_PROJECT_ID` | Lovable project ID |
| `SUPABASE_ACCESS_TOKEN` | Supabase API token |
| `SUPABASE_PROJECT_ID` | Supabase project ref (set as Variable, not Secret) |
| `OPENAI_API_KEY` | OpenAI for voice agent |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Google Sheets API access |
| `VOICE_AGENT_MODEL` | (Optional) Voice model override |
| `VOICE_AGENT_MAX_TOKENS` | (Optional) Max tokens override |

## Supabase Tables

| Table | Purpose |
|-------|---------|
| `tenants` | Business accounts (name, plan, feature_gates, sales_daddy_prompt) |
| `profiles` | User profiles with `tenant_id` |
| `credentials` | API keys per tenant (encrypted) |
| `inventory_products` | Product catalog |
| `agent_conversations` | Chat/voice sessions |
| `agent_messages` | Individual messages |
| `audit_logs` | Admin action history |
| `feature_gate_definitions` | Feature → plan mappings |
| `meta_channels` | WhatsApp/Messenger configs |
| `orders` / `order_items` | Order management |

## Admin Access

- `/super-admin` — Platform admin panel (requires `super_admin` role)
- `/tenant/client-panel` — Per-tenant dashboard with feature-gated tabs

## License

Private — All rights reserved.
