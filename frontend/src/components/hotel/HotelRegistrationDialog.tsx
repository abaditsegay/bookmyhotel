import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';

interface HotelRegistrationForm {
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

interface HotelRegistrationDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: HotelRegistrationForm) => Promise<void>;
  isPublic?: boolean;
  loading?: boolean;
  error?: string | null;
  success?: string | null;
}

const HotelRegistrationDialog: React.FC<HotelRegistrationDialogProps> = ({
  open,
  onClose,
  onSubmit,
  isPublic = false,
  loading = false,
  error = null,
  success = null
}) => {
  const [formData, setFormData] = useState<HotelRegistrationForm>({
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

  const handleFormChange = (field: keyof HotelRegistrationForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    await onSubmit(formData);
    // Reset form after successful submission
    setFormData({
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
  };

  const isFormValid = formData.hotelName && formData.contactPerson && formData.contactEmail && formData.address && formData.city && formData.country && formData.phone;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isPublic ? 'Register Your Hotel' : 'Register New Hotel'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Hotel Name"
              fullWidth
              required
              value={formData.hotelName}
              onChange={(e) => handleFormChange('hotelName', e.target.value)}
              placeholder="Enter your hotel name"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Contact Person"
              fullWidth
              required
              value={formData.contactPerson}
              onChange={(e) => handleFormChange('contactPerson', e.target.value)}
              placeholder="Your full name"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Description"
              multiline
              rows={3}
              fullWidth
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="Describe your hotel, its unique features and amenities"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Address"
              fullWidth
              required
              value={formData.address}
              onChange={(e) => handleFormChange('address', e.target.value)}
              placeholder="Full street address"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="City"
              fullWidth
              required
              value={formData.city}
              onChange={(e) => handleFormChange('city', e.target.value)}
              placeholder="City name"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="State/Province"
              fullWidth
              value={formData.state}
              onChange={(e) => handleFormChange('state', e.target.value)}
              placeholder="State or province"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Country"
              fullWidth
              required
              value={formData.country}
              onChange={(e) => handleFormChange('country', e.target.value)}
              placeholder="Country name"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="ZIP/Postal Code"
              fullWidth
              value={formData.zipCode}
              onChange={(e) => handleFormChange('zipCode', e.target.value)}
              placeholder="ZIP or postal code"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Phone"
              fullWidth
              required
              value={formData.phone}
              onChange={(e) => handleFormChange('phone', e.target.value)}
              placeholder="Hotel contact phone number"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Contact Email"
              type="email"
              fullWidth
              required
              value={formData.contactEmail}
              onChange={(e) => handleFormChange('contactEmail', e.target.value)}
              placeholder="Primary contact email"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="License Number"
              fullWidth
              value={formData.licenseNumber}
              onChange={(e) => handleFormChange('licenseNumber', e.target.value)}
              placeholder="Business license number"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Tax ID"
              fullWidth
              value={formData.taxId}
              onChange={(e) => handleFormChange('taxId', e.target.value)}
              placeholder="Tax identification number"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Website URL"
              fullWidth
              value={formData.websiteUrl}
              onChange={(e) => handleFormChange('websiteUrl', e.target.value)}
              placeholder="https://your-hotel-website.com"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Facility Amenities"
              multiline
              rows={2}
              fullWidth
              value={formData.facilityAmenities}
              onChange={(e) => handleFormChange('facilityAmenities', e.target.value)}
              placeholder="WiFi, Pool, Spa, Restaurant, Parking, Fitness Center, etc."
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Number of Rooms"
              type="number"
              fullWidth
              value={formData.numberOfRooms}
              onChange={(e) => handleFormChange('numberOfRooms', e.target.value)}
              placeholder="Total rooms available"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Check-in Time"
              type="time"
              fullWidth
              value={formData.checkInTime}
              onChange={(e) => handleFormChange('checkInTime', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Check-out Time"
              type="time"
              fullWidth
              value={formData.checkOutTime}
              onChange={(e) => handleFormChange('checkOutTime', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={!isFormValid || loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Submitting...' : 'Submit Registration'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HotelRegistrationDialog;
