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

export async function updateMaterialRequestStatus(id, status, approvedBy) {
    const updates = { status };
    if (approvedBy) updates.approved_by = approvedBy;
    const { data, error } = await supabase
        .from('material_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
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

export async function getDashboardStats() {
    const today = new Date().toISOString().split('T')[0];

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
            .eq('status', 'pending'),
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

export async function getSiteEngineers() {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'site_engineer')
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
