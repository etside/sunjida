-- ============ BUSINESSES ============
CREATE TABLE public.businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  website_url TEXT,
  contact_email TEXT,
  industry TEXT,
  plan TEXT NOT NULL DEFAULT 'starter',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.businesses TO authenticated;
GRANT ALL ON public.businesses TO service_role;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.owns_business(_business_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = _business_id AND b.owner_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin');
$$;

CREATE POLICY "Owners read own businesses" ON public.businesses FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create own business" ON public.businesses FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners update own business" ON public.businesses FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners delete own business" ON public.businesses FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER businesses_updated_at BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ API KEYS ============
CREATE TABLE public.business_api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Default key',
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX business_api_keys_prefix_idx ON public.business_api_keys(key_prefix);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_api_keys TO authenticated;
GRANT ALL ON public.business_api_keys TO service_role;
ALTER TABLE public.business_api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage api keys" ON public.business_api_keys FOR ALL TO authenticated
  USING (public.owns_business(business_id)) WITH CHECK (public.owns_business(business_id));
CREATE TRIGGER business_api_keys_updated_at BEFORE UPDATE ON public.business_api_keys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ WEBSITE INTEGRATION ============
CREATE TABLE public.business_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL UNIQUE REFERENCES public.businesses(id) ON DELETE CASCADE,
  products_url TEXT,
  product_detail_url TEXT,
  order_create_url TEXT,
  auth_header_name TEXT DEFAULT 'Authorization',
  auth_header_value TEXT,
  extra_headers JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_sync_at TIMESTAMPTZ,
  last_status TEXT,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_integrations TO authenticated;
GRANT ALL ON public.business_integrations TO service_role;
ALTER TABLE public.business_integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage integration" ON public.business_integrations FOR ALL TO authenticated
  USING (public.owns_business(business_id)) WITH CHECK (public.owns_business(business_id));
CREATE TRIGGER business_integrations_updated_at BEFORE UPDATE ON public.business_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ TRAINING DATA ============
CREATE TABLE public.business_training_docs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  doc_type TEXT NOT NULL DEFAULT 'faq',
  content TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'both',
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_training_docs TO authenticated;
GRANT ALL ON public.business_training_docs TO service_role;
ALTER TABLE public.business_training_docs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage training docs" ON public.business_training_docs FOR ALL TO authenticated
  USING (public.owns_business(business_id)) WITH CHECK (public.owns_business(business_id));
CREATE TRIGGER business_training_docs_updated_at BEFORE UPDATE ON public.business_training_docs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PRODUCT CACHE (pulled from the business's own site) ============
CREATE TABLE public.business_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  currency TEXT NOT NULL DEFAULT 'BDT',
  stock_quantity INTEGER,
  image_url TEXT,
  product_url TEXT,
  raw JSONB,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, external_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_products TO authenticated;
GRANT ALL ON public.business_products TO service_role;
ALTER TABLE public.business_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage cached products" ON public.business_products FOR ALL TO authenticated
  USING (public.owns_business(business_id)) WITH CHECK (public.owns_business(business_id));
CREATE TRIGGER business_products_updated_at BEFORE UPDATE ON public.business_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ LEADS ============
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.agent_conversations(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_contact TEXT,
  channel TEXT NOT NULL DEFAULT 'website',
  category TEXT NOT NULL DEFAULT 'other',
  stage TEXT NOT NULL DEFAULT 'new',
  intent_score INTEGER NOT NULL DEFAULT 0,
  estimated_value NUMERIC,
  lang TEXT NOT NULL DEFAULT 'en',
  summary TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage leads" ON public.leads FOR ALL TO authenticated
  USING (public.owns_business(business_id)) WITH CHECK (public.owns_business(business_id));
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ORDERS PUSHED TO THE BUSINESS SITE ============
CREATE TABLE public.lead_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BDT',
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  shipping_address TEXT,
  push_status TEXT NOT NULL DEFAULT 'pending',
  push_attempts INTEGER NOT NULL DEFAULT 0,
  push_response JSONB,
  external_order_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_orders TO authenticated;
GRANT ALL ON public.lead_orders TO service_role;
ALTER TABLE public.lead_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage lead orders" ON public.lead_orders FOR ALL TO authenticated
  USING (public.owns_business(business_id)) WITH CHECK (public.owns_business(business_id));
CREATE TRIGGER lead_orders_updated_at BEFORE UPDATE ON public.lead_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SCOPE EXISTING AGENT TABLES TO A BUSINESS ============
ALTER TABLE public.agent_settings ADD COLUMN business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;
ALTER TABLE public.meta_channels ADD COLUMN business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;
ALTER TABLE public.agent_conversations ADD COLUMN business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;
ALTER TABLE public.agent_conversations ADD COLUMN lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL;
ALTER TABLE public.agent_conversations ADD COLUMN customer_contact TEXT;

CREATE INDEX agent_conversations_business_idx ON public.agent_conversations(business_id);
CREATE INDEX leads_business_stage_idx ON public.leads(business_id, stage);

DROP POLICY IF EXISTS "Anyone can read agent settings" ON public.agent_settings;
DROP POLICY IF EXISTS "Admins manage agent settings" ON public.agent_settings;
CREATE POLICY "Owners manage agent settings" ON public.agent_settings FOR ALL TO authenticated
  USING (business_id IS NULL AND public.has_role(auth.uid(), 'admin') OR public.owns_business(business_id))
  WITH CHECK (business_id IS NULL AND public.has_role(auth.uid(), 'admin') OR public.owns_business(business_id));

DROP POLICY IF EXISTS "Admins manage meta channels" ON public.meta_channels;
CREATE POLICY "Owners manage meta channels" ON public.meta_channels FOR ALL TO authenticated
  USING (business_id IS NULL AND public.has_role(auth.uid(), 'admin') OR public.owns_business(business_id))
  WITH CHECK (business_id IS NULL AND public.has_role(auth.uid(), 'admin') OR public.owns_business(business_id));

DROP POLICY IF EXISTS "Admins read conversations" ON public.agent_conversations;
CREATE POLICY "Owners read conversations" ON public.agent_conversations FOR SELECT TO authenticated
  USING (business_id IS NULL AND public.has_role(auth.uid(), 'admin') OR public.owns_business(business_id));

DROP POLICY IF EXISTS "Admins read messages" ON public.agent_messages;
CREATE POLICY "Owners read messages" ON public.agent_messages FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.agent_conversations c
    WHERE c.id = agent_messages.conversation_id
      AND (c.business_id IS NULL AND public.has_role(auth.uid(), 'admin') OR public.owns_business(c.business_id))
  ));

GRANT ALL ON public.agent_settings TO service_role;
GRANT ALL ON public.meta_channels TO service_role;
GRANT ALL ON public.agent_conversations TO service_role;
GRANT ALL ON public.agent_messages TO service_role;