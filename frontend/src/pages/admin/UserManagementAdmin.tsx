import React, { useState, useEffect, useCallback } from 'react';
import { COLORS, getGradient } from '../../theme/themeColors';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  LockReset as LockResetIcon,
  ArrowBack as ArrowBackIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  adminApiService, 
  UserManagementResponse, 
  CreateUserRequest, 
  UpdateUserRequest,
  TenantDTO,
  HotelDTO
} from '../../services/adminApi';
import PremiumTextField from '../../components/common/PremiumTextField';
import PremiumSelect from '../../components/common/PremiumSelect';

interface UserFilters {
  search: string;
  role: string;
  status: string;
}

const UserManagementAdmin: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserManagementResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: '',
    status: '',
  });

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [passwordResetDialogOpen, setPasswordResetDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserManagementResponse | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  // Form state
  const [userForm, setUserForm] = useState<CreateUserRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    roles: [],
    tenantId: undefined,
    hotelId: undefined,
  });

  const [editForm, setEditForm] = useState<UpdateUserRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    isActive: true,
    roles: [],
  });

  const [newPassword, setNewPassword] = useState('');

  // Tenant and Hotel state for user creation
  const [tenants, setTenants] = useState<TenantDTO[]>([]);
  const [hotels, setHotels] = useState<HotelDTO[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [loadingHotels, setLoadingHotels] = useState(false);

  const roleOptions = ['SYSTEM_ADMIN', 'HOTEL_MANAGER', 'HOTEL_ADMIN', 'FRONTDESK', 'HOUSEKEEPING', 'CUSTOMER'];
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' }
  ];  // Set token in API service when component mounts
  useEffect(() => {
    if (token) {
      adminApiService.setToken(token);
    }
  }, [token]);

  const loadUsers = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let response;
      
      // Determine which API to call based on filters
      if (filters.search) {
        // Search has highest priority
        response = await adminApiService.searchUsers(filters.search, page, rowsPerPage);
      } else if (filters.role) {
        // Role filter
        response = await adminApiService.getUsersByRole(filters.role, page, rowsPerPage);
      } else if (filters.status && filters.status !== '' && filters.status !== 'ALL') {
        // Status filter (convert status to boolean)
        const isActive = filters.status === 'ACTIVE';
        response = await adminApiService.getUsersByStatus(isActive, page, rowsPerPage);
      } else {
        // No filters - get all users
        response = await adminApiService.getUsers(page, rowsPerPage);
      }
      
      // console.log('User API Response:', response);
      if (response.content) {
        setUsers(response.content);
        // Spring Boot Page object has totalElements directly on the response
        const totalCount = response.totalElements || response.page?.totalElements || response.content.length || 0;
        setTotalElements(totalCount);
        // console.log('Total Elements:', totalCount, 'Response structure:', { 
        //   hasPage: !!response.page, 
        //   pageTotalElements: response.page?.totalElements,
        //   directTotalElements: response.totalElements,
        //   contentLength: response.content.length 
        // });
      } else {
        setError('Failed to load users');
        setTotalElements(0);
      }
    } catch (err) {
      // console.error('Error loading users:', err);
      setError('Failed to load users');
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [token, page, rowsPerPage, filters]);

  // Memoized filter change handlers to prevent input focus loss
  const handleFilterChange = React.useCallback((filterName: keyof UserFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPage(0);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Load tenants when component mounts
  const loadTenants = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoadingTenants(true);
      const response = await adminApiService.getActiveTenants();
      setTenants(response || []);
    } catch (err) {
      // console.error('Error loading tenants:', err);
      setError('Failed to load tenants');
    } finally {
      setLoadingTenants(false);
    }
  }, [token]);

  const loadHotels = useCallback(async (tenantId: string) => {
    if (!token || !tenantId) return;
    
    try {
      setLoadingHotels(true);
      const response = await adminApiService.getHotelsByTenant(tenantId);
      setHotels(response || []);
    } catch (err) {
      // console.error('Error loading hotels:', err);
      setError('Failed to load hotels');
    } finally {
      setLoadingHotels(false);
    }
  }, [token]);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  // Load hotels when tenant is selected
  useEffect(() => {
    if (userForm.tenantId) {
      loadHotels(userForm.tenantId);
    }
  }, [userForm.tenantId, loadHotels]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreateUser = async () => {
    try {
      setCreateError(null); // Clear any previous errors
      await adminApiService.createUser(userForm);
      setCreateDialogOpen(false);
      setUserForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        roles: [],
        tenantId: undefined,
        hotelId: undefined,
      });
      setHotels([]); // Clear hotels when form is reset
      loadUsers();
    } catch (err) {
      // console.error('Error creating user:', err);
      
      // Extract meaningful error message from API response
      if (err instanceof Error) {
        const errorMessage = err.message;
        if (errorMessage.includes('Email already exists')) {
          setCreateError('This email address is already registered. Please use a different email.');
        } else if (errorMessage.includes('400')) {
          // Extract the actual error message from the API response
          const match = errorMessage.match(/{"error":"(.+?)"}/);
          if (match) {
            setCreateError(match[1]);
          } else {
            setCreateError('Invalid input data. Please check all fields and try again.');
          }
        } else {
          setCreateError('Failed to create user. Please try again.');
        }
      } else {
        setCreateError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    
    try {
      await adminApiService.updateUser(selectedUser.id, editForm);
      setEditDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err) {
      // console.error('Error updating user:', err);
      setError('Failed to update user');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await adminApiService.deleteUser(selectedUser.id);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err) {
      // console.error('Error deleting user:', err);
      setError('Failed to delete user');
    }
  };

  const handleToggleUserStatus = async (userId: number) => {
    try {
      await adminApiService.toggleUserStatus(userId);
      loadUsers();
    } catch (err) {
      // console.error('Error toggling user status:', err);
      setError('Failed to toggle user status');
    }
  };

  const handlePasswordReset = async () => {
    if (!selectedUser || !newPassword) return;
    
    try {
      await adminApiService.resetUserPassword(selectedUser.id, newPassword);
      setPasswordResetDialogOpen(false);
      setSelectedUser(null);
      setNewPassword('');
      alert('Password reset successfully');
    } catch (err) {
      // console.error('Error resetting password:', err);
      setError('Failed to reset password');
    }
  };

  const openEditDialog = (user: UserManagementResponse) => {
    setSelectedUser(user);
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      isActive: user.isActive,
      roles: user.roles || [],
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (user: UserManagementResponse) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const openDetailsDialog = (user: UserManagementResponse) => {
    setSelectedUser(user);
    setDetailsDialogOpen(true);
  };

  const openPasswordResetDialog = (user: UserManagementResponse) => {
    setSelectedUser(user);
    setPasswordResetDialogOpen(true);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SYSTEM_ADMIN': return 'error';
      case 'HOTEL_MANAGER': return 'warning';
      case 'HOTEL_ADMIN': return 'info';
      case 'FRONTDESK': return 'success';
      case 'HOUSEKEEPING': return 'primary';
      case 'CUSTOMER': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (active: boolean) => {
    return active ? 'success' : 'error';
  };

  if (loading && users.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton
          onClick={() => navigate('/system-dashboard')}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ 
          flexGrow: 1,
          color: COLORS.PRIMARY,
          fontWeight: 600,
          letterSpacing: '0.5px'
        }}>
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Add User
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon />
          Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <PremiumTextField
              fullWidth
              label="Search"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by name or email..."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <PremiumSelect
              fullWidth
              label="Role"
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
            >
              <MenuItem value="">All Roles</MenuItem>
              {roleOptions.map((role) => (
                <MenuItem key={role} value={role}>
                  {role.replace('_', ' ')}
                </MenuItem>
              ))}
            </PremiumSelect>
          </Grid>
          <Grid item xs={12} md={4}>
            <PremiumSelect
              fullWidth
              label="Status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              {statusOptions.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </PremiumSelect>
          </Grid>
        </Grid>
      </Paper>

      {/* Users Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  background: `linear-gradient(135deg, ${COLORS.BG_DEFAULT} 0%, ${COLORS.BG_LIGHT} 50%, ${COLORS.BG_DEFAULT} 100%)`,
                  borderBottom: `2px solid ${COLORS.SECONDARY}`,
                  '& .MuiTableCell-head': {
                    color: COLORS.PRIMARY,
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    border: 'none',
                    padding: '20px 16px',
                  }
                }}
              >
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.roles.length > 0 ? user.roles[0].replace('_', ' ') : 'No Role'}
                      color={getRoleColor(user.roles.length > 0 ? user.roles[0] : '') as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      color={getStatusColor(user.isActive) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    N/A
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => openDetailsDialog(user)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user.isActive ? 'Deactivate User' : 'Activate User'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleUserStatus(user.id)}
                          color={user.isActive ? 'success' : 'error'}
                        >
                          {user.isActive ? <ToggleOnIcon /> : <ToggleOffIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reset Password">
                        <IconButton
                          size="small"
                          onClick={() => openPasswordResetDialog(user)}
                        >
                          <LockResetIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User">
                        <IconButton
                          size="small"
                          onClick={() => openDeleteDialog(user)}
                          color="error"
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
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Create User Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => {
          setCreateDialogOpen(false);
          setCreateError(null);
          setHotels([]); // Clear hotels when dialog is closed
        }} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label="First Name"
                value={userForm.firstName || ''}
                onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label="Last Name"
                value={userForm.lastName || ''}
                onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <PremiumTextField
                fullWidth
                label="Email"
                type="email"
                value={userForm.email || ''}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <PremiumTextField
                fullWidth
                label="Password"
                type="password"
                value={userForm.password || ''}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label="Phone"
                value={userForm.phone || ''}
                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PremiumSelect
                fullWidth
                required
                label="Role"
                value={userForm.roles.length > 0 ? userForm.roles[0] : ''}
                onChange={(e) => {
                  const selectedRole = e.target.value as string;
                  const isHotelBoundRole = ['HOTEL_ADMIN', 'FRONTDESK', 'HOUSEKEEPING'].includes(selectedRole);
                  setUserForm({ 
                    ...userForm, 
                    roles: [selectedRole],
                    hotelId: isHotelBoundRole ? userForm.hotelId : undefined,
                    tenantId: isHotelBoundRole ? userForm.tenantId : undefined
                  });
                }}
              >
                {roleOptions.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role.replace('_', ' ')}
                  </MenuItem>
                ))}
              </PremiumSelect>
            </Grid>
            
            {/* Tenant Selection - Show for hotel-bound roles */}
            {(() => {
              const shouldShow = (userForm.roles.includes('HOTEL_ADMIN') || userForm.roles.includes('FRONTDESK') || userForm.roles.includes('HOUSEKEEPING'));
              return shouldShow;
            })() && (
              <Grid item xs={12} md={6}>
                <PremiumSelect
                  fullWidth
                  required
                  label="Tenant"
                  value={userForm.tenantId || ''}
                  disabled={loadingTenants}
                  onChange={(e) => {
                    const selectedTenantId = e.target.value as string;
                    setUserForm({ 
                      ...userForm, 
                      tenantId: selectedTenantId,
                      hotelId: undefined
                    });
                  }}
                >
                  {tenants.map((tenant) => (
                    <MenuItem key={tenant.tenantId} value={tenant.tenantId}>
                      {tenant.name}
                    </MenuItem>
                  ))}
                </PremiumSelect>
              </Grid>
            )}

            {/* Hotel Selection - Show for hotel-bound roles when tenant is selected */}
            {(userForm.roles.includes('HOTEL_ADMIN') || userForm.roles.includes('FRONTDESK') || userForm.roles.includes('HOUSEKEEPING')) && userForm.tenantId && (
              <Grid item xs={12} md={6}>
                <PremiumSelect
                  fullWidth
                  required
                  label="Hotel"
                  value={userForm.hotelId || ''}
                  disabled={loadingHotels}
                  onChange={(e) => setUserForm({ ...userForm, hotelId: e.target.value as number })}
                >
                  {hotels.map((hotel) => (
                    <MenuItem key={hotel.id} value={hotel.id}>
                      {hotel.name} - {hotel.city}
                    </MenuItem>
                  ))}
                </PremiumSelect>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        {createError && (
          <Box sx={{ px: 3, pb: 1 }}>
            <Alert severity="error" onClose={() => setCreateError(null)}>
              {createError}
            </Alert>
          </Box>
        )}
        <DialogActions>
          <Button onClick={() => {
            setCreateDialogOpen(false);
            setCreateError(null);
            setHotels([]); // Clear hotels when dialog is closed
          }}>Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained">
            Create User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label="First Name"
                value={editForm.firstName || ''}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label="Last Name"
                value={editForm.lastName || ''}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <PremiumTextField
                fullWidth
                label="Email"
                type="email"
                value={editForm.email || ''}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label="Phone"
                value={editForm.phone || ''}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PremiumSelect
                fullWidth
                required
                label="Role"
                value={editForm.roles.length > 0 ? editForm.roles[0] : ''}
                onChange={(e) => setEditForm({ ...editForm, roles: [e.target.value as string] })}
              >
                {roleOptions.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role.replace('_', ' ')}
                  </MenuItem>
                ))}
              </PremiumSelect>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditUser} variant="contained">
            Update User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user "{selectedUser?.firstName} {selectedUser?.lastName}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={passwordResetDialogOpen} onClose={() => setPasswordResetDialogOpen(false)}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Reset password for user "{selectedUser?.email}"?
          </Typography>
          <PremiumTextField
            fullWidth
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordResetDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePasswordReset} variant="contained">
            Reset Password
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
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  fullWidth
                  label="First Name"
                  value={selectedUser.firstName || ''}
                  disabled
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  fullWidth
                  label="Last Name"
                  value={selectedUser.lastName || ''}
                  disabled
                />
              </Grid>
              
              <Grid item xs={12}>
                <PremiumTextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={selectedUser.email || ''}
                  disabled
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  fullWidth
                  label="Phone"
                  value={selectedUser.phone || ''}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  fullWidth
                  label="Role"
                  value={selectedUser.roles.length > 0 ? selectedUser.roles[0].replace('_', ' ') : 'No Role'}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  fullWidth
                  label="Status"
                  value={selectedUser.isActive ? 'Active' : 'Inactive'}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  fullWidth
                  label="Created At"
                  value={selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : ''}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  fullWidth
                  label="Last Login"
                  value="N/A"
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  fullWidth
                  label="User ID"
                  value={selectedUser.id?.toString() || ''}
                  disabled
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
              if (selectedUser) {
                openEditDialog(selectedUser);
                setDetailsDialogOpen(false);
              }
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagementAdmin;
