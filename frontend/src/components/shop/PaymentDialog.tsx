import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  TextField,
  Divider,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  Phone as MobileIcon,
  Money as CashIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { PaymentMethod } from '../../types/shop';
import { themeConstants } from '../../theme/theme';
import { StandardButton } from '../common';
import { useMockPayment, MockPaymentRequest } from '../../services/mockPaymentGateway';

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onPaymentComplete: (paymentMethod: PaymentMethod, paymentReference?: string) => void;
  totalAmount: number;
  selectedPaymentMethod?: PaymentMethod;
}

interface PaymentMethodOption {
  value: PaymentMethod;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  open,
  onClose,
  onPaymentComplete,
  totalAmount,
  selectedPaymentMethod,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const mockPayment = useMockPayment();
  
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<PaymentMethod>(
    selectedPaymentMethod || PaymentMethod.CASH
  );
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Card payment fields with pre-filled test data
  const [cardNumber, setCardNumber] = useState('4111 1111 1111 1111');
  const [cardExpiry, setCardExpiry] = useState('12/27');
  const [cardCvv, setCardCvv] = useState('123');
  const [cardName, setCardName] = useState('John Doe');

  // Mobile money fields with pre-filled test data
  const [phoneNumber, setPhoneNumber] = useState('+251911123456');
  const [mobileProvider, setMobileProvider] = useState('M-Pesa');

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
    },
    {
      value: PaymentMethod.MOBILE,
      label: 'Mobile Payment',
      icon: <PaymentIcon />,
      color: theme.palette.primary.dark,
      description: 'Mobile payment service'
    },
    {
      value: PaymentMethod.CREDIT_CARD,
      label: 'Credit Card',
      icon: <CreditCardIcon />,
      color: theme.palette.secondary.main,
      description: 'Credit card payment'
    },
    {
      value: PaymentMethod.ROOM_CHARGE,
      label: 'Room Charge',
      icon: <BankIcon />,
      color: theme.palette.warning.main,
      description: 'Charge to room account'
    }
  ];  const formatCurrency = (amount: number) => {
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
      
      // Auto-complete after a brief delay
      setTimeout(() => {
        onPaymentComplete(currentPaymentMethod, reference);
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const renderPaymentDetails = () => {
    switch (currentPaymentMethod) {
      case PaymentMethod.CARD:
        return (
          <Box sx={{ mt: 2 }}>
            <Card sx={{ 
              border: `2px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
              minHeight: 420,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: theme.shadows[2]
            }}>
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
                    color: theme.palette.success.main,
                    fontWeight: 700,
                    mb: 0.5
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
                    color: theme.palette.success.main,
                    fontWeight: 700
                  }}>
                    Amount: {formatCurrency(totalAmount)}
                  </Typography>
                </Box>
                
                <Box sx={{ flexGrow: 1 }}>
                  <Grid container spacing={2}>
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
                            borderColor: theme.palette.success.main,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.success.main,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          '&.Mui-focused': {
                            color: theme.palette.success.main,
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
                            borderColor: theme.palette.success.main,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.success.main,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          '&.Mui-focused': {
                            color: theme.palette.success.main,
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
                            borderColor: theme.palette.success.main,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.success.main,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          '&.Mui-focused': {
                            color: theme.palette.success.main,
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
                            borderColor: theme.palette.success.main,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.success.main,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          '&.Mui-focused': {
                            color: theme.palette.success.main,
                          },
                        },
                      }}
                    />
                  </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      case PaymentMethod.MOBILE_MONEY:
        return (
          <Box sx={{ mt: 2 }}>
            <Card sx={{ 
              border: `2px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
              minHeight: 420,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: theme.shadows[2]
            }}>
              <CardContent sx={{ 
                py: 3, 
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <MobileIcon sx={{ 
                    fontSize: 40, 
                    color: theme.palette.success.main,
                    mb: 1 
                  }} />
                  <Typography variant="h6" sx={{ 
                    color: theme.palette.success.main,
                    fontWeight: 700,
                    mb: 0.5
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
                    color: theme.palette.success.main,
                    fontWeight: 700
                  }}>
                    Amount: {formatCurrency(totalAmount)}
                  </Typography>
                </Box>
                
                <Box sx={{ flexGrow: 1 }}>
                  <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel sx={{
                        '&.Mui-focused': {
                          color: theme.palette.success.main,
                        },
                      }}>Mobile Money Provider</InputLabel>
                      <Select
                        value={mobileProvider}
                        label="Mobile Money Provider"
                        onChange={(e) => setMobileProvider(e.target.value)}
                        sx={{
                          backgroundColor: theme.palette.background.paper,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.success.main,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.success.main,
                          },
                          '& .MuiSelect-select': {
                            minHeight: isMobile ? themeConstants.touchTargets.minimum : 'auto'
                          }
                        }}
                      >
                        <MenuItem value="M-birr">
                          🇪🇹 M-birr
                        </MenuItem>
                        <MenuItem value="Telebirr">
                          🇪🇹 Telebirr
                        </MenuItem>
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
                            borderColor: theme.palette.success.main,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.success.main,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          '&.Mui-focused': {
                            color: theme.palette.success.main,
                          },
                        },
                      }}
                    />
                  </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      case PaymentMethod.CASH:
        return (
          <Box sx={{ mt: 2 }}>
            <Card sx={{ 
              border: `2px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
              minHeight: 420,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: theme.shadows[2]
            }}>
              <CardContent sx={{ 
                textAlign: 'center', 
                py: 3,
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <CashIcon sx={{ 
                  fontSize: 48, 
                  color: theme.palette.success.main,
                  mb: 2 
                }} />
                <Typography variant="h6" sx={{ 
                  color: theme.palette.success.main,
                  fontWeight: 700,
                  mb: 1
                }}>
                  Cash Payment
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: theme.palette.text.secondary,
                  mb: 2
                }}>
                  Please collect cash payment from customer at the counter.
                </Typography>
                <Typography variant="h5" sx={{ 
                  color: theme.palette.success.main,
                  fontWeight: 700
                }}>
                  Amount to collect: {formatCurrency(totalAmount)}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );

      case PaymentMethod.PAY_AT_FRONTDESK:
        return (
          <Box sx={{ mt: 2 }}>
            <Card sx={{ 
              border: `2px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
              minHeight: 420,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: theme.shadows[2]
            }}>
              <CardContent sx={{ 
                textAlign: 'center', 
                py: 3,
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <BankIcon sx={{ 
                  fontSize: 48, 
                  color: theme.palette.success.main,
                  mb: 2 
                }} />
                <Typography variant="h6" sx={{ 
                  color: theme.palette.success.main,
                  fontWeight: 700,
                  mb: 1
                }}>
                  Pay at Front Desk
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: theme.palette.text.secondary,
                  mb: 2
                }}>
                  Customer will complete payment at the front desk.
                </Typography>
                <Typography variant="h5" sx={{ 
                  color: theme.palette.success.main,
                  fontWeight: 700
                }}>
                  Amount: {formatCurrency(totalAmount)}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  if (paymentSuccess) {
    return (
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
        sx={{
          '& .MuiDialog-paper': {
            margin: isMobile ? 0 : theme.spacing(2),
            borderRadius: isMobile ? 0 : theme.shape.borderRadius,
          }
        }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Payment Successful!
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Payment has been processed successfully
          </Typography>
          {paymentReference && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              Reference: {paymentReference}
            </Typography>
          )}
          <Box sx={{ mt: 3 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Completing your order...
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      fullScreen={isMobile}
      sx={{
        '& .MuiDialog-paper': {
          margin: isMobile ? 0 : theme.spacing(2),
          borderRadius: isMobile ? 0 : theme.shape.borderRadius,
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PaymentIcon color="primary" />
          <Typography variant="h6">
            Complete Payment - {formatCurrency(totalAmount)}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Payment Method Selection */}
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          Select Payment Method
        </Typography>
        
        <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mb: { xs: 2, md: 3 } }}>
          {paymentMethods.map((method) => (
            <Grid item xs={12} sm={6} key={method.value}>
              <Card 
                sx={{ 
                  border: currentPaymentMethod === method.value ? 2 : 1,
                  borderColor: currentPaymentMethod === method.value 
                    ? theme.palette.success.main 
                    : theme.palette.divider,
                  backgroundColor: currentPaymentMethod === method.value 
                    ? theme.palette.action.selected
                    : theme.palette.background.paper,
                  minHeight: isMobile ? themeConstants.touchTargets.large : 'auto',
                  transition: 'all 0.2s ease',
                  boxShadow: currentPaymentMethod === method.value 
                    ? `0 4px 12px ${theme.palette.success.main}25`
                    : theme.shadows[2],
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                    borderColor: theme.palette.success.main,
                    boxShadow: `0 4px 12px ${theme.palette.success.main}25`,
                  }
                }}
              >
                <CardActionArea 
                  onClick={() => handlePaymentMethodSelect(method.value)}
                  sx={{
                    minHeight: isMobile ? themeConstants.touchTargets.large : 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CardContent sx={{ 
                    textAlign: 'center', 
                    py: { xs: 2.5, md: 2 },
                    px: { xs: 2, md: 2 }
                  }}>
                    <Box sx={{ color: theme.palette.success.main, mb: 1 }}>
                      {method.icon}
                    </Box>
                    <Typography variant="subtitle2" sx={{ 
                      fontWeight: 600,
                      color: theme.palette.text.primary
                    }} gutterBottom>
                      {method.label}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: theme.palette.text.secondary 
                    }}>
                      {method.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Payment Details */}
        <Box sx={{ 
          minHeight: 520, // Fixed height to prevent jumping
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start'
        }}>
          {renderPaymentDetails()}
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: { xs: 2, md: 3 },
        gap: { xs: 1, md: 2 },
        flexDirection: isMobile ? 'column-reverse' : 'row'
      }}>
        <StandardButton 
          onClick={onClose} 
          disabled={processing}
          variant="outlined"
          fullWidth={isMobile}
          sx={{ 
            minHeight: themeConstants.touchTargets.minimum,
            order: isMobile ? 2 : 1
          }}
        >
          Cancel
        </StandardButton>
        <StandardButton
          onClick={handleProcessPayment}
          variant="contained"
          disabled={processing}
          startIcon={processing ? <CircularProgress size={20} /> : null}
          fullWidth={isMobile}
          sx={{ 
            minHeight: themeConstants.touchTargets.minimum,
            order: isMobile ? 1 : 2
          }}
        >
          {processing ? 'Processing...' : `Pay ${formatCurrency(totalAmount)}`}
        </StandardButton>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;
