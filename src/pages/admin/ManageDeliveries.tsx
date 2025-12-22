import React from 'react';
import { useRider } from '../../context/RiderContext';
import { FaMotorcycle, FaMapMarkerAlt, FaPhoneAlt, FaTimesCircle } from 'react-icons/fa';

const ManageDeliveries: React.FC = () => {
    const { deliveries, riders, settleCashReceipt, settleRiderPayout } = useRider();

    return (
        <div>
            <h1 className="text-3xl font-heading font-bold mb-8 text-brand-dark">Manage Deliveries</h1>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-yellow-600 text-sm font-medium">Pending/Offered</p>
                    <p className="text-2xl font-bold text-yellow-700">
                        {deliveries.filter(d => ['pending', 'offered'].includes(d.status)).length}
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
                                            delivery.status === 'offered' ? 'bg-orange-100 text-orange-700' :
                                                delivery.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                                                    delivery.status === 'in_transit' ? 'bg-purple-100 text-purple-700' :
                                                        delivery.status === 'picked_up' ? 'bg-indigo-100 text-indigo-700' :
                                                            'bg-green-100 text-green-700'
                                            }`}>
                                            {delivery.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                                        <div className="flex items-start gap-2">
                                            <div className="bg-blue-50 p-2 rounded-lg">
                                                <FaMapMarkerAlt className="text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-black">Pickup</p>
                                                <p className="font-bold text-brand-dark">{delivery.pickupLocation || 'Goddies Lounge & wine bar, Akim Asafo'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="bg-red-50 p-2 rounded-lg">
                                                <FaMapMarkerAlt className="text-brand-red" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-black">Dropoff (Customer)</p>
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
                                            <p>Delivery Fee: <span className="font-bold text-green-600">₵{Number(delivery.deliveryFee || 0).toFixed(2)}</span></p>
                                            <p className="text-xs text-gray-500">Rider Earning: ₵{Number(delivery.riderEarning || 0).toFixed(2)}</p>
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

                                    {/* Cancellation Reason Display */}
                                    {delivery.status === 'cancelled' && (delivery as any).cancellationReason && (
                                        <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                                            <div className="flex items-start gap-2">
                                                <FaTimesCircle className="text-red-600 mt-0.5 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold text-red-800 mb-1">Cancellation Reason</p>
                                                    <p className="text-sm text-red-700">{(delivery as any).cancellationReason}</p>
                                                    {(delivery as any).cancelledAt && (
                                                        <p className="text-xs text-red-600 mt-1">
                                                            Cancelled: {new Date((delivery as any).cancelledAt).toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Status Info Only - No Actions */}
                                <div className="flex flex-col gap-2 min-w-[150px] md:border-l md:pl-6 border-gray-100">
                                    {['pending', 'offered'].includes(delivery.status) && (
                                        <div className={`text-center py-3 px-4 rounded-lg border ${delivery.status === 'offered' ? 'bg-orange-50 border-orange-200' : 'bg-yellow-50 border-yellow-200'}`}>
                                            <p className={`text-xs font-medium ${delivery.status === 'offered' ? 'text-orange-700' : 'text-yellow-700'}`}>
                                                {delivery.status === 'offered' ? 'Offer Sent' : 'Awaiting Assignment'}
                                            </p>
                                            <p className={`text-[10px] mt-1 ${delivery.status === 'offered' ? 'text-orange-600' : 'text-yellow-600'}`}>
                                                {delivery.status === 'offered' ? 'Waiting for rider' : 'Assign from Orders page'}
                                            </p>
                                        </div>
                                    )}
                                    {delivery.status === 'assigned' && (
                                        <div className="text-center py-3 px-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <p className="text-xs text-blue-700 font-medium">Rider Assigned</p>
                                            <p className="text-[10px] text-blue-600 mt-1">Waiting for pickup</p>
                                        </div>
                                    )}
                                    {delivery.status === 'in_transit' && (
                                        <div className="text-center py-3 px-4 bg-purple-50 rounded-lg border border-purple-200">
                                            <p className="text-xs text-purple-700 font-medium">In Transit</p>
                                            <p className="text-[10px] text-purple-600 mt-1">On the way</p>
                                        </div>
                                    )}

                                    {/* Settlement Warning Indicators */}
                                    {delivery.status === 'delivered' && (
                                        <div className="mt-2 space-y-1">
                                            {delivery.orderPaymentMethod === 'cash' && !delivery.cashSettledByRider && (
                                                <div className="bg-red-50 text-red-700 p-1.5 rounded text-[10px] font-bold border border-red-100 animate-pulse">
                                                    ⚠️ CASH OWED BY RIDER: ₵{Number(delivery.orderTotal || 0).toFixed(2)}
                                                </div>
                                            )}
                                            {!delivery.earningPaidByAdmin && (
                                                <div className="bg-orange-50 text-orange-700 p-1.5 rounded text-[10px] font-bold border border-orange-100">
                                                    ⏳ PAYOUT PENDING: ₵{Number(delivery.riderEarning || 0).toFixed(2)}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {delivery.status === 'delivered' && (
                                        <div className="space-y-2">
                                            <div className="text-center py-3 px-4 bg-green-50 rounded-lg border border-green-200">
                                                <p className="text-xs text-green-700 font-medium">Completed</p>
                                                <p className="text-[10px] text-green-600 mt-1">Successfully delivered</p>
                                            </div>

                                            {/* Settlement Buttons */}
                                            {delivery.orderPaymentMethod === 'cash' && !delivery.cashSettledByRider && (
                                                <button
                                                    onClick={() => settleCashReceipt(delivery.id)}
                                                    className="w-full py-2 bg-brand-dark text-white rounded-lg text-xs font-bold hover:bg-black transition-all"
                                                >
                                                    Confirm Cash Received
                                                </button>
                                            )}

                                            {!delivery.earningPaidByAdmin && (
                                                <button
                                                    onClick={() => settleRiderPayout(delivery.id)}
                                                    className="w-full py-2 bg-brand-red text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-all"
                                                >
                                                    Confirm Rider Paid
                                                </button>
                                            )}

                                            {delivery.earningPaidByAdmin && (
                                                <div className="bg-green-100 text-green-800 py-1 px-3 rounded-full text-[10px] font-bold text-center">
                                                    EARNING PAID ✓
                                                </div>
                                            )}
                                            {delivery.orderPaymentMethod === 'cash' && delivery.cashSettledByRider && (
                                                <div className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-[10px] font-bold text-center">
                                                    CASH RECEIVED ✓
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ManageDeliveries;
