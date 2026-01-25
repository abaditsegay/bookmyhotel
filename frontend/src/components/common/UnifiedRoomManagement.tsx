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
import { hotelAdminApi, RoomCreateRequest } from '../../services/hotelAdminApi';
import * as frontDeskApi from '../../services/frontDeskApi';
import { ROOM_TYPES, getRoomTypeLabel } from '../../constants/roomTypes';

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
  currentGuest?: string;
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
  const { token } = useAuth();
  
  // Determine translation key prefix based on mode
  const translationPrefix = mode === 'hotel-admin' 
    ? 'dashboard.hotelAdmin.roomManagement' 
    : 'dashboard.frontDesk.roomManagement';
  
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalElements, setTotalElements] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Partial<RoomResponse>>({});
  const [activeTab, setActiveTab] = useState(0);
  
  // Create room dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [roomForm, setRoomForm] = useState<RoomCreateRequest>({
    roomNumber: '',
    roomType: 'STANDARD',
    pricePerNight: 0,
    capacity: 1,
    description: '',
  });

  // Room status options
  const ROOM_STATUS_OPTIONS = [
    { value: 'AVAILABLE', label: t(`${translationPrefix}.roomStatuses.available`), color: 'success' as const },
    { value: 'OCCUPIED', label: t(`${translationPrefix}.roomStatuses.occupied`), color: 'info' as const },
    { value: 'OUT_OF_ORDER', label: t(`${translationPrefix}.roomStatuses.outOfOrder`), color: 'error' as const },
    { value: 'MAINTENANCE', label: t(`${translationPrefix}.roomStatuses.maintenance`), color: 'warning' as const },
    { value: 'CLEANING', label: t(`${translationPrefix}.roomStatuses.cleaning`), color: 'secondary' as const },
    { value: 'DIRTY', label: t(`${translationPrefix}.roomStatuses.dirty`), color: 'default' as const }
  ];

  const loadRooms = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      // Use appropriate API based on mode
      const response = mode === 'front-desk' 
        ? await frontDeskApi.frontDeskApiService.getAllRooms(
            token,
            page,
            rowsPerPage,
            searchTerm || undefined,
            roomTypeFilter && roomTypeFilter !== 'ALL' ? roomTypeFilter : undefined,
            statusFilter && statusFilter !== 'ALL' ? statusFilter : undefined
          )
        : await hotelAdminApi.getHotelRooms(
            token,
            page,
            rowsPerPage,
            searchTerm || undefined,
            undefined, // roomNumber filter
            roomTypeFilter && roomTypeFilter !== 'ALL' ? roomTypeFilter : undefined,
            statusFilter && statusFilter !== 'ALL' ? statusFilter : undefined
          );

      if (response.success && response.data) {
        let roomsData: RoomResponse[] = [];
        
        if (mode === 'front-desk') {
          // Convert Room[] to RoomResponse[] for front-desk mode
          const rooms = response.data.content || [];
          roomsData = rooms.map((room: any) => ({
            id: room.id,
            roomNumber: room.roomNumber,
            roomType: room.roomType,
            pricePerNight: room.pricePerNight,
            capacity: room.capacity,
            description: room.description || '',
            isAvailable: room.isAvailable,
            status: room.status,
            hotelId: room.hotelId || 0, // Default to 0 if not present
            hotelName: room.hotelName || '',
            currentGuest: room.currentGuest,
            createdAt: room.createdAt || new Date().toISOString(),
            updatedAt: room.updatedAt || new Date().toISOString()
          }));
        } else {
          // Already RoomResponse[] for hotel-admin mode
          roomsData = (response.data.content || []) as RoomResponse[];
        }
        
        setRooms(roomsData);
        // Handle different response structures
        const total = (response.data as any).totalElements ?? (response.data as any).page?.totalElements ?? 0;
        setTotalElements(total);
      } else {
        setError(response.message || 'Failed to load rooms');
        setTotalElements(0);
      }
    } catch (error) {
      // console.error('Failed to load rooms:', error);
      setError('Failed to load rooms');
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [token, page, rowsPerPage, searchTerm, statusFilter, roomTypeFilter, mode]);

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

  const handleRoomTypeFilterChange = (event: SelectChangeEvent) => {
    setRoomTypeFilter(event.target.value);
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
      // Use front-desk room status endpoint for both modes
      const url = buildApiUrl(`/front-desk/rooms/${roomId}/status?status=${encodeURIComponent(status)}`);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to update room status: ${response.statusText}`);
      }

      const data = await response.json();
      await loadRooms();
      if (onRoomUpdate) {
        onRoomUpdate(data);
      }
    } catch (error) {
      // console.error('Failed to update room status:', error);
      setError('Failed to update room status');
    }
  };

  const handleToggleAvailability = async (roomId: number, isAvailable: boolean) => {
    if (!token) return;

    try {
      // Use front-desk room availability endpoint for both modes
      const url = buildApiUrl(`/front-desk/rooms/${roomId}/availability?available=${isAvailable}`);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle room availability: ${response.statusText}`);
      }

      const data = await response.json();
      await loadRooms();
      if (onRoomUpdate) {
        onRoomUpdate(data);
      }
    } catch (error) {
      // console.error('Failed to update room availability:', error);
      setError('Failed to update room availability');
    }
  };

  // Create room function
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
      // console.error('Error creating room:', err);
      setError('Failed to create room. Please check the room number is unique.');
    } finally {
      setLoading(false);
    }
  };

  // Server-side filtering and pagination - use rooms directly
  const displayRooms = rooms;

  // Tab content for hotel admin mode
  const renderHotelAdminTabs = () => {
    if (mode !== 'hotel-admin') return null;

    return (
      <>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label={t(`${translationPrefix}.tabs.roomList`)} />
          {RoomTypePricing && <Tab label={t(`${translationPrefix}.tabs.pricing`)} />}
          {RoomBulkUpload && <Tab label={t(`${translationPrefix}.tabs.bulkUpload`)} />}
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
              placeholder={t(`${translationPrefix}.searchRooms`)}
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
              <InputLabel>{t(`${translationPrefix}.statusFilter`)}</InputLabel>
              <Select
                value={statusFilter}
                label={t(`${translationPrefix}.statusFilter`)}
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="ALL">{t(`${translationPrefix}.allStatuses`)}</MenuItem>
                {ROOM_STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>{t(`${translationPrefix}.roomTypeFilter`)}</InputLabel>
              <Select
                value={roomTypeFilter}
                label={t(`${translationPrefix}.roomTypeFilter`)}
                onChange={handleRoomTypeFilterChange}
              >
                <MenuItem value="ALL">{t(`${translationPrefix}.allRoomTypes`)}</MenuItem>
                {ROOM_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {getRoomTypeLabel(type.value)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              startIcon={<RefreshIcon />}
              onClick={loadRooms}
              variant="outlined"
            >
              {t(`${translationPrefix}.actions.refresh`)}
            </Button>

            {mode === 'hotel-admin' && (
              <Button
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
                variant="contained"
              >
                {t(`${translationPrefix}.actions.addRoom`)}
              </Button>
            )}
          </Box>

          {/* Rooms Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    background: 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)',
                    boxShadow: '0 4px 12px rgba(100, 116, 139, 0.15)',
                    '& .MuiTableCell-head': {
                      color: '#ffffff',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      border: 'none',
                      padding: '20px 16px',
                      position: 'relative',
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'linear-gradient(90deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.6) 100%)'
                      }
                    }
                  }}
                >
                  <TableCell>{t(`${translationPrefix}.tableHeaders.roomNumber`)}</TableCell>
                  <TableCell>{t(`${translationPrefix}.tableHeaders.type`)}</TableCell>
                  <TableCell>{t(`${translationPrefix}.tableHeaders.status`)}</TableCell>
                  <TableCell>{t(`${translationPrefix}.tableHeaders.currentGuest`)}</TableCell>
                  <TableCell>{t(`${translationPrefix}.tableHeaders.capacity`)}</TableCell>
                  <TableCell>{t(`${translationPrefix}.tableHeaders.price`)}</TableCell>
                  <TableCell>{t(`${translationPrefix}.tableHeaders.available`)}</TableCell>
                  <TableCell>{t(`${translationPrefix}.tableHeaders.actions`)}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayRooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {room.roomNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>{getRoomTypeLabel(room.roomType)}</TableCell>
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
                        {room.status === 'OCCUPIED' ? (room.currentGuest || t(`${translationPrefix}.guestPresent`)) : '-'}
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
                          <Tooltip title={t(`${translationPrefix}.actions.viewDetails`)}>
                            <IconButton
                              size="small"
                              onClick={() => onNavigateToRoom(room.id)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title={t(`${translationPrefix}.actions.editStatus`)}>
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
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={totalElements}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </>
      )}

      {/* Create Room Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{t(`${translationPrefix}.createRoom.title`)}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label={t(`${translationPrefix}.createRoom.roomNumber`)}
              value={roomForm.roomNumber}
              onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
              required
            />
            <FormControl fullWidth required>
              <InputLabel>{t(`${translationPrefix}.createRoom.roomType`)}</InputLabel>
              <Select
                value={roomForm.roomType}
                label={t(`${translationPrefix}.createRoom.roomType`)}
                onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}
              >
                {ROOM_TYPES.map((roomType) => (
                  <MenuItem key={roomType.value} value={roomType.value}>
                    {roomType.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label={t(`${translationPrefix}.createRoom.pricePerNight`)}
              type="number"
              value={roomForm.pricePerNight}
              onChange={(e) => setRoomForm({ ...roomForm, pricePerNight: parseFloat(e.target.value) || 0 })}
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
            <TextField
              fullWidth
              label={t(`${translationPrefix}.createRoom.capacity`)}
              type="number"
              value={roomForm.capacity}
              onChange={(e) => setRoomForm({ ...roomForm, capacity: parseInt(e.target.value) || 1 })}
              required
              inputProps={{ min: 1, max: 10 }}
            />
            <TextField
              fullWidth
              label={t(`${translationPrefix}.createRoom.description`)}
              multiline
              rows={3}
              value={roomForm.description}
              onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            {t(`${translationPrefix}.createRoom.cancel`)}
          </Button>
          <Button 
            onClick={handleCreateRoom}
            variant="contained"
            disabled={loading || !roomForm.roomNumber || !roomForm.pricePerNight}
          >
            {t(`${translationPrefix}.createRoom.create`)}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t(`${translationPrefix}.editRoom.title`)}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {t(`${translationPrefix}.editRoom.roomNumber`)}: {editingRoom.roomNumber}
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>{t(`${translationPrefix}.editRoom.status`)}</InputLabel>
              <Select
                value={editingRoom.status || ''}
                label={t(`${translationPrefix}.editRoom.status`)}
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
              label={t(`${translationPrefix}.editRoom.available`)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            {t(`${translationPrefix}.editRoom.cancel`)}
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
            {t(`${translationPrefix}.editRoom.save`)}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UnifiedRoomManagement;