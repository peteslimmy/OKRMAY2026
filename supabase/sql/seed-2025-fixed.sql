-- ================================================
-- 2025 OKR Seeding Script - FIXED for correct table structure
-- Run this in Supabase SQL Editor
-- ================================================

-- 1. Create Yearly Theme for 2025
INSERT INTO yearly_themes (year, title, description, is_active, created_by, updated_by)
VALUES (2025, '2025 Strategic Excellence', 'Business advancement through intentional structural reformation, data informed product evolution.', true, NULL, NULL);

-- 2. Create Objectives and KRs in the objectives table
DO $$
DECLARE theme_id UUID;
DECLARE obj_q1 UUID;
DECLARE obj_q2 UUID;
DECLARE obj_q3 UUID;
DECLARE obj_q4 UUID;
BEGIN
  SELECT id INTO theme_id FROM yearly_themes WHERE year = 2025 LIMIT 1;

  -- Q1 Objective (using objectives table)
  INSERT INTO objectives (title, description, quarter, year, status)
  VALUES ('BUSINESS ADVANCEMENT THROUGH INTENTIONAL STRUCTURAL REFORMATION', 'DATA INFORMED PRODUCT EVOLUTION AND ENTRENCHMENT OF PROCESSES AND TECHNOLOGY', 'Q1', 2025, 'Active')
  RETURNING id INTO obj_q1;

  -- Q1 KRs
  INSERT INTO key_results (objective_id, kr_slot, title, progress, status) VALUES
    (obj_q1, 'KR1', 'REVENUE', 0, 'Green'),
    (obj_q1, 'KR2', 'INTENTIONAL STRUCTURAL REFORMS', 0, 'Amber'),
    (obj_q1, 'KR3', 'DATA-DRIVEN INNOVATION', 0, 'Green');

  -- Q2 Objective
  INSERT INTO objectives (title, description, quarter, year, status)
  VALUES ('REALIGNING BUSINESS AND PRODUCT TEAM STRUCTURE', 'To Enable Data-Driven Service Evolution', 'Q2', 2025, 'Active')
  RETURNING id INTO obj_q2;

  -- Q2 KRs
  INSERT INTO key_results (objective_id, kr_slot, title, progress, status) VALUES
    (obj_q2, 'KR1', 'REVENUE', 0, 'Green'),
    (obj_q2, 'KR2', 'TEAM STRUCTURE REALIGNMENT', 0, 'Amber'),
    (obj_q2, 'KR3', 'CLIENT-CENTRIC EVOLUTION', 0, 'Green');

  -- Q3 Objective
  INSERT INTO objectives (title, description, quarter, year, status)
  VALUES ('LEVERAGING STANDARDIZED OPERATIONS', 'To advance product development', 'Q3', 2025, 'Active')
  RETURNING id INTO obj_q3;

  -- Q3 KRs
  INSERT INTO key_results (objective_id, kr_slot, title, progress, status) VALUES
    (obj_q3, 'KR1', 'REVENUE', 0, 'Green'),
    (obj_q3, 'KR2', 'STANDARDIZATION', 0, 'Amber'),
    (obj_q3, 'KR3', 'SERVICE DELIVERY', 0, 'Green');

  -- Q4 Objective
  INSERT INTO objectives (title, description, quarter, year, status)
  VALUES ('HARNESSING DATA-DRIVEN INSIGHTS', 'To foster organizational efficiency', 'Q4', 2025, 'Active')
  RETURNING id INTO obj_q4;

  -- Q4 KRs
  INSERT INTO key_results (objective_id, kr_slot, title, progress, status) VALUES
    (obj_q4, 'KR1', 'REVENUE', 0, 'Green'),
    (obj_q4, 'KR2', 'PRODUCT EXCELLENCE', 0, 'Amber'),
    (obj_q4, 'KR3', 'ORGANIZATIONAL ALIGNMENT', 0, 'Green'),
    (obj_q4, 'KR4', 'STAKEHOLDER CONFIDENCE', 0, 'Green');
END $$;

-- 3. Add Sub-KRs
DO $$
DECLARE kr_rec RECORD;
BEGIN
  FOR kr_rec IN 
    SELECT kr.id, kr.kr_slot::text as kr_slot, o.quarter::text as quarter
    FROM key_results kr
    JOIN objectives o ON kr.objective_id = o.id
    WHERE o.year = 2025
    ORDER BY o.quarter, kr.kr_slot
  LOOP
    -- Q1 Sub-KRs
    IF kr_rec.quarter = 'Q1' AND kr_rec.kr_slot = 'KR1' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES (kr_rec.id, 'KR1.1: Revenue Generation', 0, 1.0);
    END IF;
    IF kr_rec.quarter = 'Q1' AND kr_rec.kr_slot = 'KR2' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES 
        (kr_rec.id, 'KR2.1: Review business Structures', 0, 1.0),
        (kr_rec.id, 'KR2.2: Optimizing business', 0, 1.0),
        (kr_rec.id, 'KR2.3: Collaboration', 0, 1.0);
    END IF;
    IF kr_rec.quarter = 'Q1' AND kr_rec.kr_slot = 'KR3' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES 
        (kr_rec.id, 'KR3.1: Data feedback', 0, 1.0),
        (kr_rec.id, 'KR3.2: Ideation', 0, 1.0),
        (kr_rec.id, 'KR3.3: Compliance', 0, 1.0);
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
        (kr_rec.id, 'KR2.1: Operationalize', 0, 1.0),
        (kr_rec.id, 'KR2.2: Data models', 0, 1.0),
        (kr_rec.id, 'KR2.3: Technology', 0, 1.0);
    END IF;
    IF kr_rec.quarter = 'Q3' AND kr_rec.kr_slot = 'KR3' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES 
        (kr_rec.id, 'KR3.1: Product ownership', 0, 1.0),
        (kr_rec.id, 'KR3.2: Engagement', 0, 1.0),
        (kr_rec.id, 'KR3.3: Go-Deep & Go-Wide', 0, 1.0);
    END IF;

    -- Q4 Sub-KRs
    IF kr_rec.quarter = 'Q4' AND kr_rec.kr_slot = 'KR1' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES (kr_rec.id, 'KR1.1: Revenue Generation', 0, 1.0);
    END IF;
    IF kr_rec.quarter = 'Q4' AND kr_rec.kr_slot = 'KR2' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES 
        (kr_rec.id, 'KR2.1: Execution', 0, 1.0),
        (kr_rec.id, 'KR2.2: Standardization', 0, 1.0),
        (kr_rec.id, 'KR2.3: Insights', 0, 1.0);
    END IF;
    IF kr_rec.quarter = 'Q4' AND kr_rec.kr_slot = 'KR3' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES 
        (kr_rec.id, 'KR3.1: Team Structure', 0, 1.0),
        (kr_rec.id, 'KR3.2: Business Model', 0, 1.0),
        (kr_rec.id, 'KR3.3: Stability', 0, 1.0);
    END IF;
    IF kr_rec.quarter = 'Q4' AND kr_rec.kr_slot = 'KR4' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES 
        (kr_rec.id, 'KR4.1: Engagement', 0, 1.0),
        (kr_rec.id, 'KR4.2: Ownership', 0, 1.0);
    END IF;
  END LOOP;
END $$;

-- Verify data
SELECT o.quarter, o.title as objective, kr.kr_slot, kr.title as key_result
FROM objectives o
JOIN key_results kr ON o.id = kr.objective_id
WHERE o.year = 2025
ORDER BY o.quarter, kr.kr_slot;

SELECT 'Seeding COMPLETED!' as result;