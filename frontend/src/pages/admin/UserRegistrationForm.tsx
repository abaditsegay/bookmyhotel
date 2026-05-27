import React, { useState, useEffect } from 'react';
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
  FormControlLabel,
  Switch,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  Send,
  PersonAdd,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { adminApiService, CreateUserRequest, TenantDTO, HotelDTO } from '../../services/adminApi';
import { useAuth } from '../../contexts/AuthContext';
import { HOTEL_SCOPED_ROLES } from '../../constants/roles';
import PremiumTextField from '../../components/common/PremiumTextField';
import { dialogSecondaryActionSx } from '../../theme/sxHelpers';

interface UserFormData {
  // Basic Information
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  
  // Account Information
  password: string;
  confirmPassword: string;
  role: string;
  tenantId: string;
  hotelId: string;
  
  // Profile Information
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  
  // Account Settings
  isActive: boolean;
  emailVerified: boolean;
}

const UserRegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: '',
    tenantId: '',
    hotelId: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    isActive: true,
    emailVerified: false,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [tenants, setTenants] = useState<TenantDTO[]>([]);
  const [hotels, setHotels] = useState<HotelDTO[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const { token, user: currentUser } = useAuth();

  // Roles this user is permitted to assign
  const creatableRoles = (() => {
    const callerRole = currentUser?.role || (currentUser?.roles?.[0] ?? '');
    if (callerRole === 'SUPER_ADMIN') return [
      { value: 'ADMIN', label: t('admin.userRegistrationForm.roles.ADMIN') },
      { value: 'HOTEL_ADMIN', label: t('admin.userRegistrationForm.roles.HOTEL_ADMIN') },
      { value: 'TESTER', label: t('admin.userRegistrationForm.roles.TESTER') },
    ];
    if (callerRole === 'ADMIN') return [
      { value: 'HOTEL_ADMIN', label: t('admin.userRegistrationForm.roles.HOTEL_ADMIN') },
      { value: 'TESTER', label: t('admin.userRegistrationForm.roles.TESTER') },
    ];
    return [
      { value: 'ADMIN', label: t('admin.userRegistrationForm.roles.ADMIN') },
      { value: 'HOTEL_ADMIN', label: t('admin.userRegistrationForm.roles.HOTEL_ADMIN') },
      { value: 'OPERATIONAL_ADMIN', label: t('admin.userRegistrationForm.roles.OPERATIONAL_ADMIN') },
      { value: 'FRONTDESK', label: t('admin.userRegistrationForm.roles.FRONTDESK') },
      { value: 'HOUSEKEEPING', label: t('admin.userRegistrationForm.roles.HOUSEKEEPING') },
      { value: 'MAINTENANCE', label: t('admin.userRegistrationForm.roles.MAINTENANCE') },
      { value: 'TESTER', label: t('admin.userRegistrationForm.roles.TESTER') },
      { value: 'CUSTOMER', label: t('admin.userRegistrationForm.roles.CUSTOMER') },
    ];
  })();
  
  // Load tenants on component mount
  useEffect(() => {
    const loadTenants = async () => {
      try {
        setLoadingTenants(true);
        if (token) {
          adminApiService.setToken(token);
          const activeTenants = await adminApiService.getActiveTenants();
          setTenants(activeTenants);
        }
      } catch (error) {
        // console.error('Failed to load tenants:', error);
        setError(t('admin.userRegistrationForm.messages.loadTenantsFailed'));
      } finally {
        setLoadingTenants(false);
      }
    };
    
    loadTenants();
  }, [token, t]);
  
  // Load hotels when tenant changes and role is hotel-scoped
  useEffect(() => {
    const loadHotels = async () => {
      if (formData.tenantId && HOTEL_SCOPED_ROLES.includes(formData.role as any)) {
        try {
          setLoadingHotels(true);
          if (token) {
            adminApiService.setToken(token);
            const tenantHotels = await adminApiService.getHotelsByTenant(formData.tenantId);
            setHotels(tenantHotels);
          }
        } catch (error) {
          // console.error('Failed to load hotels:', error);
          setError(t('admin.userRegistrationForm.messages.loadHotelsFailed'));
        } finally {
          setLoadingHotels(false);
        }
      } else {
        setHotels([]);
        setFormData(prev => ({ ...prev, hotelId: '' }));
      }
    };
    
    loadHotels();
  }, [formData.tenantId, formData.role, token, t]);
  
  // Helper function to handle back navigation
  const handleBackToAdmin = () => {
    const returnTab = searchParams.get('returnTab');
    if (returnTab) {
      navigate(`/admin/dashboard?tab=${returnTab}`);
    } else {
      navigate('/system-dashboard');
    }
  };

  const steps = [
    t('admin.userRegistrationForm.steps.basicInformation'),
    t('admin.userRegistrationForm.steps.accountSetup'),
    t('admin.userRegistrationForm.steps.profileDetails'),
    t('admin.userRegistrationForm.steps.accountSettings')
  ];

  const handleInputChange = (field: keyof UserFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
    // Clear password error when user types
    if (field === 'password' || field === 'confirmPassword') {
      setPasswordError('');
    }
  };

  const handleSelectChange = (field: keyof UserFormData) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSwitchChange = (field: keyof UserFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.checked
    }));
  };

  const validatePasswords = () => {
    if (formData.password !== formData.confirmPassword) {
      setPasswordError(t('errors.passwordsNoMatch'));
      return false;
    }
    if (formData.password.length < 6) {
      setPasswordError(t('errors.passwordTooShort', { min: 6 }));
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (activeStep === 1 && !validatePasswords()) {
      return;
    }
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validatePasswords()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      if (!token) {
        setError(t('admin.userRegistrationForm.messages.authenticationRequired'));
        return;
      }
      
      adminApiService.setToken(token);
      
      // Prepare the create user request
      const createUserRequest: CreateUserRequest = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        password: formData.password,
        roles: [formData.role],
        tenantId: formData.tenantId || undefined,
        hotelId: HOTEL_SCOPED_ROLES.includes(formData.role as any) && formData.hotelId ? Number(formData.hotelId) : undefined,
      };
      
      await adminApiService.createUser(createUserRequest);
      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        handleBackToAdmin();
      }, 2000);
      
    } catch (err: any) {
      // console.error('User creation failed:', err);
      setError(err.message || t('admin.userRegistrationForm.messages.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label={t('admin.userRegistrationForm.fields.firstName')}
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                required
                placeholder={t('admin.userRegistrationForm.placeholders.firstName')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label={t('admin.userRegistrationForm.fields.lastName')}
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                required
                placeholder={t('admin.userRegistrationForm.placeholders.lastName')}
              />
            </Grid>
            <Grid item xs={12}>
              <PremiumTextField
                fullWidth
                label={t('admin.userRegistrationForm.fields.emailAddress')}
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
                placeholder={t('admin.userRegistrationForm.placeholders.emailAddress')}
              />
            </Grid>
            <Grid item xs={12}>
              <PremiumTextField
                fullWidth
                label={t('admin.userRegistrationForm.fields.username')}
                value={formData.username}
                onChange={handleInputChange('username')}
                required
                placeholder={t('admin.userRegistrationForm.placeholders.username')}
              />
            </Grid>
          </Grid>
        );
      
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label={t('admin.userRegistrationForm.fields.password')}
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                required
                placeholder={t('admin.userRegistrationForm.placeholders.password')}
                error={!!passwordError}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label={t('admin.userRegistrationForm.fields.confirmPassword')}
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                required
                placeholder={t('admin.userRegistrationForm.placeholders.confirmPassword')}
                error={!!passwordError}
                helperText={passwordError}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>{t('admin.userRegistrationForm.fields.userRole')}</InputLabel>
                <Select
                  value={formData.role}
                  onChange={handleSelectChange('role')}
                  label={t('admin.userRegistrationForm.fields.userRole')}
                >
                  {creatableRoles.map((r) => (
                    <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>{t('admin.userRegistrationForm.fields.tenant')}</InputLabel>
                <Select
                  value={formData.tenantId}
                  onChange={handleSelectChange('tenantId')}
                  label={t('admin.userRegistrationForm.fields.tenant')}
                  disabled={loadingTenants}
                >
                  {tenants.map((tenant) => (
                    <MenuItem key={tenant.tenantId} value={tenant.tenantId}>
                      {tenant.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {HOTEL_SCOPED_ROLES.includes(formData.role as any) && (
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>{t('admin.userRegistrationForm.fields.hotelAssignment')}</InputLabel>
                  <Select
                    value={formData.hotelId}
                    onChange={handleSelectChange('hotelId')}
                    label={t('admin.userRegistrationForm.fields.hotelAssignment')}
                    disabled={loadingHotels || !formData.tenantId}
                  >
                    {hotels.map((hotel) => (
                      <MenuItem key={hotel.id} value={hotel.id?.toString()}>
                        {hotel.name} - {hotel.city}
                      </MenuItem>
                    ))}
                  </Select>
                  {formData.tenantId && hotels.length === 0 && !loadingHotels && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      {t('admin.userRegistrationForm.messages.noHotelsAvailable')}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            )}
          </Grid>
        );
      
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label={t('admin.userRegistrationForm.fields.phoneNumber')}
                value={formData.phone}
                onChange={handleInputChange('phone')}
                placeholder={t('admin.userRegistrationForm.placeholders.phoneNumber')}
              />
            </Grid>
            <Grid item xs={12}>
              <PremiumTextField
                fullWidth
                label={t('admin.userRegistrationForm.fields.address')}
                value={formData.address}
                onChange={handleInputChange('address')}
                placeholder={t('admin.userRegistrationForm.placeholders.address')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label={t('admin.userRegistrationForm.fields.city')}
                value={formData.city}
                onChange={handleInputChange('city')}
                placeholder={t('admin.userRegistrationForm.placeholders.city')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label={t('admin.userRegistrationForm.fields.stateProvince')}
                value={formData.state}
                onChange={handleInputChange('state')}
                placeholder={t('admin.userRegistrationForm.placeholders.stateProvince')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label={t('admin.userRegistrationForm.fields.country')}
                value={formData.country}
                onChange={handleInputChange('country')}
                placeholder={t('admin.userRegistrationForm.placeholders.country')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label={t('admin.userRegistrationForm.fields.zipPostalCode')}
                value={formData.zipCode}
                onChange={handleInputChange('zipCode')}
                placeholder={t('admin.userRegistrationForm.placeholders.zipPostalCode')}
              />
            </Grid>
          </Grid>
        );
      
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleSwitchChange('isActive')}
                    color="primary"
                  />
                }
                label={t('admin.userRegistrationForm.fields.accountActive')}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.emailVerified}
                    onChange={handleSwitchChange('emailVerified')}
                    color="primary"
                  />
                }
                label={t('admin.userRegistrationForm.fields.emailVerified')}
              />
            </Grid>
          </Grid>
        );
      
      default:
        return t('admin.userRegistrationForm.messages.unknownStep');
    }
  };

  if (success) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <PersonAdd sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
            {t('admin.userRegistrationForm.messages.createSuccessTitle')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {t('admin.userRegistrationForm.messages.createSuccessBody', {
              fullName: `${formData.firstName} ${formData.lastName}`.trim(),
              role: creatableRoles.find((role) => role.value === formData.role)?.label || formData.role,
            })}
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
            {t('admin.userRegistrationForm.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('admin.userRegistrationForm.description')}
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
                {loading ? t('admin.userRegistrationForm.actions.creatingUser') : t('admin.userRegistrationForm.actions.createUser')}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Summary Card for Final Step */}
      {activeStep === steps.length - 1 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('admin.userRegistrationForm.summary.title')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">{t('admin.userRegistrationForm.summary.name')}</Typography>
              <Typography variant="body1">{formData.firstName} {formData.lastName}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">{t('admin.userRegistrationForm.summary.username')}</Typography>
              <Typography variant="body1">{formData.username || t('common.notAvailable')}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">{t('admin.userRegistrationForm.summary.email')}</Typography>
              <Typography variant="body1">{formData.email || t('common.notAvailable')}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">{t('admin.userRegistrationForm.summary.role')}</Typography>
              <Typography variant="body1">{creatableRoles.find((role) => role.value === formData.role)?.label || t('common.notAvailable')}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">{t('admin.userRegistrationForm.summary.tenant')}</Typography>
              <Typography variant="body1">
                {formData.tenantId ? tenants.find(tenant => tenant.tenantId === formData.tenantId)?.name : t('common.notAvailable')}
              </Typography>
            </Grid>
            {HOTEL_SCOPED_ROLES.includes(formData.role as any) && formData.hotelId && (
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">{t('admin.userRegistrationForm.summary.hotelAssignment')}</Typography>
                <Typography variant="body1">
                  {hotels.find(hotel => hotel.id?.toString() === formData.hotelId)?.name || t('common.notAvailable')}
                </Typography>
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">{t('admin.userRegistrationForm.summary.status')}</Typography>
              <Typography variant="body1">{formData.isActive ? t('admin.userRegistrationForm.status.active') : t('admin.userRegistrationForm.status.inactive')}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">{t('admin.userRegistrationForm.summary.emailVerified')}</Typography>
              <Typography variant="body1">{formData.emailVerified ? t('common.yes') : t('common.no')}</Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Container>
  );
};

export default UserRegistrationForm;
