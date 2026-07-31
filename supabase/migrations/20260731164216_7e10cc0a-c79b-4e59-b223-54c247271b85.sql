CREATE TABLE public.agent_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL DEFAULT 'SalesDaddy',
  greeting_en TEXT NOT NULL DEFAULT 'Hi! I am your SalesDaddy assistant. How can I help you today?',
  greeting_bn TEXT NOT NULL DEFAULT 'হ্যালো! আমি আপনার SalesDaddy সহকারী। কীভাবে সাহায্য করতে পারি?',
  instructions TEXT NOT NULL DEFAULT 'You are a friendly bilingual (Bangla/English) sales assistant for a Bangladeshi commerce brand. Answer product, price, stock, delivery and order questions. Always reply in the same language the customer used.',
  model TEXT NOT NULL DEFAULT 'google/gemini-3.6-flash',
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.agent_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_settings TO authenticated;
GRANT ALL ON public.agent_settings TO service_role;
ALTER TABLE public.agent_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read agent settings" ON public.agent_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage agent settings" ON public.agent_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.agent_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel TEXT NOT NULL DEFAULT 'website',
  external_id TEXT,
  customer_name TEXT,
  lang TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX agent_conversations_channel_external_idx ON public.agent_conversations (channel, external_id) WHERE external_id IS NOT NULL;
GRANT SELECT ON public.agent_conversations TO authenticated;
GRANT ALL ON public.agent_conversations TO service_role;
ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read conversations" ON public.agent_conversations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.agent_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.agent_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX agent_messages_conversation_idx ON public.agent_messages (conversation_id, created_at);
GRANT SELECT ON public.agent_messages TO authenticated;
GRANT ALL ON public.agent_messages TO service_role;
ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read messages" ON public.agent_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.meta_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel TEXT NOT NULL,
  display_name TEXT NOT NULL,
  page_id TEXT,
  phone_number_id TEXT,
  access_token TEXT NOT NULL,
  app_secret TEXT,
  verify_token TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_event_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meta_channels TO authenticated;
GRANT ALL ON public.meta_channels TO service_role;
ALTER TABLE public.meta_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage meta channels" ON public.meta_channels FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER agent_settings_updated_at BEFORE UPDATE ON public.agent_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER agent_conversations_updated_at BEFORE UPDATE ON public.agent_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER meta_channels_updated_at BEFORE UPDATE ON public.meta_channels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.agent_settings DEFAULT VALUES;