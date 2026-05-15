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
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { API_CONFIG } from '../config/apiConfig';
import PremiumTextField from '../components/common/PremiumTextField';
import { useSubmissionError } from '../contexts/SubmissionErrorContext';
import { getElevatedCardShadow, getPageShellBackground, getReadableAccentTextColor } from '../theme/surfaces';

const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const readableAccentColor = getReadableAccentTextColor(theme);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { showSubmissionError } = useSubmissionError();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const headerGradient = `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showSubmissionError(t('auth.forgotPassword.invalidEmail'));
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
        showSubmissionError(data.message || t('auth.forgotPassword.errorMessage'), {
          fallbackMessage: t('auth.forgotPassword.errorMessage'),
        });
      }
    } catch {
      showSubmissionError(t('auth.forgotPassword.errorMessage'), {
        fallbackMessage: t('auth.forgotPassword.errorMessage'),
      });
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
        background: getPageShellBackground(theme),
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: getElevatedCardShadow(theme),
            border: `1px solid ${theme.palette.divider}`,
            backgroundImage: 'none',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              background: headerGradient,
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
                    background: headerGradient,
                    boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.34 : 0.3)}`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.dark} 100%)`,
                      boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.42 : 0.4)}`,
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
                    sx={{ color: readableAccentColor }}
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
