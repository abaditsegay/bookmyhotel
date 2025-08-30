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
  List,
  ListItem,
  ListItemText,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as ViewIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { shopApiService } from '../../services/shopApi';
import { ShopOrder, ShopOrderStatus, PaymentMethod, DeliveryType, ShopOrderUtils } from '../../types/shop';

const OrderManagement: React.FC = () => {
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
                         ShopOrderUtils.getDisplayCustomerName(order).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.roomNumber && order.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: ShopOrderStatus) => {
    switch (status) {
      case ShopOrderStatus.PENDING: return 'warning';
      case ShopOrderStatus.CONFIRMED: return 'info';
      case ShopOrderStatus.PREPARING: return 'secondary';
      case ShopOrderStatus.READY: return 'primary';
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
      default: return null; // No further transitions for COMPLETED/CANCELLED orders
    }
  };

  const isOrderPaid = (status: ShopOrderStatus): boolean => {
    return status === ShopOrderStatus.CONFIRMED || 
           status === ShopOrderStatus.PREPARING || 
           status === ShopOrderStatus.READY || 
           status === ShopOrderStatus.COMPLETED;
  };

  return (
    <Box>
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
                    <TableCell>
                  <Box>
                    <Typography variant="subtitle2">{ShopOrderUtils.getDisplayCustomerName(order)}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {ShopOrderUtils.getOrderTypeDescription(order)}
                    </Typography>
                  </Box>
                </TableCell>
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
                      label={isOrderPaid(order.status) ? 'Paid' : 'Unpaid'}
                      color={isOrderPaid(order.status) ? 'success' : 'warning'}
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
                  {!isOrderPaid(order.status) && order.paymentMethod === PaymentMethod.ROOM_CHARGE && (
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
                    <Typography component="div"><strong>Name:</strong> {ShopOrderUtils.getDisplayCustomerName(selectedOrder)}</Typography>
                    <Typography component="div"><strong>Order Type:</strong> {ShopOrderUtils.getOrderTypeDescription(selectedOrder)}</Typography>
                    {selectedOrder.customerEmail && (
                      <Typography component="div"><strong>Email:</strong> {selectedOrder.customerEmail}</Typography>
                    )}
                    {selectedOrder.customerPhone && (
                      <Typography component="div"><strong>Phone:</strong> {selectedOrder.customerPhone}</Typography>
                    )}
                    {selectedOrder.roomNumber && (
                      <Typography component="div"><strong>Room:</strong> {selectedOrder.roomNumber}</Typography>
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
                    <Typography component="div"><strong>Order Date:</strong> {selectedOrder.orderDate ? format(new Date(selectedOrder.orderDate), 'MMM dd, yyyy HH:mm') : 'N/A'}</Typography>
                    <Typography component="div"><strong>Payment Method:</strong> {selectedOrder.paymentMethod?.replace('_', ' ') || 'Not Set'}</Typography>
                    <Typography component="div"><strong>Payment Status:</strong> {isOrderPaid(selectedOrder.status) ? 'Paid' : 'Unpaid'}</Typography>
                    {selectedOrder.deliveryType && (
                      <Typography component="div"><strong>Delivery:</strong> {selectedOrder.deliveryType.replace('_', ' ')}</Typography>
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
                                  <span>{item.productName}</span>
                                  <span>ETB {(item.unitPrice * item.quantity * 55).toFixed(0)}</span>
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <div style={{ fontSize: '0.875rem', lineHeight: 1.43 }}>
                                    Quantity: {item.quantity} × ETB {(item.unitPrice * 55).toFixed(0)}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', lineHeight: 1.66 }}>SKU: {item.productSku}</div>
                                  {item.notes && (
                                    <div style={{ fontSize: '0.75rem', lineHeight: 1.66, display: 'block' }}>
                                      Note: {item.notes}
                                    </div>
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
