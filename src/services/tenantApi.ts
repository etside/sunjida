import { supabase } from '@/integrations/supabase/client';

// Inject tenant header on all requests
const getTenantHeaders = () => {
  const tenantId = localStorage.getItem('tenant_id');
  return tenantId ? { 'X-Tenant-ID': tenantId } : {};
};

// Wrapper around supabase that adds tenant context
export const tenantApi = {
  // Conversations
  async getConversations(limit = 50) {
    const headers = getTenantHeaders();
    const { data, error } = await supabase
      .from('agent_conversations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  async getMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('agent_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    return { data, error };
  },

  // Products
  async getProducts(search?: string, category?: string) {
    let query = supabase
      .from('sharee_products')
      .select('*')
      .eq('is_active', true);

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    if (category) {
      query = query.eq('category_id', category);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },

  async upsertProduct(product: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('sharee_products')
      .upsert(product)
      .select()
      .single();
    return { data, error };
  },

  // Credentials (super admin only)
  async getCredentials(tenantId?: string) {
    let query = supabase.from('credentials').select('*');
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }
    const { data, error } = await query;
    return { data, error };
  },

  async addCredential(credential: {
    tenant_id: string;
    provider: string;
    api_key_encrypted: string;
    account_name?: string;
  }) {
    const { data, error } = await supabase
      .from('credentials')
      .insert(credential)
      .select()
      .single();
    return { data, error };
  },

  // Tenants (super admin only)
  async getTenants() {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async createTenant(tenant: { name: string; slug: string; created_by: string }) {
    const { data, error } = await supabase
      .from('tenants')
      .insert(tenant)
      .select()
      .single();
    return { data, error };
  },

  // Channel configs
  async getChannelConfigs(tenantId: string) {
    const { data, error } = await supabase
      .from('tenant_channel_configs')
      .select('*')
      .eq('tenant_id', tenantId);
    return { data, error };
  },

  async upsertChannelConfig(config: {
    tenant_id: string;
    channel: string;
    channel_id?: string;
    ai_enabled?: boolean;
    sales_daddy_override?: string;
  }) {
    const { data, error } = await supabase
      .from('tenant_channel_configs')
      .upsert(config)
      .select()
      .single();
    return { data, error };
  },

  // Documents (RAG)
  async getDocuments(tenantId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Agent settings
  async getAgentSettings() {
    const { data, error } = await supabase
      .from('agent_settings')
      .select('*')
      .single();
    return { data, error };
  },

  async updateAgentSettings(settings: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('agent_settings')
      .update(settings)
      .eq('id', (await supabase.from('agent_settings').select('id').single()).data?.id)
      .select()
      .single();
    return { data, error };
  },

  // Meta channels
  async getMetaChannels() {
    const { data, error } = await supabase
      .from('meta_channels')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async upsertMetaChannel(channel: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('meta_channels')
      .upsert(channel)
      .select()
      .single();
    return { data, error };
  },

  // Inventory (Sales Daddy)
  async getInventoryProducts(tenantId: string, search?: string) {
    let query = supabase
      .from('inventory_products')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    const { data, error } = await query;
    return { data, error };
  },

  async upsertInventoryProduct(product: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('inventory_products')
      .upsert(product)
      .select()
      .single();
    return { data, error };
  },

  async syncFromGoogleSheets(sheetUrl: string, tenantId: string) {
    const { data, error } = await supabase.functions.invoke('google-sheets-sync', {
      body: { sheetUrl, tenantId },
    });
    return { data, error };
  },

  // Voice Agent
  async processVoice(speechResult: string, tenantId: string, conversationId?: string) {
    const { data, error } = await supabase.functions.invoke('voice-agent', {
      body: { speechResult, tenantId, conversationId },
    });
    return { data, error };
  },

  // Feature Gates
  async getFeatureGates() {
    const { data, error } = await supabase
      .from('feature_gate_definitions')
      .select('*')
      .order('feature_key');
    return { data, error };
  },

  async updateFeatureGates(tenantId: string, featureGates: Record<string, boolean>) {
    const { data, error } = await supabase
      .from('tenants')
      .update({ feature_gates: featureGates })
      .eq('id', tenantId)
      .select()
      .single();
    return { data, error };
  },

  // Audit Logs
  async getAuditLogs(tenantId?: string, action?: string, limit = 50) {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (tenantId) query = query.eq('tenant_id', tenantId);
    if (action) query = query.eq('action', action);

    const { data, error } = await query;
    return { data, error };
  },

  // Super Admin — platform stats
  async getSuperAdminStats() {
    const { data, error } = await supabase.functions.invoke('super-admin', {
      body: { action: 'stats' },
    });
    return { data, error };
  },

  // Audit log insert (for client-side actions)
  async logAudit(entry: {
    tenant_id: string;
    actor: string;
    action: string;
    resource?: string;
    resource_id?: string;
    details?: Record<string, unknown>;
  }) {
    const { error } = await supabase.from('audit_logs').insert(entry);
    return { error };
  },
};
