// Catalog sync: pull products from business shop, generate embeddings, cache to pgvector
import { adminClient, getIntegration, normaliseProducts, cacheProducts } from "../_shared/tenant.ts";
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
    const body = await req.json().catch(() => ({}));
    const tenantId = body.tenant_id as string | undefined;

    // Get all businesses with catalog sync enabled (or specific tenant)
    let query = db
      .from("businesses")
      .select("id, shop_url")
      .eq("catalog_sync_enabled", true)
      .eq("is_active", true);

    if (tenantId) {
      query = query.eq("id", tenantId);
    }

    const { data: businesses, error: bizError } = await query;
    if (bizError || !businesses?.length) {
      return new Response(
        JSON.stringify({ ok: false, error: bizError?.message ?? "No businesses with catalog sync enabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const results = [];

    for (const biz of businesses) {
      try {
        // 1. Pull products from shop URL
        const syncResult = await syncProductsFromSite(db, biz.id);
        if (!syncResult.ok) {
          results.push({ tenant_id: biz.id, ok: false, error: syncResult.error });
          continue;
        }

        // 2. Generate embeddings for each product
        const { data: products } = await db
          .from("business_products")
          .select("id, name, description, external_id")
          .eq("business_id", biz.id)
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
          results.push({ tenant_id: biz.id, ok: true, count: syncResult.count, embedded });
        } else {
          results.push({ tenant_id: biz.id, ok: true, count: syncResult.count, embedded: 0 });
        }

        // 3. Update last sync timestamp
        await db
          .from("businesses")
          .update({ catalog_last_sync_at: new Date().toISOString() })
          .eq("id", biz.id);
      } catch (e) {
        results.push({ tenant_id: biz.id, ok: false, error: (e as Error).message });
      }
    }

    return new Response(
      JSON.stringify({ ok: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
