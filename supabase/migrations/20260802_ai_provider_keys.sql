-- AI Provider API keys: tenants bring their own AI keys for agent inference
CREATE TABLE IF NOT EXISTS business_ai_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'openai', 'anthropic', 'google', 'deepseek', 'custom'
  provider_label TEXT NOT NULL DEFAULT '', -- user-friendly label
  api_key_encrypted TEXT NOT NULL, -- encrypted API key (AES-256-GCM)
  api_key_hash TEXT NOT NULL, -- SHA-256 hash for lookup
  api_key_preview TEXT NOT NULL, -- e.g. 'sk-...abc' (last 4 chars shown)
  base_url TEXT, -- custom endpoint for openai-compatible providers
  model TEXT, -- preferred model name e.g. 'gpt-4o', 'claude-sonnet-4-20250514'
  is_default BOOLEAN DEFAULT false, -- use this key for agent inference
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  last_tested_at TIMESTAMPTZ,
  last_test_status TEXT, -- 'ok', 'error', or error message
  usage_tokens_total BIGINT DEFAULT 0,
  usage_cost_usd NUMERIC(10, 4) DEFAULT 0,
  rate_limit_rpm INT, -- requests per minute (provider limit)
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, provider, api_key_hash)
);

CREATE INDEX IF NOT EXISTS idx_ai_providers_business_id ON business_ai_providers(business_id);

-- Audit log for AI provider usage
CREATE TABLE IF NOT EXISTS ai_provider_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES business_ai_providers(id) ON DELETE CASCADE,
  business_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'created', 'tested', 'used', 'revoked', 'set_default'
  tokens_used INT DEFAULT 0,
  cost_usd NUMERIC(10, 6) DEFAULT 0,
  model TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_audit_provider_id ON ai_provider_audit_log(provider_id);
CREATE INDEX IF NOT EXISTS idx_ai_audit_business_id ON ai_provider_audit_log(business_id);
CREATE INDEX IF NOT EXISTS idx_ai_audit_created_at ON ai_provider_audit_log(created_at);

-- RLS policies
ALTER TABLE business_ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_provider_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own ai_providers"
  ON business_ai_providers FOR ALL
  USING (EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND owner_id = auth.uid()));

CREATE POLICY "Owners view own ai_audit_log"
  ON ai_provider_audit_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND owner_id = auth.uid()));

CREATE POLICY "Super admins manage all ai_providers"
  ON business_ai_providers FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Super admins manage all ai_audit_log"
  ON ai_provider_audit_log FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'super_admin'));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_business_ai_providers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER business_ai_providers_updated_at
  BEFORE UPDATE ON business_ai_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_business_ai_providers_updated_at();
