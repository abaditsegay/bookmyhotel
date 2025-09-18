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
  Paper,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
} from '@mui/material';
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
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useAuth } from '../contexts/AuthContext';
import { BookingService } from '../services/BookingService';
import { BookingResponse, BookingModificationRequest } from '../types/booking';

const MyBookings: React.FC = () => {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [modifying, setModifying] = useState(false);
  
  // Modify booking form state
  const [newCheckInDate, setNewCheckInDate] = useState<Dayjs | null>(null);
  const [newCheckOutDate, setNewCheckOutDate] = useState<Dayjs | null>(null);
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
      console.error('Error fetching bookings:', err);
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
      console.error('Error cancelling booking:', err);
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
        modificationRequest.newCheckInDate = newCheckInDate.format('YYYY-MM-DD');
      }
      if (newCheckOutDate) {
        modificationRequest.newCheckOutDate = newCheckOutDate.format('YYYY-MM-DD');
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
      console.error('Error modifying booking:', err);
    } finally {
      setModifying(false);
    }
  };

  const openModifyDialog = (booking: BookingResponse) => {
    setSelectedBooking(booking);
    setNewCheckInDate(dayjs(booking.checkInDate));
    setNewCheckOutDate(dayjs(booking.checkOutDate));
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
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchBookings}>
          Try Again
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        My Bookings
      </Typography>

      {bookings.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Hotel sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Bookings Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You haven't made any bookings yet. Start exploring our hotels and make your first reservation!
          </Typography>
          <Button variant="contained" href="/hotels">
            Browse Hotels
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {bookings.map((booking) => (
            <Grid item xs={12} key={booking.reservationId}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {booking.hotelName}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
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
                          size="small"
                        />
                      </Box>
                      <Chip 
                        label={booking.paymentStatus}
                        color={BookingService.getPaymentStatusColor(booking.paymentStatus)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box mb={2}>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                          Booking Details
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
                            Room {booking.roomNumber} - {booking.roomType}
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
                
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button 
                    size="small" 
                    startIcon={<Email />}
                    href={`mailto:support@bookmyhotel.com?subject=Booking Inquiry - ${booking.confirmationNumber}`}
                  >
                    Contact Support
                  </Button>
                  {canModifyBooking(booking) ? (
                    <Button 
                      size="small" 
                      color="primary" 
                      startIcon={<Edit />}
                      onClick={() => openModifyDialog(booking)}
                    >
                      Modify Booking
                    </Button>
                  ) : (
                    booking.status !== 'CANCELLED' && (
                      <Tooltip title="Modifications must be made at least 24 hours before check-in">
                        <span>
                          <Button 
                            size="small" 
                            color="primary" 
                            disabled
                            startIcon={<Edit />}
                          >
                            Modify Booking
                          </Button>
                        </span>
                      </Tooltip>
                    )
                  )}
                  {canCancelBooking(booking) && (
                    <Button 
                      size="small" 
                      color="error" 
                      startIcon={<Cancel />}
                      onClick={() => openCancelDialog(booking)}
                    >
                      Cancel Booking
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

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="New Check-in Date"
                      value={newCheckInDate}
                      onChange={(date) => setNewCheckInDate(date)}
                      minDate={dayjs()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          helperText: `Current: ${BookingService.formatDate(selectedBooking.checkInDate)}`
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="New Check-out Date"
                      value={newCheckOutDate}
                      onChange={(date) => setNewCheckOutDate(date)}
                      minDate={newCheckInDate ? newCheckInDate.add(1, 'day') : dayjs().add(1, 'day')}
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
                        <MenuItem value="STANDARD">Standard Room</MenuItem>
                        <MenuItem value="DELUXE">Deluxe Room</MenuItem>
                        <MenuItem value="SUITE">Suite</MenuItem>
                        <MenuItem value="PRESIDENTIAL">Presidential Suite</MenuItem>
                      </Select>
                    </FormControl>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Current: {selectedBooking.roomType}
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
  );
};

export default MyBookings;
