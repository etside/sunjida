// Multi-tenant helpers: API keys, per-business context, and the business's own website API.
import { createClient } from "npm:@supabase/supabase-js@2";

export type Db = ReturnType<typeof adminClient>;

export function adminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
}

/* ------------------------------------------------------------------ */
/* API keys                                                            */
/* ------------------------------------------------------------------ */

export async function sha256(value: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomToken(bytes: number) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Returns the one-time plaintext key plus the values we persist. */
export function mintApiKey() {
  const prefix = `sd_${randomToken(4)}`;
  const secret = randomToken(24);
  return { plaintext: `${prefix}.${secret}`, prefix };
}

/** Resolve a business from an `X-SalesDaddy-Key` header, with scope + rate-limit checks. */
export async function businessFromApiKey(
  db: Db,
  rawKey: string | null,
  requiredScope?: string,
): Promise<{ business: Record<string, unknown>; keyRecord: Record<string, unknown> } | null> {
  if (!rawKey) return null;
  const prefix = rawKey.split(".")[0];
  if (!prefix) return null;

  const { data: key } = await db
    .from("business_api_keys")
    .select("id, business_id, key_hash, revoked_at, scopes, rate_limit_per_minute, expires_at, ip_whitelist")
    .eq("key_prefix", prefix)
    .maybeSingle();

  if (!key || key.revoked_at) return null;
  if ((await sha256(rawKey)) !== key.key_hash) return null;

  // Check expiration
  if (key.expires_at && new Date(key.expires_at) < new Date()) return null;

  // Check scope
  if (requiredScope && !(key.scopes ?? []).includes(requiredScope)) return null;

  // Rate limit check: count "used" actions in last minute
  const oneMinAgo = new Date(Date.now() - 60_000).toISOString();
  const { count } = await db
    .from("api_key_audit_log")
    .select("id", { count: "exact", head: true })
    .eq("api_key_id", key.id)
    .eq("action", "used")
    .gte("created_at", oneMinAgo);

  if ((count ?? 0) >= (key.rate_limit_per_minute ?? 60)) return null;

  // Log usage
  await db.from("api_key_audit_log").insert({
    api_key_id: key.id,
    business_id: key.business_id,
    action: "used",
  });

  await db
    .from("business_api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", key.id);

  const { data: business } = await db
    .from("businesses")
    .select("id, name, slug, is_active, website_url")
    .eq("id", key.business_id)
    .maybeSingle();

  return business?.is_active ? { business, keyRecord: key } : null;
}

/* ------------------------------------------------------------------ */
/* The business's own website API (products + order placement)         */
/* ------------------------------------------------------------------ */

export type Integration = {
  products_url: string | null;
  product_detail_url: string | null;
  order_create_url: string | null;
  auth_header_name: string | null;
  auth_header_value: string | null;
  extra_headers: Record<string, string> | null;
};

export async function getIntegration(db: Db, businessId: string): Promise<Integration | null> {
  const { data } = await db
    .from("business_integrations")
    .select("products_url, product_detail_url, order_create_url, auth_header_name, auth_header_value, extra_headers")
    .eq("business_id", businessId)
    .maybeSingle();
  return (data as Integration) ?? null;
}

function integrationHeaders(integration: Integration) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(integration.extra_headers ?? {}),
  };
  if (integration.auth_header_value) {
    headers[integration.auth_header_name || "Authorization"] = integration.auth_header_value;
  }
  return headers;
}

/** Normalise whatever shape the business's site returns into our product rows. */
export function normaliseProducts(payload: unknown) {
  const list = Array.isArray(payload)
    ? payload
    : ((payload as Record<string, unknown>)?.products as unknown[]) ??
      ((payload as Record<string, unknown>)?.data as unknown[]) ??
      ((payload as Record<string, unknown>)?.items as unknown[]) ??
      [];

  return (list as Record<string, unknown>[])
    .map((p) => {
      const external_id = String(p.id ?? p.sku ?? p.product_id ?? p.handle ?? "").trim();
      const name = String(p.name ?? p.title ?? "").trim();
      if (!external_id || !name) return null;
      const rawStock = p.stock ?? p.stock_quantity ?? p.inventory ?? p.quantity ?? p.available;
      return {
        external_id,
        name,
        description: (p.description as string) ?? null,
        price: p.price != null ? Number(p.price) : p.sale_price != null ? Number(p.sale_price) : null,
        currency: (p.currency as string) ?? "BDT",
        stock_quantity:
          typeof rawStock === "boolean" ? (rawStock ? 1 : 0) : rawStock != null ? Number(rawStock) : null,
        image_url: (p.image ?? p.image_url ?? p.thumbnail) as string ?? null,
        product_url: (p.url ?? p.product_url ?? p.link) as string ?? null,
        raw: p,
      };
    })
    .filter(Boolean) as Array<Record<string, unknown>>;
}

/** Pull the live catalog from the business's own website and cache it. */
export async function syncProductsFromSite(db: Db, businessId: string) {
  const integration = await getIntegration(db, businessId);
  if (!integration?.products_url) {
    return { ok: false, count: 0, error: "No products URL configured for this business." };
  }

  let payload: unknown;
  try {
    const res = await fetch(integration.products_url, { headers: integrationHeaders(integration) });
    if (!res.ok) {
      const body = await res.text();
      const error = `Product feed responded ${res.status}: ${body.slice(0, 300)}`;
      await db
        .from("business_integrations")
        .update({ last_status: "error", last_error: error, last_sync_at: new Date().toISOString() })
        .eq("business_id", businessId);
      return { ok: false, count: 0, error };
    }
    payload = await res.json();
  } catch (e) {
    const error = `Could not reach the product feed: ${(e as Error).message}`;
    await db
      .from("business_integrations")
      .update({ last_status: "error", last_error: error, last_sync_at: new Date().toISOString() })
      .eq("business_id", businessId);
    return { ok: false, count: 0, error };
  }

  return await cacheProducts(db, businessId, normaliseProducts(payload));
}

export async function cacheProducts(db: Db, businessId: string, products: Array<Record<string, unknown>>) {
  if (!products.length) {
    const error = "The product feed returned no usable products.";
    await db
      .from("business_integrations")
      .update({ last_status: "empty", last_error: error, last_sync_at: new Date().toISOString() })
      .eq("business_id", businessId);
    return { ok: false, count: 0, error };
  }

  const rows = products.map((p) => ({ ...p, business_id: businessId, synced_at: new Date().toISOString() }));
  const { error: upsertError } = await db
    .from("business_products")
    .upsert(rows, { onConflict: "business_id,external_id" });

  if (upsertError) {
    await db
      .from("business_integrations")
      .update({ last_status: "error", last_error: upsertError.message, last_sync_at: new Date().toISOString() })
      .eq("business_id", businessId);
    return { ok: false, count: 0, error: upsertError.message };
  }

  await db
    .from("business_integrations")
    .update({ last_status: "ok", last_error: null, last_sync_at: new Date().toISOString() })
    .eq("business_id", businessId);

  return { ok: true, count: rows.length, error: null as string | null };
}

/** Push a confirmed order to the business's own website. */
export async function pushOrderToSite(db: Db, businessId: string, orderId: string) {
  const integration = await getIntegration(db, businessId);
  const { data: order } = await db.from("lead_orders").select("*").eq("id", orderId).maybeSingle();
  if (!order) return { ok: false, error: "Order not found." };

  if (!integration?.order_create_url) {
    await db
      .from("lead_orders")
      .update({ push_status: "no_endpoint", push_attempts: (order.push_attempts ?? 0) + 1 })
      .eq("id", orderId);
    return { ok: false, error: "No order endpoint configured for this business." };
  }

  try {
    const res = await fetch(integration.order_create_url, {
      method: "POST",
      headers: integrationHeaders(integration),
      body: JSON.stringify({
        source: "salesdaddy",
        salesdaddy_order_id: order.id,
        items: order.items,
        subtotal: order.subtotal,
        total: order.total,
        currency: order.currency,
        customer: {
          name: order.customer_name,
          phone: order.customer_phone,
          email: order.customer_email,
        },
        shipping_address: order.shipping_address,
      }),
    });

    const text = await res.text();
    let parsed: unknown = text;
    try {
      parsed = JSON.parse(text);
    } catch { /* plain text response */ }

    const ref =
      (parsed as Record<string, unknown>)?.order_id ??
      (parsed as Record<string, unknown>)?.id ??
      (parsed as Record<string, unknown>)?.order_number ??
      null;

    await db
      .from("lead_orders")
      .update({
        push_status: res.ok ? "delivered" : "failed",
        push_attempts: (order.push_attempts ?? 0) + 1,
        push_response: { status: res.status, body: parsed },
        external_order_ref: ref ? String(ref) : null,
      })
      .eq("id", orderId);

    return res.ok
      ? { ok: true, reference: ref ? String(ref) : null }
      : { ok: false, error: `Your site responded ${res.status}: ${text.slice(0, 300)}` };
  } catch (e) {
    await db
      .from("lead_orders")
      .update({
        push_status: "failed",
        push_attempts: (order.push_attempts ?? 0) + 1,
        push_response: { error: (e as Error).message },
      })
      .eq("id", orderId);
    return { ok: false, error: (e as Error).message };
  }
}
