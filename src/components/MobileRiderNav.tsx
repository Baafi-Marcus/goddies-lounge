import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaMotorcycle, FaUser } from 'react-icons/fa';

interface NavItem {
    name: string;
    path: string;
    icon: React.ReactNode;
}

const MobileRiderNav: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Detect platform
    const isIOS = useMemo(() => {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    }, []);

    const navItems: NavItem[] = [
        { name: 'Deliveries', path: '/rider/deliveries', icon: <FaMotorcycle size={24} /> },
        { name: 'Profile', path: '/rider/profile', icon: <FaUser size={22} /> },
    ];

    const isActive = (path: string) => location.pathname === path;

    // Platform-specific styling
    const navBarClass = isIOS
        ? "md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-gray-200/50 shadow-lg"
        : "md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg";

    return (
        <nav className={navBarClass}>
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${active ? 'text-brand-red' : 'text-gray-500'
                                }`}
                        >
                            <div className={`transition-transform duration-200 ${active ? 'scale-110' : 'scale-100'}`}>
                                {item.icon}
                            </div>
                            <span className={`text-xs mt-1 font-medium ${active ? 'font-semibold' : 'font-normal'}`}>
                                {item.name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default MobileRiderNav;
