import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Brain, Save } from 'lucide-react';
import { tenantApi } from '@/services/tenantApi';
import { toast } from 'sonner';

const LLM_MODELS = [
  { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash (Fast & Cheap)' },
  { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro (High Quality)' },
  { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini (Balanced)' },
  { value: 'openai/gpt-4o', label: 'GPT-4o (Premium)' },
  { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
  { value: 'groq/llama-3.1-70b', label: 'Llama 3.1 70B (via Groq)' },
];

export function LLMSwitcher() {
  const [currentModel, setCurrentModel] = useState('google/gemini-2.5-flash');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await tenantApi.getAgentSettings();
    if (data?.model) {
      setCurrentModel(data.model);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await tenantApi.updateAgentSettings({ model: currentModel });
    setSaving(false);

    if (error) {
      toast.error('Failed to update model');
    } else {
      toast.success('Default LLM model updated');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Default LLM Model
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline">Current</Badge>
          <span className="text-sm font-mono">{currentModel}</span>
        </div>

        <Select value={currentModel} onValueChange={setCurrentModel}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LLM_MODELS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Default Model'}
        </Button>

        <p className="text-xs text-muted-foreground">
          This sets the default model for all tenant agents. Individual tenants can override
          this in their agent settings.
        </p>
      </CardContent>
    </Card>
  );
}
