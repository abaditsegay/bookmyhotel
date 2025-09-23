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
import {
  Search as SearchIcon,
  Hotel as HotelIcon,
} from '@mui/icons-material';

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
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: isMobile ? 2 : 4,
        px: isMobile ? 1 : 3,
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      {/* Enhanced Header Section */}
      <Card 
        elevation={2}
        sx={{ 
          mb: isMobile ? 3 : 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`,
          border: `1px solid ${theme.palette.primary.main}20`,
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: isMobile ? 2.5 : 4 }}>
          {/* Professional Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: isMobile ? 2 : 3,
            p: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, ${theme.palette.secondary.main}10 100%)`,
            borderRadius: 2,
          }}>
            <Box sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 2,
            }}>
              <HotelIcon sx={{ fontSize: 28, color: 'white' }} />
            </Box>
            <Box>
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                sx={{ 
                  fontWeight: 'bold',
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5,
                }}
              >
                Find Your Perfect Stay
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Search and book from thousands of hotels worldwide
              </Typography>
            </Box>
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
        elevation={2}
        sx={{ 
          mb: isMobile ? 3 : 4,
          background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(21, 101, 192, 0.05) 100%)',
          border: '1px solid rgba(33, 150, 243, 0.2)',
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: isMobile ? 2.5 : 4 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: isMobile ? 2 : 3,
            p: 2,
            background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(21, 101, 192, 0.1) 100%)',
            borderRadius: 2,
          }}>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 2,
            }}>
              <SearchIcon sx={{ fontSize: 24, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                Search Hotels
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter your travel details to find available hotels
              </Typography>
            </Box>
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
        elevation={2}
        sx={{ 
          background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(56, 142, 60, 0.05) 100%)',
          border: '1px solid rgba(76, 175, 80, 0.2)',
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: isMobile ? 2.5 : 4 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: isMobile ? 2 : 3,
            p: 2,
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(56, 142, 60, 0.1) 100%)',
            borderRadius: 2,
          }}>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: 'success.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 2,
            }}>
              <SearchIcon sx={{ fontSize: 24, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {t('hotelSearch.alreadyHaveBooking.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('hotelSearch.alreadyHaveBooking.subtitle')}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ textAlign: 'center', pt: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<SearchIcon />}
              onClick={() => navigate('/find-booking')}
              sx={{ 
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 'bold',
                px: isMobile ? 3 : 4,
                py: 1.5,
                fontSize: isMobile ? '1rem' : '1.1rem',
                backgroundColor: 'success.main',
                color: 'success.contrastText',
                width: isMobile ? '100%' : 'auto',
                maxWidth: isMobile ? '280px' : 'none',
                '&:hover': {
                  backgroundColor: 'success.dark',
                  transform: isMobile ? 'none' : 'scale(1.05)',
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
  );
};

export default HotelSearchPage;
