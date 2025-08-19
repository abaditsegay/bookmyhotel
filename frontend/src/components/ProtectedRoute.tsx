import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'HOTEL_ADMIN' | 'HOTEL_MANAGER' | 'FRONTDESK' | 'HOUSEKEEPING' | 'GUEST';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If no requiredRole is specified, just check authentication
  if (!requiredRole) {
    return <>{children}</>;
  }

  // Define role hierarchy - higher roles can access lower role functionality
  const roleHierarchy: Record<string, number> = {
    'GUEST': 1,
    'FRONTDESK': 2,
    'HOUSEKEEPING': 2,
    'HOTEL_MANAGER': 3,
    'HOTEL_ADMIN': 4,
    'ADMIN': 5 // System admin role
  };

  // Check if user has the required role or a higher role
  const hasRequiredRole = () => {
    if (!user) return false;
    
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
    
    // Get user roles - prefer roles array, fallback to single role property
    const userRoles = user.roles && user.roles.length > 0 ? user.roles : (user.role ? [user.role] : []);
    
    if (userRoles.length === 0) return false;
    
    // Check if any of the user's roles meets the requirement
    return userRoles.some(role => {
      const userRoleLevel = roleHierarchy[role] || 0;
      return userRoleLevel >= requiredRoleLevel;
    });
  };

  if (requiredRole && !hasRequiredRole()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
