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

type Channel = {
  id: string;
  channel: string;
  display_name: string;
  page_id: string | null;
  phone_number_id: string | null;
  verify_token: string;
  is_active: boolean;
  last_event_at: string | null;
};

const WEBHOOK_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/meta-webhook`;

const CHANNELS = [
  { value: 'messenger', label: 'Facebook Messenger' },
  { value: 'instagram', label: 'Instagram Direct' },
  { value: 'whatsapp', label: 'WhatsApp Business' },
];

export default function Channels() {
  const { business } = useBusiness();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [form, setForm] = useState({
    channel: 'messenger',
    display_name: '',
    page_id: '',
    phone_number_id: '',
    access_token: '',
    app_secret: '',
    verify_token: '',
  });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!business) return;
    const { data } = await supabase
      .from('meta_channels')
      .select('id, channel, display_name, page_id, phone_number_id, verify_token, is_active, last_event_at')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false });
    setChannels((data ?? []) as Channel[]);
  }, [business]);

  useEffect(() => {
    void load();
  }, [load]);

  const connect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    setBusy(true);
    const verify = form.verify_token.trim() || `sd_${Math.random().toString(36).slice(2, 12)}`;
    const { error } = await supabase.from('meta_channels').insert({
      business_id: business.id,
      channel: form.channel,
      display_name: form.display_name.trim() || form.channel,
      page_id: form.page_id.trim() || null,
      phone_number_id: form.phone_number_id.trim() || null,
      access_token: form.access_token.trim(),
      app_secret: form.app_secret.trim() || null,
      verify_token: verify,
    });
    setBusy(false);
    if (error) {
      toast({ title: 'Could not connect channel', description: error.message, variant: 'destructive' });
      return;
    }
    setForm({ ...form, display_name: '', page_id: '', phone_number_id: '', access_token: '', app_secret: '', verify_token: '' });
    toast({ title: 'Channel connected', description: 'Now paste the webhook URL and verify token into Meta.' });
    void load();
  };

  const toggle = async (channel: Channel) => {
    await supabase.from('meta_channels').update({ is_active: !channel.is_active }).eq('id', channel.id);
    void load();
  };

  const remove = async (id: string) => {
    await supabase.from('meta_channels').delete().eq('id', id);
    void load();
  };

  const copy = (value: string) => {
    void navigator.clipboard.writeText(value);
    toast({ title: 'Copied' });
  };

  return (
    <div className="space-y-6">
      <SEOHead title="Social channels | SalesDaddy" description="Connect Facebook, Instagram and WhatsApp business pages to your AI agent." />
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Social channels</h1>
        <p className="text-sm text-muted-foreground">
          Connect your Facebook Page, Instagram business account or WhatsApp number. Your agent replies in the
          customer's language automatically.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Webhook details for Meta</CardTitle>
          <CardDescription>Paste these into Meta → App → Webhooks after adding a channel below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded bg-muted px-2 py-1 text-xs">{WEBHOOK_URL}</code>
            <Button size="sm" variant="outline" onClick={() => copy(WEBHOOK_URL)}>Copy</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connect a channel</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={connect} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Channel</Label>
                <Select value={form.channel} onValueChange={(v) => setForm((f) => ({ ...f, channel: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CHANNELS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_name">Display name</Label>
                <Input id="display_name" value={form.display_name} onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))} placeholder="Rupali Fashion Page" />
              </div>
              {form.channel === 'whatsapp' ? (
                <div className="space-y-2">
                  <Label htmlFor="phone_number_id">Phone number ID</Label>
                  <Input id="phone_number_id" value={form.phone_number_id} onChange={(e) => setForm((f) => ({ ...f, phone_number_id: e.target.value }))} />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="page_id">Page / IG account ID</Label>
                  <Input id="page_id" value={form.page_id} onChange={(e) => setForm((f) => ({ ...f, page_id: e.target.value }))} />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="verify_token">Verify token (optional)</Label>
                <Input id="verify_token" value={form.verify_token} onChange={(e) => setForm((f) => ({ ...f, verify_token: e.target.value }))} placeholder="auto-generated if blank" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="access_token">Access token</Label>
                <Input id="access_token" type="password" value={form.access_token} onChange={(e) => setForm((f) => ({ ...f, access_token: e.target.value }))} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="app_secret">App secret</Label>
                <Input id="app_secret" type="password" value={form.app_secret} onChange={(e) => setForm((f) => ({ ...f, app_secret: e.target.value }))} />
              </div>
            </div>
            <Button type="submit" disabled={busy}>Connect channel</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {channels.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <p className="font-medium text-foreground">{c.display_name}</p>
                  <Badge variant="secondary" className="capitalize">{c.channel}</Badge>
                  {!c.is_active && <Badge variant="outline">Paused</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  Verify token: <code>{c.verify_token}</code>
                  {c.last_event_at && ` · last message ${new Date(c.last_event_at).toLocaleString()}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => copy(c.verify_token)}>Copy token</Button>
                <Button size="sm" variant="ghost" onClick={() => toggle(c)}>{c.is_active ? 'Pause' : 'Resume'}</Button>
                <Button size="sm" variant="ghost" onClick={() => remove(c.id)}>Remove</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
