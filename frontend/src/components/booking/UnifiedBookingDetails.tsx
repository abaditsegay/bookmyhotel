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
import { useTenant } from '../../contexts/TenantContext';
import { hotelAdminApi, RoomResponse } from '../../services/hotelAdminApi';
import { frontDeskApiService } from '../../services/frontDeskApi';

// Unified BookingData interface
export interface BookingData {
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

interface UnifiedBookingDetailsProps {
  mode: 'hotel-admin' | 'front-desk';
  title?: string;
}

const UnifiedBookingDetails: React.FC<UnifiedBookingDetailsProps> = ({ 
  mode = 'front-desk',
  title = 'Booking Details'
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { token } = useAuth();
  const { tenant } = useTenant();
  
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [editedBooking, setEditedBooking] = useState<BookingData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dialog states
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  // Room selection state
  const [availableRooms, setAvailableRooms] = useState<RoomResponse[]>([]);
  const availableRoomTypes = ['SINGLE', 'DOUBLE', 'SUITE', 'DELUXE', 'PRESIDENTIAL'];
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [priceCalculating, setPriceCalculating] = useState(false);
  
  // New state for room type price calculation
  const [, setRoomTypePricing] = useState<any>(null);
  const [loadingRoomTypePricing, setLoadingRoomTypePricing] = useState(false);

  // Helper function to show error in dialog
  const showErrorDialog = (errorMessage: string) => {
    setError(errorMessage);
    setErrorDialogOpen(true);
  };

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
        
        // Use the appropriate API based on mode
        const result = mode === 'hotel-admin' 
          ? await hotelAdminApi.getBookingById(token, reservationId)
          : await frontDeskApiService.getBookingById(token, reservationId, tenant?.id || 'default');
        
        if (result.success && result.data) {
          // Map API response to unified format - handle different response structures
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
  }, [id, token, mode, tenant?.id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedBooking(booking ? { ...booking } : null);
    setSelectedRoomId(null);
  };

  // Helper function to check if a booking can be modified
  const canModifyBooking = (status: string) => {
    // Only allow modifications for certain statuses
    // Handle both API format (CHECKED_OUT) and display format (Checked Out)
    const normalizedStatus = status.toLowerCase().replace(/_/g, ' ');
    const modifiableStatuses = ['confirmed', 'pending', 'checked in'];
    return modifiableStatuses.includes(normalizedStatus);
  };

  const handleSave = async () => {
    if (!editedBooking || !booking || !token) return;

    // Check if booking can be modified based on its status
    if (!canModifyBooking(booking.status)) {
      showErrorDialog(`Cannot modify booking with status: ${booking.status}. Only confirmed, pending, or checked-in bookings can be modified.`);
      return;
    }

    try {
      setPriceCalculating(true);
      
      if (mode === 'hotel-admin') {
        // Use Hotel Admin API for comprehensive booking modification
        await handleHotelAdminSave();
      } else {
        // Use Front Desk API for simpler updates
        await handleFrontDeskSave();
      }
      
      setIsEditing(false);
    } catch (err) {
      showErrorDialog(err instanceof Error ? err.message : 'Failed to update booking');
      console.error('Error updating booking:', err);
    } finally {
      setPriceCalculating(false);
    }
  };

  const handleHotelAdminSave = async () => {
    if (!editedBooking || !booking || !token) {
      throw new Error('Missing required data for hotel admin save');
    }

    try {

    // Check what types of changes were made
    const statusChanged = editedBooking.status !== booking.status;
    const datesChanged = editedBooking.checkInDate !== booking.checkInDate || 
                        editedBooking.checkOutDate !== booking.checkOutDate;
    const guestInfoChanged = editedBooking.guestName !== booking.guestName || 
                            editedBooking.guestEmail !== booking.guestEmail;
    const roomChanged = selectedRoomId !== null || editedBooking.roomType !== booking.roomType;

    let hasUpdates = false;
    let finalBooking = { ...editedBooking };

    // Handle status changes first (separate API call)
    if (statusChanged) {
      try {
        const statusResult = await hotelAdminApi.updateBookingStatus(
          token,
          editedBooking.reservationId,
          editedBooking.status
        );
        
        if (statusResult.success && statusResult.data) {
          const apiBooking = statusResult.data;
          finalBooking = {
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
          hasUpdates = true;
        } else {
          throw new Error(statusResult.message || 'Failed to update booking status');
        }
      } catch (err) {
        console.error('Error updating booking status:', err);
        throw new Error('Failed to update booking status');
      }
    }

    // Handle other booking modifications (dates, guest info, room changes)
    if (datesChanged || guestInfoChanged || roomChanged) {
      try {
        const modificationRequest: any = {
          // Required fields for validation
          confirmationNumber: booking.confirmationNumber,
          guestEmail: booking.guestEmail,
          reason: 'Admin modification'
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

        const result = await hotelAdminApi.modifyBooking(
          token,
          editedBooking.reservationId,
          modificationRequest
        );
        
        if (result.success && result.data?.updatedBooking) {
          // Update with modification API response
          const apiBooking = result.data.updatedBooking;
          finalBooking = {
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
            status: statusChanged ? finalBooking.status : apiBooking.status, // Keep status from status update if changed
            createdAt: apiBooking.createdAt,
            paymentStatus: apiBooking.paymentStatus,
            paymentIntentId: apiBooking.paymentIntentId
          };
          
          hasUpdates = true;
          
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
      } catch (err) {
        console.error('Error modifying booking:', err);
        throw new Error('Failed to modify booking details');
      }
    }

    // Update local state with final booking data
    if (hasUpdates) {
      setBooking(finalBooking);
      setEditedBooking({ ...finalBooking });
      setSelectedRoomId(null);
      
      if (!datesChanged && !guestInfoChanged && !roomChanged && statusChanged) {
        setSuccess('Booking status updated successfully');
      }
    } else {
      setSuccess('No changes detected');
    }
    } catch (error) {
      console.error('🚨 Hotel Admin Save Error:', error);
      throw error; // Re-throw to be caught by main handleSave
    }
  };

  const handleFrontDeskSave = async () => {
    if (!editedBooking || !booking || !token) {
      throw new Error('Missing required data for front desk save');
    }

    try {
      console.log('🔍 Frontend Debug - Save initiated');
      console.log('📋 Current booking:', booking);
      console.log('✏️ Edited booking:', editedBooking);
      console.log('🏠 Selected room ID:', selectedRoomId);

      let hasUpdates = false;
      let finalBookingData = { ...editedBooking }; // Track the final booking state

    // Check if room assignment changed for confirmed or pending bookings (front desk can assign rooms during check-in)
    if ((editedBooking.status?.toUpperCase() === 'CONFIRMED' || editedBooking.status?.toUpperCase() === 'PENDING') &&
        (editedBooking.roomType !== booking.roomType || editedBooking.roomNumber !== booking.roomNumber)) {
      
      console.log('🏠 Room assignment logic triggered');
      console.log('📊 Booking status:', editedBooking.status);
      console.log('🏠 Room changes detected:', {
        roomTypeChanged: editedBooking.roomType !== booking.roomType,
        roomNumberChanged: editedBooking.roomNumber !== booking.roomNumber,
        oldRoom: booking.roomNumber,
        newRoom: editedBooking.roomNumber
      });
      
      // For room assignment changes with room ID
      if (selectedRoomId) {
        console.log('🎯 Calling room assignment API with room ID:', selectedRoomId);
        const result = await frontDeskApiService.updateBookingRoomAssignment(
          token,
          editedBooking.reservationId,
          selectedRoomId,
          editedBooking.roomType,
          tenant?.id || 'default'
        );
        
        console.log('📡 Room assignment API result:', result);
        
        if (result.success && result.data) {
          const updatedBooking: BookingData = {
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
          
          console.log('✅ Room assignment successful:', updatedBooking);
          
          // Update final booking data and current state
          finalBookingData = { ...updatedBooking };
          setBooking(updatedBooking);
          setEditedBooking({ ...updatedBooking });
          setSuccess('Room assignment updated successfully');
          hasUpdates = true;
        } else {
          console.log('❌ Room assignment API failed:', result);
        }
      } else if (editedBooking.roomNumber && 
                 editedBooking.roomNumber !== 'TBA (To Be Assigned)' && 
                 editedBooking.roomNumber !== 'To be assigned at check-in') {
        console.log('📝 Local room update (no room ID):', editedBooking.roomNumber);
        // Local update for manual room number entry
        setBooking({ ...editedBooking });
        setSuccess('Room details updated. Changes will be applied during check-in.');
        hasUpdates = true;
      } else {
        console.log('⚠️ No room assignment action taken:', {
          selectedRoomId,
          roomNumber: editedBooking.roomNumber,
          hasRoomChanges: editedBooking.roomType !== booking.roomType || editedBooking.roomNumber !== booking.roomNumber
        });
      }
    } else {
      console.log('⏭️ Room assignment logic skipped:', {
        status: editedBooking.status,
        isValidStatus: (editedBooking.status?.toUpperCase() === 'CONFIRMED' || editedBooking.status?.toUpperCase() === 'PENDING'),
        hasRoomChanges: (editedBooking.roomType !== booking.roomType || editedBooking.roomNumber !== booking.roomNumber)
      });
    }

    // Update booking status via API if status changed
    if (editedBooking.status !== booking.status) {
      console.log('📊 Status update initiated:', {
        oldStatus: booking.status,
        newStatus: editedBooking.status
      });
      
      const result = await frontDeskApiService.updateBookingStatus(
        token, 
        editedBooking.reservationId, 
        editedBooking.status,
        tenant?.id || 'default'
      );
      
      console.log('📡 Status update API result:', result);
      
      if (result.success && result.data) {
        const responseData = result.data as any;
        
        // Merge status update with previous room assignment data
        const updatedBooking: BookingData = {
          reservationId: responseData.reservationId || responseData.id,
          confirmationNumber: responseData.confirmationNumber,
          guestName: responseData.guestName,
          guestEmail: responseData.guestEmail,
          hotelName: responseData.hotelName,
          hotelAddress: responseData.hotelAddress,
          // Preserve room data from previous updates if available
          roomNumber: finalBookingData.roomNumber || responseData.roomNumber,
          roomType: finalBookingData.roomType || responseData.roomType,
          checkInDate: responseData.checkInDate,
          checkOutDate: responseData.checkOutDate,
          totalAmount: finalBookingData.totalAmount || responseData.totalAmount,
          pricePerNight: finalBookingData.pricePerNight || responseData.pricePerNight,
          status: responseData.status,
          createdAt: responseData.createdAt,
          paymentStatus: responseData.paymentStatus,
          paymentIntentId: responseData.paymentIntentId
        };
        
        console.log('✅ Status update completed, final booking state:', updatedBooking);
        
        finalBookingData = { ...updatedBooking };
        setBooking(updatedBooking);
        setEditedBooking({ ...updatedBooking });
        hasUpdates = true;
      } else {
        console.log('❌ Status update failed:', result);
      }
    }

    // If no API updates but other fields changed, update local state
    if (!hasUpdates && (
        editedBooking.guestName !== booking.guestName ||
        editedBooking.guestEmail !== booking.guestEmail ||
        editedBooking.checkInDate !== booking.checkInDate ||
        editedBooking.checkOutDate !== booking.checkOutDate
      )) {
      setBooking({ ...editedBooking });
      setSuccess('Booking details updated locally');
      hasUpdates = true;
    }
    
    if (!hasUpdates) {
      setSuccess('Booking updated successfully');
    }
    
    // Clear selected room ID after successful save
    if (hasUpdates) {
      setSelectedRoomId(null);
    }
    } catch (error) {
      console.error('🚨 Front Desk Save Error:', error);
      throw error; // Re-throw to be caught by main handleSave
    }
  };

  // Load available rooms for room selection
  const loadAvailableRooms = async (roomType?: string) => {
    if (!token || !editedBooking) return;

    try {
      setLoadingRooms(true);
      const selectedRoomType = roomType || editedBooking.roomType;
      
      if (mode === 'hotel-admin') {
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
      } else {
        // For front desk, use getRooms API
        const result = await frontDeskApiService.getRooms(
          token, 
          0, 
          100, 
          '', 
          selectedRoomType, 
          'AVAILABLE',
          tenant?.id || 'default'
        );
        
        if (result.success && result.data) {
          // Convert FrontDeskRoom to RoomResponse format for compatibility
          const convertedRooms: RoomResponse[] = result.data.content.map(room => ({
            id: room.id,
            roomNumber: room.roomNumber,
            roomType: room.roomType,
            pricePerNight: room.pricePerNight,
            capacity: room.capacity,
            description: room.description || '',
            isAvailable: room.status === 'AVAILABLE',
            status: room.status,
            hotelId: 0, // Use default value since FrontDeskRoom doesn't have this
            hotelName: 'Current Hotel', // FrontDeskRoom doesn't include hotel name
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
          setAvailableRooms(convertedRooms);
        } else {
          setError('Failed to load available rooms');
        }
      }
    } catch (err) {
      setError('Failed to load available rooms');
      console.error('Error loading rooms:', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  // Load room type pricing for automatic price calculation (Hotel Admin only)
  const loadRoomTypePricing = async (roomType: string) => {
    if (!token || mode !== 'hotel-admin') return null;

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

  // Calculate total with room type pricing
  const calculateTotalWithRoomTypePricing = (roomType: string, checkInDate: string, checkOutDate: string, pricing: any) => {
    if (!checkInDate || !checkOutDate || !pricing) return 0;
    
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    if (checkOut > checkIn) {
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      return pricing.basePricePerNight * nights;
    }
    
    return 0;
  };

  // Handle room selection from dialog
  const handleRoomSelect = (room: RoomResponse) => {
    if (!editedBooking) return;
    
    setSelectedRoomId(room.id);
    
    // Recalculate total amount based on selected room
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
      showErrorDialog('Please select a room type first');
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
      
      // Handle room type change with automatic price calculation (Hotel Admin only)
      if (field === 'roomType' && mode === 'hotel-admin') {
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
    
    // Navigate back to appropriate dashboard based on mode
    if (mode === 'hotel-admin') {
      if (returnTab) {
        navigate(`/hotel-admin/dashboard?tab=${returnTab}`);
      } else {
        navigate('/hotel-admin/dashboard');
      }
    } else {
      if (returnTab) {
        navigate(`/frontdesk/dashboard?tab=${returnTab}`);
      } else {
        navigate('/frontdesk/dashboard');
      }
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
    switch (status.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'checked in': 
      case 'checked_in': return 'primary';
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
              {title}
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
                  disabled={priceCalculating}
                >
                  {priceCalculating ? 'Saving...' : 'Save'}
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
                  <Grid item xs={12} sm={8}>
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
                  <Grid item xs={12} sm={4}>
                    {isEditing && (
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<RoomIcon />}
                        onClick={handleSelectRoom}
                        sx={{ height: '56px' }} // Match the height of the dropdown
                      >
                        Select Room
                      </Button>
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        label="Room Number"
                        value={currentBooking?.roomNumber || ''}
                        onChange={(e) => handleFieldChange('roomNumber', e.target.value)}
                        variant="outlined"
                        placeholder="Enter room number or use 'Select Room' button above"
                        helperText="You can either type a room number or use the 'Select Room' button to choose from available rooms"
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
                              ${room.pricePerNight}/night
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

        {/* Error Dialog */}
        <Dialog
          open={errorDialogOpen}
          onClose={() => {
            setErrorDialogOpen(false);
            setError(null);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Error
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {error}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setErrorDialogOpen(false);
                setError(null);
              }}
              variant="contained"
              color="primary"
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success Messages */}
        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess(null)}
        >
          <Alert onClose={() => setSuccess(null)} severity="success">
            {success}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default UnifiedBookingDetails;
