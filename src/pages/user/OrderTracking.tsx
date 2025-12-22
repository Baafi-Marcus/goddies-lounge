import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { OrderService, DeliveryService } from '../../services/neon';
import { Link } from 'react-router-dom';
import { FaBoxOpen, FaMotorcycle, FaCheckCircle, FaClock, FaPhone, FaTools, FaHistory, FaShoppingBag, FaExclamationTriangle } from 'react-icons/fa';
import { Scanner } from '@yudiel/react-qr-scanner';

interface Order {
    id: string;
    total_amount: number;
    status: string;
    created_at: string;
    items: any;
    delivery_type: 'delivery' | 'pickup';
    delivery?: any;
}

const OrderTracking: React.FC = () => {
    const { userProfile, loading: authLoading } = useAuth();
    const [activeOrders, setActiveOrders] = useState<Order[]>([]);
    const [orderHistory, setOrderHistory] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [scannedMatch, setScannedMatch] = useState<string | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

    useEffect(() => {
        if (!authLoading && userProfile?.id) {
            fetchOrders();
            const interval = setInterval(fetchOrders, 5000);
            return () => clearInterval(interval);
        } else if (!authLoading && !userProfile) {
            setLoading(false);
        }
    }, [userProfile, authLoading]);

    const fetchOrders = async () => {
        try {
            const userOrders = await OrderService.getUserOrders(userProfile!.id);

            // Separate active orders from history
            const active: Order[] = [];
            const history: Order[] = [];

            for (const order of userOrders) {
                let enrichedOrder = order;

                // Try to enrich with delivery details
                if (order.delivery_type === 'delivery' && ['ready', 'assigned', 'in_transit', 'delivered'].includes(order.status)) {
                    try {
                        const delivery = await DeliveryService.getDeliveryWithRider(order.id);
                        if (delivery) {
                            enrichedOrder = { ...order, delivery };
                        }
                    } catch (e) {
                        // Ignore
                    }
                }

                // Active: pending, preparing, ready, assigned, in_transit
                // History: delivered, cancelled
                if (['delivered', 'cancelled'].includes(order.status.toLowerCase())) {
                    history.push(enrichedOrder);
                } else {
                    active.push(enrichedOrder);
                }
            }

            setActiveOrders(active);
            setOrderHistory(history);
        } catch (error) {
            console.error("Failed to load orders", error);
        } finally {
            setLoading(false);
        }
    };

    // Scanner Logic - Handled inline in JSX using @yudiel/react-qr-scanner

    const getStatusStep = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 1;
            case 'preparing': return 2;
            case 'ready': return 3;
            case 'offered':
            case 'assigned': return 3;
            case 'in_transit': return 4;
            case 'delivered': return 5;
            default: return 0;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'preparing': return 'bg-blue-100 text-blue-700';
            case 'ready': return 'bg-green-100 text-green-700';
            case 'offered':
            case 'assigned':
            case 'in_transit': return 'bg-orange-100 text-orange-700';
            case 'delivered': return 'bg-brand-dark text-white';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    if (authLoading || loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
        </div>
    );

    const ordersToShow = activeTab === 'active' ? activeOrders : orderHistory;

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="container mx-auto max-w-4xl">
                <h1 className="text-3xl font-heading font-bold text-brand-dark mb-8">My Orders</h1>

                {/* Tab Navigation */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`px-6 py-3 rounded-md font-medium transition-all ${activeTab === 'active'
                                ? 'bg-brand-red text-white shadow-md'
                                : 'text-gray-600 hover:text-brand-red'
                                }`}
                        >
                            <FaShoppingBag className="inline mr-2" />
                            Active Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-6 py-3 rounded-md font-medium transition-all ${activeTab === 'history'
                                ? 'bg-brand-red text-white shadow-md'
                                : 'text-gray-600 hover:text-brand-red'
                                }`}
                        >
                            <FaHistory className="inline mr-2" />
                            Order History
                        </button>
                    </div>
                </div>

                {/* Orders Display */}
                {ordersToShow.length === 0 ? (
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-md mx-auto text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400 text-3xl">
                            <FaBoxOpen />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            {activeTab === 'active' ? 'No Active Orders' : 'No Order History'}
                        </h2>
                        <p className="text-gray-500 mb-8">
                            {activeTab === 'active'
                                ? "You don't have any active orders. Ready to order?"
                                : "You haven't completed any orders yet."}
                        </p>
                        {activeTab === 'active' && (
                            <Link to="/user/menu" className="btn-primary inline-flex">
                                Browse Menu
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {ordersToShow.map((order) => {
                            const currentStep = getStatusStep(order.status);
                            const isDelivery = order.delivery_type === 'delivery';
                            const isHistory = activeTab === 'history';

                            return (
                                <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                                    {/* Header */}
                                    <div className="p-6 border-b border-gray-50 flex flex-wrap justify-between items-center gap-4 bg-gray-50/50">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="font-bold text-lg text-gray-800">Order #{order.id.slice(0, 8)}...</span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(order.status)}`}>
                                                    {order.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-500 flex items-center gap-2">
                                                <FaClock className="text-gray-400" />
                                                {new Date(order.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-xl text-brand-dark">₵{Number(order.total_amount).toFixed(2)}</p>
                                            <p className="text-xs text-gray-500 uppercase font-bold">{order.delivery_type}</p>
                                        </div>
                                    </div>

                                    {/* Progress Bar - Only for active orders */}
                                    {!isHistory && (
                                        <div className="p-6 pb-2">
                                            <div className="relative">
                                                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 z-0 rounded-full"></div>
                                                <div
                                                    className="absolute top-1/2 left-0 h-1 bg-brand-red -translate-y-1/2 z-0 rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${(Math.max(0, currentStep - 1) / (isDelivery ? 4 : 2)) * 100}%` }}
                                                ></div>

                                                <div className="relative z-10 flex justify-between">
                                                    <StepIcon step={1} current={currentStep} icon={<FaCheckCircle />} label="Placed" />
                                                    <StepIcon step={2} current={currentStep} icon={<FaTools />} label="Preparing" />
                                                    {isDelivery ? (
                                                        <>
                                                            <StepIcon step={3} current={currentStep} icon={<FaMotorcycle />} label="On the Way" />
                                                            <StepIcon step={5} current={currentStep} icon={<FaCheckCircle />} label="Delivered" />
                                                        </>
                                                    ) : (
                                                        <StepIcon step={3} current={currentStep} icon={<FaCheckCircle />} label="Ready" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Items & Delivery Info */}
                                    <div className="p-6 pt-2 flex flex-col md:flex-row gap-8">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wider">Items</h4>
                                            <ul className="space-y-3">
                                                {order.items.map((item: any, idx: number) => (
                                                    <li key={idx} className="flex gap-4 text-sm items-center">
                                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                                                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-grow">
                                                            <p className="font-medium text-gray-800">{item.name}</p>
                                                            <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                                                        </div>
                                                        <span className="font-medium text-gray-600">₵{(item.price * item.quantity).toFixed(2)}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            {/* User's Secret Code & Scanner for Rider's Phone */}
                                            {!isHistory && isDelivery && ['in_transit'].includes(order.status) && (
                                                <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
                                                    <p className="text-xs text-green-800 font-bold uppercase mb-3 text-center">Scan Rider's QR Code to Confirm Delivery</p>

                                                    {!scannedMatch ? (
                                                        <div className="w-full mb-3 rounded-lg overflow-hidden border border-green-300 bg-black aspect-square max-w-[300px] mx-auto">
                                                            <Scanner
                                                                onScan={(result) => {
                                                                    if (result && result[0]?.rawValue) {
                                                                        const decodedText = result[0].rawValue;
                                                                        console.log("Scanned Code:", decodedText);
                                                                        if (decodedText === order.delivery?.customerConfirmationCode) {
                                                                            setScannedMatch(decodedText);
                                                                        } else {
                                                                            alert("Code Mismatch! Please scan the rider's correct QR code.");
                                                                        }
                                                                    }
                                                                }}
                                                                constraints={{ facingMode: 'environment' }}
                                                                styles={{
                                                                    container: { width: '100%', height: '100%' }
                                                                }}
                                                                components={{
                                                                    audio: false,
                                                                    torch: true,
                                                                }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="mb-4 bg-white p-6 rounded-xl border-2 border-green-500 text-center animate-fade-in">
                                                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                                <FaCheckCircle className="text-green-500 text-3xl" />
                                                            </div>
                                                            <h3 className="text-lg font-bold text-gray-800">Scan Successful!</h3>
                                                            <p className="text-sm text-gray-500 mb-4">Rider verified. Click below to confirm receipt.</p>

                                                            <button
                                                                onClick={async () => {
                                                                    setIsConfirming(true);
                                                                    try {
                                                                        await DeliveryService.confirmDeliveryReceipt(order.id, scannedMatch);
                                                                        alert("Delivery Confirmed! Enjoy your meal.");
                                                                        setScannedMatch(null);
                                                                        fetchOrders();
                                                                    } catch (e) {
                                                                        alert("Confirmation failed. Please try again.");
                                                                    } finally {
                                                                        setIsConfirming(false);
                                                                    }
                                                                }}
                                                                disabled={isConfirming}
                                                                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                                                            >
                                                                {isConfirming ? 'Confirming...' : 'CONFIRM RECEIPT'}
                                                            </button>

                                                            <button
                                                                onClick={() => setScannedMatch(null)}
                                                                className="mt-4 text-xs text-gray-400 hover:text-gray-600 font-medium underline"
                                                            >
                                                                Try scanning again
                                                            </button>
                                                        </div>
                                                    )}

                                                    <div className="mt-4 bg-white/50 rounded-lg p-3 text-center border border-green-200 shadow-sm">
                                                        <p className="text-[10px] text-green-700 uppercase font-black mb-1">Your Secret Delivery Code</p>
                                                        <p className="text-2xl font-mono font-bold text-brand-dark tracking-widest">{order.delivery?.customerConfirmationCode}</p>
                                                    </div>

                                                    <p className="text-[10px] text-green-600 text-center mt-3">
                                                        Scan the rider's QR code OR type your code into their device
                                                    </p>
                                                </div>
                                            )}

                                            {/* Cancellation Reason Display for User */}
                                            {order.delivery?.cancellation_reason && order.status === 'ready' && (
                                                <div className="mt-4 bg-yellow-50 border border-yellow-300 rounded-xl p-4">
                                                    <div className="flex items-start gap-3">
                                                        <FaExclamationTriangle className="text-yellow-600 text-xl mt-0.5 flex-shrink-0" />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-bold text-yellow-900 mb-2">Delivery Reassignment in Progress</p>
                                                            <p className="text-xs text-yellow-800 mb-2">
                                                                The previous rider cancelled this delivery. We're assigning a new rider to complete your order.
                                                            </p>
                                                            <div className="bg-white/50 rounded-lg p-2 mt-2">
                                                                <p className="text-xs font-semibold text-yellow-900 mb-1">Cancellation Reason:</p>
                                                                <p className="text-xs text-yellow-800 italic">"{order.delivery.cancellation_reason}"</p>
                                                            </div>
                                                            {order.delivery.cancelled_at && (
                                                                <p className="text-[10px] text-yellow-700 mt-2">
                                                                    Cancelled: {new Date(order.delivery.cancelled_at).toLocaleString()}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Rider Info - Only for active delivery orders */}
                                        {!isHistory && isDelivery && order.delivery?.rider_name ? (
                                            <div className="md:w-72 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                                    <FaMotorcycle className="text-brand-red" /> Rider Details
                                                </h4>
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Rider Name</p>
                                                        <p className="font-bold">{order.delivery.rider_name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Vehicle</p>
                                                        <p className="font-medium">{order.delivery.vehicle_type} - {order.delivery.vehicle_number}</p>
                                                    </div>
                                                    {order.delivery.rider_phone && (
                                                        <a
                                                            href={`tel:${order.delivery.rider_phone}`}
                                                            className="block w-full py-3 bg-brand-dark text-white text-center rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <FaPhone className="text-sm" /> Call Rider
                                                        </a>
                                                    )}

                                                    <div className="pt-4 border-t border-gray-200">
                                                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 text-center">Your Delivery Code</p>
                                                        <p className="text-lg font-mono font-bold text-brand-dark text-center tracking-widest bg-white rounded-lg py-2 border border-gray-100 shadow-sm">
                                                            {order.delivery.customerConfirmationCode}
                                                        </p>
                                                        <p className="text-[9px] text-gray-400 mt-2 text-center">Scan the rider's QR code when they arrive or share this code</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (!isHistory && isDelivery && currentStep >= 3) ? (
                                            <div className="md:w-72 bg-orange-50 rounded-2xl p-5 border border-orange-100 flex items-center justify-center text-center">
                                                <div>
                                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-orange-500 shadow-sm animate-pulse">
                                                        <FaMotorcycle />
                                                    </div>
                                                    <p className="font-bold text-orange-800">Finding you a rider...</p>
                                                    <p className="text-xs text-orange-600 mt-1">We are assigning the nearest rider.</p>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

const StepIcon = ({ step, current, icon, label }: { step: number, current: number, icon: React.ReactNode, label: string }) => {
    const isActive = current >= step;
    return (
        <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${isActive ? 'bg-brand-red text-white shadow-lg scale-110' : 'bg-gray-200 text-gray-400'}`}>
                {icon}
            </div>
            <span className={`text-[10px] mt-2 font-bold uppercase tracking-wider transition-colors ${isActive ? 'text-brand-red' : 'text-gray-400'}`}>
                {label}
            </span>
        </div>
    );
};

export default OrderTracking;
