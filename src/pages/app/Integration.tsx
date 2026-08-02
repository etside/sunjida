import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/seo/SEOHead';

type Integration = {
  product_feed_url: string | null;
  stock_check_url: string | null;
  order_webhook_url: string | null;
  webhook_secret: string | null;
  last_sync_at: string | null;
  last_sync_status: string | null;
};

const VALID_SCOPES = ["read", "write", "admin", "webhooks", "orders", "products", "leads"];

type ApiKeyRow = {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  rate_limit_per_minute: number;
  expires_at: string | null;
  last_rotated_at: string | null;
  revoked_at: string | null;
  last_used_at: string | null;
  created_at: string;
};

const API_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/business-api`;

export default function Integration() {
  const { business } = useBusiness();
  const [form, setForm] = useState<Integration>({
    product_feed_url: '',
    stock_check_url: '',
    order_webhook_url: '',
    webhook_secret: '',
    last_sync_at: null,
    last_sync_status: null,
  });
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [keyScopes, setKeyScopes] = useState<string[]>(['read', 'write']);
  const [keyRateLimit, setKeyRateLimit] = useState(60);
  const [keyExpires, setKeyExpires] = useState('');

  const load = useCallback(async () => {
    if (!business) return;
    const [integration, keyRows] = await Promise.all([
      supabase
        .from('business_integrations')
        .select('product_feed_url, stock_check_url, order_webhook_url, webhook_secret, last_sync_at, last_sync_status')
        .eq('business_id', business.id)
        .maybeSingle(),
      supabase
        .from('business_api_keys')
        .select('id, name, key_prefix, scopes, rate_limit_per_minute, expires_at, last_rotated_at, revoked_at, last_used_at, created_at')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false }),
    ]);
    if (integration.data) setForm(integration.data as unknown as Integration);
    setKeys((keyRows.data ?? []) as ApiKeyRow[]);
  }, [business]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    setBusy(true);
    const payload = {
      business_id: business.id,
      product_feed_url: form.product_feed_url || null,
      stock_check_url: form.stock_check_url || null,
      order_webhook_url: form.order_webhook_url || null,
      webhook_secret: form.webhook_secret || null,
    };
    const { error } = await supabase
      .from('business_integrations')
      .upsert(payload as never, { onConflict: 'business_id' });
    setBusy(false);
    toast(
      error
        ? { title: 'Could not save', description: error.message, variant: 'destructive' }
        : { title: 'Website connection saved' },
    );
  };

  const call = async (action: string, extra: Record<string, unknown> = {}) => {
    if (!business) return null;
    setBusy(true);
    const { data, error } = await supabase.functions.invoke('business-admin', {
      body: { action, businessId: business.id, ...extra },
    });
    setBusy(false);
    const err = error?.message ?? (data as { error?: string })?.error;
    if (err) {
      toast({ title: 'Request failed', description: err, variant: 'destructive' });
      return null;
    }
    return data as Record<string, unknown>;
  };

  const mintKey = async () => {
    if (!business || !keyName.trim()) {
      toast({ title: 'Key name required', variant: 'destructive' });
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.functions.invoke('api-keys', {
      body: {
        action: 'create',
        business_id: business.id,
        name: keyName.trim(),
        scopes: keyScopes,
        rate_limit_per_minute: keyRateLimit,
        expires_at: keyExpires || null,
      },
    });
    setBusy(false);
    const err = error?.message ?? (data as { error?: string })?.error;
    if (err) {
      toast({ title: 'Could not create key', description: err, variant: 'destructive' });
      return;
    }
    setNewKey(String((data as any)?.apiKey ?? ''));
    setKeyName('');
    toast({ title: 'API key created' });
    void load();
  };

  const rotateKey = async (keyId: string) => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke('api-keys', {
      body: { action: 'rotate', key_id: keyId },
    });
    setBusy(false);
    const err = error?.message ?? (data as { error?: string })?.error;
    if (err) {
      toast({ title: 'Could not rotate key', description: err, variant: 'destructive' });
      return;
    }
    setNewKey(String((data as any)?.apiKey ?? ''));
    toast({ title: 'Key rotated — copy the new key now' });
    void load();
  };

  const revokeKey = async (keyId: string) => {
    setBusy(true);
    const { error } = await supabase.functions.invoke('api-keys', {
      body: { action: 'revoke', key_id: keyId },
    });
    setBusy(false);
    if (error) {
      toast({ title: 'Could not revoke key', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Key revoked' });
    void load();
  };

  const syncNow = async () => {
    const data = await call('sync_products');
    if (data) {
      toast({ title: `Synced ${data.count ?? 0} products` });
      void load();
    }
  };

  const snippet = `<script src="https://salesdaddy.lovable.app/widget.js"
  data-business="${business?.id ?? ''}" defer></script>`;

  const copy = (value: string) => {
    void navigator.clipboard.writeText(value);
    toast({ title: 'Copied' });
  };

  return (
    <div className="space-y-6">
      <SEOHead title="Website API | SalesDaddy" description="Plug SalesDaddy into your website stock, catalog and orders." />
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Website API</h1>
        <p className="text-sm text-muted-foreground">
          Plug-and-play: point us at your product feed so the agent quotes real stock, and give us an order webhook
          so it can place orders straight into your system.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connect your store</CardTitle>
          <CardDescription>Any JSON endpoint works — Shopify, WooCommerce or custom.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-4">
            {([
              ['product_feed_url', 'Product feed URL', 'https://yourstore.com/api/products'],
              ['stock_check_url', 'Live stock check URL (optional)', 'https://yourstore.com/api/stock'],
              ['order_webhook_url', 'Order webhook URL', 'https://yourstore.com/api/salesdaddy/orders'],
              ['webhook_secret', 'Shared webhook secret', 'Used to sign requests we send you'],
            ] as const).map(([field, label, placeholder]) => (
              <div key={field} className="space-y-2">
                <Label htmlFor={field}>{label}</Label>
                <Input
                  id={field}
                  value={form[field] ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  placeholder={placeholder}
                />
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={busy}>Save</Button>
              <Button type="button" variant="outline" onClick={syncNow} disabled={busy}>
                Sync products now
              </Button>
              {form.last_sync_status && (
                <Badge variant={form.last_sync_status === 'ok' ? 'default' : 'destructive'}>
                  Last sync: {form.last_sync_status}
                </Badge>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">API keys</CardTitle>
          <CardDescription>
            Your site calls <code className="text-xs">{API_BASE}</code> with the header{' '}
            <code className="text-xs">X-SalesDaddy-Key</code>. Keys support scopes, rate limiting, and expiration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {newKey && (
            <div className="rounded-lg border border-primary/40 bg-primary/5 p-3">
              <p className="mb-2 text-xs text-muted-foreground">Copy this now — it is shown only once.</p>
              <div className="flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate text-sm">{newKey}</code>
                <Button size="sm" variant="outline" onClick={() => copy(newKey)}>Copy</Button>
              </div>
            </div>
          )}

          {/* Create new key form */}
          <div className="rounded-lg border border-border p-3 space-y-3">
            <p className="text-sm font-medium">Create new API key</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="key-name">Key name</Label>
                <Input id="key-name" value={keyName} onChange={(e) => setKeyName(e.target.value)} placeholder="e.g. Website integration" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="key-rate">Rate limit (req/min)</Label>
                <Input id="key-rate" type="number" min={1} max={1000} value={keyRateLimit} onChange={(e) => setKeyRateLimit(Number(e.target.value))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Scopes</Label>
              <div className="flex flex-wrap gap-2">
                {VALID_SCOPES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setKeyScopes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])}
                    className={`px-2 py-1 rounded text-xs border transition-colors ${keyScopes.includes(s) ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border hover:border-primary/50'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="key-expires">Expiration (optional)</Label>
              <Input id="key-expires" type="datetime-local" value={keyExpires} onChange={(e) => setKeyExpires(e.target.value)} />
            </div>
            <Button onClick={mintKey} disabled={busy || !keyName.trim() || keyScopes.length === 0}>Create API key</Button>
          </div>

          {/* Existing keys list */}
          <div className="space-y-2">
            {keys.length === 0 && <p className="text-sm text-muted-foreground">No keys yet.</p>}
            {keys.map((k) => (
              <div key={k.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{k.name}</p>
                  <code className="text-xs text-muted-foreground">{k.key_prefix}…</code>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(k.scopes ?? []).map((s) => (
                      <Badge key={s} variant="secondary" className="text-[10px] px-1 py-0">{s}</Badge>
                    ))}
                    {k.rate_limit_per_minute && k.rate_limit_per_minute !== 60 && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0">{k.rate_limit_per_minute}/min</Badge>
                    )}
                    {k.expires_at && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0">exp {new Date(k.expires_at).toLocaleDateString()}</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  {k.revoked_at ? (
                    <Badge variant="destructive">Revoked</Badge>
                  ) : (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => rotateKey(k.id)} disabled={busy}>Rotate</Button>
                      <Button size="sm" variant="ghost" onClick={() => revokeKey(k.id)} disabled={busy}>Revoke</Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add the chat widget to your site</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">{snippet}</pre>
          <Button size="sm" variant="outline" onClick={() => copy(snippet)}>Copy snippet</Button>
        </CardContent>
      </Card>
    </div>
  );
}
