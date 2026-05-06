-- ============================================================================
-- FUND DISBURSEMENT MODULE
-- Multi-step workflow: REQUESTED → APPROVED_FINANCE → APPROVED_SUPERADMIN → DISBURSED
-- ============================================================================

-- 1. Fund Disbursement Requests Table
CREATE TABLE IF NOT EXISTS fund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT UNIQUE NOT NULL,
  bu_id UUID NOT NULL,
  bu_name TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  purpose TEXT NOT NULL,
  category TEXT CHECK (category IN ('OPERATIONS', 'MARKETING', 'TRAINING', 'EQUIPMENT', 'OTHER')),
  status TEXT DEFAULT 'REQUESTED' CHECK (status IN (
    'REQUESTED', 'APPROVED_FINANCE', 'APPROVED_SUPERADMIN', 'DISBURSED', 'REJECTED'
  )),
  requested_by UUID,
  requested_by_name TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  finance_approver_id UUID,
  finance_approver_name TEXT,
  finance_approved_at TIMESTAMPTZ,
  finance_notes TEXT,
  super_admin_approver_id UUID,
  super_admin_approver_name TEXT,
  super_admin_approved_at TIMESTAMPTZ,
  super_admin_notes TEXT,
  disbursed_at TIMESTAMPTZ,
  receipt_url TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Mini-Ledger for Violation Tracking
CREATE TABLE IF NOT EXISTS violation_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  violation_id UUID NOT NULL,
  user_id UUID NOT NULL,
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

-- 3. Violation Categories Configuration
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

-- 4. Function to auto-generate request number
CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS TEXT AS $$
DECLARE
  v_count INTEGER;
  v_year INTEGER;
  v_number TEXT;
BEGIN
  v_year := EXTRACT(YEAR FROM NOW())::INTEGER;
  SELECT COUNT(*) + 1 INTO v_count FROM fund_requests WHERE EXTRACT(YEAR FROM created_at) = v_year;
  v_number := 'FDR-' || v_year || '-' || LPAD(v_count::TEXT, 5, '0');
  RETURN v_number;
END;
$$ LANGUAGE plpgsql;

-- 5. Request Fund Disbursement
CREATE OR REPLACE FUNCTION request_fund_disbursement(
  p_bu_id UUID,
  p_amount DECIMAL(15,2),
  p_purpose TEXT,
  p_category TEXT
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
  v_request_number TEXT;
  v_user_id UUID;
  v_user_name TEXT;
BEGIN
  v_user_id := auth.uid();
  v_request_number := generate_request_number();
  
  SELECT name INTO v_user_name FROM profiles WHERE auth_id = v_user_id;
  
  INSERT INTO fund_requests (
    request_number, bu_id, bu_name, amount, purpose, category,
    requested_by, requested_by_name, status
  )
  VALUES (
    v_request_number,
    p_bu_id,
    (SELECT name FROM business_units WHERE id = p_bu_id),
    p_amount,
    p_purpose,
    p_category,
    v_user_id,
    v_user_name,
    'REQUESTED'
  )
  RETURNING id INTO v_id;
  
  -- Log in audit
  INSERT INTO audit_logs (entity_type, entity_id, action, performed_by, reason)
  VALUES ('fund_request', v_id, 'CREATE', v_user_id, 'Fund disbursement requested: ' || p_purpose);
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Finance Approval
CREATE OR REPLACE FUNCTION approve_fund_by_finance(
  p_request_id UUID,
  p_notes TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_user_name TEXT;
BEGIN
  v_user_id := auth.uid();
  SELECT name INTO v_user_name FROM profiles WHERE auth_id = v_user_id;
  
  UPDATE fund_requests
  SET 
    status = 'APPROVED_FINANCE',
    finance_approver_id = v_user_id,
    finance_approver_name = v_user_name,
    finance_approved_at = NOW(),
    finance_notes = p_notes,
    updated_at = NOW()
  WHERE id = p_request_id AND status = 'REQUESTED';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or already processed';
  END IF;
  
  INSERT INTO audit_logs (entity_type, entity_id, action, performed_by, reason)
  VALUES ('fund_request', p_request_id, 'APPROVE_FINANCE', v_user_id, p_notes);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 7. Super Admin Final Approval
CREATE OR REPLACE FUNCTION approve_fund_by_super_admin(
  p_request_id UUID,
  p_notes TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_user_name TEXT;
  v_user_role TEXT;
BEGIN
  v_user_id := auth.uid();
  SELECT name, role INTO v_user_name, v_user_role FROM profiles WHERE auth_id = v_user_id;
  
  IF v_user_role != 'SuperAdmin' THEN
    RAISE EXCEPTION 'Super Admin access required';
  END IF;
  
  UPDATE fund_requests
  SET 
    status = 'APPROVED_SUPER_ADMIN',
    super_admin_approver_id = v_user_id,
    super_admin_approver_name = v_user_name,
    super_admin_approved_at = NOW(),
    super_admin_notes = p_notes,
    updated_at = NOW()
  WHERE id = p_request_id AND status = 'APPROVED_FINANCE';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or requires finance approval first';
  END IF;
  
  INSERT INTO audit_logs (entity_type, entity_id, action, performed_by, reason)
  VALUES ('fund_request', p_request_id, 'APPROVE_SUPER_ADMIN', v_user_id, p_notes);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 8. Mark as Disbursed
CREATE OR REPLACE FUNCTION disburse_fund(
  p_request_id UUID,
  p_receipt_url TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  UPDATE fund_requests
  SET 
    status = 'DISBURSED',
    disbursed_at = NOW(),
    receipt_url = p_receipt_url,
    updated_at = NOW()
  WHERE id = p_request_id AND status = 'APPROVED_SUPER_ADMIN';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or not fully approved';
  END IF;
  
  INSERT INTO audit_logs (entity_type, entity_id, action, performed_by, reason)
  VALUES ('fund_request', p_request_id, 'DISBURSE', v_user_id, 'Fund disbursed, receipt: ' || p_receipt_url);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 9. Reject Fund Request
CREATE OR REPLACE FUNCTION reject_fund_request(
  p_request_id UUID,
  p_reason TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_user_name TEXT;
  v_user_role TEXT;
BEGIN
  v_user_id := auth.uid();
  SELECT name, role INTO v_user_name, v_user_role FROM profiles WHERE auth_id = v_user_id;
  
  UPDATE fund_requests
  SET 
    status = 'REJECTED',
    rejection_reason = p_reason,
    updated_at = NOW()
  WHERE id = p_request_id AND status NOT IN ('DISBURSED', 'REJECTED');
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or already processed';
  END IF;
  
  INSERT INTO audit_logs (entity_type, entity_id, action, performed_by, reason)
  VALUES ('fund_request', p_request_id, 'REJECT', v_user_id, p_reason);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 10. Record Violation Payment
CREATE OR REPLACE FUNCTION record_violation_payment(
  p_violation_id UUID,
  p_user_id UUID,
  p_amount DECIMAL(15,2),
  p_payment_method TEXT,
  p_reference TEXT
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
  v_user_name TEXT;
BEGIN
  SELECT name INTO v_user_name FROM profiles WHERE id = p_user_id;
  
  INSERT INTO violation_ledger (
    violation_id, user_id, user_name, amount,
    payment_method, reference_number, status, paid_at
  )
  VALUES (
    p_violation_id, p_user_id, v_user_name, p_amount,
    p_payment_method, p_reference, 'PAID', NOW()
  )
  RETURNING id INTO v_id;
  
  -- Update violations table
  UPDATE violations SET paid = true WHERE id = p_violation_id;
  
  INSERT INTO audit_logs (entity_type, entity_id, action, performed_by, reason)
  VALUES ('violation', p_violation_id, 'PAYMENT_RECEIVED', auth.uid(), 'Paid: ' || p_reference);
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Views
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
FROM fund_requests fr
ORDER BY created_at DESC;

CREATE OR REPLACE VIEW v_violation_ledger_summary AS
SELECT 
  vl.*,
  u.name AS user_name,
  v.name AS violation_name,
  v.date AS violation_date,
  v.department
FROM violation_ledger vl
JOIN users u ON vl.user_id = u.id
JOIN violations v ON vl.violation_id = v.id;

-- GRANTs
GRANT SELECT ON fund_requests TO authenticated;
GRANT SELECT ON violation_ledger TO authenticated;
GRANT SELECT ON violation_categories TO authenticated;
GRANT SELECT ON v_fund_requests TO authenticated;
GRANT SELECT ON v_violation_ledger_summary TO authenticated;
GRANT EXECUTE ON FUNCTION request_fund_disbursement TO authenticated;
GRANT EXECUTE ON FUNCTION approve_fund_by_finance TO authenticated;
GRANT EXECUTE ON FUNCTION approve_fund_by_super_admin TO authenticated;
GRANT EXECUTE ON FUNCTION disburse_fund TO authenticated;
GRANT EXECUTE ON FUNCTION reject_fund_request TO authenticated;
GRANT EXECUTE ON FUNCTION record_violation_payment TO authenticated;