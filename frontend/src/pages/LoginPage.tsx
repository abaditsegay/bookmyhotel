import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Container, TextField, Typography, Alert, Divider, Chip } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect info from location state
  const redirectTo = location.state?.redirectTo;
  const bookingData = location.state?.bookingData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillSampleUser = (sampleEmail: string, samplePassword: string) => {
    setEmail(sampleEmail);
    setPassword(samplePassword);
    setError('');
  };

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

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
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

            {/* Sample Users Section */}
            <Divider sx={{ my: 3 }}>
              <Chip label="Demo Users - Click to Test" size="small" color="primary" />
            </Divider>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 1 }}>
                Use sample credentials for testing:
              </Typography>
              
              <Button
                variant="outlined"
                size="small"
                onClick={() => fillSampleUser('admin@system.com', 'password')}
                sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
              >
                <Typography variant="body2" fontWeight="bold">System Admin</Typography>
                <Typography variant="caption" color="textSecondary">
                  admin@system.com / password
                </Typography>
              </Button>
              
              <Button
                variant="outlined"
                size="small"
                onClick={() => fillSampleUser('admin@grandplaza.com', 'password')}
                sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
              >
                <Typography variant="body2" fontWeight="bold">Grand Plaza Hotel Admin</Typography>
                <Typography variant="caption" color="textSecondary">
                  admin@grandplaza.com / password
                </Typography>
              </Button>
              
              <Button
                variant="outlined"
                size="small"
                onClick={() => fillSampleUser('hoteladmin@bookmyhotel.com', 'password')}
                sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
              >
                <Typography variant="body2" fontWeight="bold">BookMyHotel Admin</Typography>
                <Typography variant="caption" color="textSecondary">
                  hoteladmin@bookmyhotel.com / password
                </Typography>
              </Button>

              <Button
                variant="outlined"
                size="small"
                onClick={() => fillSampleUser('admin@downtownbusiness.com', 'password')}
                sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
              >
                <Typography variant="body2" fontWeight="bold">Downtown Business Hotel Admin</Typography>
                <Typography variant="caption" color="textSecondary">
                  admin@downtownbusiness.com / password
                </Typography>
              </Button>

              <Button
                variant="outlined"
                size="small"
                onClick={() => fillSampleUser('frontdesk1@grandplaza.com', 'password')}
                sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
              >
                <Typography variant="body2" fontWeight="bold">Front Desk Staff</Typography>
                <Typography variant="caption" color="textSecondary">
                  frontdesk1@grandplaza.com / password
                </Typography>
              </Button>

              <Button
                variant="outlined"
                size="small"
                onClick={() => fillSampleUser('guest@test.com', 'password')}
                sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
              >
                <Typography variant="body2" fontWeight="bold">Guest User</Typography>
                <Typography variant="caption" color="textSecondary">
                  guest@test.com / password
                </Typography>
              </Button>
            </Box>

            {/* New Luxury Hotel Group Users */}
            <Divider sx={{ my: 2 }}>
              <Chip label="Luxury Hotel Group - New Tenant" size="small" color="secondary" />
            </Divider>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                color="secondary"
                onClick={() => fillSampleUser('admin@royalpalace.com', 'password')}
                sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
              >
                <Typography variant="body2" fontWeight="bold">Royal Palace Hotel Admin</Typography>
                <Typography variant="caption" color="textSecondary">
                  Victoria Sterling - admin@royalpalace.com / password
                </Typography>
              </Button>

              <Button
                variant="outlined"
                size="small"
                color="secondary"
                onClick={() => fillSampleUser('frontdesk@royalpalace.com', 'password')}
                sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
              >
                <Typography variant="body2" fontWeight="bold">Royal Palace Front Desk</Typography>
                <Typography variant="caption" color="textSecondary">
                  James Butler - frontdesk@royalpalace.com / password
                </Typography>
              </Button>

              <Button
                variant="outlined"
                size="small"
                color="secondary"
                onClick={() => fillSampleUser('admin@diamondresort.com', 'password')}
                sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
              >
                <Typography variant="body2" fontWeight="bold">Diamond Resort Admin</Typography>
                <Typography variant="caption" color="textSecondary">
                  Sophia Diamond - admin@diamondresort.com / password
                </Typography>
              </Button>

              <Button
                variant="outlined"
                size="small"
                color="secondary"
                onClick={() => fillSampleUser('frontdesk@diamondresort.com', 'password')}
                sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
              >
                <Typography variant="body2" fontWeight="bold">Diamond Resort Front Desk</Typography>
                <Typography variant="caption" color="textSecondary">
                  Michael Concierge - frontdesk@diamondresort.com / password
                </Typography>
              </Button>

              <Button
                variant="outlined"
                size="small"
                color="secondary"
                onClick={() => fillSampleUser('guest1@luxury.com', 'password')}
                sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
              >
                <Typography variant="body2" fontWeight="bold">Luxury Guest 1</Typography>
                <Typography variant="caption" color="textSecondary">
                  Elizabeth Windsor - guest1@luxury.com / password
                </Typography>
              </Button>

              <Button
                variant="outlined"
                size="small"
                color="secondary"
                onClick={() => fillSampleUser('guest2@luxury.com', 'password')}
                sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
              >
                <Typography variant="body2" fontWeight="bold">Luxury Guest 2</Typography>
                <Typography variant="caption" color="textSecondary">
                  William Rothschild - guest2@luxury.com / password
                </Typography>
              </Button>
            </Box>

            <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
              Click a test user button to auto-fill credentials, then "Sign In"
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginPage;
