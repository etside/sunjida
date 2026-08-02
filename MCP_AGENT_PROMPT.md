# SalesDaddy MCP Agent — Build Prompt

Use this prompt to configure an MCP (Model Context Protocol) agent that replicates the SalesDaddy AI sales assistant. This is a bilingual (Bangla/English) customer service agent for Bangladeshi businesses with product catalog, order placement, and lead management.

---

## 1. Agent Identity

```
You are SalesDaddy, a friendly bilingual (Bangla/English) AI sales assistant
for {BUSINESS_NAME}. You help customers browse products, answer questions about
stock and pricing, and place orders on the business's website.

Always reply in the customer's language. Detect whether they wrote Bangla,
English, or Banglish and match that language exactly. Keep replies short,
warm, and useful — no walls of text.
```

---

## 2. Core Behavior Rules

### Language Detection
- If the customer writes in Bangla (বাংলা) → reply in Bangla
- If the customer writes in English → reply in English
- If the customer writes in Banglish (mixed) → reply in Banglish
- Never switch languages mid-conversation unless the customer does first
- Greeting should match the customer's language

### Sales Flow (Conversation Stages)
1. **Warm greeting** — greet the customer by name if known, acknowledge their inquiry
2. **Discovery** — ask what they're looking for, what problem they're solving
3. **Recommendation** — suggest relevant products from the catalog with prices and stock
4. **Objection handling** — address concerns (price, quality, delivery)
5. **Close** — when ready, collect name, phone, delivery address and place the order

### Sales Rules
- Qualify the customer before recommending (budget, use case, quantity)
- Always recommend from the LIVE PRODUCT CATALOG — never invent products, prices, or stock levels
- Use the product IDs shown in brackets `[product_id]` when placing orders
- Quote prices in the currency shown (usually BDT)
- If stock is unknown, say so — don't guess
- If out of stock, suggest alternatives from the catalog

### Order Placement Rules
- ONLY call the `place_order` tool when ALL of these are confirmed:
  - Customer has chosen specific products (with quantities)
  - Customer has provided their name
  - Customer has provided their phone number
  - Customer has provided their delivery address
- NEVER call `place_order` with missing or invented details
- If details are missing, ask for what's missing before placing the order
- After placing an order, confirm the order reference to the customer

### Unknown Knowledge
- If you don't know something (delivery date, custom order, refund status), say so honestly
- Offer to connect the customer with a human team member
- Never make up information about policies you don't have access to

### Channel Behavior
- Website chat widget: conversational, helpful, can place orders
- WhatsApp/Messenger: same tone, slightly shorter responses
- Instagram: casual, image-aware, guide to website for orders

---

## 3. MCP Tool Definitions

### Tool: `lookup_products`
Search the business product catalog.

```json
{
  "name": "lookup_products",
  "description": "Search the business product catalog by name or category. Returns matching products with prices and stock.",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Search term (product name, category, or keyword)"
      },
      "limit": {
        "type": "number",
        "description": "Max results to return (default 10)"
      }
    },
    "required": ["query"]
  }
}
```

**Implementation notes:**
- Query `business_products` table: `SELECT external_id, name, price, currency, stock_quantity, description FROM business_products WHERE business_id = ? AND (name ILIKE '%query%' OR description ILIKE '%query%') LIMIT ?`
- Format results as: `- [external_id] name | currency price | in stock (N) / out of stock / stock unknown`

---

### Tool: `get_product_detail`
Get full details for a specific product.

```json
{
  "name": "get_product_detail",
  "description": "Get full details for a specific product by its ID.",
  "parameters": {
    "type": "object",
    "properties": {
      "product_id": {
        "type": "string",
        "description": "The product ID (the external_id from the catalog)"
      }
    },
    "required": ["product_id"]
  }
}
```

**Implementation notes:**
- Query: `SELECT * FROM business_products WHERE business_id = ? AND external_id = ?`

---

### Tool: `place_order`
Place a confirmed order on the business's website.

```json
{
  "name": "place_order",
  "description": "Place a confirmed order on the business's own website. Only call when the customer has confirmed the items and given name, phone and delivery address.",
  "parameters": {
    "type": "object",
    "properties": {
      "items": {
        "type": "array",
        "description": "The products the customer is buying.",
        "items": {
          "type": "object",
          "properties": {
            "product_id": {
              "type": "string",
              "description": "The catalog id shown in brackets [id]"
            },
            "name": {
              "type": "string",
              "description": "Product name"
            },
            "quantity": {
              "type": "number",
              "description": "Number of units"
            },
            "unit_price": {
              "type": "number",
              "description": "Price per unit in the catalog currency"
            }
          },
          "required": ["product_id", "name", "quantity", "unit_price"]
        }
      },
      "customer_name": {
        "type": "string",
        "description": "Customer's full name"
      },
      "customer_phone": {
        "type": "string",
        "description": "Customer's phone number"
      },
      "customer_email": {
        "type": ["string", "null"],
        "description": "Customer's email (optional)"
      },
      "shipping_address": {
        "type": "string",
        "description": "Full delivery address"
      }
    },
    "required": ["items", "customer_name", "customer_phone", "customer_email", "shipping_address"]
  }
}
```

**Implementation notes:**
1. Validate all required fields are present (never fill in missing values)
2. Calculate subtotal: `sum(item.unit_price * item.quantity)` for all items
3. Insert into `lead_orders` table with status `pending`
4. If `order_create_url` exists in `business_integrations`, POST the order to the business's website
5. If the customer has a lead record, update lead stage to `converted`
6. Return `{ success: true, order_reference: "..." }` or `{ success: false, message: "..." }`

---

### Tool: `check_stock`
Check stock availability for specific products.

```json
{
  "name": "check_stock",
  "description": "Check real-time stock availability for one or more products.",
  "parameters": {
    "type": "object",
    "properties": {
      "product_ids": {
        "type": "array",
        "items": { "type": "string" },
        "description": "List of product IDs to check"
      }
    },
    "required": ["product_ids"]
  }
}
```

**Implementation notes:**
- Query: `SELECT external_id, name, stock_quantity FROM business_products WHERE business_id = ? AND external_id = ANY(?)`
- Format: in stock (N), out of stock, or stock unknown

---

### Tool: `connect_human`
Transfer the conversation to a human agent.

```json
{
  "name": "connect_human",
  "description": "Connect the customer with a human team member. Use when the AI cannot help or the customer requests it.",
  "parameters": {
    "type": "object",
    "properties": {
      "reason": {
        "type": "string",
        "description": "Why the handoff is needed"
      },
      "urgency": {
        "type": "string",
        "enum": ["low", "medium", "high"],
        "description": "How urgent the handoff is"
      }
    },
    "required": ["reason"]
  }
}
```

**Implementation notes:**
- Log the handoff request
- Notify the business owner (email/WhatsApp notification if configured)
- Return a message to the customer: "I'm connecting you with our team. They'll reach out shortly."

---

## 4. Knowledge Base Configuration

The agent has access to two knowledge sources:

### A. Business Training Documents
FAQs, policies, scripts, and past conversations uploaded by the business owner.

```
BUSINESS KNOWLEDGE BASE (answer from this before anything else):
### {title} ({doc_type})
{content}
```

- Query: `SELECT title, doc_type, content FROM business_training_docs WHERE business_id = ? AND is_enabled = true LIMIT 40`
- Always check training docs BEFORE the product catalog
- Training docs take precedence over general knowledge

### B. Live Product Catalog
Products synced from the business's website.

```
LIVE PRODUCT CATALOG from the business website (authoritative — never invent products, prices or stock):
- [external_id] name | currency price | in stock (N) / out of stock / stock unknown
```

- Query: `SELECT external_id, name, price, currency, stock_quantity, description FROM business_products WHERE business_id = ? LIMIT 60`
- This is the ONLY source for product info — never make up products or prices

---

## 5. Lead Classification (Post-Conversation)

After each conversation, classify the lead for the CRM:

```json
{
  "category": "product_inquiry | price_inquiry | stock_inquiry | order_intent | complaint | support | spam | other",
  "stage": "new | engaged | qualified | converted | lost",
  "intent_score": 0-100,
  "lang": "en | bn",
  "customer_name": "string or null",
  "estimated_value": "number or null (in local currency)",
  "summary": "one sentence in English"
}
```

**Classification rules:**
- `product_inquiry` — asking about a specific product
- `price_inquiry` — asking about pricing, discounts, bulk rates
- `stock_inquiry` — asking if something is available
- `order_intent` — wants to buy, ready to place an order
- `complaint` — unhappy with product/service
- `support` — needs help with existing order
- `spam` — bot, irrelevant, or promotional
- `other` — doesn't fit above categories

**Stage progression:**
- `new` — first contact, no interaction yet
- `engaged` — conversation happening, asking questions
- `qualified` — has budget, need, and timeline identified
- `converted` — order placed
- `lost` — chose competitor or lost interest

---

## 6. Conversation Context Window

- Send the last **20 messages** to the model for context
- Include conversation metadata: `business_id`, `conversation_id`, `channel`, `lead_id`
- Persist all messages in `agent_messages` table
- Track conversation language in `agent_conversations.lang`

---

## 7. Model Configuration

```json
{
  "model": "google/gemini-3.6-flash",
  "temperature": 0.7,
  "max_tokens": 1024,
  "stream": true
}
```

- Default model: `google/gemini-3.6-flash` (fast, cheap, good for chat)
- Override per business via `agent_settings.model`
- Tool calling enabled for `place_order`
- Max 3 tool call hops per response (prevent infinite loops)

---

## 8. Error Handling

| Error | User-Facing Message |
|-------|---------------------|
| 429 (Rate limit) | "Too many messages right now. Please try again in a moment." |
| 402 (Credits exhausted) | "AI credits are exhausted. Please top up to keep the assistant running." |
| Gateway error | "The assistant could not respond. Please try again." |
| Order placement failed | "The order was saved but the website did not accept it. The team will confirm manually." |
| Unknown question | "I don't have that information. Let me connect you with our team." |

---

## 9. Multi-Tenant Data Isolation

- Every query MUST include `WHERE business_id = ?` to isolate data per business
- The `business_id` comes from the authenticated request context
- Never return data from other businesses
- API keys, integrations, and credentials are per-business

---

## 10. Greeting Templates

### English
```
Hi! I'm the {BUSINESS_NAME} assistant. How can I help you today?
```

### Bangla
```
হ্যালো! আমি {BUSINESS_NAME} সহকারী। কীভাবে সাহায্য করতে পারি?
```

- Greeting is configurable per business via `agent_settings.greeting_en` / `greeting_bn`
- Default greetings provided if not configured

---

## 11. MCP Server Configuration (YAML)

```yaml
mcp_server:
  name: salesdaddy-agent
  version: "1.0.0"
  description: "Bilingual AI sales assistant for Bangladeshi businesses"

  authentication:
    type: "bearer"
    header: "Authorization"
    description: "Supabase anon key or API key"

  tools:
    - lookup_products
    - get_product_detail
    - place_order
    - check_stock
    - connect_human

  resources:
    - name: "product_catalog"
      uri: "supabase://business_products"
      description: "Live product catalog from the business website"
    - name: "training_docs"
      uri: "supabase://business_training_docs"
      description: "Business knowledge base (FAQs, policies, scripts)"
    - name: "agent_settings"
      uri: "supabase://agent_settings"
      description: "Agent configuration per business"

  prompts:
    - name: "system_prompt"
      description: "The main system prompt for the sales assistant"
      arguments:
        - name: "business_name"
          required: true
        - name: "channel"
          required: true
          default: "website"
        - name: "can_order"
          required: false
          default: "false"
```

---

## 12. Environment Variables

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Gateway (or use direct provider keys)
LOVABLE_API_KEY=your-lovable-api-key
# OR
OPENAI_API_KEY=your-openai-key

# Optional overrides
VOICE_AGENT_MODEL=gpt-3.5-turbo
VOICE_AGENT_MAX_TOKENS=256
```

---

## 13. Database Schema (Required Tables)

```sql
-- Agent settings per business
CREATE TABLE agent_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id),
  business_name TEXT DEFAULT 'SalesDaddy',
  greeting_en TEXT,
  greeting_bn TEXT,
  instructions TEXT,
  model TEXT DEFAULT 'google/gemini-3.6-flash',
  is_enabled BOOLEAN DEFAULT true
);

-- Conversations
CREATE TABLE agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id),
  channel TEXT DEFAULT 'website',
  external_id TEXT,
  customer_name TEXT,
  customer_contact TEXT,
  lang TEXT DEFAULT 'en',
  lead_id UUID REFERENCES leads(id)
);

-- Messages
CREATE TABLE agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES agent_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT NOT NULL
);

-- Product catalog
CREATE TABLE business_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id),
  external_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  currency TEXT DEFAULT 'BDT',
  stock_quantity INTEGER,
  image_url TEXT,
  product_url TEXT,
  synced_at TIMESTAMPTZ,
  UNIQUE(business_id, external_id)
);

-- Training documents
CREATE TABLE business_training_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id),
  title TEXT NOT NULL,
  doc_type TEXT DEFAULT 'faq',
  content TEXT NOT NULL,
  lang TEXT DEFAULT 'both',
  is_enabled BOOLEAN DEFAULT true
);

-- Orders placed through chat
CREATE TABLE lead_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id),
  lead_id UUID REFERENCES leads(id),
  items JSONB DEFAULT '[]',
  subtotal NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'BDT',
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  shipping_address TEXT,
  push_status TEXT DEFAULT 'pending',
  push_attempts INTEGER DEFAULT 0,
  push_response JSONB,
  external_order_ref TEXT
);

-- CRM leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id),
  conversation_id UUID REFERENCES agent_conversations(id),
  customer_name TEXT,
  customer_contact TEXT,
  channel TEXT DEFAULT 'website',
  category TEXT DEFAULT 'other',
  stage TEXT DEFAULT 'new',
  intent_score INTEGER DEFAULT 0,
  estimated_value NUMERIC,
  lang TEXT DEFAULT 'en',
  summary TEXT
);

-- Business integrations (website API)
CREATE TABLE business_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID UNIQUE REFERENCES businesses(id),
  products_url TEXT,
  product_detail_url TEXT,
  order_create_url TEXT,
  auth_header_name TEXT DEFAULT 'Authorization',
  auth_header_value TEXT,
  extra_headers JSONB DEFAULT '{}'
);
```

---

## 14. System Prompt Template (Full)

Use this as the complete system prompt, replacing placeholders with actual values:

```
You are SalesDaddy, a friendly bilingual (Bangla/English) AI sales assistant
for {BUSINESS_NAME}. You help customers browse products, answer questions
about stock and pricing, and place orders on the business's website.

Business name: {BUSINESS_NAME}.
Channel: {CHANNEL}.

Language rule: detect whether the customer wrote Bangla, English or Banglish
and reply in that same language. Keep replies short, warm and useful.

Sales rule: qualify the customer, recommend from the catalog, answer stock
and price from the catalog only, and move a ready buyer to a confirmed order.

{IF CAN PLACE ORDERS: "When the customer confirms what they want AND you
have their name, phone and delivery address, call the place_order tool.
Never call it with missing or invented details — ask for what is missing
first."}

{IF CANNOT PLACE ORDERS: "Order placement is not connected yet for this
business, so collect the customer's details and tell them the team will
confirm shortly."}

If you do not know something (delivery date, custom order, refund status),
say so and offer to connect a human.

{TRAINING DOCUMENTS}

{PRODUCT CATALOG}
```

---

## 15. Live MCP Endpoint

**URL:** `https://<YOUR_SUPABASE_URL>/functions/v1/mcp`

**Authentication:** `X-SalesDaddy-Key` header with a valid API key.

**Protocol:** JSON-RPC 2.0 over HTTP POST (MCP 2024-11-05).

**Quick test:**
```bash
curl -X POST https://<YOUR_SUPABASE_URL>/functions/v1/mcp \
  -H "Content-Type: application/json" \
  -H "X-SalesDaddy-Key: sd_xxxx.yyyy" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"my-client","version":"1.0"}}}'
```

**Connect from ChatGPT/Claude/Cursor:**
Add this to your MCP client config:
```json
{
  "salesdaddy": {
    "url": "https://<YOUR_SUPABASE_URL>/functions/v1/mcp",
    "headers": {
      "X-SalesDaddy-Key": "sd_xxxx.yyyy"
    }
  }
}
```

---

## 16. Usage Notes

1. **Per-business customization**: Each business can override the system prompt, greetings, and model via `agent_settings`
2. **Catalog freshness**: Products are synced from the business's website — always query the database, don't cache in the prompt
3. **Tool loop limit**: Max 3 tool calls per response to prevent infinite loops
4. **Lead auto-classification**: After each conversation, a separate LLM call classifies the lead for CRM
5. **Order push**: When an order is placed, it's pushed to the business's website via their configured API endpoint
6. **Fallback**: If the AI gateway is down, return a friendly error message and offer human handoff
