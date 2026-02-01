import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Chip,
  Divider,
  Card,
  CardContent,
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
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Room as RoomIcon,
} from '@mui/icons-material';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { hotelAdminApi, RoomResponse } from '../../services/hotelAdminApi';
import { frontDeskApiService } from '../../services/frontDeskApi';
import { ROOM_TYPE_VALUES } from '../../constants/roomTypes';
import { formatDateForDisplay, formatDateForInput } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/currencyUtils';
import PremiumTextField from '../common/PremiumTextField';
import PremiumSelect from '../common/PremiumSelect';
import { COLORS, addAlpha } from '../../theme/themeColors';

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
  title
}) => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { token, user } = useAuth();
  const { tenant } = useTenant();
  
  // Get the appropriate title based on mode if not provided
  const pageTitle = title || (mode === 'hotel-admin' 
    ? t('booking.details.hotelAdminTitle') 
    : t('booking.details.frontDeskTitle'));
  
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
  const availableRoomTypes = ROOM_TYPE_VALUES;
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [priceCalculating, setPriceCalculating] = useState(false);
  
  // New state for room type price calculation
  const [, setRoomTypePricing] = useState<any>(null);
  const [loadingRoomTypePricing, setLoadingRoomTypePricing] = useState(false);
  
  // New state to track if prices have been modified during editing session
  const [pricesModified, setPricesModified] = useState(false);
  const [originalPricing, setOriginalPricing] = useState<{pricePerNight: number, totalAmount: number} | null>(null);

  // Helper function to show error in dialog
  const showErrorDialog = (errorMessage: string) => {
    setError(errorMessage);
    setErrorDialogOpen(true);
  };

  const loadBooking = useCallback(async () => {
      if (!token) {
        setError(t('booking.details.authenticationRequired'));
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

        // console.log('Loading booking with reservation ID:', reservationId);
        
        // Use the appropriate API based on mode
        const result = mode === 'hotel-admin' 
          ? await hotelAdminApi.getBookingById(token, reservationId)
          : await frontDeskApiService.getBookingById(token, reservationId, tenant?.id || null);
        
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
          
          // console.log('🔍 UnifiedBookingDetails - Raw API response:', responseData);
          // console.log('🔍 UnifiedBookingDetails - Mapped booking:', mappedBooking);
          setBooking(mappedBooking);
          
          setEditedBooking({ ...mappedBooking });
        } else {
          // console.log('Booking not found for reservation ID:', reservationId);
          setError(result.message || t('booking.details.bookingNotFoundForId', { id: reservationId }));
        }
      } catch (err) {
        setError(t('booking.details.errors.failedToLoad'));
        // console.error('Error loading booking:', err);
      } finally {
        setLoading(false);
      }
    }, [id, token, mode, tenant?.id, t]);

  // Refresh function to reload booking data
  const refreshBooking = async () => {
    await loadBooking();
  };

  useEffect(() => {
    if (id) {
      loadBooking();
    }
  }, [id, token, mode, tenant?.id, loadBooking]);

  const handleEdit = () => {
    setIsEditing(true);
    // Store original pricing when editing starts
    if (booking) {
      setOriginalPricing({
        pricePerNight: booking.pricePerNight,
        totalAmount: booking.totalAmount
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedBooking(booking ? { ...booking } : null);
    setSelectedRoomId(null);
    // Reset price modification tracking
    setPricesModified(false);
    setOriginalPricing(null);
  };

  const handleCancelAndClose = () => {
    handleCancel();
    handleBack();
  };

  // Helper function to check if a booking can be modified
  const canModifyBooking = (status: string) => {
    // Only allow modifications for certain statuses
    // Handle both API format (CHECKED_OUT) and display format (Checked Out)
    const normalizedStatus = status.toLowerCase().replace(/_/g, ' ');
    const modifiableStatuses = ['confirmed', 'pending', 'checked in'];
    return modifiableStatuses.includes(normalizedStatus);
  };

  const handleSave = async (): Promise<boolean> => {
    if (!editedBooking || !booking || !token) return false;

    // Check if booking can be modified based on its status
    if (!canModifyBooking(booking.status)) {
      showErrorDialog(t('booking.details.errors.cannotModifyStatus', { status: booking.status }));
      return false;
    }

    try {
      setPriceCalculating(true);
      
      // Use unified save logic for both roles since they perform the same actions
      await handleUnifiedSave();
      
      // Refresh booking data to ensure cache-busting works
      await refreshBooking();
      
      // Reset price modification tracking after successful save
      setPricesModified(false);
      setOriginalPricing(null);
      
      setIsEditing(false);
      return true;
    } catch (err) {
      showErrorDialog(err instanceof Error ? err.message : t('booking.details.errors.failedToUpdate'));
      // console.error('Error updating booking:', err);
      return false;
    } finally {
      setPriceCalculating(false);
    }
  };

  const handleSaveAndClose = async () => {
    const saved = await handleSave();
    if (saved) {
      handleBack();
    }
  };

  const handleUnifiedSave = async () => {
    if (!editedBooking || !booking || !token) {
      throw new Error('Missing required data for save');
    }

    try {
      // Check what types of changes were made
      const statusChanged = editedBooking.status !== booking.status;
      const roomAssignmentChanged = selectedRoomId !== null;
      const roomTypeChanged = editedBooking.roomType !== booking.roomType;
      const guestInfoChanged = editedBooking.guestName !== booking.guestName || 
                              editedBooking.guestEmail !== booking.guestEmail;
      const datesChanged = editedBooking.checkInDate !== booking.checkInDate || 
                          editedBooking.checkOutDate !== booking.checkOutDate;
      
      // console.log('🔍 Change Detection:', {
      //   statusChanged,
      //   roomAssignmentChanged,
      //   roomTypeChanged,
      //   guestInfoChanged,
      //   datesChanged,
      //   originalBooking: booking,
      //   editedBooking: editedBooking,
      //   selectedRoomId
      // });

      let hasUpdates = false;
      let finalBookingData = { ...editedBooking };

      // STEP 1: Handle status changes first using Front Desk API (works for both roles)
      if (statusChanged) {
        // console.log('🔄 Status change detected:', booking.status, '→', editedBooking.status);
        try {
          const result = await frontDeskApiService.updateBookingStatus(
            token,
            editedBooking.reservationId,
            editedBooking.status,
            tenant?.id || null
          );
          
          if (result.success && result.data) {
            const apiBooking = result.data;
            finalBookingData = {
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
            // console.log('✅ Status updated successfully');
          } else {
            throw new Error(result.message || 'Failed to update booking status');
          }
        } catch (err) {
          // console.error('❌ Error updating booking status:', err);
          throw new Error('Failed to update booking status');
        }
      }

      // STEP 2: Handle room assignment changes using Front Desk API (works for both roles)
      if (roomAssignmentChanged && selectedRoomId) {
        // console.log('🏠 Room assignment change detected, using room ID:', selectedRoomId);
        try {
          const result = await frontDeskApiService.updateBookingRoomAssignment(
            token,
            editedBooking.reservationId,
            selectedRoomId,
            editedBooking.roomType,
            tenant?.id || null
          );
          
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
            
            // console.log('✅ Room assignment successful:', updatedBooking);
            
            // Update final booking data and current state
            finalBookingData = { ...updatedBooking };
            setSuccess(t('booking.details.success.roomAssignmentUpdated'));
            hasUpdates = true;
          } else {
            // console.log('❌ Room assignment API failed:', result);
            throw new Error(result.message || 'Failed to update room assignment');
          }
        } catch (err) {
          // console.error('❌ Error updating room assignment:', err);
          
          // Check if the error is about room availability
          const errorMessage = err instanceof Error ? err.message : t('booking.details.errors.failedToLoadRooms');
          if (errorMessage.includes('not available') || errorMessage.includes('Selected room is not available')) {
            throw new Error(t('booking.details.errors.roomNotAvailable', { 
              checkIn: editedBooking.checkInDate, 
              checkOut: editedBooking.checkOutDate 
            }));
          } else {
            throw new Error(errorMessage);
          }
        }
      }

            // STEP 3: Handle comprehensive booking updates (dates, guest info, etc.) using unified API
      if ((datesChanged || guestInfoChanged || roomTypeChanged) && !statusChanged && !roomAssignmentChanged) {
        // console.log('🗓️ Comprehensive booking update detected for room type/dates/guest info');
        try {
          // Get hotel ID from current booking data (we need it for the comprehensive update)
          // Get hotel ID from user context
          const hotelId = user?.hotelId ? parseInt(user.hotelId) : null;
          if (!hotelId) {
            setError(t('booking.details.errors.hotelIdNotAvailable'));
            return;
          }
          
          const comprehensiveUpdateData = {
            hotelId: hotelId,
            roomType: editedBooking.roomType,
            roomId: undefined, // Let the backend handle room assignment
            checkInDate: editedBooking.checkInDate,
            checkOutDate: editedBooking.checkOutDate,
            guests: 2, // Default to 2 guests - should be configurable
            guestName: editedBooking.guestName,
            guestEmail: editedBooking.guestEmail,
            guestPhone: undefined, // Optional field
            specialRequests: undefined // Optional field
          };

          const result = await frontDeskApiService.updateBooking(
            token,
            editedBooking.reservationId,
            comprehensiveUpdateData,
            tenant?.id || null
          );
          
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
            
            // console.log('✅ Comprehensive booking update successful:', updatedBooking);
            
            // Update final booking data and current state
            finalBookingData = { ...updatedBooking };
            hasUpdates = true;
            
            if (roomTypeChanged && datesChanged && guestInfoChanged) {
              setSuccess(t('booking.details.success.roomTypeAndDatesAndGuestUpdated'));
            } else if (roomTypeChanged && datesChanged) {
              setSuccess(t('booking.details.success.roomTypeAndDatesUpdated'));
            } else if (roomTypeChanged && guestInfoChanged) {
              setSuccess(t('booking.details.success.roomTypeAndGuestUpdated'));
            } else if (datesChanged && guestInfoChanged) {
              setSuccess(t('booking.details.success.datesAndGuestUpdated'));
            } else if (roomTypeChanged) {
              setSuccess(t('booking.details.success.roomTypeUpdated'));
            } else if (datesChanged) {
              setSuccess(t('booking.details.success.datesUpdated'));
            } else if (guestInfoChanged) {
              setSuccess(t('booking.details.success.guestInfoUpdated'));
            }
          } else {
            // console.log('❌ Comprehensive booking update API failed:', result);
            throw new Error(result.message || 'Failed to update booking details');
          }
        } catch (err) {
          // console.error('❌ Error in comprehensive booking update:', err);
          throw new Error(err instanceof Error ? err.message : 'Failed to update booking details');
        }
      }

      // Update local state with final booking data
      if (hasUpdates) {
        setBooking(finalBookingData);
        setEditedBooking({ ...finalBookingData });
        setSelectedRoomId(null);
        
        if (statusChanged && !roomAssignmentChanged && !roomTypeChanged && !datesChanged && !guestInfoChanged) {
          setSuccess(t('booking.details.success.statusUpdated'));
        } else if (!statusChanged && (roomAssignmentChanged || roomTypeChanged) && !datesChanged && !guestInfoChanged) {
          setSuccess(t('booking.details.success.roomDetailsUpdated'));
        } else if (statusChanged && (roomAssignmentChanged || roomTypeChanged) && !datesChanged && !guestInfoChanged) {
          setSuccess(t('booking.details.success.statusAndRoomUpdated'));
        } else if (!statusChanged && !roomAssignmentChanged && !roomTypeChanged && (datesChanged || guestInfoChanged)) {
          // Success message already set in comprehensive update section
        } else {
          setSuccess(t('booking.details.success.bookingUpdated'));
        }
      } else {
        setSuccess(t('booking.details.success.noChanges'));
      }
    } catch (error) {
      // console.error('🚨 Unified Save Error:', error);
      throw error;
    }
  };



  // Load available rooms for room selection
  const loadAvailableRooms = async (roomType?: string) => {
    if (!token || !editedBooking || !user?.hotelId) return;

    try {
      setLoadingRooms(true);
      const selectedRoomType = roomType || editedBooking.roomType;
      const hotelId = parseInt(user.hotelId);
      
      // Use the date-based availability endpoint to filter rooms available for the booking dates
      const result = await frontDeskApiService.getAvailableRoomsForDateRange(
        token,
        hotelId,
        editedBooking.checkInDate,
        editedBooking.checkOutDate,
        2, // default guests - could be made configurable
        tenant?.id || null
      );
      
      if (result.success && result.data) {
        // Filter by room type if specified
        const filteredRooms = selectedRoomType 
          ? result.data.filter(room => room.roomType === selectedRoomType)
          : result.data;
        
        setAvailableRooms(filteredRooms);
      } else {
        setError(t('booking.details.errors.failedToLoadRooms'));
      }
    } catch (err) {
      setError(t('booking.details.errors.failedToLoadRooms'));
      // console.error('Error loading rooms:', err);
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
        // console.warn('No pricing found for room type:', roomType);
        return null;
      }
    } catch (err) {
      // console.error('Error loading room type pricing:', err);
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
    
    // Check if pricing has changed from original
    if (originalPricing && (room.pricePerNight !== originalPricing.pricePerNight || newTotalAmount !== originalPricing.totalAmount)) {
      setPricesModified(true);
    }
    
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
      showErrorDialog(t('booking.details.errors.selectRoomTypeFirst'));
      return;
    }
    loadAvailableRooms(editedBooking.roomType);
    setRoomDialogOpen(true);
  };

  const handleFieldChange = (name: string, value: any) => {
    if (editedBooking) {
      const updatedBooking = { ...editedBooking, [name]: value };
      
      // Handle room type change with automatic price calculation (Hotel Admin only)
      if (mode === 'hotel-admin' && name === 'roomType') {
        // Clear room number when room type changes (use updatedBooking, not separate call)
        if (name === 'roomType') {
          updatedBooking.roomNumber = '';
        }
        
        // Update the state immediately so the Select component reflects the change
        setEditedBooking(updatedBooking);
        
        // Load new pricing for the selected room type
        loadRoomTypePricing(value).then((pricing) => {
          if (pricing && updatedBooking) {
            const newPricePerNight = pricing.basePricePerNight;
            const newTotal = calculateTotalWithRoomTypePricing(
              value, 
              updatedBooking.checkInDate, 
              updatedBooking.checkOutDate, 
              pricing
            );
            
            // Check if pricing has changed from original
            if (originalPricing && (newPricePerNight !== originalPricing.pricePerNight || newTotal !== originalPricing.totalAmount)) {
              setPricesModified(true);
            }
            
            setEditedBooking((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                pricePerNight: newPricePerNight,
                totalAmount: newTotal
              };
            });
          }
        }).catch((error) => {
          // console.error('Pricing API error, but room type change should persist:', error);
        });
        
        return; // Exit after setting state and initiating async pricing update
      }
      
      // For all other cases (including front-desk mode room type changes)
      // Check if dates are changing which might affect total pricing
      if ((name === 'checkInDate' || name === 'checkOutDate') && editedBooking && originalPricing) {
        // Calculate new total based on updated dates and current price per night
        const checkInDate = name === 'checkInDate' ? value : editedBooking.checkInDate;
        const checkOutDate = name === 'checkOutDate' ? value : editedBooking.checkOutDate;
        
        if (checkInDate && checkOutDate) {
          const checkIn = new Date(checkInDate);
          const checkOut = new Date(checkOutDate);
          const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
          const newTotal = editedBooking.pricePerNight * nights;
          
          // Check if total amount will change from original
          if (newTotal !== originalPricing.totalAmount) {
            setPricesModified(true);
          }
          
          // Update the total amount in the booking data
          updatedBooking.totalAmount = newTotal;
        }
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
    return formatDateForDisplay(dateString);
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
      case 'paid':
      case 'completed': return 'success';
      case 'processing':
      case 'pending': return 'warning';
      case 'pay_at_frontdesk': return 'info';
      case 'failed':
      case 'cancelled': return 'error';
      case 'refunded':
      case 'partially_refunded': return 'info';
      case 'forfeited': return 'warning';
      default: return 'default';
    }
  };

  const currentBooking = isEditing ? editedBooking : booking;
  


  if (loading) {
    return (
      <Dialog open onClose={handleBack} maxWidth="lg" fullWidth scroll="paper">
        <DialogContent dividers>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ ml: 2 }}>
              {t('booking.details.loading')}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open onClose={handleBack} maxWidth="lg" fullWidth scroll="paper">
        <DialogContent dividers>
          <Box sx={{ mt: 2 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (!currentBooking) {
    return (
      <Dialog open onClose={handleBack} maxWidth="lg" fullWidth scroll="paper">
        <DialogContent dividers>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              {t('booking.details.bookingNotFound')}
            </Alert>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onClose={handleBack} maxWidth="lg" fullWidth scroll="paper">
      <DialogContent dividers sx={{ p: 0 }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ mb: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h4" component="h1" sx={{ color: COLORS.TEXT_PRIMARY, fontWeight: 600 }}>
              {pageTitle}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancelAndClose}
              color="error"
            >
              {t('booking.details.cancel')}
            </Button>
            {!isEditing ? (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                disabled={!booking || !canModifyBooking(booking.status)}
                title={booking && !canModifyBooking(booking.status) ? `Cannot edit booking with status: ${booking.status}` : undefined}
              >
                {t('booking.details.edit')}
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveAndClose}
                disabled={priceCalculating}
                color="primary"
              >
                {priceCalculating ? t('booking.details.saving') : t('booking.details.save')}
              </Button>
            )}
          </Box>
        </Box>

        {/* Booking Information Cards */}
        <Grid container spacing={3}>
          {/* Guest Information */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              border: `1px solid ${addAlpha(COLORS.SUCCESS, 0.15)}`,
              boxShadow: `0 2px 8px ${addAlpha(COLORS.PRIMARY, 0.1)}`,
              '&:hover': {
                boxShadow: `0 4px 16px ${addAlpha(COLORS.PRIMARY, 0.15)}`
              }
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: COLORS.TEXT_PRIMARY, fontWeight: 600 }}>
                  {t('booking.details.guestInformation')}
                </Typography>
                <Divider sx={{ mb: 2, borderColor: addAlpha(COLORS.SUCCESS, 0.15) }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <PremiumTextField
                      fullWidth
                      label={t('booking.details.guestName')}
                      value={currentBooking?.guestName || ''}
                      onChange={(e) => handleFieldChange('guestName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <PremiumTextField
                      fullWidth
                      label={t('booking.details.email')}
                      value={currentBooking?.guestEmail || ''}
                      onChange={(e) => handleFieldChange('guestEmail', e.target.value)}
                      disabled={!isEditing}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Booking Details */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              border: `1px solid ${addAlpha(COLORS.SUCCESS, 0.15)}`,
              boxShadow: `0 2px 8px ${addAlpha(COLORS.PRIMARY, 0.1)}`,
              '&:hover': {
                boxShadow: `0 4px 16px ${addAlpha(COLORS.PRIMARY, 0.15)}`
              }
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: COLORS.TEXT_PRIMARY, fontWeight: 600 }}>
                  {t('booking.details.bookingDetails')}
                </Typography>
                <Divider sx={{ mb: 2, borderColor: addAlpha(COLORS.SUCCESS, 0.15) }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <PremiumTextField
                      fullWidth
                      label={t('booking.details.confirmationNumber')}
                      value={currentBooking?.confirmationNumber || ''}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {isEditing ? (
                      <PremiumSelect
                        fullWidth
                        label={t('booking.details.status')}
                        value={currentBooking?.status || ''}
                        onChange={(e) => handleFieldChange('status', e.target.value)}
                      >
                        <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                        <MenuItem value="CHECKED_IN">Checked In</MenuItem>
                        <MenuItem value="CHECKED_OUT">Checked Out</MenuItem>
                        <MenuItem value="CANCELLED">Cancelled</MenuItem>
                        <MenuItem value="PENDING">Pending</MenuItem>
                      </PremiumSelect>
                    ) : (
                      <Box>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {t('booking.details.status')}
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
                        {t('booking.details.paymentStatus')}
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
            <Card sx={{ 
              border: `1px solid ${addAlpha(COLORS.SUCCESS, 0.15)}`,
              boxShadow: `0 2px 8px ${addAlpha(COLORS.PRIMARY, 0.1)}`,
              '&:hover': {
                boxShadow: `0 4px 16px ${addAlpha(COLORS.PRIMARY, 0.15)}`
              }
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: COLORS.TEXT_PRIMARY, fontWeight: 600 }}>
                  {t('booking.details.hotelRoomInformation')}
                </Typography>
                <Divider sx={{ mb: 2, borderColor: addAlpha(COLORS.SUCCESS, 0.15) }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <PremiumTextField
                      fullWidth
                      label={t('booking.details.hotelName')}
                      value={currentBooking?.hotelName || ''}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <PremiumTextField
                      fullWidth
                      label={t('booking.details.hotelAddress')}
                      value={currentBooking?.hotelAddress || ''}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    {isEditing ? (
                      <PremiumSelect
                        fullWidth
                        label={t('booking.details.roomType')}
                        value={currentBooking?.roomType || ''}
                        onChange={(e) => {
                          handleFieldChange('roomType', e.target.value);
                          // Room number clearing is handled inside handleFieldChange for room type changes
                          setSelectedRoomId(null);
                        }}
                      >
                        {availableRoomTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </PremiumSelect>
                    ) : (
                      <PremiumTextField
                        fullWidth
                        label={t('booking.details.roomType')}
                        value={currentBooking?.roomType || ''}
                        disabled
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
                        sx={{ 
                          height: '56px', // Match the height of the dropdown
                          borderColor: COLORS.SECONDARY,
                          color: COLORS.SECONDARY,
                          '&:hover': {
                            borderColor: COLORS.SECONDARY,
                            backgroundColor: addAlpha(COLORS.SUCCESS, 0.12),
                            color: COLORS.SECONDARY
                          }
                        }}
                      >
                        {t('booking.details.selectRoom')}
                      </Button>
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    {isEditing ? (
                      <PremiumTextField
                        fullWidth
                        label={t('booking.details.roomNumber')}
                        value={currentBooking?.roomNumber || ''}
                        onChange={(e) => handleFieldChange('roomNumber', e.target.value)}
                        placeholder={t('booking.details.roomNumberPlaceholder')}
                        helperText={t('booking.details.roomNumberHelperText')}
                      />
                    ) : (
                      <PremiumTextField
                        fullWidth
                        label={t('booking.details.roomNumber')}
                        value={currentBooking?.roomNumber || t('booking.details.roomNumberTBA')}
                        disabled
                      />
                    )}
                  </Grid>
                  {isEditing && selectedRoomId && (
                    <Grid item xs={12}>
                      <Alert severity="info">
                        {t('booking.details.alerts.roomSelectionPending')}
                        {priceCalculating && ` ${t('booking.details.alerts.calculatingPrice')}`}
                      </Alert>
                    </Grid>
                  )}
                  {isEditing && loadingRoomTypePricing && (
                    <Grid item xs={12}>
                      <Alert severity="info">
                        {t('booking.details.alerts.calculatingPricing')}
                      </Alert>
                    </Grid>
                  )}
                  {isEditing && pricesModified && !loadingRoomTypePricing && !priceCalculating && (
                    <Grid item xs={12}>
                      <Alert 
                        severity="warning" 
                        sx={{ 
                          backgroundColor: addAlpha(COLORS.WARNING, 0.15), 
                          color: COLORS.WARNING,
                          border: `1px solid ${addAlpha(COLORS.WARNING, 0.35)}`,
                          '& .MuiAlert-icon': {
                            color: COLORS.WARNING
                          }
                        }}
                      >
                        {t('booking.details.alerts.pricesModified')}
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Stay Information */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              border: `1px solid ${addAlpha(COLORS.SUCCESS, 0.15)}`,
              boxShadow: `0 2px 8px ${addAlpha(COLORS.PRIMARY, 0.1)}`,
              '&:hover': {
                boxShadow: `0 4px 16px ${addAlpha(COLORS.PRIMARY, 0.15)}`
              }
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: COLORS.TEXT_PRIMARY, fontWeight: 600 }}>
                  {t('booking.details.stayInformation')}
                </Typography>
                <Divider sx={{ mb: 2, borderColor: addAlpha(COLORS.SUCCESS, 0.15) }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <PremiumTextField
                      fullWidth
                      label={t('booking.details.checkInDate')}
                      value={formatDateForInput(currentBooking?.checkInDate || '')}
                      type="date"
                      onChange={(e) => handleFieldChange('checkInDate', e.target.value)}
                      disabled={!isEditing}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumTextField
                      fullWidth
                      label={t('booking.details.checkOutDate')}
                      value={formatDateForInput(currentBooking?.checkOutDate || '')}
                      type="date"
                      onChange={(e) => handleFieldChange('checkOutDate', e.target.value)}
                      disabled={!isEditing}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumTextField
                      fullWidth
                      label={t('booking.details.pricePerNight')}
                      value={formatCurrency(currentBooking?.pricePerNight || 0)}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumTextField
                      fullWidth
                      label={t('booking.details.totalAmount')}
                      value={formatCurrency(currentBooking?.totalAmount || 0)}
                      disabled
                    />
                  </Grid>
                  {isEditing && pricesModified && !loadingRoomTypePricing && !priceCalculating && (
                    <Grid item xs={12}>
                      <Alert 
                        severity="warning" 
                        sx={{ 
                          backgroundColor: addAlpha(COLORS.WARNING, 0.15), 
                          color: COLORS.WARNING,
                          border: `1px solid ${addAlpha(COLORS.WARNING, 0.35)}`,
                          '& .MuiAlert-icon': {
                            color: COLORS.WARNING
                          }
                        }}
                      >
                        {t('booking.details.alerts.pricesModified')}
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Additional Information */}
          <Grid item xs={12}>
            <Card sx={{ 
              border: `1px solid ${addAlpha(COLORS.SUCCESS, 0.15)}`,
              boxShadow: `0 2px 8px ${addAlpha(COLORS.PRIMARY, 0.1)}`,
              '&:hover': {
                boxShadow: `0 4px 16px ${addAlpha(COLORS.PRIMARY, 0.15)}`
              }
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: COLORS.TEXT_PRIMARY, fontWeight: 600 }}>
                  {t('booking.details.additionalInformation')}
                </Typography>
                <Divider sx={{ mb: 2, borderColor: addAlpha(COLORS.SUCCESS, 0.15) }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <PremiumTextField
                      fullWidth
                      label={t('booking.details.bookingDate')}
                      value={currentBooking ? formatDate(currentBooking.createdAt) : ''}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumTextField
                      fullWidth
                      label={t('booking.details.paymentIntentId')}
                      value={currentBooking?.paymentIntentId || 'N/A'}
                      disabled
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
          sx={{
            '& .MuiDialog-paper': {
              border: `1px solid ${addAlpha(COLORS.SUCCESS, 0.15)}`,
              boxShadow: `0 8px 32px ${addAlpha(COLORS.PRIMARY, 0.15)}`
            }
          }}
        >
          <DialogTitle sx={{ color: COLORS.TEXT_PRIMARY, fontWeight: 600 }}>
            {t('booking.details.selectRoomDialog.title')}
            {loadingRooms && (
              <CircularProgress size={20} sx={{ ml: 2, color: COLORS.SECONDARY }} />
            )}
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>{t('booking.details.selectRoomDialog.warningTitle')}</strong> {t('booking.details.selectRoomDialog.warningMessage', {
                  checkIn: editedBooking?.checkInDate,
                  checkOut: editedBooking?.checkOutDate
                })}
              </Typography>
            </Alert>
            {availableRooms.length > 0 ? (
              <List>
                {availableRooms.map((room) => (
                  <ListItem key={room.id} disablePadding>
                    <ListItemButton 
                      onClick={() => handleRoomSelect(room)}
                      sx={{
                        '&:hover': {
                          backgroundColor: addAlpha(COLORS.SUCCESS, 0.12),
                        },
                        borderRadius: 1,
                        mb: 0.5,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body1" sx={{ color: COLORS.SECONDARY, fontWeight: 500 }}>
                            {t('booking.details.selectRoomDialog.roomInfo', {
                              roomNumber: room.roomNumber,
                              roomType: room.roomType
                            })}
                          </Typography>
                        }
                        secondary={
                          <span>
                            <Typography component="span" variant="body2" color="text.primary">
                              {formatCurrency(room.pricePerNight || 0)}{t('booking.details.selectRoomDialog.perNight')}
                            </Typography>
                            {room.description && (
                              <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                                • {room.description}
                              </Typography>
                            )}
                            <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                              • {t('booking.details.selectRoomDialog.capacity', { capacity: room.capacity })}
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
                {loadingRooms ? t('booking.details.selectRoomDialog.loadingRooms') : t('booking.details.selectRoomDialog.noRoomsFound')}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setRoomDialogOpen(false)}
              sx={{
                color: COLORS.SECONDARY,
                '&:hover': {
                  backgroundColor: addAlpha(COLORS.SUCCESS, 0.12)
                }
              }}
            >
              {t('booking.details.selectRoomDialog.cancel')}
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
          sx={{
            '& .MuiDialog-paper': {
              border: `1px solid ${addAlpha(COLORS.ERROR, 0.25)}`,
              boxShadow: `0 8px 32px ${addAlpha(COLORS.ERROR, 0.15)}`
            }
          }}
        >
          <DialogTitle sx={{ color: COLORS.ERROR, fontWeight: 600 }}>
            {t('booking.details.error')}
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
              sx={{
                backgroundColor: COLORS.SECONDARY,
                '&:hover': {
                  backgroundColor: COLORS.SECONDARY_HOVER
                }
              }}
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
    </DialogContent>
  </Dialog>
  );
};

export default UnifiedBookingDetails;
