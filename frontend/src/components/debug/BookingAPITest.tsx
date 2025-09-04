import React, { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Typography, Alert } from '@mui/material';

// Simple test component to debug booking API
const BookingAPITest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Testing booking API...');
      
      // Get fresh token
      const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@addissunshine.com',
          password: 'admin123'
        })
      });
      
      if (!loginResponse.ok) {
        throw new Error('Login failed');
      }
      
      const loginData = await loginResponse.json();
      const token = loginData.token;
      
      console.log('Token received:', token ? 'Yes' : 'No');
      
      // Test booking API
      const bookingsResponse = await fetch('http://localhost:8080/api/hotel-admin/bookings?page=0&size=10', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Bookings response status:', bookingsResponse.status);
      
      if (!bookingsResponse.ok) {
        const errorData = await bookingsResponse.json();
        throw new Error(`Bookings API failed: ${errorData.message || bookingsResponse.statusText}`);
      }
      
      const bookingsData = await bookingsResponse.json();
      console.log('Bookings data:', bookingsData);
      
      setData(bookingsData);
      
    } catch (err) {
      console.error('API test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Booking API Test Component
      </Typography>
      
      <Button onClick={testAPI} disabled={loading} variant="contained" sx={{ mb: 2 }}>
        Test Booking API
      </Button>
      
      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography>Loading...</Typography>
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {error}
        </Alert>
      )}
      
      {data && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Success! Found {data.content ? data.content.length : 0} bookings
          </Typography>
          <Box
            component="pre"
            sx={{ 
              backgroundColor: 'grey.100', 
              p: 1.25, 
              fontSize: '12px', 
              overflow: 'auto',
              fontFamily: 'monospace'
            }}
          >
            {JSON.stringify(data, null, 2)}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default BookingAPITest;
