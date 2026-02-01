import React, { useState, useEffect, useCallback } from 'react';
import { COLORS, addAlpha } from '../../theme/themeColors';
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
  TablePagination,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  MenuItem,
  Tooltip,
  useMediaQuery,
  useTheme,
  Fab,
  List,
  Divider
} from '@mui/material';
import PremiumTextField from '../common/PremiumTextField';
import PremiumSelect from '../common/PremiumSelect';
import PremiumDatePicker from '../common/PremiumDatePicker';
import {
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  PersonAdd as PersonAddIcon,
  AddTask as AddTaskIcon
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
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

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
      // console.error('🔄 loadTasks: Error loading tasks:', error);
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
      // console.error('Update status error:', err);
    }
  };

  const loadStaff = useCallback(async () => {
    try {
      const staff = await housekeepingSupervisorApi.getStaff();
      setAvailableStaff(staff);
    } catch (err) {
      // console.error('❌ Failed to load staff:', err);
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
      // console.error('Assign task error:', err);
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
      // console.error('❌ Error creating staff member:', err);
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
      // console.error('❌ Error creating task:', err);
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
    <Box sx={{ 
      flexGrow: 1, 
      p: { xs: 1, sm: 2, md: 3 },
      pb: { xs: 8, sm: 3 } // Extra bottom padding on mobile for FAB
    }}>
      <Typography 
        variant={isMobile ? "h5" : "h4"} 
        component="h1" 
        sx={{ 
          mb: { xs: 2, md: 3 },
          textAlign: { xs: 'center', sm: 'left' }
        }}
      >
        {isHousekeepingStaff() ? 'My Tasks' : 'Tasks Overview'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mb: { xs: 2, md: 3 } }}>
        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ 
              p: { xs: 1, sm: 2 },
              '&:last-child': { pb: { xs: 1, sm: 2 } }
            }}>
              <Typography 
                color="textSecondary" 
                gutterBottom
                variant={isMobile ? "caption" : "body2"}
                sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
              >
                Total Tasks
              </Typography>
              <Typography variant={isMobile ? "h6" : "h4"}>
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ 
              p: { xs: 1, sm: 2 },
              '&:last-child': { pb: { xs: 1, sm: 2 } }
            }}>
              <Typography 
                color="textSecondary" 
                gutterBottom
                variant={isMobile ? "caption" : "body2"}
                sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
              >
                Completed
              </Typography>
              <Typography variant={isMobile ? "h6" : "h4"} color="success.main">
                {stats.completed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ 
              p: { xs: 1, sm: 2 },
              '&:last-child': { pb: { xs: 1, sm: 2 } }
            }}>
              <Typography 
                color="textSecondary" 
                gutterBottom
                variant={isMobile ? "caption" : "body2"}
                sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
              >
                In Progress
              </Typography>
              <Typography variant={isMobile ? "h6" : "h4"} color="info.main">
                {stats.inProgress}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ 
              p: { xs: 1, sm: 2 },
              '&:last-child': { pb: { xs: 1, sm: 2 } }
            }}>
              <Typography 
                color="textSecondary" 
                gutterBottom
                variant={isMobile ? "caption" : "body2"}
                sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
              >
                Pending
              </Typography>
              <Typography variant={isMobile ? "h6" : "h4"} color="warning.main">
                {stats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tasks Table */}
      <Card sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        boxShadow: `0 2px 8px ${addAlpha(COLORS.BLACK, 0.08)}`
      }}>
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            mb: 3,
            gap: { xs: 2, sm: 0 },
            pb: 2,
            borderBottom: `2px solid ${COLORS.SECONDARY}`
          }}>
            <Typography 
              variant={isMobile ? "h6" : "h5"}
              sx={{ mb: { xs: 1, sm: 0 }, fontWeight: 700, color: COLORS.TEXT_PRIMARY }}
            >
              {isHousekeepingStaff() ? 'My Tasks' : 'All Tasks'} ({filteredTasks.length} of {tasks.length} tasks)
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: 1.5,
              flexDirection: { xs: 'row', sm: 'row' },
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              justifyContent: { xs: 'flex-start', sm: 'flex-end' }
            }}>
              {isManagementRole() && (
                <>
                  <Button 
                    variant="contained"
                    onClick={() => setAddTaskDialog(true)}
                    disabled={loading}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      backgroundColor: COLORS.SECONDARY,
                      color: COLORS.WHITE,
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: COLORS.SECONDARY_HOVER
                      }
                    }}
                  >
                    Add Task
                  </Button>
                  <Button 
                    variant="outlined"
                    onClick={() => setAddStaffDialog(true)}
                    disabled={loading}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      borderColor: COLORS.SECONDARY,
                      color: COLORS.SECONDARY,
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: COLORS.SECONDARY_HOVER,
                        backgroundColor: addAlpha(COLORS.SECONDARY, 0.08)
                      }
                    }}
                  >
                    Manage Staff
                  </Button>
                </>
              )}
              <Button 
                variant="outlined"
                onClick={loadTasks}
                size={isMobile ? "small" : "medium"}
                startIcon={<RefreshIcon />}
                sx={{
                  borderColor: COLORS.BORDER_LIGHT,
                  color: COLORS.TEXT_SECONDARY,
                  '&:hover': {
                    borderColor: COLORS.SECONDARY,
                    backgroundColor: addAlpha(COLORS.SECONDARY, 0.08)
                  }
                }}
              >
                Refresh
              </Button>
            </Box>
          </Box>

          {/* Filter Controls - Only show for management roles */}
          {isManagementRole() && (
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 1.5, md: 2 }, 
              mb: 3, 
              flexWrap: 'wrap', 
              alignItems: 'center',
              p: 2.5,
              backgroundColor: COLORS.BG_LIGHT,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  fontSize: { xs: '0.8rem', md: '0.875rem' },
                  fontWeight: 600,
                  color: 'text.secondary'
                }}
              >
                <FilterListIcon fontSize="small" />
                Filters:
              </Typography>
              
              <PremiumSelect
                value={filterAssignedTo}
                label="Assigned To"
                onChange={(e) => setFilterAssignedTo(e.target.value)}
                sx={{ minWidth: { xs: 140, md: 180 } }}
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
              </PremiumSelect>

              <PremiumSelect
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
                sx={{ minWidth: { xs: 140, md: 180 } }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value={HousekeepingTaskStatus.PENDING}>Pending</MenuItem>
                <MenuItem value={HousekeepingTaskStatus.ASSIGNED}>Assigned</MenuItem>
                <MenuItem value={HousekeepingTaskStatus.IN_PROGRESS}>In Progress</MenuItem>
                <MenuItem value={HousekeepingTaskStatus.COMPLETED}>Completed</MenuItem>
                <MenuItem value={HousekeepingTaskStatus.ON_HOLD}>On Hold</MenuItem>
                <MenuItem value={HousekeepingTaskStatus.CANCELLED}>Cancelled</MenuItem>
              </PremiumSelect>

              <Button
                variant="outlined"
                size="small"
                startIcon={<ClearIcon />}
                onClick={() => {
                  setFilterAssignedTo('all');
                  setFilterStatus('all');
                }}
                sx={{
                  borderColor: COLORS.BORDER_LIGHT,
                  color: COLORS.TEXT_SECONDARY,
                  fontWeight: 600,
                  px: 2,
                  '&:hover': {
                    borderColor: COLORS.SECONDARY,
                    backgroundColor: addAlpha(COLORS.SECONDARY, 0.08),
                    color: COLORS.SECONDARY
                  }
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
            <>
              {/* Mobile Card Layout */}
              {isMobile ? (
                <>
                <List sx={{ p: 0 }}>
                  {filteredTasks
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((task) => (
                    <Card key={task.id} sx={{ mb: 1 }}>
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="subtitle2" fontWeight="medium" sx={{ flex: 1, mr: 1 }}>
                            {task.title}
                          </Typography>
                          <Chip 
                            label={task.status} 
                            color={getStatusColor(task.status)} 
                            size="small" 
                          />
                        </Box>
                        
                        {task.description && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            {task.description}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                          <Chip label={task.taskType} variant="outlined" size="small" />
                          <Chip label={task.priority} color={getStatusColor(task.priority)} size="small" />
                          {task.roomNumber && (
                            <Chip label={`Room ${task.roomNumber}`} variant="outlined" size="small" />
                          )}
                        </Box>
                        
                        {task.dueDate && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </Typography>
                        )}
                        
                        {isManagementRole() && task.assignedUser && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Assigned to: {task.assignedUser.firstName} {task.assignedUser.lastName}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                          {/* Status Update Action */}
                          <Button 
                            size="small" 
                            variant="outlined"
                            onClick={() => {
                              setSelectedTask(task);
                              setIsViewOnlyMode(false);
                              setStatusDialog(true);
                            }}
                            disabled={task.status.toLowerCase() === 'completed'}
                            startIcon={getActionIcon(task.status)}
                          >
                            Update Status
                          </Button>
                          
                          {/* Assignment Action - Only for management roles */}
                          {isManagementRole() && (
                            <Button 
                              size="small" 
                              variant="outlined"
                              onClick={() => {
                                setAssignTaskId(task.id);
                                setSelectedStaffId(task.assignedUser?.id?.toString() || '');
                                setAssignDialog(true);
                                loadStaff();
                              }}
                              disabled={task.status.toLowerCase() === 'completed'}
                              startIcon={<AssignmentIcon />}
                            >
                              Assign
                            </Button>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </List>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={filteredTasks.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(event, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(event) => {
                    setRowsPerPage(parseInt(event.target.value, 10));
                    setPage(0);
                  }}
                  sx={{ borderTop: '1px solid', borderColor: 'divider' }}
                />
                </>
              ) : (
                /* Desktop Table Layout */
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow
                        sx={{
                          background: `linear-gradient(135deg, ${COLORS.BG_DEFAULT} 0%, ${COLORS.BG_LIGHT} 50%, ${COLORS.BG_DEFAULT} 100%)`,
                          borderBottom: `2px solid ${COLORS.PRIMARY}`,
                          '& .MuiTableCell-head': {
                            color: COLORS.PRIMARY,
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            border: 'none',
                            padding: '20px 16px',
                            position: 'relative'
                          }
                        }}
                      >
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
                  {filteredTasks
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((task) => (
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
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredTasks.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(parseInt(event.target.value, 10));
                  setPage(0);
                }}
              />
            </TableContainer>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Floating Action Button for Mobile Refresh */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="refresh"
          onClick={loadTasks}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000
          }}
        >
          <RefreshIcon />
        </Fab>
      )}

      {/* Status Update Dialog */}
      <Dialog 
        open={statusDialog} 
        onClose={() => {
          setStatusDialog(false);
          setIsViewOnlyMode(false);
        }} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: `0 8px 32px ${addAlpha(COLORS.BLACK, 0.12)}`
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `2px solid ${COLORS.SECONDARY}`,
          pb: 2,
          background: `linear-gradient(135deg, ${COLORS.BG_LIGHT} 0%, ${COLORS.WHITE} 100%)`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AssignmentIcon sx={{ fontSize: 28, color: COLORS.SECONDARY }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.TEXT_PRIMARY }}>
              {isViewOnlyMode 
                ? 'Task Details'
                : isHousekeepingStaff() 
                  ? 'Update Task Status' 
                  : 'Task Details & Status'
              }
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          {selectedTask && (
            <Box>
              {/* Task Title */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.TEXT_PRIMARY, mb: 2 }}>
                  {selectedTask.title}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                        Room Number
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedTask.roomNumber || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                        Task Type
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedTask.taskType.replace(/_/g, ' ')}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                        Current Status
                      </Typography>
                      <Chip 
                        label={selectedTask.status}
                        size="small"
                        sx={{ 
                          fontWeight: 600,
                          width: 'fit-content',
                          backgroundColor: selectedTask.status.toLowerCase() === 'completed' ? COLORS.SUCCESS :
                                         selectedTask.status.toLowerCase() === 'in_progress' ? COLORS.CONFIRMED :
                                         selectedTask.status.toLowerCase() === 'pending' ? COLORS.WARNING : COLORS.TEXT_SECONDARY,
                          color: COLORS.WHITE
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              {/* Additional Information */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}>
                  Additional Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2.5}>
                  {selectedTask.description && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                          Description
                        </Typography>
                        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                          {selectedTask.description}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  
                  {selectedTask.assignedUser && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                          Assigned To
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {selectedTask.assignedUser.firstName && selectedTask.assignedUser.lastName ? 
                            `${selectedTask.assignedUser.firstName} ${selectedTask.assignedUser.lastName}` :
                            `User ID: ${selectedTask.assignedUser.id}`
                          }
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  
                  {selectedTask.dueDate && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                          Due Date
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {new Date(selectedTask.dueDate).toLocaleString()}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
              
              {/* Status update section for eligible users and tasks */}
              {!isViewOnlyMode && (isHousekeepingStaff() || isManagementRole()) && 
               !['completed', 'cancelled'].includes(selectedTask.status.toLowerCase()) && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}>
                    {isHousekeepingStaff() ? 'Update Your Task Progress' : 'Update Task Status'}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {/* Status Selection for Management */}
                  {isManagementRole() && (
                    <PremiumSelect
                      fullWidth
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
                    </PremiumSelect>
                  )}
                </Box>
              )}
              
              {!isViewOnlyMode && (
                <Box sx={{ mb: 2 }}>
                  <PremiumTextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Notes (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={isHousekeepingStaff() 
                      ? "Add any notes about your progress or issues encountered..."
                      : "Add notes about this task..."
                    }
                  />
                </Box>
              )}
              
              {/* Show existing notes in view-only mode */}
              {isViewOnlyMode && selectedTask.notes && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}>
                    Notes
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {selectedTask.notes}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid', borderColor: 'divider', gap: 1.5 }}>
          <Button 
            onClick={() => {
              setStatusDialog(false);
              setIsViewOnlyMode(false);
            }}
            variant="outlined"
            sx={{
              borderColor: COLORS.BORDER_LIGHT,
              color: COLORS.TEXT_SECONDARY,
              '&:hover': {
                borderColor: COLORS.SECONDARY,
                backgroundColor: addAlpha(COLORS.SECONDARY, 0.08)
              }
            }}
          >
            {isViewOnlyMode ? 'Close' : isHousekeepingStaff() ? 'Cancel' : 'Close'}
          </Button>
          
          {/* Quick Action buttons for Housekeeping Staff */}
          {!isViewOnlyMode && selectedTask && isHousekeepingStaff() && !['completed', 'cancelled'].includes(selectedTask.status.toLowerCase()) && (
            <>
              {(['pending', 'assigned'].includes(selectedTask.status.toLowerCase())) && (
                <Button 
                  onClick={() => handleUpdateStatus('IN_PROGRESS')} 
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  sx={{
                    backgroundColor: COLORS.CONFIRMED,
                    color: COLORS.WHITE,
                    fontWeight: 600,
                    px: 3,
                    '&:hover': {
                      backgroundColor: COLORS.INFO
                    }
                  }}
                >
                  Start Task
                </Button>
              )}
              {(selectedTask.status.toLowerCase() === 'in_progress') && (
                <Button 
                  onClick={() => handleUpdateStatus('COMPLETED')} 
                  variant="contained"
                  startIcon={<CheckCircleIcon />}
                  sx={{
                    backgroundColor: COLORS.SUCCESS,
                    color: COLORS.WHITE,
                    fontWeight: 600,
                    px: 3,
                    '&:hover': {
                      backgroundColor: addAlpha(COLORS.SUCCESS, 0.9)
                    }
                  }}
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
      <Dialog 
        open={addTaskDialog} 
        onClose={() => setAddTaskDialog(false)} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: `0 8px 32px ${addAlpha(COLORS.BLACK, 0.12)}`
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `2px solid ${COLORS.SECONDARY}`,
          pb: 2,
          background: `linear-gradient(135deg, ${COLORS.BG_LIGHT} 0%, ${COLORS.WHITE} 100%)`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AddTaskIcon sx={{ fontSize: 28, color: COLORS.SECONDARY }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.TEXT_PRIMARY }}>
              Create New Housekeeping Task
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Basic Information */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2.5 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <PremiumTextField
                  label="Task Title"
                  value={newTask.title}
                  onChange={(e) => handleTaskFieldChange('title', e.target.value)}
                  fullWidth
                  required
                  placeholder="Enter a clear, descriptive title for the task"
                />
                
                <PremiumTextField
                  label="Description"
                  value={newTask.description}
                  onChange={(e) => handleTaskFieldChange('description', e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  required
                  placeholder="Provide detailed description of what needs to be done"
                />
              </Box>
            </Box>
            
            {/* Task Classification */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}>
                Task Classification
              </Typography>
              <Divider sx={{ mb: 2.5 }} />
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <PremiumSelect
                    fullWidth
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
                  </PremiumSelect>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <PremiumSelect
                    fullWidth
                    value={newTask.priority}
                    label="Priority"
                    onChange={(e) => handleTaskFieldChange('priority', e.target.value)}
                  >
                    <MenuItem value={TaskPriority.LOW}>Low</MenuItem>
                    <MenuItem value={TaskPriority.NORMAL}>Normal</MenuItem>
                    <MenuItem value={TaskPriority.HIGH}>High</MenuItem>
                    <MenuItem value={TaskPriority.URGENT}>Urgent</MenuItem>
                    <MenuItem value={TaskPriority.CRITICAL}>Critical</MenuItem>
                  </PremiumSelect>
                </Grid>
              </Grid>
            </Box>
            
            {/* Location Details */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}>
                Location Details
              </Typography>
              <Divider sx={{ mb: 2.5 }} />
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    label="Room Number"
                    value={newTask.roomNumber}
                    onChange={(e) => handleTaskFieldChange('roomNumber', e.target.value)}
                    fullWidth
                    required
                    placeholder="e.g., 101, 205"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    label="Floor Number"
                    type="number"
                    value={newTask.floorNumber || ''}
                    onChange={(e) => handleTaskFieldChange('floorNumber', e.target.value ? parseInt(e.target.value) : undefined)}
                    fullWidth
                    placeholder="Optional"
                  />
                </Grid>
              </Grid>
            </Box>
            
            {/* Scheduling */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}>
                Scheduling
              </Typography>
              <Divider sx={{ mb: 2.5 }} />
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    label="Estimated Duration (minutes)"
                    type="number"
                    value={newTask.estimatedDuration}
                    onChange={(e) => handleTaskFieldChange('estimatedDuration', parseInt(e.target.value) || 60)}
                    fullWidth
                    inputProps={{ min: 15, step: 15 }}
                    placeholder="e.g., 60"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <PremiumDatePicker
                    label="Due Date & Time"
                    value={newTask.dueDate ? new Date(newTask.dueDate) : null}
                    onChange={(date) => {
                      if (date) {
                        const isoString = date.toISOString().slice(0, 16);
                        handleTaskFieldChange('dueDate', isoString);
                      }
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
            
            {/* Additional Information */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}>
                Additional Information
              </Typography>
              <Divider sx={{ mb: 2.5 }} />
              <PremiumTextField
                label="Additional Notes"
                value={newTask.notes}
                onChange={(e) => handleTaskFieldChange('notes', e.target.value)}
                fullWidth
                multiline
                rows={3}
                placeholder="Add any special instructions or requirements"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid', borderColor: 'divider', gap: 1.5 }}>
          <Button 
            onClick={() => setAddTaskDialog(false)}
            variant="outlined"
            sx={{
              borderColor: COLORS.BORDER_LIGHT,
              color: COLORS.TEXT_SECONDARY,
              '&:hover': {
                borderColor: COLORS.SECONDARY,
                backgroundColor: addAlpha(COLORS.SECONDARY, 0.08)
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateTask}
            variant="contained"
            disabled={loading || !newTask.title.trim() || !newTask.description.trim() || !newTask.dueDate || !newTask.roomNumber?.trim()}
            startIcon={<AddTaskIcon />}
            sx={{
              backgroundColor: COLORS.SECONDARY,
              color: COLORS.WHITE,
              fontWeight: 600,
              px: 3,
              '&:hover': {
                backgroundColor: COLORS.SECONDARY_HOVER
              },
              '&:disabled': {
                backgroundColor: COLORS.BORDER_LIGHT,
                color: COLORS.TEXT_DISABLED
              }
            }}
          >
            Create Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog 
        open={assignDialog} 
        onClose={() => setAssignDialog(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: `0 8px 32px ${addAlpha(COLORS.BLACK, 0.12)}`
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `2px solid ${COLORS.SECONDARY}`,
          pb: 2,
          background: `linear-gradient(135deg, ${COLORS.BG_LIGHT} 0%, ${COLORS.WHITE} 100%)`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PersonAddIcon sx={{ fontSize: 28, color: COLORS.SECONDARY }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.TEXT_PRIMARY }}>
              Assign Task to Staff Member
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Card 
            elevation={0}
            sx={{ 
              backgroundColor: COLORS.BG_LIGHT,
              border: '1px solid',
              borderColor: 'divider',
              borderLeft: `4px solid ${COLORS.SECONDARY}`,
              borderRadius: 2,
              p: 2.5
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: COLORS.TEXT_PRIMARY, mb: 2, textTransform: 'uppercase', fontSize: '0.75rem' }}>
              Select Staff Member
            </Typography>
            <PremiumSelect
              fullWidth
              value={selectedStaffId}
              label="Staff Member"
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
                    <Box sx={{ color: COLORS.SECONDARY, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonAddIcon fontSize="small" />
                      Create New Staff Member
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
            </PremiumSelect>
          </Card>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid', borderColor: 'divider', gap: 1.5 }}>
          <Button 
            onClick={() => setAssignDialog(false)}
            variant="outlined"
            sx={{
              borderColor: COLORS.BORDER_LIGHT,
              color: COLORS.TEXT_SECONDARY,
              '&:hover': {
                borderColor: COLORS.SECONDARY,
                backgroundColor: addAlpha(COLORS.SECONDARY, 0.08)
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAssignTask}
            variant="contained"
            disabled={!selectedStaffId}
            sx={{
              backgroundColor: COLORS.SECONDARY,
              color: COLORS.WHITE,
              fontWeight: 600,
              px: 3,
              '&:hover': {
                backgroundColor: COLORS.SECONDARY_HOVER
              },
              '&:disabled': {
                backgroundColor: COLORS.BORDER_LIGHT,
                color: COLORS.TEXT_DISABLED
              }
            }}
          >
            Assign Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Staff Dialog */}
      <Dialog 
        open={addStaffDialog} 
        onClose={() => setAddStaffDialog(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: `0 8px 32px ${addAlpha(COLORS.BLACK, 0.12)}`
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `2px solid ${COLORS.SECONDARY}`,
          pb: 2,
          background: `linear-gradient(135deg, ${COLORS.BG_LIGHT} 0%, ${COLORS.WHITE} 100%)`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PersonAddIcon sx={{ fontSize: 28, color: COLORS.SECONDARY }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.TEXT_PRIMARY }}>
              Add Housekeeping Staff Member
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}>
                Contact Information
              </Typography>
              <Divider sx={{ mb: 2.5 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <PremiumTextField
                  label="Email"
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => handleStaffFieldChange('email', e.target.value)}
                  fullWidth
                  required
                  placeholder="staff@example.com"
                />
                
                <PremiumTextField
                  label="Phone Number"
                  value={newStaff.phone}
                  onChange={(e) => handleStaffFieldChange('phone', e.target.value)}
                  fullWidth
                  placeholder="+1 234 567 8900"
                />
              </Box>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}>
                Personal Details
              </Typography>
              <Divider sx={{ mb: 2.5 }} />
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    label="First Name"
                    value={newStaff.firstName}
                    onChange={(e) => handleStaffFieldChange('firstName', e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    label="Last Name"
                    value={newStaff.lastName}
                    onChange={(e) => handleStaffFieldChange('lastName', e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
              </Grid>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}>
                Employment Details
              </Typography>
              <Divider sx={{ mb: 2.5 }} />
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    label="Employee ID"
                    value={newStaff.employeeId}
                    onChange={(e) => handleStaffFieldChange('employeeId', e.target.value)}
                    fullWidth
                    required
                    placeholder="EMP-001"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <PremiumSelect
                    fullWidth
                    value={newStaff.shiftType}
                    label="Shift Type"
                    onChange={(e) => handleStaffFieldChange('shiftType', e.target.value)}
                  >
                    <MenuItem value="DAY">Day Shift</MenuItem>
                    <MenuItem value="NIGHT">Night Shift</MenuItem>
                    <MenuItem value="ROTATING">Rotating Shift</MenuItem>
                  </PremiumSelect>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid', borderColor: 'divider', gap: 1.5 }}>
          <Button 
            onClick={() => setAddStaffDialog(false)}
            variant="outlined"
            sx={{
              borderColor: COLORS.BORDER_LIGHT,
              color: COLORS.TEXT_SECONDARY,
              '&:hover': {
                borderColor: COLORS.SECONDARY,
                backgroundColor: addAlpha(COLORS.SECONDARY, 0.08)
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateStaff}
            variant="contained"
            disabled={loading || !newStaff.email.trim() || !newStaff.firstName.trim() || !newStaff.lastName.trim() || !newStaff.employeeId.trim()}
            startIcon={<PersonAddIcon />}
            sx={{
              backgroundColor: COLORS.SECONDARY,
              color: COLORS.WHITE,
              fontWeight: 600,
              px: 3,
              '&:hover': {
                backgroundColor: COLORS.SECONDARY_HOVER
              },
              '&:disabled': {
                backgroundColor: COLORS.BORDER_LIGHT,
                color: COLORS.TEXT_DISABLED
              }
            }}
          >
            Create Staff Member
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HousekeepingDashboard;