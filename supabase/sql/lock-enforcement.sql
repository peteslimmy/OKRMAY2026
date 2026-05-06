-- ============================================================================
-- LOCK ENFORCEMENT: Database-level temporal state machine
-- Enforces Soft-Lock and Hard-Lock at the database trigger level
-- ============================================================================

-- 1. Add lock configuration columns to governance_config (if not exist)
ALTER TABLE governance_config 
  ADD COLUMN IF NOT EXISTS content_lock_day INTEGER DEFAULT 2,
  ADD COLUMN IF NOT EXISTS content_lock_time TEXT DEFAULT '18:00',
  ADD COLUMN IF NOT EXISTS final_lock_day INTEGER DEFAULT 9,
  ADD COLUMN IF NOT EXISTS final_lock_time TEXT DEFAULT '11:00';

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
  now_wat := timezone('Africa/Lagos', now())::TIMESTAMP;
  
  SELECT content_lock_day, content_lock_time, final_lock_day, final_lock_time
  INTO config
  FROM governance_config
  LIMIT 1;
  
  IF NOT FOUND OR config IS NULL THEN
    RETURN 'OPEN';
  END IF;
  
  lock_day := COALESCE(config.content_lock_day, 2);
  lock_time := COALESCE(config.content_lock_time, '18:00');
  
  day_of_week := EXTRACT(DOW FROM make_date(p_year, 1, 1))::INTEGER;
  target_date := make_date(p_year, 1, 1) + ((p_week - 1) * 7)::INTEGER - day_of_week + 1;
  
  soft_lock_dt := target_date + (lock_day || ' days')::INTERVAL + (lock_time || ' hours')::INTERVAL;
  hard_lock_dt := target_date + (COALESCE(config.final_lock_day, 9) || ' days')::INTERVAL + (COALESCE(config.final_lock_time, '11:00') || ' hours')::INTERVAL;
  
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
BEGIN
  current_state := get_lock_state(NEW.week, NEW.year);
  
  IF current_state = 'HARD_LOCKED' THEN
    RAISE EXCEPTION 'Goal for Week % of % is HARD LOCKED. No modifications allowed.', NEW.week, NEW.year;
  END IF;
  
  IF current_state = 'SOFT_LOCKED' THEN
    IF NEW.title IS DISTINCT FROM OLD.title THEN
      RAISE EXCEPTION 'Goal for Week % is SOFT LOCKED. Title cannot be modified.', NEW.week;
    END IF;
    NEW.lock_state := 'SOFT_LOCKED';
  ELSE
    NEW.lock_state := 'OPEN';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace trigger
DROP TRIGGER IF EXISTS trg_prevent_locked_modification ON activities;
CREATE TRIGGER trg_prevent_locked_modification
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION prevent_locked_modification();

-- 5. View: Current lock status for all active weeks
CREATE OR REPLACE VIEW v_week_lock_status AS
SELECT 
  DISTINCT ON (week, year)
  week,
  year,
  get_lock_state(week, year) AS lock_state
FROM activities
ORDER BY week, year DESC;

-- 6. Grant permissions
GRANT SELECT ON v_week_lock_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_lock_state TO authenticated;
GRANT EXECUTE ON FUNCTION prevent_locked_modification TO authenticated;