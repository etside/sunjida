-- Migration: schedule cron jobs for pgmq-worker and inventory-cron
-- Run pgmq-worker every 1 minute to process queued replies
-- Run inventory-cron every 5 minutes to refresh stock levels

-- 1. Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Schedule pgmq-worker to poll every minute
SELECT cron.schedule(
  'pgmq-worker-poll',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/pgmq-worker',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{"batch_size": 10}'::jsonb
  );
  $$
);

-- 3. Schedule inventory-cron every 5 minutes
SELECT cron.schedule(
  'inventory-refresh',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/inventory-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
