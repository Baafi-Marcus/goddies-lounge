import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DeliveryService } from '../../services/neon';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaHistory, FaSignOutAlt, FaPhone, FaEnvelope, FaLock, FaBoxOpen } from 'react-icons/fa';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../../services/firebase';

interface Delivery {
    id: string;
    created_at: string;
    status: string;
    total_amount?: number;
    order_details?: any;
    delivery_fee: number;
}

const UserProfile: React.FC = () => {
    const { currentUser, userProfile, logout, loading } = useAuth();
    const navigate = useNavigate();
    const [deliveries, setDeliveries] = useState<any[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);

    // Password Change State
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage('');
        if (!currentUser || !currentUser.email) return;

        try {
            // Re-authenticate first
            const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
            await reauthenticateWithCredential(currentUser, credential);

            // Update password
            await updatePassword(currentUser, newPassword);
            setPasswordMessage('Password updated successfully!');
            setIsChangingPassword(false);
            setCurrentPassword('');
            setNewPassword('');
        } catch (error: any) {
            console.error(error);
            setPasswordMessage('Failed to update password. Check your current password.');
        }
    };

    useEffect(() => {
        if (!loading && !currentUser) {
            navigate('/login');
        }
    }, [currentUser, loading, navigate]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (userProfile?.id) {
                setIsLoadingOrders(true);
                try {
                    const data = await DeliveryService.getDeliveriesByCustomerId(userProfile.id);
                    setDeliveries(data);
                } catch (error) {
                    console.error("Failed to fetch orders:", error);
                } finally {
                    setIsLoadingOrders(false);
                }
            }
        };

        if (userProfile?.id) {
            fetchOrders();
        }
    }, [userProfile]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="bg-gray-50 min-h-screen pb-20 pt-24 font-sans">
            <div className="container mx-auto px-4 max-w-5xl">

                {/* Profile Header */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                    <div className="w-24 h-24 rounded-full bg-brand-dark text-white flex items-center justify-center text-4xl shadow-md z-10">
                        <FaUser />
                    </div>

                    <div className="flex-grow text-center md:text-left z-10">
                        <h1 className="text-3xl font-bold text-gray-900">{userProfile?.full_name || currentUser?.displayName || 'Valued Customer'}</h1>
                        <p className="text-gray-500 mt-1 flex items-center justify-center md:justify-start gap-4">
                            {userProfile?.phone && <span className="flex items-center gap-1"><FaPhone className="text-xs" /> {userProfile.phone}</span>}
                            {currentUser?.email && <span className="flex items-center gap-1"><FaEnvelope className="text-xs" /> {currentUser.email}</span>}
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center gap-2 z-10"
                    >
                        <FaSignOutAlt /> Sign Out
                    </button>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Sidebar / Stats */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-500 text-sm uppercase tracking-wider mb-4">Account Overview</h3>
                            <div className="flex items-center justify-between py-3 border-b border-gray-50">
                                <span className="text-gray-700 font-medium">Total Orders</span>
                                <span className="text-xl font-bold text-brand-dark">{deliveries.length}</span>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <span className="text-gray-700 font-medium">Member Since</span>
                                <span className="text-brand-dark">{userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'Recently'}</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FaLock className="text-brand-red" />
                                Security
                            </h2>
                            {!isChangingPassword ? (
                                <button
                                    onClick={() => setIsChangingPassword(true)}
                                    className="text-brand-red hover:text-red-700 font-medium underline"
                                >
                                    Change Password
                                </button>
                            ) : (
                                <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
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
                                    <div className="flex gap-3">
                                        <button
                                            type="submit"
                                            className="bg-brand-red text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors"
                                        >
                                            Update Password
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsChangingPassword(false);
                                                setCurrentPassword('');
                                                setNewPassword('');
                                                setPasswordMessage('');
                                            }}
                                            className="text-gray-500 hover:text-gray-700 px-4 py-2"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                            {passwordMessage && <p className={`mt-4 text-sm font-medium ${passwordMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>{passwordMessage}</p>}
                        </div>
                    </div>

                    {/* Order History */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <FaHistory className="text-brand-red" /> Order History
                        </h2>

                        {isLoadingOrders ? (
                            <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red"></div></div>
                        ) : deliveries.length > 0 ? (
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                {deliveries.map((order) => (
                                    <div key={order.id} className="p-6 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                                        ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                order.status === 'in_transit' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                                        {order.status.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-gray-400 text-sm">{new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <h4 className="font-bold text-lg text-gray-800">Delivery #{order.id.slice(0, 8)}</h4>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-xl text-brand-dark">₵{(Number(order.delivery_fee) + (Number(order.total) || 0)).toFixed(2)}</p>
                                                <p className="text-xs text-gray-400">Total Paid</p>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-xl p-4 flex flex-col md:flex-row gap-4 text-sm text-gray-600">
                                            <div className="flex-1">
                                                <span className="block text-xs font-bold text-gray-400 uppercase mb-1">Pickup</span>
                                                {order.pickup_location}
                                            </div>
                                            <div className="hidden md:block w-px bg-gray-200"></div>
                                            <div className="flex-1">
                                                <span className="block text-xs font-bold text-gray-400 uppercase mb-1">Destination</span>
                                                {order.delivery_location}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6 text-gray-400 text-4xl">
                                    <FaBoxOpen />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h3>
                                <p className="text-gray-500 mb-8">Looks like you haven't placed any orders yet.</p>
                                <button onClick={() => navigate('/user/menu')} className="btn-primary">
                                    Start Ordering
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default UserProfile;
