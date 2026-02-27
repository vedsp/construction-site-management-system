import { useState } from 'react';
import { demoTasks, demoProjects, demoWorkers } from '../../services/demoData';
import { MdAdd } from 'react-icons/md';
import TaskForm from '../../components/tasks/TaskForm';
import './TasksPage.css';

const TasksPage = () => {
    const [tasks, setTasks] = useState(demoTasks);
    const [filter, setFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);

    const filters = ['all', 'pending', 'in_progress', 'completed'];

    const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

    const getProjectName = (id) => demoProjects.find((p) => p.id === id)?.name || 'N/A';
    const getWorkerName = (id) => demoWorkers.find((w) => w.id === id)?.name || 'Unassigned';

    const updateStatus = (taskId, status) => {
        setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status } : t));
    };

    const handleSave = (data) => {
        setTasks((prev) => [...prev, { ...data, id: `task-${Date.now()}`, created_at: new Date().toISOString().split('T')[0] }]);
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
                    <h1>Task Management</h1>
                    <p>Create, assign and track tasks across projects</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    <MdAdd /> Create Task
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-content">
                        <p className="stat-label">Total Tasks</p>
                        <h3>{tasks.length}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <p className="stat-label">In Progress</p>
                        <h3>{tasks.filter((t) => t.status === 'in_progress').length}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <p className="stat-label">Completed</p>
                        <h3>{tasks.filter((t) => t.status === 'completed').length}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <p className="stat-label">Pending</p>
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
                        {f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            <div className="tasks-table-wrapper">
                <div className="tasks-table-scroll">
                    <table className="tasks-table">
                        <thead>
                            <tr>
                                <th>Task</th>
                                <th>Project</th>
                                <th>Assigned To</th>
                                <th>Priority</th>
                                <th>Deadline</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((task) => (
                                <tr key={task.id}>
                                    <td style={{ fontWeight: 600 }}>{task.title}</td>
                                    <td>{getProjectName(task.project_id)}</td>
                                    <td>{getWorkerName(task.assigned_to)}</td>
                                    <td><span className={`priority-badge ${task.priority}`}>{task.priority}</span></td>
                                    <td>{new Date(task.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                    <td>
                                        <select
                                            className="task-status-select"
                                            value={task.status}
                                            onChange={(e) => updateStatus(task.id, e.target.value)}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                        No tasks found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && <TaskForm onSave={handleSave} onClose={() => setShowForm(false)} />}
        </div>
    );
};

export default TasksPage;
