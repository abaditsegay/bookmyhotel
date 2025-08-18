import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Box,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Switch,
  FormControlLabel,
  Checkbox,
  FormGroup,
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { hotelAdminApi, StaffResponse, StaffCreateRequest } from '../../services/hotelAdminApi';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface StaffFilters {
  search: string;
  role: string;
  status: string;
}

interface StaffManagementProps {
  onNavigateToStaff?: (staffId: number) => void;
}

const StaffManagement: React.FC<StaffManagementProps> = ({ onNavigateToStaff }) => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [staff, setStaff] = useState<StaffResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState<StaffFilters>({
    search: '',
    role: '',
    status: '',
  });

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffResponse | null>(null);

  // Form state
  const [staffForm, setStaffForm] = useState<StaffCreateRequest>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    roles: ['FRONTDESK'],
  });

  const staffRoles = ['FRONTDESK', 'HOUSEKEEPING', 'HOTEL_ADMIN'];
  const statusOptions = ['ALL', 'ACTIVE', 'INACTIVE'];

  const loadStaff = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await hotelAdminApi.getHotelStaff(
        token,
        page,
        rowsPerPage,
        filters.search || undefined,
        filters.role || undefined
      );
      
      if (response.success && response.data) {
        let filteredStaff = response.data.content;
        
        // Apply status filter if specified
        if (filters.status && filters.status !== 'ALL') {
          filteredStaff = filteredStaff.filter(member => 
            filters.status === 'ACTIVE' ? member.isActive : !member.isActive
          );
        }
        
        setStaff(filteredStaff);
        setTotalElements(response.data.totalElements);
      } else {
        setError(response.message || 'Failed to load staff');
      }
    } catch (err) {
      console.error('Error loading staff:', err);
      setError('Failed to load staff. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, page, rowsPerPage, filters]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      search: event.target.value
    }));
    setPage(0);
  };

  const handleFilterChange = (filterName: keyof StaffFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPage(0);
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewStaff = (staffId: number) => {
    if (onNavigateToStaff) {
      onNavigateToStaff(staffId);
    } else {
      navigate(`/hotel-admin/staff/${staffId}`);
    }
  };

  const handleCreateStaff = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await hotelAdminApi.createStaff(token, staffForm);
      if (response.success) {
        setCreateDialogOpen(false);
        setStaffForm({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          phone: '',
          roles: ['FRONTDESK'],
        });
        await loadStaff();
        setError(null);
      } else {
        setError(response.message || 'Failed to create staff member. Please check the email is unique.');
      }
    } catch (err) {
      console.error('Error creating staff:', err);
      setError('Failed to create staff member. Please check the email is unique.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!selectedStaff || !token) return;
    
    try {
      setLoading(true);
      const response = await hotelAdminApi.deleteStaff(token, selectedStaff.id);
      if (response.success) {
        setDeleteDialogOpen(false);
        setSelectedStaff(null);
        await loadStaff();
        setError(null);
      } else {
        setError(response.message || 'Failed to delete staff member.');
      }
    } catch (err) {
      console.error('Error deleting staff:', err);
      setError('Failed to delete staff member.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStaffStatus = async (staffId: number, currentStatus: boolean) => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = currentStatus 
        ? await hotelAdminApi.deactivateStaff(token, staffId)
        : await hotelAdminApi.activateStaff(token, staffId);
        
      if (response.success) {
        await loadStaff();
        setError(null);
      } else {
        setError(response.message || 'Failed to update staff status');
      }
    } catch (err) {
      console.error('Error toggling staff status:', err);
      setError('Failed to update staff status.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      role: '',
      status: '',
    });
    setPage(0);
  };

  const handleRoleChange = (role: string, checked: boolean) => {
    setStaffForm(prev => {
      const roles = checked 
        ? [...prev.roles, role]
        : prev.roles.filter(r => r !== role);
      return { ...prev, roles };
    });
  };

  if (!token) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error">
          Authentication required. Please log in.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Staff Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Add New Staff
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Search and Filters */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search staff..."
                value={filters.search}
                onChange={handleSearchChange}
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
                  value={filters.role}
                  label="Role"
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                >
                  <MenuItem value="">All Roles</MenuItem>
                  {staffRoles.map(role => (
                    <MenuItem key={role} value={role}>{role.replace('_', ' ')}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  {statusOptions.map(status => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={resetFilters}
                  size="small"
                >
                  Clear
                </Button>
                <IconButton
                  onClick={loadStaff}
                  disabled={loading}
                >
                  <RefreshIcon />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Staff Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Roles</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Active</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : staff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No staff members found matching your criteria
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  staff.map((member) => (
                    <TableRow key={member.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {member.firstName} {member.lastName}
                        </Typography>
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.phone || 'N/A'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {member.roles.map(role => (
                            <Chip
                              key={role}
                              label={role.replace('_', ' ')}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={member.isActive ? 'Active' : 'Inactive'}
                          color={getStatusColor(member.isActive) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={member.isActive}
                          onChange={() => handleToggleStaffStatus(member.id, member.isActive)}
                          disabled={loading}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleViewStaff(member.id)}
                            title="View Details"
                          >
                            <ViewIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedStaff(member);
                              setDeleteDialogOpen(true);
                            }}
                            title="Delete Staff"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalElements}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </Paper>

        {/* Create Staff Dialog */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Add New Staff Member</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  required
                  helperText="Minimum 8 characters"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={staffForm.firstName}
                  onChange={(e) => setStaffForm({ ...staffForm, firstName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={staffForm.lastName}
                  onChange={(e) => setStaffForm({ ...staffForm, lastName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone (Optional)"
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Roles *
                </Typography>
                <FormGroup row>
                  {staffRoles.map(role => (
                    <FormControlLabel
                      key={role}
                      control={
                        <Checkbox
                          checked={staffForm.roles.includes(role)}
                          onChange={(e) => handleRoleChange(role, e.target.checked)}
                        />
                      }
                      label={role.replace('_', ' ')}
                    />
                  ))}
                </FormGroup>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateStaff}
              variant="contained"
              disabled={loading || !staffForm.email || !staffForm.password || !staffForm.firstName || !staffForm.lastName || staffForm.roles.length === 0}
            >
              Create Staff
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete {selectedStaff?.firstName} {selectedStaff?.lastName}? 
              This action cannot be undone and will deactivate the staff member.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleDeleteStaff}
              variant="contained"
              color="error"
              disabled={loading}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default StaffManagement;
