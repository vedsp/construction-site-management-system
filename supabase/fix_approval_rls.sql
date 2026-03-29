-- ============================================
-- COMPLETE FIX: Approval system setup
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================

-- Step 1: Add is_approved column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;

-- Step 2: Mark ALL existing users as approved
UPDATE profiles SET is_approved = TRUE;

-- Step 3: Fix the trigger for new user signups
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role, is_approved)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'worker'),
    CASE WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'worker') = 'admin' THEN TRUE ELSE FALSE END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Drop ALL old policies on profiles to start clean
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Step 5: Recreate all policies fresh
-- SELECT: all authenticated users can see all profiles
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT TO authenticated
  USING (true);

-- INSERT: users can create their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- UPDATE: users can update own profile OR admins can update any profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (
    auth.uid() = id
    OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- DELETE: admins can delete any profile
CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
