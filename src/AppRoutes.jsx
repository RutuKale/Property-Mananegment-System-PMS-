import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';

// 12 Page Components (PDF Page 5)
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import WalkInCheckInPage from './pages/WalkInCheckInPage';
import CheckoutPage from './pages/CheckoutPage';
import BookingsPage from './pages/BookingsPage';
import HousekeepingPage from './pages/HousekeepingPage';
import BillingInvoicesPage from './pages/BillingInvoicesPage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import WhatsAppLogsPage from './pages/WhatsAppLogsPage';
import ReportsAnalyticsPage from './pages/ReportsAnalyticsPage';
import RoomFloorConfigPage from './pages/RoomFloorConfigPage';
import HotelSettingsPage from './pages/HotelSettingsPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Authenticated Staff Application Routes */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/checkin" element={<WalkInCheckInPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/housekeeping" element={<HousekeepingPage />} />
        <Route path="/billing" element={<BillingInvoicesPage />} />
        <Route path="/payments" element={<PaymentHistoryPage />} />
        <Route path="/whatsapp-logs" element={<WhatsAppLogsPage />} />
        <Route path="/reports" element={<ReportsAnalyticsPage />} />
        <Route path="/room-config" element={<RoomFloorConfigPage />} />
        <Route path="/settings" element={<HotelSettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
