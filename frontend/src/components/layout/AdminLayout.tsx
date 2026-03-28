import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
  IconButton,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard,
  Hotel,
  People,
  BarChart as BarChartIcon,
  Settings,
  FactCheck,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../theme/themeColors';

const SIDEBAR_WIDTH = 260;

interface NavItem {
  label: string;
  icon: React.ReactElement;
  path: string;
}

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navItems: NavItem[] = [
    {
      label: t('dashboard.system.title', 'Dashboard'),
      icon: <Dashboard />,
      path: '/system-dashboard',
    },
    {
      label: t('admin.hotel.title', 'Hotel Management'),
      icon: <Hotel />,
      path: '/system/hotels',
    },
    {
      label: t('admin.user.title', 'User Management'),
      icon: <People />,
      path: '/system/users',
    },
    {
      label: 'UAT Testing',
      icon: <FactCheck />,
      path: '/system/uat',
    },
    {
      label: t('dashboard.system.analytics', 'Analytics'),
      icon: <BarChartIcon />,
      path: '/system/analytics',
    },
    {
      label: t('common.settings', 'Settings'),
      icon: <Settings />,
      path: '/system/settings',
    },
  ];

  const isActive = (path: string) => {
    if (path === '/system-dashboard') {
      return location.pathname === '/system-dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const sidebarContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: COLORS.PRIMARY,
        color: '#fff',
      }}
    >
      {/* Sidebar Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2.5,
          py: 2,
          borderBottom: `1px solid rgba(255,255,255,0.12)`,
        }}
      >
        <AdminPanelSettings sx={{ fontSize: 28 }} />
        <Typography variant="subtitle1" fontWeight="bold" noWrap>
          System Admin
        </Typography>
        {isMobile && (
          <IconButton
            onClick={() => setMobileOpen(false)}
            sx={{ ml: 'auto', color: '#fff' }}
            size="small"
          >
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

      {/* Navigation Items */}
      <List sx={{ flex: 1, pt: 1 }}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem key={item.path} disablePadding sx={{ px: 1, mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavClick(item.path)}
                sx={{
                  borderRadius: 1.5,
                  py: 1.2,
                  px: 2,
                  color: active ? '#fff' : 'rgba(255,255,255,0.7)',
                  bgcolor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  '&:hover': {
                    bgcolor: active
                      ? 'rgba(255,255,255,0.2)'
                      : 'rgba(255,255,255,0.08)',
                    color: '#fff',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: 'inherit',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: active ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      {/* Mobile hamburger button — positioned inside the content area */}
      {isMobile && (
        <IconButton
          onClick={() => setMobileOpen(true)}
          sx={{
            position: 'fixed',
            top: 72,
            left: 8,
            zIndex: theme.zIndex.appBar - 1,
            bgcolor: COLORS.PRIMARY,
            color: '#fff',
            boxShadow: 2,
            '&:hover': { bgcolor: COLORS.PRIMARY_HOVER },
          }}
          size="small"
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Desktop permanent sidebar */}
      {!isMobile && (
        <Box
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              width: SIDEBAR_WIDTH,
              position: 'fixed',
              top: 64, // below navbar
              bottom: 0,
              left: 0,
              zIndex: theme.zIndex.appBar - 1,
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            {sidebarContent}
          </Box>
        </Box>
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: SIDEBAR_WIDTH,
              top: 64,
              height: 'calc(100% - 64px)',
              boxSizing: 'border-box',
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      )}

      {/* Main content area */}
      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: '100%',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;
