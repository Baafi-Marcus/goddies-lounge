import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaEye, FaMotorcycle, FaCheckCircle, FaClock, FaSpinner } from 'react-icons/fa';
import { generateVerificationCode, generateCustomerConfirmationCode } from '../../utils/qrCodeGenerator';
import { OrderService, RiderService, DeliveryService } from '../../services/neon';

interface Order {
    id: string;
    customer_name?: string;
    total_amount: number;
    status: string;
    created_at: string;
    items: any; // JSONB
    delivery_type: 'delivery' | 'pickup';
    user_id?: string;
    delivery_address?: string;
}

const ManageOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');

    // Rider Assignment State
    const [riders, setRiders] = useState<any[]>([]);
    const [assignModalOpen, setAssignModalOpen] = useState<string | null>(null); // orderId
    const [isAssigning, setIsAssigning] = useState(false);

    useEffect(() => {
        fetchOrders();
        fetchRiders();
        const interval = setInterval(fetchOrders, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await OrderService.getAllOrders();
            setOrders(data as Order[]);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRiders = async () => {
        try {
            const data = await RiderService.getAllRiders();
            const active = data.filter((r: any) => r.status === 'active');
            setRiders(active);
        } catch (error) {
            console.error("Failed to fetch riders", error);
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            // Optimistic update
            setOrders(orders.map(order =>
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
        setIsAssigning(true);
        try {
            const order = orders.find(o => o.id === orderId);
            if (!order) return;

            // 1. Create Delivery Record
            const deliveryData = {
                orderId: order.id,
                customerId: order.user_id,
                pickupLocation: 'Goodies Lounge, Accra',
                deliveryLocation: order.delivery_address || 'Unknown Address',
                deliveryFee: 15.00, // Standard Fee
                commissionRate: 0.1,
                commissionAmount: 1.50,
                riderEarning: 13.50,
                verificationCode: generateVerificationCode(),
                confirmationCode: generateCustomerConfirmationCode()
            };

            // Create delivery (returns array)
            const createdDeliveries = await DeliveryService.createDelivery(deliveryData);
            const newDelivery = createdDeliveries[0];

            if (newDelivery && newDelivery.id) {
                // 2. Assign the Rider
                await DeliveryService.assignRider(newDelivery.id, riderId);

                // 3. Update Order Status
                await OrderService.updateOrderStatus(orderId, 'assigned');

                // Refresh
                fetchOrders();
                setAssignModalOpen(null);
            }
        } catch (error) {
            console.error("Assignment failed", error);
            alert("Failed to assign rider. Please try again.");
        } finally {
            setIsAssigning(false);
        }
    };

    const filteredOrders = filterStatus === 'All'
        ? orders
        : orders.filter(order => order.status.toLowerCase() === filterStatus.toLowerCase());

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-700';
            case 'Preparing': return 'bg-blue-100 text-blue-700';
            case 'Ready': return 'bg-green-100 text-green-700';
            case 'assigned': return 'bg-indigo-100 text-indigo-700';
            case 'Delivered': return 'bg-gray-100 text-gray-700';
            case 'Cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-heading font-bold mb-8 text-brand-dark">Manage Orders</h1>

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['All', 'Pending', 'Preparing', 'Ready', 'assigned', 'Delivered', 'Cancelled'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${filterStatus === status
                            ? 'bg-brand-dark text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-10 text-gray-500 flex flex-col items-center">
                        <FaSpinner className="animate-spin text-3xl mb-2 text-brand-red" />
                        Loading orders...
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-gray-100">
                        No orders found.
                    </div>
                ) : filteredOrders.map((order) => {
                    // Helper: Format Items from JSONB
                    const itemsText = Array.isArray(order.items)
                        ? order.items.map((i: any) => `${i.name} x${i.quantity || 1}`).join(', ')
                        : 'Items data unavailable';

                    return (
                        <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-6 animate-fade-in text-brand-dark">
                            <div className="flex-grow">
                                <div className="flex items-center gap-4 mb-2">
                                    <span className="font-bold text-lg text-gray-800">#{order.id.slice(0, 8)}...</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(order.status)}`}>
                                        {order.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {new Date(order.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 mb-2">
                                    <span className="font-medium">{order.customer_name || 'Guest User'}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 text-sm uppercase font-bold text-brand-dark/70">
                                        {order.delivery_type === 'delivery' && <FaMotorcycle />} {order.delivery_type}
                                    </span>
                                </div>
                                <p className="text-gray-500 text-sm mb-2 line-clamp-2">
                                    {itemsText}
                                </p>
                                <p className="font-bold text-xl text-brand-red">₵{Number(order.total_amount).toFixed(2)}</p>
                            </div>

                            <div className="flex flex-col gap-2 min-w-[150px]">
                                {['pending'].includes(order.status.toLowerCase()) && (
                                    <button
                                        onClick={() => handleStatusChange(order.id, 'preparing')}
                                        className="btn-primary py-2 text-sm flex items-center justify-center gap-2"
                                    >
                                        <FaCheck /> Accept
                                    </button>
                                )}
                                {['preparing'].includes(order.status.toLowerCase()) && (
                                    <button
                                        onClick={() => handleStatusChange(order.id, 'ready')}
                                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium text-sm transition-colors"
                                    >
                                        Mark Ready
                                    </button>
                                )}

                                {/* Assign Rider for Ready Delivery Orders */}
                                {order.status.toLowerCase() === 'ready' && order.delivery_type === 'delivery' && (
                                    <button
                                        onClick={() => setAssignModalOpen(order.id)}
                                        className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FaUserPlus /> Assign Rider
                                    </button>
                                )}

                                {/* Logic for Delivery vs Pickup */}
                                {['ready'].includes(order.status.toLowerCase()) && order.delivery_type === 'pickup' && (
                                    <button
                                        onClick={() => handleStatusChange(order.id, 'delivered')}
                                        className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium text-sm transition-colors"
                                    >
                                        Complete Pickup
                                    </button>
                                )}

                                {['assigned', 'in_transit'].includes(order.status.toLowerCase()) && (
                                    <div className="text-xs text-center text-gray-500 bg-gray-50 py-2 rounded">
                                        Rider Assigned
                                    </div>
                                )}

                                {!['cancelled', 'delivered', 'assigned', 'in_transit'].includes(order.status.toLowerCase()) && (
                                    <button
                                        onClick={() => handleStatusChange(order.id, 'cancelled')}
                                        className="border border-red-200 text-red-500 hover:bg-red-50 py-2 rounded-lg font-medium text-sm transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Rider Assign Modal */}
            {assignModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setAssignModalOpen(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-2xl font-bold mb-4 text-brand-dark">Select a Rider</h3>
                        <p className="text-gray-500 text-sm mb-4">Assign a rider to this delivery.</p>

                        {riders.length === 0 ? (
                            <div className="text-center py-6">
                                <p className="text-red-500 font-medium">No active riders found</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-80 overflow-y-auto">
                                {riders.map((rider) => (
                                    <button
                                        key={rider.id}
                                        disabled={isAssigning}
                                        onClick={() => handleAssignRider(assignModalOpen, rider.id)}
                                        className="w-full text-left p-4 rounded-xl border hover:border-brand-yellow hover:bg-yellow-50 transition-all flex justify-between items-center group"
                                    >
                                        <div>
                                            <p className="font-bold text-gray-800 group-hover:text-brand-dark">{rider.name}</p>
                                            <p className="text-xs text-gray-500">{rider.phone}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">Active</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="mt-6">
                            <button
                                onClick={() => setAssignModalOpen(null)}
                                className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageOrders;
