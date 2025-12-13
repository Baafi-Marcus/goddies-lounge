import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Menu from './pages/Menu';
import PublicMenu from './pages/PublicMenu';
import About from './pages/About';
import WineBar from './pages/WineBar';
import Reservations from './pages/Reservations';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

import { CartProvider } from './context/CartContext';
import { TableProvider } from './context/TableContext';
import { RiderProvider } from './context/RiderContext';

import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import ManageMenu from './pages/admin/ManageMenu';
import ManageWines from './pages/admin/ManageWines';
import ManageOrders from './pages/admin/ManageOrders';
import ManageReservations from './pages/admin/ManageReservations';
import ManageDeliveries from './pages/admin/ManageDeliveries';
import ManageRiders from './pages/admin/ManageRiders';
import CustomersList from './pages/admin/CustomersList';

import RiderLogin from './pages/rider/RiderLogin';
import RiderDashboard from './pages/rider/RiderDashboard';
import PickupVerification from './pages/rider/PickupVerification';
import ActiveDelivery from './pages/rider/ActiveDelivery';

const App: React.FC = () => {
  return (
    <CartProvider>
      <TableProvider>
        <RiderProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="menu" element={<PublicMenu />} />
                <Route path="contact" element={<Contact />} />
              </Route>

              {/* User / Ordering Routes */}
              <Route path="/user" element={<UserLayout />}>
                <Route index element={<Navigate to="menu" replace />} />
                <Route path="menu" element={<Menu />} />
                <Route path="wine" element={<WineBar />} />
                <Route path="reservations" element={<Reservations />} />
                <Route path="cart" element={<Cart />} />
                <Route path="checkout" element={<Checkout />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="menu" element={<ManageMenu />} />
                <Route path="wines" element={<ManageWines />} />
                <Route path="orders" element={<ManageOrders />} />
                <Route path="reservations" element={<ManageReservations />} />
                <Route path="deliveries" element={<ManageDeliveries />} />
                <Route path="riders" element={<ManageRiders />} />
                <Route path="customers" element={<CustomersList />} />
              </Route>

              {/* Rider Routes */}
              <Route path="/rider/login" element={<RiderLogin />} />
              <Route path="/rider/dashboard" element={<RiderDashboard />} />
              <Route path="/rider/pickup" element={<PickupVerification />} />
              <Route path="/rider/delivery/:id" element={<ActiveDelivery />} />
            </Routes>
          </Router>
        </RiderProvider>
      </TableProvider>
    </CartProvider>
  );
};

export default App;
