import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Collapse,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Hotel as HotelIcon,
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { bookingApiService, BookingSearchResponse } from '../services/bookingApi';

const BookingSearchPage: React.FC = () => {
  const [searchType, setSearchType] = useState<'confirmation' | 'email'>('confirmation');
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [email, setEmail] = useState('');
  const [lastName, setLastName] = useState('');
  const [booking, setBooking] = useState<BookingSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedDetails, setExpandedDetails] = useState(false);

  const handleSearch = async () => {
    if (searchType === 'confirmation' && !confirmationNumber.trim()) {
      setError('Please enter a confirmation number');
      return;
    }
    
    if (searchType === 'email' && (!email.trim() || !lastName.trim())) {
      setError('Please enter both email and last name');
      return;
    }

    setLoading(true);
    setError('');
    setBooking(null);

    try {
      let result;
      if (searchType === 'confirmation') {
        result = await bookingApiService.searchByConfirmationNumber(confirmationNumber.trim());
      } else {
        result = await bookingApiService.searchByEmailAndName(email.trim(), lastName.trim());
      }

      if (result.success && result.data) {
        setBooking(result.data);
        setExpandedDetails(false);
      } else {
        setError(result.message || 'Booking not found');
      }
    } catch (err) {
      setError('Failed to search for booking. Please try again.');
      console.error('Booking search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'checked in': return 'info';
      case 'checked out': return 'default';
      case 'cancelled': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Find Your Booking
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Search for your reservation using your confirmation number or email
        </Typography>
      </Box>

      {/* Search Form */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Search Method
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant={searchType === 'confirmation' ? 'contained' : 'outlined'}
              onClick={() => setSearchType('confirmation')}
            >
              Confirmation Number
            </Button>
            <Button
              variant={searchType === 'email' ? 'contained' : 'outlined'}
              onClick={() => setSearchType('email')}
            >
              Email & Last Name
            </Button>
          </Box>
        </Box>

        {searchType === 'confirmation' ? (
          <TextField
            fullWidth
            label="Confirmation Number"
            value={confirmationNumber}
            onChange={(e) => setConfirmationNumber(e.target.value)}
            placeholder="Enter your booking confirmation number"
            variant="outlined"
            sx={{ mb: 2 }}
          />
        ) : (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
                variant="outlined"
              />
            </Grid>
          </Grid>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search Booking'}
        </Button>
      </Paper>

      {/* Booking Results */}
      {booking && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h5" gutterBottom>
                  Booking Details
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Confirmation: {booking.confirmationNumber}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'flex-end' }}>
                <Chip
                  label={booking.status}
                  color={getStatusColor(booking.status) as any}
                  variant="filled"
                />
                <Chip
                  label={booking.paymentStatus}
                  color={getPaymentStatusColor(booking.paymentStatus) as any}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Quick Info */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <HotelIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary">Hotel</Typography>
                </Box>
                <Typography variant="body1" fontWeight="medium">
                  {booking.hotelName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Room {booking.roomNumber} - {booking.roomType}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary">Check-in</Typography>
                </Box>
                <Typography variant="body1" fontWeight="medium">
                  {formatDate(booking.checkInDate)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary">Check-out</Typography>
                </Box>
                <Typography variant="body1" fontWeight="medium">
                  {formatDate(booking.checkOutDate)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PaymentIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary">Total</Typography>
                </Box>
                <Typography variant="h6" color="primary.main" fontWeight="bold">
                  ${booking.totalAmount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {calculateNights(booking.checkInDate, booking.checkOutDate)} nights
                </Typography>
              </Grid>
            </Grid>

            {/* Expandable Details */}
            <Box sx={{ mt: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                endIcon={expandedDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={() => setExpandedDetails(!expandedDetails)}
              >
                {expandedDetails ? 'Hide Details' : 'Show More Details'}
              </Button>
              
              <Collapse in={expandedDetails}>
                <Box sx={{ mt: 2 }}>
                  <Divider sx={{ my: 2 }} />
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        Guest Information
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography>{booking.guestName}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {booking.guestEmail}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        Hotel Information
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {booking.hotelName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {booking.hotelAddress}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        Room Details
                      </Typography>
                      <Typography variant="body1">
                        Room {booking.roomNumber} - {booking.roomType}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${booking.pricePerNight} per night
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        Booking Information
                      </Typography>
                      <Typography variant="body2">
                        Booked on: {new Date(booking.createdAt).toLocaleDateString()}
                      </Typography>
                      {booking.paymentIntentId && (
                        <Typography variant="body2" color="text.secondary">
                          Payment ID: {booking.paymentIntentId}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              </Collapse>
            </Box>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default BookingSearchPage;
