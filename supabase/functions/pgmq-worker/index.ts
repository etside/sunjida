// pgmq-worker: processes queued messenger replies from the pgmq queue
// Handles text and voice replies via Meta Graph API
import { adminClient } from "../_shared/tenant.ts";
import { generateSpeech } from "../_shared/agent.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GRAPH = "https://graph.facebook.com/v21.0";

type ReplyJob = {
  conversation_id: string;
  tenant_id: string;
  channel: string;
  recipient: string;
  text: string;
  audio_url?: string;
  page_id?: string;
  access_token?: string;
};

/** Send text message via Graph API */
async function sendText(accessToken: string, recipient: string, text: string) {
  const res = await fetch(`${GRAPH}/me/messages?access_token=${encodeURIComponent(accessToken)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: recipient },
      messaging_type: "RESPONSE",
      message: { text },
    }),
  });
  if (!res.ok) console.error(`Text send failed [${res.status}]: ${await res.text()}`);
  return res.ok;
}

/** Send audio attachment via Graph API */
async function sendAudio(accessToken: string, recipient: string, audioUrl: string) {
  // Upload audio as attachment
  const uploadRes = await fetch(
    `${GRAPH}/me/message_attachments?access_token=${encodeURIComponent(accessToken)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: {
          attachment: {
            type: "audio",
            payload: { url: audioUrl, is_reusable: false },
          },
        },
      }),
    },
  );

  if (!uploadRes.ok) {
    console.error(`Audio upload failed [${uploadRes.status}]: ${await uploadRes.text()}`);
    return false;
  }

  const { attachment_id } = await uploadRes.json();

  const sendRes = await fetch(`${GRAPH}/me/messages?access_token=${encodeURIComponent(accessToken)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: recipient },
      messaging_type: "RESPONSE",
      message: {
        attachment: {
          type: "audio",
          payload: { attachment_id },
        },
      },
    }),
  });

  if (!sendRes.ok) console.error(`Audio send failed [${sendRes.status}]: ${await sendRes.text()}`);
  return sendRes.ok;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const db = adminClient();
    const body = await req.json().catch(() => ({}));
    const batchSize = body.batch_size ?? 10;

    // Dequeue messages from pgmq
    const { data: queueData, error: queueError } = await db.rpc("pgmq_read", {
      queue_name: "messenger_replies",
      vt: 30, // visibility timeout 30 seconds
      qty: batchSize,
    });

    if (queueError || !queueData?.length) {
      return new Response(
        JSON.stringify({ ok: true, processed: 0, message: "Queue empty" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const results = [];

    for (const job of queueData) {
      const payload = job.message as ReplyJob;
      const msgId = job.msg_id;

      try {
        // Get channel access token
        const { data: channel } = await db
          .from("meta_channels")
          .select("access_token, page_id")
          .eq("business_id", payload.tenant_id)
          .eq("channel", payload.channel)
          .eq("is_active", true)
          .single();

        if (!channel?.access_token) {
          console.error(`No access token for tenant ${payload.tenant_id}`);
          await db.rpc("pgmq_delete", { queue_name: "messenger_replies", msg_id: msgId });
          results.push({ msg_id: msgId, ok: false, error: "No access token" });
          continue;
        }

        const accessToken = channel.access_token;

        // Send text reply
        if (payload.text) {
          await sendText(accessToken, payload.recipient, payload.text);
        }

        // Send voice reply if audio_url provided and tenant has voice enabled
        if (payload.audio_url) {
          await sendAudio(accessToken, payload.recipient, payload.audio_url);
        }

        // Delete from queue on success
        await db.rpc("pgmq_delete", { queue_name: "messenger_replies", msg_id: msgId });
        results.push({ msg_id: msgId, ok: true });
      } catch (e) {
        console.error(`Job ${msgId} failed:`, (e as Error).message);
        // Message stays in queue for retry (visibility timeout will expire)
        results.push({ msg_id: msgId, ok: false, error: (e as Error).message });
      }
    }

    return new Response(
      JSON.stringify({ ok: true, processed: results.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
