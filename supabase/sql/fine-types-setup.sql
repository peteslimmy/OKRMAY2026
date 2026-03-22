-- Fine Types Configuration Table
CREATE TABLE IF NOT EXISTS fine_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  default_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fine_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read fine_types" ON fine_types
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role full access fine_types" ON fine_types
  FOR ALL USING (auth.role() = 'service_role');

-- Insert default fine types including Lateness and Absenteeism
INSERT INTO fine_types (name, description, default_amount, is_active) VALUES
  ('Phone Violation', 'Using phone during work hours', 5000, true),
  ('Lateness', 'Arriving late to work', 1000, true),
  ('Absenteeism', 'Unauthorized absence from work', 3000, true)
ON CONFLICT (name) DO NOTHING;