import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  CleaningServices,
  Build,
  Dashboard,
  People,
  TrendingUp
} from '@mui/icons-material';
import HousekeepingDashboard from '../operations/HousekeepingDashboard';
import MaintenanceDashboard from '../operations/MaintenanceDashboard';
import StaffDashboard from '../operations/StaffDashboard';
import TokenManager from '../../utils/tokenManager';
import { useTenant } from '../../contexts/TenantContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

interface OperationsStats {
  housekeeping: {
    totalTasks: number;
    pendingTasks: number;
    activeTasks: number;
    completedTasks: number;
    activeStaff: number;
    averageTaskTime: number;
  };
  maintenance: {
    totalTasks: number;
    pendingTasks: number;
    activeTasks: number;
    completedTasks: number;
    activeStaff: number;
    totalCost: number;
  };
}

interface StaffPerformance {
  id: number;
  name: string;
  role: string;
  tasksCompleted: number;
  averageRating: number;
  efficiency: number;
}

interface RecentActivity {
  id: number;
  type: 'housekeeping' | 'maintenance';
  action: string;
  description: string;
  timestamp: string;
  priority: string;
}

const OperationsSupervisorDashboard: React.FC = () => {
  const { tenant } = useTenant();
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState<OperationsStats | null>(null);
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOperationsStats = useCallback(async () => {
    try {
      // Load housekeeping tasks
      const housekeepingResponse = await fetch(`${API_BASE_URL}/api/housekeeping/tasks`, {
        headers: {
          ...TokenManager.getAuthHeaders(),
          'X-Tenant-ID': tenant?.id || ''
        }
      });
      
      // Load maintenance tasks  
      const maintenanceResponse = await fetch(`${API_BASE_URL}/api/maintenance/tasks`, {
        headers: {
          ...TokenManager.getAuthHeaders(),
          'X-Tenant-ID': tenant?.id || ''
        }
      });

      let housekeepingTasks = [];
      let allMaintenanceTasks = [];

      if (housekeepingResponse.ok) {
        try {
          housekeepingTasks = await housekeepingResponse.json();
        } catch (jsonError) {
          console.error('Failed to parse housekeeping response JSON:', jsonError);
          housekeepingTasks = [];
        }
      }

      if (maintenanceResponse.ok) {
        try {
          allMaintenanceTasks = await maintenanceResponse.json();
        } catch (jsonError) {
          console.error('Failed to parse maintenance response JSON:', jsonError);
          allMaintenanceTasks = [];
        }
      }
      
      // Use maintenance tasks from tenant context (already filtered by tenant via headers)
      const maintenanceTasks = allMaintenanceTasks;

      const housekeepingStats = {
        totalTasks: housekeepingTasks.length,
        pendingTasks: housekeepingTasks.filter((t: any) => t.status === 'PENDING').length,
        activeTasks: housekeepingTasks.filter((t: any) => ['ASSIGNED', 'IN_PROGRESS'].includes(t.status)).length,
        completedTasks: housekeepingTasks.filter((t: any) => t.status === 'COMPLETED').length,
        activeStaff: 2, // This could be calculated from staff API
        averageTaskTime: 45
      };

      const maintenanceStats = {
        totalTasks: maintenanceTasks.length,
        pendingTasks: maintenanceTasks.filter((t: any) => t.status === 'OPEN').length,
        activeTasks: maintenanceTasks.filter((t: any) => ['ASSIGNED', 'IN_PROGRESS'].includes(t.status)).length,
        completedTasks: maintenanceTasks.filter((t: any) => t.status === 'COMPLETED').length,
        activeStaff: 1,
        totalCost: maintenanceTasks.reduce((sum: number, task: any) => 
          sum + (task.actualCost || task.estimatedCost || 0), 0
        )
      };

      setStats({
        housekeeping: housekeepingStats,
        maintenance: maintenanceStats
      });
    } catch (err) {
      console.error('Failed to load operations stats:', err);
    }
  }, [tenant?.id]);

  const loadStaffPerformance = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/housekeeping/staff`, {
        headers: {
          ...TokenManager.getAuthHeaders(),
          'X-Tenant-ID': tenant?.id || ''
        }
      });

      if (response.ok) {
        const staffData = await response.json();
        const performanceData = staffData.map((member: any, index: number) => ({
          id: member.id,
          name: `${member.firstName || member.user?.firstName || ''} ${member.lastName || member.user?.lastName || ''}`.trim(),
          role: member.role || 'Housekeeping',
          tasksCompleted: Math.floor(Math.random() * 10) + 5, // This would come from actual task completion data
          averageRating: parseFloat((4.2 + Math.random() * 0.8).toFixed(1)),
          efficiency: Math.floor(Math.random() * 20) + 80
        }));
        
        setStaffPerformance(performanceData);
      }
    } catch (err) {
      console.error('Failed to load staff performance:', err);
    }
  }, [tenant?.id]);

  const loadRecentActivity = useCallback(async () => {
    try {
      // Get recent tasks from both housekeeping and maintenance
      const [housekeepingResponse, maintenanceResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/housekeeping/tasks`, {
          headers: {
            ...TokenManager.getAuthHeaders(),
            'X-Tenant-ID': tenant?.id || ''
          }
        }),
        fetch(`${API_BASE_URL}/api/maintenance/tasks`, {
          headers: {
            ...TokenManager.getAuthHeaders(),
            'X-Tenant-ID': tenant?.id || ''
          }
        })
      ]);

      let housekeepingTasks = [];
      let allMaintenanceTasks = [];

      if (housekeepingResponse.ok) {
        try {
          housekeepingTasks = await housekeepingResponse.json();
        } catch (jsonError) {
          console.error('Failed to parse housekeeping response JSON:', jsonError);
          housekeepingTasks = [];
        }
      }

      if (maintenanceResponse.ok) {
        try {
          allMaintenanceTasks = await maintenanceResponse.json();
        } catch (jsonError) {
          console.error('Failed to parse maintenance response JSON:', jsonError);
          allMaintenanceTasks = [];
        }
      }
      
      // Use maintenance tasks from tenant context (already filtered by tenant via headers)
      const maintenanceTasks = allMaintenanceTasks;

      // Create activity feed from recent tasks
      const activities = [];
      
      // Add recent housekeeping activities
      const recentHousekeeping = housekeepingTasks
        .filter((task: any) => task.status === 'COMPLETED')
        .slice(0, 3)
        .map((task: any) => ({
          id: `hk-${task.id}`,
          type: 'housekeeping' as const,
          action: 'Task Completed',
          description: `${task.taskType} completed for Room ${task.room?.roomNumber || 'Unknown'}`,
          timestamp: task.completedAt || task.createdAt,
          priority: task.priority
        }));

      // Add recent maintenance activities
      const recentMaintenance = maintenanceTasks
        .filter((task: any) => ['COMPLETED', 'IN_PROGRESS'].includes(task.status))
        .slice(0, 3)
        .map((task: any) => ({
          id: `mt-${task.id}`,
          type: 'maintenance' as const,
          action: task.status === 'COMPLETED' ? 'Task Completed' : 'Task In Progress',
          description: `${task.title} - ${task.room ? `Room ${task.room.roomNumber}` : task.location}`,
          timestamp: task.status === 'COMPLETED' ? task.completedAt : task.startedAt || task.createdAt,
          priority: task.priority
        }));

      activities.push(...recentHousekeeping, ...recentMaintenance);
      
      // Sort by timestamp and take the most recent
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setRecentActivity(activities.slice(0, 6));
    } catch (err) {
      console.error('Failed to load recent activity:', err);
    }
  }, [tenant?.id]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use tenant ID instead of mock hotel data
      if (!tenant?.id) {
        setError('No tenant context available');
        return;
      }
      
      // Load real data from APIs
      await Promise.all([
        loadOperationsStats(),
        loadStaffPerformance(),
        loadRecentActivity()
      ]);
      
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [tenant?.id, loadOperationsStats, loadStaffPerformance, loadRecentActivity]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

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

  const getCompletionRate = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
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
            label="Overview" 
            icon={<Dashboard />}
            iconPosition="start"
          />
          <Tab 
            label="Housekeeping" 
            icon={<CleaningServices />}
            iconPosition="start"
          />
          <Tab 
            label="Maintenance" 
            icon={<Build />}
            iconPosition="start"
          />
          <Tab 
            label="Staff" 
            icon={<People />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && stats && (
        <Box>
          {/* Statistics Overview */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CleaningServices sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Housekeeping Overview</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Total Tasks
                      </Typography>
                      <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                        {stats.housekeeping.totalTasks}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Completion Rate
                      </Typography>
                      <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                        {getCompletionRate(stats.housekeeping.completedTasks, stats.housekeeping.totalTasks)}%
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Active Staff
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                        {stats.housekeeping.activeStaff}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Avg. Task Time
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                        {stats.housekeeping.averageTaskTime}min
                      </Typography>
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Task Progress
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={getCompletionRate(stats.housekeeping.completedTasks, stats.housekeeping.totalTasks)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Build sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Maintenance Overview</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Total Tasks
                      </Typography>
                      <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                        {stats.maintenance.totalTasks}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Completion Rate
                      </Typography>
                      <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                        {getCompletionRate(stats.maintenance.completedTasks, stats.maintenance.totalTasks)}%
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Active Staff
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                        {stats.maintenance.activeStaff}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Total Cost
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                        ${stats.maintenance.totalCost.toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Task Progress
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={getCompletionRate(stats.maintenance.completedTasks, stats.maintenance.totalTasks)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* Staff Performance */}
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <People sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Staff Performance</Typography>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Staff Member</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell align="center">Tasks Completed</TableCell>
                          <TableCell align="center">Avg. Rating</TableCell>
                          <TableCell align="center">Efficiency</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {staffPerformance.map((staff) => (
                          <TableRow key={staff.id}>
                            <TableCell>{staff.name}</TableCell>
                            <TableCell>
                              <Chip 
                                label={staff.role}
                                size="small"
                                color={staff.role === 'Housekeeping' ? 'primary' : 'secondary'}
                              />
                            </TableCell>
                            <TableCell align="center">{staff.tasksCompleted}</TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                ⭐ {staff.averageRating.toFixed(1)}
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                {staff.efficiency}%
                                <LinearProgress 
                                  variant="determinate" 
                                  value={staff.efficiency}
                                  sx={{ width: 60, height: 6, borderRadius: 3 }}
                                />
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12} lg={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Recent Activity</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {recentActivity.map((activity) => (
                      <Box key={activity.id} sx={{ borderLeft: 4, borderColor: 'primary.main', pl: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          {activity.type === 'housekeeping' ? (
                            <CleaningServices sx={{ fontSize: '1rem' }} />
                          ) : (
                            <Build sx={{ fontSize: '1rem' }} />
                          )}
                          <Typography variant="body2" fontWeight="medium">
                            {activity.action}
                          </Typography>
                          <Chip 
                            label={activity.priority}
                            size="small"
                            color={getPriorityColor(activity.priority) as any}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {activity.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {activeTab === 1 && <HousekeepingDashboard />}
      {activeTab === 2 && <MaintenanceDashboard />}
      {activeTab === 3 && <StaffDashboard />}
    </Box>
  );
};

export default OperationsSupervisorDashboard;
