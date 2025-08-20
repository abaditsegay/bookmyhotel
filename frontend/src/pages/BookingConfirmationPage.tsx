import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Download as DownloadIcon,
  Home as HomeIcon,
  Search as SearchIcon
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

const BookingConfirmationPage: React.FC = () => {
  const { reservationId } = useParams<{ reservationId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { hotelApiService } = useAuthenticatedApi();
  
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [includeItinerary, setIncludeItinerary] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  
  // Get booking data from location state if available (from successful booking)
  const locationBooking = location.state?.booking;
  const fromSearch = location.state?.fromSearch; // Flag indicating this came from search

  const fetchBookingData = useCallback(async () => {
    if (!reservationId) return;
    
    try {
      setLoading(true);
      const response = await hotelApiService.getBooking(Number(reservationId));
      setBooking(response);
      setEmailAddress(response.guestEmail);
    } catch (err) {
      setError('Failed to load booking details');
      console.error('Error fetching booking:', err);
    } finally {
      setLoading(false);
    }
  }, [reservationId, hotelApiService]);

  useEffect(() => {
    if (locationBooking) {
      // Use booking data from successful booking flow or search
      setBooking(locationBooking);
      setEmailAddress(locationBooking.guestEmail);
      setLoading(false);
    } else if (reservationId && !fromSearch) {
      // Only fetch booking data if not from search (to avoid auth issues for guests)
      fetchBookingData();
    } else {
      setError('No booking information available');
      setLoading(false);
    }
  }, [reservationId, locationBooking, fromSearch, fetchBookingData]);

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

  const formatPaymentStatus = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAY_AT_FRONTDESK': return 'Pay at Front Desk';
      case 'PAID': return 'Paid';
      case 'PENDING': return 'Pending';
      case 'FAILED': return 'Failed';
      case 'REFUNDED': return 'Refunded';
      default: return status;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmailBooking = async () => {
    if (!emailAddress.trim()) {
      return;
    }

    try {
      setSendingEmail(true);
      await hotelApiService.sendBookingEmail(booking!.reservationId, emailAddress, includeItinerary);
      setEmailDialogOpen(false);
      // Show success message
    } catch (err) {
      console.error('Error sending email:', err);
      // Show error message
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      await hotelApiService.downloadBookingPDF(booking!.reservationId);
    } catch (err) {
      console.error('Error downloading PDF:', err);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading booking confirmation...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error || !booking) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Booking not found'}
        </Alert>
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            startIcon={<HomeIcon />}
          >
            Return Home
          </Button>
        </Box>
      </Container>
    );
  }

  const nights = calculateNights(booking.checkInDate, booking.checkOutDate);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Success Header */}
      <Paper sx={{ p: 4, mb: 3, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
        <CheckCircleIcon sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Booking Confirmed!
        </Typography>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Your reservation has been successfully created
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            label={`Confirmation: ${booking.confirmationNumber}`}
            variant="filled"
            sx={{ bgcolor: 'success.dark', color: 'white', fontWeight: 'bold', fontSize: '1rem' }}
          />
        </Box>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<EmailIcon />}
          onClick={() => setEmailDialogOpen(true)}
        >
          Email Confirmation
        </Button>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
        >
          Print
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadPDF}
        >
          Download PDF
        </Button>
      </Box>

      {/* Booking Details */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h5" gutterBottom>
              Booking Details
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'flex-end' }}>
            <Chip
              label={booking.status}
              color={getStatusColor(booking.status) as any}
              variant="filled"
            />
            <Chip
              label={formatPaymentStatus(booking.paymentStatus)}
              color={getPaymentStatusColor(booking.paymentStatus) as any}
              variant="outlined"
              size="small"
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Quick Info Grid */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Check-in
                </Typography>
                <Typography variant="h6">
                  {formatDate(booking.checkInDate)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Check-out
                </Typography>
                <Typography variant="h6">
                  {formatDate(booking.checkOutDate)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Nights
                </Typography>
                <Typography variant="h6">
                  {nights}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Amount
                </Typography>
                <Typography variant="h6" color="primary">
                  ${booking.totalAmount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Detailed Information */}
        <Grid container spacing={3}>
          {/* Hotel Information */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Hotel Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {booking.hotelName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {booking.hotelAddress}
              </Typography>
            </Box>
          </Grid>

          {/* Room Information */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Room Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                <strong>Room:</strong> {booking.roomNumber}
              </Typography>
              <Typography variant="body1">
                <strong>Type:</strong> {booking.roomType}
              </Typography>
              <Typography variant="body1">
                <strong>Rate:</strong> ${booking.pricePerNight}/night
              </Typography>
            </Box>
          </Grid>

          {/* Guest Information */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Guest Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                <strong>Name:</strong> {booking.guestName}
              </Typography>
              <Typography variant="body1">
                <strong>Email:</strong> {booking.guestEmail}
              </Typography>
            </Box>
          </Grid>

          {/* Booking Summary */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Booking Summary
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                <strong>Booked on:</strong> {formatDate(booking.createdAt)}
              </Typography>
              <Typography variant="body1">
                <strong>Duration:</strong> {nights} night{nights !== 1 ? 's' : ''}
              </Typography>
              <Typography variant="body1">
                <strong>Payment:</strong> {formatPaymentStatus(booking.paymentStatus)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Important Information */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Important Information:</strong>
        </Typography>
        <Typography variant="body2">
          • Please bring a valid ID for check-in<br/>
          • Check-in time: 3:00 PM | Check-out time: 11:00 AM<br/>
          • For any changes or cancellations, please contact the hotel directly<br/>
          • Keep your confirmation number for reference
        </Typography>
      </Alert>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          startIcon={<HomeIcon />}
        >
          Return Home
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/hotels/search')}
          startIcon={<SearchIcon />}
        >
          Search More Hotels
        </Button>
      </Box>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Email Booking Confirmation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={includeItinerary}
                onChange={(e) => setIncludeItinerary(e.target.checked)}
              />
            }
            label="Include detailed itinerary"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleEmailBooking}
            variant="contained"
            disabled={!emailAddress.trim() || sendingEmail}
            startIcon={sendingEmail ? <CircularProgress size={20} /> : <EmailIcon />}
          >
            {sendingEmail ? 'Sending...' : 'Send Email'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookingConfirmationPage;
