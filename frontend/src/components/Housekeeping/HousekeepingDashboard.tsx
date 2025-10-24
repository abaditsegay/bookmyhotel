import React, { useState, useEffect, useCallback } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { housekeepingSupervisorApi } from '../../services/housekeepingSupervisorApi';
import { HousekeepingTask, HousekeepingStaff, HousekeepingTaskType, TaskPriority, CreateHousekeepingTaskRequest, HousekeepingTaskStatus } from '../../types/operations';
import { useAuth } from '../../contexts/AuthContext';

interface HousekeepingDashboardProps {
  userRole?: string;
  userId?: string;
}

const HousekeepingDashboard: React.FC<HousekeepingDashboardProps> = ({ userRole, userId }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<HousekeepingTask | null>(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [isViewOnlyMode, setIsViewOnlyMode] = useState(false);
  
  // Assignment-related state
  const [assignDialog, setAssignDialog] = useState(false);
  const [assignTaskId, setAssignTaskId] = useState<number | null>(null);
  const [availableStaff, setAvailableStaff] = useState<HousekeepingStaff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  
  // Add Task state
  const [addTaskDialog, setAddTaskDialog] = useState(false);
  
  // Add Staff state
  const [addStaffDialog, setAddStaffDialog] = useState(false);
  const [newStaff, setNewStaff] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    employeeId: '',
    shiftType: 'DAY'
  });
  const [newTask, setNewTask] = useState<CreateHousekeepingTaskRequest>({
    title: '',
    description: '',
    taskType: HousekeepingTaskType.ROOM_CLEANING,
    priority: TaskPriority.NORMAL,
    roomNumber: '',
    floorNumber: undefined,
    estimatedDuration: 60, // Default 1 hour
    dueDate: '',
    assignedUserId: undefined,
    notes: ''
  });

  // Filter state
  const [filterAssignedTo, setFilterAssignedTo] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filteredTasks, setFilteredTasks] = useState<HousekeepingTask[]>([]);

  // Determine user capabilities based on role
  const currentRole = userRole || user?.role;
  const currentUserId = userId || user?.id;
  
  const isManagementRole = () => {
    const managementRoles = ['HOTEL_ADMIN', 'FRONTDESK', 'OPERATIONS_SUPERVISOR'];
    return managementRoles.includes(currentRole || '');
  };
  
  const isHousekeepingStaff = useCallback(() => {
    return currentRole === 'HOUSEKEEPING';
  }, [currentRole]);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await housekeepingSupervisorApi.getTasks();
      
      if (response.content) {
        let filteredTasks = response.content;

        // Role-based filtering
        if (userRole === 'HOUSEKEEPING' && userId) {
          filteredTasks = response.content.filter((task: any) => 
            task.assignedTo && task.assignedTo.toString() === userId.toString()
          );
        }

        setTasks(filteredTasks);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('🔄 loadTasks: Error loading tasks:', error);
      setError('Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [userRole, userId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Filter tasks when tasks or filter criteria change
  useEffect(() => {
    let filtered = [...tasks];

    // Filter by assigned to
    if (filterAssignedTo !== 'all') {
      if (filterAssignedTo === 'unassigned') {
        filtered = filtered.filter(task => !task.assignedUser);
      } else {
        filtered = filtered.filter(task => 
          task.assignedUser && task.assignedUser.id.toString() === filterAssignedTo
        );
      }
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    setFilteredTasks(filtered);
  }, [tasks, filterAssignedTo, filterStatus]);

  const handleUpdateStatus = async (status: string) => {
    if (!selectedTask) return;

    try {
      await housekeepingSupervisorApi.updateTaskStatus(selectedTask.id, status, notes);
      setStatusDialog(false);
      setSelectedTask(null);
      setNotes('');
      loadTasks();
    } catch (err) {
      setError('Failed to update task status');
      console.error('Update status error:', err);
    }
  };

  const loadStaff = useCallback(async () => {
    try {
      const staff = await housekeepingSupervisorApi.getStaff();
      setAvailableStaff(staff);
    } catch (err) {
      console.error('❌ Failed to load staff:', err);
      setError('Failed to load staff members');
    }
  }, []);

  const handleAssignTask = async () => {
    if (!assignTaskId || !selectedStaffId) return;

    try {
      await housekeepingSupervisorApi.assignTask(assignTaskId, parseInt(selectedStaffId));
      setAssignDialog(false);
      setAssignTaskId(null);
      setSelectedStaffId('');
      loadTasks();
    } catch (err) {
      setError('Failed to assign task');
      console.error('Assign task error:', err);
    }
  };

  const handleCreateStaff = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!newStaff.email.trim()) {
        setError('Email is required');
        return;
      }
      if (!newStaff.firstName.trim()) {
        setError('First name is required');
        return;
      }
      if (!newStaff.lastName.trim()) {
        setError('Last name is required');
        return;
      }
      if (!newStaff.employeeId.trim()) {
        setError('Employee ID is required');
        return;
      }

      await housekeepingSupervisorApi.createStaff(newStaff);
      
      // Reset form and close dialog
      setNewStaff({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        employeeId: '',
        shiftType: 'DAY'
      });
      setAddStaffDialog(false);
      setError(null);
      
      // Reload staff list if assignment dialog is open
      if (assignDialog) {
        loadStaff();
      }
      
    } catch (err) {
      console.error('❌ Error creating staff member:', err);
      setError('Failed to create staff member');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffFieldChange = (field: string, value: any) => {
    setNewStaff(prev => ({
      ...prev,
      [field]: value
    }));
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

  const getActionIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'assigned':
        return <PlayArrowIcon />;
      case 'in_progress':
        return <CheckCircleIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getActionColor = (status: string): "inherit" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status.toLowerCase()) {
      case 'in_progress':
        return 'success';
      case 'pending':
      case 'assigned':
        return 'primary';
      default:
        return 'inherit';
    }
  };

  const getTaskStats = () => {
    // Ensure tasks is always an array to prevent undefined errors
    const taskArray = Array.isArray(tasks) ? tasks : [];
    const total = taskArray.length;
    const completed = taskArray.filter(t => t?.status?.toLowerCase() === 'completed').length;
    const inProgress = taskArray.filter(t => t?.status?.toLowerCase() === 'in_progress').length;
    const pending = taskArray.filter(t => t?.status?.toLowerCase() === 'pending').length;
    
    return { total, completed, inProgress, pending };
  };

  const handleCreateTask = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!newTask.title.trim()) {
        setError('Task title is required');
        return;
      }
      if (!newTask.description.trim()) {
        setError('Task description is required');
        return;
      }
      if (!newTask.dueDate) {
        setError('Due date is required');
        return;
      }
      if (!newTask.roomNumber || !newTask.roomNumber.trim()) {
        setError('Room number is required');
        return;
      }

      await housekeepingSupervisorApi.createTask(newTask);
      
      // Reset form and close dialog
      setNewTask({
        title: '',
        description: '',
        taskType: HousekeepingTaskType.ROOM_CLEANING,
        priority: TaskPriority.NORMAL,
        roomNumber: '',
        floorNumber: undefined,
        estimatedDuration: 60,
        dueDate: '',
        assignedUserId: undefined,
        notes: ''
      });
      setAddTaskDialog(false);
      setError(null);
      
      // Reload tasks to show the new one
      loadTasks();
      
    } catch (err) {
      console.error('❌ Error creating task:', err);
      setError('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskFieldChange = (field: keyof CreateHousekeepingTaskRequest, value: any) => {
    setNewTask(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const stats = getTaskStats();

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        {isHousekeepingStaff() ? 'My Tasks' : 'Tasks Overview'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Tasks
              </Typography>
              <Typography variant="h4">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.completed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                In Progress
              </Typography>
              <Typography variant="h4" color="info.main">
                {stats.inProgress}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tasks Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              {isHousekeepingStaff() ? 'My Tasks' : 'All Tasks'} ({filteredTasks.length} of {tasks.length} tasks)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {isManagementRole() && (
                <>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => setAddTaskDialog(true)}
                    disabled={loading}
                  >
                    Add Task
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="secondary"
                    onClick={() => setAddStaffDialog(true)}
                    disabled={loading}
                  >
                    Manage Staff
                  </Button>
                </>
              )}
              <Button variant="outlined" onClick={loadTasks}>
                Refresh
              </Button>
            </Box>
          </Box>

          {/* Filter Controls - Only show for management roles */}
          {isManagementRole() && (
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterListIcon fontSize="small" />
                Filters:
              </Typography>
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Assigned To</InputLabel>
                <Select
                  value={filterAssignedTo}
                  label="Assigned To"
                  onChange={(e) => setFilterAssignedTo(e.target.value)}
                >
                  <MenuItem value="all">All Tasks</MenuItem>
                  <MenuItem value="unassigned">Unassigned</MenuItem>
                  {availableStaff.map((staff) => (
                    <MenuItem key={staff.id} value={staff.id.toString()}>
                      {staff.user ? 
                        `${staff.user.firstName} ${staff.user.lastName}` :
                        `Staff ID: ${staff.employeeId}`
                      }
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value={HousekeepingTaskStatus.PENDING}>Pending</MenuItem>
                  <MenuItem value={HousekeepingTaskStatus.ASSIGNED}>Assigned</MenuItem>
                  <MenuItem value={HousekeepingTaskStatus.IN_PROGRESS}>In Progress</MenuItem>
                  <MenuItem value={HousekeepingTaskStatus.COMPLETED}>Completed</MenuItem>
                  <MenuItem value={HousekeepingTaskStatus.ON_HOLD}>On Hold</MenuItem>
                  <MenuItem value={HousekeepingTaskStatus.CANCELLED}>Cancelled</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                size="small"
                startIcon={<ClearIcon />}
                onClick={() => {
                  setFilterAssignedTo('all');
                  setFilterStatus('all');
                }}
              >
                Clear Filters
              </Button>
            </Box>
          )}

          {/* Show filtering info */}
          {isHousekeepingStaff() && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Showing only tasks assigned to you (User ID: {currentUserId})
            </Alert>
          )}
          
          {filteredTasks.length === 0 ? (
            <Alert severity="info">
              {isHousekeepingStaff() 
                ? "No tasks assigned to you at the moment."
                : tasks.length === 0 
                  ? "No tasks available."
                  : "No tasks match the current filters."}
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Room</TableCell>
                    {isManagementRole() && <TableCell>Assigned To</TableCell>}
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {task.title}
                        </Typography>
                        {task.description && (
                          <Typography variant="caption" color="text.secondary">
                            {task.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{task.taskType}</TableCell>
                      <TableCell>{task.roomNumber || 'N/A'}</TableCell>
                      {isManagementRole() && (
                        <TableCell>
                          {task.assignedUser?.firstName && task.assignedUser?.lastName 
                            ? `${task.assignedUser.firstName} ${task.assignedUser.lastName}`
                            : 'Unassigned'}
                        </TableCell>
                      )}
                      <TableCell>
                        <Chip 
                          label={task.priority} 
                          color={getStatusColor(task.priority)} 
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
                          {/* Status Update Action */}
                          <Tooltip title="Update Status">
                            <span>
                              <IconButton 
                                size="small" 
                                onClick={() => {
                                  setSelectedTask(task);
                                  setIsViewOnlyMode(false);
                                  setStatusDialog(true);
                                }}
                                disabled={task.status.toLowerCase() === 'completed'}
                                color={getActionColor(task.status)}
                              >
                                {getActionIcon(task.status)}
                              </IconButton>
                            </span>
                          </Tooltip>

                          {/* Assignment Action - Only for management roles */}
                          {isManagementRole() && (
                            <Tooltip title="Assign Task">
                              <span>
                                <IconButton 
                                  size="small" 
                                  onClick={() => {
                                    setAssignTaskId(task.id);
                                    setSelectedStaffId(task.assignedUser?.id?.toString() || '');
                                    setAssignDialog(true);
                                    loadStaff();
                                  }}
                                  disabled={task.status.toLowerCase() === 'completed'}
                                >
                                  <AssignmentIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}

                          {/* View Details Action */}
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              onClick={() => {
                                setSelectedTask(task);
                                setIsViewOnlyMode(true);
                                setStatusDialog(true);
                              }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
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
      <Dialog open={statusDialog} onClose={() => {
        setStatusDialog(false);
        setIsViewOnlyMode(false);
      }} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isViewOnlyMode 
            ? 'Task Details'
            : isHousekeepingStaff() 
              ? 'Update Task Status' 
              : 'Task Details & Status'
          }
        </DialogTitle>
        <DialogContent>
          {selectedTask && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedTask.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Room: {selectedTask.roomNumber || 'N/A'} | Type: {selectedTask.taskType}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current Status: {selectedTask.status}
              </Typography>
              {selectedTask.description && (
                <Typography variant="body2" gutterBottom>
                  Description: {selectedTask.description}
                </Typography>
              )}
              
              {/* Assignment Info */}
              {selectedTask.assignedUser && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Assigned To: {selectedTask.assignedUser.firstName && selectedTask.assignedUser.lastName ? 
                    `${selectedTask.assignedUser.firstName} ${selectedTask.assignedUser.lastName}` :
                    `User ID: ${selectedTask.assignedUser.id}`
                  }
                </Typography>
              )}
              
              {/* Dates */}
              {selectedTask.dueDate && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Due Date: {new Date(selectedTask.dueDate).toLocaleString()}
                </Typography>
              )}
              
              {/* Status update section for eligible users and tasks */}
              {!isViewOnlyMode && (isHousekeepingStaff() || isManagementRole()) && 
               !['completed', 'cancelled'].includes(selectedTask.status.toLowerCase()) && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {isHousekeepingStaff() ? 'Update your task progress:' : 'Update task status:'}
                  </Typography>
                  
                  {/* Status Selection for Management */}
                  {isManagementRole() && (
                    <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
                      <InputLabel>Change Status To</InputLabel>
                      <Select
                        value=""
                        label="Change Status To"
                        onChange={(e) => {
                          if (e.target.value) {
                            handleUpdateStatus(e.target.value);
                          }
                        }}
                      >
                        {selectedTask.status.toLowerCase() !== 'pending' && (
                          <MenuItem value="PENDING">Mark as Pending</MenuItem>
                        )}
                        {selectedTask.status.toLowerCase() !== 'assigned' && selectedTask.assignedUser && (
                          <MenuItem value="ASSIGNED">Mark as Assigned</MenuItem>
                        )}
                        {selectedTask.status.toLowerCase() !== 'in_progress' && (
                          <MenuItem value="IN_PROGRESS">Mark as In Progress</MenuItem>
                        )}
                        {selectedTask.status.toLowerCase() !== 'completed' && (
                          <MenuItem value="COMPLETED">Mark as Completed</MenuItem>
                        )}
                        {selectedTask.status.toLowerCase() !== 'cancelled' && (
                          <MenuItem value="CANCELLED">Cancel Task</MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  )}
                </Box>
              )}
              
              {!isViewOnlyMode && (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  sx={{ mt: 2 }}
                  placeholder={isHousekeepingStaff() 
                    ? "Add any notes about your progress or issues encountered..."
                    : "Add notes about this task..."
                  }
                />
              )}
              
              {/* Show existing notes in view-only mode */}
              {isViewOnlyMode && selectedTask.notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Notes:
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    p: 1, 
                    backgroundColor: 'grey.50', 
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'grey.300'
                  }}>
                    {selectedTask.notes}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setStatusDialog(false);
            setIsViewOnlyMode(false);
          }}>
            {isViewOnlyMode ? 'Close' : isHousekeepingStaff() ? 'Cancel' : 'Close'}
          </Button>
          
          {/* Quick Action buttons for Housekeeping Staff */}
          {!isViewOnlyMode && selectedTask && isHousekeepingStaff() && !['completed', 'cancelled'].includes(selectedTask.status.toLowerCase()) && (
            <>
              {(['pending', 'assigned'].includes(selectedTask.status.toLowerCase())) && (
                <Button 
                  onClick={() => handleUpdateStatus('IN_PROGRESS')} 
                  variant="contained"
                  color="primary"
                >
                  Start Task
                </Button>
              )}
              {(selectedTask.status.toLowerCase() === 'in_progress') && (
                <Button 
                  onClick={() => handleUpdateStatus('COMPLETED')} 
                  variant="contained" 
                  color="success"
                >
                  Complete Task
                </Button>
              )}
            </>
          )}
          
          {/* Management Actions */}
          {!isViewOnlyMode && selectedTask && isManagementRole() && (
            <>
              {!selectedTask.assignedUser && selectedTask.status.toLowerCase() !== 'completed' && (
                <Button 
                  variant="outlined"
                  onClick={() => {
                    setAssignTaskId(selectedTask.id);
                    setSelectedStaffId(selectedTask.assignedUser?.id?.toString() || '');
                    setStatusDialog(false);
                    setAssignDialog(true);
                    loadStaff();
                  }}
                >
                  Update Status
                </Button>
              )}
              {selectedTask.status.toLowerCase() === 'in_progress' && (
                <Button 
                  onClick={() => handleUpdateStatus('COMPLETED')} 
                  variant="contained" 
                  color="success"
                >
                  Mark Complete
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={addTaskDialog} onClose={() => setAddTaskDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Housekeeping Task</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Task Title"
              value={newTask.title}
              onChange={(e) => handleTaskFieldChange('title', e.target.value)}
              fullWidth
              required
            />
            
            <TextField
              label="Description"
              value={newTask.description}
              onChange={(e) => handleTaskFieldChange('description', e.target.value)}
              fullWidth
              multiline
              rows={3}
              required
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Task Type</InputLabel>
                <Select
                  value={newTask.taskType}
                  label="Task Type"
                  onChange={(e) => handleTaskFieldChange('taskType', e.target.value)}
                >
                  <MenuItem value={HousekeepingTaskType.ROOM_CLEANING}>Room Cleaning</MenuItem>
                  <MenuItem value={HousekeepingTaskType.DEEP_CLEANING}>Deep Cleaning</MenuItem>
                  <MenuItem value={HousekeepingTaskType.LAUNDRY}>Laundry</MenuItem>
                  <MenuItem value={HousekeepingTaskType.PUBLIC_AREA_CLEANING}>Public Area Cleaning</MenuItem>
                  <MenuItem value={HousekeepingTaskType.INVENTORY_CHECK}>Inventory Check</MenuItem>
                  <MenuItem value={HousekeepingTaskType.MAINTENANCE_REQUEST}>Maintenance Request</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newTask.priority}
                  label="Priority"
                  onChange={(e) => handleTaskFieldChange('priority', e.target.value)}
                >
                  <MenuItem value={TaskPriority.LOW}>Low</MenuItem>
                  <MenuItem value={TaskPriority.NORMAL}>Normal</MenuItem>
                  <MenuItem value={TaskPriority.HIGH}>High</MenuItem>
                  <MenuItem value={TaskPriority.URGENT}>Urgent</MenuItem>
                  <MenuItem value={TaskPriority.CRITICAL}>Critical</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Room Number"
                value={newTask.roomNumber}
                onChange={(e) => handleTaskFieldChange('roomNumber', e.target.value)}
                fullWidth
                required
              />
              
              <TextField
                label="Floor Number"
                type="number"
                value={newTask.floorNumber || ''}
                onChange={(e) => handleTaskFieldChange('floorNumber', e.target.value ? parseInt(e.target.value) : undefined)}
                fullWidth
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Estimated Duration (minutes)"
                type="number"
                value={newTask.estimatedDuration}
                onChange={(e) => handleTaskFieldChange('estimatedDuration', parseInt(e.target.value) || 60)}
                fullWidth
                inputProps={{ min: 15, step: 15 }}
              />
              
              <TextField
                label="Due Date"
                type="datetime-local"
                value={newTask.dueDate}
                onChange={(e) => handleTaskFieldChange('dueDate', e.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            
            <TextField
              label="Additional Notes"
              value={newTask.notes}
              onChange={(e) => handleTaskFieldChange('notes', e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddTaskDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateTask}
            variant="contained"
            disabled={loading || !newTask.title.trim() || !newTask.description.trim() || !newTask.dueDate || !newTask.roomNumber?.trim()}
          >
            Create Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={assignDialog} onClose={() => setAssignDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Task to Staff Member</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Select Staff Member</InputLabel>
              <Select
                value={selectedStaffId}
                label="Select Staff Member"
                onChange={(e) => setSelectedStaffId(e.target.value)}
              >
                <MenuItem value="">
                  <em>Unassigned</em>
                </MenuItem>
                {availableStaff.length === 0 ? (
                  <>
                    <MenuItem disabled>
                      <em>No staff members available</em>
                    </MenuItem>
                    <MenuItem onClick={() => {
                      setAssignDialog(false);
                      setAddStaffDialog(true);
                    }}>
                      <Box sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                        + Create New Staff Member
                      </Box>
                    </MenuItem>
                  </>
                ) : (
                  availableStaff.map((staff) => (
                    <MenuItem key={staff.id} value={staff.id.toString()}>
                      {staff.user ? 
                        `${staff.user.firstName} ${staff.user.lastName} (${staff.employeeId})` :
                        `Staff ID: ${staff.employeeId}`
                      }
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssignTask}
            variant="contained"
            disabled={!selectedStaffId}
          >
            Assign Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Staff Dialog */}
      <Dialog open={addStaffDialog} onClose={() => setAddStaffDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Housekeeping Staff Member</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Email"
              type="email"
              value={newStaff.email}
              onChange={(e) => handleStaffFieldChange('email', e.target.value)}
              fullWidth
              required
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="First Name"
                value={newStaff.firstName}
                onChange={(e) => handleStaffFieldChange('firstName', e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Last Name"
                value={newStaff.lastName}
                onChange={(e) => handleStaffFieldChange('lastName', e.target.value)}
                fullWidth
                required
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Employee ID"
                value={newStaff.employeeId}
                onChange={(e) => handleStaffFieldChange('employeeId', e.target.value)}
                fullWidth
                required
              />
              <FormControl fullWidth>
                <InputLabel>Shift Type</InputLabel>
                <Select
                  value={newStaff.shiftType}
                  label="Shift Type"
                  onChange={(e) => handleStaffFieldChange('shiftType', e.target.value)}
                >
                  <MenuItem value="DAY">Day Shift</MenuItem>
                  <MenuItem value="NIGHT">Night Shift</MenuItem>
                  <MenuItem value="ROTATING">Rotating Shift</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <TextField
              label="Phone Number"
              value={newStaff.phone}
              onChange={(e) => handleStaffFieldChange('phone', e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddStaffDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateStaff}
            variant="contained"
            disabled={loading || !newStaff.email.trim() || !newStaff.firstName.trim() || !newStaff.lastName.trim() || !newStaff.employeeId.trim()}
          >
            Create Staff Member
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HousekeepingDashboard;