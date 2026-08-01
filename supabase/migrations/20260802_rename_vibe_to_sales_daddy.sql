-- Rename vibe_prompt to sales_daddy_prompt on tenants table
-- This aligns the column name with the Sales Daddy branding

-- Add sales_daddy_prompt column (if not already present from 20260801 migration)
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS sales_daddy_prompt TEXT DEFAULT '';

-- Copy existing vibe_prompt data to sales_daddy_prompt where sales_daddy_prompt is empty
UPDATE tenants
SET sales_daddy_prompt = vibe_prompt
WHERE sales_daddy_prompt = '' AND vibe_prompt IS NOT NULL AND vibe_prompt != '';

-- Drop the old vibe_prompt column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tenants' AND column_name = 'vibe_prompt'
  ) THEN
    ALTER TABLE tenants DROP COLUMN vibe_prompt;
  END IF;
END $$;
