// Enhanced API key management: scopes, rate limiting, rotation, audit logging
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { adminClient, sha256 } from "../_shared/tenant.ts";

function randomToken(bytes: number) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function mintApiKey() {
  const prefix = `sd_${randomToken(4)}`;
  const secret = randomToken(24);
  return { plaintext: `${prefix}.${secret}`, prefix };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function logAudit(db: any, keyId: string, businessId: string, action: string, meta: Record<string, unknown> = {}) {
  await db.from("api_key_audit_log").insert({
    api_key_id: keyId,
    business_id: businessId,
    action,
    metadata: meta,
  });
}

async function checkRateLimit(db: any, keyId: string, limitPerMinute: number): Promise<boolean> {
  const oneMinAgo = new Date(Date.now() - 60_000).toISOString();
  const { count } = await db
    .from("api_key_audit_log")
    .select("id", { count: "exact", head: true })
    .eq("api_key_id", keyId)
    .eq("action", "used")
    .gte("created_at", oneMinAgo);
  return (count ?? 0) < limitPerMinute;
}

const VALID_SCOPES = ["read", "write", "admin", "webhooks", "orders", "products", "leads"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const db = adminClient();
  const url = new URL(req.url);
  const route = url.pathname.split("/api-keys")[1]?.replace(/^\/|\/$/g, "") ?? "";

  // Auth: require Supabase user session
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return json({ error: "Authorization required." }, 401);

  const supabase = adminClient();
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return json({ error: "Invalid token." }, 401);

  try {
    switch (`${req.method} ${route}`) {
      // List API keys for a business
      case "GET list": {
        const businessId = url.searchParams.get("business_id");
        if (!businessId) return json({ error: "business_id required." }, 400);

        const { data: keys } = await db
          .from("business_api_keys")
          .select("id, name, key_prefix, scopes, rate_limit_per_minute, expires_at, last_rotated_at, ip_whitelist, revoked_at, last_used_at, created_at")
          .eq("business_id", businessId)
          .order("created_at", { ascending: false });

        return json({ ok: true, keys: keys ?? [] });
      }

      // Create a new scoped API key
      case "POST create": {
        const body = await req.json();
        const { business_id, name, scopes, rate_limit_per_minute, expires_at, ip_whitelist } = body;
        if (!business_id || !name) return json({ error: "business_id and name required." }, 400);

        const keyScopes = (scopes ?? ["read", "write"]).filter((s: string) => VALID_SCOPES.includes(s));
        if (keyScopes.length === 0) return json({ error: "At least one valid scope required." }, 400);

        const { plaintext, prefix } = mintApiKey();
        const key_hash = await sha256(plaintext);

        const { data: key, error } = await db
          .from("business_api_keys")
          .insert({
            business_id,
            name,
            key_prefix: prefix,
            key_hash,
            scopes: keyScopes,
            rate_limit_per_minute: rate_limit_per_minute ?? 60,
            expires_at: expires_at ?? null,
            ip_whitelist: ip_whitelist ?? null,
          })
          .select("id")
          .single();

        if (error) return json({ error: error.message }, 500);

        await logAudit(db, key.id, business_id, "created", { name, scopes: keyScopes });

        return json({ ok: true, apiKey: plaintext, keyId: key.id, scopes: keyScopes });
      }

      // Rotate an existing API key
      case "POST rotate": {
        const { key_id } = await req.json();
        if (!key_id) return json({ error: "key_id required." }, 400);

        const { data: oldKey } = await db
          .from("business_api_keys")
          .select("id, business_id, name, scopes, rate_limit_per_minute, expires_at, ip_whitelist")
          .eq("id", key_id)
          .is("revoked_at", null)
          .single();

        if (!oldKey) return json({ error: "Key not found or already revoked." }, 404);

        const { plaintext, prefix } = mintApiKey();
        const key_hash = await sha256(plaintext);

        // Revoke old key
        await db
          .from("business_api_keys")
          .update({ revoked_at: new Date().toISOString() })
          .eq("id", key_id);

        // Create new key with same config
        const { data: newKey, error } = await db
          .from("business_api_keys")
          .insert({
            business_id: oldKey.business_id,
            name: `${oldKey.name} (rotated)`,
            key_prefix: prefix,
            key_hash,
            scopes: oldKey.scopes,
            rate_limit_per_minute: oldKey.rate_limit_per_minute,
            expires_at: oldKey.expires_at,
            ip_whitelist: oldKey.ip_whitelist,
            rotated_from: key_id,
            last_rotated_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (error) return json({ error: error.message }, 500);

        await logAudit(db, newKey.id, oldKey.business_id, "rotated", { from_key_id: key_id });

        return json({ ok: true, apiKey: plaintext, keyId: newKey.id });
      }

      // Revoke an API key
      case "POST revoke": {
        const { key_id } = await req.json();
        if (!key_id) return json({ error: "key_id required." }, 400);

        const { data: key } = await db
          .from("business_api_keys")
          .update({ revoked_at: new Date().toISOString() })
          .eq("id", key_id)
          .is("revoked_at", null)
          .select("id, business_id")
          .single();

        if (!key) return json({ error: "Key not found or already revoked." }, 404);

        await logAudit(db, key.id, key.business_id, "revoked");

        return json({ ok: true });
      }

      // Get audit log for a business
      case "GET audit": {
        const businessId = url.searchParams.get("business_id");
        const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 200);
        if (!businessId) return json({ error: "business_id required." }, 400);

        const { data: logs } = await db
          .from("api_key_audit_log")
          .select("id, api_key_id, action, ip_address, endpoint, metadata, created_at")
          .eq("business_id", businessId)
          .order("created_at", { ascending: false })
          .limit(limit);

        return json({ ok: true, logs: logs ?? [] });
      }

      default:
        return json({ error: `Unknown route: ${req.method} /${route}` }, 404);
    }
  } catch (error) {
    console.error("api-keys error:", error);
    return json({ error: (error as Error).message }, 500);
  }
});

export { checkRateLimit, logAudit };
