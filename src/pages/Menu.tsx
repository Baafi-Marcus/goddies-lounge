import React, { useState } from 'react';
import { menuData } from '../data/menuData';
import type { MenuItem } from '../data/menuData';
import { useCart } from '../context/CartContext';
import { FaPlus, FaMinus, FaTimes, FaShoppingCart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Menu: React.FC = () => {
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Get unique categories
    const categories = Array.from(new Set(menuData.map((item) => item.category)));

    const handleCategoryClick = (category: string) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const handleItemClick = (item: MenuItem) => {
        setSelectedItem(item);
        setQuantity(1);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCategory(null);
        setSelectedItem(null);
    };

    const handleAddToCart = () => {
        if (selectedItem) {
            addToCart({ ...selectedItem, quantity });
            setSelectedItem(null); // Go back to category list in modal
            alert('Item added to your cart!');
        }
    };

    const handleOrderNow = () => {
        if (selectedItem) {
            addToCart({ ...selectedItem, quantity });
            closeModal();
            navigate('/user/cart');
        }
    }

    // Filter items for the selected category
    const categoryItems = selectedCategory
        ? menuData.filter((item) => item.category === selectedCategory)
        : [];

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-heading font-bold text-brand-dark mb-8 text-center">Our Menu</h1>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories.map((category) => {
                    // Find a representative image for the category
                    const categoryImage = menuData.find(item => item.category === category)?.image;

                    return (
                        <div
                            key={category}
                            onClick={() => handleCategoryClick(category)}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                        >
                            <div className="h-48 overflow-hidden relative">
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10"></div>
                                <img
                                    src={categoryImage}
                                    alt={category}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 flex items-center justify-center z-20">
                                    <h3 className="text-2xl font-bold text-white drop-shadow-md">{category}</h3>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Category Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-2xl font-heading font-bold text-brand-dark">
                                {selectedItem ? selectedItem.name : selectedCategory}
                            </h2>
                            <button onClick={closeModal} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <FaTimes size={24} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-grow overflow-y-auto p-6">
                            {selectedItem ? (
                                // Item Details View
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="md:w-1/2">
                                        <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-64 object-cover rounded-xl shadow-md" />
                                    </div>
                                    <div className="md:w-1/2 flex flex-col">
                                        <p className="text-gray-600 mb-6 text-lg">{selectedItem.description}</p>
                                        <div className="mt-auto">
                                            <div className="flex items-center justify-between mb-6">
                                                <span className="text-3xl font-bold text-brand-red">₵{selectedItem.price.toFixed(2)}</span>
                                                <div className="flex items-center gap-4 bg-gray-100 rounded-full px-4 py-2">
                                                    <button
                                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                        className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-gray-50 text-brand-dark"
                                                    >
                                                        <FaMinus size={12} />
                                                    </button>
                                                    <span className="font-bold text-lg w-8 text-center">{quantity}</span>
                                                    <button
                                                        onClick={() => setQuantity(quantity + 1)}
                                                        className="w-8 h-8 flex items-center justify-center bg-brand-red text-white rounded-full shadow-sm hover:bg-red-700"
                                                    >
                                                        <FaPlus size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={handleAddToCart}
                                                    className="flex-1 btn-secondary py-3 flex items-center justify-center gap-2"
                                                >
                                                    <FaShoppingCart /> Add to Order
                                                </button>
                                                <button
                                                    onClick={handleOrderNow}
                                                    className="flex-1 btn-primary py-3"
                                                >
                                                    Order Now
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => setSelectedItem(null)}
                                                className="mt-4 text-gray-500 hover:text-brand-dark text-sm underline text-center w-full"
                                            >
                                                Back to {selectedCategory}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Category Items List
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {categoryItems.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => handleItemClick(item)}
                                            className="flex gap-4 p-4 border border-gray-100 rounded-xl hover:border-brand-red/30 hover:shadow-md cursor-pointer transition-all duration-200"
                                        >
                                            <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                                            <div>
                                                <h4 className="font-bold text-lg text-brand-dark mb-1">{item.name}</h4>
                                                <p className="text-gray-500 text-sm line-clamp-2 mb-2">{item.description}</p>
                                                <span className="font-bold text-brand-red">₵{item.price.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Menu;
