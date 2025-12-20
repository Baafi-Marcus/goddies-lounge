import React, { useState, useEffect } from 'react';
import { MenuService } from '../services/neon';
import type { MenuItem } from '../data/menuData'; // Keep type
import { useCart } from '../context/CartContext';
import { FaPlus, FaMinus, FaTimes, FaShoppingCart, FaUtensils, FaWineGlass, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const Menu: React.FC = () => {
    const { addToCart } = useCart();
    const navigate = useNavigate();

    // Data State
    const [kitchenItems, setKitchenItems] = useState<MenuItem[]>([]);
    const [wineItems, setWineItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Tab State
    const [activeTab, setActiveTab] = useState<'kitchen' | 'wine'>('kitchen');

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const allItems = await MenuService.getAllItems();

                if (!Array.isArray(allItems)) {
                    console.error('Menu items is not an array:', allItems);
                    setLoading(false);
                    return;
                }

                // Split into Kitchen vs Wine based on Category
                // Assuming "Wines", "Champagne", "Spirits", "Local", "Red Wine", "White Wine" are drinks
                const drinksCategories = ['Wines', 'Champagne', 'Spirits', 'Local', 'Red Wine', 'White Wine'];

                const kItems = allItems.filter((i: any) => !drinksCategories.includes(i.category));
                const wItems = allItems.filter((i: any) => drinksCategories.includes(i.category));

                setKitchenItems(kItems);
                setWineItems(wItems);
            } catch (error) {
                console.error("Failed to load menu items", error);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    // Determine current data source based on tab
    const currentData = activeTab === 'kitchen' ? kitchenItems : wineItems;

    // Get unique categories for current data
    const categories = Array.from(new Set(currentData.map((item) => item.category)));

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

    // Reset selection when switching tabs
    const handleTabChange = (tab: 'kitchen' | 'wine') => {
        setActiveTab(tab);
        setSelectedCategory(null);
    };

    const handleAddToCart = () => {
        if (selectedItem) {
            addToCart({ ...selectedItem, quantity });
            setSelectedItem(null);
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
        ? currentData.filter((item) => item.category === selectedCategory)
        : [];

    return (
        <div className="animate-fade-in pb-20">
            <SEO
                title="Our Menu"
                description="Browse our delicious selection of local and continental dishes. Order online for fast delivery in Asafo Akim."
                keywords="food menu, Ghanaian food, Jollof, delivery, lunch, dinner"
            />
            <div className="text-center mb-8">
                <h1 className="text-3xl font-heading font-bold text-brand-dark mb-4">Our Selection</h1>

                {/* Visual Tabs */}
                <div className="inline-flex bg-gray-100 p-1 rounded-full shadow-inner mb-6">
                    <button
                        onClick={() => handleTabChange('kitchen')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-300 ${activeTab === 'kitchen'
                            ? 'bg-white text-brand-red shadow-md transform scale-105'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <FaUtensils /> Goddies Kitchen
                    </button>
                    <button
                        onClick={() => handleTabChange('wine')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-300 ${activeTab === 'wine'
                            ? 'bg-brand-dark text-brand-yellow shadow-md transform scale-105'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <FaWineGlass /> The Wine Bar
                    </button>
                </div>

                <p className="text-gray-500 max-w-xl mx-auto text-sm animate-fade-in">
                    {activeTab === 'kitchen'
                        ? "Savor the taste of our freshly prepared local and continental dishes."
                        : "Discover our premium selection of wines, spirits, and refreshing cocktails."}
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <FaSpinner className="animate-spin text-4xl text-brand-red" />
                </div>
            ) : (
                <>
                    {/* Categories Grid */}
                    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 transition-opacity duration-300 ${isModalOpen ? 'opacity-0' : 'opacity-100'}`}>
                        {categories.map((category) => {
                            // Find a representative image for the category
                            const categoryImage = currentData.find(item => item.category === category)?.image;

                            return (
                                <div
                                    key={category}
                                    onClick={() => handleCategoryClick(category)}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                                >
                                    <div className="h-56 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10"></div>
                                        <img
                                            src={categoryImage}
                                            alt={category}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center z-20">
                                            <h3 className="text-2xl font-bold text-white drop-shadow-md border-b-2 border-transparent group-hover:border-white transition-all pb-1">{category}</h3>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Category Modal */}
                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                                {/* Modal Header */}
                                <div className={`p-4 border-b border-gray-100 flex justify-between items-center ${activeTab === 'wine' ? 'bg-gray-900 text-white' : 'bg-white text-brand-dark'}`}>
                                    <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
                                        {selectedItem ? selectedItem.name : selectedCategory}
                                    </h2>
                                    <button onClick={closeModal} className={`p-2 rounded-full transition-colors ${activeTab === 'wine' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                                        <FaTimes size={24} />
                                    </button>
                                </div>

                                {/* Modal Content */}
                                <div className="flex-grow overflow-y-auto p-6 bg-gray-50">
                                    {selectedItem ? (
                                        // Item Details View
                                        <div className="flex flex-col md:flex-row gap-8">
                                            <div className="md:w-1/2">
                                                <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-72 object-cover rounded-xl shadow-lg" />
                                            </div>
                                            <div className="md:w-1/2 flex flex-col">
                                                <div className="mb-6">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${activeTab === 'wine' ? 'bg-brand-yellow/20 text-brand-dark' : 'bg-brand-red/10 text-brand-red'}`}>
                                                            {selectedItem.category}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 text-lg leading-relaxed">{selectedItem.description}</p>
                                                </div>

                                                <div className="mt-auto bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                                    <div className="flex items-center justify-between mb-6">
                                                        <span className={`text-3xl font-bold ${activeTab === 'wine' ? 'text-brand-dark' : 'text-brand-red'}`}>₵{Number(selectedItem.price).toFixed(2)}</span>
                                                        <div className="flex items-center gap-4 bg-gray-100 rounded-full px-4 py-2">
                                                            <button
                                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-gray-50 text-brand-dark transition-colors"
                                                            >
                                                                <FaMinus size={10} />
                                                            </button>
                                                            <span className="font-bold text-lg w-8 text-center">{quantity}</span>
                                                            <button
                                                                onClick={() => setQuantity(quantity + 1)}
                                                                className={`w-8 h-8 flex items-center justify-center text-white rounded-full shadow-sm transition-colors ${activeTab === 'wine' ? 'bg-brand-dark hover:bg-gray-800' : 'bg-brand-red hover:bg-red-700'}`}
                                                            >
                                                                <FaPlus size={10} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <button
                                                            onClick={handleAddToCart}
                                                            className="flex-1 btn-secondary py-3 flex items-center justify-center gap-2"
                                                        >
                                                            <FaShoppingCart /> Add to Cart
                                                        </button>
                                                        <button
                                                            onClick={handleOrderNow}
                                                            className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${activeTab === 'wine' ? 'bg-brand-yellow text-brand-dark hover:bg-yellow-400' : 'bg-brand-red hover:bg-red-700'}`}
                                                        >
                                                            Order Now
                                                        </button>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedItem(null)}
                                                    className="mt-4 text-gray-400 hover:text-brand-dark text-sm font-medium transition-colors text-center w-full"
                                                >
                                                    Back to {selectedCategory}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // Category Items List
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {categoryItems.map((item) => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => handleItemClick(item)}
                                                    className={`flex gap-4 p-4 bg-white border rounded-xl cursor-pointer transition-all duration-200 group ${activeTab === 'wine' ? 'border-gray-200 hover:border-brand-yellow hover:shadow-md' : 'border-gray-100 hover:border-brand-red/30 hover:shadow-md'}`}
                                                >
                                                    <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    </div>
                                                    <div className="flex flex-col justify-center">
                                                        <h4 className="font-bold text-lg text-brand-dark mb-1 group-hover:text-brand-dark transition-colors">{item.name}</h4>
                                                        <p className="text-gray-500 text-sm line-clamp-2 mb-2 leading-tight">{item.description}</p>
                                                        <span className={`font-bold ${activeTab === 'wine' ? 'text-brand-dark' : 'text-brand-red'}`}>₵{item.price.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Menu;
