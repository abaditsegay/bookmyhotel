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
} from '@mui/material';
import { 
  Refresh, 
  Edit, 
  ToggleOn, 
  ToggleOff, 
  Lock,
  Search 
} from '@mui/icons-material';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  roles: string[];
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserStatistics {
  total: number;
  active: number;
  inactive: number;
  roleCounts: { [key: string]: number };
}

const USER_ROLES = [
  'GUEST',
  'CUSTOMER',
  'FRONTDESK',
  'HOUSEKEEPING',
  'HOTEL_ADMIN',
  'HOTEL_MANAGER',
  'ADMIN'
];const UserManagementAdmin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    isActive: true,
    roles: [] as string[],
    tenantId: ''
  });

  useEffect(() => {
    const loadData = async () => {
      await fetchUsers();
      await fetchStatistics();
    };
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let url = '/api/admin/users';
      if (searchTerm.trim()) {
        url = `/api/admin/users/search?searchTerm=${encodeURIComponent(searchTerm)}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.content || data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/admin/users/statistics');
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleSearch = () => {
    fetchUsers();
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      isActive: user.isActive,
      roles: user.roles,
      tenantId: user.tenantId || ''
    });
    setDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setDialogOpen(false);
        fetchUsers();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleToggleUserStatus = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchUsers();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handleResetPassword = async (userId: number) => {
    const newPassword = prompt('Enter new password for user:');
    if (!newPassword) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password?newPassword=${encodeURIComponent(newPassword)}`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Password reset successfully');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
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
            fetchUsers();
          }}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

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
                    {user.roles.map((role) => (
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
                      startIcon={<Edit />}
                      onClick={() => openEditDialog(user)}
                    >
                      Edit
                    </Button>
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

      {/* Edit User Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
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
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateUser} variant="contained">
            Update User
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagementAdmin;
