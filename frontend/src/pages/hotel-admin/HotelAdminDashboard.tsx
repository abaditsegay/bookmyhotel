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
  Refresh,
  MeetingRoom,
  TrendingUp,
  Hotel as HotelIcon,
  People,
  ArrowBack,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { hotelAdminApi, BookingResponse, BookingStats, HotelStatistics } from '../../services/hotelAdminApi';
import { Hotel } from '../../types/hotel';
import RoomManagement from './RoomManagement';
import StaffManagement from './StaffManagement';
import StaffScheduleManagement from '../../components/StaffScheduleManagement';
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
    return isNaN(tab) || tab < 0 || tab > 5 ? 0 : tab;
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

  // Reports state
  const [reportsData, setReportsData] = useState<{
    hotelStats: HotelStatistics | null;
    bookingStats: BookingStats | null;
    loading: boolean;
    error: string | null;
  }>({
    hotelStats: null,
    bookingStats: null,
    loading: false,
    error: null
  });

  // Navigation state to track if user came from Reports
  const [cameFromReports, setCameFromReports] = useState(false);
  
  const [hotelEditDialogOpen, setHotelEditDialogOpen] = useState(false);

  // All useEffect hooks must be defined before any conditional returns
  // Load initial data on component mount
  React.useEffect(() => {
    // Load essential data including statistics for dashboard cards
    loadBookings();
    loadBookingStats();
    loadReportsData(); // Load hotel statistics for dashboard cards
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load hotel data on initial mount
  useEffect(() => {
    if (token) {
      loadHotelData();
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load initial data when component mounts or tab changes
  useEffect(() => {
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

  // Role-based access control - check after all hooks
  const hasHotelAdminAccess = user?.roles?.includes('HOTEL_ADMIN') || user?.role === 'HOTEL_ADMIN';
  
  // If user doesn't have hotel admin access, show error and redirect
  if (!hasHotelAdminAccess) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Access Restricted
          </Typography>
          <Typography variant="body1" gutterBottom>
            You need HOTEL_ADMIN role to access the hotel administration dashboard.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your current role is: <strong>{user?.roles?.[0] || user?.role || 'Unknown'}</strong>
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="contained" 
              onClick={() => navigate('/')}
              sx={{ mr: 1 }}
            >
              Go to Home
            </Button>
            {user?.roles?.includes('OPERATIONS_SUPERVISOR') && (
              <Button 
                variant="outlined" 
                onClick={() => navigate('/operations/dashboard')}
              >
                Go to Operations Dashboard
              </Button>
            )}
            {user?.roles?.includes('FRONTDESK') && (
              <Button 
                variant="outlined" 
                onClick={() => navigate('/frontdesk/dashboard')}
              >
                Go to Front Desk Dashboard
              </Button>
            )}
          </Box>
        </Alert>
      </Box>
    );
  }

  // Helper function to render breadcrumb navigation
  const renderBackToReportsButton = () => {
    if (!cameFromReports) return null;
    
    return (
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => setActiveTab(4)}
          variant="outlined"
          size="small"
          color="primary"
        >
          Back to Reports
        </Button>
      </Box>
    );
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    // Track if user is coming from Reports tab (index 4)
    if (activeTab === 4 && (newValue === 1 || newValue === 2 || newValue === 3)) {
      setCameFromReports(true);
    } else {
      setCameFromReports(false);
    }
    
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
    
    // Load reports data when Reports tab (index 4) is selected
    if (newValue === 4) {
      loadReportsData();
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

  // Load reports data (hotel statistics + booking statistics)
  const loadReportsData = async () => {
    if (!token) {
      setReportsData(prev => ({ ...prev, error: 'Authentication required' }));
      return;
    }
    
    setReportsData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [hotelStatsResult, bookingStatsResult] = await Promise.all([
        hotelAdminApi.getHotelStatistics(token),
        hotelAdminApi.getBookingStats(token)
      ]);
      
      setReportsData({
        hotelStats: hotelStatsResult.success ? hotelStatsResult.data || null : null,
        bookingStats: bookingStatsResult.success ? bookingStatsResult.data || null : null,
        loading: false,
        error: null
      });
      
      if (!hotelStatsResult.success) {
        console.error('Failed to load hotel stats:', hotelStatsResult.message);
      }
      
      if (!bookingStatsResult.success) {
        console.error('Failed to load booking stats:', bookingStatsResult.message);
      }
    } catch (error) {
      console.error('Failed to load reports data:', error);
      setReportsData({
        hotelStats: null,
        bookingStats: null,
        loading: false,
        error: 'Failed to load reports data'
      });
    }
  };

  // Helper function to render breadcrumb navigation
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

  // Use statistics data from API instead of basic hotel data
  const hotelData = hotel ? {
    name: hotel.name || user?.hotelName || 'Loading...',
    totalRooms: reportsData.hotelStats?.totalRooms || hotel.totalRooms || 0,
    availableRooms: reportsData.hotelStats?.availableRooms || hotel.availableRooms || 0,
    bookedRooms: reportsData.hotelStats?.bookedRooms || hotel.bookedRooms || 0,
    totalStaff: reportsData.hotelStats?.totalStaff || hotel.totalStaff || 0,
    activeStaff: reportsData.hotelStats?.activeStaff || hotel.totalStaff || 0,
  } : {
    name: user?.hotelName || (hotelLoading ? 'Loading hotel...' : 'Hotel information not available'),
    totalRooms: reportsData.hotelStats?.totalRooms || 0,
    availableRooms: reportsData.hotelStats?.availableRooms || 0,
    bookedRooms: reportsData.hotelStats?.bookedRooms || 0,
    totalStaff: reportsData.hotelStats?.totalStaff || 0,
    activeStaff: reportsData.hotelStats?.activeStaff || 0,
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
      title: 'Booked Rooms',
      value: hotelData.bookedRooms,
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
            <Tab label="Staff Schedules" />
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
          {renderBackToReportsButton()}
          <StaffManagement onNavigateToStaff={handleStaffNavigation} />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {/* Room Management Tab */}
          {renderBackToReportsButton()}
          <RoomManagement onNavigateToRoom={handleRoomNavigation} />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          {/* Bookings Tab */}
          {renderBackToReportsButton()}
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
          <StaffScheduleManagement />
        </TabPanel>

        <TabPanel value={activeTab} index={5}>
          {/* Reports Tab */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Reports & Analytics
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadReportsData}
                disabled={reportsData.loading}
              >
                Refresh Data
              </Button>
            </Box>
            
            {reportsData.loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2 }}>
                  Loading analytics data...
                </Typography>
              </Box>
            )}

            {reportsData.error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {reportsData.error}
              </Alert>
            )}

            {!reportsData.loading && !reportsData.error && (
              <>
                {/* Key Statistics Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <MeetingRoom sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          {reportsData.hotelStats?.totalRooms || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Rooms
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          {reportsData.hotelStats?.availableRooms || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Available Rooms
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <HotelIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                          {reportsData.hotelStats?.bookedRooms || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Occupied Rooms
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <People sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                          {reportsData.hotelStats?.activeStaff || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Active Staff
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Occupancy and Revenue Reports */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                          Current Occupancy
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Real-time room occupancy status
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            {reportsData.hotelStats && reportsData.hotelStats.totalRooms > 0
                              ? Math.round((reportsData.hotelStats.bookedRooms / reportsData.hotelStats.totalRooms) * 100)
                              : 0}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {reportsData.hotelStats?.bookedRooms || 0} of {reportsData.hotelStats?.totalRooms || 0} rooms occupied
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                          Year-to-Date Revenue
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Total revenue for current year
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                            ${reportsData.bookingStats?.currentYearRevenue?.toLocaleString() || '0'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Generated from bookings
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                          Total Bookings
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          All-time booking count
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                            {reportsData.bookingStats?.totalBookings || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            This month: {reportsData.bookingStats?.thisMonthBookings || 0}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Booking Status Breakdown */}
                {reportsData.bookingStats?.statusBreakdown && (
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                        Booking Status Overview
                      </Typography>
                      <Grid container spacing={2}>
                        {Object.entries(reportsData.bookingStats.statusBreakdown).map(([status, count]) => (
                          <Grid item xs={12} sm={6} md={3} key={status}>
                            <Card variant="outlined">
                              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                                  {count}
                                </Typography>
                                <Chip 
                                  label={status.replace('_', ' ')}
                                  size="small"
                                  color={
                                    status === 'CONFIRMED' ? 'success' :
                                    status === 'CHECKED_IN' ? 'primary' :
                                    status === 'CHECKED_OUT' ? 'info' :
                                    status === 'CANCELLED' ? 'error' :
                                    'default'
                                  }
                                />
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {/* Room Type Performance */}
                {reportsData.hotelStats?.roomsByType && Object.keys(reportsData.hotelStats.roomsByType).length > 0 && (
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                            Room Type Distribution
                          </Typography>
                          {Object.entries(reportsData.hotelStats.roomsByType).map(([roomType, count]) => (
                            <Box key={roomType} sx={{ mb: 2 }}>
                              <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>{roomType.replace('_', ' ')}</span>
                                <span><strong>{count} rooms</strong></span>
                              </Typography>
                              <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, mt: 0.5 }}>
                                <Box 
                                  sx={{ 
                                    width: `${reportsData.hotelStats && reportsData.hotelStats.totalRooms > 0 
                                      ? (Number(count) / reportsData.hotelStats.totalRooms) * 100 
                                      : 0}%`, 
                                    bgcolor: 'primary.main', 
                                    height: 6, 
                                    borderRadius: 1 
                                  }} 
                                />
                              </Box>
                            </Box>
                          ))}
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                            Staff by Role
                          </Typography>
                          {reportsData.hotelStats?.staffByRole && Object.keys(reportsData.hotelStats.staffByRole).length > 0 ? (
                            Object.entries(reportsData.hotelStats.staffByRole).map(([role, count]) => (
                              <Box key={role} sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span>{role.replace('_', ' ')}</span>
                                  <span><strong>{count} staff</strong></span>
                                </Typography>
                                <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, mt: 0.5 }}>
                                  <Box 
                                    sx={{ 
                                      width: `${reportsData.hotelStats && reportsData.hotelStats.totalStaff > 0 
                                        ? (Number(count) / reportsData.hotelStats.totalStaff) * 100 
                                        : 0}%`, 
                                      bgcolor: 'secondary.main', 
                                      height: 6, 
                                      borderRadius: 1 
                                    }} 
                                  />
                                </Box>
                              </Box>
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No staff role data available
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                )}

                {/* Upcoming Activity */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                          Upcoming Activity
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">Upcoming Check-ins (Next 7 days)</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {reportsData.bookingStats?.upcomingCheckIns || 0} guests
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Upcoming Check-outs (Next 7 days)</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {reportsData.bookingStats?.upcomingCheckOuts || 0} guests
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                          Quick Actions
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => setActiveTab(3)}
                          >
                            View All Bookings
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => setActiveTab(2)}
                          >
                            Manage Rooms
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => setActiveTab(1)}
                          >
                            Manage Staff
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => setActiveTab(4)}
                          >
                            Staff Schedules
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </>
            )}
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
