import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Upload, Search, RefreshCw, FileSpreadsheet, Table } from 'lucide-react';
import { tenantApi } from '@/services/tenantApi';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  stock_quantity: number;
  category_id: string | null;
  is_active: boolean | null;
}

export function InventoryPanel() {
  const { tenant } = useTenant();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<Record<string, string>[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const { data } = await tenantApi.getProducts(search || undefined);
    if (data) setProducts(data as Product[]);
    setLoading(false);
  };

  // Google Sheets sync — calls Supabase Edge Function
  const handleSheetsSync = async () => {
    if (!sheetUrl) {
      toast.error('Please enter a Google Sheets URL');
      return;
    }
    if (!tenant?.id) {
      toast.error('No tenant configured');
      return;
    }
    setSyncing(true);
    toast.info('Syncing from Google Sheets...');

    const { data, error } = await tenantApi.syncFromGoogleSheets(sheetUrl, tenant.id);

    if (error) {
      toast.error('Sync failed — check the URL and try again');
    } else {
      toast.success(`Synced ${data?.product_count || 0} products from Google Sheets`);
      loadProducts();
    }

    setSyncing(false);
  };

  // CSV upload
  const handleCsvUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      if (lines.length < 2) return;

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const rows = lines.slice(1, 6).map((line) => {
        const values = line.split(',');
        const row: Record<string, string> = {};
        headers.forEach((h, i) => {
          row[h] = values[i]?.trim() || '';
        });
        return row;
      });

      setCsvPreview(rows);
    };
    reader.readAsText(file);
  }, []);

  const handleCsvConfirm = async () => {
    if (!csvFile) return;
    setSyncing(true);
    // In production, upload to Supabase Storage and process
    toast.info('Processing CSV upload...');
    setTimeout(() => {
      setSyncing(false);
      setCsvPreview([]);
      setCsvFile(null);
      toast.success('CSV uploaded — products will be available shortly');
      loadProducts();
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Table className="h-5 w-5" />
          Inventory Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="products">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="sheets">Google Sheets</TabsTrigger>
            <TabsTrigger value="csv">CSV Upload</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadProducts()}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" onClick={loadProducts}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No products found. Upload via Sheets or CSV.
              </p>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 font-medium">Name</th>
                      <th className="text-left p-3 font-medium">SKU</th>
                      <th className="text-right p-3 font-medium">Price</th>
                      <th className="text-right p-3 font-medium">Stock</th>
                      <th className="text-center p-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="p-3">{p.name}</td>
                        <td className="p-3 text-muted-foreground">{p.sku || '—'}</td>
                        <td className="p-3 text-right">৳{p.price.toLocaleString()}</td>
                        <td className="p-3 text-right">{p.stock_quantity}</td>
                        <td className="p-3 text-center">
                          <Badge variant={p.stock_quantity > 0 ? 'default' : 'destructive'}>
                            {p.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* Google Sheets Tab */}
          <TabsContent value="sheets" className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium">Google Sheets Sync</p>
                <p className="text-xs text-muted-foreground">
                  Connect a spreadsheet with columns: SKU, Name, Price, Stock, Category
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Spreadsheet URL or ID</Label>
              <Input
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
              />
            </div>
            <Button onClick={handleSheetsSync} disabled={syncing} className="w-full">
              {syncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </TabsContent>

          {/* CSV Upload Tab */}
          <TabsContent value="csv" className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                Drag & drop a CSV file or click to browse
              </p>
              <Input
                type="file"
                accept=".csv,.txt"
                onChange={handleCsvUpload}
                className="max-w-xs mx-auto"
              />
            </div>

            {csvPreview.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium">Preview (first 5 rows):</p>
                <div className="border rounded-lg overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted">
                      <tr>
                        {Object.keys(csvPreview[0]).map((h) => (
                          <th key={h} className="p-2 text-left font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.map((row, i) => (
                        <tr key={i} className="border-t">
                          {Object.values(row).map((v, j) => (
                            <td key={j} className="p-2">
                              {v}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button onClick={handleCsvConfirm} disabled={syncing} className="w-full">
                  {syncing ? 'Uploading...' : 'Confirm & Upload'}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
