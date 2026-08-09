# SalesDaddy

AI-powered voice and chat agents for Bangladeshi commerce. Built with Supabase Edge Functions + PHP fallback backend + Lovable AI Gateway.

**Live**: [salesdaddy.torquesticker.com](https://salesdaddy.torquesticker.com)

## What It Does

- **AI Chat Agent** — Website widget, Messenger, Instagram, WhatsApp. Bangla + English. SSE streaming.
- **AI Voice Agent** — Phone call handling. Bangla TTS via Lovable AI Gateway (gpt-4o-mini-tts).
- **Product Catalog Sync** — pgvector embeddings for semantic search. Cron-based live inventory from WooCommerce/Shopify.
- **Meta Webhook** — Messenger, Instagram DMs, WhatsApp. Tenant-scoped with per-business Meta app credentials.
- **Auto Responses** — Keyword matching with fallback to AI. Credit-based fallback when token usage is high.
- **Admin Panel** — PHP-based super admin for API keys, training data, auto responses, voice presets, usage logs.
- **Multi-Tenant** — Each business gets isolated data, API keys, channels, and conversation history.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  React Frontend (Vite + Tailwind + shadcn/ui)       │
│  sunjida-dist/ (compiled) or src/ (source)          │
├─────────────────────────────────────────────────────┤
│  Supabase Edge Functions (Deno)                     │
│  agent-chat · meta-webhook · voice-agent            │
│  business-admin · business-api · business-onboard   │
│  api-keys · social-connect · super-admin            │
│  catalog-sync · inventory-cron · pgmq-worker        │
│  google-sheets-sync · mcp                           │
├─────────────────────────────────────────────────────┤
│  PHP Fallback Backend (cPanel shared hosting)       │
│  auth · chat · tts · admin-api · setup-admin        │
│  db-schema · health · training-export                │
├─────────────────────────────────────────────────────┤
│  Lovable AI Gateway (sole LLM + TTS provider)       │
│  ai.gateway.lovable.dev/v1                          │
│  LLM: google/gemini-2.5-pro                        │
│  TTS: gpt-4o-mini-tts                              │
├─────────────────────────────────────────────────────┤
│  Supabase (PostgreSQL + pgvector + pgmq + pg_cron)  │
│  MySQL fallback on cPanel                           │
└─────────────────────────────────────────────────────┘
```

## Project Structure

```
sunjida/
├── src/                          # React source (Vite + TypeScript)
│   ├── App.tsx                   # Routes + providers
│   ├── pages/                    # Public pages (Home, Pricing, About, etc.)
│   │   ├── admin/                # Admin panel pages
│   │   └── app/                  # Tenant app pages (Onboarding, Training, etc.)
│   └── components/               # UI components (shadcn/ui, layout, agent widget)
│
├── sunjida-dist/                 # Compiled deployment bundle (cPanel-ready)
│   ├── index.html                # SPA entry point
│   ├── .htaccess                 # Apache rewrite rules
│   ├── _redirects                # Netlify SPA redirect
│   ├── sw.js                     # Service worker (Supabase → PHP fallback)
│   ├── schema.sql                # MySQL import for cPanel
│   ├── admin/                    # PHP admin panel (standalone, no React)
│   │   ├── index.php             # Login + CRUD dashboard
│   │   └── logout.php
│   ├── api/                      # PHP fallback backend
│   │   ├── config.php            # DB credentials, AI gateway, helpers
│   │   ├── auth.php              # Session-based auth (Supabase-compatible)
│   │   ├── chat.php              # AI chat with streaming + training data
│   │   ├── tts.php               # Text-to-speech via Lovable gateway
│   │   ├── admin-api.php         # Admin CRUD (keys, training, responses)
│   │   ├── setup-admin.php       # One-time admin password setup
│   │   ├── db-schema.php         # Runtime schema migration
│   │   ├── health.php            # Health check endpoint
│   │   └── training-export.php   # Export training data
│   └── assets/                   # Compiled JS/CSS bundles
│
├── supabase/
│   ├── functions/                # Deno edge functions (14 total)
│   │   ├── _shared/              # Shared modules (agent.ts, tenant.ts)
│   │   ├── agent-chat/           # Main AI chat endpoint
│   │   ├── meta-webhook/         # Messenger/Instagram/WhatsApp webhook
│   │   ├── voice-agent/          # Phone voice agent
│   │   ├── business-admin/       # Owner dashboard actions
│   │   ├── business-api/         # Public tenant API
│   │   ├── business-onboard/     # Meta app onboarding
│   │   ├── api-keys/             # API key management
│   │   ├── social-connect/       # Social account linking
│   │   ├── super-admin/          # Platform admin
│   │   ├── catalog-sync/         # Product catalog sync
│   │   ├── inventory-cron/       # Scheduled inventory refresh
│   │   ├── pgmq-worker/          # Async message queue processor
│   │   ├── google-sheets-sync/   # Google Sheets import
│   │   └── mcp/                  # Model Context Protocol server
│   └── migrations/               # PostgreSQL migrations (17 files)
│
└── tailwind-plus/                # Tailwind UI templates (reference)
```

## Setup

### cPanel Deployment

1. Upload `sunjida-dist/` contents to `public_html/`
2. Import `schema.sql` via phpMyAdmin
3. Visit `https://yourdomain.com/api/setup-admin.php?key=salesdaddy-setup-2024`
4. Delete `setup-admin.php` after setup
5. Login at `https://yourdomain.com/admin/`

**Admin credentials**: `admin@salesdaddy.com` / `Pjokjict4`

### Supabase Deployment

```bash
supabase link --project-ref yplgzmxzrslofnuagfaz
supabase db push
supabase functions deploy
```

### Environment Variables (Supabase)

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key |
| `LOVABLE_API_KEY` | Lovable AI Gateway key |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | For Google Sheets sync |

### Local Development

```bash
npm install
npm run dev        # Vite dev server on :8080
npm run build      # Production build
```

## API Endpoints

### PHP Fallback (`/api/`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `auth.php?grant_type=password` | POST | Sign in |
| `auth.php?action=session` | GET | Get session |
| `auth.php?action=signout` | POST | Sign out |
| `auth.php?action=token&grant_type=refresh_token` | POST | Refresh token |
| `chat.php` | GET | Bootstrap (greeting, enabled) |
| `chat.php` | POST | AI chat (SSE streaming) |
| `tts.php` | POST | Text-to-speech (audio/mpeg) |
| `admin-api.php?action=dashboard` | GET | Dashboard stats |
| `admin-api.php?action=keys` | GET/POST/DELETE | API key CRUD |
| `admin-api.php?action=training` | GET/POST/DELETE | Training data CRUD |
| `admin-api.php?action=responses` | GET/POST/DELETE | Auto response CRUD |
| `admin-api.php?action=presets` | GET/POST/DELETE | Voice preset CRUD |
| `admin-api.php?action=usage` | GET | Usage logs |
| `health.php` | GET | Health check |

### Supabase Edge Functions (`/functions/v1/`)

| Function | Purpose |
|----------|---------|
| `agent-chat` | AI chat with vector search + tool calling |
| `meta-webhook` | Messenger/Instagram/WhatsApp webhook |
| `voice-agent` | Phone voice agent |
| `business-admin` | Owner dashboard (keys, sync, orders) |
| `business-api` | Public tenant API |
| `business-onboard` | Meta app OAuth onboarding |
| `api-keys` | API key management |
| `social-connect` | Social account linking |
| `super-admin` | Platform-wide admin |
| `catalog-sync` | Product catalog sync with embeddings |
| `inventory-cron` | Scheduled inventory refresh |
| `pgmq-worker` | Async message queue processor |
| `google-sheets-sync` | Google Sheets import |
| `mcp` | Model Context Protocol server |

## Service Worker Fallback

The service worker (`sw.js`) intercepts Supabase requests when the backend is unreachable and redirects them to the PHP fallback:

- `/functions/v1/agent-chat` → `/api/chat.php`
- `/functions/v1/voice-agent` → `/api/tts.php`
- `/auth/v1/token` → `/api/auth.php`
- `/auth/v1/user` → `/api/auth.php?action=session`
- `/auth/v1/logout` → `/api/auth.php?action=signout`

Health checks run every 30 seconds to detect when Supabase comes back online.

## Key Decisions

- **Lovable AI Gateway as sole provider** — single API key for both LLM (gemini-2.5-pro) and TTS (gpt-4o-mini-tts). Uses `Lovable-API-Key` header (not `Authorization: Bearer`).
- **PHP fallback for cPanel** — mirrors Supabase API responses so the React app works identically on shared hosting without Edge Functions.
- **pgvector for product search** — HNSW-indexed embeddings enable semantic product lookup in chat responses.
- **Multi-tenant isolation** — RLS policies on Supabase, business_id filtering on PHP. Each tenant has separate API keys, channels, and conversation history.
- **Bilingual by default** — all prompts, responses, and UI support Bangla + English. TTS uses alloy voice for natural Bengali pronunciation.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Framer Motion, React Router, Tanstack Query
- **Backend**: Supabase Edge Functions (Deno), PHP 8.x (cPanel fallback)
- **Database**: PostgreSQL (Supabase) + MySQL (cPanel)
- **AI**: Lovable AI Gateway (Gemini 2.5 Pro + gpt-4o-mini-tts)
- **Search**: pgvector with HNSW indexing
- **Queue**: pgmq (PostgreSQL message queue)
- **Cron**: pg_cron + pg_net for scheduled jobs
- **Meta**: Graph API v21.0 (Messenger, Instagram, WhatsApp)
- **Auth**: Supabase GoTrue + PHP session fallback
- **Deployment**: cPanel shared hosting + Supabase cloud

## License

Private — All rights reserved.
