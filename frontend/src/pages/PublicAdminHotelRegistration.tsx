import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Alert,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack,
  Hotel,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface RegistrationFormData {
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

const PublicAdminHotelRegistration: React.FC = () => {
  const navigate = useNavigate();
  
  const [registrationForm, setRegistrationForm] = useState<RegistrationFormData>({
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

  const handleRegistrationFormChange = (field: keyof RegistrationFormData, value: string) => {
    setRegistrationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Submit registration to public API endpoint with all fields
      const submissionData = {
        hotelName: registrationForm.hotelName,
        description: registrationForm.description,
        address: registrationForm.address,
        city: registrationForm.city,
        state: registrationForm.state,
        country: registrationForm.country,
        zipCode: registrationForm.zipCode,
        phone: registrationForm.phone,
        contactEmail: registrationForm.contactEmail,
        contactPerson: registrationForm.contactPerson,
        licenseNumber: registrationForm.licenseNumber,
        taxId: registrationForm.taxId,
        websiteUrl: registrationForm.websiteUrl,
        facilityAmenities: registrationForm.facilityAmenities,
        numberOfRooms: registrationForm.numberOfRooms ? parseInt(registrationForm.numberOfRooms) : null,
        checkInTime: registrationForm.checkInTime,
        checkOutTime: registrationForm.checkOutTime
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

  if (success) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton onClick={() => navigate('/')} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1">
            Hotel Registration
          </Typography>
        </Box>

        <Card>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom color="success.main">
              Registration Submitted Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Thank you for registering "{registrationForm.hotelName}" with BookMyHotel. 
              Your registration (ID: {registrationId}) is now pending review by our team.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              We will contact you at {registrationForm.contactEmail} with updates on your registration status.
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
                onClick={() => navigate('/registration-status')}
              >
                Check Registration Status
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate('/')} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Register Your Hotel
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Join the BookMyHotel platform with our comprehensive registration form
          </Typography>
        </Box>
        <Hotel sx={{ fontSize: 40, color: 'primary.main' }} />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Main Registration Form - Using Admin Form Structure */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Hotel Registration Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Hotel Name"
                fullWidth
                required
                value={registrationForm.hotelName}
                onChange={(e) => handleRegistrationFormChange('hotelName', e.target.value)}
                placeholder="Enter your hotel name"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Contact Person"
                fullWidth
                required
                value={registrationForm.contactPerson}
                onChange={(e) => handleRegistrationFormChange('contactPerson', e.target.value)}
                placeholder="Primary contact person name"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description"
                multiline
                rows={3}
                fullWidth
                value={registrationForm.description}
                onChange={(e) => handleRegistrationFormChange('description', e.target.value)}
                placeholder="Describe your hotel and its unique features"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Address"
                fullWidth
                required
                value={registrationForm.address}
                onChange={(e) => handleRegistrationFormChange('address', e.target.value)}
                placeholder="Complete street address"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="City"
                fullWidth
                required
                value={registrationForm.city}
                onChange={(e) => handleRegistrationFormChange('city', e.target.value)}
                placeholder="City name"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="State/Province"
                fullWidth
                value={registrationForm.state}
                onChange={(e) => handleRegistrationFormChange('state', e.target.value)}
                placeholder="State or province"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Country"
                fullWidth
                required
                value={registrationForm.country}
                onChange={(e) => handleRegistrationFormChange('country', e.target.value)}
                placeholder="Country name"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="ZIP/Postal Code"
                fullWidth
                value={registrationForm.zipCode}
                onChange={(e) => handleRegistrationFormChange('zipCode', e.target.value)}
                placeholder="ZIP or postal code"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                fullWidth
                required
                value={registrationForm.phone}
                onChange={(e) => handleRegistrationFormChange('phone', e.target.value)}
                placeholder="Contact phone number"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Contact Email"
                type="email"
                fullWidth
                required
                value={registrationForm.contactEmail}
                onChange={(e) => handleRegistrationFormChange('contactEmail', e.target.value)}
                placeholder="Primary contact email"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Website URL"
                fullWidth
                value={registrationForm.websiteUrl}
                onChange={(e) => handleRegistrationFormChange('websiteUrl', e.target.value)}
                placeholder="Hotel website (optional)"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Facility Amenities"
                multiline
                rows={2}
                fullWidth
                value={registrationForm.facilityAmenities}
                onChange={(e) => handleRegistrationFormChange('facilityAmenities', e.target.value)}
                placeholder="WiFi, Pool, Spa, Restaurant, Gym, Parking, etc."
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Number of Rooms"
                type="number"
                fullWidth
                value={registrationForm.numberOfRooms}
                onChange={(e) => handleRegistrationFormChange('numberOfRooms', e.target.value)}
                placeholder="Total rooms"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Check-in Time"
                type="time"
                fullWidth
                value={registrationForm.checkInTime}
                onChange={(e) => handleRegistrationFormChange('checkInTime', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Check-out Time"
                type="time"
                fullWidth
                value={registrationForm.checkOutTime}
                onChange={(e) => handleRegistrationFormChange('checkOutTime', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Business License Number"
                fullWidth
                value={registrationForm.licenseNumber}
                onChange={(e) => handleRegistrationFormChange('licenseNumber', e.target.value)}
                placeholder="Business license number (optional)"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Tax ID"
                fullWidth
                value={registrationForm.taxId}
                onChange={(e) => handleRegistrationFormChange('taxId', e.target.value)}
                placeholder="Tax identification number (optional)"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/')}
              startIcon={<ArrowBack />}
            >
              Cancel
            </Button>
            
            <Button 
              variant="contained" 
              onClick={handleSubmit}
              disabled={loading || !registrationForm.hotelName || !registrationForm.contactPerson || !registrationForm.contactEmail}
              sx={{ minWidth: 200 }}
            >
              {loading ? 'Submitting Registration...' : 'Submit Registration'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Information Section */}
      <Card sx={{ mt: 3, bgcolor: 'grey.50' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Hotel sx={{ mr: 1, verticalAlign: 'middle' }} />
            Why Register with BookMyHotel?
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                ✓ Access to millions of travelers worldwide
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                ✓ Professional booking management system
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                ✓ Real-time inventory and pricing controls
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                ✓ 24/7 customer support for you and your guests
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                ✓ Comprehensive reporting and analytics
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                ✓ Multi-channel distribution platform
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PublicAdminHotelRegistration;
