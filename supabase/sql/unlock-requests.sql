-- ============================================================================
-- MANUAL UNLOCK REQUESTS: Database table for unlock workflow
-- ============================================================================

CREATE TABLE IF NOT EXISTS unlock_requests (
  id TEXT PRIMARY KEY,
  week INTEGER NOT NULL,
  year INTEGER NOT NULL,
  requested_by_id TEXT NOT NULL,
  requested_by_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED')),
  reviewed_by_id TEXT,
  reviewed_by_name TEXT,
  review_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_unlock_status ON unlock_requests(status);
CREATE INDEX IF NOT EXISTS idx_unlock_week ON unlock_requests(week, year);

ALTER TABLE unlock_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can create unlock requests" ON unlock_requests 
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can view unlock requests" ON unlock_requests 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can update unlock requests" ON unlock_requests 
  FOR UPDATE TO authenticated USING (true);