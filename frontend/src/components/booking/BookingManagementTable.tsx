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
  InputAdornment,
  CircularProgress,
  MenuItem,
  useTheme
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  PersonAdd as AddGuestIcon,
  Check as CheckInIcon,
  ExitToApp as CheckOutIcon,
  Print as PrintIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import { hotelAdminApi } from '../../services/hotelAdminApi';
import { frontDeskApiService, CheckoutResponse } from '../../services/frontDeskApi';
import CheckoutReceiptDialog from '../receipts/CheckoutReceiptDialog';
import CheckInDialog from './CheckInDialog';
import { Booking } from '../../types/booking-shared';
import { formatDateForDisplay } from '../../utils/dateUtils';
import BookingNotificationEvents from '../../utils/bookingNotificationEvents';
import { TableRowSkeleton } from '../common/SkeletonLoaders';
import { NoBookings } from '../common/EmptyState';
import { COLORS } from '../../theme/themeColors';
import PremiumTextField from '../common/PremiumTextField';
import PremiumSelect from '../common/PremiumSelect';

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
  const { t } = useTranslation();
  const { tenant, tenantId } = useTenant();
  const { token } = useAuth();
  const { themeMode } = useCustomTheme();
  const muiTheme = useTheme();
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
  
  // Payment status editing state
  const [editingPaymentStatus, setEditingPaymentStatus] = useState<number | null>(null);
  const [paymentStatusDialog, setPaymentStatusDialog] = useState({
    open: false,
    bookingId: null as number | null,
    currentStatus: '',
    newStatus: '',
    guestName: ''
  });
  const [updatingPaymentStatus, setUpdatingPaymentStatus] = useState(false);
  
  // Memoize search handler to prevent input focus loss
  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);
  
  // Receipt dialog state
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [checkoutReceipt, setCheckoutReceipt] = useState<CheckoutResponse | null>(null);
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [bookingForCheckIn, setBookingForCheckIn] = useState<Booking | null>(null);
  const [checkoutConfirmOpen, setCheckoutConfirmOpen] = useState(false);
  const [bookingForCheckout, setBookingForCheckout] = useState<Booking | null>(null);

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
    
    // console.log('BookingManagementTable: Manual refresh triggered');
    
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
      // console.error('Error loading bookings:', error);
      
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
      
      // console.log('BookingManagementTable: Loading bookings with params:', { 
      //   mode, 
      //   page,
      //   size,
      //   searchTerm: debouncedSearchTerm,
      //   tenant: tenant?.id
      // });
      
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
          // console.log('BookingManagementTable: Calling hotel admin API with search term:', debouncedSearchTerm);
          result = await hotelAdminApi.getHotelBookings(
            token,
            page,
            size,
            debouncedSearchTerm
          );
        }

        // console.log('BookingManagementTable: API response:', result);

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
          
          // console.log('BookingManagementTable: Setting bookings:', content.length, 'items, total:', totalElements);
          setBookings(content);
          setTotalElements(totalElements);
        } else {
          throw new Error(result.message || 'Failed to load bookings');
        }
      } catch (error) {
        // console.error('Error loading bookings:', error);
        
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

    // console.log('BookingManagementTable: useEffect triggered - loading bookings');
    loadData();
  }, [page, size, token, mode, debouncedSearchTerm, tenant, tenantId]);

  // Debug: Log bookings data when it changes
  useEffect(() => {
    // Track bookings data changes
  }, [bookings]);

  // Handle search with debounce - only reset page when search changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // console.log('BookingManagementTable: Search term changed, updating debounced search and resetting page');
      setDebouncedSearchTerm(searchTerm);
      setPage(0);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle refresh trigger - when this prop changes, refresh the data
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      // console.log('BookingManagementTable: Refresh trigger received:', refreshTrigger);
      loadBookings();
    }
  }, [refreshTrigger, loadBookings]);

  // Handle page change
  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    // console.log('BookingManagementTable: Page change requested from', page, 'to', newPage);
    setPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(event.target.value, 10);
    // console.log('BookingManagementTable: Rows per page change to', newSize);
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
      // console.error('Error deleting booking:', error);
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
        // console.error('Error updating booking status:', error);
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
    // console.log('🔥 handleCheckInSuccess called with:', updatedBooking);
    
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
      // console.error('Error generating receipt:', error);
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

  // Handle payment status editing
  const handlePaymentStatusEdit = (reservationId: number) => {
    setEditingPaymentStatus(reservationId);
  };

  const handlePaymentStatusSave = async (bookingId: number, newStatus: string) => {
    if (!token) return;

    setUpdatingPaymentStatus(true);
    try {
      const result = await hotelAdminApi.updateBookingPaymentStatus(token, bookingId, newStatus);
      
      if (result.success) {
        // Update the booking in local state
        setBookings(prev => prev.map(booking =>
          booking.reservationId === bookingId
            ? { ...booking, paymentStatus: newStatus }
            : booking
        ));
        
        setSnackbar({
          open: true,
          message: 'Payment status updated successfully',
          severity: 'success'
        });
        
        setEditingPaymentStatus(null);
        setPaymentStatusDialog({ 
          open: false, 
          bookingId: null, 
          currentStatus: '', 
          newStatus: '', 
          guestName: '' 
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to update payment status',
          severity: 'error'
        });
      }
    } catch (error) {
      // console.error('Error updating payment status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update payment status',
        severity: 'error'
      });
    } finally {
      setUpdatingPaymentStatus(false);
    }
  };

  const handlePaymentStatusCancel = () => {
    setEditingPaymentStatus(null);
    setPaymentStatusDialog({ 
      open: false, 
      bookingId: null, 
      currentStatus: '', 
      newStatus: '', 
      guestName: '' 
    });
  };

  const handlePaymentStatusConfirm = (bookingId: number, currentStatus: string, newStatus: string, guestName: string) => {
    setPaymentStatusDialog({
      open: true,
      bookingId,
      currentStatus,
      newStatus,
      guestName
    });
  };

  const handlePaymentStatusDialogConfirm = () => {
    if (paymentStatusDialog.bookingId && paymentStatusDialog.newStatus) {
      handlePaymentStatusSave(paymentStatusDialog.bookingId, paymentStatusDialog.newStatus);
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus.toUpperCase()) {
      case 'COMPLETED':
      case 'PAID': // Legacy status
        return 'success';
      case 'PROCESSING':
        return 'warning';
      case 'PENDING':
      default:
        return 'default';
    }
  };

  // Normalize payment status for display and editing
  const normalizePaymentStatus = (status: string) => {
    const normalized = status?.toUpperCase();
    // Convert legacy PAID status to COMPLETED
    if (normalized === 'PAID') {
      return 'COMPLETED';
    }
    // Ensure we only return valid enum values
    const validStatuses = [
      'PENDING', 'PROCESSING', 'COMPLETED', 'REFUNDED', 
      'PARTIALLY_REFUNDED', 'FAILED', 'CANCELLED', 'FORFEITED'
    ];
    if (validStatuses.includes(normalized)) {
      return normalized;
    }
    return 'PENDING';
  };

  // Format date - using centralized utility to ensure consistency
  const formatDate = (dateString: string) => {
    return formatDateForDisplay(dateString);
  };

  // Export bookings to CSV
  const exportToCSV = () => {
    if (bookings.length === 0) {
      setSnackbar({
        open: true,
        message: t('booking.management.noDataToExport') || 'No data to export',
        severity: 'error'
      });
      return;
    }

    // Define CSV headers
    const headers = [
      'Confirmation Number',
      'Guest Name',
      'Guest Email',
      'Room Type',
      'Room Number',
      'Check-In Date',
      'Check-Out Date',
      'Nights',
      'Adults',
      'Children',
      'Total Amount (ETB)',
      'Payment Status',
      'Payment Reference',
      'Booking Status'
    ];

    // Convert bookings to CSV rows
    const rows = bookings.map(booking => [
      booking.confirmationNumber,
      booking.guestName,
      booking.guestEmail,
      booking.roomType,
      booking.roomNumber || 'Not Assigned',
      formatDate(booking.checkInDate),
      formatDate(booking.checkOutDate),
      booking.nights || '',
      booking.adults || '',
      booking.children || '',
      booking.totalAmount.toFixed(2),
      booking.paymentStatus || 'PENDING',
      booking.paymentReference || '',
      booking.status
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        // Escape commas and quotes in cell content
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bookings_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSnackbar({
      open: true,
      message: t('booking.management.exportSuccess') || 'Bookings exported successfully',
      severity: 'success'
    });
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
        <PremiumTextField
          label={t('booking.management.searchLabel', 'Search Bookings')}
          placeholder={t('booking.management.searchPlaceholder', 'Search by guest, room, or reference')}
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={searchInputProps}
          disabled={loading}
          sx={{ 
            flexGrow: 1,
            maxWidth: 420,
            ml: title ? 2 : 0,
            '& .MuiOutlinedInput-root': {
              minHeight: 46,
            }
          }}
          size="small"
        />
        
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<FileDownloadIcon />} 
            onClick={exportToCSV}
            disabled={loading || bookings.length === 0}
            sx={{
              borderColor: '#E8B86D',
              color: '#B8860B',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'rgba(232, 184, 109, 0.1)',
                borderColor: '#B8860B'
              },
              '&:disabled': {
                borderColor: '#e0e0e0',
                color: '#9e9e9e'
              }
            }}
          >
            {t('booking.management.exportCSV') || 'Export CSV'}
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={() => loadBookings()}
            disabled={loading}
            sx={{
              borderColor: '#E8B86D',
              color: '#B8860B',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'rgba(232, 184, 109, 0.1)',
                borderColor: '#B8860B'
              },
              '&:disabled': {
                borderColor: '#e0e0e0',
                color: '#9e9e9e'
              }
            }}
          >
            {t('booking.management.refresh')}
          </Button>
          {(mode === 'front-desk' || mode === 'hotel-admin') && onWalkInRequest && (
            <Button 
              variant="contained" 
              startIcon={<AddGuestIcon />}
              onClick={() => {
                // console.log('Walk-in Guest button clicked in BookingManagementTable'); // Debug log
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
          borderRadius: 4,
          boxShadow: themeMode === 'dark' 
            ? '0 10px 40px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)'
            : '0 10px 40px rgba(37, 99, 235, 0.12), 0 4px 16px rgba(37, 99, 235, 0.08)',
          border: themeMode === 'dark' 
            ? '2px solid rgba(255, 255, 255, 0.1)'
            : '2px solid #bfdbfe',
          overflow: 'hidden',
          background: themeMode === 'dark'
            ? muiTheme.palette.background.paper
            : 'linear-gradient(180deg, #ffffff 0%, #f8faff 100%)'
        }}
      >
        <TableContainer 
          sx={{
            '& .MuiTable-root': {
              backgroundColor: muiTheme.palette.background.paper
            }
          }}
        >
          <Table>
            <TableHead>
              <TableRow 
                sx={{
                  background: 'linear-gradient(135deg, #f5f5f5 0%, #fafafa 50%, #f5f5f5 100%)',
                  borderBottom: `2px solid ${COLORS.PRIMARY}`,
                  '& .MuiTableCell-head': {
                    color: COLORS.PRIMARY,
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    border: 'none',
                    padding: '20px 16px',
                    position: 'relative'
                  }
                }}
              >
                <TableCell><strong>{t('booking.management.headers.confirmationNumber')}</strong></TableCell>
                <TableCell><strong>{t('booking.management.headers.guest')}</strong></TableCell>
                <TableCell><strong>{t('booking.management.headers.room')}</strong></TableCell>
                <TableCell><strong>{t('booking.management.headers.checkIn')}</strong></TableCell>
                <TableCell><strong>{t('booking.management.headers.checkOut')}</strong></TableCell>
                <TableCell><strong>{t('booking.management.headers.paymentRef')}</strong></TableCell>
                <TableCell><strong>{t('booking.management.headers.paymentStatus')}</strong></TableCell>
                <TableCell><strong>{t('booking.management.headers.status')}</strong></TableCell>
                {showActions && <TableCell><strong>{t('booking.management.headers.actions')}</strong></TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                // Show skeleton loaders while loading
                Array.from({ length: size }).map((_, index) => (
                  <TableRowSkeleton key={index} columns={showActions ? 9 : 8} />
                ))
              ) : bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showActions ? 9 : 8}>
                    <NoBookings />
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking, index) => (
                  <TableRow 
                    key={booking.reservationId}
                    sx={{
                      backgroundColor: index % 2 === 0 
                        ? muiTheme.palette.background.paper 
                        : themeMode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.02)' 
                          : '#f8faff',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor: themeMode === 'dark'
                          ? 'rgba(255, 255, 255, 0.08)'
                          : '#dbeafe',
                        transform: 'translateY(-2px)',
                        boxShadow: themeMode === 'dark'
                          ? '0 8px 25px rgba(0, 0, 0, 0.4), 0 3px 10px rgba(0, 0, 0, 0.3)'
                          : '0 8px 25px rgba(37, 99, 235, 0.15), 0 3px 10px rgba(37, 99, 235, 0.08)'
                      },
                      '& .MuiTableCell-body': {
                        border: 'none',
                        padding: '18px 16px',
                        fontSize: '1rem',
                        borderBottom: themeMode === 'dark' 
                          ? '1px solid rgba(255, 255, 255, 0.1)' 
                          : '1px solid #e1e7ef'
                      }
                    }}
                  >
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: themeMode === 'dark' ? '#60a5fa' : '#1e40af',
                          backgroundColor: themeMode === 'dark' 
                            ? 'rgba(96, 165, 250, 0.1)' 
                            : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          display: 'inline-block',
                          border: themeMode === 'dark' 
                            ? '1px solid rgba(96, 165, 250, 0.3)' 
                            : '1px solid #93c5fd',
                          boxShadow: themeMode === 'dark'
                            ? '0 2px 4px rgba(0, 0, 0, 0.3)'
                            : '0 2px 4px rgba(37, 99, 235, 0.1)'
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
                          sx={{ 
                            color: themeMode === 'dark' ? '#60a5fa' : '#1e40af', 
                            mb: 0.5 
                          }}
                        >
                          {booking.guestName}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: muiTheme.palette.text.secondary,
                            fontSize: '0.85rem'
                          }}
                        >
                          {booking.guestEmail}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500,
                          color: muiTheme.palette.text.primary
                        }}
                      >
                        {booking.roomNumber} - {booking.roomType}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: muiTheme.palette.text.primary,
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
                          color: muiTheme.palette.text.primary,
                          fontWeight: 500
                        }}
                      >
                        {formatDate(booking.checkOutDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace',
                          fontWeight: 400,
                          color: booking.paymentReference 
                            ? muiTheme.palette.text.primary 
                            : muiTheme.palette.text.secondary,
                          fontSize: '0.95rem'
                        }}
                      >
                        {booking.paymentReference || 'FRONTDESK'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {mode === 'hotel-admin' && editingPaymentStatus === booking.reservationId ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PremiumSelect
                            label="Payment Status"
                            value={normalizePaymentStatus(booking.paymentStatus || 'PENDING')}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              const currentStatus = normalizePaymentStatus(booking.paymentStatus || 'PENDING');
                              if (newStatus !== currentStatus) {
                                handlePaymentStatusConfirm(
                                  booking.reservationId,
                                  currentStatus,
                                  newStatus,
                                  booking.guestName
                                );
                              }
                            }}
                            disabled={updatingPaymentStatus}
                            formControlProps={{
                              sx: {
                                minWidth: 170,
                                '& .MuiFormLabel-root': {
                                  textTransform: 'uppercase',
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  letterSpacing: '0.5px'
                                }
                              },
                            }}
                            sx={{
                              '& .MuiSelect-select': {
                                padding: '8px 10px',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                color: COLORS.PRIMARY,
                              },
                              '& .MuiOutlinedInput-root': {
                                height: 40,
                                backgroundColor: '#fafafa',
                              },
                            }}
                          >
                            <MenuItem value="PENDING">PENDING</MenuItem>
                            <MenuItem value="PROCESSING">PROCESSING</MenuItem>
                            <MenuItem value="COMPLETED">COMPLETED</MenuItem>
                            <MenuItem value="REFUNDED">REFUNDED</MenuItem>
                            <MenuItem value="PARTIALLY_REFUNDED">PARTIALLY REFUNDED</MenuItem>
                            <MenuItem value="FAILED">FAILED</MenuItem>
                            <MenuItem value="CANCELLED">CANCELLED</MenuItem>
                            <MenuItem value="FORFEITED">FORFEITED</MenuItem>
                          </PremiumSelect>
                          <IconButton
                            size="small"
                            onClick={handlePaymentStatusCancel}
                            disabled={updatingPaymentStatus}
                            sx={{
                              color: '#ef4444',
                              '&:hover': {
                                backgroundColor: '#fef2f2'
                              }
                            }}
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={normalizePaymentStatus(booking.paymentStatus || 'PENDING')} 
                            color={getPaymentStatusColor(booking.paymentStatus || 'PENDING')} 
                            size="small"
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.85rem',
                              height: '28px',
                              borderRadius: '14px'
                            }}
                          />
                          {mode === 'hotel-admin' && (
                            <IconButton
                              size="small"
                              onClick={() => handlePaymentStatusEdit(booking.reservationId)}
                              sx={{
                                color: muiTheme.palette.text.secondary,
                                padding: '4px',
                                '&:hover': {
                                  color: muiTheme.palette.primary.main,
                                  backgroundColor: themeMode === 'dark' 
                                    ? 'rgba(255, 255, 255, 0.08)' 
                                    : '#f3f4f6'
                                }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={booking.status.replace('_', ' ')} 
                        color={getStatusColor(booking.status)} 
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          height: '32px',
                          borderRadius: '16px',
                          textTransform: 'capitalize',
                          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.15)',
                          border: '1px solid rgba(37, 99, 235, 0.2)',
                          '& .MuiChip-label': {
                            paddingX: '12px'
                          }
                        }}
                      />
                    </TableCell>
                    {showActions && (
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title={t('booking.management.actions.view')} arrow>
                            <IconButton 
                              size="small"
                              onClick={() => handleViewBookingDetails(booking)}
                              sx={{
                                backgroundColor: '#dbeafe',
                                color: '#1e40af',
                                border: '1px solid #93c5fd',
                                '&:hover': {
                                  backgroundColor: '#2563eb',
                                  color: '#ffffff',
                                  transform: 'scale(1.15)',
                                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                                },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {showCheckInOut && (
                            <>
                              {(booking.status.toUpperCase() === 'CONFIRMED' || booking.status.toUpperCase() === 'ARRIVING') && (
                                <Tooltip title={t('booking.management.actions.checkIn')} arrow>
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
                                <Tooltip title={t('booking.management.actions.checkOut')} arrow>
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
                              <Tooltip title={t('booking.management.actions.receipt')} arrow>
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
                            <Tooltip title={t('booking.management.actions.delete')}>
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
              backgroundColor: themeMode === 'dark' 
                ? muiTheme.palette.background.paper 
                : '#f8fafc',
              borderTop: themeMode === 'dark' 
                ? '1px solid rgba(255, 255, 255, 0.1)' 
                : '1px solid #e5e7eb',
              '& .MuiTablePagination-toolbar': {
                padding: '12px 24px',
                color: muiTheme.palette.text.primary,
                gap: 2,
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                color: COLORS.PRIMARY,
                fontWeight: 600,
                fontSize: '0.85rem',
                letterSpacing: '0.4px',
                textTransform: 'uppercase'
              },
              '& .MuiTablePagination-select': {
                backgroundColor: '#fafafa',
                border: '1px solid #d1d5db',
                borderLeft: `3px solid ${COLORS.GOLD || '#E8B86D'}`,
                borderRadius: '6px',
                padding: '6px 10px',
                color: COLORS.PRIMARY,
                fontWeight: 600,
                minHeight: 38,
                '&:hover': {
                  borderColor: '#c7c7c7'
                },
                '&:focus': {
                  borderColor: COLORS.PRIMARY,
                  borderLeftColor: COLORS.PRIMARY
                }
              },
              '& .MuiTablePagination-actions button': {
                color: themeMode === 'dark' ? '#60a5fa' : '#667eea',
                backgroundColor: themeMode === 'dark' 
                  ? 'rgba(96, 165, 250, 0.1)' 
                  : '#f0f4ff',
                borderRadius: '6px',
                margin: '0 2px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: themeMode === 'dark' 
                    ? 'rgba(96, 165, 250, 0.2)' 
                    : '#e0e7ff',
                  transform: 'scale(1.05)'
                },
                '&.Mui-disabled': {
                  color: muiTheme.palette.text.disabled,
                  backgroundColor: themeMode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : '#f3f4f6'
                }
              }
            }}
          />
        </TableContainer>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('booking.management.dialogs.deleteConfirm.title')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('booking.management.dialogs.deleteConfirm.message', { guestName: selectedBooking?.guestName })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('booking.management.dialogs.deleteConfirm.cancel')}</Button>
          <Button 
            onClick={handleDeleteBooking} 
            color="error" 
            variant="contained"
          >
            {t('booking.management.dialogs.deleteConfirm.delete')}
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
          // console.log('CheckInDialog onClose called');
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
        <DialogTitle>{t('booking.management.dialogs.checkoutConfirm.title')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('booking.management.dialogs.checkoutConfirm.message', { 
              guestName: bookingForCheckout?.guestName, 
              roomNumber: bookingForCheckout?.roomNumber 
            })}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t('booking.management.dialogs.checkoutConfirm.subtitle')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckoutConfirmOpen(false)} color="inherit">
            {t('booking.management.dialogs.checkoutConfirm.cancel')}
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
            {t('booking.management.dialogs.checkoutConfirm.checkOut')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Status Update Confirmation Dialog */}
      <Dialog
        open={paymentStatusDialog.open}
        onClose={() => setPaymentStatusDialog({ 
          open: false, 
          bookingId: null, 
          currentStatus: '', 
          newStatus: '', 
          guestName: '' 
        })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirm Payment Status Change
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to change the payment status for <strong>{paymentStatusDialog.guestName}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Current Status: <Chip 
              label={paymentStatusDialog.currentStatus} 
              color={getPaymentStatusColor(paymentStatusDialog.currentStatus)} 
              size="small" 
              sx={{ mx: 1 }}
            />
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            New Status: <Chip 
              label={paymentStatusDialog.newStatus} 
              color={getPaymentStatusColor(paymentStatusDialog.newStatus)} 
              size="small" 
              sx={{ mx: 1 }}
            />
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setPaymentStatusDialog({ 
              open: false, 
              bookingId: null, 
              currentStatus: '', 
              newStatus: '', 
              guestName: '' 
            })} 
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePaymentStatusDialogConfirm}
            color="primary"
            variant="contained"
            disabled={updatingPaymentStatus}
          >
            {updatingPaymentStatus ? <CircularProgress size={20} /> : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Debug button removed - was causing overlay issue in navbar */}

    </Box>
  );
};

export default BookingManagementTable;
