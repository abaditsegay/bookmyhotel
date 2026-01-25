import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  IconButton,
  Divider,
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
import { ROOM_TYPE_VALUES } from '../../constants/roomTypes';
import { formatDateForDisplay, formatDateForInput } from '../../utils/dateUtils';

// Import our new design system components
import {
  MuiButton,
  MuiCard,
  FormField,
  StatusChip,
  InfoField,
  LoadingSpinner,
  EmptyState,
  designSystem
} from '../ui';

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

  const { token, user } = useAuth();
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
          setError(result.message || `Booking not found for ID: ${reservationId}`);
        }
      } catch (err) {
        setError('Failed to load booking details');
        // console.error('Error loading booking:', err);
      } finally {
        setLoading(false);
      }
    }, [id, token, mode, tenant?.id]);

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
    setPricesModified(false);
    setOriginalPricing(null);
  };

  // Render loading state using design system
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: designSystem.spacing.lg }}>
        <LoadingSpinner size={60} message="Loading booking details..." />
      </Container>
    );
  }

  // Render error state using design system
  if (error && !booking) {
    return (
      <Container maxWidth="lg" sx={{ py: designSystem.spacing.lg }}>
        <EmptyState
          title="Booking Not Found"
          description={error}
          action={
            <MuiButton 
              variant="outlined" 
              onClick={() => navigate(-1)}
              startIcon={<ArrowBackIcon />}
            >
              Go Back
            </MuiButton>
          }
        />
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: designSystem.spacing.lg,
        px: { xs: designSystem.spacing.md, sm: designSystem.spacing.lg }
      }}
    >
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: designSystem.spacing.xl,
        flexWrap: 'wrap',
        gap: designSystem.spacing.md
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.md }}>
          <IconButton 
            onClick={() => navigate(-1)}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>

        {booking && (
          <Box sx={{ display: 'flex', gap: designSystem.spacing.sm, alignItems: 'center' }}>
            <StatusChip 
              status={booking.status} 
              category="booking" 
              size="medium"
            />
            <StatusChip 
              status={booking.paymentStatus} 
              category="payment" 
              size="medium"
            />
            {!isEditing ? (
              <MuiButton
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                size="medium"
              >
                Edit
              </MuiButton>
            ) : (
              <Box sx={{ display: 'flex', gap: designSystem.spacing.sm }}>
                <MuiButton
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={() => {/* TODO: handleSave */}}
                  size="medium"
                >
                  Save
                </MuiButton>
                <MuiButton
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  size="medium"
                >
                  Cancel
                </MuiButton>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {booking && (
        <Grid container spacing={designSystem.spacing.lg}>
          {/* Guest Information Card */}
          <Grid item xs={12} md={6}>
            <MuiCard title="Guest Information" cardVariant="default">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: designSystem.spacing.lg }}>
                {isEditing ? (
                  <FormField
                    label="Guest Name"
                    value={editedBooking?.guestName || ''}
                    onChange={(e) => setEditedBooking(prev => prev ? {...prev, guestName: e.target.value} : null)}
                    required
                  />
                ) : (
                  <InfoField label="Guest Name" value={booking.guestName} />
                )}

                {isEditing ? (
                  <FormField
                    label="Guest Email"
                    type="email"
                    value={editedBooking?.guestEmail || ''}
                    onChange={(e) => setEditedBooking(prev => prev ? {...prev, guestEmail: e.target.value} : null)}
                    required
                  />
                ) : (
                  <InfoField label="Guest Email" value={booking.guestEmail} copyable />
                )}

                <InfoField 
                  label="Confirmation Number" 
                  value={booking.confirmationNumber} 
                  copyable 
                />
              </Box>
            </MuiCard>
          </Grid>

          {/* Hotel Information Card */}
          <Grid item xs={12} md={6}>
            <MuiCard title="Hotel Information" cardVariant="default">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: designSystem.spacing.lg }}>
                <InfoField label="Hotel Name" value={booking.hotelName} />
                <InfoField label="Hotel Address" value={booking.hotelAddress} />
                <InfoField 
                  label="Reservation ID" 
                  value={booking.reservationId?.toString()} 
                  copyable 
                />
              </Box>
            </MuiCard>
          </Grid>
        </Grid>
      )}

      {/* Success/Error Snackbars */}
      <Snackbar 
        open={!!success} 
        autoHideDuration={4000} 
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UnifiedBookingDetails;