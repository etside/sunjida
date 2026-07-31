// Website chat widget endpoint — streams a bilingual reply from Lovable AI.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import {
  adminClient,
  buildCatalogContext,
  buildSystemPrompt,
  getSettings,
  GATEWAY_URL,
} from "../_shared/agent.ts";

type Incoming = { messages?: Array<{ role: string; content: string }>; conversationId?: string | null };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = (await req.json()) as Incoming;
    const messages = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
    if (!messages.length) {
      return new Response(JSON.stringify({ error: "messages is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const db = adminClient();
    const settings = await getSettings(db);
    if (!settings.is_enabled) {
      return new Response(JSON.stringify({ error: "The assistant is currently turned off." }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Track the conversation so admins can review it later.
    let conversationId = body.conversationId ?? null;
    if (!conversationId) {
      const { data } = await db
        .from("agent_conversations")
        .insert({ channel: "website" })
        .select("id")
        .single();
      conversationId = data?.id ?? null;
    }
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (conversationId && lastUser) {
      await db.from("agent_messages").insert({
        conversation_id: conversationId,
        role: "user",
        content: lastUser.content,
      });
    }

    const catalog = await buildCatalogContext(db);
    const system = buildSystemPrompt(settings, catalog, "website chat widget");

    const upstream = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": Deno.env.get("LOVABLE_API_KEY") ?? "",
      },
      body: JSON.stringify({
        model: settings.model,
        stream: true,
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text();
      console.error(`AI gateway failed [${upstream.status}]: ${detail}`);
      const message =
        upstream.status === 429
          ? "Too many messages right now. Please try again in a moment."
          : upstream.status === 402
            ? "AI credits are exhausted. Please top up to keep the assistant running."
            : "The assistant could not respond. Please try again.";
      return new Response(JSON.stringify({ error: message, status: upstream.status }), {
        status: upstream.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pass the SSE stream through while collecting the full reply for storage.
    let full = "";
    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstream.body!.getReader();
        const decoder = new TextDecoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            for (const line of chunk.split("\n")) {
              if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
              try {
                const delta = JSON.parse(line.slice(6))?.choices?.[0]?.delta?.content;
                if (delta) full += delta;
              } catch { /* partial frame */ }
            }
            controller.enqueue(value);
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        } finally {
          if (conversationId && full) {
            await db
              .from("agent_messages")
              .insert({ conversation_id: conversationId, role: "assistant", content: full });
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Conversation-Id": conversationId ?? "",
        "Access-Control-Expose-Headers": "X-Conversation-Id",
      },
    });
  } catch (error) {
    console.error("agent-chat error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
