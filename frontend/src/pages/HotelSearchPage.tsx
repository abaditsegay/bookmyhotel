import React, { useMemo } from 'react';
import { getGradient } from '../theme/themeColors';
import {
  Typography,
  Box,
  Container,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { StandardLoading, StandardError, ErrorBoundary } from '../components/common';
import StandardCard from '../components/common/StandardCard';
import StandardButton from '../components/common/StandardButton';

import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// import VerticalHotelAdvertisementBanner from '../components/VerticalHotelAdvertisementBanner';
import HotelSearchForm from '../components/hotel/HotelSearchForm';
import { hotelApiService } from '../services/hotelApi';
import { 
  HotelSearchRequest,
} from '../types/hotel';

const HotelSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const initialSearchRequest = useMemo(
    () => ((location.state as { searchRequest?: HotelSearchRequest } | null)?.searchRequest ?? null),
    [location.state]
  );

  const searchMutation = useMutation({
    mutationFn: (searchRequest: HotelSearchRequest) => hotelApiService.searchHotelsPublic(searchRequest),
    onSuccess: (results, searchRequest) => {
      navigate('/hotels/search-results', {
        state: {
          searchRequest,
          hotels: results
        }
      });
    },
  });

  const handleSearch = (searchRequest: HotelSearchRequest) => {
    searchMutation.reset();
    searchMutation.mutate(searchRequest);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark' 
          ? getGradient('dark')
          : getGradient('white'),
        pb: 4,
      }}
    >
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: isMobile ? 2 : 4,
        px: isMobile ? 1 : 3,
      }}
    >
      {/* Main Search Form Section */}
      <StandardCard 
        elevation={0}
        sx={{ 
          mb: isMobile ? 3 : 4,
          backgroundColor: theme.palette.background.paper,
          boxShadow: 'none',
        }}
      >
        <Box sx={{ p: isMobile ? 2.5 : 4 }}>
          <Box sx={{ 
            textAlign: 'center',
            mb: isMobile ? 2 : 3,
            p: 2,
            backgroundColor: theme.palette.background.default,
          }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
              {t('hotelSearch.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('hotelSearch.subtitle')}
            </Typography>
          </Box>

          <ErrorBoundary level="component">
            <HotelSearchForm
              onSearch={handleSearch}
              loading={searchMutation.isPending}
              initialValues={initialSearchRequest}
            />
          </ErrorBoundary>

          {searchMutation.isError && (
            <Box sx={{ mt: 2 }}>
              <StandardError
                error
                errorValue={searchMutation.error}
                fallbackMessage={t('hotelSearch.errors.searchFailed')}
                showRetry={Boolean(searchMutation.variables)}
                onRetry={searchMutation.variables ? () => searchMutation.mutate(searchMutation.variables) : undefined}
              />
            </Box>
          )}

          <StandardLoading
            loading={searchMutation.isPending}
            message={t('hotelSearch.form.searching')}
            size="large"
            overlay={false}
          />
        </Box>
      </StandardCard>

      {/* Find My Booking Section */}
      <StandardCard 
        cardVariant="gradient"
        sx={{ 
          textAlign: 'center',
        }}
      >
        <Box sx={{ p: isMobile ? 2.5 : 4 }}>
          <Box sx={{ 
            textAlign: 'center',
            mb: isMobile ? 2 : 3,
            p: 2,
            backgroundColor: theme.palette.background.default,
          }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
              {t('hotelSearch.alreadyHaveBooking.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('hotelSearch.alreadyHaveBooking.subtitle')}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', pt: 2 }}>
                        <StandardButton
              variant="contained"
              buttonSize="large"
              gradient
              fullWidth={isMobile}
              onClick={() => navigate('/find-booking')}
              sx={{
                mt: 2,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                '&:hover': {
                  background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.dark} 100%)`,
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {t('hotelSearch.alreadyHaveBooking.button')}
            </StandardButton>
          </Box>
        </Box>
      </StandardCard>
    </Container>
    </Box>
  );
};

export default HotelSearchPage;
