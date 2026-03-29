-- ============================================
-- MIGRATION: Add approval-based login system
-- Run this SQL in the Supabase SQL Editor
-- ============================================

-- 1. Add is_approved column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;

-- 2. Auto-approve existing admin users
UPDATE profiles SET is_approved = TRUE WHERE role = 'admin';

-- 3. Auto-approve ALL existing users (they were already using the system)
UPDATE profiles SET is_approved = TRUE WHERE is_approved IS NULL OR is_approved = FALSE;

-- 4. Replace the handle_new_user trigger to set is_approved based on role
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role, is_approved)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'worker'),
    -- Only auto-approve admin accounts
    CASE WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'worker') = 'admin' THEN TRUE ELSE FALSE END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Allow authenticated users to insert their own profile (fallback if trigger fails)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON profiles FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 6. Allow admins to update any profile (for approvals)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update any profile'
  ) THEN
    CREATE POLICY "Admins can update any profile"
      ON profiles FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- 7. Allow admins to delete profiles (for rejecting users)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete profiles'
  ) THEN
    CREATE POLICY "Admins can delete profiles"
      ON profiles FOR DELETE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;
