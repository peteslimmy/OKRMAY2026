-- Progress Calculation Engine

-- Function to calculate KR progress and status based on Sub-KRs
CREATE OR REPLACE FUNCTION update_kr_progress()
RETURNS TRIGGER AS $$
DECLARE
    calculated_progress DECIMAL(5, 2);
    calculated_status kr_status_type;
BEGIN
    -- Calculate weighted average of sub-krs
    SELECT 
        CASE 
            WHEN SUM(weight) = 0 THEN 0 
            ELSE SUM(progress * weight) / SUM(weight) 
        END INTO calculated_progress
    FROM sub_krs
    WHERE kr_id = NEW.kr_id;

    -- Determine status
    IF calculated_progress >= 70 THEN
        calculated_status := 'Green';
    ELSIF calculated_progress >= 40 THEN
        calculated_status := 'Amber';
    ELSE
        calculated_status := 'Red';
    END IF;

    -- Update the KR table
    UPDATE key_results
    SET progress = calculated_progress,
        status = calculated_status,
        updated_at = now()
    WHERE id = NEW.kr_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for KR updates
CREATE TRIGGER trg_update_kr_progress
AFTER INSERT OR UPDATE OR DELETE ON sub_krs
FOR EACH ROW EXECUTE FUNCTION update_kr_progress();

-- Function to calculate Objective progress
-- Note: Objective progress can be a view or a cached column. 
-- Given the requirement for "Optimize dashboard queries", a cached column is better.
-- However, the prompt mentions "Objective Progress = Average of all KR progress".

ALTER TABLE objectives ADD COLUMN progress DECIMAL(5, 2) DEFAULT 0.00;

CREATE OR REPLACE FUNCTION update_objective_progress()
RETURNS TRIGGER AS $$
DECLARE
    calculated_progress DECIMAL(5, 2);
BEGIN
    SELECT AVG(progress) INTO calculated_progress
    FROM key_results
    WHERE objective_id = NEW.objective_id;

    UPDATE objectives
    SET progress = calculated_progress,
        updated_at = now()
    WHERE id = NEW.objective_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for KR updates
CREATE TRIGGER trg_update_objective_progress
AFTER INSERT OR UPDATE OR DELETE ON key_results
FOR EACH ROW EXECUTE FUNCTION update_objective_progress();