import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
        });
    } catch (error) {
      console.error('Failed to update room status:', error);
      console.error('Error details:', {
        roomId: room.id,
        newStatus,
        notes,
        token: token ? 'present' : 'missing',
        tenantId
      });
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to update room status',
        severity: 'error'
      });
    }
  };
  TableRow,
  TablePagination,
  IconButton,
  Button,
  TextField,
  InputAdornment,
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
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Build as MaintenanceIcon,
  CleaningServices as CleaningIcon,
  CheckCircle as AvailableIcon,
  Error as OutOfOrderIcon,
  Person as OccupiedIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { frontDeskApiService, FrontDeskRoom } from '../../services/frontDeskApi';

interface RoomFilters {
  roomType: string;
  status: string;
}

interface FrontDeskRoomManagementProps {
  currentTab?: number;
}

const FrontDeskRoomManagement: React.FC<FrontDeskRoomManagementProps> = ({ currentTab }) => {
  const { token } = useAuth();
  const { tenantId } = useTenant();
  const [rooms, setRooms] = useState<FrontDeskRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<RoomFilters>({
    roomType: '',
    status: '',
  });

  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<FrontDeskRoom | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusNotes, setStatusNotes] = useState<string>('');

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const roomTypes = ['STANDARD', 'DELUXE', 'SUITE', 'EXECUTIVE', 'PRESIDENTIAL'];
  const roomStatuses = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'OUT_OF_ORDER'];

  const loadRooms = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await frontDeskApiService.getRooms(
        token,
        page,
        rowsPerPage,
        searchTerm || undefined,
        filters.roomType || undefined,
        filters.status || undefined,
        tenantId
      );
      
      if (response.success && response.data) {
        setRooms(response.data.content);
        setTotalElements(response.data.page?.totalElements || 0);
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
  }, [token, tenantId, page, rowsPerPage, searchTerm, filters]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms, currentTab]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleFilterChange = (filterName: keyof RoomFilters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewRoom = (room: FrontDeskRoom) => {
    setSelectedRoom(room);
    setViewDialogOpen(true);
  };

  const handleStatusChange = (room: FrontDeskRoom) => {
    setSelectedRoom(room);
    setNewStatus(room.status);
    setStatusNotes('');
    setStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedRoom || !token) return;

    try {
      const response = await frontDeskApiService.updateRoomStatus(
        token,
        selectedRoom.id,
        newStatus,
        statusNotes || undefined,
        tenantId
      );

      if (response.success) {
        setSnackbar({
          open: true,
          message: `Room ${selectedRoom.roomNumber} status updated successfully`,
          severity: 'success'
        });
        setStatusDialogOpen(false);
        loadRooms(); // Refresh the list
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Failed to update room status',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Failed to update room status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update room status',
        severity: 'error'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <AvailableIcon sx={{ color: 'success.main' }} />;
      case 'OCCUPIED':
        return <OccupiedIcon sx={{ color: 'info.main' }} />;
      case 'MAINTENANCE':
        return <MaintenanceIcon sx={{ color: 'warning.main' }} />;
      case 'OUT_OF_ORDER':
        return <OutOfOrderIcon sx={{ color: 'error.main' }} />;
      default:
        return <AvailableIcon sx={{ color: 'grey.main' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'success';
      case 'OCCUPIED':
        return 'info';
      case 'MAINTENANCE':
        return 'warning';
      case 'OUT_OF_ORDER':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleQuickAction = async (room: FrontDeskRoom, newStatus: string, notes: string) => {
    if (!token) return;

    try {
      const response = await frontDeskApiService.updateRoomStatus(
        token,
        room.id,
        newStatus,
        notes || undefined,
        tenantId
      );

      if (response.success) {
        setSnackbar({
          open: true,
          message: `Room ${room.roomNumber} status updated successfully`,
          severity: 'success'
        });
        loadRooms(); // Refresh the list
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Failed to update room status',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Failed to update room status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update room status',
        severity: 'error'
      });
    }
  };

  const getQuickActionButton = (room: FrontDeskRoom) => {
    switch (room.status) {
      case 'MAINTENANCE':
        return (
          <Tooltip title="Mark as cleaned">
            <IconButton
              size="small"
              onClick={() => handleQuickAction(room, 'AVAILABLE', 'Cleaned and ready for guests')}
            >
              <CleaningIcon />
            </IconButton>
          </Tooltip>
        );
      case 'AVAILABLE':
        return (
          <Tooltip title="Mark for maintenance">
            <IconButton
              size="small"
              onClick={() => handleQuickAction(room, 'MAINTENANCE', 'Requires housekeeping')}
            >
              <MaintenanceIcon />
            </IconButton>
          </Tooltip>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Room Management
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={loadRooms}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Room Status Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { status: 'AVAILABLE', label: 'Available', icon: <AvailableIcon />, color: 'success.main' },
          { status: 'OCCUPIED', label: 'Occupied', icon: <OccupiedIcon />, color: 'info.main' },
          { status: 'MAINTENANCE', label: 'Maintenance', icon: <MaintenanceIcon />, color: 'warning.main' },
          { status: 'OUT_OF_ORDER', label: 'Out of Order', icon: <OutOfOrderIcon />, color: 'error.main' },
        ].map(({ status, label, icon, color }) => {
          const count = rooms.filter(room => room.status === status).length;
          return (
            <Grid item xs={6} sm={3} key={status}>
              <Card sx={{ cursor: 'pointer' }} onClick={() => handleFilterChange('status', status)}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    {React.cloneElement(icon, { sx: { color, mr: 1 } })}
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color }}>
                      {count}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Search and Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by room number..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Room Type</InputLabel>
          <Select
            value={filters.roomType}
            label="Room Type"
            onChange={(e) => handleFilterChange('roomType', e.target.value)}
          >
            <MenuItem value="">All Types</MenuItem>
            {roomTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <MenuItem value="">All Statuses</MenuItem>
            {roomStatuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status.replace('_', ' ')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Rooms Table */}
      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Room Number</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Current Guest</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell>Price/Night</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : rooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    No rooms found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rooms.map((room) => (
                <TableRow key={room.id} hover>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    {room.roomNumber}
                  </TableCell>
                  <TableCell>{room.roomType}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getStatusIcon(room.status)}
                      <Chip
                        label={room.status.replace('_', ' ')}
                        color={getStatusColor(room.status) as any}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    {room.currentGuest || '-'}
                  </TableCell>
                  <TableCell>{room.capacity}</TableCell>
                  <TableCell>${room.pricePerNight}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewRoom(room)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Change status">
                        <IconButton
                          size="small"
                          onClick={() => handleStatusChange(room)}
                        >
                          <MaintenanceIcon />
                        </IconButton>
                      </Tooltip>
                      {getQuickActionButton(room)}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* View Room Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Room {selectedRoom?.roomNumber} Details
        </DialogTitle>
        <DialogContent>
          {selectedRoom && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                <Typography variant="body1">{selectedRoom.roomType}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {getStatusIcon(selectedRoom.status)}
                  <Typography variant="body1" sx={{ ml: 1 }}>
                    {selectedRoom.status.replace('_', ' ')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Capacity</Typography>
                <Typography variant="body1">{selectedRoom.capacity} guests</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Price per Night</Typography>
                <Typography variant="body1">${selectedRoom.pricePerNight}</Typography>
              </Grid>
              {selectedRoom.currentGuest && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Current Guest</Typography>
                  <Typography variant="body1">{selectedRoom.currentGuest}</Typography>
                </Grid>
              )}
              {selectedRoom.description && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body1">{selectedRoom.description}</Typography>
                </Grid>
              )}
              {selectedRoom.notes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                  <Typography variant="body1">{selectedRoom.notes}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Update Room {selectedRoom?.roomNumber} Status
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>New Status</InputLabel>
              <Select
                value={newStatus}
                label="New Status"
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {roomStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.replace('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Notes (Optional)"
              multiline
              rows={3}
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Add any notes about the status change..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleUpdateStatus}
            disabled={!newStatus}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FrontDeskRoomManagement;
