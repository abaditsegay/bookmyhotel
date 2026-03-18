import React, { useState } from 'react';
import { COLORS, addAlpha, getGradient } from '../theme/themeColors';
import {
  Typography,
  Box,
  Container,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { StandardLoading, StandardError, ErrorBoundary } from '../components/common';
import StandardCard from '../components/common/StandardCard';
import StandardButton from '../components/common/StandardButton';

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// import VerticalHotelAdvertisementBanner from '../components/VerticalHotelAdvertisementBanner';
import HotelSearchForm from '../components/hotel/HotelSearchForm';
import { hotelApiService } from '../services/hotelApi';
import { 
  HotelSearchRequest,
} from '../types/hotel';

const HotelSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleSearch = async (searchRequest: HotelSearchRequest) => {
    setLoading(true);
    setError('');
    
    try {
      // Use public API call for hotel search (no authentication/tenant headers)
      const results = await hotelApiService.searchHotelsPublic(searchRequest);
      
      
      // Navigate to hotel list page with the data
      navigate('/hotels/search-results', {
        state: {
          searchRequest,
          hotels: results
        }
      });
    } catch (err) {
      // console.error('❌ Hotel search failed:', err);
      setError(err instanceof Error ? err.message : t('hotelSearch.errors.searchFailed'));
    } finally {
      setLoading(false);
    }
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
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none',
        }}
      >
        <Box sx={{ p: isMobile ? 2.5 : 4 }}>
          <Box sx={{ 
            textAlign: 'center',
            mb: isMobile ? 2 : 3,
            p: 2,
            backgroundColor: theme.palette.background.default,
            border: `1px solid ${addAlpha(COLORS.BORDER_LIGHT, 0.3)}`,
          }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
              {t('hotelSearch.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('hotelSearch.subtitle')}
            </Typography>
          </Box>

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
            border: `1px solid ${addAlpha(COLORS.BORDER_LIGHT, 0.3)}`,
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
