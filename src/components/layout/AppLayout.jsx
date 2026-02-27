import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './AppLayout.css';

const AppLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);

    return (
        <div className="app-layout">
            <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
            <main className="app-main">
                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;
