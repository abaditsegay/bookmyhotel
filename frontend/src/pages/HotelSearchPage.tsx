import React, { useState } from 'react';
import {
  Typography,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Button,
  Divider,
  Card,
} from '@mui/material';
import {
  Search as SearchIcon,
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
    <Box sx={{ 
      backgroundColor: '#f8fafc',
      minHeight: 'calc(100vh - 64px)', // Account for navbar
      py: { xs: 2, sm: 3, md: 4 }, // Progressive padding for different screen sizes
      px: { xs: 1, sm: 2, md: 3 }, // Ensure proper side margins on all devices
    }}>
      {/* Mobile-first responsive container */}
      <Box
        sx={{
          maxWidth: '1400px', // Maximum width for very large screens
          mx: 'auto', // Center the container
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 2, md: 3 },
        }}
      >
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

        {/* Main Search Content - Mobile-friendly single column layout */}
        <Box sx={{ width: '100%' }}>
          <Card 
            elevation={1}
            sx={{ 
              border: '1px solid rgba(224, 224, 224, 0.2)',
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)',
              width: '100%', // Ensure full width usage
              overflow: 'hidden', // Prevent content overflow
            }}
          >
            {/* Header Section - Mobile optimized */}
            <Box sx={{ 
              p: { xs: 3, sm: 4, md: 4 }, // Responsive padding
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              color: 'white',
              textAlign: 'center' 
            }}>
              <Typography 
                variant="h4" 
                component="h2" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } // Responsive font size
                }}
              >
                {t('hotelSearch.title')}
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  opacity: 0.9,
                  fontSize: { xs: '0.9rem', sm: '1rem' } // Responsive subtitle
                }}
              >
                {t('hotelSearch.subtitle')}
              </Typography>
            </Box>

            {/* Search Form Section - Mobile optimized */}
            <Box sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, // Progressive padding for better mobile experience
              width: '100%',
              boxSizing: 'border-box', // Ensure padding is included in width calculations
            }}>
              <Box sx={{ mb: 4 }}>
                <HotelSearchForm onSearch={handleSearch} loading={loading} />
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              {loading && (
                <Box display="flex" justifyContent="center" sx={{ my: 4 }}>
                  <CircularProgress size={60} thickness={4} />
                </Box>
              )}

              {/* Find My Booking Section - Mobile optimized */}
              <Divider sx={{ my: { xs: 3, md: 4 } }} />
              
              <Paper 
                elevation={2} 
                sx={{ 
                  p: { xs: 3, sm: 4 }, // Responsive padding
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                  color: 'white',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  width: '100%',
                  boxSizing: 'border-box',
                  '&:hover': {
                    transform: { xs: 'none', md: 'translateY(-2px)' }, // Disable transform on mobile
                    boxShadow: 6,
                  }
                }}
              >
                <Typography 
                  variant="h5" 
                  component="h3" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.5rem' } // Responsive heading
                  }}
                >
                  {t('hotelSearch.alreadyHaveBooking.title')}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 3, 
                    opacity: 0.9, 
                    fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' }, // Responsive text
                    px: { xs: 1, sm: 2 } // Add padding on mobile for better readability
                  }}
                >
                  {t('hotelSearch.alreadyHaveBooking.subtitle')}
                </Typography>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<SearchIcon />}
                  onClick={() => navigate('/find-booking')}
                  sx={{ 
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    px: { xs: 3, sm: 4 }, // Responsive button padding
                    py: 1.5,
                    fontSize: { xs: '1rem', sm: '1.1rem' }, // Responsive font size
                    borderColor: 'rgba(255, 255, 255, 0.7)',
                    color: 'white',
                    width: { xs: '100%', sm: 'auto' }, // Full width on mobile
                    maxWidth: { xs: '280px', sm: 'none' }, // Limit max width on mobile
                    '&:hover': { 
                      borderColor: 'white', 
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      transform: { xs: 'none', md: 'scale(1.05)' }, // Disable scale on mobile
                    }
                  }}
                >
                  {t('hotelSearch.alreadyHaveBooking.button')}
                </Button>
              </Paper>
            </Box>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default HotelSearchPage;
