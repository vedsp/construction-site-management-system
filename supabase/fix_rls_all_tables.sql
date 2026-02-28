-- ============================================================
-- CSMS - Comprehensive RLS Policy Fix for ALL tables
-- Safe to run multiple times (drops before creating)
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ── PROJECTS ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Projects viewable by authenticated users" ON projects;
DROP POLICY IF EXISTS "Admins can manage projects" ON projects;
DROP POLICY IF EXISTS "Admins can insert projects" ON projects;
DROP POLICY IF EXISTS "Admins can update projects" ON projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON projects;

CREATE POLICY "Projects viewable by authenticated users"
  ON projects FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert projects"
  ON projects FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update projects"
  ON projects FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── MATERIAL REQUESTS ─────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated users can view material requests" ON material_requests;
DROP POLICY IF EXISTS "Authenticated users can insert material requests" ON material_requests;
DROP POLICY IF EXISTS "Admins can manage material requests" ON material_requests;
DROP POLICY IF EXISTS "Admins can update material requests" ON material_requests;
DROP POLICY IF EXISTS "Admins can delete material requests" ON material_requests;

CREATE POLICY "Authenticated users can view material requests"
  ON material_requests FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert material requests"
  ON material_requests FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins can update material requests"
  ON material_requests FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'site_engineer')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'site_engineer')));

CREATE POLICY "Admins can delete material requests"
  ON material_requests FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── MATERIAL REQUEST ITEMS ────────────────────────────────
DROP POLICY IF EXISTS "Authenticated can view material request items" ON material_request_items;
DROP POLICY IF EXISTS "Authenticated can insert material request items" ON material_request_items;
DROP POLICY IF EXISTS "Authenticated can delete material request items" ON material_request_items;

CREATE POLICY "Authenticated can view material request items"
  ON material_request_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert material request items"
  ON material_request_items FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can delete material request items"
  ON material_request_items FOR DELETE TO authenticated USING (true);

-- ── MATERIALS / INVENTORY ─────────────────────────────────
DROP POLICY IF EXISTS "Authenticated can view materials" ON materials;
DROP POLICY IF EXISTS "Admins can insert materials" ON materials;
DROP POLICY IF EXISTS "Admins can update materials" ON materials;
DROP POLICY IF EXISTS "Admins can delete materials" ON materials;
DROP POLICY IF EXISTS "Admins can manage materials" ON materials;

CREATE POLICY "Authenticated can view materials"
  ON materials FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert materials"
  ON materials FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update materials"
  ON materials FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'site_engineer')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'site_engineer')));

CREATE POLICY "Admins can delete materials"
  ON materials FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── ATTENDANCE ────────────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated can view attendance" ON attendance;
DROP POLICY IF EXISTS "Authenticated can insert attendance" ON attendance;
DROP POLICY IF EXISTS "Admins can update attendance" ON attendance;
DROP POLICY IF EXISTS "Admins can delete attendance" ON attendance;
DROP POLICY IF EXISTS "Admins can manage attendance" ON attendance;

CREATE POLICY "Authenticated can view attendance"
  ON attendance FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert attendance"
  ON attendance FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins can update attendance"
  ON attendance FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'site_engineer')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'site_engineer')));

CREATE POLICY "Admins can delete attendance"
  ON attendance FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── TASKS ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated can view tasks" ON tasks;
DROP POLICY IF EXISTS "Admins can insert tasks" ON tasks;
DROP POLICY IF EXISTS "Admins can update tasks" ON tasks;
DROP POLICY IF EXISTS "Admins can delete tasks" ON tasks;
DROP POLICY IF EXISTS "Admins can manage tasks" ON tasks;

CREATE POLICY "Authenticated can view tasks"
  ON tasks FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert tasks"
  ON tasks FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'site_engineer')));

CREATE POLICY "Admins can update tasks"
  ON tasks FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'site_engineer')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'site_engineer')));

CREATE POLICY "Admins can delete tasks"
  ON tasks FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── INVOICES ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated can view invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can insert invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can update invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can delete invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can manage invoices" ON invoices;

CREATE POLICY "Authenticated can view invoices"
  ON invoices FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert invoices"
  ON invoices FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update invoices"
  ON invoices FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete invoices"
  ON invoices FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── INVOICE ITEMS ─────────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated can view invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Admins can insert invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Admins can delete invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Admins can manage invoice items" ON invoice_items;

CREATE POLICY "Authenticated can view invoice items"
  ON invoice_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert invoice items"
  ON invoice_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete invoice items"
  ON invoice_items FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── PROJECT ASSIGNMENTS ───────────────────────────────────
DROP POLICY IF EXISTS "Authenticated can view project assignments" ON project_assignments;
DROP POLICY IF EXISTS "Admins can manage project assignments" ON project_assignments;

CREATE POLICY "Authenticated can view project assignments"
  ON project_assignments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage project assignments"
  ON project_assignments FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── DAILY PROGRESS REPORTS ────────────────────────────────
DROP POLICY IF EXISTS "Authenticated can view progress reports" ON daily_progress_reports;
DROP POLICY IF EXISTS "Engineers can insert progress reports" ON daily_progress_reports;

CREATE POLICY "Authenticated can view progress reports"
  ON daily_progress_reports FOR SELECT TO authenticated USING (true);

CREATE POLICY "Engineers can insert progress reports"
  ON daily_progress_reports FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'site_engineer')));

-- ── WORKERS (ensure correct policies) ─────────────────────
DROP POLICY IF EXISTS "Workers viewable by authenticated users" ON workers;
DROP POLICY IF EXISTS "Admins and engineers can manage workers" ON workers;
DROP POLICY IF EXISTS "Admins can insert workers" ON workers;
DROP POLICY IF EXISTS "Admins can update workers" ON workers;
DROP POLICY IF EXISTS "Admins can delete workers" ON workers;

CREATE POLICY "Workers viewable by authenticated users"
  ON workers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert workers"
  ON workers FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'site_engineer')));

CREATE POLICY "Admins can update workers"
  ON workers FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'site_engineer')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'site_engineer')));

CREATE POLICY "Admins can delete workers"
  ON workers FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
