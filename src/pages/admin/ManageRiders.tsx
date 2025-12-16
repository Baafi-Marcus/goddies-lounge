import React, { useState } from 'react';
import { useRider } from '../../context/RiderContext';
import { FaSearch, FaMotorcycle, FaPhone, FaMapMarkerAlt, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const ManageRiders: React.FC = () => {
    const { riders, updateRider, deleteRider } = useRider();
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedRider, setSelectedRider] = useState<any | null>(null);

    // Filter logic... (kept same)
    const filteredRiders = riders.filter(rider =>
        rider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rider.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleStatusChange = async (riderId: string, newStatus: string) => {
        if (window.confirm(`Are you sure you want to change this rider's status to ${newStatus}?`)) {
            await updateRider(riderId, { status: newStatus as any });
        }
    };

    const handleDelete = async (riderId: string) => {
        if (window.confirm('Are you sure you want to delete this rider? This action cannot be undone.')) {
            await deleteRider(riderId);
        }
    };

    return (
        <div>
            {/* Header & Stats... (kept same) */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-heading font-bold text-brand-dark">Manage Riders</h1>
                <div className="flex items-center gap-2 text-gray-600">
                    <FaMotorcycle className="text-brand-yellow" />
                    <span className="font-medium">{riders.length} Total Riders</span>
                </div>
            </div>

            {/* Search (kept same) */}
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

            {/* Stats Cards (Updated to use real data logic if needed, but length checks are fine) */}
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
                        {riders.filter(r => r.status === 'inactive' || r.status === 'pending').length}
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
                                <th className="p-4 font-semibold text-gray-600">Name / Contact</th>
                                <th className="p-4 font-semibold text-gray-600">Verif. Details</th>
                                <th className="p-4 font-semibold text-gray-600">Deliveries</th>
                                <th className="p-4 font-semibold text-gray-600">Earnings</th>
                                <th className="p-4 font-semibold text-gray-600">Status</th>
                                <th className="p-4 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRiders.map((rider: any) => (
                                <tr key={rider.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="p-4 font-medium text-brand-dark">{rider.registrationNumber}</td>
                                    <td className="p-4">
                                        <div>
                                            <p className="font-medium">{rider.name}</p>
                                            <p className="text-xs text-gray-500">{rider.phone}</p>
                                            <p className="text-xs text-gray-400">{rider.email}</p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm space-y-1">
                                            <p><span className="font-semibold">MoMo:</span> {rider.momoNumber || 'N/A'}</p>
                                            <p><span className="font-semibold">ID:</span> {rider.ghanaCardNumber || 'N/A'}</p>
                                            {rider.ghanaCardImage && (
                                                <button
                                                    onClick={() => setSelectedRider(rider)}
                                                    className="text-brand-red text-xs underline hover:text-red-700"
                                                >
                                                    View Documents
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold">{rider.totalDeliveries}</td>
                                    <td className="p-4 font-bold text-green-600">₵{Number(rider.totalEarnings || 0).toFixed(2)}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${rider.status === 'active' ? 'bg-green-100 text-green-700' :
                                            rider.status === 'inactive' || rider.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {rider.status === 'inactive' ? 'Pending' : rider.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            {(rider.status === 'inactive' || rider.status === 'pending') && (
                                                <button
                                                    onClick={() => handleStatusChange(rider.id, 'active')}
                                                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                                    title="Approve Rider"
                                                >
                                                    <FaCheck size={14} />
                                                </button>
                                            )}
                                            {rider.status === 'active' && (
                                                <button
                                                    onClick={() => handleStatusChange(rider.id, 'suspended')}
                                                    className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200"
                                                    title="Suspend Rider"
                                                >
                                                    <FaTimes size={14} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(rider.id)}
                                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                                title="Delete Rider"
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Verification Details Modal */}
            {selectedRider && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-xl font-bold">Verification Documents: {selectedRider.name}</h2>
                            <button onClick={() => setSelectedRider(null)} className="text-gray-400 hover:text-gray-600">
                                <FaTimes size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold mb-2">Selfie Verification</h3>
                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden max-w-sm mx-auto">
                                    <img src={selectedRider.selfieImage} alt="Rider Selfie" className="w-full h-full object-cover" />
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Ghana Card ID</h3>
                                <div className="bg-gray-100 rounded-lg overflow-hidden">
                                    <img src={selectedRider.ghanaCardImage} alt="Ghana Card" className="w-full h-auto" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-4">
                            <button
                                onClick={() => setSelectedRider(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Close
                            </button>
                            {(selectedRider.status === 'inactive' || selectedRider.status === 'pending') && (
                                <button
                                    onClick={() => {
                                        handleStatusChange(selectedRider.id, 'active');
                                        setSelectedRider(null);
                                    }}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                >
                                    Approve Rider
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageRiders;
