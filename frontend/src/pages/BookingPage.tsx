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
  Breadcrumbs,
  Link,
  IconButton,
  Card,
  CardContent,
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
import NumberStepper from '../components/common/NumberStepper';

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
  const [creditCardNumber, setCreditCardNumber] = useState('4111 1111 1111 1111');
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

  const handleGuestsChange = React.useCallback((newValue: number) => {
    setGuests(newValue);
  }, []);

  const handlePaymentMethodChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newMethod = e.target.value as 'credit_card' | 'mobile_money' | 'pay_at_frontdesk' | 'mbirr' | 'telebirr';
    setPaymentMethod(newMethod);
    
    // Pre-fill with test data for the selected payment method
    if (newMethod === 'credit_card') {
      setCreditCardNumber('4111 1111 1111 1111');
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
      const cardNumberOnly = creditCardNumber.replace(/[\s-]/g, '');
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
            cardNumber: creditCardNumber.replace(/[\s-]/g, ''), // Send clean card number (digits only)
            expiryDate: expiryDate,
            cvv: cvv,
            cardHolderName: cardholderName,
            phoneNumber: mobileNumber || ethiopianPhoneNumber,
            provider: paymentMethod === 'mbirr' ? 'M-Birr' : 
                     paymentMethod === 'telebirr' ? 'TeleBirr' : 'Mobile Money',
            description: `Hotel booking for ${nights} nights`,
          },
        };

        // Process payment through mock gateway
        paymentResult = await mockPayment.processPayment(mockPaymentRequest);
        
        // Check if payment failed
        if (!paymentResult.success) {
          setError(paymentResult.message || 'Payment processing failed');
          return;
        }
      }

      // Determine if this is a specific room booking or room type booking
      const hasSpecificRoom = roomData.id !== undefined && roomData.id !== null;
      
      const bookingRequest = {
        hotelId: bookingData.hotelId,
        checkInDate: checkInDate.format('YYYY-MM-DD'),
        checkOutDate: checkOutDate.format('YYYY-MM-DD'),
        guests: guests,
        specialRequests: specialRequests.trim() || undefined,
        paymentMethodId: paymentMethod === 'pay_at_frontdesk' ? 'pay_at_frontdesk' : 'mock_payment_processed',
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
        // Add room-specific fields based on booking type
        ...(hasSpecificRoom 
          ? { roomId: roomData.id } // For specific room bookings
          : { roomType: roomData.roomType || roomType?.roomType } // For room type bookings
        ),
      };
      
      // Debug logging
      console.log('Room data:', roomData);
      console.log('Has specific room:', hasSpecificRoom);
      console.log('Booking request:', bookingRequest);
      console.log('Expected endpoint:', hasSpecificRoom ? '/bookings' : '/bookings/room-type');
      
      const result = await hotelApiService.createBooking(bookingRequest);
      
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
        {/* Enhanced Header Section */}
        <Card 
          elevation={2}
          sx={{ 
            mb: isMobile ? 3 : 4,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`,
            border: `1px solid ${theme.palette.primary.main}20`,
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: isMobile ? 2.5 : 4 }}>
            {/* Back Navigation */}
            <Box sx={{ mb: isMobile ? 2 : 3 }}>
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                mb: isMobile ? 1.5 : 2,
              }}>
                <IconButton 
                  onClick={handleBackToResults}
                  sx={{ 
                    mr: 2,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      borderColor: 'primary.main',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                  aria-label="back to search results"
                >
                  <ArrowBackIcon />
                </IconButton>
                
                {!isMobile && (
                  <Breadcrumbs 
                    aria-label="breadcrumb"
                    sx={{
                      '& .MuiBreadcrumbs-separator': {
                        color: 'primary.main',
                        fontWeight: 'bold',
                      },
                    }}
                  >
                    <Link 
                      component="button" 
                      variant="body2" 
                      onClick={() => navigate('/')}
                      sx={{ 
                        textDecoration: 'none',
                        color: 'primary.main',
                        fontWeight: 'medium',
                        '&:hover': {
                          color: 'primary.dark',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Hotel Search
                    </Link>
                    <Link 
                      component="button" 
                      variant="body2" 
                      onClick={handleBackToResults}
                      sx={{ 
                        textDecoration: 'none',
                        color: 'primary.main',
                        fontWeight: 'medium',
                        '&:hover': {
                          color: 'primary.dark',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Search Results
                    </Link>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.primary',
                        fontWeight: 'bold',
                      }}
                    >
                      Book Your Stay
                    </Typography>
                  </Breadcrumbs>
                )}
                
                {/* Mobile navigation hint */}
                {isMobile && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      fontWeight: 'medium',
                    }}
                  >
                    ← Back to search results
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Main Header Content */}
            <Box sx={{ 
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              justifyContent: 'space-between',
              gap: isMobile ? 2 : 3,
            }}>
              <Box sx={{ flex: 1 }}>
                {/* Page Title */}
                <Box sx={{ mb: 1 }}>
                  {hotelName && (
                    <Typography 
                      variant={isMobile ? 'h6' : 'h5'} 
                      sx={{ 
                        color: 'text.primary',
                        fontWeight: 'medium',
                      }}
                    >
                      {hotelName}
                    </Typography>
                  )}
                </Box>
              </Box>
              
              {/* Guest Booking Status */}
              {isGuestBookingFlow && (
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMobile ? 'flex-start' : 'flex-end',
                  gap: 1,
                }}>
                  <Chip 
                    label="Guest Booking" 
                    sx={{ 
                      bgcolor: 'info.main',
                      color: 'info.contrastText',
                      fontWeight: 'bold',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      height: isMobile ? 32 : 36,
                      px: 1,
                      '& .MuiChip-label': {
                        px: 2,
                      },
                    }}
                  />
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      fontWeight: 'medium',
                      textAlign: isMobile ? 'left' : 'right',
                    }}
                  >
                    No account required!
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Enhanced Room Details Card */}
        <Card 
          elevation={0} 
          sx={{ 
            mb: isMobile ? 3 : 4,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            boxShadow: theme.shadows[2],
          }}
        >
          <CardContent sx={{ p: isMobile ? 2.5 : 3.5 }}>
            {/* Room Details Header */}
            <Box sx={{ 
              mb: 3,
            }}>
              <Typography 
                variant={isMobile ? 'h6' : 'h5'} 
                sx={{ 
                  fontWeight: 700,
                  color: 'text.primary',
                  mb: 0.5,
                }}
              >
                Room Details
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Your selected accommodation
              </Typography>
            </Box>
            
            {/* Room Information Grid */}
            <Grid container spacing={isMobile ? 2 : 3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ 
                  p: 2.5,
                  backgroundColor: theme.palette.background.default,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  height: '100%',
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    ROOM TYPE
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5, mb: 2, color: theme.palette.success.main }}>
                    {roomData.roomType}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mr: 1 }}>
                      👥
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Up to {roomData.capacity} guests
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ 
                  p: 2.5,
                  backgroundColor: theme.palette.background.default,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  height: '100%',
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    PRICING
                  </Typography>
                  
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mr: 1 }}>
                        💰
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        ETB {roomData.pricePerNight?.toFixed(0)} per night
                      </Typography>
                    </Box>
                    
                    {nights > 0 && (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mr: 1 }}>
                            📅
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {nights} night{nights !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                        
                        <Divider sx={{ my: 1.5, borderColor: theme.palette.divider }} />
                        
                        <Box sx={{ 
                          p: 1.5,
                          backgroundColor: theme.palette.success.light,
                          border: `1px solid ${theme.palette.success.main}`,
                          borderRadius: 2,
                          textAlign: 'center',
                        }}>
                          <Typography 
                            variant={isMobile ? 'h6' : 'h5'} 
                            sx={{ 
                              fontWeight: 700,
                              color: theme.palette.success.dark,
                            }}
                          >
                            Total: ETB {totalAmount?.toFixed(0)}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

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
                  backgroundColor: theme.palette.action.disabledBackground,
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
                <NumberStepper
                  value={guests}
                  onChange={handleGuestsChange}
                  min={1}
                  max={roomData.capacity || 10}
                  label="Number of Guests"
                  fullWidth
                />
              </Grid>

              {/* Guest Information Section */}
              <Grid item xs={12}>
                <Box sx={{ 
                  my: isMobile ? 2 : 3,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: 1,
                    bgcolor: theme.palette.divider,
                    transform: 'translateY(-50%)',
                  }
                }}>
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    bgcolor: theme.palette.background.paper,
                    px: 2,
                    mx: 'auto',
                    width: 'fit-content',
                  }}>
                    <Typography 
                      variant={isMobile ? 'h6' : 'h5'} 
                      component="h2"
                      sx={{ 
                        fontWeight: 700,
                        color: 'text.primary',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      Guest Information
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {isAuthenticated && !isGuestBookingFlow ? (
                // Display authenticated user information with enhanced styling
                <Grid item xs={12}>
                  <Card 
                    sx={{ 
                      background: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: theme.shadows[2],
                    }}
                  >
                    <CardContent sx={{ p: isMobile ? 2.5 : 3.5 }}>
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                      }}>
                        <Box sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          bgcolor: theme.palette.success.main,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                        }}>
                          <Typography variant="h6" sx={{ color: theme.palette.success.contrastText, fontWeight: 700 }}>
                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                            mb: 0.5,
                          }}>
                            Registered Guest
                          </Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                            Using your account information
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ 
                            p: 2,
                            bgcolor: theme.palette.action.hover,
                            borderRadius: 2,
                            border: `1px solid ${theme.palette.divider}`,
                          }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>
                              FULL NAME
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5, color: theme.palette.text.primary }}>
                              {user?.firstName || 'N/A'} {user?.lastName || 'N/A'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ 
                            p: 2,
                            bgcolor: theme.palette.action.hover,
                            borderRadius: 2,
                            border: `1px solid ${theme.palette.divider}`,
                          }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>
                              EMAIL ADDRESS
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5, color: theme.palette.text.primary }}>
                              {user?.email}
                            </Typography>
                          </Box>
                        </Grid>
                        {user?.phone && (
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ 
                              p: 2,
                              bgcolor: theme.palette.action.hover,
                              borderRadius: 2,
                              border: `1px solid ${theme.palette.divider}`,
                            }}>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>
                                PHONE NUMBER
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5, color: theme.palette.text.primary }}>
                                {user.phone}
                              </Typography>
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ) : (
                // Enhanced guest input fields with professional styling
                <Grid item xs={12}>
                  <Card 
                    sx={{ 
                      background: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: theme.shadows[2],
                    }}
                  >
                    <CardContent sx={{ p: isMobile ? 2.5 : 3.5 }}>
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        mb: 3,
                      }}>
                        <Box sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          bgcolor: theme.palette.success.main,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                        }}>
                          <Typography variant="h6" sx={{ color: theme.palette.background.paper, fontWeight: 700 }}>
                            G
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                            mb: 0.5,
                          }}>
                            Guest Details
                          </Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                            Please provide your information for the booking
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Grid container spacing={isMobile ? 2.5 : 3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Full Name"
                            value={guestName}
                            onChange={handleGuestNameChange}
                            fullWidth
                            required
                            variant="outlined"
                            placeholder="Enter your full name"
                            sx={{
                              '& .MuiInputBase-root': {
                                minHeight: isMobile ? 56 : 'auto',
                                bgcolor: theme.palette.background.paper,
                                borderRadius: 2,
                              },
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: theme.palette.success.main,
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: theme.palette.success.main,
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: theme.palette.success.main,
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
                            variant="outlined"
                            placeholder="Enter your email address"
                            sx={{
                              '& .MuiInputBase-root': {
                                minHeight: isMobile ? 56 : 'auto',
                                bgcolor: theme.palette.background.paper,
                                borderRadius: 2,
                              },
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: theme.palette.success.main,
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: theme.palette.success.main,
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: theme.palette.success.main,
                              },
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Phone Number"
                            value={guestPhone}
                            onChange={handleGuestPhoneChange}
                            fullWidth
                            variant="outlined"
                            placeholder="Enter your phone number (optional)"
                            sx={{
                              '& .MuiInputBase-root': {
                                minHeight: isMobile ? 56 : 'auto',
                                bgcolor: theme.palette.background.paper,
                                borderRadius: 2,
                              },
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: theme.palette.success.main,
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: theme.palette.success.main,
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: theme.palette.success.main,
                              },
                            }}
                          />
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ 
                        mt: 2,
                        p: 2,
                        bgcolor: theme.palette.mode === 'dark' 
                          ? 'rgba(76, 175, 80, 0.15)' 
                          : 'rgba(76, 175, 80, 0.08)',
                        color: theme.palette.success.main,
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.success.main}20`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}>
                        <Typography variant="body2" sx={{ fontSize: '1.2em' }}>
                          🔒
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                          Your information is secure and will only be used for this booking
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Special Requests Section */}
              <Grid item xs={12}>
                <Card 
                  sx={{ 
                    background: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    boxShadow: theme.shadows[2],
                  }}
                >
                  <CardContent sx={{ p: isMobile ? 2.5 : 3 }}>
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                    }}>
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: theme.palette.success.main,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                      }}>
                        <Typography variant="body1" sx={{ color: theme.palette.background.paper, fontWeight: 700 }}>
                          R
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700,
                          color: theme.palette.success.main,
                          mb: 0.5,
                        }}>
                          Special Requests
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.success.main, fontWeight: 500 }}>
                          Let us know if you have any special preferences
                        </Typography>
                      </Box>
                    </Box>
                    
                    <TextField
                      label="Special Requests (Optional)"
                      value={specialRequests}
                      onChange={handleSpecialRequestsChange}
                      multiline
                      rows={isMobile ? 3 : 4}
                      fullWidth
                      variant="outlined"
                      placeholder="e.g., Late check-in, room preferences, dietary requirements, accessibility needs..."
                      sx={{
                        '& .MuiInputBase-root': {
                          minHeight: isMobile ? 88 : 'auto',
                          bgcolor: theme.palette.background.paper,
                          borderRadius: 2,
                        },
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: theme.palette.success.main,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.success.main,
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: theme.palette.success.main,
                        },
                      }}
                    />
                    
                    <Box sx={{ 
                      mt: 2,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1,
                    }}>
                      {['Early check-in', 'Late check-out', 'Airport pickup', 'High floor', 'Quiet room'].map((suggestion) => (
                        <Chip
                          key={suggestion}
                          label={suggestion}
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            if (!specialRequests.includes(suggestion)) {
                              setSpecialRequests(prev => 
                                prev ? `${prev}, ${suggestion}` : suggestion
                              );
                            }
                          }}
                          sx={{
                            cursor: 'pointer',
                            borderColor: theme.palette.success.main,
                            color: theme.palette.success.main,
                            '&:hover': {
                              bgcolor: theme.palette.success.main,
                              color: theme.palette.background.paper,
                              borderColor: theme.palette.success.main,
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Payment Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: isMobile ? 1 : 2, bgcolor: theme.palette.background.paper }} />
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: isMobile ? 1 : 2,
                    flexWrap: 'wrap',
                  }}
                >
                  <LockIcon sx={{ mr: 1, color: theme.palette.success.main }} />
                  <Typography 
                    variant={isMobile ? 'subtitle1' : 'h6'} 
                    component="div"
                    sx={{ fontWeight: 700, color: theme.palette.text.primary }}
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
                      fontWeight: 700, 
                      color: theme.palette.success.main,
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
                          <CreditCardIcon sx={{ mr: 1, color: theme.palette.success.main }} />
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
                          <PhoneIcon sx={{ mr: 1, color: theme.palette.success.main }} />
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
                          <HotelIcon sx={{ mr: 1, color: theme.palette.success.main }} />
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
                            color: theme.palette.success.main
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
                            color: theme.palette.success.main
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
                    <Card 
                      sx={{ 
                        border: `2px solid ${theme.palette.success.main}`,
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: 2,
                        minHeight: 520, // Consistent height to accommodate all payment methods
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: theme.shadows[2],
                      }}
                    >
                      <CardContent sx={{ 
                        py: 3,
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                          <CreditCardIcon sx={{ 
                            fontSize: 40, 
                            color: theme.palette.success.main,
                            mb: 1 
                          }} />
                          <Typography variant="h6" sx={{ 
                            color: theme.palette.text.primary,
                            fontWeight: 700,
                            mb: 0.5
                          }}>
                            Credit/Debit Card Payment
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: theme.palette.text.secondary,
                            mb: 1,
                            fontWeight: 500
                          }}>
                            Secure card payment processing
                          </Typography>
                          <Typography variant="h6" sx={{ 
                            color: theme.palette.success.main,
                            fontWeight: 700
                          }}>
                            Amount: ETB {totalAmount?.toFixed(0)}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ flexGrow: 1 }}>
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
                                bgcolor: theme.palette.background.paper,
                                borderRadius: 2,
                              },
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: theme.palette.success.main,
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: theme.palette.success.main,
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: theme.palette.success.main,
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
                                bgcolor: theme.palette.background.paper,
                                borderRadius: 2,
                              },
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: theme.palette.success.main,
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: theme.palette.success.main,
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: theme.palette.success.main,
                              },
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CreditCardIcon sx={{ color: theme.palette.success.main }} />
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
                                bgcolor: theme.palette.background.paper,
                                borderRadius: 2,
                              },
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: theme.palette.success.main,
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: theme.palette.success.main,
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: theme.palette.success.main,
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
                                bgcolor: theme.palette.background.paper,
                                borderRadius: 2,
                              },
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: theme.palette.success.main,
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: theme.palette.success.main,
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: theme.palette.success.main,
                              },
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Alert 
                            severity="info"
                            sx={{
                              bgcolor: theme.palette.info.light,
                              color: theme.palette.info.dark,
                              '& .MuiAlert-icon': {
                                color: theme.palette.info.main
                              }
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              <strong>Payment Information:</strong><br />
                              1. Enter your card details in the form above<br />
                              2. All transactions are processed securely<br />
                              3. You will receive confirmation immediately<br />
                              4. Your booking will be confirmed automatically
                            </Typography>
                          </Alert>
                        </Grid>
                          </Grid>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              )}

              {/* Mobile Money Form */}
              {paymentMethod === 'mobile_money' && (
                <>
                  <Grid item xs={12}>
                    <Card sx={{ 
                      border: `2px solid ${theme.palette.success.main}`,
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: 2,
                      minHeight: 520, // Consistent height to accommodate all payment methods
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: theme.shadows[2],
                    }}>
                      <CardContent sx={{ 
                        py: 3,
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                          <PhoneIcon sx={{ 
                            fontSize: 40, 
                            color: theme.palette.success.main,
                            mb: 1 
                          }} />
                          <Typography variant="h6" sx={{ 
                            color: theme.palette.text.primary,
                            fontWeight: 700,
                            mb: 0.5
                          }}>
                            Mobile Money Transfer
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: theme.palette.text.secondary,
                            mb: 1,
                            fontWeight: 500
                          }}>
                            Complete mobile money transfer and provide details
                          </Typography>
                          <Typography variant="h6" sx={{ 
                            color: theme.palette.success.main,
                            fontWeight: 700
                          }}>
                            Amount: ETB {totalAmount?.toFixed(0)}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ flexGrow: 1 }}>
                          <Alert 
                            severity="info" 
                            sx={{ 
                              mb: 2,
                              bgcolor: theme.palette.info.light,
                              color: theme.palette.info.dark,
                              '& .MuiAlert-icon': {
                                color: theme.palette.info.main
                              }
                            }}
                          >
                            Please complete the mobile money transfer to our account and provide the details below.
                          </Alert>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                label="Mobile Number"
                                value={mobileNumber}
                                onChange={handleMobileNumberChange}
                                fullWidth
                                required
                                placeholder="+1234567890"
                                sx={{
                                  '& .MuiInputBase-root': {
                                    bgcolor: theme.palette.background.paper,
                                    borderRadius: 2,
                                  },
                                  '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                      borderColor: theme.palette.success.main,
                                    },
                                    '&.Mui-focused fieldset': {
                                      borderColor: theme.palette.success.main,
                                    },
                                  },
                                  '& .MuiInputLabel-root.Mui-focused': {
                                    color: theme.palette.success.main,
                                  },
                                }}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <PhoneIcon sx={{ color: theme.palette.success.main }} />
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
                                sx={{
                                  '& .MuiInputBase-root': {
                                    bgcolor: theme.palette.background.paper,
                                    borderRadius: 2,
                                  },
                                  '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                      borderColor: theme.palette.success.main,
                                    },
                                    '&.Mui-focused fieldset': {
                                      borderColor: theme.palette.success.main,
                                    },
                                  },
                                  '& .MuiInputLabel-root.Mui-focused': {
                                    color: theme.palette.success.main,
                                  },
                                }}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <Alert 
                                severity="warning"
                                sx={{
                                  bgcolor: theme.palette.warning.light,
                                  color: theme.palette.warning.dark,
                                  '& .MuiAlert-icon': {
                                    color: theme.palette.warning.main
                                  }
                                }}
                              >
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  <strong>Transfer Instructions:</strong><br />
                                  1. Transfer the exact amount to our mobile money account<br />
                                  2. Enter your phone number and receipt/transaction ID above<br />
                                  3. We will verify the payment within 1-2 hours<br />
                                  4. Your booking will be confirmed after verification
                                </Typography>
                              </Alert>
                            </Grid>
                          </Grid>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              )}

              {/* Pay at Front Desk Information */}
              {paymentMethod === 'pay_at_frontdesk' && (
                <>
                  <Grid item xs={12}>
                    <Card sx={{ 
                      border: `2px solid ${theme.palette.success.main}`,
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: 2,
                      minHeight: 520, // Consistent height to accommodate all payment methods
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: theme.shadows[2],
                    }}>
                      <CardContent sx={{ 
                        py: 3,
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                          <HotelIcon sx={{ 
                            fontSize: 40, 
                            color: theme.palette.success.main,
                            mb: 1 
                          }} />
                          <Typography variant="h6" sx={{ 
                            color: theme.palette.text.primary,
                            fontWeight: 700,
                            mb: 0.5
                          }}>
                            Pay at Front Desk
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: theme.palette.text.secondary,
                            mb: 1,
                            fontWeight: 500
                          }}>
                            Pay when you arrive at the hotel
                          </Typography>
                          <Typography variant="h6" sx={{ 
                            color: theme.palette.success.main,
                            fontWeight: 700
                          }}>
                            Amount: ETB {totalAmount?.toFixed(0)}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ flexGrow: 1 }}>
                          <Alert 
                            severity="info" 
                            sx={{ 
                              mb: 2,
                              bgcolor: theme.palette.info.light,
                              color: theme.palette.info.dark,
                              '& .MuiAlert-icon': {
                                color: theme.palette.info.main
                              }
                            }}
                          >
                            Your reservation will be confirmed and you can pay when you arrive at the hotel.
                          </Alert>
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <Alert 
                                severity="warning"
                                sx={{
                                  bgcolor: theme.palette.warning.light,
                                  color: theme.palette.warning.dark,
                                  '& .MuiAlert-icon': {
                                    color: theme.palette.warning.main
                                  }
                                }}
                              >
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  <strong>Check-in Instructions:</strong><br />
                                  1. Arrive at the hotel front desk during check-in hours<br />
                                  2. Present your booking confirmation and valid ID<br />
                                  3. Pay the full amount using your preferred method<br />
                                  4. Complete check-in and receive your room keys
                                </Typography>
                              </Alert>
                            </Grid>
                          </Grid>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              )}

              {/* Ethiopian Mobile Payment (M-birr) */}
              {paymentMethod === 'mbirr' && (
                <>
                  <Grid item xs={12}>
                    <Card sx={{ 
                      border: `2px solid ${theme.palette.success.main}`,
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: 2,
                      minHeight: 520, // Consistent height to accommodate all payment methods
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: theme.shadows[2],
                    }}>
                      <CardContent sx={{ 
                        py: 3,
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                          <PhoneIcon sx={{ 
                            fontSize: 40, 
                            color: theme.palette.success.main,
                            mb: 1 
                          }} />
                          <Typography variant="h6" sx={{ 
                            color: theme.palette.text.primary,
                            fontWeight: 700,
                            mb: 0.5
                          }}>
                            🇪🇹 M-birr Mobile Payment
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: theme.palette.text.secondary,
                            mb: 1,
                            fontWeight: 500
                          }}>
                            Pay securely using your M-birr mobile wallet
                          </Typography>
                          <Typography variant="h6" sx={{ 
                            color: theme.palette.success.main,
                            fontWeight: 700
                          }}>
                            Amount: ETB {totalAmount?.toFixed(0)}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ flexGrow: 1 }}>
                      <Alert 
                        severity="info" 
                        sx={{ 
                          mb: 2,
                          bgcolor: theme.palette.info.light,
                          color: theme.palette.info.dark,
                          '& .MuiAlert-icon': {
                            color: theme.palette.info.main
                          }
                        }}
                      >
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
                            sx={{
                              '& .MuiInputBase-root': {
                                bgcolor: theme.palette.background.paper,
                                borderRadius: 2,
                              },
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: theme.palette.success.main,
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: theme.palette.success.main,
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: theme.palette.success.main,
                              },
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PhoneIcon sx={{ 
                                    color: theme.palette.success.main
                                  }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                            <Grid item xs={12}>
                              <Alert 
                                severity="warning"
                                sx={{
                                  bgcolor: theme.palette.warning.light,
                                  color: theme.palette.warning.dark,
                                  '& .MuiAlert-icon': {
                                    color: theme.palette.warning.main
                                  }
                                }}
                              >
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  <strong>Payment Instructions:</strong><br />
                                  1. You'll receive an SMS with payment instructions<br />
                                  2. Open your M-birr app or dial *847#<br />
                                  3. Follow the prompts to complete payment<br />
                                  4. Your booking will be confirmed automatically
                                </Typography>
                              </Alert>
                            </Grid>
                          </Grid>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              )}

              {/* Ethiopian Mobile Payment (Telebirr) */}
              {paymentMethod === 'telebirr' && (
                <>
                  <Grid item xs={12}>
                    <Card sx={{ 
                      border: `2px solid ${theme.palette.success.main}`,
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: 2,
                      minHeight: 520, // Consistent height to accommodate all payment methods
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: theme.shadows[2],
                    }}>
                      <CardContent sx={{ 
                        py: 3,
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                          <PhoneIcon sx={{ 
                            fontSize: 40, 
                            color: theme.palette.success.main,
                            mb: 1 
                          }} />
                          <Typography variant="h6" sx={{ 
                            color: theme.palette.text.primary,
                            fontWeight: 700,
                            mb: 0.5
                          }}>
                            🇪🇹 Telebirr Mobile Payment
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: theme.palette.text.secondary,
                            mb: 1,
                            fontWeight: 500
                          }}>
                            Pay securely using your Telebirr mobile wallet
                          </Typography>
                          <Typography variant="h6" sx={{ 
                            color: theme.palette.success.main,
                            fontWeight: 700
                          }}>
                            Amount: ETB {totalAmount?.toFixed(0)}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ flexGrow: 1 }}>
                          <Alert 
                            severity="info" 
                            sx={{ 
                              mb: 2,
                              bgcolor: theme.palette.info.light,
                              color: theme.palette.info.dark,
                              '& .MuiAlert-icon': {
                                color: theme.palette.info.main
                              }
                            }}
                          >
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
                            sx={{
                              '& .MuiInputBase-root': {
                                bgcolor: theme.palette.background.paper,
                                borderRadius: 2,
                              },
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: theme.palette.success.main,
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: theme.palette.success.main,
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: theme.palette.success.main,
                              },
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PhoneIcon sx={{ 
                                    color: theme.palette.success.main
                                  }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ 
                            p: 2, 
                            bgcolor: theme.palette.background.default, 
                            color: theme.palette.text.primary, 
                            borderRadius: 2,
                            border: `1px solid ${theme.palette.divider}`
                          }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: theme.palette.success.main }}>
                              Telebirr Information
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ fontWeight: 500 }}>
                              • USSD Code: *127#
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ fontWeight: 500 }}>
                              • Limits: 5 - 50,000 ETB
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ fontWeight: 500 }}>
                              • Amount: ETB {totalAmount?.toFixed(0)}
                            </Typography>
                          </Box>
                            </Grid>
                            <Grid item xs={12}>
                              <Alert 
                                severity="warning"
                                sx={{
                                  bgcolor: theme.palette.warning.light,
                                  color: theme.palette.warning.dark,
                                  '& .MuiAlert-icon': {
                                    color: theme.palette.warning.main
                                  }
                                }}
                              >
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  <strong>Payment Instructions:</strong><br />
                                  1. You'll receive an SMS with payment instructions<br />
                                  2. Open your Telebirr app or dial *127#<br />
                                  3. Follow the prompts to complete payment<br />
                                  4. Your booking will be confirmed automatically
                                </Typography>
                              </Alert>
                            </Grid>
                          </Grid>
                        </Box>
                      </CardContent>
                    </Card>
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
