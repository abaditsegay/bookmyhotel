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
  Checkbox,
  Snackbar
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
  numberOfGuests?: number;
  hotelName: string;
  hotelAddress: string;
  roomNumber?: string;
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
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
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
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateLong = (dateString: string) => {
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
    if (!emailAddress.trim() || !booking) {
      return;
    }

    try {
      setSendingEmail(true);
      await hotelApiService.sendBookingEmail(booking.reservationId, emailAddress, includeItinerary);
      setEmailDialogOpen(false);
      setSnackbarMessage('Email sent successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error sending email:', err);
      let errorMessage = 'Failed to send email. ';
      
      if (err instanceof Error) {
        if (err.message.includes('500')) {
          errorMessage += 'The server encountered an internal error. Please try again later.';
        } else if (err.message.includes('400')) {
          errorMessage += 'Invalid email address.';
        } else {
          errorMessage += 'Please try again later.';
        }
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!booking) return;
    
    try {
      setDownloadingPDF(true);
      await hotelApiService.downloadBookingPDF(booking.reservationId);
      setSnackbarMessage('PDF downloaded successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      let errorMessage = 'Failed to download PDF. ';
      
      if (err instanceof Error) {
        if (err.message.includes('500')) {
          errorMessage += 'The server encountered an internal error. Please try again later or contact support.';
        } else if (err.message.includes('404')) {
          errorMessage += 'PDF not found for this booking.';
        } else if (err.message.includes('401') || err.message.includes('403')) {
          errorMessage += 'You are not authorized to download this PDF.';
        } else {
          errorMessage += 'Please try again later.';
        }
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setDownloadingPDF(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={2} sx={{ p: 6, borderRadius: 3 }}>
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="400px">
            <CircularProgress size={80} thickness={4} sx={{ color: '#1976d2', mb: 4 }} />
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 2 }}>
              Loading booking confirmation...
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
              Please wait while we retrieve your booking details
            </Typography>
          </Box>
        </Paper>
      </Container>
    );
  }

  if (error || !booking) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={2} sx={{ p: 6, borderRadius: 3 }}>
          <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              {error || 'Booking not found'}
            </Typography>
            <Typography variant="body2">
              We couldn't find your booking information. Please check your confirmation number or try again.
            </Typography>
          </Alert>
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              startIcon={<HomeIcon />}
              size="large"
              sx={{ 
                px: 4, 
                py: 1.5,
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              }}
            >
              Return Home
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  const nights = calculateNights(booking.checkInDate, booking.checkOutDate);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Success Header */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          mb: 4, 
          textAlign: 'center', 
          background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
          color: 'white',
          borderRadius: 3
        }}
      >
        <CheckCircleIcon sx={{ fontSize: 60, mb: 2, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }} />
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 1.5 }}>
          Booking Confirmed!
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
          Your reservation has been successfully created
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            label={`Confirmation: ${booking.confirmationNumber}`}
            variant="filled"
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              color: 'white', 
              fontWeight: 'bold', 
              fontSize: '1.3rem',
              px: 3,
              py: 2,
              height: 'auto',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
              '& .MuiChip-label': {
                fontSize: '1.3rem',
                fontWeight: 'bold',
                padding: '8px 12px'
              }
            }}
          />
        </Box>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<EmailIcon />}
          onClick={() => setEmailDialogOpen(true)}
          sx={{ 
            px: 3, 
            py: 1.5,
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
            }
          }}
        >
          EMAIL CONFIRMATION
        </Button>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          sx={{ 
            px: 3, 
            py: 1.5,
            borderColor: '#1976d2',
            color: '#1976d2',
            '&:hover': {
              borderColor: '#1565c0',
              backgroundColor: 'rgba(25, 118, 210, 0.04)',
            }
          }}
        >
          PRINT
        </Button>
        <Button
          variant="outlined"
          startIcon={downloadingPDF ? <CircularProgress size={20} /> : <DownloadIcon />}
          onClick={handleDownloadPDF}
          disabled={downloadingPDF}
          sx={{ 
            px: 3, 
            py: 1.5,
            borderColor: '#1976d2',
            color: '#1976d2',
            '&:hover': {
              borderColor: '#1565c0',
              backgroundColor: 'rgba(25, 118, 210, 0.04)',
            },
            '&:disabled': {
              borderColor: '#ccc',
              color: '#ccc',
            }
          }}
        >
          {downloadingPDF ? 'DOWNLOADING...' : 'DOWNLOAD PDF'}
        </Button>
      </Box>

      {/* Booking Details */}
      <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              Booking Details
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', alignItems: 'flex-end' }}>
            <Chip
              label={booking.status.toUpperCase()}
              color={getStatusColor(booking.status) as any}
              variant="filled"
              sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
            />
            <Chip
              label={formatPaymentStatus(booking.paymentStatus)}
              color={getPaymentStatusColor(booking.paymentStatus) as any}
              variant="outlined"
              sx={{ fontWeight: '500' }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Quick Info Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={0}
              sx={{ 
                border: '2px solid #e3f2fd',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#1976d2',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 16px rgba(25, 118, 210, 0.1)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.9rem', fontWeight: '600', mb: 1 }}>
                  Check-in
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {formatDate(booking.checkInDate)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={0}
              sx={{ 
                border: '2px solid #e3f2fd',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#1976d2',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 16px rgba(25, 118, 210, 0.1)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.9rem', fontWeight: '600', mb: 1 }}>
                  Check-out
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {formatDate(booking.checkOutDate)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={0}
              sx={{ 
                border: '2px solid #e3f2fd',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#1976d2',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 16px rgba(25, 118, 210, 0.1)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.9rem', fontWeight: '600', mb: 1 }}>
                  Nights
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {nights}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={0}
              sx={{ 
                border: '2px solid #4caf50',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                background: 'linear-gradient(135deg, #f1f8e9 0%, #e8f5e8 100%)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 16px rgba(76, 175, 80, 0.2)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.9rem', fontWeight: '600', mb: 1 }}>
                  Total Amount
                </Typography>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                  ETB {booking.totalAmount?.toFixed(0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Detailed Information */}
        <Grid container spacing={4}>
          {/* Hotel Information */}
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', mb: 2 }}>
                Hotel Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {booking.hotelName}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {booking.hotelAddress}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Room Information */}
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', mb: 2 }}>
                Room Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Room Type:</strong> {booking.roomType}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Rate:</strong> ETB {booking.pricePerNight?.toFixed(0)}/night
                </Typography>
                <Typography variant="body1" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                  <strong>Room Assignment:</strong> Room will be assigned at check-in
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Guest Information */}
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', mb: 2 }}>
                Guest Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Name:</strong> {booking.guestName}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Email:</strong> {booking.guestEmail}
                </Typography>
                <Typography variant="body1">
                  <strong>Number of Guests:</strong> {booking.numberOfGuests || 1}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Booking Summary */}
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', mb: 2 }}>
                Booking Summary
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Booked on:</strong> {formatDateLong(booking.createdAt)}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Duration:</strong> {nights} night{nights !== 1 ? 's' : ''}
                </Typography>
                <Typography variant="body1">
                  <strong>Payment:</strong> {formatPaymentStatus(booking.paymentStatus)}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Important Information */}
      <Alert 
        severity="info" 
        sx={{ 
          mb: 4, 
          p: 3,
          borderRadius: 2,
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Important Information
        </Typography>
        <Box sx={{ '& > div': { mb: 1 } }}>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#1976d2', mr: 2, flexShrink: 0 }} />
            <strong>Your specific room number will be assigned at check-in</strong>
          </Typography>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#1976d2', mr: 2, flexShrink: 0 }} />
            Please bring a valid ID for check-in
          </Typography>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#1976d2', mr: 2, flexShrink: 0 }} />
            Check-in time: 3:00 PM | Check-out time: 11:00 AM
          </Typography>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#1976d2', mr: 2, flexShrink: 0 }} />
            For any changes or cancellations, please contact the hotel directly
          </Typography>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#1976d2', mr: 2, flexShrink: 0 }} />
            Keep your confirmation number for reference
          </Typography>
        </Box>
      </Alert>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          startIcon={<HomeIcon />}
          size="large"
          sx={{ 
            px: 4, 
            py: 1.5,
            background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1b5e20 0%, #0d4f14 100%)',
            }
          }}
        >
          Return Home
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/hotels/search')}
          startIcon={<SearchIcon />}
          size="large"
          sx={{ 
            px: 4, 
            py: 1.5,
            borderColor: '#1976d2',
            color: '#1976d2',
            '&:hover': {
              borderColor: '#1565c0',
              backgroundColor: 'rgba(25, 118, 210, 0.04)',
            }
          }}
        >
          Search More Hotels
        </Button>
      </Box>

      {/* Email Dialog */}
      <Dialog 
        open={emailDialogOpen} 
        onClose={() => setEmailDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            Email Booking Confirmation
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={includeItinerary}
                onChange={(e) => setIncludeItinerary(e.target.checked)}
                sx={{ color: '#1976d2' }}
              />
            }
            label="Include detailed itinerary"
            sx={{ mb: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setEmailDialogOpen(false)}
            sx={{ px: 3 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEmailBooking}
            variant="contained"
            disabled={!emailAddress.trim() || sendingEmail}
            startIcon={sendingEmail ? <CircularProgress size={20} /> : <EmailIcon />}
            sx={{ 
              px: 4,
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
              }
            }}
          >
            {sendingEmail ? 'Sending...' : 'Send Email'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default BookingConfirmationPage;
