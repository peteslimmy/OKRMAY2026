-- ============================================================================
-- OKR2026: Add Objectives Table and Related Columns
-- This migration implements the Objective → KR → Sub-KR hierarchy
-- ============================================================================

-- ============================================================================
-- 1. CREATE OBJECTIVES TABLE
-- Each quarter has exactly one Objective (Q1, Q2, Q3, Q4)
-- ============================================================================

CREATE TABLE IF NOT EXISTS objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  quarter TEXT NOT NULL CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(quarter, year) -- Enforce exactly 1 objective per quarter per year
);

-- Enable RLS
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read objectives
CREATE POLICY "Allow authenticated read objectives" ON objectives
FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to manage objectives (admins/directors should manage)
CREATE POLICY "Allow authenticated manage objectives" ON objectives
FOR ALL USING (auth.role() IN ('authenticated', 'service_role'));

-- Create index for faster lookups by year/quarter
CREATE INDEX IF NOT EXISTS idx_objectives_year_quarter ON objectives(year, quarter);

-- ============================================================================
-- 2. ADD OBJECTIVE_ID TO KEY_RESULTS
-- This links KRs (not Sub-KRs) to their parent Objective
-- Sub-KRs still use parent_kr_id to link to their parent KR
-- ============================================================================

ALTER TABLE key_results ADD COLUMN IF NOT EXISTS objective_id UUID REFERENCES objectives(id) ON DELETE SET NULL;

-- Create index for faster objective lookups
CREATE INDEX IF NOT EXISTS idx_key_results_objective ON key_results(objective_id);

-- ============================================================================
-- 3. ADD SUB_KR_TAG TO ACTIVITIES (Weekly Goals)
-- Tags: "KR1.1", "KR2.3", "Stressed", etc.
-- ============================================================================

ALTER TABLE activities ADD COLUMN IF NOT EXISTS sub_kr_tag TEXT;

-- Create index for faster tag lookups
CREATE INDEX IF NOT EXISTS idx_activities_sub_kr_tag ON activities(sub_kr_tag);

-- ============================================================================
-- 4. UPDATE EXISTING DATA (if any key_results exist without objective_id)
-- Assign existing KRs to auto-created objectives for each quarter
-- ============================================================================

-- First, ensure objectives exist for each quarter that has KRs
INSERT INTO objectives (title, quarter, year)
SELECT
  'Q' || substr(quarter, 2, 1) || ' ' || year || ' Objective',
  quarter,
  year
FROM (SELECT DISTINCT quarter, year FROM key_results WHERE parent_kr_id IS NULL) AS existing_krs
ON CONFLICT (quarter, year) DO NOTHING;

-- Now link existing KRs (those without parent_kr_id = top-level KRs) to objectives
UPDATE key_results
SET objective_id = (
  SELECT id FROM objectives
  WHERE objectives.quarter = key_results.quarter
  AND objectives.year = key_results.year
  LIMIT 1
)
WHERE parent_kr_id IS NULL
AND objective_id IS NULL;

-- ============================================================================
-- 5. SEED DEFAULT OBJECTIVES FOR CURRENT YEAR (2026)
-- Run this manually or comment out if you want to create manually
-- ============================================================================

INSERT INTO objectives (title, quarter, year) VALUES
  ('Q1 2026: Strategic Initiative', 'Q1', 2026),
  ('Q2 2026: Strategic Initiative', 'Q2', 2026),
  ('Q3 2026: Strategic Initiative', 'Q3', 2026),
  ('Q4 2026: Strategic Initiative', 'Q4', 2026)
ON CONFLICT (quarter, year) DO NOTHING;

-- ============================================================================
-- DONE
-- ============================================================================