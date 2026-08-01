import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type Business = {
  id: string;
  name: string;
  slug: string;
  website_url: string | null;
  contact_email: string | null;
  industry: string | null;
  plan: string;
  is_active: boolean;
};

const ACTIVE_KEY = 'salesdaddy.activeBusiness';

export function useBusiness() {
  const { user, loading: authLoading } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeId, setActiveId] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem(ACTIVE_KEY) : null,
  );
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setBusinesses([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('businesses')
      .select('id, name, slug, website_url, contact_email, industry, plan, is_active')
      .order('created_at', { ascending: true });

    const list = (data ?? []) as Business[];
    setBusinesses(list);
    setActiveId((current) => {
      const valid = current && list.some((b) => b.id === current) ? current : list[0]?.id ?? null;
      if (valid) localStorage.setItem(ACTIVE_KEY, valid);
      return valid;
    });
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    void refresh();
  }, [authLoading, refresh]);

  const selectBusiness = useCallback((id: string) => {
    localStorage.setItem(ACTIVE_KEY, id);
    setActiveId(id);
  }, []);

  return {
    businesses,
    business: businesses.find((b) => b.id === activeId) ?? null,
    activeId,
    selectBusiness,
    loading: authLoading || loading,
    refresh,
  };
}
