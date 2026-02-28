import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getWorkerTasks, markWorkerAttendance, getWorkerAttendanceToday } from '../../services/api';
import { MdCheckCircle, MdCancel, MdAssignment, MdAccessTime } from 'react-icons/md';
import { toast } from 'react-toastify';
import './WorkerDashboardPage.css';

const WorkerDashboardPage = () => {
    const { user } = useAuth();
    const displayName = user?.user_metadata?.full_name || 'Worker';

    const [tasks, setTasks] = useState([]);
    const [attendance, setAttendance] = useState(null); // today's record
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [loadingAttendance, setLoadingAttendance] = useState(true);
    const [markingAttendance, setMarkingAttendance] = useState(false);

    useEffect(() => {
        if (!user?.id) return;
        // Load tasks and attendance in parallel
        getWorkerTasks(user.id)
            .then(setTasks)
            .catch((e) => toast.error('Failed to load tasks: ' + e.message))
            .finally(() => setLoadingTasks(false));

        getWorkerAttendanceToday(user.id)
            .then(setAttendance)
            .catch(() => setAttendance(null))
            .finally(() => setLoadingAttendance(false));
    }, [user?.id]);

    const handleMarkAttendance = async (status) => {
        setMarkingAttendance(true);
        try {
            const record = await markWorkerAttendance(user.id, status);
            setAttendance(record);
            toast.success(status === 'present' ? 'Marked as Present!' : 'Marked as Absent.');
        } catch (e) {
            toast.error('Error: ' + e.message);
        }
        setMarkingAttendance(false);
    };

    const todayStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="worker-dashboard">
            <div className="worker-welcome">
                <div>
                    <h1>Welcome, {displayName}!</h1>
                    <p>{todayStr}</p>
                </div>
            </div>

            {/* Attendance Card */}
            <div className="worker-card">
                <div className="worker-card-header">
                    <MdAccessTime className="worker-card-icon" />
                    <h2>Today's Attendance</h2>
                </div>

                {loadingAttendance ? (
                    <p className="worker-muted">Loading…</p>
                ) : attendance ? (
                    <div className={`attendance-status-badge ${attendance.status}`}>
                        {attendance.status === 'present'
                            ? <><MdCheckCircle /> Marked Present</>
                            : <><MdCancel /> Marked Absent</>}
                        <span className="attendance-time">
                            {attendance.check_in_time
                                ? ` at ${new Date(attendance.check_in_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
                                : ''}
                        </span>
                    </div>
                ) : (
                    <div className="attendance-actions">
                        <p className="worker-muted">You haven't marked attendance yet today.</p>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                            <button
                                className="btn btn-success"
                                onClick={() => handleMarkAttendance('present')}
                                disabled={markingAttendance}
                                style={{ flex: 1 }}
                            >
                                <MdCheckCircle /> Mark Present
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={() => handleMarkAttendance('absent')}
                                disabled={markingAttendance}
                                style={{ flex: 1 }}
                            >
                                <MdCancel /> Mark Absent
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Tasks Card */}
            <div className="worker-card">
                <div className="worker-card-header">
                    <MdAssignment className="worker-card-icon" />
                    <h2>My Assigned Tasks</h2>
                    <span className="worker-task-count">{tasks.length}</span>
                </div>

                {loadingTasks ? (
                    <p className="worker-muted">Loading tasks…</p>
                ) : tasks.length === 0 ? (
                    <p className="worker-muted">No tasks assigned to you yet.</p>
                ) : (
                    <div className="worker-task-list">
                        {tasks.map((task) => (
                            <div key={task.id} className={`worker-task-item priority-${task.priority || 'medium'}`}>
                                <div className="worker-task-info">
                                    <p className="worker-task-title">{task.title}</p>
                                    {task.description && (
                                        <p className="worker-task-desc">{task.description}</p>
                                    )}
                                    <div className="worker-task-meta">
                                        {task.project?.name && (
                                            <span className="worker-task-project">📁 {task.project.name}</span>
                                        )}
                                        {task.due_date && (
                                            <span className="worker-task-due">
                                                Due: {new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="worker-task-right">
                                    <span className={`task-priority-badge ${task.priority || 'medium'}`}>
                                        {task.priority || 'medium'}
                                    </span>
                                    <span className={`task-status-badge ${(task.status || 'pending').replace(' ', '-')}`}>
                                        {task.status || 'pending'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkerDashboardPage;
