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
  useTheme,
  useMediaQuery,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  Hotel as HotelIcon,
  ArrowBack as ArrowBackIcon,
  ContactSupport as ContactSupportIcon,
} from '@mui/icons-material';
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
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Professional Header */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 4,
            p: 3,
            background: 'white',
            borderRadius: 3,
            border: '1px solid #e0e0e0',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          }}
        >
          <IconButton 
            onClick={() => navigate('/')} 
            sx={{ 
              mr: 2,
              backgroundColor: 'primary.main',
              color: 'white',
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'primary.dark',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 'bold',
                color: 'text.primary',
                mb: 1,
              }}
            >
              🔍 Find Your Booking
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Enter your reference number and email address to find your booking
            </Typography>
          </Box>
          <Box sx={{
            width: 64,
            height: 64,
            borderRadius: 2,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}>
            <SearchIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>
        </Box>

      {/* Professional Search Form */}
      <Card 
        elevation={8}
        sx={{ 
          mb: 4,
          background: 'white',
          borderRadius: 3,
          border: '1px solid #e0e0e0',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        }}
      >
        <CardContent sx={{ p: isMobile ? 3 : 5 }}>
          <Box 
            sx={{ 
              mb: 4,
              textAlign: 'center',
              p: 3,
              background: '#f8f9fa',
              borderRadius: 2,
              border: '1px solid #e9ecef',
            }}
          >
            <Typography 
              variant="h5" 
              sx={{
                fontWeight: 'bold',
                color: 'primary.main',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              📋 Enter Your Booking Details
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
                    backgroundColor: 'white',
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
                    backgroundColor: 'white',
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
                  backgroundColor: 'rgba(244, 67, 54, 0.04)',
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
                startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
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
                {loading ? 'Searching...' : '🔍 Find Booking'}
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
            background: 'white',
            borderRadius: 3,
            border: '1px solid #e0e0e0',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
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
                background: '#f8f9fa',
                borderRadius: 2,
                border: '1px solid #e9ecef',
              }}
            >
              <Box sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: 'success.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 3,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}>
                <HotelIcon sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              <Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: 'success.main',
                    mb: 1,
                  }}
                >
                  ✅ Booking Found!
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Confirmation #{booking.confirmationNumber}
                </Typography>
              </Box>
            </Box>

            <Divider 
              sx={{ 
                my: 4,
                borderColor: '#e9ecef',
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
                🏨 {booking.hotelName}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                📍 {booking.hotelAddress}
              </Typography>
              
              <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3 }}>
                <Box 
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                    👤 Guest Name
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {booking.guestName}
                  </Typography>
                </Box>
                
                <Box 
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                    🛏️ Room Type
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {booking.roomType}
                  </Typography>
                </Box>
                
                <Box 
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                    📅 Check-in
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {formatDate(booking.checkInDate)}
                  </Typography>
                </Box>
                
                <Box 
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                    📅 Check-out
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {formatDate(booking.checkOutDate)}
                  </Typography>
                </Box>
                
                <Box 
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    background: '#f8f9fa',
                    border: '1px solid #e9ecef',
                  }}
                >
                  <Typography variant="subtitle1" color="success.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                    💰 Total Amount
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
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                    📊 Status
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
                color="secondary"
                sx={{
                  px: 6,
                  py: 2,
                  borderRadius: 2,
                  fontSize: '1.2rem',
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
                }}
              >
                🎯 Manage Booking
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Professional Help Section */}
      <Card 
        elevation={4}
        sx={{ 
          background: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              mb: 3,
              p: 2,
              background: '#f8f9fa',
              borderRadius: 2,
              border: '1px solid #e9ecef',
            }}
          >
            <ContactSupportIcon sx={{ fontSize: 32, color: 'info.main', mr: 2 }} />
            <Typography 
              variant="h5" 
              sx={{
                fontWeight: 'bold',
                color: 'info.main',
              }}
            >
              💡 Need Help?
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
