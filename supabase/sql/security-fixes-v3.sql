-- ============================================================================
-- FIX RLS POLICIES - More restrictive
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- DISABLE RLS FIRST, THEN RECREATE STRICTLY
-- ============================================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_manage_policy" ON profiles;
DROP POLICY IF EXISTS "Allow public read profiles" ON profiles;

DROP POLICY IF EXISTS "audit_logs_read_policy" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert_policy" ON audit_logs;
DROP POLICY IF EXISTS "Allow public read audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "Allow authenticated read audit_logs" ON audit_logs;

DROP POLICY IF EXISTS "business_units_read_policy" ON business_units;
DROP POLICY IF EXISTS "business_units_manage_policy" ON business_units;

DROP POLICY IF EXISTS "key_results_read_policy" ON key_results;
DROP POLICY IF EXISTS "key_results_manage_policy" ON key_results;

DROP POLICY IF EXISTS "activities_read_policy" ON activities;
DROP POLICY IF EXISTS "activities_manage_policy" ON activities;

DROP POLICY IF EXISTS "strategic_notes_read_policy" ON strategic_notes;
DROP POLICY IF EXISTS "strategic_notes_manage_policy" ON strategic_notes;

DROP POLICY IF EXISTS "governance_config_read_policy" ON governance_config;
DROP POLICY IF EXISTS "governance_config_manage_policy" ON governance_config;

-- ============================================================================
-- RECREATE STRICT POLICIES (Authenticated users ONLY)
-- ============================================================================

-- Profiles: All operations require authenticated
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_authenticated_only" ON profiles
  FOR ALL 
  TO authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- Audit Logs: All operations require authenticated
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_authenticated_only" ON audit_logs
  FOR ALL 
  TO authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- Business Units: All operations require authenticated
ALTER TABLE business_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "business_units_authenticated_only" ON business_units
  FOR ALL 
  TO authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- Key Results: All operations require authenticated
ALTER TABLE key_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "key_results_authenticated_only" ON key_results
  FOR ALL 
  TO authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- Activities: All operations require authenticated
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activities_authenticated_only" ON activities
  FOR ALL 
  TO authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- Strategic Notes: All operations require authenticated
ALTER TABLE strategic_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "strategic_notes_authenticated_only" ON strategic_notes
  FOR ALL 
  TO authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- Governance Config: All operations require authenticated
ALTER TABLE governance_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "governance_config_authenticated_only" ON governance_config
  FOR ALL 
  TO authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- VERIFY
-- ============================================================================

SELECT 'Applied!' as status;

-- List all policies
SELECT tablename, policyname, cmd, roles FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
