import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Alert, 
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
import { PageContainer, SurfaceCard } from '../components/common';
import PremiumTextField from '../components/common/PremiumTextField';
import StandardButton from '../components/common/StandardButton';
import { getPageShellBackground } from '../theme/surfaces';
import { tintedPanelSx } from '../theme/sxHelpers';
import { extractAuthErrorMessage } from '../utils/authErrorMessage';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const authLinkButtonSx = {
    px: 0,
    minWidth: 'auto',
    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.92)' : theme.palette.primary.main,
    fontWeight: 700,
    '&:hover': {
      backgroundColor: 'transparent',
      color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.primary.dark,
    },
  };
  
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

  useEffect(() => {
    const verificationStatus = new URLSearchParams(location.search).get('verified');

    if (verificationStatus === 'success') {
      setSuccess(t('auth.login.emailVerificationSuccess'));
      setError('');
      setShowSignUp(false);
      clearError();
      return;
    }

    if (verificationStatus === 'invalid') {
      setError(t('auth.login.emailVerificationFailed'));
      setSuccess('');
      setShowSignUp(false);
      clearError();
    }
  }, [location.search, t, clearError]);

  // Redirect already authenticated users to their appropriate dashboard
  useEffect(() => {
    if (!isInitializing && isAuthenticated && user) {
      // Inactive hotel — redirect hotel admins to their registration detail page
      if (user.accountStatus === 'HOTEL_INACTIVE') {
        navigate('/hotel-admin/my-registration', { replace: true });
        return;
      }
      if (user.accountStatus === 'USER_SUSPENDED') {
        navigate('/account-status?reason=suspended', { replace: true });
        return;
      }

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
        const errorMessage = await extractAuthErrorMessage(response, t('auth.login.registrationFailed'));
        throw new Error(errorMessage);
      }

      const registrationData = await response.json();

      setSuccess(registrationData.message || t('auth.login.registrationSuccess'));
      setError('');
      setShowSignUp(false);
      setRegisterEmail('');
      setRegisterPassword('');
      setConfirmPassword('');
      setFirstName('');
      setLastName('');
      setPhone('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.login.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Get the error to display (prefer auth context error, then local error)
  // But exclude session expiration errors since they're handled by the modal dialog
  const displayError = (authError && !authError.includes('session has expired')) ? authError : error;

  // Show loading state while checking authentication from localStorage
  if (isInitializing) {
    return (
      <PageContainer
        maxWidth="sm"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: getPageShellBackground(theme),
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <Typography variant="h6">{t('errors.loading')}</Typography>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: getPageShellBackground(theme),
        py: 4,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          gap: isMobile ? 3 : 6,
          width: '100%',
        }}
      >
        {/* Main Login Form */}
        <SurfaceCard
          elevation={0}
          sx={{ 
            maxWidth: 500, 
            width: '100%', 
            height: 'fit-content',
          }}
          contentSx={{ p: isMobile ? 3 : 5 }}
        >
            <Box
              sx={{
                width: 'min(220px, 68%)',
                mx: 'auto',
                mb: 2,
                overflow: 'hidden',
              }}
            >
              <Box
                component="img"
                src="/logos/logo.png"
                alt="BookMyHotel logo"
                sx={{
                  display: 'block',
                  width: '112%',
                  maxWidth: 'none',
                  height: 'auto',
                  ml: '-5%',
                  mt: '-4%',
                  mb: '-6%',
                }}
              />
            </Box>
            
            {bookingData && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  {t('auth.login.signInToBook', { hotelName: bookingData.hotelName })}
                </Typography>
              </Alert>
            )}

            {/* Sign In/Up Header */}
            <Box sx={{ ...tintedPanelSx(showSignUp ? 'secondary' : 'primary'), mb: 3, textAlign: 'center' }}>
              <Typography 
                variant="h5" 
                component="h2" 
                sx={{ 
                  fontWeight: 700,
                  color: 'text.primary',
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
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  alignItems: 'flex-start',
                  '& .MuiAlert-message': {
                    width: '100%',
                    overflowWrap: 'anywhere',
                    lineHeight: 1.55,
                  },
                }}
              >
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
              <form onSubmit={handleSubmit} data-testid="login-form">
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
                  <StandardButton
                    component={RouterLink}
                    to="/forgot-password"
                    variant="text"
                    buttonSize="small"
                    sx={authLinkButtonSx}
                  >
                    {t('auth.login.forgotPassword')}
                  </StandardButton>
                </Box>
                <StandardButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  loading={loading}
                  loadingText={t('auth.login.signingIn')}
                  buttonSize="large"
                  data-testid="login-button"
                  sx={{ mt: 4, mb: 2 }}
                >
                  {t('auth.login.signInButton')}
                </StandardButton>
              </form>
            ) : (
              // Sign Up Form
              <form onSubmit={handleRegister}>
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
                <StandardButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  loading={loading}
                  loadingText={t('auth.login.creating')}
                  buttonSize="large"
                  color="secondary"
                  sx={{ mt: 4, mb: 2 }}
                >
                  {t('auth.login.createAccountButton')}
                </StandardButton>
              </form>
            )}

            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
              {!showSignUp ? (
                <>
                  {t('auth.login.needAccount')}{' '}
                  <StandardButton 
                    variant="text" 
                    onClick={() => setShowSignUp(true)}
                    buttonSize="small"
                    sx={authLinkButtonSx}
                  >
                    {t('auth.login.createAccount')}
                  </StandardButton>
                </>
              ) : (
                <>
                  {t('auth.login.alreadyHaveAccount')}{' '}
                  <StandardButton 
                    variant="text" 
                    onClick={() => setShowSignUp(false)}
                    buttonSize="small"
                    sx={authLinkButtonSx}
                  >
                    {t('auth.login.signIn')}
                  </StandardButton>
                </>
              )}
            </Typography>

        </SurfaceCard>

      </Box>
    </PageContainer>
  );
};

export default LoginPage;
