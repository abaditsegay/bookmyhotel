import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Alert,
  TextField,
  Grid
} from '@mui/material';

const PublicHotelRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Registration form state - same as admin
  const [registrationForm, setRegistrationForm] = useState({
    hotelName: '',
    description: '',
    address: '',
    city: '',
    country: '',
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

      const response = await fetch('/api/public/hotel-registration/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hotelName: registrationForm.hotelName,
          description: registrationForm.description,
          address: registrationForm.address,
          city: registrationForm.city,
          country: registrationForm.country,
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
        })
      });

      if (response.ok) {
        setRegistrationForm({
          hotelName: '',
          description: '',
          address: '',
          city: '',
          country: '',
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
        setSuccess('Hotel registration submitted successfully! We will review your application and contact you soon.');
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit registration');
      }
    } catch (err) {
      console.error('Error submitting registration:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit hotel registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Register Your Hotel
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* Registration Form */}
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>
            Hotel Information
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Fill out the form below to register your hotel with our platform.
          </Typography>

          <Grid container spacing={2} sx={{ mt: 1 }}>
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
                placeholder="Enter contact person name"
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
                placeholder="Describe your hotel"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Address"
                fullWidth
                required
                value={registrationForm.address}
                onChange={(e) => handleRegistrationFormChange('address', e.target.value)}
                placeholder="Enter your hotel address"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="City"
                fullWidth
                required
                value={registrationForm.city}
                onChange={(e) => handleRegistrationFormChange('city', e.target.value)}
                placeholder="Enter city"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Country"
                fullWidth
                required
                value={registrationForm.country}
                onChange={(e) => handleRegistrationFormChange('country', e.target.value)}
                placeholder="Enter country"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                fullWidth
                required
                value={registrationForm.phone}
                onChange={(e) => handleRegistrationFormChange('phone', e.target.value)}
                placeholder="Enter phone number"
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
                placeholder="Please fill out this field"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="License Number"
                fullWidth
                value={registrationForm.licenseNumber}
                onChange={(e) => handleRegistrationFormChange('licenseNumber', e.target.value)}
                placeholder="Enter license number"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Tax ID"
                fullWidth
                value={registrationForm.taxId}
                onChange={(e) => handleRegistrationFormChange('taxId', e.target.value)}
                placeholder="Enter tax ID"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Website URL"
                fullWidth
                value={registrationForm.websiteUrl}
                onChange={(e) => handleRegistrationFormChange('websiteUrl', e.target.value)}
                placeholder="Enter website URL"
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
                placeholder="WiFi, Pool, Spa, Restaurant, etc."
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Number of Rooms"
                type="number"
                fullWidth
                value={registrationForm.numberOfRooms}
                onChange={(e) => handleRegistrationFormChange('numberOfRooms', e.target.value)}
                placeholder="Enter number"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Check-in Time"
                type="time"
                fullWidth
                value={registrationForm.checkInTime}
                onChange={(e) => handleRegistrationFormChange('checkInTime', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Check-out Time"
                type="time"
                fullWidth
                value={registrationForm.checkOutTime}
                onChange={(e) => handleRegistrationFormChange('checkOutTime', e.target.value)}
              />
            </Grid>
          </Grid>

          {/* Action Buttons */}
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
              disabled={!registrationForm.hotelName || !registrationForm.contactPerson || !registrationForm.contactEmail || loading}
              size="large"
            >
              {loading ? 'Submitting...' : 'Submit Registration'}
            </Button>
          </Box>

          {/* Benefits Section */}
          <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              What you'll get:
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Typography variant="body2">• Access to our booking platform</Typography>
              <Typography variant="body2">• Real-time reservation management</Typography>
              <Typography variant="body2">• Professional hotel profile</Typography>
              <Typography variant="body2">• 24/7 customer support</Typography>
              <Typography variant="body2">• Marketing and promotional tools</Typography>
              <Typography variant="body2">• Detailed analytics and reporting</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default PublicHotelRegistration;
