-- ============================================================================
-- 4CORE OKR PLATFORM - COMPLETE DATABASE SETUP
-- Run this in Supabase SQL Editor (qshewfoyhglgweeotttj.supabase.co)
-- ============================================================================

-- ============================================================================
-- PART 1: CORE TABLES (Objectives, KRs, Sub-KRs)
-- ============================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'User',
  department TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Business Units Table
CREATE TABLE IF NOT EXISTS business_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  head_user_id UUID REFERENCES profiles(id),
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Yearly Themes Table
CREATE TABLE IF NOT EXISTS yearly_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL CHECK (year >= 2020),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(year)
);

-- 4. Objectives Table
CREATE TABLE IF NOT EXISTS objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  yearly_theme_id UUID REFERENCES yearly_themes(id),
  quarter TEXT CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
  year INTEGER NOT NULL CHECK (year >= 2020),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Draft', 'Active', 'Locked')),
  progress DECIMAL(5,2) DEFAULT 0,
  lock_date TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Key Results Table
CREATE TABLE IF NOT EXISTS key_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID REFERENCES objectives(id) ON DELETE CASCADE,
  bu_id UUID REFERENCES business_units(id),
  title TEXT NOT NULL,
  description TEXT,
  quarter TEXT CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
  year INTEGER NOT NULL,
  target_value DECIMAL(15,2) DEFAULT 100,
  current_value DECIMAL(15,2) DEFAULT 0,
  unit TEXT DEFAULT '%',
  weight DECIMAL(3,2) DEFAULT 1.0,
  kr_slot TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Sub-KRs Table
CREATE TABLE IF NOT EXISTS sub_krs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kr_id UUID REFERENCES key_results(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_value DECIMAL(15,2) DEFAULT 100,
  current_value DECIMAL(15,2) DEFAULT 0,
  unit TEXT DEFAULT '%',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(kr_id, code)
);

-- 7. Activities Table (Weekly Goals & Tasks)
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id),
  bu_id UUID REFERENCES business_units(id),
  key_result_id UUID REFERENCES key_results(id),
  sub_kr_id UUID REFERENCES sub_krs(id),
  week INTEGER NOT NULL CHECK (week >= 1 AND week <= 53),
  year INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tasks JSONB DEFAULT '[]',
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'InProgress', 'Done', 'NotDone')),
  score INTEGER DEFAULT 0,
  lock_state TEXT DEFAULT 'OPEN' CHECK (lock_state IN ('OPEN', 'SOFT_LOCKED', 'HARD_LOCKED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 2: GOVERNANCE & LOCKING
-- ============================================================================

-- 8. Governance Configuration
CREATE TABLE IF NOT EXISTS governance_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_lock_day INTEGER DEFAULT 2,
  content_lock_time TEXT DEFAULT '17:00',
  final_lock_day INTEGER DEFAULT 9,
  final_lock_time TEXT DEFAULT '11:00',
  manual_content_lock BOOLEAN DEFAULT false,
  manual_final_lock BOOLEAN DEFAULT false,
  disable_locks BOOLEAN DEFAULT false,
  smtp_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Unlock Requests
CREATE TABLE IF NOT EXISTS unlock_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week INTEGER NOT NULL,
  year INTEGER NOT NULL,
  requested_by_id UUID REFERENCES profiles(id),
  requested_by_name TEXT,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED')),
  reviewed_by_id UUID,
  reviewed_by_name TEXT,
  review_note TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  performed_by UUID,
  user_id UUID,
  reason TEXT,
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 3: VIOLATIONS & ANOMALIES
-- ============================================================================

-- 11. Violations Table
CREATE TABLE IF NOT EXISTS violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  paid BOOLEAN DEFAULT false,
  severity TEXT DEFAULT 'MINOR' CHECK (severity IN ('MINOR', 'MAJOR', 'CRITICAL')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Violation Categories
CREATE TABLE IF NOT EXISTS violation_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  default_amount DECIMAL(15,2) NOT NULL,
  severity TEXT CHECK (severity IN ('MINOR', 'MAJOR', 'CRITICAL')),
  grace_period_hours INTEGER DEFAULT 24,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Anomaly Alerts
CREATE TABLE IF NOT EXISTS anomaly_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  severity TEXT DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  user_id UUID,
  user_name TEXT,
  description TEXT,
  details JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 4: FINANCIAL MODULE
-- ============================================================================

-- 14. Monthly Actuals
CREATE TABLE IF NOT EXISTS monthly_actuals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bu_id UUID REFERENCES business_units(id),
  bu_name TEXT NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  projection DECIMAL(15,2) NOT NULL,
  actual DECIMAL(15,2),
  variance DECIMAL(15,2),
  variance_pct DECIMAL(5,2),
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'FILED', 'REVIEWED', 'APPROVED')),
  filed_by UUID,
  filed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bu_id, month, year)
);

-- 15. Fund Requests
CREATE TABLE IF NOT EXISTS fund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT UNIQUE NOT NULL,
  bu_id UUID REFERENCES business_units(id),
  bu_name TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  purpose TEXT NOT NULL,
  category TEXT CHECK (category IN ('OPERATIONS', 'MARKETING', 'TRAINING', 'EQUIPMENT', 'OTHER')),
  status TEXT DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'APPROVED_FINANCE', 'APPROVED_SUPER_ADMIN', 'DISBURSED', 'REJECTED')),
  requested_by UUID,
  requested_by_name TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  finance_approved_at TIMESTAMPTZ,
  finance_notes TEXT,
  super_admin_approved_at TIMESTAMPTZ,
  super_admin_notes TEXT,
  disbursed_at TIMESTAMPTZ,
  receipt_url TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Violation Ledger (Mini-Ledger)
CREATE TABLE IF NOT EXISTS violation_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  violation_id UUID REFERENCES violations(id),
  user_id UUID,
  user_name TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'WAIVED', 'DISPUTED')),
  payment_method TEXT CHECK (payment_method IN ('CASH', 'TRANSFER', 'DEDUCTION')),
  reference_number TEXT,
  paid_at TIMESTAMPTZ,
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 5: VIEWS
-- ============================================================================

-- Variance Analysis View
CREATE OR REPLACE VIEW v_bu_variance_analysis AS
SELECT 
  bu_id, bu_name, month, year, projection, actual, variance, variance_pct, status,
  CASE 
    WHEN variance_pct IS NULL THEN 'NO_DATA'
    WHEN variance_pct > 10 THEN 'OVER_PERFORMANCE'
    WHEN variance_pct >= -10 AND variance_pct <= 10 THEN 'ON_TRACK'
    ELSE 'UNDER_PERFORMANCE'
  END AS performance_category
FROM monthly_actuals WHERE actual IS NOT NULL;

-- BU Ranking View
CREATE OR REPLACE VIEW v_bu_ranking AS
SELECT 
  bu_id, bu_name,
  SUM(actual) AS total_actual,
  SUM(projection) AS total_projection,
  SUM(actual) - SUM(projection) AS total_variance,
  COUNT(*) AS months_filed
FROM monthly_actuals
WHERE actual IS NOT NULL AND status IN ('FILED', 'REVIEWED', 'APPROVED')
GROUP BY bu_id, bu_name;

-- Fund Requests View
CREATE OR REPLACE VIEW v_fund_requests AS
SELECT 
  fr.*,
  CASE 
    WHEN status = 'REQUESTED' THEN 0
    WHEN status = 'APPROVED_FINANCE' THEN 1
    WHEN status = 'APPROVED_SUPER_ADMIN' THEN 2
    WHEN status = 'DISBURSED' THEN 3
    ELSE -1
  END AS approval_level
FROM fund_requests fr;

-- Week Lock Status View
CREATE OR REPLACE VIEW v_week_lock_status AS
SELECT DISTINCT ON (week, year) week, year, 'OPEN' AS lock_state
FROM activities ORDER BY week, year DESC;

-- ============================================================================
-- PART 6: FUNCTIONS
-- ============================================================================

-- Update Variance Trigger Function
CREATE OR REPLACE FUNCTION update_variance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.actual IS NOT NULL AND NEW.projection > 0 THEN
    NEW.variance := NEW.actual - NEW.projection;
    NEW.variance_pct := ROUND(((NEW.actual - NEW.projection) / NEW.projection) * 100, 2);
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_variance
  BEFORE INSERT OR UPDATE ON monthly_actuals
  FOR EACH ROW EXECUTE FUNCTION update_variance();

-- Get Lock State Function (WAT timezone)
CREATE OR REPLACE FUNCTION get_lock_state(p_week INTEGER, p_year INTEGER)
RETURNS TEXT AS $$
DECLARE
  config RECORD;
  now_wat TIMESTAMP;
  target_date DATE;
  day_of_week INTEGER;
  soft_lock_dt TIMESTAMP;
  hard_lock_dt TIMESTAMP;
BEGIN
  now_wat := timezone('Africa/Lagos', now())::TIMESTAMP;
  
  SELECT content_lock_day, content_lock_time, final_lock_day, final_lock_time
  INTO config FROM governance_config LIMIT 1;
  
  IF NOT FOUND OR config IS NULL THEN RETURN 'OPEN'; END IF;
  
  day_of_week := EXTRACT(DOW FROM make_date(p_year, 1, 1))::INTEGER;
  target_date := make_date(p_year, 1, 1) + ((p_week - 1) * 7)::INTEGER - day_of_week + 1;
  
  soft_lock_dt := target_date + (COALESCE(config.content_lock_day, 2) || ' days')::INTERVAL + (COALESCE(config.content_lock_time, '17:00') || ':00')::INTERVAL;
  hard_lock_dt := target_date + (COALESCE(config.final_lock_day, 9) || ' days')::INTERVAL + (COALESCE(config.final_lock_time, '11:00') || ':00')::INTERVAL;
  
  IF now_wat >= hard_lock_dt THEN RETURN 'HARD_LOCKED';
  ELSIF now_wat >= soft_lock_dt THEN RETURN 'SOFT_LOCKED';
  END IF;
  
  RETURN 'OPEN';
END;
$$ LANGUAGE plpgsql;

-- Governance Score Function
CREATE OR REPLACE FUNCTION calculate_governance_score(p_year INTEGER, p_quarter TEXT)
RETURNS DECIMAL(5,2) AS $$
BEGIN
  RETURN 75.00;
END;
$$ LANGUAGE plpgsql;

-- Generate Request Number
CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS TEXT AS $$
DECLARE
  v_count INTEGER;
  v_year INTEGER;
BEGIN
  v_year := EXTRACT(YEAR FROM NOW())::INTEGER;
  SELECT COUNT(*) + 1 INTO v_count FROM fund_requests WHERE EXTRACT(YEAR FROM created_at) = v_year;
  RETURN 'FDR-' || v_year || '-' || LPAD(v_count::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 7: GRANTS
-- ============================================================================

GRANT SELECT ON profiles TO authenticated;
GRANT SELECT ON business_units TO authenticated;
GRANT SELECT ON yearly_themes TO authenticated;
GRANT SELECT ON objectives TO authenticated;
GRANT SELECT ON key_results TO authenticated;
GRANT SELECT ON sub_krs TO authenticated;
GRANT SELECT ON activities TO authenticated;
GRANT SELECT ON governance_config TO authenticated;
GRANT SELECT ON unlock_requests TO authenticated;
GRANT SELECT ON audit_logs TO authenticated;
GRANT SELECT ON violations TO authenticated;
GRANT SELECT ON violation_categories TO authenticated;
GRANT SELECT ON anomaly_alerts TO authenticated;
GRANT SELECT ON monthly_actuals TO authenticated;
GRANT SELECT ON fund_requests TO authenticated;
GRANT SELECT ON violation_ledger TO authenticated;
GRANT SELECT ON v_bu_variance_analysis TO authenticated;
GRANT SELECT ON v_bu_ranking TO authenticated;
GRANT SELECT ON v_fund_requests TO authenticated;
GRANT SELECT ON v_week_lock_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_lock_state TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_governance_score TO authenticated;
GRANT EXECUTE ON FUNCTION generate_request_number TO authenticated;

-- ============================================================================
-- PART 8: SEED DATA (Optional - for testing)
-- ============================================================================

-- Insert default governance config
INSERT INTO governance_config (content_lock_day, content_lock_time, final_lock_day, final_lock_time)
VALUES (2, '17:00', 9, '11:00')
ON CONFLICT DO NOTHING;

-- Insert sample violation categories
INSERT INTO violation_categories (name, description, default_amount, severity, grace_period_hours) VALUES
  ('Late Submission', 'Submitting weekly report after deadline', 5000, 'MINOR', 24),
  ('Missing Report', 'Complete failure to submit weekly report', 10000, 'MAJOR', 0),
  ('Policy Violation', 'Violation of company policies', 15000, 'MAJOR', 48),
  ('Attendance', 'Unexcused absence or lateness', 2500, 'MINOR', 24),
  ('Data Integrity', 'Manipulating data after hard-lock', 50000, 'CRITICAL', 0)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
SELECT '4CORE OKR Platform - Database setup complete!' AS status;