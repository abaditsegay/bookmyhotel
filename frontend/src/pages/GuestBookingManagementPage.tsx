import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  Event as EventIcon,
  Hotel as HotelIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAuthenticatedApi } from '../hooks/useAuthenticatedApi';

interface BookingData {
  reservationId: number;
  confirmationNumber: string;
  guestName: string;
  guestEmail: string;
  hotelName: string;
  hotelAddress: string;
  roomNumber: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  pricePerNight: number;
  status: string;
  createdAt: string;
  paymentStatus: string;
  paymentIntentId?: string;
}

const GuestBookingManagementPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hotelApiService } = useAuthenticatedApi();
  
  const initialBooking: BookingData = location.state?.booking;
  const [booking, setBooking] = useState<BookingData>(initialBooking);
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Modification form state
  const [modificationData, setModificationData] = useState({
    newCheckInDate: booking?.checkInDate || '',
    newCheckOutDate: booking?.checkOutDate || '',
    newSpecialRequests: '',
    guestName: booking?.guestName || '',
    guestPhone: '',
    reason: ''
  });
  
  // Cancellation form state
  const [cancellationReason, setCancellationReason] = useState('');

  if (!booking) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          No booking information available. Please search for your booking first.
        </Alert>
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            onClick={() => navigate('/guest-auth')}
          >
            Find My Booking
          </Button>
        </Box>
      </Container>
    );
  }

  const calculateNights = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'checked in': return 'info';
      case 'checked out': return 'default';
      default: return 'default';
    }
  };

  const canModifyBooking = () => {
    const checkInDate = new Date(booking.checkInDate);
    const now = new Date();
    const daysBefore = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    return booking.status.toLowerCase() === 'confirmed' && daysBefore >= 1;
  };

  const canCancelBooking = () => {
    const checkInDate = new Date(booking.checkInDate);
    const now = new Date();
    
    return booking.status.toLowerCase() === 'confirmed' && checkInDate > now;
  };

  const handleModifyBooking = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      
      const modificationRequest = {
        confirmationNumber: booking.confirmationNumber,
        guestEmail: booking.guestEmail,
        newCheckInDate: modificationData.newCheckInDate !== booking.checkInDate ? modificationData.newCheckInDate : undefined,
        newCheckOutDate: modificationData.newCheckOutDate !== booking.checkOutDate ? modificationData.newCheckOutDate : undefined,
        newSpecialRequests: modificationData.newSpecialRequests || undefined,
        guestName: modificationData.guestName !== booking.guestName ? modificationData.guestName : undefined,
        guestPhone: modificationData.guestPhone || undefined,
        reason: modificationData.reason
      };
      
      const response = await hotelApiService.modifyBooking(modificationRequest);
      
      if (response.success) {
        setSuccessMessage(response.message);
        setModifyDialogOpen(false);
        
        // Update booking state with the modified booking data
        if (response.updatedBooking) {
          setBooking({
            ...booking,
            checkInDate: response.updatedBooking.checkInDate,
            checkOutDate: response.updatedBooking.checkOutDate,
            totalAmount: response.updatedBooking.totalAmount,
            guestName: response.updatedBooking.guestName,
            // Update other fields as needed
          });
        }
      } else {
        setErrorMessage(response.message);
      }
    } catch (error) {
      setErrorMessage('Failed to modify booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      
      const cancellationRequest = {
        confirmationNumber: booking.confirmationNumber,
        guestEmail: booking.guestEmail,
        cancellationReason: cancellationReason
      };
      
      const response = await hotelApiService.cancelBookingGuest(cancellationRequest);
      
      if (response.success) {
        setSuccessMessage(response.message);
        setCancelDialogOpen(false);
        
        // Update booking state to reflect cancellation
        setBooking({
          ...booking,
          status: 'Cancelled'
        });
        
        // Clear cancellation reason
        setCancellationReason('');
      } else {
        setErrorMessage(response.message);
      }
    } catch (error) {
      setErrorMessage('Failed to cancel booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nights = calculateNights(booking.checkInDate, booking.checkOutDate);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Success/Error Messages */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      {/* Cancelled Booking Notice */}
      {booking.status.toLowerCase() === 'cancelled' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Booking Cancelled
          </Typography>
          <Typography variant="body2">
            This booking has been cancelled. If you need to make a new reservation, please visit our booking page.
            If you have questions about refunds, please contact the hotel directly.
          </Typography>
        </Alert>
      )}

      {/* Booking Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Manage Your Booking
            </Typography>
            <Typography variant="h6" color="primary">
              Confirmation: {booking.confirmationNumber}
            </Typography>
          </Box>
          <Chip
            label={booking.status}
            color={getStatusColor(booking.status) as any}
            variant="filled"
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setModifyDialogOpen(true)}
            disabled={!canModifyBooking()}
          >
            Modify Booking
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            onClick={() => setCancelDialogOpen(true)}
            disabled={!canCancelBooking()}
          >
            Cancel Booking
          </Button>
        </Box>

        {!canModifyBooking() && booking.status.toLowerCase() === 'confirmed' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Modifications must be made at least 24 hours before check-in.
          </Alert>
        )}
      </Paper>

      {/* Booking Details Accordion */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Booking Details</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Dates */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EventIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Stay Details</Typography>
                  </Box>
                  <Typography variant="body1">
                    <strong>Check-in:</strong> {formatDate(booking.checkInDate)}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Check-out:</strong> {formatDate(booking.checkOutDate)}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Duration:</strong> {nights} night{nights !== 1 ? 's' : ''}
                  </Typography>
                  <Typography variant="body1" color="primary">
                    <strong>Total Amount:</strong> ${booking.totalAmount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Hotel & Room */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <HotelIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Hotel & Room</Typography>
                  </Box>
                  <Typography variant="body1">
                    <strong>Hotel:</strong> {booking.hotelName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {booking.hotelAddress}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Room:</strong> {booking.roomNumber} ({booking.roomType})
                  </Typography>
                  <Typography variant="body1">
                    <strong>Rate:</strong> ${booking.pricePerNight}/night
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Guest Information */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Guest Information</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Name:</strong> {booking.guestName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Email:</strong> {booking.guestEmail}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Modification Dialog */}
      <Dialog open={modifyDialogOpen} onClose={() => setModifyDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Modify Your Booking</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Check-in Date"
                type="date"
                fullWidth
                value={modificationData.newCheckInDate}
                onChange={(e) => setModificationData({ ...modificationData, newCheckInDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Check-out Date"
                type="date"
                fullWidth
                value={modificationData.newCheckOutDate}
                onChange={(e) => setModificationData({ ...modificationData, newCheckOutDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: modificationData.newCheckInDate }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Guest Name"
                fullWidth
                value={modificationData.guestName}
                onChange={(e) => setModificationData({ ...modificationData, guestName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone Number"
                fullWidth
                value={modificationData.guestPhone}
                onChange={(e) => setModificationData({ ...modificationData, guestPhone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Special Requests"
                fullWidth
                multiline
                rows={3}
                value={modificationData.newSpecialRequests}
                onChange={(e) => setModificationData({ ...modificationData, newSpecialRequests: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Reason for Modification"
                fullWidth
                value={modificationData.reason}
                onChange={(e) => setModificationData({ ...modificationData, reason: e.target.value })}
                helperText="Optional: Help us understand why you're making changes"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModifyDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleModifyBooking}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <EditIcon />}
          >
            {loading ? 'Modifying...' : 'Modify Booking'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancellation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Your Booking</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Cancellation Policy:</strong><br />
              • More than 7 days before check-in: 100% refund<br />
              • 3-7 days before: 50% refund<br />
              • 1-2 days before: 25% refund<br />
              • Same day: No refund
            </Typography>
          </Alert>
          <TextField
            label="Reason for Cancellation"
            fullWidth
            multiline
            rows={3}
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            sx={{ mt: 2 }}
            helperText="Optional: Help us understand why you're cancelling"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Keep Booking</Button>
          <Button
            onClick={handleCancelBooking}
            variant="contained"
            color="error"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CancelIcon />}
          >
            {loading ? 'Cancelling...' : 'Cancel Booking'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
        {booking.status.toLowerCase() === 'cancelled' ? (
          <>
            <Button
              variant="contained"
              onClick={() => navigate('/hotels/search')}
            >
              Make New Booking
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/find-booking')}
            >
              Find Another Booking
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
            >
              Return Home
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outlined"
              onClick={() => navigate('/find-booking')}
            >
              Find Another Booking
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
            >
              Return Home
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
};

export default GuestBookingManagementPage;
