import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  Card,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
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
  ListItemSecondaryAction,
  MenuItem,
  IconButton,
  Tooltip,
  Stack,
  Snackbar,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays, parseISO } from 'date-fns';
import {
  CloudOff as CloudOffIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Sync as SyncIcon,
  Hotel as HotelIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { API_CONFIG } from '../config/apiConfig';
import { offlineStorage, OfflineBooking, GuestInfo, CachedRoom } from '../services/OfflineStorageService';
import { syncManager } from '../services/SyncManager';
import { roomCacheService } from '../services/RoomCacheService';

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

const steps = ['Guest Information', 'Room Selection', 'Confirmation'];

// Room types and payment methods for dropdowns
const roomTypes = [
  { value: 'SINGLE', label: 'Single Room' },
  { value: 'DOUBLE', label: 'Double Room' },
  { value: 'SUITE', label: 'Suite' },
  { value: 'FAMILY', label: 'Family Room' },
];

const paymentMethods = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'PENDING', label: 'Pay Later' },
];

const OfflineWalkInBooking: React.FC<OfflineWalkInBookingProps> = ({
  hotelId,
  onBookingComplete
}) => {
  const { token, user } = useAuth(); // Match exact order from main component
  const { tenantId } = useTenant(); // Match exact usage from main component
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
  const [offlineBookings, setOfflineBookings] = useState<OfflineBooking[]>([]);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [cachedRooms, setCachedRooms] = useState<CachedRoom[]>([]);
  const [roomsLoaded, setRoomsLoaded] = useState(false);

  // Load rooms from cache
  const loadRoomsFromCache = useCallback(async () => {
    if (!hotelId) return;
    
    try {
      console.log('📦 Loading rooms from cache for hotel:', hotelId);
      const rooms = await roomCacheService.getRooms(hotelId);
      setCachedRooms(rooms);
      setRoomsLoaded(true);
      console.log(`✅ Loaded ${rooms.length} cached rooms`);
    } catch (error) {
      console.error('Failed to load cached rooms:', error);
      setRoomsLoaded(true); // Still mark as loaded to prevent infinite loading
    }
  }, [hotelId]);

  // Track if offline storage is initialized
  const [offlineStorageInitialized, setOfflineStorageInitialized] = useState(false);

  // Initialize room caching when component loads (only after offline storage is ready)
  useEffect(() => {
    if (hotelId && token && !roomsLoaded && offlineStorageInitialized) {
      loadRoomsFromCache();
      
      // Start periodic refresh for this hotel
      roomCacheService.startPeriodicRefresh(hotelId);
      
      // Cleanup on unmount
      return () => {
        roomCacheService.stopPeriodicRefresh();
      };
    }
  }, [hotelId, token, roomsLoaded, offlineStorageInitialized, loadRoomsFromCache]);

  // Memoized change handlers (matching online version)
  // Memoized change handlers to prevent input focus loss (matching online component exactly)
  const handleGuestInfoChange = React.useCallback((field: keyof WalkInGuestInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuestInfo(prev => ({ ...prev, [field]: e.target.value }));
  }, []);

  const handleGuestsChange = React.useCallback((e: any) => {
    setGuests(Number(e.target.value));
  }, []);

  const handleSpecialRequestsChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSpecialRequests(e.target.value);
  }, []);

  // Stepper navigation (matching online component exactly)
  const handleNext = () => {
    if (activeStep === 0) {
      // Validate guest information
      if (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email || !guestInfo.phone) {
        setError('Please fill in all guest information fields');
        return;
      }
      if (!guestInfo.email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }
    } else if (activeStep === 1) {
      // Validate room selection
      if (!selectedRoom) {
        setError('Please select a room');
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
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Guest Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={guestInfo.firstName}
                onChange={handleGuestInfoChange('firstName')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={guestInfo.lastName}
                onChange={handleGuestInfoChange('lastName')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={guestInfo.email}
                onChange={handleGuestInfoChange('email')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={guestInfo.phone}
                onChange={handleGuestInfoChange('phone')}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Stay Details
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Check-in Date"
                  value={checkInDate}
                  onChange={(newValue) => newValue && setCheckInDate(newValue)}
                  minDate={new Date()}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Check-out Date"
                  value={checkOutDate}
                  onChange={(newValue) => newValue && setCheckOutDate(newValue)}
                  minDate={addDays(checkInDate, 1)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Number of Guests</InputLabel>
                <Select
                  value={guests}
                  label="Number of Guests"
                  onChange={handleGuestsChange}
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <MenuItem key={num} value={num}>
                      {num} Guest{num !== 1 ? 's' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
        
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Available Rooms
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {format(checkInDate, 'MMM dd, yyyy')} - {format(checkOutDate, 'MMM dd, yyyy')} • {guests} Guest{guests !== 1 ? 's' : ''}
            </Typography>
            
            {roomsLoading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={40} />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Loading available rooms...
                </Typography>
              </Box>
            ) : availableRooms.length === 0 ? (
              <Alert severity="warning">
                No rooms available for {guests} guest{guests !== 1 ? 's' : ''} from {format(checkInDate, 'MMM dd')} to {format(checkOutDate, 'MMM dd')}. 
                Please try different dates or reduce the number of guests.
              </Alert>
            ) : (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {availableRooms.map((room) => (
                  <Grid item xs={12} sm={6} md={4} key={room.id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        border: selectedRoom?.id === room.id ? '3px solid' : '1px solid',
                        borderColor: selectedRoom?.id === room.id ? 'primary.main' : 'divider',
                        backgroundColor: selectedRoom?.id === room.id ? 'primary.light' : 'background.paper',
                        transform: selectedRoom?.id === room.id ? 'scale(1.02)' : 'scale(1)',
                        boxShadow: selectedRoom?.id === room.id ? '0 8px 25px rgba(25, 118, 210, 0.15)' : '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        '&:hover': {
                          transform: 'scale(1.02)',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                        }
                      }}
                      onClick={() => setSelectedRoom(room)}
                    >
                      {selectedRoom?.id === room.id && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: 'primary.main',
                            color: 'white',
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1,
                          }}
                        >
                          ✓
                        </Box>
                      )}
                      <CardContent sx={{ 
                        color: selectedRoom?.id === room.id ? 'primary.contrastText' : 'inherit',
                        '& .MuiTypography-root': {
                          color: selectedRoom?.id === room.id ? 'white' : 'inherit'
                        }
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: selectedRoom?.id === room.id ? 600 : 500,
                            color: selectedRoom?.id === room.id ? 'white' : 'inherit'
                          }}>
                            Room {room.roomNumber}
                          </Typography>
                          <Chip 
                            label={room.roomType} 
                            size="small" 
                            sx={{
                              backgroundColor: selectedRoom?.id === room.id ? 'rgba(255,255,255,0.2)' : 'inherit',
                              color: selectedRoom?.id === room.id ? 'white' : 'inherit'
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ 
                          color: selectedRoom?.id === room.id ? 'rgba(255,255,255,0.9)' : 'text.secondary',
                          mb: 1
                        }}>
                          Capacity: {room.capacity} guest{room.capacity !== 1 ? 's' : ''}
                        </Typography>
                        {room.description && (
                          <Typography variant="body2" sx={{ 
                            color: selectedRoom?.id === room.id ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                            mb: 1
                          }}>
                            {room.description}
                          </Typography>
                        )}
                        <Typography variant="h6" sx={{
                          color: selectedRoom?.id === room.id ? 'white' : 'primary.main',
                          fontWeight: 600
                        }}>
                          ETB {room.pricePerNight?.toFixed(0)}/night
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
            
            {selectedRoom && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Special Requests (Optional)"
                  multiline
                  rows={3}
                  value={specialRequests}
                  onChange={handleSpecialRequestsChange}
                  placeholder="Any special requests or notes for the guest stay..."
                />
              </Box>
            )}
          </Box>
        );
        
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Booking Confirmation
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Guest Information
                    </Typography>
                    <Typography variant="body2">
                      <strong>Name:</strong> {guestInfo.firstName} {guestInfo.lastName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Email:</strong> {guestInfo.email}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Phone:</strong> {guestInfo.phone}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Stay Details
                    </Typography>
                    <Typography variant="body2">
                      <strong>Room:</strong> {selectedRoom?.roomNumber} ({selectedRoom?.roomType})
                    </Typography>
                    <Typography variant="body2">
                      <strong>Check-in:</strong> {format(checkInDate, 'MMM dd, yyyy')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Check-out:</strong> {format(checkOutDate, 'MMM dd, yyyy')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Guests:</strong> {guests}
                    </Typography>
                    {specialRequests && (
                      <Typography variant="body2">
                        <strong>Special Requests:</strong> {specialRequests}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Pricing Summary
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        ETB {(selectedRoom?.pricePerNight || 0)?.toFixed(0)}/night × {Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))} night{Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)) !== 1 ? 's' : ''}
                      </Typography>
                      <Typography variant="body2">
                        ETB {calculateTotalAmount()?.toFixed(0)}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="h6">
                        Total Amount
                      </Typography>
                      <Typography variant="h6" color="primary.main">
                        ETB {calculateTotalAmount()}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Payment will be processed at the front desk (Offline Mode)
                    </Typography>
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
    try {
      const bookings = await offlineStorage.getOfflineBookings(hotelId);
      console.log('🔍 Debug: Loaded offline bookings:', bookings.length, 'for hotel:', hotelId);
      console.log('🔍 Debug: Booking statuses:', bookings.map(b => `${b.id}: ${b.status}`));
      setOfflineBookings(bookings);
    } catch (error) {
      console.error('Failed to load offline bookings:', error);
    }
  }, [hotelId]);

  const loadPendingSyncCount = useCallback(async () => {
    try {
      const pendingBookings = await offlineStorage.getPendingSyncBookings();
      setPendingSyncCount(pendingBookings.length);
    } catch (error) {
      console.error('Failed to load pending sync count:', error);
    }
  }, []);

  // Initialize offline storage and load data
  useEffect(() => {
    const initializeOfflineSupport = async () => {
      try {
        await offlineStorage.init();
        setOfflineStorageInitialized(true); // Mark as initialized
        await loadOfflineBookings();
        await loadPendingSyncCount();
        
        // Debug: Check database state after initialization
        setTimeout(() => {
          offlineStorage.debugDatabase();
        }, 1000);
      } catch (error) {
        console.error('Failed to initialize offline storage:', error);
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
        if (!hotelId || !token) {
          console.log('Cannot load rooms - missing hotelId or token:', { hotelId, hasToken: !!token });
          // Fall back to cached room data
          console.log('💾 Using cached room data due to missing hotelId or token');
          rooms = cachedRooms.filter(room => room.capacity >= guests);
          dataSource = 'cached';
        } else {
          try {
            console.log('🌐 Loading room data from same API as main walk-in booking...');
            
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
              
              console.log('Hotel admin fetching available rooms for date range:', format(checkInDate, 'yyyy-MM-dd'), 'to', format(checkOutDate, 'yyyy-MM-dd'), 'guests:', guests);
              
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
                console.log(`✅ Loaded ${rooms.length} rooms from hotel admin API`);
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
              
              console.log('Front desk fetching available rooms for date range:', format(checkInDate, 'yyyy-MM-dd'), 'to', format(checkOutDate, 'yyyy-MM-dd'), 'guests:', guests);
              
              const response = await fetch(`${API_BASE_URL}/api/front-desk/hotels/${hotelId}/available-rooms?${params.toString()}`, {
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
                console.log(`✅ Loaded ${rooms.length} rooms from front desk API`);
              } else {
                throw new Error(`Failed to fetch available rooms: ${response.status}`);
              }
            }
          } catch (apiError) {
            console.log('🔄 API call failed, using offline fallback data:', apiError);
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
          console.log(`🔍 Filtered ${filteredRooms.length} available rooms from ${rooms.length} total rooms`);
        } else {
          // Fallback to enhanced cached room availability check
          console.log('💾 Using enhanced cached room availability data');
          try {
            if (hotelId) {
              const availableCachedRooms = await offlineStorage.getAvailableRoomsForDateRange(
                hotelId,
                format(checkInDate, 'yyyy-MM-dd'),
                format(checkOutDate, 'yyyy-MM-dd'),
                guests
              );
              
              // Convert CachedRoom[] to AvailableRoom[]
              rooms = availableCachedRooms.map(room => ({
                id: room.id,
                roomNumber: room.roomNumber,
                roomType: room.roomType,
                pricePerNight: room.pricePerNight,
                capacity: room.capacity,
                description: room.description,
                isAvailable: room.isAvailable
              }));
              
              dataSource = 'enhanced-cached';
              console.log(`� Enhanced cached availability: ${rooms.length} rooms available considering offline bookings`);
            } else {
              // Basic fallback
              rooms = cachedRooms.filter(room => room.capacity >= guests);
              dataSource = 'cached';
            }
          } catch (cacheError) {
            console.error('Enhanced cache availability check failed:', cacheError);
            // Final fallback to basic cached rooms
            rooms = cachedRooms.filter(room => room.capacity >= guests);
            dataSource = 'cached';
          }
        }
        
        setAvailableRooms(rooms);
        setSelectedRoom(null);
        
        console.log(`📊 Room Selection Summary:
- Data Source: ${dataSource.toUpperCase()}
- Available Rooms: ${rooms.length}
- Guest Capacity: >= ${guests} guests
- Date Range: ${format(checkInDate, 'yyyy-MM-dd')} to ${format(checkOutDate, 'yyyy-MM-dd')}`);
        
        if (dataSource === 'api') {
          setSuccess(`✅ Loaded ${rooms.length} rooms from live hotel data`);
          setTimeout(() => setSuccess(null), 4000);
        }
        
      } catch (error) {
        console.error('Failed to load available rooms:', error);
        setError('Failed to load available rooms. Please try again.');
        setAvailableRooms([]);
      } finally {
        setRoomsLoading(false);
      }
    };

    if (activeStep === 1 && checkInDate && checkOutDate) {
      loadAvailableRooms();
    }
  }, [activeStep, checkInDate, checkOutDate, guests, cachedRooms, hotelId, token, tenantId, user?.role, user?.roles, API_BASE_URL]);

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
      const bookingData = {
        hotelId: hotelId || (user?.hotelId ? parseInt(user.hotelId) : 1),
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
      console.log('🔍 Debug: Booking saved with ID:', bookingId, 'Status:', bookingData.status);

      // Mark room as occupied in enhanced offline system
      try {
        await offlineStorage.markRoomOccupied(
          selectedRoom.id,
          bookingId,
          bookingData.checkInDate,
          bookingData.checkOutDate
        );
        console.log('✅ Room marked as occupied for offline booking:', selectedRoom.roomNumber);
      } catch (roomMarkError) {
        console.warn('⚠️ Failed to mark room as occupied:', roomMarkError);
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
        console.log('🔄 Attempting immediate sync with current authentication token...');
        try {
          const syncResult = await syncManager.syncAllPendingBookings(token);
          if (syncResult.success && syncResult.syncedCount > 0) {
            console.log(`✅ Successfully synced ${syncResult.syncedCount} booking(s) immediately`);
            setSuccess('Booking created and synced to server successfully!');
            setSuccessDialogOpen(true);
          } else if (syncResult.failedCount > 0) {
            console.log(`⚠️  Booking saved but sync failed. Will retry automatically.`);
            setSuccess('Booking saved offline! It will sync when connection is restored.');
            setSuccessDialogOpen(true);
          }
        } catch (syncError) {
          console.log('⚠️  Immediate sync failed, will retry later:', syncError);
        }
      }

      // Reload data
      await loadOfflineBookings();
      await loadPendingSyncCount();

      // Call callback if provided
      if (onBookingComplete) {
        const fullBooking = await offlineStorage.getOfflineBookings(hotelId);
        const newBooking = fullBooking.find(b => b.id === bookingId);
        if (newBooking) {
          onBookingComplete(newBooking);
        }
      }

    } catch (error: any) {
      console.error('Failed to save offline booking:', error);
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
      console.error('Failed to search guests:', error);
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
    <Paper sx={{ 
      p: 3, 
      minHeight: '70vh',
      backgroundColor: '#f5f5f5', // Light gray background to indicate offline mode
      border: '2px solid #e0e0e0' // Subtle border to enhance the offline visual distinction
    }}>
      {/* Header with Status */}
      <Box sx={{ mb: 3 }}>
        {/* Offline Mode Banner */}
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 2, 
            backgroundColor: '#fff3e0',
            border: '1px solid #ff9800',
            '& .MuiAlert-icon': {
              color: '#ff9800'
            }
          }}
          icon={<CloudOffIcon />}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={<CloudOffIcon />}
              label="Offline Mode"
              size="small"
              sx={{ 
                fontWeight: 'bold',
                backgroundColor: '#ff9800',
                color: 'white',
                '& .MuiChip-icon': {
                  color: 'white'
                }
              }}
            />
            <Typography variant="body1">
              You are working offline. All bookings will be saved locally and automatically synced when internet connection is restored.
            </Typography>
          </Box>
        </Alert>

        {pendingSyncCount > 0 && (
          <Box display="flex" alignItems="center" justifyContent="flex-end" mb={2}>
            <Chip
              icon={<SyncIcon />}
              label={`${pendingSyncCount} pending sync`}
              color="info"
              variant="outlined"
            />
          </Box>
        )}

        {/* Stepper (matching online component exactly) */}
        <Box sx={{ mt: 2 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
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
          <DialogTitle sx={{ textAlign: 'center', color: 'success.main' }}>
            ✅ Success
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
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={40} />
              <Typography variant="body2" sx={{ mt: 2 }}>
                Creating walk-in booking...
              </Typography>
            </Box>
          </Box>
        )}
        
        {/* Step Content */}
        {renderStepContent()}
      </Box>
      
      {/* Action Buttons (matching online component exactly) */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={loading}>
            Back
          </Button>
        )}
        
        {activeStep < steps.length - 1 ? (
          <Button 
            variant="contained" 
            onClick={handleNext}
            disabled={loading || (activeStep === 1 && (!selectedRoom || roomsLoading))}
            startIcon={roomsLoading && activeStep === 1 ? <CircularProgress size={16} /> : undefined}
          >
            {roomsLoading && activeStep === 1 ? 'Loading Rooms...' : 'Next'}
          </Button>
        ) : (
          <Button 
            variant="contained" 
            onClick={handleCreateBooking}
            disabled={loading || !selectedRoom}
            startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            {loading ? 'Creating Booking...' : 'Create Booking'}
          </Button>
        )}
      </Box>



      {/* Guest Search Dialog */}
      <Dialog
        open={showGuestSearch}
        onClose={() => setShowGuestSearch(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Search Previous Guests</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Search by name, email, or phone"
              value={guestSearchQuery}
              onChange={(e) => setGuestSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleGuestSearch()}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleGuestSearch}
              fullWidth
            >
              Search
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
                        <PersonIcon fontSize="small" />
                        {guest.name}
                      </Typography>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }} variant="body2">
                          <EmailIcon fontSize="small" />
                          {guest.email}
                        </Typography>
                        <Typography component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }} variant="body2">
                          <PhoneIcon fontSize="small" />
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
    </Paper>
  );
};

export default OfflineWalkInBooking;