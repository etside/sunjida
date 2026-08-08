-- Migration: schedule cron jobs for pgmq-worker and inventory-cron
-- Run pgmq-worker every 1 minute to process queued replies
-- Run inventory-cron every 5 minutes to refresh stock levels

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Create a settings table to store deployment config for cron jobs
CREATE TABLE IF NOT EXISTS cron_config (
  key text PRIMARY KEY,
  value text NOT NULL
);

-- Insert default values (update these after deployment)
INSERT INTO cron_config (key, value) VALUES
  ('supabase_url', 'https://yplgzmxzrslofnuagfaz.supabase.co'),
  ('service_role_key', 'UPDATE_WITH_YOUR_SERVICE_ROLE_KEY')
ON CONFLICT (key) DO NOTHING;

-- 3. Helper function to call edge functions from cron
CREATE OR REPLACE FUNCTION call_edge_function(function_name text, payload jsonb DEFAULT '{}')
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  base_url text;
  auth_key text;
  result jsonb;
BEGIN
  SELECT value INTO base_url FROM cron_config WHERE key = 'supabase_url';
  SELECT value INTO auth_key FROM cron_config WHERE key = 'service_role_key';

  SELECT net.http_post(
    url := base_url || '/functions/v1/' || function_name,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || auth_key
    ),
    body := payload
  ) INTO result;

  RETURN result;
END;
$$;

-- 4. Schedule pgmq-worker to poll every minute
SELECT cron.schedule(
  'pgmq-worker-poll',
  '* * * * *',
  $$SELECT call_edge_function('pgmq-worker', '{"batch_size": 10}'::jsonb)$$
);

-- 5. Schedule inventory-cron every 5 minutes
SELECT cron.schedule(
  'inventory-refresh',
  '*/5 * * * *',
  $$SELECT call_edge_function('inventory-cron', '{}'::jsonb)$$
);
