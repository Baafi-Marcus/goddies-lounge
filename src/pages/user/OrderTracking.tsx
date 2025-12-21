import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { OrderService, DeliveryService } from '../../services/neon';
import { Link } from 'react-router-dom';
import { FaBoxOpen, FaMotorcycle, FaCheckCircle, FaClock, FaPhone, FaTools, FaHistory, FaShoppingBag } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';

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
    const [loading, setLoading] = useState(true);
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
                if (order.delivery_type === 'delivery' && ['assigned', 'in_transit', 'delivered'].includes(order.status)) {
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

    // Scanner Logic - User scans Rider's QR when delivery is in_transit
    const { Html5QrcodeScanner } = require('html5-qrcode');

    useEffect(() => {
        const activeDeliveryOrder = activeOrders.find(o =>
            o.delivery_type === 'delivery' &&
            o.status === 'in_transit' // Only for in_transit, not assigned
        );

        if (activeDeliveryOrder) {
            let scanner: any;
            const elementId = `reader-${activeDeliveryOrder.id}`;
            const element = document.getElementById(elementId);

            if (element) {
                try {
                    scanner = new Html5QrcodeScanner(
                        elementId,
                        { fps: 10, qrbox: { width: 250, height: 250 } },
                        /* verbose= */ false
                    );
                    scanner.render(async (decodedText: string) => {
                        console.log("Scanned Code:", decodedText);
                        scanner.clear();

                        // Handle verification
                        try {
                            await DeliveryService.confirmDeliveryReceipt(activeDeliveryOrder.id, decodedText);
                            alert("Delivery Confirmed! Enjoy your meal.");
                            fetchOrders(); // Refresh
                        } catch (e) {
                            alert("Verification Failed. Please try again.");
                            fetchOrders();
                        }

                    }, (error: any) => {
                        // console.warn(error);
                    });
                } catch (e) {
                    console.error("Scanner init error", e);
                }
            }

            return () => {
                if (scanner) {
                    scanner.clear().catch((e: any) => console.error(e));
                }
            };
        }
    }, [activeOrders]);

    const getStatusStep = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 1;
            case 'preparing': return 2;
            case 'ready': return 3;
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

                                            {/* QR Scanner for User to Scan Rider's Code */}
                                            {!isHistory && isDelivery && ['in_transit'].includes(order.status) && (
                                                <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
                                                    <p className="text-xs text-green-800 font-bold uppercase mb-3 text-center">Scan Rider's QR Code to Confirm Delivery</p>

                                                    <div id={`reader-${order.id}`} className="w-full mb-3 rounded-lg overflow-hidden border border-green-300"></div>

                                                    <p className="text-[10px] text-green-600 text-center">The rider will show you a QR code when they arrive</p>
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
