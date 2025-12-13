import React, { useState } from 'react';
import { useRider } from '../../context/RiderContext';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaCheckCircle, FaBan, FaMotorcycle } from 'react-icons/fa';

const ManageRiders: React.FC = () => {
    const { riders, updateRider, deleteRider } = useRider();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRiders = riders.filter(rider =>
        rider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rider.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleStatusChange = async (riderId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
        if (window.confirm(`Are you sure you want to change this rider's status to ${newStatus}?`)) {
            await updateRider(riderId, { status: newStatus });
        }
    };

    const handleDelete = async (riderId: string) => {
        if (window.confirm('Are you sure you want to delete this rider? This action cannot be undone.')) {
            await deleteRider(riderId);
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-heading font-bold text-brand-dark">Manage Riders</h1>
                <div className="flex items-center gap-2 text-gray-600">
                    <FaMotorcycle className="text-brand-yellow" />
                    <span className="font-medium">{riders.length} Total Riders</span>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search riders by name or registration number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-red"
                    />
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-green-600 text-sm font-medium">Active Riders</p>
                    <p className="text-2xl font-bold text-green-700">
                        {riders.filter(r => r.status === 'active').length}
                    </p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-yellow-600 text-sm font-medium">Pending Approval</p>
                    <p className="text-2xl font-bold text-yellow-700">
                        {riders.filter(r => r.status === 'inactive').length}
                    </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-600 text-sm font-medium">Suspended</p>
                    <p className="text-2xl font-bold text-red-700">
                        {riders.filter(r => r.status === 'suspended').length}
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Reg. Number</th>
                                <th className="p-4 font-semibold text-gray-600">Name</th>
                                <th className="p-4 font-semibold text-gray-600">Contact</th>
                                <th className="p-4 font-semibold text-gray-600">Vehicle</th>
                                <th className="p-4 font-semibold text-gray-600">Deliveries</th>
                                <th className="p-4 font-semibold text-gray-600">Earnings</th>
                                <th className="p-4 font-semibold text-gray-600">Status</th>
                                <th className="p-4 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRiders.map((rider) => (
                                <tr key={rider.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="p-4 font-medium text-brand-dark">{rider.registrationNumber}</td>
                                    <td className="p-4">
                                        <div>
                                            <p className="font-medium">{rider.name}</p>
                                            <p className="text-xs text-gray-500">{rider.email}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">{rider.phone}</td>
                                    <td className="p-4">
                                        <div className="text-sm">
                                            <p className="font-medium capitalize">{rider.vehicleType}</p>
                                            <p className="text-xs text-gray-500">{rider.vehicleNumber}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-brand-dark">{rider.totalDeliveries}</td>
                                    <td className="p-4 font-bold text-green-600">₵{(rider.totalEarnings || 0).toFixed(2)}</td>
                                    <td className="p-4">
                                        <select
                                            value={rider.status}
                                            onChange={(e) => handleStatusChange(rider.id, e.target.value as any)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${rider.status === 'active' ? 'bg-green-100 text-green-700' :
                                                rider.status === 'suspended' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="suspended">Suspended</option>
                                        </select>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDelete(rider.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete rider"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredRiders.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No riders found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageRiders;
