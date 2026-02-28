import { useState, useEffect, useCallback } from 'react';
import {
    getWorkers, getProjects, createWorker, updateWorker, deleteWorker,
    getWorkersAttendanceToday, markWorkerAttendanceAdmin,
    getWeeklyWages, settleWages,
} from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { MdPersonAdd, MdEdit, MdDelete, MdCheckCircle, MdCancel, MdPayments } from 'react-icons/md';
import WorkerForm from '../../components/workers/WorkerForm';
import { toast } from 'react-toastify';
import './WorkersPage.css';

const WorkersPage = () => {
    const { user } = useAuth();
    const [workers, setWorkers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editWorker, setEditWorker] = useState(null);

    // Attendance: { [worker_id]: { status, check_in_time } }
    const [todayAttendance, setTodayAttendance] = useState({});
    const [markingId, setMarkingId] = useState(null);

    // Weekly wages: { map: { [worker_id]: daysPresent }, weekStart, weekEnd }
    const [weeklyWages, setWeeklyWages] = useState({ map: {}, weekStart: '', weekEnd: '' });
    const [settlingId, setSettlingId] = useState(null);

    const fetchData = useCallback(() => {
        setLoading(true);
        Promise.all([getWorkers(), getProjects(), getWorkersAttendanceToday(), getWeeklyWages()])
            .then(([w, p, att, wages]) => {
                setWorkers(w);
                setProjects(p);
                setTodayAttendance(att);
                setWeeklyWages(wages);
            })
            .catch((e) => toast.error('Failed to load data: ' + e.message))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const getProjectName = (projectId) => {
        const p = projects.find((p) => p.id === projectId);
        return p ? p.name : (workers.find(w => w.project?.id === projectId)?.project?.name || 'Unassigned');
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

    const handleMarkAttendance = async (workerId, status) => {
        setMarkingId(workerId + status);
        try {
            const record = await markWorkerAttendanceAdmin(workerId, status);
            setTodayAttendance((prev) => ({ ...prev, [workerId]: record }));
            // Update weekly wage count if marking present
            if (status === 'present') {
                // Reload wages to reflect today's mark
                const wages = await getWeeklyWages();
                setWeeklyWages(wages);
            } else {
                // If marking absent, subtract one if today was previously counted
                const wages = await getWeeklyWages();
                setWeeklyWages(wages);
            }
            toast.success(`Marked ${status} for today.`);
        } catch (e) {
            toast.error('Error: ' + e.message);
        }
        setMarkingId(null);
    };

    const handleSettle = async (worker) => {
        const daysPresent = weeklyWages.map[worker.id] || 0;
        if (daysPresent === 0) {
            toast.error('No days to settle — worker has 0 present days this week.');
            return;
        }
        const totalAmount = daysPresent * Number(worker.daily_wage);
        if (!window.confirm(`Settle ₹${totalAmount.toLocaleString('en-IN')} for ${worker.name} (${daysPresent} day${daysPresent > 1 ? 's' : ''})?`)) return;
        setSettlingId(worker.id);
        try {
            await settleWages({
                workerId: worker.id,
                periodStart: weeklyWages.weekStart,
                periodEnd: weeklyWages.weekEnd,
                daysPresent,
                totalAmount,
                settledBy: user?.id,
            });
            toast.success(`Payment of ₹${totalAmount.toLocaleString('en-IN')} settled for ${worker.name}!`);
            // Refresh wages
            const wages = await getWeeklyWages();
            setWeeklyWages(wages);
        } catch (e) {
            toast.error('Error: ' + e.message);
        }
        setSettlingId(null);
    };

    const todayLabel = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    const weekLabel = weeklyWages.weekStart && weeklyWages.weekEnd
        ? `${new Date(weeklyWages.weekStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${new Date(weeklyWages.weekEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
        : '';

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
                        <p className="stat-label">Present Today</p>
                        <h3>{Object.values(todayAttendance).filter((a) => a.status === 'present').length}</h3>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>Loading workers…</div>
            ) : (
                <div className="workers-grid">
                    {workers.map((worker) => {
                        const att = todayAttendance[worker.id];
                        const isPresent = att?.status === 'present';
                        const isAbsent = att?.status === 'absent';
                        return (
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

                                {/* Today's Attendance */}
                                <div className="worker-attendance-row">
                                    <span className="worker-att-label">Today ({todayLabel})</span>
                                    <div className="worker-att-btns">
                                        <button
                                            className={`att-btn present ${isPresent ? 'active' : ''}`}
                                            onClick={() => handleMarkAttendance(worker.id, 'present')}
                                            disabled={markingId === worker.id + 'present'}
                                            title="Mark Present"
                                        >
                                            <MdCheckCircle /> Present
                                        </button>
                                        <button
                                            className={`att-btn absent ${isAbsent ? 'active' : ''}`}
                                            onClick={() => handleMarkAttendance(worker.id, 'absent')}
                                            disabled={markingId === worker.id + 'absent'}
                                            title="Mark Absent"
                                        >
                                            <MdCancel /> Absent
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {workers.length === 0 && !loading && (
                <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    <p>No workers yet. Add your first worker!</p>
                </div>
            )}

            {/* Weekly Wage Settlement Panel */}
            {workers.length > 0 && !loading && (
                <div className="wage-panel">
                    <div className="wage-panel-header">
                        <MdPayments className="wage-icon" />
                        <div>
                            <h2>Weekly Wages</h2>
                            <p>Week: {weekLabel}</p>
                        </div>
                    </div>
                    <table className="wage-table">
                        <thead>
                            <tr>
                                <th>Worker</th>
                                <th>Daily Wage</th>
                                <th>Days Present</th>
                                <th>Amount Owed</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workers.filter(w => w.status === 'active').map((worker) => {
                                const days = weeklyWages.map[worker.id] || 0;
                                const amount = days * Number(worker.daily_wage);
                                return (
                                    <tr key={worker.id}>
                                        <td>
                                            <div className="wage-worker-name">
                                                <span className="wage-avatar">{worker.name.charAt(0)}</span>
                                                {worker.name}
                                            </div>
                                        </td>
                                        <td>₹{Number(worker.daily_wage).toLocaleString('en-IN')}</td>
                                        <td>
                                            <span className={`days-badge ${days > 0 ? 'has-days' : ''}`}>{days} day{days !== 1 ? 's' : ''}</span>
                                        </td>
                                        <td>
                                            <strong style={{ color: amount > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                                                ₹{amount.toLocaleString('en-IN')}
                                            </strong>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleSettle(worker)}
                                                disabled={settlingId === worker.id || days === 0}
                                            >
                                                {settlingId === worker.id ? 'Settling…' : 'Settle & Pay'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
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
