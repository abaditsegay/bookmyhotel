import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  TextField,
  InputAdornment,
  TablePagination,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { shopApiService } from '../../services/shopApi';
import { Product } from '../../types/shop';
import { translateProducts } from '../../utils/productTranslation';
import { getPremiumTableHeadSx } from './premiumStyles';

const LowStockProducts: React.FC = () => {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);

  // Get hotel ID from authenticated user
  const hotelId = user?.hotelId ? parseInt(user.hotelId) : null;

  const loadLowStockProducts = React.useCallback(async () => {
    if (!hotelId || !token) {
      // console.error('Cannot load low stock products: No hotel ID or token available');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Configure shop API service with authentication
      shopApiService.setToken(token);
      if (user?.tenantId) {
        shopApiService.setTenantId(user.tenantId);
      }

      // console.info(`Loading low stock products for hotel ${hotelId}...`);
      const response = await shopApiService.getLowStockProducts(hotelId, page, size);
      
      // Translate products
      const translatedProducts = translateProducts(response.content || [], t);
      
      setProducts(translatedProducts);
      setTotalElements(response.totalElements || 0);
      // console.info('Low stock products loaded successfully:', translatedProducts.length);
    } catch (err) {
      // console.error('Low stock products loading error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load low stock products');
    } finally {
      setLoading(false);
    }
  }, [hotelId, token, user?.tenantId, page, size, t]);

  useEffect(() => {
    if (hotelId) {
      loadLowStockProducts();
    } else {
      setLoading(false);
    }
  }, [hotelId, loadLowStockProducts]);

  // Filter products based on search term
  const filteredProducts = products.filter(product => {
    if (!searchTerm) return true;
    return (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSize(parseInt(event.target.value, 10));
    setPage(0);
  };



  const getStockLevelColor = (stockQuantity: number, minimumStockLevel: number) => {
    if (stockQuantity === 0) return 'error';
    if (stockQuantity <= minimumStockLevel) return 'warning';
    return 'success';
  };

  if (!hotelId) {
    return (
      <Box p={2}>
        <Alert severity="error">
          Unable to determine hotel ID for the current user.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          {t('shop.lowStock.title')} ({filteredProducts.length})
        </Typography>
        <Box display="flex" gap={1} alignItems="center">
          <Typography variant="caption" color="text.secondary">
            {t('shop.lowStock.subtitle')}
          </Typography>
          <Tooltip title={t('shop.lowStock.refresh')}>
            <IconButton onClick={loadLowStockProducts} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search */}
      <Box mb={2}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search products by name, SKU, or category..."
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
      </Box>

      {/* Products Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={getPremiumTableHeadSx({ compact: true })}>
              <TableCell>{t('shop.lowStock.table.product')}</TableCell>
              <TableCell>{t('shop.lowStock.table.category')}</TableCell>
              <TableCell>{t('shop.lowStock.table.sku')}</TableCell>
              <TableCell align="center">{t('shop.lowStock.table.currentStock')}</TableCell>
              <TableCell align="center">{t('shop.lowStock.table.minStock')}</TableCell>
              <TableCell align="center">{t('shop.lowStock.table.reorderQty')}</TableCell>
              <TableCell align="center">{t('shop.lowStock.table.status')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary" sx={{ py: 4 }}>
                    {searchTerm 
                      ? t('shop.lowStock.noSearchResults')
                      : t('shop.lowStock.noProducts')
                    }
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => {
                const reorderQuantity = Math.max(
                  product.minimumStockLevel * 2 - product.stockQuantity,
                  product.minimumStockLevel
                );
                
                return (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {product.name}
                      </Typography>
                      {product.description && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {product.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={product.category} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {product.sku || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={product.stockQuantity}
                        size="small"
                        color={getStockLevelColor(product.stockQuantity, product.minimumStockLevel)}
                        variant={product.stockQuantity === 0 ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {product.minimumStockLevel}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography 
                        variant="body2" 
                        color="primary"
                        fontWeight="medium"
                      >
                        {reorderQuantity}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {product.stockQuantity === 0 ? (
                        <Chip 
                          label={t('shop.products.status.outOfStock')} 
                          color="error" 
                          size="small" 
                        />
                      ) : (
                        <Chip 
                          label={t('shop.products.status.lowStock')} 
                          color="warning" 
                          size="small" 
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {filteredProducts.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={totalElements}
          rowsPerPage={size}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelRowsPerPage="Rows per page:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} of ${count !== -1 ? count : to}`
          }
        />
      )}
    </Box>
  );
};

export default LowStockProducts;