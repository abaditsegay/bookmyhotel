import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  Phone as PhoneIcon,
  AccountBalance as MbirrIcon,
  PhonelinkRing as TelebirrIcon,
  QrCode as QrCodeIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import TokenManager from '../utils/tokenManager';

interface EthiopianPaymentFormProps {
  amount: number;
  bookingReference: string;
  customerName?: string;
  customerEmail?: string;
  onPaymentInitiated?: (response: any) => void;
  onError?: (error: string) => void;
}

interface PaymentResponse {
  success: boolean;
  transactionId: string;
  paymentUrl?: string;
  qrCode?: string;
  expiresAt?: string;
  instructions?: string;
  errorMessage?: string;
}

const EthiopianPaymentForm: React.FC<EthiopianPaymentFormProps> = ({
  amount,
  bookingReference,
  customerName,
  customerEmail,
  onPaymentInitiated,
  onError
}) => {
  const [provider, setProvider] = useState<'MBIRR' | 'TELEBIRR'>('MBIRR');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);
  const [error, setError] = useState('');

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    let digits = value.replace(/\D/g, '');
    
    // Handle Ethiopian phone number formatting
    if (digits.startsWith('251')) {
      // International format: +251 9 12 34 56 78
      digits = digits.substring(3);
    } else if (digits.startsWith('0')) {
      // National format: 09 12 34 56 78
      digits = digits.substring(1);
    }
    
    // Format as: 09 12 34 56 78
    if (digits.length >= 9) {
      return `09${digits.substring(1, 3)} ${digits.substring(3, 5)} ${digits.substring(5, 7)} ${digits.substring(7, 9)}`;
    } else if (digits.length >= 7) {
      return `09${digits.substring(1, 3)} ${digits.substring(3, 5)} ${digits.substring(5, 7)}`;
    } else if (digits.length >= 5) {
      return `09${digits.substring(1, 3)} ${digits.substring(3, 5)}`;
    } else if (digits.length >= 3) {
      return `09${digits.substring(1, 3)}`;
    } else if (digits.length >= 1) {
      return `09${digits.substring(1)}`;
    }
    
    return '09';
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\s/g, '');
    return /^09\d{8}$/.test(cleanPhone);
  };

  const handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(event.target.value);
    setPhoneNumber(formatted);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setPaymentResponse(null);

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid Ethiopian phone number (09xxxxxxxx)');
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        amount: amount,
        phoneNumber: phoneNumber.replace(/\s/g, ''), // Remove spaces
        bookingReference,
        paymentProvider: provider,
        customerName: customerName || '',
        customerEmail: customerEmail || '',
        returnUrl: window.location.origin + '/booking-confirmation/' + bookingReference
      };

      const endpoint = provider === 'MBIRR' 
        ? '/api/payments/ethiopian/mbirr/initiate'
        : '/api/payments/ethiopian/telebirr/initiate';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...TokenManager.getAuthHeaders()
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPaymentResponse(data);
        onPaymentInitiated?.(data);
      } else {
        const errorMsg = data.errorMessage || data || 'Payment initiation failed';
        setError(errorMsg);
        onError?.(errorMsg);
      }

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error occurred';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getProviderInfo = () => {
    if (provider === 'MBIRR') {
      return {
        name: 'M-birr',
        description: 'Pay using your M-birr mobile wallet',
        icon: <MbirrIcon sx={{ color: (theme) => theme.custom.constants.mbirrOrange }} />,
        color: '#FF6B35', // theme.custom.constants.mbirrOrange
        dialCode: '*847#',
        limits: 'Limits: 10 - 100,000 ETB'
      };
    } else {
      return {
        name: 'Telebirr',
        description: 'Pay using your Telebirr mobile wallet',
        icon: <TelebirrIcon sx={{ color: (theme) => theme.custom.constants.telebirrGreen }} />,
        color: '#00A651', // theme.custom.constants.telebirrGreen
        dialCode: '*127#',
        limits: 'Limits: 5 - 50,000 ETB'
      };
    }
  };

  const providerInfo = getProviderInfo();

  if (paymentResponse && paymentResponse.success) {
    return (
      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          {providerInfo.icon}
          <Typography variant="h5" sx={{ mt: 1, color: providerInfo.color }}>
            {providerInfo.name} Payment Initiated
          </Typography>
        </Box>

        <Alert severity="success" sx={{ mb: 3 }}>
          Payment request sent successfully! Complete the payment on your mobile device.
        </Alert>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Amount:</strong> {amount} ETB
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Transaction ID:</strong> {paymentResponse.transactionId}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Phone:</strong> {phoneNumber}
                </Typography>
                {paymentResponse.expiresAt && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TimeIcon sx={{ fontSize: 16, mr: 0.5, color: 'warning.main' }} />
                    <Typography variant="body2" color="warning.main">
                      Expires: {new Date(paymentResponse.expiresAt).toLocaleTimeString()}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {paymentResponse.qrCode && (
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    <QrCodeIcon sx={{ mr: 1 }} />
                    Scan QR Code
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Box 
                      sx={{ 
                        width: 150, 
                        height: 150, 
                        border: '2px dashed', 
                        borderColor: 'grey.400',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                        QR Code<br />
                        {paymentResponse.qrCode?.substring(0, 10)}...
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Scan with your {providerInfo.name} app
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Instructions:</strong>
              </Typography>
              <Typography variant="body2">
                {paymentResponse.instructions || `
                  1. Open your ${providerInfo.name} app or dial ${providerInfo.dialCode}
                  2. Follow the prompts to complete the payment
                  3. You will receive a confirmation SMS
                  4. Your booking will be confirmed automatically
                `}
              </Typography>
            </Alert>
          </Grid>

          {paymentResponse.paymentUrl && (
            <Grid item xs={12}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => window.open(paymentResponse.paymentUrl, '_blank')}
                sx={{ bgcolor: providerInfo.color }}
              >
                Open {providerInfo.name} Payment
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' }}>
        🇪🇹 Ethiopian Mobile Payment
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
        Pay securely with your mobile wallet
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Payment Provider Selection */}
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ fontWeight: 'bold' }}>
                Choose Payment Provider
              </FormLabel>
              <RadioGroup
                row
                value={provider}
                onChange={(e) => setProvider(e.target.value as 'MBIRR' | 'TELEBIRR')}
                sx={{ mt: 1 }}
              >
                <FormControlLabel
                  value="MBIRR"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MbirrIcon sx={{ mr: 1, color: (theme) => theme.custom.constants.mbirrOrange }} />
                      M-birr
                    </Box>
                  }
                />
                <FormControlLabel
                  value="TELEBIRR"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TelebirrIcon sx={{ mr: 1, color: (theme) => theme.custom.constants.telebirrGreen }} />
                      Telebirr
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* Provider Information */}
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {providerInfo.icon}
                  <Typography variant="h6" sx={{ ml: 1, color: providerInfo.color }}>
                    {providerInfo.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {providerInfo.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {providerInfo.limits} • Dial {providerInfo.dialCode} for USSD
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Phone Number Input */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Mobile Phone Number"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder="09 12 34 56 78"
              required
              InputProps={{
                startAdornment: (
                  <PhoneIcon sx={{ color: 'action.active', mr: 1 }} />
                ),
              }}
              helperText="Enter your Ethiopian mobile number"
            />
          </Grid>

          {/* Payment Summary */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Total Amount:</Typography>
              <Typography variant="h6" color={providerInfo.color}>
                {amount} ETB
              </Typography>
            </Box>
          </Grid>

          {/* Error Display */}
          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading || !phoneNumber}
              sx={{ 
                bgcolor: providerInfo.color,
                '&:hover': { bgcolor: providerInfo.color },
                py: 1.5
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Initiating Payment...
                </>
              ) : (
                `Pay ${amount} ETB with ${providerInfo.name}`
              )}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default EthiopianPaymentForm;
