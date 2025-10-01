import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';

// Interface definitions
interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    loadAverage: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  database: {
    connections: number;
    queries: number;
    responseTime: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  databaseConnections: number;
  databaseSize: number;
  avgQueryTime: number;
  slowQueries: number;
  connectionPoolSize: number;
}

interface AppHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  version: string;  
  environment: string;
  services: {
    name: string;
    status: 'online' | 'offline' | 'degraded';
    responseTime: number;
  }[];
}

interface UserActivity {
  totalUsers: number;
  activeUsers: number;
  newRegistrations: number;
  loginAttempts: number;
  failedLogins: number;
  sessionsActive: number;
}

interface APIMetrics {
  totalRequests: number;
  successfulRequests: number;
  errorRequests: number;
  errorRate: number;
  averageResponseTime: number;
  rateLimitHits: number;
  peakRequestsPerSecond: number;
  topEndpoints: {
    path: string;
    method: string;
    requests: number;
    avgResponseTime: number;
  }[];
  slowestEndpoints: {
    endpoint: string;
    responseTime: number;
    requests: number;
  }[];
  errorLogs: {
    timestamp: string;
    level: string;
    message: string;
    endpoint: string;
  }[];
}

interface ProcessMonitoringDashboardProps {
  hotelId: string;
}

const ProcessMonitoringDashboard: React.FC<ProcessMonitoringDashboardProps> = ({ hotelId }) => {
  const { themeMode } = useTheme();
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [appHealth, setAppHealth] = useState<AppHealth | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity | null>(null);
  const [apiMetrics, setAPIMetrics] = useState<APIMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [currentTab, setCurrentTab] = useState('system');

  // Utility functions
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      case 'online': return 'success';
      case 'offline': return 'error';
      case 'degraded': return 'warning';
      default: return 'default';
    }
  };

  // Mock data generation
  const generateMockData = () => {
    setLoading(true);
    
    setTimeout(() => {
      // Generate system metrics
      setSystemMetrics(prev => ({
        cpu: {
          usage: Math.floor(Math.random() * 80) + 10,
          cores: 8,
          loadAverage: [1.2, 1.5, 1.8]
        },
        memory: {
          total: 16384,
          used: Math.floor(Math.random() * 8000) + 4000,
          free: 0,
          usage: 0
        },
        disk: {
          total: 512000,
          used: Math.floor(Math.random() * 200000) + 100000,
          free: 0,
          usage: 0
        },
        database: {
          connections: Math.floor(Math.random() * 50) + 10,
          queries: Math.floor(Math.random() * 1000) + 500,
          responseTime: Math.floor(Math.random() * 50) + 10,
          status: Math.random() > 0.9 ? 'warning' : 'healthy'
        },
        databaseConnections: Math.floor(Math.random() * 100) + 20,
        databaseSize: Math.floor(Math.random() * 10000) + 5000,
        avgQueryTime: Math.floor(Math.random() * 100) + 10,
        slowQueries: Math.floor(Math.random() * 10),
        connectionPoolSize: 50
      }));

      // Update memory and disk calculations
      setSystemMetrics(prev => prev ? ({
        ...prev,
        memory: {
          ...prev.memory,
          free: prev.memory.total - prev.memory.used,
          usage: Math.round((prev.memory.used / prev.memory.total) * 100)
        },
        disk: {
          ...prev.disk,
          free: prev.disk.total - prev.disk.used,
          usage: Math.round((prev.disk.used / prev.disk.total) * 100)
        }
      }) : null);

      // Generate app health
      setAppHealth({
        status: Math.random() > 0.9 ? 'warning' : 'healthy',
        uptime: Math.floor(Math.random() * 604800) + 86400,
        version: '1.2.3',
        environment: 'production',
        services: [
          { name: 'Database', status: 'online', responseTime: Math.floor(Math.random() * 20) + 5 },
          { name: 'Redis Cache', status: 'online', responseTime: Math.floor(Math.random() * 10) + 2 },
          { name: 'Email Service', status: Math.random() > 0.95 ? 'degraded' : 'online', responseTime: Math.floor(Math.random() * 50) + 10 },
          { name: 'Payment Gateway', status: 'online', responseTime: Math.floor(Math.random() * 100) + 50 }
        ]
      });

      // Generate user activity
      setUserActivity({
        totalUsers: Math.floor(Math.random() * 1000) + 5000,
        activeUsers: Math.floor(Math.random() * 500) + 200,
        newRegistrations: Math.floor(Math.random() * 50) + 10,
        loginAttempts: Math.floor(Math.random() * 200) + 100,
        failedLogins: Math.floor(Math.random() * 20) + 5,
        sessionsActive: Math.floor(Math.random() * 300) + 150
      });

      // Generate API metrics
      const totalReqs = Math.floor(Math.random() * 10000) + 5000;
      const errorReqs = Math.floor(Math.random() * 500) + 50;
      setAPIMetrics({
        totalRequests: totalReqs,
        successfulRequests: totalReqs - errorReqs,
        errorRequests: errorReqs,
        errorRate: (errorReqs / totalReqs) * 100,
        averageResponseTime: Math.floor(Math.random() * 200) + 50,
        rateLimitHits: Math.floor(Math.random() * 100) + 10,
        peakRequestsPerSecond: Math.floor(Math.random() * 500) + 100,
        topEndpoints: [
          { path: '/api/hotels', method: 'GET', requests: 1250, avgResponseTime: 45 },
          { path: '/api/bookings', method: 'POST', requests: 890, avgResponseTime: 120 },
          { path: '/api/users', method: 'GET', requests: 678, avgResponseTime: 35 }
        ],
        slowestEndpoints: [
          { endpoint: '/api/reports/analytics', responseTime: 2300, requests: 45 },
          { endpoint: '/api/bookings/search', responseTime: 1800, requests: 120 },
          { endpoint: '/api/hotels/availability', responseTime: 1200, requests: 230 }
        ],
        errorLogs: [
          { timestamp: new Date().toISOString(), level: 'ERROR', message: 'Database connection timeout', endpoint: '/api/bookings' },
          { timestamp: new Date().toISOString(), level: 'WARN', message: 'High memory usage detected', endpoint: '/api/reports' },
          { timestamp: new Date().toISOString(), level: 'ERROR', message: 'Payment service unavailable', endpoint: '/api/payments' }
        ]
      });

      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    generateMockData();
    
    const interval = autoRefresh ? setInterval(generateMockData, 30000) : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  if (loading && !systemMetrics) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography
          variant="h6"
          sx={{
            color: themeMode === 'dark' ? '#e2e8f0' : '#374151',
            fontWeight: 500
          }}
        >
          Loading system dashboard...
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
            mt: 1
          }}
        >
          Please wait while we fetch system monitoring data
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: themeMode === 'dark'
          ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #ffffff 100%)',
        transition: 'all 0.3s ease',
        p: { xs: 2, sm: 3 },
        '@keyframes pulse': {
          '0%': { opacity: 1 },
          '50%': { opacity: 0.7 },
          '100%': { opacity: 1 }
        }
      }}
    >
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          background: themeMode === 'dark'
            ? 'rgba(30, 41, 59, 0.8)'
            : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: themeMode === 'dark' ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(226, 232, 240, 0.3)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: themeMode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 3
              }}
            >
              {/* Removed icon, added placeholder styling */}
              <Box sx={{ width: 24, height: 24, backgroundColor: 'transparent' }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  background: themeMode === 'dark'
                    ? 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
                    : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 1
                }}
              >
                System Monitoring Dashboard
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography
                  variant="body2"
                  sx={{ color: themeMode === 'dark' ? '#94a3b8' : '#64748b' }}
                >
                  Real-time system health and performance metrics
                </Typography>
                <Chip
                  label={appHealth?.status?.toUpperCase() || 'UNKNOWN'}
                  color={getStatusColor(appHealth?.status || 'unknown') as any}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={generateMockData}
              disabled={loading}
              sx={{
                minWidth: 120,
                '&:hover': {
                  borderColor: themeMode === 'dark' ? '#60a5fa' : '#2563eb',
                  backgroundColor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(37, 99, 235, 0.1)'
                }
              }}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
            <Button
              variant={autoRefresh ? "contained" : "outlined"}
              size="small"
              onClick={() => setAutoRefresh(!autoRefresh)}
              sx={{ minWidth: 120 }}
            >
              {autoRefresh && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'currentColor',
                    mr: 1,
                    animation: 'pulse 2s infinite'
                  }}
                />
              )}
              Auto Refresh
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* System Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card
            elevation={3}
            sx={{
              background: themeMode === 'dark'
                ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.2) 0%, rgba(30, 64, 175, 0.3) 100%)'
                : 'linear-gradient(135deg, rgba(219, 234, 254, 0.8) 0%, rgba(191, 219, 254, 0.9) 100%)',
              border: themeMode === 'dark' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(147, 197, 253, 0.5)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: themeMode === 'dark' ? '0 8px 30px rgba(59, 130, 246, 0.2)' : '0 8px 30px rgba(59, 130, 246, 0.15)'
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: themeMode === 'dark' ? '#cbd5e1' : '#374151'
                  }}
                >
                  CPU Usage
                </Typography>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    background: themeMode === 'dark' ? '#2563eb' : '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ml: 'auto'
                  }}
                >
                  {/* Removed icon */}
                </Box>
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 'bold',
                  color: themeMode === 'dark' ? '#60a5fa' : '#1d4ed8',
                  mb: 1
                }}
              >
                {systemMetrics?.cpu?.usage || 0}%
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: themeMode === 'dark' ? '#93c5fd' : '#2563eb'
                }}
              >
                {systemMetrics?.cpu?.cores || 4} cores available
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            elevation={3}
            sx={{
              background: themeMode === 'dark'
                ? 'linear-gradient(135deg, rgba(21, 128, 61, 0.2) 0%, rgba(22, 101, 52, 0.3) 100%)'
                : 'linear-gradient(135deg, rgba(236, 253, 245, 0.8) 0%, rgba(209, 250, 229, 0.9) 100%)',
              border: themeMode === 'dark' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(134, 239, 172, 0.5)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: themeMode === 'dark' ? '0 8px 30px rgba(34, 197, 94, 0.2)' : '0 8px 30px rgba(34, 197, 94, 0.15)'
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: themeMode === 'dark' ? '#cbd5e1' : '#374151'
                  }}
                >
                  Memory Usage
                </Typography>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    background: themeMode === 'dark' ? '#16a34a' : '#22c55e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ml: 'auto'
                  }}
                >
                  {/* Removed icon */}
                </Box>
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 'bold',
                  color: themeMode === 'dark' ? '#4ade80' : '#15803d',
                  mb: 1
                }}
              >
                {systemMetrics?.memory?.usage || 0}%
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: themeMode === 'dark' ? '#86efac' : '#16a34a'
                }}
              >
                {formatBytes((systemMetrics?.memory?.used || 0) * 1024 * 1024)} used
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            elevation={3}
            sx={{
              background: themeMode === 'dark'
                ? 'linear-gradient(135deg, rgba(153, 27, 27, 0.2) 0%, rgba(127, 29, 29, 0.3) 100%)'
                : 'linear-gradient(135deg, rgba(254, 242, 242, 0.8) 0%, rgba(254, 226, 226, 0.9) 100%)',
              border: themeMode === 'dark' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(252, 165, 165, 0.5)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: themeMode === 'dark' ? '0 8px 30px rgba(239, 68, 68, 0.2)' : '0 8px 30px rgba(239, 68, 68, 0.15)'
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: themeMode === 'dark' ? '#cbd5e1' : '#374151'
                  }}
                >
                  API Error Rate
                </Typography>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    background: themeMode === 'dark' ? '#dc2626' : '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ml: 'auto'
                  }}
                >
                  {/* Removed icon */}
                </Box>
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 'bold',
                  color: themeMode === 'dark' ? '#f87171' : '#b91c1c',
                  mb: 1
                }}
              >
                {apiMetrics?.errorRate?.toFixed(1) || 0}%
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: themeMode === 'dark' ? '#fca5a5' : '#dc2626'
                }}
              >
                {apiMetrics?.totalRequests || 0} total requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            elevation={3}
            sx={{
              background: themeMode === 'dark'
                ? 'linear-gradient(135deg, rgba(6, 78, 59, 0.2) 0%, rgba(5, 150, 105, 0.3) 100%)'
                : 'linear-gradient(135deg, rgba(236, 253, 245, 0.8) 0%, rgba(167, 243, 208, 0.9) 100%)',
              border: themeMode === 'dark' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(110, 231, 183, 0.5)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: themeMode === 'dark' ? '0 8px 30px rgba(16, 185, 129, 0.2)' : '0 8px 30px rgba(16, 185, 129, 0.15)'
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: themeMode === 'dark' ? '#cbd5e1' : '#374151'
                  }}
                >
                  Active Users
                </Typography>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    background: themeMode === 'dark' ? '#059669' : '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ml: 'auto'
                  }}
                >
                  {/* Removed icon */}
                </Box>
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 'bold',
                  color: themeMode === 'dark' ? '#34d399' : '#047857',
                  mb: 1
                }}
              >
                {userActivity?.activeUsers || 0}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: themeMode === 'dark' ? '#6ee7b7' : '#059669'
                }}
              >
                {userActivity?.sessionsActive || 0} active sessions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Monitoring Tabs */}
      <Paper
        elevation={2}
        sx={{
          background: themeMode === 'dark'
            ? 'rgba(30, 41, 59, 0.8)'
            : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: themeMode === 'dark'
            ? '1px solid rgba(71, 85, 105, 0.3)'
            : '1px solid rgba(226, 232, 240, 0.3)'
        }}
      >
        <Box sx={{ p: 3 }}>
          <Tabs
            value={currentTab}
            onChange={(event, newValue) => setCurrentTab(newValue)}
            sx={{
              mb: 3,
              '& .MuiTabs-flexContainer': {
                gap: 1
              },
              '& .MuiTab-root': {
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                '&.Mui-selected': {
                  color: themeMode === 'dark' ? '#f8fafc' : '#0f172a'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: themeMode === 'dark' ? '#60a5fa' : '#2563eb',
                height: 3,
                borderRadius: 1.5
              }
            }}
            >
              <Tab label="System Health" value="system" />
              <Tab label="API Monitoring" value="api" />
              <Tab label="User Activity" value="users" />
              <Tab label="Database" value="database" />
              <Tab label="Performance" value="performance" />
              <Tab label="Alerts" value="alerts" />
            </Tabs>          {/* System Health Tab */}
          {currentTab === 'system' && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card
                    elevation={1}
                    sx={{
                      background: themeMode === 'dark'
                        ? 'rgba(51, 65, 85, 0.6)'
                        : 'rgba(248, 250, 252, 0.8)',
                      border: themeMode === 'dark'
                        ? '1px solid rgba(71, 85, 105, 0.3)'
                        : '1px solid rgba(226, 232, 240, 0.5)'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                          }}
                        >
                          Application Status
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ flex: 1 }}>
                            Status
                          </Typography>
                          <Chip
                            label={appHealth?.status.toUpperCase()}
                            color={getStatusColor(appHealth?.status || 'unknown') as any}
                            size="small"
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ flex: 1 }}>
                            Uptime
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              color: themeMode === 'dark' ? '#10b981' : '#059669'
                            }}
                          >
                            {formatUptime(appHealth?.uptime || 0)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ flex: 1 }}>
                            Version
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 500 }}
                          >
                            {appHealth?.version}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ flex: 1 }}>
                            Environment
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 500 }}
                          >
                            {appHealth?.environment}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          mb: 2,
                          color: themeMode === 'dark' ? '#cbd5e1' : '#374151'
                        }}
                      >
                        Service Health
                      </Typography>

                      {appHealth?.services && (
                        <Box>
                          {appHealth.services.map((service, index) => (
                            <Box
                              key={index}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                py: 1,
                                borderBottom: index < appHealth.services.length - 1
                                  ? `1px solid ${themeMode === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.5)'}`
                                  : 'none'
                              }}
                            >
                              <Typography variant="body2">
                                {service.name}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography
                                  variant="caption"
                                  sx={{ color: themeMode === 'dark' ? '#94a3b8' : '#64748b' }}
                                >
                                  {service.responseTime}ms
                                </Typography>
                                <Chip
                                  label={service.status}
                                  color={getStatusColor(service.status) as any}
                                  size="small"
                                  sx={{ minWidth: 70 }}
                                />
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card
                    elevation={1}
                    sx={{
                      background: themeMode === 'dark'
                        ? 'rgba(51, 65, 85, 0.6)'
                        : 'rgba(248, 250, 252, 0.8)',
                      border: themeMode === 'dark'
                        ? '1px solid rgba(71, 85, 105, 0.3)'
                        : '1px solid rgba(226, 232, 240, 0.5)'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 3,
                          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                        }}
                      >
                        System Resources
                      </Typography>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          CPU Usage ({systemMetrics?.cpu.usage}%)
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={systemMetrics?.cpu.usage || 0}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: themeMode === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.5)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: systemMetrics?.cpu.usage && systemMetrics.cpu.usage > 80
                                ? '#ef4444'
                                : systemMetrics?.cpu.usage && systemMetrics.cpu.usage > 60
                                  ? '#f59e0b'
                                  : '#10b981'
                            }
                          }}
                        />
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Memory Usage ({systemMetrics?.memory.usage}%)
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={systemMetrics?.memory.usage || 0}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: themeMode === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.5)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: systemMetrics?.memory.usage && systemMetrics.memory.usage > 80
                                ? '#ef4444'
                                : systemMetrics?.memory.usage && systemMetrics.memory.usage > 60
                                  ? '#f59e0b'
                                  : '#10b981'
                            }
                          }}
                        />
                      </Box>

                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Disk Usage ({systemMetrics?.disk.usage}%)
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={systemMetrics?.disk.usage || 0}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: themeMode === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.5)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: systemMetrics?.disk.usage && systemMetrics.disk.usage > 80
                                ? '#ef4444'
                                : systemMetrics?.disk.usage && systemMetrics.disk.usage > 60
                                  ? '#f59e0b'
                                  : '#10b981'
                            }
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* API Monitoring Tab */}
          {currentTab === 'api' && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card
                    elevation={1}
                    sx={{
                      background: themeMode === 'dark'
                        ? 'rgba(51, 65, 85, 0.6)'
                        : 'rgba(248, 250, 252, 0.8)',
                      border: themeMode === 'dark'
                        ? '1px solid rgba(71, 85, 105, 0.3)'
                        : '1px solid rgba(226, 232, 240, 0.5)'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 3,
                          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                        }}
                      >
                        API Performance
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography
                              variant="h4"
                              sx={{
                                fontWeight: 'bold',
                                color: themeMode === 'dark' ? '#10b981' : '#059669',
                                mb: 1
                              }}
                            >
                              {apiMetrics?.totalRequests || 0}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: themeMode === 'dark' ? '#94a3b8' : '#64748b' }}
                            >
                              Total Requests
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography
                              variant="h4"
                              sx={{
                                fontWeight: 'bold',
                                color: themeMode === 'dark' ? '#f59e0b' : '#d97706',
                                mb: 1
                              }}
                            >
                              {apiMetrics?.averageResponseTime || 0}ms
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: themeMode === 'dark' ? '#94a3b8' : '#64748b' }}
                            >
                              Avg Response Time
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card
                    elevation={1}
                    sx={{
                      background: themeMode === 'dark'
                        ? 'rgba(51, 65, 85, 0.6)'
                        : 'rgba(248, 250, 252, 0.8)',
                      border: themeMode === 'dark'
                        ? '1px solid rgba(71, 85, 105, 0.3)'
                        : '1px solid rgba(226, 232, 240, 0.5)'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 3,
                          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                        }}
                      >
                        Top Endpoints
                      </Typography>

                      {apiMetrics?.topEndpoints?.map((endpoint, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            py: 1,
                            borderBottom: index < (apiMetrics.topEndpoints?.length || 0) - 1
                              ? `1px solid ${themeMode === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.5)'}`
                              : 'none'
                          }}
                        >
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {endpoint.path}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: themeMode === 'dark' ? '#94a3b8' : '#64748b' }}
                            >
                              {endpoint.method}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {endpoint.requests}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: themeMode === 'dark' ? '#94a3b8' : '#64748b' }}
                            >
                              {endpoint.avgResponseTime}ms
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* User Activity Tab */}
          {currentTab === 'users' && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card
                    elevation={1}
                    sx={{
                      background: themeMode === 'dark'
                        ? 'rgba(51, 65, 85, 0.6)'
                        : 'rgba(248, 250, 252, 0.8)',
                      border: themeMode === 'dark'
                        ? '1px solid rgba(71, 85, 105, 0.3)'
                        : '1px solid rgba(226, 232, 240, 0.5)'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 3,
                          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                        }}
                      >
                        User Activity Overview
                      </Typography>

                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography
                              variant="h4"
                              sx={{
                                fontWeight: 'bold',
                                color: themeMode === 'dark' ? '#60a5fa' : '#2563eb',
                                mb: 1
                              }}
                            >
                              {userActivity?.totalUsers || 0}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: themeMode === 'dark' ? '#94a3b8' : '#64748b' }}
                            >
                              Total Users
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography
                              variant="h4"
                              sx={{
                                fontWeight: 'bold',
                                color: themeMode === 'dark' ? '#10b981' : '#059669',
                                mb: 1
                              }}
                            >
                              {userActivity?.activeUsers || 0}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: themeMode === 'dark' ? '#94a3b8' : '#64748b' }}
                            >
                              Active Users
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography
                              variant="h4"
                              sx={{
                                fontWeight: 'bold',
                                color: themeMode === 'dark' ? '#f59e0b' : '#d97706',
                                mb: 1
                              }}
                            >
                              {userActivity?.newRegistrations || 0}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: themeMode === 'dark' ? '#94a3b8' : '#64748b' }}
                            >
                              New Registrations
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography
                              variant="h4"
                              sx={{
                                fontWeight: 'bold',
                                color: themeMode === 'dark' ? '#ef4444' : '#dc2626',
                                mb: 1
                              }}
                            >
                              {userActivity?.failedLogins || 0}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: themeMode === 'dark' ? '#94a3b8' : '#64748b' }}
                            >
                              Failed Logins
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card
                    elevation={1}
                    sx={{
                      background: themeMode === 'dark'
                        ? 'linear-gradient(135deg, rgba(88, 28, 135, 0.2) 0%, rgba(124, 58, 237, 0.3) 100%)'
                        : 'linear-gradient(135deg, rgba(245, 243, 255, 0.8) 0%, rgba(224, 231, 255, 0.9) 100%)',
                      border: themeMode === 'dark' ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(196, 181, 253, 0.5)'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 3,
                          color: themeMode === 'dark' ? '#a855f7' : '#5b21b6'
                        }}
                      >
                        Authentication Analytics
                      </Typography>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">
                            Login Attempts:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {userActivity?.loginAttempts || 0}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">
                            Failed Logins:
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 500,
                              color: (userActivity?.failedLogins || 0) > 10 ? 'error.main' : 'inherit'
                            }}
                          >
                            {userActivity?.failedLogins || 0}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="body2">
                            Success Rate:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {userActivity ? Math.round(((userActivity.loginAttempts - userActivity.failedLogins) / userActivity.loginAttempts) * 100) : 0}%
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card
                    elevation={1}
                    sx={{
                      background: themeMode === 'dark'
                        ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.2) 0%, rgba(30, 64, 175, 0.3) 100%)'
                        : 'linear-gradient(135deg, rgba(219, 234, 254, 0.8) 0%, rgba(191, 219, 254, 0.9) 100%)',
                      border: themeMode === 'dark' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(147, 197, 253, 0.5)'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 3,
                          color: themeMode === 'dark' ? '#60a5fa' : '#1e40af'
                        }}
                      >
                        Session Management
                      </Typography>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">
                            Active Sessions:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {userActivity?.sessionsActive || 0}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">
                            Avg Session Duration:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {Math.floor(Math.random() * 30) + 15}m
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="body2">
                            Peak Concurrent Users:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {Math.floor((userActivity?.activeUsers || 0) * 1.2)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Database Tab */}
          {currentTab === 'database' && (
            <Box>
              <Grid container spacing={3}>
                {/* Database Overview Cards */}
                <Grid item xs={12} md={3}>
                  <Card
                    elevation={1}
                    sx={{
                      background: themeMode === 'dark'
                        ? 'linear-gradient(135deg, rgba(220, 38, 127, 0.2) 0%, rgba(219, 39, 119, 0.3) 100%)'
                        : 'linear-gradient(135deg, rgba(251, 207, 232, 0.8) 0%, rgba(251, 207, 232, 0.9) 100%)',
                      border: themeMode === 'dark' ? '1px solid rgba(236, 72, 153, 0.3)' : '1px solid rgba(236, 72, 153, 0.5)'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 2,
                          color: themeMode === 'dark' ? '#f472b6' : '#be185d'
                        }}
                      >
                        Connection Pool
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Active: {Math.floor(Math.random() * 8) + 2}/10
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Idle: {Math.floor(Math.random() * 5) + 3}
                      </Typography>
                      <Typography variant="body2">
                        Wait Time: {Math.floor(Math.random() * 20) + 5}ms
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Card
                    elevation={1}
                    sx={{
                      background: themeMode === 'dark'
                        ? 'linear-gradient(135deg, rgba(5, 150, 105, 0.2) 0%, rgba(16, 185, 129, 0.3) 100%)'
                        : 'linear-gradient(135deg, rgba(167, 243, 208, 0.8) 0%, rgba(167, 243, 208, 0.9) 100%)',
                      border: themeMode === 'dark' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(34, 197, 94, 0.5)'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 2,
                          color: themeMode === 'dark' ? '#4ade80' : '#047857'
                        }}
                      >
                        Query Performance
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Avg Time: {Math.floor(Math.random() * 100) + 20}ms
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Slow Queries: {Math.floor(Math.random() * 3)}
                      </Typography>
                      <Typography variant="body2">
                        Cache Hit: {Math.floor(Math.random() * 10) + 85}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Card
                    elevation={1}
                    sx={{
                      background: themeMode === 'dark'
                        ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(251, 146, 60, 0.3) 100%)'
                        : 'linear-gradient(135deg, rgba(254, 215, 170, 0.8) 0%, rgba(253, 186, 116, 0.9) 100%)',
                      border: themeMode === 'dark' ? '1px solid rgba(249, 115, 22, 0.3)' : '1px solid rgba(249, 115, 22, 0.5)'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 2,
                          color: themeMode === 'dark' ? '#fb923c' : '#c2410c'
                        }}
                      >
                        Database Size
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Total: {(Math.random() * 5 + 2).toFixed(1)}GB
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Bookings: {(Math.random() * 1 + 0.5).toFixed(1)}GB
                      </Typography>
                      <Typography variant="body2">
                        Users: {(Math.random() * 0.5 + 0.1).toFixed(1)}GB
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Card
                    elevation={1}
                    sx={{
                      background: themeMode === 'dark'
                        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(124, 58, 237, 0.3) 100%)'
                        : 'linear-gradient(135deg, rgba(221, 214, 254, 0.8) 0%, rgba(196, 181, 253, 0.9) 100%)',
                      border: themeMode === 'dark' ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(139, 92, 246, 0.5)'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 2,
                          color: themeMode === 'dark' ? '#a855f7' : '#6b21a8'
                        }}
                      >
                        Health Status
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1, color: 'success.main' }}>
                        Status: Online
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Uptime: 99.9%
                      </Typography>
                      <Typography variant="body2">
                        Last Backup: 2h ago
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Query Performance Table */}
                <Grid item xs={12}>
                  <Card elevation={1}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 3,
                          color: themeMode === 'dark' ? '#e5e7eb' : '#374151'
                        }}
                      >
                        Recent Database Operations
                      </Typography>
                      
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Operation</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Execution Time</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Rows Affected</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {[
                            { operation: 'SELECT * FROM bookings', time: '23ms', rows: '245', status: 'Success' },
                            { operation: 'UPDATE room_availability', time: '45ms', rows: '12', status: 'Success' },
                            { operation: 'INSERT INTO audit_log', time: '8ms', rows: '1', status: 'Success' },
                            { operation: 'SELECT COUNT(*) FROM users', time: '156ms', rows: '1', status: 'Slow' },
                            { operation: 'DELETE FROM expired_sessions', time: '67ms', rows: '34', status: 'Success' }
                          ].map((row, index) => (
                            <TableRow key={index}>
                              <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                {row.operation}
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: parseInt(row.time) > 100 ? 'warning.main' : 'inherit'
                                  }}
                                >
                                  {row.time}
                                </Typography>
                              </TableCell>
                              <TableCell>{row.rows}</TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: row.status === 'Success' ? 'success.main' : 'warning.main',
                                    fontWeight: 500
                                  }}
                                >
                                  {row.status}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Performance Tab */}
          {currentTab === 'performance' && (
            <Box>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                }}
              >
                Performance Metrics Coming Soon
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: themeMode === 'dark' ? '#94a3b8' : '#64748b' }}
              >
                Detailed performance analytics and optimization suggestions will be available here.
              </Typography>
            </Box>
          )}

          {/* Alerts Tab */}
          {currentTab === 'alerts' && (
            <Box>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                }}
              >
                System Alerts
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                No active alerts at this time. System is running normally.
              </Alert>
              {apiMetrics?.errorLogs?.slice(0, 3).map((error, index) => (
                <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                  <strong>{error.level}:</strong> {error.message} ({error.endpoint})
                </Alert>
              ))}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ProcessMonitoringDashboard;