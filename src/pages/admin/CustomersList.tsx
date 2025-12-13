import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaSpinner } from 'react-icons/fa';
import { UserService, OrderService } from '../../services/neon';

const CustomersList: React.FC = () => {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="animate-fade-in">
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
                                            <button className="text-brand-red hover:underline text-sm font-medium">
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
        </div>
    );
};

export default CustomersList;
