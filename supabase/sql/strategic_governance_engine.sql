-- ============================================================================
-- STRATEGIC GOVERNANCE ENGINE - DATABASE MIGRATION
-- ============================================================================

-- 1. EXTENSIONS & TYPES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kr_slot_enum') THEN
        CREATE TYPE kr_slot_enum AS ENUM ('KR1', 'KR2', 'KR3', 'KR4');
    END IF;
END $$;

-- 2. OBJECTIVES TABLE
-- Root of the governance tree. Only one per quarter/year.
CREATE TABLE IF NOT EXISTS objectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    quarter TEXT NOT NULL CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
    year INTEGER NOT NULL,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Locked')),
    lock_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(year, quarter)
);

-- 3. KEY RESULTS TABLE
-- Linked to Objective. Strict slotting (KR1-KR4).
CREATE TABLE IF NOT EXISTS key_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    objective_id UUID NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
    kr_slot kr_slot_enum NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    progress INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Red' CHECK (status IN ('Green', 'Amber', 'Red')),
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(objective_id, kr_slot)
);

-- 4. SUB-KRs TABLE
-- The actual measurement points.
CREATE TABLE IF NOT EXISTS sub_krs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kr_id UUID NOT NULL REFERENCES key_results(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    weight DECIMAL DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. KR VERSION HISTORY
-- Snapshots for auditability before locks.
CREATE TABLE IF NOT EXISTS kr_version_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kr_id UUID NOT NULL REFERENCES key_results(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    snapshot JSONB NOT NULL,
    modified_by UUID, -- References profiles(id)
    modified_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. GOVERNANCE AUDIT LOGS
-- Tracks every critical change and override.
CREATE TABLE IF NOT EXISTS governance_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL, -- 'OBJECTIVE', 'KR', 'SUBKR'
    entity_id UUID NOT NULL,
    action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'LOCK', 'OVERRIDE'
    performed_by UUID, -- References profiles(id)
    reason TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DATA MIGRATION (From old key_results to new structure)
-- ============================================================================

DO $$
DECLARE
    current_year INTEGER := 2026;
    current_quarter TEXT := 'Q1';
    obj_id UUID;
BEGIN
    -- 1. Create the Objective for the current period
    INSERT INTO objectives (title, description, quarter, year, lock_date)
    VALUES ('Strategic Objective 2026 Q1', 'Default migrated objective', current_quarter, current_year, '2026-01-31 23:59:59')
    ON CONFLICT (year, quarter) DO UPDATE SET title = EXCLUDED.title
    RETURNING id INTO obj_id;
END $$;

-- ============================================================================
-- RLS & SECURITY
-- ============================================================================

ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_krs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kr_version_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated read for all
CREATE POLICY "Allow authenticated read objectives" ON objectives FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read krs" ON key_results FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read subkrs" ON sub_krs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read history" ON kr_version_history FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read audit" ON governance_audit_logs FOR SELECT USING (auth.role() = 'authenticated');

-- Admin/SuperAdmin full access
CREATE POLICY "Admin full access objectives" ON objectives FOR ALL USING (auth.jwt() ->> 'role' IN ('Admin', 'SuperAdmin'));
CREATE POLICY "Admin full access krs" ON key_results FOR ALL USING (auth.jwt() ->> 'role' IN ('Admin', 'SuperAdmin'));
CREATE POLICY "Admin full access subkrs" ON sub_krs FOR ALL USING (auth.jwt() ->> 'role' IN ('Admin', 'SuperAdmin'));
