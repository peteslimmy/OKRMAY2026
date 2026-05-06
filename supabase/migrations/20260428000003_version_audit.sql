-- Version Control & Audit Logging

-- Trigger to create version snapshot before updating a KR
CREATE OR REPLACE FUNCTION create_kr_snapshot()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create snapshot if the KR is not locked (or according to rules)
    -- The requirements say: "Every KR update BEFORE lock: Increment version and Store full snapshot"
    
    -- We check if the objective is locked. If not locked, snapshot.
    IF NOT is_quarter_locked((SELECT objective_id FROM key_results WHERE id = OLD.id)) THEN
        INSERT INTO kr_version_history (kr_id, version_number, snapshot, modified_by)
        VALUES (OLD.id, OLD.version, to_jsonb(OLD), auth.uid());

        -- Increment version in the new record
        NEW.version := OLD.version + 1;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_kr_snapshot
BEFORE UPDATE ON key_results
FOR EACH ROW EXECUTE FUNCTION create_kr_snapshot();

-- Generic Audit Log Trigger for Objectives
CREATE OR REPLACE FUNCTION audit_objective_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (entity_type, entity_id, action, performed_by)
        VALUES ('objective', NEW.id, 'CREATE', auth.uid());
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (entity_type, entity_id, action, performed_by)
        VALUES ('objective', NEW.id, 'UPDATE', auth.uid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_objectives
AFTER INSERT OR UPDATE ON objectives
FOR EACH ROW EXECUTE FUNCTION audit_objective_changes();

-- Generic Audit Log Trigger for KRs
CREATE OR REPLACE FUNCTION audit_kr_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (entity_type, entity_id, action, performed_by)
        VALUES ('key_result', NEW.id, 'CREATE', auth.uid());
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (entity_type, entity_id, action, performed_by)
        VALUES ('key_result', NEW.id, 'UPDATE', auth.uid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_krs
AFTER INSERT OR UPDATE ON key_results
FOR EACH ROW EXECUTE FUNCTION audit_kr_changes();