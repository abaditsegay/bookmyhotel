import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Chip,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  Hotel,
  People,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  Visibility as ViewIcon,
  LocationOn as LocationIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { adminApiService, UserManagementResponse, HotelDTO, PagedResponse } from '../../services/adminApi';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get initial tab from URL parameter, default to 0 if not present
  const getInitialTab = () => {
    const tabParam = searchParams.get('tab');
    const tab = tabParam ? parseInt(tabParam, 10) : 0;
    return isNaN(tab) || tab < 0 || tab > 1 ? 0 : tab; // Only 2 tabs (0-1)
  };
  
  const [currentTab, setCurrentTab] = useState(getInitialTab);

  // Hotel management state
  const [hotels, setHotels] = useState<HotelDTO[]>([]);
  const [hotelPage, setHotelPage] = useState(0);
  const [hotelRowsPerPage, setHotelRowsPerPage] = useState(10);
  const [hotelSearchTerm, setHotelSearchTerm] = useState('');
  const [hotelStatusFilter, setHotelStatusFilter] = useState('');
  const [hotelLoading, setHotelLoading] = useState(false);
  const [hotelError, setHotelError] = useState<string | null>(null);

  // User management state
  const [users, setUsers] = useState<UserManagementResponse[]>([]);
  const [userPage, setUserPage] = useState(0);
  const [userRowsPerPage, setUserRowsPerPage] = useState(10);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('');
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  // Set token on component mount
  useEffect(() => {
    if (token) {
      adminApiService.setToken(token);
    }
  }, [token]);

  // Hotel management functions
  const loadHotels = useCallback(async () => {
    if (!token) {
      setHotelError('Authentication required');
      return;
    }

    setHotelLoading(true);
    setHotelError(null);

    try {
      let result: PagedResponse<HotelDTO>;
      
      if (hotelSearchTerm.trim()) {
        result = await adminApiService.searchHotels(hotelSearchTerm, hotelPage, hotelRowsPerPage);
      } else {
        result = await adminApiService.getHotels(hotelPage, hotelRowsPerPage);
      }

      setHotels(result.content || []);
    } catch (error) {
      setHotelError('Failed to load hotels');
      setHotels([]);
      console.error('Error loading hotels:', error);
    } finally {
      setHotelLoading(false);
    }
  }, [token, hotelSearchTerm, hotelPage, hotelRowsPerPage]);

  const loadUsers = useCallback(async () => {
    if (!token) {
      setUserError('Authentication required');
      return;
    }

    setUserLoading(true);
    setUserError(null);

    try {
      let result: PagedResponse<UserManagementResponse>;
      
      if (userSearchTerm.trim()) {
        result = await adminApiService.searchUsers(userSearchTerm, userPage, userRowsPerPage);
      } else {
        result = await adminApiService.getUsers(userPage, userRowsPerPage);
      }

      setUsers(result.content || []);
    } catch (error) {
      setUserError('Failed to load users');
      setUsers([]);
      console.error('Error loading users:', error);
    } finally {
      setUserLoading(false);
    }
  }, [token, userSearchTerm, userPage, userRowsPerPage]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    
    // Update URL parameter to persist tab state
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('tab', newValue.toString());
      return newParams;
    });
  };

  // Sync tab state with URL parameter changes (for browser back/forward navigation)
  useEffect(() => {
    const currentTabFromUrl = getInitialTab();
    if (currentTabFromUrl !== currentTab) {
      setCurrentTab(currentTabFromUrl);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Hotel pagination handlers
  const handleHotelChangePage = (event: unknown, newPage: number) => {
    setHotelPage(newPage);
  };

  const handleHotelChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHotelRowsPerPage(parseInt(event.target.value, 10));
    setHotelPage(0);
  };

  // User pagination handlers  
  const handleUserChangePage = (event: unknown, newPage: number) => {
    setUserPage(newPage);
  };

  const handleUserChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserRowsPerPage(parseInt(event.target.value, 10));
    setUserPage(0);
  };

  // Load data when tab changes
  useEffect(() => {
    if (currentTab === 0) {
      loadHotels();
    } else if (currentTab === 1) {
      loadUsers();
    }
  }, [currentTab, hotelPage, hotelRowsPerPage, userPage, userRowsPerPage, loadHotels, loadUsers]);

  // Search handlers
  // Filter and paginate hotels
  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(hotelSearchTerm.toLowerCase()) ||
                         hotel.address.toLowerCase().includes(hotelSearchTerm.toLowerCase()) ||
                         hotel.city.toLowerCase().includes(hotelSearchTerm.toLowerCase());
    // Note: HotelDTO doesn't have status field, so we'll show all hotels for now
    return matchesSearch;
  });

  const paginatedHotels = filteredHotels.slice(
    hotelPage * hotelRowsPerPage,
    hotelPage * hotelRowsPerPage + hotelRowsPerPage
  );

  // Filter and paginate users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(userSearchTerm.toLowerCase());
    const matchesRole = userRoleFilter === '' || user.roles.includes(userRoleFilter);
    // Note: UserManagementResponse uses isActive boolean instead of status string
    const matchesStatus = userStatusFilter === '' || 
                         (userStatusFilter === 'Active' && user.isActive) ||
                         (userStatusFilter === 'Inactive' && !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

    const paginatedUsers = filteredUsers.slice(
    userPage * userRowsPerPage,
    userPage * userRowsPerPage + userRowsPerPage
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Main Management Tabs */}
      <Paper sx={{ width: '100%', mb: 4 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="admin management tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            icon={<Hotel />}
            label="Hotel Management"
            id="tab-0"
            aria-controls="tabpanel-0"
          />
          <Tab
            icon={<People />}
            label="User Management"
            id="tab-1"
            aria-controls="tabpanel-1"
          />
        </Tabs>

        {/* Hotel Management Tab */}
        {currentTab === 0 && (
          <Box sx={{ p: 3 }}>
            {/* Header with Register Hotel Button */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Hotel Management
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/admin/register-hotel')}
                sx={{ height: 'fit-content' }}
              >
                Register Hotel
              </Button>
            </Box>

            {/* Search and Filter Controls */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Search hotels..."
                value={hotelSearchTerm}
                onChange={(e) => setHotelSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 250 }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={hotelStatusFilter}
                  onChange={(e) => setHotelStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Hotels Table */}
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table aria-label="hotels table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Hotel Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Rooms</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Rating</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Registered</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {hotelLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={40} />
                        <Typography variant="body2" sx={{ mt: 2 }}>Loading hotels...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : hotelError ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="error">{hotelError}</Typography>
                      </TableCell>
                    </TableRow>
                  ) : paginatedHotels.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">No hotels found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedHotels.map((hotel) => (
                    <TableRow key={hotel.id} sx={{ '&:hover': { backgroundColor: 'grey.50' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Hotel sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
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
                        <Chip
                          label="Active"
                          size="small"
                          color="success"
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {hotel.totalRooms || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          N/A
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {hotel.createdAt ? new Date(hotel.createdAt).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/admin/hotels/${hotel.id}?returnTab=${currentTab}`)}
                            >
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
              
              {/* Table Pagination */}
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
            </TableContainer>
          </Box>
        )}

        {/* User Management Tab */}
        {currentTab === 1 && (
          <Box sx={{ p: 3 }}>
            {/* Header with Add User Button */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  User Management
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => navigate('/admin/add-user')}
                sx={{ height: 'fit-content' }}
              >
                Add User
              </Button>
            </Box>

            {/* Search and Filter Controls */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Search users..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 250 }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  label="Role"
                >
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                  <MenuItem value="HOTEL_MANAGER">Hotel Manager</MenuItem>
                  <MenuItem value="HOTEL_STAFF">Hotel Staff</MenuItem>
                  <MenuItem value="GUEST">Guest</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Users Table */}
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table aria-label="users table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>User Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Last Login</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={40} />
                        <Typography variant="body2" sx={{ mt: 2 }}>Loading users...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : userError ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="error">{userError}</Typography>
                      </TableCell>
                    </TableRow>
                  ) : paginatedUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">No users found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedUsers.map((user) => (
                    <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: 'grey.50' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <People sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {user.firstName} {user.lastName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {user.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.roles.length > 0 ? user.roles[0] : 'NO_ROLE'}
                          size="small"
                          color={
                            user.roles.includes('ADMIN') 
                              ? 'error' 
                              : user.roles.includes('HOTEL_MANAGER')
                                ? 'info'
                                : 'default'
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          color={user.isActive ? 'success' : 'default'}
                          variant={user.isActive ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          N/A
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/admin/users/${user.id}?returnTab=${currentTab}`)}
                            >
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
              
              {/* Table Pagination */}
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
            </TableContainer>
          </Box>
        )}
      </Paper>

      {/* Footer */}
      <Box sx={{ mt: 6, pt: 4, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          BookMyHotel Admin Dashboard - Platform Version 1.0.0
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Secure administration interface for platform management
        </Typography>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
