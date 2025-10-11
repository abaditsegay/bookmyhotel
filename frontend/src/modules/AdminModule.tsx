import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load admin components
const AdminDashboard = React.lazy(() => import('../pages/admin/AdminDashboard'));
const HotelRegistrationAdmin = React.lazy(() => import('../pages/admin/HotelRegistrationAdmin'));
const HotelRegistrationForm = React.lazy(() => import('../pages/admin/HotelRegistrationForm'));
const HotelManagementAdmin = React.lazy(() => import('../pages/admin/HotelManagementAdmin'));
const TenantManagementAdmin = React.lazy(() => import('../pages/admin/TenantManagementAdmin'));
const UserManagementAdmin = React.lazy(() => import('../pages/admin/UserManagementAdmin'));
const UserRegistrationForm = React.lazy(() => import('../pages/admin/UserRegistrationForm'));
const UserViewEdit = React.lazy(() => import('../pages/admin/UserViewEdit'));
const HotelViewEdit = React.lazy(() => import('../pages/admin/HotelViewEdit'));

/**
 * Admin Module - System administration routes
 * Lazy loaded for better performance
 */
const AdminModule: React.FC = () => {
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="hotels" element={<HotelRegistrationAdmin />} />
      <Route path="hotels/new" element={<HotelRegistrationForm />} />
      <Route path="hotels/manage" element={<HotelManagementAdmin />} />
      <Route path="hotels/:id" element={<HotelViewEdit />} />
      <Route path="tenants" element={<TenantManagementAdmin />} />
      <Route path="users" element={<UserManagementAdmin />} />
      <Route path="users/new" element={<UserRegistrationForm />} />
      <Route path="users/:id" element={<UserViewEdit />} />
    </Routes>
  );
};

export default AdminModule;