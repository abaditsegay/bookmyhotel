import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  Autocomplete,
  TablePagination,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { 
  Refresh, 
  ToggleOn, 
  ToggleOff, 
  Lock,
  Search,
} from '@mui/icons-material';
import { useAuthenticatedApi } from '../../hooks/useAuthenticatedApi';
import { 
  UserManagementResponse, 
  UserStatistics, 
  UpdateUserRequest, 
} from '../../services/adminApi';

const USER_ROLES = [
  'GUEST',
  'CUSTOMER',
  'FRONTDESK',
  'HOUSEKEEPING',
  'HOTEL_ADMIN',
  'HOTEL_MANAGER',
  'ADMIN'
];const UserManagementAdmin: React.FC = () => {
  const { adminApiService } = useAuthenticatedApi();
  const [users, setUsers] = useState<UserManagementResponse[]>([]);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState<UpdateUserRequest>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    isActive: true,
    roles: [],
    tenantId: ''
  });

  useEffect(() => {
    const loadData = async () => {
      await fetchUsers();
      await fetchStatistics();
    };
    loadData();
  }, [page, rowsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (searchTerm.trim()) {
        response = await adminApiService.searchUsers(searchTerm, page, rowsPerPage);
      } else {
        response = await adminApiService.getUsers(page, rowsPerPage);
      }
      
      setUsers(response.content);
      setTotalUsers(response.totalElements);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const data = await adminApiService.getUserStatistics();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleSearch = () => {
    setPage(0); // Reset to first page when searching
    fetchUsers();
  };

  const handleToggleUserStatus = async (userId: number) => {
    try {
      setError(null);
      await adminApiService.toggleUserStatus(userId);
      setSuccess('User status updated successfully');
      fetchUsers();
      fetchStatistics();
    } catch (error) {
      console.error('Error toggling user status:', error);
      setError('Failed to update user status. Please try again.');
    }
  };

  const handleResetPassword = async (userId: number) => {
    const newPassword = prompt('Enter new password for user:');
    if (!newPassword) return;

    try {
      setError(null);
      await adminApiService.resetUserPassword(userId, newPassword);
      setSuccess('Password reset successfully');
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('Failed to reset password. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' } = {
      ADMIN: 'error',
      HOTEL_ADMIN: 'info',
      HOTEL_MANAGER: 'primary',
      FRONTDESK: 'secondary',
      HOUSEKEEPING: 'secondary',
      CUSTOMER: 'success',
      GUEST: 'default'
    };
    return colors[role] || 'default';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        User Management
      </Typography>

      {/* Statistics Cards */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h4">
                  {statistics.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Users
                </Typography>
                <Typography variant="h4" color="success.main">
                  {statistics.active}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Inactive Users
                </Typography>
                <Typography variant="h4" color="error.main">
                  {statistics.inactive}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Admins
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {statistics.roleCounts.ADMIN || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Search and Actions */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Search users"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          size="small"
          sx={{ minWidth: 300 }}
        />
        <Button 
          variant="outlined" 
          startIcon={<Search />} 
          onClick={handleSearch}
        >
          Search
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<Refresh />} 
          onClick={() => {
            setSearchTerm('');
            setPage(0);
            fetchUsers();
          }}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Tenant</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Typography variant="subtitle2">
                    {user.firstName} {user.lastName}
                  </Typography>
                  {user.phone && (
                    <Typography variant="body2" color="textSecondary">
                      {user.phone}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {user.roles.map((role: string) => (
                      <Chip 
                        key={role}
                        label={role} 
                        color={getRoleColor(role)}
                        size="small"
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {user.tenantId || 'None'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.isActive ? 'Active' : 'Inactive'}
                    color={user.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      color={user.isActive ? 'warning' : 'success'}
                      startIcon={user.isActive ? <ToggleOff /> : <ToggleOn />}
                      onClick={() => handleToggleUserStatus(user.id)}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      size="small"
                      color="secondary"
                      startIcon={<Lock />}
                      onClick={() => handleResetPassword(user.id)}
                    >
                      Reset Password
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={totalUsers}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value))}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      {/* Edit User Dialog */}
      <Dialog open={false} onClose={() => {}} maxWidth="md" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tenant ID"
                  value={formData.tenantId}
                  onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={USER_ROLES}
                  value={formData.roles}
                  onChange={(_, newValue) => setFormData({ ...formData, roles: newValue })}
                  renderInput={(params) => (
                    <TextField {...params} label="Roles" placeholder="Select roles" />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        color={getRoleColor(option)}
                        {...getTagProps({ index })}
                        key={option}
                      />
                    ))
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {}}>Cancel</Button>
          <Button onClick={() => console.log('Update functionality removed')} variant="contained">
            Update User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar 
        open={!!success} 
        autoHideDuration={4000} 
        onClose={() => setSuccess(null)}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserManagementAdmin;
