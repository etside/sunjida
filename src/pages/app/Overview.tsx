import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SEOHead } from '@/components/seo/SEOHead';

type Stats = {
  conversations: number;
  leads: number;
  converted: number;
  orders: number;
  products: number;
  byChannel: Record<string, number>;
  byCategory: Record<string, number>;
};

const EMPTY: Stats = {
  conversations: 0,
  leads: 0,
  converted: 0,
  orders: 0,
  products: 0,
  byChannel: {},
  byCategory: {},
};

const LABELS: Record<string, string> = {
  product_inquiry: 'Product inquiry',
  price_inquiry: 'Price inquiry',
  stock_inquiry: 'Stock inquiry',
  order_intent: 'Order intent',
  complaint: 'Complaint',
  support: 'Support',
  spam: 'Spam',
  other: 'Other',
};

export default function Overview() {
  const { business } = useBusiness();
  const [stats, setStats] = useState<Stats>(EMPTY);

  useEffect(() => {
    if (!business) return;
    let cancelled = false;

    (async () => {
      const [convos, leads, orders, products] = await Promise.all([
        supabase.from('agent_conversations').select('channel').eq('business_id', business.id),
        supabase.from('leads').select('stage, channel, category').eq('business_id', business.id),
        supabase.from('lead_orders').select('id').eq('business_id', business.id),
        supabase.from('business_products').select('id').eq('business_id', business.id),
      ]);
      if (cancelled) return;

      const leadRows = leads.data ?? [];
      const byChannel: Record<string, number> = {};
      const byCategory: Record<string, number> = {};
      for (const l of leadRows) {
        byChannel[l.channel] = (byChannel[l.channel] ?? 0) + 1;
        byCategory[l.category] = (byCategory[l.category] ?? 0) + 1;
      }

      setStats({
        conversations: convos.data?.length ?? 0,
        leads: leadRows.length,
        converted: leadRows.filter((l) => l.stage === 'converted').length,
        orders: orders.data?.length ?? 0,
        products: products.data?.length ?? 0,
        byChannel,
        byCategory,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [business]);

  const rate = stats.leads ? Math.round((stats.converted / stats.leads) * 100) : 0;

  const cards = [
    { label: 'Conversations', value: stats.conversations },
    { label: 'Leads captured', value: stats.leads },
    { label: 'Converted', value: `${stats.converted} (${rate}%)` },
    { label: 'Orders pushed', value: stats.orders },
    { label: 'Products in sync', value: stats.products },
  ];

  return (
    <div className="space-y-6">
      <SEOHead title="Dashboard | SalesDaddy" description="Your AI sales agent performance at a glance." />
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{business?.name ?? 'Overview'}</h1>
        <p className="text-sm text-muted-foreground">Everything your agent handled across channels.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="pb-2">
              <CardDescription>{c.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-foreground">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leads by channel</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.keys(stats.byChannel).length === 0 && (
              <p className="text-sm text-muted-foreground">No leads yet.</p>
            )}
            {Object.entries(stats.byChannel).map(([channel, count]) => (
              <Badge key={channel} variant="secondary" className="capitalize">
                {channel}: {count}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inquiry categories</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.keys(stats.byCategory).length === 0 && (
              <p className="text-sm text-muted-foreground">No leads yet.</p>
            )}
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <Badge key={category} variant="outline">
                {LABELS[category] ?? category}: {count}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
