import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { speechResult, tenantId, conversationId } = await req.json();

    if (!speechResult || !tenantId) {
      return new Response(JSON.stringify({ error: "speechResult and tenantId are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Load tenant for custom prompt
    const { data: tenant } = await supabase
      .from("tenants")
      .select("sales_daddy_prompt, name")
      .eq("id", tenantId)
      .single();

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    // Build messages with cultural context
    const messages: Array<{ role: string; content: string }> = [];

    if (tenant?.sales_daddy_prompt) {
      messages.push({ role: "system", content: tenant.sales_daddy_prompt });
    }

    messages.push({
      role: "system",
      content: `You are a helpful voice assistant for ${tenant?.name || "the business"}. Keep responses concise and conversational. Respond in 2-3 sentences max since this is a phone conversation.`,
    });

    messages.push({ role: "user", content: speechResult });

    // Call Lovable AI Gateway (OpenAI-compatible)
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": lovableKey,
      },
      body: JSON.stringify({
        model: Deno.env.get("VOICE_AGENT_MODEL") || "google/gemini-3.6-flash",
        messages,
        max_tokens: parseInt(Deno.env.get("VOICE_AGENT_MAX_TOKENS") || "150"),
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "I didn't understand that. Could you please repeat?";

    // Store conversation if conversationId provided
    if (conversationId) {
      await supabase.from("agent_messages").insert([
        { conversation_id: conversationId, role: "user", content: speechResult },
        { conversation_id: conversationId, role: "assistant", content: aiResponse },
      ]);
    }

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
