# SalesDaddy: 7-Month Budget Plan — 3 Clients × 25,000 Customers

## Where you are today

Your workspace is on the **Free plan**: 5 daily credits, capped at 30/month, and you have already used 31 credits this period with 4 remaining. This plan cannot support building or running a production agent — the first budget line is an upgrade.

Everything below separates two very different cost buckets, because mixing them is the usual reason these projects blow the budget:

1. **Build cost** — credits you spend telling Lovable to build and improve the product. One-time-ish, front-loaded.
2. **Run cost** — what it costs every month to actually serve 75,000 customers: AI tokens, database, WhatsApp/Messenger fees, and voice minutes.

## Volume assumptions (change these and every number moves)

| Item | Assumption |
| --- | --- |
| Clients | 3 |
| Customers per client per month | 25,000 |
| Total customers/month | 75,000 |
| Conversations per customer | 1.2 |
| Total conversations/month | 90,000 |
| AI turns per conversation | 8 |
| Tokens per turn | ~1,500 in / ~250 out |
| Share of conversations needing voice | 10% (phase 2 onward) |
| Average voice call length | 2 minutes |

## Run cost per month (text agent, all 3 clients at full volume)

| Line | Basis | Monthly |
| --- | --- | --- |
| AI tokens (Gemini Flash tier) | ~1.1B input + 180M output tokens | $260 – $420 |
| Lovable Cloud (database, functions, storage) | high write volume, larger instance | $60 – $150 |
| WhatsApp conversation fees (Meta/Twilio, BD rates) | ~55,000 service conversations | $250 – $600 |
| Messenger | free (Meta charges nothing) | $0 |
| **Text-only total** | | **~$570 – $1,170/month** |

Per client that is roughly **$190 – $390/month**, or about **৳22,000 – ৳46,000**. Per conversation it lands near **$0.006 – $0.013**.

### Voice adds a lot

Voice is the single most expensive component — budget it separately and turn it on deliberately.

| Line | Basis | Monthly |
| --- | --- | --- |
| Speech (ElevenLabs, Bangla + English) | ~18,000 min | $900 – $1,800 |
| Telephony (Twilio, BD numbers + minutes) | ~18,000 min | $250 – $500 |
| Extra AI tokens for voice turns | | $60 – $120 |
| **Voice add-on total** | | **~$1,200 – $2,400/month** |

Recommendation: **do not run voice on all 10% from day one.** Start voice on outbound order-confirmation and COD-verification calls only (highest ROI, shortest calls), which cuts the voice bill by roughly 60–70%.

## Build cost (Lovable credits)

Credit consumption is usage-based and depends on complexity and iteration count, so treat these as planning bands, not quotes. Plan mode is a flat 1 credit per message; build mode varies.

| Phase | Scope | Credit band |
| --- | --- | --- |
| 1 | Agent brain, catalog/FAQ tools, demo widget, database | 150 – 300 |
| 2 | Admin inbox, agent settings, multi-tenant (3 clients) | 150 – 300 |
| 3 | Messenger + WhatsApp channels | 100 – 200 |
| 4 | Analytics, self-improvement loop, eval harness | 150 – 300 |
| 5 | Voice agent | 200 – 400 |
| Ongoing | Iteration, fixes, client-specific tweaks | 60 – 120/month |

## 7-month plan

```text
M1  Build core agent + admin        Build-heavy, ~zero run cost
M2  Channels live, client 1 pilot   ~8,000 customers
M3  Client 1 full + client 2 onboard ~35,000 customers
M4  All 3 clients ramping           ~55,000 customers
M5  Full volume text                75,000 customers
M6  Voice pilot (confirmations)     75,000 + limited voice
M7  Voice scaled + optimization     Full stack, tuned costs
```

| Month | Lovable plan | Build credits | Run cost (USD) | Month total (USD) |
| --- | --- | --- | --- | --- |
| M1 | Pro 500 (~$100) | ~350 | ~$20 | ~$120 |
| M2 | Pro 500 (~$100) | ~300 | ~$90 | ~$190 |
| M3 | Pro 500 (~$100) | ~250 | ~$300 | ~$400 |
| M4 | Pro 500 (~$100) | ~200 | ~$480 | ~$580 |
| M5 | Pro 500 (~$100) | ~150 | ~$700 | ~$800 |
| M6 | Pro 500 (~$100) | ~250 | ~$1,150 | ~$1,250 |
| M7 | Pro 500 (~$100) | ~150 | ~$1,500 | ~$1,600 |
| **7-month total** | | | | **~$4,900 – $5,200** |

Roughly **৳6.0 – 6.4 lakh over 7 months**, and by month 7 the steady-state cost is about **$1,500/month (৳1.8 lakh)** for all three clients including voice — about **$500/client/month**.

Text-only variant (skip voice entirely): 7-month total drops to about **$2,800**, steady state about **$800/month**.

### Pricing implication

If you charge each client ৳25,000–35,000/month, you break even around month 4 on text-only and stay comfortably profitable. Voice should be priced as a paid add-on (per-minute or per-call), not bundled — otherwise it eats the margin.

## The self-improving part

"Improving itself" is built as a measurable loop, not a vague promise:

- **Capture** — every conversation stores the customer's intent, the agent's answer, whether it resolved, and whether a human took over.
- **Signals** — thumbs up/down in the inbox, human-takeover rate, repeat-question rate, and conversation-to-order rate per client.
- **Weekly auto-review** — a scheduled job clusters failed/escalated conversations, drafts new FAQ entries and prompt corrections, and puts them in an admin approval queue. Approved items go straight into the agent's knowledge.
- **Retrieval instead of bigger prompts** — the FAQ and catalog are embedded and retrieved per question. This is what keeps the token bill from growing as knowledge grows; without it, costs rise every month.
- **Eval set** — a saved set of real questions per client with expected answers, run automatically before any prompt or model change so improvements do not quietly regress.
- **Model routing** — simple questions go to the cheap fast model, complex ones escalate. Typically cuts the AI token line by 30–45% once tuned.

## Cost controls to build in from day one

- Per-client monthly spend cap with alerts at 70% / 90%.
- Response caching for repeated questions (stock, delivery charge, return policy) — often 20–30% of all traffic.
- Trim conversation history to the last N turns plus a rolling summary instead of resending everything.
- Rate limiting per customer to stop abuse and runaway loops.
- Cost dashboard per client so you can bill accurately and see which client is expensive.

## Technical details

- **Multi-tenancy**: a `clients` table with all agent data (settings, FAQ, conversations, messages, channels) keyed by `client_id`, RLS scoped so each client's admin sees only their own rows and you see all three.
- **Model routing**: `google/gemini-3.6-flash` as the default; `google/gemini-3.1-flash-lite` for classification, routing, and short factual answers; a stronger model only on escalation.
- **Retrieval**: FAQ and product descriptions embedded and stored as vectors; top-k retrieved per turn instead of stuffing the full catalog into the prompt.
- **Usage metering**: every gateway call logged with `client_id`, tokens, and cost, so the cost dashboard and spend caps read from real data.
- **Voice**: Twilio for numbers and call legs, ElevenLabs for Bangla/English speech, sharing the same agent brain and tools as text.

## Important caveats

- WhatsApp per-conversation fees are set by Meta and change by category and country; confirm current Bangladesh rates before finalizing client pricing.
- AI and Cloud usage are billed in credits from your Lovable balance, and actual consumption depends on real traffic — these are planning estimates, not guarantees.
- Build credit bands assume a normal amount of iteration. Large scope changes mid-build push them up.

## Immediate next step

Upgrade to a Pro tier with enough monthly credits (500-tier recommended) before build starts. Then we begin Phase 1: agent brain, catalog tools, and the on-site demo widget — testable with zero channel fees.
