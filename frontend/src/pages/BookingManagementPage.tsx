import React, { useState, useEffect, useCallback } from 'react';
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
  Chip
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

const BookingManagementPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const token = searchParams.get('token');

  const fetchBooking = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl(`/booking-management?token=${token}`));
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to load booking');
      }

      const bookingData = await response.json();
      setBooking(bookingData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setError('Invalid booking link. Please check your email for the correct link.');
      setLoading(false);
      return;
    }

    fetchBooking();
  }, [token, fetchBooking]);

  const handleCancelBooking = async () => {
    if (!token) return;

    try {
      const response = await fetch(buildApiUrl(`/booking-management?token=${token}`), {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to cancel booking');
      }

      // Get the updated booking data from the response
      const updatedBooking = await response.json();

      setCancelDialogOpen(false);
      setError(null);
      
      // Update the local booking state with the cancelled booking data
      setBooking(updatedBooking);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
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
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your booking...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={() => navigate('/')}>
          Return to Home
        </Button>
      </Container>
    );
  }

  if (!booking) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">
          Booking not found. Please check your email for the correct link.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Booking Details
          </Typography>
          <Chip
            label={booking.status}
            color={getStatusColor(booking.status) as any}
            sx={{ mb: 2 }}
          />
        </Box>

        <Grid container spacing={3}>
          {/* Booking Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <CalendarToday sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Stay Details
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Check-in:</strong> {formatDateForDisplay(booking.checkInDate)}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Check-out:</strong> {formatDateForDisplay(booking.checkOutDate)}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Total Amount:</strong> ETB {booking.totalAmount?.toFixed(0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Hotel Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Hotel sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Hotel Details
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Hotel:</strong> {booking.hotelName}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Room:</strong> {booking.roomType}
                </Typography>
                <Typography variant="body1">
                  <strong>Confirmation:</strong> #{booking.reservationId}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Guest Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Guest Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Name:</strong> {booking.guestName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <Email sx={{ mr: 1, verticalAlign: 'middle' }} />
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
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={() => setCancelDialogOpen(true)}
            >
              Cancel Booking
            </Button>
          </Box>
        )}
      </Paper>

      {/* Cancel Booking Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Keep Booking</Button>
          <Button onClick={handleCancelBooking} color="error" variant="contained">
            Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookingManagementPage;
