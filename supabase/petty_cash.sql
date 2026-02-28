-- ============================================================
-- CSMS - Petty Cash Transactions Table
-- Run this in the Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS petty_cash (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  engineer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  description TEXT,
  recorded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE petty_cash ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view petty cash"
  ON petty_cash FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert petty cash"
  ON petty_cash FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete petty cash"
  ON petty_cash FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
