import { useState, useRef, useEffect } from 'react';
import { MdNotifications, MdCheckCircle, MdWarning, MdAssignment, MdSchedule } from 'react-icons/md';
import { demoNotifications } from '../../services/demoData';
import './NotificationBell.css';

const iconMap = {
    check: { Icon: MdCheckCircle, bg: 'var(--success-bg)', color: 'var(--success)' },
    warning: { Icon: MdWarning, bg: 'var(--warning-bg)', color: 'var(--warning)' },
    task: { Icon: MdAssignment, bg: 'var(--info-bg)', color: 'var(--info)' },
    clock: { Icon: MdSchedule, bg: 'var(--icon-purple-bg)', color: 'var(--icon-purple)' },
};

const NotificationBell = () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState(demoNotifications);
    const ref = useRef(null);

    const unreadCount = notifications.filter((n) => !n.read).length;

    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
                        {notifications.map((n) => {
                            const { Icon, bg, color } = iconMap[n.icon] || iconMap.check;
                            return (
                                <div key={n.id} className={`notification-item ${!n.read ? 'unread' : ''}`}>
                                    <div className="notification-item-icon" style={{ background: bg, color }}>
                                        <Icon />
                                    </div>
                                    <div className="notification-item-content">
                                        <p className="notification-item-message">{n.message}</p>
                                        <p className="notification-item-time">{n.time}</p>
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
