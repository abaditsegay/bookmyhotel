import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Hotel as HotelIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { hotelApiService } from '../services/hotelApi';
import { BookingResponse } from '../types/hotel';

const FindBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchMethod, setSearchMethod] = useState<'confirmation' | 'details'>('confirmation');
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [email, setEmail] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState<BookingResponse | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBooking(null);
    setLoading(true);

    try {
      let result: BookingResponse;
      if (searchMethod === 'confirmation') {
        if (!confirmationNumber.trim()) {
          setError('Please enter a confirmation number');
          return;
        }
        result = await hotelApiService.searchBooking(confirmationNumber.trim());
      } else {
        if (!email.trim() || !lastName.trim()) {
          setError('Please enter both email and last name');
          return;
        }
        result = await hotelApiService.searchBooking(undefined, email.trim(), lastName.trim());
      }
      
      setBooking(result);
    } catch (err) {
      setError('Booking not found. Please check your information and try again.');
    } finally {
      setLoading(false);
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

  const handleViewBooking = () => {
    if (booking) {
      // Navigate to guest booking management page with booking data
      navigate('/guest-booking-management', {
        state: { 
          booking,
          fromSearch: true // Flag to indicate this came from search
        }
      });
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <IconButton
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
          aria-label="back to home"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Find Your Booking
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Look up your reservation using your confirmation number or booking details
        </Typography>
      </Box>

      {/* Search Form */}
      <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
        {/* Search Method Toggle */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant={searchMethod === 'confirmation' ? 'contained' : 'outlined'}
            onClick={() => setSearchMethod('confirmation')}
            sx={{ flex: 1 }}
          >
            Search by Confirmation Number
          </Button>
          <Button
            variant={searchMethod === 'details' ? 'contained' : 'outlined'}
            onClick={() => setSearchMethod('details')}
            sx={{ flex: 1 }}
          >
            Search by Email & Name
          </Button>
        </Box>

        <form onSubmit={handleSearch}>
          {searchMethod === 'confirmation' ? (
            <TextField
              fullWidth
              label="Confirmation Number"
              value={confirmationNumber}
              onChange={(e) => setConfirmationNumber(e.target.value)}
              placeholder="Enter your booking confirmation number"
              required
              sx={{ mb: 3 }}
            />
          ) : (
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter the email used for booking"
                required
              />
              <TextField
                fullWidth
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter guest's last name"
                required
              />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
            sx={{ minWidth: 150 }}
          >
            {loading ? 'Searching...' : 'Find Booking'}
          </Button>
        </form>
      </Paper>

      {/* Booking Results */}
      {booking && (
        <Card elevation={2}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <HotelIcon sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Booking Found!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Confirmation #{booking.confirmationNumber}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {booking.hotelName}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {booking.hotelAddress}
              </Typography>
              
              <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Guest Name
                  </Typography>
                  <Typography variant="body1">
                    {booking.guestName}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Room
                  </Typography>
                  <Typography variant="body1">
                    {booking.roomNumber} - {booking.roomType}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Check-in
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(booking.checkInDate)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Check-out
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(booking.checkOutDate)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    ${booking.totalAmount}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body1">
                    {booking.status}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Button
              variant="contained"
              onClick={handleViewBooking}
              sx={{ mt: 2 }}
            >
              Manage Booking
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Paper elevation={1} sx={{ p: 3, mt: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Need Help?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          If you can't find your booking, please contact the hotel directly or check your email for the confirmation details.
          Make sure to use the same email address and name that were used when making the booking.
        </Typography>
      </Paper>
    </Container>
  );
};

export default FindBookingPage;
