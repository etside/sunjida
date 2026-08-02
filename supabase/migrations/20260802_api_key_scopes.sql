-- Enhanced API key security: scopes, rate limiting, rotation, audit logging
-- This migration improves upon the existing business_api_keys table

-- 1. Add scopes and rate limiting columns to business_api_keys
ALTER TABLE business_api_keys ADD COLUMN IF NOT EXISTS scopes TEXT[] DEFAULT ARRAY['read', 'write'];
ALTER TABLE business_api_keys ADD COLUMN IF NOT EXISTS rate_limit_per_minute INT DEFAULT 60;
ALTER TABLE business_api_keys ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE business_api_keys ADD COLUMN IF NOT EXISTS rotated_from UUID REFERENCES business_api_keys(id);
ALTER TABLE business_api_keys ADD COLUMN IF NOT EXISTS last_rotated_at TIMESTAMPTZ;
ALTER TABLE business_api_keys ADD COLUMN IF NOT EXISTS ip_whitelist TEXT[];

-- 2. Create API key audit log for tracking usage
CREATE TABLE IF NOT EXISTS api_key_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID NOT NULL REFERENCES business_api_keys(id) ON DELETE CASCADE,
  business_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'created', 'used', 'revoked', 'rotated', 'rate_limited'
  ip_address TEXT,
  user_agent TEXT,
  endpoint TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_key_audit_api_key_id ON api_key_audit_log(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_key_audit_business_id ON api_key_audit_log(business_id);
CREATE INDEX IF NOT EXISTS idx_api_key_audit_created_at ON api_key_audit_log(created_at);

-- 3. Create webhook_configurations table for per-channel webhook settings
CREATE TABLE IF NOT EXISTS webhook_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  channel TEXT NOT NULL, -- 'meta', 'google', 'custom'
  webhook_url TEXT NOT NULL,
  webhook_secret TEXT NOT NULL,
  events TEXT[] DEFAULT ARRAY['message', 'order'],
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  failure_count INT DEFAULT 0,
  max_failures INT DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, channel)
);

-- 4. Create social_platform_connections table for OAuth connections
CREATE TABLE IF NOT EXISTS social_platform_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'facebook', 'instagram', 'google', 'whatsapp'
  platform_user_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[] DEFAULT ARRAY[],
  page_id TEXT,
  page_name TEXT,
  is_active BOOLEAN DEFAULT true,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_synced_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  UNIQUE(business_id, platform, platform_user_id)
);

-- 5. Create social_oauth_sessions for temporary OAuth state
CREATE TABLE IF NOT EXISTS social_oauth_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  state_token TEXT NOT NULL UNIQUE,
  redirect_url TEXT,
  scopes TEXT[] DEFAULT ARRAY[],
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '10 minutes'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. RLS policies
ALTER TABLE api_key_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_oauth_sessions ENABLE ROW LEVEL SECURITY;

-- Super admins can manage everything
CREATE POLICY "Super admins can manage api_key_audit_log"
  ON api_key_audit_log FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Super admins can manage webhook_configurations"
  ON webhook_configurations FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Super admins can manage social_platform_connections"
  ON social_platform_connections FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Super admins can manage social_oauth_sessions"
  ON social_oauth_sessions FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'super_admin'));

-- Tenants can manage their own webhook configs
CREATE POLICY "Tenants can manage own webhook_configurations"
  ON webhook_configurations FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE id = (
    SELECT business_id FROM business_members WHERE user_id = auth.uid()
  )));

-- Tenants can manage their own social connections
CREATE POLICY "Tenants can manage own social_platform_connections"
  ON social_platform_connections FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE id = (
    SELECT business_id FROM business_members WHERE user_id = auth.uid()
  )));

-- Tenants can view their own API key audit logs
CREATE POLICY "Tenants can view own api_key_audit_log"
  ON api_key_audit_log FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE id = (
    SELECT business_id FROM business_members WHERE user_id = auth.uid()
  )));

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_webhook_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER webhook_configurations_updated_at
  BEFORE UPDATE ON webhook_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_webhook_configurations_updated_at();
