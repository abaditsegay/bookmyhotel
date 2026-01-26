import React, { useState } from 'react';
import { COLORS, getGradient } from '../theme/themeColors';
import {
  Container,
  Typography,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Divider,
  useTheme,
  useMediaQuery,
  Stack,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import StandardCard from '../components/common/StandardCard';
import StandardButton from '../components/common/StandardButton';
// Icons removed for neutral design
import { useNavigate } from 'react-router-dom';
import { hotelApiService } from '../services/hotelApi';
import { BookingResponse } from '../types/hotel';
import { formatDateForDisplay } from '../utils/dateUtils';
import { getRoomTypeLabel } from '../constants/roomTypes';

// Helper function to get payment status color
const getPaymentStatusColor = (theme: any, status?: string): string => {
  switch (status?.toUpperCase()) {
    case 'COMPLETED':
      return theme.palette.success.main; // Success color from theme
    case 'PROCESSING':
      return theme.palette.primary.main; // Primary color from theme
    case 'PENDING':
    default:
      return theme.palette.error.main; // Error color from theme
  }
};

const FindBookingPage: React.FC = () => {
  const { t } = useTranslation();
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
        setError(t('booking.find.errors.bothFieldsRequired'));
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
      setError(t('booking.find.errors.bookingNotFound'));
    } finally {
      setLoading(false);
    }
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
          ? getGradient('dark')
          : getGradient('white'),
        py: 4,
      }}
    >
      <Container maxWidth="lg">
      {/* Professional Search Form */}
      <StandardCard 
        cardVariant="elevated"
        sx={{ 
          mb: 4,
        }}
      >
        <Box sx={{ p: isMobile ? 3 : 5 }}>
          <Box 
            sx={{ 
              mb: 4,
              textAlign: 'center',
              p: 2,
              background: theme.palette.background.default,
              borderRadius: 0,
              border: `1px solid rgba(224, 224, 224, 0.3)`,
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
              {t('booking.find.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('booking.find.subtitle')}
            </Typography>
          </Box>

          <form onSubmit={handleSearch}>
            <Stack spacing={3} direction={{ xs: 'column', md: 'row' }}>
              <TextField
                fullWidth
                label={t('booking.find.fields.confirmationNumber')}
                value={confirmationNumber}
                onChange={handleConfirmationNumberChange}
                placeholder={t('booking.find.fields.confirmationNumberPlaceholder')}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 0,
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
                label={t('booking.find.fields.email')}
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder={t('booking.find.fields.emailPlaceholder')}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 0,
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
                  borderRadius: 0,
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(244, 67, 54, 0.1)' 
                    : 'rgba(244, 67, 54, 0.04)',
                }}
              >
                {error}
              </Alert>
            )}

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <StandardButton
                type="submit"
                variant="contained"
                buttonSize="large"
                gradient
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : undefined}
                sx={{
                  px: 6,
                  py: 1.5,
                  fontSize: '1.05rem',
                  fontWeight: 500,
                }}
              >
                {loading ? t('booking.find.buttons.searching') : t('booking.find.buttons.findBooking')}
              </StandardButton>
            </Box>
          </form>
        </Box>
      </StandardCard>

      {/* Professional Booking Results */}
      {booking && (
        <StandardCard 
          cardVariant="gradient"
          sx={{
            mb: 4,
          }}
        >
          <Box sx={{ p: isMobile ? 3 : 5 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 4,
                p: 2,
                background: theme.palette.background.default,
                borderRadius: 0,
                border: `1px solid rgba(224, 224, 224, 0.3)`,
              }}
            >
              <Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: COLORS.PRIMARY,
                    mb: 1,
                  }}
                >
                  {t('booking.find.found.title')}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {t('booking.find.found.confirmation', { confirmationNumber: booking.confirmationNumber })}
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
                    p: 2,
                    borderRadius: 0,
                    background: theme.palette.background.paper,
                    border: `1px solid rgba(224, 224, 224, 0.3)`,
                    boxShadow: 'none',
                  }}
                >
                  <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {t('booking.find.found.labels.guestName')}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {booking.guestName}
                  </Typography>
                </Box>
                
                <Box 
                  sx={{
                    p: 2,
                    borderRadius: 0,
                    background: theme.palette.background.paper,
                    border: `1px solid rgba(224, 224, 224, 0.3)`,
                    boxShadow: 'none',
                  }}
                >
                  <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {t('booking.find.found.labels.roomType')}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {getRoomTypeLabel(booking.roomType)}
                  </Typography>
                </Box>
                
                <Box 
                  sx={{
                    p: 2,
                    borderRadius: 0,
                    background: theme.palette.background.paper,
                    border: `1px solid rgba(224, 224, 224, 0.3)`,
                    boxShadow: 'none',
                  }}
                >
                  <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {t('booking.find.found.labels.checkIn')}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                    {formatDateForDisplay(booking.checkInDate)}
                  </Typography>
                  <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {t('booking.find.found.labels.checkOut')}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {formatDateForDisplay(booking.checkOutDate)}
                  </Typography>
                </Box>
                
                <Box 
                  sx={{
                    p: 2,
                    borderRadius: 0,
                    background: theme.palette.background.paper,
                    border: `1px solid rgba(224, 224, 224, 0.3)`,
                    boxShadow: 'none',
                  }}
                >
                  <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {t('booking.find.found.labels.status')}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {booking.status}
                  </Typography>
                </Box>

                <Box 
                  sx={{
                    p: 2,
                    borderRadius: 0,
                    background: theme.palette.background.paper,
                    border: `1px solid rgba(224, 224, 224, 0.3)`,
                    boxShadow: 'none',
                  }}
                >
                  <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {t('booking.find.found.labels.paymentStatus')}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: getPaymentStatusColor(theme, booking.paymentStatus),
                    }}
                  >
                    {booking.paymentStatus || 'PENDING'}
                  </Typography>
                </Box>

                {booking.paymentReference && (
                  <Box 
                    sx={{
                      p: 2,
                      borderRadius: 0,
                      background: theme.palette.background.paper,
                      border: `1px solid rgba(224, 224, 224, 0.3)`,
                      boxShadow: 'none',
                    }}
                  >
                    <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {t('booking.find.found.labels.paymentReference')}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {booking.paymentReference}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <StandardButton
                variant="contained"
                buttonSize="large"
                elevated
                onClick={handleViewBooking}
                sx={{
                  px: 6,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 500,
                }}
              >
                {t('booking.find.found.manageBooking')}
              </StandardButton>
            </Box>
          </Box>
        </StandardCard>
      )}

      {/* Professional Help Section */}
      <StandardCard 
        cardVariant="outlined"
        sx={{ 
          background: theme.palette.background.paper,
        }}
      >
        <Box sx={{ p: 4 }}>
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              mb: 3,
              p: 2,
              background: theme.palette.background.default,
              borderRadius: 0,
              border: `1px solid rgba(224, 224, 224, 0.3)`,
            }}
          >
            <Typography 
              variant="h5" 
              sx={{
                fontWeight: 'bold',
                color: 'info.main',
              }}
            >
              {t('booking.find.help.title')}
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            {t('booking.find.help.description')}
          </Typography>
        </Box>
      </StandardCard>
      </Container>
    </Box>
  );
};

export default FindBookingPage;
