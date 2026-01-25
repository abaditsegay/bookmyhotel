import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
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
  Tooltip,
  Switch,
  FormControlLabel,
  TablePagination,
  Card,
  CardContent
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../contexts/AuthContext';
import { shopApiService } from '../../services/shopApi';
import { formatCurrencyWithDecimals } from '../../utils/currencyUtils';
import { Product, ProductCreateRequest, ProductCategory } from '../../types/shop';
import { translateProducts } from '../../utils/productTranslation';
import { TableRowSkeleton } from '../common/SkeletonLoaders';
import { NoProducts } from '../common/EmptyState';
import { useTableSort } from '../../hooks/useTableSort';
import { SortableTableCell } from '../common/SortableTableCell';
import { useCsvExport } from '../../hooks/useCsvExport';

const ProductManagement: React.FC = () => {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const { exportToCsv } = useCsvExport({ filename: 'products' });
  const [products, setProducts] = useState<Product[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [selectedViewProduct, setSelectedViewProduct] = useState<Product | null>(null);
  
  // Pagination state - matching FrontDesk Rooms tab style
  const [page, setPage] = useState(0); // 0-indexed for TablePagination
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  
  // Refresh trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [formData, setFormData] = useState<ProductCreateRequest>({
    name: '',
    description: '',
    sku: '',
    category: ProductCategory.OTHER,
    price: 0,
    costPrice: 0,
    stockQuantity: 0,
    minimumStockLevel: 5,
    maximumStockLevel: 100,
    weightGrams: 0,
    imageUrl: '',
    notes: ''
  });

  // Get hotel ID from the authenticated user
  const hotelId = user?.hotelId ? parseInt(user.hotelId) : null;

  // Translate products for display
  const translatedProducts = translateProducts(products, t);
  
  // Apply sorting to translated products
  const { sortedItems: sortedProducts, requestSort, getSortDirection } = useTableSort(
    translatedProducts,
    'name',
    'asc'
  );

  useEffect(() => {
    // Skip loading if no hotel ID
    if (!hotelId) {
      setLoading(false);
      return;
    }
    
    const loadProductsDebounced = async () => {
      try {
        setLoading(true);
        
        // Configure shop API service with authentication
        if (token) {
          shopApiService.setToken(token);
        }
        if (user?.tenantId) {
          shopApiService.setTenantId(user.tenantId);
        }
        
        const data = await shopApiService.getProducts(hotelId, {
          page: page, // Already 0-indexed for API
          size: rowsPerPage,
          search: searchTerm.trim() || undefined,
          category: categoryFilter !== 'ALL' ? categoryFilter : undefined
        });
        
        console.log('🛍️ Products API Response:', {
          page,
          size: rowsPerPage,
          totalReceived: data.content.length,
          totalElements: data.totalElements,
          productIds: data.content.map(p => p.id),
          hasDuplicateIds: data.content.length !== new Set(data.content.map(p => p.id)).size
        });
        
        setProducts(data.content);
        setTotalElements(data.totalElements);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    // Debounce search term changes
    const debounceTimer = setTimeout(loadProductsDebounced, searchTerm ? 300 : 0);
    return () => clearTimeout(debounceTimer);
  }, [hotelId, page, rowsPerPage, searchTerm, categoryFilter, refreshTrigger, token, user?.tenantId]);

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  // Early return if no hotel ID is available (after all hooks)
  if (!hotelId) {
    return (
      <Box p={2}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Unable to determine hotel ID for the current user. Please ensure you are logged in as a hotel staff member.
        </Alert>
        <Alert severity="info" sx={{ mb: 2 }}>
          Current user: {user?.email} | Hotel ID: {user?.hotelId || 'Not assigned'}
        </Alert>
      </Box>
    );
  }

  const handleCreateProduct = async () => {
    if (!hotelId) {
      // console.error('Cannot create product: No hotel ID available');
      return;
    }

    try {
      await shopApiService.createProduct(hotelId, formData);
      enqueueSnackbar(t('shop.products.productCreated'), { variant: 'success' });
      setOpenDialog(false);
      resetForm();
      triggerRefresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct || !hotelId) {
      // console.error('Cannot update product: Missing product or hotel ID');
      return;
    }
    
    try {
      await shopApiService.updateProduct(hotelId, editingProduct.id, formData);
      enqueueSnackbar(t('shop.products.productUpdated'), { variant: 'success' });
      setOpenDialog(false);
      setEditingProduct(null);
      resetForm();
      triggerRefresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete || !hotelId) {
      // console.error('Cannot delete product: Missing product or hotel ID');
      return;
    }
    
    try {
      await shopApiService.deleteProduct(hotelId, productToDelete.id);
      enqueueSnackbar(t('shop.products.productDeleted'), { variant: 'success' });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      triggerRefresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleToggleStatus = async (product: Product, field: 'isActive' | 'isAvailable') => {
    if (!hotelId) {
      // console.error('Cannot toggle status: No hotel ID available');
      return;
    }

    try {
      if (field === 'isActive') {
        await shopApiService.toggleProductActive(hotelId, product.id);
      } else if (field === 'isAvailable') {
        await shopApiService.toggleProductAvailable(hotelId, product.id);
      }
      triggerRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to update product ${field}`);
    }
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when changing page size
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  const handleCategoryChange = (event: any) => {
    setCategoryFilter(event.target.value as string);
    setPage(0); // Reset to first page when changing category
  };

  const handleExportToCsv = () => {
    if (sortedProducts.length === 0) {
      enqueueSnackbar(t('shop.products.noDataToExport'), { variant: 'info' });
      return;
    }

    const headers = [
      t('shop.products.table.name'),
      t('shop.products.form.category'),
      t('shop.products.table.price'),
      t('shop.products.table.stock'),
      t('shop.products.form.minimumStockLevel'),
      t('shop.products.form.sku'),
      t('shop.products.form.description'),
      t('shop.products.table.status')
    ];

    exportToCsv(sortedProducts, headers, (product) => [
      product.name,
      t(`categoryNames.${product.category}`),
      formatCurrencyWithDecimals(product.price),
      product.stockQuantity.toString(),
      product.minimumStockLevel.toString(),
      product.sku,
      product.description || '',
      product.isAvailable ? t('common.available') : t('common.unavailable')
    ]);

    enqueueSnackbar(t('shop.products.exportSuccess'), { variant: 'success' });
  };

  const openCreateDialog = () => {
    resetForm();
    setEditingProduct(null);
    setOpenDialog(true);
  };

  const openEditDialog = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      sku: product.sku,
      category: product.category,
      price: product.price,
      costPrice: product.costPrice || 0,
      stockQuantity: product.stockQuantity,
      minimumStockLevel: product.minimumStockLevel,
      maximumStockLevel: product.maximumStockLevel,
      weightGrams: product.weightGrams || 0,
      imageUrl: product.imageUrl || '',
      notes: product.notes || ''
    });
    setEditingProduct(product);
    setOpenDialog(true);
  };

  const handleViewDetails = (product: Product) => {
    setSelectedViewProduct(product);
    setViewDetailsDialogOpen(true);
  };

  const closeViewDetailsDialog = () => {
    setViewDetailsDialogOpen(false);
    setSelectedViewProduct(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      sku: '',
      category: ProductCategory.OTHER,
      price: 0,
      costPrice: 0,
      stockQuantity: 0,
      minimumStockLevel: 5,
      maximumStockLevel: 100,
      weightGrams: 0,
      imageUrl: '',
      notes: ''
    });
  };

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

  const getStockStatusIcon = (product: Product) => {
    if (product.stockQuantity <= product.minimumStockLevel) {
      return <WarningIcon color="error" />;
    }
    return <CheckCircleIcon color="success" />;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportToCsv}
          disabled={sortedProducts.length === 0}
        >
          {t('common.exportCsv')}
        </Button>
        <Button
          variant="contained"
          onClick={openCreateDialog}
        >
          {t('shop.products.addProduct')}
        </Button>
      </Box>

      {/* Filters - matching FrontDesk style */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          label={t('shop.products.searchPlaceholder')}
          value={searchTerm}
          onChange={handleSearchChange}
          size="small"
          sx={{ minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t('shop.products.form.category')}</InputLabel>
          <Select
            value={categoryFilter}
            label={t('shop.products.form.category')}
            onChange={handleCategoryChange}
          >
            <MenuItem value="ALL">{t('shop.products.categories.all')}</MenuItem>
            {Object.values(ProductCategory).map((category) => (
              <MenuItem key={category} value={category}>
                {t(`categoryNames.${category}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Products Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                background: 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)',
                boxShadow: '0 4px 12px rgba(100, 116, 139, 0.15)',
                '& .MuiTableCell-head': {
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  border: 'none',
                  padding: '20px 16px',
                  position: 'relative',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.6) 100%)'
                  }
                }
              }}
            >
              <SortableTableCell
                label={t('shop.products.table.name')}
                sortKey="name"
                active={getSortDirection('name') !== undefined}
                direction={getSortDirection('name')}
                onSort={() => requestSort('name')}
              />
              <SortableTableCell
                label={t('shop.products.form.category')}
                sortKey="category"
                active={getSortDirection('category') !== undefined}
                direction={getSortDirection('category')}
                onSort={() => requestSort('category')}
              />
              <SortableTableCell
                label={t('shop.products.table.price')}
                sortKey="price"
                active={getSortDirection('price') !== undefined}
                direction={getSortDirection('price')}
                onSort={() => requestSort('price')}
              />
              <SortableTableCell
                label={t('shop.products.table.stock')}
                sortKey="stockQuantity"
                active={getSortDirection('stockQuantity') !== undefined}
                direction={getSortDirection('stockQuantity')}
                onSort={() => requestSort('stockQuantity')}
              />
              <TableCell>{t('shop.products.table.status')}</TableCell>
              <TableCell align="center">{t('shop.products.table.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              // Show skeleton loaders while loading
              Array.from({ length: rowsPerPage }).map((_, index) => (
                <TableRowSkeleton key={index} columns={6} />
              ))
            ) : sortedProducts.length === 0 ? (
              // Show empty state when no products
              <TableRow>
                <TableCell colSpan={6}>
                  <NoProducts onCreate={openCreateDialog} />
                </TableCell>
              </TableRow>
            ) : (
              sortedProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2">{product.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      SKU: {product.sku}
                    </Typography>
                    {product.description && (
                      <Typography variant="caption" color="text.secondary">
                        {product.description.length > 50 
                          ? `${product.description.substring(0, 50)}...` 
                          : product.description}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={t(`categoryNames.${product.category}`)}
                    color={getCategoryColor(product.category)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">
                    {formatCurrencyWithDecimals(product.price || 0)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStockStatusIcon(product)}
                    <Box>
                      <Typography variant="subtitle2">
                        {product.stockQuantity} units
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Min: {product.minimumStockLevel}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={product.isActive}
                          onChange={() => handleToggleStatus(product, 'isActive')}
                          size="small"
                        />
                      }
                      label={t('shop.products.form.active')}
                      componentsProps={{ typography: { variant: 'caption' } }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={product.isAvailable}
                          onChange={() => handleToggleStatus(product, 'isAvailable')}
                          size="small"
                        />
                      }
                      label={t('shop.products.form.availability')}
                      componentsProps={{ typography: { variant: 'caption' } }}
                    />
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title={t('shop.products.viewDetails')}>
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(product)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('shop.products.editProduct')}>
                    <IconButton
                      size="small"
                      onClick={() => openEditDialog(product)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('shop.products.deleteProduct')}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteProduct(product)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalElements}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct ? t('shop.products.editProduct') : t('shop.products.addProduct')}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('shop.products.form.name')}
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('shop.products.form.sku')}
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('shop.products.form.description')}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>{t('shop.products.form.category')}</InputLabel>
                <Select
                  value={formData.category}
                  label={t('shop.products.form.category')}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ProductCategory }))}
                >
                  {Object.values(ProductCategory).map((category) => (
                    <MenuItem key={category} value={category}>
                      {t(`categoryNames.${category}`)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('shop.products.form.price')}
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">ETB</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('shop.products.form.costPrice')}
                type="number"
                value={formData.costPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, costPrice: parseFloat(e.target.value) || 0 }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">ETB</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('shop.products.form.stock')}
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) || 0 }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('shop.products.form.minimumStockLevel')}
                type="number"
                value={formData.minimumStockLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, minimumStockLevel: parseInt(e.target.value) || 0 }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('shop.products.form.maximumStockLevel')}
                type="number"
                value={formData.maximumStockLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, maximumStockLevel: parseInt(e.target.value) || 0 }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('shop.products.form.weightGrams')}
                type="number"
                value={formData.weightGrams}
                onChange={(e) => setFormData(prev => ({ ...prev, weightGrams: parseInt(e.target.value) || 0 }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('shop.products.form.imageUrl')}
                value={formData.imageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('shop.products.form.notes')}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>{t('common.cancel')}</Button>
          <Button
            onClick={editingProduct ? handleUpdateProduct : handleCreateProduct}
            variant="contained"
          >
            {editingProduct ? t('common.save') : t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('shop.products.deleteProduct')}</DialogTitle>
        <DialogContent>
          {productToDelete && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                {t('shop.products.confirmDelete')}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Product:</strong> {productToDelete.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>SKU:</strong> {productToDelete.sku}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Category:</strong> {productToDelete.category.replace('_', ' ')}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Price:</strong> {formatCurrencyWithDecimals(productToDelete.price || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Stock:</strong> {productToDelete.stockQuantity} units
              </Typography>
              <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                This action cannot be undone.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={confirmDeleteProduct} variant="contained" color="error">
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsDialogOpen} onClose={closeViewDetailsDialog} maxWidth="md" fullWidth>
        <DialogTitle>{t('shop.products.viewDetails')}</DialogTitle>
        <DialogContent>
          {selectedViewProduct && (
            <Grid container spacing={3}>
              {/* Product Image */}
              {selectedViewProduct.imageUrl && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Box
                        component="img"
                        src={selectedViewProduct.imageUrl}
                        alt={selectedViewProduct.name}
                        sx={{
                          width: '100%',
                          maxHeight: 300,
                          objectFit: 'contain',
                          borderRadius: 1
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              )}
              
              {/* Basic Information */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Basic Information</Typography>
                    <Box sx={{ '& > *': { mb: 0.5 } }}>
                      <Typography><strong>{t('shop.products.form.name')}:</strong> {selectedViewProduct.name}</Typography>
                      <Typography><strong>{t('shop.products.form.sku')}:</strong> {selectedViewProduct.sku}</Typography>
                      <Typography><strong>{t('shop.products.form.category')}:</strong> {t(`categoryNames.${selectedViewProduct.category}`)}</Typography>
                      {selectedViewProduct.description && (
                        <Typography><strong>{t('shop.products.form.description')}:</strong> {selectedViewProduct.description}</Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Pricing Information */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Pricing Information</Typography>
                    <Box sx={{ '& > *': { mb: 0.5 } }}>
                      <Typography><strong>{t('shop.products.form.price')}:</strong> {formatCurrencyWithDecimals(selectedViewProduct.price || 0)}</Typography>
                      <Typography><strong>{t('shop.products.form.costPrice')}:</strong> {formatCurrencyWithDecimals(selectedViewProduct.costPrice || 0)}</Typography>
                      <Typography>
                        <strong>Profit Margin:</strong>{' '}
                        {selectedViewProduct.price && selectedViewProduct.costPrice
                          ? `${(((selectedViewProduct.price - selectedViewProduct.costPrice) / selectedViewProduct.price) * 100).toFixed(1)}%`
                          : t('common.notAvailable')}
                      </Typography>
                      {selectedViewProduct.weightGrams && (
                        <Typography><strong>{t('shop.products.form.weight')}:</strong> {selectedViewProduct.weightGrams}g</Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Stock Information */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Stock Information</Typography>
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={selectedViewProduct.stockQuantity > selectedViewProduct.minimumStockLevel ? t('shop.products.status.inStock') : t('shop.products.status.lowStock')}
                        color={selectedViewProduct.stockQuantity > selectedViewProduct.minimumStockLevel ? 'success' : 'warning'}
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={selectedViewProduct.isAvailable ? t('shop.products.status.available') : t('shop.products.status.unavailable')}
                        color={selectedViewProduct.isAvailable ? 'success' : 'default'}
                      />
                    </Box>
                    <Box sx={{ '& > *': { mb: 0.5 } }}>
                      <Typography><strong>{t('shop.products.form.stockQuantity')}:</strong> {selectedViewProduct.stockQuantity} {t('common.units')}</Typography>
                      <Typography><strong>{t('shop.products.form.minimumStock')}:</strong> {selectedViewProduct.minimumStockLevel} {t('common.units')}</Typography>
                      <Typography><strong>{t('shop.products.form.maximumStock')}:</strong> {selectedViewProduct.maximumStockLevel} {t('common.units')}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Availability Status */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Product Status</Typography>
                    <Box sx={{ '& > *': { mb: 0.5 } }}>
                      <Typography>
                        <strong>Availability:</strong>{' '}
                        {selectedViewProduct.isAvailable ? (
                          <Chip label={t('shop.products.status.available')} color="success" size="small" />
                        ) : (
                          <Chip label={t('shop.products.status.unavailable')} color="default" size="small" />
                        )}
                      </Typography>
                      <Typography>
                        <strong>Stock Level:</strong>{' '}
                        {getStockStatusIcon(selectedViewProduct)}{' '}
                        {selectedViewProduct.stockQuantity <= selectedViewProduct.minimumStockLevel
                          ? 'Low Stock - Reorder Needed'
                          : 'Adequate Stock'}
                      </Typography>
                      <Typography>
                        <strong>Stock Value:</strong> {formatCurrencyWithDecimals((selectedViewProduct.costPrice || 0) * selectedViewProduct.stockQuantity)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Notes */}
              {selectedViewProduct.notes && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Notes</Typography>
                      <Typography>{selectedViewProduct.notes}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeViewDetailsDialog}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductManagement;
