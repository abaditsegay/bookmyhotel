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
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { shopApiService } from '../../services/shopApi';
import { Product, ShopOrderCreateRequest, PaymentMethod, DeliveryType, ProductCategory } from '../../types/shop';

interface OrderItem {
  product: Product;
  quantity: number;
  notes?: string;
}

const OrderCreation: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Order form data
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [isDelivery, setIsDelivery] = useState(false);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(DeliveryType.PICKUP);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');

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
    if (!customerName.trim()) {
      setError('Customer name is required');
      return;
    }

    if (orderItems.length === 0) {
      setError('Please add at least one item to the order');
      return;
    }

    if (paymentMethod === PaymentMethod.ROOM_CHARGE && !roomNumber.trim()) {
      setError('Room number is required for room charges');
      return;
    }

    try {
      setLoading(true);
      
      const orderRequest: ShopOrderCreateRequest = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        roomNumber: roomNumber.trim() || undefined,
        paymentMethod,
        isDelivery,
        deliveryType,
        deliveryAddress: deliveryAddress.trim() || undefined,
        notes: notes.trim() || undefined,
        items: orderItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          notes: item.notes?.trim() || undefined
        }))
      };

      const createdOrder = await shopApiService.createOrder(hotelId, orderRequest);
      
      // If payment method is ROOM_CHARGE, create room charge
      if (paymentMethod === PaymentMethod.ROOM_CHARGE && roomNumber) {
        // This would typically involve finding the reservation ID for the room
        // For now, we'll assume there's a way to get it
        console.log('Order created with room charging:', createdOrder);
      }

      navigate('/shop?tab=orders', { 
        state: { 
          message: `Order ${createdOrder.orderNumber} created successfully!`,
          orderId: createdOrder.id 
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setLoading(false);
    }
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

              {/* Customer Information */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>Customer Information</Typography>
                <TextField
                  fullWidth
                  label="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Email (Optional)"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Phone (Optional)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Room Number"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  required={paymentMethod === PaymentMethod.ROOM_CHARGE}
                  sx={{ mb: 2 }}
                />
              </Box>

              {/* Payment Method */}
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={paymentMethod}
                    label="Payment Method"
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  >
                    {Object.values(PaymentMethod).map((method) => (
                      <MenuItem key={method} value={method}>
                        {method.replace('_', ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

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
                disabled={loading || orderItems.length === 0 || !customerName.trim()}
              >
                {loading ? 'Creating Order...' : 'Create Order'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderCreation;
