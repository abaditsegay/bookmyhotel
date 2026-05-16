import React, { useState, useEffect } from 'react';
import { alpha } from '@mui/material/styles';
import { normalizeEthiopianPhone } from '../utils/phoneUtils';
import {
  Box,
  CardContent,
  Chip,
  Container,
  Typography,
  Avatar,
  Grid,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
  useTheme,
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
import StandardCard from '../components/common/StandardCard';
import StandardButton from '../components/common/StandardButton';
import PremiumTextField from '../components/common/PremiumTextField';
import { formatDateForDisplay, formatDateTimeForDisplay } from '../utils/dateUtils';
import { useSubmissionError } from '../contexts/SubmissionErrorContext';
import { getInsetSurfaceBackground, getReadableAccentTextColor, getSectionTint } from '../theme/surfaces';

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const readableAccentColor = getReadableAccentTextColor(theme);
  const accentBorder = alpha(readableAccentColor, theme.palette.mode === 'dark' ? 0.3 : 0.14);
  const accentHover = alpha(readableAccentColor, theme.palette.mode === 'dark' ? 0.14 : 0.08);
  const heroSurface = getInsetSurfaceBackground(theme, 'primary');
  const { user, updateProfile, changePassword } = useAuth();
  const { showSubmissionError } = useSubmissionError();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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
  };

  const handleSave = async () => {
    try {
      // Validate form
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        showSubmissionError('First name and last name are required');
        return;
      }

      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          showSubmissionError('New passwords do not match');
          return;
        }
        if (formData.newPassword.length < 6) {
          showSubmissionError('New password must be at least 6 characters long');
          return;
        }
        if (!formData.currentPassword) {
          showSubmissionError('Current password is required to change password');
          return;
        }
      }

      // Prepare profile updates (excluding password fields)
      const profileUpdates = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: normalizeEthiopianPhone(formData.phone.trim()),
      };

      // Update profile using the context function
      const profileSuccess = await updateProfile(profileUpdates);
      
      if (!profileSuccess) {
        showSubmissionError('Failed to update profile. Please try again.', {
          fallbackMessage: 'Failed to update profile. Please try again.',
        });
        return;
      }

      // Handle password change if requested
      if (formData.newPassword) {
        const passwordSuccess = await changePassword(formData.currentPassword, formData.newPassword);
        
        if (!passwordSuccess) {
          showSubmissionError('Profile updated, but failed to change password. Please try again.', {
            fallbackMessage: 'Profile updated, but failed to change password. Please try again.',
          });
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
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

    } catch (error) {
      showSubmissionError(error, {
        fallbackMessage: 'Failed to update profile. Please try again.',
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const roleLabel =
    user?.role === 'SUPER_ADMIN' ? 'Super Administrator' :
    user?.role === 'ADMIN' ? 'Administrator' :
    user?.role === 'HOTEL_ADMIN' ? 'Hotel Administrator' :
    user?.role === 'OPERATIONAL_ADMIN' ? 'Operational Administrator' :
    user?.role === 'FRONTDESK' ? 'Front Desk' :
    user?.role === 'HOUSEKEEPING' ? 'Housekeeping' :
    user?.role === 'MAINTENANCE' ? 'Maintenance' :
    user?.role === 'CUSTOMER' ? 'Customer' :
    'Guest';

  const profileInitials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.trim() || user?.email?.[0]?.toUpperCase() || '';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      <StandardCard
        cardVariant="elevated"
        sx={{
          mb: 3,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 }, backgroundColor: heroSurface }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 2.5, alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Avatar
                sx={{
                  width: 88,
                  height: 88,
                  backgroundColor: readableAccentColor,
                  color: theme.palette.getContrastText(readableAccentColor),
                  fontSize: '2rem',
                  fontWeight: 700,
                }}
              >
                {profileInitials || <PersonIcon />}
              </Avatar>
              <Box>
                <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.08em' }}>
                  Profile
                </Typography>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.75 }}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1.5 }}>
                  {user?.email}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label={roleLabel} variant="outlined" sx={{ borderColor: accentBorder, color: readableAccentColor, backgroundColor: accentHover }} />
                  <Chip label="Active account" size="small" sx={{ backgroundColor: getSectionTint(theme, 'success'), color: theme.palette.success.main, fontWeight: 600 }} />
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              {!isEditing ? (
                <StandardButton
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  sx={{ px: 2.5 }}
                >
                  Edit Profile
                </StandardButton>
              ) : (
                <>
                  <StandardButton
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    sx={{ color: readableAccentColor, borderColor: accentBorder, '&:hover': { borderColor: readableAccentColor, backgroundColor: accentHover } }}
                  >
                    Cancel
                  </StandardButton>
                  <StandardButton
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                  >
                    Save Changes
                  </StandardButton>
                </>
              )}
            </Box>
          </Box>
        </CardContent>
      </StandardCard>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <StandardCard cardVariant="outlined">
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: readableAccentColor, mb: 0.5 }}>
                  Personal information
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Keep your identity and contact details current so the rest of the platform stays in sync.
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    fullWidth
                    label="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange('firstName')}
                    disabled={!isEditing}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    fullWidth
                    label="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange('lastName')}
                    disabled={!isEditing}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <PremiumTextField
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
                  <PremiumTextField
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
                  <Divider sx={{ my: 4 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ 
                      fontWeight: 700,
                      color: readableAccentColor,
                    }}>
                    Change Password (Optional)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Only fill these fields if you want to update your password.
                    </Typography>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <PremiumTextField
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
                      <PremiumTextField
                        fullWidth
                        label="New Password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={handleInputChange('newPassword')}
                        helperText="At least 6 characters"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <PremiumTextField
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
          </StandardCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <StandardCard cardVariant="outlined">
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: readableAccentColor, mb: 2.5 }}>
                Account overview
              </Typography>

              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box sx={{ pb: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="caption" color="text.secondary">Account Type</Typography>
                  <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 600 }}>{roleLabel}</Typography>
                </Box>
                <Box sx={{ pb: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="caption" color="text.secondary">Member Since</Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>{user?.createdAt ? formatDateForDisplay(user.createdAt) : 'N/A'}</Typography>
                </Box>
                <Box sx={{ pb: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="caption" color="text.secondary">Last Login</Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>{user?.lastLogin ? formatDateTimeForDisplay(user.lastLogin) : 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Account Status</Typography>
                  <Typography variant="body1" sx={{ mt: 0.5, color: readableAccentColor, fontWeight: 600 }}>
                    Active
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: readableAccentColor, mb: 1.5 }}>
                  Preferences
                </Typography>
                <Box sx={{ p: 2, borderRadius: 2, backgroundColor: getSectionTint(theme, 'primary') }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Theme Mode
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <Typography variant="body2">
                      Choose between light and dark themes
                    </Typography>
                    <ThemeToggle variant="menu" size="medium" />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </StandardCard>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;
