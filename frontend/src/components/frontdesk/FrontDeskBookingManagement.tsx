import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Snackbar
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Check as CheckInIcon,
  ExitToApp as CheckOutIcon,
  PersonOff as NoShowIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { frontDeskApiService, FrontDeskBooking } from '../../services/frontDeskApi';

interface FrontDeskBookingManagementProps {
  onRefresh?: () => void;
}

const FrontDeskBookingManagement: React.FC<FrontDeskBookingManagementProps> = ({ onRefresh }) => {
  const { token } = useAuth();
  const { tenantId } = useTenant();
  const [bookings, setBookings] = useState<FrontDeskBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<FrontDeskBooking | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Load bookings
  const loadBookings = async () => {
    if (!token) return;
    
    console.log('Loading bookings with params:', { page, size, search, tenantId });
    setLoading(true);
    setError(null);
    
    try {
      const result = await frontDeskApiService.getAllBookings(token, page, size, search, tenantId);
      
      if (result.success && result.data) {
        setBookings(result.data.content);
        setTotalElements(result.data.totalElements || 0);
      } else {
        setError(result.message || 'Failed to load bookings');
        setBookings([]);
        setTotalElements(0);
      }
    } catch (error) {
      console.error('Load bookings error:', error);
      setError('Failed to load bookings');
      setBookings([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // Load bookings on component mount and when dependencies change
  useEffect(() => {
    loadBookings();
  }, [token, page, size, search, tenantId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle search
  const handleSearchSubmit = () => {
    if (page === 0) {
      // If already on page 0, trigger reload manually
      loadBookings();
    } else {
      // Reset to first page - this will trigger useEffect to reload
      setPage(0);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown> | null, newPage: number) => {
    console.log('Page change requested:', newPage);
    setPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(event.target.value, 10);
    console.log('Rows per page change:', newSize);
    setSize(newSize);
    setPage(0);
  };

  // Handle booking status updates
  const handleStatusUpdate = async (booking: FrontDeskBooking, newStatus: string) => {
    if (!token) return;
    
    try {
      const result = await frontDeskApiService.updateBookingStatus(token, booking.reservationId, newStatus, tenantId);
      
      if (result.success) {
        setSnackbar({ 
          open: true, 
          message: `Booking status updated to ${newStatus.toLowerCase()}`, 
          severity: 'success' 
        });
        loadBookings();
        onRefresh?.();
      } else {
        setSnackbar({ 
          open: true, 
          message: result.message || 'Failed to update booking status', 
          severity: 'error' 
        });
      }
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Failed to update booking status', 
        severity: 'error' 
      });
    }
  };

  // Handle booking deletion
  const handleDeleteBooking = async () => {
    if (!token || !selectedBooking) return;
    
    try {
      const result = await frontDeskApiService.deleteBooking(token, selectedBooking.reservationId, tenantId);
      
      if (result.success) {
        setSnackbar({ 
          open: true, 
          message: 'Booking deleted successfully', 
          severity: 'success' 
        });
        setDeleteDialogOpen(false);
        setSelectedBooking(null);
        loadBookings();
        onRefresh?.();
      } else {
        setSnackbar({ 
          open: true, 
          message: result.message || 'Failed to delete booking', 
          severity: 'error' 
        });
      }
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Failed to delete booking', 
        severity: 'error' 
      });
    }
  };

  const handleViewBookingDetails = (booking: FrontDeskBooking) => {
    setSelectedBooking(booking);
    setViewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'warning';
      case 'CONFIRMED': return 'success';
      case 'CHECKED_IN': return 'primary';
      case 'CHECKED_OUT': return 'info';
      case 'CANCELLED': return 'error';
      case 'NO_SHOW': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB'
    }).format(amount);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Booking Management
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={loadBookings}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search Bar */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Search bookings by guest name, room number, or confirmation number..."
          variant="outlined"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={handleSearchKeyPress}
        />
        <Button 
          variant="contained" 
          onClick={handleSearchSubmit}
          disabled={loading}
        >
          Search
        </Button>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Bookings Table */}
      {!loading && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Confirmation #</TableCell>
                  <TableCell>Guest</TableCell>
                  <TableCell>Room</TableCell>
                  <TableCell>Check-in</TableCell>
                  <TableCell>Check-out</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                        {search ? 'No bookings found matching your search.' : 'No bookings found.'}
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
                      <TableCell>
                        <Chip 
                          label={booking.status.replace('_', ' ')} 
                          color={getStatusColor(booking.status)} 
                          size="small"
                          variant="filled"
                        />
                      </TableCell>
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
                          
                          {booking.status === 'CONFIRMED' && (
                            <>
                              <Tooltip title="Check In">
                                <IconButton 
                                  size="small"
                                  color="success"
                                  onClick={() => handleStatusUpdate(booking, 'CHECKED_IN')}
                                >
                                  <CheckInIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          
                          {booking.status === 'CHECKED_IN' && (
                            <Tooltip title="Check Out">
                              <IconButton 
                                size="small"
                                color="warning"
                                onClick={() => handleStatusUpdate(booking, 'CHECKED_OUT')}
                              >
                                <CheckOutIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
                            <>
                              <Tooltip title="Mark No Show">
                                <IconButton 
                                  size="small"
                                  color="error"
                                  onClick={() => handleStatusUpdate(booking, 'NO_SHOW')}
                                >
                                  <NoShowIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Cancel Booking">
                                <IconButton 
                                  size="small"
                                  color="error"
                                  onClick={() => handleStatusUpdate(booking, 'CANCELLED')}
                                >
                                  <CancelIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          
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
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalElements}
            rowsPerPage={size}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </>
      )}

      {/* View Booking Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Booking Details - {selectedBooking?.confirmationNumber}</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Guest Information</Typography>
                    <Typography><strong>Name:</strong> {selectedBooking.guestName}</Typography>
                    <Typography><strong>Email:</strong> {selectedBooking.guestEmail}</Typography>
                    <Typography><strong>Hotel:</strong> {selectedBooking.hotelName}</Typography>
                    <Typography><strong>Address:</strong> {selectedBooking.hotelAddress}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Booking Details</Typography>
                    <Typography><strong>Room:</strong> {selectedBooking.roomNumber} ({selectedBooking.roomType})</Typography>
                    <Typography><strong>Check-in:</strong> {formatDate(selectedBooking.checkInDate)}</Typography>
                    <Typography><strong>Check-out:</strong> {formatDate(selectedBooking.checkOutDate)}</Typography>
                    <Typography><strong>Price per Night:</strong> {formatCurrency(selectedBooking.pricePerNight)}</Typography>
                    <Typography><strong>Total Amount:</strong> {formatCurrency(selectedBooking.totalAmount)}</Typography>
                    <Typography><strong>Payment Status:</strong> 
                      <Chip 
                        label={selectedBooking.paymentStatus} 
                        color={selectedBooking.paymentStatus === 'paid' ? 'success' : 'warning'} 
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    <Typography><strong>Booking Status:</strong> 
                      <Chip 
                        label={selectedBooking.status.replace('_', ' ')} 
                        color={getStatusColor(selectedBooking.status)} 
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    <Typography><strong>Booked on:</strong> {formatDate(selectedBooking.createdAt)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the booking for {selectedBooking?.guestName}? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteBooking} color="error" variant="contained">
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

export default FrontDeskBookingManagement;
