import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import StandardCard from '../components/common/StandardCard';
import {
  Edit as EditIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  Event as EventIcon,
  Hotel as HotelIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { bookingApiService } from '../services/bookingApi';
import { buildApiUrl, API_CONFIG } from '../config/apiConfig';
import { ROOM_TYPES, getRoomTypeLabel } from '../constants/roomTypes';
import { formatDateForInput, formatDateForAPI, formatDateForDisplay } from '../utils/dateUtils';
import { COLORS } from '../theme/themeColors';

// Get today's date in YYYY-MM-DD format (avoiding timezone issues)
const getTodayForInput = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface BookingData {
  reservationId: number;
  confirmationNumber: string;
  guestName: string;
  guestEmail: string;
  numberOfGuests: number;
  hotelName: string;
  hotelAddress: string;
  roomNumber: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  pricePerNight: number;
  status: string;
  createdAt: string;
  paymentStatus: string;
  paymentIntentId?: string;
  paymentReference?: string;
}

const GuestBookingManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchParams] = useSearchParams();
  
  const initialBooking: BookingData = location.state?.booking;
  const token = searchParams.get('token');
  const confirmationNumber = searchParams.get('confirmationNumber');
  const email = searchParams.get('email');
  
  const [booking, setBooking] = useState<BookingData | null>(initialBooking);
  const [loading, setLoading] = useState(!initialBooking); // Only load if no initial booking
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [pendingAction, setPendingAction] = useState<'modify' | 'cancel' | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Price modification tracking
  const [pricesModified, setPricesModified] = useState(false);
  const [originalPricing, setOriginalPricing] = useState<{pricePerNight: number, totalAmount: number} | null>(null);
  const [currentCalculatedTotal, setCurrentCalculatedTotal] = useState<number | null>(null);
  
    // Modification form state
  const [modificationData, setModificationData] = useState({
    newGuestName: booking?.guestName || '',
    newGuestEmail: booking?.guestEmail || '',
    newCheckInDate: formatDateForInput(booking?.checkInDate || ''),
    newCheckOutDate: formatDateForInput(booking?.checkOutDate || ''),
    newRoomType: booking?.roomType || '',
    newNumberOfGuests: booking?.numberOfGuests || 1,
    modificationReason: ''
  });
  
  // Cancellation form state
  const [cancellationReason, setCancellationReason] = useState('');

  // Calculate pricing for modified booking data
  const calculateModifiedPricing = useCallback((modData: typeof modificationData) => {
    if (!booking || !modData.newCheckInDate || !modData.newCheckOutDate) return null;
    
    const checkInDate = new Date(modData.newCheckInDate);
    const checkOutDate = new Date(modData.newCheckOutDate);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // For now, use the same price per night as the original booking
    // In a real app, this might involve an API call to get current pricing
    const basePricePerNight = booking.pricePerNight || 0;
    
    // Room type pricing adjustments (simplified)
    let roomMultiplier = 1;
    switch (modData.newRoomType.toLowerCase()) {
      case 'standard': roomMultiplier = 1; break;
      case 'deluxe': roomMultiplier = 1.3; break;
      case 'suite': roomMultiplier = 1.8; break;
      case 'presidential': roomMultiplier = 3; break;
      default: roomMultiplier = 1;
    }
    
    const newPricePerNight = basePricePerNight * roomMultiplier;
    const newTotalAmount = newPricePerNight * nights;
    
    return {
      pricePerNight: newPricePerNight,
      totalAmount: newTotalAmount,
      nights
    };
  }, [booking]);

  // Fetch booking data from token (for email links)
  const fetchBookingFromToken = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setErrorMessage('');
      
      const response = await fetch(buildApiUrl(`/booking-management?token=${token}&_t=${Date.now()}&_cache_bust=${Math.random()}`), {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to load booking');
      }

      const bookingData = await response.json();
      setBooking(bookingData);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch booking data from URL parameters (confirmation number and email)
  const fetchBookingFromParams = useCallback(async () => {
    if (!confirmationNumber || !email) return;
    
    try {
      setLoading(true);
      setErrorMessage('');
      
      const response = await fetch(
        `${buildApiUrl('/bookings/search')}?confirmationNumber=${encodeURIComponent(confirmationNumber)}&email=${encodeURIComponent(email)}&_t=${Date.now()}&_cache_bust=${Math.random()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Booking not found or access denied');
      }
      
      const bookingData = await response.json();
      setBooking(bookingData);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  }, [confirmationNumber, email]);

  // Fetch fresh booking data using confirmation number and email from initial booking
  const fetchFreshDataFromInitialBooking = useCallback(async () => {
    if (!initialBooking?.confirmationNumber || !initialBooking?.guestEmail) return;
    
    try {
      setLoading(true);
      setErrorMessage('');
      
      const response = await fetch(
        `${buildApiUrl('/bookings/search')}?confirmationNumber=${encodeURIComponent(initialBooking.confirmationNumber)}&email=${encodeURIComponent(initialBooking.guestEmail)}&_t=${Date.now()}&_cache_bust=${Math.random()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Booking not found or access denied');
      }
      
      const bookingData = await response.json();
      setBooking(bookingData);
    } catch (err) {
      setErrorMessage('Could not refresh booking data. Showing cached information.');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [initialBooking]);

  // Load booking data on component mount - ALWAYS fetch fresh data from server
  useEffect(() => {
    if (token) {
      // Always load from token, even if initial booking data exists (to get fresh data)
      fetchBookingFromToken();
    } else if (confirmationNumber && email) {
      // Always load from URL parameters (confirmation number and email) for fresh data
      fetchBookingFromParams();
    } else if (initialBooking && !token && !confirmationNumber && !email) {
      // If we only have initialBooking, fetch fresh data using its confirmation details
      fetchFreshDataFromInitialBooking();
    } else {
      // No token, no URL params, and no initial data - redirect to find booking
      setErrorMessage('No booking information available. Please search for your booking first.');
      setLoading(false);
    }
  }, [token, confirmationNumber, email, initialBooking, fetchBookingFromToken, fetchBookingFromParams, fetchFreshDataFromInitialBooking]);

  // Update modification form when booking data changes
  useEffect(() => {
    if (booking) {
      setModificationData({
        newGuestName: booking.guestName || '',
        newGuestEmail: booking.guestEmail || '',
        newCheckInDate: formatDateForInput(booking.checkInDate || ''),
        newCheckOutDate: formatDateForInput(booking.checkOutDate || ''),
        newRoomType: booking.roomType || '',
        newNumberOfGuests: booking.numberOfGuests || 1,
        modificationReason: ''
      });
      
      // Only reset price tracking if dialog is not open
      if (!modifyDialogOpen) {
        setPricesModified(false);
        setOriginalPricing(null);
        setCurrentCalculatedTotal(null);
      }
    }
  }, [booking, modifyDialogOpen]);

  // Track price changes during modification
  useEffect(() => {
    if (!modifyDialogOpen || !originalPricing) return;
    
    // Only track changes if the dialog is actually open and we have original pricing
    const newPricing = calculateModifiedPricing(modificationData);
    if (newPricing) {
      setCurrentCalculatedTotal(newPricing.totalAmount);
      
      // Check if prices have actually changed from original
      const hasChanged = Math.abs(newPricing.totalAmount - originalPricing.totalAmount) > 0.01 ||
                        Math.abs(newPricing.pricePerNight - originalPricing.pricePerNight) > 0.01;
      
      // Once prices are modified, keep them modified until dialog closes
      if (hasChanged) {
        setPricesModified(true);
      }
    }
  }, [modificationData, originalPricing, calculateModifiedPricing, modifyDialogOpen]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #ffffff 100%)',
          py: 4,
        }}
      >
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <StandardCard cardVariant="elevated">
            <Box sx={{ p: isMobile ? 3 : 5 }}>
              <CircularProgress />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Loading your booking...
              </Typography>
            </Box>
          </StandardCard>
        </Container>
      </Box>
    );
  }

  if (!booking) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #ffffff 100%)',
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <StandardCard cardVariant="elevated">
            <Box sx={{ p: isMobile ? 3 : 5 }}>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 0,
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(244, 67, 54, 0.1)' 
                    : 'rgba(244, 67, 54, 0.04)',
                }}
              >
                {errorMessage || 'No booking information available. Please search for your booking first.'}
              </Alert>
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="contained"
                  onClick={() => navigate('/guest-auth')}
                >
                  Find My Booking
                </Button>
              </Box>
            </Box>
          </StandardCard>
        </Container>
      </Box>
    );
  }

  const calculateNights = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString: string) => {
    return formatDateForDisplay(dateString);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'primary';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'checked in': return 'info';
      case 'checked out': return 'default';
      default: return 'default';
    }
  };

  // Helper function to get payment status color
  const getPaymentStatusColor = (status?: string): string => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return '#4caf50'; // Green
      case 'PROCESSING':
        return '#ff9800'; // Orange
      case 'PENDING':
      default:
        return '#f44336'; // Red
    }
  };

  const canModifyBooking = () => {
    const checkInDate = new Date(booking.checkInDate);
    const now = new Date();
    const daysBefore = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    return booking.status.toLowerCase() === 'confirmed' && daysBefore >= 1;
  };

  const canCancelBooking = () => {
    const checkInDate = new Date(booking.checkInDate);
    const now = new Date();
    
    return booking.status.toLowerCase() === 'confirmed' && checkInDate > now;
  };

  // Email authentication for modify/cancel actions
  const sendAuthenticationEmail = async (action: 'modify' | 'cancel') => {
    try {
      setAuthLoading(true);
      setAuthMessage('');
      setPendingAction(action);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/bookings/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmationNumber: booking.confirmationNumber,
          email: booking.guestEmail,
          action: action
        }),
      });

      const result = await response.json();

      if (result.success) {
        setAuthMessage(`Authentication email sent! Please check your email and click the link to ${action} your booking.`);
      } else {
        setAuthMessage(result.message || `Failed to send authentication email for ${action}. Please try again.`);
      }
    } catch (error) {
      console.error('Error sending authentication email:', error);
      setAuthMessage(`Failed to send authentication email for ${action}. Please try again.`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCloseModifyDialog = () => {
    setModifyDialogOpen(false);
    setPricesModified(false);
    setOriginalPricing(null);
    setCurrentCalculatedTotal(null);
  };

  const handleModifyBooking = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      
      const modificationRequest = {
        confirmationNumber: booking.confirmationNumber,
        guestEmail: booking.guestEmail, // Always send original email for authentication
        newGuestName: modificationData.newGuestName !== booking.guestName ? modificationData.newGuestName : undefined,
        newGuestEmail: modificationData.newGuestEmail !== booking.guestEmail ? modificationData.newGuestEmail : undefined,
        newCheckInDate: formatDateForAPI(modificationData.newCheckInDate) !== formatDateForAPI(booking.checkInDate) ? formatDateForAPI(modificationData.newCheckInDate) : undefined,
        newCheckOutDate: formatDateForAPI(modificationData.newCheckOutDate) !== formatDateForAPI(booking.checkOutDate) ? formatDateForAPI(modificationData.newCheckOutDate) : undefined,
        newRoomType: modificationData.newRoomType !== booking.roomType ? modificationData.newRoomType : undefined,
        newNumberOfGuests: modificationData.newNumberOfGuests !== booking.numberOfGuests ? modificationData.newNumberOfGuests : undefined,
        reason: modificationData.modificationReason
      };
      
      let response;
      
      if (token) {
        // Modify via token (from email link)
        const apiResponse = await fetch(buildApiUrl(`/booking-management?token=${token}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(modificationRequest),
        });
        
        if (!apiResponse.ok) {
          const errorText = await apiResponse.text();
          throw new Error(errorText || 'Failed to modify booking');
        }
        
        response = await apiResponse.json();
        
        if (response.success) {
          setSuccessMessage(response.message || 'Booking modified successfully');
          setModifyDialogOpen(false);
          
          // Wait a moment for backend cache eviction and database commit
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Force refresh the booking data from server to get latest state
          await fetchBookingFromToken();
          
          // Auto-clear success message after 5 seconds
          setTimeout(() => setSuccessMessage(''), 5000);
          
          // Update booking state with the modified booking data as fallback
          if (response.updatedBooking) {
            setBooking({
              ...booking,
              guestName: response.updatedBooking.guestName,
              guestEmail: response.updatedBooking.guestEmail,
              checkInDate: response.updatedBooking.checkInDate,
              checkOutDate: response.updatedBooking.checkOutDate,
              roomType: response.updatedBooking.roomType,
              numberOfGuests: response.updatedBooking.numberOfGuests,
              totalAmount: response.updatedBooking.totalAmount
            });
          }
        } else {
          setErrorMessage(response.message || 'Failed to modify booking');
        }
      } else {
        // Modify via booking API (from search)
        response = await bookingApiService.modifyBooking(modificationRequest);
        
        if (response.success) {
          setSuccessMessage(response.message || 'Booking modified successfully');
          setModifyDialogOpen(false);
          
          // Wait a moment for backend cache eviction and database commit
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Force refresh the booking data from server to get latest state
          if (token) {
            await fetchBookingFromToken();
          } else {
            // For search-based bookings, refresh by fetching again
            await fetchBookingFromParams();
          }
          
          // Auto-clear success message after 5 seconds
          setTimeout(() => setSuccessMessage(''), 5000);
          
          // Update booking state with the modified booking data as fallback
          if (response.data?.updatedBooking) {
            setBooking({
              ...booking,
              guestName: response.data.updatedBooking.guestName,
              guestEmail: response.data.updatedBooking.guestEmail,
              checkInDate: response.data.updatedBooking.checkInDate,
              checkOutDate: response.data.updatedBooking.checkOutDate,
              roomType: response.data.updatedBooking.roomType,
              numberOfGuests: response.data.updatedBooking.numberOfGuests,
              totalAmount: response.data.updatedBooking.totalAmount
            });
          }
        } else {
          setErrorMessage(response.message || 'Failed to modify booking');
        }
      }
    } catch (error) {
      setErrorMessage('An error occurred while modifying the booking');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      
      let response;
      
      if (token) {
        // Cancel via token (from email link)
        response = await fetch(buildApiUrl(`/booking-management?token=${token}`), {
          method: 'DELETE',
        });
      } else {
        // Cancel via booking API (from search)
        const cancellationRequest = {
          confirmationNumber: booking.confirmationNumber,
          guestEmail: booking.guestEmail,
          cancellationReason: cancellationReason
        };
        
        const apiResponse = await bookingApiService.cancelBooking(
          cancellationRequest.confirmationNumber,
          cancellationRequest.guestEmail,
          cancellationRequest.cancellationReason
        );
        
        if (apiResponse.success) {
          setSuccessMessage(apiResponse.message || 'Booking cancelled successfully');
          setCancelDialogOpen(false);
          
          // Update booking state to reflect cancellation
          setBooking({
            ...booking,
            status: 'Cancelled'
          });
          
          // Clear cancellation reason
          setCancellationReason('');
          return;
        } else {
          setErrorMessage(apiResponse.message || 'Failed to cancel booking');
          return;
        }
      }
      
      // Handle token-based cancellation response
      if (response && !response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to cancel booking');
      }

      if (response) {
        // Get the updated booking data from the response
        const updatedBooking = await response.json();
        
        setCancelDialogOpen(false);
        setSuccessMessage('Booking cancelled successfully');
        
        // Update the local booking state with the cancelled booking data
        setBooking(updatedBooking);
      }
    } catch (error) {
      setErrorMessage('Failed to cancel booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nights = calculateNights(booking.checkInDate, booking.checkOutDate);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #ffffff 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Success/Error Messages */}
        {successMessage && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3,
              borderRadius: 0,
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(76, 175, 80, 0.1)' 
                : 'rgba(76, 175, 80, 0.04)',
            }} 
            onClose={() => setSuccessMessage('')}
          >
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 0,
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(244, 67, 54, 0.1)' 
                : 'rgba(244, 67, 54, 0.04)',
            }} 
            onClose={() => setErrorMessage('')}
          >
            {errorMessage}
          </Alert>
        )}

        {/* Cancelled Booking Notice */}
        {booking.status.toLowerCase() === 'cancelled' && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3,
              borderRadius: 0,
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(33, 150, 243, 0.1)' 
                : 'rgba(33, 150, 243, 0.04)',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Booking Cancelled
            </Typography>
            <Typography variant="body2">
              This booking has been cancelled. If you need to make a new reservation, please visit our booking page.
              If you have questions about refunds, please contact the hotel directly.
            </Typography>
          </Alert>
        )}

        {/* Booking Header */}
        <StandardCard 
          cardVariant="elevated"
          sx={{ 
            mb: 4,
          }}
        >
          <Box sx={{ p: isMobile ? 3 : 5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography 
                  variant="h4" 
                  gutterBottom
                  sx={{
                    fontWeight: 'bold',
                    color: 'primary.main',
                  }}
                >
                  {t('booking.manage.title')}
                </Typography>
                <Typography 
                  variant="h6" 
                  color="primary"
                  sx={{
                    fontWeight: 'bold',
                  }}
                >
                  {t('booking.manage.confirmationLabel')}: {booking.confirmationNumber}
                </Typography>
              </Box>
              <Chip
                label={booking.status}
                color={getStatusColor(booking.status) as any}
                variant="filled"
              />
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
            startIcon={<EditIcon />}
            onClick={() => {
              if (token) {
                // User came from email link, show modify dialog directly
                setOriginalPricing({
                  pricePerNight: booking.pricePerNight,
                  totalAmount: booking.totalAmount
                });
                setModifyDialogOpen(true);
              } else {
                // User found booking through search, require email authentication
                sendAuthenticationEmail('modify');
              }
            }}
            disabled={!canModifyBooking() || authLoading}
          >
            {authLoading && pendingAction === 'modify' ? t('booking.manage.sendingEmail') : t('booking.manage.modifyBooking')}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            onClick={() => {
              if (token) {
                // User came from email link, show cancel dialog directly
                setCancelDialogOpen(true);
              } else {
                // User found booking through search, require email authentication
                sendAuthenticationEmail('cancel');
              }
            }}
            disabled={!canCancelBooking() || authLoading}
          >
            {authLoading && pendingAction === 'cancel' ? t('booking.manage.sendingEmail') : t('booking.manage.cancelBooking')}
          </Button>
        </Box>

        {/* Authentication Message */}
        {authMessage && (
          <Alert 
            severity={authMessage.includes('sent') ? 'success' : 'error'}
            sx={{ mt: 2 }}
          >
            {authMessage}
          </Alert>
        )}

            {!canModifyBooking() && booking.status.toLowerCase() === 'confirmed' && (
              <Alert 
                severity="info" 
                sx={{ 
                  mt: 2,
                  borderRadius: 0,
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(33, 150, 243, 0.1)' 
                    : 'rgba(33, 150, 243, 0.04)',
                }}
              >
                Modifications must be made at least 24 hours before check-in.
              </Alert>
            )}
          </Box>
        </StandardCard>

        {/* Booking Details Accordion */}
        <StandardCard 
          cardVariant="elevated"
          sx={{ 
            mb: 4,
          }}
        >
          <Accordion defaultExpanded sx={{ boxShadow: 'none' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{t('booking.manage.bookingDetails')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
          <Grid container spacing={3}>
            {/* Dates */}
            <Grid item xs={12} md={6}>
              <Box 
                sx={{
                  p: 2,
                  borderRadius: 0,
                  background: theme.palette.background.paper,
                  border: `1px solid rgba(224, 224, 224, 0.3)`,
                  boxShadow: 'none',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                    {t('booking.manage.stayDetails')}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>{t('booking.manage.checkIn')}:</strong> {formatDate(booking.checkInDate)}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>{t('booking.manage.checkOut')}:</strong> {formatDate(booking.checkOutDate)}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>{t('booking.manage.duration')}:</strong> {nights} night{nights !== 1 ? 's' : ''}
                </Typography>
                <Typography variant="body1" color={COLORS.PRIMARY} sx={{ fontWeight: 'bold' }}>
                  <strong>{t('booking.manage.totalAmount')}:</strong> ETB {booking.totalAmount?.toFixed(0)}
                </Typography>
              </Box>
            </Grid>

            {/* Hotel & Room */}
            <Grid item xs={12} md={6}>
              <Box 
                sx={{
                  p: 2,
                  borderRadius: 0,
                  background: theme.palette.background.paper,
                  border: `1px solid rgba(224, 224, 224, 0.3)`,
                  boxShadow: 'none',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HotelIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                    {t('booking.manage.hotelAndRoom')}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>{t('booking.manage.hotel')}:</strong> {booking.hotelName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {booking.hotelAddress}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>{t('booking.manage.roomType')}:</strong> {getRoomTypeLabel(booking.roomType)}
                </Typography>
                <Typography variant="body1" sx={{ color: 'success.main', fontWeight: 'bold', mb: 1 }}>
                  <strong>{t('booking.manage.roomAssignment')}:</strong> {t('booking.manage.roomAssignmentNote')}
                </Typography>
                <Typography variant="body1">
                  <strong>{t('booking.manage.rate')}:</strong> ETB {booking.pricePerNight?.toFixed(0)}/night
                </Typography>
              </Box>
            </Grid>

            {/* Guest Information */}
            <Grid item xs={12}>
              <Box 
                sx={{
                  p: 2,
                  borderRadius: 0,
                  background: theme.palette.background.paper,
                  border: `1px solid rgba(224, 224, 224, 0.3)`,
                  boxShadow: 'none',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                    {t('booking.manage.guestInformation')}
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>{t('booking.manage.name')}:</strong> {booking.guestName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>{t('booking.manage.email')}:</strong> {booking.guestEmail}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>{t('booking.manage.numberOfGuests')}:</strong> {booking.numberOfGuests || 1}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Payment Information */}
            <Grid item xs={12}>
              <Box 
                sx={{
                  p: 2,
                  borderRadius: 0,
                  background: theme.palette.background.paper,
                  border: `1px solid rgba(224, 224, 224, 0.3)`,
                  boxShadow: 'none',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                    {t('booking.manage.paymentInformation')}
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>{t('booking.manage.paymentStatus')}:</strong>{' '}
                      <Typography 
                        component="span" 
                        sx={{ 
                          color: getPaymentStatusColor(booking.paymentStatus),
                          fontWeight: 'bold'
                        }}
                      >
                        {booking.paymentStatus || 'PENDING'}
                      </Typography>
                    </Typography>
                  </Grid>
                  {booking.paymentReference && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>{t('booking.manage.paymentReference')}:</strong> {booking.paymentReference}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </StandardCard>      {/* Modification Dialog */}
      <Dialog open={modifyDialogOpen} onClose={handleCloseModifyDialog} maxWidth="md" fullWidth>
        <DialogTitle>{t('booking.manage.modifyDialogTitle')}</DialogTitle>
        <DialogContent>
          {/* Price Change Indicator - Large and Prominent */}
          {pricesModified && originalPricing && currentCalculatedTotal !== null && (
            <Box sx={{ 
              mb: 3, 
              p: 3, 
              backgroundColor: '#e3f2fd',
              border: '2px solid #2196f3',
              borderRadius: 2,
              textAlign: 'center'
            }}>
              <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2 }}>
                🔄 PRICING UPDATED
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <Typography variant="h6" sx={{ color: '#666' }}>Original Total</Typography>
                  <Typography variant="h4" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                    ${originalPricing.totalAmount.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h6" sx={{ color: '#666' }}>New Total</Typography>
                  <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                    ${currentCalculatedTotal.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h6" sx={{ color: '#666' }}>
                    {currentCalculatedTotal > originalPricing.totalAmount ? 'Additional Cost' : 'Savings'}
                  </Typography>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      color: currentCalculatedTotal > originalPricing.totalAmount ? '#d32f2f' : '#2e7d32',
                      fontWeight: 'bold'
                    }}
                  >
                    {currentCalculatedTotal > originalPricing.totalAmount ? '+' : ''}
                    ${(currentCalculatedTotal - originalPricing.totalAmount).toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
              <Typography variant="body1" sx={{ color: '#1976d2', fontStyle: 'italic' }}>
                This pricing update will persist until you close this dialog
              </Typography>
            </Box>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label={t('booking.manage.guestName')}
                fullWidth
                value={modificationData.newGuestName}
                onChange={(e) => setModificationData({ ...modificationData, newGuestName: e.target.value })}
                helperText={t('booking.manage.guestNameHelp')}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t('booking.manage.emailAddress')}
                type="email"
                fullWidth
                value={modificationData.newGuestEmail}
                onChange={(e) => setModificationData({ ...modificationData, newGuestEmail: e.target.value })}
                helperText={t('booking.manage.emailHelp')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t('booking.manage.checkInDate')}
                type="date"
                fullWidth
                value={modificationData.newCheckInDate}
                onChange={(e) => setModificationData({ ...modificationData, newCheckInDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: getTodayForInput() }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t('booking.manage.checkOutDate')}
                type="date"
                fullWidth
                value={modificationData.newCheckOutDate}
                onChange={(e) => setModificationData({ ...modificationData, newCheckOutDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: modificationData.newCheckInDate }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t('booking.manage.numberOfGuests')}
                type="number"
                fullWidth
                value={modificationData.newNumberOfGuests}
                onChange={(e) => setModificationData({ ...modificationData, newNumberOfGuests: parseInt(e.target.value) || 1 })}
                inputProps={{ min: 1, max: 10 }}
                helperText={t('booking.manage.numberOfGuestsHelp')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t('booking.manage.roomType')}
                fullWidth
                select
                value={modificationData.newRoomType}
                onChange={(e) => setModificationData({ ...modificationData, newRoomType: e.target.value })}
              >
                <MenuItem value="">{t('booking.manage.selectRoomType')}</MenuItem>
                {ROOM_TYPES.map((roomType) => (
                  <MenuItem key={roomType.value} value={roomType.value}>
                    {getRoomTypeLabel(roomType.value)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t('booking.manage.reasonForModification')}
                fullWidth
                value={modificationData.modificationReason}
                onChange={(e) => setModificationData({ ...modificationData, modificationReason: e.target.value })}
                helperText={t('booking.manage.reasonHelp')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModifyDialog}>{t('booking.manage.cancel')}</Button>
          <Button
            onClick={handleModifyBooking}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <EditIcon />}
          >
            {loading ? t('booking.manage.modifying') : t('booking.manage.modifyBookingAction')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancellation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('booking.manage.cancelDialogTitle')}</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>{t('booking.manage.cancellationPolicy')}:</strong><br />
              {t('booking.manage.cancellationPolicyDetails')}
            </Typography>
          </Alert>
          <TextField
            label={t('booking.manage.reasonForCancellation')}
            fullWidth
            multiline
            rows={3}
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            sx={{ mt: 2 }}
            helperText={t('booking.manage.cancellationReasonHelp')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>{t('booking.manage.keepBooking')}</Button>
          <Button
            onClick={handleCancelBooking}
            variant="contained"
            color="error"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CancelIcon />}
          >
            {loading ? t('booking.manage.cancelling') : t('booking.manage.cancelBookingAction')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
        {booking.status.toLowerCase() === 'cancelled' ? (
          <>
            <Button
              variant="contained"
              onClick={() => navigate('/hotels/search')}
            >
              Make New Booking
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/find-booking')}
            >
              Find Another Booking
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
            >
              Return Home
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outlined"
              onClick={() => navigate('/find-booking')}
            >
              Find Another Booking
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
            >
              Return Home
            </Button>
          </>
        )}
      </Box>
    </Container>
  </Box>
);
};

export default GuestBookingManagementPage;
