import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LayoutDashboard, Package, MessageSquare, BarChart3,
  Settings, RefreshCw, TrendingUp, Clock, Users,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useFeatureGate } from '@/contexts/FeatureGateContext';
import { InventoryPanel } from '@/components/dashboard/InventoryPanel';
import { SocialConnect } from '@/components/dashboard/SocialConnect';
import { TrainingUpload } from '@/components/dashboard/TrainingUpload';
import { UnifiedInbox } from '@/components/dashboard/UnifiedInbox';

interface TenantStats {
  product_count: number;
  conversation_count: number;
  user_count: number;
  recent_conversations: number;
}

export default function ClientPanel() {
  const { tenant } = useTenant();
  const { isEnabled } = useFeatureGate();
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenant) loadTenantStats();
  }, [tenant]);

  const loadTenantStats = async () => {
    if (!tenant) return;
    setLoading(true);

    const [productsRes, convsRes, usersRes, recentRes] = await Promise.all([
      supabase.from('sharee_products').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('agent_conversations').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
      supabase
        .from('agent_conversations')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    setStats({
      product_count: productsRes.count || 0,
      conversation_count: convsRes.count || 0,
      user_count: usersRes.count || 0,
      recent_conversations: recentRes.count || 0,
    });

    setLoading(false);
  };

  if (!tenant) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">No tenant configured. Please complete onboarding first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6" />
            {tenant.name} — Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Plan: <Badge className="ml-1">{tenant.plan || 'free'}</Badge>
          </p>
        </div>
        <Button variant="outline" onClick={loadTenantStats} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Products</p>
                  <p className="text-2xl font-bold">{stats.product_count}</p>
                </div>
                <Package className="h-6 w-6 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversations</p>
                  <p className="text-2xl font-bold">{stats.conversation_count}</p>
                </div>
                <MessageSquare className="h-6 w-6 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Users</p>
                  <p className="text-2xl font-bold">{stats.user_count}</p>
                </div>
                <Users className="h-6 w-6 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold">{stats.recent_conversations}</p>
                </div>
                <TrendingUp className="h-6 w-6 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Feature-gated tabs */}
      <Tabs defaultValue="inventory">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          {isEnabled('social_connect') && (
            <TabsTrigger value="social">Social</TabsTrigger>
          )}
          {isEnabled('training_rag') && (
            <TabsTrigger value="training">Training</TabsTrigger>
          )}
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          {isEnabled('inventory_sync') ? (
            <InventoryPanel />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Inventory Sync requires the Starter plan or higher.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {isEnabled('social_connect') && (
          <TabsContent value="social">
            <SocialConnect />
          </TabsContent>
        )}

        {isEnabled('training_rag') && (
          <TabsContent value="training">
            <TrainingUpload />
          </TabsContent>
        )}

        <TabsContent value="inbox">
          <UnifiedInbox />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Agent Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Customize your AI agent's behavior and responses from the{' '}
                <a href="/admin/agent" className="text-primary underline">
                  Agent Settings
                </a>{' '}
                page.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
