import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useBusiness } from '@/hooks/useBusiness';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/seo/SEOHead';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);

export default function Onboarding() {
  const { user } = useAuth();
  const { refresh } = useBusiness();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setSaving(true);

    const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;
    const { data, error } = await supabase
      .from('businesses')
      .insert({
        owner_id: user.id,
        name: name.trim(),
        slug,
        website_url: website.trim() || null,
        industry: industry.trim() || null,
        contact_email: user.email ?? null,
      })
      .select('id')
      .single();

    if (error || !data) {
      setSaving(false);
      toast({ title: 'Could not create workspace', description: error?.message, variant: 'destructive' });
      return;
    }

    await supabase.from('business_integrations').insert({ business_id: data.id });
    await supabase.from('agent_settings').insert({ business_id: data.id, business_name: name.trim() });

    await refresh();
    toast({ title: 'Workspace created', description: 'Next: connect your website API.' });
    navigate('/app/integration');
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <SEOHead title="Create your workspace | SalesDaddy" description="Set up your business workspace on SalesDaddy." />
      <Card>
        <CardHeader>
          <CardTitle>Create your business workspace</CardTitle>
          <CardDescription>
            Your agent, leads, catalog and social channels all live inside this workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Business name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Rupali Fashion" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourstore.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Fashion & apparel" />
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? 'Creating…' : 'Create workspace'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
