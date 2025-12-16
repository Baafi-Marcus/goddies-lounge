import React, { useState, useEffect } from 'react';
import { useRider } from '../../context/RiderContext';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaMotorcycle, FaLock, FaEdit, FaSave, FaTimes, FaSignOutAlt, FaToggleOn, FaToggleOff, FaCog, FaPhone, FaCar } from 'react-icons/fa';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../../services/firebase';

const RiderProfile: React.FC = () => {
    const { currentRider, logout } = useRider();
    const navigate = useNavigate();

    // Settings panel toggle
    const [showSettings, setShowSettings] = useState(false);

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editVehicleType, setEditVehicleType] = useState('');
    const [editVehicleNumber, setEditVehicleNumber] = useState('');

    // Password change state
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Availability
    const [isOnline, setIsOnline] = useState(true);

    // Messages
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');

    useEffect(() => {
        if (!currentRider) {
            navigate('/rider/login');
            return;
        }
        setEditName(currentRider.name || '');
        setEditPhone(currentRider.phone || '');
        setEditVehicleType(currentRider.vehicleType || '');
        setEditVehicleNumber(currentRider.registrationNumber || '');
    }, [currentRider, navigate]);

    const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };

    const handleUpdateProfile = async () => {
        // TODO: Implement profile update with backend
        showMessage('Profile updated successfully!', 'success');
        setIsEditing(false);
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            showMessage('Passwords do not match!', 'error');
            return;
        }

        try {
            const user = auth.currentUser;
            if (!user || !user.email) {
                showMessage('Not authenticated', 'error');
                return;
            }

            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);

            showMessage('Password updated successfully!', 'success');
            setIsChangingPassword(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error(error);
            showMessage('Failed to update password. Check your current password.', 'error');
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/rider/login');
    };

    const toggleOnlineStatus = () => {
        setIsOnline(!isOnline);
        showMessage(isOnline ? 'You are now offline' : 'You are now online', 'success');
    };

    if (!currentRider) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-10 px-4">
            <div className="container mx-auto max-w-3xl">
                {/* Message Banner */}
                {message && (
                    <div className={`mb-6 p-4 rounded-xl ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message}
                    </div>
                )}

                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-20 h-20 bg-brand-dark text-white rounded-full flex items-center justify-center text-3xl">
                            <FaUser />
                        </div>
                        <div className="flex-grow">
                            <h1 className="text-2xl font-bold text-gray-900">{currentRider.name}</h1>
                            <p className="text-gray-500 flex items-center gap-1 mt-1">
                                <FaPhone className="text-xs" /> {currentRider.phone}
                            </p>
                            <p className="text-gray-500 flex items-center gap-1 mt-1">
                                <FaCar className="text-xs" /> {currentRider.vehicleType} - {currentRider.registrationNumber}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="flex-1 px-4 py-3 bg-brand-red text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <FaCog /> Settings
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center gap-2"
                        >
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>
                </div>

                {/* Online Status Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 mb-1">Availability Status</h3>
                            <p className="text-sm text-gray-500">Accept new delivery requests</p>
                        </div>
                        <button
                            onClick={toggleOnlineStatus}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors ${isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                                }`}
                        >
                            {isOnline ? <FaToggleOn size={28} /> : <FaToggleOff size={28} />}
                            {isOnline ? 'Online' : 'Offline'}
                        </button>
                    </div>
                </div>

                {/* Settings Panel (Collapsible) */}
                {showSettings && (
                    <div className="space-y-6">
                        {/* Profile Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                                    >
                                        <FaEdit /> Edit
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleUpdateProfile}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg font-medium hover:bg-green-100 transition-colors"
                                        >
                                            <FaSave /> Save
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                                        >
                                            <FaTimes /> Cancel
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none disabled:bg-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={editPhone}
                                        onChange={(e) => setEditPhone(e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none disabled:bg-gray-100"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                                        <input
                                            type="text"
                                            value={editVehicleType}
                                            onChange={(e) => setEditVehicleType(e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none disabled:bg-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                                        <input
                                            type="text"
                                            value={editVehicleNumber}
                                            onChange={(e) => setEditVehicleNumber(e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none disabled:bg-gray-100"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Change Password */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FaLock className="text-brand-red" /> Change Password
                            </h2>

                            {!isChangingPassword ? (
                                <button
                                    onClick={() => setIsChangingPassword(true)}
                                    className="px-4 py-2 bg-brand-red text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                                >
                                    Change Password
                                </button>
                            ) : (
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-brand-red text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
                                        >
                                            Update Password
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsChangingPassword(false);
                                                setCurrentPassword('');
                                                setNewPassword('');
                                                setConfirmPassword('');
                                            }}
                                            className="px-4 py-2 text-gray-500 hover:text-gray-700"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RiderProfile;
