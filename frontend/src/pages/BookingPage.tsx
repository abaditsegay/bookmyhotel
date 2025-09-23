import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  Alert,
  Divider,
  Paper,
  Breadcrumbs,
  Link,
  IconButton,
  Card,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  Chip,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CreditCard as CreditCardIcon,
  PhoneAndroid as PhoneIcon,
  Lock as LockIcon,
  Hotel as HotelIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAuthenticatedApi } from '../hooks/useAuthenticatedApi';
import { AvailableRoom, HotelSearchRequest } from '../types/hotel';
import { useMockPayment, MockPaymentRequest } from '../services/mockPaymentGateway';
import { PaymentMethod } from '../types/shop';
import { themeConstants } from '../theme/theme';

interface BookingPageState {
  room?: AvailableRoom;
  roomType?: any; // For room type bookings
  hotelName: string;
  hotelId: number;
  searchRequest?: HotelSearchRequest;
  asGuest?: boolean;
}

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { hotelApiService } = useAuthenticatedApi();
  
  // Mobile responsiveness
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Get data from navigation state
  const bookingData = location.state as BookingPageState;
  
  // Form state - pre-populate with user data if available
  const [checkInDate, setCheckInDate] = useState<Dayjs | null>(
    bookingData?.searchRequest?.checkInDate ? dayjs(bookingData.searchRequest.checkInDate) : dayjs()
  );
  const [checkOutDate, setCheckOutDate] = useState<Dayjs | null>(
    bookingData?.searchRequest?.checkOutDate ? dayjs(bookingData.searchRequest.checkOutDate) : dayjs().add(1, 'day')
  );
  const [guests, setGuests] = useState(bookingData?.searchRequest?.guests || 1);
  const [guestName, setGuestName] = useState(user ? `${user.firstName} ${user.lastName}` : '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');
  const [specialRequests, setSpecialRequests] = useState('');
  
  // Payment state with mock test data pre-filled
  const mockPayment = useMockPayment();
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'mobile_money' | 'pay_at_frontdesk' | 'mbirr' | 'telebirr'>('credit_card');
  const [creditCardNumber, setCreditCardNumber] = useState('4532-1234-5678-9012');
  const [expiryDate, setExpiryDate] = useState('12/27');
  const [cvv, setCvv] = useState('123');
  const [cardholderName, setCardholderName] = useState('John Doe');
  const [mobileNumber, setMobileNumber] = useState('+251911123456');
  const [transferReceiptNumber, setTransferReceiptNumber] = useState('TXN123456789');
  
  // Ethiopian payment state
  const [ethiopianPhoneNumber, setEthiopianPhoneNumber] = useState('');
  const [showEthiopianPayment, setShowEthiopianPayment] = useState(false);
  const [ethiopianPaymentResponse, setEthiopianPaymentResponse] = useState<any>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Memoized change handlers to prevent input focus loss
  const handleGuestNameChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setGuestName(e.target.value);
  }, []);

  const handleGuestEmailChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setGuestEmail(e.target.value);
  }, []);

  const handleGuestPhoneChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setGuestPhone(e.target.value);
  }, []);

  const handleSpecialRequestsChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSpecialRequests(e.target.value);
  }, []);

  const handleCardholderNameChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCardholderName(e.target.value);
  }, []);

  const handleMobileNumberChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMobileNumber(e.target.value);
  }, []);

  const handleTransferReceiptNumberChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTransferReceiptNumber(e.target.value);
  }, []);

  const handleEthiopianPhoneNumberChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEthiopianPhoneNumber(e.target.value);
  }, []);

  const handleGuestsChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setGuests(Math.max(1, parseInt(e.target.value) || 1));
  }, []);

  const handlePaymentMethodChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newMethod = e.target.value as 'credit_card' | 'mobile_money' | 'pay_at_frontdesk' | 'mbirr' | 'telebirr';
    setPaymentMethod(newMethod);
    
    // Pre-fill with test data for the selected payment method
    if (newMethod === 'credit_card') {
      setCreditCardNumber('4532-1234-5678-9012');
      setExpiryDate('12/27');
      setCvv('123');
      setCardholderName('John Doe');
    } else if (newMethod === 'mobile_money') {
      setMobileNumber('+251911123456');
      setTransferReceiptNumber('TXN123456789');
    } else if (newMethod === 'mbirr') {
      setEthiopianPhoneNumber('0911123456');
    } else if (newMethod === 'telebirr') {
      setEthiopianPhoneNumber('0987654321');
    }
  }, []);

  // Update guest information when user data loads
  useEffect(() => {
    if (user && user.firstName && user.lastName) {
      setGuestName(`${user.firstName} ${user.lastName}`);
      setGuestEmail(user.email || '');
    }
  }, [user]);

  // Redirect if no booking data
  useEffect(() => {
    if (!bookingData?.room && !bookingData?.roomType) {
      navigate('/hotels/search-results');
      return;
    }
    
    // Only redirect to auth if user is not authenticated AND this is not marked as guest booking
    if (!isAuthenticated && !bookingData.asGuest) {
      navigate('/guest-auth', {
        state: {
          from: '/booking',
          bookingData
        }
      });
    }
  }, [bookingData, isAuthenticated, navigate]);

  // Allow access if authenticated OR booking as guest OR has booking data
  // This ensures guest users can complete booking without authentication
  if (!bookingData?.room && !bookingData?.roomType) {
    return null; // Will redirect
  }

  // Determine if this is a guest booking flow
  const isGuestBookingFlow = bookingData.asGuest || !isAuthenticated;

  const { room, roomType, hotelName } = bookingData;

  // Use room data from either room or roomType
  const roomData = room || roomType;

  const calculateTotalAmount = () => {
    if (!checkInDate || !checkOutDate || !roomData) return 0;
    const nights = checkOutDate.diff(checkInDate, 'day');
    return roomData.pricePerNight * nights;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!checkInDate || !checkOutDate) {
      setError('Please fill in all required fields');
      return;
    }

    if (checkInDate >= checkOutDate) {
      setError('Check-out date must be after check-in date');
      return;
    }

    // Validate guest information for guest booking flow
    if (isGuestBookingFlow) {
      if (!guestName.trim() || !guestEmail.trim()) {
        setError('Please provide guest name and email');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guestEmail)) {
        setError('Please provide a valid email address');
        return;
      }
    }

    // Payment validation
    if (paymentMethod === 'credit_card') {
      if (!creditCardNumber || !expiryDate || !cvv || !cardholderName) {
        setError('Please fill in all credit card details');
        return;
      }
      // Basic credit card number validation (16 digits)
      const cardNumberOnly = creditCardNumber.replace(/\s/g, '');
      if (!/^\d{16}$/.test(cardNumberOnly)) {
        setError('Please enter a valid 16-digit credit card number');
        return;
      }
      // Basic CVV validation (3-4 digits)
      if (!/^\d{3,4}$/.test(cvv)) {
        setError('Please enter a valid CVV (3-4 digits)');
        return;
      }
      // Basic expiry date validation (MM/YY format)
      if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        setError('Please enter expiry date in MM/YY format');
        return;
      }
    }

    if (paymentMethod === 'mobile_money') {
      if (!mobileNumber || !transferReceiptNumber) {
        setError('Please provide mobile number and transfer receipt number');
        return;
      }
      // Basic mobile number validation
      if (!/^\+?\d{10,15}$/.test(mobileNumber.replace(/\s/g, ''))) {
        setError('Please enter a valid mobile number');
        return;
      }
    }

    if (paymentMethod === 'mbirr' || paymentMethod === 'telebirr') {
      if (!ethiopianPhoneNumber) {
        setError('Please provide your Ethiopian mobile number');
        return;
      }
      // Ethiopian phone number validation (09xxxxxxxx)
      const cleanPhone = ethiopianPhoneNumber.replace(/\s/g, '');
      if (!/^09\d{8}$/.test(cleanPhone)) {
        setError('Please enter a valid Ethiopian phone number (09xxxxxxxx)');
        return;
      }
    }

    setLoading(true);

    try {
      // Process payment through mock gateway first
      let paymentResult = null;
      
      if (paymentMethod !== 'pay_at_frontdesk') {
        const mockPaymentRequest: MockPaymentRequest = {
          amount: totalAmount,
          currency: 'ETB',
          paymentMethod: paymentMethod === 'credit_card' ? PaymentMethod.CREDIT_CARD :
                        paymentMethod === 'mobile_money' ? PaymentMethod.MOBILE_MONEY :
                        paymentMethod === 'mbirr' ? PaymentMethod.MOBILE_MONEY :
                        paymentMethod === 'telebirr' ? PaymentMethod.MOBILE_MONEY :
                        PaymentMethod.CASH,
          customerInfo: {
            name: guestName.trim() || cardholderName || 'Guest',
            email: guestEmail.trim(),
            phone: guestPhone.trim() || mobileNumber || ethiopianPhoneNumber,
          },
          paymentDetails: {
            cardNumber: creditCardNumber,
            expiryDate: expiryDate,
            cvv: cvv,
            cardHolderName: cardholderName,
            phoneNumber: mobileNumber || ethiopianPhoneNumber,
            provider: paymentMethod === 'mbirr' ? 'M-Birr' : 
                     paymentMethod === 'telebirr' ? 'TeleBirr' : 'Mobile Money',
            description: `Hotel booking for ${nights} nights`,
          },
        };

        // Process payment through mock gateway (always succeeds)
        paymentResult = await mockPayment.processPayment(mockPaymentRequest);
      }

      const bookingRequest = {
        hotelId: bookingData.hotelId,
        roomId: roomData.id || undefined, // For individual room bookings
        roomType: roomData.roomType || roomType?.roomType, // For room type bookings
        checkInDate: checkInDate.format('YYYY-MM-DD'),
        checkOutDate: checkOutDate.format('YYYY-MM-DD'),
        guests: guests,
        specialRequests: specialRequests.trim() || undefined,
        paymentMethodId: paymentMethod === 'credit_card' ? 'card_payment' : 
                        paymentMethod === 'pay_at_frontdesk' ? 'pay_at_frontdesk' :
                        paymentMethod === 'mbirr' ? 'mbirr' :
                        paymentMethod === 'telebirr' ? 'telebirr' : undefined,
        // Include payment reference from mock gateway
        paymentReference: paymentResult?.paymentReference,
        transactionId: paymentResult?.transactionId,
        // Include guest information - always send if provided, regardless of auth status
        guestName: guestName.trim() || undefined,
        guestEmail: guestEmail.trim() || undefined,
        guestPhone: guestPhone.trim() || undefined,
        // Include Ethiopian phone number for Ethiopian payment methods
        mobileNumber: (paymentMethod === 'mbirr' || paymentMethod === 'telebirr') ? 
                     ethiopianPhoneNumber.replace(/\s/g, '') : 
                     (paymentMethod === 'mobile_money' ? mobileNumber : undefined),
      };

      // Remove undefined roomId for room type bookings to avoid sending null to backend
      if (!bookingRequest.roomId) {
        delete (bookingRequest as any).roomId;
      }      const result = await hotelApiService.createBooking(bookingRequest);
      
      // Navigate to confirmation page with booking details
      navigate(`/booking-confirmation/${result.reservationId}`, { 
        state: { 
          booking: result
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while booking');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToResults = () => {
    // Try to go back to search results with the data we have
    if (bookingData?.searchRequest) {
      navigate('/hotels/search-results', { 
        state: { 
          searchRequest: bookingData.searchRequest,
          // If we don't have hotels data, HotelListPage will perform a new search
          hotels: [] // This will trigger a search in HotelListPage
        } 
      });
    } else {
      // Fallback to search page if we don't have search request data
      navigate('/hotels/search');
    }
  };

  const totalAmount = calculateTotalAmount();
  const nights = checkInDate && checkOutDate 
    ? checkOutDate.diff(checkInDate, 'day')
    : 0;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container 
        maxWidth="md" 
        sx={{ 
          py: isMobile ? 2 : 4,
          px: isMobile ? 1 : 3,
        }}
      >
        {/* Header Section */}
        <Box sx={{ mb: isMobile ? 2 : 4 }}>
          {/* Back Navigation */}
          <Box sx={{ mb: isMobile ? 1 : 2 }}>
            <IconButton 
              onClick={handleBackToResults}
              sx={{ 
                mr: 1,
                minHeight: 48,
                minWidth: 48,
              }}
              aria-label="back to search results"
            >
              <ArrowBackIcon />
            </IconButton>
            <Breadcrumbs 
              aria-label="breadcrumb"
              sx={{ 
                display: isMobile ? 'none' : 'flex',
              }}
            >
              <Link 
                component="button" 
                variant="body2" 
                onClick={() => navigate('/')}
                sx={{ textDecoration: 'none' }}
              >
                Hotel Search
              </Link>
              <Link 
                component="button" 
                variant="body2" 
                onClick={handleBackToResults}
                sx={{ textDecoration: 'none' }}
              >
                Search Results
              </Link>
              <Typography variant="body2" color="text.primary">
                Book Your Stay
              </Typography>
            </Breadcrumbs>
            
            {/* Mobile navigation text */}
            {isMobile && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                ← Back to search results
              </Typography>
            )}
          </Box>

          {/* Page Title */}
          <Typography 
            variant={isMobile ? 'h5' : 'h4'} 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              mb: isMobile ? 1 : 2,
            }}
          >
            Book Your Stay
          </Typography>
          
          {/* Guest booking chip - stacked on mobile */}
          {isGuestBookingFlow && (
            <Box sx={{ mb: isMobile ? 1 : 0 }}>
              <Chip 
                label="Guest Booking" 
                color="info" 
                size={isMobile ? 'medium' : 'small'}
                sx={{ 
                  fontWeight: 'bold',
                  display: isMobile ? 'block' : 'inline-block',
                  width: isMobile ? 'fit-content' : 'auto',
                }}
              />
            </Box>
          )}
          
          {hotelName && (
            <Typography 
              variant={isMobile ? 'body1' : 'h6'} 
              color="text.secondary" 
              gutterBottom
              sx={{ fontWeight: isMobile ? 'bold' : 'normal' }}
            >
              {hotelName}
            </Typography>
          )}
          
          {isGuestBookingFlow && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              ✨ You're booking as a guest - no account required!
            </Typography>
          )}
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Room Details Card */}
        <Paper 
          elevation={1} 
          sx={{ 
            p: isMobile ? 2 : 3, 
            mb: isMobile ? 2 : 4, 
            bgcolor: theme.palette.mode === 'dark' 
              ? themeConstants.darkTheme.cardBackground 
              : 'grey.50',
          }}
        >
          <Typography 
            variant={isMobile ? 'subtitle1' : 'h6'} 
            component="div" 
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            Room Details
          </Typography>
          <Grid container spacing={isMobile ? 1 : 2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Room Type:</strong> {roomData.roomType}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Capacity:</strong> Up to {roomData.capacity} guests
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Price per night:</strong> ETB {roomData.pricePerNight?.toFixed(0)}
              </Typography>
              {nights > 0 && (
                <>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Nights:</strong> {nights}
                  </Typography>
                  <Typography 
                    variant={isMobile ? 'subtitle1' : 'h6'} 
                    component="div" 
                    color="primary.main"
                    sx={{ fontWeight: 'bold' }}
                  >
                    Total: ETB {totalAmount?.toFixed(0)}
                  </Typography>
                </>
              )}
            </Grid>
          </Grid>
          {roomData.description && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mt: isMobile ? 1 : 2,
                fontStyle: 'italic',
              }}
            >
              {roomData.description}
            </Typography>
          )}
        </Paper>

        {/* Booking Form */}
        <form onSubmit={handleSubmit}>
          <Card 
            elevation={1} 
            sx={{ 
              p: isMobile ? 2 : 3, 
              position: 'relative',
            }}
          >
            {/* Loading overlay for booking form */}
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
                  borderRadius: 1,
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress size={40} />
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    Processing your booking...
                  </Typography>
                </Box>
              </Box>
            )}
            <Grid container spacing={isMobile ? 2 : 3}>
              {/* Dates and Guests - stacked on mobile */}
              <Grid item xs={12} sm={4}>
                <DatePicker
                  label="Check-in Date"
                  value={checkInDate}
                  onChange={setCheckInDate}
                  minDate={dayjs()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      sx: {
                        '& .MuiInputBase-root': {
                          minHeight: isMobile ? 56 : 'auto',
                        },
                      },
                    },
                    popper: {
                      placement: isMobile ? 'bottom-start' : undefined,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <DatePicker
                  label="Check-out Date"
                  value={checkOutDate}
                  onChange={setCheckOutDate}
                  minDate={checkInDate || dayjs()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      sx: {
                        '& .MuiInputBase-root': {
                          minHeight: isMobile ? 56 : 'auto',
                        },
                      },
                    },
                    popper: {
                      placement: isMobile ? 'bottom-start' : undefined,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="Number of Guests"
                  type="number"
                  value={guests}
                  onChange={handleGuestsChange}
                  inputProps={{ min: 1, max: roomData.capacity }}
                  fullWidth
                  required
                  sx={{
                    '& .MuiInputBase-root': {
                      minHeight: isMobile ? 56 : 'auto',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: isMobile ? 1 : 2 }} />
                <Typography 
                  variant={isMobile ? 'subtitle1' : 'h6'} 
                  component="div" 
                  gutterBottom
                  sx={{ fontWeight: 'bold' }}
                >
                  Guest Information
                </Typography>
              </Grid>

              {isAuthenticated && !isGuestBookingFlow ? (
                // Display authenticated user information (only if not doing guest booking)
                <Grid item xs={12}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      p: isMobile ? 2 : 3, 
                      backgroundColor: 'grey.50',
                    }}
                  >
                    <Typography variant="body1" gutterBottom>
                      <strong>Name:</strong> {user?.firstName || 'N/A'} {user?.lastName || 'N/A'}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Email:</strong> {user?.email}
                    </Typography>
                    {user?.phone && (
                      <Typography variant="body1">
                        <strong>Phone:</strong> {user.phone}
                      </Typography>
                    )}
                  </Card>
                </Grid>
              ) : (
                // Guest input fields for guest booking flow or non-authenticated users
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Full Name"
                      value={guestName}
                      onChange={handleGuestNameChange}
                      fullWidth
                      required
                      sx={{
                        '& .MuiInputBase-root': {
                          minHeight: isMobile ? 56 : 'auto',
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email Address"
                      type="email"
                      value={guestEmail}
                      onChange={handleGuestEmailChange}
                      fullWidth
                      required
                      sx={{
                        '& .MuiInputBase-root': {
                          minHeight: isMobile ? 56 : 'auto',
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={isMobile ? 12 : 6}>
                    <TextField
                      label="Phone Number"
                      value={guestPhone}
                      onChange={handleGuestPhoneChange}
                      fullWidth
                      sx={{
                        '& .MuiInputBase-root': {
                          minHeight: isMobile ? 56 : 'auto',
                        },
                      }}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <TextField
                  label="Special Requests"
                  value={specialRequests}
                  onChange={handleSpecialRequestsChange}
                  multiline
                  rows={isMobile ? 2 : 3}
                  fullWidth
                  placeholder="Any special requests or preferences..."
                  sx={{
                    '& .MuiInputBase-root': {
                      minHeight: isMobile ? 88 : 'auto',
                    },
                  }}
                />
              </Grid>

              {/* Payment Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: isMobile ? 1 : 2 }} />
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: isMobile ? 1 : 2,
                    flexWrap: 'wrap',
                  }}
                >
                  <LockIcon sx={{ mr: 1, color: 'success.main' }} />
                  <Typography 
                    variant={isMobile ? 'subtitle1' : 'h6'} 
                    component="div"
                    sx={{ fontWeight: 'bold' }}
                  >
                    Secure Payment Information
                  </Typography>
                </Box>
              </Grid>

              {/* Payment Method Selection */}
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel 
                    component="legend" 
                    sx={{ 
                      fontWeight: 'bold', 
                      color: 'text.primary',
                      fontSize: isMobile ? '0.875rem' : '1rem',
                    }}
                  >
                    Payment Method
                  </FormLabel>
                  <RadioGroup
                    row={!isMobile}
                    value={paymentMethod}
                    onChange={handlePaymentMethodChange}
                    sx={{ 
                      mt: 1,
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: isMobile ? 0.5 : 1,
                    }}
                  >
                    <FormControlLabel
                      value="credit_card"
                      control={<Radio />}
                      label={
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            minHeight: isMobile ? 48 : 'auto',
                            py: isMobile ? 1 : 0,
                          }}
                        >
                          <CreditCardIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                          Credit Card
                        </Box>
                      }
                      sx={{
                        mr: isMobile ? 0 : 2,
                        mb: isMobile ? 0.5 : 0,
                        '& .MuiFormControlLabel-root': {
                          alignItems: 'flex-start',
                        },
                      }}
                    />
                    <FormControlLabel
                      value="mobile_money"
                      control={<Radio />}
                      label={
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            minHeight: isMobile ? 48 : 'auto',
                            py: isMobile ? 1 : 0,
                          }}
                        >
                          <PhoneIcon sx={{ mr: 1, color: theme.palette.info.main }} />
                          Mobile Money Transfer
                        </Box>
                      }
                      sx={{
                        mr: isMobile ? 0 : 2,
                        mb: isMobile ? 0.5 : 0,
                      }}
                    />
                    <FormControlLabel
                      value="pay_at_frontdesk"
                      control={<Radio />}
                      label={
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            minHeight: isMobile ? 48 : 'auto',
                            py: isMobile ? 1 : 0,
                          }}
                        >
                          <HotelIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                          Pay at Front Desk
                        </Box>
                      }
                      sx={{
                        mr: isMobile ? 0 : 2,
                        mb: isMobile ? 0.5 : 0,
                      }}
                    />
                    <FormControlLabel
                      value="mbirr"
                      control={<Radio />}
                      label={
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            minHeight: isMobile ? 48 : 'auto',
                            py: isMobile ? 1 : 0,
                          }}
                        >
                          <PhoneIcon sx={{ 
                            mr: 1, 
                            color: theme.palette.mode === 'dark' ? themeConstants.darkTheme.mbirrOrange : themeConstants.mbirrOrange 
                          }} />
                          🇪🇹 M-birr
                        </Box>
                      }
                      sx={{
                        mr: isMobile ? 0 : 2,
                        mb: isMobile ? 0.5 : 0,
                      }}
                    />
                    <FormControlLabel
                      value="telebirr"
                      control={<Radio />}
                      label={
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            minHeight: isMobile ? 48 : 'auto',
                            py: isMobile ? 1 : 0,
                          }}
                        >
                          <PhoneIcon sx={{ 
                            mr: 1, 
                            color: theme.palette.mode === 'dark' ? themeConstants.darkTheme.telebirrGreen : themeConstants.telebirrGreen 
                          }} />
                          🇪🇹 Telebirr
                        </Box>
                      }
                      sx={{
                        mr: isMobile ? 0 : 2,
                        mb: isMobile ? 0.5 : 0,
                      }}
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {/* Credit Card Form */}
              {paymentMethod === 'credit_card' && (
                <>
                  <Grid item xs={12}>
                    <Paper 
                      sx={{ 
                        p: isMobile ? 2 : 3, 
                        bgcolor: theme.palette.mode === 'dark' 
                          ? themeConstants.darkTheme.cardBackground 
                          : 'grey.50', 
                        border: '1px solid', 
                        borderColor: theme.palette.mode === 'dark' 
                          ? themeConstants.darkTheme.borderColor 
                          : 'grey.200',
                      }}
                    >
                      <Typography 
                        variant="subtitle2" 
                        gutterBottom 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          fontWeight: 'bold',
                        }}
                      >
                        <CreditCardIcon sx={{ mr: 1 }} />
                        Credit Card Details
                      </Typography>
                      <Grid container spacing={isMobile ? 2 : 3}>
                        <Grid item xs={12}>
                          <TextField
                            label="Cardholder Name"
                            value={cardholderName}
                            onChange={handleCardholderNameChange}
                            fullWidth
                            required
                            placeholder="John Doe"
                            sx={{
                              '& .MuiInputBase-root': {
                                minHeight: isMobile ? 56 : 'auto',
                              },
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label="Card Number"
                            value={creditCardNumber}
                            onChange={(e) => {
                              // Format card number with spaces
                              const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                              if (value.replace(/\s/g, '').length <= 16) {
                                setCreditCardNumber(value);
                              }
                            }}
                            fullWidth
                            required
                            placeholder="1234 5678 9012 3456"
                            inputProps={{
                              inputMode: 'numeric',
                            }}
                            sx={{
                              '& .MuiInputBase-root': {
                                minHeight: isMobile ? 56 : 'auto',
                              },
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CreditCardIcon color="action" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={isMobile ? 12 : 6} sm={6}>
                          <TextField
                            label="Expiry Date"
                            value={expiryDate}
                            onChange={(e) => {
                              // Format expiry date MM/YY
                              let value = e.target.value.replace(/\D/g, '');
                              if (value.length >= 2) {
                                value = value.substring(0, 2) + '/' + value.substring(2, 4);
                              }
                              setExpiryDate(value);
                            }}
                            fullWidth
                            required
                            placeholder="MM/YY"
                            inputProps={{ 
                              maxLength: 5,
                              inputMode: 'numeric',
                            }}
                            sx={{
                              '& .MuiInputBase-root': {
                                minHeight: isMobile ? 56 : 'auto',
                              },
                            }}
                          />
                        </Grid>
                        <Grid item xs={isMobile ? 12 : 6} sm={6}>
                          <TextField
                            label="CVV"
                            value={cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 4) {
                                setCvv(value);
                              }
                            }}
                            fullWidth
                            required
                            placeholder="123"
                            type="password"
                            inputProps={{ 
                              maxLength: 4,
                              inputMode: 'numeric',
                            }}
                            sx={{
                              '& .MuiInputBase-root': {
                                minHeight: isMobile ? 56 : 'auto',
                              },
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </>
              )}

              {/* Mobile Money Form */}
              {paymentMethod === 'mobile_money' && (
                <>
                  <Grid item xs={12}>
                    <Paper sx={{ 
                      p: 2, 
                      bgcolor: theme.palette.mode === 'dark' 
                        ? themeConstants.darkTheme.cardBackground 
                        : 'grey.50', 
                      border: '1px solid', 
                      borderColor: theme.palette.mode === 'dark' 
                        ? themeConstants.darkTheme.borderColor 
                        : 'grey.200' 
                    }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon sx={{ mr: 1 }} />
                        Mobile Money Transfer Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Alert severity="info" sx={{ mb: 2 }}>
                            Please complete the mobile money transfer to our account and provide the details below.
                          </Alert>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Mobile Number"
                            value={mobileNumber}
                            onChange={handleMobileNumberChange}
                            fullWidth
                            required
                            placeholder="+1234567890"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PhoneIcon color="action" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Transfer Receipt Number"
                            value={transferReceiptNumber}
                            onChange={handleTransferReceiptNumberChange}
                            fullWidth
                            required
                            placeholder="Receipt/Transaction ID"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Amount to Transfer:</strong> ETB {totalAmount?.toFixed(0)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </>
              )}

              {/* Pay at Front Desk Information */}
              {paymentMethod === 'pay_at_frontdesk' && (
                <>
                  <Grid item xs={12}>
                    <Paper sx={{ 
                      p: 2, 
                      bgcolor: theme.palette.mode === 'dark' 
                        ? `${theme.palette.info.main}15` 
                        : 'info.light', 
                      border: '1px solid', 
                      borderColor: theme.palette.info.main,
                      color: theme.palette.mode === 'dark' 
                        ? theme.palette.info.light 
                        : 'info.contrastText'
                    }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        fontWeight: 'bold',
                        color: theme.palette.info.main
                      }}>
                        <HotelIcon sx={{ mr: 1, color: theme.palette.info.main }} />
                        Pay at Front Desk
                      </Typography>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Your reservation will be confirmed and you can pay when you arrive at the hotel.
                      </Alert>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Important Information:</strong>
                        </Typography>
                        <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 2 }}>
                          <li>Payment is due upon check-in at the front desk</li>
                          <li>Accepted payment methods: Cash, Credit Card, Debit Card</li>
                          <li>Please bring a valid ID for check-in</li>
                          <li>Total amount due: <strong>ETB {totalAmount?.toFixed(0)}</strong></li>
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </>
              )}

              {/* Ethiopian Mobile Payment (M-birr) */}
              {paymentMethod === 'mbirr' && (
                <>
                  <Grid item xs={12}>
                    <Paper sx={{ 
                      p: 2, 
                      bgcolor: theme.palette.mode === 'dark' 
                        ? `${themeConstants.darkTheme.mbirrOrange}15` 
                        : `${themeConstants.mbirrOrange}20`, 
                      border: '2px solid', 
                      borderColor: theme.palette.mode === 'dark' ? themeConstants.darkTheme.mbirrOrange : themeConstants.mbirrOrange 
                    }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        fontWeight: 'bold', 
                        color: theme.palette.mode === 'dark' ? themeConstants.darkTheme.mbirrOrange : themeConstants.mbirrOrange 
                      }}>
                        <PhoneIcon sx={{ mr: 1 }} />
                        🇪🇹 M-birr Mobile Payment
                      </Typography>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Pay securely using your M-birr mobile wallet. You'll receive SMS instructions to complete the payment.
                      </Alert>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Ethiopian Mobile Number"
                            value={ethiopianPhoneNumber}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 10) {
                                if (value.length >= 2) {
                                  setEthiopianPhoneNumber(`09${value.substring(2, 3)} ${value.substring(3, 5)} ${value.substring(5, 7)} ${value.substring(7, 9)}`);
                                } else if (value.length >= 1) {
                                  setEthiopianPhoneNumber(`09${value.substring(1)}`);
                                } else {
                                  setEthiopianPhoneNumber('09');
                                }
                              }
                            }}
                            fullWidth
                            required
                            placeholder="09 12 34 56 78"
                            helperText="Enter your Ethiopian mobile number"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PhoneIcon sx={{ 
                                    color: theme.palette.mode === 'dark' ? themeConstants.darkTheme.mbirrOrange : themeConstants.mbirrOrange 
                                  }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ 
                            p: 2, 
                            bgcolor: theme.palette.mode === 'dark' ? themeConstants.darkTheme.mbirrOrange : themeConstants.mbirrOrange, 
                            color: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.87)' : 'white', 
                            borderRadius: 1 
                          }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                              M-birr Information
                            </Typography>
                            <Typography variant="caption" display="block">
                              • USSD Code: *847#
                            </Typography>
                            <Typography variant="caption" display="block">
                              • Limits: 10 - 100,000 ETB
                            </Typography>
                            <Typography variant="caption" display="block">
                              • Amount: ETB {totalAmount?.toFixed(0)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Alert severity="warning">
                            <Typography variant="body2">
                              <strong>Payment Instructions:</strong><br />
                              1. You'll receive an SMS with payment instructions<br />
                              2. Open your M-birr app or dial *847#<br />
                              3. Follow the prompts to complete payment<br />
                              4. Your booking will be confirmed automatically
                            </Typography>
                          </Alert>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </>
              )}

              {/* Ethiopian Mobile Payment (Telebirr) */}
              {paymentMethod === 'telebirr' && (
                <>
                  <Grid item xs={12}>
                    <Paper sx={{ 
                      p: 2, 
                      bgcolor: theme.palette.mode === 'dark' 
                        ? `${themeConstants.darkTheme.telebirrGreen}15` 
                        : `${themeConstants.telebirrGreen}20`, 
                      border: 2, 
                      borderColor: theme.palette.mode === 'dark' ? themeConstants.darkTheme.telebirrGreen : themeConstants.telebirrGreen 
                    }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        fontWeight: 'bold', 
                        color: theme.palette.mode === 'dark' ? themeConstants.darkTheme.telebirrGreen : themeConstants.telebirrGreen 
                      }}>
                        <PhoneIcon sx={{ mr: 1 }} />
                        🇪🇹 Telebirr Mobile Payment
                      </Typography>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Pay securely using your Telebirr mobile wallet. You'll receive SMS instructions to complete the payment.
                      </Alert>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Ethiopian Mobile Number"
                            value={ethiopianPhoneNumber}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 10) {
                                if (value.length >= 2) {
                                  setEthiopianPhoneNumber(`09${value.substring(2, 3)} ${value.substring(3, 5)} ${value.substring(5, 7)} ${value.substring(7, 9)}`);
                                } else if (value.length >= 1) {
                                  setEthiopianPhoneNumber(`09${value.substring(1)}`);
                                } else {
                                  setEthiopianPhoneNumber('09');
                                }
                              }
                            }}
                            fullWidth
                            required
                            placeholder="09 12 34 56 78"
                            helperText="Enter your Ethiopian mobile number"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PhoneIcon sx={{ 
                                    color: theme.palette.mode === 'dark' ? themeConstants.darkTheme.telebirrGreen : themeConstants.telebirrGreen 
                                  }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ 
                            p: 2, 
                            bgcolor: theme.palette.mode === 'dark' ? themeConstants.darkTheme.telebirrGreen : themeConstants.telebirrGreen, 
                            color: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.87)' : 'white', 
                            borderRadius: 1 
                          }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                              Telebirr Information
                            </Typography>
                            <Typography variant="caption" display="block">
                              • USSD Code: *127#
                            </Typography>
                            <Typography variant="caption" display="block">
                              • Limits: 5 - 50,000 ETB
                            </Typography>
                            <Typography variant="caption" display="block">
                              • Amount: ETB {totalAmount?.toFixed(0)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Alert severity="warning">
                            <Typography variant="body2">
                              <strong>Payment Instructions:</strong><br />
                              1. You'll receive an SMS with payment instructions<br />
                              2. Open your Telebirr app or dial *127#<br />
                              3. Follow the prompts to complete payment<br />
                              4. Your booking will be confirmed automatically
                            </Typography>
                          </Alert>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </>
              )}
            </Grid>
          </Card>

          {/* Actions */}
          <Box 
            sx={{ 
              mt: isMobile ? 3 : 4, 
              display: 'flex', 
              justifyContent: isMobile ? 'stretch' : 'flex-end',
              gap: isMobile ? 2 : 0,
            }}
          >
            {isMobile && (
              <Button
                variant="outlined"
                onClick={handleBackToResults}
                size="large"
                sx={{ 
                  flex: '0 0 auto',
                  minWidth: 120,
                  minHeight: 56,
                }}
              >
                Back
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              size="large"
              sx={{ 
                minWidth: isMobile ? 'auto' : 150,
                flex: isMobile ? 1 : '0 0 auto',
                minHeight: 56,
                fontWeight: 'bold',
                fontSize: isMobile ? '1rem' : '0.875rem',
              }}
              startIcon={loading ? <CircularProgress size={16} /> : undefined}
            >
              {loading 
                ? 'Booking...' 
                : isMobile 
                  ? `Book - ETB ${totalAmount?.toFixed(0)}`
                  : `Book Now - ETB ${totalAmount?.toFixed(0)}`
              }
            </Button>
          </Box>
        </form>
      </Container>
    </LocalizationProvider>
  );
};

export default BookingPage;
