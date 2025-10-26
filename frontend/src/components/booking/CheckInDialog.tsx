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
} from '@mui/icons-material';
import { formatCurrency, formatCurrencyWithDecimals } from '../../utils/currencyUtils';
import { getRoomTypeLabel } from '../../constants/roomTypes';
import { frontDeskApiService } from '../../services/frontDeskApi';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { Booking, Room } from '../../types/booking-shared';
import { buildApiUrl } from '../../config/apiConfig';

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
  const { token, user } = useAuth();
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
  
  // Tax rates from hotel
  const [hotelVatRate, setHotelVatRate] = useState<number>(0);
  const [hotelServiceTaxRate, setHotelServiceTaxRate] = useState<number>(0);
  
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
      
      // Always use date-based availability check for check-in to prevent unavailable room selection
      // Get hotel ID from user (hotel-admin mode) or booking (front-desk mode)
      const rawHotelId = mode === 'hotel-admin' ? user?.hotelId : booking.hotelId;
      const hotelId = typeof rawHotelId === 'string' ? parseInt(rawHotelId, 10) : rawHotelId;
      
      if (!hotelId) {
        console.log('🏨 CheckInDialog: Early return - no hotelId available');
        setError('Hotel information not available for this booking');
        return;
      }

      console.log('🏨 CheckInDialog: Using date-aware room availability for hotel', hotelId);
      console.log('🏨 CheckInDialog: Booking dates:', {
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        checkInDateType: typeof booking.checkInDate,
        checkOutDateType: typeof booking.checkOutDate
      });
      
      result = await frontDeskApiService.getAvailableRoomsForCheckin(
        token, 
        hotelId, 
        tenant?.id || null,
        booking.checkInDate,
        booking.checkOutDate,
        2 // default guests - could be made configurable
      );

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
  }, [booking, token, tenant?.id, mode, user?.hotelId]);

  // Load available rooms when dialog opens
  useEffect(() => {
    console.log('🏨 CheckInDialog: useEffect triggered - open:', open, 'booking:', !!booking, 'token:', !!token);
    if (open && booking && token) {
      console.log('🏨 CheckInDialog: Calling loadAvailableRooms for booking:', booking.reservationId);
      loadAvailableRooms();
    }
  }, [open, booking, token, loadAvailableRooms]);

  // Fetch hotel tax rates when dialog opens
  useEffect(() => {
    const fetchTaxRates = async () => {
      if (!open || !booking) return;
      
      const rawHotelId = mode === 'hotel-admin' ? user?.hotelId : booking.hotelId;
      const hotelId = typeof rawHotelId === 'string' ? parseInt(rawHotelId, 10) : rawHotelId;
      
      if (!hotelId) {
        console.warn('⚠️ No hotel ID available for fetching tax rates');
        return;
      }
      
      try {
        console.log('🔍 Fetching tax rates for hotel ID:', hotelId);
        const response = await fetch(buildApiUrl(`/hotels/${hotelId}/tax-rate`), {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (response.ok) {
          const data = await response.json();
          setHotelVatRate(data.vatRate || 0);
          setHotelServiceTaxRate(data.serviceTaxRate || 0);
          console.log('✅ Tax rates loaded successfully:', {
            vatRate: data.vatRate,
            serviceTaxRate: data.serviceTaxRate,
            fullData: data
          });
        } else {
          console.error('❌ Failed to fetch tax rates, status:', response.status);
        }
      } catch (error) {
        console.error('❌ Error fetching tax rates:', error);
      }
    };
    
    fetchTaxRates();
  }, [open, booking, mode, user?.hotelId, token]);

  // Reset state when dialog opens or booking changes
  useEffect(() => {
    if (open && booking) {
      // For bookings with assigned rooms, find and pre-select that room for display purposes
      if (booking.roomNumber && availableRooms.length > 0) {
        const assignedRoom = availableRooms.find(room => room.roomNumber === booking.roomNumber);
        if (assignedRoom) {
          setSelectedRoomId(assignedRoom.id);
          setSelectedRoomType(assignedRoom.roomType);
          // Use the booking's original total since room hasn't changed
          // This prevents false price differences due to rounding or timing issues
          setCalculatedPricePerNight(assignedRoom.pricePerNight);
          setCalculatedTotal(booking.totalAmount);
        }
      } else {
        setSelectedRoomId(null);
        // Only set the room type if it exists in the available options
        const validRoomType = roomTypeOptions.includes(booking.roomType) ? booking.roomType : '';
        setSelectedRoomType(validRoomType);
        // Reset price only when no room is assigned
        setCalculatedTotal(0);
        setCalculatedPricePerNight(0);
      }
      
      // Initialize current room number state
      setCurrentRoomNumber(booking.roomNumber || null);
      setCurrentRoomType(booking.roomType || null);
      
      setError(null);
    }
  }, [open, booking, availableRooms, roomTypeOptions]);

  const handleRoomAssignment = async (roomId: number) => {
    if (!booking || !token) return;

    setError(null);

    try {
      // Find the assigned room details to get the room type and price
      const assignedRoom = availableRooms.find(room => room.id === roomId);
      
      // Update price immediately when room is selected (including taxes)
      if (assignedRoom) {
        const subtotal = assignedRoom.pricePerNight * nights;
        const vatAmount = subtotal * hotelVatRate;
        const serviceTaxAmount = subtotal * hotelServiceTaxRate;
        const totalWithTaxes = subtotal + vatAmount + serviceTaxAmount;
        
        setCalculatedPricePerNight(assignedRoom.pricePerNight);
        setCalculatedTotal(totalWithTaxes);
      }
      
      const result = await frontDeskApiService.updateBookingRoomAssignment(
        token,
        booking.reservationId,
        roomId,
        assignedRoom?.roomType || booking.roomType, // Use the selected room's type
        tenant?.id || null
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
        tenant?.id || null
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

  // Update calculated price when room selection or room type changes
  useEffect(() => {
    console.log('🔍 Price calculation useEffect triggered:', {
      selectedRoomId,
      selectedRoomType,
      availableRoomsCount: availableRooms.length,
      nights,
      vatRate: hotelVatRate,
      serviceTaxRate: hotelServiceTaxRate,
      bookingRoomNumber: booking?.roomNumber,
      bookingTotalAmount: booking?.totalAmount
    });

    if (selectedRoomId && availableRooms.length > 0) {
      // Specific room selected - use its exact price
      const selectedRoom = availableRooms.find(room => room.id === selectedRoomId);
      if (selectedRoom) {
        // Check if this is the originally assigned room
        const isOriginalRoom = booking?.roomNumber && selectedRoom.roomNumber === booking.roomNumber;
        
        console.log('🔍 Room comparison:', {
          selectedRoomNumber: selectedRoom.roomNumber,
          bookingRoomNumber: booking?.roomNumber,
          isOriginalRoom,
          bookingTotalAmount: booking?.totalAmount,
          willUseOriginalTotal: isOriginalRoom && booking?.totalAmount
        });
        
        if (isOriginalRoom && booking?.totalAmount) {
          // Use the original booking total to prevent false price differences
          console.log('✅ Using original booking total (room unchanged):', booking.totalAmount);
          setCalculatedPricePerNight(selectedRoom.pricePerNight);
          setCalculatedTotal(booking.totalAmount);
        } else {
          // Room changed or no original booking - calculate with current tax rates
          const subtotal = selectedRoom.pricePerNight * nights;
          const vatAmount = subtotal * hotelVatRate;
          const serviceTaxAmount = subtotal * hotelServiceTaxRate;
          const totalWithTaxes = subtotal + vatAmount + serviceTaxAmount;
          
          console.log('💰 Price calculation from selected room (room changed):', {
            roomNumber: selectedRoom.roomNumber,
            pricePerNight: selectedRoom.pricePerNight,
            nights,
            subtotal,
            vatRate: hotelVatRate,
            vatAmount,
            serviceTaxRate: hotelServiceTaxRate,
            serviceTaxAmount,
            totalWithTaxes
          });
          
          setCalculatedPricePerNight(selectedRoom.pricePerNight);
          setCalculatedTotal(totalWithTaxes);
        }
      }
    } else if (selectedRoomType && availableRooms.length > 0) {
      // Room type selected but no specific room - use first room of that type
      const roomsOfType = availableRooms.filter(room => room.roomType === selectedRoomType);
      console.log('🏨 Rooms of type', selectedRoomType, ':', roomsOfType.length);
      if (roomsOfType.length > 0) {
        const firstRoomOfType = roomsOfType[0];
        const subtotal = firstRoomOfType.pricePerNight * nights;
        const vatAmount = subtotal * hotelVatRate;
        const serviceTaxAmount = subtotal * hotelServiceTaxRate;
        const totalWithTaxes = subtotal + vatAmount + serviceTaxAmount;
        
        console.log('💰 Price calculation from room type:', {
          roomNumber: firstRoomOfType.roomNumber,
          pricePerNight: firstRoomOfType.pricePerNight,
          nights,
          subtotal,
          vatRate: hotelVatRate,
          vatAmount,
          serviceTaxRate: hotelServiceTaxRate,
          serviceTaxAmount,
          totalWithTaxes
        });
        
        setCalculatedPricePerNight(firstRoomOfType.pricePerNight);
        setCalculatedTotal(totalWithTaxes);
      } else {
        console.log('⚠️ No rooms found for type:', selectedRoomType);
        setCalculatedPricePerNight(0);
        setCalculatedTotal(0);
      }
    } else {
      console.log('🔄 Resetting price to 0');
      setCalculatedPricePerNight(0);
      setCalculatedTotal(0);
    }
  }, [selectedRoomId, selectedRoomType, availableRooms, nights, hotelVatRate, hotelServiceTaxRate, booking]);

  if (!booking) return null;

  // Use the booking's total amount (which already includes taxes) for comparison
  const originalTotal = booking.totalAmount;
  const priceDifference = calculatedTotal - originalTotal;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 4,
          zIndex: 9999,
          backgroundColor: 'white',
          boxShadow: '0 12px 40px rgba(21, 101, 192, 0.2)',
          border: '1px solid',
          borderColor: 'primary.main',
          overflow: 'hidden'
        }
      }}
      sx={{
        zIndex: 9999
      }}
    >
      <DialogTitle sx={{ 
        pb: 2,
        pt: 3,
        px: 3,
        background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #1976d2 100%)',
        color: 'white',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #42a5f5 0%, #1976d2 50%, #0d47a1 100%)',
        }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: '50%', 
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)'
          }}>
            <PersonIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ 
              color: 'white', 
              fontWeight: 700,
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              Check-in Guest
            </Typography>
            <Typography variant="subtitle2" sx={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              fontWeight: 400,
              mt: 0.5
            }}>
              Process guest check-in and room assignment
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ 
        p: 3, 
        backgroundColor: '#fafcff',
        backgroundImage: 'linear-gradient(135deg, #fafcff 0%, #f0f7ff 100%)'
      }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'error.light',
              '& .MuiAlert-icon': {
                color: 'error.main'
              }
            }}
          >
            {error}
          </Alert>
        )}

        {/* Guest Information */}
        <Paper elevation={0} sx={{ 
          p: 3, 
          mb: 3,
          border: '1px solid',
          borderColor: 'primary.main',
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f5f9ff 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 50%, #42a5f5 100%)',
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ 
              p: 1, 
              borderRadius: '50%', 
              backgroundColor: 'primary.main',
              color: 'white'
            }}>
              <PersonIcon fontSize="small" />
            </Box>
            <Typography variant="h6" sx={{ 
              color: 'primary.main',
              fontWeight: 700
            }}>
              Guest Information
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                Guest Name
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {booking.guestName}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                Email
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.primary' }}>
                {booking.guestEmail}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                Confirmation Number
              </Typography>
              <Chip 
                label={booking.confirmationNumber} 
                size="medium" 
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'primary.dark'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                Status
              </Typography>
              <Chip 
                label={booking.status} 
                size="medium" 
                sx={{
                  backgroundColor: 
                    booking.status === 'CONFIRMED' ? 'primary.main' :
                    booking.status === 'CHECKED_IN' ? 'success.main' :
                    booking.status === 'CHECKED_OUT' ? 'info.main' :
                    booking.status === 'CANCELLED' ? 'error.main' :
                    'warning.main',
                  color: 'white',
                  fontWeight: 600,
                  '&:hover': {
                    opacity: 0.8
                  }
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Assigned Room Information */}
        <Paper elevation={0} sx={{ 
          p: 3, 
          mb: 3,
          border: '1px solid',
          borderColor: 'primary.light',
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f5f9ff 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #66bb6a 0%, #42a5f5 50%, #1976d2 100%)',
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ 
              p: 1, 
              borderRadius: '50%', 
              backgroundColor: currentRoomNumber && currentRoomNumber !== 'To be assigned' ? 'success.main' : 'warning.main',
              color: 'white'
            }}>
              <RoomIcon fontSize="small" />
            </Box>
            <Typography variant="h6" sx={{ 
              color: 'primary.main',
              fontWeight: 700
            }}>
              Assigned Room
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            {currentRoomNumber && currentRoomNumber !== 'To be assigned' ? (
              <>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Room Number
                  </Typography>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 800, 
                    color: 'primary.main',
                    background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    Room {currentRoomNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Room Type
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {getRoomTypeLabel(currentRoomType || booking.roomType)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  {booking.status === 'CHECKED_IN' ? (
                    <Alert 
                      severity="info" 
                      sx={{ 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'info.light',
                        backgroundColor: 'rgba(33, 150, 243, 0.08)',
                        '& .MuiAlert-icon': {
                          color: 'info.main'
                        }
                      }}
                    >
                      <Typography sx={{ fontWeight: 600 }}>
                        <strong>Guest is checked in to Room {currentRoomNumber}.</strong>
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        You can select a different room from the available rooms below to automatically reassign if needed (maintenance issues, guest requests, etc.).
                      </Typography>
                    </Alert>
                  ) : (
                    <Alert 
                      severity="success" 
                      sx={{ 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'success.light',
                        backgroundColor: 'rgba(76, 175, 80, 0.08)',
                        '& .MuiAlert-icon': {
                          color: 'success.main'
                        }
                      }}
                    >
                      <Typography sx={{ fontWeight: 600 }}>
                        Room is assigned and ready for check-in.
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        You can select a different room from the available rooms below to automatically change the assignment.
                      </Typography>
                    </Alert>
                  )}
                </Grid>
              </>
            ) : (
              <Grid item xs={12}>
                <Alert 
                  severity="warning" 
                  sx={{ 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'warning.light',
                    backgroundColor: 'rgba(255, 152, 0, 0.08)',
                    '& .MuiAlert-icon': {
                      color: 'warning.main'
                    }
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }}>
                    No room assigned yet.
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    Please select a room from the available rooms below.
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Room Assignment */}
        <Paper elevation={0} sx={{ 
          p: 3, 
          mb: 3,
          border: '1px solid',
          borderColor: 'primary.light',
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f5f9ff 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 50%, #66bb6a 100%)',
          }
        }} data-testid="room-assignment-section">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ 
              p: 1, 
              borderRadius: '50%', 
              backgroundColor: 'primary.main',
              color: 'white'
            }}>
              <RoomIcon fontSize="small" />
            </Box>
            <Typography variant="h6" sx={{ 
              color: 'primary.main',
              fontWeight: 700
            }}>
              Room Assignment
            </Typography>
          </Box>
          
          {/* Room assignment interface - available for all bookings */}
          {booking.status === 'CHECKED_IN' && (
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'warning.light',
                backgroundColor: 'rgba(255, 152, 0, 0.08)',
                '& .MuiAlert-icon': {
                  color: 'warning.main'
                }
              }}
            >
              <Typography sx={{ fontWeight: 600 }}>
                <strong>Post Check-in Room Change:</strong> This guest is already checked in.
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Selecting a different room below will automatically reassign the guest to that room. 
                This should only be done in special circumstances (maintenance issues, guest requests, etc.).
              </Typography>
            </Alert>
          )}
          
          {loadingRooms ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress sx={{ color: 'primary.main' }} />
                </Box>
              ) : (
                <>
                  {/* Room Type Filter */}
                  <FormControl fullWidth margin="normal" sx={{ mb: 3 }}>
                    <InputLabel sx={{ 
                      color: 'primary.main',
                      fontWeight: 600,
                      '&.Mui-focused': {
                        color: 'primary.main'
                      }
                    }}>
                      Room Type
                    </InputLabel>
                    <Select
                      value={roomTypeOptions.includes(selectedRoomType) ? selectedRoomType : ''}
                      onChange={(e) => {
                        setSelectedRoomType(e.target.value);
                        // Note: Don't update currentRoomType here - it should only change when a room is actually assigned
                        setSelectedRoomId(null); // Reset room selection when type changes
                      }}
                      label="Room Type"
                      sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'primary.light',
                            borderWidth: 1
                          },
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: 1
                          }
                        }
                      }}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300,
                            zIndex: 9999,
                            backgroundColor: 'white',
                            boxShadow: '0 8px 32px rgba(21, 101, 192, 0.2)',
                            borderRadius: 12,
                            border: '1px solid #1976d2'
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
                      <MenuItem 
                        value=""
                        sx={{
                          backgroundColor: 'transparent',
                          '&:hover': {
                            backgroundColor: 'primary.light'
                          }
                        }}
                      >
                        All Room Types
                      </MenuItem>
                      {roomTypeOptions.map((roomType, index) => {
                        return (
                          <MenuItem 
                            key={roomType} 
                            value={roomType}
                            sx={{ 
                              backgroundColor: index % 2 === 0 ? 'rgba(25, 118, 210, 0.04)' : 'background.paper',
                              '&:hover': {
                                backgroundColor: 'primary.light'
                              },
                              '&.Mui-selected': {
                                backgroundColor: 'primary.main',
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: 'primary.dark'
                                }
                              }
                            }}
                          >
                            {getRoomTypeLabel(roomType)}
                          </MenuItem>
                        );
                      })}
                    </Select>
                    <Typography variant="caption" sx={{ 
                      color: 'primary.main', 
                      fontWeight: 600, 
                      mt: 1,
                      display: 'block'
                    }}>
                      Available: {roomTypeOptions.length} room types
                    </Typography>
                  </FormControl>              {/* Available Rooms */}
              <Typography variant="h6" sx={{ 
                mt: 2, 
                mb: 2,
                color: 'primary.main',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <RoomIcon fontSize="small" />
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
                <Box sx={{ maxHeight: '400px', overflowY: 'auto', pr: 1 }}>
                  {filteredRooms.map((room) => (
                    <Card 
                      key={room.id} 
                      variant="outlined" 
                      sx={{ 
                        mb: 2, 
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': { 
                          backgroundColor: 'rgba(25, 118, 210, 0.08)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 24px rgba(21, 101, 192, 0.15)',
                          borderColor: 'primary.main'
                        },
                        backgroundColor: selectedRoomId === room.id ? 'rgba(25, 118, 210, 0.12)' : 'transparent',
                        border: selectedRoomId === room.id ? 1 : 1,
                        borderColor: selectedRoomId === room.id ? 'primary.main' : 'primary.light',
                        borderRadius: 3,
                        position: 'relative',
                        overflow: 'hidden',
                        ...(selectedRoomId === room.id && {
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 50%, #42a5f5 100%)',
                          }
                        })
                      }}
                      onClick={() => {
                        setSelectedRoomId(room.id);
                        handleRoomAssignment(room.id);
                      }}
                    >
                      <CardContent sx={{ py: 2, px: 3 }}>
                        <FormControlLabel
                          value={room.id.toString()}
                          control={
                            <Radio 
                              sx={{
                                color: 'primary.light',
                                '&.Mui-checked': {
                                  color: 'primary.main',
                                },
                              }}
                            />
                          }
                          label={
                            <Box sx={{ ml: 1, width: '100%' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="h6" sx={{ 
                                  fontWeight: 700,
                                  color: selectedRoomId === room.id ? 'primary.main' : 'text.primary'
                                }}>
                                  Room {room.roomNumber}
                                </Typography>
                                <Chip 
                                  label={`${formatCurrency(room.pricePerNight || 0)}/night`} 
                                  size="small" 
                                  sx={{
                                    backgroundColor: selectedRoomId === room.id ? 'primary.main' : 'primary.light',
                                    color: selectedRoomId === room.id ? 'white' : 'primary.main',
                                    fontWeight: 600,
                                    '&:hover': {
                                      backgroundColor: 'primary.main',
                                      color: 'white'
                                    }
                                  }}
                                />
                              </Box>
                              <Typography variant="body1" sx={{ 
                                fontWeight: 600, 
                                color: 'primary.dark',
                                mb: 0.5 
                              }}>
                                {getRoomTypeLabel(room.roomType)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                Capacity: {room.capacity} guests • {room.description}
                              </Typography>
                            </Box>
                          }
                          sx={{ width: '100%', m: 0, alignItems: 'flex-start' }}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </RadioGroup>

              {filteredRooms.length === 0 && (
                <Alert 
                  severity="warning" 
                  sx={{ 
                    mt: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'warning.light',
                    backgroundColor: 'rgba(255, 152, 0, 0.08)',
                    '& .MuiAlert-icon': {
                      color: 'warning.main'
                    }
                  }}
                >
                  No available rooms found for the selected room type.
                </Alert>
              )}
              </>
            )}
        </Paper>

        {/* Price Summary */}
        {(selectedRoomId || (selectedRoomType && calculatedPricePerNight > 0)) && (
          <Paper elevation={0} sx={{ 
            p: 3,
            border: '1px solid',
            borderColor: 'success.light',
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f1f8e9 100%)',
            position: 'relative',
            overflow: 'hidden',
            mb: 3,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #66bb6a 0%, #4caf50 50%, #2e7d32 100%)',
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ 
                p: 1, 
                borderRadius: '50%', 
                backgroundColor: 'success.main',
                color: 'white'
              }}>
                <MoneyIcon fontSize="small" />
              </Box>
              <Typography variant="h6" sx={{ 
                color: 'success.dark',
                fontWeight: 700
              }}>
                Price Summary
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Price per Night
                </Typography>
                <Typography variant="h5" sx={{ 
                  fontWeight: 800,
                  color: 'success.main'
                }}>
                  {formatCurrency(calculatedPricePerNight)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Number of Nights
                </Typography>
                <Typography variant="h5" sx={{ 
                  fontWeight: 800,
                  color: 'success.main'
                }}>
                  {nights}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1, borderColor: 'success.light' }} />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1" color="text.secondary">
                    Subtotal
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatCurrencyWithDecimals(calculatedPricePerNight * nights)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    VAT ({(hotelVatRate * 100).toFixed(2)}%)
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatCurrencyWithDecimals(calculatedPricePerNight * nights * hotelVatRate)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Service Tax ({(hotelServiceTaxRate * 100).toFixed(2)}%)
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatCurrencyWithDecimals(calculatedPricePerNight * nights * hotelServiceTaxRate)}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2, borderColor: 'success.light' }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.dark' }}>
                    Total Amount
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'success.main' }}>
                    {formatCurrencyWithDecimals(calculatedTotal)}
                  </Typography>
                </Box>
              </Grid>
              
              {priceDifference !== 0 && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2, borderColor: 'success.light' }} />
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    backgroundColor: priceDifference > 0 ? 'rgba(244, 67, 54, 0.08)' : 'rgba(76, 175, 80, 0.08)',
                    border: '1px solid',
                    borderColor: priceDifference > 0 ? 'error.light' : 'success.light'
                  }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: priceDifference > 0 ? 'error.main' : 'success.main',
                        fontWeight: 700,
                        textAlign: 'center'
                      }}
                    >
                      Price {priceDifference > 0 ? 'Increase' : 'Decrease'}: 
                      {priceDifference > 0 ? '+' : ''}ETB {Math.abs(priceDifference).toFixed(0)}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 3,
        pt: 2,
        background: 'linear-gradient(135deg, #fafcff 0%, #f0f7ff 100%)',
        borderTop: '1px solid',
        borderColor: 'primary.light',
        gap: 2
      }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          variant="outlined"
          size="large"
          sx={{
            borderColor: 'primary.main',
            color: 'primary.main',
            borderWidth: 1,
            borderRadius: 2,
            px: 4,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem',
            '&:hover': {
              borderColor: 'primary.dark',
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
              borderWidth: 1
            },
            '&:disabled': {
              borderColor: '#e0e0e0',
              color: '#9e9e9e'
            }
          }}
        >
          Cancel
        </Button>
        
        {/* Check if guest is already checked in */}
        {booking.status === 'CHECKED_IN' ? (
          <Button
            onClick={handleClose}
            variant="contained"
            color="primary"
            disabled={loading}
            size="large"
            sx={{
              background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #1976d2 100%)',
              fontWeight: 700,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: '0 4px 16px rgba(21, 101, 192, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0a3d91 0%, #0d47a1 50%, #1565c0 100%)',
                boxShadow: '0 6px 20px rgba(21, 101, 192, 0.5)',
                transform: 'translateY(-2px)'
              },
              '&:active': {
                transform: 'translateY(0px)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Close
          </Button>
        ) : (
          <Button
            onClick={handleCheckIn}
            variant="contained"
            disabled={!currentRoomNumber || currentRoomNumber === 'To be assigned' || loading} // Enable only if room is assigned
            startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : null}
            size="large"
            sx={{
              background: !currentRoomNumber || currentRoomNumber === 'To be assigned' || loading 
                ? '#e0e0e0' 
                : 'linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #1976d2 100%)',
              color: !currentRoomNumber || currentRoomNumber === 'To be assigned' || loading ? '#9e9e9e' : 'white',
              fontWeight: 700,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: !currentRoomNumber || currentRoomNumber === 'To be assigned' || loading 
                ? 'none' 
                : '0 4px 16px rgba(21, 101, 192, 0.4)',
              '&:hover': !currentRoomNumber || currentRoomNumber === 'To be assigned' || loading ? {} : {
                background: 'linear-gradient(135deg, #0a3d91 0%, #0d47a1 50%, #1565c0 100%)',
                boxShadow: '0 6px 20px rgba(21, 101, 192, 0.5)',
                transform: 'translateY(-2px)'
              },
              '&:active': {
                transform: 'translateY(0px)'
              },
              '&:disabled': {
                background: '#e0e0e0',
                color: '#9e9e9e',
                boxShadow: 'none'
              },
              transition: 'all 0.2s ease-in-out'
            }}
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
                        Type: {getRoomTypeLabel(room.roomType)}
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
