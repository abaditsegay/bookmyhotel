import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Description as ApiIcon,
  Launch as LaunchIcon,
  Security as SecurityIcon,
  Storage as DatabaseIcon,
  Timeline as MetricsIcon,
  Settings as SystemIcon,
  Code as CodeIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// System dashboard for system administrators
const SystemDashboard: React.FC = () => {
  const apiEndpoints = [
    { method: 'GET', path: '/api/hotels', description: 'Get all hotels with filtering' },
    { method: 'POST', path: '/api/hotels', description: 'Create new hotel' },
    { method: 'GET', path: '/api/hotels/{id}', description: 'Get hotel by ID' },
    { method: 'PUT', path: '/api/hotels/{id}', description: 'Update hotel' },
    { method: 'DELETE', path: '/api/hotels/{id}', description: 'Delete hotel' },
    { method: 'GET', path: '/api/bookings', description: 'Get bookings with filtering' },
    { method: 'POST', path: '/api/bookings', description: 'Create new booking' },
    { method: 'GET', path: '/api/bookings/{id}', description: 'Get booking by ID' },
    { method: 'PUT', path: '/api/bookings/{id}', description: 'Update booking' },
    { method: 'POST', path: '/api/auth/login', description: 'User authentication' },
    { method: 'POST', path: '/api/auth/logout', description: 'User logout' },
    { method: 'GET', path: '/api/users', description: 'Get users (admin only)' },
    { method: 'POST', path: '/api/users', description: 'Create user (admin only)' },
    { method: 'GET', path: '/api/admin/tenants', description: 'Manage tenants' },
    { method: 'GET', path: '/actuator/health', description: 'Health check endpoint' },
    { method: 'GET', path: '/actuator/metrics', description: 'Application metrics' }
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'success';
      case 'POST': return 'warning';
      case 'PUT': return 'info';
      case 'DELETE': return 'error';
      default: return 'default';
    }
  };

  const handleOpenSwagger = () => {
    const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
    window.open(`${baseUrl}/swagger-ui/index.html`, '_blank');
  };

  const handleOpenActuator = () => {
    const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
    window.open(`${baseUrl}/actuator`, '_blank');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        System Administration
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
                <Box sx={{ flexGrow: 1 }} />
                <Tooltip title="Open Swagger UI">
                  <IconButton onClick={handleOpenSwagger} size="small">
                    <LaunchIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Complete API reference for the BookMyHotel application. All endpoints support JWT authentication.
              </Typography>

              <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
                {apiEndpoints.map((endpoint, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon>
                        <Chip 
                          label={endpoint.method} 
                          color={getMethodColor(endpoint.method) as any}
                          size="small"
                          sx={{ minWidth: 60 }}
                        />
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
                    {index < apiEndpoints.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
            <CardActions>
              <Button 
                startIcon={<CodeIcon />} 
                onClick={handleOpenSwagger}
                variant="contained"
                color="primary"
              >
                Open Swagger UI
              </Button>
              <Button 
                startIcon={<InfoIcon />} 
                onClick={handleOpenActuator}
                variant="outlined"
              >
                System Metrics
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* System Status Card */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SystemIcon sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h6" component="h2">
                  System Status
                </Typography>
              </Box>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Security"
                    secondary="JWT Authentication Active"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <DatabaseIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Database"
                    secondary="Multi-tenant MySQL"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <MetricsIcon color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Monitoring"
                    secondary="Actuator Endpoints"
                  />
                </ListItem>
              </List>

              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                System administration features and monitoring capabilities.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

const SystemModule: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<SystemDashboard />} />
      <Route path="/dashboard" element={<SystemDashboard />} />
    </Routes>
  );
};

export default SystemModule;