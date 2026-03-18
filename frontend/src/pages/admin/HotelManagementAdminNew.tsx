import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  CircularProgress,
  MenuItem,
  IconButton,
  Tabs,
  Tab,
  Card,
  CardContent
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  Visibility as ViewIcon, 
  Edit as EditIcon, 
  ToggleOn as ToggleOnIcon, 
  ToggleOff as ToggleOffIcon, 
  Add as AddIcon,
  RateReview as ReviewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { adminApiService, HotelDTO, UpdateHotelRequest } from '../../services/adminApi';
import HotelEditDialog from '../../components/hotel/HotelEditDialog';
import PremiumTextField from '../../components/common/PremiumTextField';
import PremiumSelect from '../../components/common/PremiumSelect';
import { COLORS, addAlpha, getGradient } from '../../theme/themeColors';

interface Hotel extends HotelDTO {}

interface HotelRegistration {
  id: number;
  hotelName: string;
  description: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
  phone: string;
  contactEmail: string;
  contactPerson: string;
  licenseNumber?: string;
  taxId?: string;
  websiteUrl?: string;
  facilityAmenities?: string;
  numberOfRooms?: number;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: number;
  reviewComments?: string;
  approvedHotelId?: number;
  tenantId?: string;
}

interface RegistrationStatistics {
  pending: number;
  underReview: number;
  approved: number;
  rejected: number;
  total: number;
}

const HotelManagementAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // State management
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [registrations, setRegistrations] = useState<HotelRegistration[]>([]);
  const [registrationStats, setRegistrationStats] = useState<RegistrationStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog state
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedRegistration, setSelectedRegistration] = useState<HotelRegistration | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [registrationViewDialogOpen, setRegistrationViewDialogOpen] = useState(false);
  const [toggleStatusDialogOpen, setToggleStatusDialogOpen] = useState(false);
  const [toggleStatusReason, setToggleStatusReason] = useState('');

  // Approval/Rejection form state
  const [approvalComments, setApprovalComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [tenantId, setTenantId] = useState('');

  // Registration form state
  const [registrationForm, setRegistrationForm] = useState({
    hotelName: '',
    description: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    phone: '',
    contactEmail: '',
    contactPerson: '',
    licenseNumber: '',
    taxId: '',
    websiteUrl: '',
    facilityAmenities: '',
    numberOfRooms: '',
    checkInTime: '15:00',
    checkOutTime: '11:00'
  });

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Set token in API service when component mounts
  useEffect(() => {
    if (token) {
      adminApiService.setToken(token);
    }
  }, [token]);

  // Load hotels data
  const loadHotels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApiService.getHotels(0, 1000); // Get all hotels for now
      setHotels(response.content || []);
    } catch (err) {
      // console.error('Error loading hotels:', err);
      setError('Failed to load hotels. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHotels();
  }, [loadHotels]);

  // Load hotel registrations
  const loadRegistrations = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/hotel-registrations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data.content || data);
      }
    } catch (err) {
      // console.error('Error loading registrations:', err);
    }
  }, [token]);

  const loadRegistrationStatistics = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/hotel-registrations/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRegistrationStats(data);
      }
    } catch (err) {
      // console.error('Error loading registration statistics:', err);
    }
  }, [token]);

  // Load registrations when tab changes
  useEffect(() => {
    if (activeTab === 1) {
      loadRegistrations();
      loadRegistrationStatistics();
    }
  }, [activeTab, loadRegistrations, loadRegistrationStatistics]);

  // Filter hotels based on search term and status
  const filteredHotels = useMemo(() => {
    return hotels.filter(hotel => {
      const matchesSearch = (hotel.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || false) ||
                           (hotel.city?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || false) ||
                           (hotel.email && hotel.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && hotel.isActive) ||
                           (statusFilter === 'inactive' && !hotel.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [hotels, debouncedSearchTerm, statusFilter]);

  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Tab handling
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Hotel registration functions
  const handleRegisterHotel = () => {
    setRegisterDialogOpen(true);
  };

  const handleRegistrationSubmit = async () => {
    try {
      const response = await fetch('/api/admin/hotel-registrations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hotelName: registrationForm.hotelName,
          description: registrationForm.description,
          address: registrationForm.address,
          city: registrationForm.city,
          state: registrationForm.state,
          country: registrationForm.country,
          zipCode: registrationForm.zipCode,
          phone: registrationForm.phone,
          contactEmail: registrationForm.contactEmail,
          contactPerson: registrationForm.contactPerson,
          licenseNumber: registrationForm.licenseNumber,
          taxId: registrationForm.taxId,
          websiteUrl: registrationForm.websiteUrl,
          facilityAmenities: registrationForm.facilityAmenities,
          numberOfRooms: registrationForm.numberOfRooms ? parseInt(registrationForm.numberOfRooms) : null,
          checkInTime: registrationForm.checkInTime,
          checkOutTime: registrationForm.checkOutTime
        })
      });

      if (response.ok) {
        setRegisterDialogOpen(false);
        setRegistrationForm({
          hotelName: '',
          description: '',
          address: '',
          city: '',
          state: '',
          country: '',
          zipCode: '',
          phone: '',
          contactEmail: '',
          contactPerson: '',
          licenseNumber: '',
          taxId: '',
          websiteUrl: '',
          facilityAmenities: '',
          numberOfRooms: '',
          checkInTime: '15:00',
          checkOutTime: '11:00'
        });
        setSuccess('Hotel registration submitted successfully');
        setTimeout(() => setSuccess(null), 3000);
        if (activeTab === 1) {
          loadRegistrations();
          loadRegistrationStatistics();
        }
      } else {
        throw new Error('Failed to submit registration');
      }
    } catch (err) {
      // console.error('Error submitting registration:', err);
      setError('Failed to submit hotel registration. Please try again.');
    }
  };

  const handleRegistrationFormChange = (field: string, value: string) => {
    setRegistrationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const viewRegistration = (registration: HotelRegistration) => {
    setSelectedRegistration(registration);
    setApprovalComments('');
    setRejectionReason('');
    setTenantId('');
    setRegistrationViewDialogOpen(true);
  };

  const handleApproveRegistration = async () => {
    if (!selectedRegistration || !tenantId.trim()) {
      setError('Tenant ID is required for approval');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const response = await fetch(`/api/admin/hotel-registrations/${selectedRegistration.id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          comments: approvalComments,
          tenantId: tenantId
        })
      });

      if (response.ok) {
        setRegistrationViewDialogOpen(false);
        setSelectedRegistration(null);
        setApprovalComments('');
        setTenantId('');
        setSuccess('Hotel registration approved successfully! The hotel is now active.');
        setTimeout(() => setSuccess(null), 5000);
        
        // Refresh data
        loadRegistrations();
        loadRegistrationStatistics();
        loadHotels();
      } else {
        throw new Error('Failed to approve registration');
      }
    } catch (err) {
      setError('Failed to approve registration. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRejectRegistration = async () => {
    if (!selectedRegistration || !rejectionReason.trim()) {
      setError('Rejection reason is required');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const response = await fetch(`/api/admin/hotel-registrations/${selectedRegistration.id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: rejectionReason
        })
      });

      if (response.ok) {
        setRegistrationViewDialogOpen(false);
        setSelectedRegistration(null);
        setRejectionReason('');
        setSuccess('Hotel registration rejected successfully');
        setTimeout(() => setSuccess(null), 3000);
        
        // Refresh data
        loadRegistrations();
        loadRegistrationStatistics();
      } else {
        throw new Error('Failed to reject registration');
      }
    } catch (err) {
      setError('Failed to reject hotel registration. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusColors = {
    PENDING: 'warning',
    UNDER_REVIEW: 'info',
    APPROVED: 'success',
    REJECTED: 'error',
    CANCELLED: 'default',
  } as const;

  // View hotel details
  const handleViewHotel = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedHotel(null);
  };

  // Edit hotel
  const handleEditHotel = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setEditDialogOpen(true);
  };

  const handleUpdateHotel = async (hotelData: Partial<Hotel>) => {
    if (!selectedHotel || !token) return;

    try {
      const updateRequest: UpdateHotelRequest = {
        name: hotelData.name || selectedHotel.name,
        description: hotelData.description || selectedHotel.description || '',
        address: hotelData.address || selectedHotel.address || '',
        city: hotelData.city || selectedHotel.city || '',
        country: hotelData.country || selectedHotel.country || '',
        phone: hotelData.phone || selectedHotel.phone || '',
        email: hotelData.email || selectedHotel.email || '',
        tenantId: selectedHotel.tenantId || null
      };

      await adminApiService.updateHotel(selectedHotel.id, updateRequest);
      setEditDialogOpen(false);
      setSelectedHotel(null);
      loadHotels(); // Refresh the list
      setSuccess('Hotel updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      // console.error('Error updating hotel:', err);
      setError('Failed to update hotel. Please try again.');
    }
  };

  // Toggle hotel status
  const handleToggleHotelStatus = async (hotel: Hotel) => {
    if (!token) return;
    
    try {
      setLoading(true);
      await adminApiService.toggleHotelStatus(hotel.id, toggleStatusReason);
      setToggleStatusDialogOpen(false);
      setToggleStatusReason('');
      setSelectedHotel(null);
      loadHotels();
      setError(null);
      setSuccess(`Hotel ${hotel.isActive ? 'deactivated' : 'activated'} successfully`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      // console.error('Error toggling hotel status:', err);
      setError('Failed to update hotel status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
            Hotel Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleRegisterHotel}
            sx={{ mr: 2 }}
          >
            Register Hotel
          </Button>
        </Box>

        {/* Error and Success Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTabs-scrollButtons': {
                '&.Mui-disabled': { opacity: 0.3 },
              },
            }}
          >
            <Tab label="Existing Hotels" />
            <Tab label="Hotel Registrations" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {activeTab === 0 && (
          <>
            {/* Search and Filters */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <PremiumTextField
                    fullWidth
                    label="Search hotels..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, city, or email"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <PremiumSelect
                    fullWidth
                    label="Status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Hotels</MenuItem>
                    <MenuItem value="active">Active Only</MenuItem>
                    <MenuItem value="inactive">Inactive Only</MenuItem>
                  </PremiumSelect>
                </Grid>
              </Grid>
            </Paper>

            {/* Hotels Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      background: getGradient('slate'),
                      boxShadow: `0 4px 12px ${addAlpha(COLORS.SLATE_500, 0.15)}`,
                      '& .MuiTableCell-head': {
                        color: COLORS.WHITE,
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        border: 'none',
                        padding: '20px 16px',
                        position: 'relative',
                        textShadow: `0 1px 2px ${addAlpha(COLORS.BLACK, 0.1)}`,
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '3px',
                          background: `linear-gradient(90deg, ${addAlpha(COLORS.WHITE, 0.6)} 0%, ${addAlpha(COLORS.WHITE, 0.8)} 50%, ${addAlpha(COLORS.WHITE, 0.6)} 100%)`
                        }
                      }
                    }}
                  >
                    <TableCell>Hotel Name</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Rooms</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : filteredHotels.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No hotels found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredHotels
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((hotel) => (
                        <TableRow key={hotel.id}>
                          <TableCell>
                            <Typography variant="subtitle2">{hotel.name}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {hotel.city}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {hotel.country}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{hotel.email}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {hotel.phone}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {hotel.availableRooms || 0} / {hotel.totalRooms || 0}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              Not available
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={hotel.isActive ? 'Active' : 'Inactive'}
                              color={hotel.isActive ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleViewHotel(hotel)}
                                title="View Details"
                              >
                                <ViewIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedHotel(hotel);
                                  setToggleStatusReason('');
                                  setToggleStatusDialogOpen(true);
                                }}
                                title={hotel.isActive ? "Deactivate" : "Activate"}
                                color={hotel.isActive ? "success" : "error"}
                              >
                                {hotel.isActive ? <ToggleOnIcon /> : <ToggleOffIcon />}
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={filteredHotels.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </TableContainer>
          </>
        )}

        {/* Hotel Registrations Tab */}
        {activeTab === 1 && (
          <>
            {/* Registration Statistics */}
            {registrationStats && (
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total
                      </Typography>
                      <Typography variant="h4">
                        {registrationStats.total}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Pending
                      </Typography>
                      <Typography variant="h4" color="warning.main">
                        {registrationStats.pending}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Under Review
                      </Typography>
                      <Typography variant="h4" color="info.main">
                        {registrationStats.underReview}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Approved
                      </Typography>
                      <Typography variant="h4" color="success.main">
                        {registrationStats.approved}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Rejected
                      </Typography>
                      <Typography variant="h4" color="error.main">
                        {registrationStats.rejected}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Registration Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      background: getGradient('slate'),
                      boxShadow: `0 4px 12px ${addAlpha(COLORS.SLATE_500, 0.15)}`,
                      '& .MuiTableCell-head': {
                        color: COLORS.WHITE,
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        border: 'none',
                        padding: '20px 16px',
                        position: 'relative',
                        textShadow: `0 1px 2px ${addAlpha(COLORS.BLACK, 0.1)}`,
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '3px',
                          background: `linear-gradient(90deg, ${addAlpha(COLORS.WHITE, 0.6)} 0%, ${addAlpha(COLORS.WHITE, 0.8)} 50%, ${addAlpha(COLORS.WHITE, 0.6)} 100%)`
                        }
                      }
                    }}
                  >
                    <TableCell>Hotel Name</TableCell>
                    <TableCell>Contact Person</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>City</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {registrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {registration.hotelName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {registration.address}
                        </Typography>
                      </TableCell>
                      <TableCell>{registration.contactPerson}</TableCell>
                      <TableCell>{registration.contactEmail}</TableCell>
                      <TableCell>{registration.city}, {registration.country}</TableCell>
                      <TableCell>
                        <Chip 
                          label={registration.status} 
                          color={statusColors[registration.status]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(registration.submittedAt)}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ReviewIcon />}
                          onClick={() => viewRegistration(registration)}
                          sx={{
                            borderColor: COLORS.PRIMARY,
                            color: COLORS.PRIMARY,
                            '&:hover': {
                              borderColor: COLORS.PRIMARY_PRESSED,
                              backgroundColor: COLORS.SLATE_50
                            }
                          }}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* Hotel Registration Dialog */}
        <Dialog open={registerDialogOpen} onClose={() => setRegisterDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Register New Hotel</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  label="Hotel Name"
                  fullWidth
                  required
                  value={registrationForm.hotelName}
                  onChange={(e) => handleRegistrationFormChange('hotelName', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  label="Contact Person"
                  fullWidth
                  required
                  value={registrationForm.contactPerson}
                  onChange={(e) => handleRegistrationFormChange('contactPerson', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12}>
                <PremiumTextField
                  label="Description"
                  multiline
                  rows={3}
                  fullWidth
                  value={registrationForm.description}
                  onChange={(e) => handleRegistrationFormChange('description', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12}>
                <PremiumTextField
                  label="Address"
                  fullWidth
                  required
                  value={registrationForm.address}
                  onChange={(e) => handleRegistrationFormChange('address', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  label="City"
                  fullWidth
                  required
                  value={registrationForm.city}
                  onChange={(e) => handleRegistrationFormChange('city', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  label="Country"
                  fullWidth
                  required
                  value={registrationForm.country}
                  onChange={(e) => handleRegistrationFormChange('country', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  label="Phone"
                  fullWidth
                  required
                  value={registrationForm.phone}
                  onChange={(e) => handleRegistrationFormChange('phone', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  label="Contact Email"
                  type="email"
                  fullWidth
                  required
                  value={registrationForm.contactEmail}
                  onChange={(e) => handleRegistrationFormChange('contactEmail', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  label="License Number"
                  fullWidth
                  value={registrationForm.licenseNumber}
                  onChange={(e) => handleRegistrationFormChange('licenseNumber', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  label="Tax ID"
                  fullWidth
                  value={registrationForm.taxId}
                  onChange={(e) => handleRegistrationFormChange('taxId', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <PremiumTextField
                  label="Website URL"
                  fullWidth
                  value={registrationForm.websiteUrl}
                  onChange={(e) => handleRegistrationFormChange('websiteUrl', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <PremiumTextField
                  label="Facility Amenities"
                  multiline
                  rows={2}
                  fullWidth
                  value={registrationForm.facilityAmenities}
                  onChange={(e) => handleRegistrationFormChange('facilityAmenities', e.target.value)}
                  placeholder="WiFi, Pool, Spa, Restaurant, etc."
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <PremiumTextField
                  label="Number of Rooms"
                  type="number"
                  fullWidth
                  value={registrationForm.numberOfRooms}
                  onChange={(e) => handleRegistrationFormChange('numberOfRooms', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <PremiumTextField
                  label="Check-in Time"
                  type="time"
                  fullWidth
                  value={registrationForm.checkInTime}
                  onChange={(e) => handleRegistrationFormChange('checkInTime', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <PremiumTextField
                  label="Check-out Time"
                  type="time"
                  fullWidth
                  value={registrationForm.checkOutTime}
                  onChange={(e) => handleRegistrationFormChange('checkOutTime', e.target.value)}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRegisterDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleRegistrationSubmit}
              disabled={!registrationForm.hotelName || !registrationForm.contactPerson || !registrationForm.contactEmail}
            >
              Submit Registration
            </Button>
          </DialogActions>
        </Dialog>

        {/* Registration Review Dialog */}
        <Dialog open={registrationViewDialogOpen} onClose={() => setRegistrationViewDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle
            sx={{
              borderBottom: `2px solid ${COLORS.SECONDARY}`,
              pb: 2,
              fontWeight: 600,
              color: COLORS.PRIMARY
            }}
          >
            Review Hotel Registration
          </DialogTitle>
          <DialogContent>
            {selectedRegistration && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ color: COLORS.PRIMARY, fontWeight: 600, mb: 2 }}>
                    Hotel Information
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    label="Hotel Name"
                    fullWidth
                    value={selectedRegistration.hotelName}
                    disabled
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    label="Contact Person"
                    fullWidth
                    value={selectedRegistration.contactPerson}
                    disabled
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <PremiumTextField
                    label="Description"
                    multiline
                    rows={3}
                    fullWidth
                    value={selectedRegistration.description}
                    disabled
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <PremiumTextField
                    label="Address"
                    fullWidth
                    value={selectedRegistration.address}
                    disabled
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    label="City"
                    fullWidth
                    value={selectedRegistration.city}
                    disabled
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    label="Country"
                    fullWidth
                    value={selectedRegistration.country}
                    disabled
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    label="Phone"
                    fullWidth
                    value={selectedRegistration.phone}
                    disabled
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    label="Contact Email"
                    fullWidth
                    value={selectedRegistration.contactEmail}
                    disabled
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    label="Status"
                    fullWidth
                    value={selectedRegistration.status}
                    disabled
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    label="Submitted At"
                    fullWidth
                    value={formatDate(selectedRegistration.submittedAt)}
                    disabled
                  />
                </Grid>

                {selectedRegistration.licenseNumber && (
                  <Grid item xs={12} sm={6}>
                    <PremiumTextField
                      label="License Number"
                      fullWidth
                      value={selectedRegistration.licenseNumber}
                      disabled
                    />
                  </Grid>
                )}

                {selectedRegistration.taxId && (
                  <Grid item xs={12} sm={6}>
                    <PremiumTextField
                      label="Tax ID"
                      fullWidth
                      value={selectedRegistration.taxId}
                      disabled
                    />
                  </Grid>
                )}

                {selectedRegistration.websiteUrl && (
                  <Grid item xs={12}>
                    <PremiumTextField
                      label="Website URL"
                      fullWidth
                      value={selectedRegistration.websiteUrl}
                      disabled
                    />
                  </Grid>
                )}

                {selectedRegistration.facilityAmenities && (
                  <Grid item xs={12}>
                    <PremiumTextField
                      label="Facility Amenities"
                      multiline
                      rows={2}
                      fullWidth
                      value={selectedRegistration.facilityAmenities}
                      disabled
                    />
                  </Grid>
                )}

                {selectedRegistration.numberOfRooms && (
                  <Grid item xs={12} sm={4}>
                    <PremiumTextField
                      label="Number of Rooms"
                      fullWidth
                      value={selectedRegistration.numberOfRooms}
                      disabled
                    />
                  </Grid>
                )}

                {selectedRegistration.checkInTime && (
                  <Grid item xs={12} sm={4}>
                    <PremiumTextField
                      label="Check-in Time"
                      fullWidth
                      value={selectedRegistration.checkInTime}
                      disabled
                    />
                  </Grid>
                )}

                {selectedRegistration.checkOutTime && (
                  <Grid item xs={12} sm={4}>
                    <PremiumTextField
                      label="Check-out Time"
                      fullWidth
                      value={selectedRegistration.checkOutTime}
                      disabled
                    />
                  </Grid>
                )}

                {selectedRegistration.status === 'PENDING' && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ color: COLORS.PRIMARY, fontWeight: 600, mt: 2, mb: 1 }}>
                        Review Actions
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <PremiumTextField
                        label="Tenant ID (Required for Approval)"
                        fullWidth
                        value={tenantId}
                        onChange={(e) => setTenantId(e.target.value)}
                        placeholder="Enter tenant identifier"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <PremiumTextField
                        label="Approval Comments (Optional)"
                        multiline
                        rows={2}
                        fullWidth
                        value={approvalComments}
                        onChange={(e) => setApprovalComments(e.target.value)}
                        placeholder="Add any comments for approval"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <PremiumTextField
                        label="Rejection Reason (Required for Rejection)"
                        multiline
                        rows={2}
                        fullWidth
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Provide reason if rejecting this registration"
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${COLORS.BORDER_LIGHT}` }}>
            <Button 
              onClick={() => setRegistrationViewDialogOpen(false)}
              sx={{ color: COLORS.TEXT_SECONDARY }}
            >
              Close
            </Button>
            {selectedRegistration?.status === 'PENDING' && (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<RejectIcon />}
                  onClick={handleRejectRegistration}
                  disabled={!rejectionReason.trim()}
                  sx={{
                    borderColor: COLORS.ERROR,
                    '&:hover': {
                      backgroundColor: COLORS.BG_ERROR_LIGHT,
                      borderColor: COLORS.ERROR
                    }
                  }}
                >
                  Reject
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ApproveIcon />}
                  onClick={handleApproveRegistration}
                  disabled={!tenantId.trim()}
                  sx={{
                    backgroundColor: (theme) => theme.palette.success.main,
                    '&:hover': {
                      backgroundColor: (theme) => theme.palette.success.dark
                    }
                  }}
                >
                  Approve
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>

        {/* Toggle Status Confirmation Dialog */}
        <Dialog
          open={toggleStatusDialogOpen}
          onClose={() => {
            setToggleStatusDialogOpen(false);
            setToggleStatusReason('');
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {selectedHotel?.isActive ? 'Deactivate Hotel' : 'Activate Hotel'}
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              Are you sure you want to {selectedHotel?.isActive ? 'deactivate' : 'activate'} hotel "{selectedHotel?.name}"?
            </Typography>
            <PremiumTextField
              label="Reason"
              fullWidth
              required
              multiline
              rows={3}
              value={toggleStatusReason}
              onChange={(e) => setToggleStatusReason(e.target.value)}
              placeholder={`Enter reason for ${selectedHotel?.isActive ? 'deactivation' : 'activation'}...`}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setToggleStatusDialogOpen(false);
              setToggleStatusReason('');
            }}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedHotel && handleToggleHotelStatus(selectedHotel)}
              variant="contained"
              color={selectedHotel?.isActive ? 'error' : 'success'}
              disabled={!toggleStatusReason.trim() || loading}
            >
              {loading ? <CircularProgress size={20} /> : (selectedHotel?.isActive ? 'Deactivate' : 'Activate')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Hotel Dialog */}
        <Dialog open={viewDialogOpen} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
          <DialogTitle>Hotel Details</DialogTitle>
          <DialogContent>
            {selectedHotel && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    label="Hotel Name"
                    fullWidth
                    value={selectedHotel.name || ''}
                    disabled
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    label="Email"
                    type="email"
                    fullWidth
                    value={selectedHotel.email || ''}
                    disabled
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <PremiumTextField
                    label="Description"
                    multiline
                    rows={3}
                    fullWidth
                    value={selectedHotel.description || ''}
                    disabled
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <PremiumTextField
                    label="Address"
                    fullWidth
                    value={selectedHotel.address || ''}
                    disabled
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    label="City"
                    fullWidth
                    value={selectedHotel.city || ''}
                    disabled
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    label="Country"
                    fullWidth
                    value={selectedHotel.country || ''}
                    disabled
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    label="Phone"
                    fullWidth
                    value={selectedHotel.phone || ''}
                    disabled
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    label="Status"
                    fullWidth
                    value={selectedHotel.isActive ? 'Active' : 'Inactive'}
                    disabled
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    label="Total Rooms"
                    fullWidth
                    value={selectedHotel.totalRooms?.toString() || '0'}
                    disabled
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    label="Available Rooms"
                    fullWidth
                    value={selectedHotel.availableRooms?.toString() || '0'}
                    disabled
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    label="Created At"
                    fullWidth
                    value={selectedHotel.createdAt ? new Date(selectedHotel.createdAt).toLocaleString() : ''}
                    disabled
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <PremiumTextField
                    label="Last Updated"
                    fullWidth
                    value={selectedHotel.updatedAt ? new Date(selectedHotel.updatedAt).toLocaleString() : ''}
                    disabled
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseViewDialog}>Close</Button>
            <Button 
              variant="contained" 
              startIcon={<EditIcon />}
              onClick={() => {
                if (selectedHotel) {
                  handleEditHotel(selectedHotel);
                  setViewDialogOpen(false);
                }
              }}
            >
              Edit
            </Button>
          </DialogActions>
        </Dialog>

        {/* Hotel Edit Dialog */}
        <HotelEditDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          onSave={handleUpdateHotel}
          hotel={selectedHotel}
          loading={loading}
        />

      </Box>
    </Container>
  );
};

export default HotelManagementAdmin;
