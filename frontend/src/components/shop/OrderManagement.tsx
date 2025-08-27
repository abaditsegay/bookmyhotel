import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as ViewIcon,
  Payment as PaymentIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { shopApiService } from '../../services/shopApi';
import { ShopOrder, ShopOrderStatus, PaymentMethod, DeliveryType } from '../../types/shop';

const OrderManagement: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewOrderDialog, setViewOrderDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null);

  // Get hotel ID from context (adjust based on your auth context)
  const hotelId = 1;

  // Helper function to safely format dates
  const formatDate = (dateString: string | null | undefined, formatStr: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return format(date, formatStr);
    } catch {
      return 'N/A';
    }
  };

  useEffect(() => {
    loadOrders();
  }, [hotelId]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await shopApiService.getOrders(hotelId);
      setOrders(data.content);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: ShopOrderStatus) => {
    try {
      await shopApiService.updateOrderStatus(hotelId, orderId, newStatus);
      loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status');
    }
  };

  const handleMarkPaid = async (orderId: number) => {
    try {
      await shopApiService.markOrderAsPaid(hotelId, orderId, `PAID-${Date.now()}`);
      loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark order as paid');
    }
  };

  const openViewDialog = (order: ShopOrder) => {
    setSelectedOrder(order);
    setViewOrderDialog(true);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.roomNumber && order.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: ShopOrderStatus) => {
    switch (status) {
      case ShopOrderStatus.PENDING: return 'warning';
      case ShopOrderStatus.CONFIRMED: return 'info';
      case ShopOrderStatus.PREPARING: return 'primary';
      case ShopOrderStatus.READY: return 'secondary';
      case ShopOrderStatus.COMPLETED: return 'success';
      case ShopOrderStatus.CANCELLED: return 'error';
      default: return 'default';
    }
  };

  const getNextStatus = (currentStatus: ShopOrderStatus): ShopOrderStatus | null => {
    switch (currentStatus) {
      case ShopOrderStatus.PENDING: return ShopOrderStatus.CONFIRMED;
      case ShopOrderStatus.CONFIRMED: return ShopOrderStatus.PREPARING;
      case ShopOrderStatus.PREPARING: return ShopOrderStatus.READY;
      case ShopOrderStatus.READY: return ShopOrderStatus.COMPLETED;
      default: return null;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/shop?tab=orders')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            Order Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => window.open('/shop/new-order', '_blank')}
        >
          New Order
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search Orders"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Order number, customer name, or room number"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Status</MenuItem>
                  {Object.values(ShopOrderStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                {filteredOrders.length} of {orders.length} orders
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Orders Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order Details</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {order.orderNumber}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.items.length} item(s)
                    </Typography>
                    {order.isDelivery && (
                      <Typography variant="caption">
                        {order.deliveryType === DeliveryType.ROOM_DELIVERY ? 'Room Delivery' : 'Pickup'}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2">{order.customerName}</Typography>
                    {order.roomNumber && (
                      <Typography variant="body2" color="text.secondary">
                        Room {order.roomNumber}
                      </Typography>
                    )}
                    {order.customerEmail && (
                      <Typography variant="caption" color="text.secondary">
                        {order.customerEmail}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    ETB {(order.totalAmount * 55).toFixed(0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ${order.totalAmount.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {order.paymentMethod?.replace('_', ' ') || 'Not Set'}
                    </Typography>
                    <Chip
                      label={order.isPaid ? 'Paid' : 'Unpaid'}
                      color={order.isPaid ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={order.status.replace('_', ' ')}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {order.orderDate ? format(new Date(order.orderDate), 'MMM dd, HH:mm') : 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => openViewDialog(order)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  {getNextStatus(order.status) && (
                    <Tooltip title={`Mark as ${getNextStatus(order.status)?.replace('_', ' ')}`}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleUpdateOrderStatus(order.id, getNextStatus(order.status)!)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {!order.isPaid && order.paymentMethod === PaymentMethod.ROOM_CHARGE && (
                    <Tooltip title="Mark as Paid">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleMarkPaid(order.id)}
                      >
                        <PaymentIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Order Dialog */}
      <Dialog 
        open={viewOrderDialog} 
        onClose={() => setViewOrderDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Order Details - {selectedOrder?.orderNumber}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Grid container spacing={3}>
              {/* Order Information */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Customer Information</Typography>
                    <Typography><strong>Name:</strong> {selectedOrder.customerName}</Typography>
                    {selectedOrder.customerEmail && (
                      <Typography><strong>Email:</strong> {selectedOrder.customerEmail}</Typography>
                    )}
                    {selectedOrder.customerPhone && (
                      <Typography><strong>Phone:</strong> {selectedOrder.customerPhone}</Typography>
                    )}
                    {selectedOrder.roomNumber && (
                      <Typography><strong>Room:</strong> {selectedOrder.roomNumber}</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Order Status */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Order Status</Typography>
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={selectedOrder.status.replace('_', ' ')}
                        color={getStatusColor(selectedOrder.status)}
                      />
                    </Box>
                    <Typography><strong>Order Date:</strong> {selectedOrder.orderDate ? format(new Date(selectedOrder.orderDate), 'MMM dd, yyyy HH:mm') : 'N/A'}</Typography>
                    <Typography><strong>Payment Method:</strong> {selectedOrder.paymentMethod?.replace('_', ' ') || 'Not Set'}</Typography>
                    <Typography><strong>Payment Status:</strong> {selectedOrder.isPaid ? 'Paid' : 'Unpaid'}</Typography>
                    {selectedOrder.deliveryType && (
                      <Typography><strong>Delivery:</strong> {selectedOrder.deliveryType.replace('_', ' ')}</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Order Items */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Order Items</Typography>
                    <List>
                      {selectedOrder.items.map((item, index) => (
                        <React.Fragment key={item.id}>
                          <ListItem>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography>{item.productName}</Typography>
                                  <Typography>ETB {(item.unitPrice * item.quantity * 55).toFixed(0)}</Typography>
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2">
                                    Quantity: {item.quantity} × ETB {(item.unitPrice * 55).toFixed(0)}
                                  </Typography>
                                  <Typography variant="caption">SKU: {item.productSku}</Typography>
                                  {item.notes && (
                                    <Typography variant="caption" sx={{ display: 'block' }}>
                                      Note: {item.notes}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < selectedOrder.items.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">Total:</Typography>
                      <Typography variant="h6" color="primary">
                        ETB {(selectedOrder.totalAmount * 55).toFixed(0)} (${selectedOrder.totalAmount.toFixed(2)})
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Notes */}
              {selectedOrder.notes && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Notes</Typography>
                      <Typography>{selectedOrder.notes}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {selectedOrder && getNextStatus(selectedOrder.status) && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                handleUpdateOrderStatus(selectedOrder.id, getNextStatus(selectedOrder.status)!);
                setViewOrderDialog(false);
              }}
            >
              Mark as {getNextStatus(selectedOrder.status)?.replace('_', ' ')}
            </Button>
          )}
          <Button onClick={() => setViewOrderDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderManagement;
