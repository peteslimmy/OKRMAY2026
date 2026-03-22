-- Sub-KR Validation & Cleanup Script
-- Ensures all sub-KRs have valid parent KRs

-- Step 1: Create function to validate sub-KR has parent
CREATE OR REPLACE FUNCTION validate_subkr_parent()
RETURNS TRIGGER AS $$
BEGIN
  -- If parent_kr_id is set, verify the parent exists
  IF NEW.parent_kr_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM key_results WHERE id = NEW.parent_kr_id) THEN
      RAISE EXCEPTION 'Sub-KR must reference a valid parent KR. Parent with ID % does not exist.', NEW.parent_kr_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create trigger for validation
DROP TRIGGER IF EXISTS trg_validate_subkr_parent ON key_results;
CREATE TRIGGER trg_validate_subkr_parent
  BEFORE INSERT OR UPDATE OF parent_kr_id ON key_results
  FOR EACH ROW
  EXECUTE FUNCTION validate_subkr_parent();

-- Step 3: Find orphaned sub-KRs (sub-KRs whose parent no longer exists)
-- These need to be either deleted or the parent_kr_id cleared
DO $$
DECLARE
  orphan RECORD;
BEGIN
  FOR orphan IN 
    SELECT kr.id, kr.label, kr.title, kr.parent_kr_id
    FROM key_results kr
    WHERE kr.parent_kr_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM key_results parent WHERE parent.id = kr.parent_kr_id)
  LOOP
    RAISE NOTICE 'Orphaned Sub-KR Found: ID=%, Label=%', orphan.id, orphan.label;
  END LOOP;
END $$;

-- Step 4: Clean up orphaned sub-KRs (optional - uncomment to delete)
-- DELETE FROM key_results
-- WHERE parent_kr_id IS NOT NULL
-- AND NOT EXISTS (SELECT 1 FROM key_results parent WHERE parent.id = key_results.parent_kr_id);

-- Step 5: Alternative - Convert orphaned sub-KRs to regular KRs (uncomment to use)
-- This gives them a new KR slot instead of deleting
DO $$
DECLARE
  orphan RECORD;
  all_slots TEXT[] := ARRAY['KR1', 'KR2', 'KR3', 'KR4'];
  used_slots TEXT[];
  new_slot TEXT;
BEGIN
  FOR orphan IN 
    SELECT kr.id, kr.quarter, kr.year, kr.label
    FROM key_results kr
    WHERE kr.parent_kr_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM key_results parent WHERE parent.id = kr.parent_kr_id)
  LOOP
    -- Get used slots for this quarter/year
    SELECT ARRAY_AGG(label) INTO used_slots
    FROM key_results
    WHERE quarter = orphan.quarter
    AND year = orphan.year
    AND parent_kr_id IS NULL
    AND id != orphan.id;
    
    -- Find first available slot
    SELECT slot INTO new_slot
    FROM unnest(all_slots) AS slot
    WHERE slot != ALL(COALESCE(used_slots, ARRAY[]::TEXT[]))
    LIMIT 1;
    
    IF new_slot IS NOT NULL THEN
      UPDATE key_results
      SET parent_kr_id = NULL, label = new_slot
      WHERE id = orphan.id;
      RAISE NOTICE 'Converted orphan % to regular KR with label %', orphan.label, new_slot;
    ELSE
      DELETE FROM key_results WHERE id = orphan.id;
      RAISE NOTICE 'Deleted orphan % (no slots available)', orphan.label;
    END IF;
  END LOOP;
END $$;
