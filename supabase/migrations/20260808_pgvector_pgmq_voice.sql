-- Migration: pgvector product embeddings, pgmq queue, voice support
-- Adds semantic product search and async message processing

-- 1. Enable pgmq extension for async job queue
CREATE EXTENSION IF NOT EXISTS pgmq;

-- 2. Add embedding column to business_products for vector search
ALTER TABLE business_products ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 3. Add voice-related columns
ALTER TABLE agent_settings ADD COLUMN IF NOT EXISTS voice_enabled boolean DEFAULT false;
ALTER TABLE agent_settings ADD COLUMN IF NOT EXISTS voice_provider text DEFAULT 'openai';
ALTER TABLE agent_settings ADD COLUMN IF NOT EXISTS voice_model text DEFAULT 'tts-1';
ALTER TABLE agent_settings ADD COLUMN IF NOT EXISTS voice_speed numeric DEFAULT 1.0;

-- 4. Add audio_url to agent_messages for voice replies
ALTER TABLE agent_messages ADD COLUMN IF NOT EXISTS audio_url text;

-- 5. Add shop_url to businesses/tenants for catalog source
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS shop_url text;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS catalog_sync_enabled boolean DEFAULT false;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS catalog_last_sync_at timestamptz;

-- 6. Create HNSW index for fast approximate nearest neighbor search
-- Uses cosine distance for semantic product matching
CREATE INDEX IF NOT EXISTS business_products_embedding_idx
  ON business_products
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- 7. Create the match_products function for tenant-filtered vector search
-- Returns top N products matching a query embedding for a specific tenant
CREATE OR REPLACE FUNCTION match_products(
  p_tenant_id uuid,
  p_embedding vector(1536),
  p_match_count int DEFAULT 5,
  p_min_similarity float DEFAULT 0.3
)
RETURNS TABLE (
  id uuid,
  external_id text,
  name text,
  description text,
  price numeric,
  currency text,
  stock_quantity int,
  image_url text,
  product_url text,
  similarity float
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bp.id,
    bp.external_id,
    bp.name,
    bp.description,
    bp.price,
    bp.currency,
    bp.stock_quantity,
    bp.image_url,
    bp.product_url,
    1 - (bp.embedding <=> p_embedding) AS similarity
  FROM business_products bp
  WHERE bp.business_id = p_tenant_id
    AND bp.embedding IS NOT NULL
    AND 1 - (bp.embedding <=> p_embedding) >= p_min_similarity
  ORDER BY bp.embedding <=> p_embedding
  LIMIT p_match_count;
END;
$$;

-- 8. Create pgmq queue for async reply processing
SELECT pgmq.create('messenger_replies');

-- 9. Create pgmq queue for catalog sync jobs
SELECT pgmq.create('catalog_sync');

-- 10. Create pgmq queue for inventory updates
SELECT pgmq.create('inventory_updates');

-- 11. Index for faster conversation lookups by channel + external_id
CREATE INDEX IF NOT EXISTS idx_agent_conversations_channel_external
  ON agent_conversations (channel, external_id, business_id);

-- 12. Index for faster product lookups by business_id
CREATE INDEX IF NOT EXISTS idx_business_products_business_id
  ON business_products (business_id, external_id);

-- 13. pgmq helper RPC functions for Edge Functions
-- Send a message to a queue
CREATE OR REPLACE FUNCTION pgmq_send(
  queue_name text,
  message jsonb,
  delay_seconds int DEFAULT 0
)
RETURNS bigint
LANGUAGE plpgsql
AS $$
DECLARE
  msg_id bigint;
BEGIN
  SELECT pgmq.send(queue_name, message, delay_seconds) INTO msg_id;
  RETURN msg_id;
END;
$$;

-- Read messages from a queue (with visibility timeout)
CREATE OR REPLACE FUNCTION pgmq_read(
  queue_name text,
  vt int DEFAULT 30,
  qty int DEFAULT 1
)
RETURNS TABLE (
  msg_id bigint,
  message jsonb,
  created_at timestamptz,
  visibility_timeout timestamptz,
  expiration timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT r.msg_id, r.message, r.created_at, r.vt as visibility_timeout, r.expiration
  FROM pgmq.read(queue_name, vt, qty) r;
END;
$$;

-- Delete a message from a queue after processing
CREATE OR REPLACE FUNCTION pgmq_delete(
  queue_name text,
  msg_id bigint
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN pgmq.delete(queue_name, msg_id);
END;
$$;

-- Archive completed messages
CREATE OR REPLACE FUNCTION pgmq_archive(
  queue_name text,
  msg_id bigint
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN pgmq.archive(queue_name, msg_id);
END;
$$;
