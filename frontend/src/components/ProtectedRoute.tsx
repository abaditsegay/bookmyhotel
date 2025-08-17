import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'HOTEL_ADMIN' | 'HOTEL_MANAGER' | 'FRONTDESK' | 'HOUSEKEEPING' | 'GUEST';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole = 'GUEST' }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
    if (!user?.roles) return false;
    
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
    
    // Check if any of the user's roles meets the requirement
    return user.roles.some(role => {
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
