import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Hotel as HotelIcon,
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { bookingApiService, BookingSearchResponse } from '../../services/bookingApi';
import { formatDateForDisplay } from '../../utils/dateUtils';
import { getRoomTypeLabel } from '../../constants/roomTypes';

interface BookingSearchModalProps {
  open: boolean;
  onClose: () => void;
}

const BookingSearchModal: React.FC<BookingSearchModalProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [searchType, setSearchType] = useState<'confirmation' | 'email'>('confirmation');
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [email, setEmail] = useState('');
  const [lastName, setLastName] = useState('');
  const [booking, setBooking] = useState<BookingSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setBooking(null);
    setError('');
    setConfirmationNumber('');
    setEmail('');
    setLastName('');
    onClose();
  };

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
      case 'completed':
      case 'paid': return 'success';
      case 'processing':
      case 'pending': return 'warning';
      case 'pay_at_frontdesk': return 'info';
      case 'failed':
      case 'cancelled': return 'error';
      case 'refunded':
      case 'partially_refunded': return 'info';
      case 'forfeited': return 'warning';
      default: return 'default';
    }
  };

  const getPaymentStatusPaletteColor = (status: string) => {
    const key = getPaymentStatusColor(status);
    const palette = (theme.palette as any)[key];
    return palette?.main || theme.palette.grey[500];
  };

  const formatDate = (dateString: string) => {
    return formatDateForDisplay(dateString);
  };

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

  const getRoomTypeTranslation = (roomType?: string) => {
    if (!roomType) {
      return '';
    }

    const translated = t(`hotelSearch.roomTypes.${roomType.toLowerCase()}`);
    return translated === `hotelSearch.roomTypes.${roomType.toLowerCase()}` ? getRoomTypeLabel(roomType) : translated;
  };

  const getNightLabel = (count: number) => {
    return count === 1 ? t('booking.guestManagementPage.nightSingle') : t('booking.guestManagementPage.nightPlural');
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          m: isMobile ? 0 : 1,
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" component="div">
            {t('booking.find.searchPage.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('booking.find.searchPage.subtitle')}
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {/* Search Form */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="medium">
            {t('booking.find.searchPage.searchMethod')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
            <Button
              variant={searchType === 'confirmation' ? 'contained' : 'outlined'}
              onClick={() => setSearchType('confirmation')}
              size="small"
            >
              {t('booking.find.searchPage.methods.confirmation')}
            </Button>
            <Button
              variant={searchType === 'email' ? 'contained' : 'outlined'}
              onClick={() => setSearchType('email')}
              size="small"
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
            size="small"
            sx={{ mb: 2 }}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        ) : (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('booking.find.fields.email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('booking.find.searchPage.placeholders.email')}
                variant="outlined"
                size="small"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
                size="small"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
          onClick={handleSearch}
          disabled={loading}
          sx={{ mb: 3 }}
        >
          {loading ? t('booking.find.buttons.searching') : t('booking.find.searchPage.buttons.searchBooking')}
        </Button>

        {/* Booking Results */}
        {booking && (
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {t('booking.find.found.title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('booking.find.found.confirmation', { confirmationNumber: booking.confirmationNumber })}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Chip
                    label={getBookingStatusLabel(booking.status)}
                    color={getStatusColor(booking.status) as any}
                    variant="filled"
                    size="small"
                  />
                  <Chip
                    label={getPaymentStatusLabel(booking.paymentStatus)}
                    color={getPaymentStatusColor(booking.paymentStatus) as any}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Booking Info */}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <HotelIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">{t('booking.manage.hotelAndRoom')}</Typography>
                  </Box>
                  
                  {/* Hotel Name with Payment Info at rightmost */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="body1" fontWeight="medium">
                      {booking.hotelName}
                    </Typography>
                    
                    {/* Payment Information - Rightmost */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end' }}>
                      {/* Payment Status */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">{t('booking.find.found.labels.paymentStatus')}:</Typography>
                        <Box
                          sx={{
                            px: 1,
                            py: 0.25,
                            borderRadius: 0.5,
                            backgroundColor: getPaymentStatusPaletteColor(booking.paymentStatus),
                            color: theme.palette.getContrastText(getPaymentStatusPaletteColor(booking.paymentStatus)),
                            fontSize: '0.7rem',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                          }}
                        >
                          {getPaymentStatusLabel(booking.paymentStatus)}
                        </Box>
                      </Box>
                      
                      {/* Payment Reference */}
                      {booking.paymentReference && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" color="text.secondary">{t('booking.find.found.labels.paymentReference')}:</Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              fontFamily: 'monospace',
                              backgroundColor: theme.palette.action.hover,
                              px: 0.5,
                              py: 0.25,
                              borderRadius: 0.5,
                              fontSize: '0.7rem',
                            }}
                          >
                            {booking.paymentReference}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('booking.find.found.labels.roomType')}: {getRoomTypeTranslation(booking.roomType)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">{t('booking.find.found.labels.checkIn')}</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {formatDate(booking.checkInDate)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">{t('booking.find.found.labels.checkOut')}</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {formatDate(booking.checkOutDate)}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">{t('booking.find.found.labels.guestName')}</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {booking.guestName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {calculateNights(booking.checkInDate, booking.checkOutDate)} {getNightLabel(calculateNights(booking.checkInDate, booking.checkOutDate))}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} variant="outlined">
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingSearchModal;
