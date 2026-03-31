import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import StatCard from '../../components/dashboard/StatCard';
import {
    getContractorStats,
    getTasksByContractor,
    getMaterialRequestsByContractor,
    createMaterialRequest,
    getProjects
} from '../../services/api';
import { MdAssignment, MdInventory2, MdFolder, MdAdd, MdContentPaste } from 'react-icons/md';
import { toast } from 'react-toastify';
import MaterialRequestForm from '../../components/materials/MaterialRequestForm';
import './ContractorDashboardPage.css';

const ContractorDashboardPage = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const displayName = user?.user_metadata?.full_name || user?.email || t('roles.contractor');

    const [stats, setStats] = useState({ assignedTasks: 0, myMaterialRequests: 0, activeProjectsCount: 0 });
    const [recentTasks, setRecentTasks] = useState([]);
    const [recentRequests, setRecentRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // For Material Request Form
    const [showMaterialForm, setShowMaterialForm] = useState(false);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        if (!user?.id) return;

        loadDashboardData();

        // Load projects for the material form dropdown
        getProjects().then(setProjects).catch(console.error);
    }, [user]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const userName = user.user_metadata?.full_name || 'Contractor';
            const userId = user.id;

            // Fetch only relevant data for this contractor from the server
            // Note: Tasks use UUID (userId), Material Requests use TEXT (userName)
            const [fetchedStats, activeTasks, pendingRequests] = await Promise.all([
                getContractorStats(userId, userName),
                getTasksByContractor(userId),
                getMaterialRequestsByContractor(userName, 'pending')
            ]);

            setStats({
                ...fetchedStats,
                activeProjectsCount: fetchedStats.activeProjects || 0
            });

            // Set lists for the UI tables (already filtered and ordered by the server)
            setRecentTasks(activeTasks.slice(0, 5));
            setRecentRequests(pendingRequests.slice(0, 5));

        } catch (e) {
            toast.error('Failed to load dashboard data: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMaterialRequest = async (requestData) => {
        try {
            const { items, ...rest } = requestData;
            await createMaterialRequest(rest, items);
            setShowMaterialForm(false);
            toast.success('Material request submitted successfully!');
            loadDashboardData(); // Refresh UI
        } catch (error) {
            toast.error('Error creating request: ' + error.message);
        }
    };

    return (
        <div className="contractor-dashboard">
            <div className="contractor-hero">
                <h1>{t('contractor_dashboard.welcome', { name: displayName })}</h1>
                <p>{t('contractor_dashboard.subtitle', 'Here is an overview of your work and requests.')}</p>
            </div>

            <div className="contractor-stats-grid">
                <StatCard
                    label={t('contractor_dashboard.assigned_tasks', 'Assigned Tasks')}
                    value={loading ? '…' : stats.assignedTasks}
                    subtitle={t('contractor_dashboard.in_progress_pending', 'In Progress / Pending')}
                    icon={MdAssignment}
                    iconBg="rgba(59, 130, 246, 0.1)"
                    iconColor="#3B82F6"
                />
                <StatCard
                    label={t('contractor_dashboard.my_material_requests', 'My Material Requests')}
                    value={loading ? '…' : stats.myMaterialRequests}
                    subtitle={t('contractor_dashboard.total_active_requests', 'Total Active')}
                    icon={MdInventory2}
                    iconBg="rgba(232, 101, 26, 0.1)"
                    iconColor="var(--primary)"
                />
                <StatCard
                    label={t('contractor_dashboard.active_projects', 'Active Projects')}
                    value={loading ? '…' : stats.activeProjectsCount}
                    subtitle={t('contractor_dashboard.projects_assigned', 'Projects Assigned')}
                    icon={MdFolder}
                    iconBg="rgba(34, 197, 94, 0.1)"
                    iconColor="#22C55E"
                />
            </div>

            {/* Quick Actions Panel */}
            <div className="contractor-actions-grid">
                <button className="contractor-action-btn primary" onClick={() => setShowMaterialForm(true)}>
                    <MdAdd /> {t('contractor_dashboard.request_material')}
                </button>
                <button className="contractor-action-btn" onClick={() => navigate('/tasks')}>
                    <MdContentPaste /> {t('contractor_dashboard.view_all_tasks', 'View All Tasks')}
                </button>
                <button className="contractor-action-btn" onClick={() => navigate('/materials')}>
                    <MdInventory2 /> {t('contractor_dashboard.view_inventory', 'View Inventory')}
                </button>
            </div>

            <div className="contractor-panels">
                {/* Active Tasks Widget */}
                <div className="contractor-panel-card">
                    <div className="contractor-panel-header">
                        <MdAssignment />
                        <h3>{t('contractor_dashboard.your_active_tasks', 'Your Active Tasks')}</h3>
                    </div>

                    {loading ? (
                        <div className="contractor-empty">{t('contractor_dashboard.loading_tasks', 'Loading tasks...')}</div>
                    ) : recentTasks.length === 0 ? (
                        <div className="contractor-empty">{t('contractor_dashboard.no_active_tasks', 'No active tasks assigned to you right now.')}</div>
                    ) : (
                        <div className="contractor-list">
                            {recentTasks.map(task => (
                                <div key={task.id} className="contractor-list-item" onClick={() => navigate('/tasks')} style={{ cursor: 'pointer' }}>
                                    <div className="contractor-item-info">
                                        <p className="contractor-item-title">{task.name}</p>
                                        <p className="contractor-item-meta">
                                            {t('common.deadline', 'Deadline')}: {new Date(task.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                    <span className={`badge ${task.status === 'in_progress' ? 'badge-warning' : 'badge-secondary'}`}>
                                        {task.status.replace('_', ' ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Material Requests Widget */}
                <div className="contractor-panel-card">
                    <div className="contractor-panel-header">
                        <MdInventory2 />
                        <h3>{t('contractor_dashboard.recent_material_requests', 'Recent Material Requests')}</h3>
                    </div>

                    {loading ? (
                        <div className="contractor-empty">{t('contractor_dashboard.loading_requests', 'Loading requests...')}</div>
                    ) : recentRequests.length === 0 ? (
                        <div className="contractor-empty">{t('contractor_dashboard.no_recent_requests', 'You haven\'t made any material requests yet.')}</div>
                    ) : (
                        <div className="contractor-list">
                            {recentRequests.map(req => (
                                <div key={req.id} className="contractor-list-item" onClick={() => navigate('/materials')} style={{ cursor: 'pointer' }}>
                                    <div className="contractor-item-info">
                                        <p className="contractor-item-title">{req.project?.name || 'Unknown Project'}</p>
                                        <p className="contractor-item-meta">
                                            {new Date(req.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {req.items?.length || 0} items
                                        </p>
                                    </div>
                                    <span className={`badge ${req.status === 'approved' ? 'badge-success' : req.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                                        {req.status === 'approved' ? t('common.approved', 'approved') :
                                            req.status === 'rejected' ? t('common.rejected', 'rejected') :
                                                t('common.pending', 'pending')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Material Request Modal */}
            {showMaterialForm && (
                <MaterialRequestForm
                    projects={projects}
                    initialRequestedBy={user?.user_metadata?.full_name || ''}
                    onSave={handleCreateMaterialRequest}
                    onClose={() => setShowMaterialForm(false)}
                />
            )}
        </div>
    );
};

export default ContractorDashboardPage;
