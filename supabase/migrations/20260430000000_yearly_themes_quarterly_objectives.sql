-- Yearly Themes and Quarterly OKR Structure
-- This extends the existing strategic governance engine

-- Create enum types if they don't exist ( idempotent )
DO $$ BEGIN
    CREATE TYPE quarter_type AS ENUM ('Q1', 'Q2', 'Q3', 'Q4');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE objective_status AS ENUM ('Active', 'Locked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE kr_slot_type AS ENUM ('KR1', 'KR2', 'KR3', 'KR4');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE kr_status_type AS ENUM ('Green', 'Amber', 'Red');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Yearly Theme - top level container for a year's strategic focus
CREATE TABLE IF NOT EXISTS yearly_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID,
    updated_by UUID
);

-- Quarterly Objectives - linked to yearly themes but also matches existing objectives table structure
CREATE TABLE IF NOT EXISTS quarterly_objectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    yearly_theme_id UUID REFERENCES yearly_themes(id) ON DELETE SET NULL,
    quarter quarter_type NOT NULL,
    year INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status objective_status DEFAULT 'Active',
    progress DECIMAL(5,2) DEFAULT 0.00,
    lock_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID,
    updated_by UUID,
    CONSTRAINT unique_quarterly_objective_per_year UNIQUE (quarter, year)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_yearly_themes_year ON yearly_themes(year);
CREATE INDEX IF NOT EXISTS idx_yearly_themes_active ON yearly_themes(is_active);
CREATE INDEX IF NOT EXISTS idx_quarterly_objectives_theme_id ON quarterly_objectives(yearly_theme_id);
CREATE INDEX IF NOT EXISTS idx_quarterly_objectives_year ON quarterly_objectives(year);

-- Enable RLS
ALTER TABLE yearly_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarterly_objectives ENABLE ROW LEVEL SECURITY;

-- Policies (allow all for authenticated users)
CREATE POLICY "Allow all for authenticated users" ON yearly_themes
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON quarterly_objectives
    FOR ALL USING (auth.role() = 'authenticated');