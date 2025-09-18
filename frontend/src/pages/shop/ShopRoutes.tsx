import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ShopDashboard from '../../components/shop/ShopDashboard';
import ProductManagement from '../../components/shop/ProductManagement';
import OrderManagement from '../../components/shop/OrderManagement';
import OrderCreation from '../../components/shop/OrderCreation';

const ShopRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ShopDashboard />} />
      <Route path="dashboard" element={<ShopDashboard />} />
      <Route path="products" element={<ProductManagement />} />
      <Route path="orders" element={<OrderManagement />} />
      <Route path="new-order" element={<OrderCreation />} />
    </Routes>
  );
};

export default ShopRoutes;
