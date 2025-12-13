import React from 'react';
import { FaShoppingCart, FaUtensils, FaCalendarCheck, FaDollarSign } from 'react-icons/fa';

const Dashboard: React.FC = () => {
    const stats = [
        { title: 'Total Orders', value: '1,234', icon: <FaShoppingCart />, color: 'bg-blue-500' },
        { title: 'Total Revenue', value: '₵45,678', icon: <FaDollarSign />, color: 'bg-green-500' },
        { title: 'Menu Items', value: '48', icon: <FaUtensils />, color: 'bg-brand-red' },
        { title: 'Reservations', value: '12', icon: <FaCalendarCheck />, color: 'bg-brand-yellow' },
    ];

    return (
        <div>
            <h1 className="text-3xl font-heading font-bold mb-8 text-brand-dark">Dashboard Overview</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full ${stat.color} text-white flex items-center justify-center text-xl`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-brand-dark">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity (Placeholder) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">
                                        #{1000 + i}
                                    </div>
                                    <div>
                                        <p className="font-medium">Order #{1000 + i}</p>
                                        <p className="text-xs text-gray-500">2 items • ₵145.00</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                    Preparing
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4">Upcoming Reservations</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-brand-red/10 text-brand-red rounded-full flex items-center justify-center font-bold">
                                        {18 + i}
                                    </div>
                                    <div>
                                        <p className="font-medium">Table for 4</p>
                                        <p className="text-xs text-gray-500">Today, 7:00 PM</p>
                                    </div>
                                </div>
                                <button className="text-sm text-brand-red font-medium hover:underline">
                                    View
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
