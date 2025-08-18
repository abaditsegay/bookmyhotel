import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
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
  Grid,
  Card,
  CardContent,
  Switch,
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { hotelAdminApi, RoomResponse, RoomCreateRequest, RoomUpdateRequest } from '../../services/hotelAdminApi';
import { useAuth } from '../../contexts/AuthContext';

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
  const [selectedRoom, setSelectedRoom] = useState<RoomResponse | null>(null);

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
  const roomStatuses = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'OUT_OF_ORDER'];

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
        setRooms(response.data.content);
        setTotalElements(response.data.totalElements);
      } else {
        setError(response.message || 'Failed to load rooms');
      }
    } catch (err) {
      console.error('Error loading rooms:', err);
      setError('Failed to load rooms. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, page, rowsPerPage, searchTerm, filters]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleFilterChange = (filterName: keyof RoomFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPage(0);
  };

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

  const handleToggleAvailability = async (roomId: number, currentAvailability: boolean) => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await hotelAdminApi.toggleRoomAvailability(token, roomId, !currentAvailability);
      if (response.success) {
        await loadRooms();
        setError(null);
      } else {
        setError(response.message || 'Failed to update room availability');
      }
    } catch (err) {
      console.error('Error toggling room availability:', err);
      setError('Failed to update room availability.');
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
      <Container maxWidth="xl">
        <Alert severity="error">
          Authentication required. Please log in.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Room Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Add New Room
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Search and Filters */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search rooms..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Room Number"
                value={filters.roomNumber}
                onChange={(e) => handleFilterChange('roomNumber', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Room Type</InputLabel>
                <Select
                  value={filters.roomType}
                  label="Room Type"
                  onChange={(e) => handleFilterChange('roomType', e.target.value)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  {roomTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {roomStatuses.map(status => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={resetFilters}
                  size="small"
                >
                  Clear
                </Button>
                <IconButton
                  onClick={loadRooms}
                  disabled={loading}
                >
                  <RefreshIcon />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Rooms Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Room Number</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Price/Night</TableCell>
                  <TableCell>Capacity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Available</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : rooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No rooms found matching your criteria
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  rooms.map((room) => (
                    <TableRow key={room.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {room.roomNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>{room.roomType}</TableCell>
                      <TableCell>${room.pricePerNight}</TableCell>
                      <TableCell>{room.capacity}</TableCell>
                      <TableCell>
                        <Chip
                          label={room.isAvailable ? 'Available' : 'Unavailable'}
                          color={getStatusColor(room.isAvailable) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={room.isAvailable}
                          onChange={() => handleToggleAvailability(room.id, room.isAvailable)}
                          disabled={loading}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
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
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalElements}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </Paper>

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
                        Price per Night: ${selectedRoom.pricePerNight}
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
    </Container>
  );
};

export default RoomManagement;
