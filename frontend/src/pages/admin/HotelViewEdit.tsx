import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Star as StarIcon,
  Hotel as HotelIcon,
} from '@mui/icons-material';
import { useAuthenticatedApi } from '../../hooks/useAuthenticatedApi';
import { useTenant } from '../../contexts/TenantContext';

interface HotelData {
  id: number;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  checkInTime?: string;
  checkOutTime?: string;
  currency?: string;
  timeZone?: string;
  status?: string;
  rating?: number;
  totalRooms?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const HotelViewEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { adminApiService } = useAuthenticatedApi();
  const { tenantId } = useTenant();
  
  const [hotel, setHotel] = useState<HotelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editedHotel, setEditedHotel] = useState<HotelData | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Check if we're in edit mode based on URL
  useEffect(() => {
    const path = window.location.pathname;
    setIsEditing(path.includes('/edit'));
  }, []);

  const fetchHotel = useCallback(async () => {
    if (!adminApiService || !id) return;
    
    try {
      setLoading(true);
      const response = await adminApiService.getHotels(0, 1000); // Get all hotels for now
      const foundHotel = response.content.find((h: any) => h.id === parseInt(id));
      
      if (foundHotel) {
        setHotel(foundHotel);
        setEditedHotel({ ...foundHotel });
      } else {
        setError('Hotel not found');
      }
    } catch (error) {
      console.error('Error fetching hotel:', error);
      setError('Failed to load hotel details');
    } finally {
      setLoading(false);
    }
  }, [adminApiService, id]);

  useEffect(() => {
    if (id && adminApiService) {
      fetchHotel();
    }
  }, [id, adminApiService, fetchHotel]);

  const handleEdit = () => {
    setIsEditing(true);
    navigate(`/admin/hotels/${id}/edit`);
  };

  const handleCancelEdit = () => {
    if (editedHotel && hotel && JSON.stringify(editedHotel) !== JSON.stringify(hotel)) {
      setShowCancelDialog(true);
    } else {
      cancelEdit();
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditedHotel(hotel ? { ...hotel } : null);
    setShowCancelDialog(false);
    navigate(`/admin/hotels/${id}`);
  };

  const handleSave = async () => {
    if (!adminApiService || !editedHotel) return;

    try {
      setSaving(true);
      
      // Convert HotelData to UpdateHotelRequest format
      const updateRequest = {
        name: editedHotel.name,
        description: editedHotel.description,
        address: editedHotel.address || '',
        city: editedHotel.city || '',
        country: editedHotel.country || '',
        phone: editedHotel.phone,
        email: editedHotel.email,
        tenantId: tenantId, // Include the tenant ID from context
      };
      
      await adminApiService.updateHotel(editedHotel.id, updateRequest);
      setHotel({ ...editedHotel });
      setIsEditing(false);
      setSuccessMessage('Hotel updated successfully');
      navigate(`/admin/hotels/${id}`);
    } catch (error) {
      console.error('Error updating hotel:', error);
      setError('Failed to update hotel');
    } finally {
      setSaving(false);
    }
  };

  const handleBackToAdmin = () => {
    const returnTab = searchParams.get('returnTab');
    if (returnTab) {
      navigate(`/admin/dashboard?tab=${returnTab}`);
    } else {
      navigate('/admin/dashboard');
    }
  };

  const handleInputChange = (field: keyof HotelData, value: any) => {
    if (editedHotel) {
      setEditedHotel({
        ...editedHotel,
        [field]: value,
      });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && !hotel) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <IconButton onClick={handleBackToAdmin} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
      </Container>
    );
  }

  const currentHotel = isEditing ? editedHotel : hotel;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleBackToAdmin} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <HotelIcon sx={{ mr: 1 }} />
              {isEditing ? 'Edit Hotel' : 'Hotel Details'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentHotel?.name}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {isEditing ? (
            <>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancelEdit}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit Hotel
            </Button>
          )}
        </Box>
      </Box>

      {currentHotel && (
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Hotel Name"
                    value={currentHotel.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={currentHotel.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={currentHotel.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={currentHotel.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Website"
                    value={currentHotel.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Address Information */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Address Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Street Address"
                    value={currentHotel.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                    InputProps={{
                      startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    value={currentHotel.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="State/Province"
                    value={currentHotel.state || ''}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="ZIP/Postal Code"
                    value={currentHotel.zipCode || ''}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    value={currentHotel.country || ''}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Side Panel */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Hotel Status
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth disabled={!isEditing} variant={isEditing ? 'outlined' : 'filled'}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={currentHotel.status || 'ACTIVE'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="INACTIVE">Inactive</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="SUSPENDED">Suspended</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Chip
                  label={currentHotel.status || 'ACTIVE'}
                  color={
                    currentHotel.status === 'ACTIVE' 
                      ? 'success' 
                      : currentHotel.status === 'PENDING' 
                        ? 'warning' 
                        : 'default'
                  }
                  variant={currentHotel.status === 'INACTIVE' ? 'outlined' : 'filled'}
                />
              </Box>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Hotel Statistics
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  <StarIcon sx={{ color: 'orange', mr: 0.5 }} />
                  <Typography variant="h4" component="span" sx={{ fontWeight: 'bold' }}>
                    {currentHotel.rating || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average Rating
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {currentHotel.totalRooms || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Rooms
                  </Typography>
                </Box>

                {currentHotel.createdAt && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Registered: {new Date(currentHotel.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onClose={() => setShowCancelDialog(false)}>
        <DialogTitle>Discard Changes?</DialogTitle>
        <DialogContent>
          <Typography>
            You have unsaved changes. Are you sure you want to discard them?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelDialog(false)}>Keep Editing</Button>
          <Button onClick={cancelEdit} color="error">
            Discard Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Messages */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
      >
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default HotelViewEdit;
