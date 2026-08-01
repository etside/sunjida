import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Trash2, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Document {
  id: string;
  file_name: string;
  file_type: string;
  status: string;
  chunk_count: number;
  created_at: string;
}

const STATUS_ICONS: Record<string, typeof CheckCircle> = {
  processing: Loader2,
  ready: CheckCircle,
  failed: AlertCircle,
};

const STATUS_COLORS: Record<string, string> = {
  processing: 'text-yellow-600',
  ready: 'text-green-600',
  failed: 'text-red-600',
};

export function TrainingUpload() {
  const { tenant } = useTenant();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenant) loadDocuments();
  }, [tenant]);

  const loadDocuments = async () => {
    if (!tenant) return;
    setLoading(true);
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false });

    if (data) setDocuments(data as Document[]);
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !tenant) return;

    setUploading(true);

    for (const file of Array.from(files)) {
      // Upload to Supabase Storage
      const path = `${tenant.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('training-docs')
        .upload(path, file);

      if (uploadError) {
        toast.error(`Failed to upload ${file.name}`);
        continue;
      }

      // Create document record
      const { error: dbError } = await supabase.from('documents').insert({
        tenant_id: tenant.id,
        file_name: file.name,
        file_type: file.name.split('.').pop() || 'txt',
        storage_path: path,
        status: 'processing',
      });

      if (dbError) {
        toast.error(`Failed to record ${file.name}`);
      } else {
        toast.success(`${file.name} uploaded — processing...`);
      }
    }

    setUploading(false);
    loadDocuments();
  };

  const handleDelete = async (doc: Document) => {
    // Delete from storage
    await supabase.storage.from('training-docs').remove([doc.storage_path]);
    // Delete record
    await supabase.from('documents').delete().eq('id', doc.id);
    toast.success(`${doc.file_name} deleted`);
    loadDocuments();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Training Data (RAG)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Zone */}
        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-3">
            Upload PDF, TXT, MD, or CSV files to train your AI agent
          </p>
          <input
            type="file"
            accept=".pdf,.txt,.md,.csv"
            multiple
            onChange={handleUpload}
            className="hidden"
            id="training-upload"
          />
          <label htmlFor="training-upload">
            <Button variant="outline" disabled={uploading} asChild>
              <span>
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </>
                )}
              </span>
            </Button>
          </label>
        </div>

        {/* Document List */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No training documents uploaded yet.
          </p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => {
              const StatusIcon = STATUS_ICONS[doc.status] || FileText;
              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{doc.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.file_type.toUpperCase()} —{' '}
                        {doc.chunk_count > 0
                          ? `${doc.chunk_count} chunks indexed`
                          : 'Pending processing'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={doc.status === 'ready' ? 'default' : 'secondary'}
                      className="flex items-center gap-1"
                    >
                      <StatusIcon
                        className={`h-3 w-3 ${STATUS_COLORS[doc.status]} ${
                          doc.status === 'processing' ? 'animate-spin' : ''
                        }`}
                      />
                      {doc.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(doc)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Uploaded documents are chunked, embedded, and stored for retrieval.
          Your AI agent will use this data to answer customer questions.
        </p>
      </CardContent>
    </Card>
  );
}
