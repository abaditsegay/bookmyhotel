import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CalendarToday,
  Hotel,
  Person,
  Email,
  Cancel
} from '@mui/icons-material';
import { BookingResponse } from '../types/hotel';
import { buildApiUrl } from '../config/apiConfig';
import { formatDateForDisplay } from '../utils/dateUtils';
import { formatCurrencyWithDecimals } from '../utils/currencyUtils';

const BookingManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const token = searchParams.get('token');

  const fetchBooking = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl(`/booking-management?token=${token}`));
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || t('booking.managementPage.errors.failedToLoadBooking'));
      }

      const bookingData = await response.json();
      setBooking(bookingData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('booking.managementPage.errors.failedToLoadBooking'));
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  useEffect(() => {
    if (!token) {
      setError(t('booking.managementPage.errors.invalidLink'));
      setLoading(false);
      return;
    }

    fetchBooking();
  }, [token, fetchBooking, t]);

  const handleCancelBooking = async () => {
    if (!token) return;

    try {
      const response = await fetch(buildApiUrl(`/booking-management?token=${token}`), {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || t('booking.managementPage.errors.failedToCancelBooking'));
      }

      // Get the updated booking data from the response
      const updatedBooking = await response.json();

      setCancelDialogOpen(false);
      setError(null);
      
      // Update the local booking state with the cancelled booking data
      setBooking(updatedBooking);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('booking.managementPage.errors.failedToCancelBooking'));
    }
  };

  const getStatusLabel = (status: string) => {
    const normalizedStatus = status?.toLowerCase().replace(/[_\s]/g, '');
    const translated = t(`booking.guestManagementPage.statuses.${normalizedStatus}`);
    return translated === `booking.guestManagementPage.statuses.${normalizedStatus}` ? status : translated;
  };

  const getRoomTypeTranslation = (roomType: string) => {
    const translated = t(`hotelSearch.roomTypes.${roomType.toLowerCase()}`);
    return translated === `hotelSearch.roomTypes.${roomType.toLowerCase()}` ? roomType : translated;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'booked':
        return 'primary';
      case 'cancelled':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container 
        maxWidth="md" 
        sx={{ 
          mt: { xs: 2, md: 4 }, 
          px: { xs: 1, md: 3 },
          textAlign: 'center' 
        }}
      >
        <CircularProgress />
        <Typography 
          variant="h6" 
          sx={{ 
            mt: 2,
            fontSize: { xs: '1.1rem', md: '1.25rem' },
          }}
        >
          {t('booking.managementPage.loading')}
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container 
        maxWidth="md" 
        sx={{ 
          mt: { xs: 2, md: 4 },
          px: { xs: 1, md: 3 },
        }}
      >
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            fontSize: { xs: '0.875rem', md: '1rem' },
          }}
        >
          {error}
        </Alert>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/')}
          size={isMobile ? 'small' : 'medium'}
        >
          {t('bookingConfirmation.actions.returnHome')}
        </Button>
      </Container>
    );
  }

  if (!booking) {
    return (
      <Container 
        maxWidth="md" 
        sx={{ 
          mt: { xs: 2, md: 4 },
          px: { xs: 1, md: 3 },
        }}
      >
        <Alert 
          severity="warning"
          sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
        >
          {t('booking.managementPage.errors.notFound')}
        </Alert>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        mt: { xs: 2, md: 4 }, 
        mb: { xs: 2, md: 4 },
        px: { xs: 1, md: 3 },
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, md: 3 },
          borderRadius: { xs: 1, md: 2 },
        }}
      >
        <Box sx={{ mb: { xs: 2, md: 3 }, textAlign: 'center' }}>
          <Typography 
            variant={isMobile ? 'h5' : 'h4'} 
            gutterBottom
            sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}
          >
            {t('booking.manage.bookingDetails')}
          </Typography>
          <Chip
            label={getStatusLabel(booking.status)}
            color={getStatusColor(booking.status) as any}
            sx={{ 
              mb: 2,
              fontSize: { xs: '0.75rem', md: '0.875rem' },
              height: { xs: 24, md: 32 },
            }}
          />
        </Box>

        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* Booking Information */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <CalendarToday sx={{ mr: 1, fontSize: { xs: '1rem', md: '1.25rem' } }} />
                  {t('booking.manage.stayDetails')}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 1,
                    fontSize: { xs: '0.875rem', md: '1rem' },
                  }}
                >
                  <strong>{t('booking.manage.checkIn')}:</strong> {formatDateForDisplay(booking.checkInDate)}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 1,
                    fontSize: { xs: '0.875rem', md: '1rem' },
                  }}
                >
                  <strong>{t('booking.manage.checkOut')}:</strong> {formatDateForDisplay(booking.checkOutDate)}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 1,
                    fontSize: { xs: '0.875rem', md: '1rem' },
                  }}
                >
                  <strong>{t('booking.manage.totalAmount')}:</strong> {formatCurrencyWithDecimals(booking.totalAmount || 0)}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary',
                    fontStyle: 'italic',
                  }}
                >
                  {t('booking.managementPage.includingTaxes')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <Hotel sx={{ mr: 1, fontSize: { xs: '1rem', md: '1.25rem' } }} />
                  {t('booking.manage.hotelAndRoom')}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 1,
                    fontSize: { xs: '0.875rem', md: '1rem' },
                  }}
                >
                  <strong>{t('booking.manage.hotel')}:</strong> {booking.hotelName}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 1,
                    fontSize: { xs: '0.875rem', md: '1rem' },
                  }}
                >
                  <strong>{t('booking.manage.roomType')}:</strong> {getRoomTypeTranslation(booking.roomType)}
                </Typography>
                <Typography 
                  variant="body1"
                  sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
                >
                  <strong>{t('booking.manage.confirmationLabel')}:</strong> #{booking.reservationId}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <Person sx={{ mr: 1, fontSize: { xs: '1rem', md: '1.25rem' } }} />
                  {t('booking.manage.guestInformation')}
                </Typography>
                <Grid container spacing={{ xs: 1, md: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography 
                      variant="body1"
                      sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
                    >
                      <strong>{t('booking.manage.name')}:</strong> {booking.guestName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography 
                      variant="body1"
                      sx={{ 
                        fontSize: { xs: '0.875rem', md: '1rem' },
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      <Email sx={{ mr: 1, fontSize: { xs: '1rem', md: '1.25rem' } }} />
                      {booking.guestEmail}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        {booking.status?.toLowerCase() !== 'cancelled' && (
          <Box sx={{ 
            mt: { xs: 2, md: 3 }, 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'center',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
          }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={() => setCancelDialogOpen(true)}
              size={isMobile ? 'small' : 'medium'}
              sx={{ 
                width: { xs: '100%', sm: 'auto' },
                minWidth: { xs: 'auto', sm: '140px' },
              }}
            >
              {t('booking.manage.cancelBooking')}
            </Button>
          </Box>
        )}
      </Paper>

      {/* Cancel Booking Dialog */}
      <Dialog 
        open={cancelDialogOpen} 
        onClose={() => setCancelDialogOpen(false)}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
          {t('booking.manage.cancelDialogTitle')}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
            {t('booking.managementPage.cancelPrompt')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          p: { xs: 2, md: 3 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 },
        }}>
          <Button 
            onClick={() => setCancelDialogOpen(false)}
            size={isMobile ? 'small' : 'medium'}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            {t('booking.manage.keepBooking')}
          </Button>
          <Button 
            onClick={handleCancelBooking} 
            color="error" 
            variant="contained"
            size={isMobile ? 'small' : 'medium'}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            {t('booking.manage.cancelBookingAction')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookingManagementPage;
