import React, { useState, useEffect } from 'react';
import { formatEthiopianPhone } from '../../utils/phoneUtils';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Grid,
  Paper,
  useTheme
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  PersonAdd as AddGuestIcon,
  Check as CheckInIcon,
  ExitToApp as CheckOutIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import AdvancedTable, { TableColumn, TableAction } from '../common/AdvancedTable';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { hotelAdminApi } from '../../services/hotelAdminApi';
import { frontDeskApiService } from '../../services/frontDeskApi';
import CheckInDialog from './CheckInDialog';
import { Booking } from '../../types/booking-shared';
import { formatDateForDisplay } from '../../utils/dateUtils';
import BookingNotificationEvents from '../../utils/bookingNotificationEvents';
import { designSystem } from '../../theme/designSystem';

interface EnhancedBookingManagementTableProps {
  mode: 'hotel-admin' | 'front-desk' | 'system-admin';
  title?: string;
  showActions?: boolean;
  showCheckInOut?: boolean;
  onBookingAction?: (booking: Booking, action: string) => void;
  onWalkInRequest?: () => void;
  currentTab?: number;
  refreshTrigger?: number;
  height?: string | number;
}

const EnhancedBookingManagementTable: React.FC<EnhancedBookingManagementTableProps> = ({
  mode,
  title = 'Enhanced Booking Management',
  showActions = true,
  showCheckInOut = false,
  onBookingAction,
  onWalkInRequest,
  currentTab = 0,
  refreshTrigger,
  height = 600
}) => {
  const { tenantId } = useTenant();
  const { token } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [bookings, setBookings] = useState<any[]>([]); // Using any[] to accommodate different booking structures
  const [loading, setLoading] = useState(true);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

  // Fetch bookings based on mode
  const fetchBookings = React.useCallback(async () => {
    try {
      setLoading(true);
      let response;
      
      if (mode === 'hotel-admin' && token) {
        response = await hotelAdminApi.getHotelBookings(token);
      } else if (mode === 'front-desk' && token && tenantId) {
        response = await frontDeskApiService.getAllBookings(token, 0, 100, '', tenantId);
      } else {
        // System admin mode - mock data for now
        response = {
          success: true,
          data: {
            content: [
              {
                bookingId: 1,
                reservationId: 'BK-2024-001',
                guestName: 'John Smith',
                guestEmail: 'john.smith@email.com',
                hotelName: 'Grand Plaza Hotel',
                roomType: 'Deluxe Suite',
                roomNumber: '101',
                checkInDate: '2024-01-15',
                checkOutDate: '2024-01-18',
                status: 'CONFIRMED',
                totalAmount: 15750.00,
                bookingDate: '2024-01-10',
                guestPhone: '+251911234567',
                paymentStatus: 'PAID'
              },
              {
                bookingId: 2,
                reservationId: 'BK-2024-002',
                guestName: 'Sarah Johnson',
                guestEmail: 'sarah.j@email.com',
                hotelName: 'Ocean View Resort',
                roomType: 'Standard Room',
                roomNumber: '205',
                checkInDate: '2024-01-20',
                checkOutDate: '2024-01-22',
                status: 'PENDING',
                totalAmount: 8960.00,
                bookingDate: '2024-01-18',
                guestPhone: '+251911234568',
                paymentStatus: 'PENDING'
              },
              {
                bookingId: 3,
                reservationId: 'BK-2024-003',
                guestName: 'Michael Brown',
                guestEmail: 'mbrown@email.com',
                hotelName: 'City Center Inn',
                roomType: 'Executive Room',
                roomNumber: '301',
                checkInDate: '2024-01-25',
                checkOutDate: '2024-01-27',
                status: 'CANCELLED',
                totalAmount: 7840.00,
                bookingDate: '2024-01-20',
                guestPhone: '+251911234569',
                paymentStatus: 'REFUNDED'
              },
              {
                bookingId: 4,
                reservationId: 'BK-2024-004',
                guestName: 'Emily Davis',
                guestEmail: 'emily.davis@email.com',
                hotelName: 'Mountain Lodge',
                roomType: 'Family Suite',
                roomNumber: '102',
                checkInDate: '2024-02-01',
                checkOutDate: '2024-02-04',
                status: 'CHECKED_IN',
                totalAmount: 16800.00,
                bookingDate: '2024-01-25',
                guestPhone: '+251911234570',
                paymentStatus: 'PAID'
              },
              {
                bookingId: 5,
                reservationId: 'BK-2024-005',
                guestName: 'David Wilson',
                guestEmail: 'dwilson@email.com',
                hotelName: 'Business Hotel',
                roomType: 'Standard Room',
                roomNumber: '210',
                checkInDate: '2024-02-10',
                checkOutDate: '2024-02-12',
                status: 'CHECKED_OUT',
                totalAmount: 10640.00,
                bookingDate: '2024-02-05',
                guestPhone: '+251911234571',
                paymentStatus: 'PAID'
              }
            ]
          }
        };
      }

      if (response.success && response.data?.content) {
        setBookings(response.data.content);
      }
    } catch (error) {
      // console.error('Failed to fetch bookings:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch bookings',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [token, tenantId, mode]);

  useEffect(() => {
    if (token && (tenantId || mode === 'system-admin')) {
      fetchBookings();
    }
  }, [token, tenantId, refreshTrigger, mode, fetchBookings]);

  // Get status color based on booking status
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      case 'CHECKED_IN':
        return 'info';
      case 'CHECKED_OUT':
        return 'default';
      default:
        return 'default';
    }
  };

  // Define table columns
  const columns: TableColumn[] = [
    { id: 'confirmationNumber', label: 'Reference Number', sortable: true, minWidth: 140 },
    { id: 'guestName', label: 'Guest Name', sortable: true, minWidth: 150 },
    { id: 'guestEmail', label: 'Email', sortable: true, minWidth: 180 },
    ...(mode === 'system-admin' ? [{ id: 'hotelName', label: 'Hotel', sortable: true, minWidth: 150 }] : []),
    { id: 'roomType', label: 'Room Type', sortable: true, minWidth: 130 },
    { id: 'roomNumber', label: 'Room #', sortable: true, minWidth: 80 },
    { id: 'checkInDate', label: 'Check In', sortable: true, minWidth: 120, format: (value: string) => formatDateForDisplay(value) },
    { id: 'checkOutDate', label: 'Check Out', sortable: true, minWidth: 120, format: (value: string) => formatDateForDisplay(value) },
    { 
      id: 'status', 
      label: 'Status', 
      sortable: true, 
      minWidth: 120,
      format: (value: string) => (
        <Chip 
          label={value?.replace('_', ' ')} 
          color={getStatusColor(value) as any}
          size="small"
          sx={{ fontWeight: 'bold' }}
        />
      )
    },
    { 
      id: 'totalAmount', 
      label: 'Amount (ETB)', 
      sortable: true, 
      minWidth: 130,
      format: (value: number) => `ETB ${value?.toFixed(2)}`
    },
  ];

  // Define all possible table actions - they will be conditionally disabled based on booking status
  const tableActions: TableAction[] = [
    {
      id: 'view',
      label: 'View Details',
      icon: <VisibilityIcon />,
      onClick: (row) => handleViewBooking(row),
    },
    {
      id: 'checkin',
      label: 'Check In',
      icon: <CheckInIcon />,
      onClick: (row) => handleCheckIn(row),
      color: 'success',
      disabled: (row) => !row || !showCheckInOut || row.status !== 'CONFIRMED'
    },
    {
      id: 'checkout',
      label: 'Check Out',
      icon: <CheckOutIcon />,
      onClick: (row) => handleCheckOut(row),
      color: 'info',
      disabled: (row) => !row || !showCheckInOut || row.status !== 'CHECKED_IN'
    },
    {
      id: 'cancel',
      label: 'Cancel Booking',
      icon: <DeleteIcon />,
      onClick: (row) => handleCancelBooking(row),
      color: 'error',
      disabled: (row) => !row || !showActions || row.status === 'CANCELLED' || row.status === 'CHECKED_OUT'
    },
    {
      id: 'print',
      label: 'Print Receipt',
      icon: <PrintIcon />,
      onClick: (row) => handlePrintReceipt(row),
      disabled: (row) => !row || !showActions
    }
  ];

  // Action handlers
  const handleViewBooking = (booking: any) => {
    const bookingId = booking.reservationId; // Use reservationId as the primary identifier
    if (mode === 'hotel-admin') {
      navigate(`/hotel-admin/bookings/${bookingId}`);
    } else if (mode === 'front-desk') {
      navigate(`/frontdesk/bookings/${bookingId}`);
    } else {
      // console.log('View booking:', booking.reservationId);
    }
  };

  const handleCheckIn = (booking: Booking) => {
    setSelectedBooking(booking);
    setCheckInDialogOpen(true);
  };

  const handleCheckOut = async (booking: any) => {
    try {
      const bookingId = booking.reservationId; // Use reservationId as the primary identifier
      // Mock checkout for demo purposes
      // console.log('Checkout booking:', bookingId);
      setSnackbar({
        open: true,
        message: 'Guest checked out successfully',
        severity: 'success'
      });
      fetchBookings(); // Refresh the list
    } catch (error) {
      // console.error('Checkout error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to check out guest',
        severity: 'error'
      });
    }
  };

  const handleCancelBooking = (booking: any) => {
    setSelectedBooking(booking);
    setDeleteDialogOpen(true);
  };

  const handlePrintReceipt = (booking: any) => {
    // console.log('Print receipt for reservation:', booking.reservationId);
    // Add print receipt functionality here using booking.reservationId
  };

  const confirmCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      const bookingId = selectedBooking.reservationId; // Use reservationId as the primary identifier
      // Mock cancel for demo purposes
      // console.log('Cancel booking:', bookingId);
      
      setSnackbar({
        open: true,
        message: 'Booking cancelled successfully',
        severity: 'success'
      });
      fetchBookings();
      
      // Trigger notification
      BookingNotificationEvents.afterCancellation();
    } catch (error) {
      // console.error('Cancel booking error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to cancel booking',
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedBooking(null);
    }
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedBookings(selectedIds);
  };

  return (
    <Box sx={{ height: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {onWalkInRequest && (
            <Button
              variant="contained"
              startIcon={<AddGuestIcon />}
              onClick={onWalkInRequest}
              size="small"
            >
              Walk-in Booking
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={fetchBookings}
            size="small"
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Enhanced Table */}
      <Paper sx={{ borderRadius: designSystem.borderRadius.lg, overflow: 'hidden', height: height }}>
        <AdvancedTable
          data={bookings.filter(booking => booking && booking.status)} // Filter out undefined/null entries
          columns={columns}
          loading={loading}
          selectable={false} // Remove checkboxes
          expandable
          actions={tableActions}
          onSelectionChange={handleSelectionChange}
          stickyHeader
          dense
          rowsPerPageOptions={[10, 25, 50, 100]}
          defaultRowsPerPage={25}
          showPagination={true} // Ensure pagination is enabled
          rowKeyField="reservationId" // Use reservationId as the unique identifier for rows
          renderExpandedRow={(booking: any) => (
            <Box sx={{ 
              p: 3, 
              backgroundColor: theme.palette.action.selected, // Highlighted background for expanded row
              borderLeft: `4px solid ${theme.palette.primary.main}`, // Add left border for emphasis
              position: 'relative'
            }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Guest Information
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Phone:</strong> {booking.guestPhone ? formatEthiopianPhone(booking.guestPhone) : 'Not provided'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Booking Date:</strong> {booking.bookingDate ? formatDateForDisplay(booking.bookingDate) : 'N/A'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Payment Status:</strong> 
                    <Chip 
                      label={booking.paymentStatus || 'Unknown'} 
                      size="small" 
                      sx={{ ml: 1 }}
                      color={booking.paymentStatus === 'PAID' ? 'success' : 'warning'}
                    />
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Booking Details
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Duration:</strong> {
                      Math.ceil((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24))
                    } nights
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Rate per night:</strong> ETB {(booking.totalAmount / Math.ceil((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24))).toFixed(2)}
                  </Typography>
                  {mode === 'system-admin' && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Commission:</strong> ETB {(booking.totalAmount * 0.1).toFixed(2)} (10%)
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
          emptyMessage="No bookings found"
        />
      </Paper>

      {/* Remove bulk actions since selection is disabled */}
      {false && selectedBookings.length > 0 && (
        <Paper sx={{ p: 2, mt: 2, borderRadius: designSystem.borderRadius.md }}>
          <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
            {selectedBookings.length} booking(s) selected. 
            Available actions: Export to Excel, Send Confirmation Emails, Generate Report
          </Typography>
        </Paper>
      )}

      {/* Dialogs */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel booking {selectedBooking?.reservationId}? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Keep Booking</Button>
          <Button onClick={confirmCancelBooking} color="error" variant="contained">
            Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>

      {selectedBooking && (
        <CheckInDialog
          open={checkInDialogOpen}
          onClose={() => {
            setCheckInDialogOpen(false);
            setSelectedBooking(null);
          }}
          booking={selectedBooking}
          onCheckInSuccess={(updatedBooking) => {
            console.log('🔥 EnhancedBookingTable: onCheckInSuccess called with:', {
              reservationId: updatedBooking.reservationId,
              roomNumber: updatedBooking.roomNumber,
              roomType: updatedBooking.roomType,
              status: updatedBooking.status
            });
            
            // Update the booking in the local state immediately
            setBookings(prev => prev.map(b => 
              b.reservationId === updatedBooking.reservationId 
                ? { ...b, ...updatedBooking, status: 'CHECKED_IN' } 
                : b
            ));
            
            // Trigger notification refresh
            BookingNotificationEvents.afterUpdate();
            
            setSnackbar({
              open: true,
              message: `Guest ${updatedBooking.guestName} checked in successfully to room ${updatedBooking.roomNumber || 'TBA'}!`,
              severity: 'success'
            });
            
            // Close dialog
            setCheckInDialogOpen(false);
            setSelectedBooking(null);
            
            // Refresh from backend after a short delay
            setTimeout(() => {
              console.log('🔄 EnhancedBookingTable: Refreshing bookings from backend...');
              fetchBookings();
            }, 500);
          }}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EnhancedBookingManagementTable;