import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import HotelIcon from '@mui/icons-material/Hotel';
import LogoutIcon from '@mui/icons-material/Logout';
import { PageContainer, SurfaceCard } from '../components/common';
import { useAuth } from '../contexts/AuthContext';

const AccountStatusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason');
  const { logout } = useAuth();

  const isHotelInactive = reason === 'hotel-inactive';

  const title = isHotelInactive
    ? 'Hotel Account Inactive'
    : 'Account Suspended';

  const message = isHotelInactive
    ? 'The hotel you are associated with is not active, please reach out to the system administrator.'
    : 'Your account has been suspended, please reach out to your hotel admin.';

  const icon = isHotelInactive ? (
    <HotelIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
  ) : (
    <BlockIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
  );

  return (
    <PageContainer maxWidth="sm" sx={{ justifyContent: 'center', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
      <SurfaceCard
        elevation={0}
        contentSx={{
          p: { xs: 4, md: 6 },
          textAlign: 'center',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {icon}
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
            {message}
          </Typography>
          <Button
            variant="contained"
            startIcon={<LogoutIcon />}
            onClick={logout}
            size="large"
            sx={{ bgcolor: 'primary.main', color: 'common.white', '&:hover': { bgcolor: 'primary.dark' } }}
          >
            Sign Out
          </Button>
        </Box>
      </SurfaceCard>
    </PageContainer>
  );
};

export default AccountStatusPage;
