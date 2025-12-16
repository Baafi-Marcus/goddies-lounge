import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaPhone, FaEnvelope, FaLock, FaCog, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, updateEmail, deleteUser } from 'firebase/auth';
import { UserService } from '../../services/neon';

const UserProfile: React.FC = () => {
    const { currentUser, userProfile, logout, loading } = useAuth();
    const navigate = useNavigate();

    // Settings state
    const [showSettings, setShowSettings] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Edit profile state
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPhone, setEditPhone] = useState('');

    // Password change state
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Messages
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');

    useEffect(() => {
        if (!loading && !currentUser) {
            navigate('/login');
        }
    }, [currentUser, loading, navigate]);

    useEffect(() => {
        if (userProfile) {
            setEditName(userProfile.full_name || '');
            setEditEmail(currentUser?.email || '');
            setEditPhone(userProfile.phone || '');
        }
    }, [userProfile, currentUser]);

    const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };

    const handleUpdateProfile = async () => {
        if (!userProfile?.id) return;

        try {
            // Update Neon database profile
            await UserService.updateUser(userProfile.id, {
                full_name: editName,
                phone: editPhone,
                email: editEmail,
            });

            // Update Firebase email if changed
            if (editEmail !== currentUser?.email && currentUser) {
                await updateEmail(currentUser, editEmail);
            }

            showMessage('Profile updated successfully!', 'success');
            setIsEditing(false);
            // Refresh page to show updated data
            window.location.reload();
        } catch (error: any) {
            console.error(error);
            showMessage('Failed to update profile. ' + error.message, 'error');
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            showMessage('Passwords do not match!', 'error');
            return;
        }

        if (!currentUser || !currentUser.email) return;

        try {
            const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
            await reauthenticateWithCredential(currentUser, credential);
            await updatePassword(currentUser, newPassword);

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

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            'Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.'
        );

        if (!confirmed) return;

        const doubleConfirm = window.prompt(
            'Type "DELETE" to confirm account deletion:'
        );

        if (doubleConfirm !== 'DELETE') {
            showMessage('Account deletion cancelled.', 'error');
            return;
        }

        try {
            // Delete user from Neon database
            if (userProfile?.id) {
                await UserService.deleteUser(userProfile.id);
            }

            // Delete Firebase Auth account
            if (currentUser) {
                await deleteUser(currentUser);
            }

            navigate('/');
        } catch (error: any) {
            console.error(error);
            showMessage('Failed to delete account. You may need to re-login and try again.', 'error');
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="bg-gray-50 min-h-screen pb-20 pt-10 px-4 font-sans">
            <div className="container mx-auto max-w-4xl">

                {/* Message Banner */}
                {message && (
                    <div className={`mb-6 p-4 rounded-xl ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message}
                    </div>
                )}

                {/* Profile Header */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-brand-dark text-white flex items-center justify-center text-4xl shadow-md">
                            <FaUser />
                        </div>

                        <div className="flex-grow text-center md:text-left">
                            <h1 className="text-3xl font-bold text-gray-900">{userProfile?.full_name || currentUser?.displayName || 'Valued Customer'}</h1>
                            <p className="text-gray-500 mt-2 flex flex-col md:flex-row items-center justify-center md:justify-start gap-4">
                                {userProfile?.phone && <span className="flex items-center gap-1"><FaPhone className="text-xs" /> {userProfile.phone}</span>}
                                {currentUser?.email && <span className="flex items-center gap-1"><FaEnvelope className="text-xs" /> {currentUser.email}</span>}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="px-6 py-3 bg-brand-red text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                                <FaCog /> Settings
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center gap-2"
                            >
                                <FaSignOutAlt /> Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Settings Panel */}
                {showSettings && (
                    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 mb-8 space-y-8">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <FaCog className="text-brand-red" /> Account Settings
                        </h2>

                        {/* Edit Profile Section */}
                        <div className="border-t border-gray-100 pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-800">Profile Information</h3>
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
                                            onClick={() => {
                                                setIsEditing(false);
                                                setEditName(userProfile?.full_name || '');
                                                setEditEmail(currentUser?.email || '');
                                                setEditPhone(userProfile?.phone || '');
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                                        >
                                            <FaTimes /> Cancel
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={editEmail}
                                        onChange={(e) => setEditEmail(e.target.value)}
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
                            </div>
                        </div>

                        {/* Change Password Section */}
                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FaLock className="text-brand-red" /> Change Password
                            </h3>

                            {!isChangingPassword ? (
                                <button
                                    onClick={() => setIsChangingPassword(true)}
                                    className="px-4 py-2 bg-brand-red text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                                >
                                    Change Password
                                </button>
                            ) : (
                                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
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

                        {/* Delete Account Section */}
                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
                                <FaTrash /> Danger Zone
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Once you delete your account, there is no going back. All your data will be permanently deleted.
                            </p>
                            <button
                                onClick={handleDeleteAccount}
                                className="px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                                <FaTrash /> Delete My Account
                            </button>
                        </div>
                    </div>
                )}

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link to="/user/orders" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <h3 className="font-bold text-lg text-gray-800 mb-2">My Orders</h3>
                        <p className="text-gray-500 text-sm">View and track your orders</p>
                    </Link>
                    <Link to="/user/reservations" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <h3 className="font-bold text-lg text-gray-800 mb-2">My Reservations</h3>
                        <p className="text-gray-500 text-sm">Manage table bookings</p>
                    </Link>
                    <Link to="/user/menu" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <h3 className="font-bold text-lg text-gray-800 mb-2">Browse Menu</h3>
                        <p className="text-gray-500 text-sm">Explore our delicious offerings</p>
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default UserProfile;
