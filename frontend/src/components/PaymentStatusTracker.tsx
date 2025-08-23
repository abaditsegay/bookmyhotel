import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  LinearProgress,
  Card,
  CardContent,
  Chip,
  Grid
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
  Refresh as RefreshIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';

interface PaymentStatusProps {
  transactionId: string;
  provider: 'MBIRR' | 'TELEBIRR';
  amount: number;
  phoneNumber: string;
  onStatusChange?: (status: PaymentStatus) => void;
  autoRefresh?: boolean;
  refreshInterval?: number; // in seconds
}

interface PaymentStatus {
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'EXPIRED' | 'CANCELLED';
  transactionId: string;
  amount: number;
  currency: string;
  paymentDate?: string;
  failureReason?: string;
  providerTransactionId?: string;
  customerPhone: string;
  expiresAt?: string;
}

const PaymentStatusTracker: React.FC<PaymentStatusProps> = ({
  transactionId,
  provider,
  amount,
  phoneNumber,
  onStatusChange,
  autoRefresh = true,
  refreshInterval = 10
}) => {
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const fetchPaymentStatus = React.useCallback(async () => {
    try {
      setError('');
      const response = await fetch(`/api/payments/ethiopian/status/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        onStatusChange?.(data);

        // Calculate time left if expiry is set
        if (data.expiresAt && data.status === 'PENDING') {
          const expiry = new Date(data.expiresAt).getTime();
          const now = new Date().getTime();
          const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
          setTimeLeft(remaining);
        } else {
          setTimeLeft(null);
        }
      } else {
        const errorData = await response.text();
        setError(`Failed to fetch payment status: ${errorData}`);
      }
    } catch (err) {
      setError(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [transactionId, onStatusChange]);

  useEffect(() => {
    fetchPaymentStatus();
  }, [fetchPaymentStatus]);

  useEffect(() => {
    if (!autoRefresh || !status || status.status !== 'PENDING') return;

    const interval = setInterval(fetchPaymentStatus, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, status, fetchPaymentStatus]);

  useEffect(() => {
    if (!timeLeft || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev && prev > 0) {
          return prev - 1;
        }
        return null;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const getStatusInfo = () => {
    if (!status) return null;

    switch (status.status) {
      case 'PENDING':
        return {
          icon: <PendingIcon sx={{ color: 'warning.main' }} />,
          color: 'warning.main',
          title: 'Payment Pending',
          description: 'Waiting for payment confirmation from your mobile wallet',
          severity: 'warning' as const
        };
      case 'COMPLETED':
        return {
          icon: <SuccessIcon sx={{ color: 'success.main' }} />,
          color: 'success.main',
          title: 'Payment Successful',
          description: 'Your payment has been processed successfully',
          severity: 'success' as const
        };
      case 'FAILED':
        return {
          icon: <ErrorIcon sx={{ color: 'error.main' }} />,
          color: 'error.main',
          title: 'Payment Failed',
          description: status.failureReason || 'Payment could not be processed',
          severity: 'error' as const
        };
      case 'EXPIRED':
        return {
          icon: <ErrorIcon sx={{ color: 'error.main' }} />,
          color: 'error.main',
          title: 'Payment Expired',
          description: 'Payment session has expired. Please try again.',
          severity: 'error' as const
        };
      case 'CANCELLED':
        return {
          icon: <ErrorIcon sx={{ color: 'grey.600' }} />,
          color: 'grey.600',
          title: 'Payment Cancelled',
          description: 'Payment was cancelled by user',
          severity: 'info' as const
        };
      default:
        return null;
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProviderInfo = () => {
    return provider === 'MBIRR' 
      ? { name: 'M-birr', color: '#FF6B35', dialCode: '*847#' }
      : { name: 'Telebirr', color: '#00A651', dialCode: '*127#' };
  };

  const providerInfo = getProviderInfo();
  const statusInfo = getStatusInfo();

  if (loading && !status) {
    return (
      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Checking payment status...
        </Typography>
      </Paper>
    );
  }

  if (error && !status) {
    return (
      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={fetchPaymentStatus}
          startIcon={<RefreshIcon />}
        >
          Retry
        </Button>
      </Paper>
    );
  }

  if (!status || !statusInfo) {
    return (
      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Alert severity="error">
          Unable to load payment status
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        {statusInfo.icon}
        <Typography variant="h5" sx={{ mt: 1, color: statusInfo.color }}>
          {statusInfo.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {statusInfo.description}
        </Typography>
      </Box>

      {/* Progress Bar for Pending Status */}
      {status.status === 'PENDING' && timeLeft !== null && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Session expires in:
            </Typography>
            <Typography variant="body2" color="warning.main" sx={{ fontWeight: 'bold' }}>
              {formatTime(timeLeft)}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={timeLeft ? Math.max(0, (timeLeft / (15 * 60)) * 100) : 0}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
      )}

      <Alert severity={statusInfo.severity} sx={{ mb: 3 }}>
        {statusInfo.description}
      </Alert>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Amount:</strong> {status.amount} {status.currency}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Transaction ID:</strong> {status.transactionId}
              </Typography>
              {status.providerTransactionId && (
                <Typography variant="body2" color="text.secondary">
                  <strong>{providerInfo.name} ID:</strong> {status.providerTransactionId}
                </Typography>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <PhoneIcon sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  {status.customerPhone}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Provider Info
              </Typography>
              <Chip 
                label={providerInfo.name}
                sx={{ bgcolor: providerInfo.color, color: 'white', mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                <strong>USSD Code:</strong> {providerInfo.dialCode}
              </Typography>
              {status.paymentDate && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Completed:</strong> {new Date(status.paymentDate).toLocaleString()}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {status.status === 'PENDING' && (
          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Next Steps:</strong>
              </Typography>
              <Typography variant="body2">
                • Check your phone for SMS notifications<br />
                • Open your {providerInfo.name} app to complete payment<br />
                • Or dial {providerInfo.dialCode} and follow prompts<br />
                • This page will update automatically when payment is confirmed
              </Typography>
            </Alert>
          </Grid>
        )}

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={fetchPaymentStatus}
              startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh Status'}
            </Button>
            
            {status.status === 'FAILED' || status.status === 'EXPIRED' ? (
              <Button
                variant="contained"
                onClick={() => window.location.reload()}
                sx={{ bgcolor: providerInfo.color }}
              >
                Try Again
              </Button>
            ) : status.status === 'COMPLETED' ? (
              <Button
                variant="contained"
                onClick={() => window.location.href = '/bookings'}
                color="success"
              >
                View Booking
              </Button>
            ) : null}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PaymentStatusTracker;
