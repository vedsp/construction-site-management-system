import { NavLink, useNavigate } from 'react-router-dom';
import nirmanLogo from '../../assets/nirman-logo.png';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
    MdDashboard,
    MdAccessTime,
    MdPeople,
    MdMap,
    MdInventory2,
    MdFolder,
    MdReceipt,
    MdBarChart,
    MdAutoAwesome,
    MdLogout,
    MdMenu,
    MdClose,
    MdPerson,
    MdAssignment,
    MdHowToReg,
} from 'react-icons/md';
import './Sidebar.css';

const navItems = [
    { path: '/dashboard', labelKey: 'management_dashboard', icon: MdDashboard, roles: ['admin', 'site_engineer'] },
    { path: '/contractor-dashboard', labelKey: 'dashboard', icon: MdDashboard, roles: ['contractor'] },
    { path: '/attendance', labelKey: 'work_assignment', icon: MdAssignment, roles: ['admin', 'site_engineer'] },
    { path: '/workers', labelKey: 'workers', icon: MdPeople, roles: ['admin'] },
    { path: '/materials', labelKey: 'materials', icon: MdInventory2, roles: ['admin', 'site_engineer', 'contractor'] },
    { path: '/projects', labelKey: 'projects', icon: MdFolder, roles: ['admin', 'site_engineer'] },
    { path: '/tasks', labelKey: 'tasks', icon: MdAssignment, roles: ['admin', 'site_engineer', 'contractor'] },
    { path: '/invoices', labelKey: 'invoices', icon: MdReceipt, roles: ['admin'] },
    { path: '/reports', labelKey: 'reports', icon: MdBarChart, roles: ['admin'] },
    { path: '/workforce-attendance', labelKey: 'workforce_attendance', icon: MdAccessTime, roles: ['admin', 'site_engineer'] },
    { path: '/daily-progress', labelKey: 'daily_progress', icon: MdMap, roles: ['admin', 'site_engineer'] },
    { path: '/site-map', labelKey: 'site_map', icon: MdMap, roles: ['admin', 'site_engineer'] },
    { path: '/user-approvals', labelKey: 'user_approvals', icon: MdHowToReg, roles: ['admin'] },
    // Worker-only nav
    { path: '/worker-dashboard', labelKey: 'my_dashboard', icon: MdDashboard, roles: ['worker'] },
];

const Sidebar = ({ isOpen, onToggle }) => {
    const { user, userRole, logout } = useAuth();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const role = userRole || 'admin';
    const visibleNavItems = navItems.filter((item) => item.roles.includes(role));

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const displayName = user?.user_metadata?.full_name || t('roles.admin');
    const displayRole = userRole
        ? t(`roles.${userRole}`)
        : t('roles.admin');

    return (
        <>
            <button className="sidebar-toggle" onClick={onToggle}>
                {isOpen ? <MdClose /> : <MdMenu />}
            </button>
            <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onToggle}></div>
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <h1>{t('sidebar.brand')}</h1>
                        <p>{t('sidebar.tagline')}</p>
                    </div>
                    <div className="sidebar-lang-switcher">
                        <button 
                            className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
                            onClick={() => changeLanguage('en')}
                        >GB EN</button>
                        <button 
                            className={`lang-btn ${i18n.language === 'hi' ? 'active' : ''}`}
                            onClick={() => changeLanguage('hi')}
                        >IN हि</button>
                        <button 
                            className={`lang-btn ${i18n.language === 'mr' ? 'active' : ''}`}
                            onClick={() => changeLanguage('mr')}
                        >IN मर</button>
                    </div>
                </div>

                <div className="sidebar-user">
                    <div className="sidebar-user-avatar">
                        <MdPerson />
                    </div>
                    <div className="sidebar-user-info">
                        <h3>{displayName}</h3>
                        <p>{displayRole}</p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {visibleNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `sidebar-nav-item ${isActive ? 'active' : ''}`
                            }
                            onClick={() => onToggle && window.innerWidth <= 768 && onToggle()}
                        >
                            <item.icon className="nav-icon" />
                            <span>{t(`sidebar.${item.labelKey}`)}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="sidebar-logout-btn" onClick={handleLogout}>
                        <MdLogout className="nav-icon" />
                        <span>{t('sidebar.logout')}</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
