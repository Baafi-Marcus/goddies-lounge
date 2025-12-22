import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaArrowLeft } from 'react-icons/fa';

const Cart: React.FC = () => {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

    if (cart.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center animate-fade-in">
                <div className="max-w-md mx-auto">
                    <h2 className="text-3xl font-heading font-bold mb-4">Your Cart is Empty</h2>
                    <p className="text-gray-600 mb-8">Looks like you haven't added any delicious items yet.</p>
                    <Link to="/user/menu" className="btn-primary inline-flex items-center gap-2">
                        <FaArrowLeft /> Browse Menu
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12 animate-fade-in">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl md:text-4xl font-heading font-bold mb-8">Your Cart</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items */}
                    <div className="lg:w-2/3">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="p-6 space-y-6">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 py-4 border-b border-gray-100 last:border-0">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-24 h-24 object-cover rounded-lg"
                                        />
                                        <div className="flex-grow text-center sm:text-left">
                                            <h3 className="font-bold text-lg">{item.name}</h3>
                                            <p className="text-brand-red font-bold">₵{Number(item.price).toFixed(2)}</p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                                            >
                                                <FaMinus size={10} />
                                            </button>
                                            <span className="font-bold w-6 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                                            >
                                                <FaPlus size={10} />
                                            </button>
                                        </div>

                                        <div className="text-right min-w-[80px]">
                                            <p className="font-bold text-lg">₵{Number(item.price * item.quantity).toFixed(2)}</p>
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-gray-50 p-4 flex justify-between items-center">
                                <button
                                    onClick={clearCart}
                                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                                >
                                    Clear Cart
                                </button>
                                <Link to="/user/menu" className="text-brand-dark hover:text-brand-red font-medium text-sm">
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₵{Number(cartTotal).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery Fee</span>
                                    <span className="text-sm italic">Calculated at checkout</span>
                                </div>
                                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-xl">
                                    <span>Total</span>
                                    <span className="text-brand-red">₵{Number(cartTotal).toFixed(2)}</span>
                                </div>
                            </div>

                            <Link to="/user/checkout" className="w-full btn-primary py-3 text-lg mb-4 block text-center">
                                Proceed to Checkout
                            </Link>

                            <p className="text-xs text-gray-400 text-center">
                                By proceeding, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
