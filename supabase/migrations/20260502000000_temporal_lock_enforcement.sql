-- ============================================================================
-- TEMPORAL LOCK ENFORCEMENT: Database-level state machine
-- Enforces Soft-Lock and Hard-Lock at the database trigger level
-- ============================================================================

-- 1. Add lock configuration columns to governance_config (if not exist)
ALTER TABLE governance_config 
  ADD COLUMN IF NOT EXISTS content_lock_day INTEGER DEFAULT 2,
  ADD COLUMN IF NOT EXISTS content_lock_time TEXT DEFAULT '18:00',
  ADD COLUMN IF NOT EXISTS final_lock_day INTEGER DEFAULT 9,
  ADD COLUMN IF NOT EXISTS final_lock_time TEXT DEFAULT '11:00',
  ADD COLUMN IF NOT EXISTS manual_content_lock BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS manual_final_lock BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS disable_locks BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS smtp_enabled BOOLEAN DEFAULT false;

-- 2. Add lock_state column to activities table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activities' AND column_name = 'lock_state'
  ) THEN
    ALTER TABLE activities ADD COLUMN lock_state TEXT DEFAULT 'OPEN' 
      CHECK (lock_state IN ('OPEN', 'SOFT_LOCKED', 'HARD_LOCKED'));
  END IF;
END $$;

-- 3. Function to determine current lock state for a given week/year
CREATE OR REPLACE FUNCTION get_lock_state(p_week INTEGER, p_year INTEGER)
RETURNS TEXT AS $$
DECLARE
  config RECORD;
  now_wat TIMESTAMP;
  lock_day INTEGER;
  lock_time TEXT;
  soft_lock_dt TIMESTAMP;
  hard_lock_dt TIMESTAMP;
  target_date DATE;
  day_of_week INTEGER;
BEGIN
  -- Use WAT (Africa/Lagos) for all temporal calculations
  now_wat := timezone('Africa/Lagos', now())::TIMESTAMP;
  
  -- Fetch the global governance configuration
  SELECT content_lock_day, content_lock_time, final_lock_day, final_lock_time
  INTO config
  FROM governance_config
  LIMIT 1;
  
  -- Default to OPEN if no config found
  IF NOT FOUND OR config IS NULL THEN
    RETURN 'OPEN';
  END IF;
  
  -- Calculate week start date (Monday)
  -- This algorithm matches the frontend getWeekStartDate logic
  day_of_week := EXTRACT(DOW FROM make_date(p_year, 1, 1))::INTEGER;
  target_date := make_date(p_year, 1, 1) + ((p_week - 1) * 7)::INTEGER - day_of_week + 1;
  
  -- Calculate specific lock timestamps
  soft_lock_dt := target_date + (COALESCE(config.content_lock_day, 2) || ' days')::INTERVAL + (COALESCE(config.content_lock_time, '18:00') || ':00')::INTERVAL;
  hard_lock_dt := target_date + (COALESCE(config.final_lock_day, 9) || ' days')::INTERVAL + (COALESCE(config.final_lock_time, '11:00') || ':00')::INTERVAL;
  
  -- State machine transition logic
  IF now_wat >= hard_lock_dt THEN
    RETURN 'HARD_LOCKED';
  ELSIF now_wat >= soft_lock_dt THEN
    RETURN 'SOFT_LOCKED';
  END IF;
  
  RETURN 'OPEN';
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger function: Prevent locked modifications
CREATE OR REPLACE FUNCTION prevent_locked_modification()
RETURNS TRIGGER AS $$
DECLARE
  current_state TEXT;
  user_role TEXT;
BEGIN
  -- Determine current state for the record's temporal reference
  current_state := get_lock_state(NEW.week, NEW.year);
  
  -- Fetch user role (SuperAdmins bypass most locks)
  SELECT role INTO user_role FROM profiles WHERE auth_id = auth.uid();
  
  -- If HARD_LOCKED, no modifications allowed except by SuperAdmin
  IF current_state = 'HARD_LOCKED' AND user_role != 'SuperAdmin' THEN
    RAISE EXCEPTION 'Goal for Week % of % is HARD LOCKED. No modifications allowed.', NEW.week, NEW.year;
  END IF;
  
  -- If SOFT_LOCKED, only non-critical fields can be modified
  IF current_state = 'SOFT_LOCKED' AND user_role != 'SuperAdmin' THEN
    -- Prevent title changes in Soft-Lock
    IF NEW.title IS DISTINCT FROM OLD.title THEN
      RAISE EXCEPTION 'Goal for Week % is SOFT LOCKED. Critical fields (Title) cannot be modified.', NEW.week;
    END IF;
    NEW.lock_state := 'SOFT_LOCKED';
  ELSE
    NEW.lock_state := current_state;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Attach the lock enforcement trigger to the activities table
DROP TRIGGER IF EXISTS trg_prevent_locked_modification ON activities;
CREATE TRIGGER trg_prevent_locked_modification
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION prevent_locked_modification();

-- 6. Create or replace a view for auditing current lock status
CREATE OR REPLACE VIEW v_week_lock_status AS
SELECT 
  DISTINCT ON (week, year)
  week,
  year,
  get_lock_state(week, year) AS lock_state
FROM activities
ORDER BY week, year DESC;

-- 7. Governance grants for authenticated access
GRANT SELECT ON v_week_lock_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_lock_state TO authenticated;
GRANT EXECUTE ON FUNCTION prevent_locked_modification TO authenticated;
