import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  TablePagination,
  Tooltip,
  TextField,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  PersonAdd as AddGuestIcon,
  Check as CheckInIcon,
  ExitToApp as CheckOutIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { hotelAdminApi } from '../../services/hotelAdminApi';
import { frontDeskApiService } from '../../services/frontDeskApi';

interface Booking {
  reservationId: number;
  confirmationNumber: string;
  guestName: string;
  guestEmail: string;
  roomNumber: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  status: string;
  adults?: number;
  children?: number;
  nights?: number;
  paymentStatus?: string;
}

interface BookingManagementTableProps {
  mode: 'hotel-admin' | 'front-desk';
  title?: string;
  showActions?: boolean;
  showCheckInOut?: boolean;
  onBookingAction?: (booking: Booking, action: string) => void;
  currentTab?: number;
}

const BookingManagementTable: React.FC<BookingManagementTableProps> = ({
  mode,
  title = 'Booking Management',
  showActions = true,
  showCheckInOut = false,
  onBookingAction,
  currentTab = 0
}) => {
  const { tenant } = useTenant();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

  // Load bookings based on mode
  const loadBookings = React.useCallback(async (customPage?: number, customSize?: number, customSearch?: string) => {
    if (!token) return;
    // Front desk mode doesn't need tenant check
    if (mode === 'hotel-admin' && !tenant) return;
    
    setLoading(true);
    try {
      const pageToUse = customPage !== undefined ? customPage : page;
      const sizeToUse = customSize !== undefined ? customSize : size;
      const searchToUse = customSearch !== undefined ? customSearch : searchTerm;

      let result: any;
      if (mode === 'front-desk') {
        // Use front desk API
        result = await frontDeskApiService.getAllBookings(
          token,
          pageToUse,
          sizeToUse,
          searchToUse
        );
      } else {
        // Use hotel admin API
        result = await hotelAdminApi.getHotelBookings(
          token,
          pageToUse,
          sizeToUse,
          searchToUse
        );
      }

      if (result.success && result.data) {
        setBookings(result.data.content || []);
        if (mode === 'front-desk') {
          // frontDeskApiService returns BookingPage with totalElements directly
          setTotalElements(result.data.totalElements || 0);
        } else {
          // hotelAdminApi returns BookingPage object with nested page info
          setTotalElements(result.data.page?.totalElements || 0);
        }
      } else {
        throw new Error(result.message || 'Failed to load bookings');
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load bookings',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [tenant, token, page, size, searchTerm, mode]);

  // Load bookings on component mount and tenant change
  useEffect(() => {
    if (tenant) {
      loadBookings();
    }
  }, [tenant, page, size, loadBookings]);

  // Handle search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(0);
      if (tenant) {
        loadBookings();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, tenant, loadBookings]);

  // Handle page change
  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(event.target.value, 10);
    setSize(newSize);
    setPage(0);
  };

  // Handle view booking details
  const handleViewBookingDetails = (booking: Booking) => {
    // Navigate to the appropriate booking details page based on mode
    if (mode === 'front-desk') {
      navigate(`/frontdesk/bookings/${booking.reservationId}?returnTab=${currentTab}`);
    } else {
      navigate(`/hotel-admin/bookings/${booking.reservationId}?returnTab=${currentTab}`);
    }
  };

  // Handle delete booking
  const handleDeleteBooking = async () => {
    if (!selectedBooking || !token) return;

    try {
      if (mode === 'front-desk') {
        await frontDeskApiService.deleteBooking(token, selectedBooking.reservationId);
      } else {
        await hotelAdminApi.deleteBooking(token, selectedBooking.reservationId);
      }
      setSnackbar({
        open: true,
        message: 'Booking deleted successfully',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
      await loadBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete booking',
        severity: 'error'
      });
    }
  };

  // Handle check-in/out actions
  const handleBookingAction = async (booking: Booking, action: string) => {
    if (onBookingAction) {
      onBookingAction(booking, action);
    }
    
    // For front-desk mode, also make API calls to update status
    if (mode === 'front-desk' && token) {
      try {
        let newStatus = '';
        if (action === 'check-in') {
          newStatus = 'CHECKED_IN';
        } else if (action === 'check-out') {
          newStatus = 'CHECKED_OUT';
        }
        
        if (newStatus) {
          await frontDeskApiService.updateBookingStatus(token, booking.reservationId, newStatus);
        }
      } catch (error) {
        console.error('Error updating booking status:', error);
        setSnackbar({
          open: true,
          message: 'Failed to update booking status',
          severity: 'error'
        });
        return; // Don't update local state if API call failed
      }
    }
    
    // Update local state optimistically
    if (action === 'check-in') {
      setBookings(prev => prev.map(b => 
        b.reservationId === booking.reservationId 
          ? { ...b, status: 'checked-in' } 
          : b
      ));
      setSnackbar({
        open: true,
        message: `Guest ${booking.guestName} checked in successfully`,
        severity: 'success'
      });
    } else if (action === 'check-out') {
      setBookings(prev => prev.map(b => 
        b.reservationId === booking.reservationId 
          ? { ...b, status: 'checked-out' } 
          : b
      ));
      setSnackbar({
        open: true,
        message: `Guest ${booking.guestName} checked out successfully`,
        severity: 'success'
      });
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'arriving':
        return 'info';
      case 'checked-in':
      case 'checked_in':
        return 'success';
      case 'checked-out':
      case 'checked_out':
        return 'default';
      case 'cancelled':
      case 'no-show':
        return 'error';
      default:
        return 'default';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={() => loadBookings()}
            disabled={loading}
          >
            Refresh
          </Button>
          {mode === 'front-desk' && (
            <Button 
              variant="contained" 
              startIcon={<AddGuestIcon />}
            >
              Walk-in Guest
            </Button>
          )}
        </Box>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by guest name, confirmation number, or room..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          disabled={loading}
        />
      </Box>

      {/* Bookings Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Confirmation #</strong></TableCell>
                <TableCell><strong>Guest</strong></TableCell>
                <TableCell><strong>Room</strong></TableCell>
                <TableCell><strong>Check-in</strong></TableCell>
                <TableCell><strong>Check-out</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                {showActions && <TableCell><strong>Actions</strong></TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={showActions ? 8 : 7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showActions ? 8 : 7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No bookings found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking.reservationId}>
                    <TableCell>{booking.confirmationNumber}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {booking.guestName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {booking.guestEmail}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {booking.roomNumber} - {booking.roomType}
                    </TableCell>
                    <TableCell>{formatDate(booking.checkInDate)}</TableCell>
                    <TableCell>{formatDate(booking.checkOutDate)}</TableCell>
                    <TableCell>{formatCurrency(booking.totalAmount)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={booking.status.replace('_', ' ')} 
                        color={getStatusColor(booking.status)} 
                        size="small" 
                      />
                    </TableCell>
                    {showActions && (
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small"
                              onClick={() => handleViewBookingDetails(booking)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          
                          {showCheckInOut && (
                            <>
                              {(booking.status === 'confirmed' || booking.status === 'arriving') && (
                                <Tooltip title="Check In">
                                  <IconButton 
                                    size="small" 
                                    color="success"
                                    onClick={() => {
                                      handleBookingAction(booking, 'check-in');
                                    }}
                                  >
                                    <CheckInIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {(booking.status === 'checked-in' || booking.status === 'checked_in') && (
                                <Tooltip title="Check Out">
                                  <IconButton 
                                    size="small" 
                                    color="warning"
                                    onClick={() => {
                                      handleBookingAction(booking, 'check-out');
                                    }}
                                  >
                                    <CheckOutIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Print Receipt">
                                <IconButton size="small">
                                  <PrintIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          
                          {(mode === 'hotel-admin' || mode === 'front-desk') && (
                            <Tooltip title="Delete Booking">
                              <IconButton 
                                size="small"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setDeleteDialogOpen(true);
                                }}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Table Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalElements}
            rowsPerPage={size}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </TableContainer>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the booking for {selectedBooking?.guestName}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteBooking} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BookingManagementTable;
