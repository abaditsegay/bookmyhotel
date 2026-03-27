import React, { lazy, Suspense } from 'react';
import { Typography, Box, CircularProgress } from '@mui/material';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import './i18n'; // Initialize i18n
import EnhancedLayout from './components/layout/EnhancedLayout';
import AdminLayout from './components/layout/AdminLayout';
import { ErrorBoundary } from './components/common';
import { NotificationProvider } from './components/common';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
// Eager-loaded components (small or critical)
import NotFoundPage from './pages/NotFoundPage';
import { SystemDashboardPage } from './pages/SystemDashboardPage';
import MyBookings from './components/MyBookings';
import HousekeepingPage from './pages/housekeeping/HousekeepingPage';
import OperationsPage from './pages/operations/OperationsPage';
import StaffDashboardPage from './pages/StaffDashboardPage';
import ShopRoutes from './pages/shop/ShopRoutes';
import PublicHotelRegistration from './pages/PublicHotelRegistration';
import LandingPage from './pages/LandingPage';
import NotificationsPage from './pages/NotificationsPage';

// Retry wrapper for lazy imports — handles stale chunk errors after deployment
function lazyWithRetry(importFn: () => Promise<any>) {
  return lazy(() =>
    importFn().catch((error: Error) => {
      // Only reload once to avoid infinite loops
      const hasReloaded = sessionStorage.getItem('chunk_reload');
      if (!hasReloaded) {
        sessionStorage.setItem('chunk_reload', '1');
        window.location.reload();
        return new Promise(() => {}); // never resolves — page is reloading
      }
      sessionStorage.removeItem('chunk_reload');
      throw error;
    })
  );
}

// Lazy load all page components for code splitting
const HotelSearchPage = lazyWithRetry(() => import('./pages/HotelSearchPage'));
const SearchResultsPage = lazyWithRetry(() => import('./pages/SearchResultsPage'));
const HotelListPage = lazyWithRetry(() => import('./pages/HotelListPage'));
const HotelDetailPage = lazyWithRetry(() => import('./pages/HotelDetailPage'));
const BookingPage = lazyWithRetry(() => import('./pages/BookingPage'));
const BookingConfirmationPage = lazyWithRetry(() => import('./pages/BookingConfirmationPage'));
const FindBookingPage = lazyWithRetry(() => import('./pages/FindBookingPage'));
const BookingSearchPage = lazyWithRetry(() => import('./pages/BookingSearchPage'));
const LoginPage = lazyWithRetry(() => import('./pages/LoginPage'));
const GuestAuthPage = lazyWithRetry(() => import('./pages/GuestAuthPage'));
const ForgotPasswordPage = lazyWithRetry(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazyWithRetry(() => import('./pages/ResetPasswordPage'));
const ProfilePage = lazyWithRetry(() => import('./pages/ProfilePage'));
const AccountStatusPage = lazyWithRetry(() => import('./pages/AccountStatusPage'));

// Admin pages
const AdminDashboard = lazyWithRetry(() => import('./pages/admin/AdminDashboard'));
const HotelRegistrationAdmin = lazyWithRetry(() => import('./pages/admin/HotelRegistrationAdmin'));
const HotelRegistrationForm = lazyWithRetry(() => import('./pages/admin/HotelRegistrationForm'));
const HotelManagementAdmin = lazyWithRetry(() => import('./pages/admin/HotelManagementAdmin'));
const UserManagementAdmin = lazyWithRetry(() => import('./pages/admin/UserManagementAdmin'));
const UserRegistrationForm = lazyWithRetry(() => import('./pages/admin/UserRegistrationForm'));
const UserViewEdit = lazyWithRetry(() => import('./pages/admin/UserViewEdit'));
const HotelViewEdit = lazyWithRetry(() => import('./pages/admin/HotelViewEdit'));
const SystemSettingsPage = lazyWithRetry(() => import('./pages/admin/SystemSettingsPage'));
const HotelOnboarding = lazyWithRetry(() => import('./pages/HotelOnboarding'));

// Hotel Admin pages
const HotelAdminDashboard = lazyWithRetry(() => import('./pages/hotel-admin/HotelAdminDashboard'));
const MyRegistrationPage = lazyWithRetry(() => import('./pages/hotel-admin/MyRegistrationPage'));
const RoomManagement = lazyWithRetry(() => import('./pages/hotel-admin/RoomManagement'));
const RoomViewEdit = lazyWithRetry(() => import('./pages/hotel-admin/RoomViewEdit'));
const StaffManagement = lazyWithRetry(() => import('./pages/hotel-admin/StaffManagement'));
const StaffDetails = lazyWithRetry(() => import('./pages/hotel-admin/StaffDetails'));
const HotelAdminBookingDetails = lazyWithRetry(() => import('./pages/hotel-admin/HotelAdminBookingDetails'));

// Front Desk pages
const FrontDeskDashboard = lazyWithRetry(() => import('./pages/frontdesk/FrontDeskDashboard'));
const FrontDeskUnifiedBookingDetails = lazyWithRetry(() => import('./pages/frontdesk/FrontDeskUnifiedBookingDetails'));

// Debug pages
const RoleDashboardDebug = lazyWithRetry(() => import('./pages/RoleDashboardDebug'));

// Booking Management
const BookingManagementPage = lazyWithRetry(() => import('./pages/BookingManagementPage'));
const GuestBookingManagementPage = lazy(() => import('./pages/GuestBookingManagementPage'));

// Staff components
const StaffScheduleManagement = lazy(() => import('./components/StaffScheduleManagement'));
const StaffScheduleDashboard = lazy(() => import('./components/StaffScheduleDashboard'));
const ErrorBoundaryDemo = lazy(() => import('./components/demo').then(m => ({ default: m.ErrorBoundaryDemo })));

// Loading fallback component
const PageLoader: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      flexDirection: 'column',
      gap: 2,
    }}
  >
    <CircularProgress size={60} />
    <Typography variant="body1" color="text.secondary">
      Loading...
    </Typography>
  </Box>
);

// Lazy load SystemModule for better performance
const SystemModule = React.lazy(() => import('./modules/SystemModule'));

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
    // System-wide users (no tenant binding) - SUPER_ADMIN or ADMIN without tenantId
    if (user.roles.includes('SUPER_ADMIN') || (user.roles.includes('ADMIN') && !user.tenantId)) {
      return <Navigate to="/system-dashboard" replace />;
    }
    
    // Tenant-bound users - redirect to their respective dashboards
    // Priority order: HOTEL_ADMIN > ADMIN (tenant-bound) > FRONTDESK > OPERATIONAL_ADMIN > HOUSEKEEPING/MAINTENANCE
    if (user.roles.includes('HOTEL_ADMIN')) {
      return <Navigate to="/hotel-admin/dashboard" replace />;
    }
    
    if (user.roles.includes('ADMIN') && user.tenantId) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    if (user.roles.includes('FRONTDESK')) {
      return <Navigate to="/frontdesk/dashboard" replace />;
    }
    
    if (user.roles.includes('OPERATIONAL_ADMIN')) {
      return <Navigate to="/operations/dashboard" replace />;
    }
    
    if (user.roles.includes('HOUSEKEEPING') || user.roles.includes('MAINTENANCE')) {
      return <Navigate to="/staff/dashboard" replace />;
    }
    
    // Legacy single role handling for backward compatibility
    if (user.role === 'SUPER_ADMIN') {
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
    
    if (user.role === 'OPERATIONAL_ADMIN') {
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
  const { isAuthenticated } = useAuth();
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
                           location.pathname.startsWith('/notifications') ||
                           location.pathname.startsWith('/hotels/search') ||
                           location.pathname === '/home';

  return (
    <>
      <SnackbarProvider 
        maxSnack={3}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        autoHideDuration={3000}
      >
        <NotificationProvider>
          <ErrorBoundary 
            level="critical"
            showDetails={process.env.NODE_ENV === 'development'}
            onError={(error, errorInfo) => {
              // console.error('Critical App Error:', error, errorInfo);
              // In production, send to error tracking service
            }}
          >
          <EnhancedLayout hideSidebar={!isAuthenticated} maxWidth={isFullWidthRoute ? false : 'xl'}>
          <Suspense fallback={<PageLoader />}>
          <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/dashboard" element={<RoleBasedRouter />} />
        <Route path="/home" element={<LandingPage />} />
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
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/guest-auth" element={<GuestAuthPage />} />
        <Route path="/account-status" element={<AccountStatusPage />} />
        {/* Development Demo Routes - only available in development mode */}
        {process.env.NODE_ENV === 'development' && (
          <Route path="/demo/error-boundary" element={<ErrorBoundaryDemo />} />
        )}
        <Route path="/register-hotel" element={<PublicHotelRegistration />} />
        {/* Business onboarding — shared by system admin, not linked from public nav */}
        <Route path="/business-onboarding" element={<PublicHotelRegistration />} />
        <Route path="/hotel-onboarding" element={
          <ProtectedRoute>
            <HotelOnboarding />
          </ProtectedRoute>
        } />
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
        
        {/* System-Wide User Routes — wrapped in AdminLayout for persistent sidebar */}
        <Route path="/system-dashboard" element={
          <ProtectedRoute>
            <AdminLayout>
              <SystemDashboardPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/system/*" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminLayout>
              <React.Suspense fallback={<div>Loading...</div>}>
                <SystemModule />
              </React.Suspense>
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/system/hotels" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminLayout>
              <HotelManagementAdmin />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/system/users" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminLayout>
              <UserManagementAdmin />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/system/analytics" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminLayout>
              <PlaceholderPage 
                title="System Analytics" 
                message="Platform-wide analytics dashboard coming soon!" 
              />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/system/settings" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminLayout>
              <SystemSettingsPage />
            </AdminLayout>
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
        <Route path="/hotel-admin/my-registration" element={
          <ProtectedRoute requiredRole="HOTEL_ADMIN">
            <MyRegistrationPage />
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
        <Route path="/hotel-admin/housekeeping" element={
          <ProtectedRoute requiredRoles={['HOTEL_ADMIN', 'FRONTDESK', 'HOUSEKEEPING', 'OPERATIONAL_ADMIN']}>
            <HousekeepingPage />
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
        <Route path="/frontdesk/housekeeping" element={
          <ProtectedRoute requiredRoles={['HOTEL_ADMIN', 'FRONTDESK', 'HOUSEKEEPING', 'OPERATIONAL_ADMIN']}>
            <HousekeepingPage />
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
          <ProtectedRoute requiredRoles={['OPERATIONAL_ADMIN', 'MAINTENANCE']}>
            <Navigate to="/operations/dashboard" replace />
          </ProtectedRoute>
        } />
        <Route path="/operations/dashboard" element={
          <ProtectedRoute requiredRoles={['OPERATIONAL_ADMIN', 'MAINTENANCE']}>
            <OperationsPage />
          </ProtectedRoute>
        } />
        
        {/* Housekeeping Routes - Accessible by Hotel Admin, Front Desk, and Housekeeping Staff */}
        <Route path="/housekeeping" element={
          <ProtectedRoute requiredRoles={['HOTEL_ADMIN', 'FRONTDESK', 'HOUSEKEEPING', 'OPERATIONAL_ADMIN']}>
            <Navigate to="/housekeeping/dashboard" replace />
          </ProtectedRoute>
        } />
        <Route path="/housekeeping/dashboard" element={
          <ProtectedRoute requiredRoles={['HOTEL_ADMIN', 'FRONTDESK', 'HOUSEKEEPING', 'OPERATIONAL_ADMIN']}>
            <HousekeepingPage />
          </ProtectedRoute>
        } />
        <Route path="/housekeeping/schedules" element={
          <ProtectedRoute requiredRoles={['HOTEL_ADMIN', 'FRONTDESK', 'HOUSEKEEPING', 'OPERATIONAL_ADMIN']}>
            <StaffScheduleDashboard />
          </ProtectedRoute>
        } />
        
        {/* Debug Route for Dashboard Testing */}
        <Route path="/debug/role-dashboard" element={<RoleDashboardDebug />} />
        
        {/* Catch-all route for 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
      
      {/* PWA Install Prompt functionality disabled 
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
      </ErrorBoundary>
      </NotificationProvider>
      </SnackbarProvider>
    </>
  );
}

export default App;
