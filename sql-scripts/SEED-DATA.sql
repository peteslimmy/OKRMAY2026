-- ============================================================================
-- 4CORE OKR PLATFORM - SAMPLE SEED DATA
-- Uses gen_random_uuid() for automatic UUID generation
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. INSERT SAMPLE PROFILES
-- ============================================================================
INSERT INTO profiles (name, email, role, department) VALUES
  ('Super Admin', 'superadmin@4core.com', 'SuperAdmin', 'Executive'),
  ('Admin User', 'admin@4core.com', 'Admin', 'Administration'),
  ('Finance Officer', 'finance@4core.com', 'Finance', 'Finance'),
  ('Director John', 'director@4core.com', 'Director', 'Operations'),
  ('BU Lead Mary', 'mary@4core.com', 'User', 'Sales'),
  ('BU Lead Peter', 'peter@4core.com', 'User', 'Marketing');

-- ============================================================================
-- 2. INSERT SAMPLE BUSINESS UNITS  
-- ============================================================================
INSERT INTO business_units (name, description) VALUES
  ('Sales', 'Sales and Business Development'),
  ('Marketing', 'Marketing and Brand'),
  ('Operations', 'Operations and Support'),
  ('Finance', 'Finance and Accounting');

-- ============================================================================
-- 3. INSERT SAMPLE YEARLY THEME
-- ============================================================================
INSERT INTO yearly_themes (year, title, description, status) VALUES
  (2026, 'Growth & Excellence 2026', 'Strategic theme for 2026', 'Active');

-- ============================================================================
-- 4. INSERT SAMPLE OBJECTIVES
-- ============================================================================
INSERT INTO objectives (quarter, year, title, description, status, progress) VALUES
  ('Q1', 2026, 'Q1 Revenue Growth', 'Achieve 25% revenue growth', 'Active', 35),
  ('Q1', 2026, 'Customer Acquisition', 'Acquire 50 new customers', 'Active', 28),
  ('Q1', 2026, 'Operational Excellence', 'Reduce costs by 15%', 'Active', 42);

-- ============================================================================
-- 5. INSERT SAMPLE KEY RESULTS (using auto-generated UUIDs)
-- ============================================================================
INSERT INTO key_results (objective_id, bu_id, title, quarter, year, target_value, current_value, unit, weight) 
SELECT o.id, b.id, 'Q1 Sales Target', 'Q1', 2026, 100000000, 35000000, 'NGN', 1.0
FROM objectives o, business_units b WHERE o.title = 'Q1 Revenue Growth' AND b.name = 'Sales';

INSERT INTO key_results (objective_id, bu_id, title, quarter, year, target_value, current_value, unit, weight)
SELECT o.id, b.id, 'Marketing ROI', 'Q1', 2026, 500, 180, '%', 0.8
FROM objectives o, business_units b WHERE o.title = 'Q1 Revenue Growth' AND b.name = 'Marketing';

INSERT INTO key_results (objective_id, bu_id, title, quarter, year, target_value, current_value, unit, weight)
SELECT o.id, b.id, 'New Customers', 'Q1', 2026, 50, 14, 'customers', 1.0
FROM objectives o, business_units b WHERE o.title = 'Customer Acquisition' AND b.name = 'Sales';

INSERT INTO key_results (objective_id, bu_id, title, quarter, year, target_value, current_value, unit, weight)
SELECT o.id, b.id, 'Cost Reduction', 'Q1', 2026, 15, 6, '%', 1.0
FROM objectives o, business_units b WHERE o.title = 'Operational Excellence' AND b.name = 'Operations';

-- ============================================================================
-- 6. INSERT SAMPLE SUB-KRS
-- ============================================================================
INSERT INTO sub_krs (kr_id, code, title, target_value, current_value, unit)
SELECT kr.id, 'SALES-001', 'Monthly Sales Target', 30000000, 12000000, 'NGN'
FROM key_results kr WHERE kr.title = 'Q1 Sales Target';

INSERT INTO sub_krs (kr_id, code, title, target_value, current_value, unit)
SELECT kr.id, 'SALES-002', 'Enterprise Deals', 10, 4, 'deals'
FROM key_results kr WHERE kr.title = 'Q1 Sales Target';

INSERT INTO sub_krs (kr_id, code, title, target_value, current_value, unit)
SELECT kr.id, 'MKT-001', 'Lead Generation', 500, 180, 'leads'
FROM key_results kr WHERE kr.title = 'Marketing ROI';

INSERT INTO sub_krs (kr_id, code, title, target_value, current_value, unit)
SELECT kr.id, 'MKT-002', 'Conversion Rate', 25, 9, '%'
FROM key_results kr WHERE kr.title = 'Marketing ROI';

-- ============================================================================
-- 7. INSERT SAMPLE MONTHLY ACTUALS
-- ============================================================================
INSERT INTO monthly_actuals (bu_id, bu_name, month, year, projection, actual, status)
SELECT b.id, b.name, 1, 2026, 80000000, 85000000, 'APPROVED'
FROM business_units b WHERE b.name = 'Sales';

INSERT INTO monthly_actuals (bu_id, bu_name, month, year, projection, actual, status)
SELECT b.id, b.name, 2, 2026, 85000000, 82000000, 'APPROVED'
FROM business_units b WHERE b.name = 'Sales';

INSERT INTO monthly_actuals (bu_id, bu_name, month, year, projection, actual, status)
SELECT b.id, b.name, 1, 2026, 40000000, 38000000, 'APPROVED'
FROM business_units b WHERE b.name = 'Marketing';

-- ============================================================================
-- 8. INSERT GOVERNANCE CONFIG
-- ============================================================================
INSERT INTO governance_config DEFAULT VALUES ON CONFLICT DO NOTHING;

-- ============================================================================
-- 9. INSERT SAMPLE VIOLATIONS
-- ============================================================================
INSERT INTO violations (name, department, amount, date, severity) VALUES
  ('Late Weekly Report - Week 5', 'Sales', 5000, '2026-02-07', 'MINOR'),
  ('Missing Quarterly KR Update', 'Marketing', 10000, '2026-02-15', 'MAJOR');

-- ============================================================================
-- CONFIRMATION
-- ============================================================================
SELECT 'Seed data inserted successfully!' AS status;