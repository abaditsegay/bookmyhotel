
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  Chip,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Switch,
  FormControlLabel,
  Avatar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Room as RoomIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Hotel as HotelIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as UnavailableIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { hotelAdminApi, RoomResponse, RoomUpdateRequest } from '../../services/hotelAdminApi';

const RoomDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [room, setRoom] = useState<RoomResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editedRoom, setEditedRoom] = useState<RoomUpdateRequest | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const roomTypes = ['SINGLE', 'DOUBLE', 'DELUXE', 'SUITE', 'PRESIDENTIAL'];

  useEffect(() => {
    const loadRoom = async () => {
      if (!token || !id) {
        setError('Authentication required or invalid room ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const roomId = parseInt(id, 10);
        if (isNaN(roomId) || roomId <= 0) {
          setError('Invalid room ID');
          return;
        }

        const response = await hotelAdminApi.getRoomById(token, roomId);
        
        if (response.success && response.data) {
          setRoom(response.data);
          setEditedRoom({
            roomNumber: response.data.roomNumber,
            roomType: response.data.roomType,
            pricePerNight: response.data.pricePerNight,
            capacity: response.data.capacity,
            description: response.data.description || '',
          });
        } else {
          setError(response.message || `Room not found with ID: ${roomId}`);
        }
      } catch (err) {
        setError('Failed to load room details');
        console.error('Error loading room:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [id, token]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (editedRoom && room && hasChanges()) {
      setShowCancelDialog(true);
    } else {
      cancelEdit();
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    if (room) {
      setEditedRoom({
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        pricePerNight: room.pricePerNight,
        capacity: room.capacity,
        description: room.description || '',
      });
    }
    setShowCancelDialog(false);
  };

  const hasChanges = (): boolean => {
    if (!editedRoom || !room) return false;
    
    return (
      editedRoom.roomNumber !== room.roomNumber ||
      editedRoom.roomType !== room.roomType ||
      editedRoom.pricePerNight !== room.pricePerNight ||
      editedRoom.capacity !== room.capacity ||
      editedRoom.description !== (room.description || '')
    );
  };

  const handleSave = async () => {
    if (!editedRoom || !room || !token) return;

    try {
      setSaving(true);
      
      const response = await hotelAdminApi.updateRoom(token, room.id, editedRoom);
      
      if (response.success && response.data) {
        setRoom(response.data);
        setEditedRoom({
          roomNumber: response.data.roomNumber,
          roomType: response.data.roomType,
          pricePerNight: response.data.pricePerNight,
          capacity: response.data.capacity,
          description: response.data.description || '',
        });
        setIsEditing(false);
        setSuccessMessage('Room updated successfully');
        setError(null);
      } else {
        setError(response.message || 'Failed to update room');
      }
    } catch (err) {
      console.error('Error updating room:', err);
      setError('Failed to update room. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!room || !token) return;

    try {
      setSaving(true);
      const response = await hotelAdminApi.toggleRoomAvailability(token, room.id, !room.isAvailable);
      
      if (response.success && response.data) {
        setRoom(response.data);
        setSuccessMessage(`Room ${response.data.isAvailable ? 'activated' : 'deactivated'} successfully`);
      } else {
        setError(response.message || 'Failed to update room availability');
      }
    } catch (err) {
      console.error('Error toggling room availability:', err);
      setError('Failed to update room availability.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof RoomUpdateRequest, value: any) => {
    if (editedRoom) {
      setEditedRoom({
        ...editedRoom,
        [field]: value,
      });
    }
  };

  const handleBack = () => {
    navigate('/hotel-admin/rooms');
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (isAvailable: boolean) => {
    return isAvailable ? 'success' : 'error';
  };

  const getStatusIcon = (isAvailable: boolean) => {
    return isAvailable ? <CheckCircleIcon /> : <UnavailableIcon />;
  };

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

  if (error && !room) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Back to Room Management
          </Button>
        </Box>
      </Container>
    );
  }

  const currentRoom = room;
  const currentEditData = editedRoom;

  if (!currentRoom || !currentEditData) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Room not found
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Back to Room Management
          </Button>
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
            <Box>
              <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
                <RoomIcon sx={{ mr: 2 }} />
                Room {currentRoom.roomNumber}
                <Chip
                  icon={getStatusIcon(currentRoom.isAvailable)}
                  label={currentRoom.isAvailable ? 'Available' : 'Unavailable'}
                  color={getStatusColor(currentRoom.isAvailable) as any}
                  sx={{ ml: 2 }}
                />
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {currentRoom.hotelName} • {currentRoom.roomType}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!isEditing ? (
              <>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  disabled={saving}
                >
                  Edit Room
                </Button>
              </>
            ) : (
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
                  disabled={saving || !hasChanges()}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            )}
          </Box>
        </Box>

        {/* Room Information Cards */}
        <Grid container spacing={3}>
          {/* Basic Room Information */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Room Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Room Number"
                    value={isEditing ? currentEditData.roomNumber : currentRoom.roomNumber}
                    onChange={(e) => handleInputChange('roomNumber', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                    helperText={isEditing ? "Room number must be unique" : ""}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  {isEditing ? (
                    <FormControl fullWidth>
                      <InputLabel>Room Type</InputLabel>
                      <Select
                        value={currentEditData.roomType}
                        label="Room Type"
                        onChange={(e) => handleInputChange('roomType', e.target.value)}
                      >
                        {roomTypes.map(type => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <TextField
                      fullWidth
                      label="Room Type"
                      value={currentRoom.roomType}
                      disabled
                      variant="filled"
                    />
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Price per Night"
                    type="number"
                    value={isEditing ? currentEditData.pricePerNight : currentRoom.pricePerNight}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      handleInputChange('pricePerNight', isNaN(value) ? 0 : value);
                    }}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                    inputProps={{ min: 0, step: 0.01 }}
                    InputProps={{
                      startAdornment: <MoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Capacity"
                    type="number"
                    value={isEditing ? currentEditData.capacity : currentRoom.capacity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      handleInputChange('capacity', isNaN(value) ? 1 : value);
                    }}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                    inputProps={{ min: 1, max: 10 }}
                    InputProps={{
                      startAdornment: <PeopleIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={isEditing ? currentEditData.description : (currentRoom.description || '')}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                    placeholder="Enter room description..."
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Hotel Information */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Hotel Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Hotel Name"
                    value={currentRoom.hotelName}
                    disabled
                    variant="filled"
                    InputProps={{
                      startAdornment: <HotelIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Hotel ID"
                    value={currentRoom.hotelId}
                    disabled
                    variant="filled"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Side Panel */}
          <Grid item xs={12} md={4}>
            {/* Room Status */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Room Status
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: currentRoom.isAvailable ? 'success.main' : 'error.main'
                  }}
                >
                  {getStatusIcon(currentRoom.isAvailable)}
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  {currentRoom.isAvailable ? 'Available' : 'Unavailable'}
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentRoom.isAvailable}
                      onChange={handleToggleAvailability}
                      disabled={saving || isEditing}
                    />
                  }
                  label="Room Available"
                />
              </Box>
            </Paper>

            {/* Room Statistics */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Room Details
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {formatCurrency(currentRoom.pricePerNight)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    per night
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {currentRoom.capacity}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    guest capacity
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Room ID: {currentRoom.id}
                  </Typography>
                </Box>

                {currentRoom.createdAt && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Created: {new Date(currentRoom.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>

            {/* Quick Actions */}
            {!isEditing && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Quick Actions
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleToggleAvailability}
                    disabled={saving}
                    startIcon={currentRoom.isAvailable ? <UnavailableIcon /> : <CheckCircleIcon />}
                  >
                    {currentRoom.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                  </Button>
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>

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

        {/* Delete Confirmation Dialog */}
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
      </Box>
    </Container>
  );
};

export default RoomDetails;
