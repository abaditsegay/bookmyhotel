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
  InputLabel,
  useMediaQuery,
  useTheme,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Fab,
  SwipeableDrawer,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  Info as InfoIcon,
  CleaningServices as CleaningIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Room as RoomIcon,
  AccessTime as AccessTimeIcon,
  Flag as FlagIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { staffApi } from '../../services/staffApi';
import { HousekeepingTask } from '../../types/operations';

const HousekeepingStaffDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<HousekeepingTask | null>(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);

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

  const openTaskDetails = (task: HousekeepingTask) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  // Mobile-optimized task card component
  const TaskCard: React.FC<{ task: HousekeepingTask }> = ({ task }) => (
    <Card 
      sx={{ 
        mb: 2, 
        cursor: 'pointer',
        '&:hover': { elevation: 4, transform: 'translateY(-2px)' },
        transition: 'all 0.2s ease-in-out'
      }}
      onClick={() => openTaskDetails(task)}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RoomIcon color="primary" fontSize="small" />
            <Typography variant="h6" component="div">
              Room {task.roomNumber}
            </Typography>
          </Box>
          <Chip
            label={task.status}
            color={getStatusChipColor(task.status)}
            size="small"
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {task.title || task.description}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={task.taskType}
              color={getTaskTypeColor(task.taskType)}
              size="small"
            />
            <Chip
              label={task.priority}
              color={task.priority === 'HIGH' ? 'error' : task.priority === 'NORMAL' ? 'warning' : 'default'}
              size="small"
              icon={<FlagIcon />}
            />
          </Box>
          {task.dueDate && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {new Date(task.dueDate).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          {canStartTask(task) && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<PlayArrowIcon />}
              onClick={(e) => {
                e.stopPropagation();
                handleStartTask(task);
              }}
              sx={{ minWidth: 'auto' }}
            >
              Start
            </Button>
          )}
          {canCompleteTask(task) && (
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<CheckCircleIcon />}
              onClick={(e) => {
                e.stopPropagation();
                handleCompleteTask(task);
              }}
              sx={{ minWidth: 'auto' }}
            >
              Complete
            </Button>
          )}
          {canUpdateStatus(task) && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<InfoIcon />}
              onClick={(e) => {
                e.stopPropagation();
                openStatusDialog(task);
              }}
              sx={{ minWidth: 'auto' }}
            >
              Update
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'ASSIGNED': return 'default';
      case 'IN_PROGRESS': return 'warning';
      case 'COMPLETED': return 'primary';
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
    <Box sx={{ 
      width: '100%', 
      p: { xs: 1, sm: 2, md: 3 },
      pb: { xs: 8, sm: 3 } // Extra bottom padding on mobile for FAB
    }}>
      <Box sx={{ py: { xs: 1, md: 3 } }}>
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          component="h1" 
          gutterBottom 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            mb: { xs: 2, md: 3 }
          }}
        >
          <CleaningIcon color="primary" />
          My Housekeeping Tasks
        </Typography>

        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mb: { xs: 2, md: 4 } }}>
            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: { xs: 1, sm: 2 },
                  p: { xs: 1, sm: 2 },
                  '&:last-child': { pb: { xs: 1, sm: 2 } }
                }}>
                  <AssignmentIcon color="primary" fontSize={isMobile ? "medium" : "large"} />
                  <Box>
                    <Typography 
                      color="textSecondary" 
                      gutterBottom
                      variant={isMobile ? "caption" : "body2"}
                    >
                      Total Tasks
                    </Typography>
                    <Typography variant={isMobile ? "h6" : "h4"}>
                      {stats.totalTasks || 0}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: { xs: 1, sm: 2 },
                  p: { xs: 1, sm: 2 },
                  '&:last-child': { pb: { xs: 1, sm: 2 } }
                }}>
                  <ScheduleIcon color="warning" fontSize={isMobile ? "medium" : "large"} />
                  <Box>
                    <Typography 
                      color="textSecondary" 
                      gutterBottom
                      variant={isMobile ? "caption" : "body2"}
                    >
                      Pending
                    </Typography>
                    <Typography variant={isMobile ? "h6" : "h4"}>
                      {stats.pendingTasks || 0}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: { xs: 1, sm: 2 },
                  p: { xs: 1, sm: 2 },
                  '&:last-child': { pb: { xs: 1, sm: 2 } }
                }}>
                  <PlayArrowIcon color="info" fontSize={isMobile ? "medium" : "large"} />
                  <Box>
                    <Typography 
                      color="textSecondary" 
                      gutterBottom
                      variant={isMobile ? "caption" : "body2"}
                    >
                      In Progress
                    </Typography>
                    <Typography variant={isMobile ? "h6" : "h4"}>
                      {stats.inProgressTasks || 0}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: { xs: 1, sm: 2 },
                  p: { xs: 1, sm: 2 },
                  '&:last-child': { pb: { xs: 1, sm: 2 } }
                }}>
                  <CheckCircleIcon color="primary" fontSize={isMobile ? "medium" : "large"} />
                  <Box>
                    <Typography 
                      color="textSecondary" 
                      gutterBottom
                      variant={isMobile ? "caption" : "body2"}
                    >
                      Completed
                    </Typography>
                    <Typography variant={isMobile ? "h6" : "h4"}>
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

        {/* Tasks Section */}
        <Card>
          <CardContent sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1, sm: 0 }
            }}>
              <Typography variant="h6">
                My Tasks ({tasks.length})
              </Typography>
              <Button 
                onClick={loadMyTasks} 
                disabled={loading}
                size={isMobile ? "medium" : "large"}
                startIcon={<RefreshIcon />}
              >
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
              <>
                {/* Mobile Layout - Cards */}
                {isMobile ? (
                  <Box>
                    {tasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </Box>
                ) : (
                  /* Desktop Layout - Table */
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
                                {task.title || task.description}
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
                                color={getStatusChipColor(task.status)}
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
                                    color="primary"
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
              </>
            )}
          </CardContent>
        </Card>

        {/* Floating Refresh Button for Mobile */}
        {isMobile && (
          <Fab
            color="primary"
            aria-label="refresh"
            sx={{ 
              position: 'fixed', 
              bottom: 16, 
              right: 16,
              zIndex: 1000
            }}
            onClick={loadMyTasks}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : <RefreshIcon />}
          </Fab>
        )}

        {/* Status Update Dialog */}
        <Dialog 
          open={statusDialog} 
          onClose={() => setStatusDialog(false)} 
          maxWidth="sm" 
          fullWidth
          fullScreen={isSmallScreen}
        >
          <DialogTitle>
            {isSmallScreen ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                Update Task Status
                <IconButton onClick={() => setStatusDialog(false)}>
                  <InfoIcon />
                </IconButton>
              </Box>
            ) : (
              'Update Task Status'
            )}
          </DialogTitle>
          <DialogContent>
            {selectedTask && (
              <Box sx={{ pt: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Task: {selectedTask.title || selectedTask.description} (Room {selectedTask.roomNumber})
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
          <DialogActions sx={{ p: { xs: 2, sm: 1 } }}>
            <Button onClick={() => setStatusDialog(false)} size={isMobile ? "large" : "medium"}>
              Cancel
            </Button>
            <Button 
              onClick={handleStatusUpdate} 
              variant="contained"
              size={isMobile ? "large" : "medium"}
            >
              Update Status
            </Button>
          </DialogActions>
        </Dialog>

        {/* Task Details Dialog */}
        <Dialog
          open={showTaskDetails}
          onClose={() => setShowTaskDetails(false)}
          maxWidth="sm"
          fullWidth
          fullScreen={isSmallScreen}
        >
          <DialogTitle>
            {isSmallScreen ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                Task Details
                <IconButton onClick={() => setShowTaskDetails(false)}>
                  <InfoIcon />
                </IconButton>
              </Box>
            ) : (
              'Task Details'
            )}
          </DialogTitle>
          <DialogContent>
            {selectedTask && (
              <Box sx={{ pt: 1 }}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <RoomIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Room" 
                      secondary={selectedTask.roomNumber} 
                    />
                  </ListItem>
                  <Divider />
                  
                  <ListItem>
                    <ListItemIcon>
                      <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Task Type" 
                      secondary={selectedTask.taskType} 
                    />
                  </ListItem>
                  <Divider />
                  
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Description" 
                      secondary={selectedTask.title || selectedTask.description} 
                    />
                  </ListItem>
                  <Divider />
                  
                  <ListItem>
                    <ListItemIcon>
                      <FlagIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Priority" 
                      secondary={
                        <Chip
                          label={selectedTask.priority}
                          color={selectedTask.priority === 'HIGH' ? 'error' : selectedTask.priority === 'NORMAL' ? 'warning' : 'default'}
                          size="small"
                        />
                      } 
                    />
                  </ListItem>
                  <Divider />
                  
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Status" 
                      secondary={
                        <Chip
                          label={selectedTask.status}
                          color={getStatusChipColor(selectedTask.status)}
                          size="small"
                        />
                      } 
                    />
                  </ListItem>
                  
                  {selectedTask.dueDate && (
                    <>
                      <Divider />
                      <ListItem>
                        <ListItemIcon>
                          <AccessTimeIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Due Date" 
                          secondary={new Date(selectedTask.dueDate).toLocaleDateString()} 
                        />
                      </ListItem>
                    </>
                  )}
                </List>

                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {canStartTask(selectedTask) && (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<PlayArrowIcon />}
                      onClick={() => {
                        setShowTaskDetails(false);
                        handleStartTask(selectedTask);
                      }}
                      fullWidth={isSmallScreen}
                    >
                      Start Task
                    </Button>
                  )}
                  {canCompleteTask(selectedTask) && (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => {
                        setShowTaskDetails(false);
                        handleCompleteTask(selectedTask);
                      }}
                      fullWidth={isSmallScreen}
                    >
                      Complete Task
                    </Button>
                  )}
                  {canUpdateStatus(selectedTask) && (
                    <Button
                      variant="outlined"
                      startIcon={<InfoIcon />}
                      onClick={() => {
                        setShowTaskDetails(false);
                        openStatusDialog(selectedTask);
                      }}
                      fullWidth={isSmallScreen}
                    >
                      Update Status
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: { xs: 2, sm: 1 } }}>
            <Button 
              onClick={() => setShowTaskDetails(false)}
              size={isMobile ? "large" : "medium"}
              fullWidth={isSmallScreen}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default HousekeepingStaffDashboard;
