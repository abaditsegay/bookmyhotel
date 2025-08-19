import React from 'react';
import { Box, Container, useTheme } from '@mui/material';
import Navbar from './Navbar';
import { SystemWideNavbar } from './SystemWideNavbar';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';

interface LayoutProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  disableGutters?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  maxWidth = 'lg', 
  disableGutters = false 
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { isSystemWideContext } = useTenant();

  // Determine which navbar to render
  const renderNavbar = () => {
    // If user is authenticated and is system-wide, show system navbar
    if (user && isSystemWideContext) {
      return <SystemWideNavbar />;
    }
    // Otherwise show regular tenant-bound navbar
    return <Navbar />;
  };

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
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
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
      
      {/* Footer Spacer */}
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
        }}
      >
        © 2024 BookMyHotel. All rights reserved.
      </Box>
    </Box>
  );
};

export default Layout;
