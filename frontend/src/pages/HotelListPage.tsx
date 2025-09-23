import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Snackbar,
  Breadcrumbs,
  Link,
  Grid,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { hotelApiService } from '../services/hotelApi';
import HotelListCard from '../components/hotel/HotelListCard';
import { 
  HotelSearchRequest, 
  HotelSearchResult,
} from '../types/hotel';

const HotelListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State from search parameters
  const [searchRequest, setSearchRequest] = useState<HotelSearchRequest | null>(null);
  const [hotels, setHotels] = useState<HotelSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Success/error feedback
  const [successMessage, setSuccessMessage] = useState('');

  // Function to perform a new search when we have searchRequest but no hotels
  const performSearch = useCallback(async (searchReq: HotelSearchRequest) => {
    try {
      setLoading(true);
      setError('');
      console.log('🔍 Performing hotel search:', searchReq);
      const results = await hotelApiService.searchHotelsPublic(searchReq);
      console.log('✅ Hotel search results:', results);
      setHotels(results);
    } catch (err) {
      console.error('❌ Hotel search failed:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while searching for hotels');
      // If search fails, redirect back to search page
      navigate('/hotels/search');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Extract search parameters from location state or URL
  useEffect(() => {
    const state = location.state as { 
      searchRequest?: HotelSearchRequest; 
      hotels?: HotelSearchResult[];
      successMessage?: string;
    };
    
    if (state?.searchRequest && state?.hotels && state.hotels.length > 0) {
      // If we have data passed from the search page
      setSearchRequest(state.searchRequest);
      setHotels(state.hotels);
      setLoading(false);
    } else if (state?.searchRequest) {
      // If we have searchRequest but no hotels, perform a new search
      setSearchRequest(state.searchRequest);
      performSearch(state.searchRequest);
    } else {
      // If no data, redirect back to search
      navigate('/hotels/search');
    }

    // Handle success message from booking
    if (state?.successMessage) {
      setSuccessMessage(state.successMessage);
    }
  }, [location, navigate, performSearch]);

  const handleViewHotel = (hotelId: number) => {
    navigate(`/hotels/${hotelId}`, {
      state: {
        searchRequest: searchRequest
      }
    });
  };

  const handleCloseSuccess = () => {
    setSuccessMessage('');
  };

  const handleBackToSearch = () => {
    navigate('/hotels/search', { 
      state: { 
        searchRequest: searchRequest 
      } 
    });
  };

  const formatSearchSummary = () => {
    if (!searchRequest) return '';
    
    const parts = [];
    if (searchRequest.location) {
      parts.push(`in ${searchRequest.location}`);
    }
    parts.push(`from ${searchRequest.checkInDate} to ${searchRequest.checkOutDate}`);
    parts.push(`for ${searchRequest.guests} guest${searchRequest.guests > 1 ? 's' : ''}`);
    
    return parts.join(' ');
  };

  if (loading) {
    return (
      <Container 
        maxWidth="xl" 
        sx={{ 
          py: { xs: 2, md: 4 },
          px: { xs: 1, md: 3 },
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: { xs: '50vh', md: '60vh' },
          textAlign: 'center',
        }}>
          <CircularProgress 
            size={48}
            sx={{ 
              mb: 2,
              width: { xs: '40px !important', md: '48px !important' },
              height: { xs: '40px !important', md: '48px !important' },
            }}
          />
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
          >
            Searching for hotels...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: isMobile ? 2 : 4,
        px: isMobile ? 1 : 3,
      }}
    >
      {/* Combined Header and Actions Section */}
      <Card 
        sx={{ 
          mb: isMobile ? 3 : 4,
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: isMobile ? 3 : 4 }}>
          {/* Back Navigation */}
          <Box sx={{ mb: isMobile ? 3 : 4 }}>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              mb: isMobile ? 2 : 2.5,
            }}>
              <Button
                onClick={handleBackToSearch}
                sx={{ 
                  mr: 2,
                  minWidth: 'auto',
                  px: 2,
                  py: 1,
                  bgcolor: 'white',
                  border: '1px solid #e0e0e0',
                  color: 'text.primary',
                  borderRadius: 2,
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                    borderColor: '#d0d0d0',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
                startIcon={<ArrowBackIcon />}
              >
                Back
              </Button>
              
              {!isMobile && (
                <Breadcrumbs 
                  aria-label="breadcrumb"
                  sx={{
                    '& .MuiBreadcrumbs-separator': {
                      color: 'text.secondary',
                    },
                  }}
                >
                  <Link 
                    component="button" 
                    variant="body2" 
                    onClick={handleBackToSearch}
                    sx={{ 
                      textDecoration: 'none',
                      color: 'text.secondary',
                      fontWeight: 500,
                      '&:hover': {
                        color: 'text.primary',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Hotel Search
                  </Link>
                  <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
                    Search Results
                  </Typography>
                </Breadcrumbs>
              )}
            </Box>
          </Box>

          {/* Combined Header Section */}
          <Box sx={{ 
            p: 3,
            bgcolor: 'white',
            borderRadius: 2,
            border: '1px solid #e0e0e0',
          }}>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              sx={{ 
                fontWeight: 700,
                color: 'text.primary',
                mb: 1,
              }}
            >
              Search Results
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
              Hotels {formatSearchSummary()}
            </Typography>
            
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 2,
              mb: 2,
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  display: 'inline-block',
                  bgcolor: '#e8f5e8',
                  color: '#2e7d32',
                  px: 2,
                  py: 0.75,
                  borderRadius: 1,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: '1px solid #c8e6c9',
                }}
              >
                {hotels.length} hotel{hotels.length === 1 ? '' : 's'} found
              </Typography>
              
              <Button 
                onClick={() => console.log('Open sort options')}
                sx={{ 
                  py: 1,
                  px: 2.5,
                  bgcolor: 'white',
                  color: 'text.primary',
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  minWidth: 'auto',
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                    borderColor: '#d0d0d0',
                  },
                }}
              >
                Sort By Price
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Results Section */}
      {hotels.length > 0 ? (
        <Box>
          <Grid 
            container 
            spacing={isMobile ? 2 : 3}
          >
            {hotels.map((hotel) => (
              <Grid item xs={12} key={hotel.id}>
                <HotelListCard
                  hotel={hotel}
                  onViewHotel={handleViewHotel}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <Card 
          sx={{ 
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          }}
        >
          <CardContent sx={{ p: isMobile ? 4 : 6, textAlign: 'center' }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              mb: 3,
            }}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: 2,
                bgcolor: 'white',
                border: '1px solid #e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              }}>
                <SearchIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
              </Box>
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                sx={{ 
                  fontWeight: 700,
                  color: 'text.primary',
                }}
              >
                No Hotels Found
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 2, fontWeight: 500 }}>
              We couldn't find any hotels matching your search criteria.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
              Try adjusting your search dates, location, or filters to find more options.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleBackToSearch}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                bgcolor: 'white',
                color: 'text.primary',
                border: '1px solid #e0e0e0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                '&:hover': {
                  bgcolor: '#f5f5f5',
                  borderColor: '#d0d0d0',
                },
              }}
            >
              Modify Search
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default HotelListPage;
