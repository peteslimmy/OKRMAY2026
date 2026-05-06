-- ============================================================================
-- MONTHLY FINANCIAL ACTUALS MODULE
-- Variance analysis, BU ranking, financial integration
-- ============================================================================

-- 1. Monthly Actuals Table
CREATE TABLE IF NOT EXISTS monthly_actuals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bu_id UUID NOT NULL,
  bu_name TEXT NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  projection DECIMAL(15,2) NOT NULL,
  actual DECIMAL(15,2),
  variance DECIMAL(15,2),
  variance_pct DECIMAL(5,2),
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'FILED', 'REVIEWED', 'APPROVED')),
  filed_by UUID,
  filed_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bu_id, month, year)
);

-- 2. Variance Analysis View
CREATE OR REPLACE VIEW v_bu_variance_analysis AS
SELECT 
  bu_id,
  bu_name,
  month,
  year,
  projection,
  actual,
  variance,
  variance_pct,
  status,
  CASE 
    WHEN variance_pct IS NULL THEN 'NO_DATA'
    WHEN variance_pct > 10 THEN 'OVER_PERFORMANCE'
    WHEN variance_pct >= -10 AND variance_pct <= 10 THEN 'ON_TRACK'
    WHEN variance_pct < -10 THEN 'UNDER_PERFORMANCE'
  END AS performance_category
FROM monthly_actuals
WHERE actual IS NOT NULL
ORDER BY year DESC, month DESC, variance_pct DESC;

-- 3. BU Ranking by Variance
CREATE OR REPLACE VIEW v_bu_ranking AS
SELECT 
  bu_id,
  bu_name,
  SUM(actual) AS total_actual,
  SUM(projection) AS total_projection,
  SUM(actual) - SUM(projection) AS total_variance,
  CASE 
    WHEN SUM(projection) > 0 THEN ROUND(((SUM(actual) - SUM(projection)) / SUM(projection) * 100, 2)
    ELSE 0
  END AS overall_variance_pct,
  COUNT(*) AS months_filed,
  RANK() OVER (ORDER BY CASE WHEN SUM(projection) > 0 THEN ((SUM(actual) - SUM(projection)) / SUM(projection)) DESC NULLS LAST) AS bu_rank
FROM monthly_actuals
WHERE actual IS NOT NULL AND status IN ('FILED', 'REVIEWED', 'APPROVED')
GROUP BY bu_id, bu_name;

-- 4. Function to calculate and update variance
CREATE OR REPLACE FUNCTION update_variance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.actual IS NOT NULL AND NEW.projection > 0 THEN
    NEW.variance := NEW.actual - NEW.projection;
    NEW.variance_pct := ROUND(((NEW.actual - NEW.projection) / NEW.projection) * 100, 2);
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_variance ON monthly_actuals;
CREATE TRIGGER trg_update_variance
  BEFORE INSERT OR UPDATE ON monthly_actuals
  FOR EACH ROW EXECUTE FUNCTION update_variance();

-- 5. File monthly actuals function
CREATE OR REPLACE FUNCTION file_monthly_actuals(
  p_bu_id UUID,
  p_month INTEGER,
  p_year INTEGER,
  p_projection DECIMAL(15,2),
  p_actual DECIMAL(15,2)
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  INSERT INTO monthly_actuals (bu_id, bu_name, month, year, projection, actual, status, filed_by)
  VALUES (
    p_bu_id,
    (SELECT name FROM business_units WHERE id = p_bu_id),
    p_month,
    p_year,
    p_projection,
    p_actual,
    'FILED',
    v_user_id
  )
  ON CONFLICT (bu_id, month, year)
  DO UPDATE SET
    projection = EXCLUDED.projection,
    actual = EXCLUDED.actual,
    status = 'FILED',
    filed_by = EXCLUDED.filed_by,
    filed_at = NOW()
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Governance Score Calculation
CREATE OR REPLACE FUNCTION calculate_governance_score(p_year INTEGER, p_quarter TEXT)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  v_bpi_avg DECIMAL(5,2);
  v_compliance_rate DECIMAL(5,2);
  v_total_bus INTEGER;
  v_compliant_bus INTEGER;
  v_score DECIMAL(5,2);
BEGIN
  -- Average BPI across all BUs
  SELECT COALESCE(AVG(overall_bpi), 0) INTO v_bpi_avg
  FROM (
    SELECT bu_id, AVG(bpi_score) AS overall_bpi
    FROM quarterly_bpi_scores
    WHERE year = p_year AND quarter = p_quarter
    GROUP BY bu_id
  ) sub;

  -- Compliance rate (BUs with 0 major violations)
  SELECT COUNT(*) INTO v_total_bus FROM business_units;
  SELECT COUNT(DISTINCT bu_id) INTO v_compliant_bus
  FROM violations
  WHERE severity = 'MAJOR' AND year = p_year;
  
  v_compliance_rate := CASE 
    WHEN v_total_bus > 0 THEN ((v_total_bus - v_compliant_bus)::DECIMAL / v_total_bus) * 100
    ELSE 100
  END;

  -- Weighted governance score (60% BPI, 40% Compliance)
  v_score := (v_bpi_avg * 0.60) + (v_compliance_rate * 0.40);
  
  RETURN ROUND(v_score, 2);
END;
$$ LANGUAGE plpgsql;

-- 7. KR Heatmap Data
CREATE OR REPLACE VIEW v_kr_heatmap AS
SELECT 
  kr.id AS kr_id,
  kr.title AS kr_title,
  kr.bu_id,
  bu.name AS bu_name,
  kr.quarter,
  kr.year,
  kr.target_value,
  kr.current_value,
  ROUND((kr.current_value / NULLIF(kr.target_value, 0)) * 100, 2) AS attainment_pct,
  COALESCE(ma.total_actual, 0) AS financial_actual,
  COALESCE(ma.total_projection, 0) AS financial_projection,
  CASE 
    WHEN ma.total_projection > 0 THEN ROUND(((ma.total_actual - ma.total_projection) / ma.total_projection) * 100, 2)
    ELSE 0
  END AS financial_variance_pct
FROM key_results kr
LEFT JOIN business_units bu ON kr.bu_id = bu.id
LEFT JOIN (
  SELECT bu_id, SUM(actual) AS total_actual, SUM(projection) AS total_projection
  FROM monthly_actuals
  WHERE status IN ('FILED', 'REVIEWED', 'APPROVED')
  GROUP BY bu_id
) ma ON kr.bu_id = ma.bu_id;

-- GRANTs
GRANT SELECT ON monthly_actuals TO authenticated;
GRANT SELECT ON v_bu_variance_analysis TO authenticated;
GRANT SELECT ON v_bu_ranking TO authenticated;
GRANT SELECT ON v_kr_heatmap TO authenticated;
GRANT EXECUTE ON FUNCTION file_monthly_actuals TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_governance_score TO authenticated;