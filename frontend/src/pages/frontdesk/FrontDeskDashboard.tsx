import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Paper,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { frontDeskApiService, FrontDeskStats } from '../../services/frontDeskApi';
import BookingManagementTable from '../../components/booking/BookingManagementTable';
import WalkInBookingModal from '../../components/booking/WalkInBookingModal';
import FrontDeskRoomManagement from '../../components/frontdesk/FrontDeskRoomManagement';
import OfflineWalkInBooking from '../../components/OfflineWalkInBooking';
import { roomCacheService } from '../../services/RoomCacheService';
import { COLORS } from '../../theme/themeColors';

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
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

const FrontDeskDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useTheme();
  
  // Get initial tab from URL parameter, default to 0
  const initialTab = parseInt(searchParams.get('tab') || '0', 10);
  const [activeTab, setActiveTab] = useState(Math.max(0, Math.min(initialTab, 3))); // Ensure tab is 0, 1, 2, or 3

  // Sync tab state with URL parameters when they change externally
  useEffect(() => {
    const urlTab = parseInt(searchParams.get('tab') || '0', 10);
    const validTab = Math.max(0, Math.min(urlTab, 3));
    console.log(`🔗 FrontDesk: URL tab changed to ${urlTab}, setting valid tab to ${validTab}`);
    setActiveTab(validTab);
  }, [searchParams]); // Remove activeTab from dependencies to prevent circular updates
  const [stats, setStats] = useState<FrontDeskStats | null>(null);
  const [walkInModalOpen, setWalkInModalOpen] = useState(false);
  
  // Booking refresh trigger for walk-in bookings
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

  // Debug modal state changes
  useEffect(() => {
    console.log('FrontDeskDashboard - walkInModalOpen state changed:', walkInModalOpen);
  }, [walkInModalOpen]);

  // Update URL when tab changes
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    // Prevent unnecessary updates if already on the same tab
    if (newValue === activeTab) {
      console.log(`🔄 FrontDesk: Already on tab ${newValue}, skipping...`);
      return;
    }
    
    console.log(`🔄 FrontDesk: Switching from tab ${activeTab} to tab ${newValue}`);
    console.log(`🔄 FrontDesk: Tab ${newValue} corresponds to:`, 
      newValue === 0 ? 'Bookings' :
      newValue === 1 ? 'Rooms' :
      newValue === 2 ? 'Housekeeping' :
      newValue === 3 ? 'Offline Bookings' : 'Unknown');
    setActiveTab(newValue);
    
    // Update URL parameters without triggering navigation
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('tab', newValue.toString());
      return newParams;
    });
    
    // If switching to Rooms tab (index 1), ensure room cache is loaded
    if (newValue === 1 && user?.hotelId) {
      const hotelId = parseInt(user.hotelId);
      console.log('🏨 Switching to Rooms tab, ensuring room cache is loaded...');
      roomCacheService.getRooms(hotelId).then(rooms => {
        console.log(`✅ Room cache ready: ${rooms.length} rooms available`);
      }).catch(error => {
        console.warn('Failed to load room cache for Rooms tab:', error);
      });
    }
  };

  // Load front desk statistics
  const loadStats = async () => {
    if (!token) return;
    
    try {
      const result = await frontDeskApiService.getFrontDeskStats(token);
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  // Preload and cache room data for offline use
  const preloadRoomData = async () => {
    console.log('🚀 FrontDesk Dashboard: preloadRoomData called');
    console.log('🔍 FrontDesk Dashboard: user?.hotelId:', user?.hotelId);
    console.log('🔍 FrontDesk Dashboard: token exists:', !!token);
    console.log('🔍 FrontDesk Dashboard: user object:', user);
    
    if (!user?.hotelId || !token) {
      console.warn('⚠️ FrontDesk Dashboard: Missing hotelId or token, skipping room preload');
      return;
    }
    
    try {
      const hotelId = parseInt(user.hotelId);
      console.log('🏨 FrontDesk Dashboard: Preloading room data for hotel', hotelId);
      
      // Force refresh to get latest room data and cache it
      const rooms = await roomCacheService.getRooms(hotelId, true);
      console.log('📊 FrontDesk Dashboard: Retrieved rooms:', rooms.length, 'rooms');
      console.log('🔍 FrontDesk Dashboard: Sample room data:', rooms.slice(0, 2));
      
      // Start periodic refresh for this hotel
      roomCacheService.startPeriodicRefresh(hotelId);
      
      console.log('✅ FrontDesk Dashboard: Room data preloaded successfully');
    } catch (error) {
      console.error('❌ FrontDesk Dashboard: Failed to preload room data:', error);
      console.error('❌ FrontDesk Dashboard: Error stack:', error instanceof Error ? error.stack : 'No stack');
    }
  };

  // Load front desk statistics and initial data
  useEffect(() => {
    loadStats();
    preloadRoomData(); // Preload room data for offline use
  }, [token, user?.hotelId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = () => {
    loadStats();
  };

  const handleWalkInSuccess = async (bookingData: any) => {
    console.log('Walk-in booking created successfully:', bookingData);
    // Close modal first
    setWalkInModalOpen(false);
    
    // Show success dialog
    setSuccessDialog({
      open: true,
      message: t('dashboard.frontDesk.success.walkInBookingCreated', { confirmationNumber: bookingData.confirmationNumber })
    });
    
    // Refresh stats and trigger booking list refresh
    loadStats();
    setBookingRefreshTrigger(prev => prev + 1);
    
    // Switch to booking management tab to see the new booking (now index 0)
    setActiveTab(0);
    setSearchParams({ tab: '0' });
    
    // Add a small delay to ensure the booking appears in the list
    // The tab switch and currentTab dependency should trigger a refresh
  };

  const todayStats = stats || {
    todaysArrivals: 0,
    todaysDepartures: 0,
    currentOccupancy: 0,
    availableRooms: 0,
    roomsOutOfOrder: 0,
    roomsUnderMaintenance: 0
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Today's Statistics */}
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 0.75, px: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'info.main', lineHeight: 1.2 }}>
                {todayStats.todaysArrivals}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {t('dashboard.frontDesk.stats.arrivalsToday')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 0.75, px: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main', lineHeight: 1.2 }}>
                {todayStats.todaysDepartures}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {t('dashboard.frontDesk.stats.departuresToday')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 0.75, px: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.PRIMARY, lineHeight: 1.2 }}>
                {todayStats.currentOccupancy}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {t('dashboard.frontDesk.stats.currentOccupancy')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 0.75, px: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'error.main', lineHeight: 1.2 }}>
                {todayStats.roomsOutOfOrder}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {t('dashboard.frontDesk.stats.outOfOrder')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 0.75, px: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main', lineHeight: 1.2 }}>
                {todayStats.roomsUnderMaintenance}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {t('dashboard.frontDesk.stats.underMaintenance')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 0.75, px: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', lineHeight: 1.2 }}>
                {todayStats.availableRooms}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {t('dashboard.frontDesk.stats.availableRooms')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="front desk tabs"
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
          <Tab label={t('dashboard.frontDesk.tabs.bookings')} />
          <Tab label={t('dashboard.frontDesk.tabs.rooms')} />
          <Tab label={t('dashboard.frontDesk.tabs.housekeeping')} />
          <Tab label={t('dashboard.frontDesk.tabs.offlineBookings')} />
        </Tabs>
      </Paper>

      {/* Comprehensive Booking Management Tab */}
      <TabPanel value={activeTab} index={0}>
        <BookingManagementTable
          mode="front-desk"
          title=""
          showActions={true}
          showCheckInOut={true}
          currentTab={activeTab}
          refreshTrigger={bookingRefreshTrigger}
          onBookingAction={(booking, action) => {
            console.log(`${action} for booking:`, booking);
            // Handle booking actions like check-in/check-out
            handleRefresh();
          }}
          onWalkInRequest={() => {
            console.log('Walk-in booking requested from BookingManagementTable'); // Debug log
            setWalkInModalOpen(true);
          }}
        />
      </TabPanel>

      {/* Room Management Tab */}
      <TabPanel value={activeTab} index={1}>
        <FrontDeskRoomManagement
          onRoomUpdate={(room) => {
            console.log('Room updated:', room);
            // Refresh stats when room is updated
            loadStats();
            // Also refresh room cache to keep IndexedDB in sync
            if (user?.hotelId) {
              const hotelId = parseInt(user.hotelId);
              roomCacheService.getRooms(hotelId, true).catch(error => {
                console.warn('Failed to refresh room cache after update:', error);
              });
            }
          }}
        />
      </TabPanel>

      {/* Housekeeping Tab */}
      <TabPanel value={activeTab} index={2}>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            {t('dashboard.frontDesk.housekeepingModule.title')}
          </Typography>
          <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
            {t('dashboard.frontDesk.housekeepingModule.description')}
          </Typography>
        </Box>
      </TabPanel>

      {/* Offline Bookings Tab */}
      <TabPanel value={activeTab} index={3}>
        <OfflineWalkInBooking
          onBookingComplete={(booking) => {
            console.log('Offline booking created:', booking);
            setSnackbar({
              open: true,
              message: t('dashboard.frontDesk.success.offlineBookingCreated', { guestName: booking.guestName }),
              severity: 'success'
            });
            // Refresh booking data
            setBookingRefreshTrigger(prev => prev + 1);
          }}
        />
      </TabPanel>

      {/* Walk-in Booking Modal */}
      <WalkInBookingModal
        key={walkInModalOpen ? 'modal-open' : 'modal-closed'} // Force re-render
        open={walkInModalOpen}
        onClose={() => {
          console.log('Closing walk-in modal'); // Debug log
          setWalkInModalOpen(false);
        }}
        onSuccess={handleWalkInSuccess}
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
          ✅ {t('dashboard.frontDesk.success.title')}
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
            {t('dashboard.frontDesk.success.okButton')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FrontDeskDashboard;
