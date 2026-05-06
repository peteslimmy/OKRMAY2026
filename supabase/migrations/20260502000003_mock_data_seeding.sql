-- ============================================================================
-- MOCK DATA SEEDING: 2026 Governance & Performance Cycle
-- Populates the platform with high-fidelity corporate records for demonstration
-- ============================================================================

-- 1. Ensure Business Units exist
INSERT INTO business_units (id, name)
VALUES 
  (gen_random_uuid(), 'IDEC'),
  (gen_random_uuid(), 'VREG'),
  (gen_random_uuid(), 'HnB'),
  (gen_random_uuid(), 'POSSAP'),
  (gen_random_uuid(), 'IT'),
  (gen_random_uuid(), 'FINANCE')
ON CONFLICT (name) DO NOTHING;

-- 2. Ensure Constraints exist (Safety fix for ON CONFLICT)
DO $$ 
BEGIN
  -- Ensure objectives status column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='objectives' AND column_name='status') THEN
    ALTER TABLE objectives ADD COLUMN status TEXT DEFAULT 'Active';
  END IF;

  -- Step A: Re-link children to the records we are keeping (the ones with the largest ID)
  UPDATE key_results k
  SET parent_kr_id = survivors.keep_id
  FROM (
    SELECT objective_id, kr_slot, MAX(id::text)::uuid as keep_id
    FROM key_results
    GROUP BY objective_id, kr_slot
    HAVING COUNT(*) > 1
  ) survivors
  WHERE k.parent_kr_id IN (
    SELECT id FROM key_results 
    WHERE objective_id = survivors.objective_id 
      AND kr_slot = survivors.kr_slot 
      AND id != survivors.keep_id
  );

  -- Step B: Clean duplicates in key_results
  DELETE FROM key_results a USING key_results b 
  WHERE a.id < b.id 
    AND a.objective_id = b.objective_id 
    AND a.kr_slot = b.kr_slot;

  -- Step C: Establish Objective unique constraint
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_objective_per_quarter') THEN
    ALTER TABLE objectives ADD CONSTRAINT unique_objective_per_quarter UNIQUE (quarter, year);
  END IF;

  -- Step D: Establish Key Result unique constraint
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_kr_slot_per_objective') THEN
    ALTER TABLE key_results ADD CONSTRAINT unique_kr_slot_per_objective UNIQUE (objective_id, kr_slot);
  END IF;
END $$;

-- 3. Create Strategic Objectives for 2026 Q2
INSERT INTO objectives (id, title, description, quarter, year, status)
VALUES 
  ('a1b2c3d4-e5f6-4a5b-b6c7-d8e9f0a1b2c3', 'Digital Transformation 2.0', 'Modernizing core registry infrastructure for high-scale automation.', 'Q2', 2026, 'Active')
ON CONFLICT (quarter, year) DO UPDATE SET status = EXCLUDED.status;

-- 4. Create Key Results for Q2
INSERT INTO key_results (objective_id, kr_slot, title, description, progress, status)
VALUES 
  ('a1b2c3d4-e5f6-4a5b-b6c7-d8e9f0a1b2c3', 'KR1', '99.9% System Uptime', 'Achieve near-perfect uptime for the new VREG cloud portal.', 85.0, 'Green'),
  ('a1b2c3d4-e5f6-4a5b-b6c7-d8e9f0a1b2c3', 'KR2', 'Revenue Integrity Audit', 'Complete full audit of all 2026 Q1 financial discrepancies.', 45.0, 'Amber'),
  ('a1b2c3d4-e5f6-4a5b-b6c7-d8e9f0a1b2c3', 'KR3', 'Employee Upskilling', 'Certify 50 engineers in advanced AI-driven workflow management.', 12.0, 'Red')
ON CONFLICT (objective_id, kr_slot) DO UPDATE SET 
  title = EXCLUDED.title,
  progress = EXCLUDED.progress,
  status = EXCLUDED.status;

-- 4. Seed Activities (Weekly Goals) for W17 and W18
-- We assume a test user exists or we use a static UUID
DO $$ 
DECLARE 
  target_user_id UUID;
  kr1_id UUID;
  kr2_id UUID;
BEGIN
  -- Try to get an admin user
  SELECT id INTO target_user_id FROM profiles LIMIT 1;
  IF target_user_id IS NULL THEN
    target_user_id := '00000000-0000-0000-0000-000000000000'; -- Fallback
  END IF;

  SELECT id INTO kr1_id FROM key_results WHERE kr_slot = 'KR1' LIMIT 1;
  SELECT id INTO kr2_id FROM key_results WHERE kr_slot = 'KR2' LIMIT 1;

  -- Week 17 (Previous)
  INSERT INTO activities (key_result_id, owner_id, department, title, tasks, comments, week, year, score)
  VALUES 
    (kr1_id, target_user_id, 'IT', 'Cloud Migration Phase 1', '[{"id":"1","title":"Setup VPC","status":"Done"},{"id":"2","title":"RDS Provisioning","status":"Done"}]', 'All green.', 17, 2026, 100),
    (kr2_id, target_user_id, 'FINANCE', 'Initial Variance Analysis', '[{"id":"3","title":"Collect Q1 logs","status":"Done"},{"id":"4","title":"Compare with ledger","status":"NotDone"}]', 'Awaiting bank statements.', 17, 2026, 50);

  -- Week 18 (Current)
  INSERT INTO activities (key_result_id, owner_id, department, title, tasks, comments, week, year, score)
  VALUES 
    (kr1_id, target_user_id, 'IT', 'API Gateway Deployment', '[{"id":"5","title":"Auth integration","status":"Undefined"},{"id":"6","title":"Stress testing","status":"Undefined"}]', 'In progress.', 18, 2026, 0),
    (kr2_id, target_user_id, 'FINANCE', 'Deep Dive on POSSAP leaks', '[{"id":"7","title":"Verify transaction #892","status":"Undefined"}]', 'Critical priority.', 18, 2026, 0);
END $$;

-- 5. Seed Violations
INSERT INTO violations (category_id, violator_id, bu_id, week_reference, notes, status)
SELECT 
  id, 
  '00000000-0000-0000-0000-000000000000'::UUID, 
  (SELECT id FROM business_units WHERE name = 'IDEC' LIMIT 1), 
  'W17', 
  'Late submission of weekly report by 4 hours.', 
  'UNPAID'
FROM violation_categories 
WHERE name = 'Late Submission' 
LIMIT 1;

-- 6. Seed Anomaly Flags
INSERT INTO anomaly_flags (entity_type, entity_id, reason, severity)
VALUES 
  ('SYSTEM', 'LOCK-W17', 'Temporal drift detected in W17 finalization timestamps.', 'medium'),
  ('ACTIVITY', 'VREG-MOCK-001', 'Reporting gap: VREG unit has missing data for 2 consecutive weeks.', 'high');

-- Seeding complete. Dashboard now populated with realistic enterprise performance metrics.
