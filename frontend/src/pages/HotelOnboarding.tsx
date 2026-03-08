import React, { useState, useEffect } from 'react';
import { normalizeEthiopianPhone } from '../utils/phoneUtils';
import { COLORS } from '../theme/themeColors';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Alert,
  Grid,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle,
  PendingActions,
  LocationOn,
  Payment,
  Receipt,
  Save
} from '@mui/icons-material';
import PremiumTextField from '../components/common/PremiumTextField';
import { API_CONFIG } from '../config/apiConfig';
import { useAuth } from '../contexts/AuthContext';

interface RegistrationData {
  id: number;
  hotelName: string;
  description: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  mobilePaymentPhone: string;
  mobilePaymentPhone2: string;
  contactEmail: string;
  contactPerson: string;
  licenseNumber: string;
  taxId: string;
  websiteUrl: string;
  facilityAmenities: string;
  numberOfRooms: number | null;
  checkInTime: string;
  checkOutTime: string;
  status: string;
}

interface VerificationStatus {
  label: string;
  icon: React.ReactElement;
  verified: boolean;
  fields: string[];
}

const HotelOnboarding: React.FC = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    description: '',
    phone: '',
    mobilePaymentPhone: '',
    mobilePaymentPhone2: '',
    licenseNumber: '',
    taxId: '',
    websiteUrl: '',
    facilityAmenities: '',
    numberOfRooms: '',
    checkInTime: '15:00',
    checkOutTime: '11:00'
  });

  // Pre-filled read-only data from registration
  const [registrationInfo, setRegistrationInfo] = useState({
    hotelName: '',
    contactPerson: '',
    contactEmail: '',
    address: '',
    city: '',
    country: ''
  });

  useEffect(() => {
    fetchRegistrationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRegistrationData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/hotel-onboarding/registration`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data: RegistrationData = await response.json();
        setRegistrationInfo({
          hotelName: data.hotelName || '',
          contactPerson: data.contactPerson || '',
          contactEmail: data.contactEmail || '',
          address: data.address || '',
          city: data.city || '',
          country: data.country || ''
        });
        setForm({
          description: data.description || '',
          phone: data.phone || '',
          mobilePaymentPhone: data.mobilePaymentPhone || '',
          mobilePaymentPhone2: data.mobilePaymentPhone2 || '',
          licenseNumber: data.licenseNumber || '',
          taxId: data.taxId || '',
          websiteUrl: data.websiteUrl || '',
          facilityAmenities: data.facilityAmenities || '',
          numberOfRooms: data.numberOfRooms?.toString() || '',
          checkInTime: data.checkInTime || '15:00',
          checkOutTime: data.checkOutTime || '11:00'
        });
      } else {
        throw new Error('Failed to load registration data');
      }
    } catch (err) {
      setError('Failed to load your registration data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`${API_CONFIG.BASE_URL}/hotel-onboarding/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hotelName: registrationInfo.hotelName,
          contactPerson: registrationInfo.contactPerson,
          contactEmail: registrationInfo.contactEmail,
          address: registrationInfo.address,
          city: registrationInfo.city,
          country: registrationInfo.country,
          description: form.description,
          phone: normalizeEthiopianPhone(form.phone),
          mobilePaymentPhone: normalizeEthiopianPhone(form.mobilePaymentPhone),
          mobilePaymentPhone2: normalizeEthiopianPhone(form.mobilePaymentPhone2),
          licenseNumber: form.licenseNumber,
          taxId: form.taxId,
          websiteUrl: form.websiteUrl,
          facilityAmenities: form.facilityAmenities,
          numberOfRooms: form.numberOfRooms ? parseInt(form.numberOfRooms) : null,
          checkInTime: form.checkInTime,
          checkOutTime: form.checkOutTime
        })
      });

      if (response.ok) {
        setSuccess('Hotel profile updated successfully! Your registration is now under review by our team.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save hotel profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getVerificationStatuses = (): VerificationStatus[] => [
    {
      label: 'Hotel Address',
      icon: <LocationOn fontSize="small" />,
      verified: !!(registrationInfo.address && registrationInfo.city),
      fields: ['address', 'city']
    },
    {
      label: 'Payment Information',
      icon: <Payment fontSize="small" />,
      verified: !!form.mobilePaymentPhone,
      fields: ['mobilePaymentPhone']
    },
    {
      label: 'Tax / License',
      icon: <Receipt fontSize="small" />,
      verified: !!(form.taxId || form.licenseNumber),
      fields: ['taxId', 'licenseNumber']
    }
  ];

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: COLORS.PRIMARY, fontWeight: 600 }}>
          Complete Your Hotel Profile
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Welcome, {user?.firstName}! Please complete your hotel profile to proceed with the registration review.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* Verification Status Indicators */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            Verification Status
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {getVerificationStatuses().map((status) => (
              <Chip
                key={status.label}
                icon={status.verified ? <CheckCircle /> : <PendingActions />}
                label={status.label}
                color={status.verified ? 'success' : 'default'}
                variant={status.verified ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
        </Paper>

        {/* Pre-filled Registration Info (Read-only) */}
        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Registration Information
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            This information was provided during registration and cannot be changed here.
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <PremiumTextField
                label="Hotel Name"
                fullWidth
                value={registrationInfo.hotelName}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <PremiumTextField
                label="Contact Person"
                fullWidth
                value={registrationInfo.contactPerson}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <PremiumTextField
                label="Contact Email"
                fullWidth
                value={registrationInfo.contactEmail}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <PremiumTextField
                label="Address"
                fullWidth
                value={registrationInfo.address}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <PremiumTextField
                label="City"
                fullWidth
                value={registrationInfo.city}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <PremiumTextField
                label="Country"
                fullWidth
                value={registrationInfo.country}
                disabled
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Additional Hotel Details */}
        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Additional Hotel Details
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Complete the following information to help us review your registration.
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <PremiumTextField
                label="Hotel Description"
                multiline
                rows={3}
                fullWidth
                value={form.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Describe your hotel, services, and unique features"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <PremiumTextField
                label="Phone (Communication)"
                fullWidth
                value={form.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
                placeholder="Enter communication phone number"
                helperText="Primary phone for general communication"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <PremiumTextField
                label="Website URL"
                fullWidth
                value={form.websiteUrl}
                onChange={(e) => handleFormChange('websiteUrl', e.target.value)}
                placeholder="https://www.yourhotel.com"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Payment Information */}
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Payment fontSize="small" /> Payment Information
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <PremiumTextField
                label="Mobile Payment Phone"
                fullWidth
                value={form.mobilePaymentPhone}
                onChange={(e) => handleFormChange('mobilePaymentPhone', e.target.value)}
                placeholder="Enter mobile payment phone number"
                helperText="Primary mobile money account for payments"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <PremiumTextField
                label="Mobile Payment Phone 2 (Optional)"
                fullWidth
                value={form.mobilePaymentPhone2}
                onChange={(e) => handleFormChange('mobilePaymentPhone2', e.target.value)}
                placeholder="Enter secondary mobile payment phone"
                helperText="Optional secondary mobile money account"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Tax & License */}
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Receipt fontSize="small" /> Tax & License Information
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <PremiumTextField
                label="License Number"
                fullWidth
                value={form.licenseNumber}
                onChange={(e) => handleFormChange('licenseNumber', e.target.value)}
                placeholder="Enter business license number"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <PremiumTextField
                label="Tax ID"
                fullWidth
                value={form.taxId}
                onChange={(e) => handleFormChange('taxId', e.target.value)}
                placeholder="Enter tax identification number"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Facility Details */}
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            Facility Details
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <PremiumTextField
                label="Facility Amenities"
                multiline
                rows={2}
                fullWidth
                value={form.facilityAmenities}
                onChange={(e) => handleFormChange('facilityAmenities', e.target.value)}
                placeholder="WiFi, Pool, Spa, Restaurant, Parking, etc."
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <PremiumTextField
                label="Number of Rooms"
                type="number"
                fullWidth
                value={form.numberOfRooms}
                onChange={(e) => handleFormChange('numberOfRooms', e.target.value)}
                placeholder="Total rooms"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <PremiumTextField
                label="Check-in Time"
                type="time"
                fullWidth
                value={form.checkInTime}
                onChange={(e) => handleFormChange('checkInTime', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <PremiumTextField
                label="Check-out Time"
                type="time"
                fullWidth
                value={form.checkOutTime}
                onChange={(e) => handleFormChange('checkOutTime', e.target.value)}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={saving}
            size="large"
          >
            {saving ? 'Saving...' : 'Save & Submit for Review'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default HotelOnboarding;
