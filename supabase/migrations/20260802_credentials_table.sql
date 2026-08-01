-- Create credentials table for managing API keys per tenant
-- Used by the CredentialsManager in the super admin panel

CREATE TABLE IF NOT EXISTS credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  api_key_encrypted TEXT NOT NULL,
  account_name TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for efficient tenant lookups
CREATE INDEX IF NOT EXISTS idx_credentials_tenant_id ON credentials(tenant_id);

-- RLS policies
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;

-- Super admins can do everything
CREATE POLICY "Super admins can manage all credentials"
  ON credentials
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'super_admin'
    )
  );

-- Tenants can view their own credentials
CREATE POLICY "Tenants can view own credentials"
  ON credentials
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE id = (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER credentials_updated_at
  BEFORE UPDATE ON credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_credentials_updated_at();
