import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { API_CONFIG } from '../config/apiConfig';
import PremiumTextField from '../components/common/PremiumTextField';
import StandardButton from '../components/common/StandardButton';
import { PageContainer, SurfaceCard } from '../components/common';
import { useSubmissionError } from '../contexts/SubmissionErrorContext';
import { getPageShellBackground } from '../theme/surfaces';
import { tintedPanelSx } from '../theme/sxHelpers';

const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { showSubmissionError } = useSubmissionError();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [success, setSuccess] = useState('');

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

    if (newPassword.length < 6) {
      showSubmissionError(t('auth.resetPassword.passwordTooShort'));
      return;
    }

    if (newPassword !== confirmPassword) {
      showSubmissionError(t('auth.resetPassword.passwordsNoMatch'));
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
        showSubmissionError(data.message || t('auth.resetPassword.errorMessage'), {
          fallbackMessage: t('auth.resetPassword.errorMessage'),
        });
      }
    } catch {
      showSubmissionError(t('auth.resetPassword.errorMessage'), {
        fallbackMessage: t('auth.resetPassword.errorMessage'),
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading state while validating token
  if (validating) {
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
        <CircularProgress color="primary" />
      </PageContainer>
    );
  }

  // Invalid or missing token
  if (!token || !tokenValid) {
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
        <SurfaceCard
          elevation={0}
          sx={{ width: '100%', maxWidth: 560, textAlign: 'center' }}
          contentSx={{ p: { xs: 3, md: 4 } }}
        >
          <Box sx={{ ...tintedPanelSx('error'), mb: 3 }}>
            <Typography variant="h5" color="error" gutterBottom>
              {t('auth.resetPassword.invalidTokenTitle')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('auth.resetPassword.invalidTokenMessage')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
            <StandardButton
              component={RouterLink}
              to="/forgot-password"
              variant="contained"
            >
              {t('auth.resetPassword.requestNewLink')}
            </StandardButton>
            <StandardButton
              component={RouterLink}
              to="/login"
              variant="outlined"
            >
              {t('auth.forgotPassword.backToLogin')}
            </StandardButton>
          </Box>
        </SurfaceCard>
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
      <SurfaceCard
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 560,
        }}
        contentSx={{ p: { xs: 3, md: 4 } }}
      >
        <Box
          sx={{
            ...tintedPanelSx('primary'),
            textAlign: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 700 }}>
            {t('auth.resetPassword.title')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            {t('auth.resetPassword.subtitle')}
          </Typography>
        </Box>

        {success ? (
          <Box sx={{ textAlign: 'center', py: 1 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
            <StandardButton
              variant="contained"
              onClick={() => navigate('/login')}
            >
              {t('auth.resetPassword.goToLogin')}
            </StandardButton>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
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
            <StandardButton
              type="submit"
              fullWidth
              variant="contained"
              loading={loading}
              loadingText={t('auth.resetPassword.resetting')}
              buttonSize="large"
              sx={{ mt: 3 }}
            >
              {t('auth.resetPassword.resetButton')}
            </StandardButton>
          </form>
        )}
      </SurfaceCard>
    </PageContainer>
  );
};

export default ResetPasswordPage;
