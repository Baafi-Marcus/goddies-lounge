import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRider } from '../../context/RiderContext';
import { FaMotorcycle, FaUser, FaLock, FaEnvelope, FaPhone } from 'react-icons/fa';

const RiderLogin: React.FC = () => {
    const navigate = useNavigate();
    const { login, addRider } = useRider();
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');

    // Login form
    const [loginData, setLoginData] = useState({
        registrationNumber: '',
        password: '',
    });

    // Registration form
    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        phone: '',
        vehicleType: 'motorcycle' as 'motorcycle' | 'bicycle' | 'car',
        vehicleNumber: '',
        password: '',
        confirmPassword: '',
        momoNumber: '',
        ghanaCardNumber: '',
        ghanaCardImage: '',
        selfieImage: ''
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'ghanaCardImage' | 'selfieImage') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setRegisterData(prev => ({ ...prev, [field]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const success = await login(loginData.registrationNumber, loginData.password);
        if (success) {
            navigate('/rider/dashboard');
        } else {
            setError('Invalid registration number or password');
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (registerData.password !== registerData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (registerData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (!registerData.ghanaCardImage || !registerData.selfieImage) {
            setError('Please upload both detailed Ghana Card image and a live selfie');
            return;
        }

        // Generate registration number
        const registrationNumber = `RDR${Date.now().toString().slice(-6)}`;

        await addRider({
            registrationNumber,
            name: registerData.name,
            email: registerData.email,
            phone: registerData.phone,
            vehicleType: registerData.vehicleType,
            vehicleNumber: registerData.vehicleNumber,
            password: registerData.password,
            status: 'inactive',
            momoNumber: registerData.momoNumber,
            ghanaCardNumber: registerData.ghanaCardNumber,
            ghanaCardImage: registerData.ghanaCardImage,
            selfieImage: registerData.selfieImage
        });

        alert(`Registration successful! Your registration number is: ${registrationNumber}\nPlease wait for admin verification and approval.`);
        setIsRegistering(false);
        setRegisterData({
            name: '',
            email: '',
            phone: '',
            vehicleType: 'motorcycle',
            vehicleNumber: '',
            password: '',
            confirmPassword: '',
            momoNumber: '',
            ghanaCardNumber: '',
            ghanaCardImage: '',
            selfieImage: ''
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-dark via-gray-900 to-brand-red flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                        <FaMotorcycle className="text-brand-yellow text-3xl" />
                        <h1 className="text-2xl font-heading font-bold text-white">Goddies Riders</h1>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setIsRegistering(false)}
                            className={`flex-1 py-4 font-bold transition-colors ${!isRegistering
                                ? 'bg-brand-yellow text-brand-dark'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setIsRegistering(true)}
                            className={`flex-1 py-4 font-bold transition-colors ${isRegistering
                                ? 'bg-brand-yellow text-brand-dark'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Register
                        </button>
                    </div>

                    <div className="p-8">
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        {!isRegistering ? (
                            // Login Form
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Registration Number
                                    </label>
                                    <div className="relative">
                                        <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={loginData.registrationNumber}
                                            onChange={(e) => setLoginData({ ...loginData, registrationNumber: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                                            placeholder="RDR001"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="password"
                                            value={loginData.password}
                                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                                            placeholder="••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-brand-red text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors"
                                >
                                    Login
                                </button>
                            </form>
                        ) : (
                            // Registration Form
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <div className="relative">
                                        <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={registerData.name}
                                            onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <div className="relative">
                                            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="email"
                                                value={registerData.email}
                                                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <div className="relative">
                                            <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={registerData.phone}
                                                onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                                        <select
                                            value={registerData.vehicleType}
                                            onChange={(e) => setRegisterData({ ...registerData, vehicleType: e.target.value as any })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                                        >
                                            <option value="motorcycle">🏍️ Motorcycle</option>
                                            <option value="bicycle">🚴 Bicycle</option>
                                            <option value="car">🚗 Car</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                                        <input
                                            type="text"
                                            value={registerData.vehicleNumber}
                                            onChange={(e) => setRegisterData({ ...registerData, vehicleNumber: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                                            placeholder="GR-1234-20"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                        <input
                                            type="password"
                                            value={registerData.password}
                                            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                        <input
                                            type="password"
                                            value={registerData.confirmPassword}
                                            onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Money Number</label>
                                        <input
                                            type="tel"
                                            value={registerData.momoNumber}
                                            onChange={(e) => setRegisterData({ ...registerData, momoNumber: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                                            placeholder="024..."
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ghana Card Number</label>
                                        <input
                                            type="text"
                                            value={registerData.ghanaCardNumber}
                                            onChange={(e) => setRegisterData({ ...registerData, ghanaCardNumber: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                                            placeholder="GHA-..."
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghana Card Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'ghanaCardImage')}
                                        className="w-full text-sm text-gray-500
                                          file:mr-4 file:py-2 file:px-4
                                          file:rounded-full file:border-0
                                          file:text-sm file:font-semibold
                                          file:bg-brand-yellow file:text-brand-dark
                                          hover:file:bg-yellow-400"
                                        required
                                    />
                                    {registerData.ghanaCardImage && <span className="text-xs text-green-600 ml-2">Image uploaded</span>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Live Selfie (For Verification)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="user" // Prompts camera on mobile
                                        onChange={(e) => handleImageUpload(e, 'selfieImage')}
                                        className="w-full text-sm text-gray-500
                                          file:mr-4 file:py-2 file:px-4
                                          file:rounded-full file:border-0
                                          file:text-sm file:font-semibold
                                          file:bg-brand-yellow file:text-brand-dark
                                          hover:file:bg-yellow-400"
                                        required
                                    />
                                    {registerData.selfieImage && <span className="text-xs text-green-600 ml-2">Image uploaded</span>}
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-brand-red text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors"
                                >
                                    Register & Request Approval
                                </button>

                                <p className="text-xs text-gray-500 text-center">
                                    Registration requires admin approval. You will be notified once verified.
                                </p>
                            </form>
                        )}
                    </div>
                </div>

                <div className="text-center mt-6">
                    <Link to="/" className="text-white/80 hover:text-white text-sm">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RiderLogin;
