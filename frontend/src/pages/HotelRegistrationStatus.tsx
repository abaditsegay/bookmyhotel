import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  Chip,
  IconButton,
  Grid,
} from '@mui/material';
import {
  ArrowBack,
  Search,
  Hotel,
  CheckCircle,
  HourglassEmpty,
  Cancel,
  Visibility,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PremiumDisplayField from '../components/common/PremiumDisplayField';

interface RegistrationStatus {
  id: number;
  hotelName: string;
  contactEmail: string;
  contactPerson: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewComments?: string;
}

const HotelRegistrationStatus: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registration, setRegistration] = useState<RegistrationStatus | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRegistration(null);
    
    if (!email.trim()) {
      setError(t('hotelRegistrationStatus.errors.enterEmail'));
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`/api/public/hotel-registration/status?email=${encodeURIComponent(email.trim())}`);
      
      if (response.status === 404) {
        setError(t('hotelRegistrationStatus.errors.notFound'));
        return;
      }
      
      if (!response.ok) {
        const errorMessage = response.headers.get('Error-Message') || t('hotelRegistrationStatus.errors.checkFailed');
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setRegistration(result);
      
    } catch (err: any) {
      // console.error('Error checking registration status:', err);
      setError(err.message || t('hotelRegistrationStatus.errors.checkFailedRetry'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'pending':
      case 'under_review':
        return <HourglassEmpty sx={{ color: 'warning.main' }} />;
      case 'rejected':
        return <Cancel sx={{ color: 'error.main' }} />;
      default:
        return <Visibility sx={{ color: 'info.main' }} />;
    }
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'under_review':
        return 'info';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const locale = i18n.language === 'am' ? 'am-ET' : i18n.language === 'om' ? 'om-ET' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate('/')} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('hotelRegistrationStatus.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('hotelRegistrationStatus.subtitle')}
          </Typography>
        </Box>
      </Box>

      {/* Search Form */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              label={t('booking.find.fields.email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('hotelRegistrationStatus.emailPlaceholder')}
              required
            />
            <Button
              type="submit"
              variant="contained"
              startIcon={<Search />}
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? t('booking.find.buttons.searching') : t('hotelRegistrationStatus.actions.search')}
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
        </form>
      </Paper>

      {/* Registration Details */}
      {registration && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Hotel sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h5" gutterBottom>
                  {registration.hotelName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('hotelRegistrationStatus.registrationId', { id: registration.id })}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getStatusIcon(registration.status)}
                <Chip 
                  label={t(`hotelRegistrationStatus.statuses.${registration.status.toLowerCase()}`, registration.status.replace('_', ' ').toUpperCase())} 
                  color={getStatusColor(registration.status)}
                  variant="outlined"
                />
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <PremiumDisplayField
                  label={t('hotelRegistrationStatus.fields.contactPerson')}
                  value={registration.contactPerson}
                  isEditMode={false}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PremiumDisplayField
                  label={t('hotelRegistrationStatus.fields.contactEmail')}
                  value={registration.contactEmail}
                  isEditMode={false}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PremiumDisplayField
                  label={t('hotelRegistrationStatus.fields.submitted')}
                  value={formatDate(registration.submittedAt)}
                  isEditMode={false}
                />
              </Grid>

              {registration.reviewedAt && (
                <Grid item xs={12} sm={6}>
                  <PremiumDisplayField
                    label={t('hotelRegistrationStatus.fields.reviewed')}
                    value={formatDate(registration.reviewedAt)}
                    isEditMode={false}
                  />
                </Grid>
              )}

              {registration.reviewComments && (
                <Grid item xs={12}>
                  <PremiumDisplayField
                    label={t('hotelRegistrationStatus.fields.comments')}
                    value={registration.reviewComments}
                    isEditMode={false}
                    multiline
                    rows={3}
                  />
                </Grid>
              )}
            </Grid>

            {/* Status-specific information */}
            {registration.status.toLowerCase() === 'pending' && (
              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>{t('hotelRegistrationStatus.messages.pendingTitle')}</strong><br />
                  {t('hotelRegistrationStatus.messages.pendingBody')}
                </Typography>
              </Alert>
            )}

            {registration.status.toLowerCase() === 'approved' && (
              <Alert severity="success" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>{t('hotelRegistrationStatus.messages.approvedTitle')}</strong><br />
                  {t('hotelRegistrationStatus.messages.approvedBody')}
                </Typography>
              </Alert>
            )}

            {registration.status.toLowerCase() === 'rejected' && (
              <Alert severity="error" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>{t('hotelRegistrationStatus.messages.rejectedTitle')}</strong><br />
                  {t('hotelRegistrationStatus.messages.rejectedBody')}
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Help Information */}
      <Card sx={{ mt: 3, bgcolor: 'grey.50' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('hotelRegistrationStatus.help.title')}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {t('hotelRegistrationStatus.help.description')}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • {t('hotelRegistrationStatus.help.tip1')}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • {t('hotelRegistrationStatus.help.tip2')}
          </Typography>
          <Typography variant="body2">
            • {t('hotelRegistrationStatus.help.tip3')}
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default HotelRegistrationStatus;
