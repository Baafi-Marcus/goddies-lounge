import React, { useState, useEffect } from 'react';
import { LocationService } from '../../services/neon';
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaSync } from 'react-icons/fa';

interface Location {
    id: string;
    name: string;
    price: number;
}

const ManageLocations: React.FC = () => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);
    const [formData, setFormData] = useState({ name: '', price: '' });

    const fetchLocations = async () => {
        setLoading(true);
        try {
            await LocationService.seedLocations(); // Ensure data exists
            const data = await LocationService.getAllLocations();
            setLocations(data as any[]);
        } catch (error) {
            console.error("Failed to fetch locations", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const price = parseFloat(formData.price);
        if (!formData.name || isNaN(price)) return;

        try {
            if (editingLocation) {
                await LocationService.updateLocation(editingLocation.id, formData.name, price);
            } else {
                await LocationService.addLocation(formData.name, price);
            }
            setIsModalOpen(false);
            setEditingLocation(null);
            setFormData({ name: '', price: '' });
            fetchLocations();
        } catch (error) {
            console.error("Failed to save location", error);
            alert("Failed to save location");
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete ${name}?`)) {
            try {
                await LocationService.deleteLocation(id);
                fetchLocations();
            } catch (error) {
                console.error("Failed to delete location", error);
            }
        }
    };

    const openModal = (location?: Location) => {
        if (location) {
            setEditingLocation(location);
            setFormData({ name: location.name, price: location.price.toString() });
        } else {
            setEditingLocation(null);
            setFormData({ name: '', price: '' });
        }
        setIsModalOpen(true);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manage Locations</h1>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            if (confirm('Find and remove duplicate location names?')) {
                                try {
                                    setLoading(true);
                                    await LocationService.cleanupDuplicateLocations();
                                    await fetchLocations();
                                    alert('Duplicates removed!');
                                } catch (e) {
                                    console.error(e);
                                    alert('Failed to cleanup');
                                } finally {
                                    setLoading(false);
                                }
                            }
                        }}
                        className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <FaSync /> Cleanup
                    </button>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 bg-brand-red text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <FaPlus /> Add Location
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {locations.map((loc) => (
                        <div key={loc.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center group hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                    <FaMapMarkerAlt />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">{loc.name}</h3>
                                    <p className="text-sm text-gray-500">Delivery Fee: GHS {loc.price}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openModal(loc)}
                                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    onClick={() => handleDelete(loc.id, loc.name)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">
                            {editingLocation ? 'Edit Location' : 'Add New Location'}
                        </h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                                    placeholder="e.g. East Legon"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Price (GHS)</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-brand-red text-white rounded-xl hover:bg-red-700 font-medium"
                                >
                                    Save Location
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageLocations;
