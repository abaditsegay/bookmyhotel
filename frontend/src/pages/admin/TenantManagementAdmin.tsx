import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  InputAdornment,
  Avatar,
  IconButton,
  Tooltip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  LinearProgress,
  Snackbar,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Business as BusinessIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Domain as DomainIcon,
  Group as GroupIcon,
  Hotel as HotelIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  adminApiService, 
  TenantDTO, 
  PagedResponse, 
  CreateTenantRequest, 
  UpdateTenantRequest,
  TenantStatistics 
} from '../../services/adminApi';

const TenantManagementAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  // State management
  const [tenants, setTenants] = useState<TenantDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<TenantDTO | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalTenants, setTotalTenants] = useState(0);
  const [success, setSuccess] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<TenantStatistics | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Form states
  const [newTenant, setNewTenant] = useState<CreateTenantRequest>({
    name: '',
    subdomain: '',
    description: '',
  });
  const [editedTenant, setEditedTenant] = useState<UpdateTenantRequest>({
    name: '',
    subdomain: '',
    description: '',
  });

  // Set token in API service when component mounts
  useEffect(() => {
    if (token) {
      adminApiService.setToken(token);
    }
  }, [token]);

  const loadTenantsData = async () => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const isActiveFilter = statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined;
      
      const result: PagedResponse<TenantDTO> = await adminApiService.getTenants(
        page, 
        rowsPerPage, 
        searchTerm.trim() || undefined, 
        isActiveFilter
      );

      setTenants(result.content || []);
      setTotalTenants(result.totalElements || 0);
    } catch (error) {
      console.error('Error loading tenants:', error);
      setError('Failed to load tenants. Please try again.');
      setTenants([]);
      setTotalTenants(0);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    if (!token) return;
    
    try {
      const stats = await adminApiService.getTenantStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading tenant statistics:', error);
    }
  };

  useEffect(() => {
    if (token) {
      loadTenantsData();
      loadStatistics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, rowsPerPage, searchTerm, statusFilter]);

  const loadTenants = async () => {
    await loadTenantsData();
    await loadStatistics();
  };

  const handleViewDetails = (tenant: TenantDTO) => {
    setSelectedTenant(tenant);
    setDetailsDialogOpen(true);
  };

  const handleToggleTenantStatus = async (tenantId: string) => {
    try {
      await adminApiService.toggleTenantStatus(tenantId);
      setSuccess('Tenant status updated successfully');
      await loadTenantsData();
    } catch (error) {
      console.error('Error toggling tenant status:', error);
      setError('Failed to update tenant status');
    }
  };

  const handleCreateTenant = async () => {
    if (!newTenant.name.trim() || !newTenant.subdomain.trim()) {
      setError('Name and subdomain are required');
      return;
    }

    try {
      await adminApiService.createTenant(newTenant);
      setSuccess('Tenant created successfully');
      setCreateDialogOpen(false);
      setNewTenant({ name: '', subdomain: '', description: '' });
      await loadTenants();
    } catch (error) {
      console.error('Error creating tenant:', error);
      setError('Failed to create tenant');
    }
  };

  const handleEditTenant = async () => {
    if (!selectedTenant || !editedTenant.name.trim() || !editedTenant.subdomain.trim()) {
      setError('Name and subdomain are required');
      return;
    }

    try {
      await adminApiService.updateTenant(selectedTenant.tenantId, editedTenant);
      setSuccess('Tenant updated successfully');
      setEditDialogOpen(false);
      setSelectedTenant(null);
      await loadTenants();
    } catch (error) {
      console.error('Error updating tenant:', error);
      setError('Failed to update tenant');
    }
  };

  const handleDeleteTenant = async () => {
    if (!selectedTenant) return;

    try {
      await adminApiService.deleteTenant(selectedTenant.tenantId);
      setSuccess('Tenant deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedTenant(null);
      await loadTenants();
    } catch (error) {
      console.error('Error deleting tenant:', error);
      setError('Failed to delete tenant');
    }
  };

  const openEditDialog = (tenant: TenantDTO) => {
    setSelectedTenant(tenant);
    setEditedTenant({
      name: tenant.name,
      subdomain: tenant.subdomain,
      description: tenant.description || '',
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (tenant: TenantDTO) => {
    setSelectedTenant(tenant);
    setDeleteDialogOpen(true);
  };

  // Create Tenant Dialog
  const CreateTenantDialog = () => (
    <Dialog
      open={createDialogOpen}
      onClose={() => setCreateDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <BusinessIcon />
          Create New Tenant
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tenant Name"
                value={newTenant.name}
                onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subdomain"
                value={newTenant.subdomain}
                onChange={(e) => setNewTenant({ ...newTenant, subdomain: e.target.value })}
                helperText="This will be used as part of the tenant's URL"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={newTenant.description}
                onChange={(e) => setNewTenant({ ...newTenant, description: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
        <Button onClick={handleCreateTenant} variant="contained">Create</Button>
      </DialogActions>
    </Dialog>
  );

  // Edit Tenant Dialog
  const EditTenantDialog = () => (
    <Dialog
      open={editDialogOpen}
      onClose={() => setEditDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <EditIcon />
          Edit Tenant - {selectedTenant?.name}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tenant Name"
                value={editedTenant.name}
                onChange={(e) => setEditedTenant({ ...editedTenant, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subdomain"
                value={editedTenant.subdomain}
                onChange={(e) => setEditedTenant({ ...editedTenant, subdomain: e.target.value })}
                helperText="This will be used as part of the tenant's URL"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={editedTenant.description}
                onChange={(e) => setEditedTenant({ ...editedTenant, description: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
        <Button onClick={handleEditTenant} variant="contained">Update</Button>
      </DialogActions>
    </Dialog>
  );

  // Delete Confirmation Dialog
  const DeleteConfirmationDialog = () => (
    <Dialog
      open={deleteDialogOpen}
      onClose={() => setDeleteDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DeleteIcon color="error" />
          Delete Tenant
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete the tenant "{selectedTenant?.name}"? 
          This action cannot be undone and will affect all associated users and hotels.
        </Typography>
        {selectedTenant && (selectedTenant.totalUsers || 0) > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            This tenant has {selectedTenant.totalUsers} users. Deleting it will affect these users.
          </Alert>
        )}
        {selectedTenant && (selectedTenant.totalHotels || 0) > 0 && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            This tenant has {selectedTenant.totalHotels} hotels. Deleting it will affect these hotels.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
        <Button onClick={handleDeleteTenant} variant="contained" color="error">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Tenant Details Dialog
  const TenantDetailsDialog = () => (
    <Dialog
      open={detailsDialogOpen}
      onClose={() => setDetailsDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <BusinessIcon />
          Tenant Details - {selectedTenant?.name}
        </Box>
      </DialogTitle>
      <DialogContent>
        {selectedTenant && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Name</Typography>
                <Typography variant="body1">{selectedTenant.name}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Tenant ID</Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {selectedTenant.tenantId}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Subdomain</Typography>
                <Typography variant="body1">{selectedTenant.subdomain}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Description</Typography>
                <Typography variant="body1">
                  {selectedTenant.description || 'No description available'}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Chip
                  label={selectedTenant.isActive ? 'Active' : 'Inactive'}
                  color={selectedTenant.isActive ? 'success' : 'error'}
                  size="small"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Statistics</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Total Users</Typography>
                <Typography variant="body1">{selectedTenant.totalUsers || 0} users</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Total Hotels</Typography>
                <Typography variant="body1">{selectedTenant.totalHotels || 0} hotels</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Created</Typography>
                  <Typography variant="body1">
                    {new Date(selectedTenant.createdAt).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                  <Typography variant="body1">
                    {new Date(selectedTenant.updatedAt).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/admin')}
          sx={{ mb: 2 }}
        >
          ← Back to Admin Dashboard
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Tenant Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage all tenants in the system
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon />
                  <Typography variant="h6" gutterBottom>Total Tenants</Typography>
                </Box>
                <Typography variant="h4">{statistics.totalTenants}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DomainIcon />
                  <Typography variant="h6" gutterBottom>Active Tenants</Typography>
                </Box>
                <Typography variant="h4">{statistics.activeTenants}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GroupIcon />
                  <Typography variant="h6" gutterBottom>Total Users</Typography>
                </Box>
                <Typography variant="h4">{statistics.totalUsers}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HotelIcon />
                  <Typography variant="h6" gutterBottom>Total Hotels</Typography>
                </Box>
                <Typography variant="h4">{statistics.totalHotels}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search tenants by name, subdomain..."
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
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status Filter"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Tenants</MenuItem>
                  <MenuItem value="active">Active Only</MenuItem>
                  <MenuItem value="inactive">Inactive Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  Create Tenant
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadTenants}
                >
                  Refresh
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tenants Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading && <LinearProgress />}
          
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tenant</TableCell>
                  <TableCell>Subdomain</TableCell>
                  <TableCell>Statistics</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <BusinessIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {tenant.name}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                          >
                            {tenant.tenantId}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <DomainIcon fontSize="small" color="action" />
                        <Typography variant="body2">{tenant.subdomain}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {tenant.totalUsers || 0} users, {tenant.totalHotels || 0} hotels
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={tenant.isActive ? "Active" : "Inactive"}
                        color={tenant.isActive ? "success" : "error"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(tenant)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Tenant">
                          <IconButton
                            size="small"
                            onClick={() => openEditDialog(tenant)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={tenant.isActive ? "Deactivate Tenant" : "Activate Tenant"}>
                          <IconButton
                            size="small"
                            color={tenant.isActive ? "success" : "error"}
                            onClick={() => handleToggleTenantStatus(tenant.tenantId)}
                          >
                            {tenant.isActive ? <ToggleOnIcon /> : <ToggleOffIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Tenant">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => openDeleteDialog(tenant)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalTenants || 0}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            showFirstButton
            showLastButton
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateTenantDialog />
      <EditTenantDialog />
      <DeleteConfirmationDialog />
      <TenantDetailsDialog />

      {/* Success Snackbar */}
      <Snackbar
        open={Boolean(success)}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TenantManagementAdmin;
