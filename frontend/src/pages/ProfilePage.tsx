import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Button,
  Avatar,
  Grid,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/common/ThemeToggle';
import { COLORS } from '../theme/themeColors';

const ProfilePage: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSave = async () => {
    try {
      // Validate form
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        setErrorMessage('First name and last name are required');
        return;
      }

      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setErrorMessage('New passwords do not match');
          return;
        }
        if (formData.newPassword.length < 6) {
          setErrorMessage('New password must be at least 6 characters long');
          return;
        }
        if (!formData.currentPassword) {
          setErrorMessage('Current password is required to change password');
          return;
        }
      }

      // Prepare profile updates (excluding password fields)
      const profileUpdates = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      };

      // Update profile using the context function
      const profileSuccess = await updateProfile(profileUpdates);
      
      if (!profileSuccess) {
        setErrorMessage('Failed to update profile. Please try again.');
        return;
      }

      // Handle password change if requested
      if (formData.newPassword) {
        const passwordSuccess = await changePassword(formData.currentPassword, formData.newPassword);
        
        if (!passwordSuccess) {
          setErrorMessage('Profile updated, but failed to change password. Please try again.');
          return;
        }
      }

      // Success
      setSuccessMessage(
        formData.newPassword 
          ? 'Profile and password updated successfully!' 
          : 'Profile updated successfully!'
      );
      setIsEditing(false);
      setErrorMessage('');
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

    } catch (error) {
      setErrorMessage('Failed to update profile. Please try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ 
          fontWeight: 'bold', 
          mb: 3,
          color: COLORS.PRIMARY,
          textAlign: 'center'
        }}
      >
        My Profile
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Overview Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center', p: 3, height: 'fit-content' }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                mx: 'auto',
                mb: 2,
                backgroundColor: COLORS.PRIMARY,
                fontSize: '2.5rem',
                fontWeight: 'bold',
                border: `4px solid ${COLORS.PRIMARY}20`,
              }}
            >
              {user?.firstName?.[0] || user?.email?.[0] || <PersonIcon />}
            </Avatar>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 1 }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 1 }}>
              {user?.email}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ 
              backgroundColor: 'rgba(0,0,0,0.04)', 
              px: 2, 
              py: 0.5, 
              borderRadius: 1,
              display: 'inline-block'
            }}>
              {user?.role === 'ADMIN' ? 'Administrator' : 
               user?.role === 'HOTEL_ADMIN' ? 'Hotel Administrator' :
               user?.role === 'HOTEL_MANAGER' ? 'Hotel Manager' : 
               user?.role === 'FRONTDESK' ? 'Front Desk' :
               user?.role === 'HOUSEKEEPING' ? 'Housekeeping' : 'Guest'}
            </Typography>
            {!isEditing && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={{ 
                  mt: 2, 
                  backgroundColor: COLORS.PRIMARY,
                  '&:hover': {
                    backgroundColor: COLORS.PRIMARY,
                    filter: 'brightness(0.9)'
                  }
                }}
              >
                Edit Profile
              </Button>
            )}
          </Card>
        </Grid>

        {/* Profile Details Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.PRIMARY }}>
                  Profile Information
                </Typography>
                {isEditing && (
                  <Box>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      sx={{ mr: 1 }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      sx={{
                        backgroundColor: COLORS.PRIMARY,
                        '&:hover': {
                          backgroundColor: COLORS.PRIMARY,
                          filter: 'brightness(0.9)'
                        }
                      }}
                    >
                      Save Changes
                    </Button>
                  </Box>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange('firstName')}
                    disabled={!isEditing}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange('lastName')}
                    disabled={!isEditing}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    disabled={!isEditing}
                    helperText={isEditing ? "Email changes may require verification" : ""}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    disabled={!isEditing}
                    placeholder="+1 (555) 123-4567"
                  />
                </Grid>
              </Grid>

              {isEditing && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontWeight: 'bold', 
                    color: COLORS.PRIMARY,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    Change Password (Optional)
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={handleInputChange('currentPassword')}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={togglePasswordVisibility} edge="end">
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="New Password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={handleInputChange('newPassword')}
                        helperText="At least 6 characters"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleInputChange('confirmPassword')}
                      />
                    </Grid>
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Account Information Card */}
      <Card sx={{ mt: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: COLORS.PRIMARY }}>
            Account Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Account Type
              </Typography>
              <Typography variant="body1" sx={{ 
                backgroundColor: `${COLORS.PRIMARY}15`, 
                color: COLORS.PRIMARY,
                px: 2, 
                py: 0.5, 
                borderRadius: 1,
                display: 'inline-block',
                fontWeight: 'medium'
              }}>
                {user?.role === 'ADMIN' ? 'Administrator' : 
                 user?.role === 'HOTEL_ADMIN' ? 'Hotel Administrator' :
                 user?.role === 'HOTEL_MANAGER' ? 'Hotel Manager' : 
                 user?.role === 'FRONTDESK' ? 'Front Desk' :
                 user?.role === 'HOUSEKEEPING' ? 'Housekeeping' : 'Guest'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Member Since
              </Typography>
              <Typography variant="body1">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Last Login
              </Typography>
              <Typography variant="body1">
                {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Account Status
              </Typography>
              <Typography variant="body1" sx={{ 
                color: COLORS.PRIMARY,
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}>
                ● Active
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Preferences Card */}
      <Card sx={{ mt: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: COLORS.PRIMARY }}>
            Preferences
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Theme Mode
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ThemeToggle variant="menu" size="medium" />
                <Typography variant="body2" color="text.secondary">
                  Choose between light and dark themes
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProfilePage;
