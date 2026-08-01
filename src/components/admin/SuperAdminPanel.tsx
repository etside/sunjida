import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Shield, Building2, Users, MessageSquare, Activity, Settings,
  RefreshCw, Search, ChevronDown, Eye, Edit, Trash2, Plus,
  BarChart3, ClipboardList, AlertTriangle, Key,
} from 'lucide-react';
import { CredentialsManager } from './CredentialsManager';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface PlatformStats {
  total_tenants: number;
  total_users: number;
  total_conversations: number;
  plan_distribution: Record<string, number>;
}

interface TenantRow {
  id: string;
  name: string;
  slug: string;
  plan: string;
  is_active: boolean;
  created_at: string;
  feature_gates: Record<string, boolean> | null;
  user_count?: number;
  conversation_count?: number;
}

interface AuditLog {
  id: string;
  tenant_id: string;
  actor: string;
  action: string;
  resource: string | null;
  resource_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export default function SuperAdminPanel() {
  const { user } = useAuth();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<TenantRow | null>(null);
  const [editPlan, setEditPlan] = useState('');
  const [auditFilter, setAuditFilter] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadStats(), loadTenants(), loadAuditLogs()]);
    setLoading(false);
  };

  const loadStats = async () => {
    const [tenantsRes, usersRes, convsRes] = await Promise.all([
      supabase.from('tenants').select('id, plan', { count: 'exact' }),
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('agent_conversations').select('id', { count: 'exact' }),
    ]);

    const planCounts: Record<string, number> = {};
    tenantsRes.data?.forEach((t) => {
      const plan = t.plan || 'free';
      planCounts[plan] = (planCounts[plan] || 0) + 1;
    });

    setStats({
      total_tenants: tenantsRes.count || 0,
      total_users: usersRes.count || 0,
      total_conversations: convsRes.count || 0,
      plan_distribution: planCounts,
    });
  };

  const loadTenants = async () => {
    const { data } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });

    if (!data) return;

    const enriched = await Promise.all(
      data.map(async (t) => {
        const [convRes, userRes] = await Promise.all([
          supabase.from('agent_conversations').select('id', { count: 'exact', head: true }).eq('tenant_id', t.id),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('tenant_id', t.id),
        ]);
        return {
          ...t,
          conversation_count: convRes.count || 0,
          user_count: userRes.count || 0,
        };
      })
    );

    setTenants(enriched as TenantRow[]);
  };

  const loadAuditLogs = async (action?: string) => {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (action) query = query.eq('action', action);

    const { data } = await query;
    if (data) setAuditLogs(data as AuditLog[]);
  };

  const handleUpdateTenant = async () => {
    if (!selectedTenant) return;
    setSaving(true);

    const { error } = await supabase
      .from('tenants')
      .update({ plan: editPlan })
      .eq('id', selectedTenant.id);

    if (error) {
      toast.error('Failed to update tenant');
    } else {
      await supabase.from('audit_logs').insert({
        tenant_id: selectedTenant.id,
        actor: user?.email || user?.id || 'unknown',
        action: 'tenant_plan_update',
        resource: 'tenants',
        resource_id: selectedTenant.id,
        details: { old_plan: selectedTenant.plan, new_plan: editPlan },
      });

      toast.success(`Updated ${selectedTenant.name} to ${editPlan} plan`);
      setSelectedTenant(null);
      await loadAll();
    }

    setSaving(false);
  };

  const handleToggleActive = async (tenant: TenantRow) => {
    const { error } = await supabase
      .from('tenants')
      .update({ is_active: !tenant.is_active })
      .eq('id', tenant.id);

    if (!error) {
      await supabase.from('audit_logs').insert({
        tenant_id: tenant.id,
        actor: user?.email || user?.id || 'unknown',
        action: tenant.is_active ? 'tenant_deactivated' : 'tenant_activated',
        resource: 'tenants',
        resource_id: tenant.id,
        details: { is_active: !tenant.is_active },
      });

      toast.success(`Tenant ${tenant.is_active ? 'deactivated' : 'activated'}`);
      await loadAll();
    }
  };

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const planColors: Record<string, string> = {
    free: 'bg-gray-100 text-gray-700',
    starter: 'bg-blue-100 text-blue-700',
    pro: 'bg-purple-100 text-purple-700',
    enterprise: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Sales Daddy — Super Admin
          </h1>
          <p className="text-muted-foreground mt-1">Platform-wide management and oversight</p>
        </div>
        <Button variant="outline" onClick={loadAll} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tenants</p>
                  <p className="text-3xl font-bold">{stats.total_tenants}</p>
                </div>
                <Building2 className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Users</p>
                  <p className="text-3xl font-bold">{stats.total_users}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversations</p>
                  <p className="text-3xl font-bold">{stats.total_conversations}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Plan Distribution</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {Object.entries(stats.plan_distribution).map(([plan, count]) => (
                      <Badge key={plan} className={planColors[plan] || ''}>
                        {plan}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
                <BarChart3 className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="tenants">
        <TabsList>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="credentials">
            <Key className="h-4 w-4 mr-1" />
            Credentials
          </TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        {/* Tenants Tab */}
        <TabsContent value="tenants" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tenants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Tenant</th>
                  <th className="text-left p-3 font-medium">Plan</th>
                  <th className="text-right p-3 font-medium">Users</th>
                  <th className="text-right p-3 font-medium">Conversations</th>
                  <th className="text-center p-3 font-medium">Status</th>
                  <th className="text-center p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.map((t) => (
                  <tr key={t.id} className="border-t hover:bg-muted/50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground">/{t.slug}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={planColors[t.plan] || planColors.free}>
                        {t.plan || 'free'}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">{t.user_count}</td>
                    <td className="p-3 text-right">{t.conversation_count}</td>
                    <td className="p-3 text-center">
                      <Badge variant={t.is_active ? 'default' : 'destructive'}>
                        {t.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTenant(t);
                            setEditPlan(t.plan || 'free');
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(t)}
                        >
                          {t.is_active ? (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          ) : (
                            <Activity className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Credentials Tab */}
        <TabsContent value="credentials" className="space-y-4">
          <CredentialsManager />
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="space-y-4">
          <div className="flex items-center gap-2">
            <Select
              value={auditFilter}
              onValueChange={(v) => {
                setAuditFilter(v);
                loadAuditLogs(v || undefined);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Actions</SelectItem>
                <SelectItem value="tenant_update">Tenant Update</SelectItem>
                <SelectItem value="tenant_plan_update">Plan Update</SelectItem>
                <SelectItem value="tenant_activated">Activated</SelectItem>
                <SelectItem value="tenant_deactivated">Deactivated</SelectItem>
                <SelectItem value="inventory_sync_sheets">Sheet Sync</SelectItem>
                <SelectItem value="credential_added">Credential Added</SelectItem>
                <SelectItem value="credential_updated">Credential Updated</SelectItem>
                <SelectItem value="credential_deleted">Credential Deleted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Time</th>
                  <th className="text-left p-3 font-medium">Actor</th>
                  <th className="text-left p-3 font-medium">Action</th>
                  <th className="text-left p-3 font-medium">Resource</th>
                  <th className="text-left p-3 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No audit logs found.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="border-t">
                      <td className="p-3 text-xs">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="p-3">{log.actor}</td>
                      <td className="p-3">
                        <Badge variant="outline">{log.action}</Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{log.resource || '—'}</td>
                      <td className="p-3 text-xs text-muted-foreground max-w-[200px] truncate">
                        {JSON.stringify(log.details)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Tenant Dialog */}
      <Dialog open={!!selectedTenant} onOpenChange={() => setSelectedTenant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tenant — {selectedTenant?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={editPlan} onValueChange={setEditPlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedTenant(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTenant} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
