import React, { useState, useEffect } from 'react';
import type { MenuItem } from '../../data/menuData';
import { MenuService } from '../../services/neon';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';

const ManageWines: React.FC = () => {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [_loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [formData, setFormData] = useState<Partial<MenuItem>>({
        name: '',
        description: '',
        price: 0,
        category: 'Wines',
        image: '',
    });

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        setLoading(true);
        try {
            const allItems = await MenuService.getAllItems();
            // Filter: Only Drinks (Wines, Spirits, etc.)
            const drinkItems = allItems.filter((i: any) =>
                ['Wines', 'Champagne', 'Spirits', 'Local', 'Red Wine', 'White Wine'].includes(i.category)
            );
            setItems(drinkItems);
        } catch (e) {
            console.error("Failed to load wines", e);
        }
        setLoading(false);
    };

    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            await MenuService.deleteItem(id);
            loadItems();
        }
    };

    const handleEdit = (item: MenuItem) => {
        setEditingItem(item);
        setFormData(item);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingItem(null);
        setFormData({
            name: '',
            description: '',
            price: 0,
            category: 'Wines',
            image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await MenuService.updateItem(editingItem.id, formData);
            } else {
                await MenuService.createItem(formData);
            }
            setIsModalOpen(false);
            loadItems();
        } catch (e) {
            console.error("Failed to save item", e);
            alert("Failed to save item. See console.");
        }
    };

    const handleSyncImages = async () => {
        if (!window.confirm("This will update all wine/drink images from the local wineData file. Continue?")) return;
        setLoading(true);
        try {
            // Import local data
            const { wineData } = await import('../../data/wineData');
            let count = 0;
            for (const localItem of wineData) {
                const allDbItems = await MenuService.getAllItems();
                const match = allDbItems.find((dbItem: any) => dbItem.name === localItem.name);

                if (match) {
                    await MenuService.updateItem(match.id, { image: localItem.image });
                    count++;
                }
            }
            alert(`Updated images for ${count} items.`);
            loadItems();
        } catch (e) {
            console.error("Sync failed", e);
            alert("Sync failed. Check console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-heading font-bold text-brand-dark">Manage Wines & Drinks</h1>
                <div className="flex gap-2">
                    <button
                        onClick={handleSyncImages}
                        className="btn-secondary flex items-center gap-2 bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                        <FaEdit /> Sync Images
                    </button>
                    <button
                        onClick={handleAddNew}
                        className="btn-primary flex items-center gap-2"
                    >
                        <FaPlus /> Add New Item
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search wines and drinks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-red"
                    />
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Image</th>
                                <th className="p-4 font-semibold text-gray-600">Name</th>
                                <th className="p-4 font-semibold text-gray-600">Category</th>
                                <th className="p-4 font-semibold text-gray-600">Price</th>
                                <th className="p-4 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map((item) => (
                                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="p-4">
                                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                                    </td>
                                    <td className="p-4 font-medium">{item.name}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="p-4 font-bold">₵{Number(item.price).toFixed(2)}</td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredItems.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No items found.
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-red"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-red"
                                    rows={3}
                                    required
                                ></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₵)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-red"
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-red"
                                    >
                                        <option value="Wines">Wines</option>
                                        <option value="Champagne">Champagne</option>
                                        <option value="Spirits">Spirits</option>
                                        <option value="Local">Local Drinks</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                <input
                                    type="url"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-red"
                                    placeholder="https://..."
                                    required
                                />
                            </div>
                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 btn-primary py-2 font-medium"
                                >
                                    {editingItem ? 'Save Changes' : 'Create Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageWines;
