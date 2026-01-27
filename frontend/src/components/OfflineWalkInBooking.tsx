import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  Button,
  Grid,
  Card,
  Alert,
  Chip,
  CircularProgress,
  Divider,
  Stepper,
  Step,
  StepLabel,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,

  useTheme,
} from '@mui/material';
import PremiumTextField from './common/PremiumTextField';
import PremiumDatePicker from './common/PremiumDatePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { useTranslation } from 'react-i18next';
import { API_CONFIG } from '../config/apiConfig';
import { offlineStorage, OfflineBooking, GuestInfo, CachedRoom } from '../services/OfflineStorageService';
import { syncManager } from '../services/SyncManager';
import { roomCacheService } from '../services/RoomCacheService';
import NumberStepper from './common/NumberStepper';
import { COLORS, addAlpha } from '../theme/themeColors';
import { formatCurrency } from '../utils/currencyUtils';

// Define interfaces for offline walk-in booking (matching online version EXACTLY)
interface WalkInGuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface AvailableRoom {
  id: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  capacity: number;
  description?: string;
  isAvailable?: boolean;
}

interface OfflineWalkInBookingProps {
  hotelId?: number;
  onBookingComplete?: (booking: OfflineBooking) => void;
}

// Room types and payment methods for dropdowns (can be added back if needed for future features)

const OfflineWalkInBooking: React.FC<OfflineWalkInBookingProps> = ({
  hotelId,
  onBookingComplete
}) => {
  const { token, user } = useAuth(); // Match exact order from main component
  const { tenantId } = useTenant(); // Match exact usage from main component
  const { t } = useTranslation();
  const theme = useTheme(); // Add theme hook
  
  const steps = [
    t('dashboard.hotelAdmin.offlineBooking.steps.guestInformation'),
    t('dashboard.hotelAdmin.offlineBooking.steps.roomSelection'), 
    t('dashboard.hotelAdmin.offlineBooking.steps.confirmation')
  ];
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // API base URL for backend calls (same as main component)
  const API_BASE_URL = API_CONFIG.SERVER_URL;
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [roomsLoading, setRoomsLoading] = useState(false);
  
    // Guest information (matching online version exactly)
  const [guestInfo, setGuestInfo] = useState<WalkInGuestInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  
  // Booking details (matching online version exactly)
  const [checkInDate, setCheckInDate] = useState<Date>(new Date());
  const [checkOutDate, setCheckOutDate] = useState<Date>(addDays(new Date(), 1));
  const [guests, setGuests] = useState<number>(1);
  const [specialRequests, setSpecialRequests] = useState<string>('');
  
  // Available rooms (offline version uses predefined rooms)
  const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<AvailableRoom | null>(null);
  
  // Guest search functionality
  const [showGuestSearch, setShowGuestSearch] = useState(false);
  const [guestSearchQuery, setGuestSearchQuery] = useState('');
  const [foundGuests, setFoundGuests] = useState<GuestInfo[]>([]);
  
  // Offline booking data for display
  const [, setOfflineBookings] = useState<OfflineBooking[]>([]);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [cachedRooms, setCachedRooms] = useState<CachedRoom[]>([]);
  const [roomsLoaded, setRoomsLoaded] = useState(false);

  // Load room data from cache
  const loadRoomsFromCache = useCallback(async () => {
    const resolvedHotelId = hotelId || (user?.hotelId ? parseInt(user.hotelId) : null);
    
    if (!resolvedHotelId) {
      // console.warn('⚠️ No hotelId available for room cache loading - neither from props nor user data');
      setError('Hotel ID is required to load room data. Please ensure you are logged in with proper hotel access.');
      setRoomsLoaded(true);
      return;
    }
    
    try {
      // console.log('📦 Loading rooms from cache for hotel:', resolvedHotelId);
      const rooms = await roomCacheService.getRooms(resolvedHotelId);
      setCachedRooms(rooms);
      setRoomsLoaded(true);
      // console.log(`✅ Loaded ${rooms.length} cached rooms`);
      
      // If no cached rooms, try to fetch fresh data
      if (rooms.length === 0 && navigator.onLine && token) {
        // console.log('🔄 No cached rooms found, fetching fresh data...');
        try {
          const freshRooms = await roomCacheService.fetchAndCacheRooms(resolvedHotelId);
          setCachedRooms(freshRooms);
          // console.log(`✨ Fetched and cached ${freshRooms.length} fresh rooms`);
        } catch (fetchError) {
          // console.warn('Failed to fetch fresh room data:', fetchError);
        }
      }
    } catch (error) {
      // console.error('Failed to load cached rooms:', error);
      setRoomsLoaded(true); // Still mark as loaded to prevent infinite loading
    }
  }, [hotelId, token, user?.hotelId]);

  // Initialize room caching when component loads
  useEffect(() => {
    const initializeRooms = async () => {
      if (hotelId && token && !roomsLoaded) {
        try {
          // Initialize offline storage first
          await offlineStorage.init();
          
          // Then load rooms from cache
          await loadRoomsFromCache();
          
          // Start periodic refresh for this hotel
          roomCacheService.startPeriodicRefresh(hotelId);
        } catch (error) {
          // console.error('Failed to initialize rooms:', error);
          setRoomsLoaded(true); // Prevent infinite retry
        }
      }
    };

    initializeRooms();
    
    // Cleanup on unmount
    return () => {
      roomCacheService.stopPeriodicRefresh();
    };
  }, [hotelId, token, roomsLoaded, loadRoomsFromCache]);

  // Memoized change handlers (matching online version)
  // Memoized change handlers to prevent input focus loss (matching online component exactly)
  const handleGuestInfoChange = React.useCallback((field: keyof WalkInGuestInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuestInfo(prev => ({ ...prev, [field]: e.target.value }));
  }, []);

  const handleGuestsChange = React.useCallback((newValue: number) => {
    setGuests(newValue);
  }, []);

  const handleSpecialRequestsChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSpecialRequests(e.target.value);
  }, []);

  // Stepper navigation (matching online component exactly)
  const handleNext = () => {
    if (activeStep === 0) {
      // Validate guest information
      if (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email || !guestInfo.phone) {
        setError(t('dashboard.hotelAdmin.offlineBooking.validationErrors.fillGuestInfo'));
        return;
      }
      if (!guestInfo.email.includes('@')) {
        setError(t('dashboard.hotelAdmin.offlineBooking.validationErrors.invalidEmail'));
        return;
      }
    } else if (activeStep === 1) {
      // Validate room selection
      if (!selectedRoom) {
        setError(t('dashboard.hotelAdmin.offlineBooking.validationErrors.selectRoom'));
        return;
      }
    }
    
    setError(null);
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Calculate total amount (matching online component)
  const calculateTotalAmount = () => {
    if (!selectedRoom) return 0;
    
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    return selectedRoom.pricePerNight * nights;
  };

  // Render step content (EXACTLY matching online component)
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Card sx={{ 
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            elevation: 0,
          }}>
            <CardContent sx={{ p: 4 }}>
              {/* Guest Information Section */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                mb: 4,
                p: 2,
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5, color: COLORS.PRIMARY }}>
                    {t('dashboard.hotelAdmin.offlineBooking.guestInformation.title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('dashboard.hotelAdmin.offlineBooking.guestInformation.description')}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    fullWidth
                    label={t('dashboard.hotelAdmin.offlineBooking.guestInformation.firstName')}
                    value={guestInfo.firstName}
                    onChange={handleGuestInfoChange('firstName')}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    fullWidth
                    label={t('dashboard.hotelAdmin.offlineBooking.guestInformation.lastName')}
                    value={guestInfo.lastName}
                    onChange={handleGuestInfoChange('lastName')}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    fullWidth
                    label={t('dashboard.hotelAdmin.offlineBooking.guestInformation.email')}
                    type="email"
                    value={guestInfo.email}
                    onChange={handleGuestInfoChange('email')}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    fullWidth
                    label={t('dashboard.hotelAdmin.offlineBooking.guestInformation.phone')}
                    value={guestInfo.phone}
                    onChange={handleGuestInfoChange('phone')}
                    required
                  />
                </Grid>
              </Grid>

              {/* Stay Details Section */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                mb: 3,
                mt: 4,
                p: 2,
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5, color: COLORS.PRIMARY }}>
                    {t('dashboard.hotelAdmin.offlineBooking.bookingDetails.stayDetailsTitle')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('dashboard.hotelAdmin.offlineBooking.validationErrors.selectDatesAndGuests')}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <PremiumDatePicker
                      label={t('dashboard.hotelAdmin.offlineBooking.bookingDetails.checkInDate')}
                      value={checkInDate}
                      onChange={(newValue) => newValue && setCheckInDate(newValue)}
                      minDate={new Date()}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <PremiumDatePicker
                      label={t('dashboard.hotelAdmin.offlineBooking.bookingDetails.checkOutDate')}
                      value={checkOutDate}
                      onChange={(newValue) => newValue && setCheckOutDate(newValue)}
                      minDate={addDays(checkInDate, 1)}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <NumberStepper
                    value={guests}
                    onChange={handleGuestsChange}
                    min={1}
                    max={10}
                    label={t('dashboard.hotelAdmin.offlineBooking.roomSelection.numberOfGuests')}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
        
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
            {/* Room Selection Header */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold',
                mb: 1
              }}>
                {t('dashboard.hotelAdmin.offlineBooking.bookingDetails.availableRoomsTitle')}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {format(checkInDate, 'MMM dd, yyyy')} - {format(checkOutDate, 'MMM dd, yyyy')} • {guests} Guest{guests !== 1 ? 's' : ''}
              </Typography>
            </Box>

            {/* Scrollable Room Content */}
            <Box 
              sx={{ 
                flex: 1,
                maxHeight: '400px',
                overflowY: 'auto',
                pr: 1,
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: theme.palette.action.hover,
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: theme.palette.action.disabled,
                  borderRadius: '10px',
                  '&:hover': {
                    background: theme.palette.action.focus,
                  },
                },
              }}
            >
              {roomsLoading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress size={40} />
                  <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                    Loading available rooms...
                  </Typography>
                </Box>
              ) : availableRooms.length === 0 ? (
                <Alert severity="warning">
                  {t('dashboard.hotelAdmin.offlineBooking.validationErrors.noRoomsAvailable', {
                    guests,
                    plural: guests !== 1 ? 's' : '',
                    checkIn: format(checkInDate, 'MMM dd'),
                    checkOut: format(checkOutDate, 'MMM dd')
                  })}
                </Alert>
              ) : (
                <>
                  <Grid container spacing={2}>
                    {availableRooms.map((room) => (
                      <Grid item xs={12} sm={6} md={4} key={room.id}>
                        <Card 
                          sx={{ 
                            cursor: 'pointer',
                            border: selectedRoom?.id === room.id ? '3px solid' : '1px solid',
                            borderColor: selectedRoom?.id === room.id ? '#E8B86D' : 'divider',
                            borderLeft: selectedRoom?.id === room.id ? '6px solid #E8B86D' : '3px solid #E8B86D',
                            backgroundColor: selectedRoom?.id === room.id ? 'action.selected' : 'background.paper',
                            elevation: 0,
                            borderRadius: 2,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              borderColor: '#E8B86D',
                              backgroundColor: 'action.hover',
                              transform: 'translateY(-2px)',
                              boxShadow: 3,
                            }
                          }}
                          onClick={() => setSelectedRoom(room)}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 'bold',
                                color: 'text.primary',
                                fontSize: '1.1rem'
                              }}>
                                {t('dashboard.hotelAdmin.offlineBooking.roomSelection.roomNumber', { number: room.roomNumber })}
                              </Typography>
                              <Chip 
                                label={room.roomType.toUpperCase()} 
                                size="small" 
                                variant="outlined"
                                sx={{
                                  borderColor: '#E8B86D',
                                  color: '#B8860B',
                                  fontWeight: 'medium',
                                  fontSize: '0.75rem'
                                }}
                              />
                            </Box>
                            <Typography variant="body2" sx={{ 
                              color: 'text.secondary',
                              mb: 1,
                              fontSize: '0.875rem'
                            }}>
                              {t('dashboard.hotelAdmin.offlineBooking.roomSelection.capacity', { 
                                capacity: room.capacity,
                                plural: room.capacity !== 1 ? 's' : ''
                              })}
                            </Typography>
                            {room.description && (
                              <Typography variant="body2" sx={{ 
                                color: 'text.secondary',
                                mb: 3,
                                fontSize: '0.875rem',
                                lineHeight: 1.4
                              }}>
                                {room.description}
                              </Typography>
                            )}
                            <Typography variant="h6" sx={{
                              color: '#B8860B',
                              fontWeight: 'bold',
                              fontSize: '1.2rem'
                            }}>
                              {formatCurrency(room.pricePerNight || 0)}{t('dashboard.hotelAdmin.offlineBooking.roomSelection.pricePerNightShort')}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  {selectedRoom && (
                    <Box sx={{ mt: 3, mb: 2 }}>
                      <PremiumTextField
                        fullWidth
                        label={t('dashboard.hotelAdmin.offlineBooking.bookingDetails.specialRequests')}
                        multiline
                        rows={3}
                        value={specialRequests}
                        onChange={handleSpecialRequestsChange}
                        placeholder="Any special requests or notes for the guest stay..."
                      />
                    </Box>
                  )}
                </>
              )}
            </Box>

            {/* Always Visible Action Buttons for Room Selection */}
            <Box 
              sx={{ 
                mt: 2,
                pt: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>
                {selectedRoom && (
                  <Typography variant="body2" sx={{ 
                    fontWeight: 'medium',
                    color: '#B8860B'
                  }}>
                    ✓ Room {selectedRoom.roomNumber} selected
                  </Typography>
                )}
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  onClick={handleBack} 
                  disabled={loading}
                  sx={{ 
                    minWidth: 100,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    fontWeight: 'medium',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  {t('dashboard.hotelAdmin.offlineBooking.actions.back')}
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleNext}
                  disabled={loading || !selectedRoom || roomsLoading}
                  sx={{ 
                    minWidth: 120,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                  }}
                >
                  {roomsLoading ? t('dashboard.hotelAdmin.offlineBooking.actions.loading') : t('dashboard.hotelAdmin.offlineBooking.actions.next')}
                </Button>
              </Box>
            </Box>
          </Box>
        );
        
      case 2:
        return (
          <Box>
            {/* Confirmation Header */}
            <Box sx={{ 
              textAlign: 'center',
              mb: 4,
              p: 3,
              backgroundColor: 'background.paper',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 700,
                mb: 1,
              }}>
                {t('dashboard.hotelAdmin.offlineBooking.confirmation.title')}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {t('dashboard.hotelAdmin.offlineBooking.confirmation.description')}
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              {/* Guest Information */}
              <Grid item xs={12} sm={6}>
                <Card elevation={2} sx={{ 
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      mb: 2,
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {t('dashboard.hotelAdmin.offlineBooking.confirmation.guestInformationTitle')}
                      </Typography>
                    </Box>
                    <Box sx={{ space: 1.5 }}>
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                          {t('walkInBooking.confirmation.fullName')}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {guestInfo.firstName} {guestInfo.lastName}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                          {t('dashboard.hotelAdmin.offlineBooking.confirmation.emailLabel')}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {guestInfo.email}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                          {t('dashboard.hotelAdmin.offlineBooking.confirmation.phoneLabel')}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {guestInfo.phone}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Stay Details */}
              <Grid item xs={12} sm={6}>
                <Card elevation={2} sx={{ 
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {t('dashboard.hotelAdmin.offlineBooking.confirmation.roomDetailsTitle')}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ space: 1.5 }}>
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                          {t('dashboard.hotelAdmin.offlineBooking.confirmation.roomLabel')}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {selectedRoom?.roomNumber} ({selectedRoom?.roomType})
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                          {t('dashboard.hotelAdmin.offlineBooking.confirmation.checkInLabel')} - {t('dashboard.hotelAdmin.offlineBooking.confirmation.checkOutLabel')}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {format(checkInDate, 'MMM dd, yyyy')} - {format(checkOutDate, 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                          {t('dashboard.hotelAdmin.offlineBooking.confirmation.guestsLabel')}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {guests} {guests !== 1 ? t('walkInBooking.confirmation.guestPlural') : t('walkInBooking.confirmation.guest')}
                        </Typography>
                      </Box>
                      {specialRequests && (
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                            {t('dashboard.hotelAdmin.offlineBooking.confirmation.specialRequestsLabel')}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontStyle: 'italic' }}>
                            {specialRequests}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Pricing Summary */}
              <Grid item xs={12}>
                <Card elevation={3} sx={{ 
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      mb: 3,
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {t('dashboard.hotelAdmin.offlineBooking.confirmation.pricingSummaryTitle')}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      p: 2,
                      bgcolor: 'action.hover',
                      borderRadius: 2,
                      mb: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body1">
                          {(() => {
                            const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
                            return `${formatCurrency(selectedRoom?.pricePerNight || 0)}/night × ${nights} ${nights !== 1 ? 'nights' : 'night'}`;
                          })()}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {formatCurrency(calculateTotalAmount() || 0)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 2,
                      bgcolor: '#E8B86D',
                      borderRadius: 2,
                      mb: 2,
                    }}>
                      <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
                        {t('dashboard.hotelAdmin.offlineBooking.confirmation.totalAmountTitle')}
                      </Typography>
                      <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                        {formatCurrency(calculateTotalAmount() || 0)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{
                      p: 2,
                      bgcolor: 'rgba(232, 184, 109, 0.1)',
                      color: '#B8860B',
                      borderRadius: 2,
                      textAlign: 'center',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {t('dashboard.hotelAdmin.offlineBooking.confirmation.paymentNote')}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
        
      default:
        return null;
    }
  };

  const loadOfflineBookings = useCallback(async () => {
    const resolvedHotelId = hotelId || (user?.hotelId ? parseInt(user.hotelId) : null);
    
    try {
      const bookings = await offlineStorage.getOfflineBookings(resolvedHotelId || undefined);
      // console.log('🔍 Debug: Loaded offline bookings:', bookings.length, 'for hotel:', resolvedHotelId);
      // console.log('🔍 Debug: Booking statuses:', bookings.map(b => `${b.id}: ${b.status}`));
      setOfflineBookings(bookings);
    } catch (error) {
      // console.error('Failed to load offline bookings:', error);
    }
  }, [hotelId, user?.hotelId]);

  const loadPendingSyncCount = useCallback(async () => {
    try {
      const pendingBookings = await offlineStorage.getPendingSyncBookings();
      setPendingSyncCount(pendingBookings.length);
    } catch (error) {
      // console.error('Failed to load pending sync count:', error);
    }
  }, []);

  // Initialize offline storage and load data
  useEffect(() => {
    const initializeOfflineSupport = async () => {
      try {
        await offlineStorage.init();
        await loadOfflineBookings();
        await loadPendingSyncCount();
        
        // Debug: Check database state after initialization
        setTimeout(() => {
          offlineStorage.debugDatabase();
        }, 1000);
      } catch (error) {
        // console.error('Failed to initialize offline storage:', error);
        setError('Failed to initialize offline support');
      }
    };

    initializeOfflineSupport();
  }, [hotelId, loadOfflineBookings, loadPendingSyncCount]);

  // Enhanced room loading: Try API first, fallback to offline data
  useEffect(() => {
    const loadAvailableRooms = async () => {
      if (activeStep !== 1) return;
      
      setRoomsLoading(true);
      setError(null);
      
      try {
        let rooms: AvailableRoom[] = [];
        let dataSource = 'offline';
        
        // Load from same API endpoints as main walk-in booking component
        // Use same validation logic as main component
        const resolvedHotelId = hotelId || (user?.hotelId ? parseInt(user.hotelId) : null);
        
        if (!resolvedHotelId || !token) {
          // console.log('Cannot load rooms - missing hotelId or token:', { hotelId: resolvedHotelId, hasToken: !!token });
          // Fall back to cached room data
          // console.log('💾 Using cached room data due to missing hotelId or token');
          rooms = cachedRooms.filter(room => room.capacity >= guests);
          dataSource = 'cached';
        } else {
          try {
            // console.log('🌐 Loading room data from same API as main walk-in booking...');
            
            const isHotelAdmin = user?.role === 'HOTEL_ADMIN' || user?.roles?.includes('HOTEL_ADMIN');
            
            const headers: Record<string, string> = {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            };
            
            if (tenantId) {
              headers['X-Tenant-ID'] = tenantId;
            }
            
            if (isHotelAdmin) {
              // Use hotel admin API (same as main walk-in booking)
              const params = new URLSearchParams({
                checkInDate: format(checkInDate, 'yyyy-MM-dd'),
                checkOutDate: format(checkOutDate, 'yyyy-MM-dd'),
                guests: guests.toString(),
                page: '0',
                size: '100'
              });
              
              // console.log('Hotel admin fetching available rooms for date range:', format(checkInDate, 'yyyy-MM-dd'), 'to', format(checkOutDate, 'yyyy-MM-dd'), 'guests:', guests);
              
              const response = await fetch(`${API_BASE_URL}/api/hotel-admin/available-rooms?${params.toString()}`, {
                headers
              });
              
              if (response.ok) {
                const data = await response.json();
                // Convert hotel admin room format to AvailableRoom format (same as main component)
                rooms = data.map((room: any) => ({
                  id: room.id,
                  roomNumber: room.roomNumber,
                  roomType: room.roomType,
                  pricePerNight: room.pricePerNight,
                  capacity: room.capacity,
                  description: room.description,
                  isAvailable: room.isAvailable
                }));
                dataSource = 'api';
                // console.log(`✅ Loaded ${rooms.length} rooms from hotel admin API`);
              } else {
                throw new Error(`Failed to fetch available rooms: ${response.status}`);
              }
            } else {
              // Use front desk API (same as main walk-in booking)
              const params = new URLSearchParams({
                checkInDate: format(checkInDate, 'yyyy-MM-dd'),
                checkOutDate: format(checkOutDate, 'yyyy-MM-dd'),
                guests: guests.toString()
              });
              
              // console.log('Front desk fetching available rooms for date range:', format(checkInDate, 'yyyy-MM-dd'), 'to', format(checkOutDate, 'yyyy-MM-dd'), 'guests:', guests);
              
              const response = await fetch(`${API_BASE_URL}/api/front-desk/hotels/${resolvedHotelId}/available-rooms?${params.toString()}`, {
                headers
              });
              
              if (response.ok) {
                const roomsData = await response.json();
                // Convert front desk room format to AvailableRoom format (same as main component)
                rooms = roomsData.map((room: any) => ({
                  id: room.id,
                  roomNumber: room.roomNumber,
                  roomType: room.roomType,
                  pricePerNight: room.pricePerNight,
                  capacity: room.capacity,
                  description: room.description,
                  isAvailable: true // Front desk API only returns available rooms
                }));
                dataSource = 'api';
                // console.log(`✅ Loaded ${rooms.length} rooms from front desk API`);
              } else {
                throw new Error(`Failed to fetch available rooms: ${response.status}`);
              }
            }
          } catch (apiError) {
            // console.log('🔄 API call failed, using offline fallback data:', apiError);
          }
        }
        
        // Apply same filtering logic as main walk-in booking component
        if (rooms.length > 0) {
          // Filter rooms that can accommodate the guest count (same as main component)
          const filteredRooms = rooms.filter(room => 
            room.capacity >= guests && 
            (room.isAvailable !== false)
          );
          rooms = filteredRooms;
          // console.log(`🔍 API rooms: Filtered ${filteredRooms.length} available rooms from ${rooms.length} total rooms for ${guests} guests`);
        } 
        
        // Always check enhanced cached room availability for additional/fallback rooms
        // console.log('💾 Checking enhanced cached room availability data...');
        let cachedAvailableRooms: AvailableRoom[] = [];
        try {
          if (resolvedHotelId) {
            const availableCachedRooms = await offlineStorage.getAvailableRoomsForDateRange(
              resolvedHotelId,
              format(checkInDate, 'yyyy-MM-dd'),
              format(checkOutDate, 'yyyy-MM-dd'),
              guests
            );
            
            // Convert CachedRoom[] to AvailableRoom[]
            cachedAvailableRooms = availableCachedRooms.map(room => ({
              id: room.id,
              roomNumber: room.roomNumber,
              roomType: room.roomType,
              pricePerNight: room.pricePerNight,
              capacity: room.capacity,
              description: room.description,
              isAvailable: room.isAvailable
            }));
            
            // console.log(`📊 Enhanced cached availability: ${cachedAvailableRooms.length} rooms available considering offline bookings`);
          }
        } catch (cacheError) {
          // console.error('Enhanced cache availability check failed:', cacheError);
          // Final fallback to basic cached rooms
          cachedAvailableRooms = cachedRooms.filter(room => 
            room.capacity >= guests && room.isAvailable
          ).map(room => ({
            id: room.id,
            roomNumber: room.roomNumber,
            roomType: room.roomType,
            pricePerNight: room.pricePerNight,
            capacity: room.capacity,
            description: room.description,
            isAvailable: room.isAvailable
          }));
          // console.log(`📦 Basic cached fallback: ${cachedAvailableRooms.length} rooms`);
        }

        // If API returned no rooms, use cached rooms as primary source
        if (rooms.length === 0 && cachedAvailableRooms.length > 0) {
          rooms = cachedAvailableRooms;
          dataSource = 'enhanced-cached';
          // console.log(`🔄 Using cached rooms as primary source: ${rooms.length} rooms`);
        } else if (rooms.length > 0 && cachedAvailableRooms.length > 0) {
          // Both API and cache have rooms - prefer API but log difference
          const apiRoomIds = new Set(rooms.map(r => r.id));
          const cachedOnlyRooms = cachedAvailableRooms.filter(r => !apiRoomIds.has(r.id));
          if (cachedOnlyRooms.length > 0) {
            // console.log(`⚠️ Cache has ${cachedOnlyRooms.length} additional rooms not in API response`);
          }
        }
        
        // If we still have no rooms and we're online, try to refresh the cache
        if (rooms.length === 0 && resolvedHotelId && navigator.onLine) {
          // console.log('🔄 No rooms found anywhere, attempting to fetch and cache fresh data...');
          try {
            const freshRooms = await roomCacheService.fetchAndCacheRooms(resolvedHotelId);
            const availableRooms = freshRooms.filter(room => 
              room.capacity >= guests && room.isAvailable
            );
            rooms = availableRooms.map(room => ({
              id: room.id,
              roomNumber: room.roomNumber,
              roomType: room.roomType,
              pricePerNight: room.pricePerNight,
              capacity: room.capacity,
              description: room.description,
              isAvailable: room.isAvailable
            }));
            dataSource = 'fresh-cache';
            // console.log(`✨ Fresh cache: ${rooms.length} rooms available after refreshing cache`);
          } catch (refreshError) {
            // console.error('Failed to refresh room cache:', refreshError);
          }
        }
        
        setAvailableRooms(rooms);
        setSelectedRoom(null);
        
        // console.log(`📊 Room Selection Summary:
// - Data Source: ${dataSource.toUpperCase()}
// - Available Rooms: ${rooms.length}
// - Guest Capacity: >= ${guests} guests
// - Date Range: ${format(checkInDate, 'yyyy-MM-dd')} to ${format(checkOutDate, 'yyyy-MM-dd')}
// - Hotel ID: ${resolvedHotelId}
// - Online Status: ${navigator.onLine}
// - Cached Rooms Total: ${cachedRooms.length}`);
        
        if (rooms.length === 0) {
          // console.error(`❌ No rooms available for booking:
// - Requested guests: ${guests}
// - Check-in: ${format(checkInDate, 'yyyy-MM-dd')}
// - Check-out: ${format(checkOutDate, 'yyyy-MM-dd')}
// - Hotel ID: ${resolvedHotelId}
// - Data source: ${dataSource}
// - Total cached rooms: ${cachedRooms.length}
// - Cached rooms with sufficient capacity: ${cachedRooms.filter(r => r.capacity >= guests).length}
// - Available cached rooms: ${cachedRooms.filter(r => r.isAvailable).length}`);
          
          setError(t('dashboard.hotelAdmin.offlineBooking.validationErrors.noRoomsAvailable', {
            guests,
            plural: guests > 1 ? 's' : '',
            checkIn: format(checkInDate, 'MMM dd'),
            checkOut: format(checkOutDate, 'MMM dd')
          }));
        } else {
          setError(null);
          if (dataSource === 'api') {
            setSuccess(`✅ Loaded ${rooms.length} rooms from live hotel data`);
            setTimeout(() => setSuccess(null), 4000);
          }
        }
        
      } catch (error) {
        // console.error('Failed to load available rooms:', error);
        setError('Failed to load available rooms. Please try again.');
        setAvailableRooms([]);
      } finally {
        setRoomsLoading(false);
      }
    };

    if (activeStep === 1 && checkInDate && checkOutDate) {
      loadAvailableRooms();
    }
  }, [activeStep, checkInDate, checkOutDate, guests, cachedRooms, hotelId, token, tenantId, user?.role, user?.roles, user?.hotelId, API_BASE_URL, t]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSuccess('Connection restored! Offline bookings will sync automatically.');
      setTimeout(() => setSuccess(null), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Listen for service worker messages
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data.type === 'SYNC_SUCCESS') {
        setSuccess(event.data.message);
        setSuccessDialogOpen(true);
        loadOfflineBookings();
        loadPendingSyncCount();
      } else if (event.data.type === 'SYNC_FAILED') {
        setError(event.data.message);
        setTimeout(() => setError(null), 5000);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, [loadOfflineBookings, loadPendingSyncCount]);

  const handleCreateBooking = async () => {
    if (!selectedRoom || !user) return;
    
    setLoading(true);
    setError(null);

    try {
      // Calculate total amount
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalAmount = nights * selectedRoom.pricePerNight;

      // Save offline booking (matching online component structure)
      const resolvedHotelId = hotelId || (user?.hotelId ? parseInt(user.hotelId) : null);
      
      if (!resolvedHotelId) {
        setError('Hotel ID is required for booking creation');
        return;
      }

      const bookingData = {
        hotelId: resolvedHotelId,
        guestName: `${guestInfo.firstName} ${guestInfo.lastName}`,
        guestEmail: guestInfo.email,
        guestPhone: guestInfo.phone,
        roomType: selectedRoom.roomType,
        roomId: selectedRoom.id,
        roomNumber: selectedRoom.roomNumber,
        checkInDate: format(checkInDate, 'yyyy-MM-dd'),
        checkOutDate: format(checkOutDate, 'yyyy-MM-dd'),
        numberOfGuests: guests,
        totalAmount,
        pricePerNight: selectedRoom.pricePerNight,
        paymentMethod: 'CASH' as 'CASH' | 'CARD' | 'PENDING',
        specialRequests: specialRequests || undefined,
        status: 'PENDING_SYNC' as const,
        createdBy: typeof user?.id === 'number' ? user.id : 0
      };

      const bookingId = await offlineStorage.saveOfflineBooking(bookingData);
      // console.log('🔍 Debug: Booking saved with ID:', bookingId, 'Status:', bookingData.status);

      // Mark room as occupied in enhanced offline system
      try {
        await offlineStorage.markRoomOccupied(
          selectedRoom.id,
          bookingId,
          bookingData.checkInDate,
          bookingData.checkOutDate
        );
        // console.log('✅ Room marked as occupied for offline booking:', selectedRoom.roomNumber);
      } catch (roomMarkError) {
        // console.warn('⚠️ Failed to mark room as occupied:', roomMarkError);
        // Non-critical error - booking is still saved
      }

      // Save guest information for future use
      const guestInfoForStorage: GuestInfo = {
        email: guestInfo.email,
        name: `${guestInfo.firstName} ${guestInfo.lastName}`,
        phone: guestInfo.phone,
        lastStay: format(checkInDate, 'yyyy-MM-dd')
      };
      await offlineStorage.saveGuestInfo(guestInfoForStorage);

      // Reset form (matching online component exactly)
      setGuestInfo({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      });
      setCheckInDate(new Date());
      setCheckOutDate(addDays(new Date(), 1));
      setGuests(1);
      setSpecialRequests('');
      setSelectedRoom(null);
      setAvailableRooms([]);
      setActiveStep(0);

      const successMessage = isOnline 
        ? 'Walk-in booking created successfully!'
        : 'Booking saved offline! It will sync when connection is restored.';
      
      setSuccess(successMessage);
      setSuccessDialogOpen(true);

      // Trigger sync with current token if online and authenticated
      if (isOnline && token) {
        // console.log('🔄 Attempting immediate sync with current authentication token...');
        try {
          const syncResult = await syncManager.syncAllPendingBookings(token);
          if (syncResult.success && syncResult.syncedCount > 0) {
            // console.log(`✅ Successfully synced ${syncResult.syncedCount} booking(s) immediately`);
            setSuccess('Booking created and synced to server successfully!');
            setSuccessDialogOpen(true);
          } else if (syncResult.failedCount > 0) {
            // console.log(`⚠️  Booking saved but sync failed. Will retry automatically.`);
            setSuccess('Booking saved offline! It will sync when connection is restored.');
            setSuccessDialogOpen(true);
          }
        } catch (syncError) {
          // console.log('⚠️  Immediate sync failed, will retry later:', syncError);
        }
      }

      // Reload data
      await loadOfflineBookings();
      await loadPendingSyncCount();

      // Call callback if provided
      if (onBookingComplete) {
        const fullBooking = await offlineStorage.getOfflineBookings(resolvedHotelId || undefined);
        const newBooking = fullBooking.find(b => b.id === bookingId);
        if (newBooking) {
          onBookingComplete(newBooking);
        }
      }

    } catch (error: any) {
      // console.error('Failed to save offline booking:', error);
      setError(error.message || 'Failed to save booking');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSearch = async () => {
    if (!guestSearchQuery.trim()) return;

    try {
      const guests = await offlineStorage.searchGuests(guestSearchQuery);
      setFoundGuests(guests);
    } catch (error) {
      // console.error('Failed to search guests:', error);
      setFoundGuests([]);
    }
  };

  const selectGuest = (guest: GuestInfo) => {
    setGuestInfo({
      ...guestInfo,
      firstName: guest.name.split(' ')[0] || '',
      lastName: guest.name.split(' ').slice(1).join(' ') || '',
      email: guest.email,
      phone: guest.phone
    });
    setShowGuestSearch(false);
    setGuestSearchQuery('');
    setFoundGuests([]);
  };



  return (
    <Card sx={{ 
      minHeight: '70vh',
      bgcolor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 3,
      elevation: 0,
    }}>
      <CardContent sx={{ p: 3 }}>
        {/* Enhanced Header with Offline Status */}
        <Box sx={{ mb: 4 }}>
          {/* Professional Header */}
          <Box sx={{ 
            mb: 3,
            p: 3,
            bgcolor: 'background.default',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: COLORS.PRIMARY, // Orange color to match theme
                      mb: 0.5,
                    }}
                  >
                    {t('dashboard.hotelAdmin.offlineBooking.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {t('dashboard.hotelAdmin.offlineBooking.description')}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label={t('dashboard.hotelAdmin.offlineBooking.offlineMode')}
                  variant="outlined"
                  sx={{ 
                    fontWeight: 'bold',
                  }}
                />
                {pendingSyncCount > 0 && (
                  <Chip
                    label={`${pendingSyncCount} pending sync`}
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          </Box>

          {/* Enhanced Stepper */}
          <Stepper 
            activeStep={activeStep} 
            alternativeLabel
            sx={{
              '& .MuiStepLabel-root .Mui-completed': {
                color: COLORS.PRIMARY, // Orange for completed steps
              },
              '& .MuiStepLabel-root .Mui-active': {
                color: COLORS.PRIMARY, // Orange for active step
              },
              '& .MuiStepConnector-line': {
                borderColor: 'divider',
              },
              '& .MuiStepIcon-root': {
                '&.Mui-completed': {
                  color: COLORS.PRIMARY, // Orange for completed step icons
                },
                '&.Mui-active': {
                  color: COLORS.PRIMARY, // Orange for active step icon
                },
              },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

      {/* Content Area */}
      <Box sx={{ position: 'relative', minHeight: '400px' }}>
        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Success Dialog */}
        <Dialog
          open={successDialogOpen}
          onClose={() => setSuccessDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ textAlign: 'center', color: 'text.primary' }}>
            Success
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ textAlign: 'center', py: 2 }}>
              {success}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button 
              onClick={() => setSuccessDialogOpen(false)} 
              variant="contained" 
              color="primary"
              sx={{ minWidth: 100 }}
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>

        {/* Loading overlay for entire content */}
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: theme.palette.action.hover,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={40} />
              <Typography variant="body2" sx={{ mt: 2 }}>
                {t('dashboard.hotelAdmin.offlineBooking.messages.creatingBooking')}
              </Typography>
            </Box>
          </Box>
        )}
        
        {/* Step Content */}
        {renderStepContent()}
      </Box>
      
      {/* Action Buttons - Skip step 1 as it has its own action buttons */}
      {activeStep !== 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
          {activeStep > 0 && (
            <Button onClick={handleBack} disabled={loading}>
              {t('dashboard.hotelAdmin.offlineBooking.actions.back')}
            </Button>
          )}
          
          {activeStep < steps.length - 1 ? (
            <Button 
              variant="contained" 
              onClick={handleNext}
              disabled={loading}
            >
              {t('dashboard.hotelAdmin.offlineBooking.actions.next')}
            </Button>
          ) : (
            <Button 
              variant="contained" 
              onClick={handleCreateBooking}
              disabled={loading || !selectedRoom}
            >
              {loading ? t('dashboard.hotelAdmin.offlineBooking.actions.creatingBooking') : t('dashboard.hotelAdmin.offlineBooking.actions.createBooking')}
            </Button>
          )}
        </Box>
      )}



      {/* Guest Search Dialog */}
      <Dialog
        open={showGuestSearch}
        onClose={() => setShowGuestSearch(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('dashboard.hotelAdmin.offlineBooking.guestSearchDialog.title')}</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <PremiumTextField
              fullWidth
              label={t('dashboard.hotelAdmin.offlineBooking.guestSearchDialog.searchPlaceholder')}
              value={guestSearchQuery}
              onChange={(e) => setGuestSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleGuestSearch()}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={handleGuestSearch}
              fullWidth
            >
              {t('dashboard.hotelAdmin.offlineBooking.guestSearchDialog.searchButton')}
            </Button>
          </Box>

          {foundGuests.length > 0 && (
            <List>
              {foundGuests.map((guest) => (
                <ListItem
                  key={guest.email}
                  button
                  onClick={() => selectGuest(guest)}
                  divider
                >
                  <ListItemText
                    primary={
                      <Typography component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {guest.name}
                      </Typography>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }} variant="body2">
                          {guest.email}
                        </Typography>
                        <Typography component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }} variant="body2">
                          {guest.phone}
                        </Typography>
                        {guest.lastStay && (
                          <Typography variant="caption" color="text.secondary" component="span" display="block">
                            Last stay: {new Date(guest.lastStay).toLocaleDateString()}
                          </Typography>
                        )}
                      </React.Fragment>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowGuestSearch(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      </CardContent>
    </Card>
  );
};

export default OfflineWalkInBooking;