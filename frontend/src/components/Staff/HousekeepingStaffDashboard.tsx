import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  Info as InfoIcon,
  CleaningServices as CleaningIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { staffApi } from '../../services/staffApi';
import { HousekeepingTask } from '../../types/operations';

const HousekeepingStaffDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<HousekeepingTask | null>(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadMyTasks();
    loadStats();
  }, []);

  const loadMyTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const tasksData = await staffApi.getMyHousekeepingTasks();
      setTasks(tasksData);
    } catch (err) {
      setError('Failed to load your tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await staffApi.getStaffStats('HOUSEKEEPING');
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedTask || !newStatus) return;

    try {
      await staffApi.updateHousekeepingTaskStatus(selectedTask.id, {
        status: newStatus,
        notes: notes.trim() || undefined
      });
      
      setStatusDialog(false);
      setSelectedTask(null);
      setNotes('');
      setNewStatus('');
      await loadMyTasks();
      await loadStats();
    } catch (err) {
      setError('Failed to update task status');
      console.error('Error updating task:', err);
    }
  };

  const handleStartTask = async (task: HousekeepingTask) => {
    try {
      await staffApi.startHousekeepingTask(task.id);
      await loadMyTasks();
      await loadStats();
    } catch (err) {
      setError('Failed to start task');
      console.error('Error starting task:', err);
    }
  };

  const handleCompleteTask = async (task: HousekeepingTask, completionNotes?: string) => {
    try {
      await staffApi.completeHousekeepingTask(task.id, completionNotes);
      await loadMyTasks();
      await loadStats();
    } catch (err) {
      setError('Failed to complete task');
      console.error('Error completing task:', err);
    }
  };

  const openStatusDialog = (task: HousekeepingTask) => {
    setSelectedTask(task);
    setNewStatus(task.status);
    setNotes('');
    setStatusDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'warning';
      case 'IN_PROGRESS': return 'info';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getTaskTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'CLEANING': return 'primary';
      case 'MAINTENANCE': return 'secondary';
      case 'INSPECTION': return 'info';
      default: return 'default';
    }
  };

  const canStartTask = (task: HousekeepingTask) => {
    return task.status === 'PENDING' || task.status === 'ASSIGNED';
  };

  const canCompleteTask = (task: HousekeepingTask) => {
    return task.status === 'IN_PROGRESS';
  };

  const canUpdateStatus = (task: HousekeepingTask) => {
    return task.status !== 'COMPLETED' && task.status !== 'CANCELLED';
  };

  if (loading && tasks.length === 0) {
    return (
      <Box sx={{ width: '100%', p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ py: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CleaningIcon color="primary" />
          My Housekeeping Tasks
        </Typography>

        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AssignmentIcon color="primary" />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Tasks
                    </Typography>
                    <Typography variant="h4">
                      {stats.totalTasks || 0}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ScheduleIcon color="warning" />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Pending
                    </Typography>
                    <Typography variant="h4">
                      {stats.pendingTasks || 0}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PlayArrowIcon color="info" />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      In Progress
                    </Typography>
                    <Typography variant="h4">
                      {stats.inProgressTasks || 0}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckCircleIcon color="success" />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Completed
                    </Typography>
                    <Typography variant="h4">
                      {stats.completedTasks || 0}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tasks Table */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                My Tasks ({tasks.length})
              </Typography>
              <Button onClick={loadMyTasks} disabled={loading}>
                Refresh
              </Button>
            </Box>

            {tasks.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="textSecondary">
                  No tasks assigned to you at the moment.
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Room</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <Typography variant="subtitle2">
                            {task.roomNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={task.taskType}
                            color={getTaskTypeColor(task.taskType)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {task.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={task.priority}
                            color={task.priority === 'HIGH' ? 'error' : task.priority === 'NORMAL' ? 'warning' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={task.status}
                            color={getStatusColor(task.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {canStartTask(task) && (
                              <IconButton
                                color="primary"
                                onClick={() => handleStartTask(task)}
                                title="Start Task"
                              >
                                <PlayArrowIcon />
                              </IconButton>
                            )}
                            {canCompleteTask(task) && (
                              <IconButton
                                color="success"
                                onClick={() => handleCompleteTask(task)}
                                title="Complete Task"
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            )}
                            {canUpdateStatus(task) && (
                              <IconButton
                                color="info"
                                onClick={() => openStatusDialog(task)}
                                title="Update Status"
                              >
                                <InfoIcon />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Status Update Dialog */}
        <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Update Task Status</DialogTitle>
          <DialogContent>
            {selectedTask && (
              <Box sx={{ pt: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Task: {selectedTask.description} (Room {selectedTask.roomNumber})
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notes (Optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about the task status update..."
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
            <Button onClick={handleStatusUpdate} variant="contained">
              Update Status
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default HousekeepingStaffDashboard;
