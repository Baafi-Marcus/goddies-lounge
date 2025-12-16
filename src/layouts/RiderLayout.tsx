import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FaHome, FaMotorcycle, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useRider } from '../context/RiderContext';
import { useNavigate } from 'react-router-dom';
import MobileRiderNav from '../components/MobileRiderNav';
import logo from '../assets/logo.jpg';

const RiderLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentRider, logout } = useRider();

    const riderLinks = [
        { name: 'Dashboard', path: '/rider/dashboard', icon: <FaHome /> },
        { name: 'Deliveries', path: '/rider/deliveries', icon: <FaMotorcycle /> },
        { name: 'Profile', path: '/rider/profile', icon: <FaUser /> },
    ];

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = async () => {
        await logout();
        navigate('/rider/login');
    };

    return (
        <div className="flex flex-col min-h-screen font-sans text-brand-dark">
            {/* Desktop Header */}
            <header className="sticky top-0 bg-brand-white shadow-md z-50">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/rider/dashboard" className="flex flex-col items-center gap-1">
                        <img src={logo} alt="Goddies Lounge" className="h-16 w-auto object-contain rounded-md shadow-sm" />
                        <span className="text-sm font-heading font-bold tracking-wide text-brand-dark">
                            Goddies <span className="text-brand-red">Rider</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {riderLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`flex items-center gap-2 font-medium transition-colors duration-300 ${isActive(link.path)
                                        ? 'text-brand-red font-bold'
                                        : 'text-gray-600 hover:text-brand-red'
                                    }`}
                            >
                                {link.icon}
                                <span>{link.name}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        {currentRider && (
                            <>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">{currentRider.name}</p>
                                    <p className="text-xs text-gray-500">{currentRider.vehicleType}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                                >
                                    <FaSignOutAlt /> Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow pb-20 md:pb-0">
                <Outlet />
            </main>

            {/* Mobile Bottom Navigation */}
            <MobileRiderNav />
        </div>
    );
};

export default RiderLayout;
