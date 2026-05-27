import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Grid,
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
  Switch,
  FormControlLabel,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import { useAuthenticatedApi } from '../../hooks/useAuthenticatedApi';
import { useSubmissionError } from '../../contexts/SubmissionErrorContext';
import PremiumDisplayField from '../../components/common/PremiumDisplayField';

interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roles: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

const UserViewEdit: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { adminApiService } = useAuthenticatedApi();
  const { showSubmissionError } = useSubmissionError();
  
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editedUser, setEditedUser] = useState<UserData | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Check if we're in edit mode based on URL
  useEffect(() => {
    const path = window.location.pathname;
    setIsEditing(path.includes('/edit'));
  }, []);

  const fetchUser = useCallback(async () => {
    if (!adminApiService || !id) return;
    
    try {
      setLoading(true);
      const response = await adminApiService.getUsers(0, 1000); // Get all users for now
      const foundUser = response.content.find((u: any) => u.id === parseInt(id));
      
      if (foundUser) {
        setUser(foundUser);
        setEditedUser({ ...foundUser });
      } else {
        setError(t('admin.userDetail.errors.notFound'));
      }
    } catch (error) {
      // console.error('Error fetching user:', error);
      setError(t('admin.userDetail.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [adminApiService, id, t]);

  useEffect(() => {
    if (id && adminApiService) {
      fetchUser();
    }
  }, [id, adminApiService, fetchUser]);

  // SUPER_ADMIN users cannot be viewed or edited via the UI
  useEffect(() => {
    if (user?.roles?.includes('SUPER_ADMIN')) {
      navigate(-1);
    }
  }, [user, navigate]);

  const handleEdit = () => {
    setIsEditing(true);
    navigate(`/admin/users/${id}/edit`);
  };

  const handleCancelEdit = () => {
    if (editedUser && user && JSON.stringify(editedUser) !== JSON.stringify(user)) {
      setShowCancelDialog(true);
    } else {
      cancelEdit();
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditedUser(user ? { ...user } : null);
    setShowCancelDialog(false);
    navigate(`/admin/users/${id}`);
  };

  const handleSave = async () => {
    if (!adminApiService || !editedUser) return;

    try {
      setSaving(true);
      
      // Convert UserData to UpdateUserRequest format
      const updateRequest = {
        firstName: editedUser.firstName,
        lastName: editedUser.lastName,
        email: editedUser.email,
        phone: editedUser.phone,
        roles: editedUser.roles,
        isActive: editedUser.isActive,
      };
      
      await adminApiService.updateUser(editedUser.id, updateRequest);
      setUser({ ...editedUser });
      setIsEditing(false);
      setSuccessMessage(t('admin.userDetail.messages.updateSuccess'));
      navigate(`/admin/users/${id}`);
    } catch (error) {
      // console.error('Error updating user:', error);
      showSubmissionError(error, {
        fallbackMessage: t('admin.userDetail.messages.updateFailed'),
      });
    } finally {
      setSaving(false);
    }
  };

  const translateRole = (role: string) => t(`admin.userDetail.roles.${role}`, role);

  const handleBackToAdmin = () => {
    const returnTab = searchParams.get('returnTab');
    if (returnTab) {
      navigate(`/admin/dashboard?tab=${returnTab}`);
    } else {
      navigate('/system-dashboard');
    }
  };

  const handleInputChange = (field: keyof UserData, value: any) => {
    if (editedUser) {
      setEditedUser({
        ...editedUser,
        [field]: value,
      });
    }
  };

  const handleRoleChange = (newRoles: string[]) => {
    if (editedUser) {
      setEditedUser({
        ...editedUser,
        roles: newRoles,
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

  if (error && !user) {
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

  const currentUser = isEditing ? editedUser : user;
  const isSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN') ?? false;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {isSuperAdmin && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t('admin.userDetail.superAdminInfo')}
        </Alert>
      )}
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleBackToAdmin} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 'bold', 
              display: 'flex', 
              alignItems: 'center',
              color: theme.palette.primary.main
            }}>
              <PersonIcon sx={{ mr: 1 }} />
              {isEditing ? t('admin.userDetail.actions.editUser') : t('admin.userDetail.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentUser?.firstName} {currentUser?.lastName}
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
                {t('common.cancel')}
              </Button>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? t('admin.userDetail.actions.saving') : t('admin.userDetail.actions.saveChanges')}
              </Button>
            </>
          ) : (
            !isSuperAdmin && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEdit}
              >
                {t('admin.userDetail.actions.editUser')}
              </Button>
            )
          )}
        </Box>
      </Box>

      {currentUser && (
        <Grid container spacing={3}>
          {/* User Information */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                {t('admin.userDetail.sections.personalInformation')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <PremiumDisplayField
                    label={t('admin.userDetail.fields.firstName')}
                    value={currentUser.firstName}
                    isEditMode={isEditing}
                    onChange={(value) => handleInputChange('firstName', value)}
                    placeholder={t('common.notAvailable')}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <PremiumDisplayField
                    label={t('admin.userDetail.fields.lastName')}
                    value={currentUser.lastName}
                    isEditMode={isEditing}
                    onChange={(value) => handleInputChange('lastName', value)}
                    placeholder={t('common.notAvailable')}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <PremiumDisplayField
                    label={t('admin.userDetail.fields.email')}
                    value={currentUser.email}
                    isEditMode={isEditing}
                    onChange={(value) => handleInputChange('email', value)}
                    placeholder={t('common.notAvailable')}
                    type="email"
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <PremiumDisplayField
                    label={t('admin.userDetail.fields.phone')}
                    value={currentUser.phone}
                    isEditMode={isEditing}
                    onChange={(value) => handleInputChange('phone', value)}
                    placeholder={t('common.notAvailable')}
                    type="tel"
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Roles and Permissions */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                {t('admin.userDetail.sections.rolesPermissions')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth disabled={!isEditing} variant={isEditing ? 'outlined' : 'filled'}>
                    <InputLabel>{t('admin.userDetail.fields.roles')}</InputLabel>
                    <Select
                      multiple
                      value={currentUser.roles || []}
                      onChange={(e) => handleRoleChange(e.target.value as string[])}
                      label={t('admin.userDetail.fields.roles')}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(selected as string[]).map((value) => (
                            <Chip key={value} label={translateRole(value)} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      <MenuItem value="ADMIN">{t('admin.userDetail.roles.ADMIN')}</MenuItem>
                      <MenuItem value="HOTEL_ADMIN">{t('admin.userDetail.roles.HOTEL_ADMIN')}</MenuItem>
                      <MenuItem value="OPERATIONAL_ADMIN">{t('admin.userDetail.roles.OPERATIONAL_ADMIN')}</MenuItem>
                      <MenuItem value="CUSTOMER">{t('admin.userDetail.roles.CUSTOMER')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Side Panel */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                {t('admin.userDetail.sections.accountStatus')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentUser.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      disabled={!isEditing || isSuperAdmin}
                    />
                  }
                  label={t('admin.userDetail.fields.activeAccount')}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Chip
                  label={currentUser.isActive ? t('admin.userDetail.status.active') : t('admin.userDetail.status.inactive')}
                  color={currentUser.isActive ? 'success' : 'default'}
                  variant={currentUser.isActive ? 'filled' : 'outlined'}
                />
              </Box>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                {t('admin.userDetail.sections.accountInformation')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  <BadgeIcon sx={{ color: 'primary.main', mr: 0.5 }} />
                  <Typography variant="h6" component="span" sx={{ fontWeight: 'bold' }}>
                    {t('admin.userDetail.fields.accountId', { id: currentUser.id })}
                  </Typography>
                </Box>

                {currentUser.createdAt && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('admin.userDetail.fields.created')}: {new Date(currentUser.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}

                {currentUser.lastLoginAt && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('admin.userDetail.fields.lastLogin')}: {new Date(currentUser.lastLoginAt).toLocaleDateString()}
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
        <DialogTitle>{t('admin.userDetail.dialog.discardTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('admin.userDetail.dialog.discardMessage')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelDialog(false)}>{t('admin.userDetail.dialog.keepEditing')}</Button>
          <Button onClick={cancelEdit} color="error">
            {t('admin.userDetail.dialog.discardChanges')}
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

export default UserViewEdit;
