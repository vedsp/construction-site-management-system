import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useTranslation } from 'react-i18next';
import { MdHowToReg, MdCheck, MdClose, MdPeople, MdPendingActions, MdFilterList, MdRefresh } from 'react-icons/md';
import { toast } from 'react-toastify';
import './UserApprovalsPage.css';

const UserApprovalsPage = () => {
    const { t } = useTranslation();
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'pending', 'approved', 'all'
    const [actionLoading, setActionLoading] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAllUsers(data || []);
        } catch (err) {
            toast.error('Failed to load users: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Derive filtered list for the table
    const users = allUsers.filter(u => {
        if (filter === 'pending') return !u.is_approved;
        if (filter === 'approved') return u.is_approved;
        return true;
    });

    const handleApprove = async (userId) => {
        setActionLoading(userId);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_approved: true })
                .eq('id', userId);

            if (error) throw error;
            toast.success('User approved successfully!');
            fetchUsers();
        } catch (err) {
            toast.error('Failed to approve user: ' + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (userId) => {
        if (!window.confirm(t('user_approvals.confirm_reject'))) {
            return;
        }
        setActionLoading(userId);
        try {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId);

            if (error) throw error;
            toast.success('User rejected and removed.');
            fetchUsers();
        } catch (err) {
            toast.error('Failed to reject user: ' + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleRevoke = async (userId) => {
        if (!window.confirm(t('user_approvals.confirm_revoke'))) {
            return;
        }
        setActionLoading(userId);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_approved: false })
                .eq('id', userId);

            if (error) throw error;
            toast.success('User approval revoked.');
            fetchUsers();
        } catch (err) {
            toast.error('Failed to revoke approval: ' + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const formatRole = (role) => {
        if (!role) return 'Unknown';
        return role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const pendingCount = allUsers.filter(u => !u.is_approved).length;
    const approvedCount = allUsers.filter(u => u.is_approved).length;
    const totalCount = allUsers.length;

    return (
        <div className="approvals-page">
            <div className="approvals-header">
                <div className="approvals-title">
                    <MdHowToReg className="approvals-title-icon" />
                    <div>
                        <h1>{t('user_approvals.title')}</h1>
                        <p>{t('user_approvals.subtitle')}</p>
                    </div>
                </div>
                <button className="approvals-refresh-btn" onClick={fetchUsers} disabled={loading}>
                    <MdRefresh className={loading ? 'spin' : ''} />
                    {t('user_approvals.refresh')}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="approvals-stats">
                <div className="stat-card stat-pending" onClick={() => setFilter('pending')}>
                    <MdPendingActions className="stat-icon" />
                    <div className="stat-info">
                        <span className="stat-number">{pendingCount}</span>
                        <span className="stat-label">{t('user_approvals.pending')}</span>
                    </div>
                </div>
                <div className="stat-card stat-approved" onClick={() => setFilter('approved')}>
                    <MdCheck className="stat-icon" />
                    <div className="stat-info">
                        <span className="stat-number">{approvedCount}</span>
                        <span className="stat-label">{t('user_approvals.approved')}</span>
                    </div>
                </div>
                <div className="stat-card stat-all" onClick={() => setFilter('all')}>
                    <MdPeople className="stat-icon" />
                    <div className="stat-info">
                        <span className="stat-number">{totalCount}</span>
                        <span className="stat-label">{t('user_approvals.total_users')}</span>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="approvals-filter-bar">
                <MdFilterList className="filter-icon" />
                <button
                    className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilter('pending')}
                >
                    {t('user_approvals.pending')} {filter !== 'pending' && pendingCount > 0 && <span className="badge">{pendingCount}</span>}
                </button>
                <button
                    className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
                    onClick={() => setFilter('approved')}
                >
                    {t('user_approvals.approved')}
                </button>
                <button
                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    {t('user_approvals.all_users')}
                </button>
            </div>

            {/* Users Table */}
            <div className="approvals-table-container">
                {loading ? (
                    <div className="approvals-loading">
                        <div className="loading-spinner"></div>
                        <p>{t('user_approvals.loading_users')}</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="approvals-empty">
                        <MdPeople className="empty-icon" />
                        <h3>{t('user_approvals.no_users_found', { filter: filter === 'all' ? '' : filter })}</h3>
                        <p>{filter === 'pending' ? t('user_approvals.all_processed') : t('user_approvals.no_match')}</p>
                    </div>
                ) : (
                    <table className="approvals-table">
                        <thead>
                            <tr>
                                <th>{t('user_approvals.name')}</th>
                                <th>{t('user_approvals.role')}</th>
                                <th>{t('user_approvals.registered')}</th>
                                <th>{t('user_approvals.status')}</th>
                                <th>{t('user_approvals.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className={!user.is_approved ? 'pending-row' : ''}>
                                    <td>
                                        <div className="user-info">
                                            <div className="user-avatar">
                                                {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <span className="user-name">{user.full_name || 'Unknown'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`role-badge role-${user.role}`}>
                                            {formatRole(user.role)}
                                        </span>
                                    </td>
                                    <td>{formatDate(user.created_at)}</td>
                                    <td>
                                        <span className={`status-badge ${user.is_approved ? 'status-approved' : 'status-pending'}`}>
                                            {user.is_approved ? t('user_approvals.approved') : t('user_approvals.pending')}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            {!user.is_approved ? (
                                                <>
                                                    <button
                                                        className="action-btn approve-btn"
                                                        onClick={() => handleApprove(user.id)}
                                                        disabled={actionLoading === user.id}
                                                        title="Approve user"
                                                    >
                                                        <MdCheck /> {t('user_approvals.approve')}
                                                    </button>
                                                    <button
                                                        className="action-btn reject-btn"
                                                        onClick={() => handleReject(user.id)}
                                                        disabled={actionLoading === user.id}
                                                        title="Reject and delete user"
                                                    >
                                                        <MdClose /> {t('user_approvals.reject')}
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    className="action-btn revoke-btn"
                                                    onClick={() => handleRevoke(user.id)}
                                                    disabled={actionLoading === user.id}
                                                    title="Revoke approval"
                                                >
                                                    <MdClose /> {t('user_approvals.revoke')}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default UserApprovalsPage;
