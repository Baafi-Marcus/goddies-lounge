import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaUtensils, FaClipboardList, FaCalendarCheck, FaMotorcycle, FaUsers, FaSignOutAlt, FaBars, FaWineGlass } from 'react-icons/fa';

const AdminLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    // Mock authentication check (replace with real auth later)
    const isAuthenticated = localStorage.getItem('adminAuth') === 'true';

    if (!isAuthenticated) {
        // In a real app, we'd redirect here, but for now we'll handle it in the App router or Login page
        // navigate('/admin/login');
    }

    const handleLogout = () => {
        localStorage.removeItem('adminAuth');
        navigate('/admin/login');
    };

    const menuItems = [
        { name: 'Dashboard', path: '/admin', icon: <FaTachometerAlt /> },
        { name: 'Menu Items', path: '/admin/menu', icon: <FaUtensils /> },
        { name: 'Wines & Drinks', path: '/admin/wines', icon: <FaWineGlass /> },
        { name: 'Orders', path: '/admin/orders', icon: <FaClipboardList /> },
        { name: 'Reservations', path: '/admin/reservations', icon: <FaCalendarCheck /> },
        { name: 'Deliveries', path: '/admin/deliveries', icon: <FaMotorcycle /> },
        { name: 'Riders', path: '/admin/riders', icon: <FaMotorcycle /> },
        { name: 'Customers', path: '/admin/customers', icon: <FaUsers /> },
    ];

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside className={`bg-brand-dark text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
                <div className="p-4 flex items-center justify-between h-16 border-b border-gray-800">
                    {sidebarOpen && <span className="font-heading font-bold text-xl text-brand-yellow">Goddies Admin</span>}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white">
                        <FaBars />
                    </button>
                </div>

                <nav className="flex-grow py-4">
                    <ul className="space-y-1">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center gap-4 px-4 py-3 transition-colors ${location.pathname === item.path
                                        ? 'bg-brand-red text-white'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                        }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    {sidebarOpen && <span>{item.name}</span>}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-4 py-2 text-gray-400 hover:text-red-500 transition-colors w-full"
                    >
                        <FaSignOutAlt />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow overflow-y-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
