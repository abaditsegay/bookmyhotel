import React, { useState } from 'react';
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
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { bookingApiService, BookingSearchResponse } from '../../services/bookingApi';

interface BookingSearchModalProps {
  open: boolean;
  onClose: () => void;
}

const BookingSearchModal: React.FC<BookingSearchModalProps> = ({ open, onClose }) => {
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
      weekday: 'short',
      year: 'numeric',
      month: 'short',
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
            Find Your Booking
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Search using your confirmation number or email
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
            Search Method
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
            <Button
              variant={searchType === 'confirmation' ? 'contained' : 'outlined'}
              onClick={() => setSearchType('confirmation')}
              size="small"
            >
              Confirmation Number
            </Button>
            <Button
              variant={searchType === 'email' ? 'contained' : 'outlined'}
              onClick={() => setSearchType('email')}
              size="small"
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
            size="small"
            sx={{ mb: 2 }}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
                size="small"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
          {loading ? 'Searching...' : 'Search Booking'}
        </Button>

        {/* Booking Results */}
        {booking && (
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Booking Found!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Confirmation: {booking.confirmationNumber}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Chip
                    label={booking.status}
                    color={getStatusColor(booking.status) as any}
                    variant="filled"
                    size="small"
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

              {/* Booking Info */}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <HotelIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">Hotel & Room</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {booking.hotelName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Room {booking.roomNumber} - {booking.roomType}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">Check-in</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {formatDate(booking.checkInDate)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">Check-out</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {formatDate(booking.checkOutDate)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">Guest</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {booking.guestName}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PaymentIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
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
            </CardContent>
          </Card>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingSearchModal;
