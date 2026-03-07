import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { API_CONFIG } from '../config/apiConfig';
import { COLORS, addAlpha, getGradient } from '../theme/themeColors';
import PremiumTextField from '../components/common/PremiumTextField';

const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('auth.forgotPassword.invalidEmail'));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(t('auth.forgotPassword.successMessage'));
      } else {
        setError(data.message || t('auth.forgotPassword.errorMessage'));
      }
    } catch {
      setError(t('auth.forgotPassword.errorMessage'));
    } finally {
      setLoading(false);
    }
  };

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
              {t('auth.forgotPassword.title')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
              {t('auth.forgotPassword.subtitle')}
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
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t('auth.forgotPassword.checkInbox')}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/login')}
                  sx={{ mt: 1 }}
                >
                  {t('auth.forgotPassword.backToLogin')}
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit}>
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
                  {loading ? t('auth.forgotPassword.sending') : t('auth.forgotPassword.sendButton')}
                </Button>
                <Box sx={{ textAlign: 'center', mt: 1 }}>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="text"
                    size="small"
                    sx={{ color: COLORS.PRIMARY }}
                  >
                    {t('auth.forgotPassword.backToLogin')}
                  </Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ForgotPasswordPage;
