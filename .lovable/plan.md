# SalesDaddy: Bilingual AI Agent connected to Messenger & WhatsApp

## Short answer

Yes — for **text chat** on Messenger and WhatsApp, Lovable Cloud + Lovable AI can run your business agent end to end, in Bangla and English.

For **real voice calls**, Lovable AI alone is not enough: phone/voice needs a telephony + speech provider (Twilio for the phone line, ElevenLabs for Bangla/English speech). Lovable can build and host that, but you'll need those two accounts. So I'll build the text agent first, then voice as phase 2.

## Phase 1 — Bilingual text agent (Messenger + WhatsApp)

What you get:
- One AI agent brain that answers customers in whichever language they wrote in (Bangla, English, or Banglish).
- Connected to Facebook Messenger and WhatsApp so real customer messages get real answers, 24/7.
- A unified inbox in the admin panel: every conversation from every channel in one place, with the option to take over from the AI manually.
- The agent knows your live catalog (products, prices, stock, order status) plus a business FAQ and persona you can edit in admin.
- Channel settings page where you paste your Messenger/WhatsApp credentials and toggle each channel on or off.

How a message flows:

```text
Customer (Messenger / WhatsApp)
        -> webhook receives message
        -> save to conversations + messages
        -> AI agent (Bangla/English) + catalog & FAQ lookup
        -> reply sent back to the same channel
        -> visible live in admin inbox
```

## Phase 2 — Voice agent (after phase 1 works)

- A phone number that answers calls, speaks natural Bangla or English, and uses the same agent brain and catalog.
- Order confirmation and COD verification calls, plus handoff to a human.
- Requires: Twilio account (phone number) and ElevenLabs account (voice). I'll wire both and add a call log to admin.

## Also included

- A live demo widget on the site so you (and visitors) can talk to the agent before any channel is connected.
- Everything bilingual, matching the existing 🇧🇩/🇬🇧 toggle.

## Technical details

Backend (Lovable Cloud):
- Tables: `agent_settings` (persona, tone, language default, business info), `agent_faqs`, `channels` (type, credentials ref, enabled), `conversations` (channel, external user id, language, status, assigned), `messages` (role, content, channel message id). RLS: admin-only for settings/FAQ/channels; conversations and messages readable by admins, written by service role from the webhook functions.
- Realtime enabled on `messages` and `conversations` so the admin inbox updates live.

Edge functions:
- `messenger-webhook` — GET verify challenge + POST message events; Meta signature verification; enqueues to the agent.
- `whatsapp-webhook` — Twilio WhatsApp inbound (form-encoded), same pipeline; switchable to Meta Cloud API later.
- `agent-reply` — shared brain: loads settings + FAQ + recent history, calls Lovable AI (`google/gemini-3.6-flash`) with tools for `search_products`, `check_stock`, `get_order_status`; returns the reply and sends it back on the originating channel.
- `agent-chat` — streaming endpoint for the on-site demo widget.

Secrets to add when we get there: `META_PAGE_ACCESS_TOKEN`, `META_APP_SECRET`, `META_VERIFY_TOKEN`, and Twilio via the Twilio connector for WhatsApp. Phase 2 adds ElevenLabs via its connector.

Frontend:
- `/admin/inbox` — conversation list + thread view + manual takeover.
- `/admin/agent` — persona, language behaviour, FAQ CRUD.
- `/admin/channels` — connect/disconnect Messenger and WhatsApp, with the exact webhook URL to paste into Meta/Twilio.
- Floating demo chat widget on the marketing site.

## What I need from you (only when phase 1 is built)

- A Facebook Page + Meta app (I'll give you the exact webhook URL and verify token to paste).
- A Twilio account for WhatsApp (sandbox works for testing).

## Suggested order

1. Database + agent brain + on-site demo widget (testable immediately, no external accounts).
2. Admin inbox, agent settings, FAQ.
3. Messenger webhook + connection UI.
4. WhatsApp webhook via Twilio.
5. Voice agent (Twilio + ElevenLabs).
