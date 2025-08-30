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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Room as RoomIcon,
} from '@mui/icons-material';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { frontDeskApiService } from '../../services/frontDeskApi';
import { hotelAdminApi, RoomResponse } from '../../services/hotelAdminApi';

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

  // Room selection state (enhanced front-desk capabilities)
  const [availableRooms, setAvailableRooms] = useState<RoomResponse[]>([]);
  const availableRoomTypes = ['SINGLE', 'DOUBLE', 'SUITE', 'DELUXE', 'PRESIDENTIAL'];
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [priceCalculating, setPriceCalculating] = useState(false);
  
  // Room type pricing calculation state
  const [roomTypePricing, setRoomTypePricing] = useState<any>(null);
  const [loadingRoomTypePricing, setLoadingRoomTypePricing] = useState(false);

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
      setPriceCalculating(true);
      setError(null);
      
      // Handle comprehensive booking modifications (room changes, guest info, dates)
      if (booking && editedBooking) {
        const hasChanges = (
          editedBooking.guestName !== booking.guestName ||
          editedBooking.guestEmail !== booking.guestEmail ||
          editedBooking.roomType !== booking.roomType ||
          editedBooking.checkInDate !== booking.checkInDate ||
          editedBooking.checkOutDate !== booking.checkOutDate ||
          selectedRoomId !== null
        );
        
        if (hasChanges) {
          const modificationRequest: any = {
            guestName: editedBooking.guestName,
            guestEmail: editedBooking.guestEmail,
            roomType: editedBooking.roomType,
            checkInDate: editedBooking.checkInDate,
            checkOutDate: editedBooking.checkOutDate
          };
          
          if (selectedRoomId !== null) {
            modificationRequest.newRoomId = selectedRoomId;
          }
          
          modificationRequest.reason = 'Front desk modification';

          // Call the comprehensive booking modification API using hotel admin API for enhanced features
          const result = await hotelAdminApi.modifyBooking(
            token,
            editedBooking.reservationId,
            modificationRequest
          );
          
          if (result.success && result.data?.updatedBooking) {
            // Update local state with API response
            const apiBooking = result.data.updatedBooking;
            const updatedBooking: BookingData = {
              reservationId: apiBooking.reservationId,
              confirmationNumber: apiBooking.confirmationNumber,
              guestName: apiBooking.guestName,
              guestEmail: apiBooking.guestEmail,
              hotelName: apiBooking.hotelName,
              hotelAddress: apiBooking.hotelAddress,
              roomNumber: apiBooking.roomNumber,
              roomType: apiBooking.roomType,
              checkInDate: apiBooking.checkInDate,
              checkOutDate: apiBooking.checkOutDate,
              totalAmount: apiBooking.totalAmount,
              pricePerNight: apiBooking.pricePerNight,
              status: apiBooking.status,
              createdAt: apiBooking.createdAt,
              paymentStatus: apiBooking.paymentStatus,
              paymentIntentId: apiBooking.paymentIntentId
            };
            
            setBooking(updatedBooking);
            setEditedBooking({ ...updatedBooking });
            setSelectedRoomId(null);
            
            let message = 'Booking updated successfully';
            if (result.data.additionalCharges && result.data.additionalCharges > 0) {
              message += ` (Additional charges: $${result.data.additionalCharges})`;
            } else if (result.data.refundAmount && result.data.refundAmount > 0) {
              message += ` (Refund amount: $${result.data.refundAmount})`;
            }
            setSuccess(message);
          } else {
            throw new Error(result.message || 'Failed to modify booking');
          }
        } 
        
        // Handle status-only changes using front-desk API
        if (editedBooking.status !== booking.status && !hasChanges) {
          const statusResult = await frontDeskApiService.updateBookingStatus(
            token, 
            editedBooking.reservationId, 
            editedBooking.status
          );
          
          if (statusResult.success && statusResult.data) {
            const responseData = statusResult.data as any;
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
            setSuccess('Booking status updated successfully');
          }
        }
        
        setIsEditing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking');
      console.error('Error updating booking:', err);
    } finally {
      setPriceCalculating(false);
    }
  };

  const handleFieldChange = (field: keyof BookingData, value: any) => {
    if (editedBooking) {
      const updatedBooking = {
        ...editedBooking,
        [field]: value
      };
      
      // Recalculate total amount when dates change
      if (field === 'checkInDate' || field === 'checkOutDate') {
        const checkInDate = field === 'checkInDate' ? value : updatedBooking.checkInDate;
        const checkOutDate = field === 'checkOutDate' ? value : updatedBooking.checkOutDate;
        
        if (checkInDate && checkOutDate) {
          const checkIn = new Date(checkInDate);
          const checkOut = new Date(checkOutDate);
          if (checkIn < checkOut) {
            const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
            updatedBooking.totalAmount = updatedBooking.pricePerNight * nights;
          }
        }
      }
      
      setEditedBooking(updatedBooking);
    }
  };

  // Load available rooms for room selection
  const loadAvailableRooms = async (roomType?: string) => {
    if (!token || !editedBooking) return;

    try {
      setLoadingRooms(true);
      const selectedRoomType = roomType || editedBooking.roomType;
      const result = await hotelAdminApi.getHotelRooms(
        token,
        0, // page
        100, // size - get more rooms for selection
        '', // search
        '', // room number
        selectedRoomType, // filter by current or selected room type
        'AVAILABLE' // only available rooms
      );
      
      if (result.success && result.data) {
        setAvailableRooms(result.data.content);
      } else {
        setError('Failed to load available rooms');
      }
    } catch (err) {
      setError('Failed to load available rooms');
      console.error('Error loading rooms:', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  // Load room type pricing for automatic price calculation
  const loadRoomTypePricing = async (roomType: string) => {
    if (!token) return null;

    try {
      setLoadingRoomTypePricing(true);
      const result = await hotelAdminApi.getRoomTypePricing(token, roomType);
      
      if (result.success && result.data) {
        setRoomTypePricing(result.data);
        return result.data;
      } else {
        console.warn('No pricing found for room type:', roomType);
        return null;
      }
    } catch (err) {
      console.error('Error loading room type pricing:', err);
      return null;
    } finally {
      setLoadingRoomTypePricing(false);
    }
  };

  // Calculate total amount based on room type pricing
  const calculateTotalWithRoomTypePricing = (roomType: string, checkInDate: string, checkOutDate: string, pricing?: any) => {
    if (!pricing) return 0;
    
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    return pricing.basePricePerNight * nights;
  };

  // Handle room selection
  const handleRoomSelect = (room: RoomResponse) => {
    if (!editedBooking) return;
    
    setSelectedRoomId(room.id);
    
    // Calculate new total amount based on new price per night
    const checkIn = new Date(editedBooking.checkInDate);
    const checkOut = new Date(editedBooking.checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const newTotalAmount = room.pricePerNight * nights;
    
    setEditedBooking({
      ...editedBooking,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      pricePerNight: room.pricePerNight,
      totalAmount: newTotalAmount
    });
    setRoomDialogOpen(false);
  };

  // Open room selection dialog
  const handleSelectRoom = () => {
    if (!editedBooking?.roomType) {
      setError('Please select a room type first');
      return;
    }
    loadAvailableRooms(editedBooking.roomType);
    setRoomDialogOpen(true);
  };

  const canModifyBooking = (status: string) => {
    // Only allow modifications for certain statuses
    // Handle both API format (CHECKED_OUT) and display format (Checked Out)
    const normalizedStatus = status.toLowerCase().replace(/_/g, ' ');
    const modifiableStatuses = ['confirmed', 'pending', 'checked in'];
    return modifiableStatuses.includes(normalizedStatus);
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
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    // Handle both API format (CHECKED_OUT) and display format (Checked Out)
    const normalizedStatus = status.toLowerCase().replace(/_/g, ' ');
    switch (normalizedStatus) {
      case 'confirmed': return 'success';
      case 'checked in': return 'info';
      case 'checked out': return 'info';
      case 'cancelled': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'pay_at_frontdesk': return 'info';
      case 'failed': return 'error';
      case 'refunded': return 'info';
      default: return 'default';
    }
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
                disabled={!currentBooking || !canModifyBooking(currentBooking.status)}
                title={currentBooking && !canModifyBooking(currentBooking.status) ? `Cannot edit booking with status: ${currentBooking.status}` : undefined}
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
                    {isEditing ? (
                      <FormControl fullWidth>
                        <InputLabel>Room Type</InputLabel>
                        <Select
                          value={currentBooking?.roomType || ''}
                          onChange={(e) => {
                            handleFieldChange('roomType', e.target.value);
                            // Clear room number when room type changes
                            handleFieldChange('roomNumber', '');
                            setSelectedRoomId(null);
                          }}
                        >
                          {availableRoomTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type}
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
                    {isEditing ? (
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <TextField
                          fullWidth
                          label="Room Number"
                          value={currentBooking?.roomNumber || ''}
                          onChange={(e) => handleFieldChange('roomNumber', e.target.value)}
                          variant="outlined"
                          placeholder="Enter room number or select from available rooms"
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<RoomIcon />}
                          onClick={handleSelectRoom}
                          sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
                        >
                          Select Room
                        </Button>
                      </Box>
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
                  {isEditing && selectedRoomId && (
                    <Grid item xs={12}>
                      <Alert severity="info">
                        Room selection will be applied when you save the booking. 
                        {priceCalculating && ' Calculating price changes...'}
                      </Alert>
                    </Grid>
                  )}
                  {isEditing && loadingRoomTypePricing && (
                    <Grid item xs={12}>
                      <Alert severity="info">
                        Calculating new pricing for room type...
                      </Alert>
                    </Grid>
                  )}
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

        {/* Room Selection Dialog */}
        <Dialog 
          open={roomDialogOpen} 
          onClose={() => setRoomDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Select Available Room ({editedBooking?.roomType})
          </DialogTitle>
          <DialogContent>
            {loadingRooms ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : availableRooms.length === 0 ? (
              <Alert severity="warning" sx={{ mt: 2 }}>
                No available rooms found for this room type.
              </Alert>
            ) : (
              <List>
                {availableRooms.map((room) => (
                  <ListItem key={room.id} disablePadding>
                    <ListItemButton 
                      onClick={() => handleRoomSelect(room)}
                      sx={{ 
                        border: 1, 
                        borderColor: 'divider', 
                        mb: 1, 
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      <ListItemText
                        primary={`Room ${room.roomNumber}`}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Type: {room.roomType} | Price: ${room.pricePerNight}/night
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Status: {room.status}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRoomDialogOpen(false)}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default FrontDeskBookingDetails;
