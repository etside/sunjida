// Social platform OAuth scopes and connection helpers for Meta, Google, and WhatsApp business page access.

export interface PlatformConfig {
  name: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  businessScopes: string[];
  apiBase: string;
}

export const PLATFORMS: Record<string, PlatformConfig> = {
  facebook: {
    name: "Facebook",
    authUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
    scopes: [
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_posts",
      "pages_messaging",
      "pages_read_user_content",
    ],
    businessScopes: [
      "pages_manage_metadata",
      "pages_read_user_content",
      "pages_messaging",
    ],
    apiBase: "https://graph.facebook.com/v19.0",
  },
  instagram: {
    name: "Instagram",
    authUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
    scopes: [
      "instagram_basic",
      "instagram_content_publish",
      "instagram_manage_comments",
      "instagram_manage_messages",
      "pages_show_list",
      "pages_read_engagement",
    ],
    businessScopes: [
      "instagram_manage_messages",
      "instagram_manage_comments",
    ],
    apiBase: "https://graph.facebook.com/v19.0",
  },
  google: {
    name: "Google",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: [
      "https://www.googleapis.com/auth/business.manage",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
    businessScopes: [
      "https://www.googleapis.com/auth/business.manage",
    ],
    apiBase: "https://mybusinessbusinessinformation.googleapis.com/v1",
  },
  whatsapp: {
    name: "WhatsApp Business",
    authUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
    scopes: [
      "whatsapp_business_management",
      "whatsapp_business_messaging",
      "pages_show_list",
      "pages_read_engagement",
    ],
    businessScopes: [
      "whatsapp_business_management",
      "whatsapp_business_messaging",
    ],
    apiBase: "https://graph.facebook.com/v19.0",
  },
};

export function getOAuthUrl(platform: string, redirectUri: string, state: string): string | null {
  const config = PLATFORMS[platform];
  if (!config) return null;

  const allScopes = [...new Set([...config.scopes, ...config.businessScopes])];

  if (platform === "google") {
    const params = new URLSearchParams({
      client_id: Deno.env.get("GOOGLE_CLIENT_ID") ?? "",
      redirect_uri: redirectUri,
      response_type: "code",
      scope: allScopes.join(" "),
      state,
      access_type: "offline",
      prompt: "consent",
    });
    return `${config.authUrl}?${params.toString()}`;
  }

  // Meta platforms (Facebook, Instagram, WhatsApp)
  const params = new URLSearchParams({
    client_id: Deno.env.get("META_APP_ID") ?? "",
    redirect_uri: redirectUri,
    scope: allScopes.join(","),
    state,
    response_type: "code",
  });
  return `${config.authUrl}?${params.toString()}`;
}

export async function exchangeCodeForToken(
  platform: string,
  code: string,
  redirectUri: string,
): Promise<{ access_token: string; refresh_token?: string; expires_in?: number } | null> {
  const config = PLATFORMS[platform];
  if (!config) return null;

  if (platform === "google") {
    const res = await fetch(config.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: Deno.env.get("GOOGLE_CLIENT_ID") ?? "",
        client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET") ?? "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!res.ok) return null;
    return await res.json();
  }

  // Meta platforms
  const res = await fetch(config.tokenUrl, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  // Meta uses GET with query params for token exchange
  const params = new URLSearchParams({
    client_id: Deno.env.get("META_APP_ID") ?? "",
    client_secret: Deno.env.get("META_APP_SECRET") ?? "",
    redirect_uri: redirectUri,
    code,
  });
  const metaRes = await fetch(`${config.tokenUrl}?${params.toString()}`);
  if (!metaRes.ok) return null;
  return await metaRes.json();
}

export async function getBusinessPages(
  platform: string,
  accessToken: string,
): Promise<Array<{ id: string; name: string; category?: string }>> {
  const config = PLATFORMS[platform];
  if (!config) return [];

  if (platform === "google") {
    const res = await fetch(`${config.apiBase}/accounts`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.accounts ?? []).map((a: any) => ({
      id: a.name?.split("/").pop() ?? "",
      id: a.name?.split("/").pop() ?? "",
      name: a.displayName ?? "",
      category: a.category ?? "",
    }));
  }

  // Meta platforms — get pages the user manages
  const res = await fetch(`${config.apiBase}/me/accounts?access_token=${accessToken}`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.data ?? []).map((p: any) => ({
    id: p.id,
    name: p.name,
    category: p.category,
  }));
}
