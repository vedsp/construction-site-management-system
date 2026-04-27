-- ==========================================
-- CSMS DUMMY DATA SEED SCRIPT
-- ==========================================
-- This script safely inserts dummy users and initial relational data.
-- Run this directly in your Supabase SQL Editor.

-- Enable pgcrypto for password hashing if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Create Dummy Users in auth.users
-- Admin User
DO $$
DECLARE
    admin_id uuid := '11111111-1111-1111-1111-111111111111';
    engineer_id uuid := '22222222-2222-2222-2222-222222222222';
    contractor_id uuid := '33333333-3333-3333-3333-333333333333';
    worker_id uuid := '44444444-4444-4444-4444-444444444444';
BEGIN
    -- Delete existing if re-running
    DELETE FROM auth.users WHERE email IN ('admin@example.com', 'engineer@example.com', 'contractor@example.com', 'worker@example.com');

    -- Insert Admin
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
    VALUES (admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@example.com', crypt('password123', gen_salt('bf')), now(), '{"role":"admin", "full_name":"Super Admin"}', now(), now(), '', '', '', '');

    -- Insert Site Engineer
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
    VALUES (engineer_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'engineer@example.com', crypt('password123', gen_salt('bf')), now(), '{"role":"site_engineer", "full_name":"Sam Engineer"}', now(), now(), '', '', '', '');

    -- Insert Contractor
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
    VALUES (contractor_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'contractor@example.com', crypt('password123', gen_salt('bf')), now(), '{"role":"contractor", "full_name":"Carlos Contractor"}', now(), now(), '', '', '', '');

    -- Insert Worker
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
    VALUES (worker_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'worker@example.com', crypt('password123', gen_salt('bf')), now(), '{"role":"worker", "full_name":"Wayne Worker"}', now(), now(), '', '', '', '');

    -- 2. Ensure they are approved in profiles
    -- The trigger might have fired, so we UPSERT
    INSERT INTO public.profiles (id, full_name, role, is_approved)
    VALUES 
        (admin_id, 'Super Admin', 'admin', true),
        (engineer_id, 'Sam Engineer', 'site_engineer', true),
        (contractor_id, 'Carlos Contractor', 'contractor', true),
        (worker_id, 'Wayne Worker', 'worker', true)
    ON CONFLICT (id) DO UPDATE SET is_approved = EXCLUDED.is_approved, role = EXCLUDED.role;
END $$;


-- 3. Populate Projects Table
INSERT INTO public.projects (id, name, location, status, site_lat, site_lng, geofence_radius)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Downtown Skyscraper Tower', 'Sector 14, Downtown', 'in_progress', 19.0760, 72.8777, 300),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Riverside Residential Complex', 'Plot 4, Riverside', 'in_progress', 19.0820, 72.8810, 300),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'City Mall Extension Phase 2', 'Main Street Mall', 'completed', 19.0900, 72.8900, 300)
ON CONFLICT (id) DO NOTHING;

-- 4. Populate Materials Table
INSERT INTO public.materials (id, name, unit, quantity)
VALUES
    ('10000000-1000-1000-1000-100000000000', 'Cement Bags (50kg)', 'bags', 500),
    ('20000000-2000-2000-2000-200000000000', 'Steel Rebar (TMT)', 'tons', 120),
    ('30000000-3000-3000-3000-300000000000', 'Brick Pallets', 'pallets', 80)
ON CONFLICT (id) DO NOTHING;

-- 5. Populate Material Requests Table
DO $$
DECLARE
    req1_id uuid := uuid_generate_v4();
    req2_id uuid := uuid_generate_v4();
BEGIN
    INSERT INTO public.material_requests (id, project_id, requested_by, status, date)
    VALUES
        (req1_id, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Carlos Contractor', 'pending', now()::date),
        (req2_id, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Carlos Contractor', 'approved', (now() - interval '2 days')::date);

    INSERT INTO public.material_request_items (request_id, name, quantity, unit)
    VALUES
        (req1_id, 'Cement Bags (50kg)', 50, 'bags'),
        (req1_id, 'Sand', 10, 'trucks'),
        (req2_id, 'Steel Rebar (TMT)', 5, 'tons');
END $$;

-- Add Contractor to workers table to satisfy FK constraint for task assignment
INSERT INTO public.workers (id, name, username, role, project_id)
VALUES ('33333333-3333-3333-3333-333333333333', 'Carlos Contractor', 'carlos_contractor', 'contractor', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
ON CONFLICT (id) DO NOTHING;

-- 6. Populate Tasks Table
INSERT INTO public.tasks (id, project_id, title, status, deadline, assigned_to)
VALUES
    (uuid_generate_v4(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Foundation Pouring - Block A', 'in_progress', (now() + interval '5 days')::date, '33333333-3333-3333-3333-333333333333'),
    (uuid_generate_v4(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Column Rebar Binding', 'pending', (now() + interval '7 days')::date, '33333333-3333-3333-3333-333333333333'),
    (uuid_generate_v4(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Site Clearance & Leveling', 'completed', (now() - interval '2 days')::date, '33333333-3333-3333-3333-333333333333');

-- 7. Populate Daily Progress Reports
INSERT INTO public.daily_progress_reports (id, project_id, date, summary, work_done, issues, weather, labor_count, engineer_id)
VALUES
    (uuid_generate_v4(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', now()::date, 'Continued pouring foundation for Block A.', 'Poured 50 cubic meters of concrete.', 'Delay in cement truck arrival by 2 hours.', 'Sunny', 45, '22222222-2222-2222-2222-222222222222'),
    (uuid_generate_v4(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', (now() - interval '1 days')::date, 'Completed clearing the north boundary.', 'Excavated 100 cubic ft of soil.', 'None.', 'Cloudy', 20, '22222222-2222-2222-2222-222222222222');

-- DONE!
