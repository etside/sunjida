import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/seo/SEOHead';
import { Loader2, ExternalLink, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

type Connection = {
  id: string;
  platform: string;
  page_id: string | null;
  page_name: string | null;
  is_active: boolean;
  scopes: string[];
  connected_at: string;
  last_synced_at: string | null;
  token_expires_at: string | null;
};

const PLATFORMS = [
  {
    value: 'facebook',
    label: 'Facebook Pages',
    description: 'Connect your Facebook business page to receive and reply to Messenger messages.',
    color: 'bg-blue-600',
    requiredScopes: ['pages_show_list', 'pages_read_engagement', 'pages_messaging', 'pages_manage_posts'],
  },
  {
    value: 'instagram',
    label: 'Instagram Business',
    description: 'Connect your Instagram business account for DM and comment management.',
    color: 'bg-pink-600',
    requiredScopes: ['instagram_basic', 'instagram_manage_messages', 'instagram_manage_comments', 'pages_show_list'],
  },
  {
    value: 'whatsapp',
    label: 'WhatsApp Business',
    description: 'Connect your WhatsApp Business number for automated customer conversations.',
    color: 'bg-green-600',
    requiredScopes: ['whatsapp_business_management', 'whatsapp_business_messaging', 'pages_show_list'],
  },
  {
    value: 'google',
    label: 'Google Business',
    description: 'Connect Google Business Profile for reviews, messages, and local search visibility.',
    color: 'bg-red-600',
    requiredScopes: ['business.manageable', 'business.reviews.readonly'],
  },
];

export default function SocialConnections() {
  const { business } = useBusiness();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!business) return;
    const { data } = await supabase
      .from('social_platform_connections')
      .select('id, platform, page_id, page_name, is_active, scopes, connected_at, last_synced_at, token_expires_at')
      .eq('business_id', business.id)
      .order('connected_at', { ascending: false });
    setConnections((data ?? []) as Connection[]);
  }, [business]);

  useEffect(() => {
    void load();
  }, [load]);

  const connect = async (platform: string) => {
    if (!business) return;
    setBusy(platform);
    try {
      const { data, error } = await supabase.functions.invoke('social-connect', {
        body: { action: 'get_url', platform: platform === 'facebook' ? 'meta' : platform, business_id: business.id },
      });
      setBusy(null);
      const err = error?.message ?? (data as { error?: string })?.error;
      if (err) {
        toast({ title: 'Could not start connection', description: err, variant: 'destructive' });
        return;
      }
      const authUrl = (data as { url?: string })?.url;
      if (authUrl) {
        window.open(authUrl, '_blank', 'noopener,noreferrer');
        toast({ title: 'Opening OAuth…', description: 'Complete authorization in the new tab.' });
      }
    } catch {
      setBusy(null);
      toast({ title: 'Connection failed', description: 'Try again or check your platform app settings.', variant: 'destructive' });
    }
  };

  const disconnect = async (connectionId: string) => {
    setBusy(connectionId);
    const { error } = await supabase.functions.invoke('social-connect', {
      body: { action: 'disconnect', connection_id: connectionId },
    });
    setBusy(null);
    if (error) {
      toast({ title: 'Could not disconnect', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Disconnected' });
    void load();
  };

  const reconnect = async (platform: string) => {
    await connect(platform);
  };

  const getConnectionFor = (platform: string) => {
    const p = platform === 'facebook' ? 'meta' : platform;
    return connections.find((c) => c.platform === p);
  };

  return (
    <div className="space-y-6">
      <SEOHead title="Social Connections | SalesDaddy" description="Connect social platforms with visual OAuth authorization." />
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Social Connections</h1>
        <p className="text-sm text-muted-foreground">
          Authorize your social platforms with one-click OAuth. Each connection is scoped to only the permissions needed.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {PLATFORMS.map((p) => {
          const conn = getConnectionFor(p.value);
          const isConnected = !!conn?.is_active;
          const isExpired = conn?.token_expires_at ? new Date(conn.token_expires_at) < new Date() : false;
          const isLoading = busy === p.value || busy === conn?.id;

          return (
            <Card key={p.value}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${p.color}`} />
                    <CardTitle className="text-base">{p.label}</CardTitle>
                  </div>
                  {isConnected ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Connected
                    </Badge>
                  ) : isExpired ? (
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      Expired
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Not connected</Badge>
                  )}
                </div>
                <CardDescription className="mt-1">{p.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Required scopes */}
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Required permissions:</p>
                  <div className="flex flex-wrap gap-1">
                    {p.requiredScopes.map((s) => (
                      <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                    ))}
                  </div>
                </div>

                {/* Connection info */}
                {conn && (
                  <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground space-y-1">
                    {conn.page_name && <p>Page: <span className="font-medium text-foreground">{conn.page_name}</span></p>}
                    <p>Connected: {new Date(conn.connected_at).toLocaleDateString()}</p>
                    {conn.last_synced_at && <p>Last sync: {new Date(conn.last_synced_at).toLocaleDateString()}</p>}
                    {conn.token_expires_at && (
                      <p className={isExpired ? 'text-destructive font-medium' : ''}>
                        Token expires: {new Date(conn.token_expires_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {isConnected ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void reconnect(p.value)}
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <RefreshCw className="mr-1 h-3 w-3" />}
                        Re-authenticate
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void disconnect(conn!.id)}
                        disabled={isLoading}
                      >
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => void connect(p.value)}
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <ExternalLink className="mr-1 h-3 w-3" />}
                      Connect with OAuth
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
