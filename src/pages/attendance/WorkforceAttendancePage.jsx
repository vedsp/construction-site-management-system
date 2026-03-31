import { useState, useEffect, useCallback } from 'react';
import { getWorkforceAttendanceByDate, checkInWorker, checkOutWorker, markWorkerAttendanceAdmin } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
    MdAccessTime, MdPeople, MdCheckCircle, MdCancel, MdLocationOn,
    MdLocationOff, MdSearch, MdRefresh, MdLogin, MdLogout as MdLogoutIcon,
    MdGpsFixed, MdVerifiedUser, MdWarning, MdCalendarToday, MdFilterList
} from 'react-icons/md';
import { toast } from 'react-toastify';
import './WorkforceAttendancePage.css';

const WorkforceAttendancePage = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [checkingIn, setCheckingIn] = useState(null); // worker id currently being checked in
    const [checkingOut, setCheckingOut] = useState(null);

    const isToday = selectedDate === new Date().toISOString().split('T')[0];

    const fetchData = useCallback(() => {
        setLoading(true);
        getWorkforceAttendanceByDate(selectedDate)
            .then(setWorkers)
            .catch((e) => toast.error('Failed to load attendance: ' + e.message))
            .finally(() => setLoading(false));
    }, [selectedDate]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Stats
    const total = workers.length;
    const present = workers.filter((w) => w.attendance?.status === 'present').length;
    const absent = workers.filter((w) => w.attendance?.status === 'absent').length;
    const notMarked = total - present - absent;
    const verified = workers.filter((w) => w.attendance?.location_verified).length;

    // Filter & search
    const filtered = workers.filter((w) => {
        const matchesSearch =
            w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (w.project?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        if (statusFilter === 'present') return matchesSearch && w.attendance?.status === 'present';
        if (statusFilter === 'absent') return matchesSearch && w.attendance?.status === 'absent';
        if (statusFilter === 'not_marked') return matchesSearch && !w.attendance;
        return matchesSearch;
    });

    const getLocation = () =>
        new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser.'));
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => reject(new Error('Location access denied. Please enable GPS.')),
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });

    const handleCheckIn = async (worker) => {
        setCheckingIn(worker.id);
        try {
            const { lat, lng } = await getLocation();
            const result = await checkInWorker(worker.id, lat, lng, worker.project_id);
            if (result.locationVerified) {
                toast.success(`✅ ${worker.name} checked in — Location verified!`);
            } else {
                toast.warning(`⚠️ ${worker.name} checked in — Location NOT within site range`);
            }
            fetchData();
        } catch (e) {
            toast.error(e.message);
        }
        setCheckingIn(null);
    };

    const handleCheckOut = async (worker) => {
        setCheckingOut(worker.id);
        try {
            const { lat, lng } = await getLocation();
            await checkOutWorker(worker.id, lat, lng);
            toast.success(`${worker.name} checked out successfully.`);
            fetchData();
        } catch (e) {
            toast.error(e.message);
        }
        setCheckingOut(null);
    };

    const handleMarkAbsent = async (worker) => {
        try {
            await markWorkerAttendanceAdmin(worker.id, 'absent');
            toast.info(`${worker.name} marked absent.`);
            fetchData();
        } catch (e) {
            toast.error(e.message);
        }
    };

    const formatTime = (isoStr) => {
        if (!isoStr) return '—';
        return new Date(isoStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    return (
        <div className="wfa-page">
            <div className="page-header-row">
                <div className="page-header">
                    <h1>{t('workforce_attendance.title', 'Workforce Attendance')}</h1>
                    <p>{t('workforce_attendance.subtitle', 'Track daily attendance with GPS-based location verification')}</p>
                </div>
                <div className="wfa-header-actions">
                    <button className="btn btn-outline btn-sm" onClick={fetchData}>
                        <MdRefresh /> {t('common.refresh', 'Refresh')}
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="wfa-stats">
                <div className="wfa-stat-card">
                    <div className="wfa-stat-icon" style={{ background: 'var(--icon-blue-bg)', color: 'var(--icon-blue)' }}>
                        <MdPeople />
                    </div>
                    <div>
                        <p className="wfa-stat-value">{total}</p>
                        <p className="wfa-stat-label">{t('workforce_attendance.total_workers', 'Total Workers')}</p>
                    </div>
                </div>
                <div className="wfa-stat-card">
                    <div className="wfa-stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                        <MdCheckCircle />
                    </div>
                    <div>
                        <p className="wfa-stat-value">{present}</p>
                        <p className="wfa-stat-label">{t('workforce_attendance.present', 'Present')}</p>
                    </div>
                </div>
                <div className="wfa-stat-card">
                    <div className="wfa-stat-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                        <MdCancel />
                    </div>
                    <div>
                        <p className="wfa-stat-value">{absent}</p>
                        <p className="wfa-stat-label">{t('workforce_attendance.absent', 'Absent')}</p>
                    </div>
                </div>
                <div className="wfa-stat-card">
                    <div className="wfa-stat-icon" style={{ background: 'var(--icon-green-bg)', color: 'var(--icon-green)' }}>
                        <MdVerifiedUser />
                    </div>
                    <div>
                        <p className="wfa-stat-value">{verified}</p>
                        <p className="wfa-stat-label">{t('workforce_attendance.location_verified', 'Location Verified')}</p>
                    </div>
                </div>
            </div>

            {/* Filters Row */}
            <div className="wfa-filters">
                <div className="wfa-search-box">
                    <MdSearch className="wfa-search-icon" />
                    <input
                        type="text"
                        className="form-input"
                        placeholder={t('workforce_attendance.search_placeholder', 'Search by name or project...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="wfa-filter-group">
                    <div className="wfa-date-picker">
                        <MdCalendarToday className="wfa-filter-icon" />
                        <input
                            type="date"
                            className="form-input"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                    <div className="wfa-status-filter">
                        <MdFilterList className="wfa-filter-icon" />
                        <select
                            className="form-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">{t('common.all', 'All')} ({total})</option>
                            <option value="present">{t('common.present', 'Present')} ({present})</option>
                            <option value="absent">{t('common.absent', 'Absent')} ({absent})</option>
                            <option value="not_marked">{t('workforce_attendance.not_marked', 'Not Marked')} ({notMarked})</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Worker Table */}
            <div className="wfa-table-card">
                <div className="wfa-table-header">
                    <h3>
                        <MdAccessTime style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                        {isToday
                            ? t('workforce_attendance.todays_attendance', "Today's Attendance")
                            : t('workforce_attendance.attendance_for', 'Attendance for {{date}}', { date: new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) })
                        }
                    </h3>
                    <span className="wfa-count-badge">{filtered.length} {t('workforce_attendance.workers_label', 'workers')}</span>
                </div>

                {loading ? (
                    <div className="wfa-loading">{t('common.loading', 'Loading…')}</div>
                ) : filtered.length === 0 ? (
                    <div className="wfa-empty">
                        <MdPeople style={{ fontSize: '2rem', opacity: 0.4 }} />
                        <p>{t('workforce_attendance.no_workers', 'No workers found matching your criteria.')}</p>
                    </div>
                ) : (
                    <div className="wfa-table-scroll">
                        <table className="wfa-table">
                            <thead>
                                <tr>
                                    <th>{t('common.name', 'Name')}</th>
                                    <th>{t('common.project', 'Project')}</th>
                                    <th>{t('common.status', 'Status')}</th>
                                    <th>{t('workforce_attendance.check_in', 'Check In')}</th>
                                    <th>{t('workforce_attendance.check_out', 'Check Out')}</th>
                                    <th>{t('workforce_attendance.location', 'Location')}</th>
                                    {isToday && <th>{t('common.actions', 'Actions')}</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((w) => {
                                    const att = w.attendance;
                                    const status = att?.status || 'not_marked';
                                    const isPresent = status === 'present';
                                    const isAbsent = status === 'absent';
                                    const hasCheckedOut = !!att?.check_out_time;

                                    return (
                                        <tr key={w.id} className={`wfa-row ${status}`}>
                                            <td>
                                                <div className="wfa-worker-info">
                                                    <div className="wfa-avatar">{w.name.charAt(0)}</div>
                                                    <div>
                                                        <p className="wfa-worker-name">{w.name}</p>
                                                        <p className="wfa-worker-role">{w.role}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="wfa-project-tag">
                                                    {w.project?.name || t('common.unassigned', 'Unassigned')}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`wfa-status-badge ${status}`}>
                                                    {isPresent && <MdCheckCircle />}
                                                    {isAbsent && <MdCancel />}
                                                    {status === 'not_marked' && <MdAccessTime />}
                                                    {isPresent ? t('common.present', 'Present')
                                                        : isAbsent ? t('common.absent', 'Absent')
                                                            : t('workforce_attendance.not_marked', 'Not Marked')}
                                                </span>
                                            </td>
                                            <td className="wfa-time">{formatTime(att?.check_in_time)}</td>
                                            <td className="wfa-time">{formatTime(att?.check_out_time)}</td>
                                            <td>
                                                {att?.location_verified ? (
                                                    <span className="wfa-location-badge verified">
                                                        <MdGpsFixed /> {t('workforce_attendance.verified', 'Verified')}
                                                    </span>
                                                ) : isPresent ? (
                                                    <span className="wfa-location-badge unverified">
                                                        <MdWarning /> {t('workforce_attendance.not_verified', 'Not Verified')}
                                                    </span>
                                                ) : (
                                                    <span className="wfa-location-badge na">—</span>
                                                )}
                                            </td>
                                            {isToday && (
                                                <td>
                                                    <div className="wfa-actions">
                                                        {!att && (
                                                            <>
                                                                <button
                                                                    className="btn btn-success btn-sm wfa-action-btn"
                                                                    onClick={() => handleCheckIn(w)}
                                                                    disabled={checkingIn === w.id}
                                                                >
                                                                    {checkingIn === w.id ? (
                                                                        <><MdGpsFixed className="wfa-spin" /> {t('workforce_attendance.locating', 'Locating...')}</>
                                                                    ) : (
                                                                        <><MdLogin /> {t('workforce_attendance.check_in_btn', 'Check In')}</>
                                                                    )}
                                                                </button>
                                                                <button
                                                                    className="btn btn-danger btn-sm wfa-action-btn"
                                                                    onClick={() => handleMarkAbsent(w)}
                                                                >
                                                                    <MdCancel /> {t('common.absent', 'Absent')}
                                                                </button>
                                                            </>
                                                        )}
                                                        {isPresent && !hasCheckedOut && (
                                                            <button
                                                                className="btn btn-outline btn-sm wfa-action-btn"
                                                                onClick={() => handleCheckOut(w)}
                                                                disabled={checkingOut === w.id}
                                                            >
                                                                {checkingOut === w.id ? (
                                                                    <><MdGpsFixed className="wfa-spin" /> {t('workforce_attendance.locating', 'Locating...')}</>
                                                                ) : (
                                                                    <><MdLogoutIcon /> {t('workforce_attendance.check_out_btn', 'Check Out')}</>
                                                                )}
                                                            </button>
                                                        )}
                                                        {hasCheckedOut && (
                                                            <span className="wfa-completed-label">
                                                                <MdCheckCircle /> {t('workforce_attendance.shift_complete', 'Shift Complete')}
                                                            </span>
                                                        )}
                                                        {isAbsent && (
                                                            <button
                                                                className="btn btn-success btn-sm wfa-action-btn"
                                                                onClick={() => handleCheckIn(w)}
                                                                disabled={checkingIn === w.id}
                                                            >
                                                                <MdLogin /> {t('workforce_attendance.override_checkin', 'Override → Check In')}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkforceAttendancePage;
