import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        throw new Error(errorMessage || 'Failed to submit registration. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit hotel registration. Please try again.');
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
          Register Your Hotel
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
              Registration Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Your hotel <strong>{submittedHotelName}</strong> has been registered successfully.
            </Typography>
            <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
              An email with your temporary login credentials has been sent to <strong>{submittedEmail}</strong>.
              Please check your inbox (and spam folder) for the login details.
            </Alert>

            <Box sx={{ mt: 3, p: 3, bgcolor: 'grey.50', borderRadius: 2, textAlign: 'left' }}>
              <Typography variant="subtitle2" gutterBottom>
                What happens next?
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2">1. Check your email for temporary login credentials</Typography>
                <Typography variant="body2">2. Log in to complete your hotel profile</Typography>
                <Typography variant="body2">3. Our team will review and approve your registration</Typography>
                <Typography variant="body2">4. Start managing your hotel on our platform</Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              startIcon={<Login />}
              onClick={handleGoToLogin}
              size="large"
              sx={{ mt: 3 }}
            >
              Go to Login
            </Button>
          </Paper>
        ) : (
          <Paper sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom>
              Hotel Information
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Provide basic details to get started. You can complete your hotel profile after logging in.
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <PremiumTextField
                  label="Hotel Name"
                  fullWidth
                  required
                  value={registrationForm.hotelName}
                  onChange={(e) => handleRegistrationFormChange('hotelName', e.target.value)}
                  placeholder="Enter your hotel name"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  label="Contact Person"
                  fullWidth
                  required
                  value={registrationForm.contactPerson}
                  onChange={(e) => handleRegistrationFormChange('contactPerson', e.target.value)}
                  placeholder="Enter contact person name"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  label="Contact Email"
                  type="email"
                  fullWidth
                  required
                  value={registrationForm.contactEmail}
                  onChange={(e) => handleRegistrationFormChange('contactEmail', e.target.value)}
                  placeholder="Enter contact email"
                />
              </Grid>

              <Grid item xs={12}>
                <PremiumTextField
                  label="Address"
                  fullWidth
                  required
                  value={registrationForm.address}
                  onChange={(e) => handleRegistrationFormChange('address', e.target.value)}
                  placeholder="Enter your hotel address"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  label="City"
                  fullWidth
                  required
                  value={registrationForm.city}
                  onChange={(e) => handleRegistrationFormChange('city', e.target.value)}
                  placeholder="Enter city"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  label="Country"
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
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleRegistrationSubmit}
                disabled={!isFormValid || loading}
                size="large"
              >
                {loading ? 'Submitting...' : 'Submit Registration'}
              </Button>
            </Box>

            <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                What happens next?
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">1. An email with temporary login credentials will be sent to you</Typography>
                <Typography variant="body2">2. Log in to complete your hotel profile</Typography>
                <Typography variant="body2">3. Our team will review and approve your registration</Typography>
                <Typography variant="body2">4. Start managing your hotel on our platform</Typography>
              </Box>
            </Box>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default PublicHotelRegistration;
