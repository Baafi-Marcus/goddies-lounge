import React, { useState } from 'react';
import { useRider } from '../../context/RiderContext';
import { FaMotorcycle, FaMapMarkerAlt, FaPhoneAlt, FaQrcode, FaEye, FaUserPlus } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import { generateQRCodeData } from '../../utils/qrCodeGenerator';

const ManageDeliveries: React.FC = () => {
    const { deliveries, riders, assignDelivery } = useRider();
    const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);
    const [showQRModal, setShowQRModal] = useState(false);
    const [assignModal, setAssignModal] = useState<string | null>(null);

    const activeRiders = riders.filter(r => r.status === 'active');

    const handleAssignRider = (deliveryId: string, riderId: string) => {
        assignDelivery(deliveryId, riderId);
        setAssignModal(null);
    };

    const viewDelivery = deliveries.find(d => d.id === selectedDelivery);

    return (
        <div>
            <h1 className="text-3xl font-heading font-bold mb-8 text-brand-dark">Manage Deliveries</h1>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-yellow-600 text-sm font-medium">Pending</p>
                    <p className="text-2xl font-bold text-yellow-700">
                        {deliveries.filter(d => d.status === 'pending').length}
                    </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-blue-600 text-sm font-medium">Assigned</p>
                    <p className="text-2xl font-bold text-blue-700">
                        {deliveries.filter(d => d.status === 'assigned').length}
                    </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <p className="text-purple-600 text-sm font-medium">In Transit</p>
                    <p className="text-2xl font-bold text-purple-700">
                        {deliveries.filter(d => d.status === 'in_transit').length}
                    </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-green-600 text-sm font-medium">Delivered</p>
                    <p className="text-2xl font-bold text-green-700">
                        {deliveries.filter(d => d.status === 'delivered').length}
                    </p>
                </div>
            </div>

            {/* Deliveries List */}
            <div className="space-y-4">
                {deliveries.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                        <p className="text-gray-500">No deliveries yet</p>
                    </div>
                ) : (
                    deliveries.map((delivery) => (
                        <div key={delivery.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                <div className="flex-grow">
                                    <div className="flex items-center gap-4 mb-3">
                                        <span className="font-bold text-lg">Order #{delivery.orderId}</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${delivery.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            delivery.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                                                delivery.status === 'in_transit' ? 'bg-purple-100 text-purple-700' :
                                                    delivery.status === 'picked_up' ? 'bg-indigo-100 text-indigo-700' :
                                                        'bg-green-100 text-green-700'
                                            }`}>
                                            {delivery.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <FaMapMarkerAlt className="text-brand-red" />
                                            <div>
                                                <p className="font-medium text-brand-dark">{delivery.location}</p>
                                                <p className="text-xs">{delivery.deliveryAddress}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaPhoneAlt className="text-brand-yellow" />
                                            <div>
                                                <p className="font-medium text-brand-dark">{delivery.customerName}</p>
                                                <p className="text-xs">{delivery.customerPhone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaMotorcycle className="text-gray-400" />
                                            <span>
                                                Rider: <span className="font-medium text-brand-dark">
                                                    {delivery.riderId ? riders.find(r => r.id === delivery.riderId)?.name || 'Unknown' : 'Unassigned'}
                                                </span>
                                            </span>
                                        </div>
                                        <div className="text-sm">
                                            <p>Delivery Fee: <span className="font-bold text-green-600">₵{delivery.deliveryFee.toFixed(2)}</span></p>
                                            <p className="text-xs text-gray-500">Rider Earning: ₵{delivery.riderEarning.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    {/* Codes Display */}
                                    <div className="mt-3 flex gap-4 text-xs">
                                        <div className="bg-gray-50 px-3 py-2 rounded">
                                            <span className="text-gray-600">Verification Code: </span>
                                            <span className="font-mono font-bold text-brand-dark">{delivery.verificationCode}</span>
                                        </div>
                                        <div className="bg-gray-50 px-3 py-2 rounded">
                                            <span className="text-gray-600">Customer Code: </span>
                                            <span className="font-mono font-bold text-brand-dark">{delivery.customerConfirmationCode}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 min-w-[150px]">
                                    <button
                                        onClick={() => {
                                            setSelectedDelivery(delivery.id);
                                            setShowQRModal(true);
                                        }}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-colors"
                                    >
                                        <FaQrcode /> View QR
                                    </button>

                                    {delivery.status === 'pending' && (
                                        <button
                                            onClick={() => setAssignModal(delivery.id)}
                                            className="flex items-center justify-center gap-2 btn-primary py-2 text-sm"
                                        >
                                            <FaUserPlus /> Assign Rider
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* QR Code Modal */}
            {showQRModal && viewDelivery && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowQRModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-2xl font-bold mb-4 text-center text-brand-dark">Delivery QR Code</h3>

                        <div className="bg-gray-50 p-6 rounded-xl mb-4">
                            <div className="flex justify-center mb-4">
                                <QRCodeSVG
                                    value={generateQRCodeData(viewDelivery.id, viewDelivery.verificationCode)}
                                    size={200}
                                    level="H"
                                />
                            </div>
                            <p className="text-center text-sm text-gray-600">
                                Order #{viewDelivery.orderId}
                            </p>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Verification Code:</span>
                                <span className="font-mono font-bold">{viewDelivery.verificationCode}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Customer Code:</span>
                                <span className="font-mono font-bold">{viewDelivery.customerConfirmationCode}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Location:</span>
                                <span className="font-medium">{viewDelivery.location}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowQRModal(false)}
                            className="w-full mt-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Assign Rider Modal */}
            {assignModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setAssignModal(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-2xl font-bold mb-4 text-brand-dark">Assign Rider</h3>

                        {activeRiders.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500 mb-4">No active riders available</p>
                                <button
                                    onClick={() => setAssignModal(null)}
                                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {activeRiders.map(rider => (
                                    <button
                                        key={rider.id}
                                        onClick={() => handleAssignRider(assignModal, rider.id)}
                                        className="w-full p-4 border-2 border-gray-200 hover:border-brand-yellow hover:bg-yellow-50 rounded-lg transition-colors text-left"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-brand-dark">{rider.name}</p>
                                                <p className="text-sm text-gray-600">{rider.registrationNumber}</p>
                                                <p className="text-xs text-gray-500 capitalize">{rider.vehicleType} - {rider.vehicleNumber}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">{rider.totalDeliveries} deliveries</p>
                                                <p className="text-xs text-green-600 font-medium">₵{rider.totalEarnings.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageDeliveries;
