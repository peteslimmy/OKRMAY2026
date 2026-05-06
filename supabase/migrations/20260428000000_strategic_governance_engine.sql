-- Strategic Governance Engine Schema

-- Enums
CREATE TYPE quarter_type AS ENUM ('Q1', 'Q2', 'Q3', 'Q4');
CREATE TYPE objective_status AS ENUM ('Active', 'Locked');
CREATE TYPE kr_slot_type AS ENUM ('KR1', 'KR2', 'KR3', 'KR4');
CREATE TYPE kr_status_type AS ENUM ('Green', 'Amber', 'Red');
CREATE TYPE audit_action_type AS ENUM ('CREATE', 'UPDATE', 'LOCK', 'OVERRIDE');

-- Tables
CREATE TABLE objectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    quarter quarter_type NOT NULL,
    year INTEGER NOT NULL,
    status objective_status DEFAULT 'Active',
    lock_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT unique_objective_per_quarter UNIQUE (quarter, year)
);

CREATE TABLE key_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    objective_id UUID NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
    kr_slot kr_slot_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    progress DECIMAL(5, 2) DEFAULT 0.00,
    status kr_status_type DEFAULT 'Red',
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT unique_kr_slot_per_objective UNIQUE (objective_id, kr_slot)
);

CREATE TABLE sub_krs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kr_id UUID NOT NULL REFERENCES key_results(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    progress DECIMAL(5, 2) CHECK (progress >= 0 AND progress <= 100) DEFAULT 0.00,
    weight DECIMAL(5, 2) DEFAULT 1.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE kr_version_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kr_id UUID NOT NULL REFERENCES key_results(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    snapshot JSONB NOT NULL,
    modified_by UUID NOT NULL,
    modified_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action audit_action_type NOT NULL,
    performed_by UUID NOT NULL,
    reason TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_key_results_objective_id ON key_results(objective_id);
CREATE INDEX idx_sub_krs_kr_id ON sub_krs(kr_id);
CREATE INDEX idx_kr_version_history_kr_id ON kr_version_history(kr_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);