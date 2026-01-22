-- Migration: Add user_id and RLS to existing opportunities table
-- This migration is safe and preserves all existing data

-- Step 1: Add user_id column (nullable initially to preserve existing data)
ALTER TABLE public.opportunities 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Add source columns for marketplace tracking
ALTER TABLE public.opportunities 
ADD COLUMN IF NOT EXISTS source text,
ADD COLUMN IF NOT EXISTS source_url text,
ADD COLUMN IF NOT EXISTS solicitation_id text,
ADD COLUMN IF NOT EXISTS naics_code text,
ADD COLUMN IF NOT EXISTS psc_code text,
ADD COLUMN IF NOT EXISTS posted_date timestamptz,
ADD COLUMN IF NOT EXISTS raw_text text,
ADD COLUMN IF NOT EXISTS parsed_json jsonb;

-- Step 3: Add indexes for performance
CREATE INDEX IF NOT EXISTS opportunities_user_id_idx ON public.opportunities(user_id);
CREATE INDEX IF NOT EXISTS opportunities_source_idx ON public.opportunities(source);
CREATE INDEX IF NOT EXISTS opportunities_deadline_idx ON public.opportunities(deadline);
CREATE INDEX IF NOT EXISTS opportunities_status_idx ON public.opportunities(status);
CREATE INDEX IF NOT EXISTS opportunities_created_at_idx ON public.opportunities(created_at);

-- Step 4: Enable Row Level Security
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS Policies

-- Policy: Users can view their own opportunities
DROP POLICY IF EXISTS "Users can view own opportunities" ON public.opportunities;
CREATE POLICY "Users can view own opportunities"
  ON public.opportunities
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own opportunities
DROP POLICY IF EXISTS "Users can insert own opportunities" ON public.opportunities;
CREATE POLICY "Users can insert own opportunities"
  ON public.opportunities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own opportunities
DROP POLICY IF EXISTS "Users can update own opportunities" ON public.opportunities;
CREATE POLICY "Users can update own opportunities"
  ON public.opportunities
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own opportunities
DROP POLICY IF EXISTS "Users can delete own opportunities" ON public.opportunities;
CREATE POLICY "Users can delete own opportunities"
  ON public.opportunities
  FOR DELETE
  USING (auth.uid() = user_id);

-- Step 6: Create or update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_opportunities_updated_at ON public.opportunities;
CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Add comment for documentation
COMMENT ON COLUMN public.opportunities.user_id IS 'User who created/imported this opportunity';
COMMENT ON COLUMN public.opportunities.source IS 'Source marketplace: sam, govwin, unison, fpds, etc.';
COMMENT ON COLUMN public.opportunities.source_url IS 'Original URL from source marketplace';

-- Migration complete!
-- All existing data preserved
-- New opportunities will require user_id
-- RLS policies enforce user-level access control
