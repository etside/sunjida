// Meta (Messenger + WhatsApp) webhook. Verifies Meta's signature, then replies with Lovable AI.
import {
  adminClient,
  buildCatalogContext,
  buildSystemPrompt,
  completeChat,
  getSettings,
} from "../_shared/agent.ts";

const GRAPH = "https://graph.facebook.com/v21.0";

type Channel = {
  id: string;
  channel: string;
  page_id: string | null;
  phone_number_id: string | null;
  access_token: string;
  app_secret: string | null;
  verify_token: string;
};

async function validSignature(secret: string, raw: string, header: string | null) {
  if (!header?.startsWith("sha256=")) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const received = header.slice(7);
  if (received.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ received.charCodeAt(i);
  return diff === 0;
}

async function sendMessenger(ch: Channel, recipientId: string, text: string) {
  const res = await fetch(`${GRAPH}/me/messages?access_token=${encodeURIComponent(ch.access_token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipient: { id: recipientId }, messaging_type: "RESPONSE", message: { text } }),
  });
  if (!res.ok) console.error(`Messenger send failed [${res.status}]: ${await res.text()}`);
}

async function sendWhatsApp(ch: Channel, to: string, text: string) {
  const res = await fetch(`${GRAPH}/${ch.phone_number_id}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${ch.access_token}` },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: text } }),
  });
  if (!res.ok) console.error(`WhatsApp send failed [${res.status}]: ${await res.text()}`);
}

Deno.serve(async (req) => {
  const db = adminClient();
  const url = new URL(req.url);

  // 1. Meta subscription handshake.
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge") ?? "";
    const { data } = await db.from("meta_channels").select("verify_token").eq("is_active", true);
    const ok = mode === "subscribe" && !!token && (data ?? []).some((c) => c.verify_token === token);
    return ok ? new Response(challenge, { status: 200 }) : new Response("Forbidden", { status: 403 });
  }

  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const raw = await req.text();
  const signature = req.headers.get("x-hub-signature-256");

  const { data: channels } = await db
    .from("meta_channels")
    .select("id, channel, page_id, phone_number_id, access_token, app_secret, verify_token")
    .eq("is_active", true);

  const list = (channels ?? []) as Channel[];
  if (!list.length) return new Response("No channel configured", { status: 200 });

  // 2. Only accept payloads signed with a configured app secret.
  let signer: Channel | null = null;
  for (const ch of list) {
    if (ch.app_secret && (await validSignature(ch.app_secret, raw, signature))) {
      signer = ch;
      break;
    }
  }
  if (!signer) {
    console.error("Rejected webhook: invalid or missing X-Hub-Signature-256");
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(raw);
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  // 3. Normalise Messenger and WhatsApp payloads into a single shape.
  const incoming: Array<{ channel: string; from: string; text: string; pageId?: string; phoneId?: string }> = [];
  const object = payload.object as string | undefined;
  for (const entry of ((payload.entry as Record<string, unknown>[]) ?? [])) {
    if (object === "page") {
      for (const m of ((entry.messaging as Record<string, unknown>[]) ?? [])) {
        const text = (m.message as Record<string, unknown>)?.text as string | undefined;
        const from = (m.sender as Record<string, string>)?.id;
        if (text && from) incoming.push({ channel: "messenger", from, text, pageId: entry.id as string });
      }
    } else if (object === "whatsapp_business_account") {
      for (const change of ((entry.changes as Record<string, unknown>[]) ?? [])) {
        const value = change.value as Record<string, unknown>;
        const phoneId = (value?.metadata as Record<string, string>)?.phone_number_id;
        for (const msg of ((value?.messages as Record<string, unknown>[]) ?? [])) {
          const text = (msg.text as Record<string, string>)?.body;
          const from = msg.from as string;
          if (text && from) incoming.push({ channel: "whatsapp", from, text, phoneId });
        }
      }
    }
  }

  if (!incoming.length) return new Response("EVENT_RECEIVED", { status: 200 });

  const settings = await getSettings(db);
  const catalog = await buildCatalogContext(db);

  for (const event of incoming) {
    const channel =
      list.find(
        (c) =>
          c.channel === event.channel &&
          (event.pageId ? c.page_id === event.pageId : c.phone_number_id === event.phoneId),
      ) ?? (signer.channel === event.channel ? signer : null);
    if (!channel) continue;

    try {
      // Conversation memory per customer.
      const externalId = `${event.channel}:${event.from}`;
      let { data: convo } = await db
        .from("agent_conversations")
        .select("id")
        .eq("channel", event.channel)
        .eq("external_id", externalId)
        .maybeSingle();

      if (!convo) {
        const inserted = await db
          .from("agent_conversations")
          .insert({ channel: event.channel, external_id: externalId })
          .select("id")
          .single();
        convo = inserted.data;
      }

      const { data: history } = await db
        .from("agent_messages")
        .select("role, content")
        .eq("conversation_id", convo!.id)
        .order("created_at", { ascending: true })
        .limit(20);

      await db
        .from("agent_messages")
        .insert({ conversation_id: convo!.id, role: "user", content: event.text });

      const reply = await completeChat(settings.model, [
        { role: "system", content: buildSystemPrompt(settings, catalog, `${event.channel} (Meta)`) },
        ...((history ?? []) as Array<{ role: string; content: string }>),
        { role: "user", content: event.text },
      ]);

      if (reply) {
        await db
          .from("agent_messages")
          .insert({ conversation_id: convo!.id, role: "assistant", content: reply });
        if (event.channel === "messenger") await sendMessenger(channel, event.from, reply);
        else await sendWhatsApp(channel, event.from, reply);
      }

      await db
        .from("meta_channels")
        .update({ last_event_at: new Date().toISOString() })
        .eq("id", channel.id);
    } catch (error) {
      console.error("meta-webhook handling error:", error);
    }
  }

  // Meta requires a fast 200 or it retries and eventually disables the webhook.
  return new Response("EVENT_RECEIVED", { status: 200 });
});
