import React from 'react';
import { FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';

const CustomersList: React.FC = () => {
    const customers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', phone: '0541234567', orders: 5, totalSpent: 450 },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '0509876543', orders: 3, totalSpent: 280 },
        { id: 3, name: 'Mike Johnson', email: 'mike@example.com', phone: '0245556666', orders: 8, totalSpent: 720 },
    ];

    return (
        <div>
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
                            {customers.map((customer) => (
                                <tr key={customer.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                                <FaUser />
                                            </div>
                                            <span className="font-medium">{customer.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <FaEnvelope size={12} /> {customer.email}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FaPhone size={12} /> {customer.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">{customer.orders}</td>
                                    <td className="p-4 font-bold">₵{customer.totalSpent.toFixed(2)}</td>
                                    <td className="p-4">
                                        <button className="text-brand-red hover:underline text-sm font-medium">
                                            View History
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CustomersList;
