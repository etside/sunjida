import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Key, Trash2, RefreshCw, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { tenantApi } from '@/services/tenantApi';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const PROVIDERS = [
  { value: 'OPENAI', label: 'OpenAI' },
  { value: 'ANTHROPIC', label: 'Anthropic' },
  { value: 'GROQ', label: 'Groq' },
  { value: 'GOOGLE_SHEETS', label: 'Google Sheets' },
  { value: 'TWILIO', label: 'Twilio' },
  { value: 'ELEVENLABS', label: 'ElevenLabs' },
];

interface Credential {
  id: string;
  tenant_id: string;
  provider: string;
  account_name: string | null;
  api_key_encrypted: string;
  status: string;
  created_at: string;
}

export function CredentialsManager({ tenantId }: { tenantId?: string }) {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [tenants, setTenants] = useState<{ id: string; name: string }[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCred, setEditingCred] = useState<Credential | null>(null);
  const [newCred, setNewCred] = useState({
    tenant_id: tenantId || '',
    provider: 'OPENAI',
    api_key: '',
    account_name: '',
  });
  const [editCred, setEditCred] = useState({
    provider: 'OPENAI',
    api_key: '',
    account_name: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [tenantId]);

  const loadData = async () => {
    setLoading(true);
    const [credResult, tenantResult] = await Promise.all([
      tenantApi.getCredentials(tenantId),
      !tenantId ? tenantApi.getTenants() : Promise.resolve({ data: null }),
    ]);

    if (credResult.data) setCredentials(credResult.data);
    if (tenantResult.data) setTenants(tenantResult.data);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newCred.tenant_id || !newCred.api_key) {
      toast.error('Please fill in all required fields');
      return;
    }

    const encrypted = btoa(newCred.api_key);

    const { error } = await tenantApi.addCredential({
      tenant_id: newCred.tenant_id,
      provider: newCred.provider,
      api_key_encrypted: encrypted,
      account_name: newCred.account_name || undefined,
    });

    if (error) {
      toast.error('Failed to add credential');
    } else {
      // Audit log
      await tenantApi.logAudit({
        tenant_id: newCred.tenant_id,
        actor: user?.email || user?.id || 'unknown',
        action: 'credential_added',
        resource: 'credentials',
        details: { provider: newCred.provider, account_name: newCred.account_name },
      });

      toast.success('Credential added successfully');
      setIsAddOpen(false);
      setNewCred({ tenant_id: tenantId || '', provider: 'OPENAI', api_key: '', account_name: '' });
      loadData();
    }
  };

  const handleEdit = async () => {
    if (!editingCred) return;

    const updates: Record<string, unknown> = {
      provider: editCred.provider,
      account_name: editCred.account_name || null,
      status: editCred.status,
    };

    // Only update api_key if user entered a new one
    if (editCred.api_key) {
      updates.api_key_encrypted = btoa(editCred.api_key);
    }

    const { error } = await supabase
      .from('credentials')
      .update(updates)
      .eq('id', editingCred.id);

    if (error) {
      toast.error('Failed to update credential');
    } else {
      await tenantApi.logAudit({
        tenant_id: editingCred.tenant_id,
        actor: user?.email || user?.id || 'unknown',
        action: 'credential_updated',
        resource: 'credentials',
        resource_id: editingCred.id,
        details: { provider: editCred.provider, status: editCred.status },
      });

      toast.success('Credential updated');
      setIsEditOpen(false);
      setEditingCred(null);
      loadData();
    }
  };

  const handleDelete = async (cred: Credential) => {
    const { error } = await supabase.from('credentials').delete().eq('id', cred.id);
    if (error) {
      toast.error('Failed to delete credential');
    } else {
      await tenantApi.logAudit({
        tenant_id: cred.tenant_id,
        actor: user?.email || user?.id || 'unknown',
        action: 'credential_deleted',
        resource: 'credentials',
        resource_id: cred.id,
        details: { provider: cred.provider },
      });

      toast.success('Credential deleted');
      loadData();
    }
  };

  const openEditDialog = (cred: Credential) => {
    setEditingCred(cred);
    setEditCred({
      provider: cred.provider,
      api_key: '',
      account_name: cred.account_name || '',
      status: cred.status,
    });
    setIsEditOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Credentials Manager
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Credential
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Credential</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {!tenantId && (
                  <div className="space-y-2">
                    <Label>Tenant</Label>
                    <Select
                      value={newCred.tenant_id}
                      onValueChange={(v) => setNewCred((p) => ({ ...p, tenant_id: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Select
                    value={newCred.provider}
                    onValueChange={(v) => setNewCred((p) => ({ ...p, provider: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVIDERS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={newCred.api_key}
                    onChange={(e) => setNewCred((p) => ({ ...p, api_key: e.target.value }))}
                    placeholder="sk-..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Name (optional)</Label>
                  <Input
                    value={newCred.account_name}
                    onChange={(e) => setNewCred((p) => ({ ...p, account_name: e.target.value }))}
                    placeholder="e.g., Production OpenAI Key"
                  />
                </div>
                <Button onClick={handleAdd} className="w-full">
                  Add Credential
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : credentials.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No credentials configured yet.
          </p>
        ) : (
          <div className="space-y-3">
            {credentials.map((cred) => (
              <div
                key={cred.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {cred.account_name || cred.provider}
                    </p>
                    <p className="text-xs text-muted-foreground">{cred.provider}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={cred.status === 'active' ? 'default' : 'destructive'}>
                    {cred.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(cred)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(cred)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit Credential Dialog */}
      <Dialog open={isEditOpen} onOpenChange={() => { setIsEditOpen(false); setEditingCred(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Credential — {editingCred?.account_name || editingCred?.provider}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select
                value={editCred.provider}
                onValueChange={(v) => setEditCred((p) => ({ ...p, provider: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>API Key (leave blank to keep current)</Label>
              <Input
                type="password"
                value={editCred.api_key}
                onChange={(e) => setEditCred((p) => ({ ...p, api_key: e.target.value }))}
                placeholder="Enter new key or leave blank"
              />
            </div>
            <div className="space-y-2">
              <Label>Account Name</Label>
              <Input
                value={editCred.account_name}
                onChange={(e) => setEditCred((p) => ({ ...p, account_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={editCred.status}
                onValueChange={(v) => setEditCred((p) => ({ ...p, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setIsEditOpen(false); setEditingCred(null); }}>
                Cancel
              </Button>
              <Button onClick={handleEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
