import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaSpinner } from 'react-icons/fa';
import { UserService, OrderService } from '../../services/neon';

const CustomersList: React.FC = () => {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
    const [customerOrders, setCustomerOrders] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [users, orders] = await Promise.all([
                UserService.getAllUsers(),
                OrderService.getAllOrders()
            ]);

            // Filter only 'customer' role if needed, or show all
            const customerUsers = users.filter((u: any) => u.role === 'customer' || !u.role);

            // Aggregate Stats
            const enrichedCustomers = customerUsers.map((user: any) => {
                const userOrders = orders.filter((o: any) => o.user_id === user.id);
                const totalSpent = userOrders.reduce((sum: number, o: any) => sum + Number(o.total_amount || 0), 0);

                return {
                    ...user,
                    ordersCount: userOrders.length,
                    totalSpent
                };
            });

            setCustomers(enrichedCustomers);
        } catch (error) {
            console.error("Failed to load customers", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewHistory = async (customer: any) => {
        setSelectedCustomer(customer);
        setLoadingHistory(true);
        try {
            const orders = await OrderService.getUserOrders(customer.id);
            setCustomerOrders(orders);
        } catch (error) {
            console.error("Failed to fetch customer history", error);
            alert("Could not load history");
        }
        setLoadingHistory(false);
    };

    return (
        <div className="animate-fade-in relative">
            <h1 className="text-3xl font-heading font-bold mb-8 text-brand-dark">Customers</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Customer</th>
                                <th className="p-4 font-semibold text-gray-600">Contact Info</th>
                                <th className="p-4 font-semibold text-gray-600">Orders</th>
                                <th className="p-4 font-semibold text-gray-600">Total Spent</th>
                                <th className="p-4 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        <FaSpinner className="animate-spin inline mr-2" /> Loading customers...
                                    </td>
                                </tr>
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        No customers found.
                                    </td>
                                </tr>
                            ) : (
                                customers.map((customer) => (
                                    <tr key={customer.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                                    <FaUser />
                                                </div>
                                                <span className="font-medium text-brand-dark">{customer.full_name || 'Guest User'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <FaEnvelope size={12} className="text-gray-400" />
                                                    {customer.email || 'N/A'}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FaPhone size={12} className="text-gray-400" />
                                                    {customer.phone || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium">{customer.ordersCount}</td>
                                        <td className="p-4 font-bold text-green-600">₵{customer.totalSpent.toFixed(2)}</td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => handleViewHistory(customer)}
                                                className="text-brand-red hover:underline text-sm font-medium"
                                            >
                                                View History
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order History Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-fade-in">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
                            <div>
                                <h3 className="text-xl font-bold">{selectedCustomer.full_name}'s Orders</h3>
                                <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                            </div>
                            <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-gray-600 text-2xl">
                                &times;
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            {loadingHistory ? (
                                <div className="text-center py-8 text-gray-500">
                                    <FaSpinner className="animate-spin inline mr-2" /> Loading history...
                                </div>
                            ) : customerOrders.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No order history found for this customer.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {customerOrders.map((order) => (
                                        <div key={order.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="font-mono text-xs text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded">
                                                        #{order.id.slice(0, 8)}
                                                    </span>
                                                    <span className={`ml-2 text-xs font-bold uppercase px-2 py-1 rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-lg">₵{Number(order.total_amount).toFixed(2)}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {/* Rough summary of items since items is JSON */}
                                                {(order.items as any[])?.map(i => `${i.quantity}x ${i.name}`).join(', ') || 'No items listed'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomersList;
