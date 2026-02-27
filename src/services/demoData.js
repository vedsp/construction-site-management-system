// Demo data for when Supabase is not configured
export const demoUser = {
    id: 'demo-user-1',
    email: 'admin@csms.com',
    user_metadata: {
        full_name: 'Project Manager',
        role: 'admin',
    },
};

export const demoProjects = [
    {
        id: 'proj-1',
        name: 'Residential Complex - Tower A',
        location: 'Mumbai, Maharashtra',
        status: 'in_progress',
        progress: 65,
        start_date: '2024-06-01',
        deadline: '2025-03-30',
        budget: 15000000,
        client: 'ABC Developers Pvt Ltd',
        description: 'Construction of 20-floor residential tower with modern amenities',
        assigned_engineers: ['eng-1', 'eng-2'],
        created_at: '2024-06-01T00:00:00Z',
    },
    {
        id: 'proj-2',
        name: 'Commercial Mall Construction',
        location: 'Pune, Maharashtra',
        status: 'in_progress',
        progress: 40,
        start_date: '2024-08-15',
        deadline: '2025-08-15',
        budget: 25000000,
        client: 'Metro Properties',
        description: 'Multi-level commercial mall with basement parking',
        assigned_engineers: ['eng-3'],
        created_at: '2024-08-15T00:00:00Z',
    },
    {
        id: 'proj-3',
        name: 'Highway Bridge Project',
        location: 'Nashik, Maharashtra',
        status: 'in_progress',
        progress: 30,
        start_date: '2024-09-01',
        deadline: '2025-12-01',
        budget: 50000000,
        client: 'State Highway Authority',
        description: 'Construction of 4-lane highway bridge over river',
        assigned_engineers: ['eng-1'],
        created_at: '2024-09-01T00:00:00Z',
    },
];

export const demoWorkers = [
    { id: 'w-1', name: 'Ramesh Kumar', username: 'ramesh', role: 'mason', phone: '9876543210', project_id: 'proj-1', daily_wage: 800, status: 'active', joined_date: '2024-06-15' },
    { id: 'w-2', name: 'Suresh Patil', username: 'suresh', role: 'electrician', phone: '9876543211', project_id: 'proj-2', daily_wage: 900, status: 'active', joined_date: '2024-07-01' },
    { id: 'w-3', name: 'Mahesh Singh', username: 'mahesh', role: 'plumber', phone: '9876543212', project_id: 'proj-3', daily_wage: 850, status: 'active', joined_date: '2024-08-20' },
    { id: 'w-4', name: 'Ganesh Sharma', username: 'ganesh', role: 'carpenter', phone: '9876543213', project_id: 'proj-1', daily_wage: 750, status: 'active', joined_date: '2024-06-20' },
    { id: 'w-5', name: 'Rajesh Yadav', username: 'rajesh', role: 'helper', phone: '9876543214', project_id: 'proj-2', daily_wage: 500, status: 'active', joined_date: '2024-09-01' },
    { id: 'w-6', name: 'Amit Patel', username: 'amit', role: 'mason', phone: '9876543215', project_id: 'proj-3', daily_wage: 800, status: 'active', joined_date: '2024-09-15' },
    { id: 'w-7', name: 'Vikram Joshi', username: 'vikram', role: 'supervisor', phone: '9876543216', project_id: 'proj-1', daily_wage: 1200, status: 'active', joined_date: '2024-06-10' },
    { id: 'w-8', name: 'Deepak Verma', username: 'deepak', role: 'electrician', phone: '9876543217', project_id: 'proj-2', daily_wage: 900, status: 'inactive', joined_date: '2024-07-15' },
];

export const demoAttendance = [
    { id: 'att-1', worker_id: 'w-1', date: new Date().toISOString().split('T')[0], status: 'present', check_in: '08:15 AM', project_id: 'proj-1' },
    { id: 'att-2', worker_id: 'w-2', date: new Date().toISOString().split('T')[0], status: 'present', check_in: '08:30 AM', project_id: 'proj-2' },
    { id: 'att-3', worker_id: 'w-3', date: new Date().toISOString().split('T')[0], status: 'present', check_in: '08:45 AM', project_id: 'proj-3' },
    { id: 'att-4', worker_id: 'w-4', date: new Date().toISOString().split('T')[0], status: 'absent', check_in: '-', project_id: 'proj-1' },
    { id: 'att-5', worker_id: 'w-5', date: new Date().toISOString().split('T')[0], status: 'absent', check_in: '-', project_id: 'proj-2' },
    { id: 'att-6', worker_id: 'w-6', date: new Date().toISOString().split('T')[0], status: 'present', check_in: '09:15 AM', project_id: 'proj-3' },
    { id: 'att-7', worker_id: 'w-7', date: new Date().toISOString().split('T')[0], status: 'present', check_in: '07:55 AM', project_id: 'proj-1' },
    { id: 'att-8', worker_id: 'w-8', date: new Date().toISOString().split('T')[0], status: 'absent', check_in: '-', project_id: 'proj-2' },
];

export const demoMaterialRequests = [
    {
        id: 'mr-1',
        project_id: 'proj-1',
        requested_by: 'Rajesh Kumar',
        date: '2024-12-18',
        status: 'pending',
        estimated_cost: 250000,
        required_by: '2024-12-20',
        remarks: 'Required for 4th floor construction',
        items: [
            { name: 'Portland Cement', quantity: 100, unit: 'bags', rate: 0, amount: 0, urgency: 'high' },
            { name: 'TMT Steel Bars 12mm', quantity: 5, unit: 'tons', rate: 0, amount: 0, urgency: 'high' },
            { name: 'River Sand', quantity: 20, unit: 'cubic meters', rate: 0, amount: 0, urgency: 'medium' },
        ],
    },
    {
        id: 'mr-2',
        project_id: 'proj-2',
        requested_by: 'Suresh Patil',
        date: '2024-12-15',
        status: 'approved',
        estimated_cost: 180000,
        required_by: '2024-12-25',
        remarks: 'For electrical work in Block B',
        items: [
            { name: 'Copper Wire 2.5mm', quantity: 500, unit: 'meters', rate: 45, amount: 22500, urgency: 'high' },
            { name: 'MCB Switches', quantity: 50, unit: 'pieces', rate: 250, amount: 12500, urgency: 'medium' },
        ],
    },
    {
        id: 'mr-3',
        project_id: 'proj-3',
        requested_by: 'Amit Patel',
        date: '2024-12-10',
        status: 'rejected',
        estimated_cost: 500000,
        required_by: '2024-12-30',
        remarks: 'Budget exceeded for this quarter',
        items: [
            { name: 'Ready Mix Concrete', quantity: 200, unit: 'cubic meters', rate: 2500, amount: 500000, urgency: 'high' },
        ],
    },
];

export const demoInventory = [
    { id: 'inv-1', name: 'Portland Cement', quantity: 250, unit: 'bags', min_stock: 100, category: 'cement', last_updated: '2024-12-15' },
    { id: 'inv-2', name: 'TMT Steel Bars 12mm', quantity: 15, unit: 'tons', min_stock: 5, category: 'steel', last_updated: '2024-12-14' },
    { id: 'inv-3', name: 'River Sand', quantity: 80, unit: 'cubic meters', min_stock: 30, category: 'aggregates', last_updated: '2024-12-13' },
    { id: 'inv-4', name: 'Bricks', quantity: 5000, unit: 'pieces', min_stock: 2000, category: 'masonry', last_updated: '2024-12-12' },
    { id: 'inv-5', name: 'Copper Wire 2.5mm', quantity: 150, unit: 'meters', min_stock: 200, category: 'electrical', last_updated: '2024-12-11' },
    { id: 'inv-6', name: 'PVC Pipes 4inch', quantity: 45, unit: 'pieces', min_stock: 50, category: 'plumbing', last_updated: '2024-12-10' },
];

export const demoTasks = [
    { id: 'task-1', title: 'Foundation excavation for Block C', project_id: 'proj-1', assigned_to: 'w-1', status: 'in_progress', priority: 'high', deadline: '2024-12-25', created_at: '2024-12-01' },
    { id: 'task-2', title: 'Electrical wiring for 2nd floor', project_id: 'proj-2', assigned_to: 'w-2', status: 'in_progress', priority: 'medium', deadline: '2024-12-30', created_at: '2024-12-05' },
    { id: 'task-3', title: 'Plumbing for washrooms Block A', project_id: 'proj-1', assigned_to: 'w-3', status: 'completed', priority: 'high', deadline: '2024-12-20', created_at: '2024-12-03' },
    { id: 'task-4', title: 'Concrete pouring for bridge pillars', project_id: 'proj-3', assigned_to: 'w-6', status: 'pending', priority: 'high', deadline: '2025-01-05', created_at: '2024-12-10' },
    { id: 'task-5', title: 'Painting interior walls 3rd floor', project_id: 'proj-1', assigned_to: 'w-4', status: 'pending', priority: 'low', deadline: '2025-01-15', created_at: '2024-12-12' },
];

export const demoInvoices = [
    {
        id: 'inv-001',
        invoice_number: 'INV-2024-001',
        project_id: 'proj-1',
        client: 'ABC Developers Pvt Ltd',
        issue_date: '2024-11-30',
        due_date: '2024-12-15',
        subtotal: 5500000,
        gst_percent: 18,
        gst_amount: 990000,
        total_amount: 6490000,
        status: 'paid',
        items: [
            { description: 'Foundation work completion', amount: 2500000 },
            { description: 'Structural framing 1-5 floors', amount: 3000000 },
        ],
    },
    {
        id: 'inv-002',
        invoice_number: 'INV-2024-002',
        project_id: 'proj-2',
        client: 'Metro Properties',
        issue_date: '2024-12-01',
        due_date: '2024-12-20',
        subtotal: 3500000,
        gst_percent: 18,
        gst_amount: 630000,
        total_amount: 4130000,
        status: 'pending',
        items: [
            { description: 'Site preparation and clearing', amount: 1500000 },
            { description: 'Foundation excavation', amount: 2000000 },
        ],
    },
    {
        id: 'inv-003',
        invoice_number: 'INV-2024-003',
        project_id: 'proj-3',
        client: 'State Highway Authority',
        issue_date: '2024-12-05',
        due_date: '2025-01-05',
        subtotal: 8000000,
        gst_percent: 18,
        gst_amount: 1440000,
        total_amount: 9440000,
        status: 'pending',
        items: [
            { description: 'Bridge pillar construction', amount: 5000000 },
            { description: 'Approach road work', amount: 3000000 },
        ],
    },
];

export const demoNotifications = [
    { id: 'n-1', type: 'approval', message: 'DPR Approved - Residential Complex Tower A', time: '2 hours ago', read: false, icon: 'check' },
    { id: 'n-2', type: 'alert', message: 'Low stock alert: Copper Wire 2.5mm below minimum', time: '3 hours ago', read: false, icon: 'warning' },
    { id: 'n-3', type: 'task', message: 'New task assigned: Foundation excavation for Block C', time: '5 hours ago', read: true, icon: 'task' },
    { id: 'n-4', type: 'alert', message: 'Low stock alert: PVC Pipes 4inch below minimum', time: '1 day ago', read: true, icon: 'warning' },
    { id: 'n-5', type: 'deadline', message: 'Task deadline approaching: Plumbing for washrooms', time: '1 day ago', read: true, icon: 'clock' },
];

export const demoEngineers = [
    { id: 'eng-1', name: 'Ramesh Kumar', username: 'ramesh', project_id: 'proj-1', status: 'present', check_in: '08:15 AM', dpr_count: 1 },
    { id: 'eng-2', name: 'Suresh Patil', username: 'suresh', project_id: 'proj-2', status: 'present', check_in: '08:30 AM', dpr_count: 1 },
    { id: 'eng-3', name: 'Mahesh Singh', username: 'mahesh', project_id: 'proj-3', status: 'present', check_in: '08:45 AM', dpr_count: 1 },
    { id: 'eng-4', name: 'Ganesh Sharma', username: 'ganesh', project_id: 'proj-1', status: 'absent', check_in: '-', dpr_count: 0 },
    { id: 'eng-5', name: 'Rajesh Yadav', username: 'rajesh', project_id: 'proj-2', status: 'absent', check_in: '-', dpr_count: 1 },
    { id: 'eng-6', name: 'Amit Patel', username: 'amit', project_id: 'proj-3', status: 'present', check_in: '09:15 AM', dpr_count: 1 },
    { id: 'eng-7', name: 'Vikram Joshi', username: 'vikram', project_id: 'proj-1', status: 'present', check_in: '07:55 AM', dpr_count: 2 },
    { id: 'eng-8', name: 'Deepak Verma', username: 'deepak', project_id: 'proj-2', status: 'absent', check_in: '-', dpr_count: 0 },
];
