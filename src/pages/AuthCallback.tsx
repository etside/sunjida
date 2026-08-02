import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          toast.error('Authentication failed. Please try again.');
          navigate('/auth');
          return;
        }

        const { data: profile } = await supabase
          .from('tenant_users' as any)
          .select('tenant_id')
          .eq('user_id', session.user.id)
          .single();

        if (profile && (profile as any).tenant_id) {
          navigate('/admin');
        } else {
          navigate('/app/onboarding');
        }
      } catch {
        toast.error('Something went wrong. Please try again.');
        navigate('/auth');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
