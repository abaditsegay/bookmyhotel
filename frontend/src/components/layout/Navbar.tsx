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
  Search as SearchIcon,
  Store as StoreIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import NetworkStatusIndicator from '../NetworkStatusIndicator';
import LanguageSelector from '../common/LanguageSelector';

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
      // Workaround: React Router has issues updating from /hotels/search
      // Use direct navigation to prevent visual glitches
      if (location.pathname === '/hotels/search') {
        window.location.href = path;
      } else {
        navigate(path);
      }
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
    const baseItems: { label: string; path?: string; icon: React.ReactNode; action?: () => void }[] = [];
    
    // No base navigation items for guests - they will use guest action buttons instead

    if (user) {


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

      // For other roles (like HOUSEKEEPING, HOTEL_MANAGER), show only base items
      return [...baseItems];
    }

    // For non-authenticated users, show base items (none)
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
            fontWeight: user ? 'bold' : 'normal', // Bold for authenticated users
            textTransform: 'none', // Disable all caps
            color: item.label === 'Shop' ? '#333' : getTextColor(), // Dark text for Shop button, white for others
            backgroundColor: item.label === 'Shop' 
              ? '#FFD700' // Yellow background for Shop button
              : item.path && isActivePath(item.path) 
                ? getActiveBackground()
                : 'transparent',
            '&:hover': {
              backgroundColor: item.label === 'Shop' 
                ? '#FFC107' // Darker yellow on hover for Shop button
                : getHoverBackground(),
              color: item.label === 'Shop' ? '#222' : getTextColor(), // Darker text on hover for Shop button
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
              backgroundColor: item.label === 'Shop' 
                ? '#FFD700' // Yellow background for Shop button
                : item.path && isActivePath(item.path) 
                  ? theme.palette.action.selected 
                  : 'transparent',
              '&:hover': {
                backgroundColor: item.label === 'Shop' 
                  ? '#FFC107' // Darker yellow on hover for Shop button
                  : theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon sx={{ 
              color: item.label === 'Shop' 
                ? '#333' // Dark icon for Shop button
                : item.path && isActivePath(item.path) ? theme.palette.primary.main : 'inherit' 
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              sx={{ 
                '& .MuiListItemText-primary': {
                  fontWeight: item.path && isActivePath(item.path) ? 600 : 400,
                  color: item.label === 'Shop' 
                    ? '#333' // Dark text for Shop button
                    : item.path && isActivePath(item.path) ? theme.palette.primary.main : 'inherit',
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
              <ListItemText primary="My Reservation" />
            </ListItem>
            <ListItem onClick={() => handleNavigation('/hotels/search')} sx={{ cursor: 'pointer' }}>
              <ListItemIcon>
                <SearchIcon />
              </ListItemIcon>
              <ListItemText primary="Reserve MyStay" />
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
      aria-label="User account menu"
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
      <MenuItem onClick={() => handleNavigation('/profile')} aria-label="Go to profile page">
        <PersonIcon sx={{ mr: 1 }} aria-hidden="true" />
        Profile
      </MenuItem>
      {user?.role === 'CUSTOMER' && (
        <>
          <MenuItem onClick={() => handleNavigation('/hotels/search')} aria-label="Search for hotels">
            <SearchIcon sx={{ mr: 1 }} aria-hidden="true" />
            Hotel Search
          </MenuItem>
          <MenuItem onClick={() => handleNavigation('/my-bookings')} aria-label="View my bookings">
            <BusinessIcon sx={{ mr: 1 }} aria-hidden="true" />
            My Bookings
          </MenuItem>
        </>
      )}
      <Divider />
      <MenuItem onClick={handleLogout} aria-label="Logout from account">
        <LogoutIcon sx={{ mr: 1 }} aria-hidden="true" />
        Logout
      </MenuItem>
    </Menu>
  );

  // Helper function to get hover background based on authentication state
  const getHoverBackground = () => {
    // Use white overlay for all users with the blue background
    return 'rgba(255, 255, 255, 0.1)';
  };

  // Helper function to get active background based on authentication state
  const getActiveBackground = () => {
    // Use white overlay for all users with the blue background
    return 'rgba(255, 255, 255, 0.2)';
  };

  // Helper function to get text color based on authentication state
  const getTextColor = () => {
    // For both authenticated users and guests with dark backgrounds, use white text
    if (user) {
      return 'white'; // White text on navy blue background
    }
    // For guest booking with blue background, use white text
    return 'white';
  };

  // Helper function to get navbar background based on authentication state
  const getNavbarBackground = () => {
    // Use the same blue gradient for both authenticated and guest users
    return {
      backgroundColor: theme.palette.primary.main,
      backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    };
  };

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={2} // Add subtle elevation for better visual separation
        sx={{
          ...getNavbarBackground(),
          height: 64, // Fixed height to prevent movement
          borderBottom: `1px solid ${theme.palette.divider}`, // Add subtle border for structure
          zIndex: theme.zIndex.appBar, // Ensure proper z-index above sidebar
          top: 0, // Explicitly set top position
          left: 0, // Explicitly set left position
          right: 0, // Explicitly set right position
        }}
      >
        <Toolbar 
          sx={{ 
            justifyContent: 'space-between',
            minHeight: 64, // Fixed height to match AppBar
            height: 64, // Fixed height to prevent movement
            alignItems: 'center', // Center items vertically
            py: 0, // Remove padding to maintain fixed height
            px: { xs: 1, sm: 2 }, // Responsive padding
            margin: 0, // Ensure no margin
          }}
          disableGutters={false}
        >
          {/* Left Section: Mobile Menu + Theme Toggle + Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            {/* Mobile Menu - Leftmost position on mobile */}
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="Open navigation menu"
                onClick={toggleMobileDrawer}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            {/* Language Selector - After mobile menu */}
            <LanguageSelector variant="icon" size="small" />
            
            {/* Dashboard Link - Only for logged-in users */}
            {user && (
              <Box 
                component="button"
                role="link"
                aria-label="Go to dashboard"
                tabIndex={0}
                onKeyPress={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleNavigation('/');
                  }
                }}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.9 },
                  height: 'auto',
                  ml: 1,
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                }}
                onClick={() => handleNavigation('/')}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: 'white',
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    letterSpacing: '0.02em',
                  }}
                >
                  Dashboard
                </Typography>
              </Box>
            )}
          </Box>

          {/* Center Section: Hotel Name for Hotel Admin and Front Desk - Hidden on Mobile */}
          {user && user.hotelName && shouldShowHotelName() && (
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' }, // Hide on mobile (xs and sm), show on md and up
              justifyContent: 'center', 
              flex: 1 
            }}>
              <Typography 
                variant="h4" 
                component="div" 
                sx={{ 
                  fontWeight: 700,
                  fontFamily: '"Pacifico", "Lobster", cursive',
                  fontStyle: 'italic',
                  color: 'white',
                  textAlign: 'center',
                  fontSize: { md: '2rem', lg: '2.5rem' },
                  textShadow: '3px 3px 6px rgba(0, 0, 0, 0.4)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '500px',
                  lineHeight: 1.2,
                  letterSpacing: '0.03em',
                }}
              >
                {user.hotelName}
              </Typography>
            </Box>
          )}

          {/* Center Section: Shegeroom Branding - Only for non-logged-in users */}
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
                    color: '#FFD700',
                    fontWeight: 900,
                    fontFamily: '"Pacifico", "Lobster", cursive',
                    fontSize: '1.25em',
                    fontStyle: 'italic',
                    letterSpacing: '0.05em',
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5), 0 0 1px #FFD700',
                    WebkitTextStroke: '0.5px #FFD700',
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

          {/* For users who shouldn't see hotel name, or on mobile, show navigation in center */}
          {user && (!user.hotelName || !shouldShowHotelName() || isMobile) && (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', flex: 1 }}>
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
                    color: user ? 'white' : 'white', 
                    borderColor: user ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.5)',
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
                <IconButton onClick={handleMenuOpen} sx={{ p: 0.5, color: getTextColor(), position: 'relative', zIndex: 10 }}>
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
                        fontWeight: user ? 'bold' : 'normal', // Bold for authenticated users
                        textTransform: 'none', // Disable all caps
                        '&:hover': { backgroundColor: 'action.hover' },
                      }}
                    >
                      My Reservation
                    </Button>
                    <Button
                      color="inherit"
                      onClick={() => handleNavigation('/hotels/search')}
                      sx={{
                        borderRadius: 2,
                        fontSize: '0.8rem', // Smaller font size
                        fontWeight: user ? 'bold' : 'normal', // Bold for authenticated users
                        textTransform: 'none', // Disable all caps
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
                    fontSize: '0.8rem', // Smaller font size
                    fontWeight: user ? 'bold' : 'normal', // Bold for authenticated users
                    textTransform: 'none', // Disable all caps
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
    </>
  );
};

export default Navbar;
