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
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'mobile_money' | 'pay_at_frontdesk' | 'mbirr' | 'telebirr'>('credit_card');
  const [creditCardNumber, setCreditCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [transferReceiptNumber, setTransferReceiptNumber] = useState('');
  
  // Ethiopian payment state
  const [ethiopianPhoneNumber, setEthiopianPhoneNumber] = useState('');
  const [showEthiopianPayment, setShowEthiopianPayment] = useState(false);
  const [ethiopianPaymentResponse, setEthiopianPaymentResponse] = useState<any>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if no booking data
  useEffect(() => {
    if (!bookingData?.room && !bookingData?.roomType) {
      navigate('/search-results');
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
        // Include guest information for guest booking flow
        guestName: isGuestBookingFlow ? guestName.trim() : undefined,
        guestEmail: isGuestBookingFlow ? guestEmail.trim() : undefined,
        guestPhone: isGuestBookingFlow ? (guestPhone.trim() || undefined) : undefined,
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
      navigate('/search-results', { 
        state: { 
          searchRequest: bookingData.searchRequest,
          // If we don't have hotels data, SearchResultsPage will perform a new search
          hotels: [] // This will trigger a search in SearchResultsPage
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
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          {/* Back Navigation */}
          <Box sx={{ mb: 2 }}>
            <IconButton 
              onClick={handleBackToResults}
              sx={{ mr: 1 }}
              aria-label="back to search results"
            >
              <ArrowBackIcon />
            </IconButton>
            <Breadcrumbs aria-label="breadcrumb">
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
          </Box>

          {/* Page Title */}
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Book Your Stay
            {isGuestBookingFlow && (
              <Chip 
                label="Guest Booking" 
                color="info" 
                size="small" 
                sx={{ ml: 2, fontWeight: 'bold' }}
              />
            )}
          </Typography>
          {hotelName && (
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {hotelName}
            </Typography>
          )}
          {isGuestBookingFlow && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
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
        <Paper elevation={1} sx={{ p: 3, mb: 4, bgcolor: 'grey.50' }}>
          <Typography variant="h6" component="div" gutterBottom>
            Room Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Room:</strong> {roomData.roomNumber || 'Room Type Booking'}
              </Typography>
              <Typography variant="body2">
                <strong>Type:</strong> {roomData.roomType}
              </Typography>
              <Typography variant="body2">
                <strong>Capacity:</strong> Up to {roomData.capacity} guests
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Price per night:</strong> ${roomData.pricePerNight}
              </Typography>
              {nights > 0 && (
                <>
                  <Typography variant="body2">
                    <strong>Nights:</strong> {nights}
                  </Typography>
                  <Typography variant="h6" component="div" color="primary.main">
                    <strong>Total: ${totalAmount}</strong>
                  </Typography>
                </>
              )}
            </Grid>
          </Grid>
          {roomData.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {roomData.description}
            </Typography>
          )}
        </Paper>

        {/* Booking Form */}
        <form onSubmit={handleSubmit}>
          <Card elevation={1} sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Dates and Guests */}
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
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="Number of Guests"
                  type="number"
                  value={guests}
                  onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 1))}
                  inputProps={{ min: 1, max: roomData.capacity }}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" component="div" gutterBottom>
                  Guest Information
                </Typography>
              </Grid>

              {isAuthenticated && !isGuestBookingFlow ? (
                // Display authenticated user information (only if not doing guest booking)
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                    <Typography variant="body1" gutterBottom>
                      <strong>Name:</strong> {user?.firstName} {user?.lastName}
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
                      onChange={(e) => setGuestName(e.target.value)}
                      fullWidth
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email Address"
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      fullWidth
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone Number"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      fullWidth
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <TextField
                  label="Special Requests"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  multiline
                  rows={3}
                  fullWidth
                  placeholder="Any special requests or preferences..."
                />
              </Grid>

              {/* Payment Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LockIcon sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="h6" component="div">
                    Secure Payment Information
                  </Typography>
                </Box>
              </Grid>

              {/* Payment Method Selection */}
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    Payment Method
                  </FormLabel>
                  <RadioGroup
                    row
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as 'credit_card' | 'mobile_money' | 'pay_at_frontdesk' | 'mbirr' | 'telebirr')}
                    sx={{ mt: 1 }}
                  >
                    <FormControlLabel
                      value="credit_card"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CreditCardIcon sx={{ mr: 1 }} />
                          Credit Card
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="mobile_money"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneIcon sx={{ mr: 1 }} />
                          Mobile Money Transfer
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="pay_at_frontdesk"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <HotelIcon sx={{ mr: 1 }} />
                          Pay at Front Desk
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="mbirr"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneIcon sx={{ mr: 1, color: '#FF6B35' }} />
                          🇪🇹 M-birr
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="telebirr"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneIcon sx={{ mr: 1, color: '#00A651' }} />
                          🇪🇹 Telebirr
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {/* Credit Card Form */}
              {paymentMethod === 'credit_card' && (
                <>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <CreditCardIcon sx={{ mr: 1 }} />
                        Credit Card Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            label="Cardholder Name"
                            value={cardholderName}
                            onChange={(e) => setCardholderName(e.target.value)}
                            fullWidth
                            required
                            placeholder="John Doe"
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
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CreditCardIcon color="action" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={6}>
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
                            inputProps={{ maxLength: 5 }}
                          />
                        </Grid>
                        <Grid item xs={6}>
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
                            inputProps={{ maxLength: 4 }}
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
                    <Paper sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
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
                            onChange={(e) => setMobileNumber(e.target.value)}
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
                            onChange={(e) => setTransferReceiptNumber(e.target.value)}
                            fullWidth
                            required
                            placeholder="Receipt/Transaction ID"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Amount to Transfer:</strong> ${totalAmount}
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
                    <Paper sx={{ p: 2, bgcolor: 'info.light', border: '1px solid', borderColor: 'info.main', color: 'info.contrastText' }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                        <HotelIcon sx={{ mr: 1 }} />
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
                          <li>Total amount due: <strong>${totalAmount}</strong></li>
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
                    <Paper sx={{ p: 2, bgcolor: '#FFF5F0', border: '2px solid #FF6B35' }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', color: '#FF6B35' }}>
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
                                  <PhoneIcon sx={{ color: '#FF6B35' }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ p: 2, bgcolor: '#FF6B35', color: 'white', borderRadius: 1 }}>
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
                              • Amount: ${totalAmount} USD
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
                    <Paper sx={{ p: 2, bgcolor: '#F0FFF4', border: '2px solid #00A651' }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', color: '#00A651' }}>
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
                                  <PhoneIcon sx={{ color: '#00A651' }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ p: 2, bgcolor: '#00A651', color: 'white', borderRadius: 1 }}>
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
                              • Amount: ${totalAmount} USD
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
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              size="large"
              sx={{ minWidth: 150 }}
            >
              {loading ? 'Booking...' : `Book Now - $${totalAmount}`}
            </Button>
          </Box>
        </form>
      </Container>
    </LocalizationProvider>
  );
};

export default BookingPage;
