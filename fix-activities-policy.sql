-- Fix: Allow authenticated users to INSERT, UPDATE, DELETE activities
-- The current policies only allow SELECT for authenticated users

-- Drop the restrictive policies
DROP POLICY IF EXISTS "service_can_all_acts" ON activities;

-- Create a policy that allows authenticated users full access
CREATE POLICY "auth_can_manage_acts" ON activities
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

SELECT 'Fixed! Authenticated users can now manage activities.' as status;
