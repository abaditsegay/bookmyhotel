import React from 'react';
import {
  IconButton,
  Button,
  Tooltip,
  Box,
  useMediaQuery,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  LightMode,
  DarkMode,
  Brightness6,
} from '@mui/icons-material';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import { useTheme } from '@mui/material/styles';

interface ThemeToggleProps {
  variant?: 'icon' | 'button' | 'menu';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  variant = 'icon', 
  size = 'medium',
  showLabel = false 
}) => {
  const { themeMode, toggleTheme, setThemeMode } = useCustomTheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleThemeSelect = (mode: 'light' | 'dark') => {
    setThemeMode(mode);
    handleMenuClose();
  };

  const getThemeIcon = () => {
    return themeMode === 'dark' ? <DarkMode /> : <LightMode />;
  };

  const getThemeLabel = () => {
    return themeMode === 'dark' ? 'Dark Mode' : 'Light Mode';
  };

  if (variant === 'menu') {
    return (
      <Box>
        <Tooltip title="Change Theme">
          <IconButton
            onClick={handleMenuClick}
            size={size}
            color="inherit"
            aria-label="theme menu"
            aria-controls={open ? 'theme-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Brightness6 />
          </IconButton>
        </Tooltip>
        <Menu
          id="theme-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          MenuListProps={{
            'aria-labelledby': 'theme-button',
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              borderRadius: 2,
              mt: 1,
              minWidth: 140,
              boxShadow: theme.shadows[3],
            }
          }}
        >
          <MenuItem
            onClick={() => handleThemeSelect('light')}
            selected={themeMode === 'light'}
            sx={{
              py: 1.5,
              px: 2,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.light + '20',
                color: theme.palette.primary.main,
              }
            }}
          >
            <ListItemIcon>
              <LightMode fontSize="small" />
            </ListItemIcon>
            <ListItemText>Light Mode</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => handleThemeSelect('dark')}
            selected={themeMode === 'dark'}
            sx={{
              py: 1.5,
              px: 2,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.light + '20',
                color: theme.palette.primary.main,
              }
            }}
          >
            <ListItemIcon>
              <DarkMode fontSize="small" />
            </ListItemIcon>
            <ListItemText>Dark Mode</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    );
  }

  if (variant === 'button') {
    return (
      <Button
        onClick={toggleTheme}
        startIcon={getThemeIcon()}
        size={size}
        variant="outlined"
        color="inherit"
        sx={{
          textTransform: 'none',
          borderRadius: 2,
          minWidth: showLabel ? 120 : 'auto',
        }}
      >
        {showLabel && (isMobile ? (themeMode === 'dark' ? 'Dark' : 'Light') : getThemeLabel())}
      </Button>
    );
  }

  // Default: icon variant
  return (
    <Tooltip title={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}>
      <IconButton
        onClick={toggleTheme}
        size={size}
        color="inherit"
        aria-label="toggle theme"
        sx={{
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.1)',
          },
        }}
      >
        {getThemeIcon()}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;