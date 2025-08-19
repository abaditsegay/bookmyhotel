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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { hotelAdminApi, BookingResponse, BookingStats } from '../../services/hotelAdminApi';
import { Hotel } from '../../types/hotel';
import RoomManagement from './RoomManagement';
import StaffManagement from './StaffManagement';
import HotelEditDialog from '../../components/hotel/HotelEditDialog';

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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get initial tab from URL parameter, default to 0 if not present
  const getInitialTab = () => {
    const tabParam = searchParams.get('tab');
    const tab = tabParam ? parseInt(tabParam, 10) : 0;
    return isNaN(tab) || tab < 0 || tab > 4 ? 0 : tab;
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Booking state
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null);
  const [bookingPage, setBookingPage] = useState(0);
  const [bookingSize, setBookingSize] = useState(5); // Make mutable for TablePagination
  const [bookingSearch, setBookingSearch] = useState('');
  const [totalBookingElements, setTotalBookingElements] = useState(0); // Add for TablePagination
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  // Delete booking dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);

  // Hotel state
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [hotelLoading, setHotelLoading] = useState(false);
  const [hotelError, setHotelError] = useState<string | null>(null);
  const [hotelEditDialogOpen, setHotelEditDialogOpen] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    // Update URL parameter to persist tab state
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('tab', newValue.toString());
      return newParams;
    });
    
    // Load bookings when Bookings tab (index 3) is selected
    if (newValue === 3) {
      loadBookings();
      loadBookingStats();
    }
  };

  // Load bookings with current filters
  const loadBookings = async () => {
    if (!token) {
      setBookingsError('Authentication required');
      return;
    }
    
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
        console.log('Booking API Response:', result.data);
        console.log('Page Object:', result.data.page);
        
        setBookings(result.data.content || []);
        
        // Extract pagination info from the page object
        const pageInfo = result.data.page || {};
        const totalPages = pageInfo.totalPages || 0;
        const totalElements = pageInfo.totalElements || 0;
        const currentPageNumber = pageInfo.number || 0;
        
        console.log('Total Pages from page object:', totalPages);
        console.log('Total Elements from page object:', totalElements);
        console.log('Current Page from page object:', currentPageNumber);
        
        // Calculate pages if not provided or if we have content but no pagination info
        const calculatedPages = totalPages > 0 ? totalPages : Math.ceil(Math.max(totalElements, result.data.content?.length || 0) / bookingSize);
        console.log('Final Total Pages:', calculatedPages);
        setTotalBookingElements(totalElements);
      } else {
        setBookingsError(result.message || 'Failed to load bookings');
        setBookings([]);
        setTotalBookingElements(0);
      }
    } catch (error) {
      setBookingsError('Failed to load bookings');
      setBookings([]);
      setTotalBookingElements(0);
    } finally {
      setBookingsLoading(false);
    }
  };

  // Load booking statistics
  const loadBookingStats = async () => {
    if (!token) {
      console.warn('No token available for loading booking stats');
      return;
    }
    
    try {
      const result = await hotelAdminApi.getBookingStats(token);
      if (result.success && result.data) {
        setBookingStats(result.data);
      } else {
        console.error('Failed to load booking stats:', result.message);
      }
    } catch (error) {
      console.error('Failed to load booking stats:', error);
    }
  };

  // Load initial data on component mount
  React.useEffect(() => {
    // Load bookings data on component mount for demo purposes
    loadBookings();
    loadBookingStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const handleBookingPageChange = (event: React.ChangeEvent<unknown> | null, newPage: number) => {
    setBookingPage(newPage);
    // Don't call loadBookings here as useEffect will handle it
  };

  // Handle rows per page change for bookings
  const handleBookingRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(event.target.value, 10);
    setBookingSize(newSize);
    setBookingPage(0); // Reset to first page
  };

  // Handle view booking details
  const handleViewBookingDetails = (booking: BookingResponse) => {
    // Navigate to the booking details page with current tab preserved
    navigate(`/hotel-admin/bookings/${booking.reservationId}?returnTab=${activeTab}`);
  };

  // Navigation handlers for child components
  const handleRoomNavigation = (roomId: number) => {
    navigate(`/hotel-admin/rooms/${roomId}?returnTab=${activeTab}`);
  };

  const handleStaffNavigation = (staffId: number) => {
    navigate(`/hotel-admin/staff/${staffId}?returnTab=${activeTab}`);
  };

  const handleDeleteBooking = async () => {
    if (!selectedBooking || !token) return;
    
    try {
      setBookingsLoading(true);
      const response = await hotelAdminApi.deleteBooking(token, selectedBooking.reservationId);
      if (response.success) {
        setDeleteDialogOpen(false);
        setSelectedBooking(null);
        await loadBookings();
        setBookingsError(null);
      } else {
        setBookingsError(response.message || 'Failed to delete booking');
      }
    } catch (err) {
      console.error('Error deleting booking:', err);
      setBookingsError('Failed to delete booking');
    } finally {
      setBookingsLoading(false);
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

  // Load hotel data
  const loadHotelData = async () => {
    if (!token) {
      setHotelError('Authentication required');
      return;
    }
    
    setHotelLoading(true);
    setHotelError(null);
    
    try {
      const result = await hotelAdminApi.getMyHotel(token);
      if (result.success && result.data) {
        setHotel(result.data);
      } else {
        setHotelError(result.message || 'Failed to load hotel data');
      }
    } catch (err) {
      console.error('Error loading hotel data:', err);
      setHotelError('Failed to load hotel data');
    } finally {
      setHotelLoading(false);
    }
  };

  // Update hotel data
  const handleHotelUpdate = async (hotelData: Partial<Hotel>) => {
    if (!token) {
      throw new Error('Authentication required');
    }

    const result = await hotelAdminApi.updateMyHotel(token, hotelData);
    if (result.success && result.data) {
      setHotel(result.data);
    } else {
      throw new Error(result.message || 'Failed to update hotel');
    }
  };

  // Open hotel edit dialog
  const handleEditHotel = () => {
    setHotelEditDialogOpen(true);
  };

  // Load initial data when component mounts or tab changes
  useEffect(() => {
    // Load hotel data when Hotel Details tab (index 0) is selected
    if (activeTab === 0 && token) {
      loadHotelData();
    }
    // Load bookings when Bookings tab (index 3) is selected
    if (activeTab === 3 && token) {
      loadBookings();
      loadBookingStats();
    }
  }, [activeTab, token, bookingPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync tab state with URL parameter changes (for browser back/forward navigation)
  useEffect(() => {
    const currentTab = getInitialTab();
    if (currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mock data for demonstration - will be replaced with real data from hotel state
  const hotelData = hotel ? {
    name: hotel.name || user?.hotelName || 'Grand Plaza Hotel',
    totalRooms: hotel.totalRooms || 120,
    availableRooms: hotel.availableRooms || 89,
    occupiedRooms: (hotel.totalRooms || 120) - (hotel.availableRooms || 89),
    totalStaff: hotel.totalStaff || 25,
    activeStaff: 23, // This would need to come from staff API
  } : {
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
      color: 'primary',
    },
    {
      title: 'Available Rooms',
      value: hotelData.availableRooms,
      color: 'success',
    },
    {
      title: 'Occupied Rooms',
      value: hotelData.occupiedRooms,
      color: 'warning',
    },
    {
      title: 'Total Staff',
      value: hotelData.totalStaff,
      color: 'info',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
          {hotelData.name}
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={6} sm={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: `${stat.color}.main` }}>
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
            <Tab label="Hotel Detail" />
            <Tab label="Staff" />
            <Tab label="Rooms" />
            <Tab label="Bookings" />
            <Tab label="Reports" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          {/* Hotel Details Tab */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Hotel Information
              </Typography>
              <Button
                variant="contained"
                onClick={handleEditHotel}
                disabled={hotelLoading}
              >
                Edit Hotel Details
              </Button>
            </Box>
            
            {/* Show loading or error states */}
            {hotelLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            )}
            
            {hotelError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {hotelError}
              </Alert>
            )}
            
            {!hotelLoading && !hotelError && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Basic Information</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Hotel Name</Typography>
                    <Typography variant="body1">{hotel?.name || hotelData.name}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Description</Typography>
                    <Typography variant="body1">{hotel?.description || 'No description available'}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Address</Typography>
                    <Typography variant="body1">
                      {hotel?.address || 'Address not set'}
                      {hotel?.city && `, ${hotel.city}`}
                      {hotel?.country && `, ${hotel.country}`}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1">{hotel?.phone || 'Phone not set'}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{hotel?.email || 'Email not set'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Statistics</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Total Rooms</Typography>
                    <Typography variant="body1">{hotelData.totalRooms} rooms</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Staff Members</Typography>
                    <Typography variant="body1">{hotelData.totalStaff} staff members</Typography>
                  </Box>
                  {hotel?.isActive !== undefined && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <Chip 
                        label={hotel.isActive ? 'Active' : 'Inactive'} 
                        color={hotel.isActive ? 'success' : 'error'} 
                        size="small"
                      />
                    </Box>
                  )}
                </Grid>
              </Grid>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {/* Staff Management Tab */}
          <StaffManagement onNavigateToStaff={handleStaffNavigation} />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {/* Room Management Tab */}
          <RoomManagement onNavigateToRoom={handleRoomNavigation} />
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
              <>
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
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Tooltip title="View Details">
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleViewBookingDetails(booking)}
                                  >
                                    <VisibilityIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Booking">
                                  <IconButton 
                                    size="small"
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setDeleteDialogOpen(true);
                                    }}
                                    color="error"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={totalBookingElements}
                  rowsPerPage={bookingSize}
                  page={bookingPage}
                  onPageChange={handleBookingPageChange}
                  onRowsPerPageChange={handleBookingRowsPerPageChange}
                  rowsPerPageOptions={[5, 10, 25]}
                />
              </>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          {/* Reports Tab */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
              Reports & Analytics
            </Typography>
            
            {/* Report Type Selection */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Daily Occupancy Report
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Today's room occupancy and revenue
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        74%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        89 of 120 rooms occupied
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      <strong>Revenue:</strong> $12,450
                    </Typography>
                    <Typography variant="body2">
                      <strong>Check-ins:</strong> 15
                    </Typography>
                    <Typography variant="body2">
                      <strong>Check-outs:</strong> 12
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Monthly Occupancy Report
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Current month performance
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        78%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Average occupancy this month
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      <strong>Total Revenue:</strong> $287,340
                    </Typography>
                    <Typography variant="body2">
                      <strong>Total Bookings:</strong> 342
                    </Typography>
                    <Typography variant="body2">
                      <strong>Avg Daily Rate:</strong> $165
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Yearly Occupancy Report
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Year-to-date performance
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                        72%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Average occupancy this year
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      <strong>YTD Revenue:</strong> $2,156,780
                    </Typography>
                    <Typography variant="body2">
                      <strong>Total Bookings:</strong> 2,847
                    </Typography>
                    <Typography variant="body2">
                      <strong>Avg Daily Rate:</strong> $158
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Detailed Reports Table */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                  Monthly Breakdown
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Month</strong></TableCell>
                        <TableCell><strong>Occupancy Rate</strong></TableCell>
                        <TableCell><strong>Total Rooms Sold</strong></TableCell>
                        <TableCell><strong>Revenue</strong></TableCell>
                        <TableCell><strong>Avg Daily Rate</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[
                        { month: 'January 2025', occupancy: '68%', roomsSold: 2108, revenue: '$312,450', adr: '$148' },
                        { month: 'February 2025', occupancy: '72%', roomsSold: 2016, revenue: '$298,780', adr: '$148' },
                        { month: 'March 2025', occupancy: '75%', roomsSold: 2325, revenue: '$365,120', adr: '$157' },
                        { month: 'April 2025', occupancy: '78%', roomsSold: 2340, revenue: '$378,450', adr: '$162' },
                        { month: 'May 2025', occupancy: '82%', roomsSold: 2542, revenue: '$425,680', adr: '$167' },
                        { month: 'June 2025', occupancy: '85%', roomsSold: 2550, revenue: '$445,500', adr: '$175' },
                        { month: 'July 2025', occupancy: '88%', roomsSold: 2728, revenue: '$486,720', adr: '$178' },
                        { month: 'August 2025', occupancy: '78%', roomsSold: 2419, revenue: '$387,040', adr: '$160' },
                      ].map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.month}</TableCell>
                          <TableCell>
                            <Chip 
                              label={row.occupancy} 
                              color={parseInt(row.occupancy) >= 80 ? 'success' : parseInt(row.occupancy) >= 70 ? 'warning' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{row.roomsSold.toLocaleString()}</TableCell>
                          <TableCell>{row.revenue}</TableCell>
                          <TableCell>{row.adr}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* Additional Analytics */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                      Room Type Performance
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Standard Rooms</span>
                        <span><strong>85% occupancy</strong></span>
                      </Typography>
                      <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, mt: 0.5 }}>
                        <Box sx={{ width: '85%', bgcolor: 'success.main', height: 6, borderRadius: 1 }} />
                      </Box>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Deluxe Rooms</span>
                        <span><strong>78% occupancy</strong></span>
                      </Typography>
                      <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, mt: 0.5 }}>
                        <Box sx={{ width: '78%', bgcolor: 'warning.main', height: 6, borderRadius: 1 }} />
                      </Box>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Suite Rooms</span>
                        <span><strong>65% occupancy</strong></span>
                      </Typography>
                      <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, mt: 0.5 }}>
                        <Box sx={{ width: '65%', bgcolor: 'info.main', height: 6, borderRadius: 1 }} />
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Premium Suites</span>
                        <span><strong>58% occupancy</strong></span>
                      </Typography>
                      <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, mt: 0.5 }}>
                        <Box sx={{ width: '58%', bgcolor: 'error.main', height: 6, borderRadius: 1 }} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                      Key Metrics
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Average Length of Stay</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>2.4 nights</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Revenue per Available Room (RevPAR)</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>$117</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Cancellation Rate</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>8.5%</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">No-Show Rate</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>3.2%</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete booking {selectedBooking?.confirmationNumber}? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteBooking}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hotel Edit Dialog */}
      <HotelEditDialog
        open={hotelEditDialogOpen}
        onClose={() => setHotelEditDialogOpen(false)}
        onSave={handleHotelUpdate}
        hotel={hotel}
        loading={hotelLoading}
        error={hotelError || undefined}
      />
    </Box>
  );
};

export default HotelAdminDashboard;
