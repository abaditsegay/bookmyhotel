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
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from '@mui/material';

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
import OfflineWalkInBooking from '../../components/OfflineWalkInBooking';
import { roomCacheService } from '../../services/RoomCacheService';
import PricingConfiguration from '../../components/PricingConfiguration';
import HotelImageManagement from './HotelImageManagement';
import { COLORS, addAlpha } from '../../theme/themeColors';

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
  const theme = useTheme();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get initial tab from URL parameter, default to 0 if not present
  const getInitialTab = () => {
    const tabParam = searchParams.get('tab');
    const tab = tabParam ? parseInt(tabParam, 10) : 0;
    return isNaN(tab) || tab < 0 || tab > 7 ? 0 : tab; // Fixed: Allow up to tab 7 (Offline Bookings)
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Sync tab state with URL parameters when they change externally
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const urlTab = tabParam ? parseInt(tabParam, 10) : 0;
    const validTab = isNaN(urlTab) || urlTab < 0 || urlTab > 7 ? 0 : urlTab; // Fixed: Allow up to tab 7 (Offline Bookings)
    console.log(`🔗 HotelAdmin: URL tab changed to ${urlTab}, setting valid tab to ${validTab}`);
    setActiveTab(validTab);
  }, [searchParams]); // Remove activeTab from dependencies to prevent circular updates

  // Nested tabs state for Hotel Details tab
  const [hotelDetailsTab, setHotelDetailsTab] = useState(0);

  // Walk-in booking modal state
  const [walkInModalOpen, setWalkInModalOpen] = useState(false);
  const [bookingRefreshTrigger, setBookingRefreshTrigger] = useState(0);

  // Snackbar state for success notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Success dialog state for booking confirmations
  const [successDialog, setSuccessDialog] = useState({
    open: false,
    message: ''
  });

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
      preloadRoomData(); // Preload room data for offline use
    }
  }, [token, user?.hotelId]); // eslint-disable-line react-hooks/exhaustive-deps

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



  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    // Prevent unnecessary updates if already on the same tab
    if (newValue === activeTab) {
      console.log(`🔄 HotelAdmin: Already on tab ${newValue}, skipping...`);
      return;
    }
    
    console.log(`🔄 HotelAdmin: Switching from tab ${activeTab} to tab ${newValue}`);
    console.log(`🔄 HotelAdmin: Tab ${newValue} corresponds to:`, 
      newValue === 0 ? 'Hotel Detail' :
      newValue === 1 ? 'Staff' :
      newValue === 2 ? 'Rooms' :
      newValue === 3 ? 'Bookings' :
      newValue === 4 ? 'Staff Schedules' :
      newValue === 5 ? 'Reports' :
      newValue === 6 ? 'Pricing & Tax' :
      newValue === 7 ? 'Offline Bookings' : 'Unknown');
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
    
    // Load reports data when Reports tab (index 5) is selected
    if (newValue === 5) {
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

  // Preload and cache room data for offline use
  const preloadRoomData = async () => {
    console.log('🚀 Hotel Admin Dashboard: preloadRoomData called');
    console.log('🔍 Hotel Admin Dashboard: user?.hotelId:', user?.hotelId);
    console.log('🔍 Hotel Admin Dashboard: token exists:', !!token);
    console.log('🔍 Hotel Admin Dashboard: user object:', user);
    
    if (!user?.hotelId || !token) {
      console.warn('⚠️ Hotel Admin Dashboard: Missing hotelId or token, skipping room preload');
      return;
    }
    
    try {
      const hotelId = parseInt(user.hotelId);
      console.log('🏨 Hotel Admin Dashboard: Preloading room data for hotel', hotelId);
      
      // Force refresh to get latest room data and cache it
      const rooms = await roomCacheService.getRooms(hotelId, true);
      console.log('📊 Hotel Admin Dashboard: Retrieved rooms:', rooms.length, 'rooms');
      console.log('🔍 Hotel Admin Dashboard: Sample room data:', rooms.slice(0, 2));
      
      // Start periodic refresh for this hotel
      roomCacheService.startPeriodicRefresh(hotelId);
      
      console.log('✅ Hotel Admin Dashboard: Room data preloaded successfully');
    } catch (error) {
      console.error('❌ Hotel Admin Dashboard: Failed to preload room data:', error);
      console.error('❌ Hotel Admin Dashboard: Error stack:', error instanceof Error ? error.stack : 'No stack');
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
      color: COLORS.PRIMARY,
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
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="hotel admin tabs"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTabs-scrollButtons': {
                '&.Mui-disabled': { opacity: 0.3 },
              },
              '& .MuiTab-root': { // Apply to all tabs for consistent styling
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.secondary,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '8px 8px 0 0',
                marginRight: '4px',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.text.primary,
                },
                '&.Mui-selected': {
                  backgroundColor: theme.palette.action.selected,
                  color: theme.palette.text.primary,
                  borderColor: theme.palette.text.primary,
                },
              },
            }}
          >
            <Tab label="Hotel Detail" />
            <Tab label="Staff" />
            <Tab label="Rooms" />
            <Tab label="Bookings" />
            <Tab label="Staff Schedules" />
            <Tab label="Reports" />
            <Tab label="Pricing & Tax" />
            <Tab label="Offline Bookings" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          {/* Hotel Details Tab with nested tabs */}
          <Box>
            {/* Nested tabs for Hotel Details */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs 
                value={hotelDetailsTab} 
                onChange={(event, newValue) => setHotelDetailsTab(newValue)}
                sx={{
                  '& .MuiTab-root': {
                    color: COLORS.PRIMARY,
                    '&:hover': {
                      color: addAlpha(COLORS.PRIMARY, 0.8),
                    },
                    '&.Mui-selected': {
                      color: COLORS.CONFIRMED,
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: COLORS.PRIMARY,
                  },
                }}
              >
                <Tab label="Hotel Details" />
                <Tab label="Hotel Images" />
              </Tabs>
            </Box>

            {/* Hotel Details Sub-tab */}
            <TabPanel value={hotelDetailsTab} index={0}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Button
                    variant="contained"
                    onClick={handleEditHotel}
                    disabled={hotelLoading}
                    sx={{ ml: 'auto' }}
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
                            sx={{ 
                              backgroundColor: hotel.isActive ? COLORS.PRIMARY : 'error.main',
                              color: hotel.isActive ? 'white' : 'white'
                            }}
                            size="small"
                          />
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                )}
              </Box>
            </TabPanel>

            {/* Hotel Images Sub-tab */}
            <TabPanel value={hotelDetailsTab} index={1}>
              <HotelImageManagement />
            </TabPanel>
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
          <BookingManagementTable
            mode="hotel-admin"
            title=""
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
          {/* Reports Tab - Enhanced with More Data */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold',
                color: COLORS.PRIMARY 
              }}>
                Hotel Reports & Analytics
              </Typography>
              <Button
                variant="outlined"
                onClick={loadReportsData}
                disabled={reportsData.loading}
                sx={{
                  borderColor: COLORS.PRIMARY,
                  color: COLORS.PRIMARY,
                  '&:hover': {
                    backgroundColor: addAlpha(COLORS.PRIMARY, 0.1),
                    borderColor: COLORS.PRIMARY
                  }
                }}
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
                {/* Key Statistics Cards - Enhanced Data */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`
                    }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {reportsData.hotelStats?.totalRooms || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Total Rooms
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {reportsData.hotelStats?.availableRooms || 0} Available • {reportsData.hotelStats?.bookedRooms || 0} Occupied
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`
                    }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                          ${reportsData.bookingStats?.currentYearRevenue?.toLocaleString() || '0'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Year Revenue
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          This Month: {reportsData.bookingStats?.thisMonthBookings || 0} bookings
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`
                    }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {reportsData.bookingStats?.totalBookings || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Total Bookings
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Check-ins today: {reportsData.bookingStats?.upcomingCheckIns || 0} • Check-outs: {reportsData.bookingStats?.upcomingCheckOuts || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`
                    }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {reportsData.hotelStats?.activeStaff || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Active Staff
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Total Staff: {reportsData.hotelStats?.totalStaff || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Enhanced Analytics Sections */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  {/* Booking Status Breakdown */}
                  <Grid item xs={12} md={6}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                          Booking Status Overview
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Current booking status distribution
                        </Typography>
                        {reportsData.bookingStats?.statusBreakdown && Object.entries(reportsData.bookingStats.statusBreakdown).map(([status, count]) => (
                          <Box key={status} sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            py: 1, 
                            borderBottom: `1px solid ${theme.palette.divider}` 
                          }}>
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                              {status.replace('_', ' ')}
                            </Typography>
                            <Chip 
                              label={count} 
                              size="small" 
                              sx={{ 
                                backgroundColor: COLORS.PRIMARY, 
                                color: 'white',
                                '&:hover': { backgroundColor: addAlpha(COLORS.PRIMARY, 0.8) }
                              }} 
                            />
                          </Box>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Staff Distribution */}
                  <Grid item xs={12} md={6}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                          Staff by Role
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Current staff distribution by role
                        </Typography>
                        {reportsData.hotelStats?.staffByRole && Object.entries(reportsData.hotelStats.staffByRole).map(([role, count]) => (
                          <Box key={role} sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            py: 1, 
                            borderBottom: `1px solid ${theme.palette.divider}` 
                          }}>
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                              {role.replace('_', ' ')}
                            </Typography>
                            <Chip 
                              label={count} 
                              size="small" 
                              sx={{ 
                                backgroundColor: COLORS.PRIMARY, 
                                color: 'white',
                                '&:hover': { backgroundColor: addAlpha(COLORS.PRIMARY, 0.8) }
                              }} 
                            />
                          </Box>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Daily Operations Summary */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                          Today's Operations Summary
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={4}>
                            <Box sx={{ 
                              textAlign: 'center', 
                              p: 2, 
                              backgroundColor: theme.palette.background.paper, 
                              borderRadius: 1,
                              border: `1px solid ${theme.palette.divider}`
                            }}>
                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {Math.round(((reportsData.hotelStats?.bookedRooms || 0) / (reportsData.hotelStats?.totalRooms || 1)) * 100)}%
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Occupancy Rate
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Box sx={{ 
                              textAlign: 'center', 
                              p: 2, 
                              backgroundColor: theme.palette.background.paper, 
                              borderRadius: 1,
                              border: `1px solid ${theme.palette.divider}`
                            }}>
                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {reportsData.bookingStats?.upcomingCheckIns || 0}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Expected Check-ins
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Box sx={{ 
                              textAlign: 'center', 
                              p: 2, 
                              backgroundColor: theme.palette.background.paper, 
                              borderRadius: 1,
                              border: `1px solid ${theme.palette.divider}`
                            }}>
                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {reportsData.bookingStats?.upcomingCheckOuts || 0}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Expected Check-outs
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Historical Performance Analysis */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={4}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                          Current Month Performance
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Month-to-date metrics
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            {reportsData.bookingStats?.thisMonthBookings || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Bookings this month
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            Occupancy Rate: {reportsData.hotelStats && reportsData.hotelStats.totalRooms > 0
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
                    <Card elevation={0} sx={{ 
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                          Year-to-Date Revenue
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Total revenue for current year
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            ${reportsData.bookingStats?.currentYearRevenue?.toLocaleString() || '0'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Generated from bookings
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            Monthly Average: ${Math.round((reportsData.bookingStats?.currentYearRevenue || 0) / 12).toLocaleString()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                          Booking Analytics
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Comprehensive booking metrics
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            {reportsData.bookingStats?.totalBookings || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total bookings
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                            This Month: {reportsData.bookingStats?.thisMonthBookings || 0}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            Pending Check-ins: {reportsData.bookingStats?.upcomingCheckIns || 0}
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
                  <Card elevation={0} sx={{ 
                    mb: 3,
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                        Booking Status Overview
                      </Typography>
                      <Grid container spacing={2}>
                        {Object.entries(reportsData.bookingStats.statusBreakdown).map(([status, count]) => (
                          <Grid item xs={12} sm={6} md={3} key={status}>
                            <Card elevation={0} sx={{ 
                              backgroundColor: theme.palette.background.paper,
                              border: `1px solid ${theme.palette.divider}`
                            }}>
                              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                                  {count}
                                </Typography>
                                <Chip 
                                  label={status.replace('_', ' ')}
                                  size="small"
                                  sx={{ 
                                    backgroundColor: COLORS.PRIMARY, 
                                    color: 'white',
                                    '&:hover': { backgroundColor: addAlpha(COLORS.PRIMARY, 0.8) }
                                  }}
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
                      <Card elevation={0} sx={{ 
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`
                      }}>
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
                              <Box sx={{ width: '100%', bgcolor: theme.palette.action.hover, borderRadius: 1, mt: 0.5 }}>
                                <Box 
                                  sx={{ 
                                    width: `${reportsData.hotelStats && reportsData.hotelStats.totalRooms > 0 
                                      ? (Number(count) / reportsData.hotelStats.totalRooms) * 100 
                                      : 0}%`, 
                                    bgcolor: COLORS.PRIMARY, 
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
                      <Card elevation={0} sx={{ 
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`
                      }}>
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
                                <Box sx={{ width: '100%', bgcolor: theme.palette.action.hover, borderRadius: 1, mt: 0.5 }}>
                                  <Box 
                                    sx={{ 
                                      width: `${reportsData.hotelStats && reportsData.hotelStats.totalStaff > 0 
                                        ? (Number(count) / reportsData.hotelStats.totalStaff) * 100 
                                        : 0}%`, 
                                      bgcolor: COLORS.PRIMARY, 
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
                    <Card elevation={0} sx={{ 
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`
                    }}>
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
                    <Card elevation={0} sx={{ 
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                          Daily Operations Summary
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">Today's Check-ins</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {Math.round((reportsData.bookingStats?.upcomingCheckIns || 0) / 7)} expected
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">Today's Check-outs</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {Math.round((reportsData.bookingStats?.upcomingCheckOuts || 0) / 7)} expected
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Current Occupancy Rate</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {reportsData.hotelStats && reportsData.hotelStats.totalRooms > 0 
                              ? Math.round((reportsData.hotelStats.bookedRooms / reportsData.hotelStats.totalRooms) * 100)
                              : 0}%
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Comprehensive Activity Breakdown */}
                <Grid container spacing={3} sx={{ mt: 2 }}>
                  <Grid item xs={12}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                          Weekly Activity Trends
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ 
                              textAlign: 'center', 
                              p: 2, 
                              backgroundColor: theme.palette.background.paper,
                              border: `1px solid ${theme.palette.divider}`, 
                              borderRadius: 1 
                            }}>
                              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {reportsData.bookingStats?.upcomingCheckIns || 0}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Check-ins (Next 7 days)
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ 
                              textAlign: 'center', 
                              p: 2, 
                              backgroundColor: theme.palette.background.paper,
                              border: `1px solid ${theme.palette.divider}`, 
                              borderRadius: 1 
                            }}>
                              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {reportsData.bookingStats?.upcomingCheckOuts || 0}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Check-outs (Next 7 days)
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ 
                              textAlign: 'center', 
                              p: 2, 
                              backgroundColor: theme.palette.background.paper,
                              border: `1px solid ${theme.palette.divider}`, 
                              borderRadius: 1 
                            }}>
                              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {reportsData.hotelStats?.availableRooms || 0}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Available Rooms
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ 
                              textAlign: 'center', 
                              p: 2, 
                              backgroundColor: theme.palette.background.paper,
                              border: `1px solid ${theme.palette.divider}`, 
                              borderRadius: 1 
                            }}>
                              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {reportsData.hotelStats?.activeStaff || 0}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Active Staff
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12}>
                    <Card 
                      elevation={0}
                      sx={{ 
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                          Quick Actions & Navigation
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => setActiveTab(3)}
                            sx={{
                              borderColor: COLORS.PRIMARY,
                              color: COLORS.PRIMARY,
                              '&:hover': {
                                backgroundColor: addAlpha(COLORS.PRIMARY, 0.1),
                                borderColor: COLORS.PRIMARY
                              }
                            }}
                          >
                            View All Bookings
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => setActiveTab(2)}
                            sx={{
                              borderColor: COLORS.PRIMARY,
                              color: COLORS.PRIMARY,
                              '&:hover': {
                                backgroundColor: addAlpha(COLORS.PRIMARY, 0.1),
                                borderColor: COLORS.PRIMARY
                              }
                            }}
                          >
                            Manage Rooms
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => setActiveTab(1)}
                            sx={{
                              borderColor: COLORS.PRIMARY,
                              color: COLORS.PRIMARY,
                              '&:hover': {
                                backgroundColor: addAlpha(COLORS.PRIMARY, 0.1),
                                borderColor: COLORS.PRIMARY
                              }
                            }}
                          >
                            Manage Staff
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => setActiveTab(4)}
                            sx={{
                              borderColor: COLORS.PRIMARY,
                              color: COLORS.PRIMARY,
                              '&:hover': {
                                backgroundColor: addAlpha(COLORS.PRIMARY, 0.1),
                                borderColor: COLORS.PRIMARY
                              }
                            }}
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

        <TabPanel value={activeTab} index={6}>
          {/* Pricing & Tax Configuration Tab */}
          <PricingConfiguration />
        </TabPanel>

        <TabPanel value={activeTab} index={7}>
          {/* Offline Bookings Tab */}
          <OfflineWalkInBooking
            hotelId={hotel?.id}
            onBookingComplete={(booking) => {
              console.log('Offline booking created:', booking);
              setSnackbar({
                open: true,
                message: `Offline booking created successfully for ${booking.guestName}`,
                severity: 'success'
              });
              // Trigger booking table refresh
              setBookingRefreshTrigger(prev => prev + 1);
            }}
          />
        </TabPanel>
      </Card>

      {/* Walk-in Booking Modal */}
      <WalkInBookingModal
        open={walkInModalOpen}
        onClose={() => setWalkInModalOpen(false)}
        onSuccess={(bookingData) => {
          console.log('Walk-in booking created successfully:', bookingData);
          setWalkInModalOpen(false);
          // Show success dialog
          setSuccessDialog({
            open: true,
            message: `Walk-in booking created successfully! Confirmation: ${bookingData.confirmationNumber}`
          });
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

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Success Dialog for Booking Confirmations */}
      <Dialog
        open={successDialog.open}
        onClose={() => setSuccessDialog({ ...successDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', color: COLORS.PRIMARY }}>
          ✅ Success
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ textAlign: 'center', py: 2 }}>
            {successDialog.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button 
            onClick={() => setSuccessDialog({ ...successDialog, open: false })} 
            variant="contained" 
            color="primary"
            sx={{ minWidth: 100 }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HotelAdminDashboard;
