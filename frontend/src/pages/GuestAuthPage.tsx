import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Alert,
  Tabs,
  Tab,
  Link,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import PremiumTextField from '../components/common/PremiumTextField';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_CONFIG } from '../config/apiConfig';
import { useTheme, alpha } from '@mui/material/styles';
import { COLORS, addAlpha, getGradient } from '../theme/themeColors';

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
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Registration form state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
            ? getGradient('white')
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.1)} 0%, transparent 100%)`,
        }}
      >
        <Card 
          elevation={theme.palette.mode === 'light' ? 8 : 4}
          sx={{ 
            width: '100%', 
            maxWidth: 500,
            boxShadow: theme.palette.mode === 'light' 
              ? `0 2px 8px ${addAlpha(COLORS.SECONDARY, 0.1)}`
              : `0 8px 32px -4px ${alpha(theme.palette.primary.main, 0.25)}`,
            border: theme.palette.mode === 'dark' 
              ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
              : `1px solid ${COLORS.SECONDARY}`,
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
              background: `linear-gradient(90deg, ${COLORS.SECONDARY} 0%, ${COLORS.SECONDARY_HOVER} 100%)`,
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
                color: COLORS.PRIMARY,
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
                borderBottom: `2px solid ${COLORS.SECONDARY}`, 
                mt: 3,
                '& .MuiTabs-indicator': {
                  backgroundColor: COLORS.SECONDARY,
                  height: 3,
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
                      color: COLORS.PRIMARY,
                      backgroundColor: COLORS.BG_LIGHT,
                    },
                  },
                  '& .Mui-selected': {
                    color: COLORS.PRIMARY,
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
                <PremiumTextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  margin="normal"
                  required
                  autoComplete="email"
                />
                <PremiumTextField
                  fullWidth
                  label="Password"
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  margin="normal"
                  required
                  autoComplete="current-password"
                  InputProps={{
                    endAdornment: (
                      <Box
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        sx={{
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          color: 'text.secondary',
                          '&:hover': { color: 'primary.main' },
                        }}
                      >
                        {showLoginPassword ? <VisibilityOff /> : <Visibility />}
                      </Box>
                    ),
                  }}
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
                    backgroundColor: COLORS.PRIMARY,
                    border: `2px solid ${COLORS.SECONDARY}`,
                    color: COLORS.WHITE,
                    '&:hover': {
                      backgroundColor: COLORS.PRIMARY_HOVER,
                      borderColor: COLORS.SECONDARY_HOVER,
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                      transition: 'transform 0.1s ease',
                    },
                    '&:disabled': {
                      background: theme.palette.action.disabledBackground,
                      color: theme.palette.action.disabled,
                      border: `2px solid ${addAlpha(COLORS.BLACK, 0.12)}`,
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
                    borderColor: COLORS.SECONDARY,
                    color: COLORS.PRIMARY,
                    '&:hover': {
                      borderColor: COLORS.SECONDARY_HOVER,
                      backgroundColor: COLORS.BG_LIGHT,
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
                <PremiumTextField
                  fullWidth
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  margin="normal"
                  required
                />
                <PremiumTextField
                  fullWidth
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  margin="normal"
                  required
                />
                <PremiumTextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  margin="normal"
                  required
                  autoComplete="email"
                />
                <PremiumTextField
                  fullWidth
                  label="Phone (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  margin="normal"
                />
                <PremiumTextField
                  fullWidth
                  label="Password"
                  type={showRegisterPassword ? 'text' : 'password'}
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  margin="normal"
                  required
                  autoComplete="new-password"
                  InputProps={{
                    endAdornment: (
                      <Box
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        sx={{
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          color: 'text.secondary',
                          '&:hover': { color: 'primary.main' },
                        }}
                      >
                        {showRegisterPassword ? <VisibilityOff /> : <Visibility />}
                      </Box>
                    ),
                  }}
                />
                <PremiumTextField
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  margin="normal"
                  required
                  autoComplete="new-password"
                  InputProps={{
                    endAdornment: (
                      <Box
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        sx={{
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          color: 'text.secondary',
                          '&:hover': { color: 'primary.main' },
                        }}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </Box>
                    ),
                  }}
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
                    backgroundColor: COLORS.PRIMARY,
                    color: COLORS.WHITE,
                    border: `2px solid ${COLORS.SECONDARY}`,
                    '&:hover': {
                      backgroundColor: COLORS.PRIMARY_HOVER,
                      borderColor: COLORS.SECONDARY_HOVER,
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                      transition: 'transform 0.1s ease',
                    },
                    '&:disabled': {
                      background: theme.palette.action.disabledBackground,
                      color: theme.palette.action.disabled,
                      border: `2px solid ${addAlpha(COLORS.BLACK, 0.12)}`,
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
                    color: COLORS.PRIMARY,
                    fontWeight: 600,
                    textDecoration: 'underline',
                    textDecorationColor: COLORS.SECONDARY,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      textDecorationColor: COLORS.SECONDARY_HOVER,
                      color: COLORS.PRIMARY_HOVER,
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
                    color: COLORS.PRIMARY,
                    fontWeight: 600,
                    textDecoration: 'underline',
                    textDecorationColor: COLORS.SECONDARY,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      textDecorationColor: COLORS.SECONDARY_HOVER,
                      color: COLORS.PRIMARY_HOVER,
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
