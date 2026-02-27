import './StatCard.css';

const StatCard = ({ label, value, subtitle, icon: Icon, iconBg, iconColor }) => {
    return (
        <div className="stat-card">
            <div className="stat-card-content">
                <p className="stat-label">{label}</p>
                <h3>{value}</h3>
                {subtitle && <p className="stat-subtitle">{subtitle}</p>}
            </div>
            <div
                className="stat-card-icon"
                style={{ background: iconBg || 'var(--icon-blue-bg)', color: iconColor || 'var(--icon-blue)' }}
            >
                {Icon && <Icon />}
            </div>
        </div>
    );
};

export default StatCard;
