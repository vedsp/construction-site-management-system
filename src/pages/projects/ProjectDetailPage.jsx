import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectById } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { 
    MdArrowBack, MdLocationOn, MdPerson, MdCalendarToday, 
    MdAttachMoney, MdAssignment, MdInventory2, MdBarChart 
} from 'react-icons/md';
import { toast } from 'react-toastify';
import './ProjectDetailPage.css';

const ProjectDetailPage = () => {
    const reportDate = new Date().toLocaleDateString('en-IN', { 
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tasks');
    const [generating, setGenerating] = useState(false);

    const handleGenerateReport = () => {
        setGenerating(true);
        toast.info('Preparing project report...');
        
        // Short delay to ensure any dynamic content is settled
        setTimeout(() => {
            window.print();
            setGenerating(false);
        }, 1000);
    };

    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true);
                const data = await getProjectById(id);
                if (!data) {
                    toast.error('Project not found');
                    navigate('/projects');
                    return;
                }
                setProject(data);
            } catch (error) {
                toast.error('Error loading project: ' + error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="project-detail-page">
                <div style={{ textAlign: 'center', padding: '100px' }}>
                    <div className="loading-spinner"></div>
                    <p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>Loading project details...</p>
                </div>
            </div>
        );
    }

    if (!project) return null;

    const stats = {
        totalTasks: project.tasks?.length || 0,
        completedTasks: project.tasks?.filter(t => t.status === 'completed').length || 0,
        pendingRequests: project.material_requests?.filter(r => r.status === 'pending').length || 0
    };

    return (
        <div className="project-detail-page">
            {/* Print Only Branding */}
            <div className="print-only-header" style={{ display: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>CSMS.</div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', color: '#666' }}>PROJECT STATUS REPORT</div>
                        <div style={{ fontSize: '12px', fontWeight: 600 }}>{reportDate}</div>
                    </div>
                </div>
            </div>

            <div className="detail-header-row">
                <div className="detail-header">
                    <button className="btn btn-outline btn-sm" onClick={() => navigate('/projects')} style={{ marginBottom: '16px' }}>
                        <MdArrowBack /> {t('common.back', 'Back to Projects')}
                    </button>
                    <h1>{project.name}</h1>
                    <p>{project.client || 'Direct Project'}</p>
                </div>
                <div className={`status-badge status-${project.status}`}>
                    {project.status?.replace('_', ' ')}
                </div>
            </div>

            <div className="detail-grid">
                <div className="detail-main-section">
                    <div className="detail-main-card">
                        <h3 className="detail-section-title"><MdBarChart /> {t('projects.overview', 'Overview')}</h3>
                        
                        <div className="detail-info-grid">
                            <div className="detail-info-item">
                                <span className="detail-info-label"><MdLocationOn /> {t('projects.location')}</span>
                                <span className="detail-info-value">{project.location}</span>
                            </div>
                            <div className="detail-info-item">
                                <span className="detail-info-label"><MdCalendarToday /> {t('projects.timeline')}</span>
                                <span className="detail-info-value">
                                    {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'} - {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                            <div className="detail-info-item">
                                <span className="detail-info-label"><MdAttachMoney /> {t('projects.budget')}</span>
                                <span className="detail-info-value">
                                    {project.budget ? `₹${project.budget.toLocaleString('en-IN')}` : 'TBD'}
                                </span>
                            </div>
                        </div>

                        <div className="detail-stats-row">
                            <div className="detail-stat-box">
                                <h4>{stats.totalTasks}</h4>
                                <p>{t('projects.total_tasks', 'Total Tasks')}</p>
                            </div>
                            <div className="detail-stat-box">
                                <h4 style={{ color: 'var(--success)' }}>{stats.completedTasks}</h4>
                                <p>{t('projects.completed', 'Completed')}</p>
                            </div>
                            <div className="detail-stat-box">
                                <h4 style={{ color: 'var(--warning)' }}>{stats.pendingRequests}</h4>
                                <p>{t('projects.pending_requests', 'Pending Requests')}</p>
                            </div>
                        </div>

                        <div className="detail-progress-section">
                            <div className="detail-progress-header">
                                <span style={{ fontWeight: 600 }}>{t('projects.progress')}</span>
                                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{project.progress}%</span>
                            </div>
                            <div className="detail-progress-bar-bg">
                                <div className="detail-progress-bar-fill" style={{ width: `${project.progress}%` }}></div>
                            </div>
                        </div>

                        <div className="detail-tabs">
                            <button 
                                className={`detail-tab ${activeTab === 'tasks' ? 'active' : ''}`}
                                onClick={() => setActiveTab('tasks')}
                            >
                                <MdAssignment /> {t('projects.tasks', 'Tasks')}
                            </button>
                            <button 
                                className={`detail-tab ${activeTab === 'materials' ? 'active' : ''}`}
                                onClick={() => setActiveTab('materials')}
                            >
                                <MdInventory2 /> {t('projects.materials', 'Materials')}
                            </button>
                        </div>

                        <div className="detail-tab-content">
                            {/* In print mode, show both tasks and materials */}
                            <div className="report-sections-wrapper">
                                <div className={`tasks-section ${activeTab === 'tasks' ? 'active-tab' : 'print-only'}`}>
                                    <h4 className="print-only" style={{ marginTop: '30px', borderBottom: '1px solid #eee' }}>Project Tasks</h4>
                                    <div className="detail-list">
                                        {(project.tasks || []).length === 0 ? (
                                            <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No tasks found for this project.</p>
                                        ) : (
                                            project.tasks.map(task => (
                                                <div key={task.id} className="detail-list-item">
                                                    <div>
                                                        <p className="detail-item-title">{task.title}</p>
                                                        <p className="detail-item-meta">{task.priority} Priority • Due {new Date(task.due_date || task.deadline).toLocaleDateString()}</p>
                                                    </div>
                                                    <span className={`badge badge-${task.status}`}>
                                                        {task.status}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className={`materials-section ${activeTab === 'materials' ? 'active-tab' : 'print-only'}`}>
                                    <h4 className="print-only" style={{ marginTop: '30px', borderBottom: '1px solid #eee' }}>Material Requests</h4>
                                    <div className="detail-list">
                                        {(project.material_requests || []).length === 0 ? (
                                            <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No material requests for this project.</p>
                                        ) : (
                                            project.material_requests.map(req => (
                                                <div key={req.id} className="detail-list-item">
                                                    <div>
                                                        <p className="detail-item-title">Requested by {req.requested_by}</p>
                                                        <p className="detail-item-meta">{new Date(req.date || req.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <span className={`badge badge-${req.status}`}>
                                                        {req.status}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="detail-sidebar">
                    <div className="detail-main-card">
                        <h3 className="detail-section-title"><MdPerson /> {t('projects.site_details', 'Site Details')}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="detail-info-item">
                                <span className="detail-info-label">Geofence Radius</span>
                                <span className="detail-info-value">{project.geofence_radius || 300}m</span>
                            </div>
                            <div className="detail-info-item">
                                <span className="detail-info-label">Latitude</span>
                                <span className="detail-info-value">{project.site_lat || 'Not set'}</span>
                            </div>
                            <div className="detail-info-item">
                                <span className="detail-info-label">Longitude</span>
                                <span className="detail-info-value">{project.site_lng || 'Not set'}</span>
                            </div>
                        </div>
                        
                        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                            <button 
                                className="btn btn-primary btn-sm" 
                                style={{ width: '100%' }}
                                onClick={handleGenerateReport}
                                disabled={generating}
                            >
                                {generating ? 'Generating...' : 'Generate Report'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Footer */}
            <div className="print-only-footer" style={{ display: 'none', marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #eee', fontSize: '10px', color: '#888', textAlign: 'center' }}>
                This report was automatically generated by CSMS Construction Management System. &copy; {new Date().getFullYear()} CSMS.
            </div>
        </div>
    );
};

export default ProjectDetailPage;
