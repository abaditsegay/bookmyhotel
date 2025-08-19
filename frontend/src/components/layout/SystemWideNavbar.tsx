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
  Avatar,
  Chip
} from '@mui/material';
import {
  AccountCircle,
  Hotel,
  People,
  Settings,
  Logout,
  AdminPanelSettings
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { useNavigate } from 'react-router-dom';

/**
 * Navigation bar for system-wide users (GUEST and ADMIN roles)
 * Shows global navigation without tenant-specific context
 */
export const SystemWideNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isSystemWideContext } = useTenant();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

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

  // Only show for system-wide users
  if (!user || !isSystemWideContext) {
    return null;
  }

  const isSystemAdmin = user.roles.includes('ADMIN');
  const isSystemGuest = user.roles.includes('GUEST');

  return (
    <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
      <Toolbar>
        {/* Logo and App Name */}
        <AdminPanelSettings sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          BookMyHotel - System Portal
        </Typography>

        {/* System-wide user indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <Chip 
            label={isSystemAdmin ? "System Admin" : "Global Guest"}
            color={isSystemAdmin ? "secondary" : "default"}
            variant="outlined"
            size="small"
            sx={{ 
              color: 'white', 
              borderColor: 'white',
              bgcolor: isSystemAdmin ? 'rgba(255,255,255,0.1)' : 'transparent'
            }}
          />
        </Box>

        {/* Navigation buttons for system admins */}
        {isSystemAdmin && (
          <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
            <Button 
              color="inherit" 
              startIcon={<Hotel />}
              onClick={() => navigate('/system/hotels')}
            >
              Hotels
            </Button>
            <Button 
              color="inherit" 
              startIcon={<People />}
              onClick={() => navigate('/system/users')}
            >
              Users
            </Button>
            <Button 
              color="inherit" 
              startIcon={<Settings />}
              onClick={handleSystemSettings}
            >
              Settings
            </Button>
          </Box>
        )}

        {/* Search hotels button for guests */}
        {isSystemGuest && (
          <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
            <Button 
              color="inherit" 
              startIcon={<Hotel />}
              onClick={() => navigate('/search')}
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
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {user.firstName ? user.firstName[0].toUpperCase() : <AccountCircle />}
            </Avatar>
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
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
};
