import React, { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  Container,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Dashboard,
  Hotel,
  People,
  TrendingUp,
  Settings,
  Business,
  Refresh,
  BarChart as BarChartIcon,
  Description as ApiIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { MetricCard, BarChart, DonutChart } from '../components/common/DataVisualization';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BookIcon from '@mui/icons-material/Book';
import { designSystem } from '../theme/designSystem';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TokenManager from '../utils/tokenManager';
import { apiClient } from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/apiConfig';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`system-dashboard-tabpanel-${index}`}
      aria-labelledby={`system-dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

/**
 * Dashboard page for system-wide users (ADMIN and CUSTOMER roles)
 * Shows different content based on user role
 */
export const SystemDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [apiSearchQuery, setApiSearchQuery] = useState('');

  // Define all API endpoints
  const allEndpoints = [
    // Authentication & Session Management
    { method: 'POST', path: '/managemyhotel/api/auth/login', description: 'User authentication' },
    { method: 'POST', path: '/managemyhotel/api/auth/logout', description: 'User logout' },
    { method: 'POST', path: '/managemyhotel/api/auth/register', description: 'User registration' },
    { method: 'POST', path: '/managemyhotel/api/auth/refresh', description: 'Refresh JWT token' },
    { method: 'POST', path: '/managemyhotel/api/auth/session-status', description: 'Check session status' },
    
    // System Admin - Hotel Management
    { method: 'GET', path: '/managemyhotel/api/admin/hotels', description: 'Get all hotels (admin)' },
    { method: 'POST', path: '/managemyhotel/api/admin/hotels', description: 'Create new hotel (admin)' },
    { method: 'GET', path: '/managemyhotel/api/admin/hotels/{id}', description: 'Get hotel by ID (admin)' },
    { method: 'PUT', path: '/managemyhotel/api/admin/hotels/{id}', description: 'Update hotel (admin)' },
    { method: 'DELETE', path: '/managemyhotel/api/admin/hotels/{id}', description: 'Delete hotel (admin)' },
    { method: 'GET', path: '/managemyhotel/api/admin/hotels/search', description: 'Search hotels (admin)' },
    { method: 'POST', path: '/managemyhotel/api/admin/hotels/{id}/toggle-status', description: 'Toggle hotel status' },
    
    // System Admin - User Management
    { method: 'GET', path: '/managemyhotel/api/admin/users', description: 'Get all users (admin)' },
    { method: 'POST', path: '/managemyhotel/api/admin/users', description: 'Create user (admin)' },
    { method: 'GET', path: '/managemyhotel/api/admin/users/{id}', description: 'Get user by ID (admin)' },
    { method: 'PUT', path: '/managemyhotel/api/admin/users/{id}', description: 'Update user (admin)' },
    { method: 'DELETE', path: '/managemyhotel/api/admin/users/{id}', description: 'Delete user (admin)' },
    { method: 'GET', path: '/managemyhotel/api/admin/users/search', description: 'Search users (admin)' },
    { method: 'POST', path: '/managemyhotel/api/admin/users/{id}/toggle-status', description: 'Toggle user status' },
    
    // System Admin - Tenant Management
    { method: 'GET', path: '/managemyhotel/api/admin/tenants', description: 'Get all tenants (admin)' },
    { method: 'POST', path: '/managemyhotel/api/admin/tenants', description: 'Create tenant (admin)' },
    { method: 'GET', path: '/managemyhotel/api/admin/tenants/{id}', description: 'Get tenant by ID (admin)' },
    { method: 'PUT', path: '/managemyhotel/api/admin/tenants/{id}', description: 'Update tenant (admin)' },
    { method: 'DELETE', path: '/managemyhotel/api/admin/tenants/{id}', description: 'Delete tenant (admin)' },
    { method: 'POST', path: '/managemyhotel/api/admin/tenants/{id}/toggle-status', description: 'Toggle tenant status' },
    
    // Hotel Registration Management
    { method: 'GET', path: '/managemyhotel/api/admin/hotel-registrations', description: 'Get hotel registrations' },
    { method: 'GET', path: '/managemyhotel/api/admin/hotel-registrations/pending', description: 'Get pending registrations' },
    { method: 'POST', path: '/managemyhotel/api/admin/hotel-registrations/{id}/approve', description: 'Approve hotel registration' },
    { method: 'POST', path: '/managemyhotel/api/admin/hotel-registrations/{id}/reject', description: 'Reject hotel registration' },
    
    // System User Management
    { method: 'GET', path: '/managemyhotel/api/system-users', description: 'Get system users' },
    { method: 'GET', path: '/managemyhotel/api/system-users/guests', description: 'Get global guests' },
    { method: 'GET', path: '/managemyhotel/api/system-users/admins', description: 'Get system admins' },
    { method: 'POST', path: '/managemyhotel/api/system-users/promote', description: 'Promote to system admin' },
    { method: 'POST', path: '/managemyhotel/api/system-users/demote', description: 'Demote from system admin' },
    
    // Hotel Search & Public Access
    { method: 'GET', path: '/managemyhotel/api/hotels', description: 'Get all hotels with filtering' },
    { method: 'POST', path: '/managemyhotel/api/hotels/search', description: 'Search hotels' },
    { method: 'GET', path: '/managemyhotel/api/hotels/{id}', description: 'Get hotel by ID' },
    { method: 'GET', path: '/managemyhotel/api/hotels/{id}/rooms', description: 'Get hotel rooms' },
    { method: 'GET', path: '/managemyhotel/api/hotels/random', description: 'Get random hotels' },
    
    // Booking Management
    { method: 'GET', path: '/managemyhotel/api/bookings', description: 'Get bookings with filtering' },
    { method: 'POST', path: '/managemyhotel/api/bookings', description: 'Create new booking' },
    { method: 'GET', path: '/managemyhotel/api/bookings/{id}', description: 'Get booking by ID' },
    { method: 'PUT', path: '/managemyhotel/api/bookings/{id}', description: 'Update booking' },
    { method: 'DELETE', path: '/managemyhotel/api/bookings/{id}', description: 'Delete booking' },
    { method: 'GET', path: '/managemyhotel/api/bookings/search', description: 'Search bookings' },
    { method: 'PUT', path: '/managemyhotel/api/bookings/modify', description: 'Modify booking' },
    { method: 'POST', path: '/managemyhotel/api/bookings/cancel', description: 'Cancel booking' },
    
    // Front Desk Operations
    { method: 'GET', path: '/managemyhotel/api/front-desk/bookings', description: 'Get front desk bookings' },
    { method: 'POST', path: '/managemyhotel/api/front-desk/bookings/{id}/checkin', description: 'Check-in guest' },
    { method: 'POST', path: '/managemyhotel/api/front-desk/bookings/{id}/checkout', description: 'Check-out guest' },
    { method: 'PUT', path: '/managemyhotel/api/front-desk/bookings/{id}/room-assignment', description: 'Assign room' },
    { method: 'PUT', path: '/managemyhotel/api/front-desk/bookings/{id}/status', description: 'Update booking status' },
    { method: 'GET', path: '/managemyhotel/api/front-desk/rooms', description: 'Get front desk rooms' },
    { method: 'PUT', path: '/managemyhotel/api/front-desk/rooms/{id}/status', description: 'Update room status' },
    { method: 'POST', path: '/managemyhotel/api/front-desk/walk-in-booking', description: 'Create walk-in booking' },
    
    // Hotel Admin Operations
    { method: 'GET', path: '/managemyhotel/api/hotel-admin/hotel', description: 'Get hotel admin hotel' },
    { method: 'PUT', path: '/managemyhotel/api/hotel-admin/hotel', description: 'Update hotel admin hotel' },
    { method: 'GET', path: '/managemyhotel/api/hotel-admin/staff', description: 'Get hotel staff' },
    { method: 'POST', path: '/managemyhotel/api/hotel-admin/staff', description: 'Create staff member' },
    { method: 'GET', path: '/managemyhotel/api/hotel-admin/rooms', description: 'Get hotel admin rooms' },
    { method: 'POST', path: '/managemyhotel/api/hotel-admin/rooms', description: 'Create room' },
    { method: 'GET', path: '/managemyhotel/api/hotel-admin/statistics', description: 'Get hotel statistics' },
    { method: 'GET', path: '/managemyhotel/api/hotel-admin/bookings', description: 'Get hotel bookings' },
    
    // Todo Management
    { method: 'GET', path: '/managemyhotel/api/todos', description: 'Get todos' },
    { method: 'POST', path: '/managemyhotel/api/todos', description: 'Create todo' },
    { method: 'GET', path: '/managemyhotel/api/todos/{id}', description: 'Get todo by ID' },
    { method: 'PUT', path: '/managemyhotel/api/todos/{id}', description: 'Update todo' },
    { method: 'DELETE', path: '/managemyhotel/api/todos/{id}', description: 'Delete todo' },
    { method: 'PATCH', path: '/managemyhotel/api/todos/{id}/toggle', description: 'Toggle todo status' },
    { method: 'GET', path: '/managemyhotel/api/todos/filtered', description: 'Get filtered todos' },
    { method: 'GET', path: '/managemyhotel/api/todos/overdue', description: 'Get overdue todos' },
    
    // Notification Management
    { method: 'GET', path: '/managemyhotel/api/notifications', description: 'Get notifications' },
    { method: 'GET', path: '/managemyhotel/api/notifications/recent', description: 'Get recent notifications' },
    { method: 'GET', path: '/managemyhotel/api/notifications/unread-count', description: 'Get unread count' },
    { method: 'PUT', path: '/managemyhotel/api/notifications/{id}/read', description: 'Mark notification as read' },
    { method: 'PUT', path: '/managemyhotel/api/notifications/mark-all-read', description: 'Mark all as read' },
    
    // Room Charges & Pricing
    { method: 'GET', path: '/managemyhotel/api/room-charges/hotel/{id}', description: 'Get room charges' },
    { method: 'POST', path: '/managemyhotel/api/room-charges', description: 'Create room charge' },
    { method: 'PUT', path: '/managemyhotel/api/room-charges/{id}/mark-paid', description: 'Mark charge as paid' },
    { method: 'POST', path: '/managemyhotel/api/pricing/calculate', description: 'Calculate pricing' },
    { method: 'GET', path: '/managemyhotel/api/pricing/validate-promo', description: 'Validate promo code' },
    
    // Hotel Pricing Configuration
    { method: 'GET', path: '/managemyhotel/api/hotel-admin/pricing-config/hotel/{id}/active', description: 'Get active pricing config' },
    { method: 'POST', path: '/managemyhotel/api/hotel-admin/pricing-config/hotel/{id}', description: 'Create pricing config' },
    { method: 'PUT', path: '/managemyhotel/api/hotel-admin/pricing-config/{id}', description: 'Update pricing config' },
    
    // Shop & Inventory Management
    { method: 'GET', path: '/managemyhotel/api/hotels/{id}/shop/orders', description: 'Get shop orders' },
    { method: 'POST', path: '/managemyhotel/api/hotels/{id}/shop/orders', description: 'Create shop order' },
    { method: 'GET', path: '/managemyhotel/api/hotels/{id}/shop/inventory/stock', description: 'Get inventory stock' },
    { method: 'GET', path: '/managemyhotel/api/hotels/{id}/shop/inventory/low-stock', description: 'Get low stock items' },
    
    // Staff Management & Scheduling
    { method: 'GET', path: '/managemyhotel/api/staff-schedules', description: 'Get staff schedules' },
    { method: 'POST', path: '/managemyhotel/api/staff-schedules', description: 'Create staff schedule' },
    { method: 'PUT', path: '/managemyhotel/api/staff-schedules/{id}', description: 'Update staff schedule' },
    { method: 'DELETE', path: '/managemyhotel/api/staff-schedules/{id}', description: 'Delete staff schedule' },
    { method: 'GET', path: '/managemyhotel/api/staff-schedules/my-schedule/today', description: 'Get my today schedule' },
    
    // Advertisements
    { method: 'GET', path: '/managemyhotel/api/ads', description: 'Get advertisements' },
    { method: 'POST', path: '/managemyhotel/api/ads', description: 'Create advertisement' },
    { method: 'PUT', path: '/managemyhotel/api/ads/{id}', description: 'Update advertisement' },
    { method: 'DELETE', path: '/managemyhotel/api/ads/{id}', description: 'Delete advertisement' },
    { method: 'GET', path: '/managemyhotel/api/ads/active', description: 'Get active ads' },
    
    // Public Endpoints
    { method: 'POST', path: '/managemyhotel/api/public/hotel-registration/submit', description: 'Submit hotel registration' },
    { method: 'GET', path: '/managemyhotel/api/public/hotel-registration/status', description: 'Check registration status' },
    { method: 'POST', path: '/managemyhotel/api/public/hotels/{id}/shop/orders', description: 'Create public shop order' },
    
    // Process Monitoring (Hotel Admin)
    { method: 'GET', path: '/managemyhotel/api/hotel-admin/hotels/{id}/monitoring/live', description: 'Live monitoring data' },
    { method: 'GET', path: '/managemyhotel/api/hotel-admin/hotels/{id}/monitoring/staff-activity', description: 'Staff activity monitoring' },
    { method: 'GET', path: '/managemyhotel/api/hotel-admin/hotels/{id}/audit/logs', description: 'Get audit logs' },
    { method: 'GET', path: '/managemyhotel/api/hotel-admin/hotels/{id}/dashboard/summary', description: 'Dashboard summary' },
    
    // User Profile Management
    { method: 'GET', path: '/managemyhotel/api/users/{id}/profile', description: 'Get user profile' },
    { method: 'PUT', path: '/managemyhotel/api/users/{id}/profile', description: 'Update user profile' },
    { method: 'PUT', path: '/managemyhotel/api/users/{id}/password', description: 'Change user password' },
    
    // System Monitoring & Health
    { method: 'GET', path: '/managemyhotel/actuator/health', description: 'Health check endpoint' },
    { method: 'GET', path: '/managemyhotel/actuator/metrics', description: 'Application metrics' },
    
    // Cache Management (Testing)
    { method: 'GET', path: '/managemyhotel/api/cache-test/stats', description: 'Cache statistics' },
    { method: 'POST', path: '/managemyhotel/api/cache-test/clear-all', description: 'Clear all caches' }
  ];

  // State for dashboard statistics
  const [stats, setStats] = useState({
    totalHotels: 0,
    totalUsers: 0,
    totalTenants: 0,
    totalBookings: 1247,
    revenue: 'ETB 124,750',
    loading: true
  });

  // Sample data for visualizations
  const revenueData = [
    { label: t('common.months.jan'), value: 85000 },
    { label: t('common.months.feb'), value: 92000 },
    { label: t('common.months.mar'), value: 98000 },
    { label: t('common.months.apr'), value: 89000 },
    { label: t('common.months.may'), value: 115000 },
    { label: t('common.months.jun'), value: 124750 },
  ];

  const bookingStatusData = [
    { label: t('booking.details.confirmed'), value: 68, color: '#4caf50' },
    { label: t('booking.details.pending'), value: 22, color: '#ff9800' },
    { label: t('booking.details.cancelled'), value: 10, color: '#f44336' },
  ];

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Set the token for API client
        const token = TokenManager.getToken();
        if (token) {
          apiClient.setToken(token);
        }

        // Fetch hotels count
        const hotelsResponse = await apiClient.get(API_ENDPOINTS.SYSTEM.HOTELS);
        
        // Fetch users count  
        const usersResponse = await apiClient.get(API_ENDPOINTS.SYSTEM.USERS);

        // Fetch tenants count
        const tenantsResponse = await apiClient.get(API_ENDPOINTS.SYSTEM.TENANTS);

        let hotelsCount = 0;
        let usersCount = 0;
        let tenantsCount = 0;

        if (hotelsResponse.success && hotelsResponse.data) {
          const hotelsData = hotelsResponse.data;
          hotelsCount = Array.isArray(hotelsData) ? hotelsData.length : (hotelsData.totalElements || hotelsData.content?.length || 0);
        }

        if (usersResponse.success && usersResponse.data) {
          const usersData = usersResponse.data;
          usersCount = Array.isArray(usersData) ? usersData.length : (usersData.totalElements || usersData.content?.length || 0);
        }

        if (tenantsResponse.success && tenantsResponse.data) {
          const tenantsData = tenantsResponse.data;
          tenantsCount = Array.isArray(tenantsData) ? tenantsData.length : (tenantsData.totalElements || tenantsData.content?.length || 0);
        }

        setStats({
          totalHotels: hotelsCount,
          totalUsers: usersCount,
          totalTenants: tenantsCount,
          totalBookings: 1247, // Enhanced with sample data
          revenue: 'ETB 124,750', // Enhanced with sample data
          loading: false
        });
      } catch (error) {
        console.error('Failed to fetch dashboard statistics:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    if (user && !user.tenantId) {
      fetchStats();
    }
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle refresh without full page reload to preserve language selection
  const handleRefresh = () => {
    // Reset loading state
    setStats(prev => ({ ...prev, loading: true }));
    
    // Re-fetch data
    const fetchStats = async () => {
      try {
        const token = TokenManager.getToken();
        if (token) {
          apiClient.setToken(token);
        }

        const hotelsResponse = await apiClient.get(API_ENDPOINTS.SYSTEM.HOTELS);
        const usersResponse = await apiClient.get(API_ENDPOINTS.SYSTEM.USERS);
        const tenantsResponse = await apiClient.get(API_ENDPOINTS.SYSTEM.TENANTS);

        let hotelsCount = 0;
        let usersCount = 0;
        let tenantsCount = 0;

        if (hotelsResponse.success && hotelsResponse.data) {
          const hotelsData = hotelsResponse.data;
          hotelsCount = Array.isArray(hotelsData) ? hotelsData.length : (hotelsData.totalElements || hotelsData.content?.length || 0);
        }

        if (usersResponse.success && usersResponse.data) {
          const usersData = usersResponse.data;
          usersCount = Array.isArray(usersData) ? usersData.length : (usersData.totalElements || usersData.content?.length || 0);
        }

        if (tenantsResponse.success && tenantsResponse.data) {
          const tenantsData = tenantsResponse.data;
          tenantsCount = Array.isArray(tenantsData) ? tenantsData.length : (tenantsData.totalElements || tenantsData.content?.length || 0);
        }

        setStats({
          totalHotels: hotelsCount,
          totalUsers: usersCount,
          totalTenants: tenantsCount,
          totalBookings: 1247,
          revenue: 'ETB 124,750',
          loading: false
        });
      } catch (error) {
        console.error('Failed to refresh dashboard statistics:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    if (user && !user.tenantId) {
      fetchStats();
    }
  };

  if (!user || user.tenantId) {
    // Redirect non-system users
    navigate('/dashboard');
    return null;
  }

  const isSystemAdmin = user.roles.includes('ADMIN') || user.roles.includes('SYSTEM_ADMIN') || user.role === 'ADMIN' || user.role === 'SYSTEM_ADMIN';
  const isSystemCustomer = user.roles.includes('CUSTOMER');

  const adminQuickActions = [
    {
      title: t('admin.tenant.title'),
      description: t('dashboard.system.manageTenants'),
      icon: <Business />,
      action: () => navigate('/system/tenants'),
      color: 'info' as const,
      buttonText: t('admin.tenant.viewTenants'),
      stat: stats.totalTenants,
      statLabel: t('dashboard.system.activeTenants')
    },
    {
      title: t('admin.hotel.title'),
      description: t('dashboard.system.manageHotels'),
      icon: <Hotel />,
      action: () => navigate('/system/hotels'),
      color: 'primary' as const,
      buttonText: t('admin.hotel.viewHotels'),
      stat: stats.totalHotels,
      statLabel: t('dashboard.system.totalHotels')
    },
    {
      title: t('admin.user.title'),
      description: t('dashboard.system.manageUsers'),
      icon: <People />,
      action: () => navigate('/system/users'),
      color: 'secondary' as const,
      buttonText: t('admin.user.viewUsers'),
      stat: stats.totalUsers,
      statLabel: t('dashboard.system.totalUsers')
    },
  ];

  const customerQuickActions = [
    {
      title: t('hotelSearch.title'),
      description: t('dashboard.customer.searchHotels'),
      icon: <Hotel />,
      action: () => navigate('/search'),
      color: 'primary' as const,
      buttonText: t('dashboard.customer.startSearch'),
      stat: null,
      statLabel: null
    },
    {
      title: t('dashboard.customer.myBookings'),
      description: t('dashboard.customer.viewBookings'),
      icon: <Dashboard />,
      action: () => navigate('/my-bookings'),
      color: 'secondary' as const,
      buttonText: t('dashboard.customer.manageBookings'),
      stat: null,
      statLabel: null
    },
    {
      title: t('dashboard.customer.profileSettings'),
      description: t('dashboard.customer.updateProfile'),
      icon: <Settings />,
      action: () => navigate('/profile'),
      color: 'info' as const,
      buttonText: t('dashboard.customer.editProfile'),
      stat: null,
      statLabel: null
    },
  ];

  const quickActions = isSystemAdmin ? adminQuickActions : customerQuickActions;

  // If statistics are still loading, show loading indicator
  if (stats.loading) {
    return (
      <Box sx={{ width: '100%', p: 3, mt: 4, mb: 4 }}>
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="400px"
          flexDirection="column"
          gap={2}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            {t('dashboard.system.loadingStats')}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Container maxWidth={false} sx={{ width: '100%', p: 3 }} data-testid="system-dashboard">
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {isSystemAdmin ? t('dashboard.system.title') : t('dashboard.customer.title')}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          data-testid="refresh-dashboard"
          disabled={stats.loading}
        >
          {t('common.refresh')}
        </Button>
      </Box>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3, borderRadius: designSystem.borderRadius.lg }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
            }
          }}
        >
          <Tab 
            icon={<Dashboard />} 
            label={t('dashboard.system.overview')} 
            iconPosition="start"
            sx={{ gap: 1 }}
          />
          {isSystemAdmin && (
            <Tab 
              icon={<BarChartIcon />} 
              label={t('dashboard.system.analytics')} 
              iconPosition="start"
              sx={{ gap: 1 }}
            />
          )}
          {isSystemAdmin && (
            <Tab 
              icon={<ApiIcon />} 
              label="API Documentation" 
              iconPosition="start"
              sx={{ gap: 1 }}
            />
          )}
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        {/* Overview Tab - Original Dashboard Content */}
        <Grid container spacing={3} sx={{ mb: 4 }} data-testid="stats-cards">
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
                onClick={action.action}
                data-testid={`stats-card-${action.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <CardContent sx={{ textAlign: 'center', pb: 0.75, px: 1.5 }}>
                  <Box 
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      margin: '0 auto 8px',
                      bgcolor: `${action.color}.light`,
                      color: `${action.color}.contrastText`
                    }}
                  >
                    {React.cloneElement(action.icon, { sx: { fontSize: 18 } })}
                  </Box>
                  <Typography variant="body2" gutterBottom fontWeight="bold" data-testid={`stat-title-${action.title.toLowerCase().replace(/\s+/g, '-')}`} sx={{ lineHeight: 1.2 }}>
                    {action.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {action.description}
                  </Typography>
                  {action.stat !== null && action.stat !== undefined && (
                    <Box sx={{ mt: 1, textAlign: 'center' }}>
                      <Typography variant="h5" color={action.color} fontWeight="bold" data-testid={action.title === 'Manage Hotels' ? 'total-hotels' : action.title === 'Manage Users' ? 'total-users' : 'active-bookings'} sx={{ lineHeight: 1.2 }}>
                        {stats.loading ? '...' : action.stat}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {action.statLabel}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pt: 0 }}>
                  <Button 
                    size="small" 
                    color={action.color}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.action();
                    }}
                    data-testid={`nav-${action.title.toLowerCase().replace(/\s+/g, '-')}`}
                    disabled={stats.loading}
                  >
                    {action.buttonText}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* System Status and Information */}
        <Grid container spacing={3}>
          {isSystemAdmin && (
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUp sx={{ mr: 1 }} />
                  {t('dashboard.system.systemOverview')}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Business sx={{ color: 'info.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t('dashboard.system.tenantManagement')} 
                      secondary={t('dashboard.system.tenantManagementDesc')}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <Hotel sx={{ color: 'primary.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t('dashboard.system.hotelApproval')} 
                      secondary={t('dashboard.system.hotelApprovalDesc')}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <People sx={{ color: 'secondary.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t('dashboard.system.userAdministration')} 
                      secondary={t('dashboard.system.userAdministrationDesc')}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <Settings sx={{ color: 'warning.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t('dashboard.system.globalConfiguration')} 
                      secondary={t('dashboard.system.globalConfigurationDesc')}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          )}

          <Grid item xs={12} md={isSystemAdmin ? 6 : 12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Dashboard sx={{ mr: 1 }} />
                {t('dashboard.system.recentActivity')}
              </Typography>
              <List dense data-testid="recent-activities">
                <ListItem>
                  <ListItemText 
                    primary={isSystemAdmin ? t('dashboard.system.systemAdminLogin') : t('dashboard.system.accountLogin')}
                    secondary={t('dashboard.system.accessedAt', { time: new Date().toLocaleString() })}
                  />
                </ListItem>
                <Divider />
                {isSystemAdmin && (
                  <>
                    <ListItem>
                      <ListItemText 
                        primary={t('dashboard.system.hotelRegistrationReview')}
                        secondary={t('dashboard.system.hotelRegistrationReviewDesc')}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText 
                        primary={t('dashboard.system.tenantManagementActivity')}
                        secondary={t('dashboard.system.tenantManagementActivityDesc')}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText 
                        primary={t('dashboard.system.systemConfiguration')}
                        secondary={t('dashboard.system.systemConfigurationDesc')}
                      />
                    </ListItem>
                  </>
                )}
                {isSystemCustomer && (
                  <>
                    <ListItem>
                      <ListItemText 
                        primary={t('dashboard.system.hotelSearchAvailable')}
                        secondary={t('dashboard.system.hotelSearchAvailableDesc')}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText 
                        primary={t('dashboard.system.bookingManagement')}
                        secondary={t('dashboard.system.bookingManagementDesc')}
                      />
                    </ListItem>
                  </>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Analytics Tab */}
      {isSystemAdmin && (
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            {t('dashboard.system.analyticsVisualization')}
          </Typography>
          
          {/* Metrics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard
                title={t('dashboard.system.totalBookings')}
                value={stats.totalBookings}
                trend="up"
                trendValue={12}
                icon={<BookIcon />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard
                title={t('dashboard.system.activeHotels')}
                value={stats.totalHotels}
                trend="up"
                trendValue={8}
                icon={<Hotel />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard
                title={t('dashboard.system.monthlyRevenue')}
                value={124750}
                format="currency"
                trend="up"
                trendValue={15}
                icon={<AttachMoneyIcon />}
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard
                title={t('dashboard.system.systemUsers')}
                value={stats.totalUsers}
                trend="up"
                trendValue={5}
                icon={<People />}
                color="info"
              />
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Paper sx={{ p: 3, borderRadius: designSystem.borderRadius.lg }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  {t('dashboard.system.monthlyRevenueChart')}
                </Typography>
                <BarChart
                  data={revenueData}
                  height={350}
                  animated
                />
              </Paper>
            </Grid>
            
            <Grid item xs={12} lg={4}>
              <Paper sx={{ p: 3, borderRadius: designSystem.borderRadius.lg, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  {t('dashboard.system.bookingStatusChart')}
                </Typography>
                <DonutChart
                  data={bookingStatusData}
                  size={220}
                  thickness={40}
                />
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      )}

      {/* API Documentation Tab */}
      {isSystemAdmin && (
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            API Documentation
          </Typography>
          
          <Grid container spacing={3}>
            {/* API Documentation Card */}
            <Grid item xs={12} lg={8}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ApiIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="h2">
                      API Documentation
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Complete API reference for the BookMyHotel application. All endpoints support JWT authentication.
                  </Typography>

                  {/* Search Field */}
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search API endpoints..."
                    value={apiSearchQuery}
                    onChange={(e) => setApiSearchQuery(e.target.value)}
                    sx={{ mb: 1 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Endpoint Count */}
                  <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
                    {(() => {
                      const filteredCount = allEndpoints.filter(endpoint => 
                        apiSearchQuery === '' || 
                        endpoint.path.toLowerCase().includes(apiSearchQuery.toLowerCase()) ||
                        endpoint.description.toLowerCase().includes(apiSearchQuery.toLowerCase()) ||
                        endpoint.method.toLowerCase().includes(apiSearchQuery.toLowerCase())
                      ).length;
                      
                      return `Showing ${filteredCount} of ${allEndpoints.length} endpoints`;
                    })()}
                  </Typography>

                  <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {allEndpoints
                      .filter(endpoint => 
                        apiSearchQuery === '' || 
                        endpoint.path.toLowerCase().includes(apiSearchQuery.toLowerCase()) ||
                        endpoint.description.toLowerCase().includes(apiSearchQuery.toLowerCase()) ||
                        endpoint.method.toLowerCase().includes(apiSearchQuery.toLowerCase())
                      )
                      .map((endpoint, index, filteredArray) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemIcon>
                              <Box
                                component="span"
                                sx={{
                                  display: 'inline-block',
                                  minWidth: 60,
                                  textAlign: 'center',
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: 1,
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  color: 'white',
                                  bgcolor: 
                                    endpoint.method === 'GET' ? 'success.main' :
                                    endpoint.method === 'POST' ? 'warning.main' :
                                    endpoint.method === 'PUT' ? 'info.main' :
                                    endpoint.method === 'DELETE' ? 'error.main' : 'grey.500'
                                }}
                              >
                                {endpoint.method}
                              </Box>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="body2" component="code" sx={{ fontFamily: 'monospace' }}>
                                  {endpoint.path}
                                </Typography>
                              }
                              secondary={endpoint.description}
                            />
                          </ListItem>
                          {index < filteredArray.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* System Status Card */}
            <Grid item xs={12} lg={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Settings sx={{ mr: 1, color: 'secondary.main' }} />
                    <Typography variant="h6" component="h2">
                      System Status
                    </Typography>
                  </Box>
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Security"
                        secondary="JWT Authentication Active"
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Database"
                        secondary="Multi-tenant MySQL"
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'info.main' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Monitoring"
                        secondary="Actuator Endpoints"
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="API Documentation"
                        secondary="Swagger UI Available"
                      />
                    </ListItem>
                  </List>

                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                    System administration features and API monitoring capabilities.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      )}
    </Container>
  );
};
