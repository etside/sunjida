import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

interface FeatureGateDefinition {
  feature_key: string;
  name: string;
  description: string | null;
  min_plan: string;
}

interface FeatureGateContextType {
  features: FeatureGateDefinition[];
  isEnabled: (featureKey: string) => boolean;
  loading: boolean;
}

const PLAN_HIERARCHY = ['free', 'starter', 'pro', 'enterprise'];

const FeatureGateContext = createContext<FeatureGateContextType>({
  features: [],
  isEnabled: () => false,
  loading: true,
});

export function FeatureGateProvider({ children }: { children: ReactNode }) {
  const { tenant } = useTenant();
  const [features, setFeatures] = useState<FeatureGateDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    const { data } = await supabase
      .from('feature_gate_definitions')
      .select('*')
      .order('feature_key');

    if (data) setFeatures(data as FeatureGateDefinition[]);
    setLoading(false);
  };

  const isEnabled = (featureKey: string): boolean => {
    if (!tenant) return false;

    const tenantPlan = tenant.plan || 'free';
    const tenantGates = (tenant as Record<string, unknown>).feature_gates as Record<string, boolean> | null;

    // Explicit override in feature_gates takes precedence
    if (tenantGates && featureKey in tenantGates) {
      return tenantGates[featureKey];
    }

    // Check plan hierarchy
    const feature = features.find((f) => f.feature_key === featureKey);
    if (!feature) return false;

    const planIndex = PLAN_HIERARCHY.indexOf(tenantPlan);
    const requiredIndex = PLAN_HIERARCHY.indexOf(feature.min_plan);

    return planIndex >= requiredIndex;
  };

  return (
    <FeatureGateContext.Provider value={{ features, isEnabled, loading }}>
      {children}
    </FeatureGateContext.Provider>
  );
}

export const useFeatureGate = () => useContext(FeatureGateContext);
