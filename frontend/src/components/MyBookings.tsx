import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { ROOM_TYPES, getRoomTypeLabel } from '../constants/roomTypes';
import {
  Hotel,
  CalendarToday,
  Person,
  LocationOn,
  Cancel,
  Receipt,
  CheckCircle,
  Pending,
  Error,
  Email,
  Edit,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addDays, format } from 'date-fns';
import PremiumDatePicker from './common/PremiumDatePicker';
import { useAuth } from '../contexts/AuthContext';
import { BookingService } from '../services/BookingService';
import { BookingResponse, BookingModificationRequest } from '../types/booking';
import { StandardLoading, StandardError } from './common';
import { COLORS, addAlpha, getGradient } from '../theme/themeColors';

const MyBookings: React.FC = () => {
  const { user, token } = useAuth();
  const theme = useTheme();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [modifying, setModifying] = useState(false);
  
  // Modify booking form state
  const [newCheckInDate, setNewCheckInDate] = useState<Date | null>(null);
  const [newCheckOutDate, setNewCheckOutDate] = useState<Date | null>(null);
  const [newRoomType, setNewRoomType] = useState('');
  const [newSpecialRequests, setNewSpecialRequests] = useState('');

  const fetchBookings = useCallback(async () => {
    if (!user || !token) {
      setError('Please log in to view your bookings');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userBookings = await BookingService.getUserBookings(Number(user.id), token);
      setBookings(userBookings);
    } catch (err) {
      setError('Failed to load your bookings. Please try again later.');
      // console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancelBooking = async () => {
    if (!selectedBooking || !token) return;

    try {
      setCancelling(true);
      await BookingService.cancelBooking(selectedBooking.reservationId, token);
      await fetchBookings(); // Refresh the bookings list
      setCancelDialogOpen(false);
      setSelectedBooking(null);
    } catch (err) {
      setError('Failed to cancel booking. Please try again or contact support.');
      // console.error('Error cancelling booking:', err);
    } finally {
      setCancelling(false);
    }
  };

  const handleModifyBooking = async () => {
    if (!selectedBooking || !token) return;

    try {
      setModifying(true);
      setError(null);
      
      const modificationRequest: BookingModificationRequest = {};
      
      if (newCheckInDate) {
        modificationRequest.newCheckInDate = format(newCheckInDate, 'yyyy-MM-dd');
      }
      if (newCheckOutDate) {
        modificationRequest.newCheckOutDate = format(newCheckOutDate, 'yyyy-MM-dd');
      }
      if (newRoomType && newRoomType !== selectedBooking.roomType) {
        modificationRequest.newRoomType = newRoomType;
      }
      if (newSpecialRequests.trim() !== (selectedBooking.specialRequests || '').trim()) {
        modificationRequest.newSpecialRequests = newSpecialRequests.trim();
      }
      
      if (Object.keys(modificationRequest).length === 0) {
        setError('Please make at least one change to modify the booking.');
        return;
      }
      
      const response = await BookingService.modifyBooking(selectedBooking.reservationId, modificationRequest, token);
      
      if (response.success !== false) {
        await fetchBookings(); // Refresh the bookings list
        setModifyDialogOpen(false);
        setSelectedBooking(null);
        resetModifyForm();
      } else {
        setError(response.message || 'Failed to modify booking.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to modify booking. Please try again or contact support.');
      // console.error('Error modifying booking:', err);
    } finally {
      setModifying(false);
    }
  };

  const openModifyDialog = (booking: BookingResponse) => {
    setSelectedBooking(booking);
    setNewCheckInDate(new Date(booking.checkInDate));
    setNewCheckOutDate(new Date(booking.checkOutDate));
    setNewRoomType(booking.roomType);
    setNewSpecialRequests(booking.specialRequests || '');
    setModifyDialogOpen(true);
  };

  const resetModifyForm = () => {
    setNewCheckInDate(null);
    setNewCheckOutDate(null);
    setNewRoomType('');
    setNewSpecialRequests('');
  };

  const closeModifyDialog = () => {
    setModifyDialogOpen(false);
    setSelectedBooking(null);
    resetModifyForm();
  };

  const openCancelDialog = (booking: BookingResponse) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const closeCancelDialog = () => {
    setCancelDialogOpen(false);
    setSelectedBooking(null);
  };

  const canCancelBooking = (booking: BookingResponse): boolean => {
    const status = booking.status.toUpperCase();
    const checkInDate = new Date(booking.checkInDate);
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Can cancel if booking is PENDING or CONFIRMED and check-in is at least 24 hours away
    return (status === 'PENDING' || status === 'CONFIRMED') && checkInDate > twentyFourHoursFromNow;
  };

  const canModifyBooking = (booking: BookingResponse): boolean => {
    const status = booking.status.toUpperCase();
    const checkInDate = new Date(booking.checkInDate);
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Can modify if booking is PENDING or CONFIRMED and check-in is at least 24 hours away
    return (status === 'PENDING' || status === 'CONFIRMED') && checkInDate > twentyFourHoursFromNow;
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return <CheckCircle color="success" />;
      case 'PENDING':
        return <Pending color="warning" />;
      case 'CANCELLED':
        return <Cancel color="error" />;
      case 'CHECKED_IN':
      case 'CHECKED_OUT':
        return <Hotel color="primary" />;
      default:
        return <Error color="error" />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <StandardLoading 
          loading={true}
          overlay={true} 
          message="Loading your bookings..." 
          size="large"
        />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <StandardError
          error={true}
          message={error}
          severity="error"
          showRetry={true}
          onRetry={fetchBookings}
          retryText="Try Again"
        />
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'light' 
          ? getGradient('white')
          : theme.palette.background.default,
        pt: 4,
        pb: 8,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{
              fontWeight: 'bold',
              color: 'text.primary',
              mb: 1,
            }}
          >
            📋 My Bookings
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Manage and track your hotel reservations
          </Typography>
        </Box>

      {bookings.length === 0 ? (
        <Card 
          elevation={8}
          sx={{ 
            p: 6, 
            textAlign: 'center',
            background: theme.palette.background.paper,
            borderRadius: 4,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[4],
          }}
        >
          <Hotel sx={{ fontSize: 80, color: 'primary.main', mb: 3, opacity: 0.7 }} />
          <Typography 
            variant="h4" 
            sx={{
              fontWeight: 'bold',
              color: 'text.primary',
              mb: 2,
            }}
          >
            No Bookings Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem' }}>
            You haven't made any bookings yet. Start exploring our hotels and make your first reservation!
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            href="/hotels"
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: `0 2px 8px ${addAlpha(COLORS.BLACK, 0.1)}`,
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px ${addAlpha(COLORS.BLACK, 0.15)}`,
              },
            }}
          >
            🏨 Browse Hotels
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {bookings.map((booking) => (
            <Grid item xs={12} key={booking.reservationId}>
              <Card 
                elevation={8}
                sx={{ 
                  background: theme.palette.background.paper,
                  borderRadius: 4,
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: theme.shadows[4],
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
                    <Box flex={1}>
                      <Typography 
                        variant="h5" 
                        component="h2" 
                        sx={{
                          fontWeight: 'bold',
                          color: 'primary.main',
                          mb: 1,
                        }}
                      >
                        🏨 {booking.hotelName}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <LocationOn fontSize="small" sx={{ color: 'primary.main' }} />
                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
                          {booking.hotelAddress}
                        </Typography>
                      </Box>
                    </Box>
                    <Box textAlign="right">
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        {getStatusIcon(booking.status)}
                        <Chip 
                          label={booking.status}
                          color={BookingService.getStatusColor(booking.status)}
                          size="medium"
                          sx={{
                            fontWeight: 'bold',
                            px: 2,
                            py: 0.5,
                            borderRadius: 2,
                          }}
                        />
                      </Box>
                      <Chip 
                        label={booking.paymentStatus}
                        color={BookingService.getPaymentStatusColor(booking.paymentStatus)}
                        size="medium"
                        variant="outlined"
                        sx={{
                          fontWeight: 'bold',
                          borderWidth: 2,
                          borderRadius: 2,
                        }}
                      />
                    </Box>
                  </Box>

                  <Divider 
                    sx={{ 
                      my: 3,
                      borderColor: theme.palette.divider,
                    }} 
                  />

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box mb={2}>
                        <Typography 
                          variant="h6" 
                          sx={{
                            fontWeight: 'bold',
                            color: 'primary.main',
                            mb: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          📋 Booking Details
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Receipt fontSize="small" />
                          <Typography variant="body2">
                            Confirmation: <strong>{booking.confirmationNumber}</strong>
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Hotel fontSize="small" />
                          <Typography variant="body2">
                            Room {booking.roomNumber} - {getRoomTypeLabel(booking.roomType)}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Person fontSize="small" />
                          <Typography variant="body2">
                            {booking.guestName}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box mb={2}>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                          Stay Information
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <CalendarToday fontSize="small" />
                          <Typography variant="body2">
                            Check-in: <strong>{BookingService.formatDate(booking.checkInDate)}</strong>
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <CalendarToday fontSize="small" />
                          <Typography variant="body2">
                            Check-out: <strong>{BookingService.formatDate(booking.checkOutDate)}</strong>
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2">
                            Duration: <strong>
                              {BookingService.calculateStayDuration(booking.checkInDate, booking.checkOutDate)} nights
                            </strong>
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Booked on: {BookingService.formatDateTime(booking.createdAt)}
                      </Typography>
                      {booking.specialRequests && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Special requests: {booking.specialRequests}
                        </Typography>
                      )}
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="body2" color="text.secondary">
                        {BookingService.formatCurrency(booking.pricePerNight)} / night
                      </Typography>
                      <Typography variant="h6" color="primary">
                        Total: {BookingService.formatCurrency(booking.totalAmount)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                
                <CardActions 
                  sx={{ 
                    px: 3, 
                    pb: 3,
                    pt: 2,
                    gap: 2,
                    flexWrap: 'wrap',
                  }}
                >
                  <Button 
                    variant="outlined"
                    size="medium" 
                    startIcon={<Email />}
                    href={`mailto:support@bookmyhotel.com?subject=Booking Inquiry - ${booking.confirmationNumber}`}
                    sx={{
                      borderRadius: 2,
                      borderWidth: 1.5,
                      px: 3,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                      backgroundColor: COLORS.WHITE,
                      '&:hover': {
                        borderWidth: 1.5,
                        transform: 'translateY(-1px)',
                        boxShadow: `0 4px 12px ${addAlpha(COLORS.BLACK, 0.15)}`,
                      },
                    }}
                  >
                    💬 Contact Support
                  </Button>
                  {canModifyBooking(booking) ? (
                    <Button 
                      variant="contained"
                      size="medium" 
                      color="primary" 
                      startIcon={<Edit />}
                      onClick={() => openModifyDialog(booking)}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1.5,
                        fontWeight: 600,
                        textTransform: 'none',
                        boxShadow: `0 2px 8px ${addAlpha(COLORS.BLACK, 0.1)}`,
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: `0 4px 12px ${addAlpha(COLORS.BLACK, 0.15)}`,
                        },
                      }}
                    >
                      ✏️ Modify Booking
                    </Button>
                  ) : (
                    booking.status !== 'CANCELLED' && (
                      <Tooltip title="Modifications must be made at least 24 hours before check-in">
                        <span>
                          <Button 
                            variant="outlined"
                            size="medium" 
                            color="primary" 
                            disabled
                            startIcon={<Edit />}
                            sx={{
                              borderRadius: 2,
                              px: 3,
                              py: 1.5,
                              fontWeight: 600,
                              textTransform: 'none',
                            }}
                          >
                            ✏️ Modify Booking
                          </Button>
                        </span>
                      </Tooltip>
                    )
                  )}
                  {canCancelBooking(booking) && (
                    <Button 
                      variant="outlined"
                      size="medium" 
                      color="error" 
                      startIcon={<Cancel />}
                      onClick={() => openCancelDialog(booking)}
                      sx={{
                        borderRadius: 2,
                        borderWidth: 1.5,
                        px: 3,
                        py: 1.5,
                        fontWeight: 600,
                        textTransform: 'none',
                        backgroundColor: COLORS.WHITE,
                        '&:hover': {
                          borderWidth: 1.5,
                          backgroundColor: addAlpha(COLORS.ERROR, 0.04),
                          transform: 'translateY(-1px)',
                          boxShadow: `0 4px 12px ${addAlpha(COLORS.ERROR, 0.15)}`,
                        },
                      }}
                    >
                      ❌ Cancel Booking
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Cancel Booking Dialog */}
      <Dialog open={cancelDialogOpen} onClose={closeCancelDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Are you sure you want to cancel this booking?
              </Alert>
              <Typography variant="body1" gutterBottom>
                <strong>Hotel:</strong> {selectedBooking.hotelName}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Confirmation:</strong> {selectedBooking.confirmationNumber}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Check-in:</strong> {BookingService.formatDate(selectedBooking.checkInDate)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Total Amount:</strong> {BookingService.formatCurrency(selectedBooking.totalAmount)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                This action cannot be undone. Refund policies may apply.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCancelDialog} disabled={cancelling}>
            Keep Booking
          </Button>
          <Button 
            onClick={handleCancelBooking} 
            color="error" 
            variant="contained"
            disabled={cancelling}
            startIcon={cancelling ? <CircularProgress size={20} /> : <Cancel />}
          >
            {cancelling ? 'Cancelling...' : 'Cancel Booking'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modify Booking Dialog */}
      <Dialog open={modifyDialogOpen} onClose={closeModifyDialog} maxWidth="md" fullWidth>
        <DialogTitle>Modify Booking</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                Modify your booking details below. You can change dates, room type, or special requests.
              </Alert>
              
              <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
                Current Booking: {selectedBooking.hotelName} - {selectedBooking.confirmationNumber}
              </Typography>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <PremiumDatePicker
                      label="New Check-in Date"
                      value={newCheckInDate}
                      onChange={(date) => setNewCheckInDate(date)}
                      minDate={new Date()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          helperText: `Current: ${BookingService.formatDate(selectedBooking.checkInDate)}`
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <PremiumDatePicker
                      label="New Check-out Date"
                      value={newCheckOutDate}
                      onChange={(date) => setNewCheckOutDate(date)}
                      minDate={newCheckInDate ? addDays(newCheckInDate, 1) : addDays(new Date(), 1)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          helperText: `Current: ${BookingService.formatDate(selectedBooking.checkOutDate)}`
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Room Type</InputLabel>
                      <Select
                        value={newRoomType}
                        label="Room Type"
                        onChange={(e) => setNewRoomType(e.target.value as string)}
                      >
                        {ROOM_TYPES.map((roomType) => (
                          <MenuItem key={roomType.value} value={roomType.value}>
                            {roomType.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Current: {getRoomTypeLabel(selectedBooking.roomType)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Special Requests"
                      value={newSpecialRequests}
                      onChange={(e) => setNewSpecialRequests(e.target.value)}
                      placeholder="Enter any special requests for your stay..."
                      helperText={`Current: ${selectedBooking.specialRequests || 'None'}`}
                    />
                  </Grid>
                </Grid>
              </LocalizationProvider>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModifyDialog} disabled={modifying}>
            Cancel
          </Button>
          <Button 
            onClick={handleModifyBooking} 
            color="primary" 
            variant="contained"
            disabled={modifying}
            startIcon={modifying ? <CircularProgress size={20} /> : <Edit />}
          >
            {modifying ? 'Modifying...' : 'Modify Booking'}
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
};

export default MyBookings;
