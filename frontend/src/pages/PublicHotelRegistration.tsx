import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Stack,
  Box,
  Alert,
  Grid,
  Typography,
} from '@mui/material';
import { Login, CheckCircle } from '@mui/icons-material';
import { PageContainer, StandardButton, SurfaceCard } from '../components/common';
import PremiumTextField from '../components/common/PremiumTextField';
import { API_CONFIG } from '../config/apiConfig';
import { designSystem } from '../theme/designSystem';
import { composeSx, formActionsRowSx, orderedListSx, tintedPanelSx } from '../theme/sxHelpers';

const registrationContainerSx = {
  minHeight: '100vh',
  justifyContent: 'center',
};

const registrationSectionSx = {
  py: {
    xs: designSystem.layout.pagePaddingY.xs,
    md: designSystem.layout.pagePaddingY.md,
  },
};

const headerStackSx = {
  gap: 1,
};

const formCardContentSx = {
  p: designSystem.layout.cardPadding,
};

const successCardContentSx = {
  ...formCardContentSx,
  textAlign: 'center',
};

const alertSx = {
  mb: designSystem.layout.sectionGap.md,
};

const successIconSx = {
  fontSize: 64,
  color: 'success.main',
  mb: 2,
};

const formGridSx = {
  mt: 1,
};

const orderedStepsTextSx = {
  color: 'text.secondary',
};

const primaryActionSx = {
  mt: designSystem.layout.sectionGap.md,
};

const primaryTintedPanelSx = tintedPanelSx('primary');
const primaryTintedPanelWithSpacingSx = composeSx(primaryTintedPanelSx, primaryActionSx);
const formActionsSectionSx = composeSx(formActionsRowSx, primaryActionSx);

const PublicHotelRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [submittedHotelName, setSubmittedHotelName] = useState('');

  const [registrationForm, setRegistrationForm] = useState({
    hotelName: '',
    contactPerson: '',
    contactEmail: '',
    address: '',
    city: '',
    country: 'Ethiopia'
  });

  const handleRegistrationFormChange = (field: string, value: string) => {
    setRegistrationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRegistrationSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_CONFIG.BASE_URL}/public/hotel-registration/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hotelName: registrationForm.hotelName,
          address: registrationForm.address,
          city: registrationForm.city,
          country: registrationForm.country,
          contactEmail: registrationForm.contactEmail,
          contactPerson: registrationForm.contactPerson
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSubmittedEmail(data.loginEmail);
        setSubmittedHotelName(data.hotelName);
        setSubmitted(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.userFriendlyMessage || errorData.message;
        if (!errorMessage && errorData.fieldErrors) {
          errorMessage = Object.keys(errorData.fieldErrors as Record<string, string>)
            .map((field) => (errorData.fieldErrors as Record<string, string>)[field])
            .join('. ');
        }
        throw new Error(errorMessage || t('publicHotelRegistration.messages.submitFailed'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('publicHotelRegistration.messages.submitFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleRegistrationSubmit();
  };

  const isFormValid = registrationForm.hotelName.trim() !== '' &&
    registrationForm.contactPerson.trim() !== '' &&
    registrationForm.contactEmail.trim() !== '' &&
    registrationForm.address.trim() !== '' &&
    registrationForm.city.trim() !== '';

  return (
    <PageContainer component="main" maxWidth="sm" sx={registrationContainerSx}>
      <Stack sx={registrationSectionSx} spacing={designSystem.layout.sectionGap.md}>
        <Stack sx={headerStackSx}>
          <Typography variant="h4" component="h1">
            {t('publicHotelRegistration.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('publicHotelRegistration.form.subtitle')}
          </Typography>
        </Stack>

        {error && (
          <Alert severity="error" sx={alertSx} role="alert">
            {error}
          </Alert>
        )}

        {submitted ? (
          <SurfaceCard contentSx={successCardContentSx}>
            <CheckCircle sx={successIconSx} />
            <Typography variant="h5" gutterBottom>
              {t('publicHotelRegistration.success.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {t('publicHotelRegistration.success.description.before')} <strong>{submittedHotelName}</strong> {t('publicHotelRegistration.success.description.after')}
            </Typography>
            <Alert severity="info" sx={alertSx}>
              {t('publicHotelRegistration.success.emailNotice.before')} <strong>{submittedEmail}</strong>. {t('publicHotelRegistration.success.emailNotice.after')}
            </Alert>

            <Box sx={primaryTintedPanelSx}>
              <Typography variant="subtitle2" gutterBottom>
                {t('publicHotelRegistration.nextSteps.title')}
              </Typography>
              <Box component="ol" sx={orderedListSx}>
                <li><Typography variant="body2" sx={orderedStepsTextSx}>{t('publicHotelRegistration.nextSteps.step1')}</Typography></li>
                <li><Typography variant="body2" sx={orderedStepsTextSx}>{t('publicHotelRegistration.nextSteps.step2')}</Typography></li>
                <li><Typography variant="body2" sx={orderedStepsTextSx}>{t('publicHotelRegistration.nextSteps.step3')}</Typography></li>
                <li><Typography variant="body2" sx={orderedStepsTextSx}>{t('publicHotelRegistration.nextSteps.step4')}</Typography></li>
              </Box>
            </Box>

            <StandardButton
              variant="contained"
              startIcon={<Login />}
              onClick={handleGoToLogin}
              buttonSize="large"
              sx={primaryActionSx}
            >
              {t('publicHotelRegistration.actions.goToLogin')}
            </StandardButton>
          </SurfaceCard>
        ) : (
          <SurfaceCard contentSx={formCardContentSx}>
            <Typography variant="h6" gutterBottom>
              {t('publicHotelRegistration.form.title')}
            </Typography>

            <form noValidate onSubmit={handleFormSubmit}>
              <Grid container spacing={2} sx={formGridSx}>
              <Grid item xs={12}>
                <PremiumTextField
                  label={t('publicHotelRegistration.form.fields.hotelName')}
                  fullWidth
                  required
                  disabled={loading}
                  value={registrationForm.hotelName}
                  onChange={(e) => handleRegistrationFormChange('hotelName', e.target.value)}
                  placeholder={t('publicHotelRegistration.form.placeholders.hotelName')}
                  autoComplete="organization"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  label={t('publicHotelRegistration.form.fields.contactPerson')}
                  fullWidth
                  required
                  disabled={loading}
                  value={registrationForm.contactPerson}
                  onChange={(e) => handleRegistrationFormChange('contactPerson', e.target.value)}
                  placeholder={t('publicHotelRegistration.form.placeholders.contactPerson')}
                  autoComplete="name"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  label={t('publicHotelRegistration.form.fields.contactEmail')}
                  type="email"
                  fullWidth
                  required
                  disabled={loading}
                  value={registrationForm.contactEmail}
                  onChange={(e) => handleRegistrationFormChange('contactEmail', e.target.value)}
                  placeholder={t('publicHotelRegistration.form.placeholders.contactEmail')}
                  autoComplete="email"
                />
              </Grid>

              <Grid item xs={12}>
                <PremiumTextField
                  label={t('publicHotelRegistration.form.fields.address')}
                  fullWidth
                  required
                  disabled={loading}
                  value={registrationForm.address}
                  onChange={(e) => handleRegistrationFormChange('address', e.target.value)}
                  placeholder={t('publicHotelRegistration.form.placeholders.address')}
                  autoComplete="street-address"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  label={t('publicHotelRegistration.form.fields.city')}
                  fullWidth
                  required
                  disabled={loading}
                  value={registrationForm.city}
                  onChange={(e) => handleRegistrationFormChange('city', e.target.value)}
                  placeholder={t('publicHotelRegistration.form.placeholders.city')}
                  autoComplete="address-level2"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  label={t('publicHotelRegistration.form.fields.country')}
                  fullWidth
                  value={registrationForm.country}
                  disabled
                />
              </Grid>
              </Grid>

              <Box sx={formActionsSectionSx}>
                <StandardButton
                  variant="outlined"
                  onClick={() => navigate('/')}
                  disabled={loading}
                >
                  {t('publicHotelRegistration.actions.cancel')}
                </StandardButton>
                <StandardButton
                  type="submit"
                  variant="contained"
                  disabled={!isFormValid || loading}
                  buttonSize="large"
                >
                  {loading ? t('publicHotelRegistration.actions.submitting') : t('publicHotelRegistration.actions.submit')}
                </StandardButton>
              </Box>
            </form>

            <Box sx={primaryTintedPanelWithSpacingSx}>
              <Typography variant="h6" gutterBottom>
                {t('publicHotelRegistration.nextSteps.title')}
              </Typography>
              <Box component="ol" sx={orderedListSx}>
                <li><Typography variant="body2" sx={orderedStepsTextSx}>{t('publicHotelRegistration.nextSteps.step1')}</Typography></li>
                <li><Typography variant="body2" sx={orderedStepsTextSx}>{t('publicHotelRegistration.nextSteps.step2')}</Typography></li>
                <li><Typography variant="body2" sx={orderedStepsTextSx}>{t('publicHotelRegistration.nextSteps.step3')}</Typography></li>
                <li><Typography variant="body2" sx={orderedStepsTextSx}>{t('publicHotelRegistration.nextSteps.step4')}</Typography></li>
              </Box>
            </Box>
          </SurfaceCard>
        )}
      </Stack>
    </PageContainer>
  );
};

export default PublicHotelRegistration;
