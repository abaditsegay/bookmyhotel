import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../../config/apiConfig';
import { COLORS, addAlpha } from '../../theme/themeColors';
import {
  Typography,
  Box,
  Button,
  Paper,
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
  Refresh as RefreshIcon,
  RateReview as ReviewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { adminApiService, HotelDTO, UpdateHotelRequest, TenantDTO, ApproveRegistrationRequest, HotelRegistrationResponse } from '../../services/adminApi';
import PremiumTextField from '../../components/common/PremiumTextField';
import PremiumDisplayField from '../../components/common/PremiumDisplayField';
import PremiumSelect from '../../components/common/PremiumSelect';
import { formatEthiopianPhone, normalizeEthiopianPhone } from '../../utils/phoneUtils';
import HotelEditDialog from '../../components/hotel/HotelEditDialog';

interface Hotel extends HotelDTO {}

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
  const [registrations, setRegistrations] = useState<HotelRegistrationResponse[]>([]);
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
  const [selectedRegistration, setSelectedRegistration] = useState<HotelRegistrationResponse | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  // Delete functionality removed - use deactivation instead
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [registrationViewDialogOpen, setRegistrationViewDialogOpen] = useState(false);
  const [registrationEditMode, setRegistrationEditMode] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [toggleStatusDialogOpen, setToggleStatusDialogOpen] = useState(false);
  const [toggleStatusReason, setToggleStatusReason] = useState('');

  // Approval/Rejection form state
  const [approvalComments, setApprovalComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [tenantId, setTenantId] = useState('');

  // Tenant management state
  const [tenants, setTenants] = useState<TenantDTO[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(false);

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
    mobilePaymentPhone: '',
    mobilePaymentPhone2: '',
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

  // Edit registration form state
  const [editRegistrationForm, setEditRegistrationForm] = useState({
    hotelName: '',
    description: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    phone: '',
    mobilePaymentPhone: '',
    mobilePaymentPhone2: '',
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
      adminApiService.setToken(token);
      const response = await adminApiService.getHotelRegistrations(page, rowsPerPage);
      const registrationsData = response.content || response;
      setRegistrations(registrationsData);
      
      // Calculate statistics from loaded registrations
      if (Array.isArray(registrationsData)) {
        setRegistrationStats({
          total: registrationsData.length,
          pending: registrationsData.filter(r => r.status === 'PENDING').length,
          underReview: registrationsData.filter(r => r.status === 'UNDER_REVIEW').length,
          approved: registrationsData.filter(r => r.status === 'APPROVED').length,
          rejected: registrationsData.filter(r => r.status === 'REJECTED').length
        });
      }
    } catch (err) {
      // console.error('Error loading registrations:', err);
    }
  }, [token, page, rowsPerPage]);

  // Load active tenants for dropdown
  const loadTenants = useCallback(async () => {
    try {
      setTenantsLoading(true);
      const response = await adminApiService.getActiveTenants();
      setTenants(response);
    } catch (err) {
      // console.error('Error loading tenants:', err);
    } finally {
      setTenantsLoading(false);
    }
  }, []);

  // Load registrations when tab changes
  useEffect(() => {
    if (activeTab === 0) {
      loadTenants(); // Load tenants when hotels tab is accessed to show tenant names
    } else if (activeTab === 1) {
      loadRegistrations();
      loadTenants(); // Load tenants when registration tab is accessed
    }
  }, [activeTab, loadRegistrations, loadTenants]);

  // Filter hotels based on search term and status
  const filteredHotels = useMemo(() => {
    return hotels.filter(hotel => {
      const matchesSearch = hotel.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           hotel.city.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
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
    
    // Load data when switching tabs
    if (newValue === 0) {
      // Loading hotels for Existing Hotels tab
      loadHotels();
    } else if (newValue === 1) {
      // Loading registrations for Hotel Registrations tab
      loadRegistrations();
      loadTenants();
    }
  };

  // Hotel registration functions
  const handleRegisterHotel = () => {
    setRegisterDialogOpen(true);
  };

  const handleRegistrationSubmit = async () => {
    try {
      // Basic validation
      if (!registrationForm.hotelName.trim()) {
        setError('Hotel name is required');
        return;
      }
      if (!registrationForm.address.trim()) {
        setError('Address is required');
        return;
      }
      if (!registrationForm.city.trim()) {
        setError('City is required');
        return;
      }
      if (!registrationForm.country.trim()) {
        setError('Country is required');
        return;
      }
      if (!registrationForm.contactEmail.trim()) {
        setError('Contact email is required');
        return;
      }
      if (!registrationForm.contactPerson.trim()) {
        setError('Contact person is required');
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/hotel-registrations`, {
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
          country: registrationForm.country,
          phone: normalizeEthiopianPhone(registrationForm.phone),
          mobilePaymentPhone: normalizeEthiopianPhone(registrationForm.mobilePaymentPhone),
          mobilePaymentPhone2: normalizeEthiopianPhone(registrationForm.mobilePaymentPhone2),
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
          mobilePaymentPhone: '',
          mobilePaymentPhone2: '',
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
        }
      } else {
        const errorData = await response.text();
        // console.error('Registration failed:', response.status, errorData);
        throw new Error(`Failed to submit registration: ${response.status} ${errorData}`);
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

  const viewRegistration = (registration: HotelRegistrationResponse) => {
    setSelectedRegistration(registration);
    setRegistrationEditMode(false);
    // Reset approval/rejection fields
    setApprovalComments('');
    setRejectionReason('');
    setTenantId('');
    // Initialize edit form with registration data
    setEditRegistrationForm({
      hotelName: registration.hotelName || '',
      description: registration.description || '',
      address: registration.address || '',
      city: registration.city || '',
      state: registration.state || '',
      country: registration.country || '',
      zipCode: registration.zipCode || '',
      phone: registration.phone || '',
      mobilePaymentPhone: '', // Not available in backend yet
      mobilePaymentPhone2: '', // Not available in backend yet
      contactEmail: registration.contactEmail || '',
      contactPerson: registration.contactPerson || '',
      licenseNumber: registration.licenseNumber || '',
      taxId: registration.taxId || '',
      websiteUrl: registration.websiteUrl || '',
      facilityAmenities: registration.facilityAmenities || '',
      numberOfRooms: registration.numberOfRooms?.toString() || '',
      checkInTime: registration.checkInTime || '15:00',
      checkOutTime: registration.checkOutTime || '11:00'
    });
    setRegistrationViewDialogOpen(true);
  };

  const handleEditRegistrationFormChange = (field: string, value: string) => {
    setEditRegistrationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveRegistrationEdit = async () => {
    if (!selectedRegistration) return;

    try {
      const response = await fetch(`/api/admin/hotel-registrations/${selectedRegistration.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hotelName: editRegistrationForm.hotelName,
          description: editRegistrationForm.description,
          address: editRegistrationForm.address,
          city: editRegistrationForm.city,
          state: editRegistrationForm.state,
          country: editRegistrationForm.country,
          zipCode: editRegistrationForm.zipCode,
          phone: editRegistrationForm.phone,
          contactEmail: editRegistrationForm.contactEmail,
          contactPerson: editRegistrationForm.contactPerson,
          licenseNumber: editRegistrationForm.licenseNumber,
          taxId: editRegistrationForm.taxId,
          websiteUrl: editRegistrationForm.websiteUrl,
          facilityAmenities: editRegistrationForm.facilityAmenities,
          numberOfRooms: editRegistrationForm.numberOfRooms ? parseInt(editRegistrationForm.numberOfRooms) : null,
          checkInTime: editRegistrationForm.checkInTime,
          checkOutTime: editRegistrationForm.checkOutTime
        })
      });

      if (response.ok) {
        setRegistrationEditMode(false);
        setSuccess('Hotel registration updated successfully');
        setTimeout(() => setSuccess(null), 3000);
        loadRegistrations(); // Refresh the list
        
        // Update the selected registration with new data
        const updatedRegistration = await response.json();
        setSelectedRegistration(updatedRegistration);
      } else {
        throw new Error('Failed to update registration');
      }
    } catch (err) {
      // console.error('Error updating registration:', err);
      setError('Failed to update hotel registration. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleCancelRegistrationEdit = () => {
    setRegistrationEditMode(false);
    // Reset form to original values
    if (selectedRegistration) {
      setEditRegistrationForm({
        hotelName: selectedRegistration.hotelName || '',
        description: selectedRegistration.description || '',
        address: selectedRegistration.address || '',
        city: selectedRegistration.city || '',
        state: selectedRegistration.state || '',
        country: selectedRegistration.country || '',
        zipCode: selectedRegistration.zipCode || '',
        phone: selectedRegistration.phone || '',
        mobilePaymentPhone: '', // Not available in backend yet
        mobilePaymentPhone2: '', // Not available in backend yet
        contactEmail: selectedRegistration.contactEmail || '',
        contactPerson: selectedRegistration.contactPerson || '',
        licenseNumber: selectedRegistration.licenseNumber || '',
        taxId: selectedRegistration.taxId || '',
        websiteUrl: selectedRegistration.websiteUrl || '',
        facilityAmenities: selectedRegistration.facilityAmenities || '',
        numberOfRooms: selectedRegistration.numberOfRooms?.toString() || '',
        checkInTime: selectedRegistration.checkInTime || '15:00',
        checkOutTime: selectedRegistration.checkOutTime || '11:00'
      });
    }
  };

  const openApprovalDialog = (registration: HotelRegistrationResponse) => {
    setSelectedRegistration(registration);
    setApprovalComments('');
    setTenantId('');
    setApproveDialogOpen(true);
  };

  const openRejectionDialog = (registration: HotelRegistrationResponse) => {
    setSelectedRegistration(registration);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };



  const handleApproveRegistration = async () => {
    if (!selectedRegistration) {
      return;
    }

    try {
      const request: ApproveRegistrationRequest = {
        comments: approvalComments
      };

      await adminApiService.approveHotelRegistration(selectedRegistration.id, request);
      
      setApproveDialogOpen(false);
      setRegistrationViewDialogOpen(false);
      setSelectedRegistration(null);
      setApprovalComments('');
      setSuccess('Hotel registration approved successfully! The hotel has been automatically assigned to the default tenant and is now active.');
      setTimeout(() => setSuccess(null), 5000);
      
      // Refresh both registrations and hotels list
      loadRegistrations();
      loadHotels(); // Refresh hotels list to show the newly created hotel
    } catch (err) {
      // console.error('Error approving registration:', err);
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
      const request = {
        reason: rejectionReason
      };

      await adminApiService.rejectHotelRegistration(selectedRegistration.id, request);

      setRejectDialogOpen(false);
      setRegistrationViewDialogOpen(false);
      setSelectedRegistration(null);
      setRejectionReason('');
      setSuccess('Hotel registration rejected successfully');
      setTimeout(() => setSuccess(null), 3000);
      
      // Refresh data
      loadRegistrations();
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

  // Helper function to get tenant name by tenant ID
  const getTenantName = (tenantId: string | undefined): string => {
    if (!tenantId) return 'No Tenant';
    const tenant = tenants.find(t => t.tenantId === tenantId);
    return tenant ? tenant.name : tenantId;
  };

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
        tenantId: hotelData.tenantId || selectedHotel.tenantId || null
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
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" sx={{ 
            flexGrow: 1,
            color: COLORS.PRIMARY,
            fontWeight: 600,
            letterSpacing: '0.5px'
          }}>
            Hotel Management
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              if (activeTab === 0) {
                loadHotels();
              } else {
                loadRegistrations();
              }
            }}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
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
          <Tabs value={activeTab} onChange={handleTabChange}>
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
                      background: `linear-gradient(135deg, ${addAlpha(COLORS.PRIMARY, 0.08)} 0%, ${addAlpha(COLORS.PRIMARY, 0.16)} 100%)`,
                      borderBottom: `2px solid ${COLORS.PRIMARY}`,
                      '& .MuiTableCell-head': {
                        color: COLORS.PRIMARY,
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        border: 'none',
                        padding: '20px 16px',
                        position: 'relative'
                      }
                    }}
                  >
                    <TableCell>Hotel Name</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Tenant</TableCell>
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
                      <TableCell colSpan={8} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : filteredHotels.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
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
                            <Typography variant="body2">
                              {getTenantName(hotel.tenantId)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{hotel.email}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatEthiopianPhone(hotel.phone)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {hotel.totalRooms || 0}
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
                <Grid item xs={12} sm={6} md={3}>
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
                <Grid item xs={12} sm={6} md={3}>
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
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Approved
                      </Typography>
                      <Typography variant="h4" sx={{ color: COLORS.PRIMARY }}>
                        {registrationStats.approved}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
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
                      background: `linear-gradient(135deg, ${addAlpha(COLORS.PRIMARY, 0.08)} 0%, ${addAlpha(COLORS.PRIMARY, 0.16)} 100%)`,
                      borderBottom: `2px solid ${COLORS.PRIMARY}`,
                      '& .MuiTableCell-head': {
                        color: COLORS.PRIMARY,
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        border: 'none',
                        padding: '20px 16px',
                        position: 'relative'
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
                          color={statusColors[registration.status as keyof typeof statusColors]}
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
              
              {/* Row 5: Contact Email - moved before phone numbers */}
              <Grid item xs={12}>
                <PremiumTextField
                  label="Contact Email"
                  type="email"
                  fullWidth
                  required
                  value={registrationForm.contactEmail}
                  onChange={(e) => handleRegistrationFormChange('contactEmail', e.target.value)}
                />
              </Grid>

              {/* Phone Numbers Section with grouped styling */}
              <Grid item xs={12}>
                <Box sx={{ 
                  border: `1px solid ${COLORS.BG_INFO_LIGHT}`, 
                  borderRadius: 2, 
                  p: 2, 
                  backgroundColor: COLORS.BG_INFO_LIGHT,
                  mt: 1
                }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, color: COLORS.PRIMARY, fontWeight: 600 }}>
                    Phone Numbers
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <PremiumTextField
                        label="Phone (Communication)"
                        fullWidth
                        required
                        value={registrationForm.phone}
                        onChange={(e) => handleRegistrationFormChange('phone', e.target.value)}
                        helperText="Primary phone for general communication"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      {/* Empty space to match screenshot layout */}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <PremiumTextField
                        label="Mobile Payment Phone"
                        fullWidth
                        value={registrationForm.mobilePaymentPhone}
                        onChange={(e) => handleRegistrationFormChange('mobilePaymentPhone', e.target.value)}
                        helperText="Primary mobile money account for payments"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <PremiumTextField
                        label="Mobile Payment Phone 2 (Optional)"
                        fullWidth
                        value={registrationForm.mobilePaymentPhone2}
                        onChange={(e) => handleRegistrationFormChange('mobilePaymentPhone2', e.target.value)}
                        helperText="Optional secondary mobile money account"
                      />
                    </Grid>
                  </Grid>
                </Box>
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
                  fullWidth
                  value={registrationForm.numberOfRooms}
                  onChange={(e) => handleRegistrationFormChange('numberOfRooms', e.target.value)}
                  placeholder="Enter number of rooms"
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

        {/* Registration View Dialog */}
        <Dialog open={registrationViewDialogOpen} onClose={() => setRegistrationViewDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle
            sx={{
              borderBottom: `2px solid ${COLORS.SECONDARY}`,
              pb: 2,
              fontWeight: 600,
              color: COLORS.PRIMARY
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Review Hotel Registration</span>
              {selectedRegistration?.status === 'PENDING' && !registrationEditMode && (
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => setRegistrationEditMode(true)}
                  variant="outlined"
                  size="small"
                >
                  Edit
                </Button>
              )}
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedRegistration && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  {registrationEditMode ? (
                    <PremiumTextField
                      label="Hotel Name"
                      fullWidth
                      value={editRegistrationForm.hotelName}
                      onChange={(e) => handleEditRegistrationFormChange('hotelName', e.target.value)}
                      required
                    />
                  ) : (
                    <Box>
                      <Typography variant="caption" sx={{ color: COLORS.TEXT_SECONDARY, mb: 0.5, display: 'block', fontSize: '0.75rem' }}>
                        Hotel Name
                      </Typography>
                      <Box sx={{
                        p: 1.5,
                        border: `1px solid ${COLORS.BORDER_LIGHT}`,
                        borderRadius: 1,
                        backgroundColor: COLORS.BG_LIGHT,
                        borderLeft: `3px solid ${COLORS.SECONDARY}`
                      }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedRegistration.hotelName}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  {registrationEditMode ? (
                    <PremiumTextField
                      label="Contact Person"
                      fullWidth
                      value={editRegistrationForm.contactPerson}
                      onChange={(e) => handleEditRegistrationFormChange('contactPerson', e.target.value)}
                      required
                    />
                  ) : (
                    <Box>
                      <Typography variant="caption" sx={{ color: COLORS.TEXT_SECONDARY, mb: 0.5, display: 'block', fontSize: '0.75rem' }}>
                        Contact Person
                      </Typography>
                      <Box sx={{
                        p: 1.5,
                        border: `1px solid ${COLORS.BORDER_LIGHT}`,
                        borderRadius: 1,
                        backgroundColor: COLORS.BG_LIGHT,
                        borderLeft: `3px solid ${COLORS.SECONDARY}`
                      }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedRegistration.contactPerson}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Grid>
                
                <Grid item xs={12}>
                  {registrationEditMode ? (
                    <PremiumTextField
                      label="Description"
                      multiline
                      rows={3}
                      fullWidth
                      value={editRegistrationForm.description}
                      onChange={(e) => handleEditRegistrationFormChange('description', e.target.value)}
                    />
                  ) : (
                    <Box>
                      <Typography variant="caption" sx={{ color: COLORS.TEXT_SECONDARY, mb: 0.5, display: 'block', fontSize: '0.75rem' }}>
                        Description
                      </Typography>
                      <Box sx={{
                        p: 1.5,
                        border: `1px solid ${COLORS.BORDER_LIGHT}`,
                        borderRadius: 1,
                        backgroundColor: COLORS.BG_LIGHT,
                        borderLeft: `3px solid ${COLORS.SECONDARY}`,
                        minHeight: '80px'
                      }}>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {selectedRegistration.description}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Grid>
                
                <Grid item xs={12}>
                  {registrationEditMode ? (
                    <PremiumTextField
                      label="Address"
                      fullWidth
                      value={editRegistrationForm.address}
                      onChange={(e) => handleEditRegistrationFormChange('address', e.target.value)}
                      required
                    />
                  ) : (
                    <Box>
                      <Typography variant="caption" sx={{ color: COLORS.TEXT_SECONDARY, mb: 0.5, display: 'block', fontSize: '0.75rem' }}>
                        Address
                      </Typography>
                      <Box sx={{
                        p: 1.5,
                        border: `1px solid ${COLORS.BORDER_LIGHT}`,
                        borderRadius: 1,
                        backgroundColor: COLORS.BG_LIGHT,
                        borderLeft: `3px solid ${COLORS.SECONDARY}`
                      }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedRegistration.address}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <PremiumDisplayField
                    label="City"
                    value={registrationEditMode ? editRegistrationForm.city : selectedRegistration.city}
                    isEditMode={registrationEditMode}
                    onChange={(value) => handleEditRegistrationFormChange('city', value)}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <PremiumDisplayField
                    label="Country"
                    value={registrationEditMode ? editRegistrationForm.country : selectedRegistration.country}
                    isEditMode={registrationEditMode}
                    onChange={(value) => handleEditRegistrationFormChange('country', value)}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <PremiumDisplayField
                    label="State"
                    value={registrationEditMode ? editRegistrationForm.state : (selectedRegistration.state || '')}
                    isEditMode={registrationEditMode}
                    onChange={(value) => handleEditRegistrationFormChange('state', value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <PremiumDisplayField
                    label="Zip Code"
                    value={registrationEditMode ? editRegistrationForm.zipCode : (selectedRegistration.zipCode || '')}
                    isEditMode={registrationEditMode}
                    onChange={(value) => handleEditRegistrationFormChange('zipCode', value)}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <PremiumDisplayField
                    label="Phone"
                    value={registrationEditMode ? editRegistrationForm.phone : selectedRegistration.phone}
                    isEditMode={registrationEditMode}
                    onChange={(value) => handleEditRegistrationFormChange('phone', value)}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <PremiumDisplayField
                    label="Contact Email"
                    value={registrationEditMode ? editRegistrationForm.contactEmail : selectedRegistration.contactEmail}
                    isEditMode={registrationEditMode}
                    onChange={(value) => handleEditRegistrationFormChange('contactEmail', value)}
                    type="email"
                    required
                  />
                </Grid>

                {!registrationEditMode && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <PremiumDisplayField
                        label="Status"
                        value={selectedRegistration.status}
                        isEditMode={false}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <PremiumDisplayField
                        label="Submitted At"
                        value={formatDate(selectedRegistration.submittedAt)}
                        isEditMode={false}
                      />
                    </Grid>
                  </>
                )}

                {(selectedRegistration.licenseNumber || registrationEditMode) && (
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label="License Number"
                      value={registrationEditMode ? editRegistrationForm.licenseNumber : (selectedRegistration.licenseNumber || '')}
                      isEditMode={registrationEditMode}
                      onChange={(value) => handleEditRegistrationFormChange('licenseNumber', value)}
                    />
                  </Grid>
                )}

                {(selectedRegistration.taxId || registrationEditMode) && (
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label="Tax ID"
                      value={registrationEditMode ? editRegistrationForm.taxId : (selectedRegistration.taxId || '')}
                      isEditMode={registrationEditMode}
                      onChange={(value) => handleEditRegistrationFormChange('taxId', value)}
                    />
                  </Grid>
                )}

                {(selectedRegistration.websiteUrl || registrationEditMode) && (
                  <Grid item xs={12}>
                    <PremiumDisplayField
                      label="Website URL"
                      value={registrationEditMode ? editRegistrationForm.websiteUrl : (selectedRegistration.websiteUrl || '')}
                      isEditMode={registrationEditMode}
                      onChange={(value) => handleEditRegistrationFormChange('websiteUrl', value)}
                    />
                  </Grid>
                )}

                {(selectedRegistration.facilityAmenities || registrationEditMode) && (
                  <Grid item xs={12}>
                    <PremiumDisplayField
                      label="Facility Amenities"
                      value={registrationEditMode ? editRegistrationForm.facilityAmenities : (selectedRegistration.facilityAmenities || '')}
                      isEditMode={registrationEditMode}
                      onChange={(value) => handleEditRegistrationFormChange('facilityAmenities', value)}
                      multiline
                      rows={2}
                      placeholder="WiFi, Pool, Spa, Restaurant, etc."
                    />
                  </Grid>
                )}

                {(selectedRegistration.numberOfRooms || registrationEditMode) && (
                  <Grid item xs={12} sm={4}>
                    <PremiumDisplayField
                      label="Number of Rooms"
                      value={registrationEditMode ? editRegistrationForm.numberOfRooms : (selectedRegistration.numberOfRooms?.toString() || '')}
                      isEditMode={registrationEditMode}
                      onChange={(value) => handleEditRegistrationFormChange('numberOfRooms', value)}
                      placeholder="Enter number of rooms"
                    />
                  </Grid>
                )}

                {(selectedRegistration.checkInTime || registrationEditMode) && (
                  <Grid item xs={12} sm={4}>
                    <PremiumDisplayField
                      label="Check-in Time"
                      value={registrationEditMode ? editRegistrationForm.checkInTime : (selectedRegistration.checkInTime || '')}
                      isEditMode={registrationEditMode}
                      onChange={(value) => handleEditRegistrationFormChange('checkInTime', value)}
                      type="time"
                    />
                  </Grid>
                )}

                {(selectedRegistration.checkOutTime || registrationEditMode) && (
                  <Grid item xs={12} sm={4}>
                    <PremiumDisplayField
                      label="Check-out Time"
                      value={registrationEditMode ? editRegistrationForm.checkOutTime : (selectedRegistration.checkOutTime || '')}
                      isEditMode={registrationEditMode}
                      onChange={(value) => handleEditRegistrationFormChange('checkOutTime', value)}
                      type="time"
                    />
                  </Grid>
                )}

                {!registrationEditMode && selectedRegistration.reviewedAt && (
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label="Reviewed At"
                      value={formatDate(selectedRegistration.reviewedAt)}
                      isEditMode={false}
                    />
                  </Grid>
                )}

                {!registrationEditMode && selectedRegistration.reviewComments && (
                  <Grid item xs={12}>
                    <PremiumDisplayField
                      label="Review Comments"
                      value={selectedRegistration.reviewComments}
                      isEditMode={false}
                      multiline
                      rows={3}
                    />
                  </Grid>
                )}

                {!registrationEditMode && selectedRegistration.tenantId && (
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label="Tenant ID"
                      value={selectedRegistration.tenantId}
                      isEditMode={false}
                    />
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${COLORS.BORDER_LIGHT}` }}>
            {registrationEditMode ? (
              <>
                <Button onClick={handleCancelRegistrationEdit}>Cancel</Button>
                <Button 
                  variant="contained" 
                  onClick={handleSaveRegistrationEdit}
                  disabled={!editRegistrationForm.hotelName || !editRegistrationForm.contactPerson || !editRegistrationForm.contactEmail}
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <>
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
                      onClick={() => openRejectionDialog(selectedRegistration)}
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
                      onClick={() => openApprovalDialog(selectedRegistration)}
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

        {/* Approve Registration Dialog */}
        <Dialog
          open={approveDialogOpen}
          onClose={() => setApproveDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            sx={{
              borderBottom: `2px solid ${COLORS.SECONDARY}`,
              pb: 2,
              fontWeight: 600,
              color: COLORS.PRIMARY
            }}
          >
            Approve Hotel Registration
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              You are about to approve the registration for "{selectedRegistration?.hotelName}". 
              This will create a new hotel in the system and automatically assign it to the default tenant.
            </DialogContentText>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <PremiumTextField
                  label="Approval Comments (Optional)"
                  multiline
                  rows={3}
                  fullWidth
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  placeholder="Add any comments about the approval..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApproveRegistration}
              variant="contained"
              sx={{
                  backgroundColor: COLORS.PRIMARY,
                '&:hover': {
                  backgroundColor: COLORS.PRIMARY,
                  filter: 'brightness(0.9)'
                },
                '&:disabled': {
                    backgroundColor: addAlpha(COLORS.BLACK, 0.12)
                }
              }}
            >
              Approve Registration
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reject Registration Dialog */}
        <Dialog
          open={rejectDialogOpen}
          onClose={() => setRejectDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            sx={{
              borderBottom: `2px solid ${COLORS.SECONDARY}`,
              pb: 2,
              fontWeight: 600,
              color: COLORS.PRIMARY
            }}
          >
            Reject Hotel Registration
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              You are about to reject the registration for "{selectedRegistration?.hotelName}". 
              Please provide a reason for the rejection.
            </DialogContentText>
            <PremiumTextField
              label="Rejection Reason"
              multiline
              rows={4}
              fullWidth
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a detailed reason for rejecting this registration..."
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              This reason will be visible to the hotel applicant
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRejectRegistration}
              color="error"
              variant="contained"
              disabled={!rejectionReason.trim()}
            >
              Reject Registration
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default HotelManagementAdmin;
