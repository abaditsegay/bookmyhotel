import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Grid
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

interface HotelBookingsProps {
  mode: 'hotel-admin' | 'front-desk';
  title?: string;
  showActions?: boolean;
  showCheckInOut?: boolean;
  onBookingAction?: (booking: Booking, action: string) => void;
}

const HotelBookings: React.FC<HotelBookingsProps> = ({
  mode,
  title = 'Booking Management',
  showActions = true,
  showCheckInOut = false,
  onBookingAction
}) => {
  const { tenant } = useTenant();
  const { token, user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

  // Memoize search handler to prevent re-creation on every render
  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // Memoize InputProps to prevent re-creation on every render
  const searchInputProps = React.useMemo(() => ({
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon />
      </InputAdornment>
    ),
  }), []);

  // Load bookings based on mode
  const loadBookings = React.useCallback(async (customPage?: number, customSize?: number, customSearch?: string) => {
    if (!tenant || !token) return;
    
    setLoading(true);
    try {
      const pageToUse = customPage !== undefined ? customPage : page;
      const sizeToUse = customSize !== undefined ? customSize : size;
      const searchToUse = customSearch !== undefined ? customSearch : searchTerm;

      let result;
      // Both hotel admin and front desk should use the same booking management API
      // Front desk needs access to full booking management, not just arrivals
      result = await hotelAdminApi.getHotelBookings(
        token,
        pageToUse,
        sizeToUse,
        searchToUse
      );

      if (result.success && result.data) {
        // Both modes use the same hotel admin API, so handle the same way
        const bookingPage = result.data as any;
        setBookings(bookingPage.content || []);
        setTotalElements(bookingPage.page?.totalElements || 0);
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
  }, [tenant, token, page, size, searchTerm]);

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
    setSelectedBooking(booking);
    setDetailsDialogOpen(true);
  };

  // Handle delete booking
  const handleDeleteBooking = async () => {
    if (!selectedBooking || !token) return;

    try {
      await hotelAdminApi.deleteBooking(token, selectedBooking.reservationId);
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
  const handleBookingAction = (booking: Booking, action: string) => {
    if (onBookingAction) {
      onBookingAction(booking, action);
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
        return 'success';
      case 'checked-in':
      case 'checked_in':
        return 'primary';
      case 'checked-out':
      case 'checked_out':
        return 'info';
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
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
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
          onChange={handleSearchChange}
          InputProps={searchInputProps}
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
                                    onClick={() => handleBookingAction(booking, 'check-in')}
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
                                    onClick={() => handleBookingAction(booking, 'check-out')}
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
                          
                          {mode === 'hotel-admin' && (
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
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalElements}
            rowsPerPage={size}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            labelRowsPerPage="Bookings per page:"
          />
        </TableContainer>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Booking Details - {selectedBooking?.confirmationNumber}</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Guest Information</Typography>
                <Typography><strong>Name:</strong> {selectedBooking.guestName}</Typography>
                <Typography><strong>Email:</strong> {selectedBooking.guestEmail}</Typography>
                {selectedBooking.adults && (
                  <Typography><strong>Adults:</strong> {selectedBooking.adults}</Typography>
                )}
                {selectedBooking.children && (
                  <Typography><strong>Children:</strong> {selectedBooking.children}</Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Booking Details</Typography>
                <Typography><strong>Room:</strong> {selectedBooking.roomNumber} ({selectedBooking.roomType})</Typography>
                <Typography><strong>Check-in:</strong> {formatDate(selectedBooking.checkInDate)}</Typography>
                <Typography><strong>Check-out:</strong> {formatDate(selectedBooking.checkOutDate)}</Typography>
                {selectedBooking.nights && (
                  <Typography><strong>Nights:</strong> {selectedBooking.nights}</Typography>
                )}
                <Typography><strong>Total Amount:</strong> {formatCurrency(selectedBooking.totalAmount)}</Typography>
                <Typography><strong>Status:</strong> 
                  <Chip 
                    label={selectedBooking.status.replace('_', ' ')} 
                    color={getStatusColor(selectedBooking.status)} 
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                {selectedBooking.paymentStatus && (
                  <Typography><strong>Payment Status:</strong> 
                    <Chip 
                      label={selectedBooking.paymentStatus} 
                      color={selectedBooking.paymentStatus === 'paid' ? 'success' : 'warning'} 
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          {showCheckInOut && selectedBooking && (
            <>
              {(selectedBooking.status === 'confirmed' || selectedBooking.status === 'arriving') && (
                <Button 
                  variant="contained" 
                  color="success"
                  onClick={() => {
                    handleBookingAction(selectedBooking, 'check-in');
                    setDetailsDialogOpen(false);
                  }}
                >
                  Check In
                </Button>
              )}
              {(selectedBooking.status === 'checked-in' || selectedBooking.status === 'checked_in') && (
                <Button 
                  variant="contained" 
                  color="warning"
                  onClick={() => {
                    handleBookingAction(selectedBooking, 'check-out');
                    setDetailsDialogOpen(false);
                  }}
                >
                  Check Out
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>

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

export default HotelBookings;
