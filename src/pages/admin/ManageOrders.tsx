import React, { useState, useEffect } from 'react';
import { FaMotorcycle, FaClock, FaSpinner, FaCheck, FaUserPlus, FaSync, FaTimesCircle, FaMapMarkerAlt } from 'react-icons/fa';
import { generateVerificationCode, generateCustomerConfirmationCode } from '../../utils/qrCodeGenerator';
import { OrderService, RiderService, DeliveryService, LocationService } from '../../services/neon';
import { calculateCommission, calculateRiderEarning } from '../../utils/commissionCalculator';

interface Order {
    id: string;
    customer_name?: string;
    customer_phone?: string;
    total_amount: number;
    status: string;
    created_at: string;
    items: any;
    delivery_type: 'delivery' | 'pickup';
    user_id?: string;
    delivery_address?: string;
    verification_code?: string;
    confirmation_code?: string;
    pickup_time?: string;
}

interface Rider {
    id: string;
    name: string;
    phone?: string;
    status: string;
    registrationNumber: string;
    vehicleType: string;
    totalDeliveries: number;
    totalEarnings: number;
}

const ManageOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');

    // Rider Assignment State
    const [riders, setRiders] = useState<Rider[]>([]);
    const [assignModalOpen, setAssignModalOpen] = useState<string | null>(null); // orderId
    const [isAssigning, setIsAssigning] = useState(false);
    const [locations, setLocations] = useState<any[]>([]);

    useEffect(() => {
        fetchOrders();
        fetchRiders();
        fetchLocations();
        const interval = setInterval(fetchOrders, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchLocations = async () => {
        try {
            const data = await LocationService.getAllLocations();
            setLocations(data);
        } catch (error) {
            console.error("Failed to fetch locations", error);
        }
    };

    const fetchOrders = async () => {
        try {
            const data = await OrderService.getAllOrders();
            setOrders(data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRiders = async () => {
        try {
            const data = await RiderService.getAllRiders();
            const activeRiders = data.filter((r: any) => r.status === 'active' || r.status === 'online');
            setRiders(activeRiders);
        } catch (error) {
            console.error("Failed to fetch riders", error);
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            // Optimistic update
            setOrders(prev => prev.map(order =>
                order.id === id ? { ...order, status: newStatus } : order
            ));
            await OrderService.updateOrderStatus(id, newStatus);
            fetchOrders(); // Refresh to ensure sync
        } catch (error) {
            console.error("Failed to update status", error);
            fetchOrders(); // Revert on error
        }
    };

    const handleAssignRider = async (orderId: string, riderId: string) => {
        if (isAssigning) return;
        setIsAssigning(true);

        try {
            const order = orders.find(o => o.id === orderId);
            if (!order) return;

            // STRICT Check if already processed
            if (['assigned', 'offered', 'in_transit', 'delivered'].includes(order.status.toLowerCase())) {
                alert("This order is already being processed.");
                setAssignModalOpen(null);
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'offered' } : o)); // Force update local state if stale
                return;
            }

            // Calculate Fee
            let deliveryFee = 15.00;
            let foundLocationId = '';

            if (order.delivery_address) {
                const foundLocation = locations.find(loc =>
                    order.delivery_address!.toLowerCase().includes(loc.name.toLowerCase())
                );
                if (foundLocation) {
                    deliveryFee = foundLocation.price;
                    foundLocationId = foundLocation.id;
                }
            }

            const commissionAmount = calculateCommission(foundLocationId, deliveryFee, locations);
            const riderEarning = calculateRiderEarning(deliveryFee, commissionAmount);
            const commissionRate = deliveryFee > 0 ? commissionAmount / deliveryFee : 0;

            const deliveryData = {
                orderId: order.id,
                customerId: order.user_id,
                pickupLocation: 'Goddies Lounge & wine bar, Akim Asafo',
                deliveryLocation: order.delivery_address || 'Unknown Address',
                deliveryFee: deliveryFee,
                commissionRate: commissionRate,
                commissionAmount: commissionAmount,
                riderEarning: riderEarning,
                verificationCode: generateVerificationCode(),
                confirmationCode: generateCustomerConfirmationCode()
            };

            const newDelivery = await DeliveryService.createDelivery(deliveryData);

            if (newDelivery && newDelivery.id) {
                await DeliveryService.assignRider(newDelivery.id, riderId);

                // Optimistic Update
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'offered' } : o));

                setAssignModalOpen(null);
                fetchOrders();
            }
        } catch (error) {
            console.error("Assignment failed", error);
            alert("Failed to assign rider.");
        } finally {
            setIsAssigning(false);
        }
    };

    const filteredOrders = filterStatus === 'All'
        ? orders
        : orders.filter(order => order.status.toLowerCase() === filterStatus.toLowerCase());

    const getStatusColor = (status: string) => {
        const s = status ? status.toLowerCase() : '';
        switch (s) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'preparing': return 'bg-blue-100 text-blue-800';
            case 'ready': return 'bg-green-100 text-green-800';
            case 'offered': return 'bg-orange-100 text-orange-800';
            case 'assigned': return 'bg-indigo-100 text-indigo-800';
            case 'in_transit': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-gray-800 text-white';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-heading font-bold text-brand-dark">Manage Orders</h1>
                <button
                    onClick={fetchOrders}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                    disabled={loading}
                >
                    <FaSync className={`${loading ? 'animate-spin' : ''} `} /> Refresh
                </button>
            </div>


            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {['All', 'Pending', 'Preparing', 'Ready', 'Offered', 'Assigned', 'In Transit', 'Delivered', 'Cancelled'].map((status) => {
                    const isActive = filterStatus.toLowerCase() === status.toLowerCase().replace(' ', '_');
                    return (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status === 'All' ? 'All' : status.toLowerCase().replace(' ', '_'))}
                            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all border ${isActive
                                ? 'bg-brand-dark text-white border-brand-dark shadow-md'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'
                                }`}
                        >
                            {status}
                        </button>
                    );
                })}
            </div>

            {/* Orders List (Card Style) */}
            <div className="space-y-4">
                {loading ? (
                    <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                        <FaSpinner className="animate-spin text-2xl mb-2 text-brand-red mx-auto" />
                        <p className="text-gray-500">Loading orders...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                        <p className="text-gray-500">No orders found</p>
                    </div>
                ) : (
                    filteredOrders.map((order) => {
                        // Format Items
                        const itemsText = Array.isArray(order.items)
                            ? order.items.map((i: any) => `${i.name} x${i.quantity || 1}`).join(', ')
                            : 'Items data unavailable';

                        return (
                            <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                    <div className="flex-grow">

                                        {/* Status & ID */}
                                        <div className="flex items-center gap-4 mb-3">
                                            <span className="font-bold text-lg">Order #{order.id.slice(0, 8)}</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                            {order.delivery_type === 'pickup' && (
                                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase">Pickup</span>
                                            )}
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                            {/* Customer */}
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                    <FaUserPlus className="text-blue-500 text-xs" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{order.customer_name || 'Guest'}</p>
                                                    <p className="text-xs">{order.customer_phone || 'No phone'}</p>
                                                </div>
                                            </div>

                                            {/* Date */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                                                    <FaClock className="text-gray-400 text-xs" />
                                                </div>
                                                <p>{new Date(order.created_at).toLocaleString()}</p>
                                            </div>

                                            {/* Location (If Delivery) */}
                                            {order.delivery_type === 'delivery' && (
                                                <div className="flex items-start gap-3 md:col-span-2">
                                                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                                                        <FaMapMarkerAlt className="text-brand-red text-xs" />
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-800 font-medium">{order.delivery_address || 'No address provided'}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Scheduled Time */}
                                            {order.pickup_time && (
                                                <div className="flex items-start gap-3 md:col-span-2">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${order.delivery_type === 'pickup' ? 'bg-brand-yellow/20' : 'bg-green-50'}`}>
                                                        <FaClock className={order.delivery_type === 'pickup' ? 'text-brand-dark text-xs' : 'text-green-600 text-xs'} />
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-800 font-bold">
                                                            {order.delivery_type === 'pickup' ? 'Scheduled Pickup: ' : 'Requested Delivery: '}
                                                            {order.pickup_time}
                                                        </p>
                                                        <p className="text-xs text-gray-500 uppercase font-bold">
                                                            {order.delivery_type === 'pickup' ? 'at restaurant' : 'at customer location'}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Items */}
                                            <div className="md:col-span-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <p className="text-gray-800 font-medium">{itemsText}</p>
                                                <p className="text-brand-red font-bold mt-1 text-right">Total: ₵{Number(order.total_amount).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ACTIONS COLUMN */}
                                    <div className="flex flex-col gap-2 min-w-[160px] md:border-l md:pl-6 border-gray-100">

                                        {/* 1. Accept */}
                                        {order.status === 'pending' && (
                                            <button
                                                onClick={() => handleStatusChange(order.id, 'preparing')}
                                                className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <FaCheck /> Accept
                                            </button>
                                        )}

                                        {/* 2. Mark Ready */}
                                        {order.status === 'preparing' && (
                                            <button
                                                onClick={() => handleStatusChange(order.id, 'ready')}
                                                className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors"
                                            >
                                                Mark Ready
                                            </button>
                                        )}

                                        {/* 3. Assign Rider (Only if Ready & Delivery) */}
                                        {order.status === 'ready' && order.delivery_type === 'delivery' && (
                                            <button
                                                onClick={() => setAssignModalOpen(order.id)}
                                                disabled={isAssigning}
                                                className={`w-full py-2 bg-brand-dark text-white rounded-lg font-bold text-sm hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-dark/20 ${isAssigning ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {isAssigning ? <FaSpinner className="animate-spin" /> : <FaMotorcycle />}
                                                {isAssigning ? 'Processing...' : 'Assign Rider'}
                                            </button>
                                        )}

                                        {/* 4. Complete Pickup */}
                                        {order.status === 'ready' && order.delivery_type === 'pickup' && (
                                            <button
                                                onClick={() => handleStatusChange(order.id, 'delivered')}
                                                className="w-full py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition-colors"
                                            >
                                                Complete Pickup
                                            </button>
                                        )}

                                        {/* Rider Assigned Indication */}
                                        {['offered'].includes(order.status) && (
                                            <div className="w-full py-2 bg-orange-100 text-orange-800 rounded-lg font-bold text-sm text-center border border-orange-200">
                                                <FaClock className="inline mr-1" /> Offer Sent
                                            </div>
                                        )}

                                        {/* Cancel */}
                                        {!['cancelled', 'delivered', 'assigned', 'in_transit', 'offered'].includes(order.status) && (
                                            <button
                                                onClick={() => handleStatusChange(order.id, 'cancelled')}
                                                className="w-full py-2 text-red-500 hover:text-red-700 text-xs font-medium underline"
                                            >
                                                Cancel Order
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Rider Modal */}
            {assignModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setAssignModalOpen(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-brand-dark">Assign Rider</h3>
                            <button onClick={() => setAssignModalOpen(null)} className="text-gray-400 hover:text-gray-600">
                                <FaTimesCircle className="text-2xl" />
                            </button>
                        </div>

                        {riders.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No active riders available.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 overflow-y-auto flex-1 p-1">
                                {riders.map((rider) => (
                                    <button
                                        key={rider.id}
                                        disabled={isAssigning}
                                        onClick={() => handleAssignRider(assignModalOpen, rider.id)}
                                        className="w-full p-4 border border-gray-200 rounded-xl hover:border-brand-yellow hover:bg-yellow-50 transition-all text-left flex justify-between items-center group relative overflow-hidden"
                                    >
                                        {isAssigning && (
                                            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                                                <FaSpinner className="animate-spin text-brand-dark" />
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                                                <FaMotorcycle className="text-gray-400 group-hover:text-brand-dark transition-colors" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 group-hover:text-brand-dark">{rider.name}</p>
                                                <p className="text-xs text-gray-500">{rider.phone}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                                                Active
                                            </span>
                                            <p className="text-[10px] text-gray-400 mt-1">{rider.vehicleType}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-center text-xs text-gray-400">Selecting a rider will send them an offer.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageOrders;
