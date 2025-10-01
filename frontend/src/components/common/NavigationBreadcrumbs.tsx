import React from 'react';
import { Breadcrumbs, Link, Box, Chip } from '@mui/material';
import { 
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Hotel as HotelIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Receipt as BookingIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { designSystem } from '../../theme/designSystem';

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
  active?: boolean;
}

interface NavigationBreadcrumbsProps {
  /**
   * Custom breadcrumb items (overrides automatic generation)
   */
  items?: BreadcrumbItem[];
  
  /**
   * Whether to show icons in breadcrumbs
   */
  showIcons?: boolean;
  
  /**
   * Maximum number of breadcrumb items to show
   */
  maxItems?: number;
  
  /**
   * Whether to show the current page as active
   */
  showCurrentPage?: boolean;
  
  /**
   * Custom separator between breadcrumb items
   */
  separator?: React.ReactNode;
}

/**
 * Smart breadcrumb component that automatically generates breadcrumbs based on current route
 * or displays custom breadcrumb items
 */
const NavigationBreadcrumbs: React.FC<NavigationBreadcrumbsProps> = ({
  items,
  showIcons = true,
  maxItems = 5,
  showCurrentPage = true,
  separator = <NavigateNextIcon fontSize="small" />
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Route to breadcrumb mapping
  const routeMap: Record<string, { label: string; icon?: React.ReactNode; parent?: string }> = {
    '/': { label: 'Home', icon: <HomeIcon fontSize="small" /> },
    '/dashboard': { label: 'Dashboard', icon: <DashboardIcon fontSize="small" /> },
    '/home': { label: 'Home', icon: <HomeIcon fontSize="small" /> },
    '/hotels': { label: 'Hotels', icon: <HotelIcon fontSize="small" />, parent: '/home' },
    '/hotels/search': { label: 'Search', icon: <SearchIcon fontSize="small" />, parent: '/hotels' },
    '/hotels/search-results': { label: 'Results', icon: <SearchIcon fontSize="small" />, parent: '/hotels/search' },
    '/booking': { label: 'Booking', icon: <BookingIcon fontSize="small" /> },
    '/booking-confirmation': { label: 'Confirmation', icon: <BookingIcon fontSize="small" />, parent: '/booking' },
    '/profile': { label: 'Profile', icon: <PersonIcon fontSize="small" /> },
    '/admin': { label: 'Admin', icon: <SettingsIcon fontSize="small" />, parent: '/dashboard' },
    '/hotel-admin': { label: 'Hotel Admin', icon: <SettingsIcon fontSize="small" />, parent: '/dashboard' },
    '/find-booking': { label: 'Find Booking', icon: <SearchIcon fontSize="small" /> },
  };

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with home unless we're already at home
    if (location.pathname !== '/' && location.pathname !== '/home') {
      breadcrumbs.push({
        label: 'Home',
        path: '/home',
        icon: showIcons ? <HomeIcon fontSize="small" /> : undefined
      });
    }

    // Build breadcrumbs from path segments
    let currentPath = '';
    for (let i = 0; i < pathSegments.length; i++) {
      currentPath += `/${pathSegments[i]}`;
      const routeInfo = routeMap[currentPath];
      
      if (routeInfo) {
        const isLast = i === pathSegments.length - 1;
        breadcrumbs.push({
          label: routeInfo.label,
          path: isLast && !showCurrentPage ? undefined : currentPath,
          icon: showIcons ? routeInfo.icon : undefined,
          active: isLast
        });
      } else {
        // Generate breadcrumb for unknown routes
        const segment = pathSegments[i];
        const isLast = i === pathSegments.length - 1;
        
        breadcrumbs.push({
          label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
          path: isLast && !showCurrentPage ? undefined : currentPath,
          active: isLast
        });
      }
    }

    // Handle dynamic routes (with IDs)
    if (pathSegments.some(segment => /^\d+$/.test(segment) || segment.length > 20)) {
      // If we have what looks like an ID, modify the last breadcrumb
      const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
      if (lastBreadcrumb && /^\d+$/.test(pathSegments[pathSegments.length - 1])) {
        lastBreadcrumb.label = `Details`;
        lastBreadcrumb.icon = showIcons ? <HotelIcon fontSize="small" /> : undefined;
      }
    }

    return breadcrumbs.slice(-maxItems);
  };

  const breadcrumbItems = generateBreadcrumbs();

  if (breadcrumbItems.length <= 1) {
    return null; // Don't show breadcrumbs for single-level pages
  }

  const handleBreadcrumbClick = (path?: string) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <Box sx={{ 
      mb: designSystem.spacing.md,
      py: designSystem.spacing.sm,
      borderBottom: '1px solid',
      borderColor: 'divider'
    }}>
      <Breadcrumbs
        separator={separator}
        maxItems={maxItems}
        aria-label="navigation breadcrumbs"
        sx={{
          '& .MuiBreadcrumbs-ol': {
            flexWrap: 'wrap'
          },
          '& .MuiBreadcrumbs-li': {
            display: 'flex',
            alignItems: 'center'
          }
        }}
      >
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const isClickable = !isLast || (isLast && item.path);

          return (
            <Box 
              key={`${item.label}-${index}`} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5 
              }}
            >
              {isClickable ? (
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => handleBreadcrumbClick(item.path)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: 'primary.main',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    padding: `${designSystem.spacing.xs}px ${designSystem.spacing.sm}px`,
                    borderRadius: 1,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      color: 'primary.contrastText',
                      textDecoration: 'none'
                    },
                    '&:focus': {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: '2px'
                    }
                  }}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ) : (
                <Chip
                  icon={item.icon as React.ReactElement}
                  label={item.label}
                  variant={item.active ? "filled" : "outlined"}
                  color={item.active ? "primary" : "default"}
                  size="small"
                  sx={{
                    fontWeight: item.active ? 600 : 400,
                    fontSize: '0.875rem'
                  }}
                />
              )}
            </Box>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default NavigationBreadcrumbs;