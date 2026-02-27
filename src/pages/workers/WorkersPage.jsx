import { useState } from 'react';
import { demoWorkers, demoProjects } from '../../services/demoData';
import { MdPersonAdd, MdEdit, MdDelete, MdPhone } from 'react-icons/md';
import WorkerForm from '../../components/workers/WorkerForm';
import './WorkersPage.css';

const WorkersPage = () => {
    const [workers, setWorkers] = useState(demoWorkers);
    const [showForm, setShowForm] = useState(false);
    const [editWorker, setEditWorker] = useState(null);

    const getProjectName = (projectId) => {
        const project = demoProjects.find((p) => p.id === projectId);
        return project ? project.name : 'Unassigned';
    };

    const handleAdd = () => {
        setEditWorker(null);
        setShowForm(true);
    };

    const handleEdit = (worker) => {
        setEditWorker(worker);
        setShowForm(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this worker?')) {
            setWorkers((prev) => prev.filter((w) => w.id !== id));
        }
    };

    const handleSave = (workerData) => {
        if (editWorker) {
            setWorkers((prev) => prev.map((w) => (w.id === editWorker.id ? { ...w, ...workerData } : w)));
        } else {
            setWorkers((prev) => [...prev, { ...workerData, id: `w-${Date.now()}` }]);
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
                                <button onClick={() => handleEdit(worker)} title="Edit">
                                    <MdEdit />
                                </button>
                                <button className="delete" onClick={() => handleDelete(worker.id)} title="Delete">
                                    <MdDelete />
                                </button>
                            </div>
                        </div>
                        <div className="worker-card-details">
                            <div className="worker-detail-item">
                                <span className="worker-detail-label">Project</span>
                                <span className="worker-detail-value">{getProjectName(worker.project_id)}</span>
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

            {showForm && (
                <WorkerForm
                    worker={editWorker}
                    onSave={handleSave}
                    onClose={() => setShowForm(false)}
                />
            )}
        </div>
    );
};

export default WorkersPage;
