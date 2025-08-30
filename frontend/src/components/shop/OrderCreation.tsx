import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Chip,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { shopApiService } from '../../services/shopApi';
import { Product, ShopOrderCreateRequest, PaymentMethod, DeliveryType, ProductCategory, ShopOrder, ShopOrderUtils } from '../../types/shop';
import ShopReceiptDialog from './ShopReceiptDialog';
import PaymentDialog from './PaymentDialog';

interface OrderItem {
  product: Product;
  quantity: number;
  notes?: string;
}

const OrderCreation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Order form data - simplified for purchase types
  const [purchaseType, setPurchaseType] = useState<'ROOM_CHARGE' | 'ANONYMOUS'>('ANONYMOUS');
  const [roomNumber, setRoomNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [isDelivery, setIsDelivery] = useState(false);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(DeliveryType.PICKUP);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Receipt dialog state
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<ShopOrder | null>(null);

  // Payment dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [completedPaymentMethod, setCompletedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);

  // Get hotel ID from context (adjust based on your auth context)
  const hotelId = 1;

  useEffect(() => {
    loadProducts();
  }, [hotelId]);

  const loadProducts = async () => {
    try {
      const data = await shopApiService.getProducts(hotelId);
      setProducts(data.content.filter(p => p.isActive && p.isAvailable && p.stockQuantity > 0));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    }
  };

  const addProductToOrder = (product: Product) => {
    const existingItem = orderItems.find(item => item.product.id === product.id);
    if (existingItem) {
      updateItemQuantity(product.id, existingItem.quantity + 1);
    } else {
      setOrderItems(prev => [...prev, { product, quantity: 1 }]);
    }
  };

  const updateItemQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    setOrderItems(prev => 
      prev.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: Math.min(newQuantity, item.product.stockQuantity) }
          : item
      )
    );
  };

  const updateItemNotes = (productId: number, newNotes: string) => {
    setOrderItems(prev => 
      prev.map(item => 
        item.product.id === productId 
          ? { ...item, notes: newNotes }
          : item
      )
    );
  };

  const removeItem = (productId: number) => {
    setOrderItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const handleCreateOrder = async () => {
    if (orderItems.length === 0) {
      setError('Cart is empty');
      return;
    }

    setLoading(true);
    try {
      const orderData: ShopOrderCreateRequest = {
        customerName: undefined, // Anonymous sale - no customer name required
        customerEmail: undefined,
        customerPhone: undefined,
        roomNumber: roomNumber.trim() || undefined,
        reservationId: undefined, // TODO: Add reservation lookup by room number if needed
        paymentMethod,
        notes: notes.trim() || undefined,
        isDelivery: deliveryType === DeliveryType.ROOM_DELIVERY,
        deliveryAddress: deliveryType === DeliveryType.ROOM_DELIVERY ? deliveryAddress.trim() || undefined : undefined,
        deliveryTime: undefined, // No delivery time selection in current UI
        deliveryType,
        items: orderItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          notes: item.notes || undefined
        }))
      };

      const createdOrderResponse = await shopApiService.createOrder(hotelId, orderData);
      
      // If payment method is ROOM_CHARGE, create room charge
      if (purchaseType === 'ROOM_CHARGE' && roomNumber) {
        // This would typically involve finding the reservation ID for the room
        // For now, we'll assume there's a way to get it
        console.log('Order created with room charging:', createdOrderResponse);
      }

      // If payment is already completed (Complete Sale), finish transaction
      if (paymentCompleted) {
        // Transaction is complete, reset form and show success
        setCreatedOrder(null);
        setOrderItems([]);
        setRoomNumber('');
        setNotes('');
        setPaymentCompleted(false);
        setCompletedPaymentMethod(null);
        setPaymentReference(null);
        
        // Show success message
        navigate('/shop?tab=orders', { 
          state: { 
            message: `Order ${createdOrderResponse.orderNumber} completed successfully!`,
            type: 'success'
          } 
        });
        return;
      }

      // For room charges, also complete immediately without receipt
      if (purchaseType === 'ROOM_CHARGE') {
        // Reset form and show success
        setCreatedOrder(null);
        setOrderItems([]);
        setRoomNumber('');
        setNotes('');
        
        // Show success message
        navigate('/shop?tab=orders', { 
          state: { 
            message: `Order ${createdOrderResponse.orderNumber} charged to room ${roomNumber} successfully!`,
            type: 'success'
          } 
        });
        return;
      }

      // For anonymous cash/card orders that need payment, show receipt
      setCreatedOrder(createdOrderResponse);
      setReceiptDialogOpen(true);
      
      // Reset payment state for next order
      setPaymentCompleted(false);
      setCompletedPaymentMethod(null);
      setPaymentReference(null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = (method: PaymentMethod, reference?: string) => {
    setCompletedPaymentMethod(method);
    setPaymentReference(reference || null);
    setPaymentCompleted(true);
    setPaymentDialogOpen(false);
    setError(null);
    
    // After payment is completed, navigate to orders page
    if (createdOrder) {
      navigate('/shop?tab=orders', { 
        state: { 
          message: `Order ${createdOrder.orderNumber} payment completed successfully!`,
          orderId: createdOrder.id 
        }
      });
    }
  };

  const handlePaymentDialogClose = () => {
    setPaymentDialogOpen(false);
    // Don't reset payment state here in case user wants to try again
  };

  const handlePaymentRequired = () => {
    console.log('handlePaymentRequired called - opening payment dialog');
    // Close receipt dialog and open payment dialog
    setReceiptDialogOpen(false);
    setPaymentDialogOpen(true);
  };

  const handleReceiptDialogClose = () => {
    setReceiptDialogOpen(false);
    setCreatedOrder(null);
    
    // Navigate to orders page after closing the receipt dialog
    if (createdOrder) {
      navigate('/shop?tab=orders', { 
        state: { 
          message: `Order ${createdOrder.orderNumber} created successfully!`,
          orderId: createdOrder.id 
        }
      });
    }
  };

  // Determine if payment is required after order creation
  const requiresPayment = () => {
    if (!createdOrder) return false;
    
    console.log('requiresPayment check:', {
      purchaseType,
      paymentMethod,
      paymentCompleted,
      createdOrder: createdOrder?.id
    });
    
    // For anonymous customers with CASH or CARD payment methods, payment is required
    if (purchaseType === 'ANONYMOUS' && 
        (paymentMethod === PaymentMethod.CASH || paymentMethod === PaymentMethod.CARD) &&
        !paymentCompleted) {
      console.log('Payment required: true');
      return true;
    }
    
    console.log('Payment required: false');
    return false;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: ProductCategory) => {
    switch (category) {
      case ProductCategory.BEVERAGES: return 'primary';
      case ProductCategory.SNACKS: return 'secondary';
      case ProductCategory.CULTURAL_CLOTHING: return 'success';
      case ProductCategory.SOUVENIRS: return 'warning';
      case ProductCategory.TOILETRIES: return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Product Selection */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Select Products</Typography>
              
              {/* Product Filters */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Search Products"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={categoryFilter}
                      label="Category"
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <MenuItem value="ALL">All Categories</MenuItem>
                      {Object.values(ProductCategory).map((category) => (
                        <MenuItem key={category} value={category}>
                          {category.replace('_', ' ')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Products Grid */}
              <Grid container spacing={2}>
                {filteredProducts.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 2 }
                      }}
                      onClick={() => addProductToOrder(product)}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" noWrap>
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          SKU: {product.sku}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Chip
                            label={product.category.replace('_', ' ')}
                            color={getCategoryColor(product.category)}
                            size="small"
                          />
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            ETB {(product.price * 55).toFixed(0)}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Stock: {product.stockQuantity}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptIcon color="primary" />
                Order Summary
              </Typography>

              {/* Purchase Type */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>Purchase Type</Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Purchase Type</InputLabel>
                  <Select
                    value={purchaseType}
                    label="Purchase Type"
                    onChange={(e) => {
                      const newPurchaseType = e.target.value as 'ROOM_CHARGE' | 'ANONYMOUS';
                      setPurchaseType(newPurchaseType);
                      // Reset room number when switching to anonymous
                      if (newPurchaseType === 'ANONYMOUS') {
                        setRoomNumber('');
                      }
                      // Reset payment method when switching to room charge
                      if (newPurchaseType === 'ROOM_CHARGE') {
                        setPaymentMethod(PaymentMethod.ROOM_CHARGE);
                      } else {
                        setPaymentMethod(PaymentMethod.CASH);
                      }
                    }}
                  >
                    <MenuItem value="ANONYMOUS">Anonymous Sale (Cash/Card)</MenuItem>
                    <MenuItem value="ROOM_CHARGE">Charge to Room</MenuItem>
                  </Select>
                </FormControl>

                {/* Room Number - only show for room charges */}
                {purchaseType === 'ROOM_CHARGE' && (
                  <TextField
                    fullWidth
                    label="Room Number"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    required
                    placeholder="Enter room number"
                    sx={{ mb: 2 }}
                  />
                )}
              </Box>

              {/* Delivery Options */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>Delivery Options</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isDelivery}
                      onChange={(e) => setIsDelivery(e.target.checked)}
                    />
                  }
                  label="Delivery Required"
                />

                {isDelivery && (
                  <Box sx={{ mt: 2 }}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Delivery Type</InputLabel>
                      <Select
                        value={deliveryType}
                        label="Delivery Type"
                        onChange={(e) => setDeliveryType(e.target.value as DeliveryType)}
                      >
                        {Object.values(DeliveryType).map((type) => (
                          <MenuItem key={type} value={type}>
                            {type.replace('_', ' ')}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label="Delivery Address"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      multiline
                      rows={2}
                    />
                  </Box>
                )}
              </Box>

              {/* Order Items */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>Order Items</Typography>
                {orderItems.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No items selected
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Item</TableCell>
                          <TableCell align="center">Qty</TableCell>
                          <TableCell align="right">Price</TableCell>
                          <TableCell align="center">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orderItems.map((item) => (
                          <TableRow key={item.product.id}>
                            <TableCell>
                              <Typography variant="body2" noWrap>
                                {item.product.name}
                              </Typography>
                              <TextField
                                fullWidth
                                placeholder="Notes..."
                                value={item.notes || ''}
                                onChange={(e) => updateItemNotes(item.product.id, e.target.value)}
                                size="small"
                                sx={{ mt: 1 }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <IconButton
                                  size="small"
                                  onClick={() => updateItemQuantity(item.product.id, item.quantity - 1)}
                                >
                                  <RemoveIcon />
                                </IconButton>
                                <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => updateItemQuantity(item.product.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.product.stockQuantity}
                                >
                                  <AddIcon />
                                </IconButton>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">
                                ETB {(item.product.price * item.quantity * 55).toFixed(0)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeItem(item.product.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>

              {/* Notes */}
              <TextField
                fullWidth
                label="Order Notes (Optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                rows={2}
                sx={{ mb: 3 }}
              />

              {/* Payment Status Indicator for Anonymous Sales */}
              {purchaseType === 'ANONYMOUS' && paymentCompleted && completedPaymentMethod && (
                <Box sx={{ mb: 2, p: 2, border: 1, borderColor: 'success.main', borderRadius: 1, bgcolor: 'success.light' }}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.dark' }}>
                    <CheckIcon fontSize="small" />
                    Payment completed via {ShopOrderUtils.formatPaymentMethod(completedPaymentMethod)}
                    {paymentReference && (
                      <Typography component="span" variant="caption" sx={{ ml: 1 }}>
                        (Ref: {paymentReference})
                      </Typography>
                    )}
                  </Typography>
                </Box>
              )}

              {/* Total */}
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary">
                  ETB {(calculateTotal() * 55).toFixed(0)}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block', mb: 2 }}>
                (${calculateTotal().toFixed(2)} USD)
              </Typography>

              {/* Create Order Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleCreateOrder}
                disabled={loading || orderItems.length === 0}
              >
                {loading 
                  ? 'Processing...' 
                  : purchaseType === 'ROOM_CHARGE' 
                    ? `Charge to Room ${roomNumber || ''}` 
                    : paymentCompleted
                      ? 'Complete Sale'
                      : 'Proceed to Payment'
                }
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Shop Receipt Dialog */}
      <ShopReceiptDialog
        open={receiptDialogOpen}
        onClose={handleReceiptDialogClose}
        order={createdOrder}
        hotelName={createdOrder?.hotelName || user?.hotelName}
        hotelAddress={createdOrder?.hotelAddress || ""} // Hotel address from order
        hotelTaxId={createdOrder?.hotelTaxId || ""} // Hotel tax ID from order
        frontDeskPerson={user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : undefined}
        onOrderAdded={() => {
          // This will be called when the dialog is closed to refresh order list
          // The navigation will happen in handleReceiptDialogClose
        }}
        onPaymentRequired={handlePaymentRequired}
        requiresPayment={requiresPayment()}
      />

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onClose={handlePaymentDialogClose}
        onPaymentComplete={handlePaymentComplete}
        totalAmount={calculateTotal()}
        selectedPaymentMethod={paymentMethod}
      />
    </Box>
  );
};

export default OrderCreation;
