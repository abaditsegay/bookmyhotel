import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  NotificationsActive as NotificationsActiveIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon
} from '@mui/icons-material';
// import { useAuth } from '../contexts/AuthContext';
import { useNotificationsWithEvents, BookingNotification } from '../hooks/useNotifications';

const NotificationsPage: React.FC = () => {
  // const { user } = useAuth(); // Keep for future role-based features
  const { 
    notifications, 
    stats, 
    loading, 
    error, 
    loadNotifications, 
    markAsRead, 
    markAllAsRead, 
    setError,
    triggerRefresh
  } = useNotificationsWithEvents();

  const [selectedNotification, setSelectedNotification] = useState<BookingNotification | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const openDetails = (notification: BookingNotification) => {
    setSelectedNotification(notification);
    setDetailsOpen(true);
    
    // Mark as read if unread
    if (notification.status === 'UNREAD') {
      markAsRead(notification.id);
    }
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedNotification(null);
  };

  const getNotificationIcon = (type: string, status: string) => {
    if (type === 'CANCELLED') {
      return status === 'UNREAD' ? <CancelIcon color="error" /> : <CancelIcon color="action" />;
    } else {
      return status === 'UNREAD' ? <EditIcon color="warning" /> : <EditIcon color="action" />;
    }
  };

  const getNotificationColor = (type: string, status: string) => {
    if (status === 'UNREAD') {
      return type === 'CANCELLED' ? 'error' : 'warning';
    }
    return 'default';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getFilteredNotifications = () => {
    // Ensure notifications is always an array
    let filtered = Array.isArray(notifications) ? notifications : [];
    
    // Debug logging
    console.log('🔍 Debug getFilteredNotifications:');
    console.log('  - Raw notifications count:', notifications.length);
    console.log('  - Raw notifications:', notifications);
    console.log('  - Type filter:', typeFilter);
    console.log('  - Notification types:', notifications.map(n => n.type));
    
    // Apply type filter
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(n => n.type === typeFilter);
      console.log('  - After type filter:', filtered.length, 'notifications');
    }
    
    // Sort by status first (UNREAD on top), then by creation date (newest first)
    const sorted = filtered.sort((a, b) => {
      // First, prioritize UNREAD notifications
      if (a.status === 'UNREAD' && b.status !== 'UNREAD') return -1;
      if (a.status !== 'UNREAD' && b.status === 'UNREAD') return 1;
      
      // If both have same status, sort by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    console.log('  - Final result:', sorted.length, 'notifications');
    console.log('  - Final notifications:', sorted);
    
    return sorted;
  };

  const renderNotificationsTable = (notifications: BookingNotification[]) => (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="notifications table">
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>Confirmation</TableCell>
            <TableCell>Guest</TableCell>
            <TableCell>Room</TableCell>
            <TableCell>Check-in</TableCell>
            <TableCell>Check-out</TableCell>
            <TableCell>Details</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Updated By</TableCell>
            <TableCell>Created</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {notifications.map((notification) => (
            <TableRow
              key={notification.id}
              sx={{ 
                '&:last-child td, &:last-child th': { border: 0 },
                backgroundColor: notification.status === 'UNREAD' ? 'rgba(33, 150, 243, 0.1)' : 'inherit', // Light blue for unread
                opacity: notification.status === 'ARCHIVED' ? 0.6 : 1,
                cursor: 'pointer',
                '&:hover': { backgroundColor: notification.status === 'UNREAD' ? 'rgba(33, 150, 243, 0.15)' : 'action.hover' }
              }}
              onClick={() => openDetails(notification)}
            >
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  {getNotificationIcon(notification.type, notification.status)}
                  <Typography variant="body2" fontWeight={notification.status === 'UNREAD' ? 'bold' : 'normal'}>
                    {notification.type}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={notification.status === 'UNREAD' ? 'bold' : 'normal'}>
                  {notification.confirmationNumber}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={notification.status === 'UNREAD' ? 'bold' : 'normal'}>
                  {notification.guestName}
                </Typography>
                <Typography variant="caption" color="textSecondary" fontWeight={notification.status === 'UNREAD' ? 'bold' : 'normal'}>
                  {notification.guestEmail}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={notification.status === 'UNREAD' ? 'bold' : 'normal'}>
                  {notification.roomNumber}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={notification.status === 'UNREAD' ? 'bold' : 'normal'}>
                  {new Date(notification.checkInDate).toLocaleDateString()}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={notification.status === 'UNREAD' ? 'bold' : 'normal'}>
                  {new Date(notification.checkOutDate).toLocaleDateString()}
                </Typography>
              </TableCell>
              <TableCell sx={{ maxWidth: 200 }}>
                {notification.type === 'CANCELLED' && notification.cancellationReason && (
                  <Typography variant="body2" color="error.main" noWrap fontWeight={notification.status === 'UNREAD' ? 'bold' : 'normal'}>
                    {notification.cancellationReason}
                  </Typography>
                )}
                {notification.type === 'MODIFIED' && notification.changeDetails && (
                  <Typography variant="body2" color="warning.main" noWrap fontWeight={notification.status === 'UNREAD' ? 'bold' : 'normal'}>
                    {notification.changeDetails}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Box>
                  {notification.refundAmount && notification.refundAmount > 0 && (
                    <Typography variant="body2" color="success.main" fontWeight={notification.status === 'UNREAD' ? 'bold' : 'normal'}>
                      Refund: {formatCurrency(notification.refundAmount)}
                    </Typography>
                  )}
                  {notification.additionalCharges && notification.additionalCharges > 0 && (
                    <Typography variant="body2" color="warning.main" fontWeight={notification.status === 'UNREAD' ? 'bold' : 'normal'}>
                      +{formatCurrency(notification.additionalCharges)}
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={notification.status === 'UNREAD' ? 'bold' : 'normal'}>
                  {notification.updatedBy || 'System'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={notification.status === 'UNREAD' ? 'bold' : 'normal'}>
                  {new Date(notification.createdAt).toLocaleDateString()}
                </Typography>
                <Typography variant="caption" color="textSecondary" fontWeight={notification.status === 'UNREAD' ? 'bold' : 'normal'}>
                  {new Date(notification.createdAt).toLocaleTimeString()}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          <NotificationsActiveIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Booking Notifications
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={triggerRefresh || loadNotifications}
            disabled={loading}
          >
            Refresh
          </Button>
          {stats.totalUnread > 0 && (
            <Button
              variant="contained"
              startIcon={<InfoIcon />}
              onClick={markAllAsRead}
            >
              Mark All Read ({stats.totalUnread})
            </Button>
          )}
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Box display="flex" gap={2} mb={3}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select
            value={typeFilter}
            label="Filter by Type"
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <MenuItem value="ALL">All Notifications</MenuItem>
            <MenuItem value="CANCELLED">Cancelled Only</MenuItem>
            <MenuItem value="MODIFIED">Modified Only</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Notifications Table */}
      {getFilteredNotifications().length > 0 ? (
        renderNotificationsTable(getFilteredNotifications())
      ) : (
        <Box textAlign="center" py={4}>
          <InfoIcon color="action" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            No notifications found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Try adjusting your filter or check back later
          </Typography>
        </Box>
      )}

      {/* Notification Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={closeDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            {selectedNotification && getNotificationIcon(selectedNotification.type, selectedNotification.status)}
            Booking {selectedNotification?.type} Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Booking Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Confirmation:</strong> {selectedNotification.confirmationNumber}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Status:</strong> 
                      <Chip 
                        label={selectedNotification.status}
                        color={getNotificationColor(selectedNotification.type, selectedNotification.status) as any}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Guest:</strong> {selectedNotification.guestName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Email:</strong> {selectedNotification.guestEmail}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Room:</strong> {selectedNotification.roomNumber}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Check-in:</strong> {new Date(selectedNotification.checkInDate).toLocaleDateString()}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Check-out:</strong> {new Date(selectedNotification.checkOutDate).toLocaleDateString()}</Typography>
                  </Grid>
                </Grid>
              </Box>

              {selectedNotification.type === 'CANCELLED' && (
                <Box>
                  <Typography variant="h6" gutterBottom color="error">
                    Cancellation Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {selectedNotification.cancellationReason && (
                    <Typography><strong>Reason:</strong> {selectedNotification.cancellationReason}</Typography>
                  )}
                  {selectedNotification.refundAmount && selectedNotification.refundAmount > 0 && (
                    <Typography color="success.main">
                      <strong>Refund Amount:</strong> {formatCurrency(selectedNotification.refundAmount)}
                    </Typography>
                  )}
                </Box>
              )}

              {selectedNotification.type === 'MODIFIED' && (
                <Box>
                  <Typography variant="h6" gutterBottom color="warning.main">
                    Modification Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {selectedNotification.changeDetails && (
                    <Typography><strong>Changes:</strong> {selectedNotification.changeDetails}</Typography>
                  )}
                  {selectedNotification.additionalCharges && selectedNotification.additionalCharges > 0 && (
                    <Typography color="warning.main">
                      <strong>Additional Charges:</strong> {formatCurrency(selectedNotification.additionalCharges)}
                    </Typography>
                  )}
                  {selectedNotification.refundAmount && selectedNotification.refundAmount > 0 && (
                    <Typography color="success.main">
                      <strong>Refund Amount:</strong> {formatCurrency(selectedNotification.refundAmount)}
                    </Typography>
                  )}
                </Box>
              )}

              <Box>
                <Typography variant="body2" color="textSecondary">
                  <strong>Notification Created:</strong> {formatDate(selectedNotification.createdAt)}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationsPage;