-- ============================================================================
-- GOVERNANCE SMTP INTEGRATION: Persistent configuration
-- Enables secure storage of corporate dispatch relay credentials
-- ============================================================================

ALTER TABLE governance_config 
  ADD COLUMN IF NOT EXISTS smtp_host TEXT,
  ADD COLUMN IF NOT EXISTS smtp_port INTEGER DEFAULT 587,
  ADD COLUMN IF NOT EXISTS smtp_user TEXT,
  ADD COLUMN IF NOT EXISTS smtp_pass TEXT,
  ADD COLUMN IF NOT EXISTS brand_logo TEXT,
  ADD COLUMN IF NOT EXISTS brand_landing_image TEXT,
  ADD COLUMN IF NOT EXISTS brand_login_image TEXT;

-- Migration complete. Governance configuration now supports centralized SMTP state.
