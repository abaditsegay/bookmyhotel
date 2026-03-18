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
import { useTranslation } from 'react-i18next';

interface HousekeepingDashboardProps {
  userRole?: string;
  userId?: string;
}

const HousekeepingDashboard: React.FC<HousekeepingDashboardProps> = ({ userRole, userId }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const translateTaskType = (type: string): string => {
    const map: Record<string, string> = {
      ROOM_CLEANING: t('dashboard.housekeepingDashboard.roomCleaning'),
      DEEP_CLEANING: t('dashboard.housekeepingDashboard.deepCleaning'),
      LAUNDRY: t('dashboard.housekeepingDashboard.laundry'),
      PUBLIC_AREA_CLEANING: t('dashboard.housekeepingDashboard.publicAreaCleaning'),
      INVENTORY_CHECK: t('dashboard.housekeepingDashboard.inventoryCheck'),
      MAINTENANCE_REQUEST: t('dashboard.housekeepingDashboard.maintenanceRequest'),
    };
    return map[type] || type.replace(/_/g, ' ');
  };

  const translatePriority = (priority: string): string => {
    const map: Record<string, string> = {
      LOW: t('dashboard.housekeepingDashboard.low'),
      NORMAL: t('dashboard.housekeepingDashboard.normal'),
      HIGH: t('dashboard.housekeepingDashboard.high'),
      URGENT: t('dashboard.housekeepingDashboard.urgent'),
      CRITICAL: t('dashboard.housekeepingDashboard.critical'),
    };
    return map[priority] || priority;
  };

  const translateStatus = (status: string): string => {
    const map: Record<string, string> = {
      PENDING: t('dashboard.housekeepingDashboard.statusPending'),
      ASSIGNED: t('dashboard.housekeepingDashboard.statusAssigned'),
      IN_PROGRESS: t('dashboard.housekeepingDashboard.statusInProgress'),
      COMPLETED: t('dashboard.housekeepingDashboard.statusCompleted'),
      ON_HOLD: t('dashboard.housekeepingDashboard.statusOnHold'),
      CANCELLED: t('dashboard.housekeepingDashboard.statusCancelled'),
    };
    return map[status] || status.replace(/_/g, ' ');
  };
  
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
    const managementRoles = ['HOTEL_ADMIN', 'FRONTDESK', 'OPERATIONAL_ADMIN'];
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
      setError(t('dashboard.housekeepingDashboard.failedToLoadTasks'));
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
      setError(t('dashboard.housekeepingDashboard.failedToUpdateStatus'));
      // console.error('Update status error:', err);
    }
  };

  const loadStaff = useCallback(async () => {
    try {
      const staff = await housekeepingSupervisorApi.getStaff();
      setAvailableStaff(staff);
    } catch (err) {
      // console.error('❌ Failed to load staff:', err);
      setError(t('dashboard.housekeepingDashboard.failedToLoadStaff'));
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
      setError(t('dashboard.housekeepingDashboard.failedToAssignTask'));
      // console.error('Assign task error:', err);
    }
  };

  const handleCreateStaff = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!newStaff.email.trim()) {
        setError(t('dashboard.housekeepingDashboard.emailRequired'));
        return;
      }
      if (!newStaff.firstName.trim()) {
        setError(t('dashboard.housekeepingDashboard.firstNameRequired'));
        return;
      }
      if (!newStaff.lastName.trim()) {
        setError(t('dashboard.housekeepingDashboard.lastNameRequired'));
        return;
      }
      if (!newStaff.employeeId.trim()) {
        setError(t('dashboard.housekeepingDashboard.employeeIdRequired'));
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
      setError(t('dashboard.housekeepingDashboard.failedToCreateStaff'));
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
        setError(t('dashboard.housekeepingDashboard.taskTitleRequired'));
        return;
      }
      if (!newTask.description.trim()) {
        setError(t('dashboard.housekeepingDashboard.taskDescriptionRequired'));
        return;
      }
      if (!newTask.dueDate) {
        setError(t('dashboard.housekeepingDashboard.dueDateRequired'));
        return;
      }
      if (!newTask.roomNumber || !newTask.roomNumber.trim()) {
        setError(t('dashboard.housekeepingDashboard.roomNumberRequired'));
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
      setError(t('dashboard.housekeepingDashboard.failedToCreateTask'));
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
        {isHousekeepingStaff() ? t('dashboard.housekeepingDashboard.myTasks') : t('dashboard.housekeepingDashboard.tasksOverview')}
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
                {t('dashboard.housekeepingDashboard.totalTasks')}
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
                {t('dashboard.housekeepingDashboard.completed')}
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
                {t('dashboard.housekeepingDashboard.inProgress')}
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
                {t('dashboard.housekeepingDashboard.pending')}
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
              {isHousekeepingStaff() ? t('dashboard.housekeepingDashboard.myTasks') : t('dashboard.housekeepingDashboard.allTasks')} ({filteredTasks.length} of {tasks.length} tasks)
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
                    {t('dashboard.housekeepingDashboard.addTask')}
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
                    {t('dashboard.housekeepingDashboard.manageStaff')}
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
                {t('dashboard.housekeepingDashboard.refresh')}
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
                {t('dashboard.housekeepingDashboard.filters')}
              </Typography>
              
              <PremiumSelect
                value={filterAssignedTo}
                label={t('dashboard.housekeepingDashboard.assignedTo')}
                onChange={(e) => setFilterAssignedTo(e.target.value)}
                sx={{ minWidth: { xs: 140, md: 180 } }}
              >
                <MenuItem value="all">{t('dashboard.housekeepingDashboard.allTasksFilter')}</MenuItem>
                <MenuItem value="unassigned">{t('dashboard.housekeepingDashboard.unassigned')}</MenuItem>
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
                label={t('dashboard.housekeepingDashboard.status')}
                onChange={(e) => setFilterStatus(e.target.value)}
                sx={{ minWidth: { xs: 140, md: 180 } }}
              >
                <MenuItem value="all">{t('dashboard.housekeepingDashboard.allStatus')}</MenuItem>
                <MenuItem value={HousekeepingTaskStatus.PENDING}>{t('dashboard.housekeepingDashboard.statusPending')}</MenuItem>
                <MenuItem value={HousekeepingTaskStatus.ASSIGNED}>{t('dashboard.housekeepingDashboard.statusAssigned')}</MenuItem>
                <MenuItem value={HousekeepingTaskStatus.IN_PROGRESS}>{t('dashboard.housekeepingDashboard.statusInProgress')}</MenuItem>
                <MenuItem value={HousekeepingTaskStatus.COMPLETED}>{t('dashboard.housekeepingDashboard.statusCompleted')}</MenuItem>
                <MenuItem value={HousekeepingTaskStatus.ON_HOLD}>{t('dashboard.housekeepingDashboard.statusOnHold')}</MenuItem>
                <MenuItem value={HousekeepingTaskStatus.CANCELLED}>{t('dashboard.housekeepingDashboard.statusCancelled')}</MenuItem>
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
                {t('dashboard.housekeepingDashboard.clearFilters')}
              </Button>
            </Box>
          )}

          {/* Show filtering info */}
          {isHousekeepingStaff() && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {t('dashboard.housekeepingDashboard.showingMyTasks')} (User ID: {currentUserId})
            </Alert>
          )}
          
          {filteredTasks.length === 0 ? (
            <Alert severity="info">
              {isHousekeepingStaff() 
                ? t('dashboard.housekeepingDashboard.noTasksAssigned')
                : tasks.length === 0 
                  ? t('dashboard.housekeepingDashboard.noTasksAvailable')
                  : t('dashboard.housekeepingDashboard.noTasksMatchFilter')}
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
                            label={translateStatus(task.status)} 
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
                          <Chip label={translateTaskType(task.taskType)} variant="outlined" size="small" />
                          <Chip label={translatePriority(task.priority)} color={getStatusColor(task.priority)} size="small" />
                          {task.roomNumber && (
                            <Chip label={`${t('dashboard.housekeepingDashboard.room')} ${task.roomNumber}`} variant="outlined" size="small" />
                          )}
                        </Box>
                        
                        {task.dueDate && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            {t('dashboard.housekeepingDashboard.dueLabel', { date: new Date(task.dueDate).toLocaleDateString() })}
                          </Typography>
                        )}
                        
                        {isManagementRole() && task.assignedUser && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            {t('dashboard.housekeepingDashboard.assignedToLabel', { name: `${task.assignedUser.firstName} ${task.assignedUser.lastName}` })}
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
                          {t('dashboard.housekeepingDashboard.updateStatus')}
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
                              {t('dashboard.housekeepingDashboard.assignTask')}
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
                        <TableCell>{t('dashboard.housekeepingDashboard.title')}</TableCell>
                        <TableCell>{t('dashboard.housekeepingDashboard.type')}</TableCell>
                        <TableCell>{t('dashboard.housekeepingDashboard.room')}</TableCell>
                        {isManagementRole() && <TableCell>{t('dashboard.housekeepingDashboard.assignedTo')}</TableCell>}
                        <TableCell>{t('dashboard.housekeepingDashboard.priority')}</TableCell>
                        <TableCell>{t('dashboard.housekeepingDashboard.status')}</TableCell>
                        <TableCell>{t('dashboard.housekeepingDashboard.dueDate')}</TableCell>
                        <TableCell>{t('dashboard.housekeepingDashboard.actions')}</TableCell>
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
                      <TableCell>{translateTaskType(task.taskType)}</TableCell>
                      <TableCell>{task.roomNumber || t('dashboard.housekeepingDashboard.na')}</TableCell>
                      {isManagementRole() && (
                        <TableCell>
                          {task.assignedUser?.firstName && task.assignedUser?.lastName 
                            ? `${task.assignedUser.firstName} ${task.assignedUser.lastName}`
                            : t('dashboard.housekeepingDashboard.unassigned')}
                        </TableCell>
                      )}
                      <TableCell>
                        <Chip 
                          label={translatePriority(task.priority)} 
                          color={getStatusColor(task.priority)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={translateStatus(task.status)} 
                          color={getStatusColor(task.status)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : t('dashboard.housekeepingDashboard.na')}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {/* Status Update Action */}
                          <Tooltip title={t('dashboard.housekeepingDashboard.updateStatus')}>
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
                            <Tooltip title={t('dashboard.housekeepingDashboard.assignTask')}>
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
                          <Tooltip title={t('dashboard.housekeepingDashboard.viewDetails')}>
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
                ? t('dashboard.housekeepingDashboard.taskDetails')
                : isHousekeepingStaff() 
                  ? t('dashboard.housekeepingDashboard.updateTaskStatus') 
                  : t('dashboard.housekeepingDashboard.taskDetailsAndStatus')
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
                        {t('dashboard.housekeepingDashboard.roomNumber')}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedTask.roomNumber || t('dashboard.housekeepingDashboard.na')}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                        {t('dashboard.housekeepingDashboard.taskType')}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {translateTaskType(selectedTask.taskType)}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                        {t('dashboard.housekeepingDashboard.currentStatus')}
                      </Typography>
                      <Chip 
                        label={translateStatus(selectedTask.status)}
                        size="small"
                        sx={{ 
                          fontWeight: 600,
                          width: 'fit-content',
                          backgroundColor: selectedTask.status.toLowerCase() === 'completed' ? COLORS.SUCCESS :
                                         selectedTask.status.toLowerCase() === 'in_progress' ? COLORS.BOOKED :
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
                  {t('dashboard.housekeepingDashboard.additionalInfo')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2.5}>
                  {selectedTask.description && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                          {t('dashboard.housekeepingDashboard.description')}
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
                          {t('dashboard.housekeepingDashboard.assignedTo')}
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
                          {t('dashboard.housekeepingDashboard.dueDate')}
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
                    {isHousekeepingStaff() ? t('dashboard.housekeepingDashboard.updateYourProgress') : t('dashboard.housekeepingDashboard.updateTaskStatusLabel')}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {/* Status Selection for Management */}
                  {isManagementRole() && (
                    <PremiumSelect
                      fullWidth
                      value=""
                      label={t('dashboard.housekeepingDashboard.changeStatusTo')}
                      onChange={(e) => {
                        if (e.target.value) {
                          handleUpdateStatus(e.target.value);
                        }
                      }}
                    >
                      {selectedTask.status.toLowerCase() !== 'pending' && (
                        <MenuItem value="PENDING">{t('dashboard.housekeepingDashboard.markAsPending')}</MenuItem>
                      )}
                      {selectedTask.status.toLowerCase() !== 'assigned' && selectedTask.assignedUser && (
                        <MenuItem value="ASSIGNED">{t('dashboard.housekeepingDashboard.markAsAssigned')}</MenuItem>
                      )}
                      {selectedTask.status.toLowerCase() !== 'in_progress' && (
                        <MenuItem value="IN_PROGRESS">{t('dashboard.housekeepingDashboard.markAsInProgress')}</MenuItem>
                      )}
                      {selectedTask.status.toLowerCase() !== 'completed' && (
                        <MenuItem value="COMPLETED">{t('dashboard.housekeepingDashboard.markAsCompleted')}</MenuItem>
                      )}
                      {selectedTask.status.toLowerCase() !== 'cancelled' && (
                        <MenuItem value="CANCELLED">{t('dashboard.housekeepingDashboard.cancelTask')}</MenuItem>
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
                    label={t('dashboard.housekeepingDashboard.notesOptional')}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={isHousekeepingStaff() 
                      ? t('dashboard.housekeepingDashboard.notesPlaceholderStaff')
                      : t('dashboard.housekeepingDashboard.notesPlaceholderAdmin')
                    }
                  />
                </Box>
              )}
              
              {/* Show existing notes in view-only mode */}
              {isViewOnlyMode && selectedTask.notes && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}>
                    {t('dashboard.housekeepingDashboard.notes')}
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
            {isViewOnlyMode ? t('dashboard.housekeepingDashboard.close') : isHousekeepingStaff() ? t('dashboard.housekeepingDashboard.cancel') : t('dashboard.housekeepingDashboard.close')}
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
                    backgroundColor: COLORS.BOOKED,
                    color: COLORS.WHITE,
                    fontWeight: 600,
                    px: 3,
                    '&:hover': {
                      backgroundColor: COLORS.INFO
                    }
                  }}
                >
                  {t('dashboard.housekeepingDashboard.startTask')}
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
                  {t('dashboard.housekeepingDashboard.completeTask')}
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
                  {t('dashboard.housekeepingDashboard.updateStatus')}
                </Button>
              )}
              {selectedTask.status.toLowerCase() === 'in_progress' && (
                <Button 
                  onClick={() => handleUpdateStatus('COMPLETED')} 
                  variant="contained" 
                  color="success"
                >
                  {t('dashboard.housekeepingDashboard.markComplete')}
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
              {t('dashboard.housekeepingDashboard.createNewTask')}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Basic Information */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}>
                {t('dashboard.housekeepingDashboard.basicInfo')}
              </Typography>
              <Divider sx={{ mb: 2.5 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <PremiumTextField
                  label={t('dashboard.housekeepingDashboard.taskTitle')}
                  value={newTask.title}
                  onChange={(e) => handleTaskFieldChange('title', e.target.value)}
                  fullWidth
                  required
                  placeholder={t('dashboard.housekeepingDashboard.taskTitlePlaceholder')}
                />
                
                <PremiumTextField
                  label={t('dashboard.housekeepingDashboard.descriptionLabel')}
                  value={newTask.description}
                  onChange={(e) => handleTaskFieldChange('description', e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  required
                  placeholder={t('dashboard.housekeepingDashboard.descriptionPlaceholder')}
                />
              </Box>
            </Box>
            
            {/* Task Classification */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}>
                {t('dashboard.housekeepingDashboard.taskClassification')}
              </Typography>
              <Divider sx={{ mb: 2.5 }} />
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <PremiumSelect
                    fullWidth
                    value={newTask.taskType}
                    label={t('dashboard.housekeepingDashboard.taskTypeLabel')}
                    onChange={(e) => handleTaskFieldChange('taskType', e.target.value)}
                  >
                    <MenuItem value={HousekeepingTaskType.ROOM_CLEANING}>{t('dashboard.housekeepingDashboard.roomCleaning')}</MenuItem>
                    <MenuItem value={HousekeepingTaskType.DEEP_CLEANING}>{t('dashboard.housekeepingDashboard.deepCleaning')}</MenuItem>
                    <MenuItem value={HousekeepingTaskType.LAUNDRY}>{t('dashboard.housekeepingDashboard.laundry')}</MenuItem>
                    <MenuItem value={HousekeepingTaskType.PUBLIC_AREA_CLEANING}>{t('dashboard.housekeepingDashboard.publicAreaCleaning')}</MenuItem>
                    <MenuItem value={HousekeepingTaskType.INVENTORY_CHECK}>{t('dashboard.housekeepingDashboard.inventoryCheck')}</MenuItem>
                    <MenuItem value={HousekeepingTaskType.MAINTENANCE_REQUEST}>{t('dashboard.housekeepingDashboard.maintenanceRequest')}</MenuItem>
                  </PremiumSelect>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <PremiumSelect
                    fullWidth
                    value={newTask.priority}
                    label={t('dashboard.housekeepingDashboard.priorityLabel')}
                    onChange={(e) => handleTaskFieldChange('priority', e.target.value)}
                  >
                    <MenuItem value={TaskPriority.LOW}>{t('dashboard.housekeepingDashboard.low')}</MenuItem>
                    <MenuItem value={TaskPriority.NORMAL}>{t('dashboard.housekeepingDashboard.normal')}</MenuItem>
                    <MenuItem value={TaskPriority.HIGH}>{t('dashboard.housekeepingDashboard.high')}</MenuItem>
                    <MenuItem value={TaskPriority.URGENT}>{t('dashboard.housekeepingDashboard.urgent')}</MenuItem>
                    <MenuItem value={TaskPriority.CRITICAL}>{t('dashboard.housekeepingDashboard.critical')}</MenuItem>
                  </PremiumSelect>
                </Grid>
              </Grid>
            </Box>
            
            {/* Location Details */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}>
                {t('dashboard.housekeepingDashboard.locationDetails')}
              </Typography>
              <Divider sx={{ mb: 2.5 }} />
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    label={t('dashboard.housekeepingDashboard.roomNumberLabel')}
                    value={newTask.roomNumber}
                    onChange={(e) => handleTaskFieldChange('roomNumber', e.target.value)}
                    fullWidth
                    required
                    placeholder={t('dashboard.housekeepingDashboard.roomNumberPlaceholder')}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    label={t('dashboard.housekeepingDashboard.floorNumber')}
                    type="number"
                    value={newTask.floorNumber || ''}
                    onChange={(e) => handleTaskFieldChange('floorNumber', e.target.value ? parseInt(e.target.value) : undefined)}
                    fullWidth
                    placeholder={t('dashboard.housekeepingDashboard.optional')}
                  />
                </Grid>
              </Grid>
            </Box>
            
            {/* Scheduling */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}>
                {t('dashboard.housekeepingDashboard.scheduling')}
              </Typography>
              <Divider sx={{ mb: 2.5 }} />
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    label={t('dashboard.housekeepingDashboard.estimatedDuration')}
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
                    label={t('dashboard.housekeepingDashboard.dueDateTime')}
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
                {t('dashboard.housekeepingDashboard.additionalInfo')}
              </Typography>
              <Divider sx={{ mb: 2.5 }} />
              <PremiumTextField
                label={t('dashboard.housekeepingDashboard.additionalNotes')}
                value={newTask.notes}
                onChange={(e) => handleTaskFieldChange('notes', e.target.value)}
                fullWidth
                multiline
                rows={3}
                placeholder={t('dashboard.housekeepingDashboard.additionalNotesPlaceholder')}
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
            {t('dashboard.housekeepingDashboard.cancel')}
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
            {t('dashboard.housekeepingDashboard.createTask')}
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
              {t('dashboard.housekeepingDashboard.assignTaskToStaff')}
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
              {t('dashboard.housekeepingDashboard.selectStaffMember')}
            </Typography>
            <PremiumSelect
              fullWidth
              value={selectedStaffId}
              label={t('dashboard.housekeepingDashboard.staffMember')}
              onChange={(e) => setSelectedStaffId(e.target.value)}
            >
              <MenuItem value="">
                <em>{t('dashboard.housekeepingDashboard.unassigned')}</em>
              </MenuItem>
              {availableStaff.length === 0 ? (
                <>
                  <MenuItem disabled>
                    <em>{t('dashboard.housekeepingDashboard.noStaffAvailable')}</em>
                  </MenuItem>
                  <MenuItem onClick={() => {
                    setAssignDialog(false);
                    setAddStaffDialog(true);
                  }}>
                    <Box sx={{ color: COLORS.SECONDARY, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonAddIcon fontSize="small" />
                      {t('dashboard.housekeepingDashboard.createNewStaffMember')}
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
            {t('dashboard.housekeepingDashboard.cancel')}
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
            {t('dashboard.housekeepingDashboard.assignTask')}
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
              {t('dashboard.housekeepingDashboard.addStaffMember')}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}>
                {t('dashboard.housekeepingDashboard.contactInfo')}
              </Typography>
              <Divider sx={{ mb: 2.5 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <PremiumTextField
                  label={t('dashboard.housekeepingDashboard.email')}
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => handleStaffFieldChange('email', e.target.value)}
                  fullWidth
                  required
                  placeholder="staff@example.com"
                />
                
                <PremiumTextField
                  label={t('dashboard.housekeepingDashboard.phoneNumber')}
                  value={newStaff.phone}
                  onChange={(e) => handleStaffFieldChange('phone', e.target.value)}
                  fullWidth
                  placeholder="+1 234 567 8900"
                />
              </Box>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}>
                {t('dashboard.housekeepingDashboard.personalDetails')}
              </Typography>
              <Divider sx={{ mb: 2.5 }} />
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    label={t('dashboard.housekeepingDashboard.firstName')}
                    value={newStaff.firstName}
                    onChange={(e) => handleStaffFieldChange('firstName', e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    label={t('dashboard.housekeepingDashboard.lastName')}
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
                {t('dashboard.housekeepingDashboard.employmentDetails')}
              </Typography>
              <Divider sx={{ mb: 2.5 }} />
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    label={t('dashboard.housekeepingDashboard.employeeId')}
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
                    label={t('dashboard.housekeepingDashboard.shiftType')}
                    onChange={(e) => handleStaffFieldChange('shiftType', e.target.value)}
                  >
                    <MenuItem value="DAY">{t('dashboard.housekeepingDashboard.dayShift')}</MenuItem>
                    <MenuItem value="NIGHT">{t('dashboard.housekeepingDashboard.nightShift')}</MenuItem>
                    <MenuItem value="ROTATING">{t('dashboard.housekeepingDashboard.rotatingShift')}</MenuItem>
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
            {t('dashboard.housekeepingDashboard.cancel')}
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
            {t('dashboard.housekeepingDashboard.createStaffMember')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HousekeepingDashboard;