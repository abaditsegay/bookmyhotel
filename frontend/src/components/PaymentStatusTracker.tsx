import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  LinearProgress,
  Card,
  CardContent,
  Chip,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
  Refresh as RefreshIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import TokenManager from '../utils/tokenManager';
import { themeConstants } from '../theme/theme';
import { StandardCard, StandardButton, StandardLoading, StandardError } from './common';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const fetchPaymentStatus = React.useCallback(async () => {
    try {
      setError('');
      const response = await fetch(`/api/payments/ethiopian/status/${transactionId}`, {
        headers: {
          ...TokenManager.getAuthHeaders()
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
    if (provider === 'MBIRR') {
      return { 
        name: 'M-birr', 
        color: theme.palette.mode === 'dark' ? themeConstants.darkTheme.mbirrOrange : themeConstants.mbirrOrange, 
        dialCode: '*847#' 
      };
    } else {
      return { 
        name: 'Telebirr', 
        color: theme.palette.mode === 'dark' ? themeConstants.darkTheme.telebirrGreen : themeConstants.telebirrGreen, 
        dialCode: '*127#' 
      };
    }
  };

  const providerInfo = getProviderInfo();
  const statusInfo = getStatusInfo();

  if (loading && !status) {
    return (
      <StandardCard
        sx={{ 
          maxWidth: isMobile ? '100%' : 600, 
          mx: 'auto',
          p: { xs: 2, md: 3 }
        }}
      >
        <StandardLoading
          loading={true}
          message="Checking payment status..."
          size="large"
          overlay={false}
        />
      </StandardCard>
    );
  }

  if (error && !status) {
    return (
      <StandardCard
        sx={{ 
          maxWidth: isMobile ? '100%' : 600, 
          mx: 'auto',
          p: { xs: 2, md: 3 }
        }}
      >
        <StandardError
          error={true}
          message={error}
          severity="error"
          showRetry={true}
          onRetry={fetchPaymentStatus}
          retryText="Retry"
        />
      </StandardCard>
    );
  }

  if (!status || !statusInfo) {
    return (
      <StandardCard
        sx={{ 
          maxWidth: isMobile ? '100%' : 600, 
          mx: 'auto',
          p: { xs: 2, md: 3 }
        }}
      >
        <StandardError
          error={true}
          message="Unable to load payment status"
          severity="error"
          showRetry={false}
        />
      </StandardCard>
    );
  }

  return (
    <StandardCard 
      sx={{ 
        maxWidth: isMobile ? '100%' : 600, 
        mx: 'auto',
        p: { xs: 2, md: 3 }
      }}
    >
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
          <Card 
            variant="outlined"
            sx={{
              backgroundColor: theme.palette.mode === 'dark' 
                ? themeConstants.darkTheme.cardBackground 
                : 'background.paper',
              borderColor: theme.palette.mode === 'dark' 
                ? themeConstants.darkTheme.borderColor 
                : 'divider'
            }}
          >
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
          <Card 
            variant="outlined"
            sx={{
              backgroundColor: theme.palette.mode === 'dark' 
                ? themeConstants.darkTheme.cardBackground 
                : 'background.paper',
              borderColor: theme.palette.mode === 'dark' 
                ? themeConstants.darkTheme.borderColor 
                : 'divider'
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Provider Info
              </Typography>
              <Chip 
                label={providerInfo.name}
                sx={{ 
                  bgcolor: providerInfo.color, 
                  color: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.87)' : 'white',
                  fontWeight: 'bold',
                  mb: 2 
                }}
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
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 1, md: 2 }, 
            justifyContent: 'center',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center'
          }}>
            <StandardButton
              variant="outlined"
              onClick={fetchPaymentStatus}
              startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
              disabled={loading}
              sx={{ 
                minHeight: themeConstants.touchTargets.minimum,
                minWidth: isMobile ? '100%' : 'auto',
                height: isMobile ? themeConstants.touchTargets.large : themeConstants.touchTargets.minimum
              }}
            >
              {loading ? 'Refreshing...' : 'Refresh Status'}
            </StandardButton>
            
            {status.status === 'FAILED' || status.status === 'EXPIRED' ? (
              <StandardButton
                variant="contained"
                onClick={() => window.location.reload()}
                sx={{ 
                  bgcolor: providerInfo.color,
                  minHeight: themeConstants.touchTargets.minimum,
                  minWidth: isMobile ? '100%' : 'auto',
                  height: isMobile ? themeConstants.touchTargets.large : themeConstants.touchTargets.minimum,
                  '&:hover': {
                    bgcolor: providerInfo.color,
                    filter: 'brightness(0.9)'
                  }
                }}
              >
                Try Again
              </StandardButton>
            ) : status.status === 'COMPLETED' ? (
              <StandardButton
                variant="contained"
                onClick={() => window.location.href = '/bookings'}
                color="success"
                sx={{ 
                  minHeight: themeConstants.touchTargets.minimum,
                  minWidth: isMobile ? '100%' : 'auto',
                  height: isMobile ? themeConstants.touchTargets.large : themeConstants.touchTargets.minimum
                }}
              >
                View Booking
              </StandardButton>
            ) : null}
          </Box>
        </Grid>
      </Grid>
    </StandardCard>
  );
};

export default PaymentStatusTracker;
