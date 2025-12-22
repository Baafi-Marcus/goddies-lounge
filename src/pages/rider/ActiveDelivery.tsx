import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRider } from '../../context/RiderContext';
import { FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaPhone, FaBox } from 'react-icons/fa';
import { isValidCode } from '../../utils/qrCodeGenerator';

import { QRCodeSVG } from 'qrcode.react';

const ActiveDelivery: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentRider, deliveries, completeDelivery, pickupDelivery } = useRider();
    const [inputCode, setInputCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const delivery = deliveries.find(d => d.id === id);

    React.useEffect(() => {
        if (!currentRider) {
            navigate('/rider/login');
        }
    }, [currentRider, navigate]);

    // Scanner logic removed - Rider now shows QR code to User

    if (!currentRider) return null;

    if (!delivery) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <FaTimesCircle className="text-red-600 text-5xl mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-brand-dark mb-2">Delivery Not Found</h2>
                    <button
                        onClick={() => navigate('/rider/dashboard')}
                        className="mt-4 px-6 py-2 bg-brand-red text-white rounded-lg hover:bg-red-700"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const handlePickup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!isValidCode(inputCode)) {
            setError('Verification code must be 6 digits');
            setLoading(false);
            return;
        }

        const successResult = await pickupDelivery(delivery.id, inputCode);
        if (successResult) {
            setInputCode(''); // Clear input for next step
        } else {
            setError('Invalid verification code. Please check with the restaurant.');
        }
        setLoading(false);
    };

    const handleCompleteDelivery = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!isValidCode(inputCode)) {
            setError('Customer code must be 6 digits');
            setLoading(false);
            return;
        }

        const successResult = await completeDelivery(delivery.id, inputCode);
        if (successResult) {
            setSuccess(true);
            setTimeout(() => {
                navigate('/rider/dashboard');
            }, 2000);
        } else {
            setError('Invalid customer confirmation code. Please ask the customer for the correct code.');
        }
        setLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaCheckCircle className="text-green-600 text-4xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-brand-dark mb-2">Delivery Completed!</h2>
                    <p className="text-gray-600 mb-2">Your earnings have been updated</p>
                    <p className="text-2xl font-bold text-green-600">+₵{Number(delivery.riderEarning || 0).toFixed(2)}</p>
                    <p className="text-sm text-gray-500 mt-4">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-brand-dark text-white p-6 shadow-lg">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-heading font-bold">Active Delivery</h1>
                        <p className="text-brand-yellow text-sm">Order #{delivery.orderId}</p>
                    </div>
                    <button
                        onClick={() => navigate('/rider/dashboard')}
                        className="text-sm bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors border border-white/20"
                    >
                        &larr; Back
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6 space-y-6">
                {/* Delivery Status */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">Status</p>
                            <p className="text-2xl font-bold capitalize">{delivery.status.replace('_', ' ')}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm opacity-90">Your Earning</p>
                            <p className="text-2xl font-bold">₵{Number(delivery.riderEarning || 0).toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                {/* Customer Information */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold mb-4 text-brand-dark">Customer Information</h2>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <FaBox className="text-brand-yellow mt-1" />
                            <div>
                                <p className="text-sm text-gray-600">Customer Name</p>
                                <p className="font-bold text-brand-dark">{delivery.customerName}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <FaPhone className="text-brand-yellow mt-1" />
                            <div>
                                <p className="text-sm text-gray-600">Phone Number</p>
                                <p className="font-bold text-brand-dark">{delivery.customerPhone}</p>
                                <a
                                    href={`tel:${delivery.customerPhone}`}
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    Call Customer
                                </a>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <FaMapMarkerAlt className="text-brand-yellow mt-1" />
                            <div>
                                <p className="text-sm text-gray-600">Delivery Address</p>
                                <p className="font-bold text-brand-dark">{delivery.location}</p>
                                <p className="text-sm text-gray-600">{delivery.deliveryAddress}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Details */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold mb-4 text-brand-dark">Order Details</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Order Total</span>
                            <span className="font-bold">₵{Number(delivery.orderTotal || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Delivery Fee</span>
                            <span className="font-bold">₵{Number(delivery.deliveryFee || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Commission</span>
                            <span className="text-gray-500">-₵{Number((delivery as any).commissionAmount || 0).toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between">
                            <span className="font-bold text-brand-dark">Your Earning</span>
                            <span className="font-bold text-green-600">₵{Number(delivery.riderEarning || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Pickup Order (Status: Assigned) */}
                {delivery.status === 'assigned' && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold mb-4 text-brand-dark">Pickup Order</h2>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center gap-3">
                                <FaTimesCircle className="text-red-600 text-xl flex-shrink-0" />
                                <p className="text-red-600 font-medium">{error}</p>
                            </div>
                        )}

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <p className="text-blue-800 text-sm">
                                <strong>Instructions:</strong> Arrive at the restaurant. They will give you a 6-digit Verification Code to confirm pickup.
                            </p>
                        </div>

                        <form onSubmit={handlePickup} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Restaurant Verification Code
                                </label>
                                <input
                                    type="text"
                                    value={inputCode}
                                    onChange={(e) => setInputCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none text-center text-2xl font-bold tracking-widest"
                                    placeholder="000000"
                                    maxLength={6}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-400"
                            >
                                <FaBox /> Confirm Pickup
                            </button>
                        </form>
                    </div>
                )}

                {/* Complete Delivery (Status: In Transit) - QR Code & Input */}
                {delivery.status === 'in_transit' && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold mb-4 text-brand-dark">Confirm Delivery</h2>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center gap-3">
                                <FaTimesCircle className="text-red-600 text-xl flex-shrink-0" />
                                <p className="text-red-600 font-medium">{error}</p>
                            </div>
                        )}

                        {/* QR Code for User to Scan */}
                        <div className="bg-brand-yellow/5 border-2 border-brand-yellow/20 rounded-2xl p-6 text-center mb-6">
                            <p className="text-sm font-bold text-brand-dark mb-4">Customer will scan this QR code</p>
                            <div className="bg-white p-4 rounded-xl shadow-md inline-block">
                                <QRCodeSVG
                                    value={delivery.customerConfirmationCode}
                                    size={180}
                                    level="H"
                                />
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <p className="text-blue-800 text-sm font-medium">
                                <strong>Instructions:</strong> Let the customer scan the QR code OR enter their 6-digit confirmation code below.
                            </p>
                        </div>

                        <form onSubmit={handleCompleteDelivery} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter Customer Code
                                </label>
                                <input
                                    type="text"
                                    value={inputCode}
                                    onChange={(e) => setInputCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none text-center text-3xl font-bold tracking-widest bg-gray-50"
                                    placeholder="000000"
                                    maxLength={6}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || inputCode.length !== 6}
                                className="w-full bg-brand-red text-white py-4 rounded-lg font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:bg-gray-300 shadow-lg"
                            >
                                <FaCheckCircle /> Confirm & Complete
                            </button>
                        </form>
                    </div>
                )}

                {delivery.status === 'delivered' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                        <FaCheckCircle className="text-green-600 text-4xl mx-auto mb-3" />
                        <p className="text-green-700 font-bold text-lg">Delivery Completed!</p>
                        <p className="text-green-600 text-sm mt-2">
                            Delivered at {new Date((delivery as any).deliveredAt || Date.now()).toLocaleString()}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActiveDelivery;
