import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Chip,
  Alert,
  Button,
  ButtonGroup,
  CircularProgress,
  CardContent,
  CardHeader,
  IconButton
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  AccessTime as ClockIcon,
  People as UsersIcon
} from '@mui/icons-material';
import axiosInstance from '../utils/axiosConfig';

interface StaffSchedule {
  id: number;
  staffId: number;
  staffName: string;
  staffEmail: string;
  hotelId: number;
  hotelName: string;
  scheduleDate: string;
  startTime: string;
  endTime: string;
  shiftType: string;
  department: string;
  notes?: string;
  status: string;
}

interface ScheduleStats {
  totalSchedules: number;
  scheduledCount: number;
  confirmedCount: number;
  completedCount: number;
  cancelledCount: number;
  noShowCount: number;
  departmentCounts: Record<string, number>;
}

const StaffScheduleDashboard: React.FC = () => {
  const [schedules, setSchedules] = useState<StaffSchedule[]>([]);
  const [stats, setStats] = useState<ScheduleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  useEffect(() => {
    fetchScheduleData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, viewMode]);

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      
      const startDate = getStartDate();
      const endDate = getEndDate();
      
      const [schedulesResponse, statsResponse] = await Promise.all([
        axiosInstance.get(`/api/staff-schedules?startDate=${startDate}&endDate=${endDate}`),
        axiosInstance.get(`/api/staff-schedules/stats?startDate=${startDate}&endDate=${endDate}`)
      ]);
      
      setSchedules(schedulesResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching schedule data:', error);
      setError('Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = () => {
    if (viewMode === 'week') {
      const start = new Date(currentDate);
      start.setDate(currentDate.getDate() - currentDate.getDay());
      return start.toISOString().split('T')[0];
    } else {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      return start.toISOString().split('T')[0];
    }
  };

  const getEndDate = () => {
    if (viewMode === 'week') {
      const end = new Date(currentDate);
      end.setDate(currentDate.getDate() - currentDate.getDay() + 6);
      return end.toISOString().split('T')[0];
    } else {
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      return end.toISOString().split('T')[0];
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const getDateRange = () => {
    const start = getStartDate();
    const end = getEndDate();
    return `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`;
  };

  const getDaysInRange = () => {
    const days = [];
    const start = new Date(getStartDate());
    const end = new Date(getEndDate());
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      days.push(new Date(date));
    }
    
    return days;
  };

  const getSchedulesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return schedules.filter(schedule => schedule.scheduleDate === dateStr);
  };

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'default';
      case 'CONFIRMED': return 'primary';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      case 'NO_SHOW': return 'warning';
      default: return 'default';
    }
  };

  const getDepartmentChipColor = (department: string) => {
    const colors: Record<string, 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'> = {
      'FRONTDESK': 'primary',
      'HOUSEKEEPING': 'success',
      'MAINTENANCE': 'warning',
      'SECURITY': 'error',
      'RESTAURANT': 'info',
      'CONCIERGE': 'secondary',
      'MANAGEMENT': 'secondary'
    };
    return colors[department] || 'secondary';
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading schedule dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}
      
      {/* Header */}
      <Paper sx={{ mb: 4 }}>
        <CardHeader
          avatar={<CalendarIcon />}
          title="Staff Schedule Dashboard"
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ButtonGroup variant="outlined">
                <Button 
                  variant={viewMode === 'week' ? 'contained' : 'outlined'}
                  onClick={() => setViewMode('week')}
                >
                  Week
                </Button>
                <Button 
                  variant={viewMode === 'month' ? 'contained' : 'outlined'}
                  onClick={() => setViewMode('month')}
                >
                  Month
                </Button>
              </ButtonGroup>
              <ButtonGroup variant="outlined">
                <IconButton onClick={() => navigateDate('prev')}>
                  <ChevronLeft />
                </IconButton>
                <IconButton onClick={() => navigateDate('next')}>
                  <ChevronRight />
                </IconButton>
              </ButtonGroup>
            </Box>
          }
        />
        <CardContent>
          <Typography variant="h6" textAlign="center">
            {getDateRange()}
          </Typography>
        </CardContent>
      </Paper>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {stats.totalSchedules}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Schedules
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                {stats.scheduledCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Scheduled
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {stats.confirmedCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Confirmed
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="success.main">
                {stats.completedCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Completed
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="error.main">
                {stats.cancelledCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cancelled
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="warning.main">
                {stats.noShowCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                No Show
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Calendar Grid */}
      <Paper>
        <CardContent>
          <Grid container spacing={2}>
            {getDaysInRange().map((date, index) => {
              const daySchedules = getSchedulesForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <Grid 
                  item 
                  key={index} 
                  xs={12}
                  md={viewMode === 'week' ? 12/7 : 3}
                >
                  <Paper 
                    elevation={isToday ? 4 : 1}
                    sx={{ 
                      height: '100%',
                      border: isToday ? 2 : 0,
                      borderColor: 'primary.main'
                    }}
                  >
                    <CardHeader
                      title={
                        <Box textAlign="center">
                          <Typography variant="body2" fontWeight="bold">
                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </Typography>
                          <Typography variant="h6">
                            {date.getDate()}
                          </Typography>
                        </Box>
                      }
                      sx={{ 
                        bgcolor: isToday ? 'primary.main' : 'grey.50',
                        color: isToday ? 'primary.contrastText' : 'text.primary'
                      }}
                    />
                    <CardContent sx={{ p: 2, minHeight: 200 }}>
                      {daySchedules.length === 0 ? (
                        <Box textAlign="center" sx={{ mt: 3 }}>
                          <UsersIcon sx={{ fontSize: 24, mb: 1, color: 'text.disabled' }} />
                          <Typography variant="caption" color="text.secondary">
                            No schedules
                          </Typography>
                        </Box>
                      ) : (
                        <Box>
                          {daySchedules.map(schedule => (
                            <Paper 
                              key={schedule.id} 
                              elevation={0}
                              sx={{ mb: 2, p: 2, bgcolor: 'grey.50' }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Chip 
                                  label={schedule.department.replace('_', ' ')}
                                  color={getDepartmentChipColor(schedule.department)}
                                  size="small"
                                />
                                <Chip 
                                  label={schedule.status}
                                  color={getStatusChipColor(schedule.status)}
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                              <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                                {schedule.staffName}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <ClockIcon sx={{ fontSize: 12, mr: 0.5, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {schedule.shiftType.replace('_', ' ')}
                              </Typography>
                              {schedule.notes && (
                                <Typography 
                                  variant="caption" 
                                  color="text.secondary" 
                                  sx={{ mt: 1, display: 'block' }}
                                >
                                  {schedule.notes.length > 30 
                                    ? `${schedule.notes.substring(0, 30)}...` 
                                    : schedule.notes
                                  }
                                </Typography>
                              )}
                            </Paper>
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Paper>

      {/* Department Summary */}
      {stats && Object.keys(stats.departmentCounts).length > 0 && (
        <Paper sx={{ mt: 4 }}>
          <CardHeader title="Department Distribution" />
          <CardContent>
            <Grid container spacing={2}>
              {Object.entries(stats.departmentCounts).map(([department, count]) => (
                <Grid item xs={12} sm={6} md={3} key={department}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip 
                      label={department.replace('_', ' ')}
                      color={getDepartmentChipColor(department)}
                      size="small"
                    />
                    <Typography variant="h6" fontWeight="bold">
                      {count}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Paper>
      )}
    </Container>
  );
};

export default StaffScheduleDashboard;
