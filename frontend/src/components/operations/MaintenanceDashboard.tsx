import React, { useState, useEffect } from 'react';
import TokenManager from '../../utils/tokenManager';
import {
  Box,
  Typography,
  Button,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  TablePagination,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  PersonAdd as AssignIcon,
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon
} from '@mui/icons-material';
import { getCurrentHotel } from '../../data/operationsMockData';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

interface MaintenanceTask {
  id: number;
  taskType: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  location?: string;
  equipmentType?: string;
  estimatedCost?: number;
  actualCost?: number;
  assignedStaff?: {
    id: number;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  createdAt: string;
  room?: {
    roomNumber: string;
    floor: number;
  };
  workPerformed?: string;
  partsUsed?: string;
}

interface MaintenanceStaff {
  id: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  employeeId: string;
  isActive: boolean;
}

interface CreateTaskFormData {
  roomId: string;
  taskType: string;
  title: string;
  description: string;
  priority: string;
  location: string;
  equipmentType: string;
  estimatedCost: string;
}

const MAINTENANCE_TASK_TYPES = [
  'PLUMBING',
  'ELECTRICAL',
  'HVAC',
  'CARPENTRY',
  'PAINTING',
  'APPLIANCE_REPAIR',
  'EMERGENCY_REPAIR',
  'PREVENTIVE_MAINTENANCE'
];

const PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL'];

const MaintenanceDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [staff, setStaff] = useState<MaintenanceStaff[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [assignTaskOpen, setAssignTaskOpen] = useState(false);
  const [completeTaskOpen, setCompleteTaskOpen] = useState(false);
  
  // Form states
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [createTaskForm, setCreateTaskForm] = useState<CreateTaskFormData>({
    roomId: '',
    taskType: '',
    title: '',
    description: '',
    priority: 'NORMAL',
    location: '',
    equipmentType: '',
    estimatedCost: ''
  });
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [workPerformed, setWorkPerformed] = useState('');
  const [partsUsed, setPartsUsed] = useState('');
  const [actualCost, setActualCost] = useState('');

  // Table pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Task detail dialog states
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editTaskData, setEditTaskData] = useState<any>({});
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);

  // Get current user role (from auth context)
  const currentUser = TokenManager.getUser();
  const currentUserRole = currentUser?.role || 'GUEST';
  const isMaintenanceWorker = currentUserRole === 'MAINTENANCE' || currentUserRole === 'MAINTENANCE_WORKER';

  useEffect(() => {
    loadTasks();
    loadStaff();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      
      // Get current hotel ID for filtering
      const hotel = getCurrentHotel();
      const hotelId = hotel?.id || 12; // Default to Addis Sunshine (ID: 12)
      
      // Choose endpoint based on user role
      let endpoint = `${API_BASE_URL}/api/maintenance/tasks`;
      if (isMaintenanceWorker) {
        // Maintenance workers only see their assigned tasks
        endpoint = `${API_BASE_URL}/api/maintenance/my-tasks`;
      }
      
      // Load maintenance tasks from API
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          ...TokenManager.getAuthHeaders(),
        }
      });

      if (response.ok) {
        const backendTasks = await response.json();
        
        // Filter by hotel and transform the data
        const hotelTasks = backendTasks.filter((task: any) => 
          task.room?.hotel?.id === hotelId || !task.room?.hotel?.id
        );
        
        const transformedTasks = hotelTasks.map((task: any) => ({
          id: task.id,
          taskType: task.category || task.taskType,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority, // Use backend priority values directly
          location: task.location || (task.room ? `Room ${task.room.roomNumber}` : 'Unknown'),
          equipmentType: task.equipmentType,
          estimatedCost: task.estimatedCost,
          actualCost: task.actualCost,
          room: task.room ? {
            roomNumber: task.room.roomNumber,
            floor: task.room.floor || Math.floor(parseInt(task.room.roomNumber) / 100)
          } : undefined,
          assignedStaff: task.assignedTo ? {
            id: task.assignedTo.id,
            user: {
              id: task.assignedTo.user?.id || task.assignedTo.id,
              firstName: task.assignedTo.user?.firstName || task.assignedTo.firstName,
              lastName: task.assignedTo.user?.lastName || task.assignedTo.lastName
            }
          } : undefined,
          workPerformed: task.workNotes,
          partsUsed: task.partsNeeded,
          createdAt: task.createdAt
        }));
        
        setTasks(transformedTasks);
        setError(null);
      } else {
        throw new Error(`API error: ${response.status}`);
      }
    } catch (err) {
      console.error('Failed to load maintenance tasks:', err);
      setError('Unable to load maintenance tasks - please check your connection');
      setTasks([]); // Set empty array instead of mock data
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      // Get current hotel ID for filtering
      const hotel = getCurrentHotel();
      const hotelId = hotel?.id || 12; // Default to Addis Sunshine (ID: 12)
      
      // Load housekeeping staff that can do maintenance work
      const response = await fetch(`${API_BASE_URL}/api/housekeeping/staff/hotel/${hotelId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...TokenManager.getAuthHeaders(),
        }
      });

      if (response.ok) {
        const backendStaff = await response.json();
        
        // Filter for maintenance workers and transform the data
        const maintenanceStaff = backendStaff
          .filter((member: any) => 
            member.role === 'MAINTENANCE_WORKER' || 
            member.firstName?.toLowerCase().includes('maintenance') ||
            member.lastName?.toLowerCase().includes('maintenance') ||
            member.email?.toLowerCase().includes('maintenance')
          )
          .map((member: any) => ({
            id: member.id,
            user: {
              id: member.user?.id || member.id,
              firstName: member.user?.firstName || member.firstName,
              lastName: member.user?.lastName || member.lastName
            },
            employeeId: member.employeeId,
            isActive: member.isActive !== undefined ? member.isActive : true
          }));
        
        setStaff(maintenanceStaff);
      } else {
        console.error('Failed to load staff data:', response.status);
        setStaff([]); // Set empty array instead of mock data
      }
    } catch (err) {
      console.error('Failed to load maintenance staff:', err);
      setStaff([]); // Set empty array instead of mock data
    }
  };

  const handleCreateTask = async () => {
    try {
      // Get current hotel and user data
      const hotel = getCurrentHotel();
      const hotelId = hotel?.id;
      const currentUser = TokenManager.getUser();
      
      console.log('Creating maintenance task with data:', {
        hotelId,
        currentUser,
        createTaskForm
      });
      
      // Validate required data
      if (!hotelId) {
        setError('Hotel ID is required');
        return;
      }
      
      if (!currentUser?.id) {
        setError('User authentication required');
        return;
      }
      
      const requestBody = {
        ...createTaskForm,
        hotelId: hotelId,
        createdByUserId: parseInt(currentUser.id),
        estimatedCost: createTaskForm.estimatedCost ? parseFloat(createTaskForm.estimatedCost) : null,
        roomId: createTaskForm.roomId ? parseInt(createTaskForm.roomId) : null
      };
      
      console.log('Request body:', requestBody);
      
      const response = await fetch(`${API_BASE_URL}/api/maintenance/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...TokenManager.getAuthHeaders()
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setError(`Failed to create maintenance task: ${errorText}`);
        return;
      }
      
      if (response.ok) {
        setCreateTaskOpen(false);
        setCreateTaskForm({
          roomId: '',
          taskType: '',
          title: '',
          description: '',
          priority: 'NORMAL',
          location: '',
          equipmentType: '',
          estimatedCost: ''
        });
        await loadTasks();
      } else {
        setError('Failed to create maintenance task');
      }
    } catch (err) {
      setError('Failed to create maintenance task');
    }
  };

  const handleAssignTask = async () => {
    if (!selectedTaskId || !selectedStaffId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/maintenance/tasks/${selectedTaskId}/assign/${selectedStaffId}`, {
        method: 'PUT',
        headers: TokenManager.getAuthHeaders()
      });
      
      if (response.ok) {
        setAssignTaskOpen(false);
        setSelectedTaskId(null);
        setSelectedStaffId('');
        await loadTasks();
      } else {
        setError('Failed to assign maintenance task');
      }
    } catch (err) {
      setError('Failed to assign maintenance task');
    }
  };

  const handleStartTask = async (taskId: number) => {
    try {
      const response = await fetch(`/api/maintenance/tasks/${taskId}/start`, {
        method: 'PUT',
        headers: TokenManager.getAuthHeaders()
      });
      
      if (response.ok) {
        await loadTasks();
      } else {
        setError('Failed to start maintenance task');
      }
    } catch (err) {
      setError('Failed to start maintenance task');
    }
  };

  const handleCompleteTask = async () => {
    if (!selectedTaskId) return;
    
    try {
      const response = await fetch(`/api/maintenance/tasks/${selectedTaskId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...TokenManager.getAuthHeaders()
        },
        body: JSON.stringify({
          workPerformed,
          partsUsed,
          actualCost: actualCost ? parseFloat(actualCost) : 0
        })
      });
      
      if (response.ok) {
        setCompleteTaskOpen(false);
        setSelectedTaskId(null);
        setWorkPerformed('');
        setPartsUsed('');
        setActualCost('');
        await loadTasks();
      } else {
        setError('Failed to complete maintenance task');
      }
    } catch (err) {
      setError('Failed to complete maintenance task');
    }
  };

  const getFilteredTasks = () => {
    switch (activeTab) {
      case 0: return tasks; // All tasks
      case 1: return tasks.filter(task => task.status === 'PENDING' || task.status === 'pending');
      case 2: return tasks.filter(task => task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS' || task.status === 'assigned' || task.status === 'in_progress');
      case 3: return tasks.filter(task => task.status === 'COMPLETED' || task.status === 'completed');
      default: return tasks;
    }
  };

  const getTaskCounts = () => {
    return {
      pending: tasks.filter(task => task.status === 'PENDING' || task.status === 'pending').length,
      active: tasks.filter(task => task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS' || task.status === 'assigned' || task.status === 'in_progress').length,
      completed: tasks.filter(task => task.status === 'COMPLETED' || task.status === 'completed').length
    };
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'assigned':
        return 'info';
      case 'in_progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'normal':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const openAssignDialog = (taskId: number) => {
    setSelectedTaskId(taskId);
    setAssignTaskOpen(true);
  };

  const openCompleteDialog = (taskId: number) => {
    setSelectedTaskId(taskId);
    setCompleteTaskOpen(true);
  };

  const handleEditTask = () => {
    if (selectedTask) {
      setEditTaskData({
        title: selectedTask.title || '',
        description: selectedTask.description || '',
        priority: selectedTask.priority || 'NORMAL',
        location: selectedTask.location || '',
        equipmentType: selectedTask.equipmentType || '',
        estimatedCost: selectedTask.estimatedCost || 0
      });
      setIsEditingTask(true);
    }
  };

  const handleSaveTaskEdit = async () => {
    if (!selectedTask) return;
    
    try {
      // TODO: Call API to update task
      console.log('Saving task edit:', editTaskData);
      
      // For now, just update the local task
      const updatedTask = {
        ...selectedTask,
        title: editTaskData.title,
        description: editTaskData.description,
        priority: editTaskData.priority,
        location: editTaskData.location,
        equipmentType: editTaskData.equipmentType,
        estimatedCost: editTaskData.estimatedCost
      };
      
      setSelectedTask(updatedTask);
      setIsEditingTask(false);
      
      // TODO: Refresh tasks list when API is implemented
      // await loadTasks();
      
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingTask(false);
    setEditTaskData({});
  };

  const filteredTasks = getFilteredTasks();
  const paginatedTasks = filteredTasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const taskCounts = getTaskCounts();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Maintenance Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadTasks}
          >
            Refresh
          </Button>
          {currentUserRole === 'OPERATIONS_SUPERVISOR' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateTaskOpen(true)}
            >
              Create Task
            </Button>
          )}
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Task Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="All Tasks" />
          <Tab 
            label={
              <Badge badgeContent={taskCounts.pending} color="primary">
                Pending
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={taskCounts.active} color="warning">
                Active
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={taskCounts.completed} color="success">
                Completed
              </Badge>
            } 
          />
        </Tabs>
      </Box>

      {/* Tasks Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Task</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Assigned Staff</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Cost</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {task.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {task.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={task.taskType.replace(/_/g, ' ')}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={task.status.replace('_', ' ')}
                    size="small"
                    color={getStatusColor(task.status) as any}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={task.priority}
                    size="small"
                    color={getPriorityColor(task.priority) as any}
                  />
                </TableCell>
                <TableCell>
                  {task.assignedStaff ? (
                    <Typography variant="body2">
                      {task.assignedStaff.user.firstName} {task.assignedStaff.user.lastName}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Unassigned
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {task.location || 'N/A'}
                  </Typography>
                  {task.room && (
                    <Typography variant="caption" color="text.secondary">
                      Room {task.room.roomNumber}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    ${task.estimatedCost?.toFixed(2) || '0.00'}
                  </Typography>
                  {task.actualCost && (
                    <Typography variant="caption" color="text.secondary">
                      Actual: ${task.actualCost.toFixed(2)}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small"
                        onClick={() => {
                          setSelectedTask(task);
                          setTaskDetailOpen(true);
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    {(task.status === 'PENDING' || task.status === 'pending') && (
                      <Tooltip title="Assign Task">
                        <IconButton 
                          size="small"
                          color="primary"
                          onClick={() => openAssignDialog(task.id)}
                        >
                          <AssignIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    {/* Reassign button for assigned or in-progress tasks */}
                    {currentUserRole === 'OPERATIONS_SUPERVISOR' && 
                     (task.status === 'ASSIGNED' || task.status === 'assigned' || 
                      task.status === 'IN_PROGRESS' || task.status === 'in_progress') && (
                      <Tooltip title="Reassign Task">
                        <IconButton 
                          size="small"
                          color="secondary"
                          onClick={() => openAssignDialog(task.id)}
                        >
                          <AssignIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    {(task.status === 'ASSIGNED' || task.status === 'assigned') && (
                      <Tooltip title="Start Task">
                        <IconButton 
                          size="small"
                          color="success"
                          onClick={() => handleStartTask(task.id)}
                        >
                          <StartIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    {(task.status === 'IN_PROGRESS' || task.status === 'in_progress') && (
                      <Tooltip title="Complete Task">
                        <IconButton 
                          size="small"
                          color="success"
                          onClick={() => openCompleteDialog(task.id)}
                        >
                          <CompleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    {currentUserRole === 'OPERATIONS_SUPERVISOR' && (
                      <Tooltip title="Edit Task">
                        <IconButton 
                          size="small"
                          onClick={() => {
                            setSelectedTask(task);
                            // TODO: Implement edit functionality
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredTasks.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {filteredTasks.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No maintenance tasks found for the selected filter
          </Typography>
        </Box>
      )}

      {/* Create Task Dialog */}
      <Dialog open={createTaskOpen} onClose={() => setCreateTaskOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Maintenance Task</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Task Title"
              value={createTaskForm.title}
              onChange={(e) => setCreateTaskForm({ ...createTaskForm, title: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Task Type</InputLabel>
              <Select
                value={createTaskForm.taskType}
                onChange={(e) => setCreateTaskForm({ ...createTaskForm, taskType: e.target.value })}
              >
                {MAINTENANCE_TASK_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Room Number (Optional)"
                  value={createTaskForm.roomId}
                  onChange={(e) => setCreateTaskForm({ ...createTaskForm, roomId: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={createTaskForm.priority}
                    onChange={(e) => setCreateTaskForm({ ...createTaskForm, priority: e.target.value })}
                  >
                    {PRIORITIES.map((priority) => (
                      <MenuItem key={priority} value={priority}>
                        {priority}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField
              label="Location"
              value={createTaskForm.location}
              onChange={(e) => setCreateTaskForm({ ...createTaskForm, location: e.target.value })}
              fullWidth
            />
            <TextField
              label="Equipment Type"
              value={createTaskForm.equipmentType}
              onChange={(e) => setCreateTaskForm({ ...createTaskForm, equipmentType: e.target.value })}
              fullWidth
            />
            <TextField
              label="Estimated Cost ($)"
              type="number"
              value={createTaskForm.estimatedCost}
              onChange={(e) => setCreateTaskForm({ ...createTaskForm, estimatedCost: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={createTaskForm.description}
              onChange={(e) => setCreateTaskForm({ ...createTaskForm, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateTaskOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateTask} variant="contained">Create Task</Button>
        </DialogActions>
      </Dialog>

      {/* Assign Task Dialog */}
      <Dialog open={assignTaskOpen} onClose={() => setAssignTaskOpen(false)}>
        <DialogTitle>Assign Task to Maintenance Staff</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Staff Member</InputLabel>
            <Select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
            >
              {staff.filter(s => s.isActive).map((staffMember) => (
                <MenuItem key={staffMember.id} value={staffMember.id.toString()}>
                  {staffMember.user.firstName} {staffMember.user.lastName} ({staffMember.employeeId})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignTaskOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignTask} variant="contained">Assign</Button>
        </DialogActions>
      </Dialog>

      {/* Complete Task Dialog */}
      <Dialog open={completeTaskOpen} onClose={() => setCompleteTaskOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Complete Maintenance Task</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Work Performed"
              value={workPerformed}
              onChange={(e) => setWorkPerformed(e.target.value)}
              multiline
              rows={4}
              fullWidth
              required
            />
            <TextField
              label="Parts Used"
              value={partsUsed}
              onChange={(e) => setPartsUsed(e.target.value)}
              multiline
              rows={2}
              fullWidth
            />
            <TextField
              label="Actual Cost ($)"
              type="number"
              value={actualCost}
              onChange={(e) => setActualCost(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteTaskOpen(false)}>Cancel</Button>
          <Button onClick={handleCompleteTask} variant="contained">Complete</Button>
        </DialogActions>
      </Dialog>

      {/* Task Detail Dialog */}
      <Dialog open={taskDetailOpen} onClose={() => setTaskDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Task Details
          {!isEditingTask && currentUserRole === 'OPERATIONS_SUPERVISOR' && (
            <Button 
              startIcon={<EditIcon />} 
              onClick={handleEditTask}
              sx={{ ml: 2 }}
            >
              Edit
            </Button>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedTask && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Task #{selectedTask.id} - {selectedTask.title}
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Task Type</Typography>
                  <Typography>{selectedTask.taskType.replace(/_/g, ' ')}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={selectedTask.status.replace('_', ' ')}
                    size="small"
                    color={getStatusColor(selectedTask.status) as any}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
                  {isEditingTask ? (
                    <FormControl fullWidth size="small">
                      <Select
                        value={editTaskData.priority || 'NORMAL'}
                        onChange={(e) => setEditTaskData({...editTaskData, priority: e.target.value})}
                      >
                        <MenuItem value="LOW">Low</MenuItem>
                        <MenuItem value="NORMAL">Normal</MenuItem>
                        <MenuItem value="HIGH">High</MenuItem>
                        <MenuItem value="URGENT">Urgent</MenuItem>
                        <MenuItem value="CRITICAL">Critical</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    <Chip 
                      label={selectedTask.priority}
                      size="small"
                      color={getPriorityColor(selectedTask.priority) as any}
                    />
                  )}
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                  {isEditingTask ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={editTaskData.location || ''}
                      onChange={(e) => setEditTaskData({...editTaskData, location: e.target.value})}
                    />
                  ) : (
                    <Typography>{selectedTask.location || 'N/A'}</Typography>
                  )}
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Assigned Staff</Typography>
                  <Typography>
                    {selectedTask.assignedStaff 
                      ? `${selectedTask.assignedStaff.user.firstName} ${selectedTask.assignedStaff.user.lastName}`
                      : 'Unassigned'
                    }
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Estimated Cost</Typography>
                  {isEditingTask ? (
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={editTaskData.estimatedCost || 0}
                      onChange={(e) => setEditTaskData({...editTaskData, estimatedCost: parseFloat(e.target.value) || 0})}
                      InputProps={{ startAdornment: '$' }}
                    />
                  ) : (
                    <Typography>${selectedTask.estimatedCost?.toFixed(2) || '0.00'}</Typography>
                  )}
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Equipment Type</Typography>
                  {isEditingTask ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={editTaskData.equipmentType || ''}
                      onChange={(e) => setEditTaskData({...editTaskData, equipmentType: e.target.value})}
                    />
                  ) : (
                    <Typography>{selectedTask.equipmentType || 'N/A'}</Typography>
                  )}
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Created</Typography>
                  <Typography>{new Date(selectedTask.createdAt).toLocaleString()}</Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                {isEditingTask ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={editTaskData.description || ''}
                    onChange={(e) => setEditTaskData({...editTaskData, description: e.target.value})}
                    sx={{ mt: 1 }}
                  />
                ) : (
                  <Typography>{selectedTask.description}</Typography>
                )}
              </Box>
              {selectedTask.workPerformed && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Work Performed</Typography>
                  <Typography>{selectedTask.workPerformed}</Typography>
                </Box>
              )}
              {selectedTask.partsUsed && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Parts Used</Typography>
                  <Typography>{selectedTask.partsUsed}</Typography>
                </Box>
              )}
              {selectedTask.actualCost && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Actual Cost</Typography>
                  <Typography>${selectedTask.actualCost.toFixed(2)}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {isEditingTask ? (
            <>
              <Button onClick={handleCancelEdit}>Cancel</Button>
              <Button onClick={handleSaveTaskEdit} variant="contained">Save Changes</Button>
            </>
          ) : (
            <>
              {selectedTask && currentUserRole === 'OPERATIONS_SUPERVISOR' && (
                <Button 
                  onClick={() => {
                    setTaskDetailOpen(false);
                    openAssignDialog(selectedTask.id);
                  }}
                  variant="contained"
                  startIcon={<AssignIcon />}
                  sx={{ mr: 'auto' }}
                >
                  {selectedTask.assignedStaff ? 'Reassign' : 'Assign'} Task
                </Button>
              )}
              <Button onClick={() => setTaskDetailOpen(false)}>Close</Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaintenanceDashboard;
