import { useState, useEffect } from 'react';
import { getEngineers, getProjects } from '../../services/api';
import { supabase } from '../../services/supabaseClient';
import { MdPersonAdd, MdPeople, MdCheckCircle, MdCancel, MdStickyNote2, MdVisibility } from 'react-icons/md';
import { toast } from 'react-toastify';
import './AttendancePage.css';

const AttendancePage = () => {
    const [engineers, setEngineers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = () => {
        setLoading(true);
        Promise.all([getEngineers(), getProjects()])
            .then(([engs, projs]) => {
                setEngineers(engs);
                setProjects(projs);
            })
            .catch((e) => toast.error('Failed to load data: ' + e.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    const total = engineers.length;
    const presentToday = engineers.filter((e) => e.status === 'present').length;
    const absentToday = total - presentToday;

    const getProjectName = (projectId) => {
        const project = projects.find((p) => p.id === projectId);
        return project ? project.name : 'Unassigned';
    };

    const handleProjectChange = async (engineerId, projectId) => {
        try {
            // Remove any existing assignment for this engineer, then assign to new project
            await supabase.from('project_assignments').delete().eq('engineer_id', engineerId);
            if (projectId) {
                const { error } = await supabase
                    .from('project_assignments')
                    .insert([{ engineer_id: engineerId, project_id: projectId }]);
                if (error) throw error;
            }
            toast.success('Project assignment updated.');
        } catch (e) {
            toast.error('Error: ' + e.message);
        }
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
                {loading ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading engineers…</div>
                ) : (
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
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {engineers.map((eng) => (
                                    <tr key={eng.id}>
                                        <td><input type="checkbox" /></td>
                                        <td>
                                            <div className="worker-info">
                                                <div className="worker-avatar">{eng.full_name.charAt(0)}</div>
                                                <div>
                                                    <p className="worker-name">{eng.full_name}</p>
                                                    <p className="worker-username">@{eng.full_name.split(' ')[0].toLowerCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <select
                                                className="form-select"
                                                defaultValue=""
                                                onChange={(e) => handleProjectChange(eng.id, e.target.value)}
                                                style={{ minWidth: '180px', padding: '6px 10px', fontSize: '0.8125rem' }}
                                            >
                                                <option value="">-- Select Project --</option>
                                                {projects.map((p) => (
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
                                        <td style={{ color: 'var(--text-muted)' }}>—</td>
                                        <td>
                                            <button className="btn btn-outline btn-sm">
                                                <MdVisibility /> View DPRs
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {engineers.length === 0 && (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                            No site engineers found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendancePage;
