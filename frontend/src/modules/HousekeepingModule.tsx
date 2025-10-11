import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load housekeeping components
const HousekeepingPage = React.lazy(() => import('../pages/housekeeping/HousekeepingPage'));

/**
 * Housekeeping Module - Housekeeping operations routes
 * Lazy loaded for better performance
 */
const HousekeepingModule: React.FC = () => {
  return (
    <Routes>
      <Route index element={<HousekeepingPage />} />
    </Routes>
  );
};

export default HousekeepingModule;