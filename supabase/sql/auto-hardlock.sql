-- ============================================================================
-- AUTOMATIC HARD-LOCK PROCESSOR
-- Runs daily to finalize previous week's scores
-- Undefined tasks -> NotDone, score recalculated
-- ============================================================================

-- 1. Function to process hard-locked weeks
CREATE OR REPLACE FUNCTION process_hard_locked_weeks()
RETURNS TABLE(processed_week INTEGER, processed_year INTEGER, goals_updated INTEGER) AS $$
DECLARE
  now_wat TIMESTAMP := timezone('Africa/Lagos', now())::TIMESTAMP;
  config RECORD;
  target_week INTEGER;
  target_year INTEGER;
  week_start DATE;
  hard_lock_dt TIMESTAMP;
  goals_updated_cnt INTEGER := 0;
BEGIN
  SELECT content_lock_day, content_lock_time, final_lock_day, final_lock_time
  INTO config
  FROM governance_config
  LIMIT 1;
  
  IF NOT FOUND OR config IS NULL THEN
    RETURN;
  END IF;
  
  target_week := EXTRACT(WEEK FROM now_wat - INTERVAL '1 week')::INTEGER;
  target_year := EXTRACT(YEAR FROM now_wat - INTERVAL '1 week')::INTEGER;
  
  IF target_week < 1 THEN
    target_week := 52;
    target_year := target_year - 1;
  END IF;
  
  week_start := make_date(target_year, 1, 1) + ((target_week - 1) * 7) - 
    EXTRACT(DOW FROM make_date(target_year, 1, 1)) + 1;
  hard_lock_dt := week_start + (COALESCE(config.final_lock_day, 9) || ' days')::INTERVAL + 
    (COALESCE(config.final_lock_time, '11:00') || ' hours')::INTERVAL;
  
  IF now_wat >= hard_lock_dt THEN
    IF NOT EXISTS (
      SELECT 1 FROM audit_logs 
      WHERE action = 'SYSTEM' 
      AND details LIKE '%Hard-Lock Week ' || target_week || '%'
      AND timestamp > now_wat - INTERVAL '1 day'
    ) THEN
      WITH updated AS (
        UPDATE activities
        SET 
          tasks = (
            SELECT jsonb_agg(
              CASE WHEN (elem->>'status') = 'Undefined'::TEXT
              THEN jsonb_set(elem, ARRAY['status'], '"NotDone"'::JSONB)
              ELSE elem
              END
            )
            FROM jsonb_array_elements(
              COALESCE(tasks::JSONB, '[]'::JSONB)
            ) AS elem
          ),
          score = GREATEST(0, (
            SELECT COALESCE(
              FLOOR(
                100.0 * COUNT(*) FILTER (WHERE (elem->>'status') != 'NotDone') / NULLIF(COUNT(*), 0)
              )::INTEGER
            )
            FROM jsonb_array_elements(
              COALESCE(tasks::JSONB, '[]'::JSONB)
            ) AS elem
          )),
          lock_state = 'HARD_LOCKED',
          updated_at = now()
        WHERE week = target_week 
          AND year = target_year 
          AND get_lock_state(target_week, target_year) IN ('HARD_LOCKED', 'OPEN')
        RETURNING id
      )
      SELECT COUNT(*) INTO goals_updated_cnt FROM updated;
      
      INSERT INTO audit_logs (id, timestamp, userId, userName, action, details, metadata)
      VALUES (
        gen_random_uuid(),
        now(),
        'SYSTEM',
        'SYSTEM',
        'SYSTEM',
        'Hard-Lock Week ' || target_week || '/' || target_year || ': ' || goals_updated_cnt || ' goals finalized',
        jsonb_build_object('goalsUpdated', goals_updated_cnt, 'week', target_week, 'year', target_year)
      );
      
      RETURN QUERY SELECT target_week, target_year, goals_updated_cnt;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION process_hard_locked_weeks IS 'Finalizes all hard-locked week scores. Returns processed week info.';

GRANT EXECUTE ON FUNCTION process_hard_locked_weeks TO authenticated;