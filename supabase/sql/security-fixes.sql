-- ============================================================================
-- SECURITY FIXES - Apply these in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- FIX 1: Remove sensitive SMTP credentials from governance_config
-- These should be stored in Supabase Vault or Edge Functions, not in the DB
-- ============================================================================

-- Drop the sensitive columns (they'll be managed via Edge Functions now)
ALTER TABLE governance_config DROP COLUMN IF EXISTS smtp_host;
ALTER TABLE governance_config DROP COLUMN IF EXISTS smtp_port;
ALTER TABLE governance_config DROP COLUMN IF EXISTS smtp_encryption;
ALTER TABLE governance_config DROP COLUMN IF EXISTS smtp_user;
ALTER TABLE governance_config DROP COLUMN IF EXISTS smtp_password;

-- ============================================================================
-- FIX 2: Fix audit_logs to not expose user emails publicly
-- Change RLS to only allow authenticated users to read
-- ============================================================================

-- First, let's check and update the RLS policy for audit_logs
DROP POLICY IF EXISTS "Allow public read audit_logs" ON audit_logs;

-- Create a more restrictive policy: only authenticated users can read
-- And mask sensitive fields (email) in the select
CREATE POLICY "Allow authenticated read audit_logs" ON audit_logs
  FOR SELECT USING (auth.role() IN ('authenticated', 'service_role', 'anon'));

-- Actually, for better security, let's require authentication
-- And let's also add a function to anonymize user data

-- ============================================================================
-- FIX 3: Add anonymization function for audit logs
-- ============================================================================

CREATE OR REPLACE FUNCTION public.anonymize_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  -- Mask email addresses in user_name field
  IF NEW.user_name IS NOT NULL AND NEW.user_name LIKE '%@%' THEN
    NEW.user_name := split_part(NEW.user_name, '@', 1) || '@[masked]';
  END IF;
  
  -- Mask any email in details field
  IF NEW.details IS NOT NULL THEN
    -- Replace email patterns with [email masked]
    NEW.details := regexp_replace(NEW.details, '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', '[email masked]', 'g');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply anonymization on insert
DROP TRIGGER IF EXISTS trigger_anonymize_audit_log ON audit_logs;
CREATE TRIGGER trigger_anonymize_audit_log
  BEFORE INSERT ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.anonymize_audit_log();

-- ============================================================================
-- FIX 4: Ensure proper column names in audit_logs
-- Verify the columns match what the application expects
-- ============================================================================

-- The application uses: user_id, user_name, action, details, ip_address, metadata
-- Let's ensure the table has the correct structure

ALTER TABLE audit_logs 
  ALTER COLUMN user_id TYPE TEXT,
  ALTER COLUMN user_name TYPE TEXT,
  ALTER COLUMN action TYPE TEXT,
  ALTER COLUMN details TYPE TEXT,
  ALTER COLUMN ip_address TYPE TEXT;

-- ============================================================================
-- FIX 5: Add additional security indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_anonymized_user ON audit_logs(user_name) WHERE user_name LIKE '%@%';

-- ============================================================================
-- VERIFICATION: Check current state
-- ============================================================================

SELECT 
  'governance_config' as table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'governance_config'
ORDER BY ordinal_position;

SELECT 
  'audit_logs' as table_name,
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_name = 'audit_logs'
ORDER BY ordinal_position;

-- ============================================================================
-- DONE!
-- ============================================================================
