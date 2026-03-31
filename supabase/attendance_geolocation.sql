-- ============================================
-- ATTENDANCE GEOLOCATION & DAILY PROGRESS
-- Migration: Add GPS columns to attendance,
-- site coordinates to projects, and enhance
-- daily_progress_reports
-- ============================================

-- Add geolocation columns to attendance table
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS check_in_lat DOUBLE PRECISION;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS check_in_lng DOUBLE PRECISION;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS check_out_lat DOUBLE PRECISION;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS check_out_lng DOUBLE PRECISION;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS location_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMPTZ;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS check_out_time TIMESTAMPTZ;

-- Add site coordinates to projects for geofence validation
ALTER TABLE projects ADD COLUMN IF NOT EXISTS site_lat DOUBLE PRECISION;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS site_lng DOUBLE PRECISION;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS geofence_radius INTEGER DEFAULT 300; -- metres

-- Add weather & labor count to daily_progress_reports
ALTER TABLE daily_progress_reports ADD COLUMN IF NOT EXISTS weather TEXT DEFAULT 'clear';
ALTER TABLE daily_progress_reports ADD COLUMN IF NOT EXISTS labor_count INTEGER DEFAULT 0;
ALTER TABLE daily_progress_reports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- RLS policies for daily_progress_reports (if not already set)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'daily_progress_reports' AND policyname = 'DPR viewable by authenticated'
  ) THEN
    EXECUTE 'CREATE POLICY "DPR viewable by authenticated" ON daily_progress_reports FOR SELECT TO authenticated USING (true)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'daily_progress_reports' AND policyname = 'Engineers and admins can manage DPR'
  ) THEN
    EXECUTE 'CREATE POLICY "Engineers and admins can manage DPR" ON daily_progress_reports FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN (''admin'', ''site_engineer'')))';
  END IF;
END $$;
