// Plug-and-play REST API each signed-up business calls from their own website.
// Auth: header `X-SalesDaddy-Key: sd_xxxx.yyyy`
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import {
  adminClient,
  businessFromApiKey,
  cacheProducts,
  normaliseProducts,
  pushOrderToSite,
  syncProductsFromSite,
} from "../_shared/tenant.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const db = adminClient();
  const authResult = await businessFromApiKey(db, req.headers.get("x-salesdaddy-key"));
  if (!authResult) return json({ error: "Invalid or revoked API key." }, 401);
  const { business } = authResult;

  const url = new URL(req.url);
  const route = url.pathname.split("/business-api")[1]?.replace(/^\/|\/$/g, "") ?? "";

  try {
    switch (`${req.method} ${route}`) {
      /* Health / key check */
      case "GET ":
      case "GET ping":
        return json({ ok: true, business: { id: business.id, name: business.name, slug: business.slug } });

      /* Push your catalog to SalesDaddy */
      case "POST products": {
        const body = await req.json();
        const products = normaliseProducts(body);
        const result = await cacheProducts(db, business.id, products);
        return result.ok
          ? json({ ok: true, synced: result.count })
          : json({ error: result.error }, 400);
      }

      /* Ask SalesDaddy to pull your catalog from the configured feed URL */
      case "POST products/sync": {
        const result = await syncProductsFromSite(db, business.id);
        return result.ok ? json({ ok: true, synced: result.count }) : json({ error: result.error }, 400);
      }

      /* What the agent currently knows about your stock */
      case "GET products": {
        const { data } = await db
          .from("business_products")
          .select("external_id, name, price, currency, stock_quantity, synced_at")
          .eq("business_id", business.id)
          .order("name");
        return json({ ok: true, products: data ?? [] });
      }

      /* Leads captured from all channels */
      case "GET leads": {
        const stage = url.searchParams.get("stage");
        let query = db
          .from("leads")
          .select("id, customer_name, customer_contact, channel, category, stage, intent_score, estimated_value, lang, summary, created_at")
          .eq("business_id", business.id)
          .order("created_at", { ascending: false })
          .limit(Number(url.searchParams.get("limit") ?? 100));
        if (stage) query = query.eq("stage", stage);
        const { data } = await query;
        return json({ ok: true, leads: data ?? [] });
      }

      /* Orders the agent closed */
      case "GET orders": {
        const { data } = await db
          .from("lead_orders")
          .select("id, items, total, currency, customer_name, customer_phone, shipping_address, push_status, external_order_ref, created_at")
          .eq("business_id", business.id)
          .order("created_at", { ascending: false })
          .limit(100);
        return json({ ok: true, orders: data ?? [] });
      }

      /* Retry delivering an order to your site */
      case "POST orders/retry": {
        const { order_id } = await req.json();
        if (!order_id) return json({ error: "order_id is required." }, 400);
        const { data: owned } = await db
          .from("lead_orders")
          .select("id")
          .eq("id", order_id)
          .eq("business_id", business.id)
          .maybeSingle();
        if (!owned) return json({ error: "Order not found." }, 404);
        const result = await pushOrderToSite(db, business.id, order_id);
        return result.ok ? json({ ok: true, reference: result.reference }) : json({ error: result.error }, 502);
      }

      default:
        return json({ error: `Unknown route: ${req.method} /${route}` }, 404);
    }
  } catch (error) {
    console.error("business-api error:", error);
    return json({ error: (error as Error).message }, 500);
  }
});
