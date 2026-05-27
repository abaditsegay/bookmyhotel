import React, { useState } from 'react';
import { normalizeEthiopianPhone } from '../../utils/phoneUtils';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  Send,
  Hotel,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthenticatedApi } from '../../hooks/useAuthenticatedApi';
import { useTenant } from '../../contexts/TenantContext';
import PremiumTextField from '../../components/common/PremiumTextField';
import { dialogSecondaryActionSx } from '../../theme/sxHelpers';

interface HotelFormData {
  // Basic Information
  hotelName: string;
  description: string;
  category: string;
  
  // Location Information  
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  
  // Contact Information
  phone: string;
  email: string;
  website: string;
  contactPerson: string;
  
  // Business Information
  licenseNumber: string;
  taxId: string;
  
  // Amenities
  amenities: string[];
}

const HotelRegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { adminApiService } = useAuthenticatedApi();
  const { tenantId } = useTenant();
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<HotelFormData>({
    hotelName: '',
    description: '',
    category: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    contactPerson: '',
    licenseNumber: '',
    taxId: '',
    amenities: [],
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Helper function to handle back navigation
  const handleBackToAdmin = () => {
    const returnTab = searchParams.get('returnTab');
    if (returnTab) {
      navigate(`/admin/dashboard?tab=${returnTab}`);
    } else {
      navigate('/system-dashboard');
    }
  };
  const [error, setError] = useState('');

  const steps = [
    t('admin.hotelRegistrationForm.steps.basicInformation'),
    t('admin.hotelRegistrationForm.steps.locationDetails'),
    t('admin.hotelRegistrationForm.steps.contactInformation'),
    t('admin.hotelRegistrationForm.steps.businessDetails')
  ];

  const categoryOptions = [
    { value: 'luxury', label: t('admin.hotelRegistrationForm.categories.luxury') },
    { value: 'business', label: t('admin.hotelRegistrationForm.categories.business') },
    { value: 'budget', label: t('admin.hotelRegistrationForm.categories.budget') },
    { value: 'boutique', label: t('admin.hotelRegistrationForm.categories.boutique') },
    { value: 'resort', label: t('admin.hotelRegistrationForm.categories.resort') },
  ];

  const handleInputChange = (field: keyof HotelFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSelectChange = (field: keyof HotelFormData) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!adminApiService) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Create hotel using real API
      const createRequest = {
        name: formData.hotelName,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        phone: normalizeEthiopianPhone(formData.phone),
        email: formData.email,
        tenantId: tenantId,
      };
      
      await adminApiService.createHotel(createRequest);
      // console.log('Hotel registered successfully:', formData);
      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        handleBackToAdmin();
      }, 2000);
      
    } catch (err: any) {
      // console.error('Error registering hotel:', err);
      setError(err.message || t('admin.hotelRegistrationForm.messages.registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <PremiumTextField
                fullWidth
                label={t('admin.hotelRegistrationForm.fields.hotelName')}
                value={formData.hotelName}
                onChange={handleInputChange('hotelName')}
                required
                placeholder={t('admin.hotelRegistrationForm.placeholders.hotelName')}
              />
            </Grid>
            <Grid item xs={12}>
              <PremiumTextField
                fullWidth
                label={t('admin.hotelRegistrationForm.fields.description')}
                value={formData.description}
                onChange={handleInputChange('description')}
                multiline
                rows={4}
                placeholder={t('admin.hotelRegistrationForm.placeholders.description')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{t('admin.hotelRegistrationForm.fields.category')}</InputLabel>
                <Select
                  value={formData.category}
                  onChange={handleSelectChange('category')}
                  label={t('admin.hotelRegistrationForm.fields.category')}
                >
                  {categoryOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <PremiumTextField
                fullWidth
                label={t('admin.hotelRegistrationForm.fields.address')}
                value={formData.address}
                onChange={handleInputChange('address')}
                required
                placeholder={t('admin.hotelRegistrationForm.placeholders.address')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label={t('admin.hotelRegistrationForm.fields.city')}
                value={formData.city}
                onChange={handleInputChange('city')}
                required
                placeholder={t('admin.hotelRegistrationForm.placeholders.city')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label={t('admin.hotelRegistrationForm.fields.stateProvince')}
                value={formData.state}
                onChange={handleInputChange('state')}
                placeholder={t('admin.hotelRegistrationForm.placeholders.stateProvince')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label={t('admin.hotelRegistrationForm.fields.country')}
                value={formData.country}
                onChange={handleInputChange('country')}
                required
                placeholder={t('admin.hotelRegistrationForm.placeholders.country')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label={t('admin.hotelRegistrationForm.fields.zipPostalCode')}
                value={formData.zipCode}
                onChange={handleInputChange('zipCode')}
                placeholder={t('admin.hotelRegistrationForm.placeholders.zipPostalCode')}
              />
            </Grid>
          </Grid>
        );
      
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label={t('admin.hotelRegistrationForm.fields.phoneNumber')}
                value={formData.phone}
                onChange={handleInputChange('phone')}
                required
                placeholder={t('admin.hotelRegistrationForm.placeholders.phoneNumber')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label={t('admin.hotelRegistrationForm.fields.emailAddress')}
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
                placeholder={t('admin.hotelRegistrationForm.placeholders.emailAddress')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label={t('admin.hotelRegistrationForm.fields.website')}
                value={formData.website}
                onChange={handleInputChange('website')}
                placeholder={t('admin.hotelRegistrationForm.placeholders.website')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label={t('admin.hotelRegistrationForm.fields.contactPerson')}
                value={formData.contactPerson}
                onChange={handleInputChange('contactPerson')}
                required
                placeholder={t('admin.hotelRegistrationForm.placeholders.contactPerson')}
              />
            </Grid>
          </Grid>
        );
      
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label={t('admin.hotelRegistrationForm.fields.businessLicenseNumber')}
                value={formData.licenseNumber}
                onChange={handleInputChange('licenseNumber')}
                required
                placeholder={t('admin.hotelRegistrationForm.placeholders.businessLicenseNumber')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label={t('admin.hotelRegistrationForm.fields.taxId')}
                value={formData.taxId}
                onChange={handleInputChange('taxId')}
                required
                placeholder={t('admin.hotelRegistrationForm.placeholders.taxId')}
              />
            </Grid>
          </Grid>
        );
      
      default:
        return t('admin.hotelRegistrationForm.messages.unknownStep');
    }
  };

  if (success) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Hotel sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
            {t('admin.hotelRegistrationForm.messages.registerSuccessTitle')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {t('admin.hotelRegistrationForm.messages.registerSuccessBody', { hotelName: formData.hotelName })}
          </Typography>
          <IconButton onClick={handleBackToAdmin} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={handleBackToAdmin} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('admin.hotelRegistrationForm.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('admin.hotelRegistrationForm.description')}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Progress Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Form Content */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          {steps[activeStep]}
        </Typography>
        
        {renderStepContent(activeStep)}

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            variant="outlined"
            sx={dialogSecondaryActionSx}
          >
            {t('common.back')}
          </Button>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                variant="contained"
              >
                {t('common.next')}
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                variant="contained"
                startIcon={<Send />}
                disabled={loading}
              >
                {loading ? t('admin.hotelRegistrationForm.actions.registering') : t('admin.hotelRegistrationForm.actions.registerHotel')}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Summary Card for Final Step */}
      {activeStep === steps.length - 1 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('admin.hotelRegistrationForm.summary.title')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">{t('admin.hotelRegistrationForm.summary.hotelName')}</Typography>
              <Typography variant="body1">{formData.hotelName || t('common.notAvailable')}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">{t('admin.hotelRegistrationForm.summary.category')}</Typography>
              <Typography variant="body1">{formData.category || t('common.notAvailable')}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">{t('admin.hotelRegistrationForm.summary.location')}</Typography>
              <Typography variant="body1">
                {formData.city ? `${formData.city}, ${formData.country}` : t('common.notAvailable')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">{t('admin.hotelRegistrationForm.summary.contact')}</Typography>
              <Typography variant="body1">{formData.email || t('common.notAvailable')}</Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Container>
  );
};

export default HotelRegistrationForm;
