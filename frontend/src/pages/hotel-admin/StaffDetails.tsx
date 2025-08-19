import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  Chip,
  IconButton,
  Divider,
  Card,
  CardContent,
  Alert,
  Snackbar,
  CircularProgress,
  FormControlLabel,
  Switch,
  Checkbox,
  FormGroup,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { hotelAdminApi, StaffResponse } from '../../services/hotelAdminApi';

const StaffDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  
  const [staff, setStaff] = useState<StaffResponse | null>(null);
  const [editedStaff, setEditedStaff] = useState<StaffResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const availableRoles = ['FRONT_DESK', 'HOUSEKEEPING', 'MAINTENANCE', 'MANAGER', 'CONCIERGE'];

  useEffect(() => {
    const loadStaff = async () => {
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const staffId = parseInt(id || '0');
        if (!staffId) {
          setError('Invalid staff ID');
          return;
        }

        console.log('Loading staff with ID:', staffId);
        
        const result = await hotelAdminApi.getStaffById(token, staffId);
        
        if (result.success && result.data) {
          console.log('Found staff:', result.data);
          setStaff(result.data);
          setEditedStaff({ ...result.data });
        } else {
          console.log('Staff not found for ID:', staffId);
          setError(result.message || `Staff not found for ID: ${staffId}`);
        }
      } catch (err) {
        setError('Failed to load staff details');
        console.error('Error loading staff:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadStaff();
    }
  }, [id, token]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedStaff(staff ? { ...staff } : null);
  };

  const handleSave = async () => {
    if (!editedStaff || !token) return;

    try {
      const result = await hotelAdminApi.updateStaff(token, editedStaff.id, {
        firstName: editedStaff.firstName,
        lastName: editedStaff.lastName,
        email: editedStaff.email,
        phone: editedStaff.phone,
        roles: editedStaff.roles,
      });
      
      if (result.success && result.data) {
        setStaff(result.data);
        setEditedStaff({ ...result.data });
        setIsEditing(false);
        setSuccess('Staff updated successfully');
      } else {
        setError(result.message || 'Failed to update staff');
      }
    } catch (err) {
      setError('Failed to update staff');
      console.error('Error updating staff:', err);
    }
  };

  const handleFieldChange = (field: keyof StaffResponse, value: any) => {
    if (editedStaff) {
      setEditedStaff({
        ...editedStaff,
        [field]: value
      });
    }
  };

  const handleRoleChange = (role: string, checked: boolean) => {
    if (!editedStaff) return;
    
    let newRoles = [...editedStaff.roles];
    if (checked) {
      if (!newRoles.includes(role)) {
        newRoles.push(role);
      }
    } else {
      newRoles = newRoles.filter(r => r !== role);
    }
    
    handleFieldChange('roles', newRoles);
  };

  const handleStatusToggle = async () => {
    if (!staff || !token) return;

    try {
      const newStatus = !staff.isActive;
      const result = newStatus 
        ? await hotelAdminApi.activateStaff(token, staff.id)
        : await hotelAdminApi.deactivateStaff(token, staff.id);
      
      if (result.success && result.data) {
        setStaff(result.data);
        setEditedStaff({ ...result.data });
        setSuccess(`Staff ${newStatus ? 'activated' : 'deactivated'} successfully`);
      } else {
        setError(result.message || 'Failed to update staff status');
      }
    } catch (err) {
      setError('Failed to update staff status');
      console.error('Error updating staff status:', err);
    }
  };

  const handleBack = () => {
    const returnTab = searchParams.get('returnTab');
    if (returnTab) {
      navigate(`/hotel-admin/dashboard?tab=${returnTab}`);
    } else {
      navigate('/hotel-admin/dashboard');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const currentStaff = isEditing ? editedStaff : staff;

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading staff details...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <IconButton onClick={handleBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
        </Box>
      </Container>
    );
  }

  if (!currentStaff) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Staff member not found
          </Alert>
          <IconButton onClick={handleBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={handleBack} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1">
              Staff Details
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!isEditing ? (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
              >
                Edit
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                >
                  Save
                </Button>
              </>
            )}
          </Box>
        </Box>

        {/* Staff Information Cards */}
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={currentStaff?.firstName || ''}
                      onChange={(e) => handleFieldChange('firstName', e.target.value)}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={currentStaff?.lastName || ''}
                      onChange={(e) => handleFieldChange('lastName', e.target.value)}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={currentStaff?.email || ''}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={currentStaff?.phone || ''}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Employment Details */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Employment Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Staff ID"
                      value={currentStaff?.id || ''}
                      disabled
                      variant="filled"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Status
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={currentStaff?.isActive ? 'Active' : 'Inactive'}
                          color={currentStaff?.isActive ? 'success' : 'error'}
                          variant="filled"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={currentStaff?.isActive || false}
                              onChange={handleStatusToggle}
                              disabled={isEditing}
                            />
                          }
                          label={currentStaff?.isActive ? 'Active' : 'Inactive'}
                        />
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Hotel"
                      value={currentStaff?.hotelName || ''}
                      disabled
                      variant="filled"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Roles & Permissions */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Roles & Permissions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    {isEditing ? (
                      <FormGroup>
                        <Typography variant="subtitle2" gutterBottom>
                          Assigned Roles
                        </Typography>
                        {availableRoles.map((role) => (
                          <FormControlLabel
                            key={role}
                            control={
                              <Checkbox
                                checked={currentStaff?.roles?.includes(role) || false}
                                onChange={(e) => handleRoleChange(role, e.target.checked)}
                              />
                            }
                            label={role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                          />
                        ))}
                      </FormGroup>
                    ) : (
                      <Box>
                        <Typography variant="caption" display="block" color="text.secondary">
                          Assigned Roles
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          {currentStaff?.roles?.map((role) => (
                            <Chip
                              key={role}
                              label={role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Account Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Account Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Account Created"
                      value={currentStaff ? formatDate(currentStaff.createdAt) : ''}
                      disabled
                      variant="filled"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Last Updated"
                      value={currentStaff ? formatDate(currentStaff.updatedAt) : ''}
                      disabled
                      variant="filled"
                    />
                  </Grid>
                  {currentStaff?.lastLogin && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Last Login"
                        value={formatDate(currentStaff.lastLogin)}
                        disabled
                        variant="filled"
                      />
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Success/Error Messages */}
        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess(null)}
        >
          <Alert onClose={() => setSuccess(null)} severity="success">
            {success}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert onClose={() => setError(null)} severity="error">
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default StaffDetails;
