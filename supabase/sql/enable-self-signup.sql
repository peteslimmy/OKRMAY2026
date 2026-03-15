-- Enable Self-Signup RLS Policy
-- Run this SQL in your Supabase SQL Editor to allow users to create accounts

-- Drop existing insert policy if exists (optional, for clean slate)
DROP POLICY IF EXISTS "Allow authenticated users insert profiles" ON profiles;

-- Create new policy to allow authenticated users to insert their own profile
CREATE POLICY "Allow authenticated users insert profiles" ON profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Verify the policy was created
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'profiles';
