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
  TextField,
  Divider,
  CircularProgress,
  Alert,
  FormControl,
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
import { useTranslation } from 'react-i18next';
import { PaymentMethod } from '../../types/shop';
import { COLORS } from '../../theme/themeColors';
import { StandardButton } from '../common';
import { useMockPayment, MockPaymentRequest } from '../../services/mockPaymentGateway';

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onPaymentComplete: (paymentMethod: PaymentMethod, paymentReference?: string) => void;
  totalAmount: number;
  selectedPaymentMethod?: PaymentMethod;
  showSuccess?: boolean; // External control for success state
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
  showSuccess = false, // Default to false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const mockPayment = useMockPayment();
  const { t } = useTranslation();
  
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<PaymentMethod>(
    selectedPaymentMethod || PaymentMethod.CASH
  );
  const [processing, setProcessing] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  // Note: paymentSuccess is now controlled externally via showSuccess prop

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
      label: t('shopPayment.cashPayment'),
      icon: <CashIcon />,
      color: COLORS.PRIMARY_HOVER,
      description: t('shopPayment.cashDescription')
    },
    {
      value: PaymentMethod.CARD,
      label: t('shopPayment.creditDebitCard'),
      icon: <CreditCardIcon />,
      color: COLORS.PRIMARY,
      description: t('shopPayment.cardDescription')
    },
    {
      value: PaymentMethod.MOBILE_MONEY,
      label: t('shopPayment.mobileMoney'),
      icon: <MobileIcon />,
      color: COLORS.SECONDARY,
      description: t('shopPayment.mobileDescription')
    }
  ];  const formatCurrency = (amount: number) => {
    if (amount == null || isNaN(amount)) return 'ETB 0';
    return `ETB ${amount.toFixed(0)}`;
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
          setError(t('shopPayment.fillAllCardDetails'));
          return false;
        }
        if (cardNumber.replace(/[\s-]/g, '').length < 16) {
          setError(t('shopPayment.enterValidCardNumber'));
          return false;
        }
        break;

      case PaymentMethod.MOBILE_MONEY:
        if (!phoneNumber.trim() || !mobileProvider.trim()) {
          setError(t('shopPayment.fillMobileDetails'));
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
        // Don't set success here - let parent handle it after order creation
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
          throw new Error(paymentResult.message || t('shopPayment.paymentProcessingFailed'));
        }
        
        reference = paymentResult.paymentReference;
        // Don't set success here - let parent handle it after order creation
      }

      setPaymentReference(reference);
      
      // Auto-complete after a brief delay
      setTimeout(() => {
        onPaymentComplete(currentPaymentMethod, reference);
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : t('shopPayment.paymentProcessingFailed'));
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
              background: COLORS.CARD_HOVER,
              borderRadius: 3,
              minHeight: 420,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: `0 8px 32px ${COLORS.PRIMARY}15`,
              border: `1px solid ${COLORS.CARD_BORDER}`,
            }}>
              <CardContent sx={{ 
                py: 3, 
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Box sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    mb: 2,
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                  }}>
                    <CreditCardIcon sx={{ 
                      fontSize: 32, 
                      color: '#1e40af',
                    }} />
                  </Box>
                  <Typography variant="h5" sx={{ 
                    color: '#1e40af',
                    fontWeight: 700,
                    mb: 0.5,
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}>
                    {t('shopPayment.secureCardPayment')}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#1e40af',
                    mb: 2,
                    opacity: 0.8,
                  }}>
                    {t('shopPayment.sslEncrypted')}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: '#1e40af',
                    fontWeight: 700,
                    fontSize: '1.4rem',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}>
                    {t('shopPayment.amountLabel')} {formatCurrency(totalAmount)}
                  </Typography>
                </Box>
                
                <Box sx={{ flexGrow: 1 }}>
                  <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder={t('shopPayment.cardholderNamePlaceholder')}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: 2,
                          '& fieldset': {
                            borderColor: 'rgba(30, 64, 175, 0.3)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(30, 64, 175, 0.6)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#1e40af',
                            borderWidth: 2,
                          },
                        },
                        '& .MuiOutlinedInput-input': {
                          color: '#1e40af',
                          fontWeight: 500,
                          '&::placeholder': {
                            color: 'rgba(30, 64, 175, 0.6)',
                            opacity: 1,
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      value={cardNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                        setCardNumber(formatted);
                      }}
                      placeholder={t('shopPayment.cardNumberPlaceholder')}
                      inputProps={{ maxLength: 19 }}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: 2,
                          '& fieldset': {
                            borderColor: 'rgba(30, 64, 175, 0.3)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(30, 64, 175, 0.6)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#1e40af',
                            borderWidth: 2,
                          },
                        },
                        '& .MuiOutlinedInput-input': {
                          color: '#1e40af',
                          fontWeight: 500,
                          '&::placeholder': {
                            color: 'rgba(30, 64, 175, 0.6)',
                            opacity: 1,
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      value={cardExpiry}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        const formatted = value.replace(/(\d{2})(\d{2})/, '$1/$2');
                        setCardExpiry(formatted);
                      }}
                      placeholder={t('shopPayment.expiryPlaceholder')}
                      inputProps={{ maxLength: 5 }}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: 2,
                          '& fieldset': {
                            borderColor: 'rgba(30, 64, 175, 0.3)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(30, 64, 175, 0.6)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#1e40af',
                            borderWidth: 2,
                          },
                        },
                        '& .MuiOutlinedInput-input': {
                          color: '#1e40af',
                          fontWeight: 500,
                          '&::placeholder': {
                            color: 'rgba(30, 64, 175, 0.6)',
                            opacity: 1,
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      placeholder={t('shopPayment.cvvPlaceholder')}
                      inputProps={{ maxLength: 4 }}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: 2,
                          '& fieldset': {
                            borderColor: 'rgba(30, 64, 175, 0.3)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(30, 64, 175, 0.6)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#1e40af',
                            borderWidth: 2,
                          },
                        },
                        '& .MuiOutlinedInput-input': {
                          color: '#1e40af',
                          fontWeight: 500,
                          '&::placeholder': {
                            color: 'rgba(30, 64, 175, 0.6)',
                            opacity: 1,
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
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              borderRadius: 3,
              minHeight: 420,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 32px rgba(30, 64, 175, 0.2)',
              border: '1px solid rgba(30, 64, 175, 0.3)',
            }}>
              <CardContent sx={{ 
                py: 3, 
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Box sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(30, 64, 175, 0.1)',
                    backdropFilter: 'blur(10px)',
                    mb: 2,
                    border: '2px solid rgba(30, 64, 175, 0.3)',
                  }}>
                    <MobileIcon sx={{ 
                      fontSize: 32, 
                      color: '#1e40af',
                    }} />
                  </Box>
                  <Typography variant="h5" sx={{ 
                    color: '#1e40af',
                    fontWeight: 700,
                    mb: 0.5,
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}>
                    {t('shopPayment.mobileMoneyPayment')}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: 'rgba(30, 64, 175, 0.8)',
                    mb: 2
                  }}>
                    {t('shopPayment.paySecurelyMobile')}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: '#1e40af',
                    fontWeight: 700,
                    fontSize: '1.4rem',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}>
                    {t('shopPayment.amountLabel')} {formatCurrency(totalAmount)}
                  </Typography>
                </Box>
                
                <Box sx={{ flexGrow: 1 }}>
                  <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth variant="outlined">
                      <Select
                        value={mobileProvider}
                        onChange={(e) => setMobileProvider(e.target.value)}
                        displayEmpty
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: 2,
                          '& fieldset': {
                            borderColor: 'rgba(30, 64, 175, 0.3)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(30, 64, 175, 0.6)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#1e40af',
                            borderWidth: 2,
                          },
                          '& .MuiSelect-select': {
                            minHeight: isMobile ? '44px' : 'auto',
                            color: '#1e40af',
                            fontWeight: 500,
                          },
                          '& .MuiSelect-icon': {
                            color: '#1e40af',
                          }
                        }}
                      >
                        <MenuItem value="" disabled sx={{ color: 'rgba(30, 64, 175, 0.5)' }}>
                          {t('shopPayment.selectMobileProvider')}
                        </MenuItem>
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
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder={t('shopPayment.phoneNumberPlaceholder')}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: 2,
                          '& fieldset': {
                            borderColor: 'rgba(30, 64, 175, 0.3)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(30, 64, 175, 0.6)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#1e40af',
                            borderWidth: 2,
                          },
                        },
                        '& .MuiOutlinedInput-input': {
                          color: '#1e40af',
                          fontWeight: 500,
                          '&::placeholder': {
                            color: 'rgba(30, 64, 175, 0.6)',
                            opacity: 1,
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
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              borderRadius: 3,
              minHeight: 420,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 32px rgba(30, 64, 175, 0.2)',
              border: '1px solid rgba(30, 64, 175, 0.3)',
            }}>
              <CardContent sx={{ 
                textAlign: 'center', 
                py: 4,
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Box sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(30, 64, 175, 0.15)',
                  backdropFilter: 'blur(10px)',
                  mb: 3,
                  border: '2px solid rgba(30, 64, 175, 0.3)',
                }}>
                  <CashIcon sx={{ 
                    fontSize: 40, 
                    color: '#1e40af',
                  }} />
                </Box>
                <Typography variant="h5" sx={{ 
                  color: '#1e40af',
                  fontWeight: 700,
                  mb: 2,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}>
                  {t('shopPayment.cashPayment')}
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: 'rgba(30, 64, 175, 0.8)',
                  mb: 3,
                  fontSize: '1.1rem',
                }}>
                  {t('shopPayment.collectCashPayment')}
                </Typography>
                <Box sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  padding: 3,
                  border: '1px solid rgba(30, 64, 175, 0.2)',
                }}>
                  <Typography variant="h4" sx={{ 
                    color: '#1e40af',
                    fontWeight: 700,
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}>
                    {formatCurrency(totalAmount)}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: 'rgba(30, 64, 175, 0.8)',
                    mt: 1,
                  }}>
                    {t('shopPayment.amountToCollect')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      case PaymentMethod.PAY_AT_FRONTDESK:
        return (
          <Box sx={{ mt: 2 }}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              borderRadius: 3,
              minHeight: 420,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 32px rgba(30, 64, 175, 0.2)',
              border: '1px solid rgba(30, 64, 175, 0.3)',
            }}>
              <CardContent sx={{ 
                textAlign: 'center', 
                py: 4,
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Box sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(30, 64, 175, 0.15)',
                  backdropFilter: 'blur(10px)',
                  mb: 3,
                  border: '2px solid rgba(30, 64, 175, 0.3)',
                }}>
                  <BankIcon sx={{ 
                    fontSize: 40, 
                    color: '#1e40af',
                  }} />
                </Box>
                <Typography variant="h5" sx={{ 
                  color: '#1e40af',
                  fontWeight: 700,
                  mb: 2,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}>
                  {t('shopPayment.payAtFrontDesk')}
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: 'rgba(30, 64, 175, 0.8)',
                  mb: 3,
                  fontSize: '1.1rem',
                }}>
                  {t('shopPayment.customerPaysFrontDesk')}
                </Typography>
                <Box sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  padding: 3,
                  border: '1px solid rgba(30, 64, 175, 0.2)',
                }}>
                  <Typography variant="h4" sx={{ 
                    color: '#1e40af',
                    fontWeight: 700,
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}>
                    {formatCurrency(totalAmount)}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: 'rgba(30, 64, 175, 0.8)',
                    mt: 1,
                  }}>
                    {t('shopPayment.totalAmount')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  if (showSuccess || paymentSuccess) {
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
            borderRadius: isMobile ? 0 : 3,
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          }
        }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 6 }}>
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 100,
            height: 100,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            mb: 3,
            border: '3px solid rgba(255, 255, 255, 0.3)',
          }}>
            <CheckIcon sx={{ fontSize: 48, color: '#ffffff' }} />
          </Box>
          <Typography variant="h4" sx={{ 
            color: '#ffffff',
            fontWeight: 700,
            mb: 2,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}>
            {t('shopPayment.paymentSuccessful')}
          </Typography>
          <Typography variant="body1" sx={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1.2rem',
            mb: 3,
          }}>
            {t('shopPayment.paymentProcessedSuccessfully')}
          </Typography>
          {paymentReference && (
            <Box sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              padding: 2,
              mb: 3,
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}>
              <Typography variant="body2" sx={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                mb: 0.5 
              }}>
                {t('shopPayment.referenceNumber')}
              </Typography>
              <Typography variant="h6" sx={{ 
                color: '#ffffff',
                fontWeight: 600,
                fontFamily: 'monospace',
              }}>
                {paymentReference}
              </Typography>
            </Box>
          )}
          <Box sx={{ mt: 3 }}>
            <CircularProgress size={32} sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              mb: 2,
            }} />
            <Typography variant="body2" sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '1rem',
            }}>
              {t('shopPayment.completingYourOrder')}
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
          borderRadius: isMobile ? 0 : 3,
          overflow: 'hidden',
        }
      }}
    >
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        color: '#ffffff',
        py: 3,
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
        }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
          }}>
            <PaymentIcon sx={{ color: '#ffffff', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ 
              fontWeight: 700,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              mb: 0.5,
            }}>
              {t('shopPayment.completePayment')}
            </Typography>
            <Typography variant="h6" sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 600,
            }}>
              {formatCurrency(totalAmount)}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Payment Method Selection */}
        <Typography variant="h6" sx={{ 
          mt: 2,
          mb: 2,
          color: '#1e3a8a',
          fontWeight: 700,
        }}>
          {t('shopPayment.selectPaymentMethod')}
        </Typography>
        
        <FormControl fullWidth sx={{ mb: { xs: 2, md: 3 } }}>
          <Select
            value={currentPaymentMethod}
            onChange={(e) => handlePaymentMethodSelect(e.target.value as PaymentMethod)}
            displayEmpty
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
              '& fieldset': {
                borderColor: 'rgba(30, 58, 138, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: '#3b82f6',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1e3a8a',
                borderWidth: 2,
              },
              '& .MuiSelect-select': {
                minHeight: isMobile ? '44px' : 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                color: '#1e3a8a',
                fontWeight: 500,
              },
              '& .MuiSelect-icon': {
                color: '#1e3a8a',
              }
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: 2,
                  mt: 1,
                  boxShadow: '0 8px 32px rgba(30, 58, 138, 0.15)',
                  border: '1px solid rgba(30, 58, 138, 0.1)',
                }
              }
            }}
          >
            <MenuItem value="" disabled sx={{ color: 'rgba(30, 58, 138, 0.5)' }}>
              {t('shopPayment.selectPaymentMethod')}
            </MenuItem>
            {paymentMethods.map((method) => (
              <MenuItem 
                key={method.value} 
                value={method.value}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  py: 1.5,
                  px: 2,
                  minHeight: isMobile ? '44px' : 'auto',
                  '&:hover': {
                    backgroundColor: 'rgba(30, 58, 138, 0.08)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(30, 58, 138, 0.12)',
                    '&:hover': {
                      backgroundColor: 'rgba(30, 58, 138, 0.16)',
                    }
                  }
                }}
              >
                <Box sx={{ 
                  color: '#3b82f6',
                  fontSize: 24,
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  {method.icon}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" sx={{ 
                    fontWeight: 600,
                    color: '#1e3a8a',
                    lineHeight: 1.2,
                  }}>
                    {method.label}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: theme.palette.text.secondary,
                    display: 'block',
                    lineHeight: 1.1,
                    mt: 0.25,
                  }}>
                    {method.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Divider sx={{ 
          my: 2,
          background: 'linear-gradient(90deg, transparent, rgba(30, 58, 138, 0.3), transparent)',
          height: 2,
        }} />

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
        flexDirection: isMobile ? 'column-reverse' : 'row',
        backgroundColor: 'rgba(30, 58, 138, 0.02)',
        borderTop: '1px solid rgba(30, 58, 138, 0.1)',
      }}>
        <StandardButton 
          onClick={onClose} 
          disabled={processing}
          variant="outlined"
          fullWidth={isMobile}
          sx={{ 
            minHeight: '44px',
            order: isMobile ? 2 : 1,
            borderColor: '#3b82f6',
            color: '#1e3a8a',
            '&:hover': {
              backgroundColor: 'rgba(30, 58, 138, 0.04)',
              borderColor: '#1e3a8a',
            }
          }}
        >
          {t('shopPayment.cancel')}
        </StandardButton>
        <StandardButton
          onClick={handleProcessPayment}
          variant="contained"
          disabled={processing}
          startIcon={processing ? <CircularProgress size={20} sx={{ color: 'white' }} /> : null}
          fullWidth={isMobile}
          sx={{ 
            minHeight: '44px',
            order: isMobile ? 1 : 2,
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            boxShadow: '0 4px 15px rgba(30, 58, 138, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
              boxShadow: '0 6px 20px rgba(30, 58, 138, 0.5)',
            },
            '&:disabled': {
              background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.5) 0%, rgba(59, 130, 246, 0.5) 100%)',
              color: 'rgba(255, 255, 255, 0.7)',
            }
          }}
        >
          {processing ? t('shopPayment.processing') : `${t('shopPayment.pay')} ${formatCurrency(totalAmount)}`}
        </StandardButton>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;
