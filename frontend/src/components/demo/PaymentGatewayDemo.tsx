import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useMockPayment, MockPaymentRequest } from '../../services/mockPaymentGateway';
import { PaymentMethod } from '../../types/shop';

export const PaymentGatewayDemo: React.FC = () => {
  const mockPayment = useMockPayment();
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testPayments = [
    {
      method: PaymentMethod.CREDIT_CARD,
      label: 'Credit Card Payment',
      amount: 2500,
      description: 'Hotel booking payment',
    },
    {
      method: PaymentMethod.MOBILE_MONEY,
      label: 'Mobile Money Payment',
      amount: 850,
      description: 'Shop purchase payment',
    },
    {
      method: PaymentMethod.CARD,
      label: 'Debit Card Payment',
      amount: 1200,
      description: 'Room service payment',
    },
    {
      method: PaymentMethod.CASH,
      label: 'Cash Payment',
      amount: 450,
      description: 'Counter payment',
    },
  ];

  const processTestPayment = async (testPayment: any) => {
    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const testData = mockPayment.getTestData(testPayment.method);
      
      const paymentRequest: MockPaymentRequest = {
        amount: testPayment.amount,
        currency: 'ETB',
        paymentMethod: testPayment.method,
        customerInfo: {
          name: 'Test Customer',
          email: 'test@example.com',
          phone: '+251911123456',
        },
        paymentDetails: {
          ...testData,
          description: testPayment.description,
        },
        orderId: `ORDER_${Date.now()}`,
      };

      const paymentResult = await mockPayment.processPayment(paymentRequest);
      setResult(paymentResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mock Payment Gateway Demo
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        This demo shows the mock payment gateway in action. All payments will succeed for testing purposes.
      </Typography>

      <Grid container spacing={3}>
        {testPayments.map((payment, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {payment.label}
                </Typography>
                <Typography variant="h5" color="primary" gutterBottom>
                  ETB {payment.amount}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {payment.description}
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => processTestPayment(payment)}
                  disabled={processing}
                >
                  Pay Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {processing && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Processing payment...
          </Typography>
        </Box>
      )}

      {result && (
        <Alert severity="success" sx={{ mt: 3 }}>
          <Typography variant="h6">Payment Successful!</Typography>
          <Box sx={{ mt: 1 }}>
            <Chip label={`Transaction ID: ${result.transactionId}`} size="small" sx={{ mr: 1, mb: 1 }} />
            <Chip label={`Reference: ${result.paymentReference}`} size="small" sx={{ mr: 1, mb: 1 }} />
            <Chip label={`Amount: ${result.currency} ${result.amount}`} size="small" sx={{ mr: 1, mb: 1 }} />
            <Chip label={`Method: ${result.paymentMethod}`} size="small" sx={{ mb: 1 }} />
          </Box>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {result.message}
          </Typography>
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Test Data Used by Payment Gateway:
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>Credit Card Test Data</Typography>
                <Typography variant="body2">Number: 4532-1234-5678-9012</Typography>
                <Typography variant="body2">Expiry: 12/27</Typography>
                <Typography variant="body2">CVV: 123</Typography>
                <Typography variant="body2">Name: John Doe</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>Mobile Money Test Data</Typography>
                <Typography variant="body2">Phone: +251911123456</Typography>
                <Typography variant="body2">Provider: M-Pesa</Typography>
                <Typography variant="body2">TeleBirr: +251987654321</Typography>
                <Typography variant="body2">CBE Birr: +251911987654</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default PaymentGatewayDemo;