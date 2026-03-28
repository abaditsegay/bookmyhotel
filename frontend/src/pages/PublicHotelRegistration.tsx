import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Alert,
  Grid,
} from '@mui/material';
import { Login, CheckCircle } from '@mui/icons-material';
import PremiumTextField from '../components/common/PremiumTextField';
import { API_CONFIG } from '../config/apiConfig';

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
          errorMessage = Object.values(errorData.fieldErrors as Record<string, string>).join('. ');
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

  const isFormValid = registrationForm.hotelName.trim() !== '' &&
    registrationForm.contactPerson.trim() !== '' &&
    registrationForm.contactEmail.trim() !== '' &&
    registrationForm.address.trim() !== '' &&
    registrationForm.city.trim() !== '';

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('publicHotelRegistration.title')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {submitted ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              {t('publicHotelRegistration.success.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {t('publicHotelRegistration.success.description.before')} <strong>{submittedHotelName}</strong> {t('publicHotelRegistration.success.description.after')}
            </Typography>
            <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
              {t('publicHotelRegistration.success.emailNotice.before')} <strong>{submittedEmail}</strong>. {t('publicHotelRegistration.success.emailNotice.after')}
            </Alert>

            <Box sx={{ mt: 3, p: 3, bgcolor: 'grey.50', borderRadius: 2, textAlign: 'left' }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('publicHotelRegistration.nextSteps.title')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2">1. {t('publicHotelRegistration.nextSteps.step1')}</Typography>
                <Typography variant="body2">2. {t('publicHotelRegistration.nextSteps.step2')}</Typography>
                <Typography variant="body2">3. {t('publicHotelRegistration.nextSteps.step3')}</Typography>
                <Typography variant="body2">4. {t('publicHotelRegistration.nextSteps.step4')}</Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              startIcon={<Login />}
              onClick={handleGoToLogin}
              size="large"
              sx={{ mt: 3 }}
            >
              {t('publicHotelRegistration.actions.goToLogin')}
            </Button>
          </Paper>
        ) : (
          <Paper sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom>
              {t('publicHotelRegistration.form.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {t('publicHotelRegistration.form.subtitle')}
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <PremiumTextField
                  label={t('publicHotelRegistration.form.fields.hotelName')}
                  fullWidth
                  required
                  value={registrationForm.hotelName}
                  onChange={(e) => handleRegistrationFormChange('hotelName', e.target.value)}
                  placeholder={t('publicHotelRegistration.form.placeholders.hotelName')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  label={t('publicHotelRegistration.form.fields.contactPerson')}
                  fullWidth
                  required
                  value={registrationForm.contactPerson}
                  onChange={(e) => handleRegistrationFormChange('contactPerson', e.target.value)}
                  placeholder={t('publicHotelRegistration.form.placeholders.contactPerson')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  label={t('publicHotelRegistration.form.fields.contactEmail')}
                  type="email"
                  fullWidth
                  required
                  value={registrationForm.contactEmail}
                  onChange={(e) => handleRegistrationFormChange('contactEmail', e.target.value)}
                  placeholder={t('publicHotelRegistration.form.placeholders.contactEmail')}
                />
              </Grid>

              <Grid item xs={12}>
                <PremiumTextField
                  label={t('publicHotelRegistration.form.fields.address')}
                  fullWidth
                  required
                  value={registrationForm.address}
                  onChange={(e) => handleRegistrationFormChange('address', e.target.value)}
                  placeholder={t('publicHotelRegistration.form.placeholders.address')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  label={t('publicHotelRegistration.form.fields.city')}
                  fullWidth
                  required
                  value={registrationForm.city}
                  onChange={(e) => handleRegistrationFormChange('city', e.target.value)}
                  placeholder={t('publicHotelRegistration.form.placeholders.city')}
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

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/')}
                disabled={loading}
              >
                {t('publicHotelRegistration.actions.cancel')}
              </Button>
              <Button
                variant="contained"
                onClick={handleRegistrationSubmit}
                disabled={!isFormValid || loading}
                size="large"
              >
                {loading ? t('publicHotelRegistration.actions.submitting') : t('publicHotelRegistration.actions.submit')}
              </Button>
            </Box>

            <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('publicHotelRegistration.nextSteps.title')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">1. {t('publicHotelRegistration.nextSteps.step1')}</Typography>
                <Typography variant="body2">2. {t('publicHotelRegistration.nextSteps.step2')}</Typography>
                <Typography variant="body2">3. {t('publicHotelRegistration.nextSteps.step3')}</Typography>
                <Typography variant="body2">4. {t('publicHotelRegistration.nextSteps.step4')}</Typography>
              </Box>
            </Box>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default PublicHotelRegistration;
