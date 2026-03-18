import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import HousekeepingDashboard from './HousekeepingDashboard';
import HousekeepingStaffDashboard from '../Staff/HousekeepingStaffDashboard';
import { Box, Typography, Alert } from '@mui/material';

/**
 * Role-based housekeeping view that renders different interfaces based on user role:
 * - Hotel Admin & Front Desk: Full task management (add/modify/delete tasks) 
 * - Housekeeping Users: View assigned tasks, update statuses, add comments
 */
const RoleBasedHousekeepingView: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Authentication required to access housekeeping features.
        </Alert>
      </Box>
    );
  }

  // Check if user has management roles (can manage all tasks)
  const hasManagementRole = () => {
    const managementRoles = ['HOTEL_ADMIN', 'FRONTDESK', 'OPERATIONAL_ADMIN'];
    return user.roles?.some(role => managementRoles.includes(role)) || 
           managementRoles.includes(user.role);
  };

  // Check if user is housekeeping staff (can only view their tasks)
  const isHousekeepingStaff = () => {
    return user.roles?.includes('HOUSEKEEPING') || user.role === 'HOUSEKEEPING';
  };

  const canAccess = hasManagementRole() || isHousekeepingStaff();

  if (canAccess) {
    // Show different dashboards based on user role
    const isStaffOnly = isHousekeepingStaff() && !hasManagementRole();
    
    if (isStaffOnly) {
      // Pure housekeeping staff - show staff dashboard
      return <HousekeepingStaffDashboard />;
    } else {
      // Management roles - show management dashboard
      return <HousekeepingDashboard userRole={user.role} userId={user.id} />;
    }
  } else {
    // User doesn't have appropriate role
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Access Denied
        </Typography>
        <Alert severity="warning">
          You don't have permission to access housekeeping features. 
          Contact your administrator for access.
        </Alert>
        <Alert severity="info" sx={{ mt: 2 }}>
          Debug Info - Your role: {user.role} | Your roles: {JSON.stringify(user.roles)}
        </Alert>
      </Box>
    );
  }
};

export default RoleBasedHousekeepingView;