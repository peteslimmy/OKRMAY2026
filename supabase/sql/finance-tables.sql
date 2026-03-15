-- ============================================================================
-- Finance Module Tables
-- Run this in Supabase SQL Editor to create finance-related tables
-- ============================================================================

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $
BEGIN
  -- Handle case where no user is authenticated (auth.uid() returns NULL)
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE auth_id = auth.uid()
    AND role IN ('SuperAdmin', 'Admin')
  );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 1. VIOLATIONS TABLE (Phone Fines)
-- ============================================================================
CREATE TABLE IF NOT EXISTS violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  paid BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE violations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read violations
CREATE POLICY "Allow authenticated read violations" ON violations
  FOR SELECT USING (auth.role() = 'authenticated');

-- SECURITY: Only admins can insert violations
CREATE POLICY "Allow admins insert violations" ON violations
  FOR INSERT WITH CHECK (is_admin_user() OR auth.role() = 'service_role');

-- Allow users to update only the 'paid' status - admins can update any
CREATE POLICY "Allow update violations paid status" ON violations
  FOR UPDATE USING (is_admin_user() OR auth.role() = 'service_role');

-- SECURITY: Restrict DELETE to service_role only
CREATE POLICY "Allow service role delete violations" ON violations
  FOR DELETE USING (auth.role() = 'service_role');

-- ============================================================================
-- 2. CONTRIBUTIONS TABLE (Donations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read contributions" ON contributions
  FOR SELECT USING (auth.role() = 'authenticated');

-- SECURITY: Only admins can insert contributions
CREATE POLICY "Allow admins insert contributions" ON contributions
  FOR INSERT WITH CHECK (is_admin_user() OR auth.role() = 'service_role');

-- Allow admins to update contributions
CREATE POLICY "Allow update own contributions" ON contributions
  FOR UPDATE USING (is_admin_user() OR auth.role() = 'service_role');

-- SECURITY: Restrict DELETE to service_role only
CREATE POLICY "Allow service role delete contributions" ON contributions
  FOR DELETE USING (auth.role() = 'service_role');

-- ============================================================================
-- 3. EXPENSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(15,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  requestor TEXT NOT NULL,
  approver TEXT,
  receiver TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read expenses" ON expenses
  FOR SELECT USING (auth.role() = 'authenticated');

-- SECURITY: Only admins can insert expenses
CREATE POLICY "Allow admins insert expenses" ON expenses
  FOR INSERT WITH CHECK (is_admin_user() OR auth.role() = 'service_role');

-- Allow admins to update expenses - primarily for marking approval status
CREATE POLICY "Allow update expenses" ON expenses
  FOR UPDATE USING (is_admin_user() OR auth.role() = 'service_role');

-- SECURITY: Restrict DELETE to service_role only
CREATE POLICY "Allow service role delete expenses" ON expenses
  FOR DELETE USING (auth.role() = 'service_role');

-- ============================================================================
-- 4. MONTHLY_FINANCIAL_SUMMARY TABLE (For Chart Data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS monthly_financial_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month INTEGER NOT NULL, -- 1-12
  year INTEGER NOT NULL,
  total_income DECIMAL(15,2) DEFAULT 0,
  total_expenses DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(month, year)
);

ALTER TABLE monthly_financial_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read monthly_financial_summary" ON monthly_financial_summary
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admins to insert/update monthly summaries
CREATE POLICY "Allow authenticated insert monthly_financial_summary" ON monthly_financial_summary
  FOR INSERT WITH CHECK (is_admin_user() OR auth.role() = 'service_role');

-- Allow admins to update monthly summaries
CREATE POLICY "Allow authenticated update monthly_financial_summary" ON monthly_financial_summary
  FOR UPDATE USING (is_admin_user() OR auth.role() = 'service_role');

-- SECURITY: Restrict DELETE to service_role only
CREATE POLICY "Allow service role delete monthly_financial_summary" ON monthly_financial_summary
  FOR DELETE USING (auth.role() = 'service_role');

-- Seed some initial monthly data
INSERT INTO monthly_financial_summary (month, year, total_income, total_expenses) VALUES
  (1, 2026, 125000, 65000),
  (2, 2026, 145000, 72000),
  (3, 2026, 98000, 45000)
ON CONFLICT (month, year) DO NOTHING;

-- ============================================================================
-- 5. ATTENDANCE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  department TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Present', 'Remote', 'Absent', 'Excused')),
  time_joined TIMESTAMPTZ,
  participation_score INTEGER DEFAULT 0,
  meeting_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read attendance records
CREATE POLICY "Allow authenticated read attendance" ON attendance
  FOR SELECT USING (auth.role() = 'authenticated');

-- SECURITY: Only admins can insert attendance (e.g., recording meeting attendance)
CREATE POLICY "Allow admins insert attendance" ON attendance
  FOR INSERT WITH CHECK (is_admin_user() OR auth.role() = 'service_role');

-- Allow admins to update attendance records
CREATE POLICY "Allow update own attendance" ON attendance
  FOR UPDATE USING (is_admin_user() OR auth.role() = 'service_role');

-- SECURITY: Restrict DELETE to service_role only
CREATE POLICY "Allow service role delete attendance" ON attendance
  FOR DELETE USING (auth.role() = 'service_role');
