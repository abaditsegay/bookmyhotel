import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Chip,
  Divider,
  Switch,
  FormControlLabel,
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
import { useTranslation } from 'react-i18next';
import PremiumTextField from '../common/PremiumTextField';
import { useAuth } from '../../contexts/AuthContext';
import { shopApiService } from '../../services/shopApi';
import { Product, ShopOrderCreateRequest, PaymentMethod, DeliveryType, ProductCategory, ShopOrder, ShopOrderUtils } from '../../types/shop';
import ShopReceiptDialog from './ShopReceiptDialog';
import PaymentDialog from './PaymentDialog';
import { formatCurrencyWithDecimals } from '../../utils/currencyUtils';
import { COLORS, addAlpha } from '../../theme/themeColors';
import { buildApiUrl } from '../../config/apiConfig';
import { getPremiumTableHeadSx } from './premiumStyles';

interface OrderItem {
  product: Product;
  quantity: number;
}

interface OrderCreationProps {
  onOrderComplete?: () => Promise<void>;
}

const OrderCreation: React.FC<OrderCreationProps> = ({ onOrderComplete }) => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { t } = useTranslation();
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
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  // Receipt dialog state
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<ShopOrder | null>(null);

  // Payment dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [completedPaymentMethod, setCompletedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [vatRate, setVatRate] = useState(0);
  const [serviceTaxRate, setServiceTaxRate] = useState(0);
  const [cityTaxRate, setCityTaxRate] = useState(0);

  // Get hotel ID from context (adjust based on your auth context)
  const hotelId = user?.hotelId ? parseInt(user.hotelId) : null; // No fallback - should be from user context

  const showError = (message: string) => {
    setError(message);
    setErrorDialogOpen(true);
  };

  useEffect(() => {
    if (!hotelId) {
      showError('Hotel ID not available. Please ensure you are logged in as a hotel user.');
      return;
    }
    
    const loadData = async () => {
      try {
        // Configure shop API service with authentication
        if (token) {
          shopApiService.setToken(token);
        }
        if (user?.tenantId) {
          shopApiService.setTenantId(user.tenantId);
        }
        
        const data = await shopApiService.getProducts(hotelId);
        setProducts(data.content.filter(p => p.isActive)); // Only filter by isActive, keep all stock levels
        setError(null);
      } catch (err) {
        showError(err instanceof Error ? err.message : t('shop.orders.creation.failedToLoadProducts'));
      }
    };
    
    loadData();
  }, [hotelId, token, user?.tenantId, t]);

  useEffect(() => {
    if (!hotelId) {
      return;
    }

    const loadTaxRates = async () => {
      try {
        const response = await fetch(buildApiUrl(`/hotels/${hotelId}/tax-rate`), {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (response.ok) {
          const data = await response.json();
          setVatRate(data.vatRate || 0);
          setServiceTaxRate(data.serviceTaxRate || 0);
          setCityTaxRate(data.cityTaxRate || 0);
        } else {
          setVatRate(0);
          setServiceTaxRate(0);
          setCityTaxRate(0);
        }
      } catch (error) {
        setVatRate(0);
        setServiceTaxRate(0);
        setCityTaxRate(0);
      }
    };

    loadTaxRates();
  }, [hotelId, token]);

  const addProductToOrder = (product: Product) => {
    // Prevent adding out-of-stock products
    if (product.stockQuantity === 0) {
      showError(t('shop.products.messages.outOfStockError', { productName: product.name }));
      return;
    }

    const existingItem = orderItems.find(item => item.product.id === product.id);
    // Only add if not already in the order - quantity adjustment done via +/- buttons in order summary
    if (!existingItem) {
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

  const removeItem = (productId: number) => {
    setOrderItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const roundCurrency = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

  const getSubtotal = () => roundCurrency(calculateTotal());

  const getVatAmount = () => roundCurrency(getSubtotal() * vatRate);

  const getServiceTaxAmount = () => roundCurrency(getSubtotal() * serviceTaxRate);

  const getCityTaxAmount = () => roundCurrency(getSubtotal() * cityTaxRate);

  const getTotalTax = () => roundCurrency(getVatAmount() + getServiceTaxAmount() + getCityTaxAmount());

  const getGrandTotal = () => roundCurrency(getSubtotal() + getTotalTax());

  const handleCreateOrder = async () => {
    if (orderItems.length === 0) {
      showError(t('shop.orders.creation.cartIsEmpty'));
      return;
    }
    
    if (!hotelId) {
      showError('Hotel ID not available. Please ensure you are logged in as a hotel user.');
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
        isDelivery: deliveryType === DeliveryType.ROOM_DELIVERY,
        deliveryAddress: deliveryType === DeliveryType.ROOM_DELIVERY ? deliveryAddress.trim() || undefined : undefined,
        deliveryTime: undefined, // No delivery time selection in current UI
        deliveryType,
        items: orderItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      };

      const createdOrderResponse = await shopApiService.createOrder(hotelId, orderData);
      
      // If payment method is ROOM_CHARGE, create room charge
      if (purchaseType === 'ROOM_CHARGE' && roomNumber) {
        // This would typically involve finding the reservation ID for the room
        // For now, we'll assume there's a way to get it
        // console.log('Order created with room charging:', createdOrderResponse);
      }

      // For room charges, complete immediately without receipt
      if (purchaseType === 'ROOM_CHARGE') {
        // Reset form and show success
        setCreatedOrder(null);
        setOrderItems([]);
        setRoomNumber('');
        
        // Refresh dashboard stats after room charge completion
        if (onOrderComplete) {
          try {
            await onOrderComplete();
            // console.log('Dashboard stats refreshed after room charge completion');
          } catch (error) {
            // console.error('Error refreshing dashboard stats:', error);
          }
        }
        
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
      showError(err instanceof Error ? err.message : t('shop.orders.creation.failedToCreateOrder'));
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = async (method: PaymentMethod, reference?: string) => {
    setCompletedPaymentMethod(method);
    setPaymentReference(reference || null);
    setPaymentSuccess(true); // Show success dialog first
    setError(null);
    
    // Delay the order completion to allow success dialog to show
    setTimeout(async () => {
      await completeOrderAfterPayment(method);
    }, 2000); // 2 second delay to show success
  };

  const completeOrderAfterPayment = async (method: PaymentMethod) => {
    setPaymentCompleted(true);
    setPaymentDialogOpen(false);
    setPaymentSuccess(false);
    
    // Automatically complete the sale after successful payment
    if (createdOrder) {
      try {
        // Transaction is complete, reset form and show success
        const orderNumber = createdOrder.orderNumber;
        const orderId = createdOrder.id;
        
        // Reset form state
        setCreatedOrder(null);
        setOrderItems([]);
        setRoomNumber('');
        setPaymentCompleted(false);
        setCompletedPaymentMethod(null);
        setPaymentReference(null);
        setReceiptDialogOpen(false); // Close receipt dialog if open
        
        // Refresh dashboard stats after successful order completion
        if (onOrderComplete) {
          try {
            await onOrderComplete();
            // console.log('Dashboard stats refreshed after order completion');
          } catch (error) {
            // console.error('Error refreshing dashboard stats:', error);
          }
        }
        
        // Show success message and navigate to orders page
        navigate('/shop?tab=orders', { 
          state: { 
            message: `Order ${orderNumber} completed successfully! Payment processed via ${method}.`,
            type: 'success',
            orderId: orderId 
          }
        });
      } catch (error) {
        // console.error('Error completing sale after payment:', error);
        showError('Payment successful, but there was an error completing the sale. Please try again.');
      }
    } else {
      // Fallback: if no created order, just navigate with payment success message
      
      // Refresh dashboard stats after payment
      if (onOrderComplete) {
        try {
          await onOrderComplete();
          // console.log('Dashboard stats refreshed after payment completion');
        } catch (error) {
          // console.error('Error refreshing dashboard stats:', error);
        }
      }
      
      navigate('/shop?tab=orders', { 
        state: { 
          message: `Payment completed successfully via ${method}!`,
          type: 'success'
        }
      });
    }
  };

  const handlePaymentDialogClose = () => {
    setPaymentDialogOpen(false);
    setPaymentSuccess(false); // Reset success state when dialog closes
    // Don't reset payment state here in case user wants to try again
  };

  const handlePaymentRequired = () => {
    // console.log('handlePaymentRequired called - opening payment dialog');
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
    
    // console.log('requiresPayment check:', {
    //   purchaseType,
    //   paymentMethod,
    //   paymentCompleted,
    //   createdOrder: createdOrder?.id
    // });
    
    // For anonymous customers with CASH or CARD payment methods, payment is required
    if (purchaseType === 'ANONYMOUS' && 
        (paymentMethod === PaymentMethod.CASH || paymentMethod === PaymentMethod.CARD) &&
        !paymentCompleted) {
      // console.log('Payment required: true');
      return true;
    }
    
    // console.log('Payment required: false');
    return false;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (product: Product) => {
    if (product.stockQuantity === 0) {
      return 'OUT_OF_STOCK';
    } else if (product.stockQuantity <= product.minimumStockLevel) {
      return 'LOW_STOCK';
    } else {
      return 'IN_STOCK';
    }
  };

  const getStockStatusColor = (stockStatus: string) => {
    switch (stockStatus) {
      case 'OUT_OF_STOCK': return COLORS.ERROR;
      case 'LOW_STOCK': return COLORS.WARNING;
      case 'IN_STOCK': return COLORS.SUCCESS;
      default: return COLORS.TEXT_DISABLED;
    }
  };

  const getStockStatusLabel = (stockStatus: string) => {
    switch (stockStatus) {
      case 'OUT_OF_STOCK': return t('shop.products.status.outOfStock');
      case 'LOW_STOCK': return t('shop.products.status.lowStock');
      case 'IN_STOCK': return t('shop.products.status.inStock');
      default: return t('shop.products.status.unknown');
    }
  };

  return (
    <Box>
      <Dialog
        open={errorDialogOpen && Boolean(error)}
        onClose={() => setErrorDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main', fontWeight: 700 }}>
          Unable to Complete Action
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {error}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              setErrorDialogOpen(false);
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Grid container spacing={3}>
        {/* Product Selection */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Select Products</Typography>
              
              {/* Product Filters */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={8}>
                  <PremiumTextField
                    fullWidth
                    label={t('shop.orders.creation.searchProducts')}
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
                    <InputLabel>{t('shop.orders.creation.category')}</InputLabel>
                    <Select
                      value={categoryFilter}
                      label={t('shop.orders.creation.category')}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <MenuItem value="ALL">{t('shop.orders.creation.allCategories')}</MenuItem>
                      {Object.values(ProductCategory).map((category) => (
                        <MenuItem key={category} value={category}>
                          {category.replace('_', ' ')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Stock Status Legend */}
              <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {t('shop.orders.creation.stockStatus')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box 
                    sx={{ 
                      width: 12, 
                      height: 12, 
                      backgroundColor: getStockStatusColor('IN_STOCK'), 
                      borderRadius: '2px' 
                    }} 
                  />
                  <Typography variant="caption">{t('shop.orders.creation.inStock')}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box 
                    sx={{ 
                      width: 12, 
                      height: 12, 
                      backgroundColor: getStockStatusColor('LOW_STOCK'), 
                      borderRadius: '2px' 
                    }} 
                  />
                  <Typography variant="caption">{t('shop.orders.creation.lowStock')}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box 
                    sx={{ 
                      width: 12, 
                      height: 12, 
                      backgroundColor: getStockStatusColor('OUT_OF_STOCK'), 
                      borderRadius: '2px' 
                    }} 
                  />
                  <Typography variant="caption">{t('shop.orders.creation.outOfStock')}</Typography>
                </Box>
              </Box>

              {/* Products Grid */}
              <Grid container spacing={2}>
                {filteredProducts.map((product) => {
                  const orderItem = orderItems.find(item => item.product.id === product.id);
                  const isSelected = !!orderItem;
                  const selectedQuantity = orderItem?.quantity || 0;
                  const stockStatus = getStockStatus(product);
                  const stockStatusColor = getStockStatusColor(stockStatus);
                  const stockStatusLabel = getStockStatusLabel(stockStatus);
                  const isOutOfStock = stockStatus === 'OUT_OF_STOCK';
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={product.id}>
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                          position: 'relative',
                          border: isSelected ? '2px solid' : '1px solid',
                          borderColor: isSelected ? COLORS.PRIMARY : addAlpha(COLORS.PRIMARY, 0.15),
                          background: isSelected 
                            ? `linear-gradient(135deg, ${addAlpha(COLORS.PRIMARY, 0.1)} 0%, ${addAlpha(COLORS.SECONDARY, 0.08)} 100%)`
                            : isOutOfStock 
                              ? addAlpha(COLORS.BLACK, 0.04) 
                              : addAlpha(COLORS.WHITE, 0.95),
                          backdropFilter: 'blur(10px)',
                          opacity: isOutOfStock ? 0.55 : 1,
                          boxShadow: isSelected 
                            ? `0 8px 24px ${addAlpha(COLORS.PRIMARY, 0.22)}, 0 4px 8px ${addAlpha(COLORS.PRIMARY, 0.12)}`
                            : `0 2px 8px ${addAlpha(COLORS.BLACK, 0.06)}`,
                          '&:hover': { 
                            boxShadow: isOutOfStock 
                              ? `0 2px 8px ${addAlpha(COLORS.BLACK, 0.06)}` 
                              : isSelected 
                                ? `0 12px 32px ${addAlpha(COLORS.PRIMARY, 0.28)}, 0 6px 12px ${addAlpha(COLORS.PRIMARY, 0.16)}`
                                : `0 8px 24px ${addAlpha(COLORS.PRIMARY, 0.16)}`,
                            transform: isOutOfStock ? 'none' : 'translateY(-4px)',
                            borderColor: isOutOfStock ? addAlpha(COLORS.PRIMARY, 0.15) : (isSelected ? COLORS.PRIMARY : addAlpha(COLORS.PRIMARY, 0.25))
                          },
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                        onClick={() => !isOutOfStock && addProductToOrder(product)}
                      >
                        {/* Selection indicator with premium primary */}
                        {isSelected && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              background: COLORS.GRADIENT_PRIMARY,
                              color: COLORS.WHITE,
                              borderRadius: '50%',
                              width: 28,
                              height: 28,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              zIndex: 1,
                              boxShadow: `0 2px 8px ${addAlpha(COLORS.PRIMARY, 0.35)}`
                            }}
                          >
                            {selectedQuantity}
                          </Box>
                        )}

                        {/* Stock Status Badge - Premium styling */}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            backgroundColor: stockStatusColor,
                            color: COLORS.WHITE,
                            borderRadius: '16px',
                            px: 1.25,
                            py: 0.4,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.3px',
                            zIndex: 2,
                            boxShadow: `0 2px 8px ${addAlpha(COLORS.BLACK, 0.15)}`,
                            border: `1px solid ${addAlpha(COLORS.WHITE, 0.2)}`
                          }}
                        >
                          {stockStatusLabel}
                        </Box>
                        
                        <CardContent sx={{ p: 2.5, pb: 4.5 }}>
                          <Typography 
                            variant="subtitle2" 
                            noWrap
                            sx={{ 
                              fontWeight: isSelected ? 700 : 600,
                              fontSize: '0.9rem',
                              color: isSelected ? COLORS.PRIMARY : (isOutOfStock ? 'text.disabled' : 'text.primary'),
                              mb: 0.5
                            }}
                          >
                            {product.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: isOutOfStock ? 'text.disabled' : COLORS.SLATE_500, fontSize: '0.75rem' }}>
                            SKU: {product.sku}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                            <Chip
                              label={product.category.replace('_', ' ')}
                              size="small"
                              sx={{ 
                                background: `linear-gradient(135deg, ${addAlpha(COLORS.PRIMARY, 0.08)} 0%, ${addAlpha(COLORS.PRIMARY, 0.12)} 100%)`,
                                color: COLORS.PRIMARY,
                                border: `1px solid ${addAlpha(COLORS.PRIMARY, 0.2)}`,
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                letterSpacing: '0.3px',
                                opacity: isOutOfStock ? 0.6 : 1
                              }}
                            />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 700,
                                fontSize: '1rem',
                                background: isSelected 
                                  ? COLORS.GRADIENT_PRIMARY
                                  : isOutOfStock ? 'none' : COLORS.GRADIENT_PRIMARY,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: isOutOfStock ? addAlpha(COLORS.BLACK, 0.38) : 'transparent'
                              }}
                            >
                              {formatCurrencyWithDecimals(product.price || 0)}
                            </Typography>
                          </Box>
                          
                          {/* Enhanced Stock Display */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: stockStatusColor,
                                fontWeight: 'medium'
                              }}
                            >
                              {t('shop.orders.creation.stock')} {product.stockQuantity}
                            </Typography>
                            {stockStatus === 'LOW_STOCK' && (
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: stockStatusColor,
                                  fontSize: '0.65rem'
                                }}
                              >
                                {t('shop.orders.creation.min')} {product.minimumStockLevel}
                              </Typography>
                            )}
                          </Box>

                          {isSelected && (
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                display: 'block',
                                mt: 0.75,
                                color: COLORS.PRIMARY,
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                letterSpacing: '0.3px'
                              }}
                            >
                              {t('shop.orders.creation.selected')} {selectedQuantity} {selectedQuantity !== 1 ? t('shop.orders.creation.itemPlural') : t('shop.orders.creation.itemSingular')}
                            </Typography>
                          )}

                          {isOutOfStock && (
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                display: 'block',
                                mt: 0.5,
                                color: 'error.main',
                                fontWeight: 'medium',
                                fontStyle: 'italic'
                              }}
                            >
                              {t('shop.orders.creation.unavailable')}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Summary - Premium styling */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: `linear-gradient(135deg, ${addAlpha(COLORS.PRIMARY, 0.04)} 0%, ${addAlpha(COLORS.SECONDARY, 0.06)} 100%)`,
            backdropFilter: 'blur(20px)',
            border: '2px solid',
            borderColor: addAlpha(COLORS.PRIMARY, 0.22),
            boxShadow: `0 8px 32px ${addAlpha(COLORS.PRIMARY, 0.14)}, 0 4px 16px ${addAlpha(COLORS.SECONDARY, 0.12)}`,
            position: 'sticky',
            top: 16,
            '& .MuiCardContent-root': {
              backgroundColor: 'transparent'
            }
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontWeight: 700,
                color: COLORS.PRIMARY,
                letterSpacing: '-0.01em'
              }}>
                <ReceiptIcon sx={{ color: COLORS.PRIMARY }} />
                {t('shop.orders.creation.orderSummary')}
              </Typography>

              {/* Purchase Type */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>{t('shop.orders.creation.purchaseType')}</Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>{t('shop.orders.creation.purchaseType')}</InputLabel>
                  <Select
                    value={purchaseType}
                    label={t('shop.orders.creation.purchaseType')}
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
                    <MenuItem value="ANONYMOUS">{t('shop.orders.creation.anonymousSale')}</MenuItem>
                    <MenuItem value="ROOM_CHARGE">{t('shop.orders.creation.roomCharge')}</MenuItem>
                  </Select>
                </FormControl>

                {/* Room Number - only show for room charges */}
                {purchaseType === 'ROOM_CHARGE' && (
                  <PremiumTextField
                    fullWidth
                    label={t('shop.orders.creation.roomNumber')}
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    required
                    placeholder={t('shop.orders.creation.roomNumberPlaceholder')}
                    sx={{ mb: 2 }}
                  />
                )}
              </Box>

              {/* Delivery Options */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>{t('shop.orders.creation.deliveryOptions')}</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isDelivery}
                      onChange={(e) => setIsDelivery(e.target.checked)}
                    />
                  }
                  label={t('shop.orders.creation.deliveryRequired')}
                />

                {isDelivery && (
                  <Box sx={{ mt: 2 }}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>{t('shop.orders.creation.deliveryType')}</InputLabel>
                      <Select
                        value={deliveryType}
                        label={t('shop.orders.creation.deliveryType')}
                        onChange={(e) => setDeliveryType(e.target.value as DeliveryType)}
                      >
                        {Object.values(DeliveryType).map((type) => (
                          <MenuItem key={type} value={type}>
                            {type.replace('_', ' ')}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <PremiumTextField
                      fullWidth
                      label={t('shop.orders.creation.deliveryAddress')}
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
                <Typography variant="subtitle2" gutterBottom>{t('shop.orders.creation.orderItems')}</Typography>
                {orderItems.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    {t('shop.orders.creation.noItems')}
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={getPremiumTableHeadSx({ compact: true })}>
                          <TableCell>{t('shop.orders.creation.item')}</TableCell>
                          <TableCell align="center">{t('shop.orders.creation.qty')}</TableCell>
                          <TableCell align="right">{t('shop.orders.creation.price')}</TableCell>
                          <TableCell align="center">{t('shop.orders.creation.action')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orderItems.map((item) => (
                          <TableRow key={item.product.id}>
                            <TableCell>
                              <Typography variant="body2" noWrap>
                                {item.product.name}
                              </Typography>
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
                                {formatCurrencyWithDecimals((item.product.price * item.quantity) || 0)}
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

              {/* Payment Status Indicator for Anonymous Sales */}
              {purchaseType === 'ANONYMOUS' && paymentCompleted && completedPaymentMethod && (
                <Box sx={{ mb: 2, p: 2, border: 1, borderColor: 'success.main', borderRadius: 1, bgcolor: 'success.light' }}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.dark' }}>
                    <CheckIcon fontSize="small" />
                    {t('shop.orders.creation.paymentCompleted', { method: ShopOrderUtils.formatPaymentMethod(completedPaymentMethod) })}
                    {paymentReference && (
                      <Typography component="span" variant="caption" sx={{ ml: 1 }}>
                        ({t('shop.orders.creation.paymentReference', { reference: paymentReference })})
                      </Typography>
                    )}
                  </Typography>
                </Box>
              )}

              {/* Total */}
              <Divider sx={{ mb: 2, borderColor: addAlpha(COLORS.PRIMARY, 0.2) }} />
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography variant="body2" color="text.secondary">{t('shop.orders.creation.subtotal')}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrencyWithDecimals(getSubtotal())}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('shop.orders.creation.vat')} ({(vatRate * 100).toFixed(2)}%)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrencyWithDecimals(getVatAmount())}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('shop.orders.creation.serviceTax')} ({(serviceTaxRate * 100).toFixed(2)}%)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrencyWithDecimals(getServiceTaxAmount())}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('shop.orders.creation.cityTax')} ({(cityTaxRate * 100).toFixed(2)}%)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrencyWithDecimals(getCityTaxAmount())}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1, borderColor: addAlpha(COLORS.PRIMARY, 0.15) }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.TEXT_PRIMARY }}>
                    {t('shop.orders.creation.taxTotal')}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.TEXT_PRIMARY }}>
                    {formatCurrencyWithDecimals(getTotalTax())}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3,
                p: 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${addAlpha(COLORS.PRIMARY, 0.08)} 0%, ${addAlpha(COLORS.SECONDARY, 0.06)} 100%)`,
                border: `1px solid ${addAlpha(COLORS.PRIMARY, 0.2)}`
              }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.PRIMARY }}>{t('shop.orders.creation.grandTotal')}</Typography>
                <Typography 
                  variant="h5" 
                  sx={{
                    fontWeight: 800,
                    background: COLORS.GRADIENT_PRIMARY,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  {formatCurrencyWithDecimals(getGrandTotal())}
                </Typography>
              </Box>

              {/* Create Order Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleCreateOrder}
                disabled={loading || orderItems.length === 0}
                sx={{
                  background: COLORS.GRADIENT_PRIMARY,
                  color: COLORS.WHITE,
                  fontWeight: 700,
                  fontSize: '1rem',
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: `0 4px 16px ${addAlpha(COLORS.PRIMARY, 0.3)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: COLORS.GRADIENT_PRIMARY,
                    boxShadow: `0 6px 24px ${addAlpha(COLORS.PRIMARY, 0.4)}`,
                    transform: 'translateY(-2px)'
                  },
                  '&.Mui-disabled': {
                    background: COLORS.GRADIENT_PRIMARY,
                    opacity: 0.6,
                    color: COLORS.WHITE
                  }
                }}
              >
                {loading 
                  ? t('shop.orders.creation.processing')
                  : purchaseType === 'ROOM_CHARGE' 
                    ? `${t('shop.orders.creation.chargeToRoom')} ${roomNumber || ''}` 
                    : t('shop.orders.creation.createOrder')
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
        totalAmount={createdOrder ? (createdOrder.totalAmount + (createdOrder.taxAmount || 0)) : getGrandTotal()}
        selectedPaymentMethod={paymentMethod}
        showSuccess={paymentSuccess}
      />
    </Box>
  );
};

export default OrderCreation;
