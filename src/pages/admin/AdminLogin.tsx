import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';

const AdminLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock authentication
        if (email === 'admin@goddies.com' && password === 'admin123') {
            localStorage.setItem('adminAuth', 'true');
            navigate('/admin');
        } else {
            setError('Invalid email or password');
        }
    };

    return (
        <div className="min-h-screen bg-brand-dark flex items-center justify-center px-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-brand-red/10 text-brand-red rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaLock size={24} />
                    </div>
                    <h2 className="text-2xl font-heading font-bold text-brand-dark">Admin Login</h2>
                    <p className="text-gray-500">Sign in to manage the restaurant</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none"
                            placeholder="admin@goddies.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full btn-primary py-3 font-bold shadow-lg shadow-brand-red/30"
                    >
                        Sign In
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    <p>Demo Credentials:</p>
                    <p>Email: admin@goddies.com</p>
                    <p>Password: admin123</p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
