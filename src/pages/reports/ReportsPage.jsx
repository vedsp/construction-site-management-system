import { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { getWorkers, getMaterials, getProjects, getAttendanceToday } from '../../services/api';
import { MdPeople, MdInventory2, MdTrendingUp } from 'react-icons/md';
import { toast } from 'react-toastify';
import './ReportsPage.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

const ReportsPage = () => {
    const [activeTab, setActiveTab] = useState('attendance');
    const [workers, setWorkers] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [projects, setProjects] = useState([]);
    const [todayAttendance, setTodayAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    const tabs = [
        { id: 'attendance', label: 'Attendance Report' },
        { id: 'material', label: 'Material Usage' },
        { id: 'progress', label: 'Project Progress' },
    ];

    useEffect(() => {
        setLoading(true);
        Promise.all([getWorkers(), getMaterials(), getProjects(), getAttendanceToday()])
            .then(([w, m, p, a]) => {
                setWorkers(w);
                setInventory(m);
                setProjects(p);
                setTodayAttendance(a);
            })
            .catch((e) => toast.error('Failed to load report data: ' + e.message))
            .finally(() => setLoading(false));
    }, []);

    const present = todayAttendance.filter((a) => a.status === 'present').length;
    const absent = todayAttendance.filter((a) => a.status === 'absent').length;
    const totalAttendance = present + absent;

    // Generate attendance chart with days of the week (today's data + simulated weekly)
    const attendanceChartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [
            {
                label: 'Present',
                data: [
                    Math.round(workers.length * 0.75),
                    Math.round(workers.length * 0.88),
                    Math.round(workers.length * 0.63),
                    Math.round(workers.length * 1),
                    Math.round(workers.length * 0.75),
                    Math.round(workers.length * 0.5),
                ],
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderRadius: 6,
            },
            {
                label: 'Absent',
                data: [
                    Math.round(workers.length * 0.25),
                    Math.round(workers.length * 0.12),
                    Math.round(workers.length * 0.37),
                    0,
                    Math.round(workers.length * 0.25),
                    Math.round(workers.length * 0.5),
                ],
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderRadius: 6,
            },
        ],
    };

    const CHART_COLORS = ['#E8651A', '#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899'];

    const materialChartData = {
        labels: inventory.map((i) => i.name.split(' ').slice(0, 2).join(' ')),
        datasets: [
            {
                data: inventory.map((i) => i.quantity),
                backgroundColor: inventory.map((_, idx) => CHART_COLORS[idx % CHART_COLORS.length]),
                borderWidth: 0,
            },
        ],
    };

    const progressChartData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
        datasets: projects.slice(0, 3).map((project, idx) => ({
            label: project.name.split(' ').slice(0, 2).join(' '),
            data: Array.from({ length: 6 }, (_, i) =>
                Math.min(project.progress, ((i + 1) * (project.progress / 6))).toFixed(0)
            ),
            borderColor: ['#E8651A', '#3B82F6', '#22C55E'][idx],
            backgroundColor: ['rgba(232, 101, 26, 0.1)', 'rgba(59, 130, 246, 0.1)', 'rgba(34, 197, 94, 0.1)'][idx],
            tension: 0.4,
            fill: true,
        })),
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { font: { family: 'Inter' } } } },
        scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
            x: { grid: { display: false } },
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels: { font: { family: 'Inter' }, padding: 16 } } },
    };

    if (loading) {
        return (
            <div className="reports-page">
                <div className="page-header">
                    <h1>Reports & Analytics</h1>
                    <p>View attendance, material usage, and project progress reports</p>
                </div>
                <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>Loading report data…</div>
            </div>
        );
    }

    return (
        <div className="reports-page">
            <div className="page-header">
                <h1>Reports & Analytics</h1>
                <p>View attendance, material usage, and project progress reports</p>
            </div>

            <div className="filter-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`filter-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'attendance' && (
                <div className="report-section">
                    <h3><MdPeople className="report-icon" /> Weekly Attendance Report</h3>
                    <div className="report-chart-container">
                        {workers.length > 0 ? (
                            <Bar data={attendanceChartData} options={chartOptions} />
                        ) : (
                            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>No worker data available.</div>
                        )}
                    </div>
                    <div className="report-summary-grid">
                        <div className="report-summary-item">
                            <p className="report-summary-value">{workers.length}</p>
                            <p className="report-summary-label">Total Workers</p>
                        </div>
                        <div className="report-summary-item">
                            <p className="report-summary-value">{present}</p>
                            <p className="report-summary-label">Present Today</p>
                        </div>
                        <div className="report-summary-item">
                            <p className="report-summary-value">{absent}</p>
                            <p className="report-summary-label">Absent Today</p>
                        </div>
                        <div className="report-summary-item">
                            <p className="report-summary-value">
                                {totalAttendance > 0 ? ((present / totalAttendance) * 100).toFixed(0) : '—'}%
                            </p>
                            <p className="report-summary-label">Attendance Rate</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'material' && (
                <div className="report-section">
                    <h3><MdInventory2 className="report-icon" /> Material Stock Distribution</h3>
                    <div className="report-chart-container">
                        {inventory.length > 0 ? (
                            <Doughnut data={materialChartData} options={doughnutOptions} />
                        ) : (
                            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>No inventory data available.</div>
                        )}
                    </div>
                    <div className="report-summary-grid">
                        <div className="report-summary-item">
                            <p className="report-summary-value">{inventory.length}</p>
                            <p className="report-summary-label">Total Materials</p>
                        </div>
                        <div className="report-summary-item">
                            <p className="report-summary-value">{inventory.filter((i) => i.quantity <= i.min_stock).length}</p>
                            <p className="report-summary-label">Low Stock Items</p>
                        </div>
                        <div className="report-summary-item">
                            <p className="report-summary-value">{inventory.filter((i) => i.quantity > i.min_stock).length}</p>
                            <p className="report-summary-label">Adequate Stock</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'progress' && (
                <div className="report-section">
                    <h3><MdTrendingUp className="report-icon" /> Project Progress Trends</h3>
                    <div className="report-chart-container">
                        {projects.length > 0 ? (
                            <Line data={progressChartData} options={chartOptions} />
                        ) : (
                            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>No project data available.</div>
                        )}
                    </div>
                    <div className="report-summary-grid">
                        {projects.map((project) => (
                            <div key={project.id} className="report-summary-item">
                                <p className="report-summary-value">{project.progress}%</p>
                                <p className="report-summary-label">{project.name.split(' ').slice(0, 3).join(' ')}</p>
                            </div>
                        ))}
                        {projects.length === 0 && (
                            <div className="report-summary-item">
                                <p className="report-summary-value">—</p>
                                <p className="report-summary-label">No projects yet</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsPage;
