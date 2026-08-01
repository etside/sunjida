import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Inbox, Search, ArrowUpRight, Bot, User, RefreshCw } from 'lucide-react';
import { tenantApi } from '@/services/tenantApi';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Conversation {
  id: string;
  channel: string;
  customer_name: string | null;
  external_id: string | null;
  lang: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
}

interface Message {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

const CHANNEL_BADGES: Record<string, { label: string; color: string }> = {
  whatsapp: { label: 'WhatsApp', color: 'bg-green-600' },
  facebook: { label: 'Messenger', color: 'bg-blue-600' },
  instagram: { label: 'Instagram', color: 'bg-pink-600' },
  telegram: { label: 'Telegram', color: 'bg-sky-600' },
  web_widget: { label: 'Web Chat', color: 'bg-primary' },
  voice: { label: 'Voice Call', color: 'bg-orange-600' },
};

export function UnifiedInbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [reply, setReply] = useState('');
  const [aiEnabled, setAiEnabled] = useState(true);

  useEffect(() => {
    loadConversations();
    // Poll for new conversations every 10s
    const interval = setInterval(loadConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selected) loadMessages(selected);
  }, [selected]);

  const loadConversations = async () => {
    const { data } = await tenantApi.getConversations(50);
    if (data) {
      // Attach last message
      const withLast = await Promise.all(
        data.map(async (c) => {
          const { data: msgs } = await supabase
            .from('agent_messages')
            .select('content')
            .eq('conversation_id', c.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return { ...c, last_message: msgs?.content || '' };
        })
      );
      setConversations(withLast as Conversation[]);
    }
    setLoading(false);
  };

  const loadMessages = async (convId: string) => {
    const { data } = await tenantApi.getMessages(convId);
    if (data) setMessages(data as Message[]);
  };

  const handleSendReply = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);

    // Store the human reply
    await supabase.from('agent_messages').insert({
      conversation_id: selected,
      role: 'human',
      content: reply.trim(),
    });

    setReply('');
    setSending(false);
    loadMessages(selected);
    toast.success('Reply sent');
  };

  const handleEscalate = async (convId: string) => {
    // In production, this would disable AI and notify the team
    toast.success('Conversation escalated to human support');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
      {/* Conversation List */}
      <Card className="lg:col-span-1 overflow-hidden flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Inbox className="h-4 w-4" />
            Unified Inbox
            <Badge variant="outline" className="ml-auto">
              {conversations.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No conversations yet.
            </p>
          ) : (
            <div className="divide-y">
              {conversations.map((c) => {
                const ch = CHANNEL_BADGES[c.channel] || { label: c.channel, color: 'bg-gray-600' };
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c.id)}
                    className={`w-full text-left p-3 hover:bg-muted transition-colors ${
                      selected === c.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">
                        {c.customer_name || c.external_id || 'Anonymous'}
                      </span>
                      <span className={`h-2 w-2 rounded-full ${ch.color}`} />
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{c.last_message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {ch.label}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(c.updated_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Thread */}
      <Card className="lg:col-span-2 overflow-hidden flex flex-col">
        {selected ? (
          <>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {conversations.find((c) => c.id === selected)?.customer_name || 'Conversation'}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEscalate(selected)}
                  >
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    Escalate
                  </Button>
                  <Button
                    variant={aiEnabled ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => setAiEnabled(!aiEnabled)}
                  >
                    <Bot className="h-4 w-4 mr-1" />
                    AI {aiEnabled ? 'ON' : 'OFF'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' || m.role === 'human' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      m.role === 'user' || m.role === 'human'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted rounded-bl-md'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      {m.role === 'user' || m.role === 'human' ? (
                        <User className="h-3 w-3" />
                      ) : (
                        <Bot className="h-3 w-3 text-primary" />
                      )}
                      <span className="text-[10px] opacity-70">
                        {m.role === 'human' ? 'Human Agent' : m.role === 'user' ? 'Customer' : 'AI'}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              ))}
            </CardContent>
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                  placeholder="Type a reply as human agent..."
                  disabled={sending}
                />
                <Button onClick={handleSendReply} disabled={!reply.trim() || sending}>
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Inbox className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Select a conversation to view</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
