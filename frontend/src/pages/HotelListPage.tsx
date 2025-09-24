import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Snackbar,
  Grid,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import {
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
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          boxShadow: theme.shadows[2],
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: isMobile ? 3 : 4 }}>
          {/* Combined Header Section */}
          <Box sx={{ 
            p: 3,
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
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
                  bgcolor: theme.palette.mode === 'dark' ? 'success.dark' : 'success.light',
                  color: theme.palette.mode === 'dark' ? 'success.contrastText' : 'success.main',
                  px: 2,
                  py: 0.75,
                  borderRadius: 1,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: `1px solid ${theme.palette.success.main}`,
                }}
              >
                {hotels.length} hotel{hotels.length === 1 ? '' : 's'} found
              </Typography>
              
              <Button 
                onClick={() => console.log('Open sort options')}
                sx={{ 
                  py: 1,
                  px: 2.5,
                  bgcolor: theme.palette.background.paper,
                  color: 'text.primary',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  minWidth: 'auto',
                  '&:hover': {
                    bgcolor: theme.palette.action.hover,
                    borderColor: theme.palette.action.disabled,
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
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            boxShadow: theme.shadows[2],
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
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: theme.shadows[2],
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
                bgcolor: theme.palette.background.paper,
                color: 'text.primary',
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.shadows[2],
                '&:hover': {
                  bgcolor: theme.palette.action.hover,
                  borderColor: theme.palette.action.disabled,
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
