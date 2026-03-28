import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
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
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Hotel as HotelIcon,
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { bookingApiService, BookingSearchResponse } from '../services/bookingApi';
import { formatCurrencyWithDecimals } from '../utils/currencyUtils';
import { formatDateForDisplay } from '../utils/dateUtils';

const BookingSearchPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
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
      setError(t('booking.find.searchPage.errors.enterConfirmationNumber'));
      return;
    }
    
    if (searchType === 'email' && (!email.trim() || !lastName.trim())) {
      setError(t('booking.find.searchPage.errors.enterEmailAndLastName'));
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
        setError(result.message || t('booking.find.searchPage.errors.bookingNotFound'));
      }
    } catch (err) {
      setError(t('booking.find.searchPage.errors.searchFailed'));
      // console.error('Booking search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBookingStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'booked':
        return t('booking.find.searchPage.statuses.booked');
      case 'checked in':
      case 'checked_in':
        return t('booking.find.searchPage.statuses.checkedIn');
      case 'checked out':
      case 'checked_out':
        return t('booking.find.searchPage.statuses.checkedOut');
      case 'cancelled':
        return t('booking.find.searchPage.statuses.cancelled');
      case 'pending':
        return t('booking.find.searchPage.statuses.pending');
      default:
        return status;
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return t('booking.find.searchPage.paymentStatuses.paid');
      case 'pending':
        return t('booking.find.searchPage.paymentStatuses.pending');
      case 'pay_at_frontdesk':
        return t('booking.find.searchPage.paymentStatuses.payAtFrontdesk');
      case 'failed':
        return t('booking.find.searchPage.paymentStatuses.failed');
      case 'refunded':
        return t('booking.find.searchPage.paymentStatuses.refunded');
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'booked': return 'primary';
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
      case 'pay_at_frontdesk': return 'info';
      case 'failed': return 'error';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return formatDateForDisplay(dateString);
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: { xs: 3, md: 4 }, textAlign: 'center' }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h1" 
          gutterBottom
        >
          {t('booking.find.searchPage.title')}
        </Typography>
        <Typography 
          variant={isMobile ? "body1" : "subtitle1"} 
          color="text.secondary"
        >
          {t('booking.find.searchPage.subtitle')}
        </Typography>
      </Box>

      {/* Search Form */}
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: { xs: 2, md: 3 } }}>
        <Box sx={{ mb: { xs: 2, md: 3 } }}>
          <Typography variant="h6" gutterBottom>
            {t('booking.find.searchPage.searchMethod')}
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 2 }, 
            mb: { xs: 2, md: 3 }
          }}>
            <Button
              variant={searchType === 'confirmation' ? 'contained' : 'outlined'}
              onClick={() => setSearchType('confirmation')}
              fullWidth={isMobile}
              size={isMobile ? "medium" : "large"}
            >
              {t('booking.find.searchPage.methods.confirmation')}
            </Button>
            <Button
              variant={searchType === 'email' ? 'contained' : 'outlined'}
              onClick={() => setSearchType('email')}
              fullWidth={isMobile}
              size={isMobile ? "medium" : "large"}
            >
              {t('booking.find.searchPage.methods.emailAndLastName')}
            </Button>
          </Box>
        </Box>

        {searchType === 'confirmation' ? (
          <TextField
            fullWidth
            label={t('booking.find.fields.confirmationNumber')}
            value={confirmationNumber}
            onChange={(e) => setConfirmationNumber(e.target.value)}
            placeholder={t('booking.find.searchPage.placeholders.confirmationNumber')}
            variant="outlined"
            sx={{ mb: { xs: 2, md: 2 } }}
            size={isMobile ? "small" : "medium"}
          />
        ) : (
          <Grid container spacing={{ xs: 1, md: 2 }} sx={{ mb: { xs: 2, md: 2 } }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('booking.find.fields.email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('booking.find.searchPage.placeholders.email')}
                variant="outlined"
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('booking.find.searchPage.fields.lastName')}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t('booking.find.searchPage.placeholders.lastName')}
                variant="outlined"
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
          </Grid>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: { xs: 1, md: 2 } }}>
            {error}
          </Alert>
        )}

        <Button
          fullWidth
          variant="contained"
          size={isMobile ? "medium" : "large"}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
          onClick={handleSearch}
          disabled={loading}
          sx={{ py: { xs: 1.5, md: 2 } }}
        >
          {loading ? t('booking.find.buttons.searching') : t('booking.find.searchPage.buttons.searchBooking')}
        </Button>
      </Paper>

      {/* Booking Results */}
      {booking && (
        <Card sx={{ mt: { xs: 2, md: 3 } }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'flex-start' }, 
              mb: { xs: 2, md: 2 },
              gap: { xs: 1, sm: 0 }
            }}>
              <Box>
                <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
                  {t('booking.manage.bookingDetails')}
                </Typography>
                <Typography variant={isMobile ? "caption" : "subtitle2"} color="text.secondary">
                  {t('booking.find.found.confirmation', { confirmationNumber: booking.confirmationNumber })}
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                gap: 1, 
                flexDirection: { xs: 'row', sm: 'column' }, 
                alignItems: { xs: 'flex-start', sm: 'flex-end' },
                flexWrap: { xs: 'wrap', sm: 'nowrap' }
              }}>
                <Chip
                  label={getBookingStatusLabel(booking.status)}
                  color={getStatusColor(booking.status) as any}
                  variant="filled"
                  size={isMobile ? "small" : "medium"}
                />
                <Chip
                  label={getPaymentStatusLabel(booking.paymentStatus)}
                  color={getPaymentStatusColor(booking.paymentStatus) as any}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>

            <Divider sx={{ my: { xs: 1.5, md: 2 } }} />

            {/* Quick Info */}
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid item xs={6} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.5, md: 1 } }}>
                  <HotelIcon sx={{ mr: 1, color: 'primary.main', fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
                  <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">{t('booking.page.hotel')}</Typography>
                </Box>
                <Typography variant={isMobile ? "body2" : "body1"} fontWeight="medium">
                  {booking.hotelName}
                </Typography>
                <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                  {t('booking.find.searchPage.labels.roomNumber', { roomNumber: booking.roomNumber })} - {booking.roomType}
                </Typography>
              </Grid>

              <Grid item xs={6} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.5, md: 1 } }}>
                  <CalendarIcon sx={{ mr: 1, color: 'primary.main', fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
                  <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">{t('booking.manage.checkIn')}</Typography>
                </Box>
                <Typography variant={isMobile ? "body2" : "body1"} fontWeight="medium">
                  {formatDate(booking.checkInDate)}
                </Typography>
              </Grid>

              <Grid item xs={6} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.5, md: 1 } }}>
                  <CalendarIcon sx={{ mr: 1, color: 'primary.main', fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
                  <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">{t('booking.manage.checkOut')}</Typography>
                </Box>
                <Typography variant={isMobile ? "body2" : "body1"} fontWeight="medium">
                  {formatDate(booking.checkOutDate)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {calculateNights(booking.checkInDate, booking.checkOutDate)} {calculateNights(booking.checkInDate, booking.checkOutDate) !== 1 ? t('booking.page.nightsPlural') : t('booking.page.nights')}
                </Typography>
              </Grid>
            </Grid>

            {/* Expandable Details */}
            <Box sx={{ mt: { xs: 2, md: 3 } }}>
              <Button
                fullWidth
                variant="outlined"
                endIcon={expandedDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={() => setExpandedDetails(!expandedDetails)}
                size={isMobile ? "medium" : "large"}
                sx={{ py: { xs: 1, md: 1.5 } }}
              >
                {expandedDetails ? t('booking.find.searchPage.buttons.hideDetails') : t('booking.find.searchPage.buttons.showMoreDetails')}
              </Button>
              
              <Collapse in={expandedDetails}>
                <Box sx={{ mt: { xs: 1.5, md: 2 } }}>
                  <Divider sx={{ my: { xs: 1.5, md: 2 } }} />
                  
                  <Grid container spacing={{ xs: 2, md: 3 }}>
                    <Grid item xs={12} md={6}>
                      <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>
                        {t('booking.manage.guestInformation')}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.5, md: 1 } }}>
                        <PersonIcon sx={{ mr: 1, color: 'text.secondary', fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
                        <Typography variant={isMobile ? "body2" : "body1"}>{booking.guestName}</Typography>
                      </Box>
                      <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                        {booking.guestEmail}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>
                        {t('booking.page.hotelInformation')}
                      </Typography>
                      <Typography variant={isMobile ? "body2" : "body1"} fontWeight="medium">
                        {booking.hotelName}
                      </Typography>
                      <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                        {booking.hotelAddress}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>
                        {t('booking.page.roomDetails')}
                      </Typography>
                      <Typography variant={isMobile ? "body2" : "body1"}>
                        {t('booking.find.searchPage.labels.roomNumber', { roomNumber: booking.roomNumber })} - {booking.roomType}
                      </Typography>
                      <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                        {formatCurrencyWithDecimals(booking.pricePerNight || 0)} {t('hotelSearch.detail.perNight')}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>
                        {t('booking.find.searchPage.sections.bookingInformation')}
                      </Typography>
                      <Typography variant={isMobile ? "body2" : "body2"}>
                        {t('booking.find.searchPage.labels.bookedOn')} {formatDateForDisplay(booking.createdAt)}
                      </Typography>
                      {booking.paymentIntentId && (
                        <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                          {t('booking.find.searchPage.labels.paymentId')} {booking.paymentIntentId}
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
