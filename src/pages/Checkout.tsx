import React, { useState, useEffect } from 'react';
import { useForm, useWatch, type SubmitHandler, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useCart } from '../context/CartContext';
import { LocationService } from '../services/neon';
import ScrollTimePicker from '../components/ScrollTimePicker';
import { FaTruck, FaStore, FaCreditCard, FaMoneyBillWave, FaArrowLeft, FaCheckCircle, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { OrderService } from '../services/neon';

// Validation Schema
const schema = yup.object().shape({
    orderType: yup.string().oneOf(['delivery', 'pickup']).required(),
    name: yup.string().required('Full Name is required'),
    phone: yup.string().required('Phone Number is required').matches(/^[0-9]+$/, "Must be only digits").min(10, "Must be at least 10 digits"),
    paymentMethod: yup.string().oneOf(['hubtel', 'cash']).required('Payment method is required'),
    // Delivery Fields
    locationId: yup.string().when('orderType', {
        is: 'delivery',
        then: (schema) => schema.required('Selection of delivery location is required'),
        otherwise: (schema) => schema.notRequired(),
    }),
    address: yup.string().when('orderType', {
        is: 'delivery',
        then: (schema) => schema.required('Delivery Address / Landmark is required'),
        otherwise: (schema) => schema.notRequired(),
    }),
    // Pickup Fields
    pickupTime: yup.string().notRequired(),
});

interface CheckoutFormValues {
    orderType: 'delivery' | 'pickup';
    name: string;
    phone: string;
    paymentMethod: 'hubtel' | 'cash' | '';
    locationId: string | undefined;
    address: string | undefined;
    pickupTime: string | undefined;
}

const Checkout: React.FC = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const { currentUser, userProfile, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState(1);
    const [locations, setLocations] = useState<any[]>([]);

    // Fetch locations dynamically
    useEffect(() => {
        const loadLocations = async () => {
            try {
                const data = await LocationService.getAllLocations();
                setLocations(data);
            } catch (error) {
                console.error("Failed to load locations", error);
            }
        };
        loadLocations();
    }, []);

    // Redirect if cart is empty or not logged in
    useEffect(() => {
        if (!loading) {
            if (!currentUser) {
                navigate('/login', { state: { from: location } });
            } else if (cart.length === 0) {
                navigate('/user/cart');
            }
        }
    }, [cart, currentUser, loading, navigate]);

    const { register, handleSubmit, control, setValue, trigger, watch, formState: { errors } } = useForm<CheckoutFormValues>({
        resolver: yupResolver(schema),
        defaultValues: {
            orderType: 'delivery',
            paymentMethod: '',
            name: userProfile?.full_name || '',
            phone: userProfile?.phone || '',
            pickupTime: ''
        }
    });

    const quickFill = () => {
        setValue('name', 'Test User');
        setValue('phone', '0241234567');
        if (locations.length > 0) {
            setValue('locationId', locations[0].id);
            setValue('address', 'Near the big blue gate, East Legon');
        }
    };

    // Update form values when user profile loads
    useEffect(() => {
        if (userProfile || currentUser) {
            setValue('name', userProfile?.full_name || currentUser?.displayName || '');
            setValue('phone', userProfile?.phone || currentUser?.phoneNumber || '');
        }
    }, [userProfile, currentUser, setValue]);

    const [savedDetailsAvailable, setSavedDetailsAvailable] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('savedDeliveryDetails');
        if (saved) {
            setSavedDetailsAvailable(true);
        }
    }, []);

    const loadSavedDetails = () => {
        const saved = localStorage.getItem('savedDeliveryDetails');
        if (saved) {
            const details = JSON.parse(saved);
            setValue('name', details.name);
            setValue('phone', details.phone);
            setValue('locationId', details.locationId);
            setValue('address', details.address);
            setValue('orderType', 'delivery');
        }
    };

    // Watch fields for dynamic UI
    const orderType = useWatch({ control, name: 'orderType' });
    const locationId = useWatch({ control, name: 'locationId' });
    const paymentMethod = useWatch({ control, name: 'paymentMethod' });

    // Calculate Dynamic Delivery Fee
    const deliveryFee = orderType === 'delivery' && locationId
        ? Number(locations.find(l => l.id === locationId)?.price || 0)
        : 0;

    const totalAmount = cartTotal + deliveryFee;

    // Step Navigation Logic
    const nextStep = async () => {
        let valid = false;
        if (step === 1) {
            // Validate Step 1 fields
            valid = await trigger(['orderType', 'locationId', 'pickupTime']);
        } else if (step === 2) {
            // Validate Step 2 fields
            valid = await trigger(['name', 'phone', 'address']);
        }

        if (valid) {
            setStep(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const prevStep = () => {
        setStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    const onSubmit: SubmitHandler<CheckoutFormValues> = async (data) => {
        setSubmitting(true);
        try {
            const orderData = {
                // Using userProfile.id (UUID from Neon users table) as OrderService expects
                userId: userProfile?.id,
                items: cart,
                totalAmount: totalAmount,
                status: 'pending',
                deliveryType: data.orderType,
                deliveryAddress: data.orderType === 'delivery'
                    ? `${locations.find(l => l.id === data.locationId)?.name || ''} - ${data.address}`
                    : `Goddies Lounge & wine bar, Akim Asafo`,
                paymentMethod: data.paymentMethod,
                pickupTime: data.pickupTime
            };

            await OrderService.createOrder(orderData);

            // Save Delivery Details for next time
            if (data.orderType === 'delivery') {
                const savedDetails = {
                    name: data.name,
                    phone: data.phone,
                    locationId: data.locationId,
                    address: data.address
                };
                localStorage.setItem('savedDeliveryDetails', JSON.stringify(savedDetails));
            }

            clearCart();
            // Navigate to Order History/Tracking
            navigate('/user/orders');
        } catch (error) {
            console.error("Checkout Error:", error);
            alert("Failed to place order. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (cart.length === 0) return null;

    return (
        <div className="bg-gray-50 min-h-screen py-10 animate-fade-in font-sans">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header & Back Link */}
                <div className="flex items-center justify-between mb-8">
                    <Link to="/user/cart" className="flex items-center gap-2 text-gray-500 hover:text-brand-dark transition-colors font-medium">
                        <FaArrowLeft /> Back to Cart
                    </Link>
                    <h1 className="text-2xl font-heading font-bold text-gray-800">Checkout</h1>
                </div>

                {/* Stepper Indicator */}
                <div className="flex justify-center mb-10">
                    <div className="flex items-center w-full max-w-xl">
                        {[1, 2, 3].map((s) => (
                            <React.Fragment key={s}>
                                <div className={`flex flex-col items-center relative z-10`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= s ? 'bg-brand-red text-white shadow-lg scale-110' : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        {step > s ? <FaCheckCircle /> : s}
                                    </div>
                                    <span className={`text-xs mt-2 font-medium absolute -bottom-6 w-32 text-center transition-colors ${step >= s ? 'text-brand-red' : 'text-gray-400'
                                        }`}>
                                        {s === 1 ? 'Preference' : s === 2 ? 'Details' : 'Details'}
                                    </span>
                                </div>
                                {s < 3 && (
                                    <div className={`flex-grow h-1 mx-2 rounded-full transition-all duration-500 ${step > s ? 'bg-brand-red' : 'bg-gray-200'
                                        }`}></div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Main Content Area */}
                    <div className="w-full lg:w-2/3">

                        {/* Saved & Debug Actions */}
                        <div className="flex gap-4 mb-6 animate-fade-in">
                            {savedDetailsAvailable && step === 1 && (
                                <div className="flex-1 bg-blue-50 border border-blue-100 p-4 rounded-xl flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-blue-800 text-sm">Return Customer?</p>
                                        <p className="text-xs text-blue-600">Use items from last time.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={loadSavedDetails}
                                        className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition"
                                    >
                                        Use Saved
                                    </button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="flex-1 bg-gray-900 border border-gray-800 p-4 rounded-xl flex justify-between items-center">
                                    <div className="text-white">
                                        <p className="font-bold text-sm">Testing Mode</p>
                                        <p className="text-[10px] opacity-70">Fill form instantly</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={quickFill}
                                        className="px-4 py-2 bg-brand-red text-white text-xs font-bold rounded-lg hover:bg-red-600 transition"
                                    >
                                        Quick Fill
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Step 1: Preference */}
                        {step === 1 && (
                            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 animate-slide-in-right">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <span className="bg-brand-yellow/20 text-brand-dark w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                                    Ordering Preference
                                </h2>

                                <label className="block text-sm font-medium text-gray-700 mb-3">How would you like to receive your order?</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                    <label className={`cursor-pointer border-2 rounded-2xl p-6 flex flex-col items-center gap-4 transition-all hover:shadow-md ${orderType === 'delivery' ? 'border-brand-red bg-red-50/50 text-brand-red shadow-sm' : 'border-gray-100 hover:border-brand-red/30'}`}>
                                        <input type="radio" {...register('orderType')} value="delivery" className="hidden" />
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-2 ${orderType === 'delivery' ? 'bg-white text-brand-red shadow-sm' : 'bg-gray-100 text-gray-400'}`}>
                                            <FaTruck />
                                        </div>
                                        <span className="font-bold text-lg">Delivery</span>
                                        <span className="text-xs text-center text-gray-500">We bring the food to your doorstep</span>
                                    </label>

                                    <label className={`cursor-pointer border-2 rounded-2xl p-6 flex flex-col items-center gap-4 transition-all hover:shadow-md ${orderType === 'pickup' ? 'border-brand-yellow bg-yellow-50/50 text-brand-dark shadow-sm' : 'border-gray-100 hover:border-brand-yellow/30'}`}>
                                        <input type="radio" {...register('orderType')} value="pickup" className="hidden" />
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-2 ${orderType === 'pickup' ? 'bg-white text-brand-yellow shadow-sm' : 'bg-gray-100 text-gray-400'}`}>
                                            <FaStore />
                                        </div>
                                        <span className="font-bold text-lg">Pickup</span>
                                        <span className="text-xs text-center text-gray-500">Pick up your order at the restaurant</span>
                                    </label>
                                </div>

                                <div className="border-t border-gray-100 pt-6">
                                    {orderType === 'delivery' && (
                                        <div className="animate-fade-in group mb-6">
                                            <label className="block text-sm font-bold text-gray-800 mb-2">Select Delivery Location</label>
                                            <div className="relative">
                                                <select {...register('locationId')} className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none transition-all appearance-none cursor-pointer bg-white hover:border-brand-red">
                                                    <option value="">-- Choose your town --</option>
                                                    {locations.map(loc => (
                                                        <option key={loc.id} value={loc.id}>
                                                            {loc?.name || 'Unknown'} - (₵{Number(loc?.price || 0).toFixed(2)})
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                                    <FaChevronRight className="rotate-90 text-xs" />
                                                </div>
                                            </div>
                                            <p className="text-red-500 text-xs mt-2 pl-1 font-medium">{errors.locationId?.message}</p>
                                        </div>
                                    )}

                                    <div className="animate-fade-in">
                                        <label className="block text-sm font-bold text-gray-800 mb-2">
                                            {orderType === 'delivery' ? 'Schedule Delivery Time (Optional)' : 'Select Pickup Time (Optional)'}
                                        </label>
                                        <div className="flex gap-4 mb-4">
                                            <label className={`flex-1 flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all ${!watch('pickupTime') ? 'border-brand-red bg-red-50 text-brand-red' : 'border-gray-100 hover:border-gray-200'}`}>
                                                <input type="radio" className="hidden" onClick={() => setValue('pickupTime', '')} />
                                                <span className="font-bold text-sm">Deliver ASAP</span>
                                            </label>
                                            <div className="flex-1"></div> {/* Placeholder to balance */}
                                        </div>

                                        <Controller
                                            control={control}
                                            name="pickupTime"
                                            render={({ field: { onChange, value } }) => (
                                                <div className={!value ? 'opacity-40 grayscale pointer-events-none' : ''}>
                                                    <ScrollTimePicker
                                                        value={value || ''}
                                                        onChange={onChange}
                                                        startTime="10:00"
                                                        endTime="22:00"
                                                    />
                                                </div>
                                            )}
                                        />
                                        <p className="text-red-500 text-xs mt-2 pl-1 font-medium">{errors.pickupTime?.message}</p>
                                        <div className="flex items-start gap-2 mt-3 p-3 bg-blue-50 text-blue-700 rounded-lg text-xs">
                                            <span className="font-bold">Note:</span>
                                            {orderType === 'delivery'
                                                ? 'Deliveries usually take 45-60 minutes depending on distance and traffic.'
                                                : 'Please allow at least 30-45 minutes for preparation depending on the order size.'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Details */}
                        {step === 2 && (
                            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 animate-slide-in-right">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <span className="bg-brand-yellow/20 text-brand-dark w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                                    Your Details
                                </h2>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                            <input type="text" {...register('name')} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none transition-all placeholder-gray-300" placeholder="e.g. John Doe" />
                                            <p className="text-red-500 text-xs mt-1 pl-1">{errors.name?.message}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">+233</span>
                                                <input type="tel" {...register('phone')} className="w-full pl-14 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none transition-all placeholder-gray-300" placeholder="XX XXXXXXXX" />
                                            </div>
                                            <p className="text-red-500 text-xs mt-1 pl-1">{errors.phone?.message}</p>
                                        </div>
                                    </div>

                                    {orderType === 'delivery' && (
                                        <div className="animate-fade-in">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address / Landmark</label>
                                            <textarea {...register('address')} rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none transition-all placeholder-gray-300 resize-none" placeholder="Please provide details like House No, Street Name, or a clear landmark near you."></textarea>
                                            <p className="text-red-500 text-xs mt-1 pl-1">{errors.address?.message}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Payment */}
                        {step === 3 && (
                            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 animate-slide-in-right">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <span className="bg-brand-yellow/20 text-brand-dark w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                                    Payment Method
                                </h2>

                                <div className="space-y-4">
                                    <label className={`flex items-center justify-between p-5 border rounded-2xl cursor-pointer transition-all hover:bg-gray-50 ${paymentMethod === 'hubtel' ? 'border-brand-red ring-1 ring-brand-red bg-red-50/10' : 'border-gray-200'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                                                <FaCreditCard />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-lg">Pay Online</p>
                                                <p className="text-xs text-gray-500">Instant payment via Hubtel (MoMo / Card)</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex -space-x-2">
                                                <div className="w-6 h-4 bg-yellow-400 rounded-sm shadow-sm"></div> {/* MoMo visual placeholder */}
                                                <div className="w-6 h-4 bg-red-500 rounded-sm shadow-sm"></div> {/* Vodafone visual placeholder */}
                                            </div>
                                            <input type="radio" {...register('paymentMethod')} value="hubtel" className="w-5 h-5 text-brand-red focus:ring-brand-red" />
                                        </div>
                                    </label>

                                    <label className={`flex items-center justify-between p-5 border rounded-2xl cursor-pointer transition-all hover:bg-gray-50 ${paymentMethod === 'cash' ? 'border-brand-red ring-1 ring-brand-red bg-red-50/10' : 'border-gray-200'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xl">
                                                <FaMoneyBillWave />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-lg">Cash on Delivery</p>
                                                <p className="text-xs text-gray-500">Pay physically when you receive your order</p>
                                            </div>
                                        </div>
                                        <input type="radio" {...register('paymentMethod')} value="cash" className="w-5 h-5 text-brand-red focus:ring-brand-red" />
                                    </label>
                                </div>
                                <p className="text-red-500 text-xs mt-2 pl-1 font-medium">{errors.paymentMethod?.message}</p>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="mt-8 flex justify-between items-center">
                            {step > 1 ? (
                                <button type="button" onClick={prevStep} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-2">
                                    <FaChevronLeft className="text-sm" /> Back
                                </button>
                            ) : (
                                <div></div>
                            )}

                            {step < 3 ? (
                                <button type="button" onClick={nextStep} className="px-8 py-3 rounded-xl font-bold bg-brand-dark text-white hover:bg-black transition-all shadow-lg hover:shadow-xl flex items-center gap-2 transform active:scale-95">
                                    Next Step <FaChevronRight className="text-sm" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-8 py-3 rounded-xl font-bold bg-brand-red text-white hover:bg-red-700 transition-all shadow-lg hover:shadow-brand-red/40 flex items-center gap-2 transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Processing Order...' : `Complete Order • ₵${totalAmount.toFixed(2)}`}
                                </button>
                            )}
                        </div>

                    </div>

                    {/* Right Column: Mini Summary */}
                    <div className="hidden lg:block lg:w-1/3">
                        <div className="bg-white rounded-3xl shadow-lg p-6 sticky top-24 border border-gray-100">
                            <h2 className="text-lg font-bold mb-6 pb-4 border-b border-gray-100">Order Summary</h2>

                            <div className="max-h-60 overflow-y-auto mb-6 pr-2 space-y-3 custom-scrollbar">
                                {cart.map(item => (
                                    <div key={item.id} className="flex gap-3 text-sm">
                                        <div className="relative flex-shrink-0">
                                            <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                                            <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm border border-white">{item.quantity}</span>
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-medium text-gray-800 line-clamp-1">{item.name}</p>
                                            <p className="text-xs text-gray-500">₵{item.price.toFixed(2)} x {item.quantity}</p>
                                        </div>
                                        <div className="font-bold text-gray-800">
                                            ₵{(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₵{cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Delivery Fee</span>
                                    <span className={`font-medium ${orderType === 'delivery' && !locationId ? 'text-orange-500' : 'text-gray-800'}`}>
                                        {orderType === 'delivery'
                                            ? (locationId ? `₵${deliveryFee.toFixed(2)}` : '--')
                                            : 'Free'}
                                    </span>
                                </div>
                                <div className="border-t border-gray-100 pt-4 mt-2 flex justify-between font-bold text-xl">
                                    <span>Total</span>
                                    <span className="text-brand-red">₵{totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Checkout;
