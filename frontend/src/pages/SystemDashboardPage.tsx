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
  Container
} from '@mui/material';
import {
  Dashboard,
  Hotel,
  People,
  TrendingUp,
  Settings,
  Business,
  Refresh,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { MetricCard, BarChart, DonutChart } from '../components/common/DataVisualization';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BookIcon from '@mui/icons-material/Book';
import { designSystem } from '../theme/designSystem';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

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
    { label: 'Jan', value: 85000 },
    { label: 'Feb', value: 92000 },
    { label: 'Mar', value: 98000 },
    { label: 'Apr', value: 89000 },
    { label: 'May', value: 115000 },
    { label: 'Jun', value: 124750 },
  ];

  const bookingStatusData = [
    { label: 'Confirmed', value: 68, color: '#4caf50' },
    { label: 'Pending', value: 22, color: '#ff9800' },
    { label: 'Cancelled', value: 10, color: '#f44336' },
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

  if (!user || user.tenantId) {
    // Redirect non-system users
    navigate('/dashboard');
    return null;
  }

  const isSystemAdmin = user.roles.includes('ADMIN') || user.roles.includes('SYSTEM_ADMIN') || user.role === 'ADMIN' || user.role === 'SYSTEM_ADMIN';
  const isSystemCustomer = user.roles.includes('CUSTOMER');

  const adminQuickActions = [
    {
      title: 'Manage Tenants',
      description: 'Manage tenant organizations and configurations',
      icon: <Business />,
      action: () => navigate('/system/tenants'),
      color: 'info' as const,
      buttonText: 'View Tenants',
      stat: stats.totalTenants,
      statLabel: 'Active Tenants'
    },
    {
      title: 'Manage Hotels',
      description: 'View and manage all hotels in the system',
      icon: <Hotel />,
      action: () => navigate('/system/hotels'),
      color: 'primary' as const,
      buttonText: 'View Hotels',
      stat: stats.totalHotels,
      statLabel: 'Total Hotels'
    },
    {
      title: 'Manage Users',
      description: 'Administer system-wide and tenant users',
      icon: <People />,
      action: () => navigate('/system/users'),
      color: 'secondary' as const,
      buttonText: 'View Users',
      stat: stats.totalUsers,
      statLabel: 'Total Users'
    },
  ];

  const customerQuickActions = [
    {
      title: 'Search Hotels',
      description: 'Find and book hotels across all locations',
      icon: <Hotel />,
      action: () => navigate('/search'),
      color: 'primary' as const,
      buttonText: 'Start Search',
      stat: null,
      statLabel: null
    },
    {
      title: 'My Bookings',
      description: 'View and manage your booking history',
      icon: <Dashboard />,
      action: () => navigate('/my-bookings'),
      color: 'secondary' as const,
      buttonText: 'View Bookings',
      stat: null,
      statLabel: null
    },
    {
      title: 'Profile Settings',
      description: 'Update your personal information',
      icon: <Settings />,
      action: () => navigate('/profile'),
      color: 'info' as const,
      buttonText: 'Edit Profile',
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
            Loading dashboard statistics...
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
          {isSystemAdmin ? 'System Administration Dashboard' : 'User Dashboard'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => window.location.reload()}
          data-testid="refresh-dashboard"
        >
          Refresh
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
            label="Overview" 
            iconPosition="start"
            sx={{ gap: 1 }}
          />
          {isSystemAdmin && (
            <Tab 
              icon={<BarChartIcon />} 
              label="Analytics" 
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
                  System Overview
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Business sx={{ color: 'info.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Tenant Management" 
                      secondary="Create and manage tenant organizations"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <Hotel sx={{ color: 'primary.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Hotel Registration Approval" 
                      secondary="Review and approve/reject hotel registrations"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <People sx={{ color: 'secondary.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="User Administration" 
                      secondary="Manage system users and permissions"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <Settings sx={{ color: 'warning.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Global Configuration" 
                      secondary="Configure system-wide settings and parameters"
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
                Recent Activity
              </Typography>
              <List dense data-testid="recent-activities">
                <ListItem>
                  <ListItemText 
                    primary={isSystemAdmin ? "System Administration Login" : "Account Login"}
                    secondary={`Accessed at ${new Date().toLocaleString()}`}
                  />
                </ListItem>
                <Divider />
                {isSystemAdmin && (
                  <>
                    <ListItem>
                      <ListItemText 
                        primary="Hotel Registration Review"
                        secondary="Available hotel registrations pending approval"
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText 
                        primary="Tenant Management"
                        secondary="Active tenant organizations available for management"
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText 
                        primary="System Configuration"
                        secondary="Global settings and user permissions ready for review"
                      />
                    </ListItem>
                  </>
                )}
                {isSystemCustomer && (
                  <>
                    <ListItem>
                      <ListItemText 
                        primary="Hotel Search Available"
                        secondary="Browse our network of partner hotels"
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText 
                        primary="Booking Management"
                        secondary="View and manage your reservation history"
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
            System Analytics & Data Visualization
          </Typography>
          
          {/* Metrics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard
                title="Total Bookings"
                value={stats.totalBookings}
                trend="up"
                trendValue={12}
                icon={<BookIcon />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard
                title="Active Hotels"
                value={stats.totalHotels}
                trend="up"
                trendValue={8}
                icon={<Hotel />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard
                title="Monthly Revenue"
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
                title="System Users"
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
                  Monthly Revenue Trend (ETB)
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
                  Booking Status Distribution
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
    </Container>
  );
};
