-- Fix: Update the profiles role check constraint to include all roles from the app
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('SuperAdmin', 'Admin', 'Manager', 'Director', 'BULead', 'Viewer', 'User'));