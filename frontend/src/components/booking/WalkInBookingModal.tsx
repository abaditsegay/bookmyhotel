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
  MenuItem,
  Box,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { hotelApiService } from '../../services/hotelApi';
import { hotelAdminApi } from '../../services/hotelAdminApi';
import { API_CONFIG } from '../../config/apiConfig';

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

const steps = ['Guest Information', 'Room Selection', 'Confirmation'];

const WalkInBookingModal: React.FC<WalkInBookingModalProps> = ({
  open,
  onClose,
  onSuccess,
  apiContext = 'frontdesk', // Default to frontdesk for backwards compatibility
}) => {
  console.log('WalkInBookingModal render - open:', open); // Debug log
  
  const { token, user } = useAuth();
  const { tenantId } = useTenant();
  
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

  // Memoized change handlers to prevent input focus loss
  const handleGuestInfoChange = React.useCallback((field: keyof WalkInGuestInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuestInfo(prev => ({ ...prev, [field]: e.target.value }));
  }, []);

  const handleGuestsChange = React.useCallback((e: any) => {
    setGuests(Number(e.target.value));
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
          
          console.log('Loading hotel info for user role:', user?.role, 'using endpoint:', endpoint);
          
          const response = await fetch(endpoint, {
            headers
          });
          
          if (response.ok) {
            const hotelData = await response.json();
            setHotelId(hotelData.id);
            console.log('Loaded hotel info:', hotelData); // Debug log
          } else {
            const errorText = await response.text();
            console.error('Failed to fetch hotel information:', response.status, errorText);
            throw new Error(`Failed to fetch hotel information: ${response.status}`);
          }
        } catch (hotelError) {
          console.error('Failed to fetch hotel information:', hotelError);
          setError('Failed to load hotel information. Please ensure you are logged in with appropriate permissions.');
          return;
        }
      } catch (error) {
        console.error('Failed to load hotel info:', error);
        setError('Failed to load hotel information');
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
  }, [open, token, tenantId, user?.role, user?.roles]);

  // Load available rooms when dates/guests change and we're on step 1
  useEffect(() => {
    const loadAvailableRooms = async () => {
      if (!hotelId || !token) {
        console.log('Cannot load rooms - missing hotelId or token:', { hotelId, hasToken: !!token });
        return;
      }
      
      setRoomsLoading(true);
      setError(null);
      
      try {
        console.log('Loading available rooms for:', {
          hotelId,
          checkIn: format(checkInDate, 'yyyy-MM-dd'),
          checkOut: format(checkOutDate, 'yyyy-MM-dd'),
          guests,
          userRole: user?.role
        });
        
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
          
          console.log('Hotel admin fetching available rooms for date range:', format(checkInDate, 'yyyy-MM-dd'), 'to', format(checkOutDate, 'yyyy-MM-dd'), 'guests:', guests);
          
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
          
          console.log('Front desk fetching available rooms for date range:', format(checkInDate, 'yyyy-MM-dd'), 'to', format(checkOutDate, 'yyyy-MM-dd'), 'guests:', guests);
          
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
        
        console.log('Available rooms loaded:', filteredRooms.length, 'out of', rooms.length, 'total rooms');
        console.log('Filtered for', guests, 'guests on', format(checkInDate, 'yyyy-MM-dd'), 'to', format(checkOutDate, 'yyyy-MM-dd'));
        setAvailableRooms(filteredRooms);
        setSelectedRoom(null);
      } catch (error) {
        console.error('Failed to load available rooms:', error);
        setError('Failed to load available rooms. Please try again.');
        setAvailableRooms([]);
      } finally {
        setRoomsLoading(false);
      }
    };

    if (activeStep === 1 && hotelId && checkInDate && checkOutDate) {
      loadAvailableRooms();
    }
  }, [activeStep, hotelId, checkInDate, checkOutDate, guests, token, user?.role, user?.roles, tenantId]);

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
        console.log('Creating walk-in booking via hotel admin API');
        response = await hotelAdminApi.createWalkInBooking(token, bookingRequest);
        if (response.success) {
          response = response.data;
        } else {
          throw new Error(response.message || 'Failed to create booking');
        }
      } else {
        console.log('Creating walk-in booking via front desk API');
        response = await hotelApiService.createBooking(bookingRequest);
      }
      
      if (response) {
        onSuccess(response);
        onClose();
      }
    } catch (error) {
      console.error('Failed to create walk-in booking:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to create booking. Please try again.';
      
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        
        if (message.includes('no available rooms') || 
            message.includes('room not available') ||
            message.includes('room is not available') ||
            message.includes('room does not belong') ||
            message.includes('room already occupied')) {
          errorMessage = 'The selected room is no longer available. Please choose a different room or refresh the available rooms.';
        } else if (message.includes('room not found')) {
          errorMessage = 'The selected room could not be found. Please refresh and try again.';
        } else if (message.includes('guest information') || message.includes('invalid guest')) {
          errorMessage = 'Please check the guest information and try again.';
        } else if (message.includes('payment')) {
          errorMessage = 'There was an issue processing the payment information. Please try again.';
        } else if (message.includes('date') || message.includes('check-in') || message.includes('check-out')) {
          errorMessage = 'Please check the check-in and check-out dates and try again.';
        } else if (error.message !== 'Failed to create booking. Please try again.') {
          // Use the actual error message if it's not the generic one
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalAmount = () => {
    if (!selectedRoom) return 0;
    
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    return selectedRoom.pricePerNight * nights;
  };

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
              <Typography>Loading available rooms...</Typography>
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
                        ${calculateTotalAmount()}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Payment will be processed at the front desk
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

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle>
        Walk-in Guest Booking
        <Box sx={{ mt: 2 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {renderStepContent()}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        
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
          >
            Next
          </Button>
        ) : (
          <Button 
            variant="contained" 
            onClick={handleCreateBooking}
            disabled={loading || !selectedRoom}
          >
            {loading ? 'Creating Booking...' : 'Create Booking'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default WalkInBookingModal;
