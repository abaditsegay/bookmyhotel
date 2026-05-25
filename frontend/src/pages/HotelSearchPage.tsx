import React, { useMemo } from 'react';
import {
  Typography,
  Box,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { StandardLoading, StandardError, ErrorBoundary, PageContainer } from '../components/common';
import StandardCard from '../components/common/StandardCard';
import StandardButton from '../components/common/StandardButton';

import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// import VerticalHotelAdvertisementBanner from '../components/VerticalHotelAdvertisementBanner';
import HotelSearchForm from '../components/hotel/HotelSearchForm';
import { hotelApiService } from '../services/hotelApi';
import { getPageShellBackground } from '../theme/surfaces';
import { 
  HotelSearchRequest,
} from '../types/hotel';
import { designSystem } from '../theme/designSystem';

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
        backgroundColor: getPageShellBackground(theme),
      }}
    >
    <PageContainer 
      maxWidth="lg" 
      sx={{ 
        py: isMobile ? 3 : 4,
      }}
    >
      <Stack spacing={designSystem.layout.sectionGap.md}>
      <Stack spacing={1} sx={{ maxWidth: 720 }}>
        <Typography variant="h3" component="h1">
          {t('hotelSearch.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('hotelSearch.subtitle')}
        </Typography>
      </Stack>

      {/* Main Search Form Section */}
      <Box>
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

      {/* Find My Booking Section */}
      <StandardCard cardVariant="default" sx={{ textAlign: 'center' }}>
        <Box sx={{ p: isMobile ? 2.5 : 4 }}>
          <Box sx={{ textAlign: 'center' }}>
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
              fullWidth={isMobile}
              onClick={() => navigate('/find-booking')}
              sx={{
                mt: 2,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
              }}
            >
              {t('hotelSearch.alreadyHaveBooking.button')}
            </StandardButton>
          </Box>
        </Box>
      </StandardCard>
      </Stack>
    </PageContainer>
    </Box>
  );
};

export default HotelSearchPage;
