-- Database schema for OKR Violation module

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
  category_id UUID REFERENCES violation_categories(id),
  violator_id UUID,
  bu_id UUID,
  week_reference TEXT,
  notes TEXT,
  status TEXT DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'PAID', 'VOID')),
  created_at TIMESTAMPTIC DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Violation payments table
CREATE TABLE IF NOT EXISTS violation_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  violation_id UUID REFERENCES violations(id),
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
  status TEXT CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  requested_by UUID,
  approved_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Anomaly flags table
CREATE TABLE IF NOT EXISTS anomaly_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT,
  entity_id UUID,
  violation_id UUID,
  flagged_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  is_resolved BOOLEAN DEFAULT false
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT,
  entity_id UUID,
  action TEXT,
  performed_by UUID,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE violations 
  ADD CONSTRAINT fk_violation_category 
  FOREIGN KEY (category_id) REFERENCES violation_categories(id);

ALTER TABLE violation_payments 
  ADD CONSTRAINT fk_violation 
  FOREIGN KEY (violation_id) REFERENCES violations(id);

ALTER TABLE fund_ledger 
  ADD CONSTRAINT fk_ledger_entry 
  FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE disbursement_requests 
  ADD CONSTRAINT fk_request_approver 
  FOREIGN KEY (approved_by) REFERENCES users(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_violation_categories_severity ON violation_categories(severity_level);
CREATE INDEX IF NOT EXISTS idx_violations_status ON violations(status);
CREATE INDEX IF NOT EXISTS idx_violations_bu ON violations(bu_id);
CREATE INDEX IF NOT EXISTS idx_fund_ledger_type ON fund_ledger(entry_type);
CREATE INDEX IF NOT EXISTS idx_fund_ledger_violation ON fund_ledger(entry_type, amount);
CREATE INDEX IF NOT EXISTS idx_disbursement_status ON disbursement_requests(status);