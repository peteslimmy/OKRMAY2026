-- ============================================================================
-- 4CORE OKR PLATFORM - FINANCIAL MODULE PART 1
-- Monthly Financial Actuals, Variance Analysis, BU Ranking, KR Heatmap
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
    ELSE 'UNDER_PERFORMANCE'
  END AS performance_category
FROM monthly_actuals
WHERE actual IS NOT NULL;

-- 3. BU Ranking by Variance
CREATE OR REPLACE VIEW v_bu_ranking AS
SELECT 
  bu_id,
  bu_name,
  SUM(actual) AS total_actual,
  SUM(projection) AS total_projection,
  SUM(actual) - SUM(projection) AS total_variance,
  ROUND(
    CASE 
      WHEN SUM(projection) > 0 THEN ((SUM(actual) - SUM(projection)) / SUM(projection) * 100
      ELSE 0
    END, 2
  ) AS overall_variance_pct,
  COUNT(*) AS months_filed
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

CREATE TRIGGER trg_update_variance
  BEFORE INSERT OR UPDATE ON monthly_actuals
  FOR EACH ROW EXECUTE FUNCTION update_variance();

-- 5. Governance Score Calculation
CREATE OR REPLACE FUNCTION calculate_governance_score(p_year INTEGER, p_quarter TEXT)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  v_score DECIMAL(5,2);
BEGIN
  v_score := 75.00;
  RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- GRANTS
GRANT SELECT ON monthly_actuals TO authenticated;
GRANT SELECT ON v_bu_variance_analysis TO authenticated;
GRANT SELECT ON v_bu_ranking TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_governance_score TO authenticated;