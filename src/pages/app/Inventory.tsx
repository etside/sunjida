import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/seo/SEOHead';
import {
  Package, Plus, Upload, Download, Trash2, Edit, Key, Webhook, RefreshCw,
  Search, MoreHorizontal, Copy, Check, AlertTriangle,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Product = {
  id: string;
  tenant_id: string;
  name: string;
  sku: string | null;
  description: string | null;
  price: number;
  stock_quantity: number;
  category: string | null;
  attributes: Record<string, unknown>;
  source: string;
  external_id: string | null;
  synced_at: string | null;
  created_at: string;
};

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

type WebhookRow = {
  id: string;
  channel: string;
  webhook_url: string;
  webhook_secret: string;
  events: string[];
  is_active: boolean;
  last_triggered_at: string | null;
  failure_count: number;
  created_at: string;
};

type ProductForm = {
  name: string;
  sku: string;
  description: string;
  price: string;
  stock_quantity: string;
  category: string;
};

const EMPTY_FORM: ProductForm = { name: '', sku: '', description: '', price: '0', stock_quantity: '0', category: '' };

const SAMPLE_CSV = `name,sku,description,price,stock_quantity,category
Premium Widget,PW-001,High quality widget,29.99,150,Electronics
Basic Gadget,BG-002,Entry level gadget,9.99,500,Electronics
Deluxe Package,DP-003,Premium bundle deal,99.99,25,Bundles
Organic Soap,OS-004,Natural handmade soap,14.99,200,Health & Beauty
Wireless Charger,WC-005,Fast wireless charging pad,39.99,75,Electronics`;

const VALID_SCOPES = ['read', 'write', 'admin', 'webhooks', 'orders', 'products', 'leads'];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Inventory() {
  const { business } = useBusiness();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  /* ---------- product state ---------- */
  const [products, setProducts] = useState<Product[]>([]);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [csvBusy, setCsvBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  /* ---------- API key state ---------- */
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>(['read', 'write']);
  const [keyBusy, setKeyBusy] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  /* ---------- webhook state ---------- */
  const [webhooks, setWebhooks] = useState<WebhookRow[]>([]);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookChannel, setWebhookChannel] = useState('custom');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [webhookBusy, setWebhookBusy] = useState(false);

  /* ================================================================ */
  /*  Data loading                                                     */
  /* ================================================================ */

  const loadTenantId = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles' as any)
      .select('tenant_id')
      .eq('id', user.id)
      .single();
    if (data) setTenantId((data as any).tenant_id);
  }, [user]);

  const loadProducts = useCallback(async () => {
    if (!tenantId) return;
    const { data, error } = await supabase
      .from('inventory_products' as any)
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Failed to load products', description: error.message, variant: 'destructive' });
      return;
    }
    setProducts((data ?? []) as unknown as Product[]);
  }, [tenantId]);

  const loadKeys = useCallback(async () => {
    if (!business) return;
    const { data } = await supabase
      .from('business_api_keys')
      .select('*')
      .eq('business_id', business.id)
      .is('revoked_at', null)
      .order('created_at', { ascending: false });
    setKeys((data ?? []) as ApiKeyRow[]);
  }, [business]);

  const loadWebhooks = useCallback(async () => {
    if (!business) return;
    const { data } = await supabase
      .from('webhook_configurations')
      .select('*')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false });
    setWebhooks((data ?? []) as unknown as WebhookRow[]);
  }, [business]);

  useEffect(() => { void loadTenantId(); }, [loadTenantId]);
  useEffect(() => { void loadProducts(); }, [loadProducts]);
  useEffect(() => { void loadKeys(); }, [loadKeys]);
  useEffect(() => { void loadWebhooks(); }, [loadWebhooks]);

  /* ================================================================ */
  /*  Product CRUD                                                     */
  /* ================================================================ */

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[];

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setFormOpen(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      sku: p.sku ?? '',
      description: p.description ?? '',
      price: String(p.price),
      stock_quantity: String(p.stock_quantity),
      category: p.category ?? '',
    });
    setFormOpen(true);
  };

  const saveProduct = async () => {
    if (!tenantId || !form.name.trim()) {
      toast({ title: 'Product name is required', variant: 'destructive' });
      return;
    }
    setBusy(true);
    const payload = {
      tenant_id: tenantId,
      name: form.name.trim(),
      sku: form.sku.trim() || null,
      description: form.description.trim() || null,
      price: parseFloat(form.price) || 0,
      stock_quantity: parseInt(form.stock_quantity, 10) || 0,
      category: form.category.trim() || null,
      source: 'manual' as const,
      created_by: user?.id ?? null,
    };

    if (editing) {
      const { error } = await supabase
        .from('inventory_products' as any)
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', editing.id);
      if (error) {
        toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
        setBusy(false);
        return;
      }
      toast({ title: 'Product updated' });
    } else {
      const { error } = await supabase
        .from('inventory_products' as any)
        .insert(payload);
      if (error) {
        toast({ title: 'Create failed', description: error.message, variant: 'destructive' });
        setBusy(false);
        return;
      }
      toast({ title: 'Product added' });
    }
    setBusy(false);
    setFormOpen(false);
    void loadProducts();
  };

  const deleteProduct = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    const { error } = await supabase
      .from('inventory_products' as any)
      .delete()
      .eq('id', deleteTarget.id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Product deleted' });
      void loadProducts();
    }
    setBusy(false);
    setDeleteTarget(null);
  };

  /* ================================================================ */
  /*  CSV Upload                                                       */
  /* ================================================================ */

  const parseCsv = (text: string): ProductForm[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    return lines.slice(1).map((line) => {
      const cols = line.split(',');
      const row: ProductForm = { ...EMPTY_FORM };
      headers.forEach((h, i) => {
        const val = (cols[i] ?? '').trim();
        if (h === 'name') row.name = val;
        else if (h === 'sku') row.sku = val;
        else if (h === 'description') row.description = val;
        else if (h === 'price') row.price = val;
        else if (h === 'stock_quantity' || h === 'stock') row.stock_quantity = val;
        else if (h === 'category') row.category = val;
      });
      return row;
    }).filter((r) => r.name);
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tenantId) return;
    setCsvBusy(true);
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length === 0) {
        toast({ title: 'No valid rows found', description: 'Check CSV format and try again.', variant: 'destructive' });
        setCsvBusy(false);
        return;
      }
      const payload = rows.map((r) => ({
        tenant_id: tenantId,
        name: r.name,
        sku: r.sku || null,
        description: r.description || null,
        price: parseFloat(r.price) || 0,
        stock_quantity: parseInt(r.stock_quantity, 10) || 0,
        category: r.category || null,
        source: 'csv' as const,
        created_by: user?.id ?? null,
      }));
      const { error } = await supabase
        .from('inventory_products' as any)
        .insert(payload);
      if (error) {
        toast({ title: 'CSV import failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: `${rows.length} products imported` });
        void loadProducts();
      }
    } catch {
      toast({ title: 'Could not read CSV file', variant: 'destructive' });
    }
    setCsvBusy(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-products.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ================================================================ */
  /*  API Key management                                               */
  /* ================================================================ */

  const generateApiKey = async () => {
    if (!business || !newKeyName.trim()) {
      toast({ title: 'Key name is required', variant: 'destructive' });
      return;
    }
    setKeyBusy(true);
    const prefix = 'sd_' + Math.random().toString(36).slice(2, 8);
    const secret = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    const rawKey = `${prefix}.${secret}`;

    // Hash for storage — use simple hash since Web Crypto may not be available in all contexts
    let keyHash = rawKey;
    try {
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        const enc = new TextEncoder().encode(rawKey);
        const buf = await crypto.subtle.digest('SHA-256', enc);
        keyHash = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
      }
    } catch { /* fallback to raw key */ }

    const { error } = await supabase
      .from('business_api_keys')
      .insert({
        business_id: business.id,
        name: newKeyName.trim(),
        key_prefix: prefix,
        key_hash: keyHash,
        scopes: newKeyScopes,
        rate_limit_per_minute: 60,
      });
    if (error) {
      toast({ title: 'Failed to create key', description: error.message, variant: 'destructive' });
    } else {
      setRevealedKey(rawKey);
      toast({ title: 'API key created — copy it now, it won\'t be shown again' });
      setNewKeyName('');
      void loadKeys();
    }
    setKeyBusy(false);
  };

  const revokeKey = async (id: string) => {
    const { error } = await supabase
      .from('business_api_keys')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      toast({ title: 'Revoke failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Key revoked' });
      void loadKeys();
    }
  };

  const copyKey = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  /* ================================================================ */
  /*  Webhook management                                               */
  /* ================================================================ */

  const saveWebhook = async () => {
    if (!business) return;
    if (!webhookUrl.trim()) {
      toast({ title: 'Webhook URL is required', variant: 'destructive' });
      return;
    }
    setWebhookBusy(true);
    const secret = webhookSecret.trim() || crypto.randomUUID().slice(0, 16);
    const { error } = await supabase
      .from('webhook_configurations')
      .upsert({
        business_id: business.id,
        channel: webhookChannel,
        webhook_url: webhookUrl.trim(),
        webhook_secret: secret,
        events: ['message', 'order', 'product_update'],
        is_active: true,
      }, { onConflict: 'business_id,channel' });
    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Webhook saved' });
      setWebhookUrl('');
      setWebhookSecret('');
      void loadWebhooks();
    }
    setWebhookBusy(false);
  };

  const deleteWebhook = async (id: string) => {
    const { error } = await supabase
      .from('webhook_configurations')
      .delete()
      .eq('id', id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Webhook removed' });
      void loadWebhooks();
    }
  };

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <div className="space-y-6">
      <SEOHead title="Inventory — SalesDaddy" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory &amp; Stock</h1>
          <p className="text-sm text-muted-foreground">Manage products, API access, and webhook integrations.</p>
        </div>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products"><Package className="mr-1 h-4 w-4" /> Products</TabsTrigger>
          <TabsTrigger value="api"><Key className="mr-1 h-4 w-4" /> API Tokens</TabsTrigger>
          <TabsTrigger value="webhooks"><Webhook className="mr-1 h-4 w-4" /> Webhooks</TabsTrigger>
        </TabsList>

        {/* ===================== PRODUCTS TAB ===================== */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Products</CardTitle>
                <CardDescription>{products.length} product{products.length !== 1 ? 's' : ''} in inventory</CardDescription>
              </div>
              <div className="flex gap-2">
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
                <Button variant="outline" size="sm" onClick={downloadSample}>
                  <Download className="mr-1 h-4 w-4" /> Sample CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={csvBusy}>
                  <Upload className="mr-1 h-4 w-4" /> {csvBusy ? 'Importing...' : 'Upload CSV'}
                </Button>
                <Button size="sm" onClick={openAdd}>
                  <Plus className="mr-1 h-4 w-4" /> Add Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or SKU..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c!}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {filtered.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  {products.length === 0
                    ? 'No products yet. Add your first product or upload a CSV.'
                    : 'No products match your filters.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell className="font-mono text-xs">{p.sku ?? '—'}</TableCell>
                          <TableCell>{p.category ? <Badge variant="secondary">{p.category}</Badge> : '—'}</TableCell>
                          <TableCell className="text-right">৳{Number(p.price).toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <span className={p.stock_quantity <= 0 ? 'text-destructive font-medium' : p.stock_quantity <= 10 ? 'text-yellow-600 font-medium' : ''}>
                              {p.stock_quantity}
                            </span>
                          </TableCell>
                          <TableCell><Badge variant="outline">{p.source}</Badge></TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(p)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== API TOKENS TAB ===================== */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Tokens</CardTitle>
              <CardDescription>Generate tokens for your CRM, custom website, or external integrations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Input
                  placeholder="Token name (e.g. My CRM)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="max-w-xs"
                />
                <Select
                  value={newKeyScopes.join(',')}
                  onValueChange={(v) => setNewKeyScopes(v.split(','))}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VALID_SCOPES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={generateApiKey} disabled={keyBusy || !newKeyName.trim()}>
                  <Key className="mr-1 h-4 w-4" /> Generate Token
                </Button>
              </div>

              {revealedKey && (
                <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
                  <p className="mb-2 text-sm font-medium text-green-700 dark:text-green-400">
                    <AlertTriangle className="mr-1 inline h-4 w-4" />
                    Copy this token now — it will not be shown again.
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded bg-muted px-3 py-2 text-sm break-all">{revealedKey}</code>
                    <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(revealedKey); setCopiedId('revealed'); setTimeout(() => setCopiedId(null), 2000); }}>
                      {copiedId === 'revealed' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}

              {keys.length === 0 ? (
                <p className="py-6 text-center text-muted-foreground">No API tokens yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Prefix</TableHead>
                        <TableHead>Scopes</TableHead>
                        <TableHead>Rate Limit</TableHead>
                        <TableHead>Last Used</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {keys.map((k) => (
                        <TableRow key={k.id}>
                          <TableCell className="font-medium">{k.name}</TableCell>
                          <TableCell className="font-mono text-xs">{k.key_prefix}...</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {k.scopes?.map((s) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                            </div>
                          </TableCell>
                          <TableCell>{k.rate_limit_per_minute}/min</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'Never'}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => revokeKey(k.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== WEBHOOKS TAB ===================== */}
        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Integrations</CardTitle>
              <CardDescription>Paste your CRM or custom website webhook URL to sync products and orders.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Channel</Label>
                  <Select value={webhookChannel} onValueChange={setWebhookChannel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom Website</SelectItem>
                      <SelectItem value="meta">Meta / Facebook</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="crm">CRM Integration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Webhook Secret (optional)</Label>
                  <Input placeholder="Auto-generated if empty" value={webhookSecret} onChange={(e) => setWebhookSecret(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Webhook URL</Label>
                <Input
                  placeholder="https://your-crm.com/api/webhooks/salesdaddy"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
              </div>
              <Button onClick={saveWebhook} disabled={webhookBusy || !webhookUrl.trim()}>
                <Webhook className="mr-1 h-4 w-4" /> Save Webhook
              </Button>

              {webhooks.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Saved Webhooks</p>
                  {webhooks.map((w) => (
                    <div key={w.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={w.is_active ? 'default' : 'secondary'}>{w.channel}</Badge>
                          {w.is_active ? (
                            <span className="text-xs text-green-600">Active</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Inactive</span>
                          )}
                        </div>
                        <p className="mt-1 truncate text-sm text-muted-foreground">{w.webhook_url}</p>
                        <p className="text-xs text-muted-foreground">
                          Secret: {w.webhook_secret.slice(0, 4)}...{w.webhook_secret.slice(-4)}
                          {w.last_triggered_at && <> · Last triggered: {new Date(w.last_triggered_at).toLocaleDateString()}</>}
                          {w.failure_count > 0 && <> · {w.failure_count} failures</>}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => deleteWebhook(w.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ===================== ADD/EDIT DIALOG ===================== */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle>
            <DialogDescription>{editing ? 'Update product details below.' : 'Add a new product to your inventory.'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Product name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>SKU</Label>
                <Input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} placeholder="e.g. PW-001" />
              </div>
              <div>
                <Label>Category</Label>
                <Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="e.g. Electronics" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Price (৳)</Label>
                <Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
              </div>
              <div>
                <Label>Stock Quantity</Label>
                <Input type="number" min="0" value={form.stock_quantity} onChange={(e) => setForm((f) => ({ ...f, stock_quantity: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional product description" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={saveProduct} disabled={busy || !form.name.trim()}>
              {busy ? 'Saving...' : editing ? 'Update' : 'Add Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===================== DELETE CONFIRM DIALOG ===================== */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={deleteProduct} disabled={busy}>
              {busy ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
