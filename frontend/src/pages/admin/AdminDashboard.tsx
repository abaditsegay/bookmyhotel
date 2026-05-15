import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  InputAdornment,
  TablePagination,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  Hotel,
  People,
  History,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  Visibility as ViewIcon,
  LocationOn as LocationIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { PageContainer } from '../../components/common/PageShell';
import PremiumSelect from '../../components/common/PremiumSelect';
import PremiumTextField from '../../components/common/PremiumTextField';
import StandardButton from '../../components/common/StandardButton';
import { DataTableCard, PageHeader, SurfaceCard } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import { adminApiService, HotelDTO, PagedResponse, UserManagementResponse } from '../../services/adminApi';
import { formatDateForDisplay } from '../../utils/dateUtils';
import { getEffectiveSearchTerm } from '../../utils/search';
import AuditLogTab from './AuditLogTab';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialTab = () => {
    const tabParam = searchParams.get('tab');
    const tab = tabParam ? parseInt(tabParam, 10) : 0;
    return Number.isNaN(tab) || tab < 0 || tab > 2 ? 0 : tab;
  };

  const [currentTab, setCurrentTab] = useState(() => getInitialTab());

  const [hotels, setHotels] = useState<HotelDTO[]>([]);
  const [hotelPage, setHotelPage] = useState(0);
  const [hotelRowsPerPage, setHotelRowsPerPage] = useState(10);
  const [hotelSearchTerm, setHotelSearchTerm] = useState('');
  const [hotelStatusFilter, setHotelStatusFilter] = useState('');
  const [hotelLoading, setHotelLoading] = useState(false);
  const [hotelError, setHotelError] = useState<string | null>(null);

  const [users, setUsers] = useState<UserManagementResponse[]>([]);
  const [userPage, setUserPage] = useState(0);
  const [userRowsPerPage, setUserRowsPerPage] = useState(10);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('');
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  const debouncedHotelSearchTerm = useDebounce(hotelSearchTerm, hotelSearchTerm.trim() ? 300 : 0);
  const debouncedUserSearchTerm = useDebounce(userSearchTerm, userSearchTerm.trim() ? 300 : 0);
  const effectiveHotelSearchTerm = getEffectiveSearchTerm(debouncedHotelSearchTerm);
  const effectiveUserSearchTerm = getEffectiveSearchTerm(debouncedUserSearchTerm);

  useEffect(() => {
    if (token) {
      adminApiService.setToken(token);
    }
  }, [token]);

  const loadHotels = useCallback(async () => {
    if (!token) {
      setHotelError('Authentication required');
      return;
    }

    setHotelLoading(true);
    setHotelError(null);

    try {
      let result: PagedResponse<HotelDTO>;

      if (effectiveHotelSearchTerm === null) {
        return;
      }

      if (effectiveHotelSearchTerm) {
        result = await adminApiService.searchHotels(effectiveHotelSearchTerm, 0, 1000);
      } else {
        result = await adminApiService.getHotels(0, 1000);
      }

      setHotels(result.content || []);
    } catch {
      setHotelError('Failed to load hotels');
      setHotels([]);
    } finally {
      setHotelLoading(false);
    }
  }, [token, effectiveHotelSearchTerm]);

  const loadUsers = useCallback(async () => {
    if (!token) {
      setUserError('Authentication required');
      return;
    }

    setUserLoading(true);
    setUserError(null);

    try {
      let result: PagedResponse<UserManagementResponse>;

      if (effectiveUserSearchTerm === null) {
        return;
      }

      if (effectiveUserSearchTerm) {
        result = await adminApiService.searchUsers(effectiveUserSearchTerm, 0, 1000);
      } else {
        result = await adminApiService.getUsers(0, 1000);
      }

      setUsers(result.content || []);
    } catch {
      setUserError('Failed to load users');
      setUsers([]);
    } finally {
      setUserLoading(false);
    }
  }, [token, effectiveUserSearchTerm]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('tab', newValue.toString());
      return newParams;
    });
  };

  useEffect(() => {
    const currentTabFromUrl = getInitialTab();
    if (currentTabFromUrl !== currentTab) {
      setCurrentTab(currentTabFromUrl);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleHotelChangePage = (_event: unknown, newPage: number) => {
    setHotelPage(newPage);
  };

  const handleHotelChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHotelRowsPerPage(parseInt(event.target.value, 10));
    setHotelPage(0);
  };

  const handleUserChangePage = (_event: unknown, newPage: number) => {
    setUserPage(newPage);
  };

  const handleUserChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserRowsPerPage(parseInt(event.target.value, 10));
    setUserPage(0);
  };

  useEffect(() => {
    if (currentTab === 0) {
      loadHotels();
    } else if (currentTab === 1) {
      loadUsers();
    }
  }, [currentTab, loadHotels, loadUsers]);

  const filteredHotels = hotels.filter(hotel => {
    const appliedHotelSearchTerm = effectiveHotelSearchTerm ?? '';
    const matchesSearch =
      (hotel.name?.toLowerCase().includes(appliedHotelSearchTerm.toLowerCase()) || false) ||
      (hotel.address?.toLowerCase().includes(appliedHotelSearchTerm.toLowerCase()) || false) ||
      (hotel.city?.toLowerCase().includes(appliedHotelSearchTerm.toLowerCase()) || false);
    const matchesStatus = hotelStatusFilter === '' || hotelStatusFilter === 'Active';
    return matchesSearch && matchesStatus;
  });

  const paginatedHotels = filteredHotels.slice(
    hotelPage * hotelRowsPerPage,
    hotelPage * hotelRowsPerPage + hotelRowsPerPage,
  );

  const filteredUsers = users.filter(appUser => {
    const appliedUserSearchTerm = effectiveUserSearchTerm ?? '';
    const matchesSearch =
      appUser.firstName.toLowerCase().includes(appliedUserSearchTerm.toLowerCase()) ||
      appUser.lastName.toLowerCase().includes(appliedUserSearchTerm.toLowerCase()) ||
      appUser.email.toLowerCase().includes(appliedUserSearchTerm.toLowerCase());
    const matchesRole = userRoleFilter === '' || appUser.roles.includes(userRoleFilter);
    const matchesStatus =
      userStatusFilter === '' ||
      (userStatusFilter === 'Active' && appUser.isActive) ||
      (userStatusFilter === 'Inactive' && !appUser.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const paginatedUsers = filteredUsers.slice(
    userPage * userRowsPerPage,
    userPage * userRowsPerPage + userRowsPerPage,
  );

  useEffect(() => {
    if (effectiveHotelSearchTerm !== null) {
      setHotelPage(0);
    }
  }, [effectiveHotelSearchTerm]);

  useEffect(() => {
    if (effectiveUserSearchTerm !== null) {
      setUserPage(0);
    }
  }, [effectiveUserSearchTerm]);

  const canViewUserHotelColumn = Boolean(
    user?.roles?.includes('SUPER_ADMIN') ||
      user?.roles?.includes('ADMIN') ||
      user?.role === 'SUPER_ADMIN' ||
      user?.role === 'ADMIN',
  );

  return (
    <PageContainer maxWidth={false}>
      <PageHeader
        eyebrow="Platform Operations"
        title="System Administration"
        description="Manage platform hotels, user accounts, and audit activity from a consistent administrative workspace."
        actions={<Chip color="primary" label="Platform Console" />}
      />

      <SurfaceCard variantStyle="elevated" contentSx={{ p: 0 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="admin management tabs"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTabs-scrollButtons': {
              '&.Mui-disabled': { opacity: 0.3 },
            },
          }}
        >
          <Tab icon={<Hotel />} label="Hotel Management" id="tab-0" aria-controls="tabpanel-0" />
          <Tab icon={<People />} label="User Management" id="tab-1" aria-controls="tabpanel-1" />
          <Tab icon={<History />} label="Audit Log" id="tab-2" aria-controls="tabpanel-2" />
        </Tabs>
      </SurfaceCard>

      {currentTab === 0 && (
        <DataTableCard
          title="Hotel Management"
          description="Review hotels registered on the platform and jump into detailed administration for individual properties."
          actions={
            <StandardButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/admin/register-hotel?returnTab=${currentTab}`)}
            >
              Register Hotel
            </StandardButton>
          }
          filters={
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <PremiumTextField
                size="small"
                placeholder="Search hotels..."
                value={hotelSearchTerm}
                onChange={(event) => setHotelSearchTerm(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 250 }}
              />
              <PremiumSelect
                label="Status"
                value={hotelStatusFilter}
                onChange={(event) => setHotelStatusFilter(event.target.value)}
                fullWidth={false}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </PremiumSelect>
            </Box>
          }
          pagination={
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredHotels.length}
              rowsPerPage={hotelRowsPerPage}
              page={hotelPage}
              onPageChange={handleHotelChangePage}
              onRowsPerPageChange={handleHotelChangeRowsPerPage}
              labelRowsPerPage="Hotels per page:"
            />
          }
        >
          <Table aria-label="hotels table">
            <TableHead>
              <TableRow>
                <TableCell>Hotel Name</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Rooms</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Registered</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hotelLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={36} />
                    <Typography variant="body2" sx={{ mt: 2 }}>Loading hotels...</Typography>
                  </TableCell>
                </TableRow>
              ) : hotelError ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="error">{hotelError}</Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedHotels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">No hotels found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedHotels.map((hotel) => (
                  <TableRow key={hotel.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Hotel sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {hotel.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                        <Typography variant="body2">
                          {hotel.city}, {hotel.country}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label="Active" size="small" color="success" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{hotel.totalRooms || 'N/A'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">N/A</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {hotel.createdAt ? formatDateForDisplay(hotel.createdAt) : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => navigate(`/admin/hotels/${hotel.id}?returnTab=${currentTab}`)}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DataTableCard>
      )}

      {currentTab === 1 && (
        <DataTableCard
          title="User Management"
          description="Search platform users, review their assigned hotel context, and open the detailed user administration flow."
          actions={
            <StandardButton
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => navigate(`/admin/add-user?returnTab=${currentTab}`)}
            >
              Add User
            </StandardButton>
          }
          filters={
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <PremiumTextField
                size="small"
                placeholder="Search users..."
                value={userSearchTerm}
                onChange={(event) => setUserSearchTerm(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 250 }}
              />
              <PremiumSelect
                label="Role"
                value={userRoleFilter}
                onChange={(event) => setUserRoleFilter(event.target.value)}
                fullWidth={false}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
                <MenuItem value="HOTEL_ADMIN">Hotel Admin</MenuItem>
                <MenuItem value="HOTEL_STAFF">Hotel Staff</MenuItem>
                <MenuItem value="GUEST">Guest</MenuItem>
              </PremiumSelect>
              <PremiumSelect
                label="Status"
                value={userStatusFilter}
                onChange={(event) => setUserStatusFilter(event.target.value)}
                fullWidth={false}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </PremiumSelect>
            </Box>
          }
          pagination={
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={userRowsPerPage}
              page={userPage}
              onPageChange={handleUserChangePage}
              onRowsPerPageChange={handleUserChangeRowsPerPage}
              labelRowsPerPage="Users per page:"
            />
          }
        >
          <Table aria-label="users table">
            <TableHead>
              <TableRow>
                <TableCell>User Name</TableCell>
                <TableCell>Email</TableCell>
                {canViewUserHotelColumn && <TableCell>Hotel</TableCell>}
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userLoading ? (
                <TableRow>
                  <TableCell colSpan={canViewUserHotelColumn ? 8 : 7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={36} />
                    <Typography variant="body2" sx={{ mt: 2 }}>Loading users...</Typography>
                  </TableCell>
                </TableRow>
              ) : userError ? (
                <TableRow>
                  <TableCell colSpan={canViewUserHotelColumn ? 8 : 7} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="error">{userError}</Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canViewUserHotelColumn ? 8 : 7} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">No users found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((appUser) => (
                  <TableRow key={appUser.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <People sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {appUser.firstName} {appUser.lastName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{appUser.email}</Typography>
                    </TableCell>
                    {canViewUserHotelColumn && (
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {appUser.hotelName || 'System-wide'}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell>
                      <Chip
                        label={appUser.roles.length > 0 ? appUser.roles[0] : 'NO_ROLE'}
                        size="small"
                        color={
                          appUser.roles.includes('ADMIN')
                            ? 'error'
                            : appUser.roles.includes('HOTEL_ADMIN')
                              ? 'info'
                              : 'default'
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={appUser.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={appUser.isActive ? 'success' : 'default'}
                        variant={appUser.isActive ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">N/A</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {appUser.createdAt ? formatDateForDisplay(appUser.createdAt) : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => navigate(`/admin/users/${appUser.id}?returnTab=${currentTab}`)}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DataTableCard>
      )}

      {currentTab === 2 && (
        <SurfaceCard variantStyle="elevated">
          <AuditLogTab />
        </SurfaceCard>
      )}

      <Box sx={{ mt: 6, pt: 4, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          BookMyHotel Admin Dashboard - Platform Version 1.0.0
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Secure administration interface for platform management
        </Typography>
      </Box>
    </PageContainer>
  );
};

export default AdminDashboard;