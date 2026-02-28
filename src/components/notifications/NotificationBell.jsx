import { useState, useRef, useEffect, useCallback } from 'react';
import { MdNotifications, MdCheckCircle, MdWarning, MdAssignment, MdSchedule, MdInfo } from 'react-icons/md';
import { getNotifications, markAllNotificationsRead } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './NotificationBell.css';

const iconMap = {
    check: { Icon: MdCheckCircle, bg: 'var(--success-bg)', color: 'var(--success)' },
    warning: { Icon: MdWarning, bg: 'var(--warning-bg)', color: 'var(--warning)' },
    task: { Icon: MdAssignment, bg: 'var(--info-bg)', color: 'var(--info)' },
    clock: { Icon: MdSchedule, bg: 'var(--icon-purple-bg)', color: 'var(--icon-purple)' },
    info: { Icon: MdInfo, bg: 'var(--icon-blue-bg)', color: 'var(--icon-blue)' },
};

const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

const NotificationBell = () => {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const ref = useRef(null);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const fetchNotifications = useCallback(() => {
        if (!user?.id) return;
        getNotifications(user.id)
            .then(setNotifications)
            .catch(console.error);
    }, [user]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const markAllRead = async () => {
        if (!user?.id) return;
        try {
            await markAllNotificationsRead(user.id);
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="notification-bell" ref={ref}>
            <button className="notification-bell-btn" onClick={() => setOpen(!open)}>
                <MdNotifications />
                {unreadCount > 0 && <span className="notification-badge-count">{unreadCount}</span>}
            </button>

            {open && (
                <div className="notification-dropdown">
                    <div className="notification-dropdown-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button className="notification-mark-all" onClick={markAllRead}>
                                Mark all read
                            </button>
                        )}
                    </div>
                    <div className="notification-list">
                        {notifications.length === 0 && (
                            <p style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>
                                No notifications
                            </p>
                        )}
                        {notifications.map((n) => {
                            const { Icon, bg, color } = iconMap[n.icon] || iconMap.info;
                            return (
                                <div key={n.id} className={`notification-item ${!n.read ? 'unread' : ''}`}>
                                    <div className="notification-item-icon" style={{ background: bg, color }}>
                                        <Icon />
                                    </div>
                                    <div className="notification-item-content">
                                        <p className="notification-item-message">{n.message}</p>
                                        <p className="notification-item-time">{timeAgo(n.created_at)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
