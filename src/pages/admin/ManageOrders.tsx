
import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaEye, FaMotorcycle, FaCheckCircle, FaClock, FaSpinner, FaCheck, FaUserPlus, FaSync } from 'react-icons/fa';
import { generateVerificationCode, generateCustomerConfirmationCode } from '../../utils/qrCodeGenerator';
import { OrderService, RiderService, DeliveryService, LocationService } from '../../services/neon';
import { calculateCommission, calculateRiderEarning } from '../../utils/commissionCalculator';

interface OrderItem {
    id?: string;
    name: string;
    quantity: number;
}

interface Order {
    id: string;
    customer_name?: string;
    total_amount: number;
    status: string;
    created_at: string;
    items: OrderItem[];
    delivery_type: 'delivery' | 'pickup';
    user_id?: string;
    delivery_address?: string;
    verification_code?: string;
    confirmation_code?: string;
}

interface Rider {
    id: string;
    name: string;
    phone?: string;
    status: string;
    registrationNumber: string;
    vehicleType: string;
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
        // Prevent Double Clicks
        if (isAssigning) return;
        setIsAssigning(true);

        try {
            const order = orders.find(o => o.id === orderId);
            if (!order) return;

            // Check if already assigned or offered (Front-end check)
            if (['assigned', 'offered', 'in_transit', 'delivered'].includes(order.status.toLowerCase())) {
                alert("This order is already being processed by a rider.");
                setAssignModalOpen(null);
                return;
            }

            // 1. Calculate Dynamic Delivery Fee
            // Strategy: Check if address contains any known location name
            let deliveryFee = 15.00; // Default fallback
            let foundLocationId = '';

            // Ensuring Address is properly captured
            if (order.delivery_address) {
                const foundLocation = locations.find(loc =>
                    order.delivery_address!.toLowerCase().includes(loc.name.toLowerCase())
                );
                if (foundLocation) {
                    deliveryFee = foundLocation.price;
                    foundLocationId = foundLocation.id;
                }
            }

            // 1. Create Delivery Record
            const commissionAmount = calculateCommission(foundLocationId, deliveryFee, locations);
            const riderEarning = calculateRiderEarning(deliveryFee, commissionAmount);
            const commissionRate = deliveryFee > 0 ? commissionAmount / deliveryFee : 0;

            const deliveryData = {
                orderId: order.id,
                customerId: order.user_id,
                pickupLocation: 'Goodies Lounge, Accra',
                deliveryLocation: order.delivery_address || 'Unknown Address', // Fallback
                deliveryFee: deliveryFee,
                commissionRate: commissionRate,
                commissionAmount: commissionAmount,
                riderEarning: riderEarning,
                verificationCode: generateVerificationCode(),
                confirmationCode: generateCustomerConfirmationCode()
            };

            // Create delivery (returns array)
            // Note: Our API now has a cleaner to remove duplicates, but let's try to not create if exists.
            // Ideally we'd check API, but 'createDelivery' is what we have.
            // We rely on the frontend status check above primarily.

            const createdDeliveries = await DeliveryService.createDelivery(deliveryData);
            const newDelivery = createdDeliveries[0];

            if (newDelivery && newDelivery.id) {
                // 2. Assign the Rider (Triggers 'Offered' status)
                await DeliveryService.assignRider(newDelivery.id, riderId);

                // 3. Update Order Status locally to reflect immediate change
                // (Backend also updates it to 'offered')
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'offered' } : o));

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
        const s = status ? status.toLowerCase() : '';
        switch (s) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'ready': return 'bg-green-100 text-green-800 border-green-200';
            case 'offered': return 'bg-orange-100 text-orange-800 border-orange-200'; // New
            case 'assigned': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'in_transit': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'delivered': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
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

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Order ID
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Date & Customer
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Items
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <FaSpinner className="animate-spin text-2xl mb-2 text-brand-red" />
                                            <span>Loading orders...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                        No orders found matching the selected filter.
                                    </td>
                                </tr>
                            ) : filteredOrders.map((order) => {
                                // Helper: Format Items from JSONB
                                const itemsText = Array.isArray(order.items)
                                    ? order.items.map((i: any) => `${i.name} x${i.quantity || 1}`).join(', ')
                                    : 'Items data unavailable';

                                return (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-100">
                                            #{order.id.slice(0, 8)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">{order.customer_name || 'Guest User'}</div>
                                            <div className="text-xs text-brand-dark flex items-center gap-1 mt-0.5">
                                                <FaClock className="text-gray-400" /> {new Date(order.created_at).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${order.delivery_type === 'delivery' ? 'bg-indigo-100 text-indigo-800' : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                {order.delivery_type === 'delivery' && <FaMotorcycle className="mr-1" />}
                                                {order.delivery_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <div className="text-sm text-gray-700 truncate" title={itemsText}>
                                                {itemsText}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-brand-red">
                                            ₵{Number(order.total_amount).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(order.status)}`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Workflow Actions */}

                                                {/* 1. Pending -> Accept (Simulate 'Preparing') */}
                                                {['pending'].includes(order.status.toLowerCase()) && (
                                                    <button
                                                        onClick={() => handleStatusChange(order.id, 'preparing')}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors"
                                                    >
                                                        <FaCheck className="mr-1" /> Accept & Prepare
                                                    </button>
                                                )}

                                                {/* 2. Preparing -> Ready */}
                                                {['preparing'].includes(order.status.toLowerCase()) && (
                                                    <button
                                                        onClick={() => handleStatusChange(order.id, 'ready')}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors"
                                                    >
                                                        Mark Ready
                                                    </button>
                                                )}

                                                {/* 3. Ready -> Assign Rider (Delivery Only) */}
                                                {order.status.toLowerCase() === 'ready' && order.delivery_type === 'delivery' && (
                                                    <button
                                                        onClick={() => setAssignModalOpen(order.id)}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none transition-colors"
                                                    >
                                                        <FaUserPlus className="mr-1" /> Assign Rider
                                                    </button>
                                                )}

                                                {/* 4. Ready -> Complete Pickup (Pickup Only) */}
                                                {['ready'].includes(order.status.toLowerCase()) && order.delivery_type === 'pickup' && (
                                                    <button
                                                        onClick={() => handleStatusChange(order.id, 'delivered')}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-colors"
                                                    >
                                                        Complete Pickup
                                                    </button>
                                                )}

                                                {/* Cancel Option (Available until final stages) */}
                                                {!['cancelled', 'delivered', 'assigned', 'in_transit'].includes(order.status.toLowerCase()) && (
                                                    <button
                                                        onClick={() => handleStatusChange(order.id, 'cancelled')}
                                                        className="text-red-600 hover:text-red-900 text-xs underline px-2"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}

                                                {/* Status Badges for Active/Complete */}
                                                {['assigned', 'in_transit'].includes(order.status.toLowerCase()) && (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-xs text-gray-500 italic">Rider Active</span>
                                                        {order.verification_code && (
                                                            <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded border border-yellow-200 mt-1">
                                                                Code: {order.verification_code}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {order.status.toLowerCase() === 'delivered' && (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-xs text-green-600 font-bold flex items-center">
                                                            <FaCheckCircle className="mr-1" /> Done
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Rider Assign Modal */}
            {
                assignModalOpen && (
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
                )
            }
        </div >
    );
};

export default ManageOrders;
