git push origin main-- ============================================================
-- Fix: Allow project updates for users whose role is 'admin'
-- either in the profiles table OR in auth user_metadata.
-- Run this in the Supabase SQL Editor.
-- ============================================================

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Admins can update projects" ON projects;

-- Create a new UPDATE policy that checks BOTH profiles.role AND user_metadata.role
CREATE POLICY "Admins can update projects"
  ON projects FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
