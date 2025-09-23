import React, { useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Container,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { StandardLoading, StandardError, ErrorBoundary } from '../components/common';

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
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
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
      {/* Enhanced Header Section */}
      <Card 
        sx={{ 
          mb: isMobile ? 3 : 4,
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        }}
      >
        <CardContent sx={{ p: isMobile ? 2.5 : 4 }}>
          {/* Professional Header */}
          <Box sx={{ 
            textAlign: 'center',
            mb: isMobile ? 2 : 3,
            p: 3,
            background: '#f8f9fa',
            borderRadius: 2,
            border: '1px solid #e9ecef',
          }}>
            <Typography 
              variant={isMobile ? "h4" : "h3"} 
              component="h1" 
              sx={{ 
                fontWeight: 'bold',
                color: 'text.primary',
                mb: 1,
              }}
            >
              Find Your Perfect Stay
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Search and book from thousands of hotels worldwide
            </Typography>
          </Box>
        </CardContent>
      </Card>
        {/* Left Advertisement Pane - Responsive: side pane on desktop, bottom section on mobile */}
        {/* 
        {!isOperationsUser && (
          <Box sx={{ gridArea: 'leftAd' }}>
            <Card 
              elevation={1}
              sx={{ 
                height: {
                  xs: '400px', // Mobile: increased height for better hotel visibility
                  md: '100%' // Desktop: full height
                },
                border: '1px solid rgba(224, 224, 224, 0.2)', // Much more subtle border
                borderRadius: 3,
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
                  background: '#f8f9fa',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '4px',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #556bea 0%, #653ba2 100%)',
                  }
                }
              }}>
                <VerticalHotelAdvertisementBanner maxHotels={6} />
              </Box>
            </Card>
          </Box>
        )}
        */}

      {/* Main Search Form Section */}
      <Card 
        elevation={8}
        sx={{ 
          mb: isMobile ? 3 : 4,
          background: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        }}
      >
        <CardContent sx={{ p: isMobile ? 2.5 : 4 }}>
          <Box sx={{ 
            textAlign: 'center',
            mb: isMobile ? 2 : 3,
            p: 3,
            background: '#f8f9fa',
            borderRadius: 2,
            border: '1px solid #e9ecef',
          }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
              Search Hotels
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter your travel details to find available hotels
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
            message="Searching for hotels..."
            size="large"
            overlay={false}
          />
        </CardContent>
      </Card>

      {/* Find My Booking Section */}
      <Card 
        sx={{ 
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        }}
      >
        <CardContent sx={{ p: isMobile ? 2.5 : 4 }}>
          <Box sx={{ 
            textAlign: 'center',
            mb: isMobile ? 2 : 3,
            p: 3,
            backgroundColor: '#f8f9fa',
            borderRadius: 2,
            border: '1px solid #e0e0e0',
          }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
              {t('hotelSearch.alreadyHaveBooking.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('hotelSearch.alreadyHaveBooking.subtitle')}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', pt: 2 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/find-booking')}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: isMobile ? 3 : 4,
                py: 1.5,
                fontSize: isMobile ? '1rem' : '1.1rem',
                width: isMobile ? '100%' : 'auto',
                maxWidth: isMobile ? '280px' : 'none',
                borderColor: '#e0e0e0',
                color: 'text.primary',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {t('hotelSearch.alreadyHaveBooking.button')}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
    </Box>
  );
};

export default HotelSearchPage;
