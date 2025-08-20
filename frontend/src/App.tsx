import React from 'react';
import { Typography, Box, Button, Grid, Card, CardContent } from '@mui/material';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { 
  Hotel as HotelIcon, 
  Security as SecurityIcon,
  Speed as SpeedIcon,
  CloudQueue as CloudIcon 
} from '@mui/icons-material';
import { Layout } from './components/layout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import HotelSearchPage from './pages/HotelSearchPage';
import SearchResultsPage from './pages/SearchResultsPage';
import BookingPage from './pages/BookingPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import FindBookingPage from './pages/FindBookingPage';
import BookingSearchPage from './pages/BookingSearchPage';
import LoginPage from './pages/LoginPage';
import GuestAuthPage from './pages/GuestAuthPage';
import ProfilePage from './pages/ProfilePage';
import PublicHotelRegistration from './pages/PublicHotelRegistration';
import PublicAdminHotelRegistration from './pages/PublicAdminHotelRegistration';
import AdminDashboard from './pages/admin/AdminDashboard';
import HotelRegistrationAdmin from './pages/admin/HotelRegistrationAdmin';
import HotelRegistrationForm from './pages/admin/HotelRegistrationForm';
import HotelManagementAdmin from './pages/admin/HotelManagementAdmin';
import TenantManagementAdmin from './pages/admin/TenantManagementAdmin';
import UserManagementAdmin from './pages/admin/UserManagementAdmin';
import UserRegistrationForm from './pages/admin/UserRegistrationForm';
import HotelViewEdit from './pages/admin/HotelViewEdit';
import UserViewEdit from './pages/admin/UserViewEdit';
import BookingViewEdit from './pages/admin/BookingViewEdit';
import HotelAdminDashboard from './pages/hotel-admin/HotelAdminDashboard';
import RoomManagement from './pages/hotel-admin/RoomManagement';
import RoomViewEdit from './pages/hotel-admin/RoomViewEdit';
import StaffManagement from './pages/hotel-admin/StaffManagement';
import StaffDetails from './pages/hotel-admin/StaffDetails';
import FrontDeskDashboard from './pages/frontdesk/FrontDeskDashboard';
import FrontDeskBookingDetails from './pages/frontdesk/FrontDeskBookingDetails';
import BookingManagementPage from './pages/BookingManagementPage';
import GuestBookingManagementPage from './pages/GuestBookingManagementPage';
import { SystemDashboardPage } from './pages/SystemDashboardPage';

// Home Page Router Component - redirects based on user role
const HomePageRouter: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  // If user is authenticated, check their roles
  if (isAuthenticated && user?.roles) {
    // Check if user is system-wide (no tenant binding)
    if (user.isSystemWide) {
      if (user.roles.includes('ADMIN')) {
        return <Navigate to="/system-dashboard" replace />;
      }
      if (user.roles.includes('GUEST')) {
        return <Navigate to="/system-dashboard" replace />;
      }
    }
    
    // For tenant-bound users
    // Priority order: ADMIN (system admin) > HOTEL_ADMIN > FRONTDESK
    if (user.roles.includes('ADMIN') && !user.isSystemWide) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    if (user.roles.includes('HOTEL_ADMIN')) {
      return <Navigate to="/hotel-admin/dashboard" replace />;
    }
    
    if (user.roles.includes('FRONTDESK')) {
      return <Navigate to="/frontdesk/dashboard" replace />;
    }
    
    // Legacy role handling for backward compatibility
    if (user.role === 'ADMIN' && !user.isSystemWide) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    if (user.role === 'HOTEL_ADMIN') {
      return <Navigate to="/hotel-admin/dashboard" replace />;
    }
    
    if (user.role === 'FRONTDESK') {
      return <Navigate to="/frontdesk/dashboard" replace />;
    }
  }
  
  // For all other users (including unauthenticated), show hotel search page
  return <HotelSearchPage />;
};

// Home Page Component
const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <HotelIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Multi-Tenant Architecture',
      description: 'Secure tenant isolation with shared database architecture for efficient resource utilization.',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Enterprise Security',
      description: 'JWT authentication, role-based access control, and comprehensive audit logging.',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'High Performance',
      description: 'Optimized queries, caching strategies, and reactive frontend for lightning-fast booking.',
    },
    {
      icon: <CloudIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Cloud Native',
      description: 'Docker containerization, health checks, and monitoring for production deployment.',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          py: 8,
          mb: 6,
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => navigate('/hotels')}
            sx={{ px: 4, py: 1.5, fontSize: '1.1rem', borderRadius: 3 }}
          >
            Browse Hotels
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            size="large"
            onClick={() => navigate('/hotels/search')}
            sx={{ 
              px: 4, 
              py: 1.5, 
              fontSize: '1.1rem', 
              borderRadius: 3,
              borderColor: 'rgba(255, 255, 255, 0.5)',
              '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            Search Hotels
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            size="large"
            onClick={() => navigate('/register-hotel-admin')}
            sx={{ 
              px: 4, 
              py: 1.5, 
              fontSize: '1.1rem', 
              borderRadius: 3,
              borderColor: 'rgba(255, 255, 255, 0.5)',
              '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            Register Your Hotel
          </Button>
        </Box>
      </Box>

      {/* Features Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 'bold' }}>
          Built for the Modern Enterprise
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  textAlign: 'center', 
                  p: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Tech Stack Section */}
      <Box
        sx={{
          backgroundColor: 'grey.50',
          p: 4,
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Technology Stack
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
              � Backend
            </Typography>
            <Typography variant="body2">Spring Boot 3.2.2 with Java 17</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
              ⚛️ Frontend
            </Typography>
            <Typography variant="body2">React 18 with TypeScript</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
              🗄️ Database
            </Typography>
            <Typography variant="body2">MySQL 8.0 with Flyway</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
              🐳 Infrastructure
            </Typography>
            <Typography variant="body2">Docker with Monitoring</Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
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
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePageRouter />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/hotels" element={
          <PlaceholderPage 
            title="Hotels" 
            message="Browse and discover amazing hotels. Feature coming soon!" 
          />
        } />
        <Route path="/hotels/search" element={<HotelSearchPage />} />
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
        <Route path="/register-hotel-admin" element={<PublicAdminHotelRegistration />} />
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
            <PlaceholderPage 
              title="My Bookings" 
              message="Your booking history across all hotels coming soon!" 
            />
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
            <BookingViewEdit />
          </ProtectedRoute>
        } />
        <Route path="/hotel-admin/bookings/:id/edit" element={
          <ProtectedRoute requiredRole="HOTEL_ADMIN">
            <BookingViewEdit />
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
            <FrontDeskBookingDetails />
          </ProtectedRoute>
        } />
        <Route path="/frontdesk/bookings/:id/edit" element={
          <ProtectedRoute requiredRole="FRONTDESK">
            <FrontDeskBookingDetails />
          </ProtectedRoute>
        } />
      </Routes>
    </Layout>
  );
}

export default App;
