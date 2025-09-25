import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Snackbar,


  useMediaQuery,
  useTheme,
  Stack,
  Button,
  Card,
  CardContent,
} from '@mui/material';

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hotelApiService } from '../services/hotelApi';
import HotelDetailsCard from '../components/hotel/HotelDetailsCard';
import { 
  HotelSearchRequest, 
  HotelSearchResult,
} from '../types/hotel';
import { COLORS } from '../theme/themeColors';

const SearchResultsPage: React.FC = () => {
  // Updated to neutral design matching LoginPage
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
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
      console.log('🔍 Re-performing hotel search:', searchReq);
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

  const handleBookRoom = async (hotelId: number, roomId: number, asGuest: boolean = false) => {
    // Get room details for booking
    const hotel = hotels.find((h: HotelSearchResult) => h.id === hotelId);
    if (!hotel) return;
    
    const room = hotel.availableRooms.find((r: any) => r.id === roomId);
    if (!room) return;

    if (asGuest) {
      // For explicit guest bookings, navigate directly to booking page
      navigate('/booking', {
        state: {
          room,
          hotelName: hotel.name,
          hotelId: hotelId,
          searchRequest: searchRequest,
          asGuest: true
        }
      });
    } else if (!isAuthenticated) {
      // For "Sign in to Book" when user is not authenticated, redirect to login page
      navigate('/login', {
        state: {
          redirectTo: '/booking',
          bookingData: {
            room,
            hotelName: hotel.name,
            hotelId: hotelId,
            searchRequest: searchRequest,
            asGuest: false
          }
        }
      });
    } else {
      // For authenticated users who want to book with their account
      navigate('/booking', {
        state: {
          room,
          hotelName: hotel.name,
          hotelId: hotelId,
          searchRequest: searchRequest,
          asGuest: false // Authenticated user booking
        }
      });
    }
  };

  const handleBookRoomType = async (hotelId: number, roomType: string, asGuest: boolean = false) => {
    // Get hotel details for booking
    const hotel = hotels.find((h: HotelSearchResult) => h.id === hotelId);
    if (!hotel) return;
    
    const roomTypeInfo = hotel.roomTypeAvailability?.find((rt: any) => rt.roomType === roomType);
    if (!roomTypeInfo) return;

    if (asGuest) {
      // For explicit guest bookings, navigate directly to booking page
      navigate('/booking', {
        state: {
          roomType: roomTypeInfo,
          hotelName: hotel.name,
          hotelId: hotelId,
          searchRequest: searchRequest,
          asGuest: true
        }
      });
    } else if (!isAuthenticated) {
      // For "Sign in to Book" when user is not authenticated, redirect to login page
      navigate('/login', {
        state: {
          redirectTo: '/booking',
          bookingData: {
            roomType: roomTypeInfo,
            hotelName: hotel.name,
            hotelId: hotelId,
            searchRequest: searchRequest,
            asGuest: false
          }
        }
      });
    } else {
      // For authenticated users who want to book with their account
      navigate('/booking', {
        state: {
          roomType: roomTypeInfo,
          hotelName: hotel.name,
          hotelId: hotelId,
          searchRequest: searchRequest,
          asGuest: false // Authenticated user booking
        }
      });
    }
  };

  const handleCloseSuccess = () => {
    setSuccessMessage('');
  };

  const handleBackToSearch = () => {
    navigate('/', { 
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
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card 
          sx={{ 
            p: 4,
            backgroundColor: 'white',
            border: '1px solid rgba(224, 224, 224, 0.3)',
            borderRadius: 1,
            boxShadow: 'none',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={40} />
            <Typography variant="body1" color="text.secondary">
              Searching for hotels...
            </Typography>
          </Box>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      }}
    >
      <Container 
        maxWidth="lg" 
        sx={{ 
          py: isMobile ? 2 : 4,
          px: isMobile ? 1 : 3,
        }}
      >
      {/* Simple Header with Back Navigation */}
      <Box sx={{ mb: 3 }}>
        <Button 
          onClick={handleBackToSearch}
          variant="outlined"
          sx={{ 
            borderRadius: 1,
            textTransform: 'none',
            fontWeight: 500,
            borderColor: 'rgba(224, 224, 224, 0.5)',
            color: 'text.primary',
            backgroundColor: 'white',
            boxShadow: 'none',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              transform: 'translateY(-1px)',
            },
          }}
        >
          ← Back to Search
        </Button>
      </Box>

      {/* Search Summary and Actions */}
      <Card 
        sx={{ 
          mb: 3,
          backgroundColor: 'white',
          border: '1px solid rgba(224, 224, 224, 0.3)',
          borderRadius: 1,
          boxShadow: 'none',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                mb: 1,
              }}
            >
              Search Results
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {searchRequest ? `Hotels ${formatSearchSummary()}` : 'Loading search results...'}
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'text.primary',
              fontWeight: 600,
            }}>
              {hotels.length} hotel{hotels.length === 1 ? '' : 's'} found
            </Typography>
          </Box>

          <Stack 
            direction={isMobile ? "column" : "row"} 
            spacing={2}
            justifyContent="flex-start"
          >
            <Button 
              variant="outlined"
              onClick={() => console.log('Open filters')}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: COLORS.CARD_BORDER,
                color: 'text.primary',
                backgroundColor: COLORS.CARD_HOVER,
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Filter Results
            </Button>
            <Button 
              variant="outlined"
              onClick={() => console.log('Open sort options')}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: COLORS.CARD_BORDER,
                color: 'text.primary',
                backgroundColor: COLORS.CARD_HOVER,
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Sort By Price
            </Button>
          </Stack>
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
          {hotels.map((hotel, index) => (
            <Box key={hotel.id} sx={{ mb: isMobile ? 2 : 3 }}>
              <HotelDetailsCard
                hotel={hotel}
                onBookRoom={handleBookRoom}
                onBookRoomType={handleBookRoomType}
                defaultExpanded={index === 0} // Expand first hotel by default
                horizontalLayout={true}
              />
            </Box>
          ))}
        </Box>
      ) : (
        <Card 
          sx={{ 
            backgroundColor: 'white',
            border: '1px solid rgba(224, 224, 224, 0.3)',
            borderRadius: 1,
            boxShadow: 'none',
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
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                No Hotels Found
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 2 }}>
              We couldn't find any hotels matching your search criteria.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your search dates, location, or filters to find more options.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleBackToSearch}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                px: 4,
                py: 1.2,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                  transform: 'none',
                  opacity: 0.9,
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
    </Box>
  );
};

export default SearchResultsPage;
