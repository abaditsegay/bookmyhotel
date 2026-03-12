import { COLORS, addAlpha } from '../../theme/themeColors';
import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton
} from '@mui/material';
import {
  AccountCircle,
  Hotel,
  People,
  Settings,
  Logout,
  AdminPanelSettings,
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from '../common/LanguageSelector';
import CalendarSelector from '../common/CalendarSelector';

/**
 * Navigation bar for system-wide users (CUSTOMER and ADMIN roles)
 * Shows global navigation without tenant-specific context
 */
export const SystemWideNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isSystemWideContext } = useTenant();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const handleSystemSettings = () => {
    navigate('/system-settings');
    handleClose();
  };

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const closeMobileDrawer = () => {
    setMobileDrawerOpen(false);
  };

  // Only show for system-wide users
  if (!user || !isSystemWideContext) {
    return null;
  }

  const isSystemAdmin = user.roles.includes('SUPER_ADMIN') || user.roles.includes('ADMIN');
  const isSystemCustomer = user.roles.includes('CUSTOMER');

  return (
    <AppBar 
      position="static" 
      elevation={0} // Remove elevation for better performance
      sx={{ 
        backgroundColor: theme.palette.primary.main,
        backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        borderBottom: `1px solid ${theme.palette.divider}`, // Add subtle border for structure
        zIndex: theme.zIndex.appBar, // Ensure proper z-index above sidebar
      }}
    >
      <Toolbar>
        {/* Left Section: Mobile Menu + Theme Toggle + Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          {/* Mobile Menu - Leftmost position on mobile */}
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
          
          {/* Language Selector - After mobile menu */}
          <LanguageSelector variant="icon" size="medium" />
          
          {/* Calendar Selector - Next to Language Selector */}
          <CalendarSelector variant="icon" size="medium" />
          
          {/* Logo and App Name */}
          <AdminPanelSettings sx={{ ml: 2, mr: 2 }} />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              display: { xs: 'none', sm: 'block' } // Hide on very small screens
            }}
          >
            BookMyHotel - System Portal
          </Typography>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              display: { xs: 'block', sm: 'none' } // Show only on very small screens
            }}
          >
            BookMyHotel
          </Typography>
        </Box>

        {/* System-wide user indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <Chip 
            label={isSystemAdmin ? "System Administrator" : "Guest"}
            color={isSystemAdmin ? "error" : "success"}
            size="small"
            variant="outlined"
            sx={{ 
              color: COLORS.WHITE, 
              borderColor: addAlpha(COLORS.WHITE, 0.5),
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          />
        </Box>

        {/* Navigation buttons for system admins - Hidden on mobile */}
        {isSystemAdmin && (
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, mr: 2 }}>
            <Button 
              color="inherit" 
              startIcon={<Hotel />}
              onClick={() => navigate('/system/hotels')}
              sx={{ 
                fontSize: '0.8rem',
                color: COLORS.WHITE,
                '&:hover': { color: COLORS.WHITE }
              }}
            >
              Hotels
            </Button>
            <Button 
              color="inherit" 
              startIcon={<People />}
              onClick={() => navigate('/system/users')}
              sx={{ 
                fontSize: '0.8rem',
                color: COLORS.WHITE,
                '&:hover': { color: COLORS.WHITE }
              }}
            >
              Users
            </Button>
            <Button 
              color="inherit" 
              startIcon={<Settings />}
              onClick={handleSystemSettings}
              sx={{ 
                fontSize: '0.8rem',
                color: COLORS.WHITE,
                '&:hover': { color: COLORS.WHITE }
              }}
            >
              Settings
            </Button>
          </Box>
        )}

        {/* Search hotels button for guests - Hidden on mobile */}
        {isSystemCustomer && (
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, mr: 2 }}>
            <Button 
              color="inherit" 
              startIcon={<Hotel />}
              onClick={() => navigate('/search')}
              sx={{ 
                fontSize: '0.8rem',
                color: COLORS.WHITE,
                '&:hover': { color: COLORS.WHITE }
              }}
            >
              Search Hotels
            </Button>
          </Box>
        )}

        {/* User menu */}
        <div>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircle sx={{ fontSize: 32 }} />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleProfile}>
              <AccountCircle sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            {isSystemAdmin && (
              <MenuItem onClick={handleSystemSettings}>
                <Settings sx={{ mr: 1 }} />
                System Settings
              </MenuItem>
            )}
            <Divider />
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </div>
      </Toolbar>
      
      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={closeMobileDrawer}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Menu
          </Typography>
          <IconButton onClick={closeMobileDrawer}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <List>
          {/* System Admin Navigation */}
          {isSystemAdmin && (
            <>
              <ListItem disablePadding>
                <ListItemButton onClick={() => { navigate('/system/hotels'); closeMobileDrawer(); }}>
                  <ListItemIcon>
                    <Hotel />
                  </ListItemIcon>
                  <ListItemText primary="Hotels" />
                </ListItemButton>
              </ListItem>
              
              <ListItem disablePadding>
                <ListItemButton onClick={() => { navigate('/system/users'); closeMobileDrawer(); }}>
                  <ListItemIcon>
                    <People />
                  </ListItemIcon>
                  <ListItemText primary="Users" />
                </ListItemButton>
              </ListItem>
              
              <ListItem disablePadding>
                <ListItemButton onClick={() => { handleSystemSettings(); closeMobileDrawer(); }}>
                  <ListItemIcon>
                    <Settings />
                  </ListItemIcon>
                  <ListItemText primary="System Settings" />
                </ListItemButton>
              </ListItem>
            </>
          )}
          
          {/* System Customer Navigation */}
          {isSystemCustomer && (
            <ListItem disablePadding>
              <ListItemButton onClick={() => { navigate('/search'); closeMobileDrawer(); }}>
                <ListItemIcon>
                  <Hotel />
                </ListItemIcon>
                <ListItemText primary="Search Hotels" />
              </ListItemButton>
            </ListItem>
          )}
          
          <Divider sx={{ my: 1 }} />
          
          {/* Profile and Logout */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => { handleProfile(); closeMobileDrawer(); }}>
              <ListItemIcon>
                <AccountCircle />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton onClick={() => { handleLogout(); closeMobileDrawer(); }}>
              <ListItemIcon>
                <Logout />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </AppBar>
  );
};
