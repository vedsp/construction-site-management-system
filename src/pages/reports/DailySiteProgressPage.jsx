import { useState, useEffect, useCallback } from 'react';
import { getProjects, getDailyProgressReports, createDailyProgressReport } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
    MdMap, MdAdd, MdClose, MdCalendarToday, MdFilterList,
    MdDescription, MdCloud, MdPeople, MdWarning, MdCheckCircle,
    MdExpandMore, MdExpandLess, MdRefresh, MdAssignment
} from 'react-icons/md';
import { toast } from 'react-toastify';
import './DailySiteProgressPage.css';

const WEATHER_OPTIONS = [
    { value: 'clear', label: '☀️ Clear' },
    { value: 'cloudy', label: '⛅ Cloudy' },
    { value: 'rainy', label: '🌧️ Rainy' },
    { value: 'stormy', label: '⛈️ Stormy' },
    { value: 'hot', label: '🌡️ Hot' },
    { value: 'windy', label: '💨 Windy' },
];

const DailySiteProgressPage = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterProject, setFilterProject] = useState('');
    const [expandedReport, setExpandedReport] = useState(null);

    // Form state
    const [formOpen, setFormOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        project_id: '',
        date: new Date().toISOString().split('T')[0],
        summary: '',
        work_done: '',
        issues: '',
        weather: 'clear',
        labor_count: 0,
    });

    const fetchData = useCallback(() => {
        setLoading(true);
        Promise.all([getProjects(), getDailyProgressReports(filterProject || null)])
            .then(([p, r]) => {
                setProjects(p);
                setReports(r);
            })
            .catch((e) => toast.error('Failed to load data: ' + e.message))
            .finally(() => setLoading(false));
    }, [filterProject]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Stats
    const today = new Date().toISOString().split('T')[0];
    const reportsToday = reports.filter((r) => r.date === today).length;
    const reportsThisWeek = (() => {
        const now = new Date();
        const day = now.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() + diff);
        const weekStartStr = weekStart.toISOString().split('T')[0];
        return reports.filter((r) => r.date >= weekStartStr).length;
    })();
    const projectsReported = new Set(reports.filter((r) => r.date === today).map((r) => r.project_id)).size;

    const openForm = () => {
        setForm({
            project_id: '',
            date: new Date().toISOString().split('T')[0],
            summary: '',
            work_done: '',
            issues: '',
            weather: 'clear',
            labor_count: 0,
        });
        setFormOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.project_id) { toast.error('Please select a project.'); return; }
        if (!form.work_done.trim()) { toast.error('Work done cannot be empty.'); return; }
        setSubmitting(true);
        try {
            const report = {
                project_id: form.project_id,
                engineer_id: user?.id || null,
                date: form.date,
                summary: form.summary.trim() || null,
                work_done: form.work_done.trim(),
                issues: form.issues.trim() || null,
                weather: form.weather,
                labor_count: parseInt(form.labor_count) || 0,
            };
            const created = await createDailyProgressReport(report);
            setReports((prev) => [created, ...prev.filter((r) => r.id !== created.id)]);
            toast.success('Daily progress report submitted!');
            setFormOpen(false);
        } catch (e) {
            toast.error('Error: ' + e.message);
        }
        setSubmitting(false);
    };

    const getWeatherEmoji = (w) => {
        const found = WEATHER_OPTIONS.find((o) => o.value === w);
        return found ? found.label : w;
    };

    return (
        <div className="dsp-page">
            <div className="page-header-row">
                <div className="page-header">
                    <h1>{t('daily_progress.title', 'Daily Site Progress')}</h1>
                    <p>{t('daily_progress.subtitle', 'Submit and review daily progress reports for all project sites')}</p>
                </div>
                <div className="dsp-header-actions">
                    <button className="btn btn-outline btn-sm" onClick={fetchData}>
                        <MdRefresh /> {t('common.refresh', 'Refresh')}
                    </button>
                    <button className="btn btn-primary" onClick={openForm}>
                        <MdAdd /> {t('daily_progress.new_report', 'New Report')}
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="dsp-stats">
                <div className="dsp-stat-card">
                    <div className="dsp-stat-icon" style={{ background: 'var(--icon-blue-bg)', color: 'var(--icon-blue)' }}>
                        <MdDescription />
                    </div>
                    <div>
                        <p className="dsp-stat-value">{reportsToday}</p>
                        <p className="dsp-stat-label">{t('daily_progress.reports_today', 'Reports Today')}</p>
                    </div>
                </div>
                <div className="dsp-stat-card">
                    <div className="dsp-stat-icon" style={{ background: 'var(--icon-orange-bg)', color: 'var(--icon-orange)' }}>
                        <MdCalendarToday />
                    </div>
                    <div>
                        <p className="dsp-stat-value">{reportsThisWeek}</p>
                        <p className="dsp-stat-label">{t('daily_progress.this_week', 'This Week')}</p>
                    </div>
                </div>
                <div className="dsp-stat-card">
                    <div className="dsp-stat-icon" style={{ background: 'var(--icon-green-bg)', color: 'var(--icon-green)' }}>
                        <MdAssignment />
                    </div>
                    <div>
                        <p className="dsp-stat-value">{projectsReported}</p>
                        <p className="dsp-stat-label">{t('daily_progress.projects_reported', 'Projects Reported Today')}</p>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="dsp-filter-row">
                <div className="dsp-project-filter">
                    <MdFilterList className="dsp-filter-icon" />
                    <select
                        className="form-select"
                        value={filterProject}
                        onChange={(e) => setFilterProject(e.target.value)}
                    >
                        <option value="">{t('daily_progress.all_projects', 'All Projects')}</option>
                        {projects.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Reports List */}
            <div className="dsp-reports-card">
                <div className="dsp-reports-header">
                    <h3>
                        <MdMap style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                        {t('daily_progress.progress_reports', 'Progress Reports')}
                    </h3>
                    <span className="dsp-count-badge">{reports.length} {t('daily_progress.reports_label', 'reports')}</span>
                </div>

                {loading ? (
                    <div className="dsp-loading">{t('common.loading', 'Loading…')}</div>
                ) : reports.length === 0 ? (
                    <div className="dsp-empty">
                        <MdMap style={{ fontSize: '2rem', opacity: 0.4 }} />
                        <p>{t('daily_progress.no_reports', 'No progress reports found. Submit one to get started!')}</p>
                    </div>
                ) : (
                    <div className="dsp-reports-list">
                        {reports.map((r) => {
                            const isExpanded = expandedReport === r.id;
                            return (
                                <div key={r.id} className={`dsp-report-item ${isExpanded ? 'expanded' : ''}`}>
                                    <div
                                        className="dsp-report-summary"
                                        onClick={() => setExpandedReport(isExpanded ? null : r.id)}
                                    >
                                        <div className="dsp-report-left">
                                            <div className="dsp-report-date-badge">
                                                <span className="dsp-date-day">{new Date(r.date + 'T00:00:00').getDate()}</span>
                                                <span className="dsp-date-month">{new Date(r.date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short' })}</span>
                                            </div>
                                            <div className="dsp-report-info">
                                                <p className="dsp-report-project">{r.project?.name || 'Unknown Project'}</p>
                                                <p className="dsp-report-meta">
                                                    <span>{r.engineer?.full_name || 'Unknown'}</span>
                                                    <span className="dsp-dot">·</span>
                                                    <span>{getWeatherEmoji(r.weather)}</span>
                                                    <span className="dsp-dot">·</span>
                                                    <span><MdPeople style={{ verticalAlign: 'middle', fontSize: '0.9em' }} /> {r.labor_count || 0} workers</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="dsp-report-right">
                                            {r.summary && <p className="dsp-report-preview">{r.summary.slice(0, 80)}{r.summary.length > 80 ? '…' : ''}</p>}
                                            <button className="dsp-expand-btn">
                                                {isExpanded ? <MdExpandLess /> : <MdExpandMore />}
                                            </button>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="dsp-report-detail">
                                            {r.summary && (
                                                <div className="dsp-detail-section">
                                                    <h4><MdDescription /> {t('daily_progress.summary_label', 'Summary')}</h4>
                                                    <p>{r.summary}</p>
                                                </div>
                                            )}
                                            <div className="dsp-detail-section">
                                                <h4><MdCheckCircle /> {t('daily_progress.work_done_label', 'Work Done')}</h4>
                                                <p>{r.work_done || '—'}</p>
                                            </div>
                                            {r.issues && (
                                                <div className="dsp-detail-section issues">
                                                    <h4><MdWarning /> {t('daily_progress.issues_label', 'Issues / Blockers')}</h4>
                                                    <p>{r.issues}</p>
                                                </div>
                                            )}
                                            <div className="dsp-detail-tags">
                                                <span className="dsp-tag"><MdCloud /> {getWeatherEmoji(r.weather)}</span>
                                                <span className="dsp-tag"><MdPeople /> {r.labor_count || 0} workers on site</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* New Report Modal */}
            {formOpen && (
                <div className="modal-overlay" onClick={() => setFormOpen(false)}>
                    <div className="modal-content dsp-form-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2>{t('daily_progress.new_report', 'New Report')}</h2>
                                <p>{t('daily_progress.new_report_sub', 'Submit daily progress for a project site')}</p>
                            </div>
                            <button className="modal-close" onClick={() => setFormOpen(false)}><MdClose /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="dsp-form-body">
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label className="form-label">{t('common.project', 'Project')} *</label>
                                    <select
                                        className="form-select"
                                        value={form.project_id}
                                        onChange={(e) => setForm((f) => ({ ...f, project_id: e.target.value }))}
                                        required
                                    >
                                        <option value="">-- Select Project --</option>
                                        {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('common.date', 'Date')}</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={form.date}
                                        onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('daily_progress.summary_label', 'Summary')}</label>
                                <input
                                    className="form-input"
                                    placeholder="Brief summary of today's progress..."
                                    value={form.summary}
                                    onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('daily_progress.work_done_label', 'Work Done')} *</label>
                                <textarea
                                    className="form-input"
                                    rows={3}
                                    placeholder="Detailed description of work completed today..."
                                    value={form.work_done}
                                    onChange={(e) => setForm((f) => ({ ...f, work_done: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('daily_progress.issues_label', 'Issues / Blockers')}</label>
                                <textarea
                                    className="form-input"
                                    rows={2}
                                    placeholder="Any issues, delays, or blockers encountered..."
                                    value={form.issues}
                                    onChange={(e) => setForm((f) => ({ ...f, issues: e.target.value }))}
                                />
                            </div>
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label className="form-label"><MdCloud style={{ verticalAlign: 'middle' }} /> {t('daily_progress.weather', 'Weather')}</label>
                                    <select
                                        className="form-select"
                                        value={form.weather}
                                        onChange={(e) => setForm((f) => ({ ...f, weather: e.target.value }))}
                                    >
                                        {WEATHER_OPTIONS.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label"><MdPeople style={{ verticalAlign: 'middle' }} /> {t('daily_progress.labor_count', 'Labor Count')}</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        min="0"
                                        placeholder="Number of workers on site"
                                        value={form.labor_count}
                                        onChange={(e) => setForm((f) => ({ ...f, labor_count: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setFormOpen(false)}>{t('common.cancel', 'Cancel')}</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? t('daily_progress.submitting', 'Submitting…') : t('daily_progress.submit_report', 'Submit Report')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailySiteProgressPage;
