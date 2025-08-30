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
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Refresh,
  MeetingRoom,
  TrendingUp,
  Hotel as HotelIcon,
  People,
  ArrowBack,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { hotelAdminApi, BookingStats, HotelStatistics } from '../../services/hotelAdminApi';
import { Hotel } from '../../types/hotel';
import RoomManagement from './RoomManagement';
import StaffManagement from './StaffManagement';
import StaffScheduleManagement from '../../components/StaffScheduleManagement';
import HotelEditDialog from '../../components/hotel/HotelEditDialog';
import WalkInBookingModal from '../../components/booking/WalkInBookingModal';
import BookingManagementTable from '../../components/booking/BookingManagementTable';

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

  // Walk-in booking modal state
  const [walkInModalOpen, setWalkInModalOpen] = useState(false);
  const [bookingRefreshTrigger, setBookingRefreshTrigger] = useState(0);

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
    // Tab changes are now handled by individual components
  }, [activeTab, token]); // eslint-disable-line react-hooks/exhaustive-deps

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
      // BookingManagementTable handles its own data loading
    }
    
    // Load reports data when Reports tab (index 4) is selected
    if (newValue === 4) {
      loadReportsData();
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

  // Navigation handlers for child components
  const handleRoomNavigation = (roomId: number) => {
    navigate(`/hotel-admin/rooms/${roomId}?returnTab=${activeTab}`);
  };

  const handleStaffNavigation = (staffId: number) => {
    navigate(`/hotel-admin/staff/${staffId}?returnTab=${activeTab}`);
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
          <BookingManagementTable
            mode="hotel-admin"
            title="Booking Management"
            showActions={true}
            showCheckInOut={true}
            currentTab={activeTab}
            refreshTrigger={bookingRefreshTrigger}
            onBookingAction={(booking, action) => {
              console.log(`${action} for booking:`, booking);
              // Handle booking actions like check-in/check-out
              // BookingManagementTable handles its own data refresh
            }}
            onWalkInRequest={() => {
              console.log('Walk-in booking requested from BookingManagementTable');
              setWalkInModalOpen(true);
            }}
          />
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
                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center', py: 1, px: 1.5 }}>
                        <MeetingRoom sx={{ fontSize: 24, color: 'primary.main', mb: 0.25 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', lineHeight: 1.2 }}>
                          {reportsData.hotelStats?.totalRooms || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          Total Rooms
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center', py: 1, px: 1.5 }}>
                        <TrendingUp sx={{ fontSize: 24, color: 'success.main', mb: 0.25 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main', lineHeight: 1.2 }}>
                          {reportsData.hotelStats?.availableRooms || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          Available Rooms
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center', py: 1, px: 1.5 }}>
                        <HotelIcon sx={{ fontSize: 24, color: 'warning.main', mb: 0.25 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main', lineHeight: 1.2 }}>
                          {reportsData.hotelStats?.bookedRooms || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          Occupied Rooms
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center', py: 1, px: 1.5 }}>
                        <People sx={{ fontSize: 24, color: 'info.main', mb: 0.25 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'info.main', lineHeight: 1.2 }}>
                          {reportsData.hotelStats?.activeStaff || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
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

      {/* Walk-in Booking Modal */}
      <WalkInBookingModal
        open={walkInModalOpen}
        onClose={() => setWalkInModalOpen(false)}
        onSuccess={(bookingData) => {
          console.log('Walk-in booking created successfully:', bookingData);
          setWalkInModalOpen(false);
          // Trigger booking table refresh
          setBookingRefreshTrigger(prev => prev + 1);
        }}
        apiContext="hotel-admin"
      />

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
