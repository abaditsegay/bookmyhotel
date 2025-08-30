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
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<string>('');
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calculatedTotal, setCalculatedTotal] = useState<number>(0);
  const [calculatedPricePerNight, setCalculatedPricePerNight] = useState<number>(0);
  const [roomTypeOptions, setRoomTypeOptions] = useState<string[]>([]);

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

  const handleCheckIn = async () => {
    if (!booking || !selectedRoomId || !token) return;

    setLoading(true);
    setError(null);

    try {
      const result = await frontDeskApiService.checkInWithRoomAssignment(
        token,
        booking.reservationId,
        selectedRoomId,
        selectedRoomType,
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
    setError(null);
    setCalculatedTotal(0);
    setCalculatedPricePerNight(0);
    onClose();
  };

  const filteredRooms = availableRooms.filter(room => 
    selectedRoomType ? room.roomType === selectedRoomType : true
  );

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
        sx: { borderRadius: 2 }
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

        {/* Room Assignment */}
        <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RoomIcon fontSize="small" />
            Room Assignment
          </Typography>
          
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
                onChange={(e) => setSelectedRoomId(Number(e.target.value))}
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
                        backgroundColor: selectedRoomId === room.id ? 'action.selected' : 'transparent'
                      }}
                      onClick={() => setSelectedRoomId(room.id)}
                    >
                      <CardContent sx={{ py: 1 }}>
                        <FormControlLabel
                          value={room.id.toString()}
                          control={<Radio />}
                          label={
                            <Box sx={{ ml: 1 }}>
                              <Typography variant="subtitle2">
                                Room {room.roomNumber} - {room.roomType}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                ${room.pricePerNight}/night • Capacity: {room.capacity} • {room.description}
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
        <Button
          onClick={handleCheckIn}
          variant="contained"
          disabled={!selectedRoomId || loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Checking In...' : 'Check In Guest'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckInDialog;
