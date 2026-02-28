-- ============================================================================
-- COMPLETE SECURITY RESET - DISABLE RLS AND REENABLE WITH STRICT RULES
-- ============================================================================

-- First, disable RLS on all tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_units DISABLE ROW LEVEL SECURITY;
ALTER TABLE key_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE governance_config DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies
DROP POLICY IF EXISTS "profiles_authenticated_only" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_manage_policy" ON profiles;
DROP POLICY IF EXISTS "Allow public read profiles" ON profiles;

DROP POLICY IF EXISTS "audit_logs_authenticated_only" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_read_policy" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert_policy" ON audit_logs;
DROP POLICY IF EXISTS "Allow public read audit_logs" ON audit_logs;

DROP POLICY IF EXISTS "business_units_authenticated_only" ON business_units;
DROP POLICY IF EXISTS "business_units_read_policy" ON business_units;
DROP POLICY IF EXISTS "business_units_manage_policy" ON business_units;

DROP POLICY IF EXISTS "key_results_authenticated_only" ON key_results;
DROP POLICY IF EXISTS "key_results_read_policy" ON key_results;
DROP POLICY IF EXISTS "key_results_manage_policy" ON key_results;

DROP POLICY IF EXISTS "activities_authenticated_only" ON activities;
DROP POLICY IF EXISTS "activities_read_policy" ON activities;
DROP POLICY IF EXISTS "activities_manage_policy" ON activities;

DROP POLICY IF EXISTS "strategic_notes_authenticated_only" ON strategic_notes;
DROP POLICY IF EXISTS "strategic_notes_read_policy" ON strategic_notes;
DROP POLICY IF EXISTS "strategic_notes_manage_policy" ON strategic_notes;

DROP POLICY IF EXISTS "governance_config_authenticated_only" ON governance_config;
DROP POLICY IF EXISTS "governance_config_read_policy" ON governance_config;
DROP POLICY IF EXISTS "governance_config_manage_policy" ON governance_config;

-- ============================================================================
-- NOW RECREATE WITH CORRECT SYNTAX
-- ============================================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_config ENABLE ROW LEVEL SECURITY;

-- Create policies that explicitly check for authenticated role
CREATE POLICY "anon_cannot_read_profiles" ON profiles
  FOR SELECT TO anon USING (false);

CREATE POLICY "auth_can_read_profiles" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "service_can_all_profiles" ON profiles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Audit logs
CREATE POLICY "anon_cannot_read_audit" ON audit_logs
  FOR SELECT TO anon USING (false);

CREATE POLICY "auth_can_read_audit" ON audit_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "service_can_all_audit" ON audit_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Business Units
CREATE POLICY "anon_cannot_read_bus" ON business_units
  FOR SELECT TO anon USING (false);

CREATE POLICY "auth_can_read_bus" ON business_units
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "service_can_all_bus" ON business_units
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Key Results
CREATE POLICY "anon_cannot_read_kr" ON key_results
  FOR SELECT TO anon USING (false);

CREATE POLICY "auth_can_read_kr" ON key_results
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "service_can_all_kr" ON key_results
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Activities
CREATE POLICY "anon_cannot_read_acts" ON activities
  FOR SELECT TO anon USING (false);

CREATE POLICY "auth_can_read_acts" ON activities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "service_can_all_acts" ON activities
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Strategic Notes
CREATE POLICY "anon_cannot_read_sn" ON strategic_notes
  FOR SELECT TO anon USING (false);

CREATE POLICY "auth_can_read_sn" ON strategic_notes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "service_can_all_sn" ON strategic_notes
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Governance Config
CREATE POLICY "anon_cannot_read_gov" ON governance_config
  FOR SELECT TO anon USING (false);

CREATE POLICY "auth_can_read_gov" ON governance_config
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "service_can_all_gov" ON governance_config
  FOR ALL TO service_role USING (true) WITH CHECK (true);

SELECT 'Done! RLS policies applied with explicit anon blocking.' as status;
