import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  useTheme,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Edit as EditIcon,
  Phone as PhoneIcon,
  Smartphone as SmartphoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { Hotel } from '../../types/hotel';
import { hotelAdminApi } from '../../services/hotelAdminApi';

interface HotelDetailsManagementProps {
  hotel: Hotel | null;
  onHotelUpdate: (updatedHotel: Hotel) => void;
  isLoading?: boolean;
  error?: string;
}

interface EditFormData {
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  mobilePaymentPhone: string;
  mobilePaymentPhone2: string;
  email: string;
}

const HotelDetailsManagement: React.FC<HotelDetailsManagementProps> = ({
  hotel,
  onHotelUpdate,
  isLoading = false,
  error,
}) => {
  const theme = useTheme();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editPhoneDialogOpen, setEditPhoneDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formData, setFormData] = useState<EditFormData>({
    name: '',
    description: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    mobilePaymentPhone: '',
    mobilePaymentPhone2: '',
    email: '',
  });

  // Update form data when hotel changes
  useEffect(() => {
    if (hotel) {
      setFormData({
        name: hotel.name || '',
        description: hotel.description || '',
        address: hotel.address || '',
        city: hotel.city || '',
        country: hotel.country || '',
        phone: hotel.phone || '',
        mobilePaymentPhone: hotel.mobilePaymentPhone || '',
        mobilePaymentPhone2: hotel.mobilePaymentPhone2 || '',
        email: hotel.email || '',
      });
    }
  }, [hotel]);

  const handleEditClick = () => {
    setEditDialogOpen(true);
    setSaveError(null);
  };

  const handlePhoneEditClick = () => {
    setEditPhoneDialogOpen(true);
    setSaveError(null);
  };

  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setEditPhoneDialogOpen(false);
    setSaveError(null);
    // Reset form data to current hotel values
    if (hotel) {
      setFormData({
        name: hotel.name || '',
        description: hotel.description || '',
        address: hotel.address || '',
        city: hotel.city || '',
        country: hotel.country || '',
        phone: hotel.phone || '',
        mobilePaymentPhone: hotel.mobilePaymentPhone || '',
        mobilePaymentPhone2: hotel.mobilePaymentPhone2 || '',
        email: hotel.email || '',
      });
    }
  };

  const handleFormChange = (field: keyof EditFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSave = async () => {
    if (!hotel) return;

    setSaving(true);
    setSaveError(null);

    try {
      const response = await hotelAdminApi.updateMyHotel('', {
        id: hotel.id,
        name: formData.name,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        phone: formData.phone,
        mobilePaymentPhone: formData.mobilePaymentPhone,
        mobilePaymentPhone2: formData.mobilePaymentPhone2,
        email: formData.email,
      });

      if (response.success && response.data) {
        onHotelUpdate(response.data);
        setEditDialogOpen(false);
        setEditPhoneDialogOpen(false);
      } else {
        setSaveError(response.message || 'Failed to update hotel details');
      }
    } catch (error: any) {
      setSaveError(error.message || 'Failed to update hotel details');
    } finally {
      setSaving(false);
    }
  };

  const handlePhoneSave = async () => {
    if (!hotel) return;

    setSaving(true);
    setSaveError(null);

    try {
      const response = await hotelAdminApi.updateMyHotel('', {
        id: hotel.id,
        name: hotel.name,
        description: hotel.description,
        address: hotel.address,
        city: hotel.city,
        country: hotel.country,
        phone: formData.phone,
        mobilePaymentPhone: formData.mobilePaymentPhone,
        mobilePaymentPhone2: formData.mobilePaymentPhone2,
        email: hotel.email,
      });

      if (response.success && response.data) {
        onHotelUpdate(response.data);
        setEditPhoneDialogOpen(false);
      } else {
        setSaveError(response.message || 'Failed to update phone numbers');
      }
    } catch (error: any) {
      setSaveError(error.message || 'Failed to update phone numbers');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2, alignSelf: 'center' }}>
          Loading hotel information...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Unable to Load Hotel Information
        </Typography>
        {error}
      </Alert>
    );
  }

  if (!hotel) {
    return (
      <Alert severity="warning" sx={{ mb: 4, borderRadius: 2 }}>
        No hotel information available
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
        pb: 2,
        borderBottom: `2px solid ${theme.palette.divider}`
      }}>
        <Box>
          <Typography variant="h4" sx={{
            fontWeight: 'bold',
            color: theme.palette.primary.main,
            mb: 1
          }}>
            {hotel.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Hotel Management Dashboard
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleEditClick}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 'bold',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            '&:hover': {
              background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`
            }
          }}
        >
          Edit Hotel Details
        </Button>
      </Box>

      {/* Hotel Information Cards */}
      <Grid container spacing={3}>
        {/* Basic Information Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            height: '100%'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 3,
                pb: 2,
                borderBottom: `1px solid ${theme.palette.divider}`
              }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  backgroundColor: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2
                }}>
                  <BusinessIcon sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                  Hotel Information
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium', mb: 1 }}>
                  Hotel Name
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                  {hotel.name}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium', mb: 1 }}>
                  Description
                </Typography>
                <Typography variant="body1" sx={{
                  lineHeight: 1.6,
                  color: hotel.description ? theme.palette.text.primary : theme.palette.text.secondary,
                  fontStyle: hotel.description ? 'normal' : 'italic'
                }}>
                  {hotel.description || 'No description available'}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium', mb: 1 }}>
                  Address
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <LocationIcon sx={{ color: theme.palette.text.secondary, mr: 1, mt: 0.5, fontSize: 20 }} />
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {hotel.address || 'Address not set'}
                    {hotel.city && `, ${hotel.city}`}
                    {hotel.country && `, ${hotel.country}`}
                  </Typography>
                </Box>
              </Box>

              {hotel.isActive !== undefined && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium', mb: 1 }}>
                    Status
                  </Typography>
                  <Chip
                    label={hotel.isActive ? 'Active' : 'Inactive'}
                    sx={{
                      backgroundColor: hotel.isActive ? theme.palette.success.main : theme.palette.error.main,
                      color: 'white',
                      fontWeight: 'bold',
                      px: 2,
                      py: 1
                    }}
                    size="medium"
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Information Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            height: '100%'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3,
                pb: 2,
                borderBottom: `1px solid ${theme.palette.divider}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor: theme.palette.secondary.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}>
                    <PhoneIcon sx={{ color: 'white', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.secondary.main }}>
                    Contact Information
                  </Typography>
                </Box>
                <IconButton
                  onClick={handlePhoneEditClick}
                  sx={{
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main + '10'
                    }
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Box>

              {/* Communication Phone */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium', mb: 1 }}>
                  Communication Phone
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: 20 }} />
                  <Typography variant="h6" sx={{
                    fontWeight: 'medium',
                    color: hotel.phone ? theme.palette.text.primary : theme.palette.text.secondary,
                    fontStyle: hotel.phone ? 'normal' : 'italic'
                  }}>
                    {hotel.phone || 'Phone not set'}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Mobile Payment Phones */}
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium', mb: 2 }}>
                Mobile Payment Numbers
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SmartphoneIcon sx={{ color: theme.palette.success.main, mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                    Primary Payment Phone
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{
                  ml: 3,
                  color: hotel.mobilePaymentPhone ? theme.palette.text.primary : theme.palette.text.secondary,
                  fontStyle: hotel.mobilePaymentPhone ? 'normal' : 'italic'
                }}>
                  {hotel.mobilePaymentPhone || 'Payment phone not set'}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SmartphoneIcon sx={{ color: theme.palette.info.main, mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                    Secondary Payment Phone
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{
                  ml: 3,
                  color: hotel.mobilePaymentPhone2 ? theme.palette.text.primary : theme.palette.text.secondary,
                  fontStyle: hotel.mobilePaymentPhone2 ? 'normal' : 'italic'
                }}>
                  {hotel.mobilePaymentPhone2 || 'Secondary payment phone not set'}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Email */}
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium', mb: 1 }}>
                  Email Address
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmailIcon sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: 20 }} />
                  <Typography variant="h6" sx={{
                    fontWeight: 'medium',
                    color: hotel.email ? theme.palette.text.primary : theme.palette.text.secondary,
                    fontStyle: hotel.email ? 'normal' : 'italic'
                  }}>
                    {hotel.email || 'Email not set'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Full Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Edit Hotel Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          {saveError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {saveError}
            </Alert>
          )}
          
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hotel Name"
                value={formData.name}
                onChange={handleFormChange('name')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleFormChange('email')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleFormChange('description')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={handleFormChange('address')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={handleFormChange('city')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                value={formData.country}
                onChange={handleFormChange('country')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Communication Phone"
                value={formData.phone}
                onChange={handleFormChange('phone')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Primary Payment Phone"
                value={formData.mobilePaymentPhone}
                onChange={handleFormChange('mobilePaymentPhone')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SmartphoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Secondary Payment Phone"
                value={formData.mobilePaymentPhone2}
                onChange={handleFormChange('mobilePaymentPhone2')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SmartphoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseDialog}
            startIcon={<CancelIcon />}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            variant="contained"
            startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Phone Numbers Only Edit Dialog */}
      <Dialog 
        open={editPhoneDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Edit Phone Numbers
          </Typography>
        </DialogTitle>
        <DialogContent>
          {saveError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {saveError}
            </Alert>
          )}
          
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Communication Phone"
                value={formData.phone}
                onChange={handleFormChange('phone')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
                helperText="Main contact number for hotel communications"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Primary Payment Phone"
                value={formData.mobilePaymentPhone}
                onChange={handleFormChange('mobilePaymentPhone')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SmartphoneIcon sx={{ color: theme.palette.success.main }} />
                    </InputAdornment>
                  ),
                }}
                helperText="Primary mobile number for payment processing"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Secondary Payment Phone"
                value={formData.mobilePaymentPhone2}
                onChange={handleFormChange('mobilePaymentPhone2')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SmartphoneIcon sx={{ color: theme.palette.info.main }} />
                    </InputAdornment>
                  ),
                }}
                helperText="Backup mobile number for payment processing"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseDialog}
            startIcon={<CancelIcon />}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePhoneSave}
            variant="contained"
            startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Phone Numbers'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HotelDetailsManagement;