import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Grid,
  Alert,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack,
  Send,
  Hotel,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface HotelRegistrationData {
  hotelName: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  contactEmail: string;
  contactPerson: string;
  licenseNumber: string;
  taxId: string;
  websiteUrl: string;
  facilityAmenities: string;
  numberOfRooms: string;
  checkInTime: string;
  checkOutTime: string;
}

const PublicHotelRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<HotelRegistrationData>({
    hotelName: '',
    description: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    phone: '',
    contactEmail: '',
    contactPerson: '',
    licenseNumber: '',
    taxId: '',
    websiteUrl: '',
    facilityAmenities: '',
    numberOfRooms: '',
    checkInTime: '15:00',
    checkOutTime: '11:00'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [registrationId, setRegistrationId] = useState<number | null>(null);

  const steps = [
    'Hotel Information',
    'Location Details', 
    'Contact Information',
    'Business Details',
    'Additional Information'
  ];

  const handleInputChange = (field: keyof HotelRegistrationData) => (event: React.ChangeEvent<HTMLInputElement>) => {
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
      // Submit registration to public API endpoint with all fields
      const submissionData = {
        hotelName: formData.hotelName,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zipCode: formData.zipCode,
        phone: formData.phone,
        contactEmail: formData.contactEmail,
        contactPerson: formData.contactPerson,
        licenseNumber: formData.licenseNumber,
        taxId: formData.taxId,
        websiteUrl: formData.websiteUrl,
        facilityAmenities: formData.facilityAmenities,
        numberOfRooms: formData.numberOfRooms ? parseInt(formData.numberOfRooms) : null,
        checkInTime: formData.checkInTime,
        checkOutTime: formData.checkOutTime
      };

      const response = await fetch('/api/public/hotel-registration/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorMessage = response.headers.get('Error-Message') || 'Failed to register hotel';
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setRegistrationId(result.id);
      setSuccess(true);
      
    } catch (err: any) {
      console.error('Error registering hotel:', err);
      setError(err.message || 'Failed to register hotel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hotel Name"
                value={formData.hotelName}
                onChange={handleInputChange('hotelName')}
                required
                placeholder="Enter your hotel name"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Person"
                value={formData.contactPerson}
                onChange={handleInputChange('contactPerson')}
                required
                placeholder="Name of the primary contact person"
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
                placeholder="Describe your hotel and its amenities"
              />
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
                placeholder="Enter your hotel's full address"
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
                placeholder="Enter ZIP/postal code"
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
                placeholder="Enter contact phone number"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.contactEmail}
                onChange={handleInputChange('contactEmail')}
                required
                placeholder="Enter contact email"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Website URL"
                value={formData.websiteUrl}
                onChange={handleInputChange('websiteUrl')}
                placeholder="Enter your hotel's website (optional)"
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
                placeholder="Enter business license number"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tax ID"
                value={formData.taxId}
                onChange={handleInputChange('taxId')}
                placeholder="Enter tax identification number"
              />
            </Grid>
          </Grid>
        );

      case 4:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Facility Amenities"
                value={formData.facilityAmenities}
                onChange={handleInputChange('facilityAmenities')}
                multiline
                rows={3}
                placeholder="Describe your amenities (WiFi, Pool, Spa, Restaurant, etc.)"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Number of Rooms"
                type="number"
                value={formData.numberOfRooms}
                onChange={handleInputChange('numberOfRooms')}
                placeholder="Total number of rooms"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Check-in Time"
                type="time"
                value={formData.checkInTime}
                onChange={handleInputChange('checkInTime')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Check-out Time"
                type="time"
                value={formData.checkOutTime}
                onChange={handleInputChange('checkOutTime')}
                InputLabelProps={{ shrink: true }}
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
          <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="success.main">
            Registration Submitted Successfully!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Thank you for registering "{formData.hotelName}" with BookMyHotel. 
            Your registration (ID: {registrationId}) is now pending review by our team.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            We will contact you at {formData.contactEmail} with updates on your registration status.
          </Typography>
          
          <Card sx={{ mt: 3, bgcolor: 'info.light' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                What's Next?
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                • Our team will review your application within 2-3 business days
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                • You'll receive an email notification about the status
              </Typography>
              <Typography variant="body2">
                • Once approved, you'll receive login credentials to manage your hotel
              </Typography>
            </CardContent>
          </Card>

          <Box sx={{ mt: 4 }}>
            <Button 
              variant="contained" 
              onClick={() => navigate('/')}
              sx={{ mr: 2 }}
            >
              Return to Home
            </Button>
            <Button 
              variant="outlined" 
              href={`mailto:${formData.contactEmail}?subject=Hotel Registration - ${formData.hotelName}&body=Your registration ID is: ${registrationId}`}
            >
              Save Registration Details
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate('/')} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Register Your Hotel
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Join the BookMyHotel platform and start accepting bookings today
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Main Registration Form */}
      <Paper sx={{ p: 4 }}>
        {/* Progress Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Form Content */}
        <Box sx={{ mb: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          
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
              {loading ? 'Submitting...' : 'Submit Registration'}
            </Button>
          )}
        </Box>
      </Paper>

      {/* Registration Summary for Final Step */}
      {activeStep === steps.length - 1 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Registration Summary
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please review your information before submitting:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Hotel Name:</Typography>
                <Typography variant="body1">{formData.hotelName || 'Not specified'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Contact Person:</Typography>
                <Typography variant="body1">{formData.contactPerson || 'Not specified'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Location:</Typography>
                <Typography variant="body1">
                  {formData.city ? `${formData.city}, ${formData.country}` : 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Contact Email:</Typography>
                <Typography variant="body1">{formData.contactEmail || 'Not specified'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Phone:</Typography>
                <Typography variant="body1">{formData.phone || 'Not specified'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Number of Rooms:</Typography>
                <Typography variant="body1">{formData.numberOfRooms || 'Not specified'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Check-in Time:</Typography>
                <Typography variant="body1">{formData.checkInTime || 'Not specified'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Check-out Time:</Typography>
                <Typography variant="body1">{formData.checkOutTime || 'Not specified'}</Typography>
              </Grid>
              {formData.facilityAmenities && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Amenities:</Typography>
                  <Typography variant="body1">{formData.facilityAmenities}</Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Information Card */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Hotel sx={{ mr: 1, verticalAlign: 'middle' }} />
            Why Join BookMyHotel?
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                ✓ Access to millions of travelers worldwide
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                ✓ Professional booking management system
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                ✓ Real-time inventory and pricing controls
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                ✓ 24/7 customer support for you and your guests
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PublicHotelRegistration;
