-- Fix multi-tenant unique constraint on agent_conversations.
-- The old index (channel, external_id) prevented different businesses from
-- having conversations with the same external_id. Replace with a unique
-- index that includes business_id.

DROP INDEX IF EXISTS agent_conversations_channel_external_idx;

-- Partial unique index: only enforce uniqueness when external_id IS NOT NULL
-- (matches the original partial index condition but adds business_id)
CREATE UNIQUE INDEX agent_conversations_channel_external_business_idx
  ON public.agent_conversations (channel, external_id, business_id)
  WHERE external_id IS NOT NULL;
