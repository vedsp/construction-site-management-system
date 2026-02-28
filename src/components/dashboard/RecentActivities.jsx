import { useState, useEffect } from 'react';
import { MdCheckCircle, MdWarning, MdAssignment, MdSchedule, MdInfo } from 'react-icons/md';
import { getNotifications } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './RecentActivities.css';

const iconMap = {
    check: { Icon: MdCheckCircle, className: 'check' },
    warning: { Icon: MdWarning, className: 'warning' },
    task: { Icon: MdAssignment, className: 'task' },
    clock: { Icon: MdSchedule, className: 'clock' },
    info: { Icon: MdInfo, className: 'check' },
};

const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

const RecentActivities = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!user?.id) return;
        getNotifications(user.id)
            .then((data) => setNotifications(data.slice(0, 5)))
            .catch(console.error);
    }, [user]);

    return (
        <div className="recent-activities">
            <h3>Recent Activities</h3>
            {notifications.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No recent activity.</p>
            )}
            {notifications.map((item) => {
                const { Icon, className } = iconMap[item.icon] || iconMap.check;
                return (
                    <div key={item.id} className="activity-item">
                        <div className={`activity-icon ${className}`}>
                            <Icon />
                        </div>
                        <div className="activity-content">
                            <p className="activity-message">{item.message}</p>
                            <p className="activity-sub">{item.type}</p>
                        </div>
                        <span className="activity-time">{timeAgo(item.created_at)}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default RecentActivities;
