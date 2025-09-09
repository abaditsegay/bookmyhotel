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
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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

const BookingViewEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { token } = useAuth();
  
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [editedBooking, setEditedBooking] = useState<BookingData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Room selection state
  const [availableRooms, setAvailableRooms] = useState<RoomResponse[]>([]);
  const availableRoomTypes = ['SINGLE', 'DOUBLE', 'SUITE', 'DELUXE', 'PRESIDENTIAL'];
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [priceCalculating, setPriceCalculating] = useState(false);
  
  // New state for room type price calculation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        
        const result = await hotelAdminApi.getBookingById(token, reservationId);
        
        if (result.success && result.data) {
          // Map API response to display format
          const mappedBooking: BookingData = {
            reservationId: result.data.reservationId,
            confirmationNumber: result.data.confirmationNumber,
            guestName: result.data.guestName,
            guestEmail: result.data.guestEmail,
            hotelName: result.data.hotelName,
            hotelAddress: result.data.hotelAddress,
            roomNumber: result.data.roomNumber,
            roomType: result.data.roomType,
            checkInDate: result.data.checkInDate,
            checkOutDate: result.data.checkOutDate,
            totalAmount: result.data.totalAmount,
            pricePerNight: result.data.pricePerNight,
            status: result.data.status,
            createdAt: result.data.createdAt,
            paymentStatus: result.data.paymentStatus,
            paymentIntentId: result.data.paymentIntentId
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
    if (!editedBooking || !booking || !token) return;

    // Check if booking can be modified based on its status
    if (!canModifyBooking(booking.status)) {
      setError(`Cannot modify booking with status: ${booking.status}. Only confirmed, pending, or checked-in bookings can be modified.`);
      return;
    }

    try {
      setPriceCalculating(true);
      
      // Check what types of changes were made
      const statusChanged = editedBooking.status !== booking.status;
      const datesChanged = editedBooking.checkInDate !== booking.checkInDate || editedBooking.checkOutDate !== booking.checkOutDate;
      const nameChanged = editedBooking.guestName !== booking.guestName;
      const roomChanged = selectedRoomId !== null;
      
      const hasNonStatusChanges = datesChanged || nameChanged || roomChanged;
      
      // If only status changed, use the status update API
      if (statusChanged && !hasNonStatusChanges) {
        const result = await hotelAdminApi.updateBookingStatus(
          token,
          editedBooking.reservationId,
          editedBooking.status
        );
        
        if (result.success && result.data) {
          // Update local state with API response
          const apiBooking = result.data;
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
          setSuccess('Booking status updated successfully');
        } else {
          throw new Error(result.message || 'Failed to update booking status');
        }
      } 
      // For other changes, use the modification API
      else if (hasNonStatusChanges || statusChanged) {
        // Prepare modification request
        const modificationRequest: any = {
          // Required fields
          confirmationNumber: booking.confirmationNumber,
          guestEmail: booking.guestEmail
        };
        
        if (editedBooking.checkInDate !== booking.checkInDate) {
          modificationRequest.newCheckInDate = editedBooking.checkInDate;
        }
        
        if (editedBooking.checkOutDate !== booking.checkOutDate) {
          modificationRequest.newCheckOutDate = editedBooking.checkOutDate;
        }
        
        if (editedBooking.guestName !== booking.guestName) {
          modificationRequest.guestName = editedBooking.guestName;
        }
        
        if (selectedRoomId !== null) {
          modificationRequest.newRoomId = selectedRoomId;
        }
        
        modificationRequest.reason = 'Admin modification';

        // Call the comprehensive booking modification API
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
            message += ` (Refund amount: ETB ${(result.data.refundAmount * 55).toFixed(0)})`;
          }
          setSuccess(message);
        } else {
          throw new Error(result.message || 'Failed to modify booking');
        }
      }
      
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking');
      console.error('Error updating booking:', err);
    } finally {
      setPriceCalculating(false);
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
          
          if (checkOut > checkIn) {
            const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
            updatedBooking.totalAmount = updatedBooking.pricePerNight * nights;
          }
        }
      }
      
      // Handle room type change with automatic price calculation
      if (field === 'roomType') {
        // Clear room number when room type changes
        updatedBooking.roomNumber = '';
        setSelectedRoomId(null);
        
        // Load new pricing for the selected room type
        loadRoomTypePricing(value).then((pricing) => {
          if (pricing && editedBooking) {
            const newPricePerNight = pricing.basePricePerNight;
            const newTotal = calculateTotalWithRoomTypePricing(
              value, 
              editedBooking.checkInDate, 
              editedBooking.checkOutDate, 
              pricing
            );
            
            setEditedBooking({
              ...updatedBooking,
              pricePerNight: newPricePerNight,
              totalAmount: newTotal
            });
          } else {
            setEditedBooking(updatedBooking);
          }
        });
        
        return; // Exit early to prevent setting state twice
      }
      
      setEditedBooking(updatedBooking);
    }
  };

  const handleBack = () => {
    const returnTab = searchParams.get('returnTab');
    
    // Determine the correct dashboard based on current path
    if (location.pathname.startsWith('/hotel-admin')) {
      if (returnTab) {
        navigate(`/hotel-admin/dashboard?tab=${returnTab}`);
      } else {
        navigate('/hotel-admin/dashboard');
      }
    } else {
      // For admin context
      navigate('/admin');
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
    // Handle both API format (CHECKED_OUT) and display format (Checked Out)
    const normalizedStatus = status.toLowerCase().replace(/_/g, ' ');
    switch (normalizedStatus) {
      case 'confirmed': return 'success';
      case 'checked in': return 'primary';
      case 'checked out': return 'info';
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
          <IconButton onClick={handleBack} sx={{ mr: 1 }}>
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
          <IconButton onClick={handleBack} sx={{ mr: 1 }}>
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
                disabled={!booking || !canModifyBooking(booking.status)}
                title={booking && !canModifyBooking(booking.status) ? `Cannot edit booking with status: ${booking.status}` : undefined}
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
                      value={loadingRoomTypePricing ? 'Calculating...' : formatCurrency(currentBooking?.pricePerNight || 0)}
                      disabled
                      variant="filled"
                      InputProps={{
                        endAdornment: loadingRoomTypePricing ? <CircularProgress size={20} /> : undefined
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Total Amount"
                      value={loadingRoomTypePricing ? 'Calculating...' : formatCurrency(currentBooking?.totalAmount || 0)}
                      disabled
                      variant="filled"
                      InputProps={{
                        endAdornment: loadingRoomTypePricing ? <CircularProgress size={20} /> : undefined
                      }}
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

        {/* Room Selection Dialog */}
        <Dialog
          open={roomDialogOpen}
          onClose={() => setRoomDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Select Room
            {loadingRooms && (
              <CircularProgress size={20} sx={{ ml: 2 }} />
            )}
          </DialogTitle>
          <DialogContent>
            {availableRooms.length > 0 ? (
              <List>
                {availableRooms.map((room) => (
                  <ListItem key={room.id} disablePadding>
                    <ListItemButton onClick={() => handleRoomSelect(room)}>
                      <ListItemText
                        primary={`Room ${room.roomNumber} - ${room.roomType}`}
                        secondary={
                          <span>
                            <Typography component="span" variant="body2" color="text.primary">
                              ETB {(room.pricePerNight * 55).toFixed(0)}/night
                            </Typography>
                            {room.description && (
                              <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                                • {room.description}
                              </Typography>
                            )}
                            <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                              • Capacity: {room.capacity} guests
                            </Typography>
                          </span>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                {loadingRooms ? 'Loading available rooms...' : 'No available rooms found for the selected dates and room type.'}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRoomDialogOpen(false)}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

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

export default BookingViewEdit;
