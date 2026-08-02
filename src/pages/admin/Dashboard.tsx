import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BarChart3, Settings, Mail, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSuperPin } from '@/hooks/useSuperPin';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const { logout: pinLogout } = useSuperPin();
  const [stats, setStats] = useState({
    tenants: 0,
    users: 0,
    messages: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [tenants, users, messages] = await Promise.all([
      supabase.from('tenants' as any).select('id', { count: 'exact', head: true }),
      supabase.from('tenant_users' as any).select('id', { count: 'exact', head: true }),
      supabase.from('contact_submissions').select('id', { count: 'exact', head: true }).eq('is_read', false),
    ]);

    setStats({
      tenants: tenants.count || 0,
      users: users.count || 0,
      messages: messages.count || 0,
    });
  };

  const handleSignOut = () => {
    pinLogout();
    signOut();
  };

  const statCards = [
    { title: 'Tenants', value: stats.tenants, icon: Users, color: 'text-blue-500' },
    { title: 'Users', value: stats.users, icon: BarChart3, color: 'text-green-500' },
    { title: 'New Messages', value: stats.messages, icon: Mail, color: 'text-orange-500' },
  ];

  return (
    <>
      <SEOHead title="Admin Dashboard | SalesDaddy" description="SalesDaddy admin control panel" />

      <div className="min-h-screen bg-secondary/20">
        <header className="bg-background border-b border-border sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-light tracking-wide">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {statCards.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Welcome to the SalesDaddy admin panel. Manage tenants, users, and platform settings from here.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}
