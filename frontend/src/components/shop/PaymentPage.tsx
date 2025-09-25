import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Phone as MobileIcon,
  Money as CashIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckIcon,
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  GetApp as GetAppIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { PaymentMethod } from '../../types/shop';
import { themeConstants } from '../../theme/theme';
import { COLORS } from '../../theme/themeColors';
import { StandardButton } from '../common';
import { useMockPayment, MockPaymentRequest } from '../../services/mockPaymentGateway';
import { useAuth } from '../../contexts/AuthContext';
import { shopApiService } from '../../services/shopApi';
import { useAuthenticatedApi } from '../../hooks/useAuthenticatedApi';

interface OrderItem {
  product: {
    id: number;
    name: string;
    price: number;
    stockQuantity: number;
  };
  quantity: number;
}

interface PaymentPageState {
  totalAmount: number;
  selectedPaymentMethod?: PaymentMethod;
  orderItems?: OrderItem[];
  orderData?: any;
  returnPath?: string;
  bookingData?: any; // For hotel booking data
  bookingType?: 'shop_order' | 'hotel_booking'; // To distinguish between shop and hotel
  orderSummary?: any; // For booking summary display
}

interface PaymentMethodOption {
  value: PaymentMethod;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const PaymentPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const mockPayment = useMockPayment();
  const { user } = useAuth();
  const { hotelApiService } = useAuthenticatedApi();
  
  // Get payment data from navigation state
  const paymentData = location.state as PaymentPageState;
  
  const [totalAmount] = useState(paymentData?.totalAmount || 0);
  const [orderItems] = useState(paymentData?.orderItems || []);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<PaymentMethod>(
    paymentData?.selectedPaymentMethod || PaymentMethod.CASH
  );
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  // Card payment fields with pre-filled test data
  const [cardNumber, setCardNumber] = useState('4111 1111 1111 1111');
  const [cardExpiry, setCardExpiry] = useState('12/27');
  const [cardCvv, setCardCvv] = useState('123');
  const [cardName, setCardName] = useState('John Doe');

  // Mobile money fields with pre-filled test data
  const [phoneNumber, setPhoneNumber] = useState('+251911123456');
  const [mobileProvider, setMobileProvider] = useState('M-Pesa');

  const steps = ['Order Summary', 'Payment Method', 'Payment Details', 'Confirmation'];

  const paymentMethods: PaymentMethodOption[] = [
    {
      value: PaymentMethod.CASH,
      label: 'Cash Payment',
      icon: <CashIcon />,
      color: theme.palette.primary.main,
      description: 'Pay with cash at the hotel reception'
    },
    {
      value: PaymentMethod.CARD,
      label: 'Credit/Debit Card',
      icon: <CreditCardIcon />,
      color: theme.palette.info.main,
      description: 'Pay securely with your card'
    },
    {
      value: PaymentMethod.MOBILE_MONEY,
      label: 'Mobile Money',
      icon: <MobileIcon />,
      color: theme.palette.primary.dark,
      description: 'Mobile money payment'
    }
  ];

  // Redirect if no payment data
  useEffect(() => {
    if (!paymentData || !paymentData.totalAmount) {
      console.warn('No payment data found, redirecting...');
      
      // Check if user has access to shop routes
      const userRoles = user?.roles || [];
      const canAccessShop = userRoles.includes('HOTEL_ADMIN') || userRoles.includes('FRONTDESK');
      
      navigate(canAccessShop ? '/shop' : '/dashboard');
    }
  }, [paymentData, navigate, user]);

  const formatCurrency = (amount: number) => {
    return `ETB ${amount?.toFixed(0)}`;
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setCurrentPaymentMethod(method);
    setError(null);
    setPaymentSuccess(false);
    
    // Pre-fill with test data for the selected payment method
    const testData = mockPayment.fillTestData(method);
    if (testData.cardNumber) setCardNumber(testData.cardNumber);
    if (testData.cardExpiry) setCardExpiry(testData.cardExpiry);
    if (testData.cardCvv) setCardCvv(testData.cardCvv);
    if (testData.cardName) setCardName(testData.cardName);
    if (testData.phoneNumber) setPhoneNumber(testData.phoneNumber);
    if (testData.provider) setMobileProvider(testData.provider);
  };

  const validatePaymentDetails = (): boolean => {
    setError(null);

    switch (currentPaymentMethod) {
      case PaymentMethod.CARD:
        if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim() || !cardName.trim()) {
          setError('Please fill in all card details');
          return false;
        }
        if (cardNumber.replace(/[\s-]/g, '').length < 16) {
          setError('Please enter a valid card number');
          return false;
        }
        break;

      case PaymentMethod.MOBILE_MONEY:
        if (!phoneNumber.trim() || !mobileProvider.trim()) {
          setError('Please fill in mobile money details');
          return false;
        }
        break;

      case PaymentMethod.CASH:
      case PaymentMethod.PAY_AT_FRONTDESK:
        // No validation needed for these methods
        break;
    }

    return true;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Order summary reviewed, go to payment method selection
      setActiveStep(1);
    } else if (activeStep === 1) {
      // Payment method selected, go to details
      setActiveStep(2);
    } else if (activeStep === 2) {
      // Validate details and go to confirmation
      if (validatePaymentDetails()) {
        setActiveStep(3);
      }
    } else if (activeStep === 3) {
      // Process payment
      handleProcessPayment();
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleProcessPayment = async () => {
    if (!validatePaymentDetails()) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      let reference = '';

      if (currentPaymentMethod === PaymentMethod.CASH || currentPaymentMethod === PaymentMethod.PAY_AT_FRONTDESK) {
        // For cash and front desk payments, no processing needed
        reference = `${currentPaymentMethod}-${Date.now()}`;
        setPaymentSuccess(true);
      } else {
        // Process payment through mock gateway
        const mockPaymentRequest: MockPaymentRequest = {
          amount: totalAmount,
          currency: 'ETB',
          paymentMethod: currentPaymentMethod,
          customerInfo: {
            name: cardName || 'Shop Customer',
            phone: phoneNumber,
          },
          paymentDetails: {
            cardNumber: cardNumber.replace(/[\s-]/g, ''), // Send clean card number (digits only)
            expiryDate: cardExpiry,
            cvv: cardCvv,
            cardHolderName: cardName,
            phoneNumber: phoneNumber,
            provider: mobileProvider,
            description: `Shop purchase - Amount: ETB ${totalAmount}`,
          },
        };

        const paymentResult = await mockPayment.processPayment(mockPaymentRequest);
        
        // Check if payment failed
        if (!paymentResult.success) {
          throw new Error(paymentResult.message || 'Payment processing failed');
        }
        
        reference = paymentResult.paymentReference;
        setPaymentSuccess(true);
      }

      setPaymentReference(reference);
      
      // Create order after successful payment
      await createOrderAfterPayment(currentPaymentMethod, reference);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const createOrderAfterPayment = async (paymentMethod: PaymentMethod, paymentReference: string) => {
    try {
      const bookingType = paymentData?.bookingType || 'shop_order';
      
      if (bookingType === 'hotel_booking') {
        // Handle hotel booking creation
        const bookingData = paymentData?.bookingData;
        if (!bookingData) {
          throw new Error('Missing booking data');
        }

        const bookingRequest = {
          ...bookingData,
          paymentMethodId: paymentMethod === PaymentMethod.CASH ? 'pay_at_frontdesk' : 'mock_payment_processed',
          paymentReference: paymentReference,
          transactionId: `txn_${Date.now()}`,
        };

        console.log('Creating hotel booking:', bookingRequest);
        const result = await hotelApiService.createBooking(bookingRequest);
        
        // Auto-redirect after booking creation
        setTimeout(() => {
          handlePaymentComplete(paymentMethod, paymentReference, result, bookingType);
        }, 2000);

      } else {
        // Handle shop order creation (existing logic)
        const hotelId = user?.hotelId ? parseInt(user.hotelId) : null;
        if (!hotelId || !paymentData?.orderData) {
          throw new Error('Missing hotel ID or order data');
        }

        const orderData = {
          ...paymentData.orderData,
          paymentMethod,
          paymentReference,
        };

        const createdOrder = await shopApiService.createOrder(hotelId, orderData);
        
        // Auto-redirect after order creation
        setTimeout(() => {
          handlePaymentComplete(paymentMethod, paymentReference, createdOrder, bookingType);
        }, 2000);
      }

    } catch (err) {
      console.error('Failed to create order/booking after payment:', err);
      const bookingType = paymentData?.bookingType || 'shop_order';
      const errorMsg = bookingType === 'hotel_booking' 
        ? 'Payment successful but failed to create booking. Please contact support.'
        : 'Payment successful but failed to create order. Please contact support.';
      setError(errorMsg);
    }
  };

  const handlePaymentComplete = (paymentMethod: PaymentMethod, reference?: string, createdResult?: any, bookingType?: string) => {
    const isHotelBooking = bookingType === 'hotel_booking';
    
    if (isHotelBooking && createdResult) {
      // Navigate to booking confirmation page for hotel bookings
      navigate(`/booking-confirmation/${createdResult.reservationId}`, { 
        state: { 
          booking: createdResult,
          paymentComplete: true,
          paymentMethod,
          paymentReference: reference,
        },
        replace: true
      });
    } else {
      // Navigate back to the return path with payment results (shop orders)
      let returnPath = paymentData?.returnPath || '/shop';
      
      // Check if user has access to shop routes
      const userRoles = user?.roles || [];
      const canAccessShop = userRoles.includes('HOTEL_ADMIN') || userRoles.includes('FRONTDESK');
      
      // If trying to return to shop routes but user doesn't have access, go to dashboard
      if (returnPath.startsWith('/shop') && !canAccessShop) {
        returnPath = '/dashboard';
      }
      
      navigate(returnPath, {
        state: {
          paymentComplete: true,
          paymentMethod,
          paymentReference: reference,
          orderData: createdResult || paymentData?.orderData,
          message: createdResult ? `Order ${createdResult.orderNumber} completed successfully!` : 'Payment completed successfully!'
        },
        replace: true // Use replace to avoid back button issues
      });
    }
  };

  const handleCancel = () => {
    let returnPath = paymentData?.returnPath || '/shop';
    
    // Check if user has access to shop routes
    const userRoles = user?.roles || [];
    const canAccessShop = userRoles.includes('HOTEL_ADMIN') || userRoles.includes('FRONTDESK');
    
    // If trying to return to shop routes but user doesn't have access, go to dashboard
    if (returnPath.startsWith('/shop') && !canAccessShop) {
      returnPath = '/dashboard';
    }
    
    navigate(returnPath, { replace: true });
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderOrderSummary();
      case 1:
        return renderPaymentMethodSelection();
      case 2:
        return renderPaymentDetails();
      case 3:
        return renderConfirmation();
      default:
        return null;
    }
  };

  const renderOrderSummary = () => {
    const bookingType = paymentData?.bookingType || 'shop_order';
    
    if (bookingType === 'hotel_booking') {
      return renderBookingSummary();
    } else {
      return renderShopOrderSummary();
    }
  };

  const renderBookingSummary = () => {
    const orderSummary = paymentData?.orderSummary;
    if (!orderSummary) return null;

    const handleDownloadReceipt = () => {
      // TODO: Implement PDF download functionality
      console.log('Downloading booking receipt...');
    };

    const handleSaveReceipt = () => {
      // TODO: Implement save to account functionality
      console.log('Saving booking receipt...');
    };

    return (
      <Box>
        <Typography variant="h6" gutterBottom color="primary">
          Booking Summary
        </Typography>
        
        <TableContainer component={Paper} elevation={1} sx={{ mb: 3 }}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell component="th" scope="row">
                  <Typography variant="body2" fontWeight="medium">Hotel</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{orderSummary.hotelName}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">
                  <Typography variant="body2" fontWeight="medium">Room Type</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{orderSummary.roomType}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">
                  <Typography variant="body2" fontWeight="medium">Check-in</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{orderSummary.checkIn}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">
                  <Typography variant="body2" fontWeight="medium">Check-out</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{orderSummary.checkOut}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">
                  <Typography variant="body2" fontWeight="medium">Duration</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{orderSummary.nights} night{orderSummary.nights > 1 ? 's' : ''}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">
                  <Typography variant="body2" fontWeight="medium">Guests</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{orderSummary.guests} guest{orderSummary.guests > 1 ? 's' : ''}</Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" color="primary">Total Amount:</Typography>
            <Typography variant="h6" color="primary">
              ETB {orderSummary.totalAmount?.toFixed(0)}
            </Typography>
          </Box>
        </Paper>

        {/* Receipt Actions */}
        <Typography variant="subtitle2" gutterBottom color="primary">
          Receipt Options:
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            size="small"
          >
            Print
          </Button>
          <Button
            variant="outlined"
            startIcon={<GetAppIcon />}
            onClick={handleDownloadReceipt}
            size="small"
          >
            Download PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSaveReceipt}
            size="small"
          >
            Save to Account
          </Button>
        </Box>
      </Box>
    );
  };

  const renderShopOrderSummary = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const tax = subtotal * 0.15; // 15% tax
    const total = subtotal + tax;

    const handleDownloadReceipt = () => {
      // TODO: Implement PDF download functionality
      console.log('Downloading receipt...');
    };

    const handleSaveReceipt = () => {
      // TODO: Implement save to account functionality
      console.log('Saving receipt...');
    };

    return (
      <Box>
        <Typography variant="h6" gutterBottom color="primary">
          Order Summary
        </Typography>
        
        <TableContainer component={Paper} elevation={1} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell align="center">Quantity</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orderItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {item.product.name}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{item.quantity}</TableCell>
                  <TableCell align="right">
                    {Number(item.product.price).toLocaleString('en-ET', { 
                      style: 'currency', 
                      currency: 'ETB' 
                    })}
                  </TableCell>
                  <TableCell align="right">
                    {Number(item.product.price * item.quantity).toLocaleString('en-ET', { 
                      style: 'currency', 
                      currency: 'ETB' 
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Subtotal:</Typography>
            <Typography variant="body2">
              {subtotal.toLocaleString('en-ET', { style: 'currency', currency: 'ETB' })}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Tax (15%):</Typography>
            <Typography variant="body2">
              {tax.toLocaleString('en-ET', { style: 'currency', currency: 'ETB' })}
            </Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" color="primary">Total:</Typography>
            <Typography variant="h6" color="primary">
              {total.toLocaleString('en-ET', { style: 'currency', currency: 'ETB' })}
            </Typography>
          </Box>
        </Paper>

        {/* Receipt Actions */}
        <Typography variant="subtitle2" gutterBottom color="primary">
          Receipt Options:
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            size="small"
          >
            Print
          </Button>
          <Button
            variant="outlined"
            startIcon={<GetAppIcon />}
            onClick={handleDownloadReceipt}
            size="small"
          >
            Download PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSaveReceipt}
            size="small"
          >
            Save to Account
          </Button>
        </Box>
      </Box>
    );
  };

  const renderPaymentMethodSelection = () => (
    <Box>
      <Typography variant="h6" sx={{ 
        fontWeight: 700,
        color: COLORS.PRIMARY,
        mb: 3,
        textAlign: 'center'
      }}>
        Select Payment Method
      </Typography>
      <Grid container spacing={2}>
        {paymentMethods.map((method) => (
          <Grid item xs={12} sm={6} md={4} key={method.value}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                border: currentPaymentMethod === method.value ? '3px solid' : '2px solid',
                borderColor: currentPaymentMethod === method.value ? COLORS.PRIMARY : theme.palette.divider,
                backgroundColor: currentPaymentMethod === method.value ? theme.palette.action.selected : theme.palette.background.paper,
                borderRadius: 2,
                boxShadow: currentPaymentMethod === method.value ? `0 4px 16px ${COLORS.PRIMARY}30` : theme.shadows[2],
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  borderColor: COLORS.PRIMARY,
                  backgroundColor: theme.palette.action.hover,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 20px ${COLORS.PRIMARY}20`,
                }
              }}
              onClick={() => handlePaymentMethodSelect(method.value)}
            >
              <CardContent sx={{ 
                p: 3, 
                textAlign: 'center',
                minHeight: 160,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Box sx={{ 
                  color: COLORS.PRIMARY,
                  mb: 2,
                  '& svg': { fontSize: 48 }
                }}>
                  {method.icon}
                </Box>
                <Typography variant="h6" sx={{
                  fontWeight: 600,
                  color: COLORS.PRIMARY,
                  mb: 1
                }}>
                  {method.label}
                </Typography>
                <Typography variant="body2" sx={{
                  color: theme.palette.text.secondary,
                  textAlign: 'center'
                }}>
                  {method.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderPaymentDetails = () => {
    switch (currentPaymentMethod) {
      case PaymentMethod.CARD:
        return (
          <Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 700,
              color: COLORS.PRIMARY,
              mb: 3,
              textAlign: 'center'
            }}>
              Enter Card Details
            </Typography>
            <Card sx={{ 
              border: `2px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
              boxShadow: theme.shadows[4]
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <CreditCardIcon sx={{ 
                    fontSize: 48, 
                    color: COLORS.PRIMARY,
                    mb: 1 
                  }} />
                  <Typography variant="h6" sx={{ 
                    color: COLORS.PRIMARY,
                    fontWeight: 700,
                    mb: 1
                  }}>
                    Credit/Debit Card Payment
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: theme.palette.text.secondary,
                    mb: 1
                  }}>
                    Secure card payment processing
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: COLORS.PRIMARY,
                    fontWeight: 700
                  }}>
                    Amount: {formatCurrency(totalAmount)}
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Cardholder Name"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="John Doe"
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: theme.palette.background.paper,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: COLORS.PRIMARY,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: COLORS.PRIMARY,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          '&.Mui-focused': {
                            color: COLORS.PRIMARY,
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Card Number"
                      value={cardNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                        setCardNumber(formatted);
                      }}
                      placeholder="1234 5678 9012 3456"
                      inputProps={{ maxLength: 19 }}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: theme.palette.background.paper,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: COLORS.PRIMARY,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: COLORS.PRIMARY,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          '&.Mui-focused': {
                            color: COLORS.PRIMARY,
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Expiry Date"
                      value={cardExpiry}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        const formatted = value.replace(/(\d{2})(\d{2})/, '$1/$2');
                        setCardExpiry(formatted);
                      }}
                      placeholder="MM/YY"
                      inputProps={{ maxLength: 5 }}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: theme.palette.background.paper,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: COLORS.PRIMARY,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: COLORS.PRIMARY,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          '&.Mui-focused': {
                            color: COLORS.PRIMARY,
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="CVV"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      placeholder="123"
                      inputProps={{ maxLength: 4 }}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: theme.palette.background.paper,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: COLORS.PRIMARY,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: COLORS.PRIMARY,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          '&.Mui-focused': {
                            color: COLORS.PRIMARY,
                          },
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );

      case PaymentMethod.MOBILE_MONEY:
        return (
          <Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 700,
              color: COLORS.PRIMARY,
              mb: 3,
              textAlign: 'center'
            }}>
              Enter Mobile Money Details
            </Typography>
            <Card sx={{ 
              border: `2px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
              boxShadow: theme.shadows[4]
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <MobileIcon sx={{ 
                    fontSize: 48, 
                    color: COLORS.PRIMARY,
                    mb: 1 
                  }} />
                  <Typography variant="h6" sx={{ 
                    color: COLORS.PRIMARY,
                    fontWeight: 700,
                    mb: 1
                  }}>
                    Mobile Money Payment
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: theme.palette.text.secondary,
                    mb: 1
                  }}>
                    Pay securely with your mobile money account
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: COLORS.PRIMARY,
                    fontWeight: 700
                  }}>
                    Amount: {formatCurrency(totalAmount)}
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel sx={{
                        '&.Mui-focused': {
                          color: COLORS.PRIMARY,
                        },
                      }}>Mobile Money Provider</InputLabel>
                      <Select
                        value={mobileProvider}
                        label="Mobile Money Provider"
                        onChange={(e) => setMobileProvider(e.target.value)}
                        sx={{
                          backgroundColor: theme.palette.background.paper,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: COLORS.PRIMARY,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: COLORS.PRIMARY,
                          },
                        }}
                      >
                        <MenuItem value="M-birr">🇪🇹 M-birr</MenuItem>
                        <MenuItem value="Telebirr">🇪🇹 Telebirr</MenuItem>
                        <MenuItem value="CBE Birr">CBE Birr</MenuItem>
                        <MenuItem value="HelloCash">HelloCash</MenuItem>
                        <MenuItem value="M-Pesa">M-Pesa</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+251 9XX XXX XXX"
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: theme.palette.background.paper,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: COLORS.PRIMARY,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: COLORS.PRIMARY,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          '&.Mui-focused': {
                            color: COLORS.PRIMARY,
                          },
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );

      case PaymentMethod.CASH:
        return (
          <Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 700,
              color: COLORS.PRIMARY,
              mb: 3,
              textAlign: 'center'
            }}>
              Cash Payment Instructions
            </Typography>
            <Card sx={{ 
              border: `2px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
              boxShadow: theme.shadows[4]
            }}>
              <CardContent sx={{ 
                textAlign: 'center', 
                py: 6,
                px: 4,
              }}>
                <CashIcon sx={{ 
                  fontSize: 64, 
                  color: COLORS.PRIMARY,
                  mb: 3 
                }} />
                <Typography variant="h5" sx={{ 
                  color: COLORS.PRIMARY,
                  fontWeight: 700,
                  mb: 2
                }}>
                  Cash Payment
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: theme.palette.text.secondary,
                  mb: 3,
                  maxWidth: 400,
                  mx: 'auto'
                }}>
                  Please collect the cash payment from the customer at the counter before completing the order.
                </Typography>
                <Paper sx={{ 
                  p: 3, 
                  backgroundColor: theme.palette.action.hover,
                  borderRadius: 2,
                  border: `1px solid ${COLORS.PRIMARY}`,
                }}>
                  <Typography variant="h4" sx={{ 
                    color: COLORS.PRIMARY,
                    fontWeight: 700
                  }}>
                    {formatCurrency(totalAmount)}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: theme.palette.text.secondary,
                    mt: 1
                  }}>
                    Amount to collect
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  const renderConfirmation = () => (
    <Box>
      <Typography variant="h6" sx={{ 
        fontWeight: 700,
        color: COLORS.PRIMARY,
        mb: 3,
        textAlign: 'center'
      }}>
        Confirm Payment
      </Typography>
      
      <Card sx={{ 
        border: `2px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: theme.shadows[4]
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <PaymentIcon sx={{ 
              fontSize: 48, 
              color: COLORS.PRIMARY,
              mb: 2 
            }} />
            <Typography variant="h5" sx={{ 
              color: COLORS.PRIMARY,
              fontWeight: 700,
              mb: 1
            }}>
              Payment Summary
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
              Payment Method: {paymentMethods.find(m => m.value === currentPaymentMethod)?.label}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1">
                Total Amount:
              </Typography>
              <Typography variant="h5" sx={{ 
                color: COLORS.PRIMARY,
                fontWeight: 700
              }}>
                {formatCurrency(totalAmount)}
              </Typography>
            </Box>
            
            {currentPaymentMethod === PaymentMethod.CARD && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Card ending in: ****{cardNumber.slice(-4)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cardholder: {cardName}
                </Typography>
              </Box>
            )}
            
            {currentPaymentMethod === PaymentMethod.MOBILE_MONEY && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Provider: {mobileProvider}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Phone: {phoneNumber}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  const renderPaymentSuccess = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <CheckIcon sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
      <Typography variant="h4" sx={{ 
        fontWeight: 700,
        color: 'success.main',
        mb: 2 
      }}>
        Payment Successful!
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Your payment has been processed successfully
      </Typography>
      {paymentReference && (
        <Paper sx={{ 
          p: 2, 
          mt: 3, 
          backgroundColor: theme.palette.action.hover,
          borderRadius: 2,
          maxWidth: 400,
          mx: 'auto'
        }}>
          <Typography variant="body2" color="text.secondary">
            Payment Reference:
          </Typography>
          <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
            {paymentReference}
          </Typography>
        </Paper>
      )}
      <Typography variant="body1" sx={{ mt: 3, color: 'text.secondary' }}>
        Redirecting to your order...
      </Typography>
    </Box>
  );

  if (paymentSuccess) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          {renderPaymentSuccess()}
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <StandardButton
              startIcon={<ArrowBackIcon />}
              onClick={handleCancel}
              variant="outlined"
              sx={{ mr: 2 }}
            >
              Back to Shop
            </StandardButton>
            <Typography variant="h4" sx={{ 
              fontWeight: 700,
              color: COLORS.PRIMARY,
              flexGrow: 1,
              textAlign: 'center'
            }}>
              Complete Payment
            </Typography>
            <Box sx={{ width: 120 }} /> {/* Spacer for centering */}
          </Box>
          
          <Typography variant="h5" sx={{ 
            textAlign: 'center',
            color: theme.palette.text.secondary,
            mb: 3
          }}>
            Total: {formatCurrency(totalAmount)}
          </Typography>

          {/* Stepper */}
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Step Content */}
        <Paper sx={{ 
          p: 4, 
          mb: 4,
          borderRadius: 2,
          boxShadow: theme.shadows[4]
        }}>
          {getStepContent(activeStep)}
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          gap: 2,
          flexDirection: isMobile ? 'column-reverse' : 'row'
        }}>
          <StandardButton
            onClick={activeStep === 0 ? handleCancel : handleBack}
            disabled={processing}
            variant="outlined"
            sx={{ 
              minWidth: 120,
              minHeight: themeConstants.touchTargets.minimum
            }}
          >
            {activeStep === 0 ? 'Cancel' : 'Back'}
          </StandardButton>
          
          <StandardButton
            onClick={handleNext}
            variant="contained"
            disabled={processing}
            sx={{ 
              minWidth: 200,
              minHeight: themeConstants.touchTargets.minimum
            }}
          >
            {processing ? 'Processing...' : 
             activeStep === 2 ? `Pay ${formatCurrency(totalAmount)}` : 'Next'}
          </StandardButton>
        </Box>
      </Box>
    </Container>
  );
};

export default PaymentPage;