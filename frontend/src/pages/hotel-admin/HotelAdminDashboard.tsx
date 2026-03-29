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
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { hotelAdminApi, BookingStats, HotelStatistics } from '../../services/hotelAdminApi';
import { Hotel } from '../../types/hotel';
import { getErrorMessage } from '../../utils/errorHandler';
import UnifiedRoomManagement from '../../components/common/UnifiedRoomManagement';
import StaffManagement from './StaffManagement';
import StaffScheduleManagement from '../../components/StaffScheduleManagement';
import HotelEditDialog from '../../components/hotel/HotelEditDialog';

import WalkInBookingModal from '../../components/booking/WalkInBookingModal';
import BookingManagementTable from '../../components/booking/BookingManagementTable';
import OfflineWalkInBooking from '../../components/OfflineWalkInBooking';
import { roomCacheService } from '../../services/RoomCacheService';
import PricingConfiguration from '../../components/PricingConfiguration';
import HotelImageManagement from './HotelImageManagement';
import HousekeepingPage from '../housekeeping/HousekeepingPage';
import { getBookingStatusColor } from '../../utils/statusColors';
import { COLORS, addAlpha } from '../../theme/themeColors';
import HotelAuditCenter from '../../components/hotel-admin/HotelAuditCenter';

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
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get initial tab from URL parameter, default to 0 if not present
  const getInitialTab = () => {
    const tabParam = searchParams.get('tab');
    const tab = tabParam ? parseInt(tabParam, 10) : 0;
    return isNaN(tab) || tab < 0 || tab > 9 ? 0 : tab;
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Sync tab state with URL parameters when they change externally
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const urlTab = tabParam ? parseInt(tabParam, 10) : 0;
    const validTab = isNaN(urlTab) || urlTab < 0 || urlTab > 9 ? 0 : urlTab;
    // console.log(`🔗 HotelAdmin: URL tab changed to ${urlTab}, setting valid tab to ${validTab}`);
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
            {t('dashboard.hotelAdmin.accessRestricted')}
          </Typography>
          <Typography variant="body1" gutterBottom>
            {t('dashboard.hotelAdmin.needHotelAdminRole')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('dashboard.hotelAdmin.currentRole')} <strong>{user?.roles?.[0] || user?.role || 'Unknown'}</strong>
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="contained" 
              onClick={() => navigate('/')}
              sx={{ mr: 1 }}
            >
              {t('dashboard.hotelAdmin.goToHome')}
            </Button>
            {user?.roles?.includes('OPERATIONAL_ADMIN') && (
              <Button 
                variant="outlined" 
                onClick={() => navigate('/operations/dashboard')}
              >
                {t('dashboard.hotelAdmin.goToOperations')}
              </Button>
            )}
            {user?.roles?.includes('FRONTDESK') && (
              <Button 
                variant="outlined" 
                onClick={() => navigate('/frontdesk/dashboard')}
              >
                {t('dashboard.hotelAdmin.goToFrontDesk')}
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
      // console.log(`🔄 HotelAdmin: Already on tab ${newValue}, skipping...`);
      return;
    }
    
    // console.log(`🔄 HotelAdmin: Switching from tab ${activeTab} to tab ${newValue}`);
    // console.log(`🔄 HotelAdmin: Tab ${newValue} corresponds to:`, 
    //   newValue === 0 ? t('dashboard.hotelAdmin.tabs.hotelDetail') :
    //   newValue === 1 ? t('dashboard.hotelAdmin.tabs.staff') :
    //   newValue === 2 ? t('dashboard.hotelAdmin.tabs.rooms') :
    //   newValue === 3 ? t('dashboard.hotelAdmin.tabs.bookings') :
    //   newValue === 4 ? t('dashboard.hotelAdmin.tabs.staffSchedules') :
    //   newValue === 5 ? 'Housekeeping' :
    //   newValue === 6 ? t('dashboard.hotelAdmin.tabs.reports') :
    //   newValue === 7 ? t('dashboard.hotelAdmin.tabs.audit') :
    //   newValue === 8 ? t('dashboard.hotelAdmin.tabs.pricingTax') :
    //   newValue === 9 ? t('dashboard.hotelAdmin.tabs.offlineBookings') : 'Unknown');
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
    
    // Load reports data when Reports tab (index 6) is selected
    if (newValue === 6) {
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
        // console.error('Failed to load hotel stats:', hotelStatsResult.message);
      }
      
      if (!bookingStatsResult.success) {
        // console.error('Failed to load booking stats:', bookingStatsResult.message);
      }
    } catch (error: any) {
      // console.error('Failed to load reports data:', error);
      setReportsData({
        hotelStats: null,
        bookingStats: null,
        loading: false,
        error: getErrorMessage(error)
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
    } catch (err: any) {
      // console.error('Error loading hotel data:', err);
      setHotelError(getErrorMessage(err));
    } finally {
      setHotelLoading(false);
    }
  };

  // Preload and cache room data for offline use
  const preloadRoomData = async () => {
    // console.log('🚀 Hotel Admin Dashboard: preloadRoomData called');
    // console.log('🔍 Hotel Admin Dashboard: user?.hotelId:', user?.hotelId);
    // console.log('🔍 Hotel Admin Dashboard: token exists:', !!token);
    // console.log('🔍 Hotel Admin Dashboard: user object:', user);
    
    if (!user?.hotelId || !token) {
      // console.warn('⚠️ Hotel Admin Dashboard: Missing hotelId or token, skipping room preload');
      return;
    }
    
    try {
      const hotelId = parseInt(user.hotelId);
      // console.log('🏨 Hotel Admin Dashboard: Preloading room data for hotel', hotelId);
      
      // Force refresh to get latest room data and cache it
      await roomCacheService.getRooms(hotelId, true);
      // console.log('📊 Hotel Admin Dashboard: Retrieved rooms:', rooms.length, 'rooms');
      // console.log('🔍 Hotel Admin Dashboard: Sample room data:', rooms.slice(0, 2));
      
      // Start periodic refresh for this hotel
      roomCacheService.startPeriodicRefresh(hotelId);
      
      // console.log('✅ Hotel Admin Dashboard: Room data preloaded successfully');
    } catch (error) {
      // console.error('❌ Hotel Admin Dashboard: Failed to preload room data:', error);
      // console.error('❌ Hotel Admin Dashboard: Error stack:', error instanceof Error ? error.stack : 'No stack');
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
    bookedBookings: reportsData.hotelStats?.bookedBookings || 0,
    bookedRooms: reportsData.hotelStats?.bookedRooms || hotel.bookedRooms || 0,
    totalStaff: reportsData.hotelStats?.totalStaff || hotel.totalStaff || 0,
    activeStaff: reportsData.hotelStats?.activeStaff || hotel.totalStaff || 0,
  } : {
    name: user?.hotelName || (hotelLoading ? t('dashboard.hotelAdmin.loadingHotel') : t('dashboard.hotelAdmin.hotelInfoNotAvailable')),
    totalRooms: reportsData.hotelStats?.totalRooms || 0,
    availableRooms: reportsData.hotelStats?.availableRooms || 0,
    bookedBookings: reportsData.hotelStats?.bookedBookings || 0,
    bookedRooms: reportsData.hotelStats?.bookedRooms || 0,
    totalStaff: reportsData.hotelStats?.totalStaff || 0,
    activeStaff: reportsData.hotelStats?.activeStaff || 0,
  };

  const stats = [
    {
      title: t('dashboard.hotelAdmin.metrics.totalRooms'),
      value: hotelData.totalRooms,
      color: 'primary',
    },
    {
      title: t('dashboard.hotelAdmin.metrics.availableRooms'),
      value: hotelData.availableRooms,
      color: 'success',
    },
    {
      title: t('dashboard.hotelAdmin.metrics.bookedBookings'),
      value: hotelData.bookedBookings,
      color: 'warning',
    },
    {
      title: t('dashboard.hotelAdmin.metrics.totalStaff'),
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
              '& .MuiTab-root': {
                color: theme.palette.text.secondary,
                minHeight: 48,
                '&:hover': {
                  color: theme.palette.text.primary,
                },
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                },
              },
            }}
          >
            <Tab label={t('dashboard.hotelAdmin.tabs.hotelDetail')} />
            <Tab label={t('dashboard.hotelAdmin.tabs.staff')} />
            <Tab label={t('dashboard.hotelAdmin.tabs.rooms')} />
            <Tab label={t('dashboard.hotelAdmin.tabs.bookings')} />
            <Tab label={t('dashboard.hotelAdmin.tabs.staffSchedules')} />
            <Tab label={t('dashboard.hotelAdmin.tabs.housekeeping')} />
            <Tab label={t('dashboard.hotelAdmin.tabs.reports')} />
            <Tab label={t('dashboard.hotelAdmin.tabs.audit')} />
            <Tab label={t('dashboard.hotelAdmin.tabs.pricingTax')} />
            <Tab label={t('dashboard.hotelAdmin.tabs.offlineBookings')} />
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
                    color: theme.palette.primary.main,
                    '&:hover': {
                      color: theme.palette.primary.dark,
                    },
                    '&.Mui-selected': {
                      color: theme.palette.primary.main,
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: theme.palette.primary.main,
                  },
                }}
              >
                <Tab label={t('dashboard.hotelAdmin.hotelDetails.hotelDetails')} />
                <Tab label={t('dashboard.hotelAdmin.hotelDetails.hotelImages')} />
              </Tabs>
            </Box>

            {/* Hotel Details Sub-tab */}
            <TabPanel value={hotelDetailsTab} index={0}>
              <Box>
                {/* Header Section with Edit Button */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 4,
                  pb: 2,
                  borderBottom: `2px solid ${theme.palette.divider}`
                }}>
                  <Box>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 'bold', 
                      color: theme.palette.primary.main,
                      mb: 1
                    }}>
                      {hotel?.name || hotelData.name}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {t('dashboard.hotelAdmin.title')}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    onClick={handleEditHotel}
                    disabled={hotelLoading}
                    sx={{ 
                      px: 3, 
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 'bold',
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      '&:hover': {
                        background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`
                      }
                    }}
                  >
                    {t('dashboard.hotelAdmin.editHotelDetails')}
                  </Button>
                </Box>
                
                {/* Show loading or error states */}
                {hotelLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ ml: 2, alignSelf: 'center' }}>
                      {t('dashboard.hotelAdmin.loadingHotelInfo')}
                    </Typography>
                  </Box>
                )}
                
                {hotelError && (
                  <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {t('dashboard.hotelAdmin.unableToLoadHotel')}
                    </Typography>
                    {hotelError}
                  </Alert>
                )}
                
                {!hotelLoading && !hotelError && (
                  <>
                    {/* Key Metrics Cards */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={0} sx={{ 
                          background: `linear-gradient(135deg, ${addAlpha(theme.palette.primary.main, 0.15)} 0%, ${addAlpha(theme.palette.primary.light, 0.1)} 100%)`,
                          borderRadius: 3,
                          height: '100%',
                          boxShadow: `0 10px 24px ${addAlpha(theme.palette.primary.main, 0.12)}`,
                        }}>
                          <CardContent sx={{ textAlign: 'center', p: 3 }}>
                            <Box sx={{ 
                              width: 60, 
                              height: 60, 
                              borderRadius: '50%', 
                              backgroundColor: theme.palette.primary.main,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mx: 'auto',
                              mb: 2
                            }}>
                              <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                                🏨
                              </Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: theme.palette.primary.main }}>
                              {hotelData.totalRooms}
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {t('dashboard.hotelAdmin.metrics.totalRooms')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t('dashboard.hotelAdmin.metrics.managedProperties')}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={0} sx={{ 
                          background: `linear-gradient(135deg, ${addAlpha(theme.palette.success.main, 0.15)} 0%, ${addAlpha(theme.palette.success.light, 0.1)} 100%)`,
                          borderRadius: 3,
                          height: '100%',
                          boxShadow: `0 10px 24px ${addAlpha(theme.palette.success.main, 0.12)}`,
                        }}>
                          <CardContent sx={{ textAlign: 'center', p: 3 }}>
                            <Box sx={{ 
                              width: 60, 
                              height: 60, 
                              borderRadius: '50%', 
                              backgroundColor: theme.palette.success.main,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mx: 'auto',
                              mb: 2
                            }}>
                              <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                                ✅
                              </Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: theme.palette.success.main }}>
                              {hotelData.availableRooms}
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {t('dashboard.hotelAdmin.metrics.available')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t('dashboard.hotelAdmin.metrics.readyForBooking')}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={0} sx={{ 
                          background: `linear-gradient(135deg, ${addAlpha(theme.palette.warning.main, 0.15)} 0%, ${addAlpha(theme.palette.warning.light, 0.1)} 100%)`,
                          borderRadius: 3,
                          height: '100%',
                          boxShadow: `0 10px 24px ${addAlpha(theme.palette.warning.main, 0.12)}`,
                        }}>
                          <CardContent sx={{ textAlign: 'center', p: 3 }}>
                            <Box sx={{ 
                              width: 60, 
                              height: 60, 
                              borderRadius: '50%', 
                              backgroundColor: theme.palette.warning.main,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mx: 'auto',
                              mb: 2
                            }}>
                              <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                                🛏️
                              </Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: theme.palette.warning.main }}>
                              {hotelData.bookedRooms}
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {t('dashboard.hotelAdmin.metrics.occupied')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t('dashboard.hotelAdmin.metrics.currentlyBooked')}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={0} sx={{ 
                          background: `linear-gradient(135deg, ${addAlpha(theme.palette.info.main, 0.15)} 0%, ${addAlpha(theme.palette.info.light, 0.1)} 100%)`,
                          borderRadius: 3,
                          height: '100%',
                          boxShadow: `0 10px 24px ${addAlpha(theme.palette.info.main, 0.12)}`,
                        }}>
                          <CardContent sx={{ textAlign: 'center', p: 3 }}>
                            <Box sx={{ 
                              width: 60, 
                              height: 60, 
                              borderRadius: '50%', 
                              backgroundColor: theme.palette.info.main,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mx: 'auto',
                              mb: 2
                            }}>
                              <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                                👥
                              </Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: theme.palette.info.main }}>
                              {hotelData.activeStaff}
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {t('dashboard.hotelAdmin.metrics.activeStaff')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t('dashboard.hotelAdmin.metrics.totalMembers', { count: hotelData.totalStaff })}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>

                    {/* Hotel Information Cards */}
                    <Grid container spacing={3}>
                      {/* Basic Information Card */}
                      <Grid item xs={12} md={6}>
                        <Card elevation={0} sx={{ 
                          borderRadius: 3,
                          height: '100%',
                          bgcolor: theme.palette.background.paper,
                        }}>
                          <CardContent sx={{ p: 4 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              mb: 3,
                            }}>
                              <Box sx={{ 
                                width: 48, 
                                height: 48, 
                                borderRadius: 2, 
                                backgroundColor: theme.palette.primary.main,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 2
                              }}>
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                                  ℹ️
                                </Typography>
                              </Box>
                              <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                                {t('dashboard.hotelAdmin.sections.hotelInformation')}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium', mb: 1 }}>
                                {t('dashboard.hotelAdmin.form.hotelName')}
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                                {hotel?.name || hotelData.name}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium', mb: 1 }}>
                                {t('dashboard.hotelAdmin.form.description')}
                              </Typography>
                              <Typography variant="body1" sx={{ 
                                lineHeight: 1.6,
                                color: hotel?.description ? theme.palette.text.primary : theme.palette.text.secondary,
                                fontStyle: hotel?.description ? 'normal' : 'italic'
                              }}>
                                {hotel?.description || t('dashboard.hotelAdmin.noDescriptionAvailable')}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium', mb: 1 }}>
                                {t('dashboard.hotelAdmin.form.address')}
                              </Typography>
                              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                                {hotel?.address || 'Address not set'}
                                {hotel?.city && `, ${hotel.city}`}
                                {hotel?.country && `, ${hotel.country}`}
                              </Typography>
                            </Box>
                            
                            {hotel?.isActive !== undefined && (
                              <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium', mb: 1 }}>
                                  {t('dashboard.hotelAdmin.form.status')}
                                </Typography>
                                <Chip 
                                  label={hotel.isActive ? t('dashboard.hotelAdmin.form.active') : t('dashboard.hotelAdmin.form.inactive')} 
                                  sx={{ 
                                    backgroundColor: hotel.isActive ? theme.palette.success.main : theme.palette.error.main,
                                    color: 'white',
                                    fontWeight: 'bold',
                                    px: 2,
                                    py: 1
                                  }}
                                  size="medium"
                                />
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      {/* Contact & Operational Information Card */}
                      <Grid item xs={12} md={6}>
                        <Card elevation={0} sx={{ 
                          borderRadius: 3,
                          height: '100%',
                          bgcolor: theme.palette.background.paper,
                        }}>
                          <CardContent sx={{ p: 4 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              mb: 3,
                            }}>
                              <Box sx={{ 
                                width: 48, 
                                height: 48, 
                                borderRadius: 2, 
                                backgroundColor: theme.palette.secondary.main,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 2
                              }}>
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                                  📞
                                </Typography>
                              </Box>
                              <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.secondary.main }}>
                                {t('dashboard.hotelAdmin.sections.contactOperations')}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium', mb: 1 }}>
                                {t('dashboard.hotelAdmin.contact.communicationPhone')}
                              </Typography>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 'medium',
                                color: hotel?.phone ? theme.palette.text.primary : theme.palette.text.secondary,
                                fontStyle: hotel?.phone ? 'normal' : 'italic'
                              }}>
                                {hotel?.phone || t('dashboard.hotelAdmin.contact.phoneNotSet')}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium', mb: 1 }}>
                                {t('dashboard.hotelAdmin.contact.primaryPaymentPhone')}
                              </Typography>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 'medium',
                                color: hotel?.mobilePaymentPhone ? theme.palette.text.primary : theme.palette.text.secondary,
                                fontStyle: hotel?.mobilePaymentPhone ? 'normal' : 'italic'
                              }}>
                                {hotel?.mobilePaymentPhone || t('dashboard.hotelAdmin.contact.paymentPhoneNotSet')}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium', mb: 1 }}>
                                {t('dashboard.hotelAdmin.contact.secondaryPaymentPhone')}
                              </Typography>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 'medium',
                                color: hotel?.mobilePaymentPhone2 ? theme.palette.text.primary : theme.palette.text.secondary,
                                fontStyle: hotel?.mobilePaymentPhone2 ? 'normal' : 'italic'
                              }}>
                                {hotel?.mobilePaymentPhone2 || t('dashboard.hotelAdmin.contact.secondaryPaymentPhoneNotSet')}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium', mb: 1 }}>
                                {t('dashboard.hotelAdmin.contact.emailAddress')}
                              </Typography>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 'medium',
                                color: hotel?.email ? theme.palette.text.primary : theme.palette.text.secondary,
                                fontStyle: hotel?.email ? 'normal' : 'italic'
                              }}>
                                {hotel?.email || t('dashboard.hotelAdmin.contact.emailNotSet')}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium', mb: 1 }}>
                                {t('dashboard.hotelAdmin.metrics.roomCapacity')}
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                                {hotelData.totalRooms}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium', mb: 1 }}>
                                {t('dashboard.hotelAdmin.metrics.staffCount')}
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                                {hotelData.totalStaff} {t('dashboard.hotelAdmin.metrics.teamMembers')}
                              </Typography>
                            </Box>
                            
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium', mb: 1 }}>
                                {t('dashboard.hotelAdmin.metrics.occupancyRate')}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mr: 2 }}>
                                  {hotelData.totalRooms > 0 ? Math.round((hotelData.bookedRooms / hotelData.totalRooms) * 100) : 0}%
                                </Typography>
                                <Box sx={{ 
                                  flexGrow: 1, 
                                  height: 8, 
                                  backgroundColor: theme.palette.action.hover, 
                                  borderRadius: 4,
                                  mr: 2
                                }}>
                                  <Box sx={{ 
                                    width: `${hotelData.totalRooms > 0 ? (hotelData.bookedRooms / hotelData.totalRooms) * 100 : 0}%`, 
                                    height: '100%', 
                                    backgroundColor: theme.palette.primary.main, 
                                    borderRadius: 4
                                  }} />
                                </Box>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </>
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
          <UnifiedRoomManagement 
            mode="hotel-admin"
            onNavigateToRoom={handleRoomNavigation} 
          />
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
              // console.log(`${action} for booking:`, booking);
              // Handle booking actions like check-in/check-out
              // BookingManagementTable handles its own data refresh
            }}
            onWalkInRequest={() => {
              // console.log('Walk-in booking requested from BookingManagementTable');
              setWalkInModalOpen(true);
            }}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <StaffScheduleManagement />
        </TabPanel>

        <TabPanel value={activeTab} index={5}>
          {/* Housekeeping Tab */}
          <HousekeepingPage />
        </TabPanel>

        <TabPanel value={activeTab} index={6}>
          {/* Reports Tab - Enhanced with More Data */}
          <Box>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                mb: 3, 
                pb: 2, 
                borderBottom: `2px solid ${COLORS.SECONDARY}`,
                background: `linear-gradient(135deg, ${addAlpha(COLORS.SECONDARY, 0.05)} 0%, ${addAlpha(COLORS.WHITE, 0.9)} 100%)`,
                px: 2,
                py: 2,
                borderRadius: 2
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box 
                  sx={{ 
                    fontSize: 28, 
                    color: COLORS.SECONDARY,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  📊
                </Box>
                <Typography variant="h5" sx={{ 
                  fontWeight: 700,
                  color: COLORS.TEXT_PRIMARY
                }}>
                  {t('dashboard.hotelAdmin.reports.title')}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                onClick={loadReportsData}
                disabled={reportsData.loading}
                sx={{
                  borderColor: COLORS.SECONDARY,
                  color: COLORS.SECONDARY,
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: COLORS.SECONDARY_HOVER,
                    backgroundColor: addAlpha(COLORS.SECONDARY, 0.08)
                  }
                }}
              >
                {t('dashboard.hotelAdmin.reports.refreshData')}
              </Button>
            </Box>
            
            {reportsData.loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2 }}>
                  {t('dashboard.hotelAdmin.reports.loadingAnalytics')}
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
                      backgroundColor: COLORS.BG_LIGHT,
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      boxShadow: `0 8px 20px ${addAlpha(COLORS.SECONDARY, 0.08)}`,
                      '&:hover': {
                        boxShadow: `0 4px 12px ${addAlpha(COLORS.SECONDARY, 0.15)}`,
                        transform: 'translateY(-2px)'
                      }
                    }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: COLORS.SECONDARY }}>
                          {reportsData.hotelStats?.totalRooms || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                          {t('dashboard.hotelAdmin.metrics.totalRooms')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {reportsData.hotelStats?.availableRooms || 0} {t('dashboard.hotelAdmin.metrics.available')} • {reportsData.hotelStats?.bookedRooms || 0} {t('dashboard.hotelAdmin.metrics.occupied')}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: COLORS.BG_LIGHT,
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      boxShadow: `0 8px 20px ${addAlpha(COLORS.SECONDARY, 0.08)}`,
                      '&:hover': {
                        boxShadow: `0 4px 12px ${addAlpha(COLORS.SECONDARY, 0.15)}`,
                        transform: 'translateY(-2px)'
                      }
                    }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: COLORS.SUCCESS }}>
                          ETB {reportsData.bookingStats?.currentYearRevenue?.toLocaleString() || '0'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                          {t('dashboard.hotelAdmin.reports.yearRevenue')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('dashboard.hotelAdmin.reports.thisMonthBookings', { count: reportsData.bookingStats?.thisMonthBookings || 0 })}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: COLORS.BG_LIGHT,
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      boxShadow: `0 8px 20px ${addAlpha(COLORS.SECONDARY, 0.08)}`,
                      '&:hover': {
                        boxShadow: `0 4px 12px ${addAlpha(COLORS.SECONDARY, 0.15)}`,
                        transform: 'translateY(-2px)'
                      }
                    }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: COLORS.BOOKED }}>
                          {reportsData.bookingStats?.totalBookings || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                          {t('dashboard.hotelAdmin.reports.totalBookings')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('dashboard.hotelAdmin.reports.checkInsToday', { 
                            checkIns: reportsData.bookingStats?.upcomingCheckIns || 0, 
                            checkOuts: reportsData.bookingStats?.upcomingCheckOuts || 0 
                          })}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: COLORS.BG_LIGHT,
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      boxShadow: `0 8px 20px ${addAlpha(COLORS.SECONDARY, 0.08)}`,
                      '&:hover': {
                        boxShadow: `0 4px 12px ${addAlpha(COLORS.SECONDARY, 0.15)}`,
                        transform: 'translateY(-2px)'
                      }
                    }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: COLORS.PURPLE_600 }}>
                          {reportsData.hotelStats?.activeStaff || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                          {t('dashboard.hotelAdmin.metrics.activeStaff')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('dashboard.hotelAdmin.reports.totalStaffCount', { count: reportsData.hotelStats?.totalStaff || 0 })}
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
                      backgroundColor: COLORS.BG_LIGHT,
                      borderRadius: 2,
                      boxShadow: `0 8px 20px ${addAlpha(COLORS.SECONDARY, 0.08)}`,
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: COLORS.PRIMARY }}>
                          {t('dashboard.hotelAdmin.reports.bookingStatusOverview')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {t('dashboard.hotelAdmin.reports.currentBookingStatus')}
                        </Typography>
                        {reportsData.bookingStats?.statusBreakdown && Object.entries(reportsData.bookingStats.statusBreakdown).map(([status, count]) => (
                          <Box key={status} sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            py: 1, 
                            borderBottom: `1px solid ${COLORS.BORDER_LIGHT}` 
                          }}>
                            <Typography variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                              {status.replace('_', ' ')}
                            </Typography>
                            <Chip 
                              label={count} 
                              size="small" 
                              color={(() => {
                                const statusColor = getBookingStatusColor(status);
                                // Map custom colors to valid MUI colors
                                if (statusColor === 'orange') return 'warning';
                                return statusColor as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
                              })()}
                            />
                          </Box>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Staff Distribution */}
                  <Grid item xs={12} md={6}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: COLORS.BG_LIGHT,
                      borderRadius: 2,
                      boxShadow: `0 8px 20px ${addAlpha(COLORS.SECONDARY, 0.08)}`,
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: COLORS.PRIMARY }}>
                          {t('dashboard.hotelAdmin.reports.staffByRole')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {t('dashboard.hotelAdmin.reports.currentStaffDistribution')}
                        </Typography>
                        {reportsData.hotelStats?.staffByRole && Object.entries(reportsData.hotelStats.staffByRole).map(([role, count]) => (
                          <Box key={role} sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            py: 1, 
                            borderBottom: `1px solid ${COLORS.BORDER_LIGHT}` 
                          }}>
                            <Typography variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                              {role.replace('_', ' ')}
                            </Typography>
                            <Chip 
                              label={count} 
                              size="small" 
                              sx={{ 
                                backgroundColor: COLORS.SECONDARY, 
                                color: COLORS.WHITE,
                                fontWeight: 600,
                                '&:hover': { backgroundColor: COLORS.SECONDARY_HOVER }
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
                      backgroundColor: COLORS.BG_LIGHT,
                      borderRadius: 2,
                      boxShadow: `0 8px 20px ${addAlpha(COLORS.SECONDARY, 0.08)}`,
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: COLORS.PRIMARY }}>
                          {t('dashboard.hotelAdmin.reports.todaysOperations')}
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={4}>
                            <Box sx={{ 
                              textAlign: 'center', 
                              p: 2, 
                              backgroundColor: COLORS.WHITE, 
                              borderRadius: 2,
                              transition: 'all 0.2s',
                              boxShadow: `0 6px 16px ${addAlpha(COLORS.BLACK, 0.05)}`,
                              '&:hover': {
                                boxShadow: `0 4px 12px ${addAlpha(COLORS.SECONDARY, 0.15)}`,
                                transform: 'translateY(-2px)'
                              }
                            }}>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.SECONDARY }}>
                                {Math.round(((reportsData.hotelStats?.bookedRooms || 0) / (reportsData.hotelStats?.totalRooms || 1)) * 100)}%
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                {t('dashboard.hotelAdmin.reports.occupancyRate')}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Box sx={{ 
                              textAlign: 'center', 
                              p: 2, 
                              backgroundColor: COLORS.WHITE, 
                              borderRadius: 2,
                              transition: 'all 0.2s',
                              boxShadow: `0 6px 16px ${addAlpha(COLORS.BLACK, 0.05)}`,
                              '&:hover': {
                                boxShadow: `0 4px 12px ${addAlpha(COLORS.SECONDARY, 0.15)}`,
                                transform: 'translateY(-2px)'
                              }
                            }}>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.SUCCESS }}>
                                {reportsData.bookingStats?.upcomingCheckIns || 0}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                {t('dashboard.hotelAdmin.reports.expectedCheckins')}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Box sx={{ 
                              textAlign: 'center', 
                              p: 2, 
                              backgroundColor: COLORS.WHITE, 
                              borderRadius: 2,
                              transition: 'all 0.2s',
                              boxShadow: `0 6px 16px ${addAlpha(COLORS.BLACK, 0.05)}`,
                              '&:hover': {
                                boxShadow: `0 4px 12px ${addAlpha(COLORS.SECONDARY, 0.15)}`,
                                transform: 'translateY(-2px)'
                              }
                            }}>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.BOOKED }}>
                                {reportsData.bookingStats?.upcomingCheckOuts || 0}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                {t('dashboard.hotelAdmin.reports.expectedCheckouts')}
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
                      backgroundColor: COLORS.BG_LIGHT,
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      boxShadow: `0 8px 20px ${addAlpha(COLORS.SECONDARY, 0.08)}`,
                      '&:hover': {
                        boxShadow: `0 4px 12px ${addAlpha(COLORS.SECONDARY, 0.15)}`,
                        transform: 'translateY(-2px)'
                      }
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: COLORS.PRIMARY }}>
                          {t('dashboard.hotelAdmin.reports.currentMonthPerformance')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                          {t('dashboard.hotelAdmin.reports.monthToDateMetrics')}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="h4" sx={{ fontWeight: 'bold', color: COLORS.SECONDARY }}>
                            {reportsData.bookingStats?.thisMonthBookings || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            {t('dashboard.hotelAdmin.reports.bookingsThisMonth')}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {t('dashboard.hotelAdmin.metrics.occupancyRate')}: {reportsData.hotelStats && reportsData.hotelStats.totalRooms > 0
                              ? Math.round((reportsData.hotelStats.bookedRooms / reportsData.hotelStats.totalRooms) * 100)
                              : 0}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t('dashboard.hotelAdmin.metrics.roomsOccupied', { occupied: reportsData.hotelStats?.bookedRooms || 0, total: reportsData.hotelStats?.totalRooms || 0 })}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: COLORS.BG_LIGHT,
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      boxShadow: `0 8px 20px ${addAlpha(COLORS.SECONDARY, 0.08)}`,
                      '&:hover': {
                        boxShadow: `0 4px 12px ${addAlpha(COLORS.SECONDARY, 0.15)}`,
                        transform: 'translateY(-2px)'
                      }
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: COLORS.PRIMARY }}>
                          {t('dashboard.hotelAdmin.reports.yearToDateRevenue')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                          {t('dashboard.hotelAdmin.reports.totalRevenue')}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="h4" sx={{ fontWeight: 'bold', color: COLORS.SUCCESS }}>
                            ${reportsData.bookingStats?.currentYearRevenue?.toLocaleString() || '0'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            {t('dashboard.hotelAdmin.reports.generatedFromBookings')}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {t('dashboard.hotelAdmin.reports.monthlyAverage')}: ${Math.round((reportsData.bookingStats?.currentYearRevenue || 0) / 12).toLocaleString()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: COLORS.BG_LIGHT,
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      boxShadow: `0 8px 20px ${addAlpha(COLORS.SECONDARY, 0.08)}`,
                      '&:hover': {
                        boxShadow: `0 4px 12px ${addAlpha(COLORS.SECONDARY, 0.15)}`,
                        transform: 'translateY(-2px)'
                      }
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: COLORS.PRIMARY }}>
                          {t('dashboard.hotelAdmin.reports.bookingAnalytics')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                          {t('dashboard.hotelAdmin.reports.comprehensiveBookingMetrics')}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="h4" sx={{ fontWeight: 'bold', color: COLORS.BOOKED }}>
                            {reportsData.bookingStats?.totalBookings || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            {t('dashboard.hotelAdmin.reports.totalBookings')}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                            {t('dashboard.hotelAdmin.reports.thisMonth', { count: reportsData.bookingStats?.thisMonthBookings || 0 })}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {t('dashboard.hotelAdmin.reports.pendingCheckIns', { count: reportsData.bookingStats?.upcomingCheckIns || 0 })}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t('dashboard.hotelAdmin.reports.thisMonthShort', { count: reportsData.bookingStats?.thisMonthBookings || 0 })}
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
                    backgroundColor: COLORS.BG_LIGHT,
                    border: `1px solid ${COLORS.BORDER_LIGHT}`,
                    borderLeft: `2px solid ${COLORS.SECONDARY}`,
                    borderRadius: 2
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: COLORS.PRIMARY }}>
                        {t('dashboard.hotelAdmin.reports.bookingStatusOverview')}
                      </Typography>
                      <Grid container spacing={2}>
                        {Object.entries(reportsData.bookingStats.statusBreakdown).map(([status, count]) => (
                          <Grid item xs={12} sm={6} md={3} key={status}>
                            <Card elevation={0} sx={{ 
                              backgroundColor: COLORS.WHITE,
                              border: `1px solid ${COLORS.BORDER_LIGHT}`,
                              borderRadius: 2,
                              transition: 'all 0.2s',
                              '&:hover': {
                                boxShadow: `0 4px 12px ${addAlpha(COLORS.SECONDARY, 0.15)}`,
                                transform: 'translateY(-2px)'
                              }
                            }}>
                              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: COLORS.SECONDARY }}>
                                  {count}
                                </Typography>
                                <Chip 
                                  label={status.replace('_', ' ')}
                                  size="small"
                                  color={(() => {
                                    const statusColor = getBookingStatusColor(status);
                                    // Map custom colors to valid MUI colors
                                    if (statusColor === 'orange') return 'warning';
                                    return statusColor as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
                                  })()}
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
                        backgroundColor: COLORS.BG_LIGHT,
                        border: `1px solid ${COLORS.BORDER_LIGHT}`,
                        borderLeft: `2px solid ${COLORS.SECONDARY}`,
                        borderRadius: 2,
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: `0 4px 12px ${addAlpha(COLORS.SECONDARY, 0.15)}`,
                          transform: 'translateY(-2px)'
                        }
                      }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: COLORS.PRIMARY }}>
                            {t('dashboard.hotelAdmin.reports.roomTypeDistribution')}
                          </Typography>
                          {Object.entries(reportsData.hotelStats.roomsByType).map(([roomType, count]) => (
                            <Box key={roomType} sx={{ mb: 2 }}>
                              <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                                <span>{roomType.replace('_', ' ')}</span>
                                <span><strong>{t('dashboard.hotelAdmin.reports.roomsCount', { count })}</strong></span>
                              </Typography>
                              <Box sx={{ width: '100%', bgcolor: COLORS.BORDER_LIGHT, borderRadius: 1, mt: 0.5 }}>
                                <Box 
                                  sx={{ 
                                    width: `${reportsData.hotelStats && reportsData.hotelStats.totalRooms > 0 
                                      ? (Number(count) / reportsData.hotelStats.totalRooms) * 100 
                                      : 0}%`, 
                                    bgcolor: COLORS.SECONDARY, 
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
                        backgroundColor: COLORS.BG_LIGHT,
                        border: `1px solid ${COLORS.BORDER_LIGHT}`,
                        borderLeft: `2px solid ${COLORS.SECONDARY}`,
                        borderRadius: 2,
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: `0 4px 12px ${addAlpha(COLORS.SECONDARY, 0.15)}`,
                          transform: 'translateY(-2px)'
                        }
                      }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: COLORS.PRIMARY }}>
                            {t('dashboard.hotelAdmin.reports.staffByRole')}
                          </Typography>
                          {reportsData.hotelStats?.staffByRole && Object.keys(reportsData.hotelStats.staffByRole).length > 0 ? (
                            Object.entries(reportsData.hotelStats.staffByRole).map(([role, count]) => (
                              <Box key={role} sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                                  <span>{role.replace('_', ' ')}</span>
                                  <span><strong>{t('dashboard.hotelAdmin.reports.staffCount', { count })}</strong></span>
                                </Typography>
                                <Box sx={{ width: '100%', bgcolor: COLORS.BORDER_LIGHT, borderRadius: 1, mt: 0.5 }}>
                                  <Box 
                                    sx={{ 
                                      width: `${reportsData.hotelStats && reportsData.hotelStats.totalStaff > 0 
                                        ? (Number(count) / reportsData.hotelStats.totalStaff) * 100 
                                        : 0}%`, 
                                      bgcolor: COLORS.SECONDARY, 
                                      height: 6, 
                                      borderRadius: 1 
                                    }} 
                                  />
                                </Box>
                              </Box>
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              {t('dashboard.hotelAdmin.noStaffRoleData')}
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
                      backgroundColor: COLORS.BG_LIGHT,
                      border: `1px solid ${COLORS.BORDER_LIGHT}`,
                      borderLeft: `2px solid ${COLORS.SECONDARY}`,
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: `0 4px 12px ${addAlpha(COLORS.SECONDARY, 0.15)}`,
                        transform: 'translateY(-2px)'
                      }
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: COLORS.PRIMARY }}>
                          {t('dashboard.hotelAdmin.reports.upcomingActivity')}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{t('dashboard.hotelAdmin.reports.upcomingCheckInsWeek')}</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.SUCCESS }}>
                            {t('dashboard.hotelAdmin.reports.guestsCount', { count: reportsData.bookingStats?.upcomingCheckIns || 0 })}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{t('dashboard.hotelAdmin.reports.upcomingCheckOutsWeek')}</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.BOOKED }}>
                            {t('dashboard.hotelAdmin.reports.guestsCount', { count: reportsData.bookingStats?.upcomingCheckOuts || 0 })}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: COLORS.BG_LIGHT,
                      border: `1px solid ${COLORS.BORDER_LIGHT}`,
                      borderLeft: `2px solid ${COLORS.SECONDARY}`,
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: `0 4px 12px ${addAlpha(COLORS.SECONDARY, 0.15)}`,
                        transform: 'translateY(-2px)'
                      }
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: COLORS.PRIMARY }}>
                          {t('dashboard.hotelAdmin.reports.dailyOperationsSummary')}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{t('dashboard.hotelAdmin.reports.todaysCheckIns')}</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.SUCCESS }}>
                            {t('dashboard.hotelAdmin.reports.expectedCount', { count: Math.round((reportsData.bookingStats?.upcomingCheckIns || 0) / 7) })}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{t('dashboard.hotelAdmin.reports.todaysCheckOuts')}</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.BOOKED }}>
                            {t('dashboard.hotelAdmin.reports.expectedCount', { count: Math.round((reportsData.bookingStats?.upcomingCheckOuts || 0) / 7) })}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{t('dashboard.hotelAdmin.metrics.currentOccupancyRate')}</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.SECONDARY }}>
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
                      backgroundColor: COLORS.BG_LIGHT,
                      border: `1px solid ${COLORS.BORDER_LIGHT}`,
                      borderLeft: `2px solid ${COLORS.SECONDARY}`,
                      borderRadius: 2
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: COLORS.PRIMARY }}>
                          {t('dashboard.hotelAdmin.reports.weeklyActivityTrends')}
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ 
                              textAlign: 'center', 
                              p: 2, 
                              backgroundColor: COLORS.WHITE,
                              border: `1px solid ${COLORS.BORDER_LIGHT}`, 
                              borderRadius: 2,
                              transition: 'all 0.2s',
                              '&:hover': {
                                boxShadow: `0 4px 12px ${addAlpha(COLORS.SECONDARY, 0.15)}`,
                                transform: 'translateY(-2px)'
                              }
                            }}>
                              <Typography variant="h4" sx={{ fontWeight: 'bold', color: COLORS.SUCCESS }}>
                                {reportsData.bookingStats?.upcomingCheckIns || 0}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                {t('dashboard.hotelAdmin.reports.checkInsNext7Days')}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ 
                              textAlign: 'center', 
                              p: 2, 
                              backgroundColor: COLORS.WHITE,
                              border: `1px solid ${COLORS.BORDER_LIGHT}`, 
                              borderRadius: 2,
                              transition: 'all 0.2s',
                              '&:hover': {
                                boxShadow: `0 4px 12px ${addAlpha(COLORS.SECONDARY, 0.15)}`,
                                transform: 'translateY(-2px)'
                              }
                            }}>
                              <Typography variant="h4" sx={{ fontWeight: 'bold', color: COLORS.BOOKED }}>
                                {reportsData.bookingStats?.upcomingCheckOuts || 0}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                {t('dashboard.hotelAdmin.reports.checkOutsNext7Days')}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ 
                              textAlign: 'center', 
                              p: 2, 
                              backgroundColor: COLORS.WHITE,
                              border: `1px solid ${COLORS.BORDER_LIGHT}`, 
                              borderRadius: 2,
                              transition: 'all 0.2s',
                              '&:hover': {
                                boxShadow: `0 4px 12px ${addAlpha(COLORS.SECONDARY, 0.15)}`,
                                transform: 'translateY(-2px)'
                              }
                            }}>
                              <Typography variant="h4" sx={{ fontWeight: 'bold', color: COLORS.SECONDARY }}>
                                {reportsData.hotelStats?.availableRooms || 0}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                {t('dashboard.hotelAdmin.metrics.availableRooms')}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ 
                              textAlign: 'center', 
                              p: 2, 
                              backgroundColor: COLORS.WHITE,
                              border: `1px solid ${COLORS.BORDER_LIGHT}`, 
                              borderRadius: 2,
                              transition: 'all 0.2s',
                              '&:hover': {
                                boxShadow: `0 4px 12px ${addAlpha(COLORS.SECONDARY, 0.15)}`,
                                transform: 'translateY(-2px)'
                              }
                            }}>
                              <Typography variant="h4" sx={{ fontWeight: 'bold', color: COLORS.PURPLE_600 }}>
                                {reportsData.hotelStats?.activeStaff || 0}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                {t('dashboard.hotelAdmin.metrics.activeStaff')}
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
                        backgroundColor: COLORS.BG_LIGHT,
                        border: `1px solid ${COLORS.BORDER_LIGHT}`,
                        borderLeft: `2px solid ${COLORS.SECONDARY}`,
                        borderRadius: 2
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: COLORS.PRIMARY }}>
                          {t('dashboard.hotelAdmin.reports.quickActionsNavigation')}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => setActiveTab(3)}
                            sx={{
                              borderColor: COLORS.SECONDARY,
                              color: COLORS.SECONDARY,
                              fontWeight: 600,
                              '&:hover': {
                                backgroundColor: addAlpha(COLORS.SECONDARY, 0.1),
                                borderColor: COLORS.SECONDARY_HOVER
                              }
                            }}
                          >
                            {t('dashboard.hotelAdmin.reports.viewAllBookings')}
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => setActiveTab(2)}
                            sx={{
                              borderColor: COLORS.SECONDARY,
                              color: COLORS.SECONDARY,
                              fontWeight: 600,
                              '&:hover': {
                                backgroundColor: addAlpha(COLORS.SECONDARY, 0.1),
                                borderColor: COLORS.SECONDARY_HOVER
                              }
                            }}
                          >
                            {t('dashboard.hotelAdmin.reports.manageRooms')}
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => setActiveTab(1)}
                            sx={{
                              borderColor: COLORS.SECONDARY,
                              color: COLORS.SECONDARY,
                              fontWeight: 600,
                              '&:hover': {
                                backgroundColor: addAlpha(COLORS.SECONDARY, 0.1),
                                borderColor: COLORS.SECONDARY_HOVER
                              }
                            }}
                          >
                            {t('dashboard.hotelAdmin.reports.manageStaff')}
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => setActiveTab(4)}
                            sx={{
                              borderColor: COLORS.SECONDARY,
                              color: COLORS.SECONDARY,
                              fontWeight: 600,
                              '&:hover': {
                                backgroundColor: addAlpha(COLORS.SECONDARY, 0.1),
                                borderColor: COLORS.SECONDARY_HOVER
                              }
                            }}
                          >
                            {t('dashboard.hotelAdmin.reports.staffSchedules')}
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

        <TabPanel value={activeTab} index={7}>
          <HotelAuditCenter hotelId={hotel?.id ?? (user?.hotelId ? parseInt(user.hotelId, 10) : undefined)} />
        </TabPanel>

        <TabPanel value={activeTab} index={8}>
          {/* Pricing & Tax Configuration Tab */}
          <PricingConfiguration />
        </TabPanel>

        <TabPanel value={activeTab} index={9}>
          {/* Offline Bookings Tab */}
          <OfflineWalkInBooking
            hotelId={hotel?.id}
            onBookingComplete={(booking) => {
              // console.log('Offline booking created:', booking);
              setSnackbar({
                open: true,
                message: t('dashboard.hotelAdmin.messages.offlineBookingSuccess', { guestName: booking.guestName }),
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
          // console.log('Walk-in booking created successfully:', bookingData);
          setWalkInModalOpen(false);
          // Show success dialog
          setSuccessDialog({
            open: true,
            message: t('dashboard.hotelAdmin.messages.walkInBookingSuccess', { confirmationNumber: bookingData.confirmationNumber })
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
        <DialogTitle sx={{ textAlign: 'center', color: theme.palette.primary.main }}>
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
