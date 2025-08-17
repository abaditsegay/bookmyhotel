import React, { useState, useEffect } from 'react';
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
import HotelDetailsCard from '../components/hotel/HotelDetailsCard';
import BookingForm from '../components/booking/BookingForm';
import { useAuthenticatedApi } from '../hooks/useAuthenticatedApi';
import { 
  HotelSearchRequest, 
  HotelSearchResult,
  BookingRequest,
  AvailableRoom 
} from '../types/hotel';

const SearchResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hotelApiService } = useAuthenticatedApi();
  
  // State from search parameters
  const [searchRequest, setSearchRequest] = useState<HotelSearchRequest | null>(null);
  const [hotels, setHotels] = useState<HotelSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Booking form state
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<AvailableRoom | null>(null);
  const [selectedHotelName, setSelectedHotelName] = useState('');
  
  // Success/error feedback
  const [successMessage, setSuccessMessage] = useState('');

  // Extract search parameters from location state or URL
  useEffect(() => {
    const state = location.state as { searchRequest?: HotelSearchRequest; hotels?: HotelSearchResult[] };
    
    if (state?.searchRequest && state?.hotels) {
      // If we have data passed from the search page
      setSearchRequest(state.searchRequest);
      setHotels(state.hotels);
      setLoading(false);
    } else {
      // If no data, redirect back to search
      navigate('/');
    }
  }, [location, navigate]);

  const handleBookRoom = async (hotelId: number, roomId: number) => {
    // Find the selected room and hotel
    const hotel = hotels.find(h => h.id === hotelId);
    const room = hotel?.availableRooms.find(r => r.id === roomId);
    
    if (!room || !hotel) {
      setError('Selected room not found');
      return;
    }

    setSelectedRoom(room);
    setSelectedHotelName(hotel.name);
    setBookingFormOpen(true);
  };

  const handleBookingSubmit = async (bookingRequest: BookingRequest) => {
    try {
      const result = await hotelApiService.createBooking(bookingRequest);
      setSuccessMessage(`Booking confirmed! Confirmation number: ${result.confirmationNumber}`);
      setBookingFormOpen(false);
      
      // Optionally refresh search results to update availability
      if (searchRequest) {
        setLoading(true);
        try {
          const refreshedResults = await hotelApiService.searchHotels(searchRequest);
          setHotels(refreshedResults);
        } catch (err) {
          console.error('Failed to refresh results:', err);
        } finally {
          setLoading(false);
        }
      }
    } catch (err) {
      throw err; // Let the form handle the error
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

      {/* Booking Form Dialog */}
      <BookingForm
        open={bookingFormOpen}
        onClose={() => setBookingFormOpen(false)}
        onSubmit={handleBookingSubmit}
        room={selectedRoom}
        hotelName={selectedHotelName}
        defaultCheckIn={searchRequest ? new Date(searchRequest.checkInDate) : undefined}
        defaultCheckOut={searchRequest ? new Date(searchRequest.checkOutDate) : undefined}
        defaultGuests={searchRequest?.guests}
      />

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
