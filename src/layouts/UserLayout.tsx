import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FaUtensils, FaWineGlass, FaCalendarAlt, FaShoppingBasket } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import logo from '../assets/logo.jpg';

const UserLayout: React.FC = () => {
    const location = useLocation();
    const { cartCount } = useCart();

    const navLinks = [
        { name: 'Menu', path: '/user/menu', icon: <FaUtensils /> },
        { name: 'Wine Bar', path: '/user/wine', icon: <FaWineGlass /> },
        { name: 'Reservations', path: '/user/reservations', icon: <FaCalendarAlt /> },
        { name: 'Cart', path: '/user/cart', icon: <FaShoppingBasket />, count: cartCount },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* User Navbar */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <Link to="/user/menu" className="flex items-center gap-2 group">
                        <img src={logo} alt="Goddies" className="h-10 w-auto rounded-md" />
                        <span className="font-heading font-bold text-brand-dark group-hover:text-brand-red transition-colors">
                            Goddies <span className="text-brand-red group-hover:text-brand-dark">Lounge & Wine Bar</span>
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${isActive(link.path)
                                    ? 'bg-brand-red text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {link.icon}
                                <span>{link.name}</span>
                                {link.count !== undefined && link.count > 0 && (
                                    <span className="bg-white text-brand-red text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                                        {link.count}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </nav>


                </div>

                {/* Mobile Bottom Nav - Liquid Glass Design */}
                <div className="md:hidden fixed bottom-6 left-6 right-6 bg-white/60 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-3xl flex justify-around py-4 px-4 z-50 animate-slide-up ring-1 ring-white/50">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`flex flex-col items-center gap-1 transition-all duration-300 relative ${isActive(link.path) ? 'text-brand-red scale-110' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <div className={`text-xl transition-all duration-300 ${isActive(link.path) ? 'drop-shadow-md' : ''}`}>
                                {link.icon}
                            </div>
                            <span className="text-[10px] font-medium">{link.name}</span>
                            {link.count !== undefined && link.count > 0 && (
                                <span className="absolute -top-1 -right-1 bg-brand-red text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm animate-bounce">
                                    {link.count}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow container mx-auto px-4 py-8 mb-16 md:mb-0">
                <Outlet />
            </main>
        </div>
    );
};

export default UserLayout;
