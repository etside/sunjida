// Business onboarding: register Meta page + shop URL, create tenant, sync catalog
import { adminClient, syncProductsFromSite } from "../_shared/tenant.ts";
import { generateEmbedding } from "../_shared/agent.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const db = adminClient();
    const {
      business_name,
      page_id,
      access_token,
      app_secret,
      verify_token,
      shop_url,
      owner_id,
    } = await req.json();

    if (!business_name || !page_id || !access_token) {
      return new Response(
        JSON.stringify({ error: "business_name, page_id, and access_token are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 1. Create business/tenant
    const { data: business, error: bizError } = await db
      .from("businesses")
      .insert({
        name: business_name,
        slug: business_name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        is_active: true,
        shop_url: shop_url || null,
        catalog_sync_enabled: !!shop_url,
        created_by: owner_id || null,
      })
      .select("id")
      .single();

    if (bizError || !business) {
      return new Response(
        JSON.stringify({ error: `Failed to create business: ${bizError?.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2. Create Meta channel
    const { error: channelError } = await db
      .from("meta_channels")
      .insert({
        business_id: business.id,
        channel: "messenger",
        page_id,
        access_token,
        app_secret: app_secret || null,
        verify_token: verify_token || `verify_${Date.now()}`,
        is_active: true,
      });

    if (channelError) {
      return new Response(
        JSON.stringify({ error: `Failed to create channel: ${channelError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 3. Create default agent settings
    await db
      .from("agent_settings")
      .insert({
        business_id: business.id,
        business_name,
        greeting_en: `Hi! Welcome to ${business_name}. How can I help you today?`,
        greeting_bn: `হ্যালো! ${business_name}-এ স্বাগতম। আজ আমি কীভাবে আপনাকে সাহায্য করতে পারি?`,
        instructions: `You are a helpful bilingual (Bangla/English) sales assistant for ${business_name}. Always reply in the customer's language.`,
        model: "google/gemini-3.6-flash",
        is_enabled: true,
        voice_enabled: false,
      });

    // 4. Create integration for shop URL
    if (shop_url) {
      await db
        .from("business_integrations")
        .insert({
          business_id: business.id,
          products_url: shop_url.endsWith("/api/products") ? shop_url : `${shop_url}/api/products`,
          last_status: "pending",
        });
    }

    // 5. Trigger catalog sync if shop URL provided
    let catalogResult = null;
    if (shop_url) {
      try {
        catalogResult = await syncProductsFromSite(db, business.id);

        // Generate embeddings for synced products
        if (catalogResult.ok) {
          const { data: products } = await db
            .from("business_products")
            .select("id, name, description")
            .eq("business_id", business.id)
            .limit(200);

          if (products?.length) {
            let embedded = 0;
            for (const product of products) {
              const text = [product.name, product.description].filter(Boolean).join(" ");
              const embedding = await generateEmbedding(text);
              if (embedding) {
                await db
                  .from("business_products")
                  .update({ embedding: `[${embedding.join(",")}]` })
                  .eq("id", product.id);
                embedded++;
              }
            }
            catalogResult.embedded = embedded;
          }
        }
      } catch (e) {
        catalogResult = { ok: false, error: (e as Error).message };
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        business_id: business.id,
        page_id,
        catalog: catalogResult,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
