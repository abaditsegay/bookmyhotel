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
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  PersonAdd as AddGuestIcon,
  Hotel as RoomIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { frontDeskApiService, FrontDeskStats } from '../../services/frontDeskApi';
import BookingManagementTable from '../../components/booking/BookingManagementTable';
import WalkInBookingModal from '../../components/booking/WalkInBookingModal';
import RoomManagementTable from '../../components/hotel/RoomManagementTable';

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
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get initial tab from URL parameter, default to 0
  const initialTab = parseInt(searchParams.get('tab') || '0', 10);
  const [activeTab, setActiveTab] = useState(Math.max(0, Math.min(initialTab, 2))); // Ensure tab is 0, 1, or 2
  const [stats, setStats] = useState<FrontDeskStats | null>(null);
  const [walkInModalOpen, setWalkInModalOpen] = useState(false);
  
  // Snackbar state for success notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
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

  // Load front desk statistics and initial data
  useEffect(() => {
    loadStats();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = () => {
    loadStats();
  };

  const handleWalkInSuccess = async (bookingData: any) => {
    console.log('Walk-in booking created successfully:', bookingData);
    // Close modal first
    setWalkInModalOpen(false);
    
    // Show success message
    setSnackbar({
      open: true,
      message: `Walk-in booking created successfully! Confirmation: ${bookingData.confirmationNumber}`,
      severity: 'success'
    });
    
    // Refresh stats and possibly switch to booking management tab
    loadStats();
    // Optionally switch to booking management tab to see the new booking
    setActiveTab(1);
    setSearchParams({ tab: '1' });
    
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
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        Front Desk Dashboard
      </Typography>

      {/* Today's Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                {todayStats.todaysArrivals}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Arrivals Today
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                {todayStats.todaysDepartures}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Departures Today
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {todayStats.currentOccupancy}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current Occupancy
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                {todayStats.roomsOutOfOrder}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Out of Order
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                {todayStats.roomsUnderMaintenance}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Under Maintenance
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {todayStats.availableRooms}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available Rooms
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="front desk tabs">
          <Tab label="Quick Actions" />
          <Tab label="Booking Management" />
          <Tab label="Room Management" />
          <Tab label="Housekeeping" />
        </Tabs>
      </Paper>

      {/* Quick Actions Tab */}
      <TabPanel value={activeTab} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Today's Quick Actions
          </Typography>
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />} 
              sx={{ mr: 2 }}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<RoomIcon />}
              sx={{ mr: 2 }}
              onClick={() => {
                setActiveTab(2);
                setSearchParams({ tab: '2' });
              }}
            >
              Manage Rooms
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AddGuestIcon />}
              onClick={() => {
                console.log('Walk-in booking button clicked!'); // Debug log
                setWalkInModalOpen(true);
              }}
            >
              Walk-in Guest
            </Button>
          </Box>
        </Box>
        
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Quick actions for today's arrivals and departures will be displayed here.
              Use the "Booking Management" tab for comprehensive booking operations.
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Comprehensive Booking Management Tab */}
      <TabPanel value={activeTab} index={1}>
        <BookingManagementTable
          mode="front-desk"
          title="Booking Management"
          showActions={true}
          showCheckInOut={true}
          currentTab={activeTab}
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

      {/* Housekeeping Tab */}
      <TabPanel value={activeTab} index={2}>
        <RoomManagementTable
          onRoomUpdate={(room) => {
            console.log('Room updated:', room);
            // Refresh stats when room is updated
            loadStats();
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
    </Box>
  );
};

export default FrontDeskDashboard;
