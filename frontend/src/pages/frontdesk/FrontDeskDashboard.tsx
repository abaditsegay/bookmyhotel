import React, { useState, useEffect } from 'react';
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
  Button
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { frontDeskApiService, FrontDeskStats } from '../../services/frontDeskApi';
import BookingManagementTable from '../../components/booking/BookingManagementTable';
import WalkInBookingModal from '../../components/booking/WalkInBookingModal';
import FrontDeskRoomManagement from '../../components/frontdesk/FrontDeskRoomManagement';
import OfflineWalkInBooking from '../../components/OfflineWalkInBooking';
import { roomCacheService } from '../../services/RoomCacheService';

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
  const { token, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get initial tab from URL parameter, default to 0
  const initialTab = parseInt(searchParams.get('tab') || '0', 10);
  const [activeTab, setActiveTab] = useState(Math.max(0, Math.min(initialTab, 3))); // Ensure tab is 0, 1, 2, or 3
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
    setActiveTab(newValue);
    setSearchParams({ tab: newValue.toString() });
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
      message: `Walk-in booking created successfully! Confirmation: ${bookingData.confirmationNumber}`
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
                Arrivals Today
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
                Departures Today
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 0.75, px: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main', lineHeight: 1.2 }}>
                {todayStats.currentOccupancy}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Current Occupancy
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
                Out of Order
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
                Under Maintenance
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
                Available Rooms
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
            '& .MuiTab-root:nth-of-type(4)': { // Target the 4th tab (Offline Bookings)
              backgroundColor: '#ff9800', // Orange background
              color: '#fff',
              '&:hover': {
                backgroundColor: '#f57c00', // Darker orange on hover
              },
              '&.Mui-selected': {
                backgroundColor: '#e65100', // Even darker orange when selected
                color: '#fff',
              },
            },
          }}
        >
          <Tab label="Bookings" />
          <Tab label="Rooms" />
          <Tab label="Housekeeping" />
          <Tab label="Offline Bookings" />
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
          }}
        />
      </TabPanel>

      {/* Housekeeping Tab */}
      <TabPanel value={activeTab} index={2}>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Housekeeping Module
          </Typography>
          <Typography color="text.secondary">
            Housekeeping features will be available in future releases.
            <br />
            Currently, room status changes can be managed through the Room Management tab.
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
              message: `Offline booking created successfully for ${booking.guestName}`,
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
        <DialogTitle sx={{ textAlign: 'center', color: 'success.main' }}>
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

export default FrontDeskDashboard;
