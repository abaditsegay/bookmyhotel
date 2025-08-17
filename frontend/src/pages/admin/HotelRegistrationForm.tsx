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
} from '@mui/material';
import {
  ArrowBack,
  Send,
  Hotel,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

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
  const [error, setError] = useState('');

  const steps = [
    'Basic Information',
    'Location Details', 
    'Contact Information',
    'Business Details'
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
    setLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Hotel registration data:', formData);
      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate('/admin/hotel-registrations');
      }, 2000);
      
    } catch (err) {
      setError('Failed to register hotel. Please try again.');
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
              <TextField
                fullWidth
                label="Hotel Name"
                value={formData.hotelName}
                onChange={handleInputChange('hotelName')}
                required
                placeholder="Enter hotel name"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={handleInputChange('description')}
                multiline
                rows={4}
                placeholder="Enter hotel description"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Hotel Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={handleSelectChange('category')}
                  label="Hotel Category"
                >
                  <MenuItem value="luxury">Luxury</MenuItem>
                  <MenuItem value="business">Business</MenuItem>
                  <MenuItem value="budget">Budget</MenuItem>
                  <MenuItem value="boutique">Boutique</MenuItem>
                  <MenuItem value="resort">Resort</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={handleInputChange('address')}
                required
                placeholder="Enter street address"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={handleInputChange('city')}
                required
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
                required
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
      
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                required
                placeholder="Enter phone number"
              />
            </Grid>
            <Grid item xs={12} md={6}>
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Website"
                value={formData.website}
                onChange={handleInputChange('website')}
                placeholder="Enter website URL"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Person"
                value={formData.contactPerson}
                onChange={handleInputChange('contactPerson')}
                required
                placeholder="Enter contact person name"
              />
            </Grid>
          </Grid>
        );
      
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Business License Number"
                value={formData.licenseNumber}
                onChange={handleInputChange('licenseNumber')}
                required
                placeholder="Enter license number"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tax ID"
                value={formData.taxId}
                onChange={handleInputChange('taxId')}
                required
                placeholder="Enter tax identification number"
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
          <Hotel sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="success.main">
            Hotel Registered Successfully!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            The hotel "{formData.hotelName}" has been registered and is now pending review.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/admin/hotel-registrations')}
          >
            View Registration Requests
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
            Register New Hotel
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Add a new hotel to the platform
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
                {loading ? 'Registering...' : 'Register Hotel'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Summary Card for Final Step */}
      {activeStep === steps.length - 1 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Registration Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Hotel Name:</Typography>
              <Typography variant="body1">{formData.hotelName || 'Not specified'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Category:</Typography>
              <Typography variant="body1">{formData.category || 'Not specified'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Location:</Typography>
              <Typography variant="body1">
                {formData.city ? `${formData.city}, ${formData.country}` : 'Not specified'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Contact:</Typography>
              <Typography variant="body1">{formData.email || 'Not specified'}</Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Container>
  );
};

export default HotelRegistrationForm;
