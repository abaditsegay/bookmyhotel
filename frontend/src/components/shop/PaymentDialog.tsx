import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<PaymentMethod>(
    selectedPaymentMethod || PaymentMethod.CASH
  );
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Card payment fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Mobile money fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mobileProvider, setMobileProvider] = useState('');

  const paymentMethods: PaymentMethodOption[] = [
    {
      value: PaymentMethod.CASH,
      label: 'Cash Payment',
      icon: <CashIcon />,
      description: 'Pay with cash at the counter',
      color: '#4caf50',
    },
    {
      value: PaymentMethod.CARD,
      label: 'Credit/Debit Card',
      icon: <CreditCardIcon />,
      description: 'Pay with credit or debit card',
      color: '#2196f3',
    },
    {
      value: PaymentMethod.MOBILE_MONEY,
      label: 'Mobile Money',
      icon: <MobileIcon />,
      description: 'Pay with mobile money services',
      color: '#ff9800',
    },
    {
      value: PaymentMethod.PAY_AT_FRONTDESK,
      label: 'Pay at Front Desk',
      icon: <BankIcon />,
      description: 'Complete payment at hotel front desk',
      color: '#9c27b0',
    },
  ];

  const formatCurrency = (amount: number) => {
    return `ETB ${(amount * 55).toFixed(0)} ($${amount.toFixed(2)})`;
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setCurrentPaymentMethod(method);
    setError(null);
    setPaymentSuccess(false);
  };

  const validatePaymentDetails = (): boolean => {
    setError(null);

    switch (currentPaymentMethod) {
      case PaymentMethod.CARD:
        if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim() || !cardName.trim()) {
          setError('Please fill in all card details');
          return false;
        }
        if (cardNumber.replace(/\s/g, '').length < 16) {
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

  const simulatePaymentProcessing = async (): Promise<string> => {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate payment success/failure (90% success rate)
    if (Math.random() < 0.9) {
      // Generate mock payment reference
      const timestamp = Date.now().toString().slice(-6);
      const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
      return `PAY-${timestamp}-${randomSuffix}`;
    } else {
      throw new Error('Payment failed. Please try again.');
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
        // For card and mobile money, simulate processing
        reference = await simulatePaymentProcessing();
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
            <Typography variant="subtitle2" gutterBottom>Card Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Cardholder Name"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
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
                />
              </Grid>
            </Grid>
          </Box>
        );

      case PaymentMethod.MOBILE_MONEY:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Mobile Money Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Mobile Money Provider</InputLabel>
                  <Select
                    value={mobileProvider}
                    label="Mobile Money Provider"
                    onChange={(e) => setMobileProvider(e.target.value)}
                  >
                    <MenuItem value="M-Pesa">M-Pesa</MenuItem>
                    <MenuItem value="Telebirr">Telebirr</MenuItem>
                    <MenuItem value="CBE Birr">CBE Birr</MenuItem>
                    <MenuItem value="HelloCash">HelloCash</MenuItem>
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
                />
              </Grid>
            </Grid>
          </Box>
        );

      case PaymentMethod.CASH:
        return (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Please collect cash payment from customer at the counter.
            </Typography>
            <Typography variant="h6" sx={{ mt: 2, color: 'success.main' }}>
              Amount to collect: {formatCurrency(totalAmount)}
            </Typography>
          </Box>
        );

      case PaymentMethod.PAY_AT_FRONTDESK:
        return (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Customer will complete payment at the front desk.
            </Typography>
            <Typography variant="h6" sx={{ mt: 2, color: 'info.main' }}>
              Amount: {formatCurrency(totalAmount)}
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  if (paymentSuccess) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {paymentMethods.map((method) => (
            <Grid item xs={12} sm={6} key={method.value}>
              <Card 
                sx={{ 
                  border: currentPaymentMethod === method.value ? 2 : 1,
                  borderColor: currentPaymentMethod === method.value ? method.color : 'divider',
                  backgroundColor: currentPaymentMethod === method.value ? `${method.color}10` : 'background.paper'
                }}
              >
                <CardActionArea onClick={() => handlePaymentMethodSelect(method.value)}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Box sx={{ color: method.color, mb: 1 }}>
                      {method.icon}
                    </Box>
                    <Typography variant="subtitle2" gutterBottom>
                      {method.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
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
        {renderPaymentDetails()}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={processing}>
          Cancel
        </Button>
        <Button
          onClick={handleProcessPayment}
          variant="contained"
          disabled={processing}
          startIcon={processing ? <CircularProgress size={20} /> : null}
        >
          {processing ? 'Processing...' : `Pay ${formatCurrency(totalAmount)}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;
