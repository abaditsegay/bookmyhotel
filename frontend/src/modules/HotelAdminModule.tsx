import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load hotel admin components
const HotelAdminDashboard = React.lazy(() => import('../pages/hotel-admin/HotelAdminDashboard'));
const RoomManagement = React.lazy(() => import('../pages/hotel-admin/RoomManagement'));
const RoomViewEdit = React.lazy(() => import('../pages/hotel-admin/RoomViewEdit'));
const StaffManagement = React.lazy(() => import('../pages/hotel-admin/StaffManagement'));
const StaffDetails = React.lazy(() => import('../pages/hotel-admin/StaffDetails'));
const HotelAdminBookingDetails = React.lazy(() => import('../pages/hotel-admin/HotelAdminBookingDetails'));
const StaffScheduleManagement = React.lazy(() => import('../components/StaffScheduleManagement'));
const StaffScheduleDashboard = React.lazy(() => import('../components/StaffScheduleDashboard'));
const HousekeepingPage = React.lazy(() => import('../pages/housekeeping/HousekeepingPage'));

/**
 * Hotel Admin Module - Hotel management routes
 * Lazy loaded for better performance
 */
const HotelAdminModule: React.FC = () => {
  return (
    <Routes>
      <Route index element={<HotelAdminDashboard />} />
      <Route path="rooms" element={<RoomManagement />} />
      <Route path="rooms/:id" element={<RoomViewEdit />} />
      <Route path="staff" element={<StaffManagement />} />
      <Route path="staff/:id" element={<StaffDetails />} />
      <Route path="staff/schedule" element={<StaffScheduleManagement />} />
      <Route path="staff/schedule/dashboard" element={<StaffScheduleDashboard />} />
      <Route path="housekeeping" element={<HousekeepingPage />} />
      <Route path="bookings/:id" element={<HotelAdminBookingDetails />} />
    </Routes>
  );
};

export default HotelAdminModule;