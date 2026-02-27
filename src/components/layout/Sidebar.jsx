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

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: MdDashboard },
    { path: '/attendance', label: 'Attendance', icon: MdAccessTime },
    { path: '/workers', label: 'Workers', icon: MdPeople },
    { path: '/materials', label: 'Materials', icon: MdInventory2 },
    { path: '/projects', label: 'Projects', icon: MdFolder },
    { path: '/tasks', label: 'Tasks', icon: MdAssignment },
    { path: '/invoices', label: 'Invoices', icon: MdReceipt },
    { path: '/reports', label: 'Reports', icon: MdBarChart },
];

const Sidebar = ({ isOpen, onToggle }) => {
    const { user, userRole, logout } = useAuth();
    const navigate = useNavigate();

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
                    {navItems.map((item) => (
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
