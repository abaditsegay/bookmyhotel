import React, { useState, useEffect } from 'react';
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
import { useTheme, alpha } from '@mui/material/styles';

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
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login, error: authError, clearError, isAuthenticated, user, isInitializing } = useAuth();
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

  // Redirect already authenticated users to their intended destination
  useEffect(() => {
    if (!isInitializing && isAuthenticated && user) {
      // If there's booking data, redirect to booking page
      if (bookingData) {
        navigate('/booking', { state: bookingData, replace: true });
        return;
      }
      
      // Otherwise, redirect to intended destination or dashboard
      navigate(intendedDestination === '/' ? '/dashboard' : intendedDestination, { replace: true });
    }
  }, [isAuthenticated, user, isInitializing, bookingData, intendedDestination, navigate]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Prevent double submission
    if (loading) return;
    
    setError('');
    clearError(); // Clear previous auth errors
    setLoading(true);

    // Add small delay to ensure UI updates
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // console.log('Starting mobile-friendly login...');
      const success = await login(loginEmail, loginPassword);
      // console.log('Login result:', success);
      
      if (success) {
        // console.log('Login successful, navigating...');
        // Add small delay before navigation
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Redirect to intended destination
        if (bookingData) {
          navigate('/booking', { state: bookingData });
        } else {
          navigate(intendedDestination);
        }
      }
      // Note: If login fails, the error will be set in authError by AuthContext
    } catch (err) {
      // console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Mobile-friendly login handler without form
  const handleMobileLogin = async () => {
    await handleLogin();
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

  // Show loading state while checking authentication from localStorage
  if (isInitializing) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <Typography variant="h6">Loading...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          background: theme.palette.mode === 'light' 
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.1)} 0%, transparent 100%)`,
        }}
      >
        <Card 
          elevation={theme.palette.mode === 'light' ? 8 : 4}
          sx={{ 
            width: '100%', 
            maxWidth: 500,
            boxShadow: theme.palette.mode === 'light' 
              ? `0 12px 40px -4px ${alpha(theme.palette.primary.main, 0.15)}, 0 8px 16px -8px ${alpha(theme.palette.primary.main, 0.2)}`
              : `0 8px 32px -4px ${alpha(theme.palette.primary.main, 0.25)}`,
            border: theme.palette.mode === 'dark' 
              ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
              : undefined,
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
              zIndex: 1,
            },
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom 
              align="center"
              sx={{
                fontWeight: 'bold',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              BookMyHotel
            </Typography>
            <Typography 
              variant="h6" 
              component="h2" 
              gutterBottom 
              align="center" 
              color="textSecondary"
              sx={{ 
                mb: 3,
                color: theme.palette.text.secondary,
              }}
            >
              Sign in to complete your booking
            </Typography>

            <Box 
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider', 
                mt: 3,
                '& .MuiTabs-indicator': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  height: 3,
                  borderRadius: '2px 2px 0 0',
                },
              }}
            >
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="auth tabs"
                variant="fullWidth"
                sx={{
                  '& .MuiTab-root': {
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      color: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                  },
                  '& .Mui-selected': {
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                  },
                }}
              >
                <Tab label="Sign In" />
                <Tab label="Create Account" />
              </Tabs>
            </Box>

            {(authError || error) && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {authError || error}
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
                  sx={{ 
                    mt: 3, 
                    mb: 1,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.35)}`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                      boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                      transition: 'transform 0.1s ease',
                    },
                    '&:disabled': {
                      background: theme.palette.action.disabledBackground,
                      color: theme.palette.action.disabled,
                      boxShadow: 'none',
                    },
                    transition: 'all 0.2s ease',
                  }}
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
                
                {/* Mobile-friendly fallback button */}
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ 
                    mb: 2,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    borderRadius: 2,
                    borderWidth: 2,
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      borderColor: theme.palette.primary.dark,
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      borderWidth: 2,
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                      transition: 'transform 0.1s ease',
                    },
                    '&:disabled': {
                      borderColor: theme.palette.action.disabled,
                      color: theme.palette.action.disabled,
                    },
                    transition: 'all 0.2s ease',
                  }}
                  disabled={loading}
                  onClick={handleMobileLogin}
                >
                  {loading ? 'Signing In...' : 'Mobile Sign In (Tap Here)'}
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
                  sx={{ 
                    mt: 3, 
                    mb: 2,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.35)}`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                      boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                      transition: 'transform 0.1s ease',
                    },
                    '&:disabled': {
                      background: theme.palette.action.disabledBackground,
                      color: theme.palette.action.disabled,
                      boxShadow: 'none',
                    },
                    transition: 'all 0.2s ease',
                  }}
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </Box>
            </TabPanel>

            <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
              Need to make a booking? You'll need to{' '}
              {tabValue === 0 ? (
                <Link 
                  component="button" 
                  onClick={() => setTabValue(1)}
                  sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    textDecoration: 'underline',
                    textDecorationColor: alpha(theme.palette.primary.main, 0.6),
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      textDecorationColor: theme.palette.primary.main,
                      color: theme.palette.primary.dark,
                      textDecorationThickness: '2px',
                    },
                  }}
                >
                  create an account
                </Link>
              ) : (
                <Link 
                  component="button" 
                  onClick={() => setTabValue(0)}
                  sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    textDecoration: 'underline',
                    textDecorationColor: alpha(theme.palette.primary.main, 0.6),
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      textDecorationColor: theme.palette.primary.main,
                      color: theme.palette.primary.dark,
                      textDecorationThickness: '2px',
                    },
                  }}
                >
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
