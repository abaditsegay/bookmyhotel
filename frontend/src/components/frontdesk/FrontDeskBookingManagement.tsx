import React, { useState, useEffect, useCallback } from 'react';
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
import { formatDateForDisplay } from '../../utils/dateUtils';
import {
  Visibility as VisibilityIcon,
  Check as CheckInIcon,
  ExitToApp as CheckOutIcon,
  PersonOff as NoShowIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { frontDeskApiService, FrontDeskBooking } from '../../services/frontDeskApi';
import BookingNotificationEvents from '../../utils/bookingNotificationEvents';

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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Memoize search handler to prevent input focus loss
  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  // Load bookings
  const loadBookings = useCallback(async () => {
    if (!token) return;
    
    // console.log('Loading bookings with params:', { page, size, search, tenantId });
    setLoading(true);
    setError(null);
    
    try {
      const result = await frontDeskApiService.getAllBookings(token, page, size, search, tenantId);
      
      if (result.success && result.data) {
        // console.log('🏨 FrontDeskBookingManagement - Raw API data:', result.data.content);
        setBookings(result.data.content);
        setTotalElements(result.data.totalElements || 0);
      } else {
        setError(result.message || 'Failed to load bookings');
        setBookings([]);
        setTotalElements(0);
      }
    } catch (error) {
      // console.error('Load bookings error:', error);
      setError('Failed to load bookings');
      setBookings([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [token, page, size, search, tenantId]);

  // Load bookings on component mount and when dependencies change
  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Add window focus listener to refresh bookings when returning from other pages
  useEffect(() => {
    const handleWindowFocus = () => {
      // console.log('Window gained focus, refreshing bookings...');
      loadBookings();
    };

    // Add event listener for window focus
    window.addEventListener('focus', handleWindowFocus);

    // Also listen for visibility change (more reliable than focus on some browsers)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // console.log('Page became visible, refreshing bookings...');
        loadBookings();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadBookings]);

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
    // console.log('Page change requested:', newPage);
    setPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(event.target.value, 10);
    // console.log('Rows per page change:', newSize);
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
        // Trigger notification refresh after status update
        BookingNotificationEvents.afterUpdate();
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

  const handleViewBookingDetails = (booking: FrontDeskBooking) => {
    setSelectedBooking(booking);
    setViewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'warning';
      case 'CONFIRMED': return 'primary';
      case 'CHECKED_IN': return 'success';
      case 'CHECKED_OUT': return 'info';
      case 'CANCELLED': return 'error';
      case 'NO_SHOW': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return formatDateForDisplay(dateString);
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
          onChange={handleSearchInputChange}
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
          <TableContainer 
            component={Paper}
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #e0e7ff',
              overflow: 'hidden',
              '& .MuiTable-root': {
                backgroundColor: '#ffffff'
              }
            }}
          >
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
                    <TableCell 
                      colSpan={7} 
                      align="center"
                      sx={{ 
                        backgroundColor: '#f8fafc',
                        border: 'none',
                        py: 4
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {search ? 'No bookings found matching your search.' : 'No bookings found.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking, index) => (
                    <TableRow 
                      key={booking.reservationId}
                      sx={{
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          backgroundColor: '#e0e7ff',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)'
                        },
                        '& .MuiTableCell-body': {
                          border: 'none',
                          padding: '16px',
                          fontSize: '0.9rem',
                          borderBottom: '1px solid #e5e7eb'
                        }
                      }}
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: '#1f2937'
                          }}
                        >
                          {booking.confirmationNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography 
                            variant="body2" 
                            fontWeight="600"
                            sx={{ color: '#1f2937', mb: 0.5 }}
                          >
                            {booking.guestName}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#6b7280',
                              fontSize: '0.75rem'
                            }}
                          >
                            {booking.guestEmail}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box 
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: '#10b981',
                              flexShrink: 0
                            }}
                          />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 500,
                              color: '#374151'
                            }}
                          >
                            {booking.roomNumber} - {booking.roomType}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#374151',
                            fontWeight: 500
                          }}
                        >
                          {formatDate(booking.checkInDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#374151',
                            fontWeight: 500
                          }}
                        >
                          {formatDate(booking.checkOutDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={booking.status.replace('_', ' ')} 
                          color={getStatusColor(booking.status)} 
                          size="small"
                          variant="filled"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: '28px',
                            borderRadius: '14px',
                            textTransform: 'capitalize'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="View Details" arrow>
                            <IconButton 
                              size="small"
                              onClick={() => handleViewBookingDetails(booking)}
                              sx={{
                                backgroundColor: '#f0f4ff',
                                color: '#667eea',
                                '&:hover': {
                                  backgroundColor: '#e0e7ff',
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {booking.status === 'CONFIRMED' && (
                            <>
                              <Tooltip title="Check In" arrow>
                                <IconButton 
                                  size="small"
                                  onClick={() => handleStatusUpdate(booking, 'CHECKED_IN')}
                                  sx={{
                                    backgroundColor: '#ecfdf5',
                                    color: '#10b981',
                                    '&:hover': {
                                      backgroundColor: '#d1fae5',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  <CheckInIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          
                          {booking.status === 'CHECKED_IN' && (
                            <Tooltip title="Check Out" arrow>
                              <IconButton 
                                size="small"
                                onClick={() => handleStatusUpdate(booking, 'CHECKED_OUT')}
                                sx={{
                                  backgroundColor: '#fef3c7',
                                  color: '#f59e0b',
                                  '&:hover': {
                                    backgroundColor: '#fde68a',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <CheckOutIcon fontSize="small" />
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
