import React from 'react';
import { Typography, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './i18n'; // Initialize i18n
import EnhancedLayout from './components/layout/EnhancedLayout';
// PWA install functionality disabled
// import PWAInstallPrompt from './components/common/PWAInstallPrompt';
// import { usePWAInstall } from './hooks/usePWAInstall';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import HotelSearchPage from './pages/HotelSearchPage';
import SearchResultsPage from './pages/SearchResultsPage';
import HotelListPage from './pages/HotelListPage';
import HotelDetailPage from './pages/HotelDetailPage';
import BookingPage from './pages/BookingPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import FindBookingPage from './pages/FindBookingPage';
import BookingSearchPage from './pages/BookingSearchPage';
import LoginPage from './pages/LoginPage';
import GuestAuthPage from './pages/GuestAuthPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import HotelRegistrationAdmin from './pages/admin/HotelRegistrationAdmin';
import HotelRegistrationForm from './pages/admin/HotelRegistrationForm';
import HotelManagementAdmin from './pages/admin/HotelManagementAdmin';
import TenantManagementAdmin from './pages/admin/TenantManagementAdmin';
import UserManagementAdmin from './pages/admin/UserManagementAdmin';
import UserRegistrationForm from './pages/admin/UserRegistrationForm';
import HotelViewEdit from './pages/admin/HotelViewEdit';
import UserViewEdit from './pages/admin/UserViewEdit';
import HotelAdminDashboard from './pages/hotel-admin/HotelAdminDashboard';
import RoomManagement from './pages/hotel-admin/RoomManagement';
import RoomViewEdit from './pages/hotel-admin/RoomViewEdit';
import StaffManagement from './pages/hotel-admin/StaffManagement';
import StaffDetails from './pages/hotel-admin/StaffDetails';
import StaffScheduleManagement from './components/StaffScheduleManagement';
import StaffScheduleDashboard from './components/StaffScheduleDashboard';
import FrontDeskDashboard from './pages/frontdesk/FrontDeskDashboard';
import FrontDeskUnifiedBookingDetails from './pages/frontdesk/FrontDeskUnifiedBookingDetails';
import HotelAdminBookingDetails from './pages/hotel-admin/HotelAdminBookingDetails';
import BookingManagementPage from './pages/BookingManagementPage';
import GuestBookingManagementPage from './pages/GuestBookingManagementPage';
import { SystemDashboardPage } from './pages/SystemDashboardPage';
import MyBookings from './components/MyBookings';
import OperationsPage from './pages/operations/OperationsPage';
import StaffDashboardPage from './pages/StaffDashboardPage';
import ShopRoutes from './pages/shop/ShopRoutes';
import PublicHotelRegistration from './pages/PublicHotelRegistration';
import UserDebugPage from './pages/UserDebugPage';
import NotificationsPage from './pages/NotificationsPage';

// Role-based Router Component - redirects based on user role
const RoleBasedRouter: React.FC = () => {
  const { user, isAuthenticated, isInitializing } = useAuth();
  
  // Show loading state while authentication is being initialized
  if (isInitializing) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          gap: 2 
        }}
      >
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }
  
  // If user is authenticated, check their roles and redirect to appropriate dashboard
  if (isAuthenticated && user?.roles) {
    // System-wide users (no tenant binding) - SYSTEM_ADMIN or ADMIN without tenantId
    if (user.roles.includes('SYSTEM_ADMIN') || (user.roles.includes('ADMIN') && !user.tenantId)) {
      return <Navigate to="/system-dashboard" replace />;
    }
    
    // Tenant-bound users - redirect to their respective dashboards
    // Priority order: HOTEL_ADMIN > ADMIN (tenant-bound) > FRONTDESK > OPERATIONS_SUPERVISOR > HOUSEKEEPING/MAINTENANCE
    if (user.roles.includes('HOTEL_ADMIN')) {
      return <Navigate to="/hotel-admin/dashboard" replace />;
    }
    
    if (user.roles.includes('ADMIN') && user.tenantId) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    if (user.roles.includes('FRONTDESK')) {
      return <Navigate to="/frontdesk/dashboard" replace />;
    }
    
    if (user.roles.includes('OPERATIONS_SUPERVISOR')) {
      return <Navigate to="/operations/dashboard" replace />;
    }
    
    if (user.roles.includes('HOUSEKEEPING') || user.roles.includes('MAINTENANCE')) {
      return <Navigate to="/staff/dashboard" replace />;
    }
    
    // Legacy single role handling for backward compatibility
    if (user.role === 'SYSTEM_ADMIN') {
      return <Navigate to="/system-dashboard" replace />;
    }
    
    if (user.role === 'HOTEL_ADMIN') {
      return <Navigate to="/hotel-admin/dashboard" replace />;
    }
    
    if (user.role === 'ADMIN' && user.tenantId) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    if (user.role === 'ADMIN' && !user.tenantId) {
      return <Navigate to="/system-dashboard" replace />;
    }
    
    if (user.role === 'FRONTDESK') {
      return <Navigate to="/frontdesk/dashboard" replace />;
    }
    
    if (user.role === 'OPERATIONS_SUPERVISOR') {
      return <Navigate to="/operations/dashboard" replace />;
    }
    
    if (user.role === 'HOUSEKEEPING' || user.role === 'MAINTENANCE') {
      return <Navigate to="/staff/dashboard" replace />;
    }
  }
  
  // For unauthenticated users or users without specific roles, redirect to hotel search
  return <Navigate to="/hotels/search" replace />;
};

// Placeholder Components for Routes
const PlaceholderPage: React.FC<{ title: string; message: string }> = ({ title, message }) => (
  <Box sx={{ textAlign: 'center', py: 8 }}>
    <Typography variant="h4" gutterBottom>{title}</Typography>
    <Typography variant="body1" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

function App() {
  const { isAuthenticated, sessionExpired, clearSessionExpired } = useAuth();
  const location = useLocation();
  // PWA install functionality disabled
  // const { 
  //   showIOSPrompt, 
  //   showAndroidPrompt, 
  //   dismissIOSPrompt, 
  //   dismissAndroidPrompt, 
  //   installApp 
  // } = usePWAInstall();
  
  // Check if we're on a route that should use full width layout
  const isFullWidthRoute = location.pathname.startsWith('/frontdesk') || 
                           location.pathname.startsWith('/hotel-admin') ||
                           location.pathname.startsWith('/admin') ||
                           location.pathname.startsWith('/system-dashboard') ||
                           location.pathname.startsWith('/system/') ||
                           location.pathname.startsWith('/operations') ||
                           location.pathname.startsWith('/staff') ||
                           location.pathname.startsWith('/shop') ||
                           location.pathname.startsWith('/hotels/search') ||
                           location.pathname === '/home';

  const handleSessionExpiredClose = () => {
    clearSessionExpired();
  };
  
  return (
    <>
      {/* Session Expired Dialog */}
      <Dialog
        open={sessionExpired}
        onClose={handleSessionExpiredClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Session Expired</DialogTitle>
        <DialogContent>
          <Typography>
            Your session has expired. Please log in again to continue.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleSessionExpiredClose} 
            color="primary" 
            variant="contained"
            fullWidth
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Main App Content */}
    <EnhancedLayout hideSidebar={!isAuthenticated} maxWidth={isFullWidthRoute ? false : 'xl'}>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        <Route path="/dashboard" element={<RoleBasedRouter />} />
        <Route path="/home" element={<HotelSearchPage />} />
        <Route path="/hotels" element={
          <PlaceholderPage 
            title="Hotels" 
            message="Browse and discover amazing hotels. Feature coming soon!" 
          />
        } />
        <Route path="/hotels/search" element={<HotelSearchPage />} />
        <Route path="/hotels/search-results" element={<HotelListPage />} />
        <Route path="/hotels/:hotelId" element={<HotelDetailPage />} />
        <Route path="/search-results" element={<SearchResultsPage />} />
        <Route path="/find-booking" element={<FindBookingPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/booking-confirmation/:reservationId" element={<BookingConfirmationPage />} />
        <Route path="/booking-management" element={<BookingManagementPage />} />
        <Route path="/guest-booking-management" element={<GuestBookingManagementPage />} />
        <Route path="/booking-search" element={<BookingSearchPage />} />
        <Route path="/search" element={
          <PlaceholderPage 
            title="Legacy Search" 
            message="This page has been replaced. Please use the new Hotel Search." 
          />
        } />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/guest-auth" element={<GuestAuthPage />} />
        <Route path="/register-hotel" element={<PublicHotelRegistration />} />
        <Route path="/register-hotel-admin" element={
          <PlaceholderPage 
            title="Admin Hotel Registration" 
            message="Admin hotel registration coming soon!" 
          />
        } />
        <Route path="/register" element={
          <PlaceholderPage 
            title="Register" 
            message="User registration feature coming soon!" 
          />
        } />
        <Route path="/dashboard" element={
          <PlaceholderPage 
            title="Dashboard" 
            message="User dashboard coming soon!" 
          />
        } />
        <Route path="/bookings" element={
          <PlaceholderPage 
            title="Bookings" 
            message="User bookings dashboard coming soon!" 
          />
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/debug-user" element={
          <ProtectedRoute>
            <UserDebugPage />
          </ProtectedRoute>
        } />
        
        {/* System-Wide User Routes */}
        <Route path="/system-dashboard" element={
          <ProtectedRoute>
            <SystemDashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/system/hotels" element={
          <ProtectedRoute requiredRole="ADMIN">
            <HotelManagementAdmin />
          </ProtectedRoute>
        } />
        <Route path="/system/tenants" element={
          <ProtectedRoute requiredRole="ADMIN">
            <TenantManagementAdmin />
          </ProtectedRoute>
        } />
        <Route path="/system/users" element={
          <ProtectedRoute requiredRole="ADMIN">
            <UserManagementAdmin />
          </ProtectedRoute>
        } />
        <Route path="/system/analytics" element={
          <ProtectedRoute requiredRole="ADMIN">
            <PlaceholderPage 
              title="System Analytics" 
              message="Platform-wide analytics dashboard coming soon!" 
            />
          </ProtectedRoute>
        } />
        <Route path="/system/settings" element={
          <ProtectedRoute requiredRole="ADMIN">
            <PlaceholderPage 
              title="System Settings" 
              message="Global system configuration coming soon!" 
            />
          </ProtectedRoute>
        } />
        <Route path="/my-bookings" element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/hotels" element={
          <ProtectedRoute requiredRole="ADMIN">
            <HotelManagementAdmin />
          </ProtectedRoute>
        } />
        <Route path="/admin/hotels/:id" element={
          <ProtectedRoute requiredRole="ADMIN">
            <HotelViewEdit />
          </ProtectedRoute>
        } />
        <Route path="/admin/hotels/:id/edit" element={
          <ProtectedRoute requiredRole="ADMIN">
            <HotelViewEdit />
          </ProtectedRoute>
        } />
        <Route path="/admin/hotel-registrations" element={
          <ProtectedRoute requiredRole="ADMIN">
            <HotelRegistrationAdmin />
          </ProtectedRoute>
        } />
        <Route path="/admin/register-hotel" element={
          <ProtectedRoute requiredRole="ADMIN">
            <HotelRegistrationForm />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute requiredRole="ADMIN">
            <UserManagementAdmin />
          </ProtectedRoute>
        } />
        <Route path="/admin/users/:id" element={
          <ProtectedRoute requiredRole="ADMIN">
            <UserViewEdit />
          </ProtectedRoute>
        } />
        <Route path="/admin/users/:id/edit" element={
          <ProtectedRoute requiredRole="ADMIN">
            <UserViewEdit />
          </ProtectedRoute>
        } />
        <Route path="/admin/add-user" element={
          <ProtectedRoute requiredRole="ADMIN">
            <UserRegistrationForm />
          </ProtectedRoute>
        } />
        
        {/* Hotel Admin Routes */}
        <Route path="/hotel-admin" element={
          <ProtectedRoute requiredRole="HOTEL_ADMIN">
            <Navigate to="/hotel-admin/dashboard" replace />
          </ProtectedRoute>
        } />
        <Route path="/hotel-admin/dashboard" element={
          <ProtectedRoute requiredRole="HOTEL_ADMIN">
            <HotelAdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/hotel-admin/bookings/:id" element={
          <ProtectedRoute requiredRole="HOTEL_ADMIN">
            <HotelAdminBookingDetails />
          </ProtectedRoute>
        } />
        <Route path="/hotel-admin/bookings/:id/edit" element={
          <ProtectedRoute requiredRole="HOTEL_ADMIN">
            <HotelAdminBookingDetails />
          </ProtectedRoute>
        } />
        <Route path="/hotel-admin/hotel" element={
          <ProtectedRoute requiredRole="HOTEL_ADMIN">
            <PlaceholderPage 
              title="Hotel Management" 
              message="Hotel settings and configuration coming soon!" 
            />
          </ProtectedRoute>
        } />
        <Route path="/hotel-admin/staff" element={
          <ProtectedRoute requiredRole="HOTEL_ADMIN">
            <StaffManagement />
          </ProtectedRoute>
        } />
        <Route path="/hotel-admin/staff/:id" element={
          <ProtectedRoute requiredRole="HOTEL_ADMIN">
            <StaffDetails />
          </ProtectedRoute>
        } />
        <Route path="/hotel-admin/schedules" element={
          <ProtectedRoute requiredRole="HOTEL_ADMIN">
            <StaffScheduleManagement />
          </ProtectedRoute>
        } />
        <Route path="/hotel-admin/schedule-dashboard" element={
          <ProtectedRoute requiredRole="HOTEL_ADMIN">
            <StaffScheduleDashboard />
          </ProtectedRoute>
        } />
        <Route path="/hotel-admin/rooms" element={
          <ProtectedRoute requiredRole="HOTEL_ADMIN">
            <RoomManagement />
          </ProtectedRoute>
        } />
        <Route path="/hotel-admin/rooms/:id" element={
          <ProtectedRoute requiredRole="HOTEL_ADMIN">
            <RoomViewEdit />
          </ProtectedRoute>
        } />
        
        {/* Front Desk Routes */}
        <Route path="/frontdesk" element={
          <ProtectedRoute requiredRole="FRONTDESK">
            <Navigate to="/frontdesk/dashboard" replace />
          </ProtectedRoute>
        } />
        <Route path="/frontdesk/dashboard" element={
          <ProtectedRoute requiredRole="FRONTDESK">
            <FrontDeskDashboard />
          </ProtectedRoute>
        } />
        <Route path="/frontdesk/bookings/:id" element={
          <ProtectedRoute requiredRole="FRONTDESK">
            <FrontDeskUnifiedBookingDetails />
          </ProtectedRoute>
        } />
        <Route path="/frontdesk/bookings/:id/edit" element={
          <ProtectedRoute requiredRole="FRONTDESK">
            <FrontDeskUnifiedBookingDetails />
          </ProtectedRoute>
        } />
        <Route path="/frontdesk/schedules" element={
          <ProtectedRoute requiredRole="FRONTDESK">
            <StaffScheduleDashboard />
          </ProtectedRoute>
        } />
        
        {/* Notifications Route - Accessible by Hotel Admin and Front Desk */}
        <Route path="/notifications" element={
          <ProtectedRoute requiredRoles={['HOTEL_ADMIN', 'FRONTDESK']}>
            <NotificationsPage />
          </ProtectedRoute>
        } />
        
        {/* Shop Routes - Accessible by Hotel Admin and Front Desk */}
        <Route path="/shop/*" element={
          <ProtectedRoute requiredRoles={['HOTEL_ADMIN', 'FRONTDESK']}>
            <ShopRoutes />
          </ProtectedRoute>
        } />
        
        {/* Staff Routes */}
        <Route path="/staff" element={
          <ProtectedRoute requiredRoles={['HOUSEKEEPING', 'MAINTENANCE']}>
            <Navigate to="/staff/dashboard" replace />
          </ProtectedRoute>
        } />
        <Route path="/staff/dashboard" element={
          <ProtectedRoute requiredRoles={['HOUSEKEEPING', 'MAINTENANCE']}>
            <StaffDashboardPage />
          </ProtectedRoute>
        } />
        
        {/* Operations Routes */}
        <Route path="/operations" element={
          <ProtectedRoute requiredRoles={['OPERATIONS_SUPERVISOR', 'MAINTENANCE']}>
            <Navigate to="/operations/dashboard" replace />
          </ProtectedRoute>
        } />
        <Route path="/operations/dashboard" element={
          <ProtectedRoute requiredRoles={['OPERATIONS_SUPERVISOR', 'MAINTENANCE']}>
            <OperationsPage />
          </ProtectedRoute>
        } />
        
        {/* Housekeeping Routes */}
        <Route path="/housekeeping" element={
          <ProtectedRoute requiredRole="HOUSEKEEPING">
            <Navigate to="/housekeeping/schedules" replace />
          </ProtectedRoute>
        } />
        <Route path="/housekeeping/schedules" element={
          <ProtectedRoute requiredRole="HOUSEKEEPING">
            <StaffScheduleDashboard />
          </ProtectedRoute>
        } />
      </Routes>
      
      {/* PWA Install Prompt functionality disabled */}
      {/* 
      <PWAInstallPrompt 
        open={showIOSPrompt} 
        onClose={() => dismissIOSPrompt(false)}
        onPermanentDismiss={() => dismissIOSPrompt(true)}
        deviceType="ios"
      />
      
      <PWAInstallPrompt 
        open={showAndroidPrompt} 
        onClose={() => dismissAndroidPrompt(false)}
        onPermanentDismiss={() => dismissAndroidPrompt(true)}
        deviceType="android"
        onInstall={installApp}
      />
      */}
    </EnhancedLayout>
    </>
  );
}

export default App;
