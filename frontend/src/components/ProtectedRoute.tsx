import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { StandardLoading, ErrorBoundary } from './common';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'SUPER_ADMIN' | 'ADMIN' | 'HOTEL_ADMIN' | 'OPERATIONAL_ADMIN' | 'FRONTDESK' | 'HOUSEKEEPING' | 'MAINTENANCE' | 'GUEST';
  requiredRoles?: string[]; // Allow multiple roles
  /**
   * Custom redirect path when access is denied
   */
  redirectTo?: string;
  /**
   * Whether to show loading state during navigation
   */
  showLoading?: boolean;
  /**
   * Custom loading message
   */
  loadingMessage?: string;
  /**
   * Whether to track this route for navigation history
   */
  trackNavigation?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  requiredRoles,
  redirectTo,
  showLoading = true,
  loadingMessage = "Checking authentication...",
  trackNavigation = true
}) => {
  const { isAuthenticated, user, isInitializing } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication from localStorage
  if (isInitializing && showLoading) {
    return (
      <StandardLoading 
        loading={true}
        message={loadingMessage}
        overlay={true}
        size="large"
      />
    );
  }

  if (!isAuthenticated) {
    // Store current location for redirect after login
    const redirectPath = redirectTo || "/login";
    const currentPath = location.pathname + location.search;
    
    return <Navigate 
      to={`${redirectPath}${redirectPath === "/login" && currentPath !== "/" ? `?redirect=${encodeURIComponent(currentPath)}` : ""}`} 
      replace 
    />;
  }

  // If no requiredRole or requiredRoles is specified, just check authentication
  if (!requiredRole && !requiredRoles) {
    return <>{children}</>;
  }

  // Define role hierarchy - higher roles can access lower role functionality
  const roleHierarchy: Record<string, number> = {
    'GUEST': 1,
    'CUSTOMER': 1,
    'FRONTDESK': 2,
    'HOUSEKEEPING': 2,
    'MAINTENANCE': 2,
    'OPERATIONAL_ADMIN': 3,
    'HOTEL_ADMIN': 4,
    'ADMIN': 5,
    'SUPER_ADMIN': 6,
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
      // Special case: SUPER_ADMIN can access everything
      if (userRoles.includes('SUPER_ADMIN')) {
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
    // Instead of redirecting to login, redirect to appropriate dashboard or custom path
    const fallbackPath = redirectTo || "/dashboard";
    return <Navigate to={fallbackPath} replace />;
  }

  // Wrap children with ErrorBoundary for route-level error protection
  return (
    <ErrorBoundary level="page" showDetails={process.env.NODE_ENV === 'development'}>
      {children}
    </ErrorBoundary>
  );
};

export default ProtectedRoute;
