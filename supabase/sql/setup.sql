-- ============================================================================
-- OKR2026 Database Setup Script
-- Run this in Supabase SQL Editor to create all required tables
-- ============================================================================

-- ============================================================================
-- 1. PROFILES TABLE (Required for authentication)
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE,
  email TEXT UNIQUE NOT NULL,
  firstName TEXT NOT NULL,
  lastName TEXT,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Viewer',
  department TEXT DEFAULT 'Registry',
  avatarUrl TEXT DEFAULT '',
  status TEXT DEFAULT 'Active',
  password TEXT,
  mustChangePassword BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow anon users to read profiles (needed for user directory)
CREATE POLICY "Allow public read profiles" ON profiles
  FOR SELECT USING (true);

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth_id = auth.uid());

-- Allow service role to do everything
CREATE POLICY "Service role full access" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- 2. BUSINESS UNITS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS business_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  head_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  contactEmail TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE business_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read business_units" ON business_units
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users manage business_units" ON business_units
  FOR ALL USING (auth.role() IN ('authenticated', 'service_role'));

-- ============================================================================
-- 3. KEY RESULTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS key_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  quarter TEXT NOT NULL,
  year INTEGER NOT NULL,
  label TEXT,
  owner_id TEXT NOT NULL DEFAULT 'SYSTEM',
  progress INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Green',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE key_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read key_results" ON key_results
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users manage key_results" ON key_results
  FOR ALL USING (auth.role() IN ('authenticated', 'service_role'));

-- ============================================================================
-- 4. ACTIVITIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_result_id TEXT,
  owner_id TEXT NOT NULL DEFAULT 'SYSTEM',
  department TEXT DEFAULT 'Registry',
  title TEXT NOT NULL,
  tasks JSONB DEFAULT '[]',
  comments TEXT,
  week INTEGER NOT NULL,
  year INTEGER NOT NULL,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read activities" ON activities
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users manage activities" ON activities
  FOR ALL USING (auth.role() IN ('authenticated', 'service_role'));

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_activities_year_week ON activities(year, week);
CREATE INDEX IF NOT EXISTS idx_activities_owner ON activities(owner_id);

-- ============================================================================
-- 5. STRATEGIC NOTES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS strategic_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week TEXT NOT NULL,
  year INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  owner_id TEXT NOT NULL DEFAULT 'SYSTEM',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE strategic_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read strategic_notes" ON strategic_notes
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users manage strategic_notes" ON strategic_notes
  FOR ALL USING (auth.role() IN ('authenticated', 'service_role'));

-- ============================================================================
-- 6. AUDIT LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  userId TEXT,
  userName TEXT,
  action TEXT NOT NULL,
  details TEXT,
  ipAddress TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read audit_logs" ON audit_logs
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users insert audit_logs" ON audit_logs
  FOR INSERT WITH CHECK (auth.role() IN ('authenticated', 'service_role'));

-- Create index for audit queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- ============================================================================
-- 7. GOVERNANCE CONFIG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS governance_config (
  id INTEGER PRIMARY KEY,
  smtp_host TEXT,
  smtp_port INTEGER,
  smtp_encryption TEXT,
  smtp_user TEXT,
  smtp_password TEXT,
  allowed_domains JSONB,
  session_timeout_minutes INTEGER DEFAULT 30,
  max_login_attempts INTEGER DEFAULT 5,
  lockout_duration_minutes INTEGER DEFAULT 15,
  password_min_length INTEGER DEFAULT 8,
  password_require_uppercase BOOLEAN DEFAULT true,
  password_require_lowercase BOOLEAN DEFAULT true,
  password_require_number BOOLEAN DEFAULT true,
  password_require_special BOOLEAN DEFAULT true,
  mfa_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default config
INSERT INTO governance_config (id, allowed_domains, session_timeout_minutes, max_login_attempts, lockout_duration_minutes)
VALUES (1, '["novaai.com.ng", "fcis.com", "pee.com"]', 30, 5, 15)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE governance_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read governance_config" ON governance_config
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users manage governance_config" ON governance_config
  FOR ALL USING (auth.role() IN ('authenticated', 'service_role'));

-- ============================================================================
-- 8. CREATE TRIGGER TO AUTO-CREATE PROFILE ON AUTH SIGNUP
-- ============================================================================
-- This automatically creates a profile when a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, auth_id, email, firstName, lastName, name, role, department, avatarUrl, status)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'firstName', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'lastName', ''),
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'Viewer'),
    COALESCE(NEW.raw_user_meta_data->>'department', 'Registry'),
    COALESCE(NEW.raw_user_meta_data->>'avatarUrl', 
      'https://ui-avatars.com/api/?name=' || URLEncode(SPLIT_PART(NEW.email, '@', 1)) || '&background=random'),
    'Active'
  )
  ON CONFLICT (auth_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 9. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_id ON profiles(auth_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_key_results_year_quarter ON key_results(year, quarter);
CREATE INDEX IF NOT EXISTS idx_activities_department ON activities(department);

-- ============================================================================
-- DONE - All tables created successfully!
-- ============================================================================
