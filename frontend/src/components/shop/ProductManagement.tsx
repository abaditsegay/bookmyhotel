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
  TablePagination
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { shopApiService } from '../../services/shopApi';
import { Product, ProductCreateRequest, ProductCategory } from '../../types/shop';
import { translateProducts } from '../../utils/productTranslation';

const ProductManagement: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
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

  // Get hotel ID from context (adjust based on your auth context)
  const hotelId = 1;

  useEffect(() => {
    const loadProductsDebounced = async () => {
      try {
        setLoading(true);
        const data = await shopApiService.getProducts(hotelId, {
          page: page, // Already 0-indexed for API
          size: rowsPerPage,
          search: searchTerm.trim() || undefined,
          category: categoryFilter !== 'ALL' ? categoryFilter : undefined
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
  }, [hotelId, page, rowsPerPage, searchTerm, categoryFilter, refreshTrigger]);

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  const handleCreateProduct = async () => {
    try {
      await shopApiService.createProduct(hotelId, formData);
      setOpenDialog(false);
      resetForm();
      triggerRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    
    try {
      await shopApiService.updateProduct(hotelId, editingProduct.id, formData);
      setOpenDialog(false);
      setEditingProduct(null);
      resetForm();
      triggerRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      await shopApiService.deleteProduct(hotelId, productToDelete.id);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      triggerRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  const handleToggleStatus = async (product: Product, field: 'isActive' | 'isAvailable') => {
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

  // Translate products for display
  const translatedProducts = translateProducts(products, t);

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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
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
            <TableRow>
              <TableCell>{t('shop.products.table.name')}</TableCell>
              <TableCell>{t('shop.products.form.category')}</TableCell>
              <TableCell>{t('shop.products.table.price')}</TableCell>
              <TableCell>{t('shop.products.table.stock')}</TableCell>
              <TableCell>{t('shop.products.table.status')}</TableCell>
              <TableCell align="center">{t('shop.products.table.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {translatedProducts.map((product) => (
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
                    ETB {(product.price * 55).toFixed(0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ${product.price.toFixed(2)}
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
                      label="Active"
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
            ))}
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
                label="SKU"
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
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cost Price (USD)"
                type="number"
                value={formData.costPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, costPrice: parseFloat(e.target.value) || 0 }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
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
                label="Minimum Stock Level"
                type="number"
                value={formData.minimumStockLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, minimumStockLevel: parseInt(e.target.value) || 0 }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Maximum Stock Level"
                type="number"
                value={formData.maximumStockLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, maximumStockLevel: parseInt(e.target.value) || 0 }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Weight (grams)"
                type="number"
                value={formData.weightGrams}
                onChange={(e) => setFormData(prev => ({ ...prev, weightGrams: parseInt(e.target.value) || 0 }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL"
                value={formData.imageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
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
                <strong>Price:</strong> ETB {(productToDelete.price * 55).toFixed(0)} (${productToDelete.price.toFixed(2)})
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
    </Box>
  );
};

export default ProductManagement;
