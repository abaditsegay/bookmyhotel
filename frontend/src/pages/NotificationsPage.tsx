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
  Paper,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  NotificationsActive as NotificationsActiveIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
// import { useAuth } from '../contexts/AuthContext';
import { useNotificationsWithEvents, BookingNotification } from '../hooks/useNotifications';
import { useBookingNotifications } from '../hooks/useBookingNotifications';

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
  const [confirmationFilter, setConfirmationFilter] = useState<string>('');

  // Get booking notifications (history) for the selected notification
  const { 
    history: bookingHistory, 
    loading: historyLoading, 
    error: historyError 
  } = useBookingNotifications(selectedNotification?.confirmationNumber || null);

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
    
    // Apply type filter
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(n => n.type === typeFilter);
    }
    
    // Apply confirmation number filter
    if (confirmationFilter.trim()) {
      const searchTerm = confirmationFilter.toLowerCase().trim();
      filtered = filtered.filter(n => 
        n.confirmationNumber.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort by status first (UNREAD on top), then by creation date (newest first)
    const sorted = filtered.sort((a, b) => {
      // First, prioritize UNREAD notifications
      if (a.status === 'UNREAD' && b.status !== 'UNREAD') return -1;
      if (a.status !== 'UNREAD' && b.status === 'UNREAD') return 1;
      
      // If both have same status, sort by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
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
                backgroundColor: notification.status === 'UNREAD' ? 'rgba(33, 150, 243, 0.1)' : 'inherit',
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
                  {(() => {
                    const refund = notification.refundAmount || 0;
                    const charges = notification.additionalCharges || 0;
                    const netAmount = charges - refund;
                    
                    if (notification.type === 'CANCELLED') {
                      // For cancellations, only show refund status
                      if (refund > 0) {
                        return (
                          <Typography 
                            variant="body2" 
                            color="success.main" 
                            fontWeight={notification.status === 'UNREAD' ? 'bold' : 'normal'}
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                          >
                            ↩️ Refund due: {formatCurrency(refund)}
                          </Typography>
                        );
                      } else {
                        return (
                          <Typography variant="body2" color="text.secondary">
                            No change
                          </Typography>
                        );
                      }
                    } else {
                      // For modifications, show net amount
                      if (netAmount > 0) {
                        return (
                          <Typography 
                            variant="body2" 
                            color="warning.main" 
                            fontWeight={notification.status === 'UNREAD' ? 'bold' : 'normal'}
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                          >
                            💳 Customer owes: {formatCurrency(netAmount)}
                          </Typography>
                        );
                      } else if (netAmount < 0) {
                        return (
                          <Typography 
                            variant="body2" 
                            color="success.main" 
                            fontWeight={notification.status === 'UNREAD' ? 'bold' : 'normal'}
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                          >
                            ↩️ Refund due: {formatCurrency(Math.abs(netAmount))}
                          </Typography>
                        );
                      } else {
                        return (
                          <Typography variant="body2" color="text.secondary">
                            No payment changes
                          </Typography>
                        );
                      }
                    }
                  })()}
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
        
        <TextField
          size="small"
          placeholder="Search by confirmation number..."
          value={confirmationFilter}
          onChange={(e) => setConfirmationFilter(e.target.value)}
          sx={{ minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: confirmationFilter && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setConfirmationFilter('')}
                  edge="end"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
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
            {typeFilter !== 'ALL' || confirmationFilter.trim() 
              ? 'Try adjusting your filters or search terms' 
              : 'No notifications available at this time'
            }
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
                    <Typography sx={{ mb: 1 }}>
                      <strong>Reason:</strong> {selectedNotification.cancellationReason}
                    </Typography>
                  )}
                  {selectedNotification.refundAmount && selectedNotification.refundAmount > 0 && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      <Typography>
                        <strong>💰 Refund Required:</strong> The hotel must refund {formatCurrency(selectedNotification.refundAmount)} to the guest.
                      </Typography>
                    </Alert>
                  )}
                  {(!selectedNotification.refundAmount || selectedNotification.refundAmount === 0) && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography>
                        <strong>ℹ️ No Change:</strong> No refund is required for this cancellation.
                      </Typography>
                    </Alert>
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
                    <Typography sx={{ mb: 1 }}>
                      <strong>Latest Changes:</strong> {selectedNotification.changeDetails}
                    </Typography>
                  )}
                  
                  {/* Payment Information Section */}
                  <Box sx={{ mt: 2 }}>
                    {(() => {
                      const refund = selectedNotification.refundAmount || 0;
                      const charges = selectedNotification.additionalCharges || 0;
                      const netAmount = charges - refund;
                      
                      if (netAmount > 0) {
                        return (
                          <Alert severity="warning" sx={{ mb: 1 }}>
                            <Typography>
                              <strong>💳 Additional Payment Required:</strong> The customer needs to pay an additional {formatCurrency(netAmount)}.
                            </Typography>
                          </Alert>
                        );
                      } else if (netAmount < 0) {
                        return (
                          <Alert severity="success" sx={{ mb: 1 }}>
                            <Typography>
                              <strong>💰 Refund Due:</strong> The hotel must refund {formatCurrency(Math.abs(netAmount))} to the customer.
                            </Typography>
                          </Alert>
                        );
                      } else {
                        return (
                          <Alert severity="info">
                            <Typography>
                              <strong>ℹ️ No Payment Changes:</strong> This modification does not require any additional payment or refund.
                            </Typography>
                          </Alert>
                        );
                      }
                    })()}
                  </Box>

                  {/* Complete Notification History Section */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Complete Notification History
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      Complete chronological history of all notifications for this booking (including current)
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    {historyLoading && (
                      <Box display="flex" justifyContent="center" p={2}>
                        <CircularProgress size={24} />
                        <Typography sx={{ ml: 1 }}>Loading notification history...</Typography>
                      </Box>
                    )}

                    {historyError && (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        <Typography>
                          Unable to load notification history: {historyError}
                        </Typography>
                      </Alert>
                    )}

                    {!historyLoading && !historyError && bookingHistory.length === 0 && (
                      <Typography color="textSecondary" sx={{ fontStyle: 'italic' }}>
                        No notifications found for this booking.
                      </Typography>
                    )}

                    {!historyLoading && !historyError && bookingHistory.length > 0 && (
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small" aria-label="modification history">
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Date</strong></TableCell>
                              <TableCell><strong>Type</strong></TableCell>
                              <TableCell><strong>Status</strong></TableCell>
                              <TableCell><strong>Details</strong></TableCell>
                              <TableCell><strong>Amount</strong></TableCell>
                              <TableCell><strong>Updated By</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {bookingHistory.map((notification, index) => (
                              <TableRow 
                                key={notification.id}
                                sx={{
                                  backgroundColor: index === 0 ? 'action.hover' : 'inherit',
                                  '&:hover': {
                                    backgroundColor: index === 0 ? 'action.selected' : 'action.hover',
                                  }
                                }}
                              >
                                <TableCell>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <Box>
                                      <Typography variant="body2">
                                        {new Date(notification.createdAt).toLocaleDateString()}
                                      </Typography>
                                      <Typography variant="caption" color="textSecondary">
                                        {new Date(notification.createdAt).toLocaleTimeString()}
                                      </Typography>
                                    </Box>
                                    {index === 0 && (
                                      <Chip 
                                        label="Latest" 
                                        size="small"
                                        color="success"
                                        variant="filled"
                                        sx={{ ml: 1, fontSize: '0.75rem' }}
                                      />
                                    )}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={notification.type} 
                                    size="small"
                                    color={notification.type === 'CANCELLED' ? 'error' : 'primary'}
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={notification.status} 
                                    size="small"
                                    color={notification.status === 'UNREAD' ? 'warning' : 'default'}
                                    variant="filled"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                    {notification.changeDetails || notification.cancellationReason || 'No additional details'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  {(() => {
                                    const refund = notification.refundAmount || 0;
                                    const charges = notification.additionalCharges || 0;
                                    const netAmount = charges - refund;
                                    
                                    if (notification.type === 'CANCELLED') {
                                      if (refund > 0) {
                                        return (
                                          <Typography variant="body2" color="success.main">
                                            -ETB {refund.toFixed(2)}
                                          </Typography>
                                        );
                                      } else {
                                        return (
                                          <Typography variant="body2" color="textSecondary">
                                            ETB 0.00
                                          </Typography>
                                        );
                                      }
                                    } else {
                                      if (netAmount > 0) {
                                        return (
                                          <Typography variant="body2" color="warning.main">
                                            +ETB {netAmount.toFixed(2)}
                                          </Typography>
                                        );
                                      } else if (netAmount < 0) {
                                        return (
                                          <Typography variant="body2" color="success.main">
                                            -ETB {Math.abs(netAmount).toFixed(2)}
                                          </Typography>
                                        );
                                      } else {
                                        return (
                                          <Typography variant="body2" color="textSecondary">
                                            ETB 0.00
                                          </Typography>
                                        );
                                      }
                                    }
                                  })()}
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {notification.updatedBy || 'System'}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
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