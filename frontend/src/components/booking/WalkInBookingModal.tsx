import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Card,
  CardContent,
  Chip,
  Divider,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { hotelApiService } from '../../services/hotelApi';
import { hotelAdminApi } from '../../services/hotelAdminApi';
import { frontDeskApiService } from '../../services/frontDeskApi';
import { formatCurrency, formatCurrencyWithDecimals } from '../../utils/currencyUtils';
import { API_CONFIG, buildApiUrl } from '../../config/apiConfig';
import NumberStepper from '../common/NumberStepper';
import { COLORS, addAlpha } from '../../theme/themeColors';
import { extractBookingErrorMessage } from '../../utils/errorHandling';

// API base URL for backend calls
const API_BASE_URL = API_CONFIG.SERVER_URL;

// Define interfaces for walk-in booking
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

interface WalkInBookingModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (bookingData: any) => void;
  apiContext?: 'frontdesk' | 'hotel-admin'; // To distinguish which API to use
}

const WalkInBookingModal: React.FC<WalkInBookingModalProps> = ({
  open,
  onClose,
  onSuccess,
  apiContext = 'frontdesk', // Default to frontdesk for backwards compatibility
}) => {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const { tenantId } = useTenant();
  const theme = useTheme();
  
  // Get translated steps
  const steps = [
    t('walkInBooking.steps.guestInformation'),
    t('walkInBooking.steps.roomSelection'),
    t('walkInBooking.steps.confirmation')
  ];
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Guest information
  const [guestInfo, setGuestInfo] = useState<WalkInGuestInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  
  // Booking details
  const [checkInDate, setCheckInDate] = useState<Date>(new Date());
  const [checkOutDate, setCheckOutDate] = useState<Date>(addDays(new Date(), 1));
  const [guests, setGuests] = useState<number>(1);
  const [specialRequests, setSpecialRequests] = useState<string>('');
  
  // Available rooms
  const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<AvailableRoom | null>(null);
  const [roomsLoading, setRoomsLoading] = useState(false);
  
  // Hotel information (we'll need to get this from the backend)
  const [hotelId, setHotelId] = useState<number | null>(null);
  
  // Tax rate information
  const [hotelVatRate, setHotelVatRate] = useState<number>(0);
  const [hotelServiceTaxRate, setHotelServiceTaxRate] = useState<number>(0);

  // Memoized change handlers to prevent input focus loss
  const handleGuestInfoChange = React.useCallback((field: keyof WalkInGuestInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuestInfo(prev => ({ ...prev, [field]: e.target.value }));
  }, []);

  const handleGuestsChange = React.useCallback((newValue: number) => {
    setGuests(newValue);
  }, []);

  const handleSpecialRequestsChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSpecialRequests(e.target.value);
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    const loadHotelInfo = async () => {
      if (!token) return;
      
      try {
        // Set token and tenant ID for hotel API service
        hotelApiService.setToken(token);
        hotelApiService.setTenantId(tenantId);
        
        // Fetch the actual hotel information from the backend
        try {
          const headers: Record<string, string> = {
            'Authorization': `Bearer ${token}`,
          };
          
          if (tenantId) {
            headers['X-Tenant-ID'] = tenantId;
          }
          
          // Determine the correct endpoint based on user role
          // Check if user is hotel admin or has hotel admin role
          const isHotelAdmin = user?.role === 'HOTEL_ADMIN' || user?.roles?.includes('HOTEL_ADMIN');
          const endpoint = isHotelAdmin ? `${API_BASE_URL}/api/hotel-admin/hotel` : `${API_BASE_URL}/api/front-desk/hotel`;
          
          // console.log('Loading hotel info for user role:', user?.role, 'using endpoint:', endpoint);
          
          const response = await fetch(endpoint, {
            headers
          });
          
          if (response.ok) {
            const hotelData = await response.json();
            setHotelId(hotelData.id);
          } else {
            const errorText = await response.text();
            // console.error('Failed to fetch hotel information:', response.status, errorText);
            throw new Error(`Failed to fetch hotel information: ${response.status}`);
          }
        } catch (hotelError) {
          // console.error('Failed to fetch hotel information:', hotelError);
          setError(t('walkInBooking.messages.failedToLoadHotelPermissions'));
          return;
        }
      } catch (error) {
        // console.error('Failed to load hotel info:', error);
        setError(t('walkInBooking.messages.failedToLoadHotel'));
      }
    };

    if (open) {
      setActiveStep(0);
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
      setError(null);
      
      // Get hotel ID from user context - we'll need to add this to the front desk API
      loadHotelInfo();
    }
  }, [open, token, tenantId, user?.role, user?.roles, t]);
  
  // Fetch hotel tax rates when hotelId is available
  useEffect(() => {
    const fetchTaxRates = async () => {
      if (!hotelId || !token) {
        // console.log('🏨 Cannot fetch tax rates - missing hotelId or token');
        return;
      }
      
      try {
        // console.log('🔍 Fetching tax rates for hotel:', hotelId);
        const response = await fetch(buildApiUrl(`/hotels/${hotelId}/tax-rate`), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-ID': tenantId || '',
          },
        });
        
        if (response.ok) {
          const taxData = await response.json();
          // console.log('📊 Tax rates loaded:', taxData);
          setHotelVatRate(taxData.vatRate || 0);
          setHotelServiceTaxRate(taxData.serviceTaxRate || 0);
        } else {
          // console.error('Failed to fetch tax rates:', response.status);
          // Set default tax rates if fetch fails
          setHotelVatRate(0);
          setHotelServiceTaxRate(0);
        }
      } catch (error) {
        // console.error('Error fetching tax rates:', error);
        // Set default tax rates if error occurs
        setHotelVatRate(0);
        setHotelServiceTaxRate(0);
      }
    };
    
    fetchTaxRates();
  }, [hotelId, token, tenantId]);

  // Load available rooms when dates/guests change and we're on step 1
  useEffect(() => {
    const loadAvailableRooms = async () => {
      if (!hotelId || !token) {
        // console.log('Cannot load rooms - missing hotelId or token:', { hotelId, hasToken: !!token });
        return;
      }
      
      setRoomsLoading(true);
      setError(null);
      
      try {
        // console.log('Loading available rooms for:', {
        //   hotelId,
        //   checkIn: format(checkInDate, 'yyyy-MM-dd'),
        //   checkOut: format(checkOutDate, 'yyyy-MM-dd'),
        //   guests,
        //   userRole: user?.role
        // });
        
        // Use different APIs based on user role
        const isHotelAdmin = user?.role === 'HOTEL_ADMIN' || user?.roles?.includes('HOTEL_ADMIN');
        
        let rooms: AvailableRoom[] = [];
        
        if (isHotelAdmin) {
          // For hotel admin, use the date-specific available rooms API 
          const headers: Record<string, string> = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          };
          
          if (tenantId) {
            headers['X-Tenant-ID'] = tenantId;
          }
          
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
            // Convert hotel admin room format to AvailableRoom format
            rooms = data.map((room: any) => ({
              id: room.id,
              roomNumber: room.roomNumber,
              roomType: room.roomType,
              pricePerNight: room.pricePerNight,
              capacity: room.capacity,
              description: room.description,
              isAvailable: room.isAvailable
            }));
          } else {
            throw new Error(`Failed to fetch available rooms: ${response.status}`);
          }
        } else {
          // For front desk users, use the front desk available rooms API with date filtering
          const headers: Record<string, string> = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          };
          
          if (tenantId) {
            headers['X-Tenant-ID'] = tenantId;
          }
          
          const params = new URLSearchParams({
            checkInDate: format(checkInDate, 'yyyy-MM-dd'),
            checkOutDate: format(checkOutDate, 'yyyy-MM-dd'),
            guests: guests.toString()
          });
          
          // console.log('Front desk fetching available rooms for date range:', format(checkInDate, 'yyyy-MM-dd'), 'to', format(checkOutDate, 'yyyy-MM-dd'), 'guests:', guests);
          
          const response = await fetch(`${API_BASE_URL}/api/front-desk/hotels/${hotelId}/available-rooms?${params.toString()}`, {
            headers
          });
          
          if (response.ok) {
            const roomsData = await response.json();
            // Convert front desk room format to AvailableRoom format
            rooms = roomsData.map((room: any) => ({
              id: room.id,
              roomNumber: room.roomNumber,
              roomType: room.roomType,
              pricePerNight: room.pricePerNight,
              capacity: room.capacity,
              description: room.description,
              isAvailable: true // Front desk API only returns available rooms
            }));
          } else {
            throw new Error(`Failed to fetch available rooms: ${response.status}`);
          }
        }
        
        // Filter rooms that can accommodate the guest count
        const filteredRooms = rooms.filter(room => 
          room.capacity >= guests && 
          (room.isAvailable !== false)
        );
        
        // console.log('Available rooms loaded:', filteredRooms.length, 'out of', rooms.length, 'total rooms');
        // console.log('Filtered for', guests, 'guests on', format(checkInDate, 'yyyy-MM-dd'), 'to', format(checkOutDate, 'yyyy-MM-dd'));
        setAvailableRooms(filteredRooms);
        setSelectedRoom(null);
      } catch (error) {
        // console.error('Failed to load available rooms:', error);
        setError(t('walkInBooking.messages.failedToLoadRooms'));
        setAvailableRooms([]);
      } finally {
        setRoomsLoading(false);
      }
    };

    if (activeStep === 1 && hotelId && checkInDate && checkOutDate) {
      loadAvailableRooms();
    }
  }, [activeStep, hotelId, checkInDate, checkOutDate, guests, token, user?.role, user?.roles, tenantId, t]);

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate guest information
      if (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email || !guestInfo.phone) {
        setError(t('walkInBooking.validationErrors.fillAllFields'));
        return;
      }
      if (!guestInfo.email.includes('@')) {
        setError(t('walkInBooking.validationErrors.invalidEmail'));
        return;
      }
    } else if (activeStep === 1) {
      // Validate room selection
      if (!selectedRoom) {
        setError(t('walkInBooking.validationErrors.selectRoom'));
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

  const handleCreateBooking = async () => {
    if (!selectedRoom || !token || !hotelId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const bookingRequest = {
        hotelId: hotelId,
        roomType: selectedRoom.roomType,
        roomId: selectedRoom.id, // Add specific room ID for immediate assignment
        checkInDate: format(checkInDate, 'yyyy-MM-dd'),
        checkOutDate: format(checkOutDate, 'yyyy-MM-dd'),
        guests: guests,
        specialRequests: specialRequests || undefined,
        paymentMethodId: 'pay_at_frontdesk', // Special indicator for front desk payments
        guestName: `${guestInfo.firstName} ${guestInfo.lastName}`,
        guestEmail: guestInfo.email,
        guestPhone: guestInfo.phone,
      };

      let response;
      
      // Use different API endpoints based on user role (consistent with hotel info loading)
      const isHotelAdmin = user?.role === 'HOTEL_ADMIN' || user?.roles?.includes('HOTEL_ADMIN');
      
      if (isHotelAdmin) {
        // console.log('Creating walk-in booking via hotel admin API');
        response = await hotelAdminApi.createWalkInBooking(token, bookingRequest);
        if (response.success) {
          response = response.data;
        } else {
          throw new Error(response.message || 'Failed to create booking');
        }
      } else {
        // console.log('Creating walk-in booking via front desk API');
        // Use the new front desk walk-in booking endpoint that ensures email goes to guest
        response = await frontDeskApiService.createWalkInBooking(token, bookingRequest);
        if (response.success) {
          response = response.data;
        } else {
          throw new Error(response.message || 'Failed to create booking');
        }
      }
      
      if (response) {
        onSuccess(response);
        onClose();
        // Import and trigger notification refresh after booking creation
        const { BookingNotificationEvents } = await import('../../utils/bookingNotificationEvents');
        BookingNotificationEvents.afterCreation();
      }
    } catch (error) {
      // console.error('Failed to create walk-in booking:', error);
      
      // Use the centralized error handling utility
      const errorMessage = extractBookingErrorMessage(error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalAmount = () => {
    if (!selectedRoom) return 0;
    
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const subtotal = selectedRoom.pricePerNight * nights;
    
    // Calculate taxes
    const vatAmount = subtotal * hotelVatRate;
    const serviceTaxAmount = subtotal * hotelServiceTaxRate;
    const totalWithTaxes = subtotal + vatAmount + serviceTaxAmount;
    
    // console.log('💰 Price calculation:', {
    //   subtotal,
    //   vatRate: hotelVatRate,
    //   serviceTaxRate: hotelServiceTaxRate,
    //   vatAmount,
    //   serviceTaxAmount,
    //   totalWithTaxes
    // });
    
    return totalWithTaxes;
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            {/* Guest Information Section */}
            <Card 
              elevation={2}
              sx={{ 
                mb: 3,
                backgroundColor: theme.palette.background.paper,
                border: `2px solid ${theme.palette.divider}`,
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                }}>
                  <Box>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700,
                      color: COLORS.PRIMARY,
                      mb: 0.5,
                    }}>
                      {t('walkInBooking.guestInformation.title')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {t('walkInBooking.guestInformation.description')}
                    </Typography>
                  </Box>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('walkInBooking.guestInformation.firstName')}
                      value={guestInfo.firstName}
                      onChange={handleGuestInfoChange('firstName')}
                      required
                      variant="outlined"
                      sx={{
                        '& .MuiInputBase-root': {
                          backgroundColor: theme.palette.background.paper,
                          borderRadius: 2,
                        },
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: COLORS.PRIMARY,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: COLORS.PRIMARY,
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: COLORS.PRIMARY,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('walkInBooking.guestInformation.lastName')}
                      value={guestInfo.lastName}
                      onChange={handleGuestInfoChange('lastName')}
                      required
                      variant="outlined"
                      sx={{
                        '& .MuiInputBase-root': {
                          backgroundColor: theme.palette.background.paper,
                          borderRadius: 2,
                        },
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: COLORS.PRIMARY,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: COLORS.PRIMARY,
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: COLORS.PRIMARY,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('walkInBooking.guestInformation.email')}
                      type="email"
                      value={guestInfo.email}
                      onChange={handleGuestInfoChange('email')}
                      required
                      variant="outlined"
                      sx={{
                        '& .MuiInputBase-root': {
                          backgroundColor: theme.palette.background.paper,
                          borderRadius: 2,
                        },
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: COLORS.PRIMARY,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: COLORS.PRIMARY,
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: COLORS.PRIMARY,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('walkInBooking.guestInformation.phone')}
                      value={guestInfo.phone}
                      onChange={handleGuestInfoChange('phone')}
                      required
                      variant="outlined"
                      sx={{
                        '& .MuiInputBase-root': {
                          backgroundColor: theme.palette.background.paper,
                          borderRadius: 2,
                        },
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: COLORS.PRIMARY,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: COLORS.PRIMARY,
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: COLORS.PRIMARY,
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Stay Details Section */}
            <Card 
              elevation={2}
              sx={{ 
                backgroundColor: theme.palette.background.paper,
                border: `2px solid ${theme.palette.divider}`,
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                }}>
                  <Box>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700,
                      color: COLORS.PRIMARY,
                      mb: 0.5,
                    }}>
                      {t('walkInBooking.stayDetails.title')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {t('walkInBooking.stayDetails.description')}
                    </Typography>
                  </Box>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label={t('walkInBooking.stayDetails.checkInDate')}
                        value={checkInDate}
                        onChange={(newValue) => newValue && setCheckInDate(newValue)}
                        minDate={new Date()}
                        slotProps={{ 
                          textField: { 
                            fullWidth: true,
                            sx: {
                              '& .MuiInputBase-root': {
                                backgroundColor: theme.palette.background.paper,
                                borderRadius: 2,
                              },
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: COLORS.PRIMARY,
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: COLORS.PRIMARY,
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: COLORS.PRIMARY,
                              },
                            }
                          } 
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label={t('walkInBooking.stayDetails.checkOutDate')}
                        value={checkOutDate}
                        onChange={(newValue) => newValue && setCheckOutDate(newValue)}
                        minDate={addDays(checkInDate, 1)}
                        slotProps={{ 
                          textField: { 
                            fullWidth: true,
                            sx: {
                              '& .MuiInputBase-root': {
                                backgroundColor: theme.palette.background.paper,
                                borderRadius: 2,
                              },
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: COLORS.PRIMARY,
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: COLORS.PRIMARY,
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: COLORS.PRIMARY,
                              },
                            }
                          } 
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <NumberStepper
                      value={guests}
                      onChange={handleGuestsChange}
                      min={1}
                      max={10}
                      label={t('walkInBooking.stayDetails.numberOfGuests')}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );
        
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: COLORS.PRIMARY }}>
              {t('walkInBooking.roomSelection.title')}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }} gutterBottom>
              {t('walkInBooking.roomSelection.description', { 
                checkIn: format(checkInDate, 'MMM dd, yyyy'),
                checkOut: format(checkOutDate, 'MMM dd, yyyy'),
                guests: guests,
                guestsPlural: guests !== 1 ? 's' : ''
              })}
            </Typography>
            
            {roomsLoading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={40} />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  {t('walkInBooking.roomSelection.loadingRooms')}
                </Typography>
              </Box>
            ) : availableRooms.length === 0 ? (
              <Alert severity="warning">
                {t('walkInBooking.roomSelection.noRoomsAvailable', {
                  guests: guests,
                  guestsPlural: guests !== 1 ? 's' : '',
                  checkIn: format(checkInDate, 'MMM dd'),
                  checkOut: format(checkOutDate, 'MMM dd')
                })}
              </Alert>
            ) : (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {availableRooms.map((room) => (
                  <Grid item xs={12} sm={6} md={4} key={room.id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        border: selectedRoom?.id === room.id ? '2px solid' : '1px solid',
                        borderColor: selectedRoom?.id === room.id ? COLORS.PRIMARY : theme.palette.divider,
                        backgroundColor: theme.palette.background.paper,
                        transform: selectedRoom?.id === room.id ? 'scale(1.02)' : 'scale(1)',
                        boxShadow: selectedRoom?.id === room.id ? '0 4px 12px rgba(21, 101, 192, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.08)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        '&:hover': {
                          transform: 'scale(1.02)',
                          borderColor: COLORS.PRIMARY,
                          boxShadow: '0 4px 12px rgba(21, 101, 192, 0.15)',
                        }
                      }}
                      onClick={() => setSelectedRoom(room)}
                    >

                      <CardContent sx={{ 
                        color: 'inherit',
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 600,
                            color: selectedRoom?.id === room.id ? COLORS.PRIMARY : 'inherit'
                          }}>
                            {t('walkInBooking.roomSelection.roomNumber')} {room.roomNumber}
                          </Typography>
                          <Chip 
                            label={room.roomType} 
                            size="small" 
                            sx={{
                              backgroundColor: selectedRoom?.id === room.id ? 'rgba(21, 101, 192, 0.1)' : theme.palette.action.hover,
                              color: selectedRoom?.id === room.id ? COLORS.PRIMARY : theme.palette.text.primary,
                              border: selectedRoom?.id === room.id ? `1px solid ${COLORS.PRIMARY}` : `1px solid ${theme.palette.divider}`
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ 
                          color: theme.palette.text.secondary,
                          mb: 1
                        }}>
                          {t('walkInBooking.roomSelection.capacity')}: {t(room.capacity === 1 ? 'walkInBooking.roomSelection.capacityText' : 'walkInBooking.roomSelection.capacityTextPlural', { count: room.capacity })}
                        </Typography>
                        {room.description && (
                          <Typography variant="body2" sx={{ 
                            color: theme.palette.text.secondary,
                            mb: 1
                          }}>
                            {room.description}
                          </Typography>
                        )}
                        <Typography variant="h6" sx={{
                          color: COLORS.PRIMARY,
                          fontWeight: 700
                        }}>
                          {formatCurrency(room.pricePerNight || 0)}{t('walkInBooking.roomSelection.perNightShort')}
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
                  label={t('walkInBooking.roomSelection.specialRequests')}
                  multiline
                  rows={3}
                  value={specialRequests}
                  onChange={handleSpecialRequestsChange}
                  placeholder={t('walkInBooking.roomSelection.specialRequestsPlaceholder')}
                  sx={{
                    '& .MuiInputBase-root': {
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: 2,
                    },
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: COLORS.PRIMARY,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: COLORS.PRIMARY,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: COLORS.PRIMARY,
                    },
                  }}
                />
              </Box>
            )}
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
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
              border: `2px solid ${theme.palette.divider}`,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: 1,
              }}>
                {t('walkInBooking.confirmation.bookingConfirmationTitle')}
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                {t('walkInBooking.confirmation.reviewDetails')}
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              {/* Guest Information */}
              <Grid item xs={12} sm={6}>
                <Card elevation={2} sx={{ 
                  backgroundColor: theme.palette.background.paper,
                  border: `2px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      mb: 2,
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.PRIMARY }}>
                        {t('walkInBooking.confirmation.guestInformation')}
                      </Typography>
                    </Box>                    <Box sx={{ space: 1.5 }}>
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
                          {t('walkInBooking.confirmation.fullName')}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {guestInfo.firstName} {guestInfo.lastName}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
                          {t('walkInBooking.confirmation.emailAddress')}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {guestInfo.email}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
                          {t('walkInBooking.confirmation.phoneNumber')}
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
                  backgroundColor: theme.palette.background.paper,
                  border: `2px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.PRIMARY }}>
                        {t('walkInBooking.confirmation.stayDetails')}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ space: 1.5 }}>
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
                          {t('walkInBooking.confirmation.room')}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {selectedRoom?.roomNumber} ({selectedRoom?.roomType})
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
                          {t('walkInBooking.confirmation.checkInCheckOut')}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {format(checkInDate, 'MMM dd, yyyy')} - {format(checkOutDate, 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
                          {t('walkInBooking.confirmation.guests')}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {guests} {guests !== 1 ? t('walkInBooking.confirmation.guestPlural') : t('walkInBooking.confirmation.guest')}
                        </Typography>
                      </Box>
                      {specialRequests && (
                        <Box>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
                            {t('walkInBooking.confirmation.specialRequests')}
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
                  backgroundColor: theme.palette.background.paper,
                  border: `2px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      mb: 3,
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.PRIMARY }}>
                        {t('walkInBooking.confirmation.pricingSummary')}
                      </Typography>
                    </Box>
                    
                    {/* Price Breakdown */}
                    <Box sx={{ 
                      p: 2,
                      bgcolor: theme.palette.action.hover,
                      borderRadius: 2,
                      mb: 2,
                      border: `1px solid ${theme.palette.divider}`,
                    }}>
                      {(() => {
                        const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
                        const subtotal = (selectedRoom?.pricePerNight || 0) * nights;
                        const vatAmount = subtotal * hotelVatRate;
                        const serviceTaxAmount = subtotal * hotelServiceTaxRate;
                        
                        return (
                          <>
                            {/* Subtotal */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                              <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                                {t('walkInBooking.confirmation.subtotal')} ({formatCurrencyWithDecimals(selectedRoom?.pricePerNight || 0)}{t('walkInBooking.confirmation.perNight')} × {nights} {nights !== 1 ? t('walkInBooking.confirmation.nightPlural') : t('walkInBooking.confirmation.night')})
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {formatCurrencyWithDecimals(subtotal)}
                              </Typography>
                            </Box>
                            
                            {/* VAT */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                              <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                                {t('walkInBooking.confirmation.vat')} ({(hotelVatRate * 100).toFixed(0)}%)
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {formatCurrencyWithDecimals(vatAmount)}
                              </Typography>
                            </Box>
                            
                            {/* Service Tax */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0 }}>
                              <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                                {t('walkInBooking.confirmation.serviceTax')} ({(hotelServiceTaxRate * 100).toFixed(0)}%)
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {formatCurrencyWithDecimals(serviceTaxAmount)}
                              </Typography>
                            </Box>
                          </>
                        );
                      })()}
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 2,
                      bgcolor: COLORS.PRIMARY,
                      borderRadius: 2,
                      mb: 2,
                    }}>
                      <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
                        {t('walkInBooking.confirmation.totalAmount')}
                      </Typography>
                      <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                        {formatCurrencyWithDecimals(calculateTotalAmount() || 0)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{
                      p: 2,
                      bgcolor: addAlpha(COLORS.PRIMARY, 0.1),
                      color: COLORS.PRIMARY,
                      borderRadius: 2,
                      textAlign: 'center',
                      border: `1px solid ${theme.palette.divider}`,
                    }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {t('walkInBooking.confirmation.paymentNote')}
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

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { 
          minHeight: '70vh',
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        }
      }}
    >
      <DialogTitle sx={{ 
        backgroundColor: theme.palette.background.paper,
        borderBottom: `2px solid ${theme.palette.divider}`,
        pb: 2,
      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 2,
        }}>
          <Box>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700,
                color: COLORS.PRIMARY,
              }}
            >
              {t('walkInBooking.title')}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {t('walkInBooking.subtitle')}
            </Typography>
          </Box>
        </Box>
        
        <Stepper 
          activeStep={activeStep} 
          alternativeLabel
          sx={{
            '& .MuiStepLabel-root .Mui-completed': {
              color: COLORS.PRIMARY,
            },
            '& .MuiStepLabel-root .Mui-active': {
              color: COLORS.PRIMARY,
            },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>
      
      <DialogContent sx={{ position: 'relative', minHeight: '400px' }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              backgroundColor: 'rgba(211, 47, 47, 0.1)',
              border: '1px solid rgba(211, 47, 47, 0.3)',
              borderRadius: 2,
              '& .MuiAlert-icon': {
                color: '#d32f2f',
              },
              '& .MuiAlert-message': {
                color: '#d32f2f',
                fontWeight: 500,
                fontSize: '0.95rem',
              },
            }}
          >
            {error}
          </Alert>
        )}
        
        {/* Loading overlay for entire dialog content */}
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
        
        {renderStepContent()}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2, backgroundColor: theme.palette.background.paper, borderTop: `2px solid ${theme.palette.divider}` }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          sx={{
            color: theme.palette.text.secondary,
            borderColor: theme.palette.divider,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
              borderColor: COLORS.PRIMARY,
            },
          }}
        >
          {t('walkInBooking.actions.cancel')}
        </Button>
        
        {activeStep > 0 && (
          <Button 
            onClick={handleBack} 
            disabled={loading}
            sx={{
              color: theme.palette.text.secondary,
              borderColor: theme.palette.divider,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
                borderColor: COLORS.PRIMARY,
              },
            }}
          >
            {t('walkInBooking.actions.back')}
          </Button>
        )}
        
        {activeStep < steps.length - 1 ? (
          <Button 
            variant="contained" 
            onClick={handleNext}
            disabled={loading || (activeStep === 1 && (!selectedRoom || roomsLoading))}
            sx={{
              backgroundColor: COLORS.PRIMARY,
              color: 'white',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: COLORS.CHECKED_IN,
              },
              '&:disabled': {
                backgroundColor: theme.palette.action.disabledBackground,
                color: theme.palette.action.disabled,
              },
            }}
          >
            {roomsLoading && activeStep === 1 ? t('walkInBooking.actions.loadingRooms') : t('walkInBooking.actions.next')}
          </Button>
        ) : (
          <Button 
            variant="contained" 
            onClick={handleCreateBooking}
            disabled={loading || !selectedRoom}
            sx={{
              backgroundColor: COLORS.PRIMARY,
              color: 'white',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: COLORS.CHECKED_IN,
              },
              '&:disabled': {
                backgroundColor: theme.palette.action.disabledBackground,
                color: theme.palette.action.disabled,
              },
            }}
          >
            {loading ? t('walkInBooking.messages.creatingBooking') : t('walkInBooking.actions.confirm')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default WalkInBookingModal;
