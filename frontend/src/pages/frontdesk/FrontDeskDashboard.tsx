import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Paper,
  Alert,
  Snackbar,
  TablePagination,
  Tooltip
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Check as CheckInIcon,
  ExitToApp as CheckOutIcon,
  CleaningServices as CleaningIcon,
  Build as MaintenanceIcon,
  PersonAdd as AddGuestIcon,
  Assignment as AssignIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon
} from '@mui/icons-material';

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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface Booking {
  id: string;
  guestName: string;
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  status: 'arriving' | 'checked-in' | 'checked-out' | 'no-show' | 'cancelled';
  nights: number;
  adults: number;
  children: number;
  totalAmount: number;
  paymentStatus: 'paid' | 'pending' | 'partial';
}

interface HousekeepingTask {
  id: string;
  roomNumber: string;
  roomType: string;
  status: 'dirty' | 'cleaning' | 'clean' | 'inspected' | 'out-of-order' | 'maintenance';
  assignedTo: string;
  priority: 'low' | 'medium' | 'high';
  lastUpdated: string;
  notes: string;
  estimatedCompletion: string;
}

const FrontDeskDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [housekeepingTasks, setHousekeepingTasks] = useState<HousekeepingTask[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedTask, setSelectedTask] = useState<HousekeepingTask | null>(null);
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [bookingPage, setBookingPage] = useState(0);
  const [housekeepingPage, setHousekeepingPage] = useState(0);
  const [rowsPerPage] = useState(10);

  // TODO: Replace with real API calls to fetch bookings
  useEffect(() => {
    // Load bookings from API when implemented
    const loadBookings = async () => {
      // Placeholder for API call
      setBookings([]);
    };
    loadBookings();
  }, []);

  // TODO: Replace with real API calls to fetch housekeeping tasks
  useEffect(() => {
    // Load housekeeping tasks from API when implemented
    const loadHousekeepingTasks = async () => {
      // Placeholder for API call
      setHousekeepingTasks([]);
    };
    loadHousekeepingTasks();
  }, []);

  // Mock data for housekeeping
  useEffect(() => {
    const mockTasks: HousekeepingTask[] = [
      {
        id: 'HK001',
        roomNumber: '101',
        roomType: 'Standard',
        status: 'dirty',
        assignedTo: 'Maria Rodriguez',
        priority: 'high',
        lastUpdated: '2025-08-17 10:30',
        notes: 'Guest checking out today, prepare for new arrival',
        estimatedCompletion: '2025-08-17 14:00'
      },
      {
        id: 'HK002',
        roomNumber: '205',
        roomType: 'Deluxe',
        status: 'cleaning',
        assignedTo: 'James Wilson',
        priority: 'medium',
        lastUpdated: '2025-08-17 11:15',
        notes: 'Deep cleaning in progress',
        estimatedCompletion: '2025-08-17 15:30'
      },
      {
        id: 'HK003',
        roomNumber: '304',
        roomType: 'Suite',
        status: 'inspected',
        assignedTo: 'Lisa Chen',
        priority: 'low',
        lastUpdated: '2025-08-17 09:45',
        notes: 'Ready for next guest',
        estimatedCompletion: 'Completed'
      },
      {
        id: 'HK004',
        roomNumber: '102',
        roomType: 'Standard',
        status: 'out-of-order',
        assignedTo: 'Maintenance Team',
        priority: 'high',
        lastUpdated: '2025-08-17 08:00',
        notes: 'AC unit needs repair',
        estimatedCompletion: '2025-08-17 16:00'
      }
    ];
    setHousekeepingTasks(mockTasks);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'arriving': return 'info';
      case 'checked-in': return 'success';
      case 'checked-out': return 'default';
      case 'no-show': return 'error';
      case 'cancelled': return 'error';
      case 'dirty': return 'error';
      case 'cleaning': return 'warning';
      case 'clean': return 'info';
      case 'inspected': return 'success';
      case 'out-of-order': return 'error';
      case 'maintenance': return 'warning';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const handleCheckIn = (booking: Booking) => {
    setBookings(prev => prev.map(b => 
      b.id === booking.id ? { ...b, status: 'checked-in' as const } : b
    ));
    setSnackbar({ open: true, message: `Guest ${booking.guestName} checked in successfully`, severity: 'success' });
  };

  const handleCheckOut = (booking: Booking) => {
    setBookings(prev => prev.map(b => 
      b.id === booking.id ? { ...b, status: 'checked-out' as const } : b
    ));
    setSnackbar({ open: true, message: `Guest ${booking.guestName} checked out successfully`, severity: 'success' });
  };

  const handleTaskStatusUpdate = (task: HousekeepingTask, newStatus: HousekeepingTask['status']) => {
    setHousekeepingTasks(prev => prev.map(t => 
      t.id === task.id ? { 
        ...t, 
        status: newStatus, 
        lastUpdated: new Date().toLocaleString(),
        estimatedCompletion: newStatus === 'inspected' ? 'Completed' : t.estimatedCompletion
      } : t
    ));
    setSnackbar({ open: true, message: `Room ${task.roomNumber} status updated to ${newStatus}`, severity: 'success' });
  };

  const todayStats = {
    totalArrivals: bookings.filter(b => b.status === 'arriving').length,
    totalDepartures: bookings.filter(b => b.status === 'checked-out').length,
    currentOccupancy: bookings.filter(b => b.status === 'checked-in').length,
    roomsOutOfOrder: housekeepingTasks.filter(t => t.status === 'out-of-order').length,
    roomsCleaning: housekeepingTasks.filter(t => t.status === 'cleaning').length,
    roomsReady: housekeepingTasks.filter(t => t.status === 'inspected').length
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
                {todayStats.totalArrivals}
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
                {todayStats.totalDepartures}
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
                {todayStats.roomsCleaning}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Being Cleaned
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {todayStats.roomsReady}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rooms Ready
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="front desk tabs">
          <Tab label="Booking Management" />
          <Tab label="Housekeeping" />
        </Tabs>
      </Paper>

      {/* Booking Management Tab */}
      <TabPanel value={activeTab} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Today's Bookings
          </Typography>
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />} 
              sx={{ mr: 2 }}
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AddGuestIcon />}
            >
              Walk-in Guest
            </Button>
          </Box>
        </Box>

        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Booking ID</strong></TableCell>
                  <TableCell><strong>Guest Name</strong></TableCell>
                  <TableCell><strong>Room</strong></TableCell>
                  <TableCell><strong>Check-in</strong></TableCell>
                  <TableCell><strong>Check-out</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Payment</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings
                  .slice(bookingPage * rowsPerPage, bookingPage * rowsPerPage + rowsPerPage)
                  .map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.id}</TableCell>
                    <TableCell>{booking.guestName}</TableCell>
                    <TableCell>{booking.roomNumber} ({booking.roomType})</TableCell>
                    <TableCell>{new Date(booking.checkIn).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(booking.checkOut).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={booking.status.replace('-', ' ')} 
                        color={getStatusColor(booking.status)} 
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={booking.paymentStatus} 
                        color={booking.paymentStatus === 'paid' ? 'success' : 'warning'} 
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            setSelectedBooking(booking);
                            setOpenBookingDialog(true);
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      {booking.status === 'arriving' && (
                        <Tooltip title="Check In">
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => handleCheckIn(booking)}
                          >
                            <CheckInIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {booking.status === 'checked-in' && (
                        <Tooltip title="Check Out">
                          <IconButton 
                            size="small" 
                            color="warning"
                            onClick={() => handleCheckOut(booking)}
                          >
                            <CheckOutIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Print Receipt">
                        <IconButton size="small">
                          <PrintIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={bookings.length}
            page={bookingPage}
            onPageChange={(event, newPage) => setBookingPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10]}
          />
        </Card>
      </TabPanel>

      {/* Housekeeping Tab */}
      <TabPanel value={activeTab} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Housekeeping Management
          </Typography>
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />} 
              sx={{ mr: 2 }}
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AssignIcon />}
            >
              Assign Tasks
            </Button>
          </Box>
        </Box>

        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Room</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Assigned To</strong></TableCell>
                  <TableCell><strong>Priority</strong></TableCell>
                  <TableCell><strong>Est. Completion</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {housekeepingTasks
                  .slice(housekeepingPage * rowsPerPage, housekeepingPage * rowsPerPage + rowsPerPage)
                  .map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.roomNumber}</TableCell>
                    <TableCell>{task.roomType}</TableCell>
                    <TableCell>
                      <Chip 
                        label={task.status.replace('-', ' ')} 
                        color={getStatusColor(task.status)} 
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{task.assignedTo}</TableCell>
                    <TableCell>
                      <Chip 
                        label={task.priority} 
                        color={getPriorityColor(task.priority)} 
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{task.estimatedCompletion}</TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            setSelectedTask(task);
                            setOpenTaskDialog(true);
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      {task.status === 'dirty' && (
                        <Tooltip title="Start Cleaning">
                          <IconButton 
                            size="small" 
                            color="warning"
                            onClick={() => handleTaskStatusUpdate(task, 'cleaning')}
                          >
                            <CleaningIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {task.status === 'cleaning' && (
                        <Tooltip title="Mark Clean">
                          <IconButton 
                            size="small" 
                            color="info"
                            onClick={() => handleTaskStatusUpdate(task, 'clean')}
                          >
                            <CheckInIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {task.status === 'clean' && (
                        <Tooltip title="Mark Inspected">
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => handleTaskStatusUpdate(task, 'inspected')}
                          >
                            <CheckInIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {task.status === 'out-of-order' && (
                        <Tooltip title="Maintenance">
                          <IconButton size="small" color="error">
                            <MaintenanceIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={housekeepingTasks.length}
            page={housekeepingPage}
            onPageChange={(event, newPage) => setHousekeepingPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10]}
          />
        </Card>
      </TabPanel>

      {/* Booking Details Dialog */}
      <Dialog open={openBookingDialog} onClose={() => setOpenBookingDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Booking Details - {selectedBooking?.id}</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Guest Information</Typography>
                <Typography><strong>Name:</strong> {selectedBooking.guestName}</Typography>
                <Typography><strong>Adults:</strong> {selectedBooking.adults}</Typography>
                <Typography><strong>Children:</strong> {selectedBooking.children}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Booking Details</Typography>
                <Typography><strong>Room:</strong> {selectedBooking.roomNumber} ({selectedBooking.roomType})</Typography>
                <Typography><strong>Check-in:</strong> {new Date(selectedBooking.checkIn).toLocaleDateString()}</Typography>
                <Typography><strong>Check-out:</strong> {new Date(selectedBooking.checkOut).toLocaleDateString()}</Typography>
                <Typography><strong>Nights:</strong> {selectedBooking.nights}</Typography>
                <Typography><strong>Total Amount:</strong> ${selectedBooking.totalAmount}</Typography>
                <Typography><strong>Payment Status:</strong> 
                  <Chip 
                    label={selectedBooking.paymentStatus} 
                    color={selectedBooking.paymentStatus === 'paid' ? 'success' : 'warning'} 
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBookingDialog(false)}>Close</Button>
          {selectedBooking?.status === 'arriving' && (
            <Button 
              variant="contained" 
              color="success"
              onClick={() => {
                handleCheckIn(selectedBooking);
                setOpenBookingDialog(false);
              }}
            >
              Check In
            </Button>
          )}
          {selectedBooking?.status === 'checked-in' && (
            <Button 
              variant="contained" 
              color="warning"
              onClick={() => {
                handleCheckOut(selectedBooking);
                setOpenBookingDialog(false);
              }}
            >
              Check Out
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Housekeeping Task Details Dialog */}
      <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Housekeeping Task - Room {selectedTask?.roomNumber}</DialogTitle>
        <DialogContent>
          {selectedTask && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Task Information</Typography>
                <Typography><strong>Room:</strong> {selectedTask.roomNumber} ({selectedTask.roomType})</Typography>
                <Typography><strong>Status:</strong> 
                  <Chip 
                    label={selectedTask.status.replace('-', ' ')} 
                    color={getStatusColor(selectedTask.status)} 
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography><strong>Priority:</strong> 
                  <Chip 
                    label={selectedTask.priority} 
                    color={getPriorityColor(selectedTask.priority)} 
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Assignment Details</Typography>
                <Typography><strong>Assigned To:</strong> {selectedTask.assignedTo}</Typography>
                <Typography><strong>Last Updated:</strong> {selectedTask.lastUpdated}</Typography>
                <Typography><strong>Est. Completion:</strong> {selectedTask.estimatedCompletion}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Notes</Typography>
                <Typography>{selectedTask.notes}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskDialog(false)}>Close</Button>
          <Button variant="outlined">Edit Task</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FrontDeskDashboard;
