import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, MessageSquare, Users, CheckCircle2, Coins } from 'lucide-react';

type Conversation = { id: string; channel: string; lang: string; created_at: string };
type Message = { conversation_id: string; role: string; content: string; created_at: string };

/** Rough tokenizer: Bangla script is denser per token than latin text. */
const estimateTokens = (text: string) => {
  const bangla = (text.match(/[\u0980-\u09FF]/g) ?? []).length;
  const rest = text.length - bangla;
  return Math.ceil(bangla / 2.2 + rest / 4);
};

const HANDOFF_HINTS = ['connect a human', 'human agent', 'contact our team', 'মানুষ', 'প্রতিনিধি'];

const STOPWORDS = new Set([
  'the', 'and', 'you', 'for', 'are', 'can', 'with', 'this', 'that', 'have', 'what', 'how',
  'is', 'it', 'to', 'a', 'i', 'do', 'my', 'me', 'of', 'in', 'on', 'please', 'hi', 'hello',
  'আমি', 'আপনি', 'কি', 'এই', 'একটা', 'করে', 'হবে', 'আর', 'আছে', 'কিভাবে',
]);

const bdt = (usd: number, rate: number) => `৳${Math.round(usd * rate).toLocaleString('en-US')}`;
const usdFmt = (v: number) => `$${v < 10 ? v.toFixed(2) : Math.round(v).toLocaleString('en-US')}`;

export default function AgentAnalyticsPage() {
  const { isAdmin, loading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Cost model inputs
  const [inputPrice, setInputPrice] = useState(0.30); // USD per 1M input tokens
  const [outputPrice, setOutputPrice] = useState(2.50); // USD per 1M output tokens
  const [customers, setCustomers] = useState(25000);
  const [convPerCustomer, setConvPerCustomer] = useState(1.4);
  const [fxRate, setFxRate] = useState(120);

  useEffect(() => {
    (async () => {
      const [{ data: convs }, { data: msgs }] = await Promise.all([
        supabase.from('agent_conversations').select('id, channel, lang, created_at').order('created_at', { ascending: false }).limit(2000),
        supabase.from('agent_messages').select('conversation_id, role, content, created_at').order('created_at', { ascending: false }).limit(5000),
      ]);
      setConversations((convs ?? []) as Conversation[]);
      setMessages((msgs ?? []) as Message[]);
      setLoadingData(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const byChannel: Record<string, number> = {};
    conversations.forEach((c) => { byChannel[c.channel] = (byChannel[c.channel] ?? 0) + 1; });

    const userMsgs = messages.filter((m) => m.role === 'user');
    const assistantMsgs = messages.filter((m) => m.role === 'assistant');

    const convIds = new Set(conversations.map((c) => c.id));
    const answered = new Set(assistantMsgs.map((m) => m.conversation_id));
    const escalated = new Set(
      assistantMsgs
        .filter((m) => HANDOFF_HINTS.some((h) => m.content.toLowerCase().includes(h)))
        .map((m) => m.conversation_id),
    );
    const resolved = [...convIds].filter((id) => answered.has(id) && !escalated.has(id)).length;

    // Token accounting: prompt tokens include a system+catalog overhead per turn.
    const SYSTEM_OVERHEAD = 900;
    const inputTokens = userMsgs.reduce((sum, m) => sum + estimateTokens(m.content) + SYSTEM_OVERHEAD, 0);
    const outputTokens = assistantMsgs.reduce((sum, m) => sum + estimateTokens(m.content), 0);

    const turns = Math.max(userMsgs.length, 1);
    const convCount = Math.max(conversations.length, 1);

    // Top FAQ keywords, split by script.
    const counts = new Map<string, { count: number; lang: 'bn' | 'en' }>();
    userMsgs.forEach((m) => {
      const lang: 'bn' | 'en' = /[\u0980-\u09FF]/.test(m.content) ? 'bn' : 'en';
      new Set(
        m.content
          .toLowerCase()
          .replace(/[^\p{L}\p{N}\s]/gu, ' ')
          .split(/\s+/)
          .filter((w) => w.length > 2 && !STOPWORDS.has(w)),
      ).forEach((w) => {
        const key = `${lang}:${w}`;
        counts.set(key, { count: (counts.get(key)?.count ?? 0) + 1, lang });
      });
    });
    const top = (lang: 'bn' | 'en') =>
      [...counts.entries()]
        .filter(([, v]) => v.lang === lang)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 8)
        .map(([k, v]) => ({ word: k.split(':')[1], count: v.count }));

    return {
      byChannel,
      conversations: conversations.length,
      userMsgs: userMsgs.length,
      resolutionRate: conversations.length ? Math.round((resolved / conversations.length) * 100) : 0,
      avgInputPerTurn: inputTokens / turns,
      avgOutputPerTurn: outputTokens / turns,
      avgTurnsPerConv: userMsgs.length / convCount,
      topEn: top('en'),
      topBn: top('bn'),
    };
  }, [conversations, messages]);

  const cost = useMemo(() => {
    const perMessage =
      (stats.avgInputPerTurn / 1_000_000) * inputPrice + (stats.avgOutputPerTurn / 1_000_000) * outputPrice;
    const turns = stats.avgTurnsPerConv || 4;
    const perConversation = perMessage * turns;
    const monthlyConversations = customers * convPerCustomer;
    return {
      perMessage,
      perConversation,
      monthlyConversations,
      monthly: perConversation * monthlyConversations,
    };
  }, [stats, inputPrice, outputPrice, customers, convPerCustomer]);

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
        <p className="mt-2 text-muted-foreground">You need an admin account to view agent analytics.</p>
      </div>
    );
  }

  const channelEntries = Object.entries(stats.byChannel).sort((a, b) => b[1] - a[1]);
  const channelTotal = channelEntries.reduce((s, [, v]) => s + v, 0) || 1;

  const cards = [
    { title: 'Conversations', value: stats.conversations, icon: Users },
    { title: 'Customer messages', value: stats.userMsgs, icon: MessageSquare },
    { title: 'Resolution rate', value: `${stats.resolutionRate}%`, icon: CheckCircle2 },
    { title: 'Cost / conversation', value: usdFmt(cost.perConversation), icon: Coins },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link to="/admin" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to admin
      </Link>

      <h1 className="text-3xl font-bold text-foreground">Agent analytics & AI cost</h1>
      <p className="mt-2 text-muted-foreground">
        Live usage from your website, Messenger and WhatsApp conversations, plus a projected monthly AI spend.
      </p>

      {loadingData ? (
        <div className="flex py-16 justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {cards.map((c) => (
              <Card key={c.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
                  <c.icon className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{c.value}</div></CardContent>
              </Card>
            ))}
          </div>

          {/* Cost estimator */}
          <Card className="mt-8">
            <CardHeader><CardTitle>AI cost estimator</CardTitle></CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
                <div>
                  <Label htmlFor="in">Input $/1M tokens</Label>
                  <Input id="in" type="number" step="0.01" value={inputPrice} onChange={(e) => setInputPrice(+e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="out">Output $/1M tokens</Label>
                  <Input id="out" type="number" step="0.01" value={outputPrice} onChange={(e) => setOutputPrice(+e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="cust">Customers / month</Label>
                  <Input id="cust" type="number" value={customers} onChange={(e) => setCustomers(+e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="cpc">Conversations / customer</Label>
                  <Input id="cpc" type="number" step="0.1" value={convPerCustomer} onChange={(e) => setConvPerCustomer(+e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="fx">USD → BDT</Label>
                  <Input id="fx" type="number" value={fxRate} onChange={(e) => setFxRate(+e.target.value)} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Avg tokens / message', value: `${Math.round(stats.avgInputPerTurn)} in · ${Math.round(stats.avgOutputPerTurn)} out` },
                  { label: 'Cost / message', value: `${usdFmt(cost.perMessage)} · ${bdt(cost.perMessage, fxRate)}` },
                  { label: `Cost / conversation (${(stats.avgTurnsPerConv || 4).toFixed(1)} msgs)`, value: `${usdFmt(cost.perConversation)} · ${bdt(cost.perConversation, fxRate)}` },
                  { label: `Projected monthly (${cost.monthlyConversations.toLocaleString('en-US')} convos)`, value: `${usdFmt(cost.monthly)} · ${bdt(cost.monthly, fxRate)}` },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg border border-border bg-secondary/30 p-4">
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">{m.value}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Token averages are measured from your real stored conversations (including the system prompt and live
                catalog sent on every turn). If there is no traffic yet, defaults of 4 messages per conversation are used.
              </p>
            </CardContent>
          </Card>

          {/* Channel volume */}
          <Card className="mt-8">
            <CardHeader><CardTitle>Channel volume</CardTitle></CardHeader>
            <CardContent>
              {channelEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No conversations yet.</p>
              ) : (
                <ul className="grid gap-4">
                  {channelEntries.map(([channel, count]) => (
                    <li key={channel}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize text-foreground">{channel}</span>
                        <span className="text-muted-foreground">{count} · {Math.round((count / channelTotal) * 100)}%</span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-secondary">
                        <div className="h-2 rounded-full bg-primary" style={{ width: `${(count / channelTotal) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Top FAQs */}
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {[
              { title: 'Top topics — English', items: stats.topEn },
              { title: 'Top topics — বাংলা', items: stats.topBn },
            ].map((block) => (
              <Card key={block.title}>
                <CardHeader><CardTitle>{block.title}</CardTitle></CardHeader>
                <CardContent>
                  {block.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Not enough messages yet.</p>
                  ) : (
                    <ul className="divide-y divide-border">
                      {block.items.map((i) => (
                        <li key={i.word} className="flex items-center justify-between py-2 text-sm">
                          <span className="text-foreground">{i.word}</span>
                          <span className="text-muted-foreground">{i.count}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
