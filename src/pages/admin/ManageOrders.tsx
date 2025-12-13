import React, { useState, useEffect } from 'react';
import { FaEye, FaCheck, FaTimes, FaMotorcycle, FaSpinner } from 'react-icons/fa';
import { OrderService } from '../../services/neon';

interface Order {
    id: string;
    customer_name?: string;
    total_amount: number;
    status: string;
    created_at: string;
    items: any; // JSONB
    delivery_type: 'delivery' | 'pickup';
}

const ManageOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

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

    const filteredOrders = filterStatus === 'All'
        ? orders
        : orders.filter(order => order.status.toLowerCase() === filterStatus.toLowerCase());

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-700';
            case 'Preparing': return 'bg-blue-100 text-blue-700';
            case 'Ready': return 'bg-green-100 text-green-700';
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
                {['All', 'Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'].map((status) => (
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

                                {/* Logic for Delivery vs Pickup */}
                                {['ready', 'assigned', 'in_transit'].includes(order.status.toLowerCase()) && (
                                    <button
                                        onClick={() => handleStatusChange(order.id, 'delivered')}
                                        className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium text-sm transition-colors"
                                    >
                                        Complete
                                    </button>
                                )}

                                {!['cancelled', 'delivered'].includes(order.status.toLowerCase()) && (
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
        </div>
    );
};

export default ManageOrders;
