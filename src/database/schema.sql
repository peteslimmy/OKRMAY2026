-- Database schema for the Strategic Governance Engine
-- This file contains the complete schema for the OKR system

-- Objectives table
CREATE TABLE IF NOT EXISTS objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  quarter TEXT NOT NULL CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
  year INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Active', 'Locked')),
  lock_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Key Results table
CREATE TABLE IF NOT EXISTS key_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID REFERENCES objectives(id) ON DELETE CASCADE,
  kr_slot TEXT NOT NULL CHECK (kr_slot IN ('KR1', 'KR2', 'KR3', 'KR4')),
  title TEXT NOT NULL,
  description TEXT,
  progress NUMERIC DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('Green', 'Amber', 'Red')),
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(objective_id, kr_slot)
);

-- Sub-Key Results table
CREATE TABLE IF NOT EXISTS sub_key_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kr_id UUID REFERENCES key_results(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  progress NUMERIC DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  weight NUMERIC DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- KR Version History table
CREATE TABLE IF NOT EXISTS kr_version_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kr_id UUID REFERENCES key_results(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  snapshot JSONB,
  modified_by UUID,
  modified_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'LOCK', 'OVERRIDE')),
  performed_by UUID,
  reason TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_objectives_quarter_year ON objectives(quarter, year);
CREATE INDEX IF NOT EXISTS idx_key_results_objective ON key_results(objective_id);
CREATE INDEX IF NOT EXISTS idx_sub_krs_kr ON sub_key_results(kr_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Constraints
ALTER TABLE objectives ADD CONSTRAINT unique_objective_per_quarter UNIQUE (quarter, year);