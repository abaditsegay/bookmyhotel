import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load shop pages
const ShopRoutes = React.lazy(() => import('../pages/shop/ShopRoutes'));

const ShopModule: React.FC = () => {
  return (
    <Routes>
      <Route path="/shop/*" element={<ShopRoutes />} />
    </Routes>
  );
};

export default ShopModule;