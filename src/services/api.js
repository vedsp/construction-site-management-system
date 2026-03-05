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
    const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
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

export async function getContractorStats(userName) {
    const [tasks, materialRequests] = await Promise.all([
        supabase
            .from('tasks')
            .select('id', { count: 'exact', head: true })
            .eq('assigned_to', userName)
            .in('status', ['Pending', 'In Progress']),
        supabase
            .from('material_requests')
            .select('id', { count: 'exact', head: true })
            .eq('requested_by', userName)
    ]);

    return {
        assignedTasks: tasks.count ?? 0,
        myMaterialRequests: materialRequests.count ?? 0,
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
