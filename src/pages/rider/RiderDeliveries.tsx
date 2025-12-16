import React, { useEffect, useState } from 'react';
import { useRider } from '../../context/RiderContext';
import { DeliveryService } from '../../services/neon';
import { FaMotorcycle, FaMapMarkerAlt, FaPhone, FaClock, FaCheckCircle, FaHistory } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const RiderDeliveries: React.FC = () => {
    const { currentRider } = useRider();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'available' | 'recent'>('available');
    const [availableDeliveries, setAvailableDeliveries] = useState<any[]>([]);
    const [recentDeliveries, setRecentDeliveries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentRider) {
            navigate('/rider/login');
            return;
        }
        fetchDeliveries();
        const interval = setInterval(fetchDeliveries, 5000);
        return () => clearInterval(interval);
    }, [currentRider]);

    const fetchDeliveries = async () => {
        try {
            if (!currentRider?.id) return;

            // Get all deliveries for available tab
            const allDeliveries = await DeliveryService.getAllDeliveries();

            // Available: pending status and no rider assigned
            const available = allDeliveries.filter((d: any) =>
                d.status === 'pending' && !d.rider_id
            );

            // Recent: Get rider's delivery history
            const riderDeliveries = await DeliveryService.getDeliveriesByRiderId(currentRider.id);

            // Filter for completed/cancelled only
            const recent = riderDeliveries.filter((d: any) =>
                ['delivered', 'cancelled'].includes(d.status)
            );

            setAvailableDeliveries(available);
            setRecentDeliveries(recent);
        } catch (error) {
            console.error('Failed to fetch deliveries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptDelivery = async (deliveryId: string) => {
        if (!currentRider) return;

        try {
            await DeliveryService.assignRider(deliveryId, currentRider.id);
            fetchDeliveries();
            navigate(`/rider/active/${deliveryId}`);
        } catch (error) {
            console.error('Failed to accept delivery:', error);
            alert('Failed to accept delivery. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
            </div>
        );
    }

    const deliveriesToShow = activeTab === 'available' ? availableDeliveries : recentDeliveries;

    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-10 px-4">
            <div className="container mx-auto max-w-4xl">
                <h1 className="text-3xl font-heading font-bold text-brand-dark mb-8">Deliveries</h1>

                {/* Tab Navigation */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
                        <button
                            onClick={() => setActiveTab('available')}
                            className={`px-6 py-3 rounded-md font-medium transition-all ${activeTab === 'available'
                                ? 'bg-brand-red text-white shadow-md'
                                : 'text-gray-600 hover:text-brand-red'
                                }`}
                        >
                            <FaMotorcycle className="inline mr-2" />
                            Available ({availableDeliveries.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('recent')}
                            className={`px-6 py-3 rounded-md font-medium transition-all ${activeTab === 'recent'
                                ? 'bg-brand-red text-white shadow-md'
                                : 'text-gray-600 hover:text-brand-red'
                                }`}
                        >
                            <FaHistory className="inline mr-2" />
                            Recent ({recentDeliveries.length})
                        </button>
                    </div>
                </div>

                {/* Deliveries List */}
                {deliveriesToShow.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <FaMotorcycle className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            {activeTab === 'available' ? 'No Available Deliveries' : 'No Recent Deliveries'}
                        </h2>
                        <p className="text-gray-500">
                            {activeTab === 'available'
                                ? 'Check back soon for new delivery requests'
                                : "You haven't completed any deliveries yet"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {deliveriesToShow.map((delivery) => (
                            <div key={delivery.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">
                                                Delivery #{delivery.id.slice(0, 8)}
                                            </h3>
                                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                <FaClock /> {new Date(delivery.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-2xl text-brand-red">₵{Number(delivery.delivery_fee).toFixed(2)}</p>
                                            {activeTab === 'recent' && (
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 ${delivery.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {delivery.status.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Locations */}
                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                <FaMapMarkerAlt className="text-blue-600 text-sm" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-bold uppercase">Pickup</p>
                                                <p className="text-gray-900 font-medium">{delivery.pickup_location}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                <FaMapMarkerAlt className="text-green-600 text-sm" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-bold uppercase">Delivery</p>
                                                <p className="text-gray-900 font-medium">{delivery.delivery_location}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    {delivery.customer_phone && (
                                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Customer</p>
                                            <a
                                                href={`tel:${delivery.customer_phone}`}
                                                className="flex items-center gap-2 text-brand-red font-medium hover:underline"
                                            >
                                                <FaPhone /> {delivery.customer_phone}
                                            </a>
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    {activeTab === 'available' && (
                                        <button
                                            onClick={() => handleAcceptDelivery(delivery.id)}
                                            className="w-full py-3 bg-brand-red text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <FaCheckCircle /> Accept Delivery
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RiderDeliveries;
