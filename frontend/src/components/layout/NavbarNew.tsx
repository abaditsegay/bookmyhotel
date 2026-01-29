import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Chip,
  Badge,
  ListItemButton,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
  Store as StoreIcon,
  Notifications as NotificationsIcon,
  Hotel as HotelIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Close as CloseIcon,
  AdminPanelSettings,
  CalendarMonth as CalendarIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { useNotifications } from '../../hooks/useNotifications';
import NetworkStatusIndicator from '../NetworkStatusIndicator';
import LanguageSelector from '../common/LanguageSelector';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface NavigationItem {
  label: string;
  path?: string;
  icon: React.ReactNode;
  action?: () => void;
  roles?: string[]; // Roles that can see this item
  requiresAuth?: boolean; // Explicitly require authentication (default: inferred from roles)
  systemWideOnly?: boolean; // Only show in system-wide context
  tenantBoundOnly?: boolean; // Only show in tenant-bound context
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const NavbarNew: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { user, logout } = useAuth();
  const { isSystemWideContext } = useTenant();
  const { stats } = useNotifications();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // ============================================================================
  // NAVIGATION CONFIGURATION - Centralized role-based navigation
  // ============================================================================
  
  const getNavigationConfig = (): NavigationItem[] => {
    const config: NavigationItem[] = [
      // ========================================================================
      // GUEST NAVIGATION (Non-authenticated users)
      // ========================================================================
      // Note: Guest actions are handled in the UI section, not in main nav
      
      // ========================================================================
      // SYSTEM ADMIN NAVIGATION (System-wide context)
      // ========================================================================
      {
        label: 'Hotels',
        path: '/system/hotels',
        icon: <HotelIcon />,
        roles: ['ADMIN', 'SYSTEM_ADMIN'],
        systemWideOnly: true,
      },
      {
        label: 'Users',
        path: '/system/users',
        icon: <PeopleIcon />,
        roles: ['ADMIN', 'SYSTEM_ADMIN'],
        systemWideOnly: true,
      },
      {
        label: 'Settings',
        path: '/system-settings',
        icon: <SettingsIcon />,
        roles: ['ADMIN', 'SYSTEM_ADMIN'],
        systemWideOnly: true,
      },
      
      // ========================================================================
      // CUSTOMER NAVIGATION (System-wide context)
      // ========================================================================
      {
        label: 'Search Hotels',
        path: '/hotels/search',
        icon: <SearchIcon />,
        roles: ['CUSTOMER'],
        requiresAuth: true,
        systemWideOnly: true,
      },
      {
        label: 'My Bookings',
        path: '/my-bookings',
        icon: <ReceiptIcon />,
        roles: ['CUSTOMER'],
        requiresAuth: true,
        systemWideOnly: true,
      },
      {
        label: 'Profile',
        path: '/profile',
        icon: <PersonIcon />,
        roles: ['CUSTOMER'],
        requiresAuth: true,
        systemWideOnly: true,
      },
      
      // ========================================================================
      // HOTEL ADMIN NAVIGATION (Tenant-bound)
      // ========================================================================
      {
        label: 'Dashboard',
        path: '/hotel-admin/dashboard',
        icon: <DashboardIcon />,
        roles: ['HOTEL_ADMIN'],
        requiresAuth: true,
        tenantBoundOnly: true,
      },
      {
        label: 'Notifications',
        path: '/notifications',
        icon: <NotificationsIcon />,
        roles: ['HOTEL_ADMIN', 'FRONTDESK'],
        requiresAuth: true,
        tenantBoundOnly: true,
      },
      {
        label: 'Shop',
        path: '/shop',
        icon: <StoreIcon />,
        roles: ['HOTEL_ADMIN', 'FRONTDESK'],
        requiresAuth: true,
        tenantBoundOnly: true,
      },
      
      // ========================================================================
      // FRONT DESK NAVIGATION (Tenant-bound)
      // ========================================================================
      {
        label: 'Dashboard',
        path: '/frontdesk/dashboard',
        icon: <DashboardIcon />,
        roles: ['FRONTDESK'],
        requiresAuth: true,
        tenantBoundOnly: true,
      },
      
      // ========================================================================
      // OPERATIONS SUPERVISOR NAVIGATION (Tenant-bound)
      // ========================================================================
      {
        label: 'Dashboard',
        path: '/operations/dashboard',
        icon: <DashboardIcon />,
        roles: ['OPERATIONS_SUPERVISOR'],
        requiresAuth: true,
        tenantBoundOnly: true,
      },
      
      // ========================================================================
      // STAFF NAVIGATION (Tenant-bound)
      // ========================================================================
      {
        label: 'Dashboard',
        path: '/staff/dashboard',
        icon: <DashboardIcon />,
        roles: ['HOUSEKEEPING', 'MAINTENANCE', 'HOTEL_MANAGER'],
        requiresAuth: true,
        tenantBoundOnly: true,
      },
    ];
    
    return config;
  };

  // Filter navigation items based on user role and context
  const getFilteredNavigationItems = (): NavigationItem[] => {
    const allItems = getNavigationConfig();
    
    return allItems.filter(item => {
      // Check authentication requirement
      if (item.requiresAuth === false && user) {
        return false; // Hide guest items when authenticated
      }
      
      if (item.requiresAuth && !user) {
        return false; // Hide auth-required items when not authenticated
      }
      
      // Check system-wide vs tenant-bound context
      if (item.systemWideOnly && !isSystemWideContext) {
        return false;
      }
      
      if (item.tenantBoundOnly && isSystemWideContext) {
        return false;
      }
      
      // Check role-based access
      if (item.roles && user) {
        const userRoles = user.roles || [user.role];
        return item.roles.some(role => userRoles.includes(role));
      }
      
      // If no roles specified and requiresAuth is not false, show to all authenticated users
      if (!item.roles && item.requiresAuth) {
        return !!user;
      }
      
      // If no roles and requiresAuth is false, show to guests only
      if (!item.roles && item.requiresAuth === false) {
        return !user;
      }
      
      return true;
    });
  };

  const navigationItems = getFilteredNavigationItems();

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path?: string) => {
    if (path) {
      // Known issue: React Router context doesn't update when navigating from /hotels/search
      // Using direct navigation ensures clean, instant navigation without re-renders
      if (location.pathname === '/hotels/search') {
        window.location.href = path;
        return;
      }
      
      navigate(path);
    }
    setMobileDrawerOpen(false);
    handleMenuClose();
  };

  const handleItemClick = (item: NavigationItem) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      handleNavigation(item.path);
    }
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================
  
  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'SYSTEM_ADMIN': 'System Admin',
      'ADMIN': 'System Administrator',
      'HOTEL_ADMIN': 'Hotel Administrator',
      'FRONTDESK': 'Front Desk Staff',
      'CUSTOMER': 'Customer',
      'HOTEL_MANAGER': 'Hotel Manager',
      'HOUSEKEEPING': 'Housekeeping Staff',
      'OPERATIONS_SUPERVISOR': 'Operations Supervisor',
      'MAINTENANCE': 'Maintenance Staff',
      'GUEST': 'Guest'
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role: string): 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error' => {
    const colorMap: { [key: string]: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error' } = {
      'SYSTEM_ADMIN': 'error',
      'ADMIN': 'error',
      'HOTEL_ADMIN': 'primary',
      'FRONTDESK': 'info',
      'CUSTOMER': 'success',
      'HOTEL_MANAGER': 'secondary',
      'HOUSEKEEPING': 'warning',
      'OPERATIONS_SUPERVISOR': 'primary',
      'MAINTENANCE': 'warning',
      'GUEST': 'secondary'
    };
    return colorMap[role] || 'primary';
  };

  const shouldShowHotelName = () => {
    if (!user) return false;
    // Hide hotel name for system admin and customer users
    return user.role !== 'SYSTEM_ADMIN' && user.role !== 'ADMIN' && user.role !== 'CUSTOMER';
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getItemIcon = (item: NavigationItem) => {
    // Add badge to notifications icon if there are unread notifications
    if (item.label === 'Notifications' && stats.totalUnread > 0) {
      return (
        <Badge badgeContent={stats.totalUnread} color="error">
          {item.icon}
        </Badge>
      );
    }
    return item.icon;
  };

  const getHoverBackground = () => {
    return 'rgba(255, 255, 255, 0.1)';
  };

  const getActiveBackground = () => {
    return 'rgba(255, 255, 255, 0.2)';
  };

  const getTextColor = () => {
    return 'white';
  };

  const getNavbarBackground = () => {
    return {
      backgroundColor: theme.palette.primary.main,
      backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    };
  };

  // ============================================================================
  // SUB-COMPONENTS
  // ============================================================================

  // Desktop Navigation Buttons
  const DesktopNavigationButtons = () => (
    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
      {navigationItems.map((item, index) => (
        <Button
          key={item.path || index}
          onClick={() => handleItemClick(item)}
          startIcon={getItemIcon(item)}
          sx={{
            px: 2,
            borderRadius: 2,
            fontSize: '0.8rem',
            fontWeight: user ? 'bold' : 'normal',
            textTransform: 'none',
            color: item.label === 'Shop' ? theme.palette.text.primary : getTextColor(),
            backgroundColor: item.label === 'Shop' 
              ? theme.palette.warning.main
              : item.path && isActivePath(item.path) 
                ? getActiveBackground()
                : 'transparent',
            '&:hover': {
              backgroundColor: item.label === 'Shop' 
                ? theme.palette.warning.dark
                : getHoverBackground(),
              color: item.label === 'Shop' ? theme.palette.text.primary : getTextColor(),
            },
            position: 'relative',
            zIndex: 1,
            overflow: 'hidden',
          }}
        >
          {item.label}
        </Button>
      ))}
    </Box>
  );

  // Mobile Navigation Drawer
  const MobileDrawer = () => (
    <Drawer
      anchor="left"
      open={mobileDrawerOpen}
      onClose={toggleMobileDrawer}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          backgroundColor: theme.palette.background.paper,
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
          {isSystemWideContext && user?.roles?.some(r => ['ADMIN', 'SYSTEM_ADMIN'].includes(r)) 
            ? '🌐 System Portal' 
            : '🏨 BookMyHotel'}
        </Typography>
        <IconButton onClick={toggleMobileDrawer} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      
      {user && (
        <Box sx={{ px: 2, pb: 2 }}>
          {user.hotelName && shouldShowHotelName() && (
            <Chip
              label={user.hotelName}
              size="small"
              color="secondary"
              sx={{ mb: 1, mr: 1 }}
            />
          )}
          <Chip
            label={getRoleDisplayName(user.role)}
            color={getRoleColor(user.role)}
            size="small"
            variant="outlined"
          />
        </Box>
      )}
      
      <Divider />
      
      <List>
        {navigationItems.map((item, index) => (
          <ListItem
            key={item.path || index}
            disablePadding
          >
            <ListItemButton
              onClick={() => handleItemClick(item)}
              selected={item.path ? isActivePath(item.path) : false}
              sx={{
                backgroundColor: item.label === 'Shop' 
                  ? theme.palette.warning.main
                  : undefined,
                '&:hover': {
                  backgroundColor: item.label === 'Shop' 
                    ? theme.palette.warning.dark
                    : undefined,
                },
              }}
            >
              <ListItemIcon sx={{ color: item.label === 'Shop' ? theme.palette.text.primary : 'inherit' }}>
                {getItemIcon(item)}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                sx={{ color: item.label === 'Shop' ? theme.palette.text.primary : 'inherit' }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        
        {/* Guest navigation in mobile drawer */}
        {!user && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/find-booking')}>
                <ListItemIcon>
                  <SearchIcon />
                </ListItemIcon>
                <ListItemText primary="My Reservation" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/hotels/search')}>
                <ListItemIcon>
                  <CalendarIcon />
                </ListItemIcon>
                <ListItemText primary="Reserve MyStay" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/login')}>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Login" />
              </ListItemButton>
            </ListItem>
          </>
        )}
        
        {/* Authenticated user actions in mobile drawer */}
        {user && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/profile')}>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Drawer>
  );

  // User Profile Menu (Desktop)
  const UserProfileMenu = () => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      sx={{
        zIndex: theme.zIndex.modal,
      }}
    >
      <MenuItem onClick={() => { handleNavigation('/profile'); }}>
        <PersonIcon fontSize="small" sx={{ mr: 1 }} />
        Profile
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>
        <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
        Logout
      </MenuItem>
    </Menu>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={2}
        sx={{
          ...getNavbarBackground(),
          height: 64,
          borderBottom: `1px solid ${theme.palette.divider}`,
          zIndex: theme.zIndex.appBar,
          top: 0,
          left: 0,
          right: 0,
        }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            minHeight: 64,
            height: 64,
            alignItems: 'center',
            py: 0,
            px: { xs: 1, sm: 2 },
            margin: 0,
          }}
          disableGutters={false}
        >
          {/* ================================================================== */}
          {/* LEFT SECTION: Mobile Menu + Language Selector + Logo */}
          {/* ================================================================== */}
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            {/* Mobile Menu Toggle */}
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleMobileDrawer}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            {/* Language Selector */}
            <LanguageSelector variant="icon" size="small" />
            
            {/* System Admin Icon - Only in system-wide context */}
            {user && isSystemWideContext && user.roles?.some(r => ['ADMIN', 'SYSTEM_ADMIN'].includes(r)) && (
              <AdminPanelSettings sx={{ ml: 2, mr: 1, color: 'white' }} />
            )}
            
            {/* Dashboard Link for authenticated users */}
            {user && (
              <Box 
                component="button"
                role="link"
                aria-label="Go to dashboard"
                tabIndex={0}
                onClick={() => handleNavigation('/')}
                onKeyPress={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleNavigation('/');
                  }
                }}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  ml: { xs: 1, sm: 2 },
                  '&:hover': { opacity: 0.9 },
                }}
              >
                <HotelIcon sx={{ mr: 1, fontSize: 28 }} />
                <Typography
                  variant="h6"
                  component="span"
                  sx={{
                    display: { xs: 'none', sm: 'block' },
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                  }}
                >
                  {isSystemWideContext && user.roles?.some(r => ['ADMIN', 'SYSTEM_ADMIN'].includes(r))
                    ? 'BookMyHotel - System Portal'
                    : 'BookMyHotel'}
                </Typography>
              </Box>
            )}
          </Box>

          {/* ================================================================== */}
          {/* CENTER SECTION: Shegeroom Branding (Guests) or Navigation (Auth) */}
          {/* ================================================================== */}
          
          {/* Shegeroom Branding - Only for non-authenticated users */}
          {!user && (
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' },
              justifyContent: 'center', 
              flex: 1,
              alignItems: 'center',
            }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: 'white',
                  fontSize: { xs: '1rem', md: '1.5rem' },
                  letterSpacing: '0.02em',
                  textAlign: 'center',
                }}
              >
                <Box
                  component="span"
                  sx={{
                    color: theme.palette.warning.main,
                    fontWeight: 900,
                    fontFamily: '"Pacifico", "Lobster", cursive',
                    fontSize: '1.25em',
                    fontStyle: 'italic',
                    letterSpacing: '0.05em',
                    textShadow: `2px 2px 4px rgba(0, 0, 0, 0.5), 0 0 1px ${theme.palette.warning.main}`,
                    WebkitTextStroke: `0.5px ${theme.palette.warning.main}`,
                  }}
                >
                  Shegeroom
                </Box>{' '}
                <Box component="span" sx={{ color: 'white' }}>
                  Hotel Reservation Management
                </Box>
              </Typography>
            </Box>
          )}

          {/* Desktop Navigation - For authenticated users */}
          {user && (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', flex: 1 }}>
              <DesktopNavigationButtons />
            </Box>
          )}

          {/* ================================================================== */}
          {/* RIGHT SECTION: User Info + Actions */}
          {/* ================================================================== */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'flex-end' }}>
            {/* Hotel Name Chip - For tenant-bound users */}
            {user && user.hotelName && shouldShowHotelName() && (
              <Chip
                label={user.hotelName}
                size="small"
                color="secondary"
                variant="outlined"
                sx={{ 
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  display: { xs: 'none', md: 'flex' },
                }}
              />
            )}
            
            {/* User Role Chip - For authenticated users */}
            {user && (
              <Chip
                label={getRoleDisplayName(user.role)}
                color={getRoleColor(user.role)}
                size="small"
                variant="outlined"
                sx={{ 
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  display: { xs: 'none', sm: 'flex' },
                }}
              />
            )}
            
            {/* Network Status Indicator - For staff/admin roles */}
            {user && user.roles?.some(role => 
              ['HOTEL_ADMIN', 'ADMIN', 'FRONTDESK', 'HOUSEKEEPING', 'MAINTENANCE', 'OPERATIONS_SUPERVISOR', 'SYSTEM_ADMIN'].includes(role)
            ) && (
              <NetworkStatusIndicator variant="minimal" />
            )}
            
            {/* User Menu Button - For authenticated users */}
            {user && (
              <IconButton
                onClick={handleMenuOpen}
                sx={{ 
                  p: 0.5, 
                  color: 'white',
                  '&:hover': { backgroundColor: getHoverBackground() }
                }}
              >
                <PersonIcon sx={{ fontSize: 28 }} />
              </IconButton>
            )}
            
            {/* Guest Navigation Buttons - For non-authenticated users */}
            {!user && (
              <>
                {!isMobile && (
                  <>
                    <Button
                      color="inherit"
                      onClick={() => handleNavigation('/find-booking')}
                      sx={{
                        borderRadius: 2,
                        fontSize: '0.8rem',
                        textTransform: 'none',
                        color: 'white',
                        '&:hover': { backgroundColor: getHoverBackground() },
                      }}
                    >
                      My Reservation
                    </Button>
                    <Button
                      color="inherit"
                      onClick={() => handleNavigation('/hotels/search')}
                      sx={{
                        borderRadius: 2,
                        fontSize: '0.8rem',
                        textTransform: 'none',
                        color: 'white',
                        '&:hover': { backgroundColor: getHoverBackground() },
                      }}
                    >
                      Reserve MyStay
                    </Button>
                  </>
                )}
                <Button
                  color="inherit"
                  onClick={() => handleNavigation('/login')}
                  sx={{
                    borderRadius: 2,
                    fontSize: '0.8rem',
                    textTransform: 'none',
                    color: 'white',
                    '&:hover': { backgroundColor: getHoverBackground() },
                  }}
                >
                  Login
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <MobileDrawer />

      {/* User Profile Menu */}
      {user && <UserProfileMenu />}
    </>
  );
};

export default NavbarNew;
