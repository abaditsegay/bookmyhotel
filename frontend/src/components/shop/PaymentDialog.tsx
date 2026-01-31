import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
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
import { COLORS, addAlpha } from '../../theme/themeColors';
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
    if (amount == null || isNaN(amount)) return 'ETB 0.00';
    return `ETB ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
          <Box sx={{ mt: 2, py: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: (theme) => theme.palette.primary.light + '20',
                mb: 2,
              }}>
                <CreditCardIcon sx={{ 
                  fontSize: 28, 
                  color: (theme) => theme.palette.primary.main,
                }} />
              </Box>
              <Typography variant="h6" sx={{ 
                color: COLORS.TEXT_PRIMARY,
                fontWeight: 600,
                mb: 0.5,
              }}>
                {t('shopPayment.secureCardPayment')}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: 'text.secondary',
                mb: 1,
              }}>
                {t('shopPayment.sslEncrypted')}
              </Typography>
              <Typography variant="h6" sx={{ 
                color: (theme) => theme.palette.primary.main,
                fontWeight: 600,
              }}>
                {t('shopPayment.amountLabel')} {formatCurrency(totalAmount)}
              </Typography>
            </Box>
            
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
                      '&.Mui-focused fieldset': {
                        borderColor: (theme) => theme.palette.primary.main,
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
                      '&.Mui-focused fieldset': {
                        borderColor: (theme) => theme.palette.primary.main,
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
                      '&.Mui-focused fieldset': {
                        borderColor: (theme) => theme.palette.primary.main,
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
                      '&.Mui-focused fieldset': {
                        borderColor: (theme) => theme.palette.primary.main,
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case PaymentMethod.MOBILE_MONEY:
        return (
          <Box sx={{ mt: 2, py: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: (theme) => theme.palette.primary.light + '20',
                mb: 2,
              }}>
                <MobileIcon sx={{ 
                  fontSize: 28, 
                  color: (theme) => theme.palette.primary.main,
                }} />
              </Box>
              <Typography variant="h6" sx={{ 
                color: COLORS.TEXT_PRIMARY,
                fontWeight: 600,
                mb: 0.5,
              }}>
                {t('shopPayment.mobileMoneyPayment')}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: 'text.secondary',
                mb: 1,
              }}>
                {t('shopPayment.paySecurelyMobile')}
              </Typography>
              <Typography variant="h6" sx={{ 
                color: (theme) => theme.palette.primary.main,
                fontWeight: 600,
              }}>
                {t('shopPayment.amountLabel')} {formatCurrency(totalAmount)}
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined">
                  <Select
                    value={mobileProvider}
                    onChange={(e) => setMobileProvider(e.target.value)}
                    displayEmpty
                    sx={{
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: (theme) => theme.palette.primary.main,
                      },
                    }}
                  >
                    <MenuItem value="" disabled>
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
                      '&.Mui-focused fieldset': {
                        borderColor: (theme) => theme.palette.primary.main,
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case PaymentMethod.CASH:
        return (
          <Box sx={{ mt: 2, textAlign: 'center', py: 4 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              color: COLORS.TEXT_PRIMARY,
              mb: 2
            }}>
              Cash Payment
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Please collect cash payment from customer at the counter.
            </Typography>
            <Box sx={{
              display: 'inline-block',
              bgcolor: (theme) => theme.palette.primary.light + '20',
              border: `2px solid ${COLORS.SUCCESS}`,
              borderRadius: 2,
              px: 4,
              py: 2,
            }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Amount to collect
              </Typography>
              <Typography variant="h4" sx={{ 
                color: (theme) => theme.palette.primary.main,
                fontWeight: 700,
              }}>
                {formatCurrency(totalAmount)}
              </Typography>
            </Box>
          </Box>
        );

      case PaymentMethod.PAY_AT_FRONTDESK:
        return (
          <Box sx={{ mt: 2, textAlign: 'center', py: 4 }}>
            <Box sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: (theme) => theme.palette.primary.light + '20',
              mb: 2,
            }}>
              <BankIcon sx={{ 
                fontSize: 28, 
                color: (theme) => theme.palette.primary.main,
              }} />
            </Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              color: COLORS.TEXT_PRIMARY,
              mb: 1
            }}>
              {t('shopPayment.payAtFrontDesk')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {t('shopPayment.customerPaysFrontDesk')}
            </Typography>
            <Box sx={{
              display: 'inline-block',
              bgcolor: (theme) => theme.palette.primary.light + '20',
              border: `2px solid ${COLORS.SUCCESS}`,
              borderRadius: 2,
              px: 4,
              py: 2,
            }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {t('shopPayment.totalAmount')}
              </Typography>
              <Typography variant="h4" sx={{ 
                color: (theme) => theme.palette.primary.main,
                fontWeight: 700,
              }}>
                {formatCurrency(totalAmount)}
              </Typography>
            </Box>
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
            background: `linear-gradient(135deg, ${COLORS.BG_SLATE} 0%, ${COLORS.SLATE_500} 100%)`,
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
            backgroundColor: addAlpha(COLORS.WHITE, 0.15),
            backdropFilter: 'blur(10px)',
            mb: 3,
            border: `3px solid ${addAlpha(COLORS.WHITE, 0.3)}`,
          }}>
            <CheckIcon sx={{ fontSize: 48, color: COLORS.WHITE }} />
          </Box>
          <Typography variant="h4" sx={{ 
            color: COLORS.WHITE,
            fontWeight: 700,
            mb: 2,
            textShadow: `0 2px 4px ${addAlpha(COLORS.BLACK, 0.3)}`,
          }}>
            {t('shopPayment.paymentSuccessful')}
          </Typography>
          <Typography variant="body1" sx={{ 
            color: addAlpha(COLORS.WHITE, 0.9),
            fontSize: '1.2rem',
            mb: 3,
          }}>
            {t('shopPayment.paymentProcessedSuccessfully')}
          </Typography>
          {paymentReference && (
            <Box sx={{ 
              backgroundColor: addAlpha(COLORS.WHITE, 0.1),
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              padding: 2,
              mb: 3,
              border: `1px solid ${addAlpha(COLORS.WHITE, 0.2)}`,
            }}>
              <Typography variant="body2" sx={{ 
                color: addAlpha(COLORS.WHITE, 0.8),
                mb: 0.5 
              }}>
                {t('shopPayment.referenceNumber')}
              </Typography>
              <Typography variant="h6" sx={{ 
                color: COLORS.WHITE,
                fontWeight: 600,
                fontFamily: 'monospace',
              }}>
                {paymentReference}
              </Typography>
            </Box>
          )}
          <Box sx={{ mt: 3 }}>
            <CircularProgress size={32} sx={{ 
              color: addAlpha(COLORS.WHITE, 0.8),
              mb: 2,
            }} />
            <Typography variant="body2" sx={{ 
              color: addAlpha(COLORS.WHITE, 0.9),
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
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: COLORS.BG_DEFAULT,
        },
      }}
    >
      <Box sx={{ 
        bgcolor: COLORS.WHITE, 
        m: 3, 
        borderRadius: 2,
        boxShadow: `0 1px 3px ${addAlpha(COLORS.BLACK, 0.1)}`
      }}>
        {/* Header Section */}
        <Box sx={{ 
          p: 3, 
          borderBottom: `1px solid ${COLORS.BORDER_LIGHT}`,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: (theme) => theme.palette.primary.light + '20',
            border: `2px solid ${COLORS.SUCCESS}`,
          }}>
            <PaymentIcon sx={{ color: (theme) => theme.palette.primary.main, fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ 
              fontWeight: 700,
              color: COLORS.TEXT_PRIMARY,
              mb: 0.5,
            }}>
              {t('shopPayment.completePayment')}
            </Typography>
            <Typography variant="h6" sx={{ 
              color: (theme) => theme.palette.primary.main,
              fontWeight: 600,
            }}>
              {formatCurrency(totalAmount)}
            </Typography>
          </Box>
        </Box>

        {/* Content Section */}
        <Box sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Payment Method Selection */}
          <Typography variant="h6" sx={{ 
            mb: 3,
            color: COLORS.TEXT_PRIMARY,
            fontWeight: 600,
            borderLeft: `4px solid ${COLORS.SUCCESS}`,
            pl: 2
          }}>
            {t('shopPayment.selectPaymentMethod')}
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {paymentMethods.map((method) => (
              <Grid item xs={12} sm={4} key={method.value}>
                <Card 
                  onClick={() => handlePaymentMethodSelect(method.value)}
                  sx={{
                    cursor: 'pointer',
                    border: currentPaymentMethod === method.value ? `2px solid ${COLORS.SUCCESS}` : `1px solid ${COLORS.BORDER_LIGHT}`,
                    bgcolor: currentPaymentMethod === method.value ? addAlpha(COLORS.SUCCESS, 0.1) : COLORS.WHITE,
                    boxShadow: 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: currentPaymentMethod === method.value ? COLORS.SUCCESS : COLORS.SLATE_400,
                      bgcolor: currentPaymentMethod === method.value ? addAlpha(COLORS.SUCCESS, 0.1) : COLORS.BG_DEFAULT,
                    },
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box sx={{ 
                        color: currentPaymentMethod === method.value ? COLORS.SUCCESS : COLORS.TEXT_SECONDARY,
                        fontSize: 36,
                        mb: 1,
                        display: 'flex',
                        justifyContent: 'center',
                      }}>
                        {method.icon}
                      </Box>
                      <Typography variant="subtitle2" sx={{ 
                        fontWeight: 600,
                        color: currentPaymentMethod === method.value ? COLORS.SUCCESS : COLORS.TEXT_PRIMARY,
                        mb: 0.5,
                      }}>
                        {method.label}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: 'text.secondary',
                        display: 'block',
                      }}>
                        {method.description}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Payment Details */}
          <Box sx={{ 
            minHeight: 300,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start'
          }}>
            {renderPaymentDetails()}
          </Box>
        </Box>

        {/* Footer Actions */}
        <Box sx={{ 
          p: 3, 
          borderTop: `1px solid ${COLORS.BORDER_LIGHT}`,
          bgcolor: COLORS.BG_LIGHT,
          display: 'flex',
          gap: 2,
          justifyContent: 'flex-end'
        }}>
          <StandardButton 
            onClick={onClose} 
            disabled={processing}
            variant="outlined"
            sx={{ 
              minWidth: 120,
              textTransform: 'none',
              borderColor: COLORS.BORDER_LIGHT,
              color: COLORS.TEXT_SECONDARY,
              '&:hover': {
                borderColor: COLORS.SLATE_400,
                bgcolor: COLORS.BG_LIGHT
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
            sx={{ 
              minWidth: 180,
              textTransform: 'none',
              bgcolor: (theme) => theme.palette.primary.main,
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
              },
              '&:disabled': {
                bgcolor: COLORS.BG_WARNING_LIGHT,
                color: addAlpha(COLORS.WHITE, 0.7),
              }
            }}
          >
            {processing ? t('shopPayment.processing') : `${t('shopPayment.pay')} ${formatCurrency(totalAmount)}`}
          </StandardButton>
        </Box>
      </Box>
    </Dialog>
  );
};

export default PaymentDialog;
