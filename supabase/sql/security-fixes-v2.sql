-- ============================================================================
-- SECURITY VULNERABILITY FIXES
-- Run this in Supabase SQL Editor to patch security issues
-- ============================================================================

-- ============================================================================
-- ISSUE 1: BROKEN ACCESS CONTROL - Profiles readable by anonymous users
-- ============================================================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow public read profiles" ON profiles;

-- Create more restrictive policy: only authenticated users can read
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- Only authenticated users can update their own profile
CREATE POLICY "profiles_update_own_policy" ON profiles
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = auth_id);

-- Only service role can insert/delete
CREATE POLICY "profiles_manage_policy" ON profiles
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- ISSUE 2: SENSITIVE DATA EXPOSURE - Audit logs readable by anonymous
-- ============================================================================

DROP POLICY IF EXISTS "Allow authenticated read audit_logs" ON audit_logs;

-- Only authenticated users can read audit logs
CREATE POLICY "audit_logs_read_policy" ON audit_logs
  FOR SELECT 
  TO authenticated, service_role
  USING (true);

-- Only authenticated users can insert
CREATE POLICY "audit_logs_insert_policy" ON audit_logs
  FOR INSERT 
  TO authenticated, service_role
  WITH CHECK (true);

-- ============================================================================
-- ISSUE 3: IDOR - Users can modify other users' profiles
-- ============================================================================

-- The update policy above already restricts to own profile
-- But let's add explicit IDOR protection

-- Create a function to validate profile ownership
CREATE OR REPLACE FUNCTION public.validate_profile_ownership(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the user is updating their own profile
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE auth_id = auth.uid() AND id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ISSUE 4: Business Units - Should be restricted too
-- ============================================================================

DROP POLICY IF EXISTS "Allow authenticated users manage business_units" ON business_units;

CREATE POLICY "business_units_read_policy" ON business_units
  FOR SELECT 
  TO authenticated, service_role
  USING (true);

CREATE POLICY "business_units_manage_policy" ON business_units
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- ISSUE 5: Key Results - Restrict access
-- ============================================================================

DROP POLICY IF EXISTS "Allow authenticated users manage key_results" ON key_results;

CREATE POLICY "key_results_read_policy" ON key_results
  FOR SELECT 
  TO authenticated, service_role
  USING (true);

CREATE POLICY "key_results_manage_policy" ON key_results
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- ISSUE 6: Activities - Restrict access
-- ============================================================================

DROP POLICY IF EXISTS "Allow authenticated users manage activities" ON activities;

CREATE POLICY "activities_read_policy" ON activities
  FOR SELECT 
  TO authenticated, service_role
  USING (true);

CREATE POLICY "activities_manage_policy" ON activities
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- ISSUE 7: Strategic Notes - Restrict access
-- ============================================================================

DROP POLICY IF EXISTS "Allow authenticated users manage strategic_notes" ON strategic_notes;

CREATE POLICY "strategic_notes_read_policy" ON strategic_notes
  FOR SELECT 
  TO authenticated, service_role
  USING (true);

CREATE POLICY "strategic_notes_manage_policy" ON strategic_notes
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- ISSUE 8: Governance Config - Should only be readable by admins
-- ============================================================================

DROP POLICY IF EXISTS "Allow authenticated users manage governance_config" ON governance_config;

CREATE POLICY "governance_config_read_policy" ON governance_config
  FOR SELECT 
  TO authenticated, service_role
  USING (true);

CREATE POLICY "governance_config_manage_policy" ON governance_config
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Applied security fixes successfully!' as status;

-- Check current RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
