import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
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
} from '@mui/material';
import {
  ArrowBack,
  Send,
  PersonAdd,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

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
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: '',
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

  const steps = [
    'Basic Information',
    'Account Setup',
    'Profile Details',
    'Account Settings'
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
      setPasswordError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('User registration data:', formData);
      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
      
    } catch (err) {
      setError('Failed to register user. Please try again.');
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
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                required
                placeholder="Enter first name"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                required
                placeholder="Enter last name"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
                placeholder="Enter email address"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                value={formData.username}
                onChange={handleInputChange('username')}
                required
                placeholder="Enter username"
              />
            </Grid>
          </Grid>
        );
      
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                required
                placeholder="Enter password"
                error={!!passwordError}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                required
                placeholder="Confirm password"
                error={!!passwordError}
                helperText={passwordError}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>User Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={handleSelectChange('role')}
                  label="User Role"
                >
                  <MenuItem value="CUSTOMER">Customer</MenuItem>
                  <MenuItem value="HOTEL_ADMIN">Hotel Admin</MenuItem>
                  <MenuItem value="HOTEL_STAFF">Hotel Staff</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                placeholder="Enter phone number"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={handleInputChange('address')}
                placeholder="Enter street address"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={handleInputChange('city')}
                placeholder="Enter city"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="State/Province"
                value={formData.state}
                onChange={handleInputChange('state')}
                placeholder="Enter state or province"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Country"
                value={formData.country}
                onChange={handleInputChange('country')}
                placeholder="Enter country"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ZIP/Postal Code"
                value={formData.zipCode}
                onChange={handleInputChange('zipCode')}
                placeholder="Enter ZIP code"
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
                label="Account Active"
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
                label="Email Verified"
              />
            </Grid>
          </Grid>
        );
      
      default:
        return 'Unknown step';
    }
  };

  if (success) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <PersonAdd sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="success.main">
            User Created Successfully!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {formData.firstName} {formData.lastName} has been successfully registered as a {formData.role.toLowerCase()}.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/admin')}
          >
            Back to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin')}
          sx={{ mr: 2 }}
        >
          Back to Dashboard
        </Button>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Add New User
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create a new user account
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
          >
            Back
          </Button>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                variant="contained"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                variant="contained"
                startIcon={<Send />}
                disabled={loading}
              >
                {loading ? 'Creating User...' : 'Create User'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Summary Card for Final Step */}
      {activeStep === steps.length - 1 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            User Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Name:</Typography>
              <Typography variant="body1">{formData.firstName} {formData.lastName}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Username:</Typography>
              <Typography variant="body1">{formData.username || 'Not specified'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Email:</Typography>
              <Typography variant="body1">{formData.email || 'Not specified'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Role:</Typography>
              <Typography variant="body1">{formData.role || 'Not specified'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Status:</Typography>
              <Typography variant="body1">{formData.isActive ? 'Active' : 'Inactive'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Email Verified:</Typography>
              <Typography variant="body1">{formData.emailVerified ? 'Yes' : 'No'}</Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Container>
  );
};

export default UserRegistrationForm;
