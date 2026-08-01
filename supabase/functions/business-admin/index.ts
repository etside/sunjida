// Owner-only actions from the dashboard: mint API keys, test the site connection, sync products.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  adminClient,
  mintApiKey,
  pushOrderToSite,
  sha256,
  syncProductsFromSite,
} from "../_shared/tenant.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: claims, error: claimsError } = await userClient.auth.getClaims(
    authHeader.replace("Bearer ", ""),
  );
  if (claimsError || !claims?.claims?.sub) return json({ error: "Unauthorized" }, 401);
  const userId = claims.claims.sub as string;

  const db = adminClient();

  try {
    const { action, businessId, name, orderId } = await req.json();
    if (!businessId) return json({ error: "businessId is required." }, 400);

    const { data: business } = await db
      .from("businesses")
      .select("id, owner_id")
      .eq("id", businessId)
      .maybeSingle();
    if (!business || business.owner_id !== userId) return json({ error: "Forbidden" }, 403);

    switch (action) {
      case "create_key": {
        const { plaintext, prefix } = mintApiKey();
        const { error } = await db.from("business_api_keys").insert({
          business_id: businessId,
          name: name || "Website key",
          key_prefix: prefix,
          key_hash: await sha256(plaintext),
        });
        if (error) return json({ error: error.message }, 400);
        // Shown once — never stored in plaintext.
        return json({ ok: true, api_key: plaintext });
      }

      case "sync_products": {
        const result = await syncProductsFromSite(db, businessId);
        return result.ok ? json({ ok: true, synced: result.count }) : json({ error: result.error }, 400);
      }

      case "retry_order": {
        if (!orderId) return json({ error: "orderId is required." }, 400);
        const result = await pushOrderToSite(db, businessId, orderId);
        return result.ok ? json({ ok: true, reference: result.reference }) : json({ error: result.error }, 502);
      }

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (error) {
    console.error("business-admin error:", error);
    return json({ error: (error as Error).message }, 500);
  }
});
