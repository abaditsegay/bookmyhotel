import React, { useState, useEffect, useCallback } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { formatEthiopianPhone } from '../../utils/phoneUtils';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  MenuItem,
  Grid,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  LockReset as LockResetIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useSubmissionError } from '../../contexts/SubmissionErrorContext';
import { useDebounce } from '../../hooks/useDebounce';
import { getEffectiveSearchTerm } from '../../utils/search';
import { 
  adminApiService, 
  UserManagementResponse, 
  CreateUserRequest, 
  UpdateUserRequest,
  TenantDTO,
  HotelDTO
} from '../../services/adminApi';
import { PageContainer } from '../../components/common/PageShell';
import PremiumTextField from '../../components/common/PremiumTextField';
import PremiumSelect from '../../components/common/PremiumSelect';
import StandardButton from '../../components/common/StandardButton';
import { DataTableCard, PageHeader, StandardDialog } from '../../components/ui';
import { useTranslation } from 'react-i18next';

interface UserFilters {
  search: string;
  role: string;
  status: string;
}

const UserManagementAdmin: React.FC = () => {
  const { token, user: currentUser } = useAuth();
  const { showSubmissionError } = useSubmissionError();
  const theme = useTheme();
  const { t } = useTranslation();
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
  // Delete functionality removed - use deactivation instead
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [passwordResetDialogOpen, setPasswordResetDialogOpen] = useState(false);
  const [toggleStatusDialogOpen, setToggleStatusDialogOpen] = useState(false);
  const [toggleStatusReason, setToggleStatusReason] = useState('');
  const [toggleUser, setToggleUser] = useState<UserManagementResponse | null>(null);
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

  // Tenant and Hotel state for user creation
  const [tenants, setTenants] = useState<TenantDTO[]>([]);
  const [hotels, setHotels] = useState<HotelDTO[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const debouncedSearch = useDebounce(filters.search, filters.search.trim() ? 300 : 0);
  const effectiveSearch = getEffectiveSearchTerm(debouncedSearch);

  const canViewHotelColumn = Boolean(
    currentUser?.roles?.includes('SUPER_ADMIN') ||
    currentUser?.roles?.includes('ADMIN') ||
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'ADMIN'
  );

  const allRoleOptions = ['SUPER_ADMIN', 'ADMIN', 'HOTEL_ADMIN', 'OPERATIONAL_ADMIN', 'FRONTDESK', 'HOUSEKEEPING', 'MAINTENANCE', 'TESTER', 'CUSTOMER'];

  const dialogSecondaryActionSx = {
    color: 'text.primary',
    borderColor: alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.28 : 0.18),
    backgroundColor: alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.02 : 0),
    '&:hover': {
      borderColor: alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.42 : 0.28),
      backgroundColor: alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.1 : 0.04),
    },
  } as const;

  // Roles visible in the filter dropdown — ADMIN cannot see SUPER_ADMIN
  const callerRoleForFilter = currentUser?.role || (currentUser?.roles?.[0] ?? '');
  const roleOptions = callerRoleForFilter === 'ADMIN'
    ? allRoleOptions.filter(r => r !== 'SUPER_ADMIN')
    : allRoleOptions;

  // Roles this user is permitted to assign when creating/editing users
  const creatableRoleOptions = (() => {
    const callerRole = currentUser?.role || (currentUser?.roles?.[0] ?? '');
    if (callerRole === 'SUPER_ADMIN') return ['ADMIN', 'HOTEL_ADMIN', 'TESTER'];
    if (callerRole === 'ADMIN') return ['HOTEL_ADMIN', 'TESTER'];
    return roleOptions;
  })();
  const statusOptions = [
    { value: '', label: t('admin.userManagement.filters.allStatuses') },
    { value: 'ACTIVE', label: t('admin.userManagement.status.active') },
    { value: 'INACTIVE', label: t('admin.userManagement.status.inactive') }
  ];  // Set token in API service when component mounts

  const translateRole = (role: string) => t(`admin.userManagement.roles.${role}`, {
    defaultValue: role.replace(/_/g, ' '),
  });
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
      if (effectiveSearch === null) {
        return;
      }

      if (effectiveSearch) {
        // Search has highest priority
        response = await adminApiService.searchUsers(effectiveSearch, page, rowsPerPage);
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
  }, [token, page, rowsPerPage, filters.role, filters.status, effectiveSearch]);

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

  useEffect(() => {
    if (effectiveSearch !== null) {
      setPage(0);
    }
  }, [effectiveSearch]);

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
      showSubmissionError(err, {
        fallbackMessage: 'Failed to update user',
      });
    }
  };

  const handleToggleUserStatus = async () => {
    if (!toggleUser) return;
    try {
      await adminApiService.toggleUserStatus(toggleUser.id, toggleStatusReason);
      setToggleStatusDialogOpen(false);
      setToggleStatusReason('');
      setToggleUser(null);
      loadUsers();
    } catch (err) {
      // console.error('Error toggling user status:', err);
      showSubmissionError(err, {
        fallbackMessage: 'Failed to toggle user status',
      });
    }
  };

  const handlePasswordReset = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      await adminApiService.resetUserPassword(selectedUser.id);
      setPasswordResetDialogOpen(false);
      setSelectedUser(null);
      setSuccessMessage('A new password has been generated and sent to the user\'s email.');
    } catch (err) {
      showSubmissionError(err, {
        fallbackMessage: 'Failed to reset password',
      });
    } finally {
      setLoading(false);
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

  const openDetailsDialog = (user: UserManagementResponse) => {
    setSelectedUser(user);
    setDetailsDialogOpen(true);
  };

  const openPasswordResetDialog = (user: UserManagementResponse) => {
    setSelectedUser(user);
    setPasswordResetDialogOpen(true);
  };

  const closeCreateDialog = () => {
    setCreateDialogOpen(false);
    setCreateError(null);
    setHotels([]);
  };

  const closeToggleStatusDialog = () => {
    setToggleStatusDialogOpen(false);
    setToggleStatusReason('');
    setToggleUser(null);
  };

  const getRoleChipSx = (role: string) => {
    const accent = (() => {
      switch (role) {
        case 'SUPER_ADMIN':
          return theme.palette.error[theme.palette.mode === 'dark' ? 'light' : 'main'];
        case 'ADMIN':
          return theme.palette.primary[theme.palette.mode === 'dark' ? 'light' : 'main'];
        case 'HOTEL_ADMIN':
          return theme.palette.warning[theme.palette.mode === 'dark' ? 'light' : 'main'];
        case 'OPERATIONAL_ADMIN':
          return theme.palette.info[theme.palette.mode === 'dark' ? 'light' : 'main'];
        case 'FRONTDESK':
          return theme.palette.info[theme.palette.mode === 'dark' ? 'light' : 'main'];
        case 'HOUSEKEEPING':
          return theme.palette.success[theme.palette.mode === 'dark' ? 'light' : 'main'];
        case 'MAINTENANCE':
          return theme.palette.warning[theme.palette.mode === 'dark' ? 'light' : 'main'];
        default:
          return theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary;
      }
    })();

    return {
      fontWeight: 700,
      letterSpacing: '0.02em',
      color: accent,
      borderColor: alpha(accent, theme.palette.mode === 'dark' ? 0.38 : 0.24),
      backgroundColor: alpha(accent, theme.palette.mode === 'dark' ? 0.14 : 0.06),
      '& .MuiChip-label': {
        px: 1.1,
      },
    };
  };

  const getStatusColor = (active: boolean) => {
    return active ? 'success' : 'error';
  };

  if (loading && users.length === 0) {
    return (
      <PageContainer maxWidth={false} sx={{ justifyContent: 'center', minHeight: '60vh' }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth={false}>
      <PageHeader
        eyebrow={t('admin.userManagement.eyebrow')}
        title={t('admin.userManagement.title')}
        description={t('admin.userManagement.description')}
        actions={
          <StandardButton variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>
            {t('admin.userManagement.actions.addUser')}
          </StandardButton>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <DataTableCard
        title={t('admin.userManagement.directory.title')}
        description={t('admin.userManagement.directory.description')}
        filters={
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <PremiumTextField
                fullWidth
                label={t('common.search')}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder={t('admin.userManagement.filters.searchPlaceholder')}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <PremiumSelect
                fullWidth
                label={t('admin.userManagement.filters.role')}
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
              >
                <MenuItem value="">{t('admin.userManagement.filters.allRoles')}</MenuItem>
                {roleOptions.map((role) => (
                  <MenuItem key={role} value={role}>
                    {translateRole(role)}
                  </MenuItem>
                ))}
              </PremiumSelect>
            </Grid>
            <Grid item xs={12} md={4}>
              <PremiumSelect
                fullWidth
                label={t('admin.userManagement.filters.status')}
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
        }
        pagination={
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={totalElements}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={t('admin.userManagement.table.rowsPerPage')}
          />
        }
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('admin.userManagement.table.name')}</TableCell>
                <TableCell>{t('admin.userManagement.table.email')}</TableCell>
                <TableCell>{t('admin.userManagement.table.phone')}</TableCell>
                {canViewHotelColumn && <TableCell>{t('admin.userManagement.table.hotel')}</TableCell>}
                <TableCell>{t('admin.userManagement.table.role')}</TableCell>
                <TableCell>{t('admin.userManagement.table.status')}</TableCell>
                <TableCell>{t('admin.userManagement.table.created')}</TableCell>
                <TableCell>{t('admin.userManagement.table.lastLogin')}</TableCell>
                <TableCell align="center">{t('admin.userManagement.table.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canViewHotelColumn ? 9 : 8} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('admin.userManagement.emptyState')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone ? formatEthiopianPhone(user.phone) : ''}</TableCell>
                    {canViewHotelColumn && (
                      <TableCell>{user.hotelName || t('admin.userManagement.systemWide')}</TableCell>
                    )}
                    <TableCell>
                      <Chip
                        label={user.roles.length > 0 ? translateRole(user.roles[0]) : t('admin.userManagement.roles.NO_ROLE')}
                        size="small"
                        variant="outlined"
                        sx={getRoleChipSx(user.roles.length > 0 ? user.roles[0] : '')}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? t('admin.userManagement.status.active') : t('admin.userManagement.status.inactive')}
                        color={getStatusColor(user.isActive) as any}
                        size="small"
                        variant={user.isActive ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{t('common.notAvailable')}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {!user.roles.includes('SUPER_ADMIN') && (
                          <Tooltip title={t('admin.userManagement.actions.viewDetails')}>
                            <IconButton size="small" onClick={() => openDetailsDialog(user)}>
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {!user.roles.includes('SUPER_ADMIN') && (
                          <Tooltip title={user.isActive ? t('admin.userManagement.actions.deactivateUser') : t('admin.userManagement.actions.activateUser')}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setToggleUser(user);
                                setToggleStatusReason('');
                                setToggleStatusDialogOpen(true);
                              }}
                              color={user.isActive ? 'success' : 'error'}
                            >
                              {user.isActive ? <ToggleOnIcon /> : <ToggleOffIcon />}
                            </IconButton>
                          </Tooltip>
                        )}
                        {!user.roles.includes('SUPER_ADMIN') && (
                          <Tooltip title={t('admin.userManagement.actions.resetPassword')}>
                            <IconButton size="small" onClick={() => openPasswordResetDialog(user)}>
                              <LockResetIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DataTableCard>

      <StandardDialog
        open={createDialogOpen} 
        onClose={closeCreateDialog}
        maxWidth="md" 
        fullWidth
        title={t('admin.userManagement.dialogs.create.title')}
        description={t('admin.userManagement.dialogs.create.description')}
        actions={
          <>
            <StandardButton variant="outlined" onClick={closeCreateDialog} sx={dialogSecondaryActionSx}>{t('common.cancel')}</StandardButton>
            <StandardButton onClick={handleCreateUser} variant="contained">{t('admin.userManagement.actions.createUser')}</StandardButton>
          </>
        }
      >
        {createError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setCreateError(null)}>
            {createError}
          </Alert>
        )}
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label={t('admin.userManagement.fields.firstName')}
                value={userForm.firstName || ''}
                onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label={t('admin.userManagement.fields.lastName')}
                value={userForm.lastName || ''}
                onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <PremiumTextField
                fullWidth
                label={t('admin.userManagement.fields.email')}
                type="email"
                value={userForm.email || ''}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <PremiumTextField
                fullWidth
                label={t('admin.userManagement.fields.password')}
                type="password"
                value={userForm.password || ''}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label={t('admin.userManagement.fields.phone')}
                value={userForm.phone || ''}
                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PremiumSelect
                fullWidth
                required
                label={t('admin.userManagement.fields.role')}
                value={userForm.roles.length > 0 ? userForm.roles[0] : ''}
                onChange={(e) => {
                  const selectedRole = e.target.value as string;
                  const isHotelBoundRole = ['HOTEL_ADMIN', 'OPERATIONAL_ADMIN', 'FRONTDESK', 'HOUSEKEEPING', 'MAINTENANCE', 'TESTER'].includes(selectedRole);
                  setUserForm({ 
                    ...userForm, 
                    roles: [selectedRole],
                    hotelId: isHotelBoundRole ? userForm.hotelId : undefined,
                    tenantId: isHotelBoundRole ? userForm.tenantId : undefined
                  });
                }}
              >
                {creatableRoleOptions.map((role) => (
                  <MenuItem key={role} value={role}>
                    {translateRole(role)}
                  </MenuItem>
                ))}
              </PremiumSelect>
            </Grid>
            
            {/* Tenant Selection - Show for hotel-bound roles */}
            {(() => {
              const shouldShow = userForm.roles.some(role => ['HOTEL_ADMIN', 'OPERATIONAL_ADMIN', 'FRONTDESK', 'HOUSEKEEPING', 'MAINTENANCE', 'TESTER'].includes(role));
              return shouldShow;
            })() && (
              <Grid item xs={12} md={6}>
                <PremiumSelect
                  fullWidth
                  required
                  label={t('admin.userManagement.fields.tenant')}
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
            {userForm.roles.some(role => ['HOTEL_ADMIN', 'OPERATIONAL_ADMIN', 'FRONTDESK', 'HOUSEKEEPING', 'MAINTENANCE', 'TESTER'].includes(role)) && userForm.tenantId && (
              <Grid item xs={12} md={6}>
                <PremiumSelect
                  fullWidth
                  required
                  label={t('admin.userManagement.fields.hotel')}
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
      </StandardDialog>

      <StandardDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
        title={t('admin.userManagement.dialogs.edit.title')}
        description={t('admin.userManagement.dialogs.edit.description')}
        actions={
          <>
            <StandardButton variant="outlined" onClick={() => setEditDialogOpen(false)} sx={dialogSecondaryActionSx}>{t('common.cancel')}</StandardButton>
            <StandardButton onClick={handleEditUser} variant="contained">{t('admin.userManagement.actions.updateUser')}</StandardButton>
          </>
        }
      >
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label={t('admin.userManagement.fields.firstName')}
                value={editForm.firstName || ''}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label={t('admin.userManagement.fields.lastName')}
                value={editForm.lastName || ''}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <PremiumTextField
                fullWidth
                label={t('admin.userManagement.fields.email')}
                type="email"
                value={editForm.email || ''}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PremiumTextField
                fullWidth
                label={t('admin.userManagement.fields.phone')}
                value={editForm.phone || ''}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PremiumSelect
                fullWidth
                required
                label={t('admin.userManagement.fields.role')}
                value={editForm.roles.length > 0 ? editForm.roles[0] : ''}
                onChange={(e) => setEditForm({ ...editForm, roles: [e.target.value as string] })}
              >
                {creatableRoleOptions.map((role) => (
                  <MenuItem key={role} value={role}>
                    {translateRole(role)}
                  </MenuItem>
                ))}
              </PremiumSelect>
            </Grid>
          </Grid>
      </StandardDialog>

      <StandardDialog
        open={toggleStatusDialogOpen}
        onClose={closeToggleStatusDialog}
        maxWidth="sm"
        fullWidth
        title={toggleUser?.isActive ? t('admin.userManagement.dialogs.toggleStatus.deactivateTitle') : t('admin.userManagement.dialogs.toggleStatus.activateTitle')}
        actions={
          <>
            <StandardButton variant="outlined" onClick={closeToggleStatusDialog} sx={dialogSecondaryActionSx}>{t('common.cancel')}</StandardButton>
            <StandardButton
              onClick={handleToggleUserStatus}
              variant="contained"
              color={toggleUser?.isActive ? 'error' : 'success'}
              disabled={!toggleStatusReason.trim() || loading}
              loading={loading}
              loadingText={toggleUser?.isActive ? t('admin.userManagement.actions.deactivating') : t('admin.userManagement.actions.activating')}
            >
              {toggleUser?.isActive ? t('admin.userManagement.actions.deactivate') : t('admin.userManagement.actions.activate')}
            </StandardButton>
          </>
        }
      >
        <Typography sx={{ mb: 2 }}>
          {t('admin.userManagement.dialogs.toggleStatus.confirmation', {
            action: toggleUser?.isActive ? t('admin.userManagement.actions.deactivate').toLowerCase() : t('admin.userManagement.actions.activate').toLowerCase(),
            name: `${toggleUser?.firstName ?? ''} ${toggleUser?.lastName ?? ''}`.trim(),
            email: toggleUser?.email ?? '',
          })}
        </Typography>
        <PremiumTextField
          label={t('admin.userManagement.fields.reason')}
          fullWidth
          required
          multiline
          rows={3}
          value={toggleStatusReason}
          onChange={(e) => setToggleStatusReason(e.target.value)}
          placeholder={toggleUser?.isActive ? t('admin.userManagement.placeholders.deactivationReason') : t('admin.userManagement.placeholders.activationReason')}
        />
      </StandardDialog>

      <StandardDialog
        open={passwordResetDialogOpen}
        onClose={() => setPasswordResetDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        title={t('admin.userManagement.dialogs.resetPassword.title')}
        actions={
          <>
            <StandardButton variant="outlined" onClick={() => setPasswordResetDialogOpen(false)} sx={dialogSecondaryActionSx}>{t('common.cancel')}</StandardButton>
            <StandardButton onClick={handlePasswordReset} variant="contained" disabled={loading} loading={loading} loadingText={t('admin.userManagement.actions.sending')}>
              {t('admin.userManagement.actions.resetAndSendEmail')}
            </StandardButton>
          </>
        }
      >
        <Typography sx={{ mb: 2 }}>
          {t('admin.userManagement.dialogs.resetPassword.body', { email: selectedUser?.email ?? '' })}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('admin.userManagement.dialogs.resetPassword.note')}
        </Typography>
      </StandardDialog>

      <StandardDialog
        open={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        title={t('admin.userManagement.dialogs.details.title')}
        actions={
          <>
            <StandardButton variant="outlined" onClick={() => setDetailsDialogOpen(false)} sx={dialogSecondaryActionSx}>{t('common.close')}</StandardButton>
            <StandardButton
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => {
                if (selectedUser) {
                  openEditDialog(selectedUser);
                  setDetailsDialogOpen(false);
                }
              }}
            >
              {t('common.edit')}
            </StandardButton>
          </>
        }
      >
        {selectedUser && (
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  fullWidth
                  label={t('admin.userManagement.fields.firstName')}
                  value={selectedUser.firstName || ''}
                  disabled
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  fullWidth
                  label={t('admin.userManagement.fields.lastName')}
                  value={selectedUser.lastName || ''}
                  disabled
                />
              </Grid>
              
              <Grid item xs={12}>
                <PremiumTextField
                  fullWidth
                  label={t('admin.userManagement.fields.email')}
                  type="email"
                  value={selectedUser.email || ''}
                  disabled
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  fullWidth
                  label={t('admin.userManagement.fields.phone')}
                  value={selectedUser.phone ? formatEthiopianPhone(selectedUser.phone) : ''}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  fullWidth
                  label={t('admin.userManagement.fields.role')}
                  value={selectedUser.roles.length > 0 ? translateRole(selectedUser.roles[0]) : t('admin.userManagement.roles.NO_ROLE')}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  fullWidth
                  label={t('admin.userManagement.fields.status')}
                  value={selectedUser.isActive ? t('admin.userManagement.status.active') : t('admin.userManagement.status.inactive')}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  fullWidth
                  label={t('admin.userManagement.fields.createdAt')}
                  value={selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : ''}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  fullWidth
                  label={t('admin.userManagement.fields.lastLogin')}
                  value={t('common.notAvailable')}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  fullWidth
                  label={t('admin.userManagement.fields.userId')}
                  value={selectedUser.id?.toString() || ''}
                  disabled
                />
              </Grid>
            </Grid>
        )}
      </StandardDialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={5000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success" variant="filled" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default UserManagementAdmin;
