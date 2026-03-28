import { useState, useEffect } from 'react';
import { getTasks, getProjects, getWorkers, createTask, updateTaskStatus } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { MdAdd } from 'react-icons/md';
import TaskForm from '../../components/tasks/TaskForm';
import { toast } from 'react-toastify';
import './TasksPage.css';

const TasksPage = () => {
    const { userRole } = useAuth();
    const { t } = useTranslation();
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);

    const filters = ['all', 'pending', 'in_progress', 'completed'];

    const fetchData = () => {
        setLoading(true);
        Promise.all([getTasks(), getProjects(), getWorkers()])
            .then(([t, p, w]) => { setTasks(t); setProjects(p); setWorkers(w); })
            .catch((e) => toast.error('Failed to load tasks: ' + e.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

    const getProjectName = (task) => task.project?.name || projects.find((p) => p.id === task.project_id)?.name || 'N/A';
    const getWorkerName = (task) => task.worker?.name || workers.find((w) => w.id === task.assigned_to)?.name || 'Unassigned';

    const handleStatusChange = async (taskId, status) => {
        try {
            await updateTaskStatus(taskId, status);
            setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status } : t));
        } catch (e) {
            toast.error('Error updating status: ' + e.message);
        }
    };

    const handleSave = async (data) => {
        try {
            const created = await createTask(data);
            setTasks((prev) => [created, ...prev]);
            toast.success('Task created!');
        } catch (e) {
            toast.error('Error: ' + e.message);
        }
        setShowForm(false);
    };

    const getStatusBadge = (status) => {
        const map = { pending: 'badge-warning', in_progress: 'badge-info', completed: 'badge-success' };
        return map[status] || 'badge-info';
    };

    return (
        <div className="tasks-page">
            <div className="page-header-row">
                <div className="page-header">
                    <h1>{t('tasks.title')}</h1>
                    <p>{t('tasks.subtitle')}</p>
                </div>
                {userRole === 'admin' && (
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <MdAdd /> {t('tasks.create_task')}
                    </button>
                )}
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-content">
                        <p className="stat-label">{t('tasks.total_tasks')}</p>
                        <h3>{tasks.length}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <p className="stat-label">{t('tasks.in_progress')}</p>
                        <h3>{tasks.filter((t) => t.status === 'in_progress').length}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <p className="stat-label">{t('tasks.completed')}</p>
                        <h3>{tasks.filter((t) => t.status === 'completed').length}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <p className="stat-label">{t('tasks.pending')}</p>
                        <h3>{tasks.filter((t) => t.status === 'pending').length}</h3>
                    </div>
                </div>
            </div>

            <div className="filter-tabs">
                {filters.map((f) => (
                    <button
                        key={f}
                        className={`filter-tab ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'in_progress' ? t('tasks.in_progress') : f === 'all' ? t('common.all') : f === 'pending' ? t('tasks.pending') : t('tasks.completed')}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>{t('tasks.loading')}</div>
            ) : (
                <div className="tasks-table-wrapper">
                    <div className="tasks-table-scroll">
                        <table className="tasks-table">
                            <thead>
                                <tr>
                                    <th>{t('tasks.task')}</th>
                                    <th>{t('tasks.project')}</th>
                                    <th>{t('tasks.assigned_to')}</th>
                                    <th>{t('tasks.priority')}</th>
                                    <th>{t('tasks.deadline')}</th>
                                    <th>{t('tasks.status')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((task) => (
                                    <tr key={task.id}>
                                        <td style={{ fontWeight: 600 }}>{task.title}</td>
                                        <td>{getProjectName(task)}</td>
                                        <td>{getWorkerName(task)}</td>
                                        <td><span className={`priority-badge ${task.priority}`}>{task.priority}</span></td>
                                        <td>{task.deadline ? new Date(task.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                                        <td>
                                            {userRole === 'admin' ? (
                                                <select
                                                    className="task-status-select"
                                                    value={task.status}
                                                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                                >
                                                    <option value="pending">{t('tasks.pending')}</option>
                                                    <option value="in_progress">{t('tasks.in_progress')}</option>
                                                    <option value="completed">{t('tasks.completed')}</option>
                                                </select>
                                            ) : (
                                                <span className={`badge ${getStatusBadge(task.status)}`}>
                                                    {task.status === 'in_progress' ? t('tasks.in_progress') : task.status === 'pending' ? t('tasks.pending') : t('tasks.completed')}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                            {t('tasks.no_tasks')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showForm && (
                <TaskForm
                    projects={projects}
                    workers={workers}
                    onSave={handleSave}
                    onClose={() => setShowForm(false)}
                />
            )}
        </div>
    );
};

export default TasksPage;
