import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

const StaffDashboardPage = lazy(() => import('../pages/StaffDashboardPage'));

/**
 * Staff Module - Housekeeping and Maintenance routes
 */
const StaffModule: React.FC = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<StaffDashboardPage />} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default StaffModule;
