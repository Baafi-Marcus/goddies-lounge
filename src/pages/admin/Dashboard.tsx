import { FaShoppingCart, FaUtensils, FaCalendarCheck, FaDollarSign, FaHistory, FaArrowRight } from 'react-icons/fa';
import { OrderService, MenuService, ReservationService } from '../../services/neon';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
    const [stats, setStats] = React.useState([
        { title: 'Total Orders', value: '-', icon: <FaShoppingCart />, color: 'bg-blue-500' },
        { title: 'Total Revenue', value: '-', icon: <FaDollarSign />, color: 'bg-green-500' },
        { title: 'Menu Items', value: '-', icon: <FaUtensils />, color: 'bg-brand-red' },
        { title: 'Reservations', value: '-', icon: <FaCalendarCheck />, color: 'bg-brand-yellow' },
    ]);

    const [recentOrders, setRecentOrders] = React.useState<any[]>([]);
    const [upcomingReservations, setUpcomingReservations] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchDashboardData = React.useCallback(async () => {
        try {
            const [orders, menuItems, reservations] = await Promise.all([
                OrderService.getAllOrders(),
                MenuService.getAllItems(),
                ReservationService.getAllReservations()
            ]);

            // Calculate Stats
            const totalOrders = orders.length;
            const totalRevenue = orders.reduce((sum: number, order: any) => sum + Number(order.total_amount || 0), 0);
            const activeMenuItems = menuItems.length;
            const pendingReservations = reservations.filter((r: any) => r.status === 'pending').length;

            setStats([
                { title: 'Total Orders', value: totalOrders.toLocaleString(), icon: <FaShoppingCart />, color: 'bg-blue-500' },
                { title: 'Total Revenue', value: `₵${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <FaDollarSign />, color: 'bg-green-500' },
                { title: 'Menu Items', value: activeMenuItems.toLocaleString(), icon: <FaUtensils />, color: 'bg-brand-red' },
                { title: 'Reservations', value: pendingReservations.toLocaleString(), icon: <FaCalendarCheck />, color: 'bg-brand-yellow' },
            ]);

            // Recent Orders (last 5)
            const sortedOrders = [...orders].sort((a: any, b: any) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            ).slice(0, 5);
            setRecentOrders(sortedOrders);

            // Upcoming Reservations (confirmed/pending)
            const upcoming = reservations
                .filter((r: any) => ['accepted', 'pending'].includes(r.status))
                .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5);
            setUpcomingReservations(upcoming);

        } catch (error) {
            console.error("Dashboard fetch error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [fetchDashboardData]);

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'preparing': return 'bg-blue-100 text-blue-700';
            case 'ready': return 'bg-green-100 text-green-700';
            case 'delivered': return 'bg-brand-dark text-white';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-heading font-bold text-brand-dark">Dashboard Overview</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                    <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
                    {loading ? 'Updating...' : 'Live System'}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
                        <div className={`w-14 h-14 rounded-2xl ${stat.color} text-white flex items-center justify-center text-2xl shadow-lg`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-brand-dark">
                                {loading && stat.value === '-' ? (
                                    <div className="h-8 w-16 bg-gray-100 animate-pulse rounded"></div>
                                ) : stat.value}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2">
                            <FaHistory className="text-brand-red" /> Recent Orders
                        </h2>
                        <Link to="/admin/orders" className="text-sm text-brand-red font-bold hover:underline">
                            View All Orders
                        </Link>
                    </div>

                    <div className="space-y-1">
                        {loading && recentOrders.length === 0 ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-xl mb-3"></div>
                            ))
                        ) : recentOrders.length === 0 ? (
                            <p className="text-center py-10 text-gray-400 italic">No recent orders found.</p>
                        ) : recentOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center font-black text-gray-400 text-xs">
                                        #{order.id.slice(0, 4)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">₵{Number(order.total_amount).toFixed(2)}</p>
                                        <p className="text-[10px] text-gray-500 font-medium">
                                            {format(new Date(order.created_at), 'MMM dd, h:mm a')} • {order.delivery_type}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                                    {order.status.replace('_', ' ')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Reservations */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2">
                            <FaCalendarCheck className="text-brand-yellow" /> Reservations
                        </h2>
                        <Link to="/admin/reservations" className="text-sm text-brand-red font-bold hover:underline">
                            Manage
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {loading && upcomingReservations.length === 0 ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="h-20 bg-gray-50 animate-pulse rounded-xl"></div>
                            ))
                        ) : upcomingReservations.length === 0 ? (
                            <p className="text-center py-10 text-gray-400 italic">No upcoming reservations.</p>
                        ) : upcomingReservations.map((res) => (
                            <div key={res.id} className="p-4 rounded-2xl bg-gray-50/50 border border-gray-50 hover:border-brand-yellow/30 transition-all group">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">{res.name}</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase">{res.location}</p>
                                    </div>
                                    <span className="text-[10px] bg-white px-2 py-1 rounded font-black text-gray-400">
                                        {res.guests} PPL
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-3 text-[10px]">
                                    <div className="flex flex-col">
                                        <span className="text-gray-400 font-medium">{format(new Date(res.date), 'EEE, MMM dd')}</span>
                                        <span className="text-brand-dark font-black">{res.time}</span>
                                    </div>
                                    <Link to={`/admin/reservations`} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-brand-red opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-gray-100">
                                        <FaArrowRight />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
