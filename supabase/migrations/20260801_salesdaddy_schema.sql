-- Sales Daddy: Extended tenant features
-- Adds plan, feature gates, onboarding state, and custom prompt to tenants

-- Extend tenants table with Sales Daddy fields
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise'));
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS feature_gates JSONB DEFAULT '{}';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS onboarding_data JSONB DEFAULT '{}';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS sales_daddy_prompt TEXT DEFAULT '';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS security_flags JSONB DEFAULT '{}';

-- Create inventory_products table (separate from sharee_products for Sales Daddy inventory)
CREATE TABLE IF NOT EXISTS inventory_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  description TEXT,
  price NUMERIC DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  category TEXT,
  attributes JSONB DEFAULT '{}',
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'csv', 'sheets')),
  external_id TEXT,
  synced_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create feature_gate_definitions table for configurable features
CREATE TABLE IF NOT EXISTS feature_gate_definitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  min_plan TEXT DEFAULT 'free' CHECK (min_plan IN ('free', 'starter', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default feature gate definitions
INSERT INTO feature_gate_definitions (feature_key, name, description, min_plan) VALUES
  ('inventory_sync', 'Inventory Sync', 'Sync inventory from Google Sheets or CSV', 'starter'),
  ('voice_agent', 'Voice Agent', 'AI voice agent for phone conversations', 'pro'),
  ('social_connect', 'Social Connect', 'Connect WhatsApp, Facebook, Instagram, Telegram', 'starter'),
  ('custom_branding', 'Custom Branding', 'Customize agent appearance and voice', 'pro'),
  ('analytics_pro', 'Advanced Analytics', 'Detailed analytics and reporting', 'pro'),
  ('onboarding_wizard', 'Onboarding Wizard', 'Guided setup wizard for new tenants', 'free'),
  ('training_rag', 'RAG Training', 'Upload documents for AI training', 'starter'),
  ('multi_language', 'Multi-Language', 'Support multiple languages and dialects', 'enterprise'),
  ('api_access', 'API Access', 'REST API access for integrations', 'enterprise'),
  ('priority_support', 'Priority Support', 'Priority customer support', 'enterprise')
ON CONFLICT (feature_key) DO NOTHING;

-- Create audit_logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_created ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_action ON audit_logs(tenant_id, action, created_at DESC);

-- Create inventory_products indexes
CREATE INDEX IF NOT EXISTS idx_inventory_products_tenant ON inventory_products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_products_tenant_category ON inventory_products(tenant_id, category);
CREATE INDEX IF NOT EXISTS idx_inventory_products_sku ON inventory_products(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_products_external ON inventory_products(external_id);

-- Enable RLS
ALTER TABLE inventory_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_gate_definitions ENABLE ROW LEVEL SECURITY;

-- RLS policies for inventory_products
CREATE POLICY "Users can view own tenant inventory" ON inventory_products
  FOR SELECT USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage own tenant inventory" ON inventory_products
  FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- RLS policies for audit_logs
CREATE POLICY "Users can view own tenant audit logs" ON audit_logs
  FOR SELECT USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- RLS policies for feature_gate_definitions (read-only for all, managed by super admin)
CREATE POLICY "Anyone can view feature definitions" ON feature_gate_definitions
  FOR SELECT USING (true);

-- Grant permissions
GRANT SELECT ON feature_gate_definitions TO authenticated;
GRANT ALL ON inventory_products TO authenticated;
GRANT INSERT ON audit_logs TO authenticated;
