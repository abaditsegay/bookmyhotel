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
  useTheme,
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
import { COLORS, addAlpha } from '../../theme/themeColors';

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
  const theme = useTheme();
  const primaryMain = theme.palette.primary.main;
  const primaryLight = theme.palette.primary.light;
  const primaryDark = theme.palette.primary.dark;
  const successMain = theme.palette.success.main;
  const warningMain = theme.palette.warning.main;
  const infoMain = theme.palette.info.main;
  const errorMain = theme.palette.error.main;
  
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
    // console.log('🏨 CheckInDialog: loadAvailableRooms called with:', {
    //   booking: !!booking,
    //   bookingId: booking?.reservationId,
    //   hotelId: booking?.hotelId,
    //   token: !!token,
    //   tenantId: tenant?.id,
    //   mode: mode
    // });
    
    if (!booking || !token) {
      // console.log('🏨 CheckInDialog: Early return - missing booking or token');
      return;
    }

    // console.log('🏨 CheckInDialog: Loading rooms for mode:', mode);
    setLoadingRooms(true);
    setError(null);

    try {
      let result: any;
      
      // Always use date-based availability check for check-in to prevent unavailable room selection
      // Get hotel ID from user (hotel-admin mode) or booking (front-desk mode)
      const rawHotelId = mode === 'hotel-admin' ? user?.hotelId : booking.hotelId;
      const hotelId = typeof rawHotelId === 'string' ? parseInt(rawHotelId, 10) : rawHotelId;
      
      if (!hotelId) {
        // console.log('🏨 CheckInDialog: Early return - no hotelId available');
        setError('Hotel information not available for this booking');
        return;
      }

      // console.log('🏨 CheckInDialog: Using date-aware room availability for hotel', hotelId);
      // console.log('🏨 CheckInDialog: Booking dates:', {
      //   checkInDate: booking.checkInDate,
      //   checkOutDate: booking.checkOutDate,
      //   checkInDateType: typeof booking.checkInDate,
      //   checkOutDateType: typeof booking.checkOutDate
      // });
      
      result = await frontDeskApiService.getAvailableRoomsForCheckin(
        token, 
        hotelId, 
        tenant?.id || null,
        booking.checkInDate,
        booking.checkOutDate,
        2 // default guests - could be made configurable
      );

      // console.log('🏨 CheckInDialog: Rooms API result:', result);

      if (result.success && result.data) {
        // console.log('🏨 CheckInDialog: Available rooms:', result.data);
        setAvailableRooms(result.data);
        
        // Extract unique room types for the dropdown
        const uniqueRoomTypes = Array.from(new Set(result.data.map((room: Room) => room.roomType))) as string[];
        // console.log('🏨 CheckInDialog: Room types found:', uniqueRoomTypes);
        setRoomTypeOptions(uniqueRoomTypes);
        
        // Only pre-select the original room type if it's available in the loaded options
        const validRoomType = uniqueRoomTypes.includes(booking.roomType) ? booking.roomType : '';
        // console.log('🏨 CheckInDialog: Setting selected room type to:', validRoomType);
        setSelectedRoomType(validRoomType);
      } else {
        // console.error('🏨 CheckInDialog: Failed to load rooms:', result.message);
        setError(result.message || 'Failed to load available rooms');
      }
    } catch (error) {
      // console.error('🏨 CheckInDialog: Error loading rooms:', error);
      setError('Failed to load available rooms');
    } finally {
      setLoadingRooms(false);
    }
  }, [booking, token, tenant?.id, mode, user?.hotelId]);

  // Load available rooms when dialog opens
  useEffect(() => {
    // console.log('🏨 CheckInDialog: useEffect triggered - open:', open, 'booking:', !!booking, 'token:', !!token);
    if (open && booking && token) {
      // console.log('🏨 CheckInDialog: Calling loadAvailableRooms for booking:', booking.reservationId);
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
        // console.warn('⚠️ No hotel ID available for fetching tax rates');
        return;
      }
      
      try {
        // console.log('🔍 Fetching tax rates for hotel ID:', hotelId);
        const response = await fetch(buildApiUrl(`/hotels/${hotelId}/tax-rate`), {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (response.ok) {
          const data = await response.json();
          setHotelVatRate(data.vatRate || 0);
          setHotelServiceTaxRate(data.serviceTaxRate || 0);
          // console.log('✅ Tax rates loaded successfully:', {
          //   vatRate: data.vatRate,
          //   serviceTaxRate: data.serviceTaxRate,
          //   fullData: data
          // });
        } else {
          // console.error('❌ Failed to fetch tax rates, status:', response.status);
        }
      } catch (error) {
        // console.error('❌ Error fetching tax rates:', error);
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
          // IMPORTANT: Always use the booking's original total when a room is already assigned
          // The backend stores totalAmount as SUBTOTAL ONLY (without taxes)
          setCalculatedPricePerNight(assignedRoom.pricePerNight);
          setCalculatedTotal(booking.totalAmount);
        }
      } else {
        setSelectedRoomId(null);
        // Only set the room type if it exists in the available options
        const validRoomType = roomTypeOptions.includes(booking.roomType) ? booking.roomType : '';
        setSelectedRoomType(validRoomType);
        // IMPORTANT: Use the original booking total, not recalculated
        // The backend stores totalAmount as SUBTOTAL ONLY (without taxes)
        setCalculatedTotal(booking.totalAmount);
        setCalculatedPricePerNight(booking.pricePerNight || 0);
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
      
      // Update price immediately when room is selected
      // IMPORTANT: Backend stores totalAmount as SUBTOTAL ONLY (without taxes)
      // Taxes are calculated at checkout, NOT during check-in
      if (assignedRoom) {
        const subtotal = assignedRoom.pricePerNight * nights;
        
        setCalculatedPricePerNight(assignedRoom.pricePerNight);
        setCalculatedTotal(subtotal); // Store subtotal only, no taxes
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
      // First priority: use assignedRoomId if the room was pre-assigned (e.g., walk-in booking)
      let roomId = booking.assignedRoomId;
      
      // Second priority: find the room in availableRooms or use selectedRoomId
      if (!roomId) {
        const assignedRoom = availableRooms.find(room => room.roomNumber === currentRoomNumber);
        roomId = assignedRoom?.id || (selectedRoomId !== null ? selectedRoomId : undefined);
      }
      
      // Last resort: reload rooms to find the assigned room
      if (!roomId && currentRoomNumber) {
        try {
          // Get hotel ID
          const rawHotelId = mode === 'hotel-admin' ? user?.hotelId : booking.hotelId;
          const hotelId = typeof rawHotelId === 'string' ? parseInt(rawHotelId, 10) : rawHotelId;
          
          if (hotelId) {
            // Reload available rooms for the booking dates to include the assigned room
            const reloadResult = await frontDeskApiService.getAvailableRoomsForCheckin(
              token,
              hotelId,
              tenant?.id || null,
              booking.checkInDate,
              booking.checkOutDate,
              2
            );
            
            if (reloadResult.success && reloadResult.data) {
              const foundRoom = reloadResult.data.find((room: Room) => room.roomNumber === currentRoomNumber);
              if (foundRoom) {
                roomId = foundRoom.id;
              }
            }
          }
        } catch (fetchError) {
          // Room detail reload failed; proceed with available room info
        }
      }
      
      if (!roomId) {
        setError('Could not find assigned room details. The room may have been deleted or is not available for these dates. Please assign a different room.');
        setLoading(false);
        return;
      }

      const result = await frontDeskApiService.checkInWithRoomAssignment(
        token,
        booking.reservationId,
        roomId,
        currentRoomType || booking.roomType,
        tenant?.id || null
      );

      if (result.success && result.data) {
        // Find the room object to get complete room details
        const assignedRoom = availableRooms.find(room => room.id === roomId);
        
        // Ensure the updated booking includes the current room number and type
        const updatedBooking = {
          ...result.data,
          roomNumber: currentRoomNumber || assignedRoom?.roomNumber || result.data.roomNumber,
          roomType: currentRoomType || assignedRoom?.roomType || result.data.roomType,
          assignedRoom: currentRoomNumber // Add this for display purposes
        };
        
        onCheckInSuccess(updatedBooking);
        onClose();
      } else {
        setError(result.message || 'Failed to check-in guest');
      }
    } catch (error) {
      setError('Failed to check-in guest');
      // console.error('Check-in error:', error);
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
    // console.log('🔍 Price calculation useEffect triggered:', {
    //   selectedRoomId,
    //   selectedRoomType,
    //   availableRoomsCount: availableRooms.length,
    //   nights,
    //   vatRate: hotelVatRate,
    //   serviceTaxRate: hotelServiceTaxRate,
    //   bookingRoomNumber: booking?.roomNumber,
    //   bookingTotalAmount: booking?.totalAmount
    // });

    // IMPORTANT: Backend stores totalAmount as SUBTOTAL ONLY (no taxes included)
    // When checking in, we should ALWAYS use the original booking's totalAmount
    // unless the user explicitly changes to a DIFFERENT room type

    if (selectedRoomId && availableRooms.length > 0) {
      // Specific room selected - check if room type changed
      const selectedRoom = availableRooms.find(room => room.id === selectedRoomId);
      if (selectedRoom) {
        // Check if room type is different from original booking
        const roomTypeChanged = booking?.roomType && selectedRoom.roomType !== booking.roomType;
        
        // console.log('🔍 Room selection:', {
        //   selectedRoomNumber: selectedRoom.roomNumber,
        //   selectedRoomType: selectedRoom.roomType,
        //   bookingRoomType: booking?.roomType,
        //   roomTypeChanged,
        //   bookingTotalAmount: booking?.totalAmount,
        //   willUseOriginalTotal: !roomTypeChanged && booking?.totalAmount
        // });
        
        if (!roomTypeChanged && booking?.totalAmount) {
          // Room type is the same - use original booking total (no recalculation)
          // console.log('✅ Using original booking total (same room type):', booking.totalAmount);
          setCalculatedPricePerNight(selectedRoom.pricePerNight);
          setCalculatedTotal(booking.totalAmount);
        } else {
          // Room type changed - recalculate price WITHOUT taxes (to match backend)
          // Backend stores totalAmount as subtotal only
          const subtotal = selectedRoom.pricePerNight * nights;
          
          // console.log('💰 Price calculation (room type changed):', {
          //   roomNumber: selectedRoom.roomNumber,
          //   roomType: selectedRoom.roomType,
          //   pricePerNight: selectedRoom.pricePerNight,
          //   nights,
          //   subtotal
          // });
          
          setCalculatedPricePerNight(selectedRoom.pricePerNight);
          setCalculatedTotal(subtotal);
        }
      }
    } else if (selectedRoomType && availableRooms.length > 0) {
      // Room type selected but no specific room
      // Check if this is the same room type as the original booking
      const roomTypeChanged = booking?.roomType && selectedRoomType !== booking.roomType;
      
      if (!roomTypeChanged && booking?.totalAmount) {
        // Same room type - use original booking total
        const originalPricePerNight = booking.pricePerNight || (booking.totalAmount / nights);
        setCalculatedPricePerNight(originalPricePerNight);
        setCalculatedTotal(booking.totalAmount);
      } else {
        // Room type changed but no specific room selected yet
        // Don't calculate price - wait for room selection
        setCalculatedPricePerNight(0);
        setCalculatedTotal(0);
      }
    } else {
      // console.log('🔄 Resetting price to original or 0');
      if (booking?.totalAmount) {
        setCalculatedTotal(booking.totalAmount);
        setCalculatedPricePerNight(booking.pricePerNight || 0);
      } else {
        setCalculatedPricePerNight(0);
        setCalculatedTotal(0);
      }
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
          backgroundColor: 'background.paper',
          boxShadow: `0 12px 40px ${addAlpha(COLORS.SECONDARY, 0.2)}`,
          border: '1px solid',
          borderColor: COLORS.SECONDARY,
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
        background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryDark} 50%, ${primaryMain} 100%)`,
        color: COLORS.WHITE,
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${primaryMain} 0%, ${primaryDark} 50%, ${primaryMain} 100%)`,
        }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: '50%', 
            backgroundColor: addAlpha(COLORS.WHITE, 0.15),
            backdropFilter: 'blur(10px)'
          }}>
            <PersonIcon sx={{ color: COLORS.WHITE, fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ 
              color: COLORS.WHITE, 
              fontWeight: 700,
              textShadow: `0 2px 4px ${addAlpha(COLORS.BLACK, 0.2)}`
            }}>
              Check-in Guest
            </Typography>
            <Typography variant="subtitle2" sx={{ 
              color: addAlpha(COLORS.WHITE, 0.8), 
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
        backgroundColor: COLORS.BG_LIGHT,
        backgroundImage: `linear-gradient(135deg, ${COLORS.BG_PAPER} 0%, ${COLORS.BG_LIGHT} 100%)`
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
          borderColor: 'primary.light',
          borderRadius: 3,
          background: `linear-gradient(135deg, ${COLORS.BG_PAPER} 0%, ${COLORS.BG_LIGHT} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${primaryDark} 0%, ${primaryMain} 50%, ${primaryDark} 100%)`,
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ 
              p: 1, 
              borderRadius: '50%', 
              backgroundColor: 'primary.main',
              color: COLORS.WHITE
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
                  color: COLORS.WHITE,
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
                    booking.status === 'BOOKED' ? 'primary.main' :
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
          background: `linear-gradient(135deg, ${COLORS.BG_PAPER} 0%, ${COLORS.BG_LIGHT} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${successMain} 0%, ${primaryDark} 50%, ${primaryMain} 100%)`,
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ 
              p: 1, 
              borderRadius: '50%', 
              backgroundColor: currentRoomNumber && currentRoomNumber !== 'To be assigned' ? 'success.main' : 'primary.main',
              color: COLORS.WHITE
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
                    background: `linear-gradient(45deg, ${primaryDark}, ${primaryMain})`,
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
                        backgroundColor: addAlpha(infoMain, 0.08),
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
                        backgroundColor: addAlpha(successMain, 0.08),
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
                    backgroundColor: addAlpha(warningMain, 0.08),
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
          background: `linear-gradient(135deg, ${COLORS.BG_PAPER} 0%, ${COLORS.BG_LIGHT} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${primaryDark} 0%, ${primaryMain} 50%, ${successMain} 100%)`,
          }
        }} data-testid="room-assignment-section">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ 
              p: 1, 
              borderRadius: '50%', 
              backgroundColor: 'primary.main',
              color: COLORS.WHITE
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
                backgroundColor: addAlpha(warningMain, 0.08),
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
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: `0 8px 32px ${addAlpha(primaryDark, 0.2)}`,
                            borderRadius: 12,
                            border: '1px solid',
                            borderColor: 'primary.light'
                          },
                        },
                        MenuListProps: {
                          style: {
                            backgroundColor: theme.palette.background.paper,
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
                              backgroundColor: index % 2 === 0 ? addAlpha(primaryMain, 0.04) : 'background.paper',
                              '&:hover': {
                                backgroundColor: 'primary.light'
                              },
                              '&.Mui-selected': {
                                backgroundColor: 'primary.main',
                                color: COLORS.WHITE,
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
                          backgroundColor: addAlpha(primaryMain, 0.08),
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 24px ${addAlpha(primaryDark, 0.15)}`,
                          borderColor: 'primary.main'
                        },
                        backgroundColor: selectedRoomId === room.id ? addAlpha(primaryMain, 0.12) : 'transparent',
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
                            background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.primary.light} 100%)`,
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
                                  color: COLORS.SECONDARY,
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
                                  size="medium" 
                                  sx={{
                                    background: selectedRoomId === room.id 
                                      ? COLORS.GRADIENT_SECONDARY
                                      : COLORS.GRADIENT_WARM,
                                    color: COLORS.PRIMARY,
                                    fontWeight: 700,
                                    fontSize: '0.95rem',
                                    px: 2,
                                    py: 2.5,
                                    height: 'auto',
                                    boxShadow: `0 2px 8px ${addAlpha(COLORS.SECONDARY, 0.3)}`,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      background: COLORS.GRADIENT_SECONDARY,
                                      boxShadow: `0 4px 12px ${addAlpha(COLORS.SECONDARY, 0.4)}`,
                                      transform: 'translateY(-1px)'
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
                    backgroundColor: addAlpha(warningMain, 0.08),
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
            background: `linear-gradient(135deg, ${COLORS.BG_PAPER} 0%, ${addAlpha(successMain, 0.08)} 100%)`,
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
              background: `linear-gradient(90deg, ${primaryLight} 0%, ${primaryLight} 50%, ${primaryMain} 100%)`,
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
                {calculatedTotal > 0 ? (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.dark' }}>
                        Room Charges (Subtotal)
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: 'success.main' }}>
                        {formatCurrencyWithDecimals(calculatedTotal)}
                      </Typography>
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic', mt: 1 }}>
                      Note: Taxes (VAT & Service Tax) will be calculated and applied at checkout
                    </Typography>
                  </>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 3,
                    px: 2
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1, textAlign: 'center' }}>
                      💰 Select a room to view pricing
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                      Price will appear once you select a specific room
                    </Typography>
                  </Box>
                )}
              </Grid>
              
              {priceDifference !== 0 && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2, borderColor: 'success.light' }} />
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    backgroundColor: priceDifference > 0 ? addAlpha(errorMain, 0.08) : addAlpha(successMain, 0.08),
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
        background: `linear-gradient(135deg, ${COLORS.BG_PAPER} 0%, ${addAlpha(primaryMain, 0.06)} 100%)`,
        borderTop: '1px solid',
        borderColor: COLORS.SECONDARY,
        gap: 2
      }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          variant="outlined"
          size="large"
          sx={{
            borderColor: COLORS.SECONDARY,
            color: COLORS.SECONDARY,
            borderWidth: 1,
            borderRadius: 2,
            px: 4,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem',
            '&:hover': {
              borderColor: 'primary.dark',
              backgroundColor: addAlpha(primaryMain, 0.08),
              borderWidth: 1
            },
            '&:disabled': {
              borderColor: COLORS.BORDER_LIGHT,
              color: COLORS.TEXT_DISABLED
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
              background: COLORS.GRADIENT_SECONDARY,
              fontWeight: 700,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: `0 4px 16px ${addAlpha(COLORS.SECONDARY, 0.4)}`,
              '&:hover': {
                background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryDark} 50%, ${primaryDark} 100%)`,
                boxShadow: `0 6px 20px ${addAlpha(primaryDark, 0.5)}`,
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
                ? COLORS.BORDER_LIGHT 
                : `linear-gradient(135deg, ${primaryDark} 0%, ${primaryMain} 50%, ${theme.palette.warning.dark} 100%)`,
              color: !currentRoomNumber || currentRoomNumber === 'To be assigned' || loading ? COLORS.TEXT_DISABLED : COLORS.WHITE,
              fontWeight: 700,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: !currentRoomNumber || currentRoomNumber === 'To be assigned' || loading 
                ? 'none' 
                : `0 4px 16px ${addAlpha(theme.palette.warning.dark, 0.4)}`,
              '&:hover': !currentRoomNumber || currentRoomNumber === 'To be assigned' || loading ? {} : {
                background: `linear-gradient(135deg, ${theme.palette.warning.dark} 0%, ${primaryDark} 50%, ${primaryMain} 100%)`,
                boxShadow: `0 6px 20px ${addAlpha(theme.palette.warning.dark, 0.5)}`,
                transform: 'translateY(-2px)'
              },
              '&:active': {
                transform: 'translateY(0px)'
              },
              '&:disabled': {
                background: COLORS.BORDER_LIGHT,
                color: COLORS.TEXT_DISABLED,
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
                      '&:hover': { borderColor: COLORS.SECONDARY }
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
