import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../../components/dashboard/StatCard';
import QuickActions from '../../components/dashboard/QuickActions';
import ActiveProjects from '../../components/dashboard/ActiveProjects';
import RecentActivities from '../../components/dashboard/RecentActivities';
import { getDashboardStats, getSiteEngineers, getPettyCash, addPettyCashTransaction, getMaterialRequests, updateMaterialRequestStatus } from '../../services/api';
import { MdFolder, MdAccessTime, MdWarning, MdCheckCircle, MdCancel, MdAccountBalanceWallet, MdArrowUpward, MdArrowDownward } from 'react-icons/md';
import { toast } from 'react-toastify';
import './DashboardPage.css';

const DashboardPage = () => {
    const { user, userRole } = useAuth();
    const displayName = user?.user_metadata?.full_name || user?.email || 'Project Manager';

    const [stats, setStats] = useState({ activeProjects: 0, todayAttendance: 0, pendingApprovals: 0, activeTasks: 0 });
    const [engineers, setEngineers] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);

    // Petty cash state
    const [selectedEngineerId, setSelectedEngineerId] = useState('');
    const [pcTransactions, setPcTransactions] = useState([]);
    const [pcAmount, setPcAmount] = useState('');
    const [pcDescription, setPcDescription] = useState('');
    const [pcSubmitting, setPcSubmitting] = useState(false);

    const pcBalance = pcTransactions.reduce((sum, t) => {
        return t.type === 'credit' ? sum + Number(t.amount) : sum - Number(t.amount);
    }, 0);

    const handleEngineerSelect = async (id) => {
        setSelectedEngineerId(id);
        setPcTransactions([]);
        if (!id) return;
        try {
            const data = await getPettyCash(id);
            setPcTransactions(data);
        } catch (e) {
            toast.error('Failed to load petty cash: ' + e.message);
        }
    };

    const handlePcAction = async (type) => {
        if (!selectedEngineerId || !pcAmount || Number(pcAmount) <= 0) {
            toast.error('Select an engineer and enter a valid amount.');
            return;
        }
        setPcSubmitting(true);
        try {
            const tx = await addPettyCashTransaction({
                engineerId: selectedEngineerId,
                type,
                amount: pcAmount,
                description: pcDescription,
                recordedBy: user?.id,
            });
            setPcTransactions((prev) => [tx, ...prev]);
            setPcAmount('');
            setPcDescription('');
            toast.success(type === 'credit' ? 'Funds allocated!' : 'Expense recorded!');
        } catch (e) {
            toast.error('Error: ' + e.message);
        }
        setPcSubmitting(false);
    };

    useEffect(() => {
        if (!userRole) return;
        Promise.all([
            getDashboardStats(userRole),
            getSiteEngineers(),
            // Fetch pending material requests relevant to this role
            getMaterialRequests(),
        ])
            .then(([s, engs, reqs]) => {
                setStats(s);
                setEngineers(engs);
                // Admin sees engineer_approved; site engineer sees pending
                if (userRole === 'admin') {
                    setPendingRequests(reqs.filter((r) => r.status === 'engineer_approved'));
                } else if (userRole === 'site_engineer') {
                    setPendingRequests(reqs.filter((r) => r.status === 'pending'));
                }
            })
            .catch(console.error)
            .finally(() => setLoadingStats(false));
    }, [userRole]);

    return (
        <div className="dashboard-page">
            <div className="dashboard-welcome">
                <h1>Welcome back, {displayName}!</h1>
                <p>Here's what's happening with your projects today.</p>
                <div className="dashboard-status">
                    <span className="status-connected">
                        <span className="status-dot"></span> Connected
                    </span>
                </div>
            </div>

            <div className="stats-grid">
                <StatCard
                    label="Active Projects"
                    value={loadingStats ? '…' : stats.activeProjects}
                    subtitle={`${stats.activeProjects} ongoing`}
                    icon={MdFolder}
                    iconBg="var(--icon-blue-bg)"
                    iconColor="var(--icon-blue)"
                />
                <StatCard
                    label="Today's Attendance"
                    value={loadingStats ? '…' : stats.todayAttendance}
                    subtitle="Checked in today"
                    icon={MdAccessTime}
                    iconBg="var(--icon-orange-bg)"
                    iconColor="var(--icon-orange)"
                />
                <StatCard
                    label={userRole === 'admin' ? 'Awaiting Final Approval' : userRole === 'site_engineer' ? 'Pending Review' : 'Pending Approvals'}
                    value={loadingStats ? '…' : stats.pendingApprovals}
                    subtitle={userRole === 'admin' ? 'Forwarded by engineers' : userRole === 'site_engineer' ? 'Needs your review' : 'Needs attention'}
                    icon={MdWarning}
                    iconBg="var(--warning-bg)"
                    iconColor="var(--warning)"
                />
                <StatCard
                    label="Tasks In Progress"
                    value={loadingStats ? '…' : stats.activeTasks}
                    subtitle={`${stats.activeTasks} active tasks`}
                    icon={MdCheckCircle}
                    iconBg="var(--icon-green-bg)"
                    iconColor="var(--icon-green)"
                />
            </div>

            <QuickActions />

            {/* Inline pending requests section for admin & site engineer */}
            {(userRole === 'admin' || userRole === 'site_engineer') && pendingRequests.length > 0 && (
                <div className="card" style={{ marginTop: 0 }}>
                    <h3 style={{ marginBottom: 12, fontSize: '1rem', fontWeight: 600 }}>
                        {userRole === 'admin' ? '🔔 Requests Awaiting Final Approval' : '🔔 Requests Awaiting Your Review'}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {pendingRequests.slice(0, 5).map((req) => (
                            <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-secondary)' }}>
                                <div>
                                    <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>{req.project?.name || 'Unknown Project'}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Requested by {req.requested_by} • {req.date ? new Date(req.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</p>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                        className="btn btn-success btn-sm"
                                        onClick={async () => {
                                            try {
                                                const newStatus = userRole === 'admin' ? 'approved' : 'engineer_approved';
                                                await updateMaterialRequestStatus(req.id, newStatus, userRole === 'admin' ? user?.id : null, userRole === 'site_engineer' ? user?.id : null);
                                                setPendingRequests((prev) => prev.filter((r) => r.id !== req.id));
                                                setStats((prev) => ({ ...prev, pendingApprovals: Math.max(0, prev.pendingApprovals - 1) }));
                                                toast.success(userRole === 'admin' ? 'Approved!' : 'Forwarded to Admin!');
                                            } catch (e) { toast.error('Error: ' + e.message); }
                                        }}
                                    >
                                        <MdCheckCircle /> {userRole === 'admin' ? 'Approve' : 'Forward'}
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={async () => {
                                            try {
                                                const newStatus = userRole === 'admin' ? 'rejected' : 'engineer_rejected';
                                                await updateMaterialRequestStatus(req.id, newStatus, userRole === 'admin' ? user?.id : null, userRole === 'site_engineer' ? user?.id : null);
                                                setPendingRequests((prev) => prev.filter((r) => r.id !== req.id));
                                                setStats((prev) => ({ ...prev, pendingApprovals: Math.max(0, prev.pendingApprovals - 1) }));
                                                toast.success('Rejected.');
                                            } catch (e) { toast.error('Error: ' + e.message); }
                                        }}
                                    >
                                        <MdCancel /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {userRole === 'admin' && (
                <div className="dashboard-petty-cash">
                    <div className="petty-cash-header">
                        <MdAccountBalanceWallet className="pc-icon" />
                        <h3>Manage Petty Cash</h3>
                    </div>
                    <p className="petty-cash-sub">Select Site Engineer</p>
                    <select
                        className="form-select"
                        value={selectedEngineerId}
                        onChange={(e) => handleEngineerSelect(e.target.value)}
                    >
                        <option value="">-- Select Site Engineer --</option>
                        {engineers.map((eng) => (
                            <option key={eng.id} value={eng.id}>{eng.full_name}</option>
                        ))}
                    </select>

                    {selectedEngineerId && (
                        <div style={{ marginTop: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Current Balance</span>
                                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: pcBalance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                    ₹{Math.abs(pcBalance).toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                <input
                                    className="form-input"
                                    type="number"
                                    placeholder="Amount (₹)"
                                    value={pcAmount}
                                    onChange={(e) => setPcAmount(e.target.value)}
                                    min="1"
                                />
                                <input
                                    className="form-input"
                                    type="text"
                                    placeholder="Description (optional)"
                                    value={pcDescription}
                                    onChange={(e) => setPcDescription(e.target.value)}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                <button
                                    className="btn btn-success btn-sm"
                                    style={{ flex: 1 }}
                                    onClick={() => handlePcAction('credit')}
                                    disabled={pcSubmitting}
                                >
                                    <MdArrowUpward /> Allocate Funds
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                    style={{ flex: 1 }}
                                    onClick={() => handlePcAction('debit')}
                                    disabled={pcSubmitting}
                                >
                                    <MdArrowDownward /> Record Expense
                                </button>
                            </div>

                            {pcTransactions.length > 0 && (
                                <div>
                                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>Recent Transactions</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                                        {pcTransactions.map((tx) => (
                                            <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: '8px', background: tx.type === 'credit' ? 'var(--success-bg)' : 'var(--danger-bg)' }}>
                                                <div>
                                                    <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>{tx.description || (tx.type === 'credit' ? 'Funds Allocated' : 'Expense')}</p>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                </div>
                                                <span style={{ fontWeight: 700, color: tx.type === 'credit' ? 'var(--success)' : 'var(--danger)' }}>
                                                    {tx.type === 'credit' ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {pcTransactions.length === 0 && (
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>No transactions yet.</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="dashboard-bottom-grid">
                <ActiveProjects />
                <RecentActivities />
            </div>
        </div>
    );
};

export default DashboardPage;
