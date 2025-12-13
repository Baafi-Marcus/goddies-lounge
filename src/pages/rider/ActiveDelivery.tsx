import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRider } from '../../context/RiderContext';
import { FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaPhone, FaBox } from 'react-icons/fa';
import { isValidCode } from '../../utils/qrCodeGenerator';

const ActiveDelivery: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentRider, deliveries, completeDelivery } = useRider();
    const [customerCode, setCustomerCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    React.useEffect(() => {
        if (!currentRider) {
            navigate('/rider/login');
        }
    }, [currentRider, navigate]);

    if (!currentRider) return null;

    const delivery = deliveries.find(d => d.id === id);

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

    const handleCompleteDelivery = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isValidCode(customerCode)) {
            setError('Customer code must be 6 digits');
            return;
        }

        const successResult = completeDelivery(delivery.id, customerCode);
        if (successResult) {
            setSuccess(true);
            setTimeout(() => {
                navigate('/rider/dashboard');
            }, 2000);
        } else {
            setError('Invalid customer confirmation code. Please ask the customer for the correct code.');
        }
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
                    <p className="text-2xl font-bold text-green-600">+₵{delivery.riderEarning.toFixed(2)}</p>
                    <p className="text-sm text-gray-500 mt-4">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-brand-dark text-white p-6 shadow-lg">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-heading font-bold">Active Delivery</h1>
                    <p className="text-brand-yellow text-sm">Order #{delivery.orderId}</p>
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
                            <p className="text-2xl font-bold">₵{delivery.riderEarning.toFixed(2)}</p>
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
                            <span className="font-bold">₵{delivery.orderTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Delivery Fee</span>
                            <span className="font-bold">₵{delivery.deliveryFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Commission</span>
                            <span className="text-gray-500">-₵{delivery.commission.toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between">
                            <span className="font-bold text-brand-dark">Your Earning</span>
                            <span className="font-bold text-green-600">₵{delivery.riderEarning.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Customer Confirmation */}
                {delivery.status === 'in_transit' && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold mb-4 text-brand-dark">Complete Delivery</h2>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center gap-3">
                                <FaTimesCircle className="text-red-600 text-xl flex-shrink-0" />
                                <p className="text-red-600 font-medium">{error}</p>
                            </div>
                        )}

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                            <p className="text-yellow-800 text-sm">
                                <strong>Important:</strong> Ask the customer for their 6-digit confirmation code before marking this delivery as complete.
                            </p>
                        </div>

                        <form onSubmit={handleCompleteDelivery} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Customer Confirmation Code
                                </label>
                                <input
                                    type="text"
                                    value={customerCode}
                                    onChange={(e) => setCustomerCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none text-center text-2xl font-bold tracking-widest"
                                    placeholder="000000"
                                    maxLength={6}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    The customer received this code when they placed their order
                                </p>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <FaCheckCircle /> Mark as Delivered
                            </button>
                        </form>
                    </div>
                )}

                {delivery.status === 'delivered' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                        <FaCheckCircle className="text-green-600 text-4xl mx-auto mb-3" />
                        <p className="text-green-700 font-bold text-lg">Delivery Completed!</p>
                        <p className="text-green-600 text-sm mt-2">
                            Delivered at {new Date(delivery.deliveryTime!).toLocaleString()}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActiveDelivery;
