import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Box,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Business as BusinessIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  adminApiService, 
  TenantDTO, 
  CreateTenantRequest, 
  UpdateTenantRequest 
} from '../../services/adminApi';

interface TenantFilters {
  search: string;
  status: string;
}

const TenantManagementAdmin: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<TenantDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState<TenantFilters>({
    search: '',
    status: '',
  });

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantDTO | null>(null);

  // Form state
  const [tenantForm, setTenantForm] = useState<CreateTenantRequest>({
    name: '',
    subdomain: '',
    description: '',
  });

  const [editForm, setEditForm] = useState<UpdateTenantRequest>({
    name: '',
    subdomain: '',
    description: '',
  });

  const statusOptions = ['ALL', 'ACTIVE', 'INACTIVE'];

  // Set token in API service when component mounts
  useEffect(() => {
    if (token) {
      adminApiService.setToken(token);
    }
  }, [token]);

  const loadTenants = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminApiService.getTenants(
        page,
        rowsPerPage,
        filters.search || undefined
      );
      
      console.log('Tenant API Response:', response);
      if (response.content) {
        setTenants(response.content);
        // Spring Boot Page object has totalElements directly on the response
        const totalCount = response.totalElements || response.page?.totalElements || response.content.length || 0;
        setTotalElements(totalCount);
        console.log('Total Elements:', totalCount, 'Response structure:', { 
          hasPage: !!response.page, 
          pageTotalElements: response.page?.totalElements,
          directTotalElements: response.totalElements,
          contentLength: response.content.length 
        });
      } else {
        setError('Failed to load tenants');
        setTotalElements(0);
      }
    } catch (err) {
      console.error('Error loading tenants:', err);
      setError('Failed to load tenants. Please try again.');
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [token, page, rowsPerPage, filters]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadTenants();
    }, filters.search ? 500 : 0); // Debounce search

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadTenants, filters.search]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      search: event.target.value
    }));
    setPage(0);
  };

  const handleFilterChange = (filterName: keyof TenantFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPage(0);
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewTenant = (tenant: TenantDTO) => {
    setSelectedTenant(tenant);
    setDetailsDialogOpen(true);
  };

  const handleCreateTenant = async () => {
    if (!token) return;
    
    if (!tenantForm.name) {
      setError('Please enter a tenant name.');
      return;
    }
    
    try {
      setLoading(true);
      await adminApiService.createTenant(tenantForm);
      setCreateDialogOpen(false);
      setTenantForm({
        name: '',
        subdomain: '',
        description: '',
      });
      await loadTenants();
      setError(null);
    } catch (err) {
      console.error('Error creating tenant:', err);
      setError('Failed to create tenant. Please check if the name and subdomain are unique.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTenant = async () => {
    if (!selectedTenant || !token) return;
    
    try {
      setLoading(true);
      await adminApiService.updateTenant(selectedTenant.tenantId, editForm);
      setEditDialogOpen(false);
      setSelectedTenant(null);
      await loadTenants();
      setError(null);
    } catch (err) {
      console.error('Error updating tenant:', err);
      setError('Failed to update tenant.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTenant = async () => {
    if (!selectedTenant || !token) return;
    
    try {
      setLoading(true);
      await adminApiService.deleteTenant(selectedTenant.tenantId);
      setDeleteDialogOpen(false);
      setSelectedTenant(null);
      await loadTenants();
      setError(null);
    } catch (err) {
      console.error('Error deleting tenant:', err);
      setError('Failed to delete tenant.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTenantStatus = async (tenant: TenantDTO) => {
    if (!token) return;
    
    try {
      setLoading(true);
      await adminApiService.toggleTenantStatus(tenant.tenantId);
      await loadTenants();
      setError(null);
    } catch (err) {
      console.error('Error toggling tenant status:', err);
      setError('Failed to update tenant status.');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (tenant: TenantDTO) => {
    setSelectedTenant(tenant);
    setEditForm({
      name: tenant.name || '',
      subdomain: tenant.subdomain || '',
      description: tenant.description || '',
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (tenant: TenantDTO) => {
    setSelectedTenant(tenant);
    setDeleteDialogOpen(true);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: '',
    });
    setPage(0);
  };

  if (!token) {
    return (
      <Box sx={{ width: '100%', p: 3 }}>
        <Alert severity="error">
          Authentication required. Please log in.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton
            onClick={() => navigate('/system-dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
            Tenant Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Add New Tenant
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Search and Filters */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search tenants..."
                value={filters.search}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">All Status</MenuItem>
                  {statusOptions.filter(status => status !== 'ALL').map(status => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={resetFilters}
                  size="small"
                >
                  Clear
                </Button>
                <IconButton
                  onClick={loadTenants}
                  disabled={loading}
                >
                  <RefreshIcon />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Tenants Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tenant</TableCell>
                  <TableCell>Subdomain</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : tenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No tenants found matching your criteria
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  tenants.map((tenant) => (
                    <TableRow key={tenant.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <BusinessIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {tenant.name}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ fontFamily: 'monospace' }}
                            >
                              {tenant.tenantId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {tenant.subdomain}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {tenant.description || 'No description'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tenant.isActive ? 'Active' : 'Inactive'}
                          color={getStatusColor(tenant.isActive) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleViewTenant(tenant)}
                            title="View Details"
                          >
                            <ViewIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleTenantStatus(tenant)}
                            title={tenant.isActive ? "Deactivate" : "Activate"}
                            color={tenant.isActive ? "success" : "error"}
                          >
                            {tenant.isActive ? <ToggleOnIcon /> : <ToggleOffIcon />}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => openDeleteDialog(tenant)}
                            title="Delete Tenant"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={totalElements || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </Paper>

        {/* Create Tenant Dialog */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Add New Tenant</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tenant Name"
                  value={tenantForm.name || ''}
                  onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subdomain (Optional)"
                  value={tenantForm.subdomain || ''}
                  onChange={(e) => setTenantForm({ ...tenantForm, subdomain: e.target.value })}
                  helperText="Optional: This will be used as part of the tenant's URL if provided"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={tenantForm.description || ''}
                  onChange={(e) => setTenantForm({ ...tenantForm, description: e.target.value })}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateTenant}
              variant="contained"
              disabled={loading || !tenantForm.name}
            >
              Create Tenant
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Tenant Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Edit Tenant</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tenant Name"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subdomain (Optional)"
                  value={editForm.subdomain || ''}
                  onChange={(e) => setEditForm({ ...editForm, subdomain: e.target.value })}
                  helperText="Optional: This will be used as part of the tenant's URL if provided"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleEditTenant}
              variant="contained"
              disabled={loading || !editForm.name}
            >
              Update Tenant
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete tenant "{selectedTenant?.name}"? 
              This action cannot be undone and will permanently remove all associated data.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleDeleteTenant}
              variant="contained"
              color="error"
              disabled={loading}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Details Dialog */}
        <Dialog
          open={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Tenant Details</DialogTitle>
          <DialogContent>
            {selectedTenant && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tenant Name"
                    value={selectedTenant.name || ''}
                    disabled
                    variant="filled"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subdomain"
                    value={selectedTenant.subdomain || ''}
                    disabled
                    variant="filled"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={selectedTenant.description || ''}
                    disabled
                    variant="filled"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Status"
                    value={selectedTenant.isActive ? 'Active' : 'Inactive'}
                    disabled
                    variant="filled"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tenant ID"
                    value={selectedTenant.tenantId || ''}
                    disabled
                    variant="filled"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Created At"
                    value={selectedTenant.createdAt ? new Date(selectedTenant.createdAt).toLocaleString() : ''}
                    disabled
                    variant="filled"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Updated"
                    value={selectedTenant.updatedAt ? new Date(selectedTenant.updatedAt).toLocaleString() : ''}
                    disabled
                    variant="filled"
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
            <Button 
              variant="contained" 
              startIcon={<EditIcon />}
              onClick={() => {
                if (selectedTenant) {
                  openEditDialog(selectedTenant);
                  setDetailsDialogOpen(false);
                }
              }}
            >
              Edit
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default TenantManagementAdmin;
