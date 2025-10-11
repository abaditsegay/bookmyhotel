import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  Alert,
  Breadcrumbs,
  Link,
  IconButton,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CreditCard as CreditCardIcon,
  PhoneAndroid as PhoneIcon,
  Lock as LockIcon,
  Hotel as HotelIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useAuthenticatedApi } from '../hooks/useAuthenticatedApi';
import { AvailableRoom, HotelSearchRequest } from '../types/hotel';
import { useMockPayment, MockPaymentRequest } from '../services/mockPaymentGateway';
import { formatCurrency } from '../utils/currencyUtils';
import { PaymentMethod } from '../types/shop';
import NumberStepper from '../components/common/NumberStepper';
import BookingSummary from '../components/booking/BookingSummary';
import { COLORS } from '../theme/themeColors';

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
  const { t } = useTranslation();
  
  // Mobile responsiveness
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');
  const [specialRequests, setSpecialRequests] = useState('');
  
  // Payment state
  const mockPayment = useMockPayment();
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'mobile_money' | 'pay_at_frontdesk' | 'mbirr' | 'telebirr'>('mobile_money');
  const [creditCardNumber, setCreditCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  
  // Ethiopian payment state
  const [ethiopianPhoneNumber, setEthiopianPhoneNumber] = useState('');
  
  // Mobile transfer reference number
  const [mobileTransferReference, setMobileTransferReference] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hotelData, setHotelData] = useState<any>(null);

  // Memoized change handlers to prevent input focus loss
  const handleFirstNameChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFirstName(e.target.value);
  }, []);

  const handleLastNameChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLastName(e.target.value);
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

  const handleMobileTransferReferenceChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMobileTransferReference(e.target.value);
  }, []);

  const handlePaymentMethodChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newMethod = e.target.value as 'credit_card' | 'mobile_money' | 'pay_at_frontdesk' | 'mbirr' | 'telebirr';
    setPaymentMethod(newMethod);
    
    // Clear payment fields when switching methods
    setCreditCardNumber('');
    setExpiryDate('');
    setCvv('');
    setCardholderName('');
    setMobileNumber('');
    setEthiopianPhoneNumber('');
    setMobileTransferReference('');
  }, []);

  // Update guest information when user data loads
  useEffect(() => {
    if (user && user.firstName && user.lastName) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setGuestEmail(user.email || '');
    }
  }, [user]);

  // Fetch hotel data for mobile payment phone numbers
  useEffect(() => {
    const fetchHotelData = async () => {
      if (bookingData?.hotelId) {
        try {
          // Use public hotel API to get hotel details
          const response = await fetch(`/api/public/hotels/${bookingData.hotelId}`);
          if (response.ok) {
            const hotel = await response.json();
            setHotelData(hotel);
          }
        } catch (error) {
          console.error('Error fetching hotel data:', error);
        }
      }
    };
    
    fetchHotelData();
  }, [bookingData?.hotelId]);

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
      setError(t('booking.page.fillAllRequiredFields'));
      return;
    }

    if (checkInDate >= checkOutDate) {
      setError(t('booking.page.checkOutAfterCheckIn'));
      return;
    }

    // Validate guest information for guest booking flow
    if (isGuestBookingFlow) {
      if (!firstName.trim() || !lastName.trim() || !guestEmail.trim()) {
        setError(t('booking.page.provideGuestNameAndEmail'));
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guestEmail)) {
        setError(t('booking.page.provideValidEmail'));
        return;
      }
    }

    // Payment validation
    if (paymentMethod === 'credit_card') {
      if (!creditCardNumber || !expiryDate || !cvv || !cardholderName) {
        setError(t('booking.page.fillCreditCardDetails'));
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
      if (!mobileNumber) {
        setError(t('booking.page.provideMobileNumber'));
        return;
      }
      if (!mobileTransferReference) {
        setError(t('booking.page.provideMobileReference'));
        return;
      }
      // Basic mobile number validation
      if (!/^\+?\d{10,15}$/.test(mobileNumber.replace(/\s/g, ''))) {
        setError(t('booking.page.enterValidMobileNumber'));
        return;
      }
    }

    if (paymentMethod === 'mbirr' || paymentMethod === 'telebirr') {
      if (!ethiopianPhoneNumber) {
        setError(t('booking.page.provideEthiopianMobile'));
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
            name: `${firstName.trim()} ${lastName.trim()}`.trim() || cardholderName || 'Guest',
            email: guestEmail.trim(),
            phone: guestPhone.trim() || mobileNumber || ethiopianPhoneNumber,
          },
          paymentDetails: {
            cardNumber: creditCardNumber.replace(/[\s-]/g, ''), // Send clean card number (digits only)
            expiryDate: expiryDate,
            cvv: cvv,
            cardHolderName: cardholderName,
            phoneNumber: mobileNumber || ethiopianPhoneNumber,
            transferReference: mobileTransferReference,
            provider: paymentMethod === 'mbirr' ? 'M-Birr' : 
                     paymentMethod === 'telebirr' ? 'TeleBirr' : 'Mobile Money',
            description: `Hotel booking for ${nights} nights`,
          },
        };

        // Process payment through mock gateway
        paymentResult = await mockPayment.processPayment(mockPaymentRequest);
        
        console.log('🔄 Payment processed:', {
          paymentMethod,
          userTransferReference: mobileTransferReference,
          paymentResult: paymentResult
        });
        
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
        guestName: `${firstName.trim()} ${lastName.trim()}`.trim() || undefined,
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
        maxWidth={false}
        sx={{ 
          py: isMobile ? 2 : 4,
          px: isMobile ? 2 : 6,
          maxWidth: '1400px',
          mx: 'auto',
        }}
      >
        {/* Compact Header Section */}
        <Box sx={{ 
          mb: isMobile ? 2 : 3,
          p: isMobile ? 1.5 : 2,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 1,
        }}>
          {/* Back Navigation */}
          <Box sx={{ mb: isMobile ? 1 : 1.5 }}>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              mb: isMobile ? 1 : 1.5,
            }}>
              <IconButton 
                onClick={handleBackToResults}
                sx={{ 
                  mr: 1.5,
                  p: 0.75,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
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
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {t('booking.page.hotelSearch')}
                  </Link>
                  <Link 
                    component="button" 
                    variant="body2" 
                    onClick={handleBackToResults}
                    sx={{ 
                      textDecoration: 'none',
                      color: 'primary.main',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {t('booking.page.searchResults')}
                  </Link>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.primary',
                      fontWeight: 600,
                    }}
                  >
                    {t('booking.page.bookYourStay')}
                  </Typography>
                </Breadcrumbs>
              )}
              
              {/* Mobile navigation hint */}
              {isMobile && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                  }}
                >
                  ← {t('booking.page.backToSearchResults').substring(2)}
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
            gap: isMobile ? 1 : 2,
          }}>
            <Box sx={{ flex: 1 }}>
              {/* Page Title */}
              <Box>
                {hotelName && (
                  <Typography 
                    variant={isMobile ? 'h6' : 'h5'} 
                    sx={{ 
                      color: 'text.primary',
                      fontWeight: 600,
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
                gap: 0.5,
              }}>
                <Chip 
                  label={t('booking.guestBooking')} 
                  size="medium"
                  sx={{ 
                    bgcolor: '#4caf50',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1rem',
                    height: '40px',
                    '& .MuiChip-label': {
                      fontSize: '1rem',
                      fontWeight: 700,
                    },
                  }}
                />
                
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary',
                    textAlign: isMobile ? 'left' : 'right',
                  }}
                >
                  {t('booking.page.noAccountRequired')}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Main Content - Room Details, Form and Summary */}
        <Grid container spacing={isMobile ? 3 : 6}>
          {/* Left Column - Room Details and Booking Form */}
          <Grid item xs={12} md={8} lg={8}>
            {/* Room Details Section */}
            <Grid container spacing={isMobile ? 1.5 : 2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <Card
                  sx={{
                    backgroundColor: alpha(COLORS.PRIMARY, 0.05),
                    border: `1px solid ${alpha(COLORS.PRIMARY, 0.2)}`,
                  }}
                >
              <CardContent>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                }}>
                  <HotelIcon sx={{ mr: 1, color: COLORS.PRIMARY }} />
                  <Typography 
                    variant={isMobile ? 'subtitle1' : 'h6'} 
                    sx={{ fontWeight: 600, color: COLORS.PRIMARY }}
                  >
                    {t('booking.page.roomDetails')}
                  </Typography>
                </Box>

                <Grid container spacing={isMobile ? 1.5 : 2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      p: isMobile ? 1.5 : 2,
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: 1,
                      border: `1px solid ${alpha(COLORS.PRIMARY, 0.1)}`,
                    }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {t('booking.page.roomType')}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, mt: 0.5, color: COLORS.PRIMARY }}>
                        {roomData.roomType}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      p: isMobile ? 1.5 : 2,
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: 1,
                      border: `1px solid ${alpha(COLORS.PRIMARY, 0.1)}`,
                    }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {t('booking.page.hotel')}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, mt: 0.5, color: COLORS.PRIMARY }}>
                        {hotelName || t('booking.page.hotelInformation')}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      p: isMobile ? 1.5 : 2,
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: 1,
                      border: `1px solid ${alpha(COLORS.PRIMARY, 0.1)}`,
                    }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {t('booking.page.pricePerNight')}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, mt: 0.5, color: COLORS.PRIMARY }}>
                        💰 {formatCurrency(roomData.pricePerNight || 0)}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      p: isMobile ? 1.5 : 2,
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: 1,
                      border: `1px solid ${alpha(COLORS.PRIMARY, 0.1)}`,
                    }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {t('booking.page.totalAmount')}
                      </Typography>
                      {nights > 0 ? (
                        <Box>
                          <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                            📅 {nights} {nights !== 1 ? t('booking.page.nightsPlural') : t('booking.page.nights')}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.PRIMARY }}>
                            {formatCurrency(totalAmount || 0)}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="h6" sx={{ fontWeight: 600, mt: 0.5, color: COLORS.PRIMARY }}>
                          {formatCurrency(roomData.pricePerNight || 0)}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

            {/* Booking Form */}
            <form onSubmit={handleSubmit}>
          <Box sx={{ 
            p: isMobile ? 1.5 : 2, 
            backgroundColor: theme.palette.background.paper,
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`,
          }}>

            <Grid container spacing={isMobile ? 1.5 : 2}>
              {/* Dates and Guests - stacked on mobile */}
              <Grid item xs={12} sm={4}>
                <DatePicker
                  label={t('booking.page.checkInDate')}
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
                  label={t('booking.page.checkOutDate')}
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
                  onChange={setGuests}
                  min={1}
                  max={roomData.capacity || 10}
                  label={t('booking.page.numberOfGuests')}
                  fullWidth
                />
              </Grid>

              {/* Guest Information Section */}
              <Grid item xs={12}>
                <Card
                  sx={{
                    backgroundColor: alpha(COLORS.PRIMARY, 0.05),
                    border: `1px solid ${alpha(COLORS.PRIMARY, 0.2)}`,
                  }}
                >
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                    }}>
                      <PersonIcon sx={{ mr: 1, color: COLORS.PRIMARY }} />
                      <Typography 
                        variant={isMobile ? 'subtitle1' : 'h6'} 
                        sx={{ fontWeight: 600, color: COLORS.PRIMARY }}
                      >
                        {t('booking.page.guestInformation')}
                      </Typography>
                    </Box>

                    {isAuthenticated && !isGuestBookingFlow ? (
                      // Display authenticated user information with enhanced styling
                      <Box sx={{ 
                        p: isMobile ? 1.5 : 2,
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: 1,
                        border: `1px solid ${alpha(COLORS.PRIMARY, 0.1)}`,
                        mb: 2,
                      }}>
                        <Box sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          mb: 1.5,
                        }}>
                          <Avatar sx={{
                            width: 40,
                            height: 40,
                            bgcolor: COLORS.PRIMARY,
                            mr: 1.5,
                          }}>
                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ 
                              fontWeight: 600,
                              color: theme.palette.text.primary,
                            }}>
                              {user?.firstName || 'N/A'} {user?.lastName || 'N/A'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                              {user?.email}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    ) : (
                      // Enhanced guest input fields with professional styling
                      <Box sx={{ 
                        p: isMobile ? 1.5 : 2,
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: 1,
                        border: `1px solid ${alpha(COLORS.PRIMARY, 0.1)}`,
                        mb: 2,
                      }}>
                        <Typography variant="body1" sx={{ 
                          fontWeight: 600,
                          color: COLORS.PRIMARY,
                          mb: 1.5,
                        }}>
                          {t('booking.page.guestDetails')}
                        </Typography>
                        
                        <Grid container spacing={isMobile ? 1.5 : 2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label={t('booking.page.firstName')}
                              value={firstName}
                              onChange={handleFirstNameChange}
                              fullWidth
                              required
                              size="small"
                              variant="outlined"
                              placeholder={t('booking.page.firstNamePlaceholder')}
                            />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <TextField
                              label={t('booking.page.lastName')}
                              value={lastName}
                              onChange={handleLastNameChange}
                              fullWidth
                              required
                              size="small"
                              variant="outlined"
                              placeholder={t('booking.page.lastNamePlaceholder')}
                            />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <TextField
                              label={t('booking.page.emailAddress')}
                              type="email"
                              value={guestEmail}
                              onChange={handleGuestEmailChange}
                              fullWidth
                              required
                              size="small"
                              variant="outlined"
                              placeholder={t('booking.page.emailPlaceholder')}
                            />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <TextField
                              label={t('booking.page.phoneNumber')}
                              value={guestPhone}
                              onChange={handleGuestPhoneChange}
                              fullWidth
                              size="small"
                              variant="outlined"
                              placeholder={t('booking.page.phonePlaceholder')}
                            />
                          </Grid>
                        </Grid>
                        
                        <Typography variant="caption" sx={{ 
                          mt: 1,
                          display: 'block',
                          color: 'text.secondary'
                        }}>
                          🔒 {t('booking.page.secureInformation').substring(2)}
                        </Typography>
                      </Box>
                    )}

                    {/* Special Requests Section */}
                    <Box sx={{ 
                      p: isMobile ? 1.5 : 2,
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: 1,
                      border: `1px solid ${alpha(COLORS.PRIMARY, 0.1)}`,
                    }}>
                      <Typography variant="body1" sx={{ 
                        fontWeight: 600,
                        color: COLORS.PRIMARY,
                        mb: 1,
                      }}>
                        Special Requests (Optional)
                      </Typography>
                      
                      <TextField
                        value={specialRequests}
                        onChange={handleSpecialRequestsChange}
                        multiline
                        rows={isMobile ? 2 : 3}
                        fullWidth
                        size="small"
                        variant="outlined"
                        placeholder="e.g., Late check-in, room preferences, dietary requirements..."
                      />
                      
                      <Box sx={{ 
                        mt: 1,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.5,
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
                              borderColor: alpha(COLORS.PRIMARY, 0.3),
                              color: COLORS.PRIMARY,
                              '&:hover': {
                                backgroundColor: alpha(COLORS.PRIMARY, 0.1),
                                borderColor: COLORS.PRIMARY,
                                color: COLORS.PRIMARY,
                                transform: 'translateY(-1px)',
                                boxShadow: `0 2px 8px ${alpha(COLORS.PRIMARY, 0.2)}`,
                              },
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Payment Section */}
              <Grid item xs={12}>
                <Card
                  sx={{
                    backgroundColor: alpha(COLORS.PRIMARY, 0.05),
                    border: `1px solid ${alpha(COLORS.PRIMARY, 0.2)}`,
                  }}
                >
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                    }}>
                      <LockIcon sx={{ mr: 1, color: COLORS.PRIMARY }} />
                      <Typography 
                        variant={isMobile ? 'subtitle1' : 'h6'} 
                        sx={{ fontWeight: 600, color: COLORS.PRIMARY }}
                      >
                        Payment Information
                      </Typography>
                    </Box>

                    {/* Payment Method Selection */}
                    <Box sx={{ 
                      p: isMobile ? 1.5 : 2,
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: 1,
                      border: `1px solid ${alpha(COLORS.PRIMARY, 0.1)}`,
                      mb: 2,
                    }}>
                      <FormControl component="fieldset">
                        <FormLabel 
                          component="legend" 
                          sx={{ 
                            fontWeight: 600, 
                            color: COLORS.PRIMARY,
                            fontSize: isMobile ? '0.875rem' : '1rem',
                            mb: 1,
                          }}
                        >
                          {t('booking.page.paymentMethod')}
                        </FormLabel>
                        <RadioGroup
                          row={!isMobile}
                          value={paymentMethod}
                          onChange={handlePaymentMethodChange}
                          sx={{ 
                            flexDirection: isMobile ? 'column' : 'row',
                            gap: isMobile ? 0.5 : 1,
                          }}
                        >
                          <FormControlLabel
                            value="credit_card"
                            control={<Radio size="small" disabled />}
                            label={
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  py: 0.5,
                                  opacity: 0.4,
                                  color: 'text.disabled',
                                }}
                              >
                                <CreditCardIcon sx={{ mr: 1, fontSize: 20 }} />
                                {t('booking.page.creditCard')}
                              </Box>
                            }
                            sx={{ mr: isMobile ? 0 : 2 }}
                            disabled
                          />
                          <FormControlLabel
                            value="mobile_money"
                            control={<Radio size="small" />}
                            label={
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  flexDirection: 'column',
                                  py: 0.5,
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <PhoneIcon sx={{ mr: 1, fontSize: 20 }} />
                                  {t('booking.page.mobileMoney')}
                                </Box>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: COLORS.PRIMARY, 
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    mt: 0.3,
                                    ml: 3,
                                  }}
                                >
                                  {t('booking.page.payWithMobile')}
                                </Typography>
                              </Box>
                            }
                            sx={{ mr: isMobile ? 0 : 2 }}
                          />
                          <FormControlLabel
                            value="pay_at_frontdesk"
                            control={<Radio size="small" />}
                            label={
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  py: 0.5,
                                }}
                              >
                                <HotelIcon sx={{ mr: 1, fontSize: 20 }} />
                                {t('booking.page.payAtFrontDesk')}
                              </Box>
                            }
                            sx={{ mr: isMobile ? 0 : 2 }}
                          />
                          <FormControlLabel
                            value="mbirr"
                            control={<Radio size="small" disabled />}
                            label={
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  py: 0.5,
                                  opacity: 0.4,
                                  color: 'text.disabled',
                                }}
                              >
                                <PhoneIcon sx={{ mr: 1, fontSize: 20 }} />
                                🇪🇹 M-birr
                              </Box>
                            }
                            sx={{ mr: isMobile ? 0 : 2 }}
                            disabled
                          />
                          <FormControlLabel
                            value="telebirr"
                            control={<Radio size="small" disabled />}
                            label={
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  py: 0.5,
                                  opacity: 0.4,
                                  color: 'text.disabled',
                                }}
                              >
                                <PhoneIcon sx={{ mr: 1, fontSize: 20 }} />
                                🇪🇹 Telebirr
                              </Box>
                            }
                            disabled
                          />
                        </RadioGroup>
                      </FormControl>
                    </Box>

                    {/* Credit Card Form */}
                    {paymentMethod === 'credit_card' && (
                      <Box sx={{ 
                        p: isMobile ? 1.5 : 2,
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: 1,
                        border: `1px solid ${alpha(COLORS.PRIMARY, 0.1)}`,
                      }}>
                        <Box sx={{ textAlign: 'center', mb: 1.5 }}>
                          <CreditCardIcon sx={{ 
                            fontSize: 32, 
                            color: COLORS.PRIMARY,
                            mb: 0.5 
                          }} />
                          <Typography variant="body1" sx={{ 
                            color: theme.palette.text.primary,
                            fontWeight: 600,
                          }}>
                            {t('booking.page.creditCardPayment')} - ETB {totalAmount?.toFixed(0)}
                          </Typography>
                        </Box>
                        
                        <Grid container spacing={isMobile ? 1.5 : 2}>
                          <Grid item xs={12}>
                            <TextField
                              label={t('booking.page.cardholderName')}
                              value={cardholderName}
                              onChange={handleCardholderNameChange}
                              fullWidth
                              required
                              size="small"
                              placeholder="John Doe"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              label={t('booking.page.cardNumber')}
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
                              size="small"
                              placeholder="1234 5678 9012 3456"
                              inputProps={{
                                inputMode: 'numeric',
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CreditCardIcon fontSize="small" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              label={t('booking.page.expiryDate')}
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
                              size="small"
                              placeholder="MM/YY"
                              inputProps={{ maxLength: 5 }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              label={t('booking.page.cvv')}
                              value={cvv}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                if (value.length <= 4) {
                                  setCvv(value);
                                }
                              }}
                              fullWidth
                              required
                              size="small"
                              placeholder="123"
                              type="password"
                              inputProps={{ maxLength: 4 }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Alert severity="info" sx={{ py: 0.5 }}>
                              <Typography variant="caption">
                                {t('booking.page.securePayment')}
                              </Typography>
                            </Alert>
                          </Grid>
                        </Grid>
                      </Box>
                    )}

                    {/* Mobile Money Form */}
                    {paymentMethod === 'mobile_money' && (
                      <Box sx={{ 
                        p: isMobile ? 1.5 : 2,
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: 1,
                        border: `1px solid ${alpha(COLORS.PRIMARY, 0.1)}`,
                      }}>
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                          <PhoneIcon sx={{ 
                            fontSize: 40, 
                            color: COLORS.PRIMARY,
                            mb: 1 
                          }} />
                          <Typography variant="h6" sx={{ 
                            color: COLORS.PRIMARY,
                            fontWeight: 700,
                            mb: 0.5,
                          }}>
                            {t('booking.page.mobileMoneyTransfer')} - ETB {totalAmount?.toFixed(0)}
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            color: COLORS.PRIMARY,
                            fontWeight: 600,
                            fontSize: '1.1rem',
                          }}>
                            {t('booking.page.payWithYourMobile')}
                          </Typography>
                        </Box>
                        
                        <Alert severity="info" sx={{ mb: 2, py: 1 }}>
                          <Typography variant="body2">
                            {t('booking.page.completeMobileTransfer')}
                          </Typography>
                        </Alert>
                        
                        {/* Hotel Mobile Number Display */}
                        <Box sx={{ 
                          mb: 2, 
                          p: 2, 
                          backgroundColor: alpha(theme.palette.grey[100], 0.7),
                          borderRadius: 1,
                          border: `1px solid ${alpha(theme.palette.grey[400], 0.3)}`,
                        }}>
                          <Typography variant="body2" sx={{ 
                            fontWeight: 600, 
                            mb: 1,
                            color: theme.palette.text.secondary,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                          }}>
                            {t('booking.page.transferToMobileOnly')}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PhoneIcon sx={{ 
                              mr: 1, 
                              color: theme.palette.text.disabled,
                              fontSize: '1.2rem' 
                            }} />
                            <Typography variant="h6" sx={{ 
                              color: theme.palette.text.disabled,
                              fontFamily: 'monospace',
                              letterSpacing: 1,
                            }}>
                              {hotelData?.mobilePaymentPhone || '+251-911-123-456'}
                            </Typography>
                          </Box>
                          {hotelData?.mobilePaymentPhone2 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <PhoneIcon sx={{ 
                                mr: 1, 
                                color: theme.palette.text.disabled,
                                fontSize: '1.2rem' 
                              }} />
                              <Typography variant="body2" sx={{ 
                                color: theme.palette.text.disabled,
                                fontFamily: 'monospace',
                                letterSpacing: 1,
                              }}>
                                {hotelData.mobilePaymentPhone2} ({t('booking.page.alternative')})
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        
                        <Grid container spacing={isMobile ? 1.5 : 2}>
                          <Grid item xs={12}>
                            <TextField
                              label={t('booking.page.yourMobileNumber')}
                              value={mobileNumber}
                              onChange={handleMobileNumberChange}
                              fullWidth
                              required
                              size="medium"
                              placeholder="+251912345678"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PhoneIcon fontSize="small" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              label={t('booking.page.mobileTransferReference')}
                              value={mobileTransferReference}
                              onChange={handleMobileTransferReferenceChange}
                              fullWidth
                              required
                              size="medium"
                              placeholder={t('booking.page.enterReferenceNumber')}
                              helperText={t('booking.page.provideReferenceHelp')}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Alert severity="success" sx={{ py: 1 }}>
                              <Typography variant="body2">
                                {t('booking.page.transferExactAmount')} <strong>ETB {totalAmount?.toFixed(0)}</strong> {t('booking.page.toMobileNumberAbove')}
                              </Typography>
                            </Alert>
                          </Grid>
                        </Grid>
                      </Box>
                    )}

                    {/* Pay at Front Desk Information */}
                    {paymentMethod === 'pay_at_frontdesk' && (
                      <Box sx={{ 
                        p: isMobile ? 1.5 : 2,
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: 1,
                        border: `1px solid ${alpha(COLORS.PRIMARY, 0.1)}`,
                      }}>
                        <Box sx={{ textAlign: 'center', mb: 1.5 }}>
                          <HotelIcon sx={{ 
                            fontSize: 32, 
                            color: COLORS.PRIMARY,
                            mb: 0.5 
                          }} />
                          <Typography variant="body1" sx={{ 
                            color: theme.palette.text.primary,
                            fontWeight: 600,
                          }}>
                            {t('booking.page.payAtFrontDeskPayment')} - ETB {totalAmount?.toFixed(0)}
                          </Typography>
                        </Box>
                        
                        <Alert severity="info" sx={{ mb: 1.5, py: 0.5 }}>
                          <Typography variant="caption">
                            {t('booking.page.reservationConfirmed')}
                          </Typography>
                        </Alert>
                        
                        <Alert severity="warning" sx={{ py: 0.5 }}>
                          <Typography variant="caption">
                            {t('booking.page.bringValidId')}
                          </Typography>
                        </Alert>
                      </Box>
                    )}

                    {/* Ethiopian Mobile Payment (M-birr) */}
                    {paymentMethod === 'mbirr' && (
                      <Box sx={{ 
                        p: isMobile ? 1.5 : 2,
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: 1,
                        border: `1px solid ${alpha(COLORS.PRIMARY, 0.1)}`,
                      }}>
                        <Box sx={{ textAlign: 'center', mb: 1.5 }}>
                          <PhoneIcon sx={{ 
                            fontSize: 32, 
                            color: COLORS.PRIMARY,
                            mb: 0.5 
                          }} />
                          <Typography variant="body1" sx={{ 
                            color: theme.palette.text.primary,
                            fontWeight: 600,
                          }}>
                            🇪🇹 M-birr Payment - ETB {totalAmount?.toFixed(0)}
                          </Typography>
                        </Box>
                        
                        <Alert severity="info" sx={{ mb: 1.5, py: 0.5 }}>
                          <Typography variant="caption">
                            You'll receive SMS instructions to complete payment.
                          </Typography>
                        </Alert>
                        
                        <TextField
                          label="Ethiopian Mobile Number"
                          value={ethiopianPhoneNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            if (value.length <= 10) {
                              setEthiopianPhoneNumber(value.substring(0, 10));
                            }
                          }}
                          fullWidth
                          required
                          size="small"
                          placeholder="0912345678"
                          helperText="Enter your Ethiopian mobile number"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneIcon fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>
                    )}

                    {/* Ethiopian Mobile Payment (Telebirr) */}
                    {paymentMethod === 'telebirr' && (
                      <Box sx={{ 
                        p: isMobile ? 1.5 : 2,
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: 1,
                        border: `1px solid ${alpha(COLORS.PRIMARY, 0.1)}`,
                      }}>
                        <Box sx={{ textAlign: 'center', mb: 1.5 }}>
                          <PhoneIcon sx={{ 
                            fontSize: 32, 
                            color: COLORS.PRIMARY,
                            mb: 0.5 
                          }} />
                          <Typography variant="body1" sx={{ 
                            color: theme.palette.text.primary,
                            fontWeight: 600,
                          }}>
                            🇪🇹 Telebirr Payment - ETB {totalAmount?.toFixed(0)}
                          </Typography>
                        </Box>
                        
                        <Alert severity="info" sx={{ mb: 1.5, py: 0.5 }}>
                          <Typography variant="caption">
                            You'll receive SMS instructions to complete payment.
                          </Typography>
                        </Alert>
                        
                        <TextField
                          label="Ethiopian Mobile Number"
                          value={ethiopianPhoneNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            if (value.length <= 10) {
                              setEthiopianPhoneNumber(value.substring(0, 10));
                            }
                          }}
                          fullWidth
                          required
                          size="small"
                          placeholder="0987654321"
                          helperText="Enter your Ethiopian mobile number"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneIcon fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>



            </Grid>
          </Box>

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
                ? t('booking.page.booking')
                : isMobile 
                  ? t('booking.page.bookWithAmount', { amount: totalAmount?.toFixed(0) })
                  : t('booking.page.bookNowWithAmount', { amount: totalAmount?.toFixed(0) })
              }
            </Button>
          </Box>
        </form>
          </Grid>

          {/* Right Column - Booking Summary */}
          <Grid item xs={12} md={4} lg={4}>
            <BookingSummary
              hotelName={hotelName}
              roomData={roomData}
              checkInDate={checkInDate}
              checkOutDate={checkOutDate}
              guests={guests}
              nights={nights}
              totalAmount={totalAmount || 0}
            />
          </Grid>
        </Grid>
      </Container>
    </LocalizationProvider>
  );
};

export default BookingPage;
