
ALTER TABLE public.business_api_keys ADD COLUMN IF NOT EXISTS scopes TEXT[] NOT NULL DEFAULT ARRAY['read','write'];
ALTER TABLE public.business_api_keys ADD COLUMN IF NOT EXISTS rate_limit_per_minute INT NOT NULL DEFAULT 60;
ALTER TABLE public.business_api_keys ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE public.business_api_keys ADD COLUMN IF NOT EXISTS rotated_from UUID REFERENCES public.business_api_keys(id);
ALTER TABLE public.business_api_keys ADD COLUMN IF NOT EXISTS last_rotated_at TIMESTAMPTZ;
ALTER TABLE public.business_api_keys ADD COLUMN IF NOT EXISTS ip_whitelist TEXT[];

CREATE TABLE IF NOT EXISTS public.api_key_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES public.business_api_keys(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  endpoint TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_api_key_audit_key ON public.api_key_audit_log(api_key_id, created_at DESC);
GRANT SELECT ON public.api_key_audit_log TO authenticated;
GRANT ALL ON public.api_key_audit_log TO service_role;
ALTER TABLE public.api_key_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners view api key audit log" ON public.api_key_audit_log FOR SELECT TO authenticated USING (public.owns_business(business_id));

CREATE TABLE IF NOT EXISTS public.webhook_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  webhook_secret TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT ARRAY['message','order'],
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  failure_count INT NOT NULL DEFAULT 0,
  max_failures INT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, channel)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.webhook_configurations TO authenticated;
GRANT ALL ON public.webhook_configurations TO service_role;
ALTER TABLE public.webhook_configurations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage webhook configurations" ON public.webhook_configurations FOR ALL TO authenticated USING (public.owns_business(business_id)) WITH CHECK (public.owns_business(business_id));
CREATE TRIGGER webhook_configurations_updated_at BEFORE UPDATE ON public.webhook_configurations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.social_platform_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  platform_user_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  page_id TEXT,
  page_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_synced_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}',
  UNIQUE (business_id, platform, platform_user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_platform_connections TO authenticated;
GRANT ALL ON public.social_platform_connections TO service_role;
ALTER TABLE public.social_platform_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage social connections" ON public.social_platform_connections FOR ALL TO authenticated USING (public.owns_business(business_id)) WITH CHECK (public.owns_business(business_id));

CREATE TABLE IF NOT EXISTS public.social_oauth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  state_token TEXT NOT NULL UNIQUE,
  redirect_url TEXT,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '10 minutes'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.social_oauth_sessions TO authenticated;
GRANT ALL ON public.social_oauth_sessions TO service_role;
ALTER TABLE public.social_oauth_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners view oauth sessions" ON public.social_oauth_sessions FOR SELECT TO authenticated USING (public.owns_business(business_id));

CREATE TABLE IF NOT EXISTS public.business_ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_label TEXT NOT NULL DEFAULT '',
  api_key_encrypted TEXT NOT NULL,
  api_key_hash TEXT NOT NULL,
  api_key_preview TEXT NOT NULL,
  base_url TEXT,
  model TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  last_tested_at TIMESTAMPTZ,
  last_test_status TEXT,
  usage_tokens_total BIGINT NOT NULL DEFAULT 0,
  usage_cost_usd NUMERIC(12,4) NOT NULL DEFAULT 0,
  rate_limit_rpm INT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, provider, api_key_hash)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_ai_providers TO authenticated;
GRANT ALL ON public.business_ai_providers TO service_role;
ALTER TABLE public.business_ai_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage ai providers" ON public.business_ai_providers FOR ALL TO authenticated USING (public.owns_business(business_id)) WITH CHECK (public.owns_business(business_id));
CREATE TRIGGER business_ai_providers_updated_at BEFORE UPDATE ON public.business_ai_providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
