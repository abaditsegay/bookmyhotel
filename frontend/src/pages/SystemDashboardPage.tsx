import React, { useState, useEffect } from 'react';
import {
  Container,
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
  CircularProgress
} from '@mui/material';
import {
  Dashboard,
  Hotel,
  People,
  TrendingUp,
  Settings,
  Business,
  Refresh
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Dashboard page for system-wide users (ADMIN and GUEST roles)
 * Shows different content based on user role
 */
export const SystemDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for dashboard statistics
  const [stats, setStats] = useState({
    totalHotels: 0,
    totalUsers: 0,
    totalTenants: 0,
    totalBookings: 0,
    revenue: '$0',
    loading: true
  });

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch hotels count
        const hotelsResponse = await fetch('http://localhost:8080/api/system/hotels', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        
        // Fetch users count  
        const usersResponse = await fetch('http://localhost:8080/api/system/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });

        // Fetch tenants count
        const tenantsResponse = await fetch('http://localhost:8080/api/system/tenants', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });

        let hotelsCount = 0;
        let usersCount = 0;
        let tenantsCount = 0;

        if (hotelsResponse.ok) {
          const hotelsData = await hotelsResponse.json();
          hotelsCount = Array.isArray(hotelsData) ? hotelsData.length : (hotelsData.totalElements || hotelsData.content?.length || 0);
        }

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          usersCount = Array.isArray(usersData) ? usersData.length : (usersData.totalElements || usersData.content?.length || 0);
        }

        if (tenantsResponse.ok) {
          const tenantsData = await tenantsResponse.json();
          tenantsCount = Array.isArray(tenantsData) ? tenantsData.length : (tenantsData.totalElements || tenantsData.content?.length || 0);
        }

        setStats({
          totalHotels: hotelsCount,
          totalUsers: usersCount,
          totalTenants: tenantsCount,
          totalBookings: 0, // This would need a separate endpoint
          revenue: '$0', // This would need a separate endpoint
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

  if (!user || user.tenantId) {
    // Redirect non-system users
    navigate('/dashboard');
    return null;
  }

  const isSystemAdmin = user.roles.includes('ADMIN');
  const isSystemGuest = user.roles.includes('GUEST');

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
    {
      title: 'System Settings',
      description: 'Configure global system settings',
      icon: <Settings />,
      action: () => navigate('/system/settings'),
      color: 'warning' as const,
      buttonText: 'Open Settings',
      stat: null,
      statLabel: null
    },
  ];

  const guestQuickActions = [
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

  const quickActions = isSystemAdmin ? adminQuickActions : guestQuickActions;

  // If statistics are still loading, show loading indicator
  if (stats.loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} data-testid="system-dashboard">
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => window.location.reload()}
          data-testid="refresh-dashboard"
        >
          Refresh
        </Button>
      </Box>
      
      {/* Quick Actions Grid */}
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
              <CardContent sx={{ textAlign: 'center', pb: 2 }}>
                <Box 
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    bgcolor: `${action.color}.light`,
                    color: `${action.color}.contrastText`
                  }}
                >
                  {React.cloneElement(action.icon, { sx: { fontSize: 32 } })}
                </Box>
                <Typography variant="h6" gutterBottom fontWeight="bold" data-testid={`stat-title-${action.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
                {/* Display real statistics */}
                {action.stat !== null && action.stat !== undefined && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="h3" color={action.color} fontWeight="bold" data-testid={action.title === 'Manage Hotels' ? 'total-hotels' : action.title === 'Manage Users' ? 'total-users' : 'active-bookings'}>
                      {stats.loading ? '...' : action.stat}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
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
              {isSystemGuest && (
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
    </Container>
  );
};
