import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Tabs,
  Tab,
  Link,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import PremiumTextField from '../components/common/PremiumTextField';
import { PageContainer, SurfaceCard, TabPanel } from '../components/common';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_CONFIG } from '../config/apiConfig';
import { useTheme, alpha } from '@mui/material/styles';

const GuestAuthPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
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
      setError(t('auth.login.loginFailed'));
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
      setError(t('auth.login.passwordsNoMatch'));
      return;
    }

    if (registerPassword.length < 6) {
      setError(t('auth.login.passwordTooShort'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerEmail)) {
      setError(t('auth.login.invalidEmail'));
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
        throw new Error(errorText || t('auth.login.registrationFailed'));
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

      setSuccess(t('auth.login.registrationSuccess'));

      // Small delay to show success message
      setTimeout(() => {
        if (bookingData) {
          navigate('/booking', { state: bookingData });
        } else {
          navigate(intendedDestination);
        }
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.login.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication from localStorage
  if (isInitializing) {
    return (
      <PageContainer maxWidth="sm" sx={{ justifyContent: 'center', minHeight: '100vh', py: 4, pb: 4 }}>
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
          <Typography variant="h6">{t('auth.login.loading')}</Typography>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="sm" sx={{ justifyContent: 'center', minHeight: '100vh', py: 4, pb: 4 }}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          background: theme.palette.mode === 'light'
            ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${theme.palette.background.default} 44%, ${theme.palette.background.paper} 100%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.1)} 0%, transparent 100%)`,
        }}
      >
        <SurfaceCard
          elevation={theme.palette.mode === 'light' ? 8 : 4}
          sx={{ 
            width: '100%', 
            maxWidth: 500,
            boxShadow: theme.palette.mode === 'light' 
              ? `0 2px 8px ${alpha(theme.palette.secondary.main, 0.1)}`
              : `0 8px 32px -4px ${alpha(theme.palette.primary.main, 0.25)}`,
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
              background: `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
              zIndex: 1,
            },
          }}
          contentSx={{ p: 4 }}
        >
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom 
              align="center"
              sx={{
                fontWeight: 'bold',
                color: 'primary.main',
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
              {bookingData?.hotelName
                ? t('auth.login.signInToBook', { hotelName: bookingData.hotelName })
                : tabValue === 0
                  ? t('auth.login.signInSubtitle')
                  : t('auth.login.createAccountSubtitle')}
            </Typography>

            <Box 
              sx={{ 
                borderBottom: `2px solid ${theme.palette.secondary.main}`, 
                mt: 3,
                '& .MuiTabs-indicator': {
                  backgroundColor: 'secondary.main',
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
                      color: 'primary.main',
                      backgroundColor: alpha(theme.palette.secondary.main, 0.08),
                    },
                  },
                  '& .Mui-selected': {
                    color: 'primary.main',
                    fontWeight: 700,
                  },
                }}
              >
                <Tab label={t('auth.login.signIn')} />
                <Tab label={t('auth.login.createAccount')} />
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
            <TabPanel value={tabValue} index={0} idPrefix="auth" contentSx={{ pt: 3 }}>
              <Box component="form" onSubmit={handleLogin}>
                <PremiumTextField
                  fullWidth
                  label={t('auth.login.emailLabel')}
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  margin="normal"
                  required
                  autoComplete="email"
                />
                <PremiumTextField
                  fullWidth
                  label={t('auth.login.passwordLabel')}
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
                    backgroundColor: 'primary.main',
                    color: 'common.white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                      transition: 'transform 0.1s ease',
                    },
                    '&:disabled': {
                      background: theme.palette.action.disabledBackground,
                      color: theme.palette.action.disabled,
                    },
                    transition: 'all 0.2s ease',
                  }}
                  disabled={loading}
                >
                  {loading ? t('auth.login.signingIn') : t('auth.login.signInButton')}
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
                    border: 'none',
                    backgroundColor: alpha(theme.palette.secondary.main, 0.08),
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.secondary.main, 0.14),
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                      transition: 'transform 0.1s ease',
                    },
                    '&:disabled': {
                      backgroundColor: theme.palette.action.disabledBackground,
                      color: theme.palette.action.disabled,
                    },
                    transition: 'all 0.2s ease',
                  }}
                  disabled={loading}
                  onClick={handleMobileLogin}
                >
                  {loading ? t('auth.login.signingIn') : t('auth.login.mobileSignInButton')}
                </Button>
              </Box>
            </TabPanel>

            {/* Registration Tab */}
            <TabPanel value={tabValue} index={1} idPrefix="auth" contentSx={{ pt: 3 }}>
              <Box component="form" onSubmit={handleRegister}>
                <PremiumTextField
                  fullWidth
                  label={t('auth.login.firstNameLabel')}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  margin="normal"
                  required
                />
                <PremiumTextField
                  fullWidth
                  label={t('auth.login.lastNameLabel')}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  margin="normal"
                  required
                />
                <PremiumTextField
                  fullWidth
                  label={t('auth.login.emailLabel')}
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  margin="normal"
                  required
                  autoComplete="email"
                />
                <PremiumTextField
                  fullWidth
                  label={t('auth.login.phoneLabel')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  margin="normal"
                />
                <PremiumTextField
                  fullWidth
                  label={t('auth.login.passwordLabel')}
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
                  label={t('auth.login.confirmPasswordLabel')}
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
                    backgroundColor: 'primary.main',
                    color: 'common.white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                      transition: 'transform 0.1s ease',
                    },
                    '&:disabled': {
                      background: theme.palette.action.disabledBackground,
                      color: theme.palette.action.disabled,
                    },
                    transition: 'all 0.2s ease',
                  }}
                  disabled={loading}
                >
                  {loading ? t('auth.login.creating') : t('auth.login.createAccountButton')}
                </Button>
              </Box>
            </TabPanel>

            <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
              {t('auth.login.manageReservationsPrefix')}{' '}
              {tabValue === 0 ? (
                <Link 
                  component="button" 
                  onClick={() => setTabValue(1)}
                  sx={{
                    color: 'primary.main',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    textDecorationColor: 'secondary.main',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      textDecorationColor: 'secondary.dark',
                      color: 'primary.dark',
                    },
                  }}
                >
                  {t('auth.login.createAccount')}
                </Link>
              ) : (
                <Link 
                  component="button" 
                  onClick={() => setTabValue(0)}
                  sx={{
                    color: 'primary.main',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    textDecorationColor: 'secondary.main',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      textDecorationColor: 'secondary.dark',
                      color: 'primary.dark',
                    },
                  }}
                >
                  {t('auth.login.signIn')}
                </Link>
              )}{' '}
              {t('auth.login.manageReservationsSuffix')}
            </Typography>
        </SurfaceCard>
      </Box>
    </PageContainer>
  );
};

export default GuestAuthPage;
