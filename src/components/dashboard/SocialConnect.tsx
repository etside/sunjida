import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Facebook, MessageCircle, Send, Link2, Unlink } from 'lucide-react';
import { tenantApi } from '@/services/tenantApi';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

interface Channel {
  id: string;
  channel: string;
  display_name: string;
  is_active: boolean;
  page_id: string | null;
  phone_number_id: string | null;
}

const CHANNELS = [
  { id: 'facebook', name: 'Facebook Messenger', icon: Facebook, color: 'bg-blue-600' },
  { id: 'instagram', name: 'Instagram DMs', icon: MessageCircle, color: 'bg-pink-600' },
  { id: 'whatsapp', name: 'WhatsApp Business', icon: Send, color: 'bg-green-600' },
  { id: 'telegram', name: 'Telegram Bot', icon: Send, color: 'bg-sky-600' },
];

export function SocialConnect() {
  const { tenant } = useTenant();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChannels();
  }, [tenant]);

  const loadChannels = async () => {
    if (!tenant) return;
    setLoading(true);
    const { data } = await tenantApi.getMetaChannels();
    if (data) {
      setChannels(data as Channel[]);
    }
    setLoading(false);
  };

  const handleConnect = async (channelType: string) => {
    // In production, this would redirect to OAuth
    // For now, simulate connection
    toast.info(`Connect ${channelType} — OAuth flow will open in production`);

    // Simulated: create a placeholder channel
    if (tenant) {
      const { error } = await tenantApi.upsertMetaChannel({
        tenant_id: tenant.id,
        channel: channelType,
        display_name: `${channelType} Channel`,
        access_token: 'placeholder',
        verify_token: crypto.randomUUID(),
        is_active: true,
      });

      if (!error) {
        toast.success(`${channelType} connected!`);
        loadChannels();
      }
    }
  };

  const handleDisconnect = async (channelId: string) => {
    const { error } = await supabase
      .from('meta_channels')
      .update({ is_active: false })
      .eq('id', channelId);

    if (!error) {
      toast.success('Channel disconnected');
      loadChannels();
    }
  };

  const getChannelStatus = (channelType: string) => {
    return channels.find(
      (c) => c.channel === channelType && c.is_active
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Social Channels
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {CHANNELS.map((ch) => {
            const connected = getChannelStatus(ch.id);
            const Icon = ch.icon;

            return (
              <div
                key={ch.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${ch.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{ch.name}</p>
                    {connected ? (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                        Connected — {connected.display_name}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Not connected</p>
                    )}
                  </div>
                </div>
                {connected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnect(connected.id)}
                  >
                    <Unlink className="h-4 w-4 mr-1" />
                    Disconnect
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => handleConnect(ch.id)}>
                    <Link2 className="h-4 w-4 mr-1" />
                    Connect
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

import { supabase } from '@/integrations/supabase/client';
