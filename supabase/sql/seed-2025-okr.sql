-- ================================================
-- 2025 Quarterly OKR Real Data Seeding
-- Run this in Supabase SQL Editor
-- ================================================

-- 1. Create Yearly Theme for 2025
INSERT INTO yearly_themes (year, title, description, is_active, created_by, updated_by)
VALUES (2025, '2025 Strategic Excellence', 'Business advancement through intentional structural reformation, data informed product evolution and entrenchment of processes and technology.', true, NULL, NULL);

-- 2. Create all Quarterly Objectives and KRs
DO $$
DECLARE theme_id UUID;
DECLARE q1_id UUID;
DECLARE q2_id UUID;
DECLARE q3_id UUID;
DECLARE q4_id UUID;
BEGIN
  -- Get the theme ID
  SELECT id INTO theme_id FROM yearly_themes WHERE year = 2025 LIMIT 1;

  -- ========== Q1 OBJECTIVE ==========
  INSERT INTO quarterly_objectives (yearly_theme_id, quarter, year, title, description, status, progress)
  VALUES (theme_id, 'Q1', 2025, 'BUSINESS ADVANCEMENT THROUGH INTENTIONAL STRUCTURAL REFORMATION', 'DATA INFORMED PRODUCT EVOLUTION AND ENTRENCHMENT OF PROCESSES AND TECHNOLOGY', 'Active', 0)
  RETURNING id INTO q1_id;

  -- Q1 KR1: REVENUE
  INSERT INTO key_results (objective_id, kr_slot, title, description, progress, status)
  VALUES (q1_id, 'KR1', 'REVENUE', 'Revenue Generation', 0, 'Green');

  -- Q1 KR2: INTENTIONAL STRUCTURAL REFORMS
  INSERT INTO key_results (objective_id, kr_slot, title, description, progress, status)
  VALUES (q1_id, 'KR2', 'INTENTIONAL STRUCTURAL REFORMS (PEOPLE, PROCESS & TECHNOLOGY)', 'Review business Structures, Processes, Reach & Impact to optimize business performance', 0, 'Amber');

  -- Q1 KR3: DATA-DRIVEN INNOVATION
  INSERT INTO key_results (objective_id, kr_slot, title, description, progress, status)
  VALUES (q1_id, 'KR3', 'DATA-DRIVEN INNOVATION & PRODUCT EVOLUTION', 'Deliberate translation of data and User feedback for Product/Service Improvement & business advancement', 0, 'Green');

  -- ========== Q2 OBJECTIVE ==========
  INSERT INTO quarterly_objectives (yearly_theme_id, quarter, year, title, description, status, progress)
  VALUES (theme_id, 'Q2', 2025, 'REALIGNING BUSINESS AND PRODUCT TEAM STRUCTURE', 'To Enable Data-Driven Service Evolution And Accelerate Client Ownership.', 'Active', 0)
  RETURNING id INTO q2_id;

  -- Q2 KR1: REVENUE
  INSERT INTO key_results (objective_id, kr_slot, title, description, progress, status)
  VALUES (q2_id, 'KR1', 'REVENUE', 'Revenue Generation', 0, 'Green');

  -- Q2 KR2: REALIGNING BUSINESS AND PRODUCT TEAM STRUCTURE
  INSERT INTO key_results (objective_id, kr_slot, title, description, progress, status)
  VALUES (q2_id, 'KR2', 'REALIGNING BUSINESS AND PRODUCT TEAM STRUCTURE', 'Creating & Reticulating the Business & Product Teams', 0, 'Amber');

  -- Q2 KR3: CLIENT-CENTRIC SERVICE EVOLUTION
  INSERT INTO key_results (objective_id, kr_slot, title, description, progress, status)
  VALUES (q2_id, 'KR3', 'CLIENT-CENTRIC DATA-DRIVEN SERVICE EVOLUTION', 'Intentional data-driven client engagement for business growth', 0, 'Green');

  -- ========== Q3 OBJECTIVE ==========
  INSERT INTO quarterly_objectives (yearly_theme_id, quarter, year, title, description, status, progress)
  VALUES (theme_id, 'Q3', 2025, 'LEVERAGING STANDARDIZED OPERATIONS', 'To advance product development, improve service outcomes, and meet evolving expectations of internal & external stakeholders', 'Active', 0)
  RETURNING id INTO q3_id;

  -- Q3 KR1: REVENUE
  INSERT INTO key_results (objective_id, kr_slot, title, description, progress, status)
  VALUES (q3_id, 'KR1', 'REVENUE', 'Revenue Generation', 0, 'Green');

  -- Q3 KR2: STANDARDIZATION
  INSERT INTO key_results (objective_id, kr_slot, title, description, progress, status)
  VALUES (q3_id, 'KR2', 'STANDARDIZATION', 'Operationalize Business/Product Team Structures & Processes', 0, 'Amber');

  -- Q3 KR3: CLIENT-CENTRIC SERVICE DELIVERY
  INSERT INTO key_results (objective_id, kr_slot, title, description, progress, status)
  VALUES (q3_id, 'KR3', 'CLIENT-CENTRIC SERVICE DELIVERY', 'Improve external product ownership & client understanding', 0, 'Green');

  -- ========== Q4 OBJECTIVE ==========
  INSERT INTO quarterly_objectives (yearly_theme_id, quarter, year, title, description, status, progress)
  VALUES (theme_id, 'Q4', 2025, 'HARNESSING DATA-DRIVEN INSIGHTS', 'To foster organizational efficiency, strengthen collaboration and build stakeholder confidence through client ownership', 'Active', 0)
  RETURNING id INTO q4_id;

  -- Q4 KR1: REVENUE
  INSERT INTO key_results (objective_id, kr_slot, title, description, progress, status)
  VALUES (q4_id, 'KR1', 'REVENUE', 'Revenue Generation', 0, 'Green');

  -- Q4 KR2: DATA-DRIVEN PRODUCT EXCELLENCE
  INSERT INTO key_results (objective_id, kr_slot, title, description, progress, status)
  VALUES (q4_id, 'KR2', 'DATA-DRIVEN PRODUCT EXCELLENCE', 'Product Execution/Activation and Standardization', 0, 'Amber');

  -- Q4 KR3: ORGANIZATIONAL ALIGNMENT
  INSERT INTO key_results (objective_id, kr_slot, title, description, progress, status)
  VALUES (q4_id, 'KR3', 'ORGANIZATIONAL ALIGNMENT', 'Enhanced Team Structure with Cross-Functional Communication', 0, 'Green');

  -- Q4 KR4: STAKEHOLDER CONFIDENCE
  INSERT INTO key_results (objective_id, kr_slot, title, description, progress, status)
  VALUES (q4_id, 'KR4', 'STAKEHOLDER CONFIDENCE', 'Impact Driven Stakeholder Engagement', 0, 'Green');
END $$;

-- Verify the data
SELECT yt.title as theme, qo.quarter, qo.title as objective
FROM yearly_themes yt
JOIN quarterly_objectives qo ON yt.id = qo.yearly_theme_id
WHERE yt.year = 2025
ORDER BY qo.quarter;

SELECT qo.quarter, kr.kr_slot, kr.title
FROM quarterly_objectives qo
JOIN key_results kr ON qo.id = kr.objective_id
WHERE qo.year = 2025
ORDER BY qo.quarter, kr.kr_slot;

SELECT 'Seeding 2025 OKR data completed!' as result;