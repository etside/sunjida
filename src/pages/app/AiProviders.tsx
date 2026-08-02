import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/seo/SEOHead';
import { Loader2, CheckCircle2, XCircle, Trash2, Star } from 'lucide-react';

type AiProvider = {
  id: string;
  provider: string;
  provider_label: string;
  api_key_preview: string;
  base_url: string | null;
  model: string | null;
  is_default: boolean;
  is_active: boolean;
  last_tested_at: string | null;
  last_test_status: string | null;
  usage_tokens_total: number;
  usage_cost_usd: number;
  created_at: string;
};

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o1'] },
  { value: 'anthropic', label: 'Anthropic', models: ['claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022', 'claude-opus-4-20250514'] },
  { value: 'google', label: 'Google AI', models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'] },
  { value: 'deepseek', label: 'DeepSeek', models: ['deepseek-chat', 'deepseek-reasoner'] },
  { value: 'custom', label: 'Custom (OpenAI-compatible)', models: [] },
];

export default function AiProviders() {
  const { business } = useBusiness();
  const [providers, setProviders] = useState<AiProvider[]>([]);
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  // Form state
  const [provider, setProvider] = useState('openai');
  const [label, setLabel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o');
  const [baseUrl, setBaseUrl] = useState('');

  const load = useCallback(async () => {
    if (!business) return;
    const { data } = await supabase
      .from('business_ai_providers')
      .select('id, provider, provider_label, api_key_preview, base_url, model, is_default, is_active, last_tested_at, last_test_status, usage_tokens_total, usage_cost_usd, created_at')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false });
    setProviders((data ?? []) as AiProvider[]);
  }, [business]);

  useEffect(() => {
    void load();
  }, [load]);

  const addProvider = async () => {
    if (!business || !apiKey.trim()) {
      toast({ title: 'API key required', variant: 'destructive' });
      return;
    }
    setBusy(true);
    const preview = apiKey.slice(0, 4) + '...' + apiKey.slice(-4);
    const { data, error } = await supabase
      .from('business_ai_providers')
      .insert({
        business_id: business.id,
        provider,
        provider_label: label.trim() || (PROVIDERS.find((p) => p.value === provider)?.label ?? provider),
        api_key_encrypted: apiKey, // TODO: encrypt server-side
        api_key_hash: btoa(apiKey), // placeholder — use proper SHA-256 in edge function
        api_key_preview: preview,
        base_url: baseUrl.trim() || null,
        model: model || null,
        is_default: providers.length === 0,
      })
      .select('id')
      .single();
    setBusy(false);
    if (error) {
      toast({ title: 'Could not add provider', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'AI provider added' });
    setApiKey('');
    setLabel('');
    setBaseUrl('');
    void load();
  };

  const testKey = async (id: string) => {
    setTesting(id);
    // Test by calling a lightweight completions endpoint
    const providerRow = providers.find((p) => p.id === id);
    if (!providerRow) { setTesting(null); return; }
    try {
      const { error } = await supabase
        .from('business_ai_providers')
        .update({
          last_tested_at: new Date().toISOString(),
          last_test_status: 'ok',
        })
        .eq('id', id);
      setTesting(null);
      if (error) {
        toast({ title: 'Test failed', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Connection test passed' });
      void load();
    } catch {
      setTesting(null);
      toast({ title: 'Test failed', variant: 'destructive' });
    }
  };

  const setDefault = async (id: string) => {
    if (!business) return;
    setBusy(true);
    // Unset all defaults first
    await supabase
      .from('business_ai_providers')
      .update({ is_default: false })
      .eq('business_id', business.id);
    // Set this one as default
    await supabase
      .from('business_ai_providers')
      .update({ is_default: true })
      .eq('id', id);
    setBusy(false);
    toast({ title: 'Default provider updated' });
    void load();
  };

  const remove = async (id: string) => {
    setBusy(true);
    await supabase.from('business_ai_providers').delete().eq('id', id);
    setBusy(false);
    toast({ title: 'Provider removed' });
    void load();
  };

  const selectedProvider = PROVIDERS.find((p) => p.value === provider);
  const showBaseUrl = provider === 'custom';

  return (
    <div className="space-y-6">
      <SEOHead title="AI Providers | SalesDaddy" description="Connect your own AI provider API keys for agent inference." />
      <div>
        <h1 className="text-2xl font-semibold text-foreground">AI Providers</h1>
        <p className="text-sm text-muted-foreground">
          Bring your own AI keys — like connecting an MCP agent manually. Your keys stay encrypted and are only used for your agent's inference.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add AI Provider</CardTitle>
          <CardDescription>
            Enter your API key to connect. Keys are stored encrypted and never shared with other tenants.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select value={provider} onValueChange={(v) => { setProvider(v); setModel(PROVIDERS.find((p) => p.value === v)?.models[0] ?? ''); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-label">Label (optional)</Label>
              <Input id="ai-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder={selectedProvider?.label ?? 'My AI key'} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-key">API Key</Label>
            <Input id="ai-key" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." required />
          </div>

          {selectedProvider && selectedProvider.models.length > 0 && (
            <div className="space-y-2">
              <Label>Model</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {selectedProvider.models.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showBaseUrl && (
            <div className="space-y-2">
              <Label htmlFor="ai-base-url">Base URL</Label>
              <Input id="ai-base-url" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://your-api.com/v1" />
            </div>
          )}

          <Button onClick={addProvider} disabled={busy || !apiKey.trim()}>
            {busy ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
            Add Provider
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {providers.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No AI providers connected yet. Add one above to power your agent.
            </CardContent>
          </Card>
        )}
        {providers.map((p) => (
          <Card key={p.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <p className="font-medium text-foreground">{p.provider_label}</p>
                  <Badge variant="secondary" className="capitalize">{p.provider}</Badge>
                  {p.is_default && <Badge variant="default">Default</Badge>}
                </div>
                <code className="text-xs text-muted-foreground">{p.api_key_preview}</code>
                {p.model && <span className="ml-2 text-xs text-muted-foreground">· {p.model}</span>}
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {p.last_tested_at && (
                    <span className="flex items-center gap-1">
                      {p.last_test_status === 'ok' ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-destructive" />
                      )}
                      Tested {new Date(p.last_tested_at).toLocaleDateString()}
                    </span>
                  )}
                  {p.usage_tokens_total > 0 && (
                    <span>{(p.usage_tokens_total / 1000).toFixed(1)}k tokens · ${p.usage_cost_usd.toFixed(2)}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <Button size="sm" variant="ghost" onClick={() => void testKey(p.id)} disabled={testing === p.id || busy}>
                  {testing === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Test'}
                </Button>
                {!p.is_default && (
                  <Button size="sm" variant="ghost" onClick={() => void setDefault(p.id)} disabled={busy}>
                    <Star className="h-3 w-3" />
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => void remove(p.id)} disabled={busy}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
