import React, { useState, useRef, useEffect } from 'react';
import { useTable, type Table } from '../../context/TableContext';
import { v4 as uuidv4 } from 'uuid';
import { FaPlus, FaSave, FaTrash, FaUndo } from 'react-icons/fa';

const ManageReservations: React.FC = () => {
    const { tables, addTable, updateTable, removeTable, saveLayout, resetLayout } = useTable();
    const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);
    const [reservations, setReservations] = useState<any[]>([]);

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        try {
            const { ReservationService } = await import('../../services/neon');
            const data = await ReservationService.getAllReservations();
            setReservations(data);
        } catch (error) {
            console.error("Failed to fetch reservations", error);
        }
    };

    const handleConfirm = async (id: string) => {
        try {
            const { ReservationService } = await import('../../services/neon');
            await ReservationService.confirmReservation(id);
            fetchReservations(); // Refresh list
        } catch (error) {
            console.error("Failed to confirm reservation", error);
            alert("Failed to confirm reservation");
        }
    };

    const handleNoShow = async (id: string) => {
        if (window.confirm("Mark this reservation as no-show?")) {
            try {
                const { ReservationService } = await import('../../services/neon');
                await ReservationService.markNoShow(id);
                fetchReservations(); // Refresh list
            } catch (error) {
                console.error("Failed to mark no-show", error);
                alert("Failed to mark no-show");
            }
        }
    };

    const canTakeAction = (reservationDate: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const resDate = new Date(reservationDate);
        resDate.setHours(0, 0, 0, 0);
        return resDate <= today; // Can only take action on or after the date
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'no-show':
                return 'bg-red-100 text-red-800';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    // Table Templates
    const tableTemplates = [
        { type: '2-seater', seats: 2, width: 60, height: 60, shape: 'rectangle', label: '2 Seat' },
        { type: '4-seater', seats: 4, width: 80, height: 80, shape: 'rectangle', label: '4 Seat' },
        { type: '6-seater', seats: 6, width: 100, height: 80, shape: 'rectangle', label: '6 Seat' },
        { type: 'round', seats: 4, width: 80, height: 80, shape: 'circle', label: 'Round' },
    ];

    const handleAddTable = (template: any) => {
        const newTable: Table = {
            id: uuidv4(),
            x: 50,
            y: 50,
            width: template.width,
            height: template.height,
            shape: template.shape,
            seats: template.seats,
            label: `T-${tables.length + 1}`,
            type: template.type,
        };
        addTable(newTable);
    };

    const handleMouseDown = (e: React.MouseEvent, table: Table) => {
        e.stopPropagation();
        setSelectedTableId(table.id);
        setIsDragging(true);

        // Calculate offset
        if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            // Mouse position relative to the canvas
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            setDragOffset({
                x: mouseX - table.x,
                y: mouseY - table.y
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !selectedTableId || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // New position
        let newX = mouseX - dragOffset.x;
        let newY = mouseY - dragOffset.y;

        // Boundary checks (simple)
        newX = Math.max(0, Math.min(newX, rect.width - 50)); // Assuming min width
        newY = Math.max(0, Math.min(newY, rect.height - 50));

        updateTable(selectedTableId, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Global mouse up to catch drops outside elements
    useEffect(() => {
        const handleGlobalMouseUp = () => setIsDragging(false);
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, []);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manage Floor Plan</h1>
                <div className="flex gap-2">
                    <button onClick={resetLayout} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                        <FaUndo /> Reset
                    </button>
                    <button onClick={saveLayout} className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white rounded hover:bg-red-700">
                        <FaSave /> Save Layout
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Toolbox */}
                <div className="w-full lg:w-64 bg-white p-4 rounded-lg shadow-md h-fit">
                    <h3 className="font-bold mb-4 text-gray-700">Add Tables</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {tableTemplates.map((template) => (
                            <button
                                key={template.type}
                                onClick={() => handleAddTable(template)}
                                className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded hover:border-brand-red hover:bg-red-50 transition-colors"
                            >
                                <div
                                    className={`mb-2 bg-gray-200 border-2 border-gray-400 ${template.shape === 'circle' ? 'rounded-full' : 'rounded-md'}`}
                                    style={{ width: 40, height: 40 }}
                                />
                                <span className="text-xs font-medium">{template.label}</span>
                            </button>
                        ))}
                    </div>

                    {selectedTableId && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h3 className="font-bold mb-2 text-gray-700">Selected Table</h3>
                            <div className="mb-4">
                                <label className="block text-xs text-gray-500 mb-1">Label</label>
                                <input
                                    type="text"
                                    value={tables.find(t => t.id === selectedTableId)?.label || ''}
                                    onChange={(e) => updateTable(selectedTableId, { label: e.target.value })}
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    removeTable(selectedTableId);
                                    setSelectedTableId(null);
                                }}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                            >
                                <FaTrash /> Remove Table
                            </button>
                        </div>
                    )}
                </div>

                {/* Canvas */}
                <div
                    ref={canvasRef}
                    className="flex-grow bg-gray-100 rounded-lg border-2 border-gray-300 relative overflow-hidden"
                    style={{ height: '600px', backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    {tables.map((table) => (
                        <div
                            key={table.id}
                            onMouseDown={(e) => handleMouseDown(e, table)}
                            className={`absolute flex items-center justify-center cursor-move shadow-sm border-2 transition-shadow
                                ${selectedTableId === table.id ? 'border-brand-red ring-2 ring-red-200 z-10' : 'border-gray-400 bg-white hover:border-gray-500'}
                                ${table.shape === 'circle' ? 'rounded-full' : 'rounded-lg'}
                            `}
                            style={{
                                left: table.x,
                                top: table.y,
                                width: table.width,
                                height: table.height,
                            }}
                        >
                            <div className="text-center">
                                <span className="block font-bold text-gray-700 text-sm">{table.label}</span>
                                <span className="block text-xs text-gray-500">{table.seats} seats</span>
                            </div>

                            {/* Chairs visualization (simple) */}
                            {/* Top */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-2 bg-gray-300 rounded-full"></div>
                            {/* Bottom */}
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-2 bg-gray-300 rounded-full"></div>
                            {/* Left/Right for larger tables */}
                            {table.seats > 2 && (
                                <>
                                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-2 h-8 bg-gray-300 rounded-full"></div>
                                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-2 h-8 bg-gray-300 rounded-full"></div>
                                </>
                            )}
                        </div>
                    ))}

                    {tables.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
                            <p>Drag and drop tables here to create your layout</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Reservations List */}
            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Recent Reservations</h2>
                    <button onClick={() => fetchReservations()} className="text-brand-red hover:text-red-700 text-sm font-medium">
                        Refresh List
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                            <tr>
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3">Date & Time</th>
                                <th className="px-4 py-3">Table</th>
                                <th className="px-4 py-3">Guests</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Notes</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {reservations.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                        No reservations found.
                                    </td>
                                </tr>
                            ) : (
                                reservations.map((res: any) => (
                                    <tr key={res.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-800">{res.name}</div>
                                            <div className="text-xs text-gray-500">{res.email}</div>
                                            <div className="text-xs text-gray-500">{res.phone}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <div>{res.date}</div>
                                            <div className="text-gray-500">{res.time}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-brand-blue">
                                            {res.table_name || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 text-sm">{res.guests}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(res.status)}`}>
                                                {res.status || 'pending'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                                            {res.notes || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {canTakeAction(res.date) && (res.status === 'pending' || res.status === 'confirmed') && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleConfirm(res.id)}
                                                        className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs font-medium"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => handleNoShow(res.id)}
                                                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-medium"
                                                    >
                                                        No-Show
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
};

export default ManageReservations;
