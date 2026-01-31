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
  Toolbar,
  TablePagination
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
import { COLORS, addAlpha } from '../../theme/themeColors';
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
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
      // console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await staffApi.getStaffStats('HOUSEKEEPING');
      setStats(statsData);
    } catch (err) {
      // console.error('Error loading stats:', err);
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
      // console.error('Error updating task:', err);
    }
  };

  const handleStartTask = async (task: HousekeepingTask) => {
    try {
      await staffApi.startHousekeepingTask(task.id);
      await loadMyTasks();
      await loadStats();
    } catch (err) {
      setError('Failed to start task');
      // console.error('Error starting task:', err);
    }
  };

  const handleCompleteTask = async (task: HousekeepingTask, completionNotes?: string) => {
    try {
      await staffApi.completeHousekeepingTask(task.id, completionNotes);
      await loadMyTasks();
      await loadStats();
    } catch (err) {
      setError('Failed to complete task');
      // console.error('Error completing task:', err);
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

  // Elegant Mobile-optimized task card component
  const TaskCard: React.FC<{ task: HousekeepingTask }> = ({ task }) => (
    <Card 
      sx={{ 
        mb: 2, 
        cursor: 'pointer',
        boxShadow: `0 1px 4px ${addAlpha(COLORS.BLACK, 0.05)}`,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease',
        '&:hover': { 
          boxShadow: `0 4px 12px ${addAlpha(COLORS.BLACK, 0.08)}`,
          borderColor: 'primary.light',
        }
      }}
      onClick={() => openTaskDetails(task)}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
          }}>
            <RoomIcon sx={{ color: 'primary.main', fontSize: '1.1rem' }} />
            <Typography 
              variant="subtitle1" 
              component="div"
              sx={{ color: 'text.primary', fontWeight: 600 }}
            >
              Room {task.roomNumber}
            </Typography>
          </Box>
          <Chip
            label={task.status}
            color={getStatusChipColor(task.status)}
            size="small"
            sx={{
              fontWeight: 600,
              boxShadow: `0 2px 6px ${addAlpha(COLORS.BLACK, 0.1)}`
            }}
          />
        </Box>
        
        <Typography 
          variant="body2" 
          color="text.primary"
          sx={{ 
            mb: 2,
            fontWeight: 500,
            lineHeight: 1.5
          }}
        >
          {task.title || task.description}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={task.taskType}
              color={getTaskTypeColor(task.taskType)}
              size="small"
              sx={{
                fontWeight: 600,
                boxShadow: `0 2px 6px ${addAlpha(COLORS.BLACK, 0.1)}`
              }}
            />
            <Chip
              label={task.priority}
              color={task.priority === 'HIGH' ? 'error' : task.priority === 'NORMAL' ? 'warning' : 'default'}
              size="small"
              icon={<FlagIcon />}
              sx={{
                fontWeight: 600,
                boxShadow: `0 2px 6px ${addAlpha(COLORS.BLACK, 0.1)}`
              }}
            />
          </Box>
          {task.dueDate && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5,
              backgroundColor: 'action.hover',
              padding: '4px 8px',
              borderRadius: 1
            }}>
              <AccessTimeIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {new Date(task.dueDate).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {canStartTask(task) && (
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<PlayArrowIcon />}
              onClick={(e) => {
                e.stopPropagation();
                handleStartTask(task);
              }}
              sx={{ 
                minWidth: 'auto',
                borderWidth: 1.5,
                fontWeight: 500,
                '&:hover': {
                  borderWidth: 1.5,
                  backgroundColor: 'primary.main',
                  color: 'white',
                }
              }}
            >
              Start
            </Button>
          )}
          {canCompleteTask(task) && (
            <Button
              variant="outlined"
              color="success"
              size="small"
              startIcon={<CheckCircleIcon />}
              onClick={(e) => {
                e.stopPropagation();
                handleCompleteTask(task);
              }}
              sx={{ 
                minWidth: 'auto',
                borderWidth: 1.5,
                fontWeight: 500,
                '&:hover': {
                  borderWidth: 1.5,
                  backgroundColor: 'success.main',
                  color: 'white',
                }
              }}
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
              sx={{ 
                minWidth: 'auto',
                borderWidth: 2,
                fontWeight: 600,
                '&:hover': {
                  borderWidth: 2,
                  backgroundColor: 'action.hover',
                }
              }}
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
      <Box sx={{ py: { xs: 2, md: 4 } }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h1" 
          gutterBottom 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            mb: { xs: 3, md: 4 },
            fontWeight: 600,
            color: 'text.primary',
            letterSpacing: '-0.5px'
          }}
        >
          <CleaningIcon 
            sx={{ 
              color: 'primary.main',
              fontSize: { xs: '1.75rem', md: '2rem' }
            }} 
          />
          My Housekeeping Tasks
        </Typography>

        {/* Elegant Premium Stats Cards */}
        {stats && (
          <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
            <Grid item xs={6} sm={6} md={3}>
              <Card 
                sx={{ 
                  height: '100%',
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: `0 2px 8px ${addAlpha(COLORS.BLACK, 0.04)}`,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: `0 4px 16px ${addAlpha(COLORS.BLACK, 0.08)}`,
                    borderColor: 'primary.main',
                  }
                }}
              >
                <CardContent sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  gap: { xs: 1, sm: 1.5 },
                  p: { xs: 2, sm: 3 },
                  '&:last-child': { pb: { xs: 2, sm: 3 } }
                }}>
                  <AssignmentIcon 
                    sx={{ 
                      color: 'primary.main',
                      fontSize: { xs: '1.75rem', md: '2.25rem' },
                      opacity: 0.9
                    }} 
                  />
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography 
                      sx={{ 
                        color: 'text.secondary',
                        fontWeight: 500,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        mb: 0.5,
                        letterSpacing: '0.5px'
                      }}
                    >
                      Total Tasks
                    </Typography>
                    <Typography 
                      variant={isMobile ? "h5" : "h4"}
                      sx={{ 
                        color: 'text.primary',
                        fontWeight: 600
                      }}
                    >
                      {stats.totalTasks || 0}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Card 
                sx={{ 
                  height: '100%',
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: `0 2px 8px ${addAlpha(COLORS.BLACK, 0.04)}`,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: `0 4px 16px ${addAlpha(COLORS.BLACK, 0.08)}`,
                    borderColor: 'warning.main',
                  }
                }}
              >
                <CardContent sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  gap: { xs: 1, sm: 1.5 },
                  p: { xs: 2, sm: 3 },
                  '&:last-child': { pb: { xs: 2, sm: 3 } }
                }}>
                  <ScheduleIcon 
                    sx={{ 
                      color: 'warning.main',
                      fontSize: { xs: '1.75rem', md: '2.25rem' },
                      opacity: 0.9
                    }} 
                  />
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography 
                      sx={{ 
                        color: 'text.secondary',
                        fontWeight: 500,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        mb: 0.5,
                        letterSpacing: '0.5px'
                      }}
                    >
                      Pending
                    </Typography>
                    <Typography 
                      variant={isMobile ? "h5" : "h4"}
                      sx={{ 
                        color: 'text.primary',
                        fontWeight: 600
                      }}
                    >
                      {stats.pendingTasks || 0}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Card 
                sx={{ 
                  height: '100%',
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: `0 2px 8px ${addAlpha(COLORS.BLACK, 0.04)}`,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: `0 4px 16px ${addAlpha(COLORS.BLACK, 0.08)}`,
                    borderColor: 'info.main',
                  }
                }}
              >
                <CardContent sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  gap: { xs: 1, sm: 1.5 },
                  p: { xs: 2, sm: 3 },
                  '&:last-child': { pb: { xs: 2, sm: 3 } }
                }}>
                  <PlayArrowIcon 
                    sx={{ 
                      color: 'info.main',
                      fontSize: { xs: '1.75rem', md: '2.25rem' },
                      opacity: 0.9
                    }} 
                  />
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography 
                      sx={{ 
                        color: 'text.secondary',
                        fontWeight: 500,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        mb: 0.5,
                        letterSpacing: '0.5px'
                      }}
                    >
                      In Progress
                    </Typography>
                    <Typography 
                      variant={isMobile ? "h5" : "h4"}
                      sx={{ 
                        color: 'text.primary',
                        fontWeight: 600
                      }}
                    >
                      {stats.inProgressTasks || 0}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Card 
                sx={{ 
                  height: '100%',
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: `0 2px 8px ${addAlpha(COLORS.BLACK, 0.04)}`,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: `0 4px 16px ${addAlpha(COLORS.BLACK, 0.08)}`,
                    borderColor: 'success.main',
                  }
                }}
              >
                <CardContent sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  gap: { xs: 1, sm: 1.5 },
                  p: { xs: 2, sm: 3 },
                  '&:last-child': { pb: { xs: 2, sm: 3 } }
                }}>
                  <CheckCircleIcon 
                    sx={{ 
                      color: 'success.main',
                      fontSize: { xs: '1.75rem', md: '2.25rem' },
                      opacity: 0.9
                    }} 
                  />
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography 
                      sx={{ 
                        color: 'text.secondary',
                        fontWeight: 500,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        mb: 0.5,
                        letterSpacing: '0.5px'
                      }}
                    >
                      Completed
                    </Typography>
                    <Typography 
                      variant={isMobile ? "h5" : "h4"}
                      sx={{ 
                        color: 'text.primary',
                        fontWeight: 600
                      }}
                    >
                      {stats.completedTasks || 0}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              boxShadow: `0 4px 12px ${addAlpha(COLORS.ERROR, 0.15)}`,
              borderRadius: 2
            }} 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Elegant Tasks Section */}
        <Card 
          sx={{ 
            boxShadow: `0 2px 8px ${addAlpha(COLORS.BLACK, 0.04)}`,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 0 }
            }}>
              <Typography 
                variant="h6"
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                  letterSpacing: '-0.3px'
                }}
              >
                My Tasks ({tasks.length})
              </Typography>
              <Button 
                onClick={loadMyTasks} 
                disabled={loading}
                size={isMobile ? "medium" : "large"}
                startIcon={<RefreshIcon />}
                variant="outlined"
                sx={{
                  borderWidth: 1.5,
                  fontWeight: 500,
                  '&:hover': {
                    borderWidth: 1.5,
                    backgroundColor: 'action.hover',
                  }
                }}
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
                    {tasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                    <TablePagination
                      component="div"
                      count={tasks.length}
                      page={page}
                      onPageChange={(_, newPage) => setPage(newPage)}
                      rowsPerPage={rowsPerPage}
                      onRowsPerPageChange={(event) => {
                        setRowsPerPage(parseInt(event.target.value, 10));
                        setPage(0);
                      }}
                      rowsPerPageOptions={[5, 10, 25]}
                    />
                  </Box>
                ) : (
                  /* Elegant Premium Desktop Layout - Table */
                  <TableContainer 
                    component={Paper}
                    sx={{
                      boxShadow: 'none',
                      borderRadius: 0,
                      overflow: 'hidden',
                      border: 'none'
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow
                          sx={{
                            backgroundColor: 'transparent',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            '& .MuiTableCell-head': {
                              color: COLORS.SLATE_800,
                              fontWeight: 700,
                              fontSize: '0.6875rem',
                              letterSpacing: '0.5px',
                              textTransform: 'uppercase',
                              border: 'none',
                              padding: '12px 16px',
                              backgroundColor: 'transparent',
                            }
                          }}
                        >
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
                        {tasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((task, index) => (
                          <TableRow 
                            key={task.id}
                            sx={{
                              transition: 'all 0.15s ease',
                              '&:hover': {
                                backgroundColor: 'action.hover',
                              },
                              '&:last-child .MuiTableCell-root': {
                                borderBottom: 'none',
                              },
                              '& .MuiTableCell-root': {
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                padding: '20px 16px',
                              }
                            }}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <RoomIcon 
                                  sx={{ 
                                    color: 'text.secondary',
                                    fontSize: '1.1rem'
                                  }} 
                                />
                                <Typography 
                                  variant="body2"
                                  sx={{ fontWeight: 600, color: 'text.primary' }}
                                >
                                  {task.roomNumber}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={task.taskType}
                                color={getTaskTypeColor(task.taskType)}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontWeight: 500,
                                  borderWidth: 1.5,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography 
                                variant="body2"
                                sx={{ 
                                  fontWeight: 400,
                                  color: 'text.primary',
                                  lineHeight: 1.5
                                }}
                              >
                                {task.title || task.description}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={task.priority}
                                color={task.priority === 'HIGH' ? 'error' : task.priority === 'NORMAL' ? 'warning' : 'default'}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontWeight: 500,
                                  borderWidth: 1.5,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={task.status}
                                color={getStatusChipColor(task.status)}
                                size="small"
                                variant="filled"
                                sx={{
                                  fontWeight: 500,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AccessTimeIcon 
                                  sx={{ 
                                    color: 'text.secondary',
                                    fontSize: '1rem'
                                  }} 
                                />
                                <Typography 
                                  variant="body2"
                                  sx={{ color: 'text.secondary', fontWeight: 400 }}
                                >
                                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                {canStartTask(task) && (
                                  <IconButton
                                    size="small"
                                    onClick={() => handleStartTask(task)}
                                    title="Start Task"
                                    sx={{
                                      color: 'primary.main',
                                      border: '1px solid',
                                      borderColor: 'divider',
                                      '&:hover': {
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                        borderColor: 'primary.main',
                                      }
                                    }}
                                  >
                                    <PlayArrowIcon fontSize="small" />
                                  </IconButton>
                                )}
                                {canCompleteTask(task) && (
                                  <IconButton
                                    size="small"
                                    onClick={() => handleCompleteTask(task)}
                                    title="Complete Task"
                                    sx={{
                                      color: 'success.main',
                                      border: '1px solid',
                                      borderColor: 'divider',
                                      '&:hover': {
                                        backgroundColor: 'success.main',
                                        color: 'white',
                                        borderColor: 'success.main',
                                      }
                                    }}
                                  >
                                    <CheckCircleIcon fontSize="small" />
                                  </IconButton>
                                )}
                                {canUpdateStatus(task) && (
                                  <IconButton
                                    size="small"
                                    onClick={() => openStatusDialog(task)}
                                    title="Update Status"
                                    sx={{
                                      color: 'text.secondary',
                                      border: '1px solid',
                                      borderColor: 'divider',
                                      '&:hover': {
                                        backgroundColor: 'action.hover',
                                        color: 'text.primary',
                                      }
                                    }}
                                  >
                                    <InfoIcon fontSize="small" />
                                  </IconButton>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <TablePagination
                      component="div"
                      count={tasks.length}
                      page={page}
                      onPageChange={(_, newPage) => setPage(newPage)}
                      rowsPerPage={rowsPerPage}
                      onRowsPerPageChange={(event) => {
                        setRowsPerPage(parseInt(event.target.value, 10));
                        setPage(0);
                      }}
                      rowsPerPageOptions={[5, 10, 25, 50]}
                    />
                  </TableContainer>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Elegant Floating Refresh Button for Mobile */}
        {isMobile && (
          <Fab
            color="primary"
            aria-label="refresh"
            sx={{ 
              position: 'fixed', 
              bottom: 16, 
              right: 16,
              zIndex: 1000,
              boxShadow: `0 4px 12px ${addAlpha(COLORS.BLACK, 0.15)}`,
              '&:hover': {
                boxShadow: `0 6px 20px ${addAlpha(COLORS.BLACK, 0.2)}`,
              }
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
            <Button 
              onClick={() => setStatusDialog(false)} 
              size={isMobile ? "large" : "medium"}
              sx={{
                fontWeight: 500,
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleStatusUpdate} 
              variant="contained"
              size={isMobile ? "large" : "medium"}
              sx={{
                fontWeight: 500,
              }}
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
