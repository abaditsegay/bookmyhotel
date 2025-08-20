import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
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
} from '@mui/material';
import {
  Menu as MenuIcon,
  Hotel as HotelIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  Business as BusinessIcon,
  AppRegistration as RegisterIcon,
  TrackChanges as StatusIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { user, logout } = useAuth();
  const { tenant } = useTenant();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path?: string) => {
    if (path) {
      navigate(path);
    }
    setMobileDrawerOpen(false);
    handleMenuClose();
  };

  const handleItemClick = (item: { path?: string; action?: () => void }) => {
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

  // Helper function to determine if hotel name should be shown
  const shouldShowHotelName = () => {
    // Hide hotel name for system admin and guest users
    if (!user) return true; // Show for anonymous users
    return user.role !== 'ADMIN' && user.role !== 'GUEST';
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems: { label: string; path?: string; icon: React.ReactNode; action?: () => void }[] = [];

    // Add navigation items for non-authenticated users
    if (!user) {
      baseItems.push({ 
        label: 'Find My Booking', 
        path: '/find-booking', 
        icon: <BusinessIcon /> 
      });
      baseItems.push({ 
        label: 'Register Hotel', 
        path: '/register-hotel-admin', 
        icon: <RegisterIcon /> 
      });
      baseItems.push({ 
        label: 'Registration Status', 
        path: '/registration-status', 
        icon: <StatusIcon /> 
      });
    }

    if (user) {
      // For admin, show minimal navigation without dashboard
      if (user.role === 'ADMIN') {
        return [...baseItems, { label: 'Profile', path: '/profile', icon: <PersonIcon /> }];
      }

      // For hotel admin, show hotel admin dashboard
      if (user.role === 'HOTEL_ADMIN') {
        return [...baseItems, { label: 'Dashboard', path: '/hotel-admin', icon: <DashboardIcon /> }];
      }

      // For front desk staff, show front desk dashboard
      if (user.role === 'FRONTDESK') {
        return [...baseItems, { label: 'Front Desk', path: '/frontdesk', icon: <DashboardIcon /> }];
      }

      // For guests and customers, show dashboard and bookings
      if (user.role === 'GUEST') {
        const guestItems = [
          { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
          { label: 'My Bookings', path: '/bookings', icon: <BusinessIcon /> },
          { label: 'Profile', path: '/profile', icon: <PersonIcon /> },
        ];
        return [...baseItems, ...guestItems];
      }

      // For other roles (like HOUSEKEEPING, HOTEL_MANAGER), only show profile
      return [...baseItems, { label: 'Profile', path: '/profile', icon: <PersonIcon /> }];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  // Check if current path is active
  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Desktop Navigation
  const DesktopNavigation = () => (
    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
      {navigationItems.map((item, index) => (
        <Button
          key={item.path || index}
          color="inherit"
          onClick={() => handleItemClick(item)}
          startIcon={item.icon}
          sx={{
            mx: 0.5,
            borderRadius: 2,
            backgroundColor: item.path && isActivePath(item.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
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
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
          🏨 BookMyHotel
        </Typography>
        {tenant && shouldShowHotelName() && (
          <Chip
            label={tenant.name}
            size="small"
            color="secondary"
            sx={{ mt: 1 }}
          />
        )}
      </Box>
      <Divider />
      <List>
        {navigationItems.map((item, index) => (
          <ListItem
            key={item.path || index}
            onClick={() => handleItemClick(item)}
            sx={{
              cursor: 'pointer',
              backgroundColor: item.path && isActivePath(item.path) ? theme.palette.action.selected : 'transparent',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon sx={{ color: item.path && isActivePath(item.path) ? theme.palette.primary.main : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              sx={{ 
                '& .MuiListItemText-primary': {
                  fontWeight: item.path && isActivePath(item.path) ? 600 : 400,
                  color: item.path && isActivePath(item.path) ? theme.palette.primary.main : 'inherit',
                }
              }}
            />
          </ListItem>
        ))}
      </List>
      {user && (
        <>
          <Divider />
          <List>
            <ListItem onClick={handleLogout} sx={{ cursor: 'pointer' }}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </>
      )}
    </Drawer>
  );

  // User Menu
  const UserMenu = () => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      PaperProps={{
        sx: {
          mt: 1.5,
          minWidth: 180,
          '& .MuiMenuItem-root': {
            px: 2,
            py: 1,
          },
        },
      }}
    >
      <MenuItem onClick={() => handleNavigation('/profile')}>
        <PersonIcon sx={{ mr: 1 }} />
        Profile
      </MenuItem>
      {user?.role === 'GUEST' && (
        <>
          <MenuItem onClick={() => handleNavigation('/dashboard')}>
            <DashboardIcon sx={{ mr: 1 }} />
            Dashboard
          </MenuItem>
          <MenuItem onClick={() => handleNavigation('/bookings')}>
            <BusinessIcon sx={{ mr: 1 }} />
            My Bookings
          </MenuItem>
        </>
      )}
      <Divider />
      <MenuItem onClick={handleLogout}>
        <LogoutIcon sx={{ mr: 1 }} />
        Logout
      </MenuItem>
    </Menu>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={2}
        sx={{
          backgroundColor: theme.palette.primary.main,
          backgroundImage: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Left Section: Logo + Mobile Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
            
            {/* Logo */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                '&:hover': { opacity: 0.9 }
              }}
              onClick={() => handleNavigation('/')}
            >
              <HotelIcon sx={{ mr: 1, fontSize: 28 }} />
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 'bold',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                BookMyHotel
              </Typography>
            </Box>

            {/* Tenant Badge */}
            {tenant && !isMobile && shouldShowHotelName() && (
              <Chip
                label={tenant.name}
                size="small"
                variant="outlined"
                sx={{ 
                  ml: 2, 
                  color: 'white', 
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.75rem',
                }}
              />
            )}
          </Box>

          {/* Center Section: Desktop Navigation */}
          <DesktopNavigation />

          {/* Right Section: User Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {user ? (
              <>
                {/* User Avatar & Menu */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                    {user.firstName || user.email?.split('@')[0] || 'User'}
                  </Typography>
                  <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
                    <Avatar 
                      sx={{ 
                        width: 36, 
                        height: 36,
                        backgroundColor: theme.palette.secondary.main,
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {user.firstName?.[0] || user.email?.[0] || 'U'}
                    </Avatar>
                  </IconButton>
                </Box>
                <UserMenu />
              </>
            ) : (
              /* Guest Actions */
              <Button
                color="inherit"
                onClick={() => handleNavigation('/login')}
                startIcon={<LoginIcon />}
                sx={{
                  borderRadius: 2,
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                }}
              >
                {!isMobile && 'Login'}
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <MobileDrawer />
    </>
  );
};

export default Navbar;
