import React from 'react';
import { Box, Container, useTheme } from '@mui/material';
import Navbar from './Navbar';

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
      <Navbar />
      
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
