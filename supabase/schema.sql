-- ============================================
-- CSMS - Construction Site Management System
-- Supabase Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'site_engineer', 'contractor', 'worker')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'worker')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  client TEXT,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'on_hold', 'completed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  budget NUMERIC(15,2) DEFAULT 0,
  start_date DATE,
  deadline DATE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROJECT ASSIGNMENTS (Engineers to Projects)
-- ============================================
CREATE TABLE project_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  engineer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, engineer_id)
);

-- ============================================
-- WORKERS TABLE
-- ============================================
CREATE TABLE workers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE,
  role TEXT NOT NULL,
  phone TEXT,
  project_id UUID REFERENCES projects(id),
  daily_wage NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  joined_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ATTENDANCE TABLE
-- ============================================
CREATE TABLE attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'half_day', 'leave')),
  check_in TIME,
  check_out TIME,
  notes TEXT,
  marked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(worker_id, date)
);

-- ============================================
-- MATERIALS / INVENTORY TABLE
-- ============================================
CREATE TABLE materials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  quantity NUMERIC(10,2) DEFAULT 0,
  unit TEXT NOT NULL,
  min_stock NUMERIC(10,2) DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MATERIAL REQUESTS TABLE
-- ============================================
CREATE TABLE material_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  requested_by TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'engineer_approved', 'engineer_rejected', 'approved', 'rejected')),
  estimated_cost NUMERIC(15,2) DEFAULT 0,
  required_by DATE,
  remarks TEXT,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MATERIAL REQUEST ITEMS
-- ============================================
CREATE TABLE material_request_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_id UUID REFERENCES material_requests(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  unit TEXT NOT NULL,
  rate NUMERIC(10,2) DEFAULT 0,
  amount NUMERIC(15,2) DEFAULT 0,
  urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  project_id UUID REFERENCES projects(id),
  assigned_to UUID REFERENCES workers(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  deadline DATE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVOICES TABLE
-- ============================================
CREATE TABLE invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  project_id UUID REFERENCES projects(id),
  client TEXT NOT NULL,
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal NUMERIC(15,2) DEFAULT 0,
  gst_percent NUMERIC(5,2) DEFAULT 18,
  gst_amount NUMERIC(15,2) DEFAULT 0,
  total_amount NUMERIC(15,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVOICE LINE ITEMS
-- ============================================
CREATE TABLE invoice_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DAILY PROGRESS REPORTS
-- ============================================
CREATE TABLE daily_progress_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  engineer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  date DATE DEFAULT CURRENT_DATE,
  summary TEXT,
  work_done TEXT,
  issues TEXT,
  photos TEXT[], -- Array of photo URLs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, engineer_id, date)
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('approval', 'alert', 'task', 'deadline', 'info')),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  icon TEXT DEFAULT 'info',
  reference_id UUID,
  reference_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Projects: all authenticated users can view
CREATE POLICY "Projects viewable by authenticated users"
  ON projects FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage projects"
  ON projects FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Workers: all authenticated users can view
CREATE POLICY "Workers viewable by authenticated users"
  ON workers FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins and engineers can manage workers"
  ON workers FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'site_engineer')
    )
  );

-- Notifications: users can only see their own
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (true);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON workers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON material_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
