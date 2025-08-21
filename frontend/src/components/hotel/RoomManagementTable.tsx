import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  Toolbar,
  Tooltip,
  IconButton,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { frontDeskApiService, Room } from '../../services/frontDeskApi';

interface RoomManagementTableProps {
  onRoomUpdate?: (room: Room) => void;
}

const ROOM_STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available', color: 'success' as const },
  { value: 'OCCUPIED', label: 'Occupied', color: 'info' as const },
  { value: 'OUT_OF_ORDER', label: 'Out of Order', color: 'error' as const },
  { value: 'MAINTENANCE', label: 'Maintenance', color: 'warning' as const },
  { value: 'CLEANING', label: 'Cleaning', color: 'secondary' as const },
  { value: 'DIRTY', label: 'Dirty', color: 'default' as const }
];

const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Rooms' },
  ...ROOM_STATUS_OPTIONS
];

const RoomManagementTable: React.FC<RoomManagementTableProps> = ({ onRoomUpdate }) => {
  const { token } = useAuth();
  const { tenantId } = useTenant();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Status update dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  
  // Availability toggle
  const [availabilityUpdating, setAvailabilityUpdating] = useState<Record<number, boolean>>({});

  const loadRooms = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await frontDeskApiService.getAllRooms(
        token,
        page,
        rowsPerPage,
        statusFilter,
        tenantId
      );
      
      if (result.success && result.data) {
        setRooms(result.data.content);
        setTotalElements(result.data.page.totalElements);
      } else {
        setError(result.message || 'Failed to load rooms');
      }
    } catch (error) {
      console.error('Failed to load rooms:', error);
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, [token, page, rowsPerPage, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleStatusUpdate = (room: Room) => {
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
      const result = await frontDeskApiService.updateRoomStatus(
        token,
        selectedRoom.id,
        newStatus,
        tenantId
      );
      
      if (result.success && result.data) {
        // Update the room in the list
        setRooms(prevRooms => 
          prevRooms.map(room => 
            room.id === selectedRoom.id ? result.data! : room
          )
        );
        
        handleStatusDialogClose();
        onRoomUpdate?.(result.data);
      } else {
        setError(result.message || 'Failed to update room status');
      }
    } catch (error) {
      console.error('Failed to update room status:', error);
      setError('Failed to update room status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAvailabilityToggle = async (room: Room) => {
    if (!token) return;
    
    setAvailabilityUpdating(prev => ({ ...prev, [room.id]: true }));
    
    try {
      const result = await frontDeskApiService.toggleRoomAvailability(
        token,
        room.id,
        tenantId
      );
      
      if (result.success && result.data) {
        // Update the room in the list
        setRooms(prevRooms => 
          prevRooms.map(r => 
            r.id === room.id ? result.data! : r
          )
        );
        
        onRoomUpdate?.(result.data);
      } else {
        setError(result.message || 'Failed to toggle room availability');
      }
    } catch (error) {
      console.error('Failed to toggle room availability:', error);
      setError('Failed to toggle room availability');
    } finally {
      setAvailabilityUpdating(prev => ({ ...prev, [room.id]: false }));
    }
  };

  const getStatusConfig = (status: string) => {
    return ROOM_STATUS_OPTIONS.find(option => option.value === status) || 
           { value: status, label: status, color: 'default' as const };
  };

  const handleRefresh = () => {
    loadRooms();
  };

  return (
    <Box>
      {/* Toolbar */}
      <Toolbar sx={{ pl: 0, pr: 1 }}>
        <Typography variant="h6" component="div" sx={{ flex: '1 1 100%' }}>
          Room Management ({totalElements} rooms)
        </Typography>
        
        <FormControl sx={{ minWidth: 150, mr: 2 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            label="Filter by Status"
            onChange={handleStatusFilterChange}
            size="small"
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Tooltip title="Refresh">
          <IconButton onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Table */}
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
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : rooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No rooms found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rooms.map((room) => {
                const statusConfig = getStatusConfig(room.status);
                const isAvailabilityUpdating = availabilityUpdating[room.id];
                
                return (
                  <TableRow key={room.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
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
                      {room.currentGuest ? (
                        <Typography variant="body2">
                          {room.currentGuest}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No guest
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{room.capacity} guests</TableCell>
                    <TableCell>${room.pricePerNight}</TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={room.isAvailable}
                            onChange={() => handleAvailabilityToggle(room)}
                            disabled={isAvailabilityUpdating}
                            color="primary"
                          />
                        }
                        label={room.isAvailable ? 'Yes' : 'No'}
                        disabled={isAvailabilityUpdating}
                      />
                      {isAvailabilityUpdating && (
                        <CircularProgress size={16} sx={{ ml: 1 }} />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Update Status">
                        <IconButton
                          onClick={() => handleStatusUpdate(room)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={totalElements}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={handleStatusDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Update Room Status - {selectedRoom?.roomNumber}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Room Status</InputLabel>
            <Select
              value={newStatus}
              label="Room Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {ROOM_STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label={option.label}
                      color={option.color}
                      size="small"
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStatusDialogClose}>Cancel</Button>
          <Button 
            onClick={handleStatusConfirm}
            variant="contained"
            disabled={statusUpdating || newStatus === selectedRoom?.status}
          >
            {statusUpdating ? <CircularProgress size={20} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoomManagementTable;
