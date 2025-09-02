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
import { useAuth } from '../../contexts/AuthContext';
import { Booking, Room } from '../../types/booking-shared';

interface CheckInDialogProps {
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
  onCheckInSuccess: (updatedBooking: Booking) => void;
}

const CheckInDialog: React.FC<CheckInDialogProps> = ({
  open,
  onClose,
  booking,
  onCheckInSuccess,
}) => {
  const { token } = useAuth();
  
  // Debug log
  useEffect(() => {
    console.log('CheckInDialog render state:', { open, booking: booking?.reservationId });
  }, [open, booking]);
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

  // Debug: Log state changes
  useEffect(() => {
    console.log('Current room number state changed:', currentRoomNumber);
  }, [currentRoomNumber]);

  // Calculate number of nights
  const calculateNights = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = booking ? calculateNights(booking.checkInDate, booking.checkOutDate) : 0;

  const loadAvailableRooms = useCallback(async () => {
    if (!booking || !token || !booking.hotelId) return;

    setLoadingRooms(true);
    setError(null);

    try {
      const result = await frontDeskApiService.getAvailableRoomsForCheckin(
        token, 
        booking.hotelId, 
        'default'
      );

      if (result.success && result.data) {
        setAvailableRooms(result.data);
        
        // Extract unique room types for the dropdown
        const uniqueRoomTypes = Array.from(new Set(result.data.map((room: Room) => room.roomType)));
        setRoomTypeOptions(uniqueRoomTypes);
        
        // Pre-select the original room type if available
        setSelectedRoomType(booking.roomType);
      } else {
        setError(result.message || 'Failed to load available rooms');
      }
    } catch (error) {
      setError('Failed to load available rooms');
      console.error('Error loading rooms:', error);
    } finally {
      setLoadingRooms(false);
    }
  }, [booking, token]);

  // Load available rooms when dialog opens
  useEffect(() => {
    if (open && booking && token) {
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
        setSelectedRoomType(booking.roomType); // Pre-select the original room type
      }
      
      // Initialize current room number state
      setCurrentRoomNumber(booking.roomNumber || null);
      setCurrentRoomType(booking.roomType || null);
      
      setError(null);
      setCalculatedTotal(0);
      setCalculatedPricePerNight(0);
    }
  }, [open, booking, availableRooms]);

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
        'default'
      );

      if (result.success && result.data) {
        console.log('Room assignment result:', result.data); // Debug log
        
        // Get the room number from the selected room (since we have the roomId)
        const assignedRoom = availableRooms.find(room => room.id === roomId);
        const newRoomNumber = assignedRoom?.roomNumber || null;
        const newRoomType = assignedRoom?.roomType || null;
        
        console.log('Assigned room found:', assignedRoom); // Debug log
        console.log('Setting current room number to:', newRoomNumber); // Debug log
        console.log('Setting current room type to:', newRoomType); // Debug log
        
        // Force state update
        setCurrentRoomNumber(newRoomNumber);
        setCurrentRoomType(newRoomType);
        setSelectedRoomId(roomId); // Keep the selection for consistency
        
        // Close any open dialogs
        setRoomDialogOpen(false);
        setNewRoomAssignment(null);
        
        // Clear any previous errors
        setError(null);
        
        // Force a re-render by updating a timestamp or counter
        console.log('Room assignment completed successfully');
      } else {
        console.error('Room assignment failed:', result); // Debug log
        setError(result.message || 'Failed to assign room');
      }
    } catch (error) {
      setError('Failed to assign room');
      console.error('Room assignment error:', error);
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
        'default'
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

        {/* Debug Info */}
        <Alert severity="info" sx={{ mb: 2 }}>
          Debug: Current Room Number = "{currentRoomNumber}" | Current Room Type = "{currentRoomType}" | Booking Room = "{booking?.roomNumber}" | Booking Room Type = "{booking?.roomType}" | Selected Room ID = {selectedRoomId}
        </Alert>

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
                      value={selectedRoomType}
                      onChange={(e) => {
                        setSelectedRoomType(e.target.value);
                        setSelectedRoomId(null); // Reset room selection when type changes
                      }}
                      label="Room Type"
                    >
                      <MenuItem value="">All Room Types</MenuItem>
                      {roomTypeOptions.map((roomType) => (
                    <MenuItem key={roomType} value={roomType}>
                      {roomType}
                    </MenuItem>
                  ))}
                </Select>
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
