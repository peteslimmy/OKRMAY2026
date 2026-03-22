-- ============================================================================
-- FIX: Add INSERT/UPDATE/DELETE policies for authenticated users on key_results
-- ============================================================================

-- Drop existing policies if they exist (will recreate)
DROP POLICY IF EXISTS "auth_can_insert_kr" ON key_results;
DROP POLICY IF EXISTS "auth_can_update_kr" ON key_results;
DROP POLICY IF EXISTS "auth_can_delete_kr" ON key_results;

-- Allow authenticated users to INSERT key_results
CREATE POLICY "auth_can_insert_kr" ON key_results
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to UPDATE key_results
CREATE POLICY "auth_can_update_kr" ON key_results
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Allow authenticated users to DELETE key_results
CREATE POLICY "auth_can_delete_kr" ON key_results
  FOR DELETE TO authenticated USING (true);

SELECT 'key_results INSERT/UPDATE/DELETE policies created for authenticated users' as status;
