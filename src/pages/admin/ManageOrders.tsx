import React, { useState } from 'react';
import { FaEye, FaCheck, FaTimes, FaMotorcycle } from 'react-icons/fa';

interface Order {
    id: string;
    customer: string;
    items: string[];
    total: number;
    status: 'Pending' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled';
    date: string;
    type: 'Delivery' | 'Dine-in' | 'Pickup';
}

const mockOrders: Order[] = [
    {
        id: 'ORD-001',
        customer: 'John Doe',
        items: ['Margherita Pizza x1', 'Coke x2'],
        total: 95.00,
        status: 'Pending',
        date: '2023-10-25 14:30',
        type: 'Delivery',
    },
    {
        id: 'ORD-002',
        customer: 'Jane Smith',
        items: ['Jollof Rice x2', 'Chicken Wings x1'],
        total: 160.00,
        status: 'Preparing',
        date: '2023-10-25 14:15',
        type: 'Dine-in',
    },
    {
        id: 'ORD-003',
        customer: 'Mike Johnson',
        items: ['Beef Burger x1'],
        total: 65.00,
        status: 'Ready',
        date: '2023-10-25 13:45',
        type: 'Pickup',
    },
];

const ManageOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>(mockOrders);
    const [filterStatus, setFilterStatus] = useState('All');

    const handleStatusChange = (id: string, newStatus: Order['status']) => {
        setOrders(orders.map(order =>
            order.id === id ? { ...order, status: newStatus } : order
        ));
    };

    const filteredOrders = filterStatus === 'All'
        ? orders
        : orders.filter(order => order.status === filterStatus);

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
                {filteredOrders.map((order) => (
                    <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-grow">
                            <div className="flex items-center gap-4 mb-2">
                                <span className="font-bold text-lg">{order.id}</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                                <span className="text-sm text-gray-500">{order.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 mb-2">
                                <span className="font-medium">{order.customer}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-sm">
                                    {order.type === 'Delivery' && <FaMotorcycle />} {order.type}
                                </span>
                            </div>
                            <p className="text-gray-500 text-sm mb-2">
                                {order.items.join(', ')}
                            </p>
                            <p className="font-bold text-brand-red">Total: ₵{order.total.toFixed(2)}</p>
                        </div>

                        <div className="flex flex-col gap-2 min-w-[150px]">
                            {order.status === 'Pending' && (
                                <button
                                    onClick={() => handleStatusChange(order.id, 'Preparing')}
                                    className="btn-primary py-2 text-sm"
                                >
                                    Accept Order
                                </button>
                            )}
                            {order.status === 'Preparing' && (
                                <button
                                    onClick={() => handleStatusChange(order.id, 'Ready')}
                                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium text-sm transition-colors"
                                >
                                    Mark Ready
                                </button>
                            )}
                            {order.status === 'Ready' && (
                                <button
                                    onClick={() => handleStatusChange(order.id, 'Delivered')}
                                    className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium text-sm transition-colors"
                                >
                                    Complete
                                </button>
                            )}
                            {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                                <button
                                    onClick={() => handleStatusChange(order.id, 'Cancelled')}
                                    className="border border-red-200 text-red-500 hover:bg-red-50 py-2 rounded-lg font-medium text-sm transition-colors"
                                >
                                    Cancel Order
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageOrders;
