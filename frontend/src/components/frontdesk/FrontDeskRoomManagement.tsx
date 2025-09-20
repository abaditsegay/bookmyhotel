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
  FormControlLabel,
  TextField
} from '@mui/material';
import {
  Edit as EditIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../config/apiConfig';
import { roomCacheService } from '../../services/RoomCacheService';
import { CachedRoom } from '../../services/OfflineStorageService';

interface RoomResponse {
  id: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  capacity: number;
  description?: string;
  isAvailable: boolean;
  status: string;
  hotelId: number;
  hotelName: string;
  createdAt: string;
  updatedAt: string;
  currentGuest?: string;
}

interface RoomPage {
  content: RoomResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

const getAuthHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

const frontDeskRoomApi = {
  getAllRooms: async (
    token: string,
    page: number = 0,
    size: number = 10,
    search?: string,
    roomType?: string,
    status?: string
  ): Promise<{ success: boolean; data?: RoomPage; message?: string }> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });
      
      if (search && search.trim()) {
        params.append('search', search.trim());
      }
      
      if (roomType && roomType.trim()) {
        params.append('roomType', roomType.trim());
      }
      
      if (status && status.trim() && status !== 'ALL') {
        params.append('status', status);
      }

      const response = await fetch(buildApiUrl(`/front-desk/rooms?${params.toString()}`), {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch rooms');
      }

      const backendData = await response.json();
      
      // Transform backend response to match expected structure
      const transformedData: RoomPage = {
        content: backendData.content || [],
        totalElements: backendData.totalElements || 0,
        totalPages: backendData.totalPages || 0,
        size: backendData.size || size,
        number: backendData.number || page,
      };
      
      return { success: true, data: transformedData };
    } catch (error) {
      console.error('Rooms fetch error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch rooms' 
      };
    }
  },

  updateRoomStatus: async (
    token: string,
    roomId: number,
    status: string,
    notes?: string
  ): Promise<{ success: boolean; data?: RoomResponse; message?: string }> => {
    try {
      const params = new URLSearchParams({ status });
      if (notes) {
        params.append('notes', notes);
      }

      const response = await fetch(
        buildApiUrl(`/front-desk/rooms/${roomId}/status?${params.toString()}`),
        {
          method: 'PUT',
          headers: getAuthHeaders(token),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update room status');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Room status update error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to update room status' 
      };
    }
  },

  toggleRoomAvailability: async (
    token: string,
    roomId: number,
    available: boolean,
    reason?: string
  ): Promise<{ success: boolean; data?: RoomResponse; message?: string }> => {
    try {
      const params = new URLSearchParams({ available: available.toString() });
      if (reason) {
        params.append('reason', reason);
      }

      const response = await fetch(
        buildApiUrl(`/front-desk/rooms/${roomId}/availability?${params.toString()}`),
        {
          method: 'PUT',
          headers: getAuthHeaders(token),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update room availability');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Room availability update error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to update room availability' 
      };
    }
  },
};

interface FrontDeskRoomManagementProps {
  onRoomUpdate?: (room: RoomResponse) => void;
}

const ROOM_STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available', color: 'success' as const },
  { value: 'OCCUPIED', label: 'Occupied', color: 'info' as const },
  { value: 'OUT_OF_ORDER', label: 'Out of Order', color: 'error' as const },
  { value: 'MAINTENANCE', label: 'Maintenance', color: 'warning' as const },
  { value: 'CLEANING', label: 'Cleaning', color: 'secondary' as const },
  { value: 'DIRTY', label: 'Dirty', color: 'default' as const }
];

const FrontDeskRoomManagement: React.FC<FrontDeskRoomManagementProps> = ({ onRoomUpdate }) => {
  const { token } = useAuth();
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Status update dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomResponse | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  
  // Availability toggle
  const [availabilityUpdating, setAvailabilityUpdating] = useState<Record<number, boolean>>({});

  const loadRooms = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // First try to load from API
      const result = await frontDeskRoomApi.getAllRooms(
        token,
        page,
        rowsPerPage,
        searchQuery,
        undefined, // room type
        statusFilter === 'ALL' ? undefined : statusFilter
      );
      
      if (result.success && result.data) {
        setRooms(result.data.content);
        setTotalElements(result.data.totalElements);
      } else {
        throw new Error(result.message || 'Failed to load rooms from API');
      }
    } catch (error) {
      console.error('API call failed, trying IndexedDB fallback:', error);
      
      // Fallback to cached rooms from IndexedDB
      try {
        console.log('📦 Loading rooms from IndexedDB cache...');
        const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
        const hotelId = user.hotelId ? parseInt(user.hotelId) : null;
        
        if (hotelId) {
          const cachedRooms = await roomCacheService.getRooms(hotelId);
          console.log(`✅ Loaded ${cachedRooms.length} rooms from IndexedDB cache`);
          
          // Convert CachedRoom to RoomResponse format
          const convertedRooms: RoomResponse[] = cachedRooms.map((room: CachedRoom) => ({
            id: room.id,
            roomNumber: room.roomNumber,
            roomType: room.roomType,
            pricePerNight: room.pricePerNight,
            capacity: room.capacity,
            description: room.description || '',
            isAvailable: room.isAvailable,
            status: room.offlineStatus === 'occupied' ? 'OCCUPIED' : 
                   room.offlineStatus === 'reserved' ? 'RESERVED' : 'AVAILABLE',
            hotelId: room.hotelId,
            hotelName: 'Cached Hotel',
            createdAt: room.lastUpdated,
            updatedAt: room.lastUpdated,
            currentGuest: room.occupiedBy || undefined
          }));
          
          // Apply filters
          let filteredRooms = convertedRooms;
          
          if (searchQuery && searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filteredRooms = filteredRooms.filter(room => 
              room.roomNumber.toLowerCase().includes(query) ||
              room.roomType.toLowerCase().includes(query)
            );
          }
          
          if (statusFilter !== 'ALL') {
            filteredRooms = filteredRooms.filter(room => room.status === statusFilter);
          }
          
          // Apply pagination
          const startIndex = page * rowsPerPage;
          const paginatedRooms = filteredRooms.slice(startIndex, startIndex + rowsPerPage);
          
          setRooms(paginatedRooms);
          setTotalElements(filteredRooms.length);
          
          if (cachedRooms.length > 0) {
            setError('Using cached room data (offline mode)');
          } else {
            setError('No cached room data available');
          }
        } else {
          setError('No hotel ID found in user data');
        }
      } catch (cacheError) {
        console.error('Failed to load rooms from cache:', cacheError);
        setError('Failed to load rooms from both API and cache');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, [token, page, rowsPerPage, statusFilter, searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleSearchChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  }, []);

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
      const result = await frontDeskRoomApi.updateRoomStatus(
        token,
        selectedRoom.id,
        newStatus
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

  const handleAvailabilityToggle = async (room: RoomResponse) => {
    if (!token) return;
    
    setAvailabilityUpdating(prev => ({ ...prev, [room.id]: true }));
    
    try {
      const result = await frontDeskRoomApi.toggleRoomAvailability(
        token,
        room.id,
        !room.isAvailable
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

  if (loading && rooms.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
        <Box sx={{ flex: '1 1 100%' }} />
      </Toolbar>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          label="Search rooms"
          value={searchQuery}
          onChange={handleSearchChange}
          size="small"
          sx={{ minWidth: 200 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={statusFilter}
            label="Status Filter"
            onChange={handleStatusFilterChange}
          >
            <MenuItem value="ALL">All Statuses</MenuItem>
            {ROOM_STATUS_OPTIONS.map((status) => (
              <MenuItem key={status.value} value={status.value}>
                {status.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

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
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms.map((room) => {
              const statusConfig = getStatusConfig(room.status);
              return (
                <TableRow key={room.id}>
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
                  <TableCell>ETB {room.pricePerNight?.toFixed(0)}</TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={room.isAvailable}
                          onChange={() => handleAvailabilityToggle(room)}
                          disabled={availabilityUpdating[room.id]}
                        />
                      }
                      label={room.isAvailable ? 'Available' : 'Unavailable'}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Update Status">
                      <IconButton
                        size="small"
                        onClick={() => handleStatusUpdate(room)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
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

      {/* Status Update Dialog */}
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
    </Box>
  );
};

export default FrontDeskRoomManagement;
