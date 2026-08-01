// Per-business chat endpoint for the embeddable widget. Answers, sells, orders, and captures the lead.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import {
  adminClient,
  buildCatalogContext,
  buildSystemPrompt,
  buildTrainingContext,
  callGateway,
  canPlaceOrders,
  classifyAndUpsertLead,
  gatewayErrorMessage,
  getSettings,
  placeOrderTool,
  runPlaceOrder,
} from "../_shared/agent.ts";

type Incoming = {
  businessId?: string | null;
  messages?: Array<{ role: string; content: string }>;
  conversationId?: string | null;
};

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extra },
  });

/** Emits the finished reply as OpenAI-style SSE so the widget renders it progressively. */
function sseFromText(text: string, headers: Record<string, string>) {
  const encoder = new TextEncoder();
  const chunks = text.match(/\S+\s*/g) ?? [text];
  const stream = new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: chunk } }] })}\n\n`),
        );
        await new Promise((r) => setTimeout(r, 12));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Access-Control-Expose-Headers": "X-Conversation-Id",
      ...headers,
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const db = adminClient();

  // Public widget bootstrap: greeting + enabled flag for a business.
  if (req.method === "GET") {
    const businessId = new URL(req.url).searchParams.get("businessId");
    const settings = await getSettings(db, businessId);
    return json({
      business_name: settings.business_name,
      greeting_en: settings.greeting_en,
      greeting_bn: settings.greeting_bn,
      is_enabled: settings.is_enabled,
    });
  }

  try {
    const body = (await req.json()) as Incoming;
    const businessId = body.businessId ?? null;
    const messages = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
    if (!messages.length) return json({ error: "messages is required" }, 400);

    if (businessId) {
      const { data: business } = await db
        .from("businesses")
        .select("id, is_active")
        .eq("id", businessId)
        .maybeSingle();
      if (!business?.is_active) return json({ error: "This assistant is not available." }, 404);
    }

    const settings = await getSettings(db, businessId);
    if (!settings.is_enabled) return json({ error: "The assistant is currently turned off." }, 503);

    // Conversation memory.
    let conversationId = body.conversationId ?? null;
    let leadId: string | null = null;
    if (conversationId) {
      const { data } = await db
        .from("agent_conversations")
        .select("lead_id")
        .eq("id", conversationId)
        .maybeSingle();
      leadId = data?.lead_id ?? null;
    } else {
      const { data } = await db
        .from("agent_conversations")
        .insert({ channel: "website", business_id: businessId })
        .select("id")
        .single();
      conversationId = data?.id ?? null;
    }

    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (conversationId && lastUser) {
      await db
        .from("agent_messages")
        .insert({ conversation_id: conversationId, role: "user", content: lastUser.content });
    }

    const canOrder = businessId ? await canPlaceOrders(db, businessId) : false;
    const system = buildSystemPrompt(settings, {
      catalog: await buildCatalogContext(db, businessId),
      training: await buildTrainingContext(db, businessId),
      channel: "website chat widget",
      canOrder,
    });

    // Tool loop (max 3 hops) — the model may place an order before answering.
    const convo: Array<Record<string, unknown>> = [{ role: "system", content: system }, ...messages];
    let reply = "";

    for (let hop = 0; hop < 3; hop++) {
      const res = await callGateway({
        model: settings.model,
        messages: convo,
        ...(canOrder && businessId ? { tools: [placeOrderTool] } : {}),
      });

      if (!res.ok) {
        const detail = await res.text();
        console.error(`AI gateway failed [${res.status}]: ${detail}`);
        return json({ error: gatewayErrorMessage(res.status), status: res.status }, res.status);
      }

      const message = (await res.json())?.choices?.[0]?.message as
        | { content?: string; tool_calls?: Array<{ id: string; function: { name: string; arguments: string } }> }
        | undefined;

      const calls = message?.tool_calls ?? [];
      if (!calls.length) {
        reply = message?.content ?? "";
        break;
      }

      convo.push(message as Record<string, unknown>);
      for (const call of calls) {
        let result: unknown = { success: false, message: "Unknown tool." };
        if (call.function.name === "place_order" && businessId) {
          const args = JSON.parse(call.function.arguments || "{}");
          result = await runPlaceOrder(db, businessId, leadId, args);
        }
        convo.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) });
      }
    }

    if (!reply) reply = "Sorry, I could not put together a reply. Could you try rephrasing?";

    if (conversationId) {
      await db
        .from("agent_messages")
        .insert({ conversation_id: conversationId, role: "assistant", content: reply });
    }

    if (businessId) {
      await classifyAndUpsertLead(db, {
        businessId,
        conversationId,
        leadId,
        channel: "website",
        model: settings.model,
        transcript: [...messages, { role: "assistant", content: reply }],
      });
    }

    return sseFromText(reply, { "X-Conversation-Id": conversationId ?? "" });
  } catch (error) {
    console.error("agent-chat error:", error);
    return json({ error: (error as Error).message }, 500);
  }
});
