import React, { useState, useEffect } from 'react';
import { COLORS, addAlpha, getGradient } from '../theme/themeColors';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Container, 
  Typography, 
  Alert, 
  Divider, 
  Chip,
  useTheme,
  useMediaQuery,
  Stack,
} from '@mui/material';
import {
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { API_CONFIG } from '../config/apiConfig';
import PremiumTextField from '../components/common/PremiumTextField';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);
  
  // Registration form state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  
  const { login, error: authError, clearError, isAuthenticated, user, isInitializing, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect info from location state
  const redirectTo = location.state?.redirectTo;
  const bookingData = location.state?.bookingData;

  // Redirect already authenticated users to their appropriate dashboard
  useEffect(() => {
    if (!isInitializing && isAuthenticated && user) {
      // If there's a specific redirect with booking data, use that
      if (redirectTo && bookingData) {
        navigate(redirectTo, { state: bookingData, replace: true });
        return;
      }
      
      // Otherwise, redirect directly to the user's role-specific dashboard
      const dashboardPath = getDashboardPath();
      navigate(dashboardPath, { replace: true });
    }
  }, [isAuthenticated, user, isInitializing, redirectTo, bookingData, navigate, getDashboardPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError(); // Clear previous auth errors
    setLoading(true);

    try {
      await login(email, password);
      // Note: Navigation will be handled by the useEffect hook once user state is updated
      // This prevents calling getDashboardPath() before user state is set
    } catch (err) {
      // console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    clearError();

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

      setSuccess(t('auth.login.registrationSuccess'));

      // Small delay to show success message
      setTimeout(() => {
        if (redirectTo && bookingData) {
          navigate(redirectTo, { state: bookingData });
        } else {
          navigate('/');
        }
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.login.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const fillSampleUser = (sampleEmail: string, samplePassword: string) => {
    setEmail(sampleEmail);
    setPassword(samplePassword);
    clearError(); // Clear any existing errors
    setError(''); // Clear local errors
    setSuccess(''); // Clear success messages
  };

  // Get the error to display (prefer auth context error, then local error)
  // But exclude session expiration errors since they're handled by the modal dialog
  const displayError = (authError && !authError.includes('session has expired')) ? authError : error;

  // Show loading state while checking authentication from localStorage
  if (isInitializing) {
    return (
      <Container maxWidth="lg">
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
          <Typography variant="h6">{t('errors.loading')}</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[900]} 100%)`
          : getGradient('white'),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? 3 : 6,
            minHeight: '90vh',
          }}
        >
        {/* Main Login Form */}
        <Card 
          elevation={8}
          sx={{ 
            maxWidth: 500, 
            width: '100%', 
            height: 'fit-content',
            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 4,
            boxShadow: theme.shadows[8],
          }}
        >
          <CardContent sx={{ p: isMobile ? 3 : 5 }}>

            
            {bookingData && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  {t('auth.login.signInToBook', { hotelName: bookingData.hotelName })}
                </Typography>
              </Alert>
            )}

            {/* Sign In/Up Header */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography 
                variant="h5" 
                component="h2" 
                sx={{ 
                  fontWeight: 'bold',
                  color: 'primary.main',
                  mb: 1,
                }}
              >
                {!showSignUp ? t('auth.login.signIn') : t('auth.login.createAccount')}{bookingData ? ' to Book' : ''}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {!showSignUp 
                  ? t('auth.login.signInSubtitle')
                  : t('auth.login.createAccountSubtitle')
                }
              </Typography>
            </Box>

            {displayError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {displayError}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            {!showSignUp ? (
              // Sign In Form
              <Box component="form" onSubmit={handleSubmit} data-testid="login-form">
                <PremiumTextField
                  fullWidth
                  label={t('auth.login.emailLabel')}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                  autoComplete="email"
                  autoFocus
                  inputProps={{ 'data-testid': 'email-input' }}
                />
                <PremiumTextField
                  fullWidth
                  label={t('auth.login.passwordLabel')}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  required
                  autoComplete="current-password"
                  inputProps={{ 'data-testid': 'password-input' }}
                />
                <Box sx={{ textAlign: 'right', mt: 0.5 }}>
                  <Button
                    component={RouterLink}
                    to="/forgot-password"
                    variant="text"
                    size="small"
                    sx={{ 
                      color: COLORS.PRIMARY,
                      textTransform: 'none',
                      fontWeight: 500,
                      p: 0,
                      minWidth: 'auto',
                      '&:hover': { textDecoration: 'underline', background: 'transparent' },
                    }}
                  >
                    {t('auth.login.forgotPassword')}
                  </Button>
                </Box>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  data-testid="login-button"
                  sx={{ 
                    mt: 4, 
                    mb: 2,
                    py: 1.5,
                    borderRadius: 0,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    background: 'primary.main',
                    boxShadow: `0 4px 15px ${addAlpha(COLORS.PRIMARY, 0.3)}`,
                    '&:hover': {
                      background: 'primary.dark',
                      boxShadow: `0 6px 20px ${addAlpha(COLORS.PRIMARY, 0.4)}`,
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                  }}
                >
                  {loading ? t('auth.login.signingIn') : t('auth.login.signInButton')}
                </Button>
              </Box>
            ) : (
              // Sign Up Form
              <Box component="form" onSubmit={handleRegister}>
                <Stack direction="row" spacing={2}>
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
                </Stack>
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
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  margin="normal"
                  required
                  autoComplete="new-password"
                />
                <PremiumTextField
                  fullWidth
                  label={t('auth.login.confirmPasswordLabel')}
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
                  disabled={loading}
                  sx={{ 
                    mt: 4, 
                    mb: 2,
                    py: 1.5,
                    borderRadius: 0,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    background: 'secondary.main',
                    boxShadow: `0 4px 15px ${addAlpha(COLORS.SECONDARY, 0.3)}`,
                    '&:hover': {
                      background: 'secondary.dark',
                      boxShadow: `0 6px 20px ${addAlpha(COLORS.SECONDARY, 0.4)}`,
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                  }}
                >
                  {loading ? t('auth.login.creating') : t('auth.login.createAccountButton')}
                </Button>
              </Box>
            )}

            <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
              {!showSignUp ? (
                <>
                  {t('auth.login.needAccount')}{' '}
                  <Button 
                    variant="text" 
                    onClick={() => setShowSignUp(true)}
                    sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
                  >
                    Sign up here
                  </Button>
                </>
              ) : (
                <>
                  {t('auth.login.alreadyHaveAccount')}{' '}
                  <Button 
                    variant="text" 
                    onClick={() => setShowSignUp(false)}
                    sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
                  >
                    Sign in here
                  </Button>
                </>
              )}
            </Typography>

            {/* Test Credentials Hint - Only show on Sign In */}
            {!showSignUp && (
              <Divider sx={{ my: 3 }}>
                <Chip label="Test Credentials Available on the Right →" size="small" color="primary" />
              </Divider>
            )}
          </CardContent>
        </Card>

        {/* Test Credentials Panel - Only show on Sign In */}
        {!showSignUp && (
          <Card 
            elevation={8}
            sx={{ 
              maxWidth: 420, 
              width: '100%', 
              height: 'fit-content',
              background: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 4,
              boxShadow: theme.shadows[8],
            }}
          >
            <CardContent sx={{ p: isMobile ? 3 : 4 }}>
              {/* Professional Header for Test Credentials */}
              <Box 
                sx={{ 
                  mb: 3,
                  textAlign: 'center',
                  p: 2,
                  background: theme.palette.mode === 'dark' 
                    ? theme.palette.grey[800] 
                    : theme.palette.background.paper,
                  borderRadius: 0,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'bold',
                    color: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                  }}
                >
                  🚀 {t('auth.login.sampleUsers')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click any button below to auto-fill test credentials
                </Typography>
              </Box>
              
              <Stack spacing={2}>
                {/* System Admin User */}
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('admin@bookmyhotel.com', 'admin123')}
                  sx={{ 
                    textTransform: 'none', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    py: 2,
                    borderRadius: 0,
                    borderWidth: 2,
                    borderColor: theme.palette.primary.main,
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? theme.palette.grey[900] 
                      : theme.palette.background.paper,
                    '&:hover': {
                      borderColor: theme.palette.primary.dark,
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? theme.palette.grey[800] 
                        : theme.palette.background.paper,
                      transform: 'translateY(-2px)',
                      boxShadow: 'none',
                    },
                  }}
                >
                  <Typography variant="body2" fontWeight="bold" color="primary.main">⚡ {t('auth.login.systemAdmin')}</Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                    admin@bookmyhotel.com
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Password: admin123
                  </Typography>
                  <Typography variant="caption" color="primary.main" sx={{ mt: 0.5 }}>
                    🌐 Full System Access - ALL Tenants/Hotels
                  </Typography>
                </Button>

                {/* Divider for Hotel Users */}
                <Typography variant="caption" color="textSecondary" align="center" sx={{ py: 1 }}>
                  ── Hotel Staff Accounts ──
                </Typography>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('admin.grandplaza@bookmyhotel.com', 'admin123')}
                  sx={{ 
                    textTransform: 'none', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    py: 2,
                    borderRadius: 0,
                    borderWidth: 2,
                    borderColor: 'primary.main',
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? theme.palette.grey[800] 
                      : theme.palette.background.paper,
                    '&:hover': {
                      borderColor: 'primary.dark',
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? theme.palette.grey[700] 
                        : theme.palette.background.paper,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 15px ${addAlpha(COLORS.BLACK, 0.1)}`,
                    },
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">🏨 {t('auth.login.hotelAdmin')} - Grand Plaza</Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                    admin.grandplaza@bookmyhotel.com
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Password: admin123
                  </Typography>
                  <Typography variant="caption" color="info.main" sx={{ mt: 0.5 }}>
                    🏨 Grand Plaza Hotel (100 rooms)
                  </Typography>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('frontdesk.grandplaza@bookmyhotel.com', 'front123')}
                  sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 2 }}
                >
                  <Typography variant="body2" fontWeight="bold">🎯 {t('auth.login.frontDesk')} - Grand Plaza</Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                    frontdesk.grandplaza@bookmyhotel.com
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Password: front123
                  </Typography>
                  <Typography variant="caption" color="warning.main" sx={{ mt: 0.5 }}>
                    🎯 Grand Plaza Hotel Front Desk  
                  </Typography>
                </Button>

                {/* Sam's Hotel at Bole Users */}
                <Typography variant="caption" color="textSecondary" align="center" sx={{ py: 1 }}>
                  ── Sam's Hotel at Bole ──
                </Typography>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('samhotel.admin@samhotel.com', 'password123')}
                  sx={{ 
                    textTransform: 'none', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    py: 2,
                    borderRadius: 0,
                    borderWidth: 2,
                    borderColor: 'secondary.main',
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? theme.palette.grey[800] 
                      : theme.palette.background.paper,
                    '&:hover': {
                      borderColor: 'secondary.dark',
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? theme.palette.grey[700] 
                        : theme.palette.background.paper,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 15px ${addAlpha(COLORS.BLACK, 0.1)}`,
                    },
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">🏨 {t('auth.login.hotelAdmin')} - Sam's Hotel at Bole</Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                    samhotel.admin@samhotel.com
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Password: password123
                  </Typography>
                  <Typography variant="caption" color="secondary.main" sx={{ mt: 0.5 }}>
                    🏨 Sam's Hotel at Bole (Frisco)
                  </Typography>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('samhotel.frontdesk@samhotel.com', 'password123')}
                  sx={{ 
                    textTransform: 'none', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    py: 2,
                    borderRadius: 0,
                    borderWidth: 2,
                    borderColor: 'secondary.main',
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? theme.palette.grey[800] 
                      : theme.palette.background.paper,
                    '&:hover': {
                      borderColor: 'secondary.dark',
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? theme.palette.grey[700] 
                        : theme.palette.background.paper,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 15px ${addAlpha(COLORS.BLACK, 0.1)}`,
                    },
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">🎯 {t('auth.login.frontDesk')} - Sam's Hotel at Bole</Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                    samhotel.frontdesk@samhotel.com
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Password: password123
                  </Typography>
                  <Typography variant="caption" color="secondary.main" sx={{ mt: 0.5 }}>
                    🎯 Sam's Hotel at Bole Front Desk
                  </Typography>
                </Button>

              </Stack>
            </CardContent>
          </Card>
        )}
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;
