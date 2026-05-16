import React, { useState } from 'react';
import {
  Typography,
  Box,
  Alert,
  Divider,
  useTheme,
  Stack,
} from '@mui/material';
import PremiumTextField from '../components/common/PremiumTextField';
import { useTranslation } from 'react-i18next';
import StandardButton from '../components/common/StandardButton';
import { PageContainer, SurfaceCard } from '../components/common';
// Icons removed for neutral design
import { useNavigate } from 'react-router-dom';
import { hotelApiService } from '../services/hotelApi';
import { getPageShellBackground } from '../theme/surfaces';
import { BookingResponse } from '../types/hotel';
import { formatDateForDisplay } from '../utils/dateUtils';
import { getRoomTypeLabel } from '../constants/roomTypes';
import { infoPanelSx, tintedPanelSx } from '../theme/sxHelpers';

// Helper function to get payment status color
const getPaymentStatusColor = (theme: any, status?: string): string => {
  switch (status?.toUpperCase()) {
    case 'COMPLETED':
      return theme.palette.success.main; // Success color from theme
    case 'PROCESSING':
      return theme.palette.primary.main; // Primary color from theme
    case 'REFUNDED':
    case 'PARTIALLY_REFUNDED':
      return theme.palette.info.main; // Info color for refunds
    case 'FAILED':
    case 'CANCELLED':
      return theme.palette.error.main; // Error color for failed/cancelled
    case 'FORFEITED':
      return theme.palette.warning.main; // Warning color for forfeited
    case 'PENDING':
    default:
      return theme.palette.warning.main; // Warning color from theme
  }
};

const FindBookingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState<BookingResponse | null>(null);

  const getBookingStatusLabel = (status?: string) => {
    const normalizedStatus = status?.toLowerCase().replace(/[_\s]/g, '');
    if (!normalizedStatus) {
      return '';
    }

    const translated = t(`booking.guestManagementPage.statuses.${normalizedStatus}`);
    return translated === `booking.guestManagementPage.statuses.${normalizedStatus}` ? status : translated;
  };

  const getPaymentStatusLabel = (status?: string) => {
    const normalizedStatus = (status || 'PENDING').toLowerCase().replace(/[_\s]/g, '');
    const translated = t(`booking.guestManagementPage.paymentStatuses.${normalizedStatus}`);
    return translated === `booking.guestManagementPage.paymentStatuses.${normalizedStatus}` ? (status || 'PENDING') : translated;
  };

  const getTranslatedRoomTypeLabel = (roomType?: string) => {
    if (!roomType) {
      return '';
    }

    const translated = t(`hotelSearch.roomTypes.${roomType.toLowerCase()}`);
    return translated === `hotelSearch.roomTypes.${roomType.toLowerCase()}` ? getRoomTypeLabel(roomType) : translated;
  };

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
    <PageContainer
      maxWidth="lg"
      sx={{
        minHeight: '100vh',
        backgroundColor: getPageShellBackground(theme),
        py: 4,
      }}
    >
      {/* Professional Search Form */}
      <SurfaceCard
        elevation={0}
        sx={{ mb: 4 }}
        contentSx={{ p: { xs: 3, md: 5 } }}
      >
        <Box>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography 
              variant="h5" 
              sx={{
                fontWeight: 700,
                color: 'text.primary',
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
              <PremiumTextField
                fullWidth
                label={t('booking.find.fields.confirmationNumber')}
                value={confirmationNumber}
                onChange={handleConfirmationNumberChange}
                placeholder={t('booking.find.fields.confirmationNumberPlaceholder')}
                required
              />
              <PremiumTextField
                fullWidth
                label={t('booking.find.fields.email')}
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder={t('booking.find.fields.emailPlaceholder')}
                required
              />
            </Stack>

            {error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <StandardButton
                type="submit"
                variant="contained"
                buttonSize="large"
                loading={loading}
                loadingText={t('booking.find.buttons.searching')}
                sx={{
                  px: 6,
                }}
              >
                {t('booking.find.buttons.findBooking')}
              </StandardButton>
            </Box>
          </form>
        </Box>
      </SurfaceCard>

      {/* Professional Booking Results */}
      {booking && (
        <SurfaceCard
          elevation={0}
          sx={{ mb: 4 }}
          contentSx={{ p: { xs: 3, md: 5 } }}
        >
          <Box>
            <Box sx={{ ...infoPanelSx, display: 'flex', alignItems: 'center', mb: 4 }}>
              <Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    color: 'text.primary',
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
                  fontWeight: 700,
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                {booking.hotelName}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                {booking.hotelAddress}
              </Typography>
              
              <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3 }}>
                <Box sx={infoPanelSx}>
                  <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 700, mb: 1 }}>
                    {t('booking.find.found.labels.guestName')}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {booking.guestName}
                  </Typography>
                </Box>
                
                <Box sx={infoPanelSx}>
                  <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 700, mb: 1 }}>
                    {t('booking.find.found.labels.roomType')}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {getTranslatedRoomTypeLabel(booking.roomType)}
                  </Typography>
                </Box>
                
                <Box sx={infoPanelSx}>
                  <Typography variant="body2" color="primary.main" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {t('booking.find.found.labels.checkIn')}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                    {formatDateForDisplay(booking.checkInDate)}
                  </Typography>
                  <Typography variant="body2" color="primary.main" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {t('booking.find.found.labels.checkOut')}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {formatDateForDisplay(booking.checkOutDate)}
                  </Typography>
                </Box>
                
                <Box sx={infoPanelSx}>
                  <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 700, mb: 1 }}>
                    {t('booking.find.found.labels.status')}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {getBookingStatusLabel(booking.status)}
                  </Typography>
                </Box>

                <Box sx={tintedPanelSx('secondary')}>
                  <Typography variant="subtitle1" color="secondary.main" sx={{ fontWeight: 700, mb: 1 }}>
                    {t('booking.find.found.labels.paymentStatus')}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: getPaymentStatusColor(theme, booking.paymentStatus),
                    }}
                  >
                    {getPaymentStatusLabel(booking.paymentStatus)}
                  </Typography>
                </Box>

                {booking.paymentReference && (
                  <Box sx={infoPanelSx}>
                    <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 700, mb: 1 }}>
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
                onClick={handleViewBooking}
                sx={{
                  px: 6,
                }}
              >
                {t('booking.find.found.manageBooking')}
              </StandardButton>
            </Box>
          </Box>
        </SurfaceCard>
      )}

      {/* Professional Help Section */}
      <SurfaceCard
        elevation={0}
        contentSx={{ p: { xs: 3, md: 4 } }}
      >
        <Box>
          <Box sx={{ ...infoPanelSx, display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography 
              variant="h5" 
              sx={{
                fontWeight: 700,
                color: 'text.primary',
              }}
            >
              {t('booking.find.help.title')}
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            {t('booking.find.help.description')}
          </Typography>
        </Box>
      </SurfaceCard>
    </PageContainer>
  );
};

export default FindBookingPage;
