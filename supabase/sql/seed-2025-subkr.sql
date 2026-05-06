-- ================================================
-- 2025 Quarterly OKR Sub-KRs Seeding
-- Run this in Supabase SQL Editor
-- ================================================

DO $$
DECLARE kr_rec RECORD;
BEGIN
  -- Loop through each KR and add Sub-KRs based on the provided data
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
        (kr_rec.id, 'KR2.1: Review business Structures, Processes, Reach & Impact', 0, 1.0),
        (kr_rec.id, 'KR2.2: Optimizing existing business and advancing new opportunities', 0, 1.0),
        (kr_rec.id, 'KR2.3: Intentional collaboration for technology entrenchment', 0, 1.0);
    END IF;
    
    IF kr_rec.quarter = 'Q1' AND kr_rec.kr_slot = 'KR3' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES 
        (kr_rec.id, 'KR3.1: Data and User feedback for Product Improvement', 0, 1.0),
        (kr_rec.id, 'KR3.2: Ideation and new product/features identification', 0, 1.0),
        (kr_rec.id, 'KR3.3: Regulatory and compliance processes', 0, 1.0);
    END IF;

    -- Q2 Sub-KRs
    IF kr_rec.quarter = 'Q2' AND kr_rec.kr_slot = 'KR1' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES (kr_rec.id, 'KR1.1: Revenue Generation', 0, 1.0);
    END IF;
    
    IF kr_rec.quarter = 'Q2' AND kr_rec.kr_slot = 'KR2' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES 
        (kr_rec.id, 'KR2.1: Creating & Reticulating Business & Product Teams', 0, 1.0),
        (kr_rec.id, 'KR2.2: Aligning Goals with Roles & Responsibilities Matrix', 0, 1.0),
        (kr_rec.id, 'KR2.3: Define and Implement Methodology & Measurement', 0, 1.0);
    END IF;
    
    IF kr_rec.quarter = 'Q2' AND kr_rec.kr_slot = 'KR3' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES 
        (kr_rec.id, 'KR3.1: Data-driven client engagement for business growth', 0, 1.0),
        (kr_rec.id, 'KR3.2: Data-driven client insight for entrenchment', 0, 1.0),
        (kr_rec.id, 'KR3.3: 80-20 driven Growth', 0, 1.0);
    END IF;

    -- Q3 Sub-KRs
    IF kr_rec.quarter = 'Q3' AND kr_rec.kr_slot = 'KR1' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES (kr_rec.id, 'KR1.1: Revenue Generation', 0, 1.0);
    END IF;
    
    IF kr_rec.quarter = 'Q3' AND kr_rec.kr_slot = 'KR2' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES 
        (kr_rec.id, 'KR2.1: Operationalize Business/Product Team Structures', 0, 1.0),
        (kr_rec.id, 'KR2.2: Defining quality data models and reporting', 0, 1.0),
        (kr_rec.id, 'KR2.3: Build scalable technology Framework', 0, 1.0);
    END IF;
    
    IF kr_rec.quarter = 'Q3' AND kr_rec.kr_slot = 'KR3' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES 
        (kr_rec.id, 'KR3.1: Improve external product ownership', 0, 1.0),
        (kr_rec.id, 'KR3.2: Intentional stakeholder engagement', 0, 1.0),
        (kr_rec.id, 'KR3.3: Go-Deep & Go-Wide (80/20)', 0, 1.0);
    END IF;

    -- Q4 Sub-KRs
    IF kr_rec.quarter = 'Q4' AND kr_rec.kr_slot = 'KR1' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES (kr_rec.id, 'KR1.1: Revenue Generation', 0, 1.0);
    END IF;
    
    IF kr_rec.quarter = 'Q4' AND kr_rec.kr_slot = 'KR2' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES 
        (kr_rec.id, 'KR2.1: Product Execution/Activation', 0, 1.0),
        (kr_rec.id, 'KR2.2: Product Standardization & Evolution', 0, 1.0),
        (kr_rec.id, 'KR2.3: Transformational Insights', 0, 1.0);
    END IF;
    
    IF kr_rec.quarter = 'Q4' AND kr_rec.kr_slot = 'KR3' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES 
        (kr_rec.id, 'KR3.1: Enhanced Team Structure with Communication', 0, 1.0),
        (kr_rec.id, 'KR3.2: Business Model Evaluation', 0, 1.0),
        (kr_rec.id, 'KR3.3: Organizational Stability', 0, 1.0);
    END IF;
    
    IF kr_rec.quarter = 'Q4' AND kr_rec.kr_slot = 'KR4' THEN
      INSERT INTO sub_krs (kr_id, title, progress, weight) VALUES 
        (kr_rec.id, 'KR4.1: Impact Driven Stakeholder Engagement', 0, 1.0),
        (kr_rec.id, 'KR4.2: Client Driven Ownership Guided By Market Insights', 0, 1.0);
    END IF;
  END LOOP;
END $$;

-- Verify Sub-KRs
SELECT qo.quarter, kr.kr_slot, skr.title as sub_kr
FROM sub_krs skr
JOIN key_results kr ON skr.kr_id = kr.id
JOIN quarterly_objectives qo ON kr.objective_id = qo.id
WHERE qo.year = 2025
ORDER BY qo.quarter, kr.kr_slot;

SELECT 'Sub-KRs seeding completed!' as result;