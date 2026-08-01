import { useCallback, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/seo/SEOHead';

type Doc = {
  id: string;
  title: string;
  doc_type: string;
  content: string;
  lang: string;
  is_enabled: boolean;
};

const TYPES = [
  { value: 'faq', label: 'FAQ' },
  { value: 'policy', label: 'Policy (delivery, refund)' },
  { value: 'script', label: 'Sales script' },
  { value: 'conversation', label: 'Past conversation' },
  { value: 'note', label: 'Note' },
];

export default function Training() {
  const { business } = useBusiness();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('faq');
  const [lang, setLang] = useState('both');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!business) return;
    const { data } = await supabase
      .from('business_training_docs')
      .select('id, title, doc_type, content, lang, is_enabled')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false });
    setDocs((data ?? []) as Doc[]);
  }, [business]);

  useEffect(() => {
    void load();
  }, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !title.trim() || !content.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('business_training_docs').insert({
      business_id: business.id,
      title: title.trim(),
      doc_type: docType,
      lang,
      content: content.trim(),
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Could not save', description: error.message, variant: 'destructive' });
      return;
    }
    setTitle('');
    setContent('');
    toast({ title: 'Training material added' });
    void load();
  };

  const toggle = async (doc: Doc) => {
    await supabase.from('business_training_docs').update({ is_enabled: !doc.is_enabled }).eq('id', doc.id);
    setDocs((prev) => prev.map((d) => (d.id === doc.id ? { ...d, is_enabled: !d.is_enabled } : d)));
  };

  const remove = async (id: string) => {
    await supabase.from('business_training_docs').delete().eq('id', id);
    setDocs((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-6">
      <SEOHead title="Agent training | SalesDaddy" description="Teach your AI sales agent with FAQs, policies and past conversations." />
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Train your agent</h1>
        <p className="text-sm text-muted-foreground">
          Paste FAQs, delivery and refund policies, winning sales scripts, or real past conversations. The agent
          reads this before every reply, in Bangla and English.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add training material</CardTitle>
          <CardDescription>Short, specific entries work better than one long document.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={add} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Delivery time" required />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={lang} onValueChange={setLang}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Bangla + English</SelectItem>
                    <SelectItem value="bn">বাংলা</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder="Inside Dhaka 1-2 days, outside Dhaka 3-4 days. Delivery charge 60/120 BDT."
                required
              />
            </div>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Add to knowledge base'}</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {docs.length === 0 && <p className="text-sm text-muted-foreground">No training material yet.</p>}
        {docs.map((doc) => (
          <Card key={doc.id}>
            <CardContent className="flex items-start justify-between gap-4 py-4">
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <p className="font-medium text-foreground">{doc.title}</p>
                  <Badge variant="outline">{doc.doc_type}</Badge>
                  <Badge variant="secondary">{doc.lang}</Badge>
                </div>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{doc.content}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Switch checked={doc.is_enabled} onCheckedChange={() => toggle(doc)} aria-label="Enabled" />
                <Button size="icon" variant="ghost" onClick={() => remove(doc.id)} aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
