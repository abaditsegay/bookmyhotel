import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import {
  Person as PersonIcon,
  Room as RoomIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { frontDeskApiService } from '../../services/frontDeskApi';
import { hotelAdminApi } from '../../services/hotelAdminApi';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { Booking, Room } from '../../types/booking-shared';

interface CheckInDialogProps {
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
  onCheckInSuccess: (updatedBooking: Booking) => void;
  mode?: 'front-desk' | 'hotel-admin'; // Add mode prop to determine which API to use
}

const CheckInDialog: React.FC<CheckInDialogProps> = ({
  open,
  onClose,
  booking,
  onCheckInSuccess,
  mode = 'front-desk', // Default to front-desk mode for backward compatibility
}) => {
  const { token } = useAuth();
  const { tenant } = useTenant();
  
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<string>('');
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calculatedTotal, setCalculatedTotal] = useState<number>(0);
  const [calculatedPricePerNight, setCalculatedPricePerNight] = useState<number>(0);
  const [roomTypeOptions, setRoomTypeOptions] = useState<string[]>([]);
  
  // Local state to track current room assignment for this dialog session
  const [currentRoomNumber, setCurrentRoomNumber] = useState<string | null>(null);
  const [currentRoomType, setCurrentRoomType] = useState<string | null>(null);
  
  // Room assignment dialog state
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [newRoomAssignment, setNewRoomAssignment] = useState<number | null>(null);

  // Calculate number of nights
  const calculateNights = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = booking ? calculateNights(booking.checkInDate, booking.checkOutDate) : 0;

  const loadAvailableRooms = useCallback(async () => {
    console.log('🏨 CheckInDialog: loadAvailableRooms called with:', {
      booking: !!booking,
      bookingId: booking?.reservationId,
      hotelId: booking?.hotelId,
      token: !!token,
      tenantId: tenant?.id,
      mode: mode
    });
    
    if (!booking || !token) {
      console.log('🏨 CheckInDialog: Early return - missing booking or token');
      return;
    }

    console.log('🏨 CheckInDialog: Loading rooms for mode:', mode);
    setLoadingRooms(true);
    setError(null);

    try {
      let result: any;
      
      if (mode === 'hotel-admin') {
        // For hotel-admin mode, use the hotel admin API to get available rooms
        console.log('🏨 CheckInDialog: Using hotel-admin API to get rooms');
        result = await hotelAdminApi.getHotelRooms(
          token,
          0, // page
          1000, // size - get all rooms
          undefined, // search
          undefined, // room number
          undefined, // room type
          'AVAILABLE' // only available rooms
        );
        
        // Transform hotel admin API response to match expected Room interface
        if (result.success && result.data?.content) {
          const rooms = result.data.content.map((room: any) => ({
            id: room.id,
            roomNumber: room.roomNumber,
            roomType: room.roomType,
            pricePerNight: room.pricePerNight || 0,
            isAvailable: room.isAvailable,
            hotelId: room.hotelId,
            capacity: room.capacity,
            description: room.description
          }));
          result.data = rooms;
        }
      } else {
        // For front-desk mode, use the front-desk API (requires hotelId)
        let hotelId = booking.hotelId;
        if (!hotelId && tenant?.id) {
          console.log('🏨 CheckInDialog: No hotelId in booking, using fallback for front-desk mode');
          hotelId = 1; // Temporary fallback
        }

        if (!hotelId) {
          console.log('🏨 CheckInDialog: Early return - no hotelId available for front-desk mode');
          setError('Hotel information not available for this booking');
          return;
        }

        console.log('🏨 CheckInDialog: Using front-desk API for hotel', hotelId);
        result = await frontDeskApiService.getAvailableRoomsForCheckin(
          token, 
          hotelId, 
          tenant?.id || 'default'
        );
      }

      console.log('🏨 CheckInDialog: Rooms API result:', result);

      if (result.success && result.data) {
        console.log('🏨 CheckInDialog: Available rooms:', result.data);
        setAvailableRooms(result.data);
        
        // Extract unique room types for the dropdown
        const uniqueRoomTypes = Array.from(new Set(result.data.map((room: Room) => room.roomType))) as string[];
        console.log('🏨 CheckInDialog: Room types found:', uniqueRoomTypes);
        setRoomTypeOptions(uniqueRoomTypes);
        
        // Only pre-select the original room type if it's available in the loaded options
        const validRoomType = uniqueRoomTypes.includes(booking.roomType) ? booking.roomType : '';
        console.log('🏨 CheckInDialog: Setting selected room type to:', validRoomType);
        setSelectedRoomType(validRoomType);
      } else {
        console.error('🏨 CheckInDialog: Failed to load rooms:', result.message);
        setError(result.message || 'Failed to load available rooms');
      }
    } catch (error) {
      console.error('🏨 CheckInDialog: Error loading rooms:', error);
      setError('Failed to load available rooms');
    } finally {
      setLoadingRooms(false);
    }
  }, [booking, token, tenant?.id, mode]);

  // Load available rooms when dialog opens
  useEffect(() => {
    console.log('🏨 CheckInDialog: useEffect triggered - open:', open, 'booking:', !!booking, 'token:', !!token);
    if (open && booking && token) {
      console.log('🏨 CheckInDialog: Calling loadAvailableRooms for booking:', booking.reservationId);
      loadAvailableRooms();
    }
  }, [open, booking, token, loadAvailableRooms]);

  // Reset state when dialog opens or booking changes
  useEffect(() => {
    if (open && booking) {
      // For bookings with assigned rooms, find and pre-select that room for display purposes
      if (booking.roomNumber && availableRooms.length > 0) {
        const assignedRoom = availableRooms.find(room => room.roomNumber === booking.roomNumber);
        if (assignedRoom) {
          setSelectedRoomId(assignedRoom.id);
          setSelectedRoomType(assignedRoom.roomType);
        }
      } else {
        setSelectedRoomId(null);
        // Only set the room type if it exists in the available options
        const validRoomType = roomTypeOptions.includes(booking.roomType) ? booking.roomType : '';
        setSelectedRoomType(validRoomType);
      }
      
      // Initialize current room number state
      setCurrentRoomNumber(booking.roomNumber || null);
      setCurrentRoomType(booking.roomType || null);
      
      setError(null);
      setCalculatedTotal(0);
      setCalculatedPricePerNight(0);
    }
  }, [open, booking, availableRooms, roomTypeOptions]);

  const handleRoomAssignment = async (roomId: number) => {
    if (!booking || !token) return;

    setError(null);

    try {
      // Find the assigned room details to get the room type
      const assignedRoom = availableRooms.find(room => room.id === roomId);
      
      const result = await frontDeskApiService.updateBookingRoomAssignment(
        token,
        booking.reservationId,
        roomId,
        assignedRoom?.roomType || booking.roomType, // Use the selected room's type
        tenant?.id || 'default'
      );

      if (result.success && result.data) {
        // Get the room number from the selected room (since we have the roomId)
        const assignedRoom = availableRooms.find(room => room.id === roomId);
        const newRoomNumber = assignedRoom?.roomNumber || null;
        const newRoomType = assignedRoom?.roomType || null;
        
        // Force state update
        setCurrentRoomNumber(newRoomNumber);
        setCurrentRoomType(newRoomType);
        setSelectedRoomId(roomId); // Keep the selection for consistency
        
        // Close any open dialogs
        setRoomDialogOpen(false);
        setNewRoomAssignment(null);
        
        // Clear any previous errors
        setError(null);
      } else {
        setError(result.message || 'Failed to assign room');
      }
    } catch (error) {
      setError('Failed to assign room');
    }
  };

  const handleCheckIn = async () => {
    if (!booking || !token) return;

    // For guests that are already checked in, just close the dialog
    if (booking.status === 'CHECKED_IN') {
      handleClose();
      return;
    }

    // For bookings with assigned rooms, proceed with check-in process
    if (!currentRoomNumber || currentRoomNumber === 'To be assigned') {
      setError('No room assigned. Please assign a room before checking in.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Find the assigned room details to get the room ID
      const assignedRoom = availableRooms.find(room => room.roomNumber === currentRoomNumber);
      const roomId = assignedRoom?.id || selectedRoomId; // Fallback to selectedRoomId if not found
      
      if (!roomId) {
        setError('Could not find assigned room details. Please refresh and try again.');
        setLoading(false);
        return;
      }

      const result = await frontDeskApiService.checkInWithRoomAssignment(
        token,
        booking.reservationId,
        roomId,
        currentRoomType || booking.roomType, // Use current room type if available
        tenant?.id || 'default'
      );

      if (result.success && result.data) {
        onCheckInSuccess(result.data);
        onClose();
      } else {
        setError(result.message || 'Failed to check-in guest');
      }
    } catch (error) {
      setError('Failed to check-in guest');
      console.error('Check-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedRoomId(null);
    setSelectedRoomType('');
    setCurrentRoomNumber(null);
    setCurrentRoomType(null);
    setError(null);
    setCalculatedTotal(0);
    setCalculatedPricePerNight(0);
    onClose();
  };

  const filteredRooms = availableRooms.filter(room => 
    selectedRoomType ? room.roomType === selectedRoomType : true
  );

  // Update calculated price when room selection changes
  useEffect(() => {
    if (selectedRoomId && availableRooms.length > 0) {
      const selectedRoom = availableRooms.find(room => room.id === selectedRoomId);
      if (selectedRoom) {
        setCalculatedPricePerNight(selectedRoom.pricePerNight);
        setCalculatedTotal(selectedRoom.pricePerNight * nights);
      }
    } else {
      setCalculatedPricePerNight(0);
      setCalculatedTotal(0);
    }
  }, [selectedRoomId, availableRooms, nights]);

  if (!booking) return null;

  const originalTotal = (booking.pricePerNight || booking.totalAmount / nights) * nights;
  const priceDifference = calculatedTotal - originalTotal;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          zIndex: 9999,
          backgroundColor: 'white',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }
      }}
      sx={{
        zIndex: 9999
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon color="primary" />
          <Typography variant="h6">Check-in Guest</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Guest Information */}
        <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon fontSize="small" />
            Guest Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Guest Name</Typography>
              <Typography variant="body1" fontWeight="medium">{booking.guestName}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Email</Typography>
              <Typography variant="body1">{booking.guestEmail}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Confirmation Number</Typography>
              <Chip label={booking.confirmationNumber} size="small" color="primary" />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Status</Typography>
              <Chip label={booking.status} size="small" color="warning" />
            </Grid>
          </Grid>
        </Paper>

        {/* Booking Details */}
        <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarIcon fontSize="small" />
            Booking Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">Check-in Date</Typography>
              <Typography variant="body1">{new Date(booking.checkInDate).toLocaleDateString()}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">Check-out Date</Typography>
              <Typography variant="body1">{new Date(booking.checkOutDate).toLocaleDateString()}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">Nights</Typography>
              <Typography variant="body1" fontWeight="medium">{nights} night{nights !== 1 ? 's' : ''}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Original Room Type</Typography>
              <Typography variant="body1">{booking.roomType}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Original Total</Typography>
              <Typography variant="body1">${originalTotal.toFixed(2)}</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Assigned Room Information */}
        <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RoomIcon fontSize="small" />
            Assigned Room
          </Typography>
          
          <Grid container spacing={2}>
            {currentRoomNumber && currentRoomNumber !== 'To be assigned' ? (
              <>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">Room Number</Typography>
                  <Typography variant="h6" color="primary.main">Room {currentRoomNumber}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">Room Type</Typography>
                  <Typography variant="body1">{currentRoomType || booking.roomType}</Typography>
                </Grid>
                <Grid item xs={12}>
                  {booking.status === 'CHECKED_IN' ? (
                    <Alert severity="info">
                      <strong>Guest is checked in to Room {currentRoomNumber}.</strong> You can select a different room from the available rooms below to automatically reassign if needed (maintenance issues, guest requests, etc.).
                    </Alert>
                  ) : (
                    <Alert severity="success">
                      Room is assigned and ready for check-in. You can select a different room from the available rooms below to automatically change the assignment.
                    </Alert>
                  )}
                </Grid>
              </>
            ) : (
              <Grid item xs={12}>
                <Alert severity="warning">
                  No room assigned yet. Please select a room from the available rooms below.
                </Alert>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Room Assignment */}
        <Paper elevation={1} sx={{ p: 2, mb: 2 }} data-testid="room-assignment-section">
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RoomIcon fontSize="small" />
            Room Assignment
          </Typography>
          
          {/* Room assignment interface - available for all bookings */}
          {booking.status === 'CHECKED_IN' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <strong>Post Check-in Room Change:</strong> This guest is already checked in. 
              Selecting a different room below will automatically reassign the guest to that room. 
              This should only be done in special circumstances (maintenance issues, guest requests, etc.).
            </Alert>
          )}
          
          {loadingRooms ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {/* Room Type Filter */}
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Room Type</InputLabel>
                    <Select
                      value={roomTypeOptions.includes(selectedRoomType) ? selectedRoomType : ''}
                      onChange={(e) => {
                        setSelectedRoomType(e.target.value);
                        // Note: Don't update currentRoomType here - it should only change when a room is actually assigned
                        setSelectedRoomId(null); // Reset room selection when type changes
                      }}
                      label="Room Type"
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300,
                            zIndex: 9999,
                            backgroundColor: 'white',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                          },
                        },
                        MenuListProps: {
                          style: {
                            backgroundColor: 'white',
                            zIndex: 9999
                          }
                        },
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'left',
                        },
                        transformOrigin: {
                          vertical: 'top',
                          horizontal: 'left',
                        },
                        disablePortal: true,
                        keepMounted: false
                      }}
                    >
                      <MenuItem value="">
                        All Room Types
                      </MenuItem>
                      {roomTypeOptions.map((roomType, index) => {
                        return (
                          <MenuItem 
                            key={roomType} 
                            value={roomType}
                            sx={{ 
                              backgroundColor: index % 2 === 0 ? 'grey.50' : 'background.paper' 
                            }}
                          >
                            {roomType} ({index + 1}/{roomTypeOptions.length})
                          </MenuItem>
                        );
                      })}
                </Select>
                <Typography variant="caption" color="text.secondary">
                  Available: {roomTypeOptions.length} room types
                </Typography>
              </FormControl>

              {/* Available Rooms */}
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Available Rooms ({filteredRooms.length})
              </Typography>
              
              <RadioGroup
                value={selectedRoomId?.toString() || ''}
                onChange={(e) => {
                  const roomId = Number(e.target.value);
                  setSelectedRoomId(roomId);
                  // Automatically update room assignment when room is selected
                  handleRoomAssignment(roomId);
                }}
              >
                <Box sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {filteredRooms.map((room) => (
                    <Card 
                      key={room.id} 
                      variant="outlined" 
                      sx={{ 
                        mb: 1, 
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'action.hover' },
                        backgroundColor: selectedRoomId === room.id ? 'action.selected' : 'transparent',
                        border: selectedRoomId === room.id ? 2 : 1,
                        borderColor: selectedRoomId === room.id ? 'primary.main' : 'divider'
                      }}
                      onClick={() => {
                        setSelectedRoomId(room.id);
                        handleRoomAssignment(room.id);
                      }}
                    >
                      <CardContent sx={{ py: 1 }}>
                        <FormControlLabel
                          value={room.id.toString()}
                          control={<Radio />}
                          label={
                            <Box sx={{ ml: 1, width: '100%' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle2">
                                  Room {room.roomNumber} - {room.roomType}
                                </Typography>
                                <Chip 
                                  label={`$${room.pricePerNight}/night`} 
                                  size="small" 
                                  color={selectedRoomId === room.id ? 'primary' : 'default'}
                                />
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                Capacity: {room.capacity} • {room.description}
                              </Typography>
                            </Box>
                          }
                          sx={{ width: '100%', m: 0 }}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </RadioGroup>

              {filteredRooms.length === 0 && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  No available rooms found for the selected room type.
                </Alert>
              )}
              </>
            )}
        </Paper>

        {/* Price Summary */}
        {selectedRoomId && (
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MoneyIcon fontSize="small" />
              Price Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">New Price per Night</Typography>
                <Typography variant="h6">${calculatedPricePerNight.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">New Total ({nights} nights)</Typography>
                <Typography variant="h6">${calculatedTotal.toFixed(2)}</Typography>
              </Grid>
              {priceDifference !== 0 && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: priceDifference > 0 ? 'error.main' : 'success.main',
                      fontWeight: 'medium'
                    }}
                  >
                    Price {priceDifference > 0 ? 'Increase' : 'Decrease'}: 
                    {priceDifference > 0 ? '+' : ''}${priceDifference.toFixed(2)}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        
        {/* Check if guest is already checked in */}
        {booking.status === 'CHECKED_IN' ? (
          <Button
            onClick={handleClose}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            Close
          </Button>
        ) : (
          <Button
            onClick={handleCheckIn}
            variant="contained"
            disabled={!currentRoomNumber || currentRoomNumber === 'To be assigned' || loading} // Enable only if room is assigned
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Checking In...' : 'Check In Guest'}
          </Button>
        )}
      </DialogActions>
      
      {/* Room Assignment Dialog */}
      <Dialog open={roomDialogOpen} onClose={() => setRoomDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RoomIcon color="primary" />
            <Typography variant="h6">Select Room for Assignment</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loadingRooms ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {filteredRooms.map((room) => (
                <Grid item xs={12} sm={6} md={4} key={room.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: newRoomAssignment === room.id ? '2px solid' : '1px solid',
                      borderColor: newRoomAssignment === room.id ? 'primary.main' : 'divider',
                      '&:hover': { borderColor: 'primary.main' }
                    }}
                    onClick={() => setNewRoomAssignment(room.id)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Room {room.roomNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Type: {room.roomType}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Capacity: {room.capacity} guests
                      </Typography>
                      <Typography variant="body1" color="primary.main" fontWeight="medium">
                        ${room.pricePerNight}/night
                      </Typography>
                      {room.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {room.description}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {filteredRooms.length === 0 && (
                <Grid item xs={12}>
                  <Alert severity="warning">
                    No available rooms found. Please try different dates or room type.
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRoomDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={() => newRoomAssignment && handleRoomAssignment(newRoomAssignment)}
            variant="contained"
            disabled={!newRoomAssignment || loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Assigning...' : 'Assign Room'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default CheckInDialog;
