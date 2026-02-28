-- ============================================================
-- CSMS - Fix RLS policies for projects table
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard → SQL Editor → New Query
-- ============================================================

-- Drop the old catch-all policy (FOR ALL with only USING clause
-- doesn't reliably cover INSERT WITH CHECK in all Postgres versions)
DROP POLICY IF EXISTS "Admins can manage projects" ON projects;

-- SELECT: all authenticated users can view all projects
-- (keep existing policy – this is fine as-is)
-- DROP POLICY IF EXISTS "Projects viewable by authenticated users" ON projects;

-- INSERT: admins only
CREATE POLICY "Admins can insert projects"
  ON projects FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- UPDATE: admins only
CREATE POLICY "Admins can update projects"
  ON projects FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- DELETE: admins only
CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- VERIFY your profile has role='admin' in the profiles table.
-- Run this to check (replace with your actual user UUID):
-- SELECT id, full_name, role FROM profiles WHERE id = auth.uid();
--
-- If your role is not 'admin', update it:
-- UPDATE profiles SET role = 'admin' WHERE id = auth.uid();
-- ============================================================
