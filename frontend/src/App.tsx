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
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import HotelRegistrationAdmin from './pages/admin/HotelRegistrationAdmin';
import HotelRegistrationForm from './pages/admin/HotelRegistrationForm';
import HotelManagementAdmin from './pages/admin/HotelManagementAdmin';
import UserManagementAdmin from './pages/admin/UserManagementAdmin';
import UserRegistrationForm from './pages/admin/UserRegistrationForm';
import HotelAdminDashboard from './pages/hotel-admin/HotelAdminDashboard';

// Home Page Router Component - redirects based on user role
const HomePageRouter: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  // If user is authenticated, check their roles
  if (isAuthenticated && user?.roles) {
    // Priority order: ADMIN (system admin) > HOTEL_ADMIN
    if (user.roles.includes('ADMIN')) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    if (user.roles.includes('HOTEL_ADMIN')) {
      return <Navigate to="/hotel-admin/dashboard" replace />;
    }
    
    // Legacy role handling for backward compatibility
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    if (user.role === 'HOTEL_ADMIN') {
      return <Navigate to="/hotel-admin/dashboard" replace />;
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
const HotelsPage: React.FC = () => (
  <Box sx={{ textAlign: 'center', py: 8 }}>
    <HotelIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
    <Typography variant="h4" gutterBottom>Hotels</Typography>
    <Typography variant="body1" color="text.secondary">
      Browse and discover amazing hotels. Coming soon!
    </Typography>
  </Box>
);

const SearchPage: React.FC = () => (
  <Box sx={{ textAlign: 'center', py: 8 }}>
    <Typography variant="h4" gutterBottom>Legacy Search</Typography>
    <Typography variant="body1" color="text.secondary">
      This page has been replaced. Please use the new Hotel Search.
    </Typography>
  </Box>
);

const RegisterPage: React.FC = () => (
  <Box sx={{ textAlign: 'center', py: 8 }}>
    <Typography variant="h4" gutterBottom>Register</Typography>
    <Typography variant="body1" color="text.secondary">
      User registration coming soon!
    </Typography>
  </Box>
);

const DashboardPage: React.FC = () => (
  <Box sx={{ textAlign: 'center', py: 8 }}>
    <Typography variant="h4" gutterBottom>Dashboard</Typography>
    <Typography variant="body1" color="text.secondary">
      User dashboard coming soon!
    </Typography>
  </Box>
);

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePageRouter />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/hotels" element={<HotelsPage />} />
        <Route path="/hotels/search" element={<HotelSearchPage />} />
        <Route path="/search-results" element={<SearchResultsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/bookings" element={<DashboardPage />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
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
        <Route path="/hotel-admin/hotel" element={
          <ProtectedRoute requiredRole="HOTEL_ADMIN">
            <div>Hotel Management - Coming Soon</div>
          </ProtectedRoute>
        } />
        <Route path="/hotel-admin/staff" element={
          <ProtectedRoute requiredRole="HOTEL_ADMIN">
            <div>Staff Management - Coming Soon</div>
          </ProtectedRoute>
        } />
        <Route path="/hotel-admin/rooms" element={
          <ProtectedRoute requiredRole="HOTEL_ADMIN">
            <div>Room Management - Coming Soon</div>
          </ProtectedRoute>
        } />
      </Routes>
    </Layout>
  );
}

export default App;
