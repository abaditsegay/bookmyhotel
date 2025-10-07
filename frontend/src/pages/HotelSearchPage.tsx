import React, { useState } from 'react';
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
      console.log('🔍 Performing public hotel search:', searchRequest);
      const results = await hotelApiService.searchHotelsPublic(searchRequest);
      
      console.log('✅ Hotel search results:', results);
      
      // Navigate to hotel list page with the data
      navigate('/hotels/search-results', {
        state: {
          searchRequest,
          hotels: results
        }
      });
    } catch (err) {
      console.error('❌ Hotel search failed:', err);
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
          ? 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #ffffff 100%)',
        py: 4,
      }}
    >
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: isMobile ? 2 : 4,
        px: isMobile ? 1 : 3,
      }}
    >
        {/* Left Advertisement Pane - Responsive: side pane on desktop, bottom section on mobile */}
        {/* 
        {!isOperationsUser && (
          <Box sx={{ gridArea: 'leftAd' }}>
            <StandardCard 
              elevation={1}
              sx={{ 
                height: {
                  xs: '400px', // Mobile: increased height for better hotel visibility
                  md: '100%' // Desktop: full height
                },
                border: '1px solid rgba(224, 224, 224, 0.2)', // Much more subtle border
                borderRadius: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 3, // Reduced shadow
                  transform: 'translateY(-1px)', // Reduced transform
                }
              }}
            >
              <Box sx={{ 
                p: 3, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderBottom: '1px solid #e0e0e0' 
              }}>
                <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 0, fontWeight: 'bold' }}>
                  🎉 Special Deals
                </Typography>
              </Box>
              <Box sx={{ 
                flex: 1, 
                overflowY: 'auto',
                overflowX: 'hidden',
                // Enhanced scrollbar styling for modern look
                '&::-webkit-scrollbar': {
                  width: {
                    xs: '8px', // Wider scrollbar on mobile for easier touch interaction
                    md: '6px'
                  }
                },
                '&::-webkit-scrollbar-track': {
                  background: '#ffffff',
                  borderRadius: '0px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '0px',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #556bea 0%, #653ba2 100%)',
                  }
                }
              }}>
                <VerticalHotelAdvertisementBanner maxHotels={6} />
              </Box>
            </StandardCard>
          </Box>
        )}
        */}

      {/* Main Search Form Section */}
      <StandardCard 
        elevation={0}
        sx={{ 
          mb: isMobile ? 3 : 4,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 0,
          boxShadow: 'none',
        }}
      >
        <Box sx={{ p: isMobile ? 2.5 : 4 }}>
          <Box sx={{ 
            textAlign: 'center',
            mb: isMobile ? 2 : 3,
            p: 2,
            backgroundColor: theme.palette.background.default,
            borderRadius: 0,
            border: `1px solid rgba(224, 224, 224, 0.3)`,
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
            borderRadius: 0,
            border: `1px solid rgba(224, 224, 224, 0.3)`,
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
                borderRadius: 0,
                background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
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
