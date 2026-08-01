import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Plug, Share2, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBusiness } from '@/hooks/useBusiness';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/app', end: true, label: 'Overview', icon: LayoutDashboard },
  { to: '/app/leads', label: 'Leads & Orders', icon: Users },
  { to: '/app/training', label: 'Training', icon: BookOpen },
  { to: '/app/integration', label: 'Website API', icon: Plug },
  { to: '/app/channels', label: 'Social Channels', icon: Share2 },
];

export function AppLayout() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { businesses, business, selectBusiness, loading } = useBusiness();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!loading && user && businesses.length === 0) navigate('/app/onboarding');
  }, [loading, user, businesses.length, navigate]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 lg:flex-row">
      <aside className="lg:w-64 lg:shrink-0">
        <div className="mb-4">
          <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Workspace</p>
          {businesses.length > 0 && (
            <Select value={business?.id ?? undefined} onValueChange={selectBusiness}>
              <SelectTrigger>
                <SelectValue placeholder="Select business" />
              </SelectTrigger>
              <SelectContent>
                {businesses.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {NAV.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <Button variant="ghost" size="sm" className="mt-4 w-full justify-start" onClick={signOut}>
          Sign out
        </Button>
      </aside>

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
