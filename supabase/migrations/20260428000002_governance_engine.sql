-- Governance & Locking Engine

-- Function to check if the current quarter is locked
-- Lock trigger: Immediately after Month 1 ends of current Quarter
CREATE OR REPLACE FUNCTION is_quarter_locked(obj_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    lock_date TIMESTAMP WITH TIME ZONE;
    current_status objective_status;
BEGIN
    SELECT lock_date, status INTO lock_date, current_status
    FROM objectives
    WHERE id = obj_id;

    -- If explicitly locked or if current time is past the lock_date
    IF current_status = 'Locked' OR (lock_date IS NOT NULL AND now() > lock_date) THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to prevent edits on locked records
CREATE OR REPLACE FUNCTION enforce_governance_lock()
RETURNS TRIGGER AS $$
DECLARE
    obj_id UUID;
    is_locked BOOLEAN;
    user_role TEXT;
BEGIN
    -- Get objective_id for the entity being modified
    IF TG_TABLE_NAME = 'objectives' THEN
        obj_id := NEW.id;
    ELSIF TG_TABLE_NAME = 'key_results' THEN
        obj_id := NEW.objective_id;
    ELSIF TG_TABLE_NAME = 'sub_krs' THEN
        SELECT objective_id INTO obj_id FROM key_results WHERE id = NEW.kr_id;
    END IF;

    is_locked := is_quarter_locked(obj_id);

    -- Check user role from auth.jwt() or a profiles table
    -- Assuming a 'profiles' table exists with a 'role' column
    SELECT role INTO user_role FROM profiles WHERE id = auth.uid();

    IF is_locked AND user_role != 'SuperAdmin' THEN
        RAISE EXCEPTION 'This quarter is locked. Only Super Admins can make changes.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- We need to handle the sub_krs case specifically.
-- Since I don't have a profiles table yet, I'll assume one exists or will be created.
-- I will create the profiles table first.

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    role TEXT CHECK (role IN ('SuperAdmin', 'Admin', 'User')) DEFAULT 'User',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Now refine the triggers
CREATE TRIGGER trg_lock_objectives
BEFORE UPDATE ON objectives
FOR EACH ROW EXECUTE FUNCTION enforce_governance_lock();

CREATE TRIGGER trg_lock_krs
BEFORE UPDATE OR DELETE ON key_results
FOR EACH ROW EXECUTE FUNCTION enforce_governance_lock();

-- Special trigger for sub_krs to get objective_id
CREATE OR REPLACE FUNCTION enforce_subkr_lock()
RETURNS TRIGGER AS $$
DECLARE
    obj_id UUID;
    is_locked BOOLEAN;
    user_role TEXT;
BEGIN
    SELECT objective_id INTO obj_id FROM key_results WHERE id = NEW.kr_id;
    is_locked := is_quarter_locked(obj_id);
    SELECT role INTO user_role FROM profiles WHERE id = auth.uid();

    IF is_locked AND user_role != 'SuperAdmin' THEN
        RAISE EXCEPTION 'This quarter is locked. Only Super Admins can make changes.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lock_subkrs
BEFORE UPDATE OR DELETE ON sub_krs
FOR EACH ROW EXECUTE FUNCTION enforce_subkr_lock();

-- Super Admin Override Function
CREATE OR REPLACE FUNCTION override_quarter_lock(
    target_objective_id UUID,
    override_reason TEXT
)
RETURNS VOID AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM profiles WHERE id = auth.uid();

    IF user_role != 'SuperAdmin' THEN
        RAISE EXCEPTION 'Only Super Admins can override the lock.';
    END IF;

    -- Log the override in audit_logs
    INSERT INTO audit_logs (entity_type, entity_id, action, performed_by, reason)
    VALUES ('objective', target_objective_id, 'OVERRIDE', auth.uid(), override_reason);

    -- Temporarily unlock by updating status or extending lock_date
    -- Here we just set status to 'Active' and set lock_date to the future or null
    UPDATE objectives
    SET status = 'Active'
    WHERE id = target_objective_id;
END;
$$ LANGUAGE plpgsql;