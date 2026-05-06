-- ============================================================================
-- 4CORE OKR PLATFORM - ROW LEVEL SECURITY (RLS) POLICIES
-- Simplified version - Run this in Supabase SQL Editor
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE yearly_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_krs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlock_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE violation_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomaly_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_actuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE violation_ledger ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES - Simple: Allow all authenticated users
-- ============================================================================

CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth_id = auth.uid());

-- ============================================================================
-- BUSINESS UNITS POLICIES
-- ============================================================================

CREATE POLICY "Business units readable by all"
  ON business_units FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage business units"
  ON business_units FOR ALL
  TO authenticated
  USING (true);

-- ============================================================================
-- OBJECTIVES POLICIES
-- ============================================================================

CREATE POLICY "Objectives readable by all"
  ON objectives FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Directors+ can manage objectives"
  ON objectives FOR ALL
  TO authenticated
  USING (true);

-- ============================================================================
-- KEY RESULTS POLICIES
-- ============================================================================

CREATE POLICY "Key results readable by all"
  ON key_results FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Directors+ can manage key results"
  ON key_results FOR ALL
  TO authenticated
  USING (true);

-- ============================================================================
-- SUB_KRS POLICIES
-- ============================================================================

CREATE POLICY "Sub-KRs readable by all"
  ON sub_krs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Directors+ can manage sub_krs"
  ON sub_krs FOR ALL
  TO authenticated
  USING (true);

-- ============================================================================
-- ACTIVITIES POLICIES
-- ============================================================================

CREATE POLICY "Activities readable by authenticated"
  ON activities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own activities"
  ON activities FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admins can delete activities"
  ON activities FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- GOVERNANCE CONFIG POLICIES
-- ============================================================================

CREATE POLICY "Config readable by authenticated"
  ON governance_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "SuperAdmins can manage config"
  ON governance_config FOR ALL
  TO authenticated
  USING (true);

-- ============================================================================
-- UNLOCK REQUESTS POLICIES
-- ============================================================================

CREATE POLICY "Unlock requests readable"
  ON unlock_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create unlock requests"
  ON unlock_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage unlock requests"
  ON unlock_requests FOR ALL
  TO authenticated
  USING (true);

-- ============================================================================
-- AUDIT LOGS POLICIES
-- ============================================================================

CREATE POLICY "Audit logs readable"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- VIOLATIONS POLICIES
-- ============================================================================

CREATE POLICY "Violations readable"
  ON violations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage violations"
  ON violations FOR ALL
  TO authenticated
  USING (true);

-- ============================================================================
-- VIOLATION CATEGORIES POLICIES
-- ============================================================================

CREATE POLICY "Violation categories readable"
  ON violation_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "SuperAdmins can manage violation categories"
  ON violation_categories FOR ALL
  TO authenticated
  USING (true);

-- ============================================================================
-- ANOMALY ALERTS POLICIES
-- ============================================================================

CREATE POLICY "Anomaly alerts readable"
  ON anomaly_alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage anomaly alerts"
  ON anomaly_alerts FOR ALL
  TO authenticated
  USING (true);

-- ============================================================================
-- MONTHLY ACTUALS POLICIES
-- ============================================================================

CREATE POLICY "Monthly actuals readable"
  ON monthly_actuals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Finance+ can manage monthly actuals"
  ON monthly_actuals FOR ALL
  TO authenticated
  USING (true);

-- ============================================================================
-- FUND REQUESTS POLICIES
-- ============================================================================

CREATE POLICY "Fund requests readable"
  ON fund_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create fund requests"
  ON fund_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Finance+ can manage fund requests"
  ON fund_requests FOR ALL
  TO authenticated
  USING (true);

-- ============================================================================
-- VIOLATION LEDGER POLICIES
-- ============================================================================

CREATE POLICY "Violation ledger readable"
  ON violation_ledger FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage violation ledger"
  ON violation_ledger FOR ALL
  TO authenticated
  USING (true);

-- ============================================================================
-- YEARLY THEMES POLICIES
-- ============================================================================

CREATE POLICY "Yearly themes readable"
  ON yearly_themes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "SuperAdmins can manage yearly themes"
  ON yearly_themes FOR ALL
  TO authenticated
  USING (true);

-- ============================================================================
-- CONFIRMATION
-- ============================================================================
SELECT 'RLS Policies created successfully!' AS status;