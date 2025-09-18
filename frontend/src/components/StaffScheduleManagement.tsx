import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../config/apiConfig';
import {
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  TablePagination,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
  Upload as UploadIcon,
  CloudUpload as CloudUploadIcon,
  GetApp as DownloadIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

/**
 * Create authenticated fetch request headers
 */
const getAuthHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

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
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

interface StaffScheduleRequest {
  staffId: number;
  hotelId: number;
  scheduleDate: string;
  startTime: string;
  endTime: string;
  shiftType: string;
  department: string;
  role?: string; // Role of the selected staff member (display only)
  notes?: string;
}

interface Hotel {
  id: number;
  name: string;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  roles?: string[]; // Array of roles from backend
}

const StaffScheduleManagement: React.FC = () => {
  const { token, user } = useAuth();
  const [schedules, setSchedules] = useState<StaffSchedule[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<StaffSchedule | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Delete confirmation dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<number | null>(null);
  
  // Filter states
  const [selectedHotel, setSelectedHotel] = useState<number | ''>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string | ''>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string | ''>('');
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Form state
  const [formData, setFormData] = useState<StaffScheduleRequest>({
    staffId: 0,
    hotelId: 0,
    scheduleDate: '',
    startTime: '',
    endTime: '',
    shiftType: 'MORNING',
    department: 'FRONTDESK',
    role: '',
    notes: ''
  });

  // Helper to check if user is hotel admin
  const isHotelAdmin = user?.role === 'HOTEL_ADMIN';

  const shiftTypes = [
    'MORNING', 'AFTERNOON', 'EVENING', 'NIGHT', 'FULL_DAY', 'SPLIT_SHIFT'
  ];

  const statuses = [
    'SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'
  ];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching initial data...');
        console.log('Current token:', token ? 'Token available' : 'No token');
        console.log('Token length:', token?.length || 0);
        
        if (!token) {
          console.warn('No authentication token available');
          return;
        }
        
        const [schedulesResponse, hotelsResponse, staffResponse] = await Promise.all([
          fetch(buildApiUrl('/staff-schedules'), {
            method: 'GET',
            headers: getAuthHeaders(token),
          }).then(res => res.ok ? res.json() : []).catch(err => {
            console.warn('Failed to fetch schedules:', err);
            return [];
          }),
          fetch(buildApiUrl('/hotels-mgmt/list'), {
            method: 'GET',
            headers: getAuthHeaders(token),
          }).then(res => res.ok ? res.json() : []).catch(err => {
            console.warn('Failed to fetch hotels:', err);
            return [];
          }),
          fetch(buildApiUrl('/staff-schedules/staff'), {
            method: 'GET',
            headers: getAuthHeaders(token),
          }).then(res => res.ok ? res.json() : []).catch(err => {
            console.error('Failed to fetch staff:', err);
            return [];
          })
        ]);
        
        console.log('API Responses:', {
          schedules: schedulesResponse?.length || 0,
          hotels: hotelsResponse?.length || 0,
          staff: staffResponse?.length || 0
        });
        
        setSchedules(schedulesResponse || []);
        setHotels(hotelsResponse || []);
        setStaff(staffResponse || []);
        
        // Auto-select hotel for hotel admins
        if (isHotelAdmin && user?.hotelId) {
          const userHotelId = parseInt(user.hotelId);
          setSelectedHotel(userHotelId);
          setFormData(prev => ({ ...prev, hotelId: userHotelId }));
        }
        
        if (!staffResponse || staffResponse.length === 0) {
          console.warn('No staff members found. This might indicate an authentication or permission issue.');
        }
        
        const departmentSet = new Set<string>();
        schedulesResponse?.forEach((s: any) => {
          if (s.department && typeof s.department === 'string') {
            departmentSet.add(s.department);
          }
        });
        const uniqueDepartments = Array.from(departmentSet);
        if (uniqueDepartments.length > 0) {
          setDepartments(uniqueDepartments);
        } else {
          setDepartments(['FRONTDESK', 'HOUSEKEEPING', 'MAINTENANCE', 'SECURITY', 'RESTAURANT', 'CONCIERGE', 'MANAGEMENT']);
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(`Failed to load data: ${err.response?.data?.message || err.message}`);
        setDepartments(['FRONTDESK', 'HOUSEKEEPING', 'MAINTENANCE', 'SECURITY', 'RESTAURANT', 'CONCIERGE', 'MANAGEMENT']);
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [token, isHotelAdmin, user?.hotelId]);

  useEffect(() => {
    fetchSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHotel, selectedDepartment, selectedDate, selectedStatus]);

  const fetchSchedules = async () => {
    try {
      if (!token) {
        console.warn('No authentication token available for fetchSchedules');
        return;
      }
      
      const params = new URLSearchParams();
      if (selectedHotel) params.append('hotelId', selectedHotel.toString());
      if (selectedDepartment) params.append('department', selectedDepartment);
      if (selectedDate) params.append('date', selectedDate);
      if (selectedStatus) params.append('status', selectedStatus);
      
      const response = await fetch(buildApiUrl(`/staff-schedules?${params.toString()}`), {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setError('Failed to load schedules');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      
      if (!token) {
        setError('Authentication token not available');
        return;
      }
      
      if (editingSchedule) {
        const response = await fetch(buildApiUrl(`/staff-schedules/${editingSchedule.id}`), {
          method: 'PUT',
          headers: getAuthHeaders(token),
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setSuccess('Schedule updated successfully');
      } else {
        const response = await fetch(buildApiUrl('/staff-schedules'), {
          method: 'POST',
          headers: getAuthHeaders(token),
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server response:', errorText);
          
          // Try to parse JSON error message
          let errorMessage = 'Failed to save schedule';
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (parseError) {
            // If JSON parsing fails, use the raw text or a generic message
            errorMessage = errorText || errorMessage;
          }
          
          throw new Error(errorMessage);
        }

        setSuccess('Schedule created successfully');
      }
      
      setShowModal(false);
      setEditingSchedule(null);
      resetForm();
      await fetchSchedules();
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      // Extract the error message from various possible error formats
      let errorMessage = 'Failed to save schedule';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
    }
  };

  const handleEdit = (schedule: StaffSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      staffId: schedule.staffId,
      hotelId: schedule.hotelId,
      scheduleDate: schedule.scheduleDate,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      shiftType: schedule.shiftType,
      department: schedule.department,
      notes: schedule.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    setScheduleToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (scheduleToDelete) {
      try {
        if (!token) {
          setError('Authentication token not available');
          return;
        }
        
        const response = await fetch(buildApiUrl(`/staff-schedules/${scheduleToDelete}`), {
          method: 'DELETE',
          headers: getAuthHeaders(token),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setSuccess('Schedule deleted successfully');
        await fetchSchedules();
      } catch (error) {
        console.error('Error deleting schedule:', error);
        setError('Failed to delete schedule');
      } finally {
        setShowDeleteDialog(false);
        setScheduleToDelete(null);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setScheduleToDelete(null);
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      if (!token) {
        setError('Authentication token not available');
        return;
      }
      
      const response = await fetch(buildApiUrl(`/staff-schedules/${id}/status`), {
        method: 'PATCH',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setSuccess('Schedule status updated successfully');
      await fetchSchedules();
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update schedule status');
    }
  };

  const resetForm = () => {
    const defaultHotelId = isHotelAdmin && user?.hotelId ? parseInt(user.hotelId) : 0;
    setFormData({
      staffId: 0,
      hotelId: defaultHotelId,
      scheduleDate: '',
      startTime: '',
      endTime: '',
      shiftType: 'MORNING',
      department: 'FRONTDESK',
      notes: ''
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const clearFilters = () => {
    setSelectedHotel('');
    setSelectedDepartment('');
    setSelectedDate('');
    setSelectedStatus('');
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedSchedules = schedules.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleFileUpload = async () => {
    if (!uploadFile) {
      setError('Please select a file to upload');
      return;
    }

    if (!token) {
      setError('Authentication token not available');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      setError(null);
      const response = await fetch(buildApiUrl('/staff-schedules/upload'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSuccess(`Successfully uploaded ${data.totalSchedules} schedules (${data.successCount} succeeded, ${data.failureCount} failed)`);
      setShowUploadModal(false);
      setUploadFile(null);
      await fetchSchedules();
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setError(error.message || 'Failed to upload schedule file');
    }
  };

  const downloadTemplate = () => {
    // Create a CSV template
    const csvContent = `Staff Email,Hotel Name,Schedule Date (YYYY-MM-DD),Start Time (HH:MM),End Time (HH:MM),Shift Type,Department,Notes
john.doe@example.com,Grand Hotel,2024-08-25,09:00,17:00,MORNING,FRONTDESK,Regular morning shift
jane.smith@example.com,Grand Hotel,2024-08-25,17:00,01:00,EVENING,HOUSEKEEPING,Evening cleaning shift`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'schedule_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading staff schedules...</Typography>
        </Box>
      </Box>
    );
  }

  // Check if user has permission to access this page
  if (user && !['HOTEL_ADMIN', 'FRONTDESK'].includes(user.role)) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="warning">
          <Typography variant="h6">Access Restricted</Typography>
          <Typography>
            You need HOTEL_ADMIN or FRONTDESK role to access staff schedule management. 
            Your current role is: {user.role}
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Filters Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" component="h2">
              Filters
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingSchedule(null);
                resetForm();
                setShowModal(true);
              }}
            >
              Add Schedule
            </Button>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => setShowUploadModal(true)}
            >
              Upload Schedule
            </Button>
          </Box>
        </Box>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Hotel</InputLabel>
              <Select
                value={selectedHotel}
                label="Hotel"
                onChange={(e) => setSelectedHotel(e.target.value as number | '')}
                disabled={isHotelAdmin} // Disable for hotel admins
                sx={isHotelAdmin ? { backgroundColor: 'grey.100' } : {}}
              >
                {isHotelAdmin && user?.hotelId && user?.hotelName ? (
                  <MenuItem value={parseInt(user.hotelId)}>{user.hotelName}</MenuItem>
                ) : (
                  <>
                    <MenuItem value="">All Hotels</MenuItem>
                    {hotels.map(hotel => (
                      <MenuItem key={hotel.id} value={hotel.id}>{hotel.name}</MenuItem>
                    ))}
                  </>
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={selectedDepartment}
                label="Department"
                onChange={(e) => setSelectedDepartment(e.target.value as string)}
              >
                <MenuItem value="">All Departments</MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept} value={dept}>{dept.replace('_', ' ')}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Status"
                onChange={(e) => setSelectedStatus(e.target.value as string)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                {statuses.map(status => (
                  <MenuItem key={status} value={status}>{status.replace('_', ' ')}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              fullWidth
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Schedules Table */}
      <Paper elevation={1}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell><strong>Staff Member</strong></TableCell>
                <TableCell><strong>Hotel</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Time</strong></TableCell>
                <TableCell><strong>Shift</strong></TableCell>
                <TableCell><strong>Department</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Notes</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedSchedules.map((schedule) => (
                <TableRow 
                  key={schedule.id} 
                  hover
                  sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle2" fontWeight="medium">
                        {schedule.staffName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      {schedule.hotelName}
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(schedule.scheduleDate)}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <TimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={schedule.shiftType.replace('_', ' ')} 
                      size="small" 
                      variant="outlined"
                      color="info"
                    />
                  </TableCell>
                  <TableCell>{schedule.department.replace('_', ' ')}</TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={schedule.status}
                        onChange={(e) => handleStatusUpdate(schedule.id, e.target.value)}
                        variant="outlined"
                        size="small"
                      >
                        {statuses.map(status => (
                          <MenuItem key={status} value={status}>
                            {status.replace('_', ' ')}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        maxWidth: 150, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {schedule.notes || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Edit Schedule">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleEdit(schedule)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Schedule">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDelete(schedule.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {schedules.length === 0 && (
          <Box textAlign="center" py={8}>
            <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No schedules found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create a new schedule to get started
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingSchedule(null);
                resetForm();
                setShowModal(true);
              }}
            >
              Add First Schedule
            </Button>
          </Box>
        )}

        {schedules.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={schedules.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </Paper>

      {/* Add/Edit Schedule Dialog */}
      <Dialog 
        open={showModal} 
        onClose={() => setShowModal(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          elevation: 8,
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center">
            <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
            {editingSchedule ? 'Edit Schedule' : 'Create New Schedule'}
          </Box>
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            {/* Display error within dialog */}
            {error && (
              <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Staff Member</InputLabel>
                  <Select
                    value={formData.staffId}
                    label="Staff Member"
                    onChange={(e) => {
                      const selectedStaffId = parseInt(e.target.value as string);
                      const selectedStaff = staff.find(member => member.id === selectedStaffId);
                      
                      // Get primary role from either roles array or single role field
                      let selectedRole = '';
                      if (selectedStaff?.roles && selectedStaff.roles.length > 0) {
                        selectedRole = selectedStaff.roles[0]; // Use first role as primary
                      } else if (selectedStaff?.role) {
                        selectedRole = selectedStaff.role;
                      }
                      
                      // Map role to department for backend compatibility
                      let department = 'FRONTDESK'; // default
                      if (selectedRole === 'HOUSEKEEPING') department = 'HOUSEKEEPING';
                      else if (selectedRole === 'HOTEL_ADMIN' || selectedRole === 'FRONTDESK') department = 'FRONTDESK';
                      
                      setFormData({
                        ...formData, 
                        staffId: selectedStaffId,
                        role: selectedRole,
                        department: department
                      });
                    }}
                    required
                  >
                    <MenuItem value="">Select Staff Member</MenuItem>
                    {staff.length === 0 ? (
                      <MenuItem disabled value="">No staff members available</MenuItem>
                    ) : (
                      staff.map(member => {
                        // Get primary role for display
                        let displayRole = '';
                        if (member.roles && member.roles.length > 0) {
                          displayRole = member.roles[0]; // Use first role as primary
                        } else if (member.role) {
                          displayRole = member.role;
                        }
                        
                        return (
                          <MenuItem key={member.id} value={member.id}>
                            {member.firstName} {member.lastName} ({displayRole})
                          </MenuItem>
                        );
                      })
                    )}
                  </Select>
                  {staff.length === 0 && (
                    <Typography variant="caption" color="warning.main" sx={{ mt: 1 }}>
                      No staff members found. Please check your authentication or contact your administrator.
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Hotel</InputLabel>
                  <Select
                    value={formData.hotelId}
                    label="Hotel"
                    onChange={(e) => setFormData({...formData, hotelId: parseInt(e.target.value as string)})}
                    required
                    disabled={isHotelAdmin} // Disable for hotel admins
                    sx={isHotelAdmin ? { backgroundColor: 'grey.100' } : {}}
                  >
                    {isHotelAdmin && user?.hotelId && user?.hotelName ? (
                      <MenuItem value={parseInt(user.hotelId)}>{user.hotelName}</MenuItem>
                    ) : (
                      <>
                        <MenuItem value="">Select Hotel</MenuItem>
                        {hotels.map(hotel => (
                          <MenuItem key={hotel.id} value={hotel.id}>{hotel.name}</MenuItem>
                        ))}
                      </>
                    )}
                  </Select>
                  {isHotelAdmin && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      Hotel is automatically selected based on your admin role
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date"
                  value={formData.scheduleDate}
                  onChange={(e) => setFormData({...formData, scheduleDate: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ 
                    min: new Date().toISOString().split('T')[0] // Prevent past dates
                  }}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="time"
                  label="Start Time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="time"
                  label="End Time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Shift Type</InputLabel>
                  <Select
                    value={formData.shiftType}
                    label="Shift Type"
                    onChange={(e) => setFormData({...formData, shiftType: e.target.value})}
                    required
                  >
                    {shiftTypes.map(type => (
                      <MenuItem key={type} value={type}>{type.replace('_', ' ')}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Role"
                  value={formData.role ? formData.role.replace('_', ' ') : ''}
                  disabled
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                  helperText="Role is automatically set based on selected staff member"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes or instructions..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setShowModal(false)} 
              color="inherit"
              startIcon={<CancelIcon />}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              startIcon={editingSchedule ? <SaveIcon /> : <AddIcon />}
              sx={{ ml: 1 }}
            >
              {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Upload Schedule Dialog */}
      <Dialog 
        open={showUploadModal} 
        onClose={() => setShowUploadModal(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          elevation: 8,
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center">
            <CloudUploadIcon sx={{ mr: 1, color: 'primary.main' }} />
            Upload Schedule File
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          <Box textAlign="center" py={3}>
            <CloudUploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Upload CSV Schedule File
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Upload a CSV file with staff schedules. The file should contain columns for staff email, 
              hotel name, date, times, shift type, department, and notes.
            </Typography>
            
            <Box 
              sx={{ 
                border: 2, 
                borderStyle: 'dashed',
                borderColor: 'divider', 
                borderRadius: 2, 
                p: 3, 
                mb: 3,
                backgroundColor: 'grey.50',
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'grey.100' }
              }}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                style={{ display: 'none' }}
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
              <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body1">
                {uploadFile ? uploadFile.name : 'Click to select a file or drag and drop'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Supported formats: CSV, Excel (.xlsx, .xls)
              </Typography>
            </Box>

            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={downloadTemplate}
              sx={{ mb: 2 }}
            >
              Download Template
            </Button>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => {
              setShowUploadModal(false);
              setUploadFile(null);
            }} 
            color="inherit"
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleFileUpload}
            variant="contained" 
            startIcon={<CloudUploadIcon />}
            disabled={!uploadFile}
            sx={{ ml: 1 }}
          >
            Upload Schedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={cancelDelete}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center">
            <DeleteIcon sx={{ mr: 1, color: 'error.main' }} />
            Confirm Delete
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this schedule?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone. The schedule will be permanently removed from the system.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={cancelDelete}
            color="inherit"
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete}
            variant="contained" 
            color="error"
            startIcon={<DeleteIcon />}
            sx={{ ml: 1 }}
          >
            Delete Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffScheduleManagement;
