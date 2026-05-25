import React, { useState } from 'react';
import {
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { API_CONFIG } from '../config/apiConfig';
import PremiumTextField from '../components/common/PremiumTextField';
import StandardButton from '../components/common/StandardButton';
import { PageContainer, SurfaceCard } from '../components/common';
import { useSubmissionError } from '../contexts/SubmissionErrorContext';
import { getPageShellBackground } from '../theme/surfaces';
import { tintedPanelSx } from '../theme/sxHelpers';

const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { showSubmissionError } = useSubmissionError();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

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
            {t('auth.forgotPassword.title')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            {t('auth.forgotPassword.subtitle')}
          </Typography>
        </Box>

        {success ? (
          <Box sx={{ textAlign: 'center', py: 1 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('auth.forgotPassword.checkInbox')}
            </Typography>
            <StandardButton
              variant="outlined"
              onClick={() => navigate('/login')}
            >
              {t('auth.forgotPassword.backToLogin')}
            </StandardButton>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
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
            <StandardButton
              type="submit"
              fullWidth
              variant="contained"
              loading={loading}
              loadingText={t('auth.forgotPassword.sending')}
              buttonSize="large"
              sx={{ mt: 3, mb: 2 }}
            >
              {t('auth.forgotPassword.sendButton')}
            </StandardButton>
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <StandardButton
                component={RouterLink}
                to="/login"
                variant="text"
                buttonSize="small"
              >
                {t('auth.forgotPassword.backToLogin')}
              </StandardButton>
            </Box>
          </form>
        )}
      </SurfaceCard>
    </PageContainer>
  );
};

export default ForgotPasswordPage;
