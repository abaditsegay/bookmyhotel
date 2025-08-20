import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Container, TextField, Typography, Alert, Divider, Chip } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect info from location state
  const redirectTo = location.state?.redirectTo;
  const bookingData = location.state?.bookingData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError(); // Clear previous auth errors
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        // Check if there's a redirect with booking data
        if (redirectTo && bookingData) {
          navigate(redirectTo, { state: bookingData });
        } else {
          // Navigate to home page, which will redirect based on user role
          navigate('/');
        }
      }
      // Note: If login fails, the error will be set in authError by AuthContext
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fillSampleUser = (sampleEmail: string, samplePassword: string) => {
    setEmail(sampleEmail);
    setPassword(samplePassword);
    clearError(); // Clear any existing errors
  };

  // Get the error to display (prefer auth context error)
  const displayError = authError;

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 450, maxHeight: '90vh', overflow: 'auto' }}>
                    <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              BookMyHotel
            </Typography>
            
            {bookingData && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Sign in to complete your booking for <strong>{bookingData.hotelName}</strong>
                </Typography>
              </Alert>
            )}

            <Typography variant="h5" component="h2" gutterBottom align="center">
              Sign In{bookingData ? ' to Book' : ''}
            </Typography>

            {displayError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {displayError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                autoComplete="email"
                autoFocus
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="current-password"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Box>

            {/* Test Users Section */}
            <Divider sx={{ my: 3 }}>
              <Chip label="Test Users - Click to Login" size="small" color="primary" />
            </Divider>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 1 }}>
                ✅ All test users are working! Click any button to auto-fill and test login:
              </Typography>
              
              <Button
                variant="outlined"
                size="small"
                onClick={() => fillSampleUser('admin@bookmyhotel.com', 'admin123')}
                sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
              >
                <Typography variant="body2" fontWeight="bold">🔧 System Administrator</Typography>
                <Typography variant="caption" color="textSecondary">
                  admin@bookmyhotel.com / admin123 (✅ Working - Platform Admin)
                </Typography>
              </Button>
              
              <Button
                variant="outlined"
                size="small"
                onClick={() => fillSampleUser('hotel.admin@grandplaza.com', 'admin123')}
                sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
              >
                <Typography variant="body2" fontWeight="bold">🏨 Hotel Administrator</Typography>
                <Typography variant="caption" color="textSecondary">
                  hotel.admin@grandplaza.com / admin123 (✅ Working - John Manager)
                </Typography>
              </Button>
              
              <Button
                variant="outlined"
                size="small"
                onClick={() => fillSampleUser('frontdesk@grandplaza.com', 'frontdesk123')}
                sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
              >
                <Typography variant="body2" fontWeight="bold">🎯 Front Desk Staff</Typography>
                <Typography variant="caption" color="textSecondary">
                  frontdesk@grandplaza.com / frontdesk123 (✅ Working - Jane Desk)
                </Typography>
              </Button>

              <Button
                variant="outlined"
                size="small"
                onClick={() => fillSampleUser('customer@example.com', 'customer123')}
                sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
              >
                <Typography variant="body2" fontWeight="bold">👤 Regular Customer</Typography>
                <Typography variant="caption" color="textSecondary">
                  customer@example.com / customer123 (✅ Working - John Customer)
                </Typography>
              </Button>

              <Button
                variant="outlined"
                size="small"
                onClick={() => fillSampleUser('guest@example.com', 'guest123')}
                sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
              >
                <Typography variant="body2" fontWeight="bold">👋 Guest User</Typography>
                <Typography variant="caption" color="textSecondary">
                  guest@example.com / guest123 (✅ Working - Test Guest)
                </Typography>
              </Button>
            </Box>

            <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
              ✅ Fixed! All test users now have correct passwords. Click to auto-fill, then "Sign In"
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginPage;
