import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'HOTEL_ADMIN' | 'HOTEL_MANAGER' | 'FRONTDESK' | 'HOUSEKEEPING' | 'OPERATIONS_SUPERVISOR' | 'MAINTENANCE' | 'GUEST';
  requiredRoles?: string[]; // Allow multiple roles
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole, requiredRoles }) => {
  const { isAuthenticated, user, isInitializing } = useAuth();

  // Show loading state while checking authentication from localStorage
  if (isInitializing) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          gap: 2 
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If no requiredRole or requiredRoles is specified, just check authentication
  if (!requiredRole && !requiredRoles) {
    return <>{children}</>;
  }

  // Define role hierarchy - higher roles can access lower role functionality
  const roleHierarchy: Record<string, number> = {
    'GUEST': 1,
    'FRONTDESK': 2,
    'HOUSEKEEPING': 2,
    'MAINTENANCE': 2,
    'OPERATIONS_SUPERVISOR': 3,
    'HOTEL_MANAGER': 3,
    'HOTEL_ADMIN': 4,
    'ADMIN': 5, // System admin role
    'SYSTEM_ADMIN': 6 // Highest level system admin role
  };

  // Check if user has the required role or a higher role
  const hasRequiredRole = () => {
    if (!user) return false;
    
    // Get user roles - prefer roles array, fallback to single role property
    const userRoles = user.roles && user.roles.length > 0 ? user.roles : (user.role ? [user.role] : []);
    
    if (userRoles.length === 0) return false;
    
    // If requiredRoles is provided, check if user has any of those roles
    if (requiredRoles && requiredRoles.length > 0) {
      return userRoles.some(role => requiredRoles.includes(role));
    }
    
    // If requiredRole is provided, check hierarchy
    if (requiredRole) {
      // Special case: SYSTEM_ADMIN can access everything
      if (userRoles.includes('SYSTEM_ADMIN')) {
        return true;
      }
      
      const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
      return userRoles.some(role => {
        const userRoleLevel = roleHierarchy[role] || 0;
        return userRoleLevel >= requiredRoleLevel;
      });
    }
    
    return false;
  };

  if ((requiredRole || requiredRoles) && !hasRequiredRole()) {
    // Instead of redirecting to login, redirect to appropriate dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
