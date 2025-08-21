import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  useTheme, 
  useMediaQuery,
  IconButton,
  Drawer,
  Fab
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Close as CloseIcon,
  CalendarToday as CalendarIcon 
} from '@mui/icons-material';
import Navbar from './Navbar';
import { SystemWideNavbar } from './SystemWideNavbar';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import CalendarWidget from '../common/CalendarWidget';
import TodosWidget from '../common/TodosWidget';

interface EnhancedLayoutProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  disableGutters?: boolean;
  hideSidebar?: boolean; // Allow pages to hide sidebar if needed
}

const EnhancedLayout: React.FC<EnhancedLayoutProps> = ({ 
  children, 
  maxWidth = 'xl', // Changed to xl to accommodate sidebar
  disableGutters = false,
  hideSidebar = false
}) => {
  const theme = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { isSystemWideContext } = useTenant();
  
  // Responsive breakpoints
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg')); // ≥1200px
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg')); // 768px-1199px
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // <768px
  
  // Sidebar state for mobile/tablet
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Show sidebar only for authenticated users and when not hidden
  const showSidebar = isAuthenticated && !hideSidebar;
  
  // Determine which navbar to render
  const renderNavbar = () => {
    if (user && isSystemWideContext) {
      return <SystemWideNavbar />;
    }
    return <Navbar />;
  };

  // Sidebar content
  const sidebarContent = (
    <Box
      sx={{
        width: isDesktop ? 350 : 300,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderLeft: isDesktop ? `1px solid ${theme.palette.divider}` : 'none',
      }}
    >
      {/* Mobile/Tablet close button */}
      {!isDesktop && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={() => setSidebarOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
      )}
      
      {/* Calendar Widget */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <CalendarWidget />
      </Box>
      
      {/* TODOs Widget */}
      <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
        <TodosWidget />
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Navigation */}
      {renderNavbar()}
      
      {/* Main Layout Container */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          minHeight: 0, // Important for flex children
        }}
      >
        {/* Main Content Area */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0, // Prevent flex item from overflowing
            // Adjust width based on sidebar presence
            ...(showSidebar && isDesktop && {
              marginRight: '350px', // Make room for fixed sidebar
            }),
          }}
        >
          <Container
            maxWidth={maxWidth}
            disableGutters={disableGutters}
            sx={{
              flexGrow: 1,
              py: { xs: 2, md: 3 },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {children}
          </Container>
        </Box>
        
        {/* Desktop Sidebar - Fixed position */}
        {showSidebar && isDesktop && (
          <Box
            sx={{
              position: 'fixed',
              top: 64, // Account for navbar height
              right: 0,
              bottom: 0,
              width: 350,
              zIndex: theme.zIndex.drawer - 1,
            }}
          >
            {sidebarContent}
          </Box>
        )}
        
        {/* Tablet/Mobile Sidebar - Drawer */}
        {showSidebar && !isDesktop && (
          <Drawer
            anchor="right"
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            ModalProps={{
              keepMounted: true, // Better mobile performance
            }}
            sx={{
              '& .MuiDrawer-paper': {
                width: isTablet ? 300 : '90vw',
                maxWidth: 350,
              },
            }}
          >
            {sidebarContent}
          </Drawer>
        )}
      </Box>
      
      {/* Mobile FAB for sidebar toggle */}
      {showSidebar && isMobile && (
        <Fab
          color="primary"
          onClick={() => setSidebarOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: theme.zIndex.speedDial,
          }}
        >
          <CalendarIcon />
        </Fab>
      )}
      
      {/* Tablet sidebar toggle button in navbar area */}
      {showSidebar && isTablet && (
        <IconButton
          onClick={() => setSidebarOpen(true)}
          sx={{
            position: 'fixed',
            top: 8,
            right: 8,
            zIndex: theme.zIndex.appBar + 1,
            bgcolor: 'background.paper',
            boxShadow: 1,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}
      
      {/* Footer */}
      <Box
        component="footer"
        sx={{
          mt: 'auto',
          py: 2,
          px: 2,
          backgroundColor: theme.palette.grey[100],
          borderTop: `1px solid ${theme.palette.divider}`,
          textAlign: 'center',
          color: theme.palette.text.secondary,
          fontSize: '0.875rem',
          // Adjust margin for desktop sidebar
          ...(showSidebar && isDesktop && {
            marginRight: '350px',
          }),
        }}
      >
        © 2025 BookMyHotel. All rights reserved.
      </Box>
    </Box>
  );
};

export default EnhancedLayout;
