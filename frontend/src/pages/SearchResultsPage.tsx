import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Snackbar,
  Paper,
  Breadcrumbs,
  Link,
  Fab,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hotelApiService } from '../services/hotelApi';
import HotelDetailsCard from '../components/hotel/HotelDetailsCard';
import { 
  HotelSearchRequest, 
  HotelSearchResult,
} from '../types/hotel';

const SearchResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
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
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={48} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        {/* Back Navigation */}
        <Box sx={{ mb: 2 }}>
          <IconButton 
            onClick={handleBackToSearch}
            sx={{ mr: 1 }}
            aria-label="back to search"
          >
            <ArrowBackIcon />
          </IconButton>
          <Breadcrumbs aria-label="breadcrumb">
            <Link 
              component="button" 
              variant="body2" 
              onClick={handleBackToSearch}
              sx={{ textDecoration: 'none' }}
            >
              Hotel Search
            </Link>
            <Typography variant="body2" color="text.primary">
              Search Results
            </Typography>
          </Breadcrumbs>
        </Box>

        {/* Search Summary */}
        <Paper elevation={1} sx={{ p: 3, mb: 3, backgroundColor: 'primary.50' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Search Results
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Hotels {formatSearchSummary()}
          </Typography>
          <Typography variant="body1" color="success.main" sx={{ fontWeight: 'medium' }}>
            {hotels.length} hotel{hotels.length === 1 ? '' : 's'} found
          </Typography>
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Fab 
            variant="extended" 
            size="medium" 
            color="primary"
            onClick={() => console.log('Open filters')}
          >
            <FilterIcon sx={{ mr: 1 }} />
            Filter Results
          </Fab>
          <Fab 
            variant="extended" 
            size="medium" 
            onClick={() => console.log('Open sort options')}
          >
            <SortIcon sx={{ mr: 1 }} />
            Sort By Price
          </Fab>
        </Box>
      </Box>

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
            <HotelDetailsCard
              key={hotel.id}
              hotel={hotel}
              onBookRoom={handleBookRoom}
              onBookRoomType={handleBookRoomType}
              defaultExpanded={index === 0} // Expand first hotel by default
            />
          ))}
        </Box>
      ) : (
        <Paper elevation={1} sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No hotels found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            We couldn't find any hotels matching your search criteria.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search dates, location, or filters.
          </Typography>
        </Paper>
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

export default SearchResultsPage;
