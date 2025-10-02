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
import { frontDeskApiService, CheckoutResponse } from '../../services/frontDeskApi';
import CheckoutReceiptDialog from '../receipts/CheckoutReceiptDialog';
import CheckInDialog from './CheckInDialog';
import { Booking } from '../../types/booking-shared';
import { formatDateForDisplay } from '../../utils/dateUtils';
import BookingNotificationEvents from '../../utils/bookingNotificationEvents';

interface BookingManagementTableProps {
  mode: 'hotel-admin' | 'front-desk';
  title?: string;
  showActions?: boolean;
  showCheckInOut?: boolean;
  onBookingAction?: (booking: Booking, action: string) => void;
  onWalkInRequest?: () => void;
  currentTab?: number;
  refreshTrigger?: number; // When this changes, refresh the data
}

const BookingManagementTable: React.FC<BookingManagementTableProps> = ({
  mode,
  title = 'Booking Management',
  showActions = true,
  showCheckInOut = false,
  onBookingAction,
  onWalkInRequest,
  currentTab = 0,
  refreshTrigger
}) => {
  const { tenant, tenantId } = useTenant();
  const { token } = useAuth();
  const navigate = useNavigate();
  
  // Memoize InputProps to prevent re-creation on every render
  const searchInputProps = React.useMemo(() => ({
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon />
      </InputAdornment>
    ),
  }), []);
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });
  
  // Memoize search handler to prevent input focus loss
  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);
  
  // Debug state logging
  console.log('BookingManagementTable: Current state:', {
    mode,
    tenant: tenant?.id,
    token: token ? 'present' : 'missing',
    bookingsCount: bookings.length,
    totalElements,
    loading,
    page,
    size
  });
  
  // Receipt dialog state
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [checkoutReceipt, setCheckoutReceipt] = useState<CheckoutResponse | null>(null);
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [bookingForCheckIn, setBookingForCheckIn] = useState<Booking | null>(null);
  const [checkoutConfirmOpen, setCheckoutConfirmOpen] = useState(false);
  const [bookingForCheckout, setBookingForCheckout] = useState<Booking | null>(null);

  // Debug dialog state
  useEffect(() => {
    console.log('CheckInDialog state changed:', { checkInDialogOpen, bookingForCheckIn });
  }, [checkInDialogOpen, bookingForCheckIn]);

  // Manual refresh function (used by refresh button)
  const loadBookings = React.useCallback(async () => {
    if (!token) {
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Authentication required to load bookings',
        severity: 'error'
      });
      return;
    }
    // For hotel-admin mode, we need tenant context (tenantId should be available from JWT)
    if (mode === 'hotel-admin' && !tenantId) {
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Tenant authentication required. Please log in again.',
        severity: 'error'
      });
      return;
    }
    
    console.log('BookingManagementTable: Manual refresh triggered');
    
    setLoading(true);
    try {
      let result: any;
      if (mode === 'front-desk') {
        result = await frontDeskApiService.getAllBookings(
          token,
          page,
          size,
          searchTerm,
          tenant?.id || null
        );
      } else {
        result = await hotelAdminApi.getHotelBookings(
          token,
          page,
          size,
          searchTerm
        );
      }

      if (result.success && result.data) {
        // Handle different data structures between front-desk and hotel-admin APIs
        const content = result.data.content || [];
        let totalElements = 0;
        
          if (mode === 'front-desk') {
            // frontDeskApi returns: { content: [], totalElements: number, ... }
            totalElements = result.data.totalElements || 0;
          } else {
            // hotelAdminApi returns Spring Boot Page: { content: [], totalElements: number, ... }
            // NOT nested in page object - it's directly on the response
            totalElements = result.data.totalElements || 0;
          }        setBookings(content);
        setTotalElements(totalElements);
      } else {
        throw new Error(result.message || 'Failed to load bookings');
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      
      setSnackbar({
        open: true,
        message: `Failed to load bookings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
      
      // Set empty state when API fails
      setBookings([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [token, mode, page, size, searchTerm, tenant, tenantId]);

  // Centralized booking loading logic
  useEffect(() => {
    const loadData = async () => {
      if (!token) {
        setLoading(false);
        setSnackbar({
          open: true,
          message: 'Authentication required to load bookings',
          severity: 'error'
        });
        return;
      }
      // For hotel-admin mode, we need tenant context (tenantId should be available from JWT)
      if (mode === 'hotel-admin' && !tenantId) {
        setLoading(false);
        setSnackbar({
          open: true,
          message: 'Tenant authentication required. Please log in again.',
          severity: 'error'
        });
        return;
      }
      
      console.log('BookingManagementTable: Loading bookings with params:', { 
        mode, 
        page,
        size,
        searchTerm: debouncedSearchTerm,
        tenant: tenant?.id
      });
      
      setLoading(true);
      try {
        let result: any;
        if (mode === 'front-desk') {
          // Use front desk API with tenant ID
          result = await frontDeskApiService.getAllBookings(
            token,
            page,
            size,
            debouncedSearchTerm,
            tenant?.id || null
          );
        } else {
          // Use hotel admin API
          result = await hotelAdminApi.getHotelBookings(
            token,
            page,
            size,
            debouncedSearchTerm
          );
        }

        console.log('BookingManagementTable: API response:', result);

        if (result.success && result.data) {
          // Handle different data structures between front-desk and hotel-admin APIs
          const content = result.data.content || [];
          let totalElements = 0;
          
          if (mode === 'front-desk') {
            // frontDeskApi returns: { content: [], totalElements: number, ... }
            totalElements = result.data.totalElements || 0;
          } else {
            // hotelAdminApi returns Spring Boot Page: { content: [], totalElements: number, ... }
            // NOT nested in page object - it's directly on the response
            totalElements = result.data.totalElements || 0;
          }
          
          console.log('BookingManagementTable: Setting bookings:', content.length, 'items, total:', totalElements);
          setBookings(content);
          setTotalElements(totalElements);
        } else {
          throw new Error(result.message || 'Failed to load bookings');
        }
      } catch (error) {
        console.error('Error loading bookings:', error);
        
        setSnackbar({
          open: true,
          message: `Failed to load bookings: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'error'
        });
        
        // Set empty state when API fails
        setBookings([]);
        setTotalElements(0);
      } finally {
        setLoading(false);
      }
    };

    console.log('BookingManagementTable: useEffect triggered - loading bookings');
    loadData();
  }, [page, size, token, mode, debouncedSearchTerm, tenant, tenantId]);

  // Debug: Log bookings data when it changes
  useEffect(() => {
    if (bookings.length > 0) {
      console.log('BookingManagementTable: Bookings data:', bookings.map(b => ({
        id: b.reservationId,
        status: b.status,
        statusUpper: b.status.toUpperCase(),
        guestName: b.guestName,
        canCheckIn: (b.status.toUpperCase() === 'CONFIRMED' || b.status.toUpperCase() === 'ARRIVING')
      })));
    }
  }, [bookings]);

  // Handle search with debounce - only reset page when search changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('BookingManagementTable: Search term changed, updating debounced search and resetting page');
      setDebouncedSearchTerm(searchTerm);
      setPage(0);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle refresh trigger - when this prop changes, refresh the data
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      console.log('BookingManagementTable: Refresh trigger received:', refreshTrigger);
      loadBookings();
    }
  }, [refreshTrigger, loadBookings]);

  // Handle page change
  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    console.log('BookingManagementTable: Page change requested from', page, 'to', newPage);
    setPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(event.target.value, 10);
    console.log('BookingManagementTable: Rows per page change to', newSize);
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
      let result;
      if (mode === 'front-desk') {
        result = await frontDeskApiService.deleteBooking(token, selectedBooking.reservationId);
      } else {
        result = await hotelAdminApi.deleteBooking(token, selectedBooking.reservationId);
      }

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Booking deleted successfully',
          severity: 'success'
        });
        setDeleteDialogOpen(false);
        await loadBookings();
        // Trigger notification refresh after booking deletion
        BookingNotificationEvents.afterCancellation();
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to delete booking',
          severity: 'error'
        });
      }
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
    
    // Both front-desk and hotel-admin modes use the same check-in/check-out logic
    if ((mode === 'front-desk' || mode === 'hotel-admin') && token) {
      try {
        if (action === 'check-in') {
          // Open check-in dialog for room assignment - identical for both modes
          setBookingForCheckIn(booking);
          setCheckInDialogOpen(true);
          return; // Return early to prevent status update until dialog completes
        } else if (action === 'check-out') {
          // Use unified front-desk API for check-out operations (same for both modes)
          const result = await frontDeskApiService.checkOutGuestWithReceipt(token, booking.reservationId, tenant?.id || null);
          
          if (result.success && result.data) {
            setCheckoutReceipt(result.data);
            
            // Show receipt dialog if receipt was generated
            if (result.data.receiptGenerated && result.data.receipt) {
              setReceiptDialogOpen(true);
            }
            
            // Update local state
            setBookings(prev => prev.map(b => 
              b.reservationId === booking.reservationId 
                ? { ...b, status: 'CHECKED_OUT' } 
                : b
            ));
            
            // Trigger notification refresh after check-out
            BookingNotificationEvents.afterUpdate();
            
            setSnackbar({
              open: true,
              message: result.data.message || `Guest ${booking.guestName} checked out successfully. ${result.data.receiptGenerated ? 'Final receipt generated.' : ''}`,
              severity: 'success'
            });
            return; // Don't execute the rest of the checkout logic
          } else {
            throw new Error(result.message || 'Failed to check out guest with receipt');
          }
        }
      } catch (error) {
        console.error('Error updating booking status:', error);
        setSnackbar({
          open: true,
          message: error instanceof Error ? error.message : 'Failed to update booking status',
          severity: 'error'
        });
        return; // Don't update local state if API call failed
      }
    }
    
    // Note: Check-in status update is now handled by handleCheckInSuccess callback
    // from the CheckInDialog component, not here
  };

  // Handle successful check-in
  const handleCheckInSuccess = (updatedBooking: Booking) => {
    console.log('🔥 handleCheckInSuccess called with:', updatedBooking);
    
    // Update the booking in the local state
    setBookings(prev => prev.map(b => 
      b.reservationId === updatedBooking.reservationId 
        ? { ...b, ...updatedBooking, status: 'CHECKED_IN' } 
        : b
    ));
    
    // Trigger notification refresh after check-in
    BookingNotificationEvents.afterUpdate();
    
    setSnackbar({
      open: true,
      message: `Guest ${updatedBooking.guestName} has been successfully checked in!`,
      severity: 'success'
    });
    
    // Close dialog and reset state
    setCheckInDialogOpen(false);
    setBookingForCheckIn(null);
    
    // Refresh bookings to get updated data
    loadBookings();
  };

  // Handle print receipt for any booking (unified for both modes)
  const handlePrintReceipt = async (booking: Booking) => {
    if (!token) return;

    try {
      // Use the unified receipt preview API for both hotel-admin and front-desk modes
      const result = await frontDeskApiService.generateReceiptPreview(token, booking.reservationId, tenant?.id || null);
      
      if (result.success && result.data) {
        // Create a mock CheckoutResponse structure to work with the existing dialog
        const checkoutResponse = {
          booking: {
            reservationId: booking.reservationId,
            status: booking.status as 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW',
            confirmationNumber: booking.confirmationNumber || '',
            checkInDate: booking.checkInDate,
            checkOutDate: booking.checkOutDate,
            totalAmount: booking.totalAmount,
            paymentStatus: booking.paymentStatus || 'PENDING',
            paymentIntentId: undefined,
            createdAt: new Date().toISOString(),
            hotelName: result.data.hotelName || 'Hotel',
            hotelAddress: result.data.hotelAddress || '',
            roomNumber: booking.roomNumber || 'TBA',
            roomType: booking.roomType,
            pricePerNight: result.data.roomChargePerNight || 0,
            guestName: booking.guestName,
            guestEmail: booking.guestEmail,
            numberOfGuests: result.data.numberOfGuests || 1,
            specialRequests: '',
            managementUrl: undefined
          },
          receipt: result.data,
          receiptGenerated: true,
          message: 'Receipt generated successfully'
        };
        
        setCheckoutReceipt(checkoutResponse);
        setReceiptDialogOpen(true);
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Unable to generate receipt for this booking',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error generating receipt:', error);
      setSnackbar({
        open: true,
        message: 'Failed to generate receipt',
        severity: 'error'
      });
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
      case 'ARRIVING':
        return 'info';
      case 'CHECKED_IN':
      case 'CHECKED-IN':
        return 'success';
      case 'CHECKED_OUT':
      case 'CHECKED-OUT':
        return 'default';
      case 'CANCELLED':
      case 'NO-SHOW':
        return 'error';
      default:
        return 'default';
    }
  };

  // Format date - using centralized utility to ensure consistency
  const formatDate = (dateString: string) => {
    return formatDateForDisplay(dateString);
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
      {/* Header with Search and Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2 }}>
        {title && (
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
        )}
        
        {/* Search Input */}
        <TextField
          placeholder="Search by guest name, confirmation number, or room..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={searchInputProps}
          disabled={loading}
          sx={{ 
            flexGrow: 1,
            maxWidth: 400,
            ml: title ? 2 : 0
          }}
          size="small"
        />
        
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={() => loadBookings()}
            disabled={loading}
          >
            Refresh
          </Button>
          {(mode === 'front-desk' || mode === 'hotel-admin') && onWalkInRequest && (
            <Button 
              variant="contained" 
              startIcon={<AddGuestIcon />}
              onClick={() => {
                console.log('Walk-in Guest button clicked in BookingManagementTable'); // Debug log
                onWalkInRequest?.();
              }}
              disabled={!onWalkInRequest}
            >
              Walk-in Guest
            </Button>
          )}
        </Box>
      </Box>

      {/* Bookings Table */}
      <Card 
        sx={{ 
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e0e7ff',
          overflow: 'hidden'
        }}
      >
        <TableContainer 
          sx={{
            '& .MuiTable-root': {
              backgroundColor: '#ffffff'
            }
          }}
        >
          <Table>
            <TableHead>
              <TableRow 
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '& .MuiTableCell-head': {
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    border: 'none',
                    padding: '20px 16px',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: 'rgba(255,255,255,0.3)'
                    }
                  }
                }}
              >
                <TableCell><strong>Confirmation #</strong></TableCell>
                <TableCell><strong>Guest</strong></TableCell>
                <TableCell><strong>Room</strong></TableCell>
                <TableCell><strong>Check-in</strong></TableCell>
                <TableCell><strong>Check-out</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                {showActions && <TableCell><strong>Actions</strong></TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell 
                    colSpan={showActions ? 7 : 6} 
                    align="center" 
                    sx={{ 
                      py: 4,
                      backgroundColor: '#f8fafc',
                      border: 'none'
                    }}
                  >
                    <CircularProgress sx={{ color: '#667eea' }} />
                  </TableCell>
                </TableRow>
              ) : bookings.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={showActions ? 7 : 6} 
                    align="center" 
                    sx={{ 
                      py: 4,
                      backgroundColor: '#f8fafc',
                      border: 'none'
                    }}
                  >
                    <Typography color="text.secondary">
                      No bookings found
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
                          fontFamily: 'monospace',
                          fontWeight: 600,
                          color: '#667eea',
                          backgroundColor: '#f0f4ff',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          display: 'inline-block'
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
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          height: '28px',
                          borderRadius: '14px',
                          textTransform: 'capitalize'
                        }}
                      />
                    </TableCell>
                    {showActions && (
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
                          
                          {showCheckInOut && (
                            <>
                              {(booking.status.toUpperCase() === 'CONFIRMED' || booking.status.toUpperCase() === 'ARRIVING') && (
                                <Tooltip title="Check In" arrow>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleBookingAction(booking, 'check-in')}
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
                              )}
                              {(booking.status.toUpperCase() === 'CHECKED_IN') && (
                                <Tooltip title="Check Out" arrow>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => {
                                      setBookingForCheckout(booking);
                                      setCheckoutConfirmOpen(true);
                                    }}
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
                              <Tooltip title="Print Receipt" arrow>
                                <IconButton 
                                  size="small"
                                  onClick={() => handlePrintReceipt(booking)}
                                  sx={{
                                    backgroundColor: '#e0e7ff',
                                    color: '#6366f1',
                                    '&:hover': {
                                      backgroundColor: '#c7d2fe',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  <PrintIcon fontSize="small" />
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
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={totalElements}
            rowsPerPage={size}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            sx={{
              backgroundColor: '#f8fafc',
              borderTop: '1px solid #e5e7eb',
              '& .MuiTablePagination-toolbar': {
                padding: '12px 24px',
                color: '#374151'
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                color: '#6b7280',
                fontWeight: 500,
                fontSize: '0.875rem'
              },
              '& .MuiTablePagination-select': {
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '4px 8px',
                color: '#374151',
                fontWeight: 500
              },
              '& .MuiTablePagination-actions button': {
                color: '#667eea',
                backgroundColor: '#f0f4ff',
                borderRadius: '6px',
                margin: '0 2px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#e0e7ff',
                  transform: 'scale(1.05)'
                },
                '&.Mui-disabled': {
                  color: '#9ca3af',
                  backgroundColor: '#f3f4f6'
                }
              }
            }}
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

      {/* Checkout Receipt Dialog */}
      <CheckoutReceiptDialog
        open={receiptDialogOpen}
        onClose={() => {
          setReceiptDialogOpen(false);
          setCheckoutReceipt(null);
        }}
        receipt={checkoutReceipt?.receipt || null}
        guestName={checkoutReceipt?.booking?.guestName || 'Guest'}
      />

      {/* Check-in Dialog */}
      <CheckInDialog
        open={checkInDialogOpen}
        onClose={() => {
          console.log('CheckInDialog onClose called');
          setCheckInDialogOpen(false);
          setBookingForCheckIn(null);
        }}
        booking={bookingForCheckIn}
        onCheckInSuccess={handleCheckInSuccess}
        mode={mode} // Pass the current mode to CheckInDialog
      />

      {/* Checkout Confirmation Dialog */}
      <Dialog
        open={checkoutConfirmOpen}
        onClose={() => setCheckoutConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Guest Checkout</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to check out <strong>{bookingForCheckout?.guestName}</strong> from room <strong>{bookingForCheckout?.roomNumber}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This will mark the guest as checked out and generate a final receipt.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckoutConfirmOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={() => {
              if (bookingForCheckout) {
                handleBookingAction(bookingForCheckout, 'check-out');
              }
              setCheckoutConfirmOpen(false);
              setBookingForCheckout(null);
            }}
            color="warning"
            variant="contained"
          >
            Check Out
          </Button>
        </DialogActions>
      </Dialog>

      {/* Debug button removed - was causing overlay issue in navbar */}

    </Box>
  );
};

export default BookingManagementTable;
