import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  alpha,
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Grid,
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
  Card,
  CardContent,
  Avatar,
  Stack,
  Badge,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Hotel as HotelIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  Verified as VerifiedIcon,
  Pending as PendingIcon,
  Cancel as InactiveIcon,
  Block as SuspendedIcon,
  Business as BusinessIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  AttachMoney as CurrencyIcon,
  Public as PublicIcon,
} from '@mui/icons-material';
import { useAuthenticatedApi } from '../../hooks/useAuthenticatedApi';
import { useTenant } from '../../contexts/TenantContext';
import { useSubmissionError } from '../../contexts/SubmissionErrorContext';
import PremiumDisplayField from '../../components/common/PremiumDisplayField';
import PremiumTextField from '../../components/common/PremiumTextField';
import PremiumSelect from '../../components/common/PremiumSelect';
import { composeSx, surfaceCardSx } from '../../theme/sxHelpers';

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
  const theme = useTheme();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { adminApiService } = useAuthenticatedApi();
  const { tenantId } = useTenant();
  const { showSubmissionError } = useSubmissionError();
  
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
        setError(t('admin.hotelDetail.errors.notFound'));
      }
    } catch (error) {
      // console.error('Error fetching hotel:', error);
      setError(t('admin.hotelDetail.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [adminApiService, id, t]);

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
      setSuccessMessage(t('admin.hotelDetail.messages.updateSuccess'));
      navigate(`/admin/hotels/${id}`);
    } catch (error) {
      // console.error('Error updating hotel:', error);
      showSubmissionError(error, {
        fallbackMessage: t('admin.hotelDetail.messages.updateFailed'),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBackToAdmin = () => {
    const returnTab = searchParams.get('returnTab');
    if (returnTab) {
      navigate(`/admin/dashboard?tab=${returnTab}`);
    } else {
      navigate('/system-dashboard');
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

  const infoBorderColor = alpha(theme.palette.info.main, 0.2);
  const heroWhiteSoft = alpha(theme.palette.common.white, 0.1);
  const heroWhiteMedium = alpha(theme.palette.common.white, 0.2);
  const heroWhiteStrong = alpha(theme.palette.common.white, 0.5);
  const heroWhiteHover = alpha(theme.palette.common.white, 0.9);
  const heroPattern = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${theme.palette.common.white.replace('#', '%23')}' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

  const translateHotelStatus = (status?: string) => t(`admin.hotelDetail.status.${status ?? 'ACTIVE'}`, status ?? 'ACTIVE');

  // Helper function to get status icon and color
  const getStatusInfo = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return { icon: <VerifiedIcon />, color: 'success' as const, bgColor: alpha(theme.palette.success.main, 0.12) };
      case 'PENDING':
        return { icon: <PendingIcon />, color: 'warning' as const, bgColor: alpha(theme.palette.warning.main, 0.12) };
      case 'INACTIVE':
        return { icon: <InactiveIcon />, color: 'default' as const, bgColor: alpha(theme.palette.text.secondary, 0.12) };
      case 'SUSPENDED':
        return { icon: <SuspendedIcon />, color: 'error' as const, bgColor: alpha(theme.palette.error.main, 0.12) };
      default:
        return { icon: <VerifiedIcon />, color: 'success' as const, bgColor: alpha(theme.palette.success.main, 0.12) };
    }
  };

  const statusInfo = getStatusInfo(currentHotel?.status || 'ACTIVE');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Enhanced Header with Hero Section */}
        <Paper 
          elevation={0}
          sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            borderRadius: 3,
            p: 4,
            mb: 4,
            color: 'common.white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Background Pattern */}
          <Box 
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundImage: heroPattern,
              opacity: 0.3
            }}
          />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  onClick={handleBackToAdmin} 
                  sx={{ 
                    mr: 2, 
                    color: 'common.white',
                    '&:hover': { bgcolor: heroWhiteSoft }
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Avatar 
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    bgcolor: heroWhiteMedium, 
                    mr: 3 
                  }}
                >
                  <HotelIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    color: 'common.white'
                  }}>
                    {currentHotel?.name || t('admin.hotelDetail.title')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      icon={statusInfo.icon}
                      label={translateHotelStatus(currentHotel?.status || 'ACTIVE')}
                      sx={{
                        color: 'common.white',
                        bgcolor: heroWhiteMedium,
                        '& .MuiChip-icon': { color: 'common.white' }
                      }}
                    />
                    {currentHotel?.city && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationIcon sx={{ mr: 0.5, fontSize: 16 }} />
                        <Typography variant="body1">
                          {currentHotel.city}, {currentHotel.country}
                        </Typography>
                      </Box>
                    )}
                  </Box>
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
                      sx={{
                        color: 'common.white',
                        borderColor: heroWhiteStrong,
                        '&:hover': { 
                          borderColor: 'common.white',
                          bgcolor: heroWhiteSoft
                        }
                      }}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                      onClick={handleSave}
                      disabled={saving}
                      sx={{
                        bgcolor: 'common.white',
                        color: 'primary.main',
                        '&:hover': { bgcolor: heroWhiteHover }
                      }}
                    >
                      {saving ? t('admin.hotelDetail.actions.saving') : t('admin.hotelDetail.actions.saveChanges')}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    sx={{
                      bgcolor: 'common.white',
                      color: 'primary.main',
                      '&:hover': { bgcolor: heroWhiteHover }
                    }}
                  >
                    {t('admin.hotelDetail.actions.editHotel')}
                  </Button>
                )}
              </Box>
            </Box>
            
            {/* Quick Stats in Hero */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {currentHotel?.totalRooms || '0'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {t('admin.hotelDetail.hero.totalRooms')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <StarIcon sx={{ mr: 0.5, color: 'warning.light' }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {currentHotel?.rating || t('common.notAvailable')}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {t('admin.hotelDetail.hero.averageRating')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {currentHotel?.createdAt ? 
                      Math.floor((Date.now() - new Date(currentHotel.createdAt).getTime()) / (1000 * 60 * 60 * 24))
                      : '0'
                    }
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {t('admin.hotelDetail.hero.daysActive')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {currentHotel?.currency || 'USD'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {t('admin.hotelDetail.hero.currency')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {currentHotel && (
          <Grid container spacing={4}>
            {/* Main Content Area */}
            <Grid item xs={12} lg={8}>
              {/* Basic Information Card */}
              <Card elevation={0} sx={composeSx(surfaceCardSx('default'), { mb: 4, border: `1px solid ${infoBorderColor}` })}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <BusinessIcon />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {t('admin.hotelDetail.sections.basicInformation')}
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <PremiumDisplayField
                        label={t('admin.hotelDetail.fields.hotelName')}
                        value={currentHotel.name}
                        isEditMode={isEditing}
                        onChange={(value) => handleInputChange('name', value)}
                        placeholder={t('common.notAvailable')}
                        required
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <PremiumDisplayField
                        label={t('admin.hotelDetail.fields.description')}
                        value={currentHotel.description}
                        isEditMode={isEditing}
                        onChange={(value) => handleInputChange('description', value)}
                        placeholder={t('common.notAvailable')}
                        multiline
                        rows={4}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <PremiumDisplayField
                        label={t('admin.hotelDetail.fields.phoneNumber')}
                        value={currentHotel.phone}
                        isEditMode={isEditing}
                        onChange={(value) => handleInputChange('phone', value)}
                        placeholder={t('common.notAvailable')}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <PremiumDisplayField
                        label={t('admin.hotelDetail.fields.emailAddress')}
                        value={currentHotel.email}
                        isEditMode={isEditing}
                        onChange={(value) => handleInputChange('email', value)}
                        placeholder={t('common.notAvailable')}
                        type="email"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <PremiumDisplayField
                        label={t('admin.hotelDetail.fields.websiteUrl')}
                        value={currentHotel.website}
                        isEditMode={isEditing}
                        onChange={(value) => handleInputChange('website', value)}
                        placeholder={t('common.notAvailable')}
                        type="url"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Location Information Card */}
              <Card elevation={0} sx={composeSx(surfaceCardSx('default'), { mb: 4, border: `1px solid ${infoBorderColor}` })}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                      <LocationIcon />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {t('admin.hotelDetail.sections.locationAddress')}
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <PremiumTextField
                        fullWidth
                        label={t('admin.hotelDetail.fields.streetAddress')}
                        value={currentHotel.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        disabled={!isEditing}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <PremiumTextField
                        fullWidth
                        label={t('admin.hotelDetail.fields.city')}
                        value={currentHotel.city || ''}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        disabled={!isEditing}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <PremiumTextField
                        fullWidth
                        label={t('admin.hotelDetail.fields.stateProvince')}
                        value={currentHotel.state || ''}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        disabled={!isEditing}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <PremiumTextField
                        fullWidth
                        label={t('admin.hotelDetail.fields.zipPostalCode')}
                        value={currentHotel.zipCode || ''}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        disabled={!isEditing}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <PremiumTextField
                        fullWidth
                        label={t('admin.hotelDetail.fields.country')}
                        value={currentHotel.country || ''}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        disabled={!isEditing}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Operations & Settings Card */}
              <Card elevation={0} sx={composeSx(surfaceCardSx('default'), { border: `1px solid ${infoBorderColor}` })}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                      <ScheduleIcon />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {t('admin.hotelDetail.sections.operationsSettings')}
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <PremiumTextField
                        fullWidth
                        label={t('admin.hotelDetail.fields.checkInTime')}
                        value={currentHotel.checkInTime || ''}
                        onChange={(e) => handleInputChange('checkInTime', e.target.value)}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: (
                            <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                              <TimeIcon sx={{ color: 'info.main' }} />
                            </Box>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <PremiumTextField
                        fullWidth
                        label={t('admin.hotelDetail.fields.checkOutTime')}
                        value={currentHotel.checkOutTime || ''}
                        onChange={(e) => handleInputChange('checkOutTime', e.target.value)}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: (
                            <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                              <TimeIcon sx={{ color: 'info.main' }} />
                            </Box>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <PremiumTextField
                        fullWidth
                        label={t('admin.hotelDetail.fields.currency')}
                        value={currentHotel.currency || ''}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: (
                            <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                              <CurrencyIcon sx={{ color: 'success.main' }} />
                            </Box>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <PremiumTextField
                        fullWidth
                        label={t('admin.hotelDetail.fields.timeZone')}
                        value={currentHotel.timeZone || ''}
                        onChange={(e) => handleInputChange('timeZone', e.target.value)}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: (
                            <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                              <PublicIcon sx={{ color: 'warning.main' }} />
                            </Box>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} lg={4}>
              {/* Status Management Card */}
              <Card elevation={0} sx={composeSx(surfaceCardSx('default'), { mb: 4, border: `1px solid ${infoBorderColor}` })}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: statusInfo.bgColor, mr: 2 }}>
                      {React.cloneElement(statusInfo.icon, { sx: { color: `${statusInfo.color}.main` } })}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {t('admin.hotelDetail.sections.statusManagement')}
                    </Typography>
                  </Box>
                  
                  <PremiumSelect
                    fullWidth
                    label={t('admin.hotelDetail.fields.hotelStatus')}
                    value={currentHotel.status || 'ACTIVE'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    disabled={!isEditing}
                    sx={{ mb: 3 }}
                  >
                    <MenuItem value="ACTIVE">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <VerifiedIcon sx={{ mr: 1, color: 'success.main' }} />
                        {t('admin.hotelDetail.status.ACTIVE')}
                      </Box>
                    </MenuItem>
                    <MenuItem value="PENDING">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PendingIcon sx={{ mr: 1, color: 'warning.main' }} />
                        {t('admin.hotelDetail.status.PENDING')}
                      </Box>
                    </MenuItem>
                    <MenuItem value="INACTIVE">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <InactiveIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        {t('admin.hotelDetail.status.INACTIVE')}
                      </Box>
                    </MenuItem>
                    <MenuItem value="SUSPENDED">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SuspendedIcon sx={{ mr: 1, color: 'error.main' }} />
                        {t('admin.hotelDetail.status.SUSPENDED')}
                      </Box>
                    </MenuItem>
                  </PremiumSelect>

                  <Box sx={{ textAlign: 'center' }}>
                    <Chip
                      icon={statusInfo.icon}
                      label={translateHotelStatus(currentHotel.status || 'ACTIVE')}
                      color={statusInfo.color}
                      variant="filled"
                      size="medium"
                      sx={{ px: 2, py: 1, fontSize: '0.875rem' }}
                    />
                  </Box>
                </CardContent>
              </Card>

              {/* Analytics Card */}
              <Card elevation={0} sx={composeSx(surfaceCardSx('default'), { mb: 4, border: `1px solid ${infoBorderColor}` })}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <AnalyticsIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {t('admin.hotelDetail.sections.performanceMetrics')}
                    </Typography>
                  </Box>
                  
                  <Stack spacing={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.50', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                        <StarIcon sx={{ color: 'warning.main', mr: 1 }} />
                        <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
                          {currentHotel.rating || t('common.notAvailable')}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="warning.dark" sx={{ fontWeight: 500 }}>
                        {t('admin.hotelDetail.hero.averageRating')}
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                        {currentHotel.totalRooms || '0'}
                      </Typography>
                      <Typography variant="body2" color="primary.dark" sx={{ fontWeight: 500 }}>
                        {t('admin.hotelDetail.hero.totalRooms')}
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                        <TrendingUpIcon sx={{ color: 'success.main', mr: 1 }} />
                        <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                          85%
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="success.dark" sx={{ fontWeight: 500 }}>
                        {t('admin.hotelDetail.sections.occupancyRate')}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* System Information Card */}
              <Card elevation={0} sx={composeSx(surfaceCardSx('default'), { border: `1px solid ${infoBorderColor}` })}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                      <CalendarIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {t('admin.hotelDetail.sections.systemInformation')}
                    </Typography>
                  </Box>
                  
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {t('admin.hotelDetail.fields.createdDate')}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {currentHotel.createdAt ? 
                          new Date(currentHotel.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                          : t('common.notAvailable')
                        }
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {t('admin.hotelDetail.fields.lastUpdated')}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {currentHotel.updatedAt ? 
                          new Date(currentHotel.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                          : t('common.notAvailable')
                        }
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {t('admin.hotelDetail.fields.hotelId')}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                        #{currentHotel.id}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {t('admin.hotelDetail.fields.activeStatus')}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Badge 
                          variant="dot" 
                          sx={{ 
                            '& .MuiBadge-badge': { 
                              bgcolor: currentHotel.isActive ? 'success.main' : 'error.main',
                              mr: 1
                            } 
                          }}
                        />
                        <Typography variant="body1" sx={{ fontWeight: 500, ml: 1 }}>
                          {currentHotel.isActive ? t('admin.hotelDetail.status.ACTIVE') : t('admin.hotelDetail.status.INACTIVE')}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Professional Footer */}
        <Box sx={{ mt: 6, pt: 4, textAlign: 'center' }}>
          <Divider sx={{ mb: 4 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t('admin.hotelDetail.footer.version')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('admin.hotelDetail.footer.subtitle')}
          </Typography>
        </Box>

        {/* Cancel Confirmation Dialog */}
        <Dialog open={showCancelDialog} onClose={() => setShowCancelDialog(false)}>
          <DialogTitle>{t('admin.hotelDetail.dialog.discardTitle')}</DialogTitle>
          <DialogContent>
            <Typography>
              {t('admin.hotelDetail.dialog.discardMessage')}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCancelDialog(false)}>{t('admin.hotelDetail.dialog.keepEditing')}</Button>
            <Button onClick={cancelEdit} color="error">
              {t('admin.hotelDetail.dialog.discardChanges')}
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
    </Box>
  );
};

export default HotelViewEdit;
