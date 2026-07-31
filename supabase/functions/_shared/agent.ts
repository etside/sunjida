// Shared helpers for the SalesDaddy AI agent (Lovable AI Gateway + conversation storage).
import { createClient } from "npm:@supabase/supabase-js@2";

export const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export type AgentSettings = {
  business_name: string;
  greeting_en: string;
  greeting_bn: string;
  instructions: string;
  model: string;
  is_enabled: boolean;
};

export function adminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
}

export async function getSettings(db: ReturnType<typeof adminClient>): Promise<AgentSettings> {
  const { data } = await db
    .from("agent_settings")
    .select("business_name, greeting_en, greeting_bn, instructions, model, is_enabled")
    .limit(1)
    .maybeSingle();

  return (
    data ?? {
      business_name: "SalesDaddy",
      greeting_en: "Hi! How can I help you today?",
      greeting_bn: "হ্যালো! কীভাবে সাহায্য করতে পারি?",
      instructions:
        "You are a friendly bilingual (Bangla/English) sales assistant. Always reply in the customer's language.",
      model: "google/gemini-3.6-flash",
      is_enabled: true,
    }
  );
}

/** Live product/stock context so the agent never promises what cannot be shipped. */
export async function buildCatalogContext(db: ReturnType<typeof adminClient>) {
  const { data } = await db
    .from("products")
    .select("name, price, stock_quantity, description")
    .limit(40);

  if (!data?.length) return "";

  const lines = data.map((p: Record<string, unknown>) => {
    const stock = Number(p.stock_quantity ?? 0);
    return `- ${p.name} | Price: BDT ${p.price} | ${stock > 0 ? `In stock (${stock})` : "Out of stock"}`;
  });

  return `\n\nLIVE PRODUCT CATALOG (authoritative — never invent products, prices or stock):\n${lines.join("\n")}`;
}

export function buildSystemPrompt(settings: AgentSettings, catalog: string, channel: string) {
  return [
    settings.instructions,
    `Business name: ${settings.business_name}.`,
    `Channel: ${channel}.`,
    "Language rule: detect whether the customer wrote Bangla, English or Banglish and reply in that same language. Keep replies short, warm and useful.",
    "If you do not know something (delivery date, custom order, refund status), say so and offer to connect a human.",
    catalog,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Non-streaming completion through the Lovable AI Gateway. */
export async function completeChat(
  model: string,
  messages: Array<{ role: string; content: string }>,
) {
  const response = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": Deno.env.get("LOVABLE_API_KEY") ?? "",
    },
    body: JSON.stringify({ model, messages }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`[${response.status}] ${body}`);
  }

  const json = await response.json();
  return (json?.choices?.[0]?.message?.content as string) ?? "";
}
