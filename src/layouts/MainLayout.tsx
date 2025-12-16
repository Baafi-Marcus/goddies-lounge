import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaBars, FaTimes, FaPhoneAlt, FaMapMarkerAlt, FaHome, FaUtensils, FaInfoCircle, FaEnvelope, FaFacebook, FaTiktok, FaTwitter, FaWhatsapp, FaUser, FaCalendarAlt } from 'react-icons/fa';
import { MdRestaurantMenu } from 'react-icons/md';
import logo from '../assets/logo.jpg';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import MobileBottomNav from '../components/MobileBottomNav';

const MainLayout: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { currentUser, userProfile } = useAuth();
    const location = useLocation();

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const navLinks = [
        { name: 'Home', path: '/', icon: <FaHome /> },
        { name: 'Menu', path: '/menu', icon: <MdRestaurantMenu /> },
        { name: 'About Us', path: '/about', icon: <FaInfoCircle /> },
        { name: 'Contact', path: '/contact', icon: <FaEnvelope /> },
    ];

    const userLinks = [
        { name: 'Menu', path: '/user/menu', icon: <MdRestaurantMenu /> },
        { name: 'Reservations', path: '/user/reservations', icon: <FaCalendarAlt /> },
        { name: 'Orders', path: '/user/orders', icon: <FaUtensils /> },
        { name: 'Profile', path: '/user/profile', icon: <FaUser /> },
        { name: 'My Cart', path: '/user/cart', icon: <FaShoppingCart /> },
    ];

    const isActive = (path: string) => location.pathname === path;
    const isHome = location.pathname === '/';
    const isLogin = location.pathname === '/login';
    const isTransparent = isHome || isLogin;
    const isUserPage = location.pathname.startsWith('/user');

    const currentLinks = isUserPage ? userLinks : navLinks;

    return (
        <div className="flex flex-col min-h-screen font-sans text-brand-dark">
            {/* Header */}
            <header className={`transition-all duration-300 z-50 ${isTransparent ? 'absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent pb-8' : 'sticky top-0 bg-brand-white shadow-md'}`}>
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    {/* Logo */}
                    <Link to={isUserPage ? "/user/menu" : "/"} className="flex flex-col items-center gap-1">
                        <img src={logo} alt="Goddies Lounge" className="h-16 w-auto object-contain rounded-md shadow-sm" />
                        <span className={`text-sm font-heading font-bold tracking-wide ${isTransparent ? 'text-white drop-shadow-md' : 'text-brand-dark'}`}>
                            Goddies <span className={`${isTransparent ? 'text-brand-yellow' : 'text-brand-red'}`}>Lounge & Wine Bar</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {currentLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`flex items-center gap-2 font-medium transition-colors duration-300 hover:text-brand-yellow ${isActive(link.path)
                                    ? (isTransparent ? 'text-brand-yellow font-bold' : 'text-brand-red font-bold')
                                    : (isTransparent ? 'text-white/90 hover:text-white' : 'text-gray-600 hover:text-brand-red')
                                    }`}
                            >
                                {link.icon}
                                <span>{link.name}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        {!isUserPage && (
                            <Link to="/user/menu" className="btn-primary shadow-lg border-2 border-transparent hover:border-white/20">
                                Order Now
                            </Link>
                        )}
                        {currentUser ? (
                            <div className="flex items-center gap-2 text-sm font-medium">
                                {/* "Hi, User" redundant link removed */}
                            </div>
                        ) : (
                            <Link to="/login" className={`text-sm font-bold ${isTransparent ? 'text-white' : 'text-brand-dark'} hover:text-brand-yellow`}>
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button - Only show on non-user pages */}
                    {!isUserPage && (
                        <button
                            className={`${isTransparent ? 'text-white' : 'text-brand-dark'} md:hidden focus:outline-none`}
                            onClick={toggleMenu}
                        >
                            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                        </button>
                    )}
                </div>

                {/* Mobile Nav - Only show on non-user pages */}
                {isMobileMenuOpen && !isUserPage && (
                    <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 shadow-lg absolute w-full left-0 text-brand-dark">
                        <nav className="flex flex-col gap-4">
                            {currentLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`flex items-center gap-2 font-medium py-2 border-b border-gray-50 ${isActive(link.path) ? 'text-brand-red' : 'text-gray-600'
                                        }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.icon}
                                    {link.name}
                                </Link>
                            ))}

                            <Link
                                to="/user/menu"
                                className="btn-primary text-center mt-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Order Now
                            </Link>
                        </nav>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className={`flex-grow ${isUserPage ? 'pb-20 md:pb-0' : ''}`}>
                <Outlet />
            </main>

            {/* Mobile Bottom Navigation - Only for user pages */}
            {isUserPage && <MobileBottomNav />}

            {/* Footer */}
            <footer className="bg-brand-dark text-white pt-16 pb-8">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                        {/* Column 1: Brand & Socials */}
                        <div>
                            <h3 className="text-2xl font-heading font-bold mb-6">
                                Goddies <span className="text-brand-yellow">Lounge</span>
                            </h3>
                            <p className="text-gray-400 mb-6 leading-relaxed">
                                Experience the best local and continental dishes in a cozy atmosphere. Where passion meets flavor.
                            </p>
                            <div className="flex items-center gap-4">
                                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-red hover:text-white transition-all duration-300 transform hover:scale-110">
                                    <FaFacebook size={18} />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-red hover:text-white transition-all duration-300 transform hover:scale-110">
                                    <FaTiktok size={18} />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-red hover:text-white transition-all duration-300 transform hover:scale-110">
                                    <FaTwitter size={18} />
                                </a>
                                <a href="https://wa.me/233545022181" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all duration-300 transform hover:scale-110">
                                    <FaWhatsapp size={18} />
                                </a>
                            </div>
                        </div>

                        {/* Column 2: Quick Links */}
                        <div>
                            <h4 className="text-lg font-bold mb-6 text-white border-b-2 border-brand-red inline-block pb-1">Quick Links</h4>
                            <ul className="space-y-3">
                                {navLinks.map((link) => (
                                    <li key={link.name}>
                                        <Link to={link.path} className="text-gray-400 hover:text-brand-yellow transition-colors flex items-center gap-2 group">
                                            <span className="w-1.5 h-1.5 rounded-full bg-brand-red opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                                <li>
                                    <Link to="/user/menu" className="text-gray-400 hover:text-brand-yellow transition-colors flex items-center gap-2 group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand-red opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                        Order Online
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/user/reservations" className="text-gray-400 hover:text-brand-yellow transition-colors flex items-center gap-2 group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand-red opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                        Book a Table
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Column 3: Contact Info */}
                        <div>
                            <h4 className="text-lg font-bold mb-6 text-white border-b-2 border-brand-red inline-block pb-1">Contact Us</h4>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3 text-gray-400">
                                    <FaMapMarkerAlt className="text-brand-red mt-1 flex-shrink-0" />
                                    <span>24th Goddies Street,<br />Akyem Asafo, Ghana</span>
                                </li>
                                <li className="flex items-start gap-3 text-gray-400">
                                    <FaPhoneAlt className="text-brand-red mt-1 flex-shrink-0" />
                                    <div className="flex flex-col">
                                        <a href="tel:0303980021" className="hover:text-white transition-colors">030 398 0021</a>
                                        <a href="tel:0545022181" className="hover:text-white transition-colors">054 502 2181</a>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 text-gray-400">
                                    <FaEnvelope className="text-brand-red mt-1 flex-shrink-0" />
                                    <a href="mailto:info@goddieslounge.com" className="hover:text-white transition-colors">info@goddieslounge.com</a>
                                </li>
                            </ul>
                        </div>

                        {/* Column 4: Opening Hours */}
                        <div>
                            <h4 className="text-lg font-bold mb-6 text-white border-b-2 border-brand-red inline-block pb-1">Opening Hours</h4>
                            <ul className="space-y-3">
                                <li className="flex justify-between items-center text-gray-400 border-b border-gray-800 pb-2">
                                    <span>Mon - Fri</span>
                                    <span className="text-brand-yellow font-medium">10:00 AM - 11:00 PM</span>
                                </li>
                                <li className="flex justify-between items-center text-gray-400 border-b border-gray-800 pb-2">
                                    <span>Saturday</span>
                                    <span className="text-brand-yellow font-medium">10:00 AM - 12:00 AM</span>
                                </li>
                                <li className="flex justify-between items-center text-gray-400 border-b border-gray-800 pb-2">
                                    <span>Sunday</span>
                                    <span className="text-brand-yellow font-medium">12:00 PM - 11:00 PM</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
                        <p>&copy; {new Date().getFullYear()} Goddies Lounge & Wine Bar. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
