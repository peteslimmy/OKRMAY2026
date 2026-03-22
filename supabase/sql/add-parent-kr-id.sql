-- Add parent_kr_id column to key_results table for sub-key results support

ALTER TABLE key_results ADD COLUMN IF NOT EXISTS parent_kr_id UUID REFERENCES key_results(id);

-- Create index for faster sub-KR lookups
CREATE INDEX IF NOT EXISTS idx_key_results_parent ON key_results(parent_kr_id);

-- Fix RLS policies for authenticated users to manage data

-- Re-enable manage policies that may have been lost during v4 security reset
DROP POLICY IF EXISTS "auth_can_manage_kr" ON key_results;
CREATE POLICY "auth_can_manage_kr" ON key_results
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_can_manage_acts" ON activities;
CREATE POLICY "auth_can_manage_acts" ON activities
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_can_manage_sn" ON strategic_notes;
CREATE POLICY "auth_can_manage_sn" ON strategic_notes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);