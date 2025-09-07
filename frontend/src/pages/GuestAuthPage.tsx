import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Alert,
  Tabs,
  Tab,
  Link,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_CONFIG } from '../config/apiConfig';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const GuestAuthPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registration form state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  // Get the intended destination from navigation state
  const intendedDestination = location.state?.from || '/';
  const bookingData = location.state?.bookingData;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(loginEmail, loginPassword);
      if (success) {
        // Redirect to intended destination
        if (bookingData) {
          navigate('/booking', { state: bookingData });
        } else {
          navigate(intendedDestination);
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (registerPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (registerPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerEmail)) {
      setError('Please provide a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
          firstName,
          lastName,
          phone: phone || undefined,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Registration failed');
      }

      const registrationData = await response.json();
      
      // Store authentication data (same format as login)
      const user = {
        id: registrationData.id.toString(),
        email: registrationData.email,
        firstName: registrationData.firstName || '',
        lastName: registrationData.lastName || '',
        phone: '',
        role: Array.isArray(registrationData.roles) ? registrationData.roles[0] : registrationData.roles,
        roles: Array.isArray(registrationData.roles) ? registrationData.roles : [registrationData.roles],
        hotelId: undefined,
        hotelName: undefined,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true,
      };

      // Store in localStorage (mimicking the login process)
      localStorage.setItem('auth_token', registrationData.token);
      localStorage.setItem('auth_user', JSON.stringify(user));

      setSuccess('Registration successful! Redirecting...');

      // Small delay to show success message
      setTimeout(() => {
        if (bookingData) {
          navigate('/booking', { state: bookingData });
        } else {
          navigate(intendedDestination);
        }
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
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
        <Card sx={{ width: '100%', maxWidth: 500 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              BookMyHotel
            </Typography>
            <Typography variant="h6" component="h2" gutterBottom align="center" color="textSecondary">
              Sign in to complete your booking
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="auth tabs">
                <Tab label="Sign In" />
                <Tab label="Create Account" />
              </Tabs>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {success}
              </Alert>
            )}

            {/* Login Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box component="form" onSubmit={handleLogin}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  margin="normal"
                  required
                  autoComplete="email"
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
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
            </TabPanel>

            {/* Registration Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box component="form" onSubmit={handleRegister}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  margin="normal"
                  required
                  autoComplete="email"
                />
                <TextField
                  fullWidth
                  label="Phone (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  margin="normal"
                  required
                  autoComplete="new-password"
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  margin="normal"
                  required
                  autoComplete="new-password"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </Box>
            </TabPanel>

            <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
              Need to make a booking? You'll need to{' '}
              {tabValue === 0 ? (
                <Link component="button" onClick={() => setTabValue(1)}>
                  create an account
                </Link>
              ) : (
                <Link component="button" onClick={() => setTabValue(0)}>
                  sign in
                </Link>
              )}{' '}
              first to manage your reservations.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default GuestAuthPage;
