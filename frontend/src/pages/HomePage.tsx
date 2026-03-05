import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HotelSearchForm from '../components/hotel/HotelSearchForm';
import StandardCard from '../components/common/StandardCard';
import StandardButton from '../components/common/StandardButton';
import { StandardLoading, StandardError, ErrorBoundary } from '../components/common';
import { hotelApiService } from '../services/hotelApi';
import { HotelSearchRequest } from '../types/hotel';
import { COLORS, addAlpha } from '../theme/themeColors';

const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (searchRequest: HotelSearchRequest) => {
    setLoading(true);
    setError('');
    try {
      const results = await hotelApiService.searchHotelsPublic(searchRequest);
      navigate('/hotels/search-results', { state: { searchRequest, hotels: results } });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('hotelSearch.errors.searchFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
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
        {/* Page heading */}
        <Box sx={{ textAlign: 'center', mb: isMobile ? 2 : 3 }}>
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            component="h1"
            sx={{ fontWeight: 700, color: COLORS.PRIMARY, mb: 0.5 }}
          >
            {t('hotelSearch.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('hotelSearch.subtitle')}
          </Typography>
        </Box>

        {/* Search Form */}
        <StandardCard
          elevation={0}
          sx={{
            mb: isMobile ? 2 : 3,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: 'none',
          }}
        >
          <Box sx={{ p: isMobile ? 2 : 3 }}>
            <ErrorBoundary level="component">
              <HotelSearchForm onSearch={handleSearch} loading={loading} />
            </ErrorBoundary>

            {error && (
              <Box sx={{ mt: 2 }}>
                <StandardError
                  error={true}
                  message={error}
                  severity="error"
                  showRetry={false}
                />
              </Box>
            )}

            <StandardLoading
              loading={loading}
              message={t('hotelSearch.form.searching')}
              size="large"
              overlay={false}
            />
          </Box>
        </StandardCard>

        {/* Find My Booking */}
        <StandardCard
          cardVariant="gradient"
          sx={{ textAlign: 'center' }}
        >
          <Box sx={{ p: isMobile ? 2.5 : 4 }}>
            <Box
              sx={{
                textAlign: 'center',
                mb: isMobile ? 2 : 3,
                p: 2,
                backgroundColor: theme.palette.background.default,
                border: `1px solid ${addAlpha(COLORS.BORDER_LIGHT, 0.3)}`,
              }}
            >
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
                  background: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  '&:hover': {
                    background: (theme) =>
                      `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.dark} 100%)`,
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

export default HomePage;
