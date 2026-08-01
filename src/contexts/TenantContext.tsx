import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  sales_daddy_prompt: string | null;
  plan: string;
  feature_gates: Record<string, boolean> | null;
  trial_ends_at: string | null;
  privacy_level: string | null;
  timezone: string;
  is_active: boolean;
}

interface TenantContextType {
  tenant: Tenant | null;
  isSuperAdmin: boolean;
  loading: boolean;
  setTenantId: (id: string) => void;
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  isSuperAdmin: false,
  loading: true,
  setTenantId: () => {},
});

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadTenant = async () => {
      // Check if super admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleData?.role === 'super_admin') {
        setIsSuperAdmin(true);
        setLoading(false);
        return;
      }

      // Load tenant from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (profile?.tenant_id) {
        const { data: tenantData } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', profile.tenant_id)
          .single();

        if (tenantData) {
          setTenant(tenantData as Tenant);
        }
      }

      setLoading(false);
    };

    loadTenant();
  }, [user]);

  const setTenantId = async (id: string) => {
    const { data } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single();

    if (data) {
      setTenant(data as Tenant);
    }
  };

  return (
    <TenantContext.Provider value={{ tenant, isSuperAdmin, loading, setTenantId }}>
      {children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => useContext(TenantContext);
