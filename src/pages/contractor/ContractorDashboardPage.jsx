import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import StatCard from '../../components/dashboard/StatCard';
import { getContractorStats, getMaterialRequestsByContractor, getTasksByContractor, createMaterialRequest, getProjects } from '../../services/api';
import { MdAssignment, MdInventory2, MdFolder, MdAdd } from 'react-icons/md';
import { toast } from 'react-toastify';
import MaterialRequestForm from '../../components/materials/MaterialRequestForm';

const ContractorDashboardPage = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
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
        <div className="dashboard-page" style={{ padding: '24px' }}>
            <div className="dashboard-welcome" style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                    {t('contractor_dashboard.welcome', { name: displayName })}
                </h1>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>{t('contractor_dashboard.subtitle')}</p>
            </div>

            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                <StatCard
                    label={t('contractor_dashboard.assigned_tasks')}
                    value={loading ? '…' : stats.assignedTasks}
                    subtitle={t('contractor_dashboard.in_progress_pending')}
                    icon={MdAssignment}
                    iconBg="var(--icon-blue-bg)"
                    iconColor="var(--icon-blue)"
                />
                <StatCard
                    label={t('contractor_dashboard.my_material_requests')}
                    value={loading ? '…' : stats.myMaterialRequests}
                    subtitle={t('contractor_dashboard.total_active_requests')}
                    icon={MdInventory2}
                    iconBg="var(--icon-orange-bg)"
                    iconColor="var(--icon-orange)"
                />
                <StatCard
                    label={t('contractor_dashboard.active_projects')}
                    value={loading ? '…' : stats.activeProjectsCount}
                    subtitle={t('contractor_dashboard.projects_assigned')}
                    icon={MdFolder}
                    iconBg="var(--icon-green-bg)"
                    iconColor="var(--icon-green)"
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button className="btn btn-primary" onClick={() => setShowMaterialForm(true)}>
                    <MdAdd /> {t('contractor_dashboard.request_material')}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>

                {/* Active Tasks Widget */}
                <div className="card" style={{ padding: '24px', borderRadius: '12px', background: 'var(--bg-primary)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                        {t('contractor_dashboard.your_active_tasks')}
                    </h3>

                    {loading ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t('contractor_dashboard.loading_tasks')}</p>
                    ) : recentTasks.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '24px 0' }}>{t('contractor_dashboard.no_active_tasks')}</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {recentTasks.map(task => (
                                <div key={task.id} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', fontWeight: 600, fontSize: '0.9rem' }}>{task.name}</p>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Deadline: {new Date(task.deadline).toLocaleDateString('en-IN')}</p>
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
                <div className="card" style={{ padding: '24px', borderRadius: '12px', background: 'var(--bg-primary)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                        {t('contractor_dashboard.recent_material_requests')}
                    </h3>

                    {loading ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t('contractor_dashboard.loading_requests')}</p>
                    ) : recentRequests.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '24px 0' }}>{t('contractor_dashboard.no_recent_requests')}</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {recentRequests.map(req => (
                                <div key={req.id} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', fontWeight: 600, fontSize: '0.9rem' }}>{req.project?.name || 'Unknown Project'}</p>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(req.date).toLocaleDateString('en-IN')} • {req.items?.length || 0} items</p>
                                    </div>
                                    <span className={`badge ${req.status === 'approved' ? 'badge-success' : req.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                                        {req.status.replace('_', ' ')}
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
