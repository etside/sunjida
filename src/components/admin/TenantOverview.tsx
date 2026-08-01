import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, MessageSquare, RefreshCw } from 'lucide-react';
import { tenantApi } from '@/services/tenantApi';
import { supabase } from '@/integrations/supabase/client';

interface TenantWithStats {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
  conversation_count?: number;
  user_count?: number;
}

export function TenantOverview() {
  const [tenants, setTenants] = useState<TenantWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    const { data: tenantData } = await tenantApi.getTenants();

    if (tenantData) {
      // Get stats for each tenant
      const tenantsWithStats = await Promise.all(
        tenantData.map(async (t) => {
          const [convResult, userResult] = await Promise.all([
            supabase
              .from('agent_conversations')
              .select('id', { count: 'exact', head: true })
              .eq('tenant_id', t.id),
            supabase
              .from('profiles')
              .select('id', { count: 'exact', head: true })
              .eq('tenant_id', t.id),
          ]);

          return {
            ...t,
            conversation_count: convResult.count || 0,
            user_count: userResult.count || 0,
          };
        })
      );

      setTenants(tenantsWithStats);
    }

    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Tenant Overview
        </CardTitle>
        <Button variant="outline" size="sm" onClick={loadTenants}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : tenants.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No tenants registered yet.
          </p>
        ) : (
          <div className="space-y-3">
            {tenants.map((tenant) => (
              <div
                key={tenant.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{tenant.name}</h4>
                    <Badge variant={tenant.is_active ? 'default' : 'secondary'}>
                      {tenant.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    /{tenant.slug} — Created {new Date(tenant.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {tenant.user_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {tenant.conversation_count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
