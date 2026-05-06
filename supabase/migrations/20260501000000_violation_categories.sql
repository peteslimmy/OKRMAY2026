-- Database schema for OKR Violation module
-- Run this SQL to create the required tables

-- Drop existing tables if they have issues (be careful in production!)
-- DROP TABLE IF EXISTS disbursement_requests CASCADE;
-- DROP TABLE IF EXISTS fund_ledger CASCADE;
-- DROP TABLE IF EXISTS violation_payments CASCADE;
-- DROP TABLE IF EXISTS violations CASCADE;
-- DROP TABLE IF EXISTS violation_categories CASCADE;

-- Violation Categories table
CREATE TABLE IF NOT EXISTS violation_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  severity_level TEXT CHECK (severity_level IN ('Minor', 'Major', 'Critical')),
  default_fine_amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true
);

-- Violations table
CREATE TABLE IF NOT EXISTS violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID,
  violator_id UUID,
  bu_id UUID,
  week_reference TEXT,
  notes TEXT,
  status TEXT DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'PAID', 'VOID')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Violation payments table
CREATE TABLE IF NOT EXISTS violation_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  violation_id UUID,
  amount NUMERIC NOT NULL,
  payment_method TEXT,
  payment_reference TEXT,
  paid_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fund ledger table
CREATE TABLE IF NOT EXISTS fund_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_type TEXT CHECK (entry_type IN ('CREDIT', 'DEBIT')),
  amount NUMERIC NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- Disbursement requests table
CREATE TABLE IF NOT EXISTS disbursement_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount NUMERIC NOT NULL,
  purpose TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  requested_by UUID,
  approved_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_violation_categories_severity ON violation_categories(severity_level);
CREATE INDEX IF NOT EXISTS idx_violations_status ON violations(status);
CREATE INDEX IF NOT EXISTS idx_violations_bu ON violations(bu_id);
CREATE INDEX IF NOT EXISTS idx_fund_ledger_type ON fund_ledger(entry_type);
CREATE INDEX IF NOT EXISTS idx_disbursement_status ON disbursement_requests(status);

-- Enable RLS
ALTER TABLE violation_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE violation_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE disbursement_requests ENABLE ROW LEVEL SECURITY;

-- Policies (allow all for authenticated users)
CREATE POLICY "Allow all for authenticated users" ON violation_categories
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON violations
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON violation_payments
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON fund_ledger
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON disbursement_requests
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert some default violation categories
INSERT INTO violation_categories (name, description, severity_level, default_fine_amount) VALUES
  ('Late Submission', 'OKR submission after deadline', 'Minor', 100.00),
  ('Missed Check-in', 'Failed to complete weekly check-in', 'Minor', 50.00),
  ('Incomplete KR', 'Key Result not completed by quarter end', 'Major', 200.00),
  ('No Progress', 'Zero progress reported for 2+ weeks', 'Major', 150.00),
  ('Data Integrity', 'Falsifying progress data', 'Critical', 500.00)
ON CONFLICT DO NOTHING;