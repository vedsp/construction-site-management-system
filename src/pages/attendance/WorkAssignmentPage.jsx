import { useState, useEffect, useCallback } from 'react';
import { getWorkers, getProjects, getTasks, createTask, updateTaskStatus } from '../../services/api';
import { useTranslation } from 'react-i18next';
import {
    MdAssignment, MdAdd, MdCheckCircle, MdHourglassEmpty,
    MdPending, MdClose, MdPerson
} from 'react-icons/md';
import { toast } from 'react-toastify';
import './WorkAssignmentPage.css';

const PRIORITIES = ['low', 'medium', 'high'];
const STATUS_MAP = {
    pending: { label: 'Pending', cls: 'badge-warning', icon: <MdPending /> },
    in_progress: { label: 'In Progress', cls: 'badge-info', icon: <MdHourglassEmpty /> },
    completed: { label: 'Done', cls: 'badge-success', icon: <MdCheckCircle /> },
};

const WorkAssignmentPage = () => {
    const { t } = useTranslation();
    const [workers, setWorkers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]); // all tasks assigned to workers
    const [loading, setLoading] = useState(true);

    // Assignment form state
    const [formOpen, setFormOpen] = useState(false);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [form, setForm] = useState({ title: '', description: '', project_id: '', due_date: '', priority: 'medium' });
    const [submitting, setSubmitting] = useState(false);

    const fetchData = useCallback(() => {
        setLoading(true);
        Promise.all([getWorkers(), getProjects(), getTasks()])
            .then(([w, p, t]) => { setWorkers(w); setProjects(p); setTasks(t); })
            .catch((e) => toast.error('Failed to load: ' + e.message))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Group tasks by assigned_to (worker_id)
    const tasksByWorker = tasks.reduce((acc, t) => {
        const key = t.assigned_to;
        if (!key) return acc;
        if (!acc[key]) acc[key] = [];
        acc[key].push(t);
        return acc;
    }, {});

    const openForm = (worker) => {
        setSelectedWorker(worker);
        setForm({ title: '', description: '', project_id: '', due_date: '', priority: 'medium' });
        setFormOpen(true);
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) { toast.error('Work title is required.'); return; }
        setSubmitting(true);
        try {
            const created = await createTask({
                title: form.title.trim(),
                description: form.description.trim() || null,
                project_id: form.project_id || null,
                assigned_to: selectedWorker.id,
                due_date: form.due_date || null,
                priority: form.priority,
                status: 'pending',
            });
            setTasks((prev) => [created, ...prev]);
            toast.success(`Work assigned to ${selectedWorker.name}!`);
            setFormOpen(false);
        } catch (e) {
            toast.error('Error: ' + e.message);
        }
        setSubmitting(false);
    };

    const handleStatusChange = async (taskId, status) => {
        try {
            await updateTaskStatus(taskId, status);
            setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status } : t));
        } catch (e) {
            toast.error('Error: ' + e.message);
        }
    };

    const activeWorkers = workers.filter((w) => w.status === 'active');
    const totalAssigned = tasks.filter((t) => t.status !== 'completed').length;
    const totalDone = tasks.filter((t) => t.status === 'completed').length;

    return (
        <div className="wa-page">
            <div className="page-header-row">
                <div className="page-header">
                    <h1>{t('work_assignment.title')}</h1>
                    <p>{t('work_assignment.subtitle')}</p>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-content">
                        <p className="stat-label">{t('work_assignment.active_contractors')}</p>
                        <h3>{activeWorkers.length}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <p className="stat-label">{t('work_assignment.works_assigned')}</p>
                        <h3>{totalAssigned}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <p className="stat-label">{t('work_assignment.completed')}</p>
                        <h3>{totalDone}</h3>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>{t('work_assignment.loading_contractors')}</div>
            ) : activeWorkers.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    <p>{t('work_assignment.no_active_contractors')}</p>
                </div>
            ) : (
                <div className="wa-grid">
                    {activeWorkers.map((worker) => {
                        const workerTasks = tasksByWorker[worker.id] || [];
                        const activeTasks = workerTasks.filter((t) => t.status !== 'completed');
                        const doneTasks = workerTasks.filter((t) => t.status === 'completed');
                        return (
                            <div key={worker.id} className="wa-card">
                                {/* Contractor header */}
                                <div className="wa-card-header">
                                    <div className="wa-contractor-info">
                                        <div className="wa-avatar">{worker.name.charAt(0)}</div>
                                        <div>
                                            <p className="wa-name">{worker.name}</p>
                                            <p className="wa-trade">{worker.role} · {worker.project?.name || 'No project'}</p>
                                        </div>
                                    </div>
                                    <button className="btn btn-primary btn-sm" onClick={() => openForm(worker)}>
                                        <MdAdd /> {t('work_assignment.assign_work')}
                                    </button>
                                </div>

                                {/* Active works */}
                                {activeTasks.length > 0 && (
                                    <div className="wa-tasks">
                                        {activeTasks.map((task) => {
                                            const st = STATUS_MAP[task.status] || STATUS_MAP.pending;
                                            return (
                                                <div key={task.id} className={`wa-task-item priority-${task.priority}`}>
                                                    <div className="wa-task-left">
                                                        <MdAssignment className="wa-task-icon" />
                                                        <div>
                                                            <p className="wa-task-title">{task.title}</p>
                                                            {task.description && <p className="wa-task-desc">{task.description}</p>}
                                                            <div className="wa-task-meta">
                                                                {task.project?.name && <span>📁 {task.project.name}</span>}
                                                                {task.due_date && <span>📅 {new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                                                                <span className={`task-priority-badge ${task.priority}`}>{task.priority}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <select
                                                        className={`wa-status-select ${task.status}`}
                                                        value={task.status}
                                                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                                    >
                                                        <option value="pending">{t('work_assignment.pending')}</option>
                                                        <option value="in_progress">{t('work_assignment.in_progress')}</option>
                                                        <option value="completed">{t('work_assignment.done')}</option>
                                                    </select>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Completed (collapsed count) */}
                                {doneTasks.length > 0 && (
                                    <p className="wa-done-count">{t('work_assignment.works_completed', { count: doneTasks.length })}</p>
                                )}

                                {workerTasks.length === 0 && (
                                    <p className="wa-empty">{t('work_assignment.no_work_assigned')}</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Assignment modal */}
            {formOpen && selectedWorker && (
                <div className="modal-overlay" onClick={() => setFormOpen(false)}>
                    <div className="modal-content wa-form" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2>{t('work_assignment.assign_work')}</h2>
                                <p>{t('work_assignment.to_worker', { name: selectedWorker.name, role: selectedWorker.role })}</p>
                            </div>
                            <button className="modal-close" onClick={() => setFormOpen(false)}><MdClose /></button>
                        </div>
                        <form onSubmit={handleAssign} className="wa-form-body">
                            <div className="form-group">
                                <label className="form-label">{t('work_assignment.work_title')} *</label>
                                <input
                                    className="form-input"
                                    placeholder="e.g. Lay foundation concrete for Block A"
                                    value={form.title}
                                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('work_assignment.description')}</label>
                                <textarea
                                    className="form-input"
                                    rows={2}
                                    placeholder="Additional details or instructions..."
                                    value={form.description}
                                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">{t('work_assignment.project')}</label>
                                    <select
                                        className="form-select"
                                        value={form.project_id}
                                        onChange={(e) => setForm((f) => ({ ...f, project_id: e.target.value }))}
                                    >
                                        <option value="">-- None --</option>
                                        {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('work_assignment.priority')}</label>
                                    <select
                                        className="form-select"
                                        value={form.priority}
                                        onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                                    >
                                        {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('work_assignment.due_date')}</label>
                                <input
                                    className="form-input"
                                    type="date"
                                    value={form.due_date}
                                    onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setFormOpen(false)}>{t('common.cancel')}</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? t('work_assignment.assigning') : t('work_assignment.assign_work')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkAssignmentPage;
