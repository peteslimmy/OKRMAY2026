-- ============================================================================
-- ANOMALY DETECTION: Database tables and indexes
-- ============================================================================

CREATE TABLE IF NOT EXISTS anomaly_alerts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  user_id TEXT,
  user_name TEXT,
  description TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anomaly_timestamp ON anomaly_alerts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_anomaly_type ON anomaly_alerts(type);
CREATE INDEX IF NOT EXISTS idx_anomaly_severity ON anomaly_alerts(severity);

ALTER TABLE anomaly_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view anomalies" ON anomaly_alerts 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert anomalies" ON anomaly_alerts 
  FOR INSERT TO authenticated WITH CHECK (true);