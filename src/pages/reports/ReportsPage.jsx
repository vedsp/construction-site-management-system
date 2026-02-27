import { useState } from 'react';
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
import { demoWorkers, demoAttendance, demoProjects, demoInventory } from '../../services/demoData';
import { MdPeople, MdInventory2, MdTrendingUp } from 'react-icons/md';
import './ReportsPage.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

const ReportsPage = () => {
    const [activeTab, setActiveTab] = useState('attendance');

    const tabs = [
        { id: 'attendance', label: 'Attendance Report' },
        { id: 'material', label: 'Material Usage' },
        { id: 'progress', label: 'Project Progress' },
    ];

    const present = demoAttendance.filter((a) => a.status === 'present').length;
    const absent = demoAttendance.filter((a) => a.status === 'absent').length;

    const attendanceChartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [
            {
                label: 'Present',
                data: [6, 7, 5, 8, 6, 4],
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderRadius: 6,
            },
            {
                label: 'Absent',
                data: [2, 1, 3, 0, 2, 4],
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderRadius: 6,
            },
        ],
    };

    const materialChartData = {
        labels: demoInventory.map((i) => i.name.split(' ').slice(0, 2).join(' ')),
        datasets: [
            {
                data: demoInventory.map((i) => i.quantity),
                backgroundColor: [
                    '#E8651A', '#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899',
                ],
                borderWidth: 0,
            },
        ],
    };

    const progressChartData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
        datasets: demoProjects.map((project, idx) => ({
            label: project.name.split(' ').slice(0, 2).join(' '),
            data: Array.from({ length: 6 }, (_, i) => Math.min(project.progress, (i + 1) * (project.progress / 6)).toFixed(0)),
            borderColor: ['#E8651A', '#3B82F6', '#22C55E'][idx],
            backgroundColor: ['rgba(232, 101, 26, 0.1)', 'rgba(59, 130, 246, 0.1)', 'rgba(34, 197, 94, 0.1)'][idx],
            tension: 0.4,
            fill: true,
        })),
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { font: { family: 'Inter' } } },
        },
        scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
            x: { grid: { display: false } },
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right', labels: { font: { family: 'Inter' }, padding: 16 } },
        },
    };

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
                        <Bar data={attendanceChartData} options={chartOptions} />
                    </div>
                    <div className="report-summary-grid">
                        <div className="report-summary-item">
                            <p className="report-summary-value">{demoWorkers.length}</p>
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
                            <p className="report-summary-value">{((present / (present + absent)) * 100).toFixed(0)}%</p>
                            <p className="report-summary-label">Attendance Rate</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'material' && (
                <div className="report-section">
                    <h3><MdInventory2 className="report-icon" /> Material Stock Distribution</h3>
                    <div className="report-chart-container">
                        <Doughnut data={materialChartData} options={doughnutOptions} />
                    </div>
                    <div className="report-summary-grid">
                        <div className="report-summary-item">
                            <p className="report-summary-value">{demoInventory.length}</p>
                            <p className="report-summary-label">Total Materials</p>
                        </div>
                        <div className="report-summary-item">
                            <p className="report-summary-value">{demoInventory.filter((i) => i.quantity <= i.min_stock).length}</p>
                            <p className="report-summary-label">Low Stock Items</p>
                        </div>
                        <div className="report-summary-item">
                            <p className="report-summary-value">{demoInventory.filter((i) => i.quantity > i.min_stock).length}</p>
                            <p className="report-summary-label">Adequate Stock</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'progress' && (
                <div className="report-section">
                    <h3><MdTrendingUp className="report-icon" /> Project Progress Trends</h3>
                    <div className="report-chart-container">
                        <Line data={progressChartData} options={chartOptions} />
                    </div>
                    <div className="report-summary-grid">
                        {demoProjects.map((project) => (
                            <div key={project.id} className="report-summary-item">
                                <p className="report-summary-value">{project.progress}%</p>
                                <p className="report-summary-label">{project.name.split(' ').slice(0, 3).join(' ')}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsPage;
