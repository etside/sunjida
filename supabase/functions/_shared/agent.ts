// Shared brain for the SalesDaddy agent: per-business settings, context, tools and classification.
import { adminClient, type Db, getIntegration, pushOrderToSite } from "./tenant.ts";

export { adminClient };
export type { Db };

export const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export type AgentSettings = {
  business_name: string;
  greeting_en: string;
  greeting_bn: string;
  instructions: string;
  model: string;
  is_enabled: boolean;
};

const DEFAULT_SETTINGS: AgentSettings = {
  business_name: "SalesDaddy",
  greeting_en: "Hi! How can I help you today?",
  greeting_bn: "হ্যালো! কীভাবে সাহায্য করতে পারি?",
  instructions:
    "You are a friendly bilingual (Bangla/English) sales assistant. Always reply in the customer's language.",
  model: "google/gemini-3.6-flash",
  is_enabled: true,
};

export async function getSettings(db: Db, businessId?: string | null): Promise<AgentSettings> {
  let query = db
    .from("agent_settings")
    .select("business_name, greeting_en, greeting_bn, instructions, model, is_enabled")
    .limit(1);

  query = businessId ? query.eq("business_id", businessId) : query.is("business_id", null);
  const { data } = await query.maybeSingle();
  return (data as AgentSettings) ?? DEFAULT_SETTINGS;
}

/** Live catalog pulled from the business's own website (cached in business_products). */
export async function buildCatalogContext(db: Db, businessId?: string | null) {
  if (!businessId) return "";

  const { data } = await db
    .from("business_products")
    .select("external_id, name, price, currency, stock_quantity, description")
    .eq("business_id", businessId)
    .limit(60);

  if (!data?.length) return "";

  const lines = (data as Record<string, unknown>[]).map((p) => {
    const stock = p.stock_quantity == null ? "stock unknown" : Number(p.stock_quantity) > 0
      ? `in stock (${p.stock_quantity})`
      : "out of stock";
    return `- [${p.external_id}] ${p.name} | ${p.currency} ${p.price ?? "?"} | ${stock}`;
  });

  return `\n\nLIVE PRODUCT CATALOG from the business website (authoritative — never invent products, prices or stock). Use the id in brackets when placing an order:\n${lines.join("\n")}`;
}

/** Owner-supplied training material: FAQs, policies, scripts, past conversations. */
export async function buildTrainingContext(db: Db, businessId?: string | null) {
  if (!businessId) return "";

  const { data } = await db
    .from("business_training_docs")
    .select("title, doc_type, content")
    .eq("business_id", businessId)
    .eq("is_enabled", true)
    .limit(40);

  if (!data?.length) return "";

  const blocks = (data as Record<string, string>[]).map(
    (d) => `### ${d.title} (${d.doc_type})\n${d.content}`,
  );
  return `\n\nBUSINESS KNOWLEDGE BASE (answer from this before anything else):\n${blocks.join("\n\n")}`;
}

export function buildSystemPrompt(
  settings: AgentSettings,
  context: { catalog?: string; training?: string; channel: string; canOrder?: boolean },
) {
  return [
    settings.instructions,
    `Business name: ${settings.business_name}.`,
    `Channel: ${context.channel}.`,
    "Language rule: detect whether the customer wrote Bangla, English or Banglish and reply in that same language. Keep replies short, warm and useful.",
    "Sales rule: qualify the customer, recommend from the catalog, answer stock and price from the catalog only, and move a ready buyer to a confirmed order.",
    context.canOrder
      ? "When the customer confirms what they want AND you have their name, phone and delivery address, call the place_order tool. Never call it with missing or invented details — ask for what is missing first."
      : "Order placement is not connected yet for this business, so collect the customer's details and tell them the team will confirm shortly.",
    "If you do not know something (delivery date, custom order, refund status), say so and offer to connect a human.",
    context.training ?? "",
    context.catalog ?? "",
  ]
    .filter(Boolean)
    .join("\n");
}

/* ------------------------------------------------------------------ */
/* Tools                                                               */
/* ------------------------------------------------------------------ */

export const placeOrderTool = {
  type: "function",
  function: {
    name: "place_order",
    description:
      "Place a confirmed order on the business's own website. Only call when the customer has confirmed the items and given name, phone and delivery address.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        items: {
          type: "array",
          description: "The products the customer is buying.",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              product_id: { type: "string", description: "The catalog id shown in brackets." },
              name: { type: "string" },
              quantity: { type: "number" },
              unit_price: { type: "number" },
            },
            required: ["product_id", "name", "quantity", "unit_price"],
          },
        },
        customer_name: { type: "string" },
        customer_phone: { type: "string" },
        customer_email: { type: ["string", "null"] },
        shipping_address: { type: "string" },
      },
      required: ["items", "customer_name", "customer_phone", "customer_email", "shipping_address"],
    },
  },
};

export async function runPlaceOrder(
  db: Db,
  businessId: string,
  leadId: string | null,
  args: Record<string, unknown>,
) {
  const items = (args.items as Array<Record<string, unknown>>) ?? [];
  const subtotal = items.reduce(
    (sum, i) => sum + Number(i.unit_price ?? 0) * Number(i.quantity ?? 0),
    0,
  );

  const { data: order, error } = await db
    .from("lead_orders")
    .insert({
      business_id: businessId,
      lead_id: leadId,
      items,
      subtotal,
      total: subtotal,
      customer_name: args.customer_name as string,
      customer_phone: args.customer_phone as string,
      customer_email: (args.customer_email as string) ?? null,
      shipping_address: args.shipping_address as string,
    })
    .select("id")
    .single();

  if (error || !order) {
    return { success: false, message: `Could not record the order: ${error?.message}` };
  }

  const pushed = await pushOrderToSite(db, businessId, order.id);
  if (leadId) {
    await db.from("leads").update({ stage: "converted" }).eq("id", leadId);
  }

  return pushed.ok
    ? {
        success: true,
        order_reference: pushed.reference ?? order.id.slice(0, 8),
        message: "Order placed on the business website.",
      }
    : {
        success: false,
        message: `The order was saved but the website did not accept it: ${pushed.error}. Tell the customer the team will confirm manually.`,
      };
}

export async function canPlaceOrders(db: Db, businessId: string) {
  const integration = await getIntegration(db, businessId);
  return Boolean(integration?.order_create_url);
}

/* ------------------------------------------------------------------ */
/* Gateway                                                             */
/* ------------------------------------------------------------------ */

export async function callGateway(body: Record<string, unknown>) {
  return await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": Deno.env.get("LOVABLE_API_KEY") ?? "",
    },
    body: JSON.stringify(body),
  });
}

export function gatewayErrorMessage(status: number) {
  if (status === 429) return "Too many messages right now. Please try again in a moment.";
  if (status === 402) return "AI credits are exhausted. Please top up to keep the assistant running.";
  return "The assistant could not respond. Please try again.";
}

/* ------------------------------------------------------------------ */
/* Vector search — tenant-filtered product matching                    */
/* ------------------------------------------------------------------ */

/** Generate an embedding vector for text using the Lovable AI embeddings endpoint. */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": Deno.env.get("LOVABLE_API_KEY") ?? "",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text,
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.[0]?.embedding ?? null;
  } catch {
    return null;
  }
}

/** Search products by semantic similarity for a tenant. */
export async function searchProducts(
  db: Db,
  tenantId: string,
  query: string,
  matchCount = 5,
) {
  const embedding = await generateEmbedding(query);
  if (!embedding) return [];

  const { data, error } = await db.rpc("match_products", {
    p_tenant_id: tenantId,
    p_embedding: embedding,
    p_match_count: matchCount,
    p_min_similarity: 0.3,
  });

  if (error) {
    console.error("Vector search failed:", error.message);
    return [];
  }

  return (data ?? []) as Array<{
    id: string;
    external_id: string;
    name: string;
    description: string | null;
    price: number;
    currency: string;
    stock_quantity: number | null;
    image_url: string | null;
    product_url: string | null;
    similarity: number;
  }>;
}

/** Build a catalog context string from vector-searched products. */
export async function buildVectorCatalogContext(
  db: Db,
  tenantId: string,
  userQuery: string,
): Promise<string> {
  const products = await searchProducts(db, tenantId, userQuery);
  if (!products.length) return "";

  const lines = products.map((p) => {
    const stock =
      p.stock_quantity == null
        ? "stock unknown"
        : p.stock_quantity > 0
          ? `in stock (${p.stock_quantity})`
          : "out of stock";
    return `- [${p.external_id}] ${p.name} | ${p.currency} ${p.price ?? "?"} | ${stock} | similarity: ${p.similarity.toFixed(2)}`;
  });

  return `\n\nSEMANTICALLY MATCHED PRODUCTS (ranked by relevance to user query):\n${lines.join("\n")}`;
}

/* ------------------------------------------------------------------ */
/* Text-to-Speech — voice reply generation                            */
/* ------------------------------------------------------------------ */

export type VoiceSettings = {
  voice_enabled: boolean;
  voice_provider: string;
  voice_model: string;
  voice_speed: number;
};

export const DEFAULT_VOICE: VoiceSettings = {
  voice_enabled: false,
  voice_provider: "openai",
  voice_model: "tts-1",
  voice_speed: 1.0,
};

/** Get voice settings for a tenant. */
export async function getVoiceSettings(
  db: Db,
  businessId?: string | null,
): Promise<VoiceSettings> {
  let query = db
    .from("agent_settings")
    .select("voice_enabled, voice_provider, voice_model, voice_speed")
    .limit(1);

  query = businessId ? query.eq("business_id", businessId) : query.is("business_id", null);
  const { data } = await query.maybeSingle();
  return (data as VoiceSettings) ?? DEFAULT_VOICE;
}

/** Generate speech audio from text using OpenAI TTS. Returns a data URL. */
export async function generateSpeech(
  text: string,
  settings: VoiceSettings,
): Promise<string | null> {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey || !settings.voice_enabled) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: settings.voice_model || "tts-1",
        input: text.slice(0, 4096), // TTS max input length
        voice: "alloy",
        speed: settings.voice_speed || 1.0,
        response_format: "mp3",
      }),
    });

    if (!res.ok) {
      console.error(`TTS failed [${res.status}]: ${await res.text()}`);
      return null;
    }

    const buffer = await res.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ""),
    );
    return `data:audio/mpeg;base64,${base64}`;
  } catch (e) {
    console.error("TTS error:", (e as Error).message);
    return null;
  }
}

/** Non-streaming completion, with optional tool support. */
export async function completeChat(
  model: string,
  messages: Array<Record<string, unknown>>,
  tools?: unknown[],
) {
  const res = await callGateway({ model, messages, ...(tools?.length ? { tools } : {}) });
  if (!res.ok) throw new Error(`[${res.status}] ${await res.text()}`);
  const json = await res.json();
  return json?.choices?.[0]?.message as
    | { content?: string; tool_calls?: Array<{ id: string; function: { name: string; arguments: string } }> }
    | undefined;
}

/* ------------------------------------------------------------------ */
/* Lead capture and categorisation                                     */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
  "product_inquiry",
  "price_inquiry",
  "stock_inquiry",
  "order_intent",
  "complaint",
  "support",
  "spam",
  "other",
] as const;

const STAGES = ["new", "engaged", "qualified", "converted", "lost"] as const;

/** Classifies the conversation and upserts the lead. Never throws into the reply path. */
export async function classifyAndUpsertLead(
  db: Db,
  opts: {
    businessId: string;
    conversationId: string | null;
    leadId: string | null;
    channel: string;
    model: string;
    transcript: Array<{ role: string; content: string }>;
    customerContact?: string | null;
  },
) {
  try {
    const text = opts.transcript
      .slice(-12)
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    const message = await completeChat(opts.model, [
      {
        role: "system",
        content:
          "You classify a customer conversation for a sales CRM. Reply with ONLY a JSON object, no markdown fences. " +
          `Keys: category (one of ${CATEGORIES.join(", ")}), stage (one of ${STAGES.join(", ")}), ` +
          "intent_score (0-100, how ready to buy), lang (en or bn), customer_name (string or null), " +
          "estimated_value (number or null, in the local currency), summary (one sentence in English).",
      },
      { role: "user", content: text },
    ]);

    const raw = (message?.content ?? "").replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    const payload = {
      business_id: opts.businessId,
      conversation_id: opts.conversationId,
      channel: opts.channel,
      category: CATEGORIES.includes(parsed.category as typeof CATEGORIES[number])
        ? (parsed.category as string)
        : "other",
      stage: STAGES.includes(parsed.stage as typeof STAGES[number]) ? (parsed.stage as string) : "new",
      intent_score: Math.max(0, Math.min(100, Number(parsed.intent_score ?? 0))),
      lang: parsed.lang === "bn" ? "bn" : "en",
      customer_name: (parsed.customer_name as string) ?? null,
      customer_contact: opts.customerContact ?? null,
      estimated_value: parsed.estimated_value != null ? Number(parsed.estimated_value) : null,
      summary: (parsed.summary as string) ?? null,
    };

    if (opts.leadId) {
      await db.from("leads").update(payload).eq("id", opts.leadId);
      return opts.leadId;
    }

    const { data } = await db.from("leads").insert(payload).select("id").single();
    if (data?.id && opts.conversationId) {
      await db.from("agent_conversations").update({ lead_id: data.id }).eq("id", opts.conversationId);
    }
    return data?.id ?? null;
  } catch (e) {
    console.error("lead classification failed:", (e as Error).message);
    return opts.leadId;
  }
}
