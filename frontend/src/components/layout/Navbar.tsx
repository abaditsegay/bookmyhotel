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
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Business as BusinessIcon,
  AppRegistration as RegisterIcon,
  Search as SearchIcon,
  Store as StoreIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { themeConstants } from '../../theme/theme';
import { useNotifications } from '../../hooks/useNotifications';
import NetworkStatusIndicator from '../NetworkStatusIndicator';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { user, logout } = useAuth();
  const { stats } = useNotifications();
  
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
      'SYSTEM_ADMIN': 'System Admin',
      'ADMIN': 'System Administrator',
      'HOTEL_ADMIN': 'Hotel Administrator',
      'FRONTDESK': 'Front Desk Staff',
      'CUSTOMER': 'Customer', // Registered users with accounts
      'HOTEL_MANAGER': 'Hotel Manager',
      'HOUSEKEEPING': 'Housekeeping Staff',
      'OPERATIONS_SUPERVISOR': 'Operations Supervisor',
      'MAINTENANCE': 'Maintenance Staff',
      'GUEST': 'Guest' // Anonymous users (rarely seen in UI)
    };
    return roleMap[role] || role;
  };

  // Helper function to get role color
  const getRoleColor = (role: string) => {
    const colorMap: { [key: string]: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error' } = {
      'SYSTEM_ADMIN': 'error',
      'ADMIN': 'error',
      'HOTEL_ADMIN': 'primary',
      'FRONTDESK': 'info',
      'CUSTOMER': 'success', // Registered customers
      'HOTEL_MANAGER': 'secondary',
      'HOUSEKEEPING': 'warning',
      'OPERATIONS_SUPERVISOR': 'primary',
      'MAINTENANCE': 'warning',
      'GUEST': 'secondary' // Anonymous guests
    };
    return colorMap[role] || 'primary';
  };

  // Helper function to determine if hotel name should be shown
  const shouldShowHotelName = () => {
    // Hide hotel name for system admin and customer users
    if (!user) return true; // Show for anonymous users
    return user.role !== 'SYSTEM_ADMIN' && user.role !== 'ADMIN' && user.role !== 'CUSTOMER';
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    // Book MyStay should only be visible to CUSTOMER, GUEST roles, and non-authenticated users
    const shouldShowBookMyStay = !user || user.role === 'CUSTOMER' || user.role === 'GUEST';
    
    const baseItems: { label: string; path?: string; icon: React.ReactNode; action?: () => void }[] = [];
    
    // Add Book MyStay only for appropriate users
    if (shouldShowBookMyStay) {
      baseItems.push({ label: 'Book MyStay', path: '/hotels/search', icon: <SearchIcon /> });
    }

    if (user) {
      // For system admin and admin, show minimal navigation without Book MyStay
      if (user.role === 'SYSTEM_ADMIN' || user.role === 'ADMIN') {
        return [...baseItems];
      }

      // For hotel admin, show notifications and shop navigation
      if (user.role === 'HOTEL_ADMIN') {
        const hotelAdminItems = [
          { 
            label: 'Notifications', 
            path: '/notifications', 
            icon: stats.totalUnread > 0 ? (
              <Badge badgeContent={stats.totalUnread} color="error">
                <NotificationsIcon />
              </Badge>
            ) : <NotificationsIcon />
          },
          { label: 'Shop', path: '/shop', icon: <StoreIcon /> },
        ];
        return [...baseItems, ...hotelAdminItems];
      }

      // For front desk staff, show notifications and shop navigation
      if (user.role === 'FRONTDESK') {
        const frontdeskItems = [
          { 
            label: 'Notifications', 
            path: '/notifications', 
            icon: stats.totalUnread > 0 ? (
              <Badge badgeContent={stats.totalUnread} color="error">
                <NotificationsIcon />
              </Badge>
            ) : <NotificationsIcon />
          },
          { label: 'Shop', path: '/shop', icon: <StoreIcon /> },
        ];
        return [...baseItems, ...frontdeskItems];
      }

      // For operations supervisor, don't show operations dashboard link since it's their landing page
      if (user.role === 'OPERATIONS_SUPERVISOR') {
        // Operations supervisors land directly on their dashboard, no additional nav needed
        return [...baseItems];
      }

      // For maintenance staff, show operations dashboard
//      if (user.role === 'MAINTENANCE') {
//        const maintenanceItems = [
//          { label: 'Operations Dashboard', path: '/operations/dashboard', icon: <BusinessIcon /> },
//        ];
//       return [...baseItems, ...maintenanceItems];
//      }

      // For customers and guests, show bookings (without dashboard or profile)
      if (user.role === 'CUSTOMER') {
        const customerItems = [
          { label: 'Search', path: '/hotels/search', icon: <SearchIcon /> },
          { label: 'Bookings', path: '/my-bookings', icon: <BusinessIcon /> },
          { label: 'Profile', path: '/profile', icon: <PersonIcon /> },
        ];
        return [...baseItems, ...customerItems];
      }

      // For other roles (like HOUSEKEEPING, HOTEL_MANAGER), show only base items (which won't include Book MyStay)
      return [...baseItems];
    }

    // For non-authenticated users, show Book MyStay
    return baseItems;
  };

  const navigationItems = getNavigationItems();

  // Check if current path is active
  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Desktop Navigation
  const DesktopNavigation = () => (
    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
      {navigationItems.map((item, index) => (
        <Button
          key={item.path || index}
          color="inherit"
          onClick={() => handleItemClick(item)}
          startIcon={item.icon}
          sx={{
            mx: 0.5,
            borderRadius: 2,
            fontSize: '0.8rem', // Smaller font size
            backgroundColor: item.label === 'Shop' 
              ? 'red' 
              : item.path && isActivePath(item.path) 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'transparent',
            '&:hover': {
              backgroundColor: item.label === 'Shop' 
                ? 'error.dark' 
                : 'rgba(255, 255, 255, 0.1)',
            },
            // Ensure proper stacking and boundaries
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
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
          🏨 BookMyHotel
        </Typography>
        {user && user.hotelName && shouldShowHotelName() && (
          <Chip
            label={user.hotelName}
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
              backgroundColor: item.label === 'Hotel Shop' 
                ? theme.palette.error.main
                : item.path && isActivePath(item.path) 
                  ? theme.palette.action.selected 
                  : 'transparent',
              '&:hover': {
                backgroundColor: item.label === 'Hotel Shop' 
                  ? theme.palette.error.dark
                  : theme.palette.action.hover,
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
              <ListItemText primary="Find Booking" />
            </ListItem>
            <ListItem onClick={() => handleNavigation('/register-hotel')} sx={{ cursor: 'pointer' }}>
              <ListItemIcon>
                <RegisterIcon />
              </ListItemIcon>
              <ListItemText primary="Register" />
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
          <MenuItem onClick={() => handleNavigation('/hotels/search')}>
            <SearchIcon sx={{ mr: 1 }} />
            Hotel Search
          </MenuItem>
          <MenuItem onClick={() => handleNavigation('/my-bookings')}>
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
          backgroundImage: (theme) => theme.custom.constants.gradients.primaryButton,
          height: 'auto', // Allow AppBar to grow with content
        }}
      >
        <Toolbar 
          sx={{ 
            justifyContent: 'space-between',
            minHeight: 56, // Compact navbar height
            height: 'auto', // Allow toolbar to grow
            alignItems: 'center', // Center items vertically
            py: 1 // Reduced padding for compact look
          }}
          disableGutters={false}
        >
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
                '&:hover': { opacity: 0.9 },
                height: 'auto', // Let container size naturally
              }}
              onClick={() => handleNavigation('/')}
            >
              <Box
                component="img"
                src="/logo.svg" 
                alt="BookMyHotel" 
                sx={{ 
                  height: 32, // Compact logo for compact navbar
                  width: 'auto', // Maintain aspect ratio
                  maxHeight: 32, // Prevent shrinking
                  minHeight: 32, // Prevent shrinking
                  objectFit: 'contain', // Ensure proper scaling
                }}
              />
            </Box>
          </Box>

          {/* Center Section: Hotel Name for Hotel Admin and Front Desk */}
          {user && user.hotelName && shouldShowHotelName() && (
            <Box sx={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
              <Typography 
                variant="h4" 
                component="div" 
                sx={{ 
                  fontWeight: 'bold',
                  color: themeConstants.brandGold,
                  textAlign: 'center',
                  fontSize: { xs: '1.2rem', sm: '1.8rem', md: '2rem' },
                  textShadow: themeConstants.shadows.textShadow,
                  // Allow text to wrap and display fully
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  maxWidth: themeConstants.headerMaxWidths,
                  lineHeight: 1.2,
                }}
              >
                {user.hotelName}
              </Typography>
            </Box>
          )}

          {/* For users who shouldn't see hotel name, show navigation in center */}
          {(!user || !user.hotelName || !shouldShowHotelName()) && (
            <Box sx={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
              <DesktopNavigation />
            </Box>
          )}

          {/* Right Section: User Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'flex-end' }}>
            {/* Show navigation on right for users with hotel name displayed */}
            {user && user.hotelName && shouldShowHotelName() && !isMobile && (
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
                    position: 'relative',
                    zIndex: 10, // Ensure it stays above other elements
                  }}
                />
                
                {/* Network Status Indicator - Only for staff/admin roles */}
                {user.roles && user.roles.some(role => ['HOTEL_ADMIN', 'ADMIN', 'FRONTDESK', 'HOUSEKEEPING', 'MAINTENANCE', 'OPERATIONS_SUPERVISOR', 'SYSTEM_ADMIN'].includes(role)) && (
                  <NetworkStatusIndicator 
                    variant="minimal" 
                    className="network-status-navbar"
                  />
                )}
                
                {/* User Icon & Menu */}
                <IconButton onClick={handleMenuOpen} sx={{ p: 0.5, color: 'white', position: 'relative', zIndex: 10 }}>
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
                        fontSize: '0.8rem', // Smaller font size
                        '&:hover': { backgroundColor: 'action.hover' },
                      }}
                    >
                      Find Booking
                    </Button>
                    <Button
                      color="inherit"
                      onClick={() => handleNavigation('/register-hotel')}
                      sx={{
                        borderRadius: 2,
                        fontSize: '0.8rem', // Smaller font size
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                      }}
                    >
                      Register
                    </Button>
                  </>
                )}
                <Button
                  color="inherit"
                  onClick={() => handleNavigation('/login')}
                  sx={{
                    borderRadius: 2,
                    fontSize: '0.8rem', // Smaller font size
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
