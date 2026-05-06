-- ================================================
-- 2025 FULL OKR Seeding Script (All in One)
-- Run this in Supabase SQL Editor
-- ================================================

-- 1. Create Yearly Theme for 2025
INSERT INTO yearly_themes (year, title, description, is_active, created_by, updated_by)
VALUES (2025, '2025 Strategic Excellence', 'Business advancement through intentional structural reformation, data informed product evolution and entrenchment of processes and technology.', true, NULL, NULL);

-- 2. Create all Quarterly Objectives, KRs, and Sub-KRs
DO $$
DECLARE theme_id UUID;
DECLARE q1_id UUID;
DECLARE q2_id UUID;
DECLARE q3_id UUID;
DECLARE q4_id UUID;
DECLARE kr_rec RECORD;
BEGIN
  -- Get the theme ID
  SELECT id INTO theme_id FROM yearly_themes WHERE year = 2025 LIMIT 1;

  -- ========== Q1 OBJECTIVE ==========
  INSERT INTO quarterly_objectives (yearly_theme_id, quarter, year, title, description, status, progress)
  VALUES (theme_id, 'Q1', 2025, 'BUSINESS ADVANCEMENT THROUGH INTENTIONAL STRUCTURAL REFORMATION', 'DATA INFORMED PRODUCT EVOLUTION AND ENTRENCHMENT OF PROCESSES AND TECHNOLOGY', 'Active', 0)
  RETURNING id INTO q1_id;

  -- Q1 KRs
  INSERT INTO key_results (objective_id, kr_slot, title, progress, status) VALUES
    (q1_id, 'KR1', 'REVENUE', 0, 'Green'),
    (q1_id, 'KR2', 'INTENTIONAL STRUCTURAL REFORMS (PEOPLE, PROCESS & TECHNOLOGY)', 0, 'Amber'),
    (q1_id, 'KR3', 'DATA-DRIVEN INNOVATION & PRODUCT EVOLUTION', 0, 'Green');

  -- ========== Q2 OBJECTIVE ==========
  INSERT INTO quarterly_objectives (yearly_theme_id, quarter, year, title, description, status, progress)
  VALUES (theme_id, 'Q2', 2025, 'REALIGNING BUSINESS AND PRODUCT TEAM STRUCTURE', 'To Enable Data-Driven Service Evolution And Accelerate Client Ownership', 'Active', 0)
  RETURNING id INTO q2_id;

  -- Q2 KRs
  INSERT INTO key_results (objective_id, kr_slot, title, progress, status) VALUES
    (q2_id, 'KR1', 'REVENUE', 0, 'Green'),
    (q2_id, 'KR2', 'REALIGNING BUSINESS AND PRODUCT TEAM STRUCTURE', 0, 'Amber'),
    (q2_id, 'KR3', 'CLIENT-CENTRIC DATA-DRIVEN SERVICE EVOLUTION', 0, 'Green');

  -- ========== Q3 OBJECTIVE ==========
  INSERT INTO quarterly_objectives (yearly_theme_id, quarter, year, title, description, status, progress)
  VALUES (theme_id, 'Q3', 2025, 'LEVERAGING STANDARDIZED OPERATIONS', 'To advance product development, improve service outcomes', 'Active', 0)
  RETURNING id INTO q3_id;

  -- Q3 KRs
  INSERT INTO key_results (objective_id, kr_slot, title, progress, status) VALUES
    (q3_id, 'KR1', 'REVENUE', 0, 'Green'),
    (q3_id, 'KR2', 'STANDARDIZATION', 0, 'Amber'),
    (q3_id, 'KR3', 'CLIENT-CENTRIC SERVICE DELIVERY', 0, 'Green');

  -- ========== Q4 OBJECTIVE ==========
  INSERT INTO quarterly_objectives (yearly_theme_id, quarter, year, title, description, status, progress)
  VALUES (theme_id, 'Q4', 2025, 'HARNESSING DATA-DRIVEN INSIGHTS', 'To foster organizational efficiency and build stakeholder confidence', 'Active', 0)
  RETURNING id INTO q4_id;

  -- Q4 KRs
  INSERT INTO key_results (objective_id, kr_slot, title, progress, status) VALUES
    (q4_id, 'KR1', 'REVENUE', 0, 'Green'),
    (q4_id, 'KR2', 'DATA-DRIVEN PRODUCT EXCELLENCE', 0, 'Amber'),
    (q4_id, 'KR3', 'ORGANIZATIONAL ALIGNMENT', 0, 'Green'),
    (q4_id, 'KR4', 'STAKEHOLDER CONFIDENCE', 0, 'Green');
END $$;

-- 3. Add Sub-KRs
DO $$
DECLARE kr_rec RECORD;
BEGIN
  FOR kr_rec IN 
    SELECT kr.id, kr.kr_slot, qo.quarter
    FROM key_results kr
    JOIN quarterly_objectives qo ON kr.objective_id = qo.id
    WHERE qo.year = 2025
    ORDER BY qo.quarter, kr.kr_slot
  LOOP
    -- Q1 Sub-KRs
    IF kr_rec.quarter = 'Q1' AND kr_rec.kr_slot = 'KR1' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES (kr_rec.id, 'KR1.1: Revenue Generation', 0, 1.0);
    END IF;
    IF kr_rec.quarter = 'Q1' AND kr_rec.kr_slot = 'KR2' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES 
        (kr_rec.id, 'KR2.1: Review business Structures', 0, 1.0),
        (kr_rec.id, 'KR2.2: Optimizing business', 0, 1.0),
        (kr_rec.id, 'KR2.3: Intentional collaboration', 0, 1.0);
    END IF;
    IF kr_rec.quarter = 'Q1' AND kr_rec.kr_slot = 'KR3' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES 
        (kr_rec.id, 'KR3.1: Data feedback', 0, 1.0),
        (kr_rec.id, 'KR3.2: Ideation', 0, 1.0),
        (kr_rec.id, 'KR3.3: Regulatory compliance', 0, 1.0);
    END IF;

    -- Q2 Sub-KRs
    IF kr_rec.quarter = 'Q2' AND kr_rec.kr_slot = 'KR1' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES (kr_rec.id, 'KR1.1: Revenue Generation', 0, 1.0);
    END IF;
    IF kr_rec.quarter = 'Q2' AND kr_rec.kr_slot = 'KR2' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES 
        (kr_rec.id, 'KR2.1: Creating Teams', 0, 1.0),
        (kr_rec.id, 'KR2.2: Aligning Goals', 0, 1.0),
        (kr_rec.id, 'KR2.3: Methodology', 0, 1.0);
    END IF;
    IF kr_rec.quarter = 'Q2' AND kr_rec.kr_slot = 'KR3' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES 
        (kr_rec.id, 'KR3.1: Client engagement', 0, 1.0),
        (kr_rec.id, 'KR3.2: Client insight', 0, 1.0),
        (kr_rec.id, 'KR3.3: 80-20 Growth', 0, 1.0);
    END IF;

    -- Q3 Sub-KRs
    IF kr_rec.quarter = 'Q3' AND kr_rec.kr_slot = 'KR1' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES (kr_rec.id, 'KR1.1: Revenue Generation', 0, 1.0);
    END IF;
    IF kr_rec.quarter = 'Q3' AND kr_rec.kr_slot = 'KR2' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES 
        (kr_rec.id, 'KR2.1: Operationalize Structures', 0, 1.0),
        (kr_rec.id, 'KR2.2: Data models', 0, 1.0),
        (kr_rec.id, 'KR2.3: Technology Framework', 0, 1.0);
    END IF;
    IF kr_rec.quarter = 'Q3' AND kr_rec.kr_slot = 'KR3' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES 
        (kr_rec.id, 'KR3.1: Product ownership', 0, 1.0),
        (kr_rec.id, 'KR3.2: Stakeholder engagement', 0, 1.0),
        (kr_rec.id, 'KR3.3: Go-Deep & Go-Wide', 0, 1.0);
    END IF;

    -- Q4 Sub-KRs
    IF kr_rec.quarter = 'Q4' AND kr_rec.kr_slot = 'KR1' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES (kr_rec.id, 'KR1.1: Revenue Generation', 0, 1.0);
    END IF;
    IF kr_rec.quarter = 'Q4' AND kr_rec.kr_slot = 'KR2' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES 
        (kr_rec.id, 'KR2.1: Product Execution', 0, 1.0),
        (kr_rec.id, 'KR2.2: Standardization', 0, 1.0),
        (kr_rec.id, 'KR2.3: Transformational Insights', 0, 1.0);
    END IF;
    IF kr_rec.quarter = 'Q4' AND kr_rec.kr_slot = 'KR3' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES 
        (kr_rec.id, 'KR3.1: Team Structure', 0, 1.0),
        (kr_rec.id, 'KR3.2: Business Model', 0, 1.0),
        (kr_rec.id, 'KR3.3: Organizational Stability', 0, 1.0);
    END IF;
    IF kr_rec.quarter = 'Q4' AND kr_rec.kr_slot = 'KR4' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES 
        (kr_rec.id, 'KR4.1: Stakeholder Engagement', 0, 1.0),
        (kr_rec.id, 'KR4.2: Client Ownership', 0, 1.0);
    END IF;
  END LOOP;
END $$;

-- Verify
SELECT yt.year, qo.quarter, qo.title as objective FROM yearly_themes yt 
JOIN quarterly_objectives qo ON yt.id = qo.yearly_theme_id 
WHERE yt.year = 2025 ORDER BY qo.quarter;

SELECT '2025 OKR seeding COMPLETED!' as result;