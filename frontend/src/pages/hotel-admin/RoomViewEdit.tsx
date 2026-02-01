import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  IconButton,
  Divider,
  Card,
  CardContent,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { hotelAdminApi, RoomResponse } from '../../services/hotelAdminApi';
import { ROOM_TYPES } from '../../constants/roomTypes';
import PremiumDisplayField from '../../components/common/PremiumDisplayField';
import PremiumTextField from '../../components/common/PremiumTextField';
import PremiumSelect from '../../components/common/PremiumSelect';
import StandardButton from '../../components/common/StandardButton';
import { COLORS, addAlpha } from '../../theme/themeColors';

const RoomViewEdit: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  
  const [room, setRoom] = useState<RoomResponse | null>(null);
  const [editedRoom, setEditedRoom] = useState<RoomResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadRoom = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);
        
        const roomId = parseInt(id || '0');
        if (!roomId) {
          setError(t('rooms.details.errors.invalidRoomId'));
          return;
        }

        // console.log('Loading room with ID:', roomId);
        
        const result = await hotelAdminApi.getRoomById(token, roomId);
        
        if (result.success && result.data) {
          // console.log('Found room:', result.data);
          setRoom(result.data);
          setEditedRoom({ ...result.data });
        } else {
          // console.log('Room not found for ID:', roomId);
          setError(result.message || `Room not found for ID: ${roomId}`);
        }
      } catch (err) {
        setError(t('rooms.details.errors.failedToLoad'));
        // console.error('Error loading room:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadRoom();
    }
  }, [id, token, t]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedRoom(room ? { ...room } : null);
  };

  const handleSave = async () => {
    if (!editedRoom || !token) return;

    try {
      const result = await hotelAdminApi.updateRoom(token, editedRoom.id, {
        roomNumber: editedRoom.roomNumber,
        roomType: editedRoom.roomType,
        pricePerNight: editedRoom.pricePerNight,
        capacity: editedRoom.capacity,
        description: editedRoom.description,
      });
      
      if (result.success && result.data) {
        setRoom(result.data);
        setEditedRoom({ ...result.data });
        setIsEditing(false);
        setSuccess(t('rooms.details.success.roomUpdated'));
      } else {
        setError(result.message || t('rooms.details.errors.failedToUpdate'));
      }
    } catch (err) {
      setError(t('rooms.details.errors.failedToUpdate'));
      // console.error('Error updating room:', err);
    }
  };

  const handleFieldChange = (field: keyof RoomResponse, value: any) => {
    if (editedRoom) {
      setEditedRoom({
        ...editedRoom,
        [field]: value
      });
    }
  };

  const handleStatusToggle = async () => {
    if (!room || !token) return;

    try {
      // Note: Room availability toggle would need a separate API endpoint
      // For now, just show a message that this feature is not implemented
      setError(t('rooms.details.errors.apiNotSupported'));
    } catch (err) {
      setError(t('rooms.details.errors.failedToUpdateStatus'));
      // console.error('Error updating room status:', err);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB'
    }).format(amount);
  };

  const currentRoom = isEditing ? editedRoom : room;

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading room details...
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

  if (!currentRoom) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Room not found
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
              {t('rooms.details.title')}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!isEditing ? (
              <StandardButton
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={{
                  borderColor: addAlpha(COLORS.SECONDARY, 0.6),
                  color: COLORS.PRIMARY,
                  '&:hover': {
                    borderColor: COLORS.SECONDARY,
                    bgcolor: addAlpha(COLORS.SECONDARY, 0.08),
                  },
                }}
              >
                {t('rooms.details.edit')}
              </StandardButton>
            ) : (
              <>
                <StandardButton
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  sx={{
                    borderColor: addAlpha(COLORS.SECONDARY, 0.6),
                    color: COLORS.PRIMARY,
                    '&:hover': {
                      borderColor: COLORS.SECONDARY,
                      bgcolor: addAlpha(COLORS.SECONDARY, 0.08),
                    },
                  }}
                >
                  {t('rooms.details.cancel')}
                </StandardButton>
                <StandardButton
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  gradient
                  sx={{
                    background: COLORS.GRADIENT_SECONDARY,
                    '&:hover': {
                      background: COLORS.GRADIENT_WARM,
                    },
                  }}
                >
                  {t('rooms.details.save')}
                </StandardButton>
              </>
            )}
          </Box>
        </Box>

        {/* Room Information Cards */}
        <Grid container spacing={3}>
          {/* Basic Room Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('rooms.details.basicInformation')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label={t('rooms.details.roomNumber')}
                      value={currentRoom?.roomNumber}
                      isEditMode={isEditing}
                      onChange={(value) => handleFieldChange('roomNumber', value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {isEditing ? (
                      <PremiumSelect
                        fullWidth
                        label={t('rooms.details.roomType')}
                        value={currentRoom?.roomType || ''}
                        onChange={(e) => handleFieldChange('roomType', e.target.value)}
                      >
                        {ROOM_TYPES.map((roomType) => (
                          <MenuItem key={roomType.value} value={roomType.value}>
                            {roomType.value}
                          </MenuItem>
                        ))}
                      </PremiumSelect>
                    ) : (
                      <PremiumTextField
                        fullWidth
                        label={t('rooms.details.roomType')}
                        value={currentRoom?.roomType || ''}
                        disabled
                      />
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label={t('rooms.details.roomId')}
                      value={currentRoom?.id?.toString()}
                      isEditMode={false}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label={t('rooms.details.capacity')}
                      value={currentRoom?.capacity?.toString()}
                      isEditMode={isEditing}
                      onChange={(value) => handleFieldChange('capacity', parseInt(value) || 0)}
                      type="number"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Pricing & Availability */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('rooms.details.pricingAndAvailability')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <PremiumDisplayField
                      label={t('rooms.details.pricePerNight')}
                      value={currentRoom?.pricePerNight ? `ETB ${currentRoom.pricePerNight}` : undefined}
                      isEditMode={isEditing}
                      onChange={(value) => handleFieldChange('pricePerNight', parseFloat(value.replace('ETB ', '')) || 0)}
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {t('rooms.details.availabilityStatus')}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: currentRoom?.isAvailable ? COLORS.SUCCESS : COLORS.ERROR,
                            bgcolor: currentRoom?.isAvailable
                              ? addAlpha(COLORS.SUCCESS, 0.12)
                              : addAlpha(COLORS.ERROR, 0.12),
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 2,
                          }}
                        >
                          {currentRoom?.isAvailable ? t('rooms.details.available') : t('rooms.details.unavailable')}
                        </Typography>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={currentRoom?.isAvailable || false}
                              onChange={handleStatusToggle}
                              disabled={isEditing}
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: COLORS.SECONDARY,
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: COLORS.SECONDARY,
                                },
                              }}
                            />
                          }
                          label={currentRoom?.isAvailable ? t('rooms.details.available') : t('rooms.details.unavailable')}
                        />
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <PremiumTextField
                      fullWidth
                      label={t('rooms.details.currentRate')}
                      value={currentRoom ? formatCurrency(currentRoom.pricePerNight) : ''}
                      disabled
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Room Description */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('rooms.details.description')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <PremiumTextField
                      fullWidth
                      label={t('rooms.details.roomDescription')}
                      multiline
                      rows={4}
                      value={currentRoom?.description || ''}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      disabled={!isEditing}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Hotel Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('rooms.details.hotelInformation')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <PremiumTextField
                      fullWidth
                      label={t('rooms.details.hotelName')}
                      value={currentRoom?.hotelName || ''}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumTextField
                      fullWidth
                      label={t('rooms.details.hotelId')}
                      value={currentRoom?.hotelId || ''}
                      disabled
                    />
                  </Grid>
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

export default RoomViewEdit;
