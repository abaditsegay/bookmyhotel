import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Box,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Grid,
  Card,
  CardContent,
  Switch,
  Tooltip,
  FormControlLabel,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { hotelAdminApi, RoomResponse, RoomCreateRequest, RoomUpdateRequest } from '../../services/hotelAdminApi';
import { useAuth } from '../../contexts/AuthContext';
import RoomTypePricing from '../../components/RoomTypePricing';

interface RoomFilters {
  roomNumber: string;
  roomType: string;
  status: string;
}

interface RoomManagementProps {
  onNavigateToRoom?: (roomId: number) => void;
}

const RoomManagement: React.FC<RoomManagementProps> = ({ onNavigateToRoom }) => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState<RoomFilters>({
    roomNumber: '',
    roomType: '',
    status: '',
  });

  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomResponse | null>(null);

  // Status update states
  const [newStatus, setNewStatus] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [availabilityUpdating, setAvailabilityUpdating] = useState<Record<number, boolean>>({});

  // Form states
  const [roomForm, setRoomForm] = useState<RoomCreateRequest>({
    roomNumber: '',
    roomType: 'STANDARD',
    pricePerNight: 0,
    capacity: 1,
    description: '',
  });

  const [editForm, setEditForm] = useState<RoomUpdateRequest>({
    roomNumber: '',
    roomType: 'STANDARD',
    pricePerNight: 0,
    capacity: 1,
    description: '',
  });

  const roomTypes = ['STANDARD', 'DELUXE', 'SUITE', 'EXECUTIVE', 'PRESIDENTIAL'];

  // Room status options with colors (matching front desk)
  const ROOM_STATUS_OPTIONS = [
    { value: 'AVAILABLE', label: 'Available', color: 'success' as const },
    { value: 'OCCUPIED', label: 'Occupied', color: 'info' as const },
    { value: 'OUT_OF_ORDER', label: 'Out of Order', color: 'error' as const },
    { value: 'MAINTENANCE', label: 'Maintenance', color: 'warning' as const },
    { value: 'CLEANING', label: 'Cleaning', color: 'secondary' as const },
    { value: 'DIRTY', label: 'Dirty', color: 'default' as const }
  ];

  const loadRooms = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await hotelAdminApi.getHotelRooms(
        token,
        page,
        rowsPerPage,
        searchTerm || undefined,
        filters.roomNumber || undefined,
        filters.roomType || undefined,
        filters.status || undefined
      );
      
      if (response.success && response.data) {
        console.log('Room API Response:', response.data);
        console.log('Total Elements:', response.data.totalElements);
        
        setRooms(response.data.content);
        
        // Extract pagination info directly from response data
        const totalElements = response.data.totalElements || 0;
        
        console.log('Total Elements from response:', totalElements);
        setTotalElements(totalElements);
      } else {
        setError(response.message || 'Failed to load rooms');
        setTotalElements(0);
      }
    } catch (err) {
      console.error('Error loading rooms:', err);
      setError('Failed to load rooms. Please try again.');
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [token, page, rowsPerPage, searchTerm, filters]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // Memoized search handler to prevent input focus loss
  const handleSearchChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  }, []);

  // Memoized filter handler to prevent input focus loss
  const handleFilterChange = React.useCallback((filterName: keyof RoomFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPage(0);
  }, []);

  // Memoized handlers for specific filter changes
  const handleStatusFilterChange = React.useCallback((e: SelectChangeEvent) => {
    handleFilterChange('status', e.target.value);
  }, [handleFilterChange]);

  const handleRoomTypeFilterChange = React.useCallback((e: SelectChangeEvent) => {
    handleFilterChange('roomType', e.target.value);
  }, [handleFilterChange]);

  // Memoized InputProps to prevent re-creation on every render
  const searchInputProps = React.useMemo(() => ({
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon />
      </InputAdornment>
    ),
  }), []);

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewRoom = async (roomId: number) => {
    if (onNavigateToRoom) {
      onNavigateToRoom(roomId);
    } else {
      navigate(`/hotel-admin/rooms/${roomId}`);
    }
  };

  // Get status configuration with colors
  const getStatusConfig = (status: string) => {
    return ROOM_STATUS_OPTIONS.find(option => option.value === status) || 
           { value: status, label: status, color: 'default' as const };
  };

  // Handle status update dialog
  const handleStatusUpdate = (room: RoomResponse) => {
    setSelectedRoom(room);
    setNewStatus(room.status);
    setStatusDialogOpen(true);
  };

  const handleStatusDialogClose = () => {
    setStatusDialogOpen(false);
    setSelectedRoom(null);
    setNewStatus('');
  };

  const handleStatusConfirm = async () => {
    if (!selectedRoom || !token) return;
    
    setStatusUpdating(true);
    
    try {
      const response = await hotelAdminApi.updateRoomStatus(token, selectedRoom.id, newStatus);
      if (response.success && response.data) {
        // Update the room in the list
        setRooms(prevRooms => 
          prevRooms.map(room => 
            room.id === selectedRoom.id ? response.data! : room
          )
        );
        
        handleStatusDialogClose();
        setError(null);
      } else {
        setError(response.message || 'Failed to update room status');
      }
    } catch (err) {
      console.error('Error updating room status:', err);
      setError('Failed to update room status. Please try again.');
    } finally {
      setStatusUpdating(false);
    }
  };

  // Handle availability toggle like front desk
  const handleAvailabilityToggle = async (room: RoomResponse) => {
    if (!token) return;
    
    setAvailabilityUpdating(prev => ({ ...prev, [room.id]: true }));
    
    try {
      const response = await hotelAdminApi.toggleRoomAvailability(token, room.id, !room.isAvailable);
      if (response.success && response.data) {
        // Update the room in the list
        setRooms(prevRooms => 
          prevRooms.map(r => 
            r.id === room.id ? response.data! : r
          )
        );
        
        setError(null);
      } else {
        setError(response.message || 'Failed to update room availability');
      }
    } catch (err) {
      console.error('Error toggling room availability:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update room availability';
      setError(errorMessage);
    } finally {
      setAvailabilityUpdating(prev => ({ ...prev, [room.id]: false }));
    }
  };

  const handleDeleteRoom = async () => {
    if (!selectedRoom || !token) return;
    
    try {
      setLoading(true);
      const response = await hotelAdminApi.deleteRoom(token, selectedRoom.id);
      if (response.success) {
        setDeleteDialogOpen(false);
        setSelectedRoom(null);
        await loadRooms();
        setError(null);
      } else {
        setError(response.message || 'Failed to delete room. Room may have active bookings.');
      }
    } catch (err) {
      console.error('Error deleting room:', err);
      setError('Failed to delete room. Room may have active bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await hotelAdminApi.createRoom(token, roomForm);
      if (response.success) {
        setCreateDialogOpen(false);
        setRoomForm({
          roomNumber: '',
          roomType: 'STANDARD',
          pricePerNight: 0,
          capacity: 1,
          description: '',
        });
        await loadRooms();
        setError(null);
      } else {
        setError(response.message || 'Failed to create room. Please check the room number is unique.');
      }
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room. Please check the room number is unique.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRoom = async () => {
    if (!selectedRoom || !token) return;
    
    try {
      setLoading(true);
      const response = await hotelAdminApi.updateRoom(token, selectedRoom.id, editForm);
      if (response.success) {
        setEditDialogOpen(false);
        setSelectedRoom(null);
        await loadRooms();
        setError(null);
      } else {
        setError(response.message || 'Failed to update room');
      }
    } catch (err) {
      console.error('Error updating room:', err);
      setError('Failed to update room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (isAvailable: boolean) => {
    return isAvailable ? 'success' : 'error';
  };

  const resetFilters = () => {
    setFilters({
      roomNumber: '',
      roomType: '',
      status: '',
    });
    setSearchTerm('');
    setPage(0);
  };

  if (!token) {
    return (
      <Box>
        <Alert severity="error">
          Authentication required. Please log in.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
          {tabValue === 0 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Add New Room
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Rooms" />
            <Tab label="Pricing" />
          </Tabs>
        </Box>

        {/* Tab Panel 0 - Rooms */}
        {tabValue === 0 && (
          <Box>

        {/* Search and Filters - Front Desk Style */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Search rooms"
            value={searchTerm}
            onChange={handleSearchChange}
            size="small"
            sx={{ minWidth: 200 }}
            InputProps={searchInputProps}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={filters.status}
              label="Status Filter"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {ROOM_STATUS_OPTIONS.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Room Type</InputLabel>
            <Select
              value={filters.roomType}
              label="Room Type"
              onChange={handleRoomTypeFilterChange}
            >
              <MenuItem value="">All Types</MenuItem>
              {roomTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={resetFilters}
            size="small"
          >
            Clear
          </Button>
          
          <Tooltip title="Refresh">
            <span>
              <IconButton
                onClick={loadRooms}
                disabled={loading}
              >
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {/* Rooms Table - Front Desk Style */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Room Number</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Current Guest</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Price/Night</TableCell>
                <TableCell>Available</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : rooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No rooms found matching your criteria
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rooms.map((room) => {
                  const statusConfig = getStatusConfig(room.status);
                  return (
                    <TableRow key={room.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {room.roomNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>{room.roomType}</TableCell>
                      <TableCell>
                        <Chip 
                          label={statusConfig.label}
                          color={statusConfig.color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {/* For now, show placeholder until currentGuest field is added to backend */}
                        <Typography variant="body2" color="text.secondary">
                          No guest
                        </Typography>
                      </TableCell>
                      <TableCell>{room.capacity} guests</TableCell>
                      <TableCell>ETB {room.pricePerNight?.toFixed(0)}</TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={room.isAvailable}
                              onChange={() => handleAvailabilityToggle(room)}
                              disabled={availabilityUpdating[room.id]}
                              size="small"
                            />
                          }
                          label={room.isAvailable ? 'Available' : 'Unavailable'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Update Status">
                            <IconButton
                              size="small"
                              onClick={() => handleStatusUpdate(room)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <IconButton
                            size="small"
                            onClick={() => handleViewRoom(room.id)}
                            title="View Details"
                          >
                            <ViewIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedRoom(room);
                              setDeleteDialogOpen(true);
                            }}
                            title="Delete Room"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalElements || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
          </Box>
        )}

        {/* Tab Panel 1 - Pricing */}
        {tabValue === 1 && (
          <Box>
            <RoomTypePricing onPricingUpdate={loadRooms} />
          </Box>
        )}

        {/* Status Update Dialog - Front Desk Style */}
        <Dialog open={statusDialogOpen} onClose={handleStatusDialogClose}>
          <DialogTitle>Update Room Status</DialogTitle>
          <DialogContent>
            {selectedRoom && (
              <Box sx={{ pt: 1 }}>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Room: {selectedRoom.roomNumber} ({selectedRoom.roomType})
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={newStatus}
                    label="Status"
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    {ROOM_STATUS_OPTIONS.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleStatusDialogClose}>Cancel</Button>
            <Button
              onClick={handleStatusConfirm}
              variant="contained"
              disabled={statusUpdating || !newStatus}
            >
              {statusUpdating ? <CircularProgress size={20} /> : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Room Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Room Details</DialogTitle>
          <DialogContent>
            {selectedRoom && (
              <Card>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        Room {selectedRoom.roomNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Type: {selectedRoom.roomType}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Price per Night: ETB {selectedRoom.pricePerNight?.toFixed(0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Capacity: {selectedRoom.capacity} guests
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Status: <Chip 
                          label={selectedRoom.isAvailable ? 'Available' : 'Unavailable'} 
                          color={getStatusColor(selectedRoom.isAvailable) as any} 
                          size="small" 
                        />
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Available: {selectedRoom.isAvailable ? 'Yes' : 'No'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Description:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedRoom.description || 'No description available'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Create Room Dialog */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Add New Room</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Room Number"
                  value={roomForm.roomNumber}
                  onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Room Type</InputLabel>
                  <Select
                    value={roomForm.roomType}
                    label="Room Type"
                    onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value as any })}
                  >
                    {roomTypes.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Price per Night"
                  type="number"
                  value={roomForm.pricePerNight}
                  onChange={(e) => setRoomForm({ ...roomForm, pricePerNight: parseFloat(e.target.value) })}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Capacity"
                  type="number"
                  value={roomForm.capacity}
                  onChange={(e) => setRoomForm({ ...roomForm, capacity: parseInt(e.target.value) })}
                  required
                  inputProps={{ min: 1, max: 10 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={roomForm.description}
                  onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateRoom}
              variant="contained"
              disabled={loading || !roomForm.roomNumber || !roomForm.pricePerNight}
            >
              Create Room
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Room Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Edit Room</DialogTitle>
          <DialogContent>
            {selectedRoom && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Room Number"
                    value={selectedRoom.roomNumber}
                    disabled
                    helperText="Room number cannot be changed"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Room Type</InputLabel>
                    <Select
                      value={editForm.roomType}
                      label="Room Type"
                      onChange={(e) => setEditForm({ ...editForm, roomType: e.target.value as any })}
                    >
                      {roomTypes.map(type => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Price per Night"
                    type="number"
                    value={editForm.pricePerNight}
                    onChange={(e) => setEditForm({ ...editForm, pricePerNight: parseFloat(e.target.value) })}
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Capacity"
                    type="number"
                    value={editForm.capacity}
                    onChange={(e) => setEditForm({ ...editForm, capacity: parseInt(e.target.value) })}
                    required
                    inputProps={{ min: 1, max: 10 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleUpdateRoom}
              variant="contained"
              disabled={loading || !editForm.pricePerNight}
            >
              Update Room
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete room {selectedRoom?.roomNumber}? 
              This action cannot be undone and will fail if the room has active bookings.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleDeleteRoom}
              variant="contained"
              color="error"
              disabled={loading}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
    </Box>
  );
};

export default RoomManagement;
