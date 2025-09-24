import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  useTheme,
  useMediaQuery,
  Stack,
} from '@mui/material';
// Icons removed for neutral design
import { useNavigate } from 'react-router-dom';
import { hotelApiService } from '../services/hotelApi';
import { BookingResponse } from '../types/hotel';

const FindBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState<BookingResponse | null>(null);

  // Memoized change handlers to prevent input focus loss
  const handleConfirmationNumberChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmationNumber(e.target.value);
  }, []);

  const handleEmailChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }, []);

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
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)'
          : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
      {/* Professional Search Form */}
      <Card 
        elevation={8}
        sx={{ 
          mb: 4,
          background: theme.palette.background.paper,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[8],
        }}
      >
        <CardContent sx={{ p: isMobile ? 3 : 5 }}>
          <Box 
            sx={{ 
              mb: 4,
              textAlign: 'center',
              p: 3,
              background: theme.palette.background.default,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography 
              variant="h5" 
              sx={{
                fontWeight: 'bold',
                color: 'primary.main',
                mb: 1,
                textAlign: 'center',
              }}
            >
              Enter Your Booking Details
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Both fields are required to find your booking
            </Typography>
          </Box>

          <form onSubmit={handleSearch}>
            <Stack spacing={3} direction={{ xs: 'column', md: 'row' }}>
              <TextField
                fullWidth
                label="Reference Number *"
                value={confirmationNumber}
                onChange={handleConfirmationNumberChange}
                placeholder="Enter your booking reference number"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderWidth: 2,
                    },
                  },
                }}
              />
              <TextField
                fullWidth
                label="Email Address *"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter the email used for booking"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderWidth: 2,
                    },
                  },
                }}
              />
            </Stack>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mt: 3,
                  borderRadius: 2,
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(244, 67, 54, 0.1)' 
                    : 'rgba(244, 67, 54, 0.04)',
                }}
              >
                {error}
              </Alert>
            )}

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : undefined}
                sx={{
                  px: 6,
                  py: 2,
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    transform: 'translateY(-1px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  '&.Mui-disabled': {
                    background: theme.palette.grey[300],
                    color: theme.palette.grey[500],
                  }
                }}
              >
                {loading ? 'Searching...' : 'Find Booking'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Professional Booking Results */}
      {booking && (
        <Card 
          elevation={8}
          sx={{
            mb: 4,
            background: theme.palette.background.paper,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[8],
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[12],
            },
          }}
        >
          <CardContent sx={{ p: isMobile ? 3 : 5 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 4,
                p: 3,
                background: theme.palette.background.default,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: 'success.main',
                    mb: 1,
                  }}
                >
                  Booking Found
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Confirmation #{booking.confirmationNumber}
                </Typography>
              </Box>
            </Box>

            <Divider 
              sx={{ 
                my: 4,
                borderColor: theme.palette.divider,
              }} 
            />

            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h5" 
                sx={{
                  fontWeight: 'bold',
                  color: 'primary.main',
                  mb: 1,
                }}
              >
                {booking.hotelName}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                {booking.hotelAddress}
              </Typography>
              
              <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3 }}>
                <Box 
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    background: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[2],
                  }}
                >
                  <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Guest Name
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {booking.guestName}
                  </Typography>
                </Box>
                
                <Box 
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    background: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[2],
                  }}
                >
                  <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Room Type
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {booking.roomType}
                  </Typography>
                </Box>
                
                <Box 
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    background: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[2],
                  }}
                >
                  <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    Check-in
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                    {new Date(booking.checkInDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </Typography>
                  <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    Check-out
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {new Date(booking.checkOutDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </Typography>
                </Box>
                
                <Box 
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    background: theme.palette.background.default,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="subtitle1" color="success.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Total Amount
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: 'success.main',
                    }}
                  >
                    ETB {booking.totalAmount?.toFixed(0)}
                  </Typography>
                </Box>
                
                <Box 
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    background: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[2],
                  }}
                >
                  <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Status
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {booking.status}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleViewBooking}
                color="primary"
                sx={{
                  px: 6,
                  py: 2,
                  borderRadius: 2,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: theme.shadows[2],
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                    transform: 'translateY(-1px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                }}
              >
                Manage Booking
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Professional Help Section */}
      <Card 
        elevation={4}
        sx={{ 
          background: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
          boxShadow: theme.shadows[8],
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              mb: 3,
              p: 2,
              background: theme.palette.background.default,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography 
              variant="h5" 
              sx={{
                fontWeight: 'bold',
                color: 'info.main',
              }}
            >
              Need Help?
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            To find your booking, you'll need both your <strong>reference number</strong> and the <strong>email address</strong> used when making the booking.
            The reference number can be found in your booking confirmation email.
            If you can't find your booking, please contact the hotel directly.
          </Typography>
        </CardContent>
      </Card>
      </Container>
    </Box>
  );
};

export default FindBookingPage;
