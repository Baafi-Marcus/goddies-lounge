import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaUserFriends, FaCheckCircle, FaChair } from 'react-icons/fa';
import { useTable, type Table } from '../context/TableContext';
import ScrollTimePicker from '../components/ScrollTimePicker';
import { ReservationService } from '../services/neon';

const schema = yup.object({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    phone: yup.string().required('Phone number is required'),
    date: yup.string().required('Date is required'),
    time: yup.string().required('Time is required'),
    guests: yup.number().min(1, 'At least 1 guest required').max(20, 'Max 20 guests').required('Number of guests is required'),
    notes: yup.string().optional(),
    tableId: yup.string().required('Please select a table'),
});

type ReservationFormValues = yup.InferType<typeof schema>;

const Reservations: React.FC = () => {
    const { tables } = useTable();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);

    const { register, handleSubmit, setValue, control, formState: { errors }, reset, watch } = useForm<ReservationFormValues>({
        resolver: yupResolver(schema),
    });

    const handleTableSelect = (table: Table) => {
        setSelectedTable(table);
        setValue('tableId', table.id);
        setValue('guests', table.seats); // Auto-fill guests based on table size
    };

    // ...

    const onSubmit: import('react-hook-form').SubmitHandler<ReservationFormValues> = async (data) => {
        try {
            await ReservationService.createReservation(data);
            setIsSubmitted(true);
            reset();
            setSelectedTable(null);
        } catch (error) {
            console.error('Failed to make reservation', error);
            alert('Failed to make reservation. Please try again.');
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 animate-fade-in">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaCheckCircle size={40} />
                    </div>
                    <h2 className="text-3xl font-heading font-bold mb-4">Reservation Confirmed!</h2>
                    <p className="text-gray-600 mb-8">
                        Thank you for booking <strong>{selectedTable?.label || 'a table'}</strong>. We have sent a confirmation email to you.
                    </p>
                    <button
                        onClick={() => setIsSubmitted(false)}
                        className="btn-primary w-full"
                    >
                        Make Another Reservation
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 animate-fade-in">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold text-brand-dark mb-4">Book a Table</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Select your preferred table from our floor plan below and fill in your details to secure your spot.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
                    {/* Floor Plan Section */}
                    <div className="lg:w-3/5 bg-white rounded-2xl shadow-xl overflow-hidden p-6">
                        <h3 className="text-2xl font-bold mb-6 text-brand-dark flex items-center gap-2">
                            <FaChair className="text-brand-red" /> Select Your Table
                        </h3>

                        <div
                            className="bg-gray-100 rounded-xl border-2 border-gray-200 relative overflow-hidden w-full"
                            style={{ height: '500px', backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                        >
                            {tables.length === 0 ? (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                    <p>No tables available. Please contact us directly.</p>
                                </div>
                            ) : (
                                tables.map((table) => (
                                    <button
                                        key={table.id}
                                        onClick={() => handleTableSelect(table)}
                                        className={`absolute flex items-center justify-center transition-all duration-300
                                            ${selectedTable?.id === table.id
                                                ? 'bg-brand-red text-white shadow-lg scale-105 border-brand-red z-10'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-brand-red hover:text-brand-red hover:shadow-md'
                                            }
                                            border-2 ${table.shape === 'circle' ? 'rounded-full' : 'rounded-lg'}
                                        `}
                                        style={{
                                            left: table.x,
                                            top: table.y,
                                            width: table.width,
                                            height: table.height,
                                        }}
                                        title={`${table.label} (${table.seats} seats)`}
                                    >
                                        <div className="text-center">
                                            <span className="block font-bold text-sm">{table.label}</span>
                                            <span className={`block text-xs ${selectedTable?.id === table.id ? 'text-red-100' : 'text-gray-500'}`}>
                                                {table.seats} seats
                                            </span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                        <p className="text-sm text-gray-500 mt-4 text-center">
                            Click on a table to select it. Green dots indicate available tables.
                        </p>
                    </div>

                    {/* Form Section */}
                    <div className="lg:w-2/5 bg-white rounded-2xl shadow-xl p-8">
                        <h3 className="text-2xl font-bold mb-6 text-brand-dark">Reservation Details</h3>

                        {!selectedTable && (
                            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
                                Please select a table from the floor plan to proceed.
                            </div>
                        )}

                        {selectedTable && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex justify-between items-center">
                                <div>
                                    <span className="font-bold block">{selectedTable.label} Selected</span>
                                    <span className="text-sm">Capacity: {selectedTable.seats} Guests</span>
                                </div>
                                <button
                                    onClick={() => { setSelectedTable(null); setValue('tableId', ''); }}
                                    className="text-xs underline hover:text-green-800"
                                >
                                    Change
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <input type="hidden" {...register('tableId')} />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        {...register('date')}
                                        className={`w-full px-4 py-2 rounded-lg border ${errors.date ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none`}
                                    />
                                    {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                    <Controller
                                        control={control}
                                        name="time"
                                        render={({ field: { onChange, value } }) => (
                                            <ScrollTimePicker
                                                value={value || ''}
                                                onChange={onChange}
                                                startTime="10:00"
                                                endTime="22:00"
                                            />
                                        )}
                                    />
                                    {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time.message}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
                                <div className="relative">
                                    <FaUserFriends className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        {...register('guests')}
                                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${errors.guests ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none`}
                                        placeholder="2"
                                    />
                                </div>
                                {errors.guests && <p className="text-red-500 text-xs mt-1">{errors.guests.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    {...register('name')}
                                    className={`w-full px-4 py-2 rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none`}
                                    placeholder="John Doe"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        {...register('phone')}
                                        className={`w-full px-4 py-2 rounded-lg border ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none`}
                                        placeholder="054xxxxxxx"
                                    />
                                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        {...register('email')}
                                        className={`w-full px-4 py-2 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none`}
                                        placeholder="john@example.com"
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests (Optional)</label>
                                <textarea
                                    {...register('notes')}
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none resize-none"
                                    placeholder="Birthday, Anniversary, Allergies..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={!selectedTable}
                                className={`w-full py-3 mt-4 font-bold text-lg shadow-lg transition-all
                                    ${selectedTable
                                        ? 'btn-primary shadow-brand-red/30 hover:shadow-brand-red/50'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }
                                `}
                            >
                                Confirm Reservation
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reservations;
