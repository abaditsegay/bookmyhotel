import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load front desk components
const FrontDeskDashboard = React.lazy(() => import('../pages/frontdesk/FrontDeskDashboard'));
const FrontDeskUnifiedBookingDetails = React.lazy(() => import('../pages/frontdesk/FrontDeskUnifiedBookingDetails'));
const HousekeepingPage = React.lazy(() => import('../pages/housekeeping/HousekeepingPage'));

/**
 * Front Desk Module - Front desk operations routes
 * Lazy loaded for better performance
 */
const FrontDeskModule: React.FC = () => {
  return (
    <Routes>
      <Route index element={<FrontDeskDashboard />} />
      <Route path="bookings/:id" element={<FrontDeskUnifiedBookingDetails />} />
      <Route path="housekeeping" element={<HousekeepingPage />} />
    </Routes>
  );
};

export default FrontDeskModule;