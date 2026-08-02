# Social Connections

Connect social platforms to let your AI agent respond to customers on their preferred channels.

## Supported Platforms

| Platform | OAuth Scopes | What it does |
|----------|-------------|--------------|
| **Facebook** | `pages_show_list`, `pages_read_engagement`, `pages_messaging`, `pages_manage_posts` | Messenger conversations |
| **Instagram** | `instagram_basic`, `instagram_manage_messages`, `instagram_manage_comments`, `pages_show_list` | DM and comment management |
| **WhatsApp** | `whatsapp_business_management`, `whatsapp_business_messaging`, `pages_show_list` | WhatsApp Business messages |
| **Google** | `business.manageable`, `business.reviews.readonly` | Business Profile reviews and messages |

## Connection Flow

1. Go to **Social Connections** in the dashboard
2. Click **Connect with OAuth** on the platform card
3. Complete authorization in the popup/new tab
4. Select the business page/number to connect
5. Connection is saved and immediately active

## OAuth Security

- State tokens are random UUIDs with 10-minute expiry
- Redirect URIs are validated server-side
- Only minimal required scopes are requested
- Tokens are encrypted at rest in `social_platform_connections`

## Re-authentication

If a token expires or is revoked by the platform, click **Re-authenticate** to complete the OAuth flow again without losing connection history.

## Disconnecting

Click **Disconnect** to deactivate a connection. This:
- Sets `is_active = false` (no more messages processed)
- Preserves audit history and connection metadata
- Can be reconnected at any time
