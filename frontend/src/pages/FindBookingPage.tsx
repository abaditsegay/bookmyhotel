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
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState<BookingResponse | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBooking(null);
    setLoading(true);

    try {
      // Both reference number and email are required
      if (!confirmationNumber.trim() || !email.trim()) {
        setError('Please enter both reference number and email address');
        setLoading(false);
        return;
      }
      
      // Search using both confirmation number and email
      const result = await hotelApiService.searchBookingByReferenceAndEmail(
        confirmationNumber.trim(), 
        email.trim()
      );
      
      setBooking(result);
    } catch (err) {
      setError('Booking not found. Please check your reference number and email address and try again.');
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate('/')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Find Your Booking
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Enter your reference number and email address to find your booking
          </Typography>
        </Box>
        <SearchIcon sx={{ fontSize: 40, color: 'primary.main' }} />
      </Box>

      {/* Search Form */}
      <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Enter Your Booking Details
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Both fields are required to find your booking
        </Typography>

        <form onSubmit={handleSearch}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Reference Number"
              value={confirmationNumber}
              onChange={(e) => setConfirmationNumber(e.target.value)}
              placeholder="Enter your booking reference number"
              required
            />
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter the email used for booking"
              required
            />
          </Box>

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
                    {booking.roomType}
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
          To find your booking, you'll need both your reference number and the email address used when making the booking.
          The reference number can be found in your booking confirmation email.
          If you can't find your booking, please contact the hotel directly.
        </Typography>
      </Paper>
    </Container>
  );
};

export default FindBookingPage;
