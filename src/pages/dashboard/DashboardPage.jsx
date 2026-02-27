import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../../components/dashboard/StatCard';
import QuickActions from '../../components/dashboard/QuickActions';
import ActiveProjects from '../../components/dashboard/ActiveProjects';
import RecentActivities from '../../components/dashboard/RecentActivities';
import { demoProjects, demoAttendance, demoMaterialRequests, demoTasks } from '../../services/demoData';
import { MdFolder, MdAccessTime, MdWarning, MdCheckCircle, MdAccountBalanceWallet } from 'react-icons/md';
import './DashboardPage.css';

const DashboardPage = () => {
    const { user, isDemo } = useAuth();
    const displayName = user?.user_metadata?.full_name || 'Project Manager';

    const activeProjects = demoProjects.filter((p) => p.status === 'in_progress').length;
    const todayAttendance = demoAttendance.filter((a) => a.status === 'present').length;
    const pendingApprovals = demoMaterialRequests.filter((m) => m.status === 'pending').length;
    const activeTasks = demoTasks.filter((t) => t.status === 'in_progress').length;

    return (
        <div className="dashboard-page">
            <div className="dashboard-welcome">
                <h1>Welcome back, {displayName}!</h1>
                <p>Here's what's happening with your projects today.</p>
                <div className="dashboard-status">
                    <span className="status-connected">
                        <span className="status-dot"></span> Connected
                    </span>
                    {isDemo && <span className="demo-badge">Demo Data</span>}
                </div>
            </div>

            <div className="stats-grid">
                <StatCard
                    label="Active Projects"
                    value={activeProjects}
                    subtitle={`${activeProjects} ongoing`}
                    icon={MdFolder}
                    iconBg="var(--icon-blue-bg)"
                    iconColor="var(--icon-blue)"
                />
                <StatCard
                    label="Today's Attendance"
                    value={todayAttendance}
                    subtitle="Checked in today"
                    icon={MdAccessTime}
                    iconBg="var(--icon-orange-bg)"
                    iconColor="var(--icon-orange)"
                />
                <StatCard
                    label="Pending Approvals"
                    value={pendingApprovals}
                    subtitle="Needs attention"
                    icon={MdWarning}
                    iconBg="var(--warning-bg)"
                    iconColor="var(--warning)"
                />
                <StatCard
                    label="Tasks In Progress"
                    value={activeTasks}
                    subtitle={`${activeTasks} active tasks`}
                    icon={MdCheckCircle}
                    iconBg="var(--icon-green-bg)"
                    iconColor="var(--icon-green)"
                />
            </div>

            <QuickActions />

            <div className="dashboard-petty-cash">
                <div className="petty-cash-header">
                    <MdAccountBalanceWallet className="pc-icon" />
                    <h3>Manage Petty Cash</h3>
                </div>
                <p className="petty-cash-sub">Select Site Engineer</p>
                <select className="form-select">
                    <option>-- Select Site Engineer --</option>
                    <option>Ramesh Kumar</option>
                    <option>Suresh Patil</option>
                    <option>Mahesh Singh</option>
                </select>
            </div>

            <div className="dashboard-bottom-grid">
                <ActiveProjects />
                <RecentActivities />
            </div>
        </div>
    );
};

export default DashboardPage;
