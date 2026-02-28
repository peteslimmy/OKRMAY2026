-- ============================================================================
-- CONFIGURE SUPABASE SMTP FOR PASSWORD RESETS
-- ============================================================================

-- This script shows current auth settings
-- To enable password resets, you need to configure SMTP in Supabase Dashboard

SELECT 
  id,
  email as provider,
  'Not configured' as smtp_status
FROM auth.providers
WHERE id = 'email';

-- Check current auth config
SELECT * FROM auth.config LIMIT 1;

-- ============================================================================
-- ALTERNATIVE: Create a custom password reset using your edge function
-- But first, the edge function must be deployed
-- ============================================================================

-- To deploy, run:
-- npx supabase functions deploy send-email
