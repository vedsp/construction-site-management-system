import { supabase } from './supabaseClient';

// ─── PROJECTS ────────────────────────────────────────────────────────────────

export async function getProjects() {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function createProject(project) {
    const { data, error } = await supabase
        .from('projects')
        .insert([project])
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateProject(id, updates) {
    // Step 1: perform the update
    const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id);
    if (error) throw error;

    // Step 2: fetch the updated row separately (avoids RLS select-after-update issues)
    const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .maybeSingle();
    if (fetchError) throw fetchError;
    return data;
}

export async function deleteProject(id) {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
}

// ─── WORKERS ─────────────────────────────────────────────────────────────────

export async function getWorkers() {
    const { data, error } = await supabase
        .from('workers')
        .select('*, project:projects(id, name)')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function createWorker(worker) {
    const { data, error } = await supabase
        .from('workers')
        .insert([worker])
        .select('*, project:projects(id, name)')
        .single();
    if (error) throw error;
    return data;
}

export async function updateWorker(id, updates) {
    const { data, error } = await supabase
        .from('workers')
        .update(updates)
        .eq('id', id)
        .select('*, project:projects(id, name)')
        .single();
    if (error) throw error;
    return data;
}

export async function deleteWorker(id) {
    const { error } = await supabase.from('workers').delete().eq('id', id);
    if (error) throw error;
}

export async function getProfileWorkers() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'worker')
        .order('created_at', { ascending: false });
    if (error) throw error;
    // Normalise shape to match workers table fields
    return (data || []).map((p) => ({
        ...p,
        _source: 'profile',
        name: p.full_name || p.email || 'Unknown',
        role: 'worker',
        status: p.is_approved ? 'active' : 'inactive',
        daily_wage: null,
        phone: null,
        project_id: null,
        project: null,
    }));
}

export async function createWorkerWithAccount({ email, password, name, role, phone, project_id, daily_wage, status }) {
    // Use a separate Supabase client for sign-up so we don't affect the admin's session
    const { createClient } = await import('@supabase/supabase-js');
    const signUpClient = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        { auth: { storageKey: 'csms-worker-signup-temp', persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
    );

    // Save the admin's current session so we can restore it after signUp
    const { data: { session: adminSession } } = await supabase.auth.getSession();

    // 1. Sign up in Supabase Auth
    //    The database may have a trigger (handle_new_user) that auto-inserts into profiles.
    //    If the trigger fails (e.g. missing column defaults), signUp itself errors with
    //    "Database error saving new user". To fix this, ensure the trigger sets all
    //    required columns OR make them nullable with defaults in the profiles table.
    const { data: signUpData, error: signUpError } = await signUpClient.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: name, role: 'worker' },
            emailRedirectTo: window.location.origin + '/login',
        },
    });

    if (signUpError) {
        // Provide a more actionable error message for the common trigger failure
        if (signUpError.message?.includes('Database error saving new user')) {
            throw new Error(
                'Failed to create account. The database trigger on auth.users is failing. ' +
                'Please update the handle_new_user trigger in Supabase to include all required ' +
                'profiles columns (is_approved, phone, project_id, daily_wage) with defaults, ' +
                'or make those columns nullable. Original: ' + signUpError.message
            );
        }
        throw signUpError;
    }

    const userId = signUpData?.user?.id;
    if (!userId) throw new Error('Account creation failed — no user ID returned.');

    // Immediately sign out the worker session on the separate client
    await signUpClient.auth.signOut();

    // Restore the admin's session on the main client so the admin stays logged in
    if (adminSession) {
        await supabase.auth.setSession({
            access_token: adminSession.access_token,
            refresh_token: adminSession.refresh_token,
        });
    }

    // 2. Upsert profile (auto-approve since admin is creating this account)
    //    This handles the case where the trigger already created a partial row.
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            full_name: name,
            role: 'worker',
            is_approved: true,
        }, { onConflict: 'id' });
    if (profileError) throw profileError;

    // 3. Insert into workers table
    const { data: workerData, error: workerError } = await supabase
        .from('workers')
        .insert([{ name, role, phone, project_id: project_id || null, daily_wage: daily_wage || null, status: status || 'active' }])
        .select('*, project:projects(id, name)')
        .single();
    if (workerError) throw workerError;

    return workerData;
}

// ─── ATTENDANCE / ENGINEERS ───────────────────────────────────────────────────

export async function getEngineers() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['site_engineer', 'admin'])
        .order('full_name');
    if (error) throw error;
    return data;
}

export async function getAttendanceToday() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
        .from('attendance')
        .select('*, worker:workers(id, name)')
        .eq('date', today);
    if (error) throw error;
    return data;
}

export async function markAttendance(record) {
    const { data, error } = await supabase
        .from('attendance')
        .upsert([record], { onConflict: 'worker_id,date' })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function getWorkersAttendanceToday() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
        .from('attendance')
        .select('worker_id, status')
        .eq('date', today);
    if (error) throw error;
    return Object.fromEntries((data || []).map((r) => [r.worker_id, r]));
}

export async function markWorkerAttendanceAdmin(workerId, status) {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
        .from('attendance')
        .upsert([{ worker_id: workerId, date: today, status }], { onConflict: 'worker_id,date' })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function getWeeklyWages() {
    // Get Mon of current week
    const now = new Date();
    const day = now.getDay(); // 0=Sun
    const diffToMon = (day === 0 ? -6 : 1 - day);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diffToMon);
    weekStart.setHours(0, 0, 0, 0);
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = now.toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('attendance')
        .select('worker_id, status, date')
        .gte('date', weekStartStr)
        .lte('date', weekEndStr)
        .eq('status', 'present');
    if (error) throw error;

    // Return map: { [worker_id]: { daysPresent, weekStart, weekEnd } }
    const map = {};
    (data || []).forEach(({ worker_id }) => {
        map[worker_id] = (map[worker_id] || 0) + 1;
    });
    return { map, weekStart: weekStartStr, weekEnd: weekEndStr };
}

export async function getWeeklyAttendanceByDay() {
    const now = new Date();
    const day = now.getDay(); // 0=Sun
    const diffToMon = (day === 0 ? -6 : 1 - day);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diffToMon);
    weekStart.setHours(0, 0, 0, 0);
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = now.toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('attendance')
        .select('date, status')
        .gte('date', weekStartStr)
        .lte('date', weekEndStr);
    if (error) throw error;

    // Build Mon–Sat date labels for this week
    const days = [];
    for (let i = 0; i < 6; i++) {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        days.push(d.toISOString().split('T')[0]);
    }

    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const presentCounts = days.map((dateStr) =>
        (data || []).filter((r) => r.date === dateStr && r.status === 'present').length
    );
    const absentCounts = days.map((dateStr) =>
        (data || []).filter((r) => r.date === dateStr && r.status === 'absent').length
    );

    return { labels, presentCounts, absentCounts };
}


export async function settleWages({ workerId, periodStart, periodEnd, daysPresent, totalAmount, settledBy }) {
    const { data, error } = await supabase
        .from('wage_settlements')
        .insert([{
            worker_id: workerId,
            period_start: periodStart,
            period_end: periodEnd,
            days_present: daysPresent,
            total_amount: totalAmount,
            settled_by: settledBy,
        }])
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ─── MATERIALS / INVENTORY ────────────────────────────────────────────────────

export async function getMaterials() {
    const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('name');
    if (error) throw error;
    return data;
}

export async function updateMaterial(id, updates) {
    const { data, error } = await supabase
        .from('materials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ─── MATERIAL REQUESTS ────────────────────────────────────────────────────────

export async function getMaterialRequests() {
    const { data, error } = await supabase
        .from('material_requests')
        .select('*, project:projects(id, name), items:material_request_items(*)')
        .order('created_at', { ascending: false });
    if (error) throw error;
    // normalise nested items name
    return (data || []).map((r) => ({ ...r, items: r.items || [] }));
}

export async function getMaterialRequestsByContractor(userName, status) {
    let query = supabase
        .from('material_requests')
        .select('*, project:projects(id, name), items:material_request_items(*)')
        .ilike('requested_by', userName);

    if (status) {
        if (status === 'pending') {
            // For contractors, 'pending' includes both initial pending and engineer_approved
            query = query.in('status', ['pending', 'engineer_approved']);
        } else {
            query = query.eq('status', status);
        }
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((r) => ({ ...r, items: r.items || [] }));
}

export async function createMaterialRequest(request, items) {
    const { data: reqData, error: reqError } = await supabase
        .from('material_requests')
        .insert([request])
        .select()
        .single();
    if (reqError) throw reqError;

    if (items && items.length > 0) {
        const rows = items.map((it) => ({ ...it, request_id: reqData.id }));
        const { error: itemsError } = await supabase
            .from('material_request_items')
            .insert(rows);
        if (itemsError) throw itemsError;
    }
    return reqData;
}

export async function updateMaterialRequestStatus(id, status, approvedBy, reviewedBy) {
    const updates = { status };
    // Site engineer initial review
    if (reviewedBy) updates.reviewed_by = reviewedBy;
    // Admin final approval/rejection
    if (approvedBy) updates.approved_by = approvedBy;
    const { error } = await supabase
        .from('material_requests')
        .update(updates)
        .eq('id', id);
    if (error) throw error;
}

// ─── TASKS ────────────────────────────────────────────────────────────────────

export async function getTasks() {
    const { data, error } = await supabase
        .from('tasks')
        .select('*, project:projects(id, name), worker:workers(id, name)')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function getTasksByContractor(userId) {
    const { data, error } = await supabase
        .from('tasks')
        .select('*, project:projects(id, name), worker:workers(id, name)')
        .eq('assigned_to', userId)
        .neq('status', 'completed')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
}

export async function createTask(task) {
    const { data, error } = await supabase
        .from('tasks')
        .insert([task])
        .select('*, project:projects(id, name), worker:workers(id, name)')
        .single();
    if (error) throw error;
    return data;
}

export async function updateTaskStatus(id, status) {
    const { data, error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ─── INVOICES ─────────────────────────────────────────────────────────────────

export async function getInvoices() {
    const { data, error } = await supabase
        .from('invoices')
        .select('*, project:projects(id, name), items:invoice_items(*)')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((inv) => ({ ...inv, items: inv.items || [] }));
}

export async function createInvoice(invoice, items) {
    const { data: invData, error: invError } = await supabase
        .from('invoices')
        .insert([invoice])
        .select()
        .single();
    if (invError) throw invError;

    if (items && items.length > 0) {
        const rows = items.map((it) => ({ ...it, invoice_id: invData.id }));
        const { error: itemsError } = await supabase
            .from('invoice_items')
            .insert(rows);
        if (itemsError) throw itemsError;
    }
    return invData;
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export async function getNotifications(userId) {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
    if (error) throw error;
    return data;
}

export async function markNotificationRead(id) {
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
    if (error) throw error;
}

export async function markAllNotificationsRead(userId) {
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);
    if (error) throw error;
}

// ─── DASHBOARD AGGREGATES ────────────────────────────────────────────────────

export async function getDashboardStats(role) {
    const today = new Date().toISOString().split('T')[0];

    // Admin sees requests that need their final approval (engineer_approved)
    // Site engineer sees requests awaiting their initial review (pending)
    // Others: total of both
    const pendingStatus = role === 'admin'
        ? 'engineer_approved'
        : role === 'site_engineer'
            ? 'pending'
            : 'pending';

    const [projects, attendance, pendingRequests, tasks] = await Promise.all([
        supabase
            .from('projects')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'in_progress'),
        supabase
            .from('attendance')
            .select('id', { count: 'exact', head: true })
            .eq('date', today)
            .eq('status', 'present'),
        supabase
            .from('material_requests')
            .select('id', { count: 'exact', head: true })
            .eq('status', pendingStatus),
        supabase
            .from('tasks')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'in_progress'),
    ]);

    return {
        activeProjects: projects.count ?? 0,
        todayAttendance: attendance.count ?? 0,
        pendingApprovals: pendingRequests.count ?? 0,
        activeTasks: tasks.count ?? 0,
    };
}

export async function getContractorStats(userId, userName) {
    // 1. Get counts for the dashboard cards
    const [tasks, materialRequests] = await Promise.all([
        supabase
            .from('tasks')
            .select('id', { count: 'exact', head: true })
            .eq('assigned_to', userId)
            .in('status', ['Pending', 'In Progress']),
        supabase
            .from('material_requests')
            .select('id', { count: 'exact', head: true })
            .ilike('requested_by', userName)
            .in('status', ['pending', 'engineer_approved'])
    ]);

    // 2. Get active project count where user is active
    // We count any project where they have a task OR have made a material request
    const { data: projFromReq } = await supabase
        .from('material_requests')
        .select('project_id')
        .ilike('requested_by', userName);

    const { data: projFromTasks } = await supabase
        .from('tasks')
        .select('project_id')
        .eq('assigned_to', userId);

    const uniqueProjectIds = new Set([
        ...(projFromReq || []).map(r => r.project_id),
        ...(projFromTasks || []).map(t => t.project_id)
    ].filter(Boolean));

    return {
        assignedTasks: tasks.count ?? 0,
        myMaterialRequests: materialRequests.count ?? 0,
        activeProjects: uniqueProjectIds.size
    };
}

export async function getSiteEngineers() {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('role', ['site_engineer', 'admin'])
        .order('full_name');
    if (error) throw error;
    return data || [];
}

// ─── PETTY CASH ───────────────────────────────────────────────────────────────

export async function getPettyCash(engineerId) {
    const { data, error } = await supabase
        .from('petty_cash')
        .select('*')
        .eq('engineer_id', engineerId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
}

export async function addPettyCashTransaction({ engineerId, type, amount, description, recordedBy }) {
    const { data, error } = await supabase
        .from('petty_cash')
        .insert([{
            engineer_id: engineerId,
            type,
            amount: Number(amount),
            description,
            recorded_by: recordedBy,
        }])
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ─── WORKER-SPECIFIC ──────────────────────────────────────────────────────────

export async function getWorkerTasks(userId) {
    const { data, error } = await supabase
        .from('tasks')
        .select('*, project:projects(name)')
        .eq('assigned_to', userId)
        .order('due_date', { ascending: true });
    if (error) throw error;
    return data || [];
}

export async function getWorkerAttendanceToday(workerId) {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('worker_id', workerId)
        .eq('date', today)
        .maybeSingle();
    if (error) throw error;
    return data; // null if no record yet
}

export async function markWorkerAttendance(workerId, status) {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    const { data, error } = await supabase
        .from('attendance')
        .upsert([{
            worker_id: workerId,
            date: today,
            status,
            check_in_time: status === 'present' ? now : null,
        }], { onConflict: 'worker_id,date' })
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ─── WORKFORCE ATTENDANCE (GPS-VALIDATED) ─────────────────────────────────────

/**
 * Calculate distance in metres between two lat/lng points using Haversine formula.
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Earth radius in metres
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function checkInWorker(workerId, lat, lng, projectId, enforceGeofence = false) {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    // Verify against project geofence if projectId provided
    let locationVerified = false;
    if (projectId) {
        const { data: project } = await supabase
            .from('projects')
            .select('site_lat, site_lng, geofence_radius')
            .eq('id', projectId)
            .maybeSingle();
        if (project && project.site_lat && project.site_lng) {
            const radius = project.geofence_radius || 300;
            const distance = haversineDistance(lat, lng, project.site_lat, project.site_lng);
            locationVerified = distance <= radius;

            if (enforceGeofence && !locationVerified) {
                throw new Error(`You are outside the ${radius}m property zone (Distance: ${Math.round(distance)}m). Please move closer to the site.`);
            }
        } else if (enforceGeofence) {
            throw new Error('Project site coordinates are not set in the database. Cannot verify location.');
        }
    } else if (enforceGeofence) {
        throw new Error('No project assigned to verify location against.');
    }

    const { data, error } = await supabase
        .from('attendance')
        .upsert([{
            worker_id: workerId,
            project_id: projectId || null,
            date: today,
            status: 'present',
            check_in_time: now,
            check_in_lat: lat,
            check_in_lng: lng,
            location_verified: locationVerified,
        }], { onConflict: 'worker_id,date' })
        .select()
        .single();
    if (error) throw error;
    return { ...data, locationVerified };
}

export async function checkOutWorker(workerId, lat, lng) {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from('attendance')
        .update({
            check_out_time: now,
            check_out_lat: lat,
            check_out_lng: lng,
        })
        .eq('worker_id', workerId)
        .eq('date', today)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function getWorkforceAttendanceByDate(dateStr) {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];

    // Fetch all active workers with project info
    const { data: workers, error: wErr } = await supabase
        .from('workers')
        .select('*, project:projects(id, name, site_lat, site_lng, geofence_radius)')
        .eq('status', 'active')
        .order('name');
    if (wErr) throw wErr;

    // Fetch attendance records for the date
    const { data: records, error: aErr } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', targetDate);
    if (aErr) throw aErr;

    const attendanceMap = Object.fromEntries((records || []).map((r) => [r.worker_id, r]));

    return (workers || []).map((w) => ({
        ...w,
        attendance: attendanceMap[w.id] || null,
    }));
}

export async function getAttendanceHistory(workerId, startDate, endDate) {
    let query = supabase
        .from('attendance')
        .select('*, worker:workers(id, name)')
        .order('date', { ascending: false });

    if (workerId) query = query.eq('worker_id', workerId);
    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

// ─── DAILY SITE PROGRESS REPORTS ──────────────────────────────────────────────

export async function createDailyProgressReport(report) {
    const { data, error } = await supabase
        .from('daily_progress_reports')
        .upsert([report], { onConflict: 'project_id,engineer_id,date' })
        .select('*, project:projects(id, name)')
        .single();
    if (error) throw error;
    return data;
}

export async function getDailyProgressReports(projectId, startDate, endDate) {
    let query = supabase
        .from('daily_progress_reports')
        .select('*, project:projects(id, name), engineer:profiles(id, full_name)')
        .order('date', { ascending: false });

    if (projectId) query = query.eq('project_id', projectId);
    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function getRecentProgressReports(limit = 20) {
    const { data, error } = await supabase
        .from('daily_progress_reports')
        .select('*, project:projects(id, name), engineer:profiles(id, full_name)')
        .order('date', { ascending: false })
        .limit(limit);
    if (error) throw error;
    return data || [];
}

// ─── SITE MAP ─────────────────────────────────────────────────────────────────

export async function getProjectsWithCoordinates() {
    const { data, error } = await supabase
        .from('projects')
        .select('id, name, status, progress, budget, location, site_lat, site_lng, geofence_radius')
        .not('site_lat', 'is', null)
        .not('site_lng', 'is', null)
        .order('name');
    if (error) throw error;
    return data || [];
}

export async function getTodayCheckInLocations() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
        .from('attendance')
        .select('id, worker_id, check_in_lat, check_in_lng, check_in_time, location_verified, worker:workers(id, name)')
        .eq('date', today)
        .eq('status', 'present')
        .not('check_in_lat', 'is', null)
        .not('check_in_lng', 'is', null);
    if (error) throw error;
    return data || [];
}
