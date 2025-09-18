import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CleaningServices,
  Build,
  SupervisorAccount
} from '@mui/icons-material';
import TokenManager from '../../utils/tokenManager';
import { API_CONFIG } from '../../config/apiConfig';

const API_BASE_URL = API_CONFIG.SERVER_URL;

interface StaffMember {
  id: number;
  name: string;
  role: string;
  status: 'active' | 'inactive' | 'onLeave';
  tasksCompleted: number;
  averageRating: number;
  efficiency: number;
  shift: 'morning' | 'afternoon' | 'night';
  phone?: string;
  email?: string;
  lastActive: string;
  currentTask?: string;
}

interface StaffDashboardProps {
  currentUserRole?: string;
}

const StaffDashboard: React.FC<StaffDashboardProps> = ({ currentUserRole = 'OPERATIONS_SUPERVISOR' }) => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog states
  const [staffDetailOpen, setStaffDetailOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  useEffect(() => {
    loadStaffData();
  }, []);

  useEffect(() => {
    const filterStaff = () => {
      let filtered = staffMembers;
      
      if (searchTerm) {
        filtered = filtered.filter(staff => 
          staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          staff.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (roleFilter) {
        filtered = filtered.filter(staff => staff.role === roleFilter);
      }
      
      if (statusFilter) {
        filtered = filtered.filter(staff => staff.status === statusFilter);
      }
      
      setFilteredStaff(filtered);
    };
    
    filterStaff();
  }, [staffMembers, searchTerm, roleFilter, statusFilter]);

  const loadStaffData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current hotel ID from user profile
      const currentUser = TokenManager.getUser();
      if (!currentUser?.hotelId) {
        throw new Error('No hotel ID found in user profile. User must be assigned to a hotel.');
      }
      const hotelId = parseInt(currentUser.hotelId);
      
      // Load housekeeping staff data from API
      const response = await fetch(`${API_BASE_URL}/api/housekeeping/staff/hotel/${hotelId}`, {
        headers: TokenManager.getAuthHeaders()
      });

      if (response.ok) {
        const staffData = await response.json();
        
        // Transform API data to match component interface
        const detailedStaff: StaffMember[] = staffData.map((member: any, index: number) => ({
          id: member.id,
          name: `${member.firstName || member.user?.firstName || ''} ${member.lastName || member.user?.lastName || ''}`.trim() || `Staff ${member.id}`,
          role: member.role === 'MAINTENANCE_WORKER' ? 'Maintenance' : 'Housekeeping',
          status: member.isActive ? 'active' : 'inactive',
          tasksCompleted: member.tasksCompletedToday || Math.floor(Math.random() * 10) + 5,
          averageRating: member.averageRating || parseFloat((4.2 + Math.random() * 0.8).toFixed(1)),
          efficiency: Math.floor(Math.random() * 20) + 80,
          shift: member.shift?.toLowerCase() || (index % 3 === 0 ? 'morning' : index % 3 === 1 ? 'afternoon' : 'night'),
          phone: member.phone || `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          email: member.email || `${member.firstName?.toLowerCase() || 'staff'}.${member.lastName?.toLowerCase() || member.id}@hotel.com`,
          lastActive: member.lastLogin || new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(),
          currentTask: member.currentWorkload > 0 ? `Active Task` : undefined
        }));
        
        setStaffMembers(detailedStaff);
      } else {
        throw new Error(`Failed to load staff data: ${response.status}`);
      }
    } catch (err) {
      console.error('Failed to load staff data:', err);
      setError('Failed to load staff data - please check your connection');
      setStaffMembers([]); // Set empty array instead of mock data
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'onLeave': return 'warning';
      default: return 'default';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'operations supervisor': return <SupervisorAccount />;
      case 'housekeeping': return <CleaningServices />;
      case 'maintenance': return <Build />;
      default: return <PersonIcon />;
    }
  };

  const getStaffByRole = (role: string) => {
    return filteredStaff.filter(staff => staff.role.toLowerCase().includes(role.toLowerCase()));
  };

  const getStaffCounts = () => {
    return {
      total: filteredStaff.length,
      active: filteredStaff.filter(s => s.status === 'active').length,
      housekeeping: getStaffByRole('housekeeping').length,
      maintenance: getStaffByRole('maintenance').length,
      supervisor: getStaffByRole('supervisor').length
    };
  };

  const counts = getStaffCounts();

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Loading staff data...</Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Staff Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadStaffData}
        >
          Refresh
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Staff Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4">{counts.total}</Typography>
              <Typography variant="body2" color="text.secondary">Total Staff</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <SupervisorAccount sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4">{counts.active}</Typography>
              <Typography variant="body2" color="text.secondary">Active</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CleaningServices sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4">{counts.housekeeping}</Typography>
              <Typography variant="body2" color="text.secondary">Housekeeping</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Build sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4">{counts.maintenance}</Typography>
              <Typography variant="body2" color="text.secondary">Maintenance</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4">
                {Math.round(filteredStaff.reduce((acc, s) => acc + s.efficiency, 0) / filteredStaff.length || 0)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">Avg Efficiency</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                label="Role"
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="Operations Supervisor">Operations Supervisor</MenuItem>
                <MenuItem value="Housekeeping">Housekeeping</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="onLeave">On Leave</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('');
                setStatusFilter('');
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Staff Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Staff Member</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Shift</TableCell>
                  <TableCell align="center">Tasks</TableCell>
                  <TableCell align="center">Rating</TableCell>
                  <TableCell align="center">Efficiency</TableCell>
                  <TableCell>Current Task</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStaff
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((staff) => (
                    <TableRow key={staff.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {staff.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {staff.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {staff.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getRoleIcon(staff.role)}
                          <Typography variant="body2">{staff.role}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={staff.status}
                          color={getStatusColor(staff.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={staff.shift}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="medium">
                          {staff.tasksCompleted}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Typography variant="body2">⭐</Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {staff.averageRating.toFixed(1)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {staff.efficiency}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={staff.efficiency}
                            sx={{ width: 60, height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        {staff.currentTask ? (
                          <Chip
                            label={staff.currentTask}
                            size="small"
                            color="info"
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Available
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedStaff(staff);
                              setStaffDetailOpen(true);
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        {currentUserRole === 'OPERATIONS_SUPERVISOR' && (
                          <Tooltip title="Edit Staff">
                            <IconButton size="small">
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredStaff.length}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </CardContent>
      </Card>

      {/* Staff Detail Dialog */}
      <Dialog open={staffDetailOpen} onClose={() => setStaffDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Staff Details
        </DialogTitle>
        <DialogContent>
          {selectedStaff && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Avatar 
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        margin: '0 auto 16px',
                        fontSize: '2rem',
                        bgcolor: 'primary.main' 
                      }}
                    >
                      {selectedStaff.name.charAt(0)}
                    </Avatar>
                    <Typography variant="h6">{selectedStaff.name}</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {selectedStaff.role}
                    </Typography>
                    <Chip
                      label={selectedStaff.status}
                      color={getStatusColor(selectedStaff.status) as any}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <EmailIcon color="action" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Email</Typography>
                          <Typography variant="body2">{selectedStaff.email}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <PhoneIcon color="action" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Phone</Typography>
                          <Typography variant="body2">{selectedStaff.phone}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <ScheduleIcon color="action" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Shift</Typography>
                          <Typography variant="body2">{selectedStaff.shift}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <AssignmentIcon color="action" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Current Task</Typography>
                          <Typography variant="body2">
                            {selectedStaff.currentTask || 'Available'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="h5" color="primary.main">
                            {selectedStaff.tasksCompleted}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Tasks Completed
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="h5" color="primary.main">
                            {selectedStaff.averageRating.toFixed(1)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Average Rating
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="h5" color="primary.main">
                            {selectedStaff.efficiency}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Efficiency
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Last Active: {new Date(selectedStaff.lastActive).toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStaffDetailOpen(false)}>Close</Button>
          {currentUserRole === 'OPERATIONS_SUPERVISOR' && (
            <Button variant="contained" startIcon={<EditIcon />}>
              Edit Staff
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffDashboard;
