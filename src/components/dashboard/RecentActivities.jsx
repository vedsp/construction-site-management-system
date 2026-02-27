import { MdCheckCircle, MdWarning, MdAssignment, MdSchedule } from 'react-icons/md';
import { demoNotifications } from '../../services/demoData';
import './RecentActivities.css';

const iconMap = {
    check: { Icon: MdCheckCircle, className: 'check' },
    warning: { Icon: MdWarning, className: 'warning' },
    task: { Icon: MdAssignment, className: 'task' },
    clock: { Icon: MdSchedule, className: 'clock' },
};

const RecentActivities = () => {
    return (
        <div className="recent-activities">
            <h3>Recent Activities</h3>
            {demoNotifications.map((item) => {
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
                        <span className="activity-time">{item.time}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default RecentActivities;
