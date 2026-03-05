import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
} from 'react-icons/md';
import './Sidebar.css';

const ALL_ROLES = ['admin', 'site_engineer', 'worker'];
const MGMT_ROLES = ['admin', 'site_engineer'];

const navItems = [
    { path: '/dashboard', label: 'Management Dashboard', icon: MdDashboard, roles: ['admin', 'site_engineer'] },
    { path: '/contractor-dashboard', label: 'Dashboard', icon: MdDashboard, roles: ['contractor'] },
    { path: '/attendance', label: 'Work Assignment', icon: MdAssignment, roles: ['admin', 'site_engineer'] },
    { path: '/workers', label: 'Workers', icon: MdPeople, roles: ['admin'] },
    { path: '/materials', label: 'Materials', icon: MdInventory2, roles: ['admin', 'site_engineer', 'contractor'] },
    { path: '/projects', label: 'Projects', icon: MdFolder, roles: ['admin', 'site_engineer'] },
    { path: '/tasks', label: 'Tasks', icon: MdAssignment, roles: ['admin', 'site_engineer', 'contractor'] },
    { path: '/invoices', label: 'Invoices', icon: MdReceipt, roles: ['admin'] },
    { path: '/reports', label: 'Reports', icon: MdBarChart, roles: ['admin'] },
    // Worker-only nav
    { path: '/worker-dashboard', label: 'My Dashboard', icon: MdDashboard, roles: ['worker'] },
];

const Sidebar = ({ isOpen, onToggle }) => {
    const { user, userRole, logout } = useAuth();
    const navigate = useNavigate();
    const role = userRole || 'admin';
    const visibleNavItems = navItems.filter((item) => item.roles.includes(role));

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const displayName = user?.user_metadata?.full_name || 'Project Manager';
    const displayRole = userRole
        ? userRole.charAt(0).toUpperCase() + userRole.slice(1).replace('_', ' ')
        : 'Admin';

    return (
        <>
            <button className="sidebar-toggle" onClick={onToggle}>
                {isOpen ? <MdClose /> : <MdMenu />}
            </button>
            <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onToggle}></div>
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <h1>Construction SMS</h1>
                        <p>Site Management System</p>
                    </div>
                    <div className="sidebar-lang-switcher">
                        <button className="lang-btn active">GB EN</button>
                        <button className="lang-btn">IN हि</button>
                        <button className="lang-btn">IN मर</button>
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
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="sidebar-logout-btn" onClick={handleLogout}>
                        <MdLogout className="nav-icon" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
