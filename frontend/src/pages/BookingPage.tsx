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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CreditCard as CreditCardIcon,
  PhoneAndroid as PhoneIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthenticatedApi } from '../hooks/useAuthenticatedApi';
import { BookingRequest, AvailableRoom, HotelSearchRequest } from '../types/hotel';

interface BookingPageState {
  room: AvailableRoom;
  hotelName: string;
  hotelId: number;
  searchRequest?: HotelSearchRequest;
}

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hotelApiService } = useAuthenticatedApi();
  
  // Get data from navigation state
  const bookingData = location.state as BookingPageState;
  
  // Form state
  const [checkInDate, setCheckInDate] = useState<Dayjs | null>(
    bookingData?.searchRequest?.checkInDate ? dayjs(bookingData.searchRequest.checkInDate) : dayjs()
  );
  const [checkOutDate, setCheckOutDate] = useState<Dayjs | null>(
    bookingData?.searchRequest?.checkOutDate ? dayjs(bookingData.searchRequest.checkOutDate) : dayjs().add(1, 'day')
  );
  const [guests, setGuests] = useState(bookingData?.searchRequest?.guests || 1);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'mobile_money'>('credit_card');
  const [creditCardNumber, setCreditCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [transferReceiptNumber, setTransferReceiptNumber] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if no booking data
  useEffect(() => {
    if (!bookingData?.room) {
      navigate('/search-results');
    }
  }, [bookingData, navigate]);

  if (!bookingData?.room) {
    return null; // Will redirect
  }

  const { room, hotelName } = bookingData;

  const calculateTotalAmount = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const nights = checkOutDate.diff(checkInDate, 'day');
    return room.pricePerNight * nights;
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

    if (!guestName.trim() || !guestEmail.trim()) {
      setError('Please provide guest name and email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
      setError('Please provide a valid email address');
      return;
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

    setLoading(true);

    try {
      const bookingRequest: BookingRequest = {
        roomId: room.id,
        checkInDate: checkInDate.format('YYYY-MM-DD'),
        checkOutDate: checkOutDate.format('YYYY-MM-DD'),
        guests,
        specialRequests: specialRequests.trim() || undefined,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
        guestPhone: guestPhone.trim() || undefined,
        paymentMethod,
        // Credit card details
        ...(paymentMethod === 'credit_card' && {
          creditCardNumber: creditCardNumber.replace(/\s/g, ''),
          expiryDate,
          cvv,
          cardholderName: cardholderName.trim(),
        }),
        // Mobile money details
        ...(paymentMethod === 'mobile_money' && {
          mobileNumber: mobileNumber.trim(),
          transferReceiptNumber: transferReceiptNumber.trim(),
        }),
      };

      const result = await hotelApiService.createBooking(bookingRequest);
      
      // Navigate to confirmation page or back to results with success message
      navigate('/search-results', { 
        state: { 
          successMessage: `Booking confirmed! Confirmation number: ${result.confirmationNumber}`,
          searchRequest: bookingData.searchRequest 
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while booking');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToResults = () => {
    navigate('/search-results', { 
      state: { 
        searchRequest: bookingData.searchRequest 
      } 
    });
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
          </Typography>
          {hotelName && (
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {hotelName}
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
                <strong>Room:</strong> {room.roomNumber}
              </Typography>
              <Typography variant="body2">
                <strong>Type:</strong> {room.roomType}
              </Typography>
              <Typography variant="body2">
                <strong>Capacity:</strong> Up to {room.capacity} guests
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Price per night:</strong> ${room.pricePerNight}
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
          {room.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {room.description}
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
                  inputProps={{ min: 1, max: room.capacity }}
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

              {/* Guest Details */}
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
                    onChange={(e) => setPaymentMethod(e.target.value as 'credit_card' | 'mobile_money')}
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
            </Grid>
          </Card>

          {/* Actions */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={handleBackToResults}
              size="large"
            >
              Back to Results
            </Button>
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
