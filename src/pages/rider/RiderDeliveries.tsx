import React, { useEffect, useState } from 'react';
import { useRider } from '../../context/RiderContext';
import { DeliveryService } from '../../services/neon';
import { FaMotorcycle, FaMapMarkerAlt, FaPhone, FaClock, FaCheckCircle, FaHistory, FaBox, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const RiderDeliveries: React.FC = () => {
    const { currentRider } = useRider();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'requests' | 'active' | 'history'>('requests');
    const [deliveries, setDeliveries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Cancel Modal State
    const [cancelModalOpen, setCancelModalOpen] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

    const loadData = async () => {
        try {
            if (!currentRider?.id) return;
            const data = await DeliveryService.getDeliveriesByRiderId(currentRider.id);
            setDeliveries(data);
        } catch (error) {
            console.error("Failed to load deliveries", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!currentRider) {
            navigate('/rider/login');
            return;
        }
        loadData();
        const interval = setInterval(loadData, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [currentRider, navigate]);

    const activeDeliveries = deliveries.filter(d => ['assigned', 'in_transit'].includes(d.status));
    // 'offered' is the specific status for new requests
    const requestedDeliveries = deliveries.filter(d => ['offered'].includes(d.status));
    const pastDeliveries = deliveries.filter(d => ['delivered', 'cancelled'].includes(d.status))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const totalEarnings = pastDeliveries
        .filter(d => d.status === 'delivered')
        .reduce((sum, d) => sum + Number(d.riderEarning || d.rider_earning || 0), 0);

    const totalCompleted = pastDeliveries.filter(d => d.status === 'delivered').length;

    const handleAcceptDelivery = async (deliveryId: string) => {
        if (!currentRider) return;
        try {
            await DeliveryService.acceptDeliveryOffer(deliveryId, currentRider.id);
            await loadData(); // Refresh immediately
            // Don't auto-switch to active tab - allow accepting multiple
        } catch (error) {
            console.error("Failed to accept", error);
            alert("Failed to accept delivery. It might have been taken or cancelled.");
        }
    };

    const handleCancelDelivery = async () => {
        if (!cancelModalOpen || !cancelReason.trim()) {
            alert("Please provide a reason for cancellation");
            return;
        }

        setIsCancelling(true);
        try {
            // Call API to cancel delivery with reason
            await DeliveryService.cancelDelivery(cancelModalOpen, cancelReason);
            await loadData();
            setCancelModalOpen(null);
            setCancelReason('');
            alert("Delivery cancelled successfully");
        } catch (error) {
            console.error("Failed to cancel delivery", error);
            alert("Failed to cancel delivery. Please try again.");
        } finally {
            setIsCancelling(false);
        }
    };

    const handleContinueDelivery = (deliveryId: string) => {
        navigate(`/rider/active/${deliveryId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Rider Stats Summary */}
            <div className="px-6 pt-8">
                <div className="bg-brand-dark rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                    <div className="relative z-10 flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-white/60 text-xs font-bold uppercase tracking-wider">Total Earnings</p>
                            <p className="text-4xl font-black">₵{totalEarnings.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                            <div className="bg-white/10 px-3 py-2 rounded-2xl backdrop-blur-md inline-block">
                                <p className="text-[10px] text-white/60 font-bold uppercase">Total Orders</p>
                                <p className="text-xl font-black leading-none mt-1">{totalCompleted}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-6 mb-6">
                <div className="bg-white p-1 rounded-xl shadow-sm flex text-center">
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'requests' ? 'bg-brand-dark text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Requests
                        {requestedDeliveries.length > 0 && <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{requestedDeliveries.length}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'active' ? 'bg-brand-dark text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Active
                        {activeDeliveries.length > 0 && <span className="ml-1 bg-brand-yellow text-brand-dark text-[10px] px-1.5 py-0.5 rounded-full">{activeDeliveries.length}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'history' ? 'bg-brand-dark text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        History
                    </button>
                </div>
            </div>

            <div className="px-6 space-y-4">

                {/* REQUESTS TAB */}
                {activeTab === 'requests' && (
                    <div className="space-y-4">
                        {requestedDeliveries.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100 flex flex-col items-center">
                                <FaBox className="text-4xl mb-3 opacity-20" />
                                <p>No new requests</p>
                            </div>
                        ) : (
                            requestedDeliveries.map(delivery => (
                                <div key={delivery.id} className="bg-white p-5 rounded-2xl shadow-sm border border-brand-yellow/50 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-brand-yellow text-xs font-bold px-3 py-1 rounded-bl-xl text-brand-dark shadow-sm">
                                        NEW REQUEST
                                    </div>
                                    <div className="flex justify-between items-start mb-4 mt-2">
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase">Pickup</p>
                                            <p className="font-bold text-gray-800 text-sm">{delivery.pickupLocation || delivery.pickup_location}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400 font-bold uppercase">You Earn</p>
                                            <p className="font-bold text-green-600 text-lg">₵{Number(delivery.riderEarning || delivery.rider_earning).toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="h-8 w-0.5 bg-gray-200 mx-1"></div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase">Dropoff</p>
                                            <p className="font-medium text-gray-700 text-sm line-clamp-2">{delivery.deliveryLocation || delivery.delivery_location}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleAcceptDelivery(delivery.id)}
                                        className="w-full bg-brand-dark text-white py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <FaCheckCircle /> ACCEPT DELIVERY
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* ACTIVE TAB */}
                {activeTab === 'active' && (
                    <div className="space-y-4">
                        {activeDeliveries.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100 flex flex-col items-center">
                                <FaMotorcycle className="text-4xl mb-3 opacity-20" />
                                <p>No active deliveries</p>
                            </div>
                        ) : (
                            activeDeliveries.map(delivery => (
                                <div key={delivery.id} className="bg-white p-5 rounded-2xl shadow-md border border-brand-dark/10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border border-green-200">
                                                {delivery.status.replace('_', ' ')}
                                            </span>
                                            <span className="text-xs text-gray-400 font-mono">#{delivery.id.slice(0, 6)}</span>
                                        </div>
                                        <p className="font-bold text-brand-dark">₵{Number(delivery.riderEarning || delivery.rider_earning).toFixed(2)}</p>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Pickup</p>
                                            <p className="text-sm font-medium text-gray-800">{delivery.pickupLocation || delivery.pickup_location}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Dropoff</p>
                                            <p className="text-sm font-medium text-gray-800">{delivery.deliveryLocation || delivery.delivery_location}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleContinueDelivery(delivery.id)}
                                            className="flex-1 bg-brand-yellow text-brand-dark py-3 rounded-xl font-bold text-sm shadow-sm hover:bg-yellow-400 transition-colors"
                                        >
                                            CONTINUE / VERIFY
                                        </button>
                                        <button
                                            onClick={() => setCancelModalOpen(delivery.id)}
                                            className="px-4 bg-red-50 text-red-600 rounded-xl font-bold text-sm border border-red-200 hover:bg-red-100 transition-colors flex items-center gap-1"
                                        >
                                            <FaTimes /> Cancel
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* HISTORY TAB */}
                {activeTab === 'history' && (
                    <div className="space-y-4">
                        {pastDeliveries.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100 flex flex-col items-center">
                                <FaHistory className="text-4xl mb-3 opacity-20" />
                                <p>No delivery history</p>
                            </div>
                        ) : (
                            pastDeliveries.map(delivery => (
                                <div key={delivery.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${delivery.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {delivery.status}
                                            </span>
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <FaClock className="text-[10px]" /> {new Date(delivery.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 line-clamp-1 max-w-[200px]">{delivery.deliveryLocation || delivery.delivery_location}</p>
                                    </div>
                                    <p className="font-bold text-gray-800">₵{Number(delivery.riderEarning || delivery.rider_earning).toFixed(2)}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}

            </div>

            {/* Cancel Modal */}
            {cancelModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setCancelModalOpen(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <FaExclamationTriangle className="text-red-600 text-xl" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Cancel Delivery</h3>
                                <p className="text-sm text-gray-500">Please provide a reason</p>
                            </div>
                        </div>

                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Enter cancellation reason (e.g., vehicle breakdown, emergency, etc.)"
                            className="w-full border border-gray-300 rounded-xl p-3 text-sm resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            rows={4}
                        />

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setCancelModalOpen(null);
                                    setCancelReason('');
                                }}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                disabled={isCancelling}
                            >
                                Keep Delivery
                            </button>
                            <button
                                onClick={handleCancelDelivery}
                                disabled={isCancelling || !cancelReason.trim()}
                                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RiderDeliveries;
