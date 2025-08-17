import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Hotel,
  People,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  LocationOn as LocationIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  
  // Hotel pagination and filtering state
  const [hotelPage, setHotelPage] = useState(0);
  const [hotelRowsPerPage, setHotelRowsPerPage] = useState(10);
  const [hotelSearchTerm, setHotelSearchTerm] = useState('');
  const [hotelStatusFilter, setHotelStatusFilter] = useState('');
  
  // User pagination and filtering state
  const [userPage, setUserPage] = useState(0);
  const [userRowsPerPage, setUserRowsPerPage] = useState(10);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // Hotel filtering and pagination handlers
  const handleHotelChangePage = (event: unknown, newPage: number) => {
    setHotelPage(newPage);
  };

  const handleHotelChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHotelRowsPerPage(parseInt(event.target.value, 10));
    setHotelPage(0);
  };

  // User filtering and pagination handlers
  const handleUserChangePage = (event: unknown, newPage: number) => {
    setUserPage(newPage);
  };

  const handleUserChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserRowsPerPage(parseInt(event.target.value, 10));
    setUserPage(0);
  };

  // Sample hotel data - Extended for pagination demo
  const allSampleHotels = [
    {
      id: 1,
      name: 'Grand Plaza Hotel',
      location: 'New York, NY',
      status: 'Active',
      rooms: 150,
      rating: 4.5,
      registeredDate: '2024-01-15'
    },
    {
      id: 2,
      name: 'Ocean View Resort',
      location: 'Miami, FL',
      status: 'Active',
      rooms: 200,
      rating: 4.8,
      registeredDate: '2024-02-20'
    },
    {
      id: 3,
      name: 'Mountain Lodge',
      location: 'Denver, CO',
      status: 'Pending',
      rooms: 75,
      rating: 4.2,
      registeredDate: '2024-03-10'
    },
    {
      id: 4,
      name: 'City Center Inn',
      location: 'Chicago, IL',
      status: 'Active',
      rooms: 120,
      rating: 4.0,
      registeredDate: '2024-01-28'
    },
    {
      id: 5,
      name: 'Seaside Paradise',
      location: 'San Diego, CA',
      status: 'Inactive',
      rooms: 180,
      rating: 4.6,
      registeredDate: '2024-02-05'
    },
    {
      id: 6,
      name: 'Downtown Suites',
      location: 'Seattle, WA',
      status: 'Active',
      rooms: 95,
      rating: 4.3,
      registeredDate: '2024-03-22'
    },
    {
      id: 7,
      name: 'Luxury Resort & Spa',
      location: 'Las Vegas, NV',
      status: 'Active',
      rooms: 300,
      rating: 4.9,
      registeredDate: '2024-01-08'
    },
    {
      id: 8,
      name: 'Budget Inn Express',
      location: 'Phoenix, AZ',
      status: 'Pending',
      rooms: 60,
      rating: 3.8,
      registeredDate: '2024-04-01'
    },
    {
      id: 9,
      name: 'Historic Boutique Hotel',
      location: 'Boston, MA',
      status: 'Active',
      rooms: 85,
      rating: 4.4,
      registeredDate: '2024-02-14'
    },
    {
      id: 10,
      name: 'Riverside Lodge',
      location: 'Portland, OR',
      status: 'Inactive',
      rooms: 110,
      rating: 4.1,
      registeredDate: '2024-03-05'
    },
    {
      id: 11,
      name: 'Metropolitan Hotel',
      location: 'Atlanta, GA',
      status: 'Active',
      rooms: 175,
      rating: 4.2,
      registeredDate: '2024-01-20'
    },
    {
      id: 12,
      name: 'Coastal Resort',
      location: 'San Francisco, CA',
      status: 'Pending',
      rooms: 140,
      rating: 4.7,
      registeredDate: '2024-04-15'
    }
  ];

  // Sample user data - Extended for pagination demo
  const allSampleUsers = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      role: 'HOTEL_MANAGER',
      status: 'Active',
      lastLogin: '2024-08-15',
      createdDate: '2024-01-10'
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@email.com',
      role: 'ADMIN',
      status: 'Active',
      lastLogin: '2024-08-16',
      createdDate: '2024-02-05'
    },
    {
      id: 3,
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@email.com',
      role: 'GUEST',
      status: 'Active',
      lastLogin: '2024-08-14',
      createdDate: '2024-03-12'
    },
    {
      id: 4,
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'sarah.wilson@email.com',
      role: 'HOTEL_MANAGER',
      status: 'Inactive',
      lastLogin: '2024-07-20',
      createdDate: '2024-01-25'
    },
    {
      id: 5,
      firstName: 'David',
      lastName: 'Brown',
      email: 'david.brown@email.com',
      role: 'GUEST',
      status: 'Pending',
      lastLogin: 'Never',
      createdDate: '2024-08-16'
    },
    {
      id: 6,
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@email.com',
      role: 'HOTEL_STAFF',
      status: 'Active',
      lastLogin: '2024-08-16',
      createdDate: '2024-02-18'
    },
    {
      id: 7,
      firstName: 'Robert',
      lastName: 'Miller',
      email: 'robert.miller@email.com',
      role: 'ADMIN',
      status: 'Active',
      lastLogin: '2024-08-17',
      createdDate: '2024-01-01'
    },
    {
      id: 8,
      firstName: 'Lisa',
      lastName: 'Garcia',
      email: 'lisa.garcia@email.com',
      role: 'GUEST',
      status: 'Active',
      lastLogin: '2024-08-13',
      createdDate: '2024-03-30'
    },
    {
      id: 9,
      firstName: 'Tom',
      lastName: 'Anderson',
      email: 'tom.anderson@email.com',
      role: 'HOTEL_MANAGER',
      status: 'Pending',
      lastLogin: 'Never',
      createdDate: '2024-04-10'
    },
    {
      id: 10,
      firstName: 'Maria',
      lastName: 'Rodriguez',
      email: 'maria.rodriguez@email.com',
      role: 'HOTEL_STAFF',
      status: 'Active',
      lastLogin: '2024-08-15',
      createdDate: '2024-02-25'
    },
    {
      id: 11,
      firstName: 'James',
      lastName: 'Taylor',
      email: 'james.taylor@email.com',
      role: 'ADMIN',
      status: 'Inactive',
      lastLogin: '2024-07-05',
      createdDate: '2024-01-15'
    },
    {
      id: 12,
      firstName: 'Anna',
      lastName: 'White',
      email: 'anna.white@email.com',
      role: 'GUEST',
      status: 'Active',
      lastLogin: '2024-08-16',
      createdDate: '2024-04-20'
    }
  ];

  // Filter and paginate hotels
  const filteredHotels = allSampleHotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(hotelSearchTerm.toLowerCase()) ||
                         hotel.location.toLowerCase().includes(hotelSearchTerm.toLowerCase());
    const matchesStatus = hotelStatusFilter === '' || hotel.status === hotelStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedHotels = filteredHotels.slice(
    hotelPage * hotelRowsPerPage,
    hotelPage * hotelRowsPerPage + hotelRowsPerPage
  );

  // Filter and paginate users
  const filteredUsers = allSampleUsers.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(userSearchTerm.toLowerCase());
    const matchesRole = userRoleFilter === '' || user.role === userRoleFilter;
    const matchesStatus = userStatusFilter === '' || user.status === userStatusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const paginatedUsers = filteredUsers.slice(
    userPage * userRowsPerPage,
    userPage * userRowsPerPage + userRowsPerPage
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          System Administration Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Manage hotels, users, and platform-wide settings
        </Typography>
      </Box>

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
                  {paginatedHotels.map((hotel) => (
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
                            {hotel.location}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={hotel.status}
                          size="small"
                          color={
                            hotel.status === 'Active' 
                              ? 'success' 
                              : hotel.status === 'Pending' 
                                ? 'warning' 
                                : 'default'
                          }
                          variant={hotel.status === 'Inactive' ? 'outlined' : 'filled'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {hotel.rooms}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          ⭐ {hotel.rating}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {hotel.registeredDate}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/admin/hotels/${hotel.id}`)}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Hotel">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/admin/hotels/${hotel.id}/edit`)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
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
                  {paginatedUsers.map((user) => (
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
                          label={user.role}
                          size="small"
                          color={
                            user.role === 'ADMIN' 
                              ? 'error' 
                              : user.role === 'HOTEL_MANAGER'
                                ? 'info'
                                : 'default'
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.status}
                          size="small"
                          color={
                            user.status === 'Active' 
                              ? 'success' 
                              : user.status === 'Pending' 
                                ? 'warning' 
                                : 'default'
                          }
                          variant={user.status === 'Inactive' ? 'outlined' : 'filled'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {user.lastLogin}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {user.createdDate}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/admin/users/${user.id}`)}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit User">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
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
