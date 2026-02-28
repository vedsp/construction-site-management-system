import { useState, useEffect } from 'react';
import { getWorkers, getProjects, createWorker, updateWorker, deleteWorker } from '../../services/api';
import { MdPersonAdd, MdEdit, MdDelete } from 'react-icons/md';
import WorkerForm from '../../components/workers/WorkerForm';
import { toast } from 'react-toastify';
import './WorkersPage.css';

const WorkersPage = () => {
    const [workers, setWorkers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editWorker, setEditWorker] = useState(null);

    const fetchData = () => {
        setLoading(true);
        Promise.all([getWorkers(), getProjects()])
            .then(([w, p]) => { setWorkers(w); setProjects(p); })
            .catch((e) => toast.error('Failed to load data: ' + e.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    const getProjectName = (projectId) => {
        const p = projects.find((p) => p.id === projectId);
        return p ? p.name : (workers.find(w => w.id && w.project?.id === projectId)?.project?.name || 'Unassigned');
    };

    const handleAdd = () => { setEditWorker(null); setShowForm(true); };
    const handleEdit = (worker) => { setEditWorker(worker); setShowForm(true); };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this worker?')) return;
        try {
            await deleteWorker(id);
            setWorkers((prev) => prev.filter((w) => w.id !== id));
            toast.success('Worker deleted.');
        } catch (e) {
            toast.error('Error: ' + e.message);
        }
    };

    const handleSave = async (workerData) => {
        try {
            if (editWorker) {
                const updated = await updateWorker(editWorker.id, workerData);
                setWorkers((prev) => prev.map((w) => w.id === editWorker.id ? updated : w));
                toast.success('Worker updated!');
            } else {
                const created = await createWorker(workerData);
                setWorkers((prev) => [created, ...prev]);
                toast.success('Worker added!');
            }
        } catch (e) {
            toast.error('Error: ' + e.message);
        }
        setShowForm(false);
    };

    return (
        <div className="workers-page">
            <div className="page-header-row">
                <div className="page-header">
                    <h1>Worker Management</h1>
                    <p>Manage all workers across your projects</p>
                </div>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <MdPersonAdd /> Add Worker
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-content">
                        <p className="stat-label">Total Workers</p>
                        <h3>{workers.length}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <p className="stat-label">Active Workers</p>
                        <h3>{workers.filter((w) => w.status === 'active').length}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <p className="stat-label">Inactive Workers</p>
                        <h3>{workers.filter((w) => w.status === 'inactive').length}</h3>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>Loading workers…</div>
            ) : (
                <div className="workers-grid">
                    {workers.map((worker) => (
                        <div key={worker.id} className="worker-card">
                            <div className="worker-card-header">
                                <div className="worker-card-info">
                                    <div className="worker-card-avatar">{worker.name.charAt(0)}</div>
                                    <div>
                                        <p className="worker-card-name">{worker.name}</p>
                                        <p className="worker-card-role">{worker.role}</p>
                                    </div>
                                </div>
                                <div className="worker-card-actions">
                                    <button onClick={() => handleEdit(worker)} title="Edit"><MdEdit /></button>
                                    <button className="delete" onClick={() => handleDelete(worker.id)} title="Delete"><MdDelete /></button>
                                </div>
                            </div>
                            <div className="worker-card-details">
                                <div className="worker-detail-item">
                                    <span className="worker-detail-label">Project</span>
                                    <span className="worker-detail-value">
                                        {worker.project?.name || getProjectName(worker.project_id)}
                                    </span>
                                </div>
                                <div className="worker-detail-item">
                                    <span className="worker-detail-label">Daily Wage</span>
                                    <span className="worker-detail-value">₹{worker.daily_wage}</span>
                                </div>
                                <div className="worker-detail-item">
                                    <span className="worker-detail-label">Phone</span>
                                    <span className="worker-detail-value">{worker.phone}</span>
                                </div>
                                <div className="worker-detail-item">
                                    <span className="worker-detail-label">Status</span>
                                    <span className={`badge ${worker.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                                        {worker.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {workers.length === 0 && !loading && (
                <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    <p>No workers yet. Add your first worker!</p>
                </div>
            )}

            {showForm && (
                <WorkerForm
                    worker={editWorker}
                    projects={projects}
                    onSave={handleSave}
                    onClose={() => setShowForm(false)}
                />
            )}
        </div>
    );
};

export default WorkersPage;
