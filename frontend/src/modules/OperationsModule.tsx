import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load operations pages
const OperationsPage = React.lazy(() => import('../pages/operations/OperationsPage'));

const OperationsModule: React.FC = () => {
  return (
    <Routes>
      <Route path="/operations" element={<OperationsPage />} />
    </Routes>
  );
};

export default OperationsModule;