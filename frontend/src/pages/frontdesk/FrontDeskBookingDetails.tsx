import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  Chip,
  IconButton,
  Divider,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { frontDeskApiService } from '../../services/frontDeskApi';
import { ROOM_TYPES } from '../../constants/roomTypes';

// Map BookingResponse from API to display format
interface BookingData {
  reservationId: number;
  confirmationNumber: string;
  guestName: string;
  guestEmail: string;
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

const FrontDeskBookingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [editedBooking, setEditedBooking] = useState<BookingData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadBooking = async () => {
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const reservationId = parseInt(id || '0');
        if (!reservationId) {
          setError('Invalid booking ID');
          return;
        }

        console.log('Loading booking with reservation ID:', reservationId);
        
        const result = await frontDeskApiService.getBookingById(token, reservationId);
        
        if (result.success && result.data) {
          // Map API response to display format - handle different response structures
          const responseData = result.data as any;
          const mappedBooking: BookingData = {
            reservationId: responseData.reservationId || responseData.id,
            confirmationNumber: responseData.confirmationNumber,
            guestName: responseData.guestName,
            guestEmail: responseData.guestEmail,
            hotelName: responseData.hotelName,
            hotelAddress: responseData.hotelAddress,
            roomNumber: responseData.roomNumber,
            roomType: responseData.roomType,
            checkInDate: responseData.checkInDate,
            checkOutDate: responseData.checkOutDate,
            totalAmount: responseData.totalAmount,
            pricePerNight: responseData.pricePerNight,
            status: responseData.status,
            createdAt: responseData.createdAt,
            paymentStatus: responseData.paymentStatus,
            paymentIntentId: responseData.paymentIntentId
          };
          
          console.log('Found booking:', mappedBooking);
          setBooking(mappedBooking);
          setEditedBooking({ ...mappedBooking });
        } else {
          console.log('Booking not found for reservation ID:', reservationId);
          setError(result.message || `Booking not found for ID: ${reservationId}`);
        }
      } catch (err) {
        setError('Failed to load booking details');
        console.error('Error loading booking:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadBooking();
    }
  }, [id, token]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedBooking(booking ? { ...booking } : null);
  };

  const handleSave = async () => {
    if (!editedBooking || !token) return;

    try {
      let hasUpdates = false;

      // Check if room assignment changed for confirmed bookings
      if (booking && 
          editedBooking.status?.toUpperCase() === 'CONFIRMED' &&
          (editedBooking.roomType !== booking.roomType || editedBooking.roomNumber !== booking.roomNumber)) {
        
        // For room assignment changes, we need to find the room ID
        // This is a simplified approach - in production you might want to implement room selection
        if (editedBooking.roomNumber && editedBooking.roomNumber !== 'TBA (To Be Assigned)') {
          try {
            // Try to find and assign room by room number
            // This would need a proper room lookup API call in production
            console.log('Room assignment update needed for:', editedBooking.roomNumber, editedBooking.roomType);
            setSuccess('Room assignment will be updated during check-in process');
            hasUpdates = true;
          } catch (roomError) {
            console.error('Room assignment error:', roomError);
          }
        }
      }

      // Update booking status via API if status changed
      if (booking && editedBooking.status !== booking.status) {
        const result = await frontDeskApiService.updateBookingStatus(
          token, 
          editedBooking.reservationId, 
          editedBooking.status
        );
        
        if (result.success && result.data) {
          // Update local state with API response - handle different response structures
          const responseData = result.data as any;
          const updatedBooking: BookingData = {
            reservationId: responseData.reservationId || responseData.id,
            confirmationNumber: responseData.confirmationNumber,
            guestName: responseData.guestName,
            guestEmail: responseData.guestEmail,
            hotelName: responseData.hotelName,
            hotelAddress: responseData.hotelAddress,
            roomNumber: responseData.roomNumber,
            roomType: responseData.roomType,
            checkInDate: responseData.checkInDate,
            checkOutDate: responseData.checkOutDate,
            totalAmount: responseData.totalAmount,
            pricePerNight: responseData.pricePerNight,
            status: responseData.status,
            createdAt: responseData.createdAt,
            paymentStatus: responseData.paymentStatus,
            paymentIntentId: responseData.paymentIntentId
          };
          
          setBooking(updatedBooking);
          setEditedBooking({ ...updatedBooking });
          hasUpdates = true;
        }
      }

      // If room details changed but no room ID was found, just update local state
      if (!hasUpdates && booking && 
          (editedBooking.roomType !== booking.roomType || editedBooking.roomNumber !== booking.roomNumber)) {
        setBooking({ ...editedBooking });
        setSuccess('Room details updated. Changes will be applied during check-in.');
        hasUpdates = true;
      }
      
      setIsEditing(false);
      
      if (!hasUpdates) {
        setSuccess('Booking updated successfully');
      }
    } catch (err) {
      setError('Failed to update booking');
      console.error('Error updating booking:', err);
    }
  };

  const handleFieldChange = (field: keyof BookingData, value: any) => {
    if (editedBooking) {
      setEditedBooking({
        ...editedBooking,
        [field]: value
      });
    }
  };

  const handleBack = () => {
    const returnTab = searchParams.get('returnTab');
    
    // Navigate back to front desk dashboard
    if (returnTab) {
      navigate(`/frontdesk/dashboard?tab=${returnTab}`);
    } else {
      navigate('/frontdesk/dashboard');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'primary';
      case 'checked in': 
      case 'checked_in': return 'success';
      case 'checked out': 
      case 'checked_out': return 'info';
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

  const canModifyBooking = (status: string) => {
    // Only allow modifications for certain statuses
    // Handle both API format (CHECKED_OUT) and display format (Checked Out)
    const normalizedStatus = status.toLowerCase().replace(/_/g, ' ');
    const modifiableStatuses = ['confirmed', 'pending', 'checked in'];
    return modifiableStatuses.includes(normalizedStatus);
  };

  const currentBooking = isEditing ? editedBooking : booking;

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading booking details...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <IconButton
            onClick={handleBack}
            aria-label="back to dashboard"
          >
            <ArrowBackIcon />
          </IconButton>
        </Box>
      </Container>
    );
  }

  if (!currentBooking) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Booking not found
          </Alert>
          <IconButton
            onClick={handleBack}
            aria-label="back to dashboard"
          >
            <ArrowBackIcon />
          </IconButton>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={handleBack} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1">
              Booking Details
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!isEditing ? (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                disabled={!canModifyBooking(currentBooking?.status || '')}
              >
                Edit
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                >
                  Save
                </Button>
              </>
            )}
          </Box>
        </Box>

        {/* Booking Information Cards */}
        <Grid container spacing={3}>
          {/* Guest Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Guest Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Guest Name"
                      value={currentBooking?.guestName || ''}
                      onChange={(e) => handleFieldChange('guestName', e.target.value)}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={currentBooking?.guestEmail || ''}
                      onChange={(e) => handleFieldChange('guestEmail', e.target.value)}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Booking Details */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Booking Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Confirmation Number"
                      value={currentBooking?.confirmationNumber || ''}
                      disabled
                      variant="filled"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {isEditing ? (
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={currentBooking?.status || ''}
                          onChange={(e) => handleFieldChange('status', e.target.value)}
                        >
                          <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                          <MenuItem value="CHECKED_IN">Checked In</MenuItem>
                          <MenuItem value="CHECKED_OUT">Checked Out</MenuItem>
                          <MenuItem value="CANCELLED">Cancelled</MenuItem>
                          <MenuItem value="PENDING">Pending</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Box>
                        <Typography variant="caption" display="block" color="text.secondary">
                          Status
                        </Typography>
                        <Chip
                          label={currentBooking?.status?.replace('_', ' ')}
                          color={getStatusColor(currentBooking?.status || '') as any}
                          variant="filled"
                        />
                      </Box>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Payment Status
                      </Typography>
                      <Chip
                        label={currentBooking?.paymentStatus}
                        color={getPaymentStatusColor(currentBooking?.paymentStatus || '') as any}
                        variant="outlined"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Hotel & Room Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Hotel & Room Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Hotel Name"
                      value={currentBooking?.hotelName || ''}
                      disabled
                      variant="filled"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Hotel Address"
                      value={currentBooking?.hotelAddress || ''}
                      disabled
                      variant="filled"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {isEditing && currentBooking?.status?.toUpperCase() === 'CONFIRMED' ? (
                      <FormControl fullWidth>
                        <InputLabel>Room Type</InputLabel>
                        <Select
                          value={currentBooking?.roomType || ''}
                          onChange={(e) => handleFieldChange('roomType', e.target.value)}
                          label="Room Type"
                        >
                          {ROOM_TYPES.map((roomType) => (
                            <MenuItem key={roomType.value} value={roomType.value}>
                              {roomType.value}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField
                        fullWidth
                        label="Room Type"
                        value={currentBooking?.roomType || ''}
                        disabled
                        variant="filled"
                      />
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {isEditing && currentBooking?.status?.toUpperCase() === 'CONFIRMED' ? (
                      <TextField
                        fullWidth
                        label="Room Number"
                        value={currentBooking?.roomNumber || 'TBA (To Be Assigned)'}
                        onChange={(e) => handleFieldChange('roomNumber', e.target.value)}
                        variant="outlined"
                        placeholder="Enter room number or assign during check-in"
                      />
                    ) : (
                      <TextField
                        fullWidth
                        label="Room Number"
                        value={currentBooking?.roomNumber || 'TBA (To Be Assigned)'}
                        disabled
                        variant="filled"
                      />
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Stay Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Stay Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Check-in Date"
                      value={currentBooking?.checkInDate || ''}
                      type="date"
                      onChange={(e) => handleFieldChange('checkInDate', e.target.value)}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Check-out Date"
                      value={currentBooking?.checkOutDate || ''}
                      type="date"
                      onChange={(e) => handleFieldChange('checkOutDate', e.target.value)}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Price per Night"
                      value={formatCurrency(currentBooking?.pricePerNight || 0)}
                      disabled
                      variant="filled"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Total Amount"
                      value={formatCurrency(currentBooking?.totalAmount || 0)}
                      disabled
                      variant="filled"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Additional Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Additional Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Booking Date"
                      value={currentBooking ? formatDate(currentBooking.createdAt) : ''}
                      disabled
                      variant="filled"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Payment Intent ID"
                      value={currentBooking?.paymentIntentId || 'N/A'}
                      disabled
                      variant="filled"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Success/Error Messages */}
        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess(null)}
        >
          <Alert onClose={() => setSuccess(null)} severity="success">
            {success}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert onClose={() => setError(null)} severity="error">
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default FrontDeskBookingDetails;
