import React from 'react';
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
  Divider
} from '@mui/material';
import {
  Dashboard,
  Hotel,
  People,
  TrendingUp,
  Settings,
  AdminPanelSettings,
  Business
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
    },
    {
      title: 'Manage Hotels',
      description: 'View and manage all hotels in the system',
      icon: <Hotel />,
      action: () => navigate('/system/hotels'),
      color: 'primary' as const,
    },
    {
      title: 'Manage Users',
      description: 'Administer system-wide and tenant users',
      icon: <People />,
      action: () => navigate('/system/users'),
      color: 'secondary' as const,
    },
    // {
    //   title: 'System Analytics',
    //   description: 'View platform-wide statistics and insights',
    //   icon: <Analytics />,
    //   action: () => navigate('/system/analytics'),
    //   color: 'success' as const,
    // },
    {
      title: 'System Settings',
      description: 'Configure global system settings',
      icon: <Settings />,
      action: () => navigate('/system/settings'),
      color: 'warning' as const,
    },
  ];

  const guestQuickActions = [
    {
      title: 'Search Hotels',
      description: 'Find and book hotels across all locations',
      icon: <Hotel />,
      action: () => navigate('/search'),
      color: 'primary' as const,
    },
    {
      title: 'My Bookings',
      description: 'View and manage your booking history',
      icon: <Dashboard />,
      action: () => navigate('/my-bookings'),
      color: 'secondary' as const,
    },
    {
      title: 'Profile Settings',
      description: 'Update your personal information',
      icon: <Settings />,
      action: () => navigate('/profile'),
      color: 'info' as const,
    },
  ];

  const quickActions = isSystemAdmin ? adminQuickActions : guestQuickActions;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AdminPanelSettings sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h6" color="text.primary" sx={{ fontWeight: 'bold' }}>
              Welcome {user.firstName || user.email}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
              {isSystemAdmin ? 'System Administrator' : 'Global Guest'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Quick Actions Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
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
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pt: 0 }}>
                <Button 
                  size="small" 
                  color={action.color}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.action();
                  }}
                >
                  Access
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
            <List dense>
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
