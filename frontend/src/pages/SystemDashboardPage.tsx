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
  Chip,
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
  Security,
  Analytics,
  AdminPanelSettings
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
    {
      title: 'System Analytics',
      description: 'View platform-wide statistics and insights',
      icon: <Analytics />,
      action: () => navigate('/system/analytics'),
      color: 'success' as const,
    },
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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AdminPanelSettings sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h3" component="h1" fontWeight="bold">
            {isSystemAdmin ? 'System Administration' : 'Global Guest Portal'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Typography variant="h6" color="text.secondary">
            Welcome back, {user.firstName || user.email}
          </Typography>
          <Chip 
            label={isSystemAdmin ? "System Administrator" : "Global Guest"}
            color={isSystemAdmin ? "error" : "primary"}
            variant="filled"
            icon={isSystemAdmin ? <Security /> : <Dashboard />}
          />
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
          {isSystemAdmin 
            ? 'Manage and monitor the entire BookMyHotel platform from this central dashboard.'
            : 'Search and book hotels across our entire network of partner properties.'
          }
        </Typography>
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
                    <Hotel sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Total Hotels" 
                    secondary="Manage properties across the platform"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <People sx={{ color: 'secondary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="User Management" 
                    secondary="System-wide and tenant user administration"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <Analytics sx={{ color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Platform Analytics" 
                    secondary="Performance metrics and insights"
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
                  primary={isSystemAdmin ? "System Login" : "Account Login"}
                  secondary={`Logged in at ${new Date().toLocaleString()}`}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary={isSystemAdmin ? "Dashboard Access" : "Portal Access"}
                  secondary="Accessed system dashboard"
                />
              </ListItem>
              {isSystemGuest && (
                <>
                  <Divider />
                  <ListItem>
                    <ListItemText 
                      primary="Hotel Search Available"
                      secondary="Browse our network of partner hotels"
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
