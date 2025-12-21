import React from 'react';
import { useRider } from '../../context/RiderContext';
import { FaMotorcycle, FaBox, FaMoneyBillWave, FaCheckCircle, FaClock } from 'react-icons/fa';

const RiderDashboard: React.FC = () => {
    const { currentRider, deliveries, activeDelivery } = useRider();

    React.useEffect(() => {
        if (!currentRider) {
            // Redirect handled by RiderLayout
        }
    }, [currentRider]);

    if (!currentRider) return null;

    const myDeliveries = deliveries
        .filter(d => d.riderId === currentRider.id)
        .sort((a, b) => new Date(b.created_at || b.assignedAt || 0).getTime() - new Date(a.created_at || a.assignedAt || 0).getTime());
    const availableDeliveries = deliveries.filter(d => d.status === 'pending' && !d.riderId);
    const completedToday = myDeliveries.filter(d =>
        d.status === 'delivered' &&
        new Date(d.deliveredAt || '').toDateString() === new Date().toDateString()
    );

    // Calculate actual stats from delivery data
    const totalCompletedDeliveries = myDeliveries.filter(d => d.status === 'delivered').length;
    const totalEarnings = myDeliveries
        .filter(d => d.status === 'delivered')
        .reduce((sum, d) => sum + (Number(d.riderEarning) || 0), 0);

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-brand-yellow">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-brand-yellow/10 rounded-lg">
                                <FaBox className="text-brand-yellow text-2xl" />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Total Deliveries</p>
                                <p className="text-2xl font-bold text-brand-dark">{totalCompletedDeliveries}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500/10 rounded-lg">
                                <FaCheckCircle className="text-green-500 text-2xl" />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Today's Deliveries</p>
                                <p className="text-2xl font-bold text-brand-dark">{completedToday.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-brand-red">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-brand-red/10 rounded-lg">
                                <FaMoneyBillWave className="text-brand-red text-2xl" />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Total Earnings</p>
                                <p className="text-2xl font-bold text-brand-dark">₵{totalEarnings.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Delivery */}
                {activeDelivery && (
                    <div className="bg-gradient-to-r from-brand-yellow to-yellow-400 rounded-xl shadow-lg p-6 text-brand-dark">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <FaMotorcycle /> Active Delivery
                        </h2>
                        <div className="bg-white/90 rounded-lg p-4 space-y-2">
                            <p><strong>Order ID:</strong> {activeDelivery.orderId}</p>
                            <p><strong>Customer:</strong> {activeDelivery.customerName}</p>
                            <p><strong>Location:</strong> {activeDelivery.location}</p>
                            <p><strong>Address:</strong> {activeDelivery.deliveryAddress}</p>
                            <p><strong>Status:</strong> <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{activeDelivery.status}</span></p>
                            <button
                                onClick={() => navigate(`/rider/delivery/${activeDelivery.id}`)}
                                className="w-full mt-4 bg-brand-red text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors"
                            >
                                View Delivery Details
                            </button>
                        </div>
                    </div>
                )}

                {/* Available Deliveries */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold mb-4 text-brand-dark">Available Deliveries</h2>
                    {availableDeliveries.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No deliveries available at the moment</p>
                    ) : (
                        <div className="space-y-3">
                            {availableDeliveries.map(delivery => (
                                <div key={delivery.id} className="border border-gray-200 rounded-lg p-4 hover:border-brand-yellow transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-brand-dark">{delivery.location}</p>
                                            <p className="text-sm text-gray-600">{delivery.deliveryAddress}</p>
                                            <p className="text-sm text-gray-500 mt-1">Order Total: ₵{Number(delivery.orderTotal || 0).toFixed(2)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-green-600">₵{Number(delivery.riderEarning || 0).toFixed(2)}</p>
                                            <p className="text-xs text-gray-500">Your earning</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="text-xs text-gray-500 mt-4 text-center">
                        <FaClock className="inline mr-1" /> Deliveries are assigned by admin
                    </p>
                </div>

                {/* Recent Deliveries */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold mb-4 text-brand-dark">Recent Deliveries</h2>
                    {myDeliveries.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No delivery history yet</p>
                    ) : (
                        <div className="space-y-3">
                            {myDeliveries.slice(0, 5).map(delivery => (
                                <div key={delivery.id} className="border border-gray-100 rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-brand-dark">{delivery.location}</p>
                                            <p className="text-sm text-gray-600">{delivery.customerName}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {delivery.deliveryTime ? new Date(delivery.deliveryTime).toLocaleString() : 'In progress'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${delivery.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                delivery.status === 'in_transit' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {delivery.status}
                                            </span>
                                            <p className="text-sm font-bold text-gray-700 mt-1">₵{Number(delivery.riderEarning || 0).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RiderDashboard;
