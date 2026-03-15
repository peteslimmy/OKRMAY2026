-- Fix: Allow authenticated users to manage profiles
-- More permissive policies that work with Supabase Auth

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Allow service role insert profiles" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated read profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role full access" ON profiles;

-- Allow anyone to read profiles (needed for user directory)
CREATE POLICY "Allow public read profiles" ON profiles
  FOR SELECT USING (true);

-- Allow authenticated users to insert profiles
CREATE POLICY "Allow authenticated insert profiles" ON profiles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to update profiles
CREATE POLICY "Allow authenticated update profiles" ON profiles
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to delete profiles
CREATE POLICY "Allow authenticated delete profiles" ON profiles
  FOR DELETE USING (auth.uid() IS NOT NULL);
