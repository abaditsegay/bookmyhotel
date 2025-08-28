import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Alert, CircularProgress } from '@mui/material';
import HousekeepingStaffDashboard from '../components/Staff/HousekeepingStaffDashboard';
import MaintenanceStaffDashboard from '../components/Staff/MaintenanceStaffDashboard';
import { staffApi } from '../services/staffApi';
import TokenManager from '../utils/tokenManager';

const StaffDashboardPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      // Try to get current user profile
      const userProfile = await staffApi.getCurrentUser();
      setUser(userProfile);
    } catch (err) {
      console.error('Error loading user profile:', err);
      
      // Fallback: determine role from local storage or URL
      const token = TokenManager.getToken();
      if (token) {
        try {
          // Try to decode token to get role info
          const payload = JSON.parse(atob(token.split('.')[1]));
          const role = payload.role || payload.authorities?.[0];
          
          if (role) {
            const mockUser = {
              id: payload.sub || 1,
              username: payload.username || 'staff_user',
              role: role,
              staffType: role === 'HOUSEKEEPING' ? 'HOUSEKEEPING' : 
                        role === 'MAINTENANCE' ? 'MAINTENANCE' : 
                        role.includes('HOUSEKEEPING') ? 'HOUSEKEEPING' :
                        role.includes('MAINTENANCE') ? 'MAINTENANCE' : null,
              permissions: []
            };
            setUser(mockUser);
          } else {
            setError('Unable to determine user role');
          }
        } catch (tokenError) {
          setError('Invalid authentication token');
        }
      } else {
        setError('No authentication token found');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Alert severity="warning">
            Unable to load user profile. Please try logging in again.
          </Alert>
        </Box>
      </Container>
    );
  }

  // Route to appropriate dashboard based on staff type
  if (user.staffType === 'HOUSEKEEPING' || user.role === 'HOUSEKEEPING' || user.role?.includes('HOUSEKEEPING')) {
    return <HousekeepingStaffDashboard />;
  }
  
  if (user.staffType === 'MAINTENANCE' || user.role === 'MAINTENANCE' || user.role?.includes('MAINTENANCE')) {
    return <MaintenanceStaffDashboard />;
  }

  // If role is ambiguous, show both options
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Staff Dashboard
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Welcome {user.username}! Your role: {user.role}
        </Alert>

        <Typography variant="h6" gutterBottom>
          Please select your department:
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" color="textSecondary">
            Based on your current role ({user.role}), we couldn't automatically determine your department. 
            Please contact your supervisor to update your role assignment.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default StaffDashboardPage;
