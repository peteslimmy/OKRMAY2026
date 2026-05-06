-- ============================================================================
-- GOVERNANCE ANOMALY DETECTION: Integrity & Compliance tracking
-- Enables automated flagging of system-level governance violations
-- ============================================================================

CREATE TYPE anomaly_severity AS ENUM ('low', 'medium', 'high');

CREATE TABLE IF NOT EXISTS anomaly_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- 'ACTIVITY', 'OBJECTIVE', 'USER', 'SYSTEM'
  entity_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  severity anomaly_severity DEFAULT 'low',
  flagged_at TIMESTAMPTZ DEFAULT NOW(),
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for fast lookup of unresolved anomalies
CREATE INDEX IF NOT EXISTS idx_anomaly_flags_unresolved ON anomaly_flags(is_resolved) WHERE is_resolved = false;
CREATE INDEX IF NOT EXISTS idx_anomaly_flags_entity ON anomaly_flags(entity_type, entity_id);

-- Enable RLS
ALTER TABLE anomaly_flags ENABLE ROW LEVEL SECURITY;

-- Governance Viewers and Admins can view anomalies
CREATE POLICY "Allow view for authenticated users" ON anomaly_flags
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only Admins and SuperAdmins can resolve anomalies
CREATE POLICY "Allow resolve for administrators" ON anomaly_flags
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('Admin', 'SuperAdmin')
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('Admin', 'SuperAdmin')
      )
    );

-- Migration complete. System can now persist governance anomalies.
