-- ================================================
-- Quarterly OKR Database Seeding Script (Fixed)
-- Run this in Supabase SQL Editor
-- ================================================

-- 1. Create Yearly Theme for 2026
-- Note: created_by and updated_by are UUIDs, using a placeholder or null
INSERT INTO yearly_themes (year, title, description, is_active, created_by, updated_by)
VALUES (2026, '2026 Strategic Excellence', 'Drive organizational growth through operational excellence, digital transformation, and talent development.', true, NULL, NULL);

-- Get the theme ID
DO $$
DECLARE theme_id UUID;
BEGIN
  SELECT id INTO theme_id FROM yearly_themes WHERE year = 2026 LIMIT 1;
  
  -- 2. Create Q1 Objective (Active)
  INSERT INTO quarterly_objectives (yearly_theme_id, quarter, year, title, description, status, progress)
  VALUES (theme_id, 'Q1', 2026, 'Q1 Operational Excellence', 'Achieve operational efficiency targets', 'Active', 0);

  -- 3. Create Q2-Q4 Objectives (Draft status)
  INSERT INTO quarterly_objectives (yearly_theme_id, quarter, year, title, description, status, progress)
  VALUES 
    (theme_id, 'Q2', 2026, 'Q2 Growth Initiatives', 'Launch growth and expansion programs', 'Draft', 0),
    (theme_id, 'Q3', 2026, 'Q3 Digital Transformation', 'Implement digital transformation projects', 'Draft', 0),
    (theme_id, 'Q4', 2026, 'Q4 Year-End Achievement', 'Final push to meet annual targets', 'Draft', 0);
END $$;

-- Verify the data was created
SELECT 
  yt.year,
  yt.title as theme_title,
  yt.is_active,
  qo.quarter,
  qo.title as objective_title,
  qo.status
FROM yearly_themes yt
LEFT JOIN quarterly_objectives qo ON yt.id = qo.yearly_theme_id
WHERE yt.year = 2026
ORDER BY qo.quarter;

SELECT 'Seeding completed!' as result;