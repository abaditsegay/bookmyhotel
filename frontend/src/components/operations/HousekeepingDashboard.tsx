import React, { useState, useEffect } from 'react';
import TokenManager from '../../utils/tokenManager';
import {
  Box,
  Button,
  Typography,
  Tabs,
  Tab,
  Badge,
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
  IconButton,
  Chip,
  Tooltip,
  TablePagination,
  CircularProgress,
  Alert
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


const API_BASE_URL = 'http://localhost:8080/api';

interface HousekeepingTask {
  id: number;
  room: {
    roomNumber: string;
    floor: number;
  };
  taskType: string;
  status: string;
  priority: string;
  description: string;
  assignedStaff?: {
    id: number;
    name: string;
  };
  specialInstructions?: string;
  estimatedDuration?: number;
  estimatedDurationMinutes?: number; // Fallback for mock data
  createdAt: string;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
}

interface HousekeepingStaff {
  id: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  employeeId: string;
  isActive: boolean;
}

interface CreateTaskForm {
  roomId: string;
  taskType: string;
  description: string;
  priority: string;
  specialInstructions: string;
}

const HousekeepingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
  const [staff, setStaff] = useState<HousekeepingStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create task dialog states
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createTaskForm, setCreateTaskForm] = useState<CreateTaskForm>({
    roomId: '',
    taskType: '',
    description: '',
    priority: 'NORMAL',
    specialInstructions: ''
  });

  // Task assignment dialog states
  const [assignTaskOpen, setAssignTaskOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');

  // Task completion dialog states
  const [completeTaskOpen, setCompleteTaskOpen] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [qualityRating, setQualityRating] = useState(5);

  // Table pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Task detail dialog states
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editTaskData, setEditTaskData] = useState<any>({});
  // const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<HousekeepingTask | null>(null);

  // Get current user role (from auth context)
  const currentUserRole = 'OPERATIONS_SUPERVISOR'; // This would come from auth context

  useEffect(() => {
    loadTasks();
    loadStaff();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      
      // Get current hotel ID from user profile
      const currentUser = TokenManager.getUser();
      if (!currentUser?.hotelId) {
        throw new Error('No hotel ID found in user profile. User must be assigned to a hotel.');
      }
      const hotelId = parseInt(currentUser.hotelId);
      
      // Load tasks directly from API endpoint
      const response = await fetch(`${API_BASE_URL}/housekeeping/tasks/hotel/${hotelId}`, {
        headers: TokenManager.getAuthHeaders()
      });

      if (response.ok) {
        const backendTasks = await response.json();
        // Transform the backend data to match the component's interface
        const transformedTasks = backendTasks.map((task: any) => ({
          id: task.id,
          room: {
            roomNumber: task.room?.roomNumber || 'Unknown',
            floor: task.room?.floor || Math.floor(parseInt(task.room?.roomNumber || '0') / 100)
          },
          taskType: task.taskType || task.task_type,
          status: task.status,
          priority: task.priority,
          description: task.description,
          assignedStaff: task.assignedStaff ? {
            id: task.assignedStaff.id,
            name: `${task.assignedStaff.firstName || task.assignedStaff.user?.firstName || ''} ${task.assignedStaff.lastName || task.assignedStaff.user?.lastName || ''}`.trim()
          } : undefined,
          specialInstructions: task.specialInstructions,
          estimatedDuration: task.estimatedDuration,
          estimatedDurationMinutes: task.estimatedDurationMinutes || task.estimatedDuration,
          createdAt: task.createdAt,
          assignedAt: task.assignedAt,
          startedAt: task.startedAt,
          completedAt: task.completedAt
        }));
        
        setTasks(transformedTasks);
        setError(null);
      } else {
        throw new Error(`API error: ${response.status}`);
      }
    } catch (err) {
      console.error('Failed to load housekeeping tasks:', err);
      setError('Unable to load tasks - please check your connection');
      setTasks([]); // Set empty array instead of mock data
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      // Get current hotel ID from user profile
      const currentUser = TokenManager.getUser();
      if (!currentUser?.hotelId) {
        throw new Error('No hotel ID found in user profile. User must be assigned to a hotel.');
      }
      const hotelId = parseInt(currentUser.hotelId);
      
      const response = await fetch(`${API_BASE_URL}/housekeeping/staff/hotel/${hotelId}`, {
        headers: TokenManager.getAuthHeaders()
      });

      if (response.ok) {
        const backendStaff = await response.json();
        // Transform the backend data to match the component's interface
        const transformedStaff = backendStaff.map((member: any) => ({
          id: member.id,
          user: {
            id: member.user?.id || member.id,
            firstName: member.user?.firstName || member.firstName,
            lastName: member.user?.lastName || member.lastName
          },
          employeeId: member.employeeId,
          isActive: member.isActive !== undefined ? member.isActive : member.active
        }));
        setStaff(transformedStaff);
      } else {
        console.error('Failed to load staff data:', response.status);
        setStaff([]); // Set empty array instead of mock data
      }
    } catch (err) {
      console.error('Failed to load housekeeping staff:', err);
      setStaff([]); // Set empty array instead of mock data
    }
  };

  const handleCreateTask = async () => {
    try {
      // API call would go here
      // const response = await fetch(`${API_BASE_URL}/api/housekeeping/tasks`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(createTaskForm)
      // });
      
      setCreateTaskOpen(false);
      setCreateTaskForm({
        roomId: '',
        taskType: '',
        description: '',
        priority: 'NORMAL',
        specialInstructions: ''
      });
      await loadTasks();
    } catch (err) {
      setError('Failed to create task');
    }
  };

  const handleAssignTask = async () => {
    if (!selectedTaskId || !selectedStaffId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/supervisor/tasks/housekeeping/${selectedTaskId}/assign/${selectedStaffId}`, {
        method: 'PUT',
        headers: TokenManager.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to assign task: ${response.status}`);
      }

      setAssignTaskOpen(false);
      setSelectedTaskId(null);
      setSelectedStaffId('');
      await loadTasks();
    } catch (err) {
      console.error('Task assignment error:', err);
      setError(`Failed to assign task: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleStartTask = async (taskId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/housekeeping/tasks/${taskId}/start`, {
        method: 'POST',
        headers: TokenManager.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to start task: ${response.status}`);
      }

      await loadTasks();
    } catch (err) {
      console.error('Task start error:', err);
      setError(`Failed to start task: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleCompleteTask = async () => {
    if (!selectedTaskId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/housekeeping/tasks/${selectedTaskId}/complete`, {
        method: 'POST',
        headers: TokenManager.getAuthHeaders(),
        body: JSON.stringify({ 
          notes: completionNotes,
          qualityRating: qualityRating 
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to complete task: ${response.status}`);
      }

      setCompleteTaskOpen(false);
      setSelectedTaskId(null);
      setCompletionNotes('');
      setQualityRating(5);
      await loadTasks();
    } catch (err) {
      console.error('Task completion error:', err);
      setError(`Failed to complete task: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
        description: selectedTask.description || '',
        specialInstructions: selectedTask.specialInstructions || '',
        priority: selectedTask.priority || 'NORMAL',
        estimatedDuration: selectedTask.estimatedDuration || selectedTask.estimatedDurationMinutes || 45
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
        description: editTaskData.description,
        specialInstructions: editTaskData.specialInstructions,
        priority: editTaskData.priority,
        estimatedDuration: editTaskData.estimatedDuration
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

  const getFilteredTasks = () => {
    switch (activeTab) {
      case 0: return tasks; // All tasks
      case 1: return tasks.filter(task => task.status === 'PENDING' || task.status === 'pending');
      case 2: return tasks.filter(task => task.status === 'IN_PROGRESS' || task.status === 'in_progress');
      case 3: return tasks.filter(task => task.status === 'COMPLETED' || task.status === 'completed');
      default: return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();
  const paginatedTasks = filteredTasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
          Housekeeping Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateTaskOpen(true)}
          >
            Create Task
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => { loadTasks(); loadStaff(); }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab 
            label={
              <Badge badgeContent={tasks.filter(t => t.status === 'pending').length} color="error">
                All Tasks
              </Badge>
            }
          />
          <Tab 
            label={
              <Badge badgeContent={tasks.filter(t => t.status === 'pending').length} color="warning">
                Pending
              </Badge>
            }
          />
          <Tab 
            label={
              <Badge badgeContent={tasks.filter(t => t.status === 'in_progress').length} color="primary">
                In Progress
              </Badge>
            }
          />
          <Tab 
            label={
              <Badge badgeContent={tasks.filter(t => t.status === 'completed').length} color="success">
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
              <TableCell>Room</TableCell>
              <TableCell>Task Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Assigned Staff</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {task.room.roomNumber}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Floor {task.room.floor}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={task.taskType.replace('_', ' ')}
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
                      {task.assignedStaff.name}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Unassigned
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {task.estimatedDuration || task.estimatedDurationMinutes || 0}min
                  </Typography>
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
                    
                    {(task.status === 'pending' || task.status === 'PENDING') && (
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
                    
                    {(task.status === 'assigned' || task.status === 'ASSIGNED') && (
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
                    
                    {(task.status === 'in_progress' || task.status === 'IN_PROGRESS') && (
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
                    
                    {/* Reassign button for assigned or in-progress tasks */}
                    {currentUserRole === 'OPERATIONS_SUPERVISOR' && 
                     (task.status === 'assigned' || task.status === 'ASSIGNED' || 
                      task.status === 'in_progress' || task.status === 'IN_PROGRESS') && (
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
                    
                    {currentUserRole === 'OPERATIONS_SUPERVISOR' && (
                      <Tooltip title="Edit Task">
                        <IconButton 
                          size="small"
                          onClick={() => {
                            setSelectedTask(task);
                            // setEditTaskOpen(true); // TODO: Implement edit functionality
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

      {/* Create Task Dialog */}
      <Dialog open={createTaskOpen} onClose={() => setCreateTaskOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Housekeeping Task</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Room ID"
              value={createTaskForm.roomId}
              onChange={(e) => setCreateTaskForm({ ...createTaskForm, roomId: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Task Type</InputLabel>
              <Select
                value={createTaskForm.taskType}
                label="Task Type"
                onChange={(e) => setCreateTaskForm({ ...createTaskForm, taskType: e.target.value })}
              >
                <MenuItem value="CHECKOUT_CLEANING">Checkout Cleaning</MenuItem>
                <MenuItem value="MAINTENANCE_CLEANING">Maintenance Cleaning</MenuItem>
                <MenuItem value="DEEP_CLEANING">Deep Cleaning</MenuItem>
                <MenuItem value="INSPECTION">Inspection</MenuItem>
                <MenuItem value="MAINTENANCE_TASK">Maintenance Task</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Description"
              value={createTaskForm.description}
              onChange={(e) => setCreateTaskForm({ ...createTaskForm, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={createTaskForm.priority}
                label="Priority"
                onChange={(e) => setCreateTaskForm({ ...createTaskForm, priority: e.target.value })}
              >
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="NORMAL">Normal</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="URGENT">Urgent</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Special Instructions"
              value={createTaskForm.specialInstructions}
              onChange={(e) => setCreateTaskForm({ ...createTaskForm, specialInstructions: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateTaskOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateTask} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Assign Task Dialog */}
      <Dialog open={assignTaskOpen} onClose={() => setAssignTaskOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Task</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Select Staff Member</InputLabel>
              <Select
                value={selectedStaffId}
                label="Select Staff Member"
                onChange={(e) => setSelectedStaffId(e.target.value)}
              >
                {staff.filter(s => s.isActive).map((staffMember) => (
                  <MenuItem key={staffMember.id} value={staffMember.id.toString()}>
                    {staffMember.user?.firstName || 'Unknown'} {staffMember.user?.lastName || 'User'} - {staffMember.employeeId}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignTaskOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAssignTask} 
            variant="contained"
            disabled={!selectedStaffId}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Complete Task Dialog */}
      <Dialog open={completeTaskOpen} onClose={() => setCompleteTaskOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Complete Task</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Completion Notes"
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Quality Rating</InputLabel>
              <Select
                value={qualityRating}
                label="Quality Rating"
                onChange={(e) => setQualityRating(Number(e.target.value))}
              >
                <MenuItem value={5}>5 - Excellent</MenuItem>
                <MenuItem value={4}>4 - Good</MenuItem>
                <MenuItem value={3}>3 - Average</MenuItem>
                <MenuItem value={2}>2 - Below Average</MenuItem>
                <MenuItem value={1}>1 - Poor</MenuItem>
              </Select>
            </FormControl>
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
                Task #{selectedTask.id} - Room {selectedTask.room.roomNumber}
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Task Type</Typography>
                  <Typography>{selectedTask.taskType.replace('_', ' ')}</Typography>
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
                  <Typography variant="subtitle2" color="text.secondary">Estimated Duration</Typography>
                  {isEditingTask ? (
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={editTaskData.estimatedDuration || 45}
                      onChange={(e) => setEditTaskData({...editTaskData, estimatedDuration: parseInt(e.target.value)})}
                      InputProps={{ endAdornment: 'min' }}
                    />
                  ) : (
                    <Typography>{selectedTask.estimatedDuration || selectedTask.estimatedDurationMinutes || 0} minutes</Typography>
                  )}
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Assigned Staff</Typography>
                  <Typography>
                    {selectedTask.assignedStaff ? selectedTask.assignedStaff.name : 'Unassigned'}
                  </Typography>
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
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Special Instructions</Typography>
                {isEditingTask ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    value={editTaskData.specialInstructions || ''}
                    onChange={(e) => setEditTaskData({...editTaskData, specialInstructions: e.target.value})}
                    sx={{ mt: 1 }}
                  />
                ) : (
                  <Typography>{selectedTask.specialInstructions || 'None'}</Typography>
                )}
              </Box>
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

export default HousekeepingDashboard;
