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
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Business as BusinessIcon,
  AppRegistration as RegisterIcon,
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

  // Helper function to get user role display name
  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'ADMIN': 'System Administrator',
      'HOTEL_ADMIN': 'Hotel Administrator',
      'FRONTDESK': 'Front Desk Staff',
      'CUSTOMER': 'Customer', // Registered users with accounts
      'HOTEL_MANAGER': 'Hotel Manager',
      'HOUSEKEEPING': 'Housekeeping Staff',
      'MAINTENANCE': 'Maintenance Staff',
      'GUEST': 'Guest' // Anonymous users (rarely seen in UI)
    };
    return roleMap[role] || role;
  };

  // Helper function to get role color
  const getRoleColor = (role: string) => {
    const colorMap: { [key: string]: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error' } = {
      'ADMIN': 'error',
      'HOTEL_ADMIN': 'primary',
      'FRONTDESK': 'info',
      'CUSTOMER': 'success', // Registered customers
      'HOTEL_MANAGER': 'secondary',
      'HOUSEKEEPING': 'warning',
      'MAINTENANCE': 'warning',
      'GUEST': 'secondary' // Anonymous guests
    };
    return colorMap[role] || 'primary';
  };

  // Helper function to determine if hotel name should be shown
  const shouldShowHotelName = () => {
    // Hide hotel name for system admin and customer users
    if (!user) return true; // Show for anonymous users
    return user.role !== 'ADMIN' && user.role !== 'CUSTOMER';
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems: { label: string; path?: string; icon: React.ReactNode; action?: () => void }[] = [];

    // Base items are now empty for non-authenticated users since we're moving them to the right side

    if (user) {
      // For admin, show minimal navigation without dashboard or profile
      if (user.role === 'ADMIN') {
        return [...baseItems];
      }

      // For hotel admin, show only base items (no dashboard link)
      if (user.role === 'HOTEL_ADMIN') {
        return [...baseItems];
      }

      // For front desk staff, show only base items (no dashboard link)
      if (user.role === 'FRONTDESK') {
        return [...baseItems];
      }

      // For customers and guests, show bookings (without dashboard or profile)
      if (user.role === 'CUSTOMER') {
        const customerItems = [
          { label: 'My Bookings', path: '/bookings', icon: <BusinessIcon /> },
        ];
        return [...baseItems, ...customerItems];
      }

      // For other roles (like HOUSEKEEPING, HOTEL_MANAGER), show only base items
      return [...baseItems];
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
            sx={{ mt: 1, mr: 1 }}
          />
        )}
        {user && (
          <Chip
            label={getRoleDisplayName(user.role)}
            color={getRoleColor(user.role)}
            size="small"
            variant="outlined"
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
        
        {/* Additional items for non-authenticated users */}
        {!user && (
          <>
            <ListItem onClick={() => handleNavigation('/find-booking')} sx={{ cursor: 'pointer' }}>
              <ListItemIcon>
                <BusinessIcon />
              </ListItemIcon>
              <ListItemText primary="Find My Booking" />
            </ListItem>
            <ListItem onClick={() => handleNavigation('/register-hotel-admin')} sx={{ cursor: 'pointer' }}>
              <ListItemIcon>
                <RegisterIcon />
              </ListItemIcon>
              <ListItemText primary="Register Hotel" />
            </ListItem>
          </>
        )}
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
      {user?.role === 'CUSTOMER' && (
        <>
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
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
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
          </Box>

          {/* Center Section: Hotel Name for Hotel Admin and Front Desk */}
          {tenant && shouldShowHotelName() && (
            <Box sx={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
              <Typography 
                variant="h4" 
                component="div" 
                sx={{ 
                  fontWeight: 'bold',
                  color: '#FFD700', // Bright gold color
                  textAlign: 'center',
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  maxWidth: { xs: '200px', sm: '300px', md: '400px' },
                  textShadow: '2px 2px 4px rgba(0,0,0,0.7)' // Stronger shadow for better contrast
                }}
              >
                {tenant.name}
              </Typography>
            </Box>
          )}

          {/* For users who shouldn't see hotel name, show navigation in center */}
          {(!tenant || !shouldShowHotelName()) && (
            <Box sx={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
              <DesktopNavigation />
            </Box>
          )}

          {/* Right Section: User Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, justifyContent: 'flex-end' }}>
            {/* Show navigation on right for users with hotel name displayed */}
            {tenant && shouldShowHotelName() && !isMobile && (
              <DesktopNavigation />
            )}
            
            {user ? (
              <>
                {/* User Role Display */}
                <Chip
                  label={getRoleDisplayName(user.role)}
                  color={getRoleColor(user.role)}
                  size="small"
                  variant="outlined"
                  data-testid="user-role"
                  sx={{ 
                    color: 'white', 
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    display: { xs: 'none', sm: 'flex' }, // Hide on mobile to save space
                  }}
                />
                
                {/* User Icon & Menu */}
                <IconButton onClick={handleMenuOpen} sx={{ p: 0.5, color: 'white' }}>
                  <PersonIcon sx={{ fontSize: 28 }} />
                </IconButton>
                <UserMenu />
              </>
            ) : (
              /* Guest Actions */
              <>
                {!isMobile && (
                  <>
                    <Button
                      color="inherit"
                      onClick={() => handleNavigation('/find-booking')}
                      sx={{
                        borderRadius: 2,
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                      }}
                    >
                      Find My Booking
                    </Button>
                    <Button
                      color="inherit"
                      onClick={() => handleNavigation('/register-hotel-admin')}
                      sx={{
                        borderRadius: 2,
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                      }}
                    >
                      Register Hotel
                    </Button>
                  </>
                )}
                <Button
                  color="inherit"
                  onClick={() => handleNavigation('/login')}
                  sx={{
                    borderRadius: 2,
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
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
    </>
  );
};

export default Navbar;
