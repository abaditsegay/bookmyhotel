import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Engineering as EngineeringIcon,
  CleaningServices as CleaningIcon,
  Dashboard as DashboardIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { operationsSupervisorApi } from '../../services/operationsSupervisorApi';
import {
  DashboardStats,
  HousekeepingTask,
  MaintenanceRequest,
  HousekeepingStaff,
  CreateHousekeepingTaskRequest,
  CreateMaintenanceRequestRequest
} from '../../types/operations';

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
      id={`operations-tabpanel-${index}`}
      aria-labelledby={`operations-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const OperationsSupervisorDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dashboard data
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [housekeepingTasks, setHousekeepingTasks] = useState<HousekeepingTask[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [staff, setStaff] = useState<HousekeepingStaff[]>([]);
  
  // Dialog states
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [openMaintenanceDialog, setOpenMaintenanceDialog] = useState(false);
  
  // Form states
  const [newTask, setNewTask] = useState<Partial<CreateHousekeepingTaskRequest>>({});
  const [newMaintenance, setNewMaintenance] = useState<Partial<CreateMaintenanceRequestRequest>>({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [stats, tasks, maintenance, staffData] = await Promise.all([
        operationsSupervisorApi.getDashboardStats(),
        operationsSupervisorApi.getHousekeepingTasks(0, 20),
        operationsSupervisorApi.getMaintenanceRequests(0, 20),
        operationsSupervisorApi.getStaff(0, 50)
      ]);
      
      setDashboardStats(stats);
      setHousekeepingTasks(tasks.content);
      setMaintenanceRequests(maintenance.content);
      setStaff(staffData.content);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      await operationsSupervisorApi.createHousekeepingTask(newTask as CreateHousekeepingTaskRequest);
      setOpenTaskDialog(false);
      setNewTask({});
      loadDashboardData();
    } catch (err) {
      setError('Failed to create task');
      console.error('Create task error:', err);
    }
  };

  const handleCreateMaintenance = async () => {
    try {
      await operationsSupervisorApi.createMaintenanceRequest(newMaintenance as CreateMaintenanceRequestRequest);
      setOpenMaintenanceDialog(false);
      setNewMaintenance({});
      loadDashboardData();
    } catch (err) {
      setError('Failed to create maintenance request');
      console.error('Create maintenance error:', err);
    }
  };

  const handleAssignTask = async (taskId: number, staffId: number) => {
    try {
      await operationsSupervisorApi.assignHousekeepingTask(taskId, staffId);
      loadDashboardData();
    } catch (err) {
      setError('Failed to assign task');
      console.error('Assign task error:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'assigned': case 'in_progress': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Operations Supervisor Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab icon={<DashboardIcon />} label="Dashboard" />
        <Tab icon={<CleaningIcon />} label="Housekeeping" />
        <Tab icon={<EngineeringIcon />} label="Maintenance" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Dashboard Stats */}
          {dashboardStats && (
            <>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Housekeeping Overview
                    </Typography>
                    <Typography>Total Tasks: {dashboardStats.housekeeping.totalTasks}</Typography>
                    <Typography>Pending: {dashboardStats.housekeeping.pendingTasks}</Typography>
                    <Typography>Active Staff: {dashboardStats.housekeeping.activeStaff}</Typography>
                    <Typography>Completion Rate: {dashboardStats.housekeeping.completionRate}%</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Maintenance Overview
                    </Typography>
                    <Typography>Total Tasks: {dashboardStats.maintenance.totalTasks}</Typography>
                    <Typography>Pending: {dashboardStats.maintenance.pendingTasks}</Typography>
                    <Typography>Total Cost: ${dashboardStats.maintenance.totalCost}</Typography>
                    <Typography>Completion Rate: {dashboardStats.maintenance.completionRate}%</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Housekeeping Tasks</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenTaskDialog(true)}
          >
            New Task
          </Button>
        </Box>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Assigned Staff</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {housekeepingTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{task.roomNumber || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip label={task.status} color={getStatusColor(task.status)} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip label={task.priority} color={getStatusColor(task.priority)} size="small" />
                  </TableCell>
                  <TableCell>{task.assignedStaff?.user?.firstName || 'Unassigned'}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => {}}>
                      <AssignmentIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Maintenance Requests</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenMaintenanceDialog(true)}
          >
            New Request
          </Button>
        </Box>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {maintenanceRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.title}</TableCell>
                  <TableCell>{request.category}</TableCell>
                  <TableCell>
                    <Chip label={request.priority} color={getStatusColor(request.priority)} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip label={request.status} color={getStatusColor(request.status)} size="small" />
                  </TableCell>
                  <TableCell>{request.roomNumber || 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => {}}>
                      <AssignmentIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Create Task Dialog */}
      <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Housekeeping Task</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={newTask.title || ''}
            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={newTask.description || ''}
            onChange={(e) => setNewTask({...newTask, description: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Room Number"
            value={newTask.roomNumber || ''}
            onChange={(e) => setNewTask({...newTask, roomNumber: e.target.value})}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTask} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Create Maintenance Dialog */}
      <Dialog open={openMaintenanceDialog} onClose={() => setOpenMaintenanceDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Maintenance Request</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={newMaintenance.title || ''}
            onChange={(e) => setNewMaintenance({...newMaintenance, title: e.target.value})}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={newMaintenance.description || ''}
            onChange={(e) => setNewMaintenance({...newMaintenance, description: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Room Number"
            value={newMaintenance.roomNumber || ''}
            onChange={(e) => setNewMaintenance({...newMaintenance, roomNumber: e.target.value})}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMaintenanceDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateMaintenance} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OperationsSupervisorDashboard;