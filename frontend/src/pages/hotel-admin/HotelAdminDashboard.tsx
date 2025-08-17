import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Chip,
  Divider,
  Paper,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Hotel as HotelIcon,
  People as PeopleIcon,
  Room as RoomIcon,
  Assessment as AssessmentIcon,
  BookOnline as BookingIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { hotelAdminApi, BookingResponse, BookingPage, BookingStats } from '../../services/hotelAdminApi';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const HotelAdminDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  // Booking state
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null);
  const [bookingPage, setBookingPage] = useState(0);
  const [bookingSize] = useState(10);
  const [bookingSearch, setBookingSearch] = useState('');
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalBookingPages, setTotalBookingPages] = useState(0);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    // Load bookings when Bookings tab (index 3) is selected
    if (newValue === 3 && token) {
      loadBookings();
      loadBookingStats();
    }
  };

  // Load bookings with current filters
  const loadBookings = async () => {
    if (!token) return;
    
    setBookingsLoading(true);
    setBookingsError(null);
    
    try {
      const result = await hotelAdminApi.getHotelBookings(
        token, 
        bookingPage, 
        bookingSize, 
        bookingSearch
      );
      
      if (result.success && result.data) {
        setBookings(result.data.content);
        setTotalBookings(result.data.totalElements);
        setTotalBookingPages(result.data.totalPages);
      } else {
        setBookingsError(result.message || 'Failed to load bookings');
      }
    } catch (error) {
      setBookingsError('Failed to load bookings');
    } finally {
      setBookingsLoading(false);
    }
  };

  // Load booking statistics
  const loadBookingStats = async () => {
    if (!token) return;
    
    try {
      const result = await hotelAdminApi.getBookingStats(token);
      if (result.success && result.data) {
        setBookingStats(result.data);
      }
    } catch (error) {
      console.error('Failed to load booking stats:', error);
    }
  };

  // Handle booking search
  const handleBookingSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBookingSearch(event.target.value);
  };

  // Handle search submit
  const handleSearchSubmit = () => {
    setBookingPage(0);
    if (token) {
      loadBookings();
    }
  };

  // Handle booking page change
  const handleBookingPageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setBookingPage(value - 1); // MUI Pagination is 1-based, API is 0-based
    if (token) {
      loadBookings();
    }
  };

  // Get status chip color
  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'checked_in': return 'primary';
      case 'checked_out': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': case 'no_show': return 'error';
      default: return 'default';
    }
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Load initial data when component mounts
  useEffect(() => {
    if (activeTab === 3 && token) {
      loadBookings();
      loadBookingStats();
    }
  }, [activeTab, token, bookingPage, bookingSize]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mock data for demonstration
  const hotelData = {
    name: user?.hotelName || 'Grand Plaza Hotel',
    totalRooms: 120,
    availableRooms: 89,
    occupiedRooms: 31,
    totalStaff: 25,
    activeStaff: 23,
  };

  const stats = [
    {
      title: 'Total Rooms',
      value: hotelData.totalRooms,
      icon: <RoomIcon sx={{ fontSize: 40 }} />,
      color: 'primary',
    },
    {
      title: 'Available Rooms',
      value: hotelData.availableRooms,
      icon: <RoomIcon sx={{ fontSize: 40 }} />,
      color: 'success',
    },
    {
      title: 'Occupied Rooms',
      value: hotelData.occupiedRooms,
      icon: <RoomIcon sx={{ fontSize: 40 }} />,
      color: 'warning',
    },
    {
      title: 'Total Staff',
      value: hotelData.totalStaff,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: 'info',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 60, height: 60 }}>
              <HotelIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {hotelData.name}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Hotel Administrator Dashboard
              </Typography>
              <Chip 
                label={`Welcome, ${user?.firstName} ${user?.lastName}`} 
                size="small" 
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', mt: 1 }}
              />
            </Box>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Occupancy Rate
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
              {Math.round((hotelData.occupiedRooms / hotelData.totalRooms) * 100)}%
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ color: `${stat.color}.main`, mb: 2 }}>
                  {stat.icon}
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="hotel admin tabs">
            <Tab icon={<HotelIcon />} label="Hotel Details" />
            <Tab icon={<PeopleIcon />} label="Staff Management" />
            <Tab icon={<RoomIcon />} label="Room Management" />
            <Tab icon={<BookingIcon />} label="Bookings" />
            <Tab icon={<AssessmentIcon />} label="Reports" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          {/* Hotel Details Tab */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Hotel Information
              </Typography>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => alert('Edit Hotel Details - Coming Soon!')}
              >
                Edit Hotel Details
              </Button>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Basic Information</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Hotel Name</Typography>
                  <Typography variant="body1">{hotelData.name}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Address</Typography>
                  <Typography variant="body1">123 Main Street, City, Country</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Contact</Typography>
                  <Typography variant="body1">+1 (555) 123-4567</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Statistics</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Total Rooms</Typography>
                  <Typography variant="body1">{hotelData.totalRooms} rooms</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Current Occupancy</Typography>
                  <Typography variant="body1">{hotelData.occupiedRooms} / {hotelData.totalRooms} rooms</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Staff Members</Typography>
                  <Typography variant="body1">{hotelData.totalStaff} staff members</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {/* Staff Management Tab */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Staff Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => alert('Add Staff Member - Coming Soon!')}
              >
                Add Staff Member
              </Button>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>
              Staff management interface will be implemented here.
              <br />
              Features: Add/Edit/Remove staff, Manage roles (Front Desk, Housekeeping, Hotel Admin)
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {/* Room Management Tab */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Room Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => alert('Add Room - Coming Soon!')}
              >
                Add Room
              </Button>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>
              Room management interface will be implemented here.
              <br />
              Features: Add/Edit/Remove rooms, Set pricing, Manage availability
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          {/* Bookings Tab */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Bookings Management
              </Typography>
              {bookingStats && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Chip 
                    label={`Total: ${bookingStats.totalBookings}`} 
                    color="primary" 
                    variant="outlined" 
                  />
                  <Chip 
                    label={`Revenue: ${formatCurrency(bookingStats.currentYearRevenue)}`} 
                    color="success" 
                    variant="outlined" 
                  />
                </Box>
              )}
            </Box>

            {/* Error Display */}
            {bookingsError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {bookingsError}
              </Alert>
            )}

            {/* Search Bar */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
              <TextField
                placeholder="Search bookings by guest name, email, room number, or status..."
                variant="outlined"
                fullWidth
                value={bookingSearch}
                onChange={handleBookingSearch}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Button 
                variant="contained" 
                onClick={handleSearchSubmit}
                disabled={bookingsLoading}
              >
                Search
              </Button>
            </Box>

            {/* Loading State */}
            {bookingsLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {/* Bookings Table */}
            {!bookingsLoading && (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Confirmation #</TableCell>
                      <TableCell>Guest</TableCell>
                      <TableCell>Room</TableCell>
                      <TableCell>Check-in</TableCell>
                      <TableCell>Check-out</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                            {bookingSearch ? 'No bookings found matching your search.' : 'No bookings found.'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      bookings.map((booking) => (
                        <TableRow key={booking.reservationId}>
                          <TableCell>{booking.confirmationNumber}</TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {booking.guestName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {booking.guestEmail}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {booking.roomNumber} - {booking.roomType}
                          </TableCell>
                          <TableCell>{formatDate(booking.checkInDate)}</TableCell>
                          <TableCell>{formatDate(booking.checkOutDate)}</TableCell>
                          <TableCell>{formatCurrency(booking.totalAmount)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={booking.status.replace('_', ' ')} 
                              color={getStatusColor(booking.status)} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton size="small">
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Pagination */}
            {!bookingsLoading && totalBookingPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination 
                  count={totalBookingPages} 
                  page={bookingPage + 1} // MUI Pagination is 1-based
                  onChange={handleBookingPageChange}
                  color="primary" 
                />
              </Box>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          {/* Reports Tab */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
              Reports & Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>
              Reports and analytics dashboard will be implemented here.
              <br />
              Features: Occupancy reports, Revenue analytics, Staff performance metrics
            </Typography>
          </Box>
        </TabPanel>
      </Card>

      {/* Footer */}
      <Box sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2">
          Hotel Administrator Panel • BookMyHotel System • {new Date().getFullYear()}
        </Typography>
      </Box>
    </Box>
  );
};

export default HotelAdminDashboard;
