import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { API_CONFIG } from '../config/apiConfig';
import { COLORS, addAlpha, getGradient } from '../theme/themeColors';
import PremiumTextField from '../components/common/PremiumTextField';

const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setValidating(false);
      setTokenValid(false);
      return;
    }

    const validateToken = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/auth/validate-reset-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await response.json();
        setTokenValid(data.valid === true);
      } catch {
        setTokenValid(false);
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError(t('auth.resetPassword.passwordTooShort'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('auth.resetPassword.passwordsNoMatch'));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(t('auth.resetPassword.successMessage'));
      } else {
        setError(data.message || t('auth.resetPassword.errorMessage'));
      }
    } catch {
      setError(t('auth.resetPassword.errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  // Loading state while validating token
  if (validating) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: getGradient('primaryDiagonal'),
        }}
      >
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  // Invalid or missing token
  if (!token || !tokenValid) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: getGradient('primaryDiagonal'),
          px: 2,
        }}
      >
        <Container maxWidth="sm">
          <Card sx={{ borderRadius: 3, textAlign: 'center' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" color="error" gutterBottom>
                {t('auth.resetPassword.invalidTokenTitle')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {t('auth.resetPassword.invalidTokenMessage')}
              </Typography>
              <Button
                component={RouterLink}
                to="/forgot-password"
                variant="contained"
                sx={{ mr: 1 }}
              >
                {t('auth.resetPassword.requestNewLink')}
              </Button>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
              >
                {t('auth.forgotPassword.backToLogin')}
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: getGradient('primaryDiagonal'),
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: `0 20px 60px ${addAlpha(COLORS.PRIMARY, 0.15)}`,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              background: getGradient('primaryDiagonal'),
              py: 4,
              px: 3,
              textAlign: 'center',
            }}
          >
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
              {t('auth.resetPassword.title')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
              {t('auth.resetPassword.subtitle')}
            </Typography>
          </Box>

          <CardContent sx={{ p: isMobile ? 3 : 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Alert severity="success" sx={{ mb: 3 }}>
                  {success}
                </Alert>
                <Button
                  variant="contained"
                  onClick={() => navigate('/login')}
                  sx={{
                    mt: 1,
                    background: getGradient('primaryDiagonal'),
                  }}
                >
                  {t('auth.resetPassword.goToLogin')}
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit}>
                <PremiumTextField
                  fullWidth
                  label={t('auth.resetPassword.newPasswordLabel')}
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  margin="normal"
                  required
                  autoComplete="new-password"
                  autoFocus
                />
                <PremiumTextField
                  fullWidth
                  label={t('auth.resetPassword.confirmPasswordLabel')}
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
                    mt: 3,
                    mb: 2,
                    py: 1.5,
                    borderRadius: 1,
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    background: getGradient('primaryDiagonal'),
                    boxShadow: `0 4px 15px ${addAlpha(COLORS.PRIMARY, 0.3)}`,
                    '&:hover': {
                      boxShadow: `0 6px 20px ${addAlpha(COLORS.PRIMARY, 0.4)}`,
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  {loading ? t('auth.resetPassword.resetting') : t('auth.resetPassword.resetButton')}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ResetPasswordPage;
