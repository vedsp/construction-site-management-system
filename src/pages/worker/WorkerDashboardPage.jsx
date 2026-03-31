import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { getWorkerTasks, getWorkerAttendanceToday, checkInWorker } from '../../services/api';
import { MdCheckCircle, MdCancel, MdAssignment, MdAccessTime, MdMyLocation } from 'react-icons/md';
import { toast } from 'react-toastify';
import './WorkerDashboardPage.css';

const WorkerDashboardPage = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const displayName = user?.user_metadata?.full_name || t('roles.worker');

    const [tasks, setTasks] = useState([]);
    const [attendance, setAttendance] = useState(null);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [loadingAttendance, setLoadingAttendance] = useState(true);
    const [checkingIn, setCheckingIn] = useState(false);

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

    const handleCheckIn = () => {
        if (!navigator.geolocation) {
            toast.error(t('worker_dashboard.gps_not_supported', 'Geolocation is not supported by your browser'));
            return;
        }

        setCheckingIn(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                // Currently, worker metadata lacks direct project_id context in demo without fetching their full worker profile.
                // However, we can use their first task's project_id if they have one or look it up.
                // Since this app connects to Supabase, the best way is to fetch the worker's assigned project first or assume their tasks belong to their main project.
                // Let's grab the project ID from their first task for the demo, or fetch worker details if needed.
                try {
                    // Let's fetch the worker's active project directly if possible, or wait, user.user_metadata might not have it.
                    // For the sake of this feature, we will pass null if unknown, but since checkInWorker requires a projectId to do geofencing,
                    // let's grab the project_id from their first task.
                    const projectId = tasks.length > 0 ? tasks[0].project_id : null;
                    if (!projectId) {
                        toast.error('No project assignments found to verify location against.');
                        setCheckingIn(false);
                        return;
                    }

                    const newAttendance = await checkInWorker(user.id, latitude, longitude, projectId, true);
                    setAttendance(newAttendance);
                    toast.success(t('worker_dashboard.check_in_success', 'Checked in successfully!'));
                } catch (e) {
                    toast.error(e.message || t('worker_dashboard.check_in_error', 'Failed to check in'));
                } finally {
                    setCheckingIn(false);
                }
            },
            (err) => {
                toast.error(t('worker_dashboard.gps_denied', 'Please enable location services to check in'));
                setCheckingIn(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const todayStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="worker-dashboard">
            <div className="worker-welcome">
                <div>
                    <h1>{t('worker_dashboard.welcome', { name: displayName })}</h1>
                    <p>{todayStr}</p>
                </div>
            </div>

            {/* Attendance Card */}
            <div className="worker-card">
                <div className="worker-card-header">
                    <MdAccessTime className="worker-card-icon" />
                    <h2>{t('worker_dashboard.todays_attendance')}</h2>
                </div>

                {loadingAttendance ? (
                    <p className="worker-muted">Loading…</p>
                ) : attendance ? (
                    <div className={`attendance-status-badge ${attendance.status}`}>
                        {attendance.status === 'present'
                            ? <><MdCheckCircle /> {t('worker_dashboard.present_today')}</>
                            : <><MdCancel /> {t('worker_dashboard.absent_today')}</>}
                        <span className="attendance-time">
                            {attendance.check_in_time
                                ? ` · ${t('worker_dashboard.checked_in_at', { time: new Date(attendance.check_in_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) })}`
                                : ''}
                        </span>
                    </div>
                ) : (
                    <div className="worker-checkin-prompt">
                        <p className="worker-muted">{t('worker_dashboard.not_marked')}</p>
                        <button 
                            className="btn btn-primary worker-checkin-btn" 
                            onClick={handleCheckIn}
                            disabled={checkingIn}
                            style={{ marginTop: 16, width: '100%' }}
                        >
                            {checkingIn ? (
                                <><span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} ></span> {t('worker_dashboard.getting_location', 'Verifying Location...')}</>
                            ) : (
                                <><MdMyLocation /> {t('worker_dashboard.check_in_now', 'Mark Attendance')}</>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Tasks Card */}
            <div className="worker-card">
                <div className="worker-card-header">
                    <MdAssignment className="worker-card-icon" />
                    <h2>{t('worker_dashboard.my_tasks')}</h2>
                    <span className="worker-task-count">{tasks.length}</span>
                </div>

                {loadingTasks ? (
                    <p className="worker-muted">{t('worker_dashboard.loading_tasks')}</p>
                ) : tasks.length === 0 ? (
                    <p className="worker-muted">{t('worker_dashboard.no_tasks')}</p>
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
                                                {t('worker_dashboard.due')}: {new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
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
