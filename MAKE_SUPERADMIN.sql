-- ============================================================================
-- SUPER ADMIN CREATION SCRIPT
-- Run this in Supabase SQL Editor AFTER setting up your database
-- ============================================================================

-- Option 1: If you already have an auth user, link their profile as SuperAdmin
-- Replace 'user-email@example.com' with the actual user email
-- UPDATE profiles SET role = 'SuperAdmin' WHERE email = 'user-email@example.com';

-- Option 2: Create a placeholder super admin profile (without auth)
-- This is useful for testing - the user will need to sign up and you can then update their role

INSERT INTO profiles (
  email,
  firstName,
  lastName,
  name,
  role,
  department,
  status
) VALUES (
  'superadmin@example.com',
  'Super',
  'Admin',
  'Super Admin',
  'SuperAdmin',
  'IT',
  'Active'
) ON CONFLICT (email) DO UPDATE SET role = 'SuperAdmin';

-- Verify the super admin was created/updated
SELECT id, email, name, role, status FROM profiles WHERE role = 'SuperAdmin';
