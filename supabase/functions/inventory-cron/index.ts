// Inventory cron: scheduled stock updates from business shop APIs
// Called by Supabase cron scheduler every 5 minutes
import { adminClient, getIntegration, normaliseProducts } from "../_shared/tenant.ts";

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

    // Get all businesses with catalog sync enabled
    const { data: businesses, error: bizError } = await db
      .from("businesses")
      .select("id, shop_url")
      .eq("catalog_sync_enabled", true)
      .eq("is_active", true);

    if (bizError || !businesses?.length) {
      return new Response(
        JSON.stringify({ ok: false, error: bizError?.message ?? "No businesses to sync" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const results = [];

    for (const biz of businesses) {
      try {
        const integration = await getIntegration(db, biz.id);
        if (!integration?.products_url) {
          results.push({ tenant_id: biz.id, ok: false, error: "No products URL" });
          continue;
        }

        // Fetch products from shop
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(integration.extra_headers ?? {}),
        };
        if (integration.auth_header_value) {
          headers[integration.auth_header_name || "Authorization"] = integration.auth_header_value;
        }

        const res = await fetch(integration.products_url, { headers });
        if (!res.ok) {
          results.push({ tenant_id: biz.id, ok: false, error: `Shop responded ${res.status}` });
          continue;
        }

        const payload = await res.json();
        const products = normaliseProducts(payload);

        if (!products.length) {
          results.push({ tenant_id: biz.id, ok: true, updated: 0 });
          continue;
        }

        // Update only stock_quantity for existing products
        let updated = 0;
        for (const product of products) {
          const { error } = await db
            .from("business_products")
            .update({
              stock_quantity: product.stock_quantity,
              synced_at: new Date().toISOString(),
            })
            .eq("business_id", biz.id)
            .eq("external_id", product.external_id);

          if (!error) updated++;
        }

        results.push({ tenant_id: biz.id, ok: true, updated });
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
