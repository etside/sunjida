import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Copy, Loader2, Plus, Trash2, ShieldCheck, ArrowLeft } from 'lucide-react';

type Settings = {
  id: string;
  business_name: string;
  greeting_en: string;
  greeting_bn: string;
  instructions: string;
  is_enabled: boolean;
};

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

const makeToken = () =>
  'sd_' +
  Array.from(crypto.getRandomValues(new Uint8Array(18)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const copy = (value: string, label: string) => {
  void navigator.clipboard.writeText(value);
  toast.success(`${label} copied`);
};

export default function AgentSettingsPage() {
  const { isAdmin, loading } = useAuth();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    channel: 'messenger',
    display_name: '',
    page_id: '',
    phone_number_id: '',
    access_token: '',
    app_secret: '',
    verify_token: makeToken(),
  });

  const loadChannels = async () => {
    const { data } = await supabase
      .from('meta_channels')
      .select('id, channel, display_name, page_id, phone_number_id, verify_token, is_active, last_event_at')
      .order('created_at', { ascending: false });
    setChannels((data ?? []) as Channel[]);
  };

  useEffect(() => {
    supabase
      .from('agent_settings')
      .select('id, business_name, greeting_en, greeting_bn, instructions, is_enabled')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setSettings(data as Settings));
    void loadChannels();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Admins only</h1>
        <p className="mt-2 text-muted-foreground">You need an admin account to manage the AI agent.</p>
      </div>
    );
  }

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase
      .from('agent_settings')
      .update({
        business_name: settings.business_name,
        greeting_en: settings.greeting_en,
        greeting_bn: settings.greeting_bn,
        instructions: settings.instructions,
        is_enabled: settings.is_enabled,
      })
      .eq('id', settings.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success('Agent settings saved');
  };

  const addChannel = async () => {
    if (!form.display_name || !form.access_token) {
      toast.error('Name and access token are required');
      return;
    }
    if (form.channel === 'messenger' && !form.page_id) {
      toast.error('Facebook Page ID is required for Messenger');
      return;
    }
    if (form.channel === 'whatsapp' && !form.phone_number_id) {
      toast.error('WhatsApp Phone Number ID is required');
      return;
    }
    const { error } = await supabase.from('meta_channels').insert({
      channel: form.channel,
      display_name: form.display_name,
      page_id: form.page_id || null,
      phone_number_id: form.phone_number_id || null,
      access_token: form.access_token,
      app_secret: form.app_secret || null,
      verify_token: form.verify_token,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Channel connected — now paste the webhook URL into Meta');
    setForm({
      channel: 'messenger',
      display_name: '',
      page_id: '',
      phone_number_id: '',
      access_token: '',
      app_secret: '',
      verify_token: makeToken(),
    });
    void loadChannels();
  };

  const toggleChannel = async (channel: Channel) => {
    await supabase.from('meta_channels').update({ is_active: !channel.is_active }).eq('id', channel.id);
    void loadChannels();
  };

  const removeChannel = async (id: string) => {
    await supabase.from('meta_channels').delete().eq('id', id);
    toast.success('Channel removed');
    void loadChannels();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link to="/admin" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to admin
      </Link>

      <h1 className="text-3xl font-bold text-foreground">AI Agent</h1>
      <p className="mt-2 text-muted-foreground">
        Your bilingual assistant runs on Lovable AI — no API key, no code. Configure it here and connect Messenger or
        WhatsApp from your Meta Business account.
      </p>

      {/* Agent settings */}
      <section className="mt-10 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Assistant</h2>
          {settings && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{settings.is_enabled ? 'Live' : 'Paused'}</span>
              <Switch
                checked={settings.is_enabled}
                onCheckedChange={(v) => setSettings({ ...settings, is_enabled: v })}
              />
            </div>
          )}
        </div>

        {settings && (
          <div className="mt-6 grid gap-4">
            <div>
              <Label htmlFor="business">Business name</Label>
              <Input
                id="business"
                value={settings.business_name}
                onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="g-en">Greeting (English)</Label>
                <Input
                  id="g-en"
                  value={settings.greeting_en}
                  onChange={(e) => setSettings({ ...settings, greeting_en: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="g-bn">Greeting (বাংলা)</Label>
                <Input
                  id="g-bn"
                  value={settings.greeting_bn}
                  onChange={(e) => setSettings({ ...settings, greeting_bn: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="instructions">How the agent should behave</Label>
              <Textarea
                id="instructions"
                rows={5}
                value={settings.instructions}
                onChange={(e) => setSettings({ ...settings, instructions: e.target.value })}
              />
            </div>
            <Button onClick={saveSettings} disabled={saving} className="w-fit">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
            </Button>
          </div>
        )}
      </section>

      {/* Meta connection */}
      <section className="mt-8 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Connect Meta Business (Messenger & WhatsApp)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          In Meta Business Manager open your app → Webhooks, then paste the two values below. Tokens are stored
          server-side and are never sent to website visitors.
        </p>

        <div className="mt-5 grid gap-3">
          <div>
            <Label>Callback / Webhook URL</Label>
            <div className="flex gap-2">
              <Input readOnly value={WEBHOOK_URL} className="font-mono text-xs" />
              <Button type="button" variant="secondary" size="icon" onClick={() => copy(WEBHOOK_URL, 'Webhook URL')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label>Verify token (for the channel you are adding below)</Label>
            <div className="flex gap-2">
              <Input readOnly value={form.verify_token} className="font-mono text-xs" />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => copy(form.verify_token, 'Verify token')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 border-t border-border pt-6">
          <div className="flex gap-2">
            {['messenger', 'whatsapp'].map((c) => (
              <Button
                key={c}
                type="button"
                variant={form.channel === c ? 'default' : 'secondary'}
                onClick={() => setForm({ ...form, channel: c })}
              >
                {c === 'messenger' ? 'Messenger' : 'WhatsApp'}
              </Button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Label</Label>
              <Input
                id="name"
                placeholder="My shop page"
                value={form.display_name}
                onChange={(e) => setForm({ ...form, display_name: e.target.value })}
              />
            </div>
            {form.channel === 'messenger' ? (
              <div>
                <Label htmlFor="page">Facebook Page ID</Label>
                <Input
                  id="page"
                  value={form.page_id}
                  onChange={(e) => setForm({ ...form, page_id: e.target.value })}
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="phone">WhatsApp Phone Number ID</Label>
                <Input
                  id="phone"
                  value={form.phone_number_id}
                  onChange={(e) => setForm({ ...form, phone_number_id: e.target.value })}
                />
              </div>
            )}
            <div>
              <Label htmlFor="token">
                {form.channel === 'messenger' ? 'Page access token' : 'WhatsApp access token'}
              </Label>
              <Input
                id="token"
                type="password"
                value={form.access_token}
                onChange={(e) => setForm({ ...form, access_token: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="secret">Meta app secret</Label>
              <Input
                id="secret"
                type="password"
                value={form.app_secret}
                onChange={(e) => setForm({ ...form, app_secret: e.target.value })}
              />
            </div>
          </div>

          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            The app secret is required — every incoming Meta message is signature-verified before the agent replies, so
            nobody can spoof your webhook.
          </p>

          <Button onClick={addChannel} className="w-fit">
            <Plus className="mr-2 h-4 w-4" /> Connect channel
          </Button>
        </div>
      </section>

      {/* Connected channels */}
      <section className="mt-8 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Connected channels</h2>
        {channels.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No channels connected yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {channels.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-medium text-foreground">
                    {c.display_name}{' '}
                    <span className="text-xs uppercase text-muted-foreground">· {c.channel}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.page_id ?? c.phone_number_id} ·{' '}
                    {c.last_event_at ? `last message ${new Date(c.last_event_at).toLocaleString()}` : 'no messages yet'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={c.is_active} onCheckedChange={() => toggleChannel(c)} />
                  <Button variant="ghost" size="icon" onClick={() => removeChannel(c.id)} aria-label="Remove channel">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
