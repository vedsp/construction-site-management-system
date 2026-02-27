import { useState } from 'react';
import { demoEngineers, demoProjects } from '../../services/demoData';
import { MdPersonAdd, MdPeople, MdCheckCircle, MdCancel, MdStickyNote2, MdVisibility } from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';
import './AttendancePage.css';

const AttendancePage = () => {
    const { isDemo } = useAuth();
    const [engineers] = useState(demoEngineers);

    const total = engineers.length;
    const presentToday = engineers.filter((e) => e.status === 'present').length;
    const absentToday = total - presentToday;

    const getProjectName = (projectId) => {
        const project = demoProjects.find((p) => p.id === projectId);
        return project ? project.name : 'Unassigned';
    };

    return (
        <div className="attendance-page">
            <div className="page-header-row">
                <div className="page-header">
                    <h1>Site Engineer Management</h1>
                    <p>Monitor site engineers, attendance and their daily reports</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button className="btn btn-primary">
                        <MdPersonAdd /> Add Site Engineer
                    </button>
                    {isDemo && <span className="demo-badge">Demo Data</span>}
                </div>
            </div>

            <div className="attendance-stats">
                <div className="attendance-stat">
                    <div>
                        <p>Total Site Engineers</p>
                        <h3>{total}</h3>
                    </div>
                    <div className="attendance-stat-icon" style={{ background: 'var(--icon-blue-bg)', color: 'var(--icon-blue)' }}>
                        <MdPeople />
                    </div>
                </div>
                <div className="attendance-stat">
                    <div>
                        <p>Present Today</p>
                        <h3>{presentToday}</h3>
                    </div>
                    <div className="attendance-stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                        <MdCheckCircle />
                    </div>
                </div>
                <div className="attendance-stat">
                    <div>
                        <p>Absent/Not Checked In</p>
                        <h3>{absentToday}</h3>
                    </div>
                    <div className="attendance-stat-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                        <MdCancel />
                    </div>
                </div>
            </div>

            <div className="attendance-table-wrapper">
                <div className="attendance-table-header">
                    <h3>All Site Engineers</h3>
                </div>
                <div className="attendance-table-scroll">
                    <table className="attendance-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Name</th>
                                <th>Assigned Project</th>
                                <th>Daily Task</th>
                                <th>Status</th>
                                <th>Check-in Time</th>
                                <th>DPRs</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {engineers.map((eng) => (
                                <tr key={eng.id}>
                                    <td>
                                        <input type="checkbox" />
                                    </td>
                                    <td>
                                        <div className="worker-info">
                                            <div className="worker-avatar">
                                                {eng.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="worker-name">{eng.name}</p>
                                                <p className="worker-username">@{eng.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <select className="form-select" defaultValue={eng.project_id} style={{ minWidth: '180px', padding: '6px 10px', fontSize: '0.8125rem' }}>
                                            {demoProjects.map((p) => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                            <button className="note-btn"><MdStickyNote2 style={{ marginRight: '4px' }} />Note</button>
                                            <span className="unknown-badge">Unknown</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${eng.status === 'present' ? 'on-site' : 'absent'}`}>
                                            {eng.status === 'present' ? '● On Site' : 'Absent'}
                                        </span>
                                    </td>
                                    <td style={{ color: eng.check_in === '-' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                                        {eng.check_in}
                                    </td>
                                    <td>{eng.dpr_count} reports</td>
                                    <td>
                                        <button className="btn btn-outline btn-sm">
                                            <MdVisibility /> View DPRs
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AttendancePage;
