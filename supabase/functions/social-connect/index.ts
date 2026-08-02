// Social platform OAuth connection handler for Meta, Google, WhatsApp business pages.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { adminClient } from "../_shared/tenant.ts";
import {
  getOAuthUrl,
  exchangeCodeForToken,
  getBusinessPages,
  PLATFORMS,
} from "../_shared/social-scopes.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const db = adminClient();
  const url = new URL(req.url);
  const route = url.pathname.split("/social-connect")[1]?.replace(/^\/|\/$/g, "") ?? "";

  // Auth: require Supabase user session
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return json({ error: "Authorization required." }, 401);

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authErr } = await db.auth.getUser(token);
  if (authErr || !user) return json({ error: "Invalid token." }, 401);

  try {
    switch (`${req.method} ${route}`) {
      // Get OAuth URL to initiate connection
      case "GET url": {
        const platform = url.searchParams.get("platform");
        const businessId = url.searchParams.get("business_id");
        if (!platform || !businessId) return json({ error: "platform and business_id required." }, 400);
        if (!PLATFORMS[platform]) return json({ error: "Unknown platform." }, 400);

        const redirectUri = `${Deno.env.get("SUPABASE_URL")}/functions/v1/social-connect/callback`;
        const state = crypto.randomUUID();

        // Store OAuth session
        await db.from("social_oauth_sessions").insert({
          business_id: businessId,
          platform,
          state_token: state,
          redirect_url: redirectUri,
          scopes: [...PLATFORMS[platform].scopes, ...PLATFORMS[platform].businessScopes],
        });

        const authUrl = getOAuthUrl(platform, redirectUri, state);
        return json({ ok: true, url: authUrl });
      }

      // OAuth callback handler
      case "GET callback":
      case "POST callback": {
        const code = url.searchParams.get("code") ?? (await req.json().catch(() => ({})) as any)?.code;
        const state = url.searchParams.get("state") ?? (await req.json().catch(() => ({})) as any)?.state;
        if (!code || !state) return json({ error: "code and state required." }, 400);

        // Find the OAuth session
        const { data: session } = await db
          .from("social_oauth_sessions")
          .select("id, business_id, platform, redirect_url")
          .eq("state_token", state)
          .gt("expires_at", new Date().toISOString())
          .maybeSingle();

        if (!session) return json({ error: "Invalid or expired OAuth session." }, 400);

        const platform = session.platform;
        const redirectUri = session.redirect_url;

        // Exchange code for token
        const tokenData = await exchangeCodeForToken(platform, code, redirectUri);
        if (!tokenData?.access_token) return json({ error: "Token exchange failed." }, 500);

        // Get business pages for this platform
        const pages = await getBusinessPages(platform, tokenData.access_token);

        // Clean up OAuth session
        await db.from("social_oauth_sessions").delete().eq("id", session.id);

        return json({
          ok: true,
          platform,
          business_id: session.business_id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_in: tokenData.expires_in,
          pages,
        });
      }

      // Save a social platform connection
      case "POST save": {
        const body = await req.json();
        const {
          business_id,
          platform,
          platform_user_id,
          access_token,
          refresh_token,
          expires_in,
          page_id,
          page_name,
          scopes,
        } = body;

        if (!business_id || !platform || !access_token) {
          return json({ error: "business_id, platform, and access_token required." }, 400);
        }

        const expiresAt = expires_in
          ? new Date(Date.now() + expires_in * 1000).toISOString()
          : null;

        const { data, error } = await db
          .from("social_platform_connections")
          .upsert(
            {
              business_id,
              platform,
              platform_user_id: platform_user_id ?? "unknown",
              access_token,
              refresh_token: refresh_token ?? null,
              token_expires_at: expiresAt,
              page_id: page_id ?? null,
              page_name: page_name ?? null,
              scopes: scopes ?? PLATFORMS[platform]?.scopes ?? [],
              is_active: true,
              connected_at: new Date().toISOString(),
            },
            { onConflict: "business_id,platform,platform_user_id" },
          )
          .select("id")
          .single();

        if (error) return json({ error: error.message }, 500);

        return json({ ok: true, connectionId: data.id });
      }

      // List connections for a business
      case "GET list": {
        const businessId = url.searchParams.get("business_id");
        if (!businessId) return json({ error: "business_id required." }, 400);

        const { data: connections } = await db
          .from("social_platform_connections")
          .select("id, platform, page_id, page_name, is_active, scopes, connected_at, last_synced_at, token_expires_at")
          .eq("business_id", businessId)
          .order("connected_at", { ascending: false });

        return json({ ok: true, connections: connections ?? [] });
      }

      // Disconnect a platform
      case "POST disconnect": {
        const { connection_id } = await req.json();
        if (!connection_id) return json({ error: "connection_id required." }, 400);

        await db
          .from("social_platform_connections")
          .update({ is_active: false })
          .eq("id", connection_id);

        return json({ ok: true });
      }

      default:
        return json({ error: `Unknown route: ${req.method} /${route}` }, 404);
    }
  } catch (error) {
    console.error("social-connect error:", error);
    return json({ error: (error as Error).message }, 500);
  }
});
