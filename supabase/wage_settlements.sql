-- ============================================================
-- CSMS - Wage Settlements Table
-- Run this in the Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS wage_settlements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  days_present INTEGER NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  settled_at TIMESTAMPTZ DEFAULT NOW(),
  settled_by UUID REFERENCES profiles(id)
);

ALTER TABLE wage_settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view wage settlements"
  ON wage_settlements FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert wage settlements"
  ON wage_settlements FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
