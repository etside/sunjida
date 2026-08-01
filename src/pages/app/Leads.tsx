import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/seo/SEOHead';

type Lead = {
  id: string;
  customer_name: string | null;
  customer_contact: string | null;
  channel: string;
  category: string;
  stage: string;
  intent_score: number;
  estimated_value: number | null;
  lang: string;
  summary: string | null;
  created_at: string;
};

type Order = {
  id: string;
  items: unknown;
  total: number;
  currency: string;
  customer_name: string | null;
  customer_phone: string | null;
  push_status: string;
  external_order_ref: string | null;
  created_at: string;
};

const STAGES = ['new', 'engaged', 'qualified', 'converted', 'lost'];

const stageTone = (stage: string) =>
  stage === 'converted' ? 'default' : stage === 'lost' ? 'destructive' : 'secondary';

export default function Leads() {
  const { business } = useBusiness();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const load = useCallback(async () => {
    if (!business) return;
    const [l, o] = await Promise.all([
      supabase
        .from('leads')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(200),
      supabase
        .from('lead_orders')
        .select('id, items, total, currency, customer_name, customer_phone, push_status, external_order_ref, created_at')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(100),
    ]);
    setLeads((l.data ?? []) as Lead[]);
    setOrders((o.data ?? []) as Order[]);
  }, [business]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStage = async (id: string, stage: string) => {
    const { error } = await supabase.from('leads').update({ stage }).eq('id', id);
    if (error) {
      toast({ title: 'Could not update lead', description: error.message, variant: 'destructive' });
      return;
    }
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, stage } : l)));
  };

  const retryOrder = async (orderId: string) => {
    if (!business) return;
    const { data, error } = await supabase.functions.invoke('business-admin', {
      body: { action: 'retry_order', businessId: business.id, orderId },
    });
    if (error || (data as { error?: string })?.error) {
      toast({
        title: 'Delivery failed',
        description: (data as { error?: string })?.error ?? error?.message,
        variant: 'destructive',
      });
      return;
    }
    toast({ title: 'Order delivered to your website' });
    void load();
  };

  return (
    <div className="space-y-6">
      <SEOHead title="Leads & Orders | SalesDaddy" description="Every lead your AI agent captured and every order it closed." />
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Leads &amp; Orders</h1>
        <p className="text-sm text-muted-foreground">
          Auto-categorised by the agent from Messenger, Instagram, WhatsApp and your website.
        </p>
      </div>

      <Tabs defaultValue="leads">
        <TabsList>
          <TabsTrigger value="leads">Leads ({leads.length})</TabsTrigger>
          <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="leads">
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Intent</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Summary</TableHead>
                    <TableHead>Stage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                        No leads yet. They appear the moment a customer messages your agent.
                      </TableCell>
                    </TableRow>
                  )}
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <p className="font-medium text-foreground">{lead.customer_name ?? 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{lead.customer_contact ?? '—'}</p>
                      </TableCell>
                      <TableCell className="capitalize">{lead.channel}</TableCell>
                      <TableCell className="capitalize">{lead.category.replace(/_/g, ' ')}</TableCell>
                      <TableCell>{lead.intent_score}</TableCell>
                      <TableCell>{lead.estimated_value ? `৳${lead.estimated_value}` : '—'}</TableCell>
                      <TableCell className="max-w-xs text-sm text-muted-foreground">{lead.summary ?? '—'}</TableCell>
                      <TableCell>
                        <Select value={lead.stage} onValueChange={(v) => updateStage(lead.id, v)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STAGES.map((s) => (
                              <SelectItem key={s} value={s} className="capitalize">
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Orders pushed to your website</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Your ref</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                        No orders closed yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <p className="font-medium text-foreground">{order.customer_name ?? 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{order.customer_phone ?? '—'}</p>
                      </TableCell>
                      <TableCell>{Array.isArray(order.items) ? order.items.length : 0}</TableCell>
                      <TableCell>
                        {order.currency} {order.total}
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.push_status === 'delivered' ? 'default' : 'destructive'}>
                          {order.push_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {order.external_order_ref ?? '—'}
                      </TableCell>
                      <TableCell>
                        {order.push_status !== 'delivered' && (
                          <Button size="sm" variant="outline" onClick={() => retryOrder(order.id)}>
                            Retry
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
