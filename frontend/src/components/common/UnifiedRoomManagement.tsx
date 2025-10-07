import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
  Switch,
  Tooltip,
  FormControlLabel,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/currencyUtils';
import { buildApiUrl } from '../../config/apiConfig';

// Import hotel admin specific components conditionally
let RoomTypePricing: any = null;
let RoomBulkUpload: any = null;

try {
  RoomTypePricing = require('../RoomTypePricing').default;
  RoomBulkUpload = require('../hotel-admin/RoomBulkUpload').default;
} catch (error) {
  // Components not available in this context
}

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
}

interface UnifiedRoomManagementProps {
  mode?: 'hotel-admin' | 'front-desk';
  onNavigateToRoom?: (roomId: number) => void;
  onRoomUpdate?: (room: any) => void;
}

const UnifiedRoomManagement: React.FC<UnifiedRoomManagementProps> = ({ 
  mode = 'hotel-admin',
  onNavigateToRoom, 
  onRoomUpdate 
}) => {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Partial<RoomResponse>>({});
  const [activeTab, setActiveTab] = useState(0);

  // Room status options
  const ROOM_STATUS_OPTIONS = [
    { value: 'AVAILABLE', label: t('dashboard.frontDesk.roomManagement.roomStatuses.available'), color: 'success' as const },
    { value: 'OCCUPIED', label: t('dashboard.frontDesk.roomManagement.roomStatuses.occupied'), color: 'info' as const },
    { value: 'OUT_OF_ORDER', label: t('dashboard.frontDesk.roomManagement.roomStatuses.outOfOrder'), color: 'error' as const },
    { value: 'MAINTENANCE', label: t('dashboard.frontDesk.roomManagement.roomStatuses.maintenance'), color: 'warning' as const },
    { value: 'CLEANING', label: t('dashboard.frontDesk.roomManagement.roomStatuses.cleaning'), color: 'secondary' as const },
    { value: 'DIRTY', label: t('dashboard.frontDesk.roomManagement.roomStatuses.dirty'), color: 'default' as const }
  ];

  // API service based on mode
  const roomApi = {
    getAllRooms: async (token: string, hotelId?: string) => {
      const url = mode === 'front-desk' 
        ? buildApiUrl(`/api/front-desk/hotels/${hotelId || user?.hotelId}/rooms`)
        : buildApiUrl('/api/hotel-admin/rooms');
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch rooms: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    },

    updateRoomStatus: async (token: string, roomId: number, status: string) => {
      const url = mode === 'front-desk'
        ? buildApiUrl(`/api/front-desk/rooms/${roomId}/status`)
        : buildApiUrl(`/api/hotel-admin/rooms/${roomId}`);

      const body = mode === 'front-desk' 
        ? { status }
        : { status };

      const response = await fetch(url, {
        method: mode === 'front-desk' ? 'PATCH' : 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Failed to update room status: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    },

    toggleRoomAvailability: async (token: string, roomId: number, isAvailable: boolean) => {
      const url = mode === 'front-desk'
        ? buildApiUrl(`/api/front-desk/rooms/${roomId}/availability`)
        : buildApiUrl(`/api/hotel-admin/rooms/${roomId}`);

      const body = mode === 'front-desk'
        ? { isAvailable }
        : { isAvailable };

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle room availability: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    }
  };

  const loadRooms = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const url = mode === 'front-desk' 
        ? buildApiUrl(`/api/front-desk/hotels/${user?.hotelId}/rooms`)
        : buildApiUrl('/api/hotel-admin/rooms');
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch rooms: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data) {
        setRooms(Array.isArray(data) ? data : []);
      } else {
        setError('Failed to load rooms');
      }
    } catch (error) {
      console.error('Failed to load rooms:', error);
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, [token, user?.hotelId, mode]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditRoom = (room: RoomResponse) => {
    setEditingRoom(room);
    setEditDialogOpen(true);
  };

  const handleUpdateRoomStatus = async (roomId: number, status: string) => {
    if (!token) return;

    try {
      const result = await roomApi.updateRoomStatus(token, roomId, status);
      
      if (result.success) {
        await loadRooms();
        if (onRoomUpdate) {
          onRoomUpdate(result.data);
        }
      } else {
        setError('Failed to update room status');
      }
    } catch (error) {
      console.error('Failed to update room status:', error);
      setError('Failed to update room status');
    }
  };

  const handleToggleAvailability = async (roomId: number, isAvailable: boolean) => {
    if (!token) return;

    try {
      const result = await roomApi.toggleRoomAvailability(token, roomId, isAvailable);
      
      if (result.success) {
        await loadRooms();
        if (onRoomUpdate) {
          onRoomUpdate(result.data);
        }
      } else {
        setError('Failed to update room availability');
      }
    } catch (error) {
      console.error('Failed to update room availability:', error);
      setError('Failed to update room availability');
    }
  };

  // Filter and paginate rooms
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.roomType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || room.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedRooms = filteredRooms.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Tab content for hotel admin mode
  const renderHotelAdminTabs = () => {
    if (mode !== 'hotel-admin') return null;

    return (
      <>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label={t('dashboard.hotelAdmin.roomManagement.tabs.roomList')} />
          {RoomTypePricing && <Tab label={t('dashboard.hotelAdmin.roomManagement.tabs.pricing')} />}
          {RoomBulkUpload && <Tab label={t('dashboard.hotelAdmin.roomManagement.tabs.bulkUpload')} />}
        </Tabs>

        {activeTab === 1 && RoomTypePricing && (
          <RoomTypePricing />
        )}

        {activeTab === 2 && RoomBulkUpload && (
          <RoomBulkUpload onUploadComplete={loadRooms} />
        )}
      </>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {renderHotelAdminTabs()}

      {(activeTab === 0 || mode === 'front-desk') && (
        <>
          {/* Search and Filter Controls */}
          <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder={t('dashboard.frontDesk.roomManagement.searchRooms')}
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>{t('dashboard.frontDesk.roomManagement.statusFilter')}</InputLabel>
              <Select
                value={statusFilter}
                label={t('dashboard.frontDesk.roomManagement.statusFilter')}
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="ALL">{t('dashboard.frontDesk.roomManagement.allStatuses')}</MenuItem>
                {ROOM_STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              startIcon={<RefreshIcon />}
              onClick={loadRooms}
              variant="outlined"
            >
              {t('dashboard.frontDesk.roomManagement.actions.refresh')}
            </Button>

            {mode === 'hotel-admin' && onNavigateToRoom && (
              <Button
                startIcon={<AddIcon />}
                onClick={() => onNavigateToRoom(0)}
                variant="contained"
              >
                {t('dashboard.frontDesk.roomManagement.actions.addRoom')}
              </Button>
            )}
          </Box>

          {/* Rooms Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('dashboard.frontDesk.roomManagement.tableHeaders.roomNumber')}</TableCell>
                  <TableCell>{t('dashboard.frontDesk.roomManagement.tableHeaders.type')}</TableCell>
                  <TableCell>{t('dashboard.frontDesk.roomManagement.tableHeaders.status')}</TableCell>
                  <TableCell>{t('dashboard.frontDesk.roomManagement.tableHeaders.currentGuest')}</TableCell>
                  <TableCell>{t('dashboard.frontDesk.roomManagement.tableHeaders.capacity')}</TableCell>
                  <TableCell>{t('dashboard.frontDesk.roomManagement.tableHeaders.price')}</TableCell>
                  <TableCell>{t('dashboard.frontDesk.roomManagement.tableHeaders.available')}</TableCell>
                  <TableCell>{t('dashboard.frontDesk.roomManagement.tableHeaders.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {room.roomNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>{room.roomType}</TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={room.status}
                          onChange={(e) => handleUpdateRoomStatus(room.id, e.target.value)}
                          variant="outlined"
                        >
                          {ROOM_STATUS_OPTIONS.map((status) => (
                            <MenuItem key={status.value} value={status.value}>
                              <Chip
                                label={status.label}
                                color={status.color}
                                size="small"
                              />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {room.status === 'OCCUPIED' ? t('dashboard.frontDesk.roomManagement.guestPresent') : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>{room.capacity}</TableCell>
                    <TableCell>{formatCurrency(room.pricePerNight)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={room.isAvailable}
                        onChange={(e) => handleToggleAvailability(room.id, e.target.checked)}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {mode === 'hotel-admin' && onNavigateToRoom && (
                          <Tooltip title={t('dashboard.frontDesk.roomManagement.actions.viewDetails')}>
                            <IconButton
                              size="small"
                              onClick={() => onNavigateToRoom(room.id)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title={t('dashboard.frontDesk.roomManagement.actions.editStatus')}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditRoom(room)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredRooms.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </>
      )}

      {/* Edit Room Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('dashboard.frontDesk.roomManagement.editRoom.title')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {t('dashboard.frontDesk.roomManagement.editRoom.roomNumber')}: {editingRoom.roomNumber}
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>{t('dashboard.frontDesk.roomManagement.editRoom.status')}</InputLabel>
              <Select
                value={editingRoom.status || ''}
                label={t('dashboard.frontDesk.roomManagement.editRoom.status')}
                onChange={(e) => setEditingRoom({ ...editingRoom, status: e.target.value })}
              >
                {ROOM_STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    <Chip
                      label={status.label}
                      color={status.color}
                      size="small"
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={editingRoom.isAvailable || false}
                  onChange={(e) => setEditingRoom({ ...editingRoom, isAvailable: e.target.checked })}
                />
              }
              label={t('dashboard.frontDesk.roomManagement.editRoom.available')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            {t('dashboard.frontDesk.roomManagement.editRoom.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (editingRoom.id && editingRoom.status) {
                await handleUpdateRoomStatus(editingRoom.id, editingRoom.status);
                if (editingRoom.isAvailable !== undefined) {
                  await handleToggleAvailability(editingRoom.id, editingRoom.isAvailable);
                }
                setEditDialogOpen(false);
              }
            }}
          >
            {t('dashboard.frontDesk.roomManagement.editRoom.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UnifiedRoomManagement;