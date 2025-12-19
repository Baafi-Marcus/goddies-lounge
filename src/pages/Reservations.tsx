import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaUserFriends, FaCheckCircle, FaChair, FaLock, FaCalendarAlt, FaClock, FaUsers, FaTimes } from 'react-icons/fa';
import { useTable, type Table } from '../context/TableContext';
import { useAuth } from '../context/AuthContext';
import ScrollTimePicker from '../components/ScrollTimePicker';
import { ReservationService } from '../services/neon';

const schema = yup.object({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Invalid email').optional(),
    phone: yup.string().required('Phone number is required'),
    date: yup.string().required('Date is required'),
    time: yup.string().required('Time is required'),
    guests: yup.number().min(1, 'At least 1 guest required').required('Number of guests is required'),
    notes: yup.string().optional(),
    tableId: yup.string().required('Please select a table'),
});

type ReservationFormValues = yup.InferType<typeof schema>;

const Reservations: React.FC = () => {
    const { tables } = useTable();
    const { currentUser, userProfile } = useAuth();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [activeTab, setActiveTab] = useState<'book' | 'my-reservations'>('book');
    const [myReservations, setMyReservations] = useState<any[]>([]);
    const [loadingReservations, setLoadingReservations] = useState(false);

    const { register, handleSubmit, setValue, control, formState: { errors }, reset, watch } = useForm<ReservationFormValues>({
        resolver: yupResolver(schema),
    });

    // Auto-fill form with user data
    useEffect(() => {
        if (userProfile) {
            setValue('name', userProfile.fullName || '');
            setValue('email', userProfile.email || '');
            setValue('phone', userProfile.phone || '');
        }
    }, [userProfile, setValue]);

    // Fetch user reservations when switching to My Reservations tab
    useEffect(() => {
        if (activeTab === 'my-reservations' && (userProfile?.email || userProfile?.phone)) {
            fetchMyReservations();
        }
    }, [activeTab, userProfile]);

    const fetchMyReservations = async () => {
        setLoadingReservations(true);
        try {
            const data = await ReservationService.getReservationsByUser(
                userProfile?.email || '',
                userProfile?.phone || ''
            );
            setMyReservations(data);
        } catch (error) {
            console.error("Failed to fetch reservations", error);
        }
        setLoadingReservations(false);
    };

    const handleTableSelect = (table: Table) => {
        setSelectedTable(table);
        setValue('tableId', table.id);

        // Auto-set guests to table capacity initially (optional, but helpful)
        // Or if current value exceeds capacity, clamp it.
        const currentGuests = watch('guests');
        if (!currentGuests || currentGuests > table.seats) {
            setValue('guests', table.seats);
        }
    };

    const onSubmit: import('react-hook-form').SubmitHandler<ReservationFormValues> = async (data) => {
        try {
            await ReservationService.createReservation({
                ...data,
                tableName: selectedTable?.label // Add table name for admin display
            });
            setIsSubmitted(true);
            reset();
            setSelectedTable(null);
        } catch (error) {
            console.error('Failed to make reservation', error);
            alert('Failed to make reservation. Please try again.');
        }
    };

    const handleCancelReservation = async (id: string, date: string) => {
        const reservationDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        reservationDate.setHours(0, 0, 0, 0);

        if (reservationDate <= today) {
            alert("Cannot cancel reservations on or after the reservation date.");
            return;
        }

        if (window.confirm("Are you sure you want to cancel this reservation?")) {
            try {
                await ReservationService.cancelReservation(id);
                fetchMyReservations();
            } catch (error) {
                console.error("Failed to cancel reservation", error);
                alert("Failed to cancel reservation. Please try again.");
            }
        }
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

    const canCancel = (date: string, status: string) => {
        const reservationDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        reservationDate.setHours(0, 0, 0, 0);

        return reservationDate >= today && (status === 'pending' || status === 'accepted' || status === 'confirmed');
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
                        onClick={() => {
                            setIsSubmitted(false);
                            setActiveTab('my-reservations');
                        }}
                        className="btn-primary w-full"
                    >
                        View My Reservations
                    </button>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 animate-fade-in">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaLock size={32} />
                    </div>
                    <h2 className="text-3xl font-heading font-bold mb-4">Login Required</h2>
                    <p className="text-gray-600 mb-8">
                        Please log in or create an account to book a table.
                    </p>
                    <div className="flex flex-col gap-4">
                        <Link to="/login" className="btn-primary w-full">
                            Login
                        </Link>
                        <Link to="/signup" className="text-brand-red font-bold hover:underline">
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 animate-fade-in">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold text-brand-dark mb-4">Reservations</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Book a table or manage your existing reservations
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
                        <button
                            onClick={() => setActiveTab('book')}
                            className={`px-6 py-3 rounded-md font-medium transition-all ${activeTab === 'book'
                                ? 'bg-brand-red text-white shadow-md'
                                : 'text-gray-600 hover:text-brand-red'
                                }`}
                        >
                            <FaChair className="inline mr-2" />
                            Book a Table
                        </button>
                        <button
                            onClick={() => setActiveTab('my-reservations')}
                            className={`px-6 py-3 rounded-md font-medium transition-all ${activeTab === 'my-reservations'
                                ? 'bg-brand-red text-white shadow-md'
                                : 'text-gray-600 hover:text-brand-red'
                                }`}
                        >
                            <FaCalendarAlt className="inline mr-2" />
                            My Reservations
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'book' ? (
                    // Book a Table Tab
                    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
                        {/* Floor Plan Section */}
                        <div className="lg:w-3/5 bg-white rounded-2xl shadow-xl overflow-hidden p-6">
                            <h3 className="text-2xl font-bold mb-6 text-brand-dark flex items-center gap-2">
                                <FaChair className="text-brand-red" /> Select Your Table
                            </h3>

                            <div
                                className="bg-gray-100 rounded-xl border-2 border-gray-200 relative overflow-x-auto w-full"
                                style={{ height: '500px', backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                            >
                                <div className="relative w-full h-full min-w-[500px]">
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
                            </div>
                            <p className="text-sm text-gray-500 mt-4 text-center">
                                Scroll to explore the floor plan. Click on a table to select it.
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
                                            max={selectedTable?.seats || 20}
                                            min={1}
                                            disabled={!selectedTable}
                                            onBlur={(e) => {
                                                if (selectedTable && parseInt(e.target.value) > selectedTable.seats) {
                                                    setValue('guests', selectedTable.seats);
                                                }
                                            }}
                                            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${errors.guests ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none disabled:bg-gray-100`}
                                            placeholder="Select table first"
                                            title={selectedTable ? `Max ${selectedTable.seats} guests` : "Select a table first"}
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
                ) : (
                    // My Reservations Tab
                    <div className="max-w-5xl mx-auto">
                        {loadingReservations ? (
                            <div className="text-center py-12">
                                <div className="text-gray-500">Loading reservations...</div>
                            </div>
                        ) : myReservations.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                                <FaCalendarAlt className="mx-auto text-gray-300 mb-4" size={64} />
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">No Reservations Yet</h2>
                                <p className="text-gray-600 mb-6">You haven't made any table reservations.</p>
                                <button
                                    onClick={() => setActiveTab('book')}
                                    className="btn-primary inline-block"
                                >
                                    Book a Table
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {myReservations.map((reservation) => (
                                    <div key={reservation.id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                                                        {reservation.table_name || 'Table Reservation'}
                                                    </h3>
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(reservation.status)}`}>
                                                        {reservation.status || 'pending'}
                                                    </span>
                                                </div>
                                                {canCancel(reservation.date, reservation.status) && (
                                                    <button
                                                        onClick={() => handleCancelReservation(reservation.id, reservation.date)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                                    >
                                                        <FaTimes /> Cancel
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                <div className="flex items-center gap-3 text-gray-700">
                                                    <FaCalendarAlt className="text-brand-red" />
                                                    <div>
                                                        <div className="text-xs text-gray-500">Date</div>
                                                        <div className="font-medium">{reservation.date}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 text-gray-700">
                                                    <FaClock className="text-brand-red" />
                                                    <div>
                                                        <div className="text-xs text-gray-500">Time</div>
                                                        <div className="font-medium">{reservation.time}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 text-gray-700">
                                                    <FaUsers className="text-brand-red" />
                                                    <div>
                                                        <div className="text-xs text-gray-500">Guests</div>
                                                        <div className="font-medium">{reservation.guests} {reservation.guests === 1 ? 'Guest' : 'Guests'}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {reservation.notes && (
                                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                                    <div className="text-xs text-gray-500 mb-1">Special Requests</div>
                                                    <div className="text-sm text-gray-700">{reservation.notes}</div>
                                                </div>
                                            )}

                                            {reservation.status === 'cancelled' && (
                                                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                                    This reservation has been cancelled.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reservations;
