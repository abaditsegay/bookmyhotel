import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  alpha,
  useTheme,
  Typography,
  Box,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Alert,
  CircularProgress,
  MenuItem,
  IconButton,
  Tabs,
  Tab,
  Stepper,
  Step,
  StepLabel,
  Divider
} from '@mui/material';
import { 
  Visibility as ViewIcon,
  Edit as EditIcon, 
  ToggleOn as ToggleOnIcon, 
  ToggleOff as ToggleOffIcon, 
  Add as AddIcon,
  Refresh as RefreshIcon,
  RateReview as ReviewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  NavigateNext,
  NavigateBefore,
  Public as PublishIcon,
  PublicOff as UnpublishIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useSubmissionError } from '../../contexts/SubmissionErrorContext';
import { useDebounce } from '../../hooks/useDebounce';
import { API_CONFIG } from '../../config/apiConfig';
import { adminApiService, HotelDTO, UpdateHotelRequest, TenantDTO, ApproveRegistrationRequest, HotelRegistrationResponse } from '../../services/adminApi';
import { PageContainer } from '../../components/common/PageShell';
import StandardButton from '../../components/common/StandardButton';
import PremiumTextField from '../../components/common/PremiumTextField';
import PremiumDisplayField from '../../components/common/PremiumDisplayField';
import PremiumSelect from '../../components/common/PremiumSelect';
import StandardDialog from '../../components/ui/StandardDialog';
import { DataTableCard, PageHeader, SurfaceCard } from '../../components/ui';
import { dialogSecondaryActionSx, refreshActionButtonSx, tableHeadRowSx } from '../../theme/sxHelpers';
import { getReadableAccentTextColor } from '../../theme/surfaces';
import { formatEthiopianPhone, normalizeEthiopianPhone } from '../../utils/phoneUtils';
import { getEffectiveSearchTerm } from '../../utils/search';
import HotelEditDialog from '../../components/hotel/HotelEditDialog';
import { useTranslation } from 'react-i18next';

interface Hotel extends HotelDTO {}

interface RegistrationStatistics {
  pending: number;
  underReview: number;
  approved: number;
  rejected: number;
  total: number;
}

const HotelManagementAdmin: React.FC = () => {
  const theme = useTheme();
  const { token } = useAuth();
  const { showSubmissionError } = useSubmissionError();
  const { t } = useTranslation();

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
  const [registrationWizardStep, setRegistrationWizardStep] = useState(0);

  const wizardSteps = [
    t('admin.hotelManagement.steps.hotelAndAdminInfo'),
    t('admin.hotelManagement.steps.additionalDetails')
  ];
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [toggleStatusDialogOpen, setToggleStatusDialogOpen] = useState(false);
  const [toggleStatusReason, setToggleStatusReason] = useState('');
  const [togglePublicDialogOpen, setTogglePublicDialogOpen] = useState(false);
  const [togglePublicReason, setTogglePublicReason] = useState('');

  // Approval/Rejection form state
  const [approvalComments, setApprovalComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Tenant management state
  const [tenants, setTenants] = useState<TenantDTO[]>([]);

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

  const debouncedSearchTerm = useDebounce(searchTerm, searchTerm.trim() ? 300 : 0);
  const effectiveSearchTerm = getEffectiveSearchTerm(debouncedSearchTerm);

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
      const response = await adminApiService.getActiveTenants();
      setTenants(response);
    } catch (err) {
      // console.error('Error loading tenants:', err);
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
      const appliedSearchTerm = effectiveSearchTerm ?? '';
      const matchesSearch = hotel.name.toLowerCase().includes(appliedSearchTerm.toLowerCase()) ||
                           hotel.city.toLowerCase().includes(appliedSearchTerm.toLowerCase()) ||
                           (hotel.email && hotel.email.toLowerCase().includes(appliedSearchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && hotel.isActive) ||
                           (statusFilter === 'inactive' && !hotel.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [hotels, effectiveSearchTerm, statusFilter]);

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
      showSubmissionError(err, {
        fallbackMessage: 'Failed to submit hotel registration. Please try again.',
      });
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
    setRegistrationWizardStep(0);
    // Reset approval/rejection fields
    setApprovalComments('');
    setRejectionReason('');
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
      showSubmissionError(err, {
        fallbackMessage: 'Failed to update hotel registration. Please try again.',
      });
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
      showSubmissionError(err, {
        fallbackMessage: 'Failed to approve registration. Please try again.',
      });
    }
  };

  const handleRejectRegistration = async () => {
    if (!selectedRegistration || !rejectionReason.trim()) {
      showSubmissionError('Rejection reason is required');
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
      showSubmissionError(err, {
        fallbackMessage: 'Failed to reject hotel registration. Please try again.',
      });
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

  const translateRegistrationStatus = (status: string) => t(`admin.hotelManagement.registrationStatus.${status}`, {
    defaultValue: status.replace(/_/g, ' '),
  });

  const adminSectionTitleSx = {
    mb: 1,
    color: getReadableAccentTextColor(theme),
    fontWeight: 600,
  } as const;

  const adminTableHeaderSx = tableHeadRowSx();

  const adminSectionTitleWithTopSpacingSx = {
    ...adminSectionTitleSx,
    mt: 1,
  } as const;

  const adminInfoPanelSx = {
    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
    borderRadius: 2,
    p: 2,
    backgroundColor: alpha(theme.palette.info.main, 0.08),
    mt: 1,
  } as const;

  const adminOutlinedActionSx = {
    borderColor: alpha(getReadableAccentTextColor(theme), theme.palette.mode === 'dark' ? 0.52 : 0.28),
    color: getReadableAccentTextColor(theme),
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(getReadableAccentTextColor(theme), 0.1)
      : 'transparent',
    '&:hover': {
      borderColor: getReadableAccentTextColor(theme),
      backgroundColor: alpha(getReadableAccentTextColor(theme), theme.palette.mode === 'dark' ? 0.18 : 0.08),
    },
  } as const;

  const adminDangerOutlinedActionSx = {
    borderColor: 'error.main',
    '&:hover': {
      backgroundColor: alpha(theme.palette.error.main, 0.08),
      borderColor: 'error.main',
    },
  } as const;

  const adminPrimaryContainedActionSx = {
    backgroundColor: 'primary.main',
    '&:hover': {
      backgroundColor: 'primary.dark',
    },
    '&:disabled': {
      backgroundColor: theme.palette.action.disabledBackground,
    },
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
      showSubmissionError(err, {
        fallbackMessage: 'Failed to update hotel. Please try again.',
      });
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
      showSubmissionError(err, {
        fallbackMessage: 'Failed to update hotel status. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle hotel public listing
  const handleTogglePublicListing = async (hotel: Hotel) => {
    if (!token) return;
    try {
      setLoading(true);
      await adminApiService.toggleHotelPublicListing(hotel.id, togglePublicReason);
      setTogglePublicDialogOpen(false);
      setTogglePublicReason('');
      setSelectedHotel(null);
      loadHotels();
      setError(null);
      setSuccess(`Hotel ${hotel.isPubliclyListed ? 'unpublished' : 'published'} successfully`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update public listing.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer maxWidth={false} data-testid="hotel-management-page">
      <PageHeader
        eyebrow={t('admin.hotelManagement.eyebrow')}
        title={t('admin.hotelManagement.title')}
        description={t('admin.hotelManagement.description')}
        actions={
          <>
            <StandardButton
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                if (activeTab === 0) {
                  loadHotels();
                } else {
                  loadRegistrations();
                }
              }}
              data-testid="hotel-management-refresh-button"
              sx={refreshActionButtonSx}
            >
              {t('common.refresh')}
            </StandardButton>
            <StandardButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleRegisterHotel}
              data-testid="hotel-management-register-button"
            >
              {t('admin.hotelManagement.actions.registerHotel')}
            </StandardButton>
          </>
        }
      />

      {error && (
        <Alert data-testid="hotel-management-error-alert" severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert data-testid="hotel-management-success-alert" severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <SurfaceCard variantStyle="elevated" contentSx={{ p: 0 }}>
        <Box data-testid="hotel-management-tabs">
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label={t('admin.hotelManagement.tabs.existingHotels')} data-testid="hotel-management-existing-hotels-tab" />
            <Tab label={t('admin.hotelManagement.tabs.hotelRegistrations')} data-testid="hotel-management-registrations-tab" />
          </Tabs>
        </Box>
      </SurfaceCard>

      {activeTab === 0 && (
        <DataTableCard
          title={t('admin.hotelManagement.existingHotels.title')}
          description={t('admin.hotelManagement.existingHotels.description')}
          filters={
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <PremiumTextField
                  fullWidth
                  label={t('admin.hotelManagement.filters.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('admin.hotelManagement.filters.searchPlaceholder')}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <PremiumSelect
                  fullWidth
                  label={t('admin.hotelManagement.filters.status')}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">{t('admin.hotelManagement.filters.allHotels')}</MenuItem>
                  <MenuItem value="active">{t('admin.hotelManagement.filters.activeOnly')}</MenuItem>
                  <MenuItem value="inactive">{t('admin.hotelManagement.filters.inactiveOnly')}</MenuItem>
                </PremiumSelect>
              </Grid>
            </Grid>
          }
          pagination={
            <TablePagination
              component="div"
              count={filteredHotels.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage={t('admin.hotelManagement.existingHotels.rowsPerPage')}
            />
          }
        >
          <Table>
            <TableHead>
              <TableRow sx={adminTableHeaderSx}>
                    <TableCell>{t('admin.hotelManagement.existingHotels.table.hotelName')}</TableCell>
                    <TableCell>{t('admin.hotelManagement.existingHotels.table.location')}</TableCell>
                    <TableCell>{t('admin.hotelManagement.existingHotels.table.tenant')}</TableCell>
                    <TableCell>{t('admin.hotelManagement.existingHotels.table.contact')}</TableCell>
                    <TableCell>{t('admin.hotelManagement.existingHotels.table.rooms')}</TableCell>
                    <TableCell>{t('admin.hotelManagement.existingHotels.table.rating')}</TableCell>
                    <TableCell>{t('admin.hotelManagement.existingHotels.table.status')}</TableCell>
                    <TableCell>{t('admin.hotelManagement.existingHotels.table.publicListing')}</TableCell>
                    <TableCell>{t('admin.hotelManagement.existingHotels.table.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : filteredHotels.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('admin.hotelManagement.existingHotels.emptyState')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredHotels
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((hotel) => (
                        <TableRow key={hotel.id} hover>
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
                              {t('common.notAvailable')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={hotel.isActive ? t('admin.hotelManagement.status.active') : t('admin.hotelManagement.status.inactive')}
                              color={hotel.isActive ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={hotel.isPubliclyListed ? t('admin.hotelManagement.publicListing.published') : t('admin.hotelManagement.publicListing.unlisted')}
                              color={hotel.isPubliclyListed ? 'info' : 'default'}
                              size="small"
                              icon={hotel.isPubliclyListed ? <PublishIcon fontSize="small" /> : <UnpublishIcon fontSize="small" />}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleViewHotel(hotel)}
                                title={t('admin.hotelManagement.actions.viewDetails')}
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
                                title={hotel.isActive ? t('admin.hotelManagement.actions.deactivate') : t('admin.hotelManagement.actions.activate')}
                                color={hotel.isActive ? "success" : "error"}
                              >
                                {hotel.isActive ? <ToggleOnIcon /> : <ToggleOffIcon />}
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedHotel(hotel);
                                  setTogglePublicReason('');
                                  setTogglePublicDialogOpen(true);
                                }}
                                title={hotel.isPubliclyListed ? t('admin.hotelManagement.actions.unpublishFromSearch') : t('admin.hotelManagement.actions.publishToSearch')}
                                color={hotel.isPubliclyListed ? 'info' : 'default'}
                                disabled={!hotel.isActive}
                              >
                                {hotel.isPubliclyListed ? <PublishIcon /> : <UnpublishIcon />}
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
        </DataTableCard>
      )}

      {activeTab === 1 && (
        <>
          {registrationStats && (
            <Grid container spacing={3} sx={{ mb: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <SurfaceCard variantStyle="subtle">
                  <Typography color="text.secondary" gutterBottom>
                    {t('admin.hotelManagement.registrationStats.total')}
                  </Typography>
                  <Typography variant="h4">{registrationStats.total}</Typography>
                </SurfaceCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <SurfaceCard variantStyle="subtle">
                  <Typography color="text.secondary" gutterBottom>
                    {t('admin.hotelManagement.registrationStats.pending')}
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {registrationStats.pending}
                  </Typography>
                </SurfaceCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <SurfaceCard variantStyle="subtle">
                  <Typography color="text.secondary" gutterBottom>
                    {t('admin.hotelManagement.registrationStats.approved')}
                  </Typography>
                  <Typography variant="h4" sx={{ color: getReadableAccentTextColor(theme) }}>
                    {registrationStats.approved}
                  </Typography>
                </SurfaceCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <SurfaceCard variantStyle="subtle">
                  <Typography color="text.secondary" gutterBottom>
                    {t('admin.hotelManagement.registrationStats.rejected')}
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {registrationStats.rejected}
                  </Typography>
                </SurfaceCard>
              </Grid>
            </Grid>
          )}

          <DataTableCard
            title={t('admin.hotelManagement.registrations.title')}
            description={t('admin.hotelManagement.registrations.description')}
          >
            <Table>
              <TableHead>
                <TableRow sx={adminTableHeaderSx}>
                    <TableCell>{t('admin.hotelManagement.registrations.table.hotelName')}</TableCell>
                    <TableCell>{t('admin.hotelManagement.registrations.table.contactPerson')}</TableCell>
                    <TableCell>{t('admin.hotelManagement.registrations.table.email')}</TableCell>
                    <TableCell>{t('admin.hotelManagement.registrations.table.city')}</TableCell>
                    <TableCell>{t('admin.hotelManagement.registrations.table.status')}</TableCell>
                    <TableCell>{t('admin.hotelManagement.registrations.table.submitted')}</TableCell>
                    <TableCell>{t('admin.hotelManagement.registrations.table.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {registrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('admin.hotelManagement.registrations.emptyState')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : registrations.map((registration) => (
                    <TableRow key={registration.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {registration.hotelName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {registration.address}
                        </Typography>
                      </TableCell>
                      <TableCell>{registration.contactPerson}</TableCell>
                      <TableCell>{registration.contactEmail}</TableCell>
                      <TableCell>{registration.city}, {registration.country}</TableCell>
                      <TableCell>
                        <Chip 
                          label={translateRegistrationStatus(registration.status)} 
                          color={statusColors[registration.status as keyof typeof statusColors]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(registration.submittedAt)}</TableCell>
                      <TableCell>
                        <StandardButton
                          buttonSize="small"
                          variant="outlined"
                          startIcon={<ReviewIcon />}
                          onClick={() => viewRegistration(registration)}
                          sx={adminOutlinedActionSx}
                        >
                          {t('admin.hotelManagement.actions.review')}
                        </StandardButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </DataTableCard>
        </>
      )}

        {/* Hotel Registration Dialog */}
        <StandardDialog
          open={registerDialogOpen}
          onClose={() => setRegisterDialogOpen(false)}
          maxWidth="md"
          fullWidth
          title={t('admin.hotelManagement.dialogs.register.title')}
          actions={
            <>
              <Button variant="outlined" sx={dialogSecondaryActionSx} onClick={() => setRegisterDialogOpen(false)} data-testid="hotel-registration-cancel-button">{t('common.cancel')}</Button>
              <Button 
                variant="contained" 
                onClick={handleRegistrationSubmit}
                disabled={!registrationForm.hotelName || !registrationForm.contactPerson || !registrationForm.contactEmail}
                data-testid="hotel-registration-submit-button"
              >
                {t('admin.hotelManagement.actions.submitRegistration')}
              </Button>
            </>
          }
          PaperProps={{ 'data-testid': 'hotel-registration-dialog' }}
        >
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  label={t('admin.hotelManagement.fields.hotelName')}
                  fullWidth
                  required
                  value={registrationForm.hotelName}
                  onChange={(e) => handleRegistrationFormChange('hotelName', e.target.value)}
                  inputProps={{ 'data-testid': 'hotel-registration-hotel-name-input' }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  label={t('admin.hotelManagement.fields.contactPerson')}
                  fullWidth
                  required
                  value={registrationForm.contactPerson}
                  onChange={(e) => handleRegistrationFormChange('contactPerson', e.target.value)}
                  inputProps={{ 'data-testid': 'hotel-registration-contact-person-input' }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <PremiumTextField
                  label={t('admin.hotelManagement.fields.description')}
                  multiline
                  rows={3}
                  fullWidth
                  value={registrationForm.description}
                  onChange={(e) => handleRegistrationFormChange('description', e.target.value)}
                  inputProps={{ 'data-testid': 'hotel-registration-description-input' }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <PremiumTextField
                  label={t('admin.hotelManagement.fields.address')}
                  fullWidth
                  required
                  value={registrationForm.address}
                  onChange={(e) => handleRegistrationFormChange('address', e.target.value)}
                  inputProps={{ 'data-testid': 'hotel-registration-address-input' }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  label={t('admin.hotelManagement.fields.city')}
                  fullWidth
                  required
                  value={registrationForm.city}
                  onChange={(e) => handleRegistrationFormChange('city', e.target.value)}
                  inputProps={{ 'data-testid': 'hotel-registration-city-input' }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  label={t('admin.hotelManagement.fields.country')}
                  fullWidth
                  required
                  value={registrationForm.country}
                  onChange={(e) => handleRegistrationFormChange('country', e.target.value)}
                  inputProps={{ 'data-testid': 'hotel-registration-country-input' }}
                />
              </Grid>
              
              {/* Row 5: Contact Email - moved before phone numbers */}
              <Grid item xs={12}>
                <PremiumTextField
                  label={t('admin.hotelManagement.fields.contactEmail')}
                  type="email"
                  fullWidth
                  required
                  value={registrationForm.contactEmail}
                  onChange={(e) => handleRegistrationFormChange('contactEmail', e.target.value)}
                  inputProps={{ 'data-testid': 'hotel-registration-contact-email-input' }}
                />
              </Grid>

              {/* Phone Numbers Section with grouped styling */}
              <Grid item xs={12}>
                <Box sx={adminInfoPanelSx}>
                  <Typography variant="subtitle1" sx={{ ...adminSectionTitleSx, mb: 2 }}>
                    {t('admin.hotelManagement.sections.phoneNumbers')}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <PremiumTextField
                        label={t('admin.hotelManagement.fields.communicationPhone')}
                        fullWidth
                        required
                        value={registrationForm.phone}
                        onChange={(e) => handleRegistrationFormChange('phone', e.target.value)}
                        helperText={t('admin.hotelManagement.helpers.communicationPhone')}
                        inputProps={{ 'data-testid': 'hotel-registration-phone-input' }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      {/* Empty space to match screenshot layout */}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <PremiumTextField
                        label={t('admin.hotelManagement.fields.mobilePaymentPhone')}
                        fullWidth
                        value={registrationForm.mobilePaymentPhone}
                        onChange={(e) => handleRegistrationFormChange('mobilePaymentPhone', e.target.value)}
                        helperText={t('admin.hotelManagement.helpers.mobilePaymentPhone')}
                        inputProps={{ 'data-testid': 'hotel-registration-mobile-payment-phone-input' }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <PremiumTextField
                        label={t('admin.hotelManagement.fields.mobilePaymentPhone2')}
                        fullWidth
                        value={registrationForm.mobilePaymentPhone2}
                        onChange={(e) => handleRegistrationFormChange('mobilePaymentPhone2', e.target.value)}
                        helperText={t('admin.hotelManagement.helpers.mobilePaymentPhone2')}
                        inputProps={{ 'data-testid': 'hotel-registration-mobile-payment-phone-2-input' }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  label={t('admin.hotelManagement.fields.licenseNumber')}
                  fullWidth
                  value={registrationForm.licenseNumber}
                  onChange={(e) => handleRegistrationFormChange('licenseNumber', e.target.value)}
                  inputProps={{ 'data-testid': 'hotel-registration-license-number-input' }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  label={t('admin.hotelManagement.fields.taxId')}
                  fullWidth
                  value={registrationForm.taxId}
                  onChange={(e) => handleRegistrationFormChange('taxId', e.target.value)}
                  inputProps={{ 'data-testid': 'hotel-registration-tax-id-input' }}
                />
              </Grid>

              <Grid item xs={12}>
                <PremiumTextField
                  label={t('admin.hotelManagement.fields.websiteUrl')}
                  fullWidth
                  value={registrationForm.websiteUrl}
                  onChange={(e) => handleRegistrationFormChange('websiteUrl', e.target.value)}
                  inputProps={{ 'data-testid': 'hotel-registration-website-url-input' }}
                />
              </Grid>

              <Grid item xs={12}>
                <PremiumTextField
                  label={t('admin.hotelManagement.fields.facilityAmenities')}
                  multiline
                  rows={2}
                  fullWidth
                  value={registrationForm.facilityAmenities}
                  onChange={(e) => handleRegistrationFormChange('facilityAmenities', e.target.value)}
                  placeholder={t('admin.hotelManagement.placeholders.facilityAmenities')}
                  inputProps={{ 'data-testid': 'hotel-registration-facility-amenities-input' }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <PremiumTextField
                  label={t('admin.hotelManagement.fields.numberOfRooms')}
                  fullWidth
                  value={registrationForm.numberOfRooms}
                  onChange={(e) => handleRegistrationFormChange('numberOfRooms', e.target.value)}
                  placeholder={t('admin.hotelManagement.placeholders.numberOfRooms')}
                  inputProps={{ 'data-testid': 'hotel-registration-number-of-rooms-input' }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <PremiumTextField
                  label={t('admin.hotelManagement.fields.checkInTime')}
                  type="time"
                  fullWidth
                  value={registrationForm.checkInTime}
                  onChange={(e) => handleRegistrationFormChange('checkInTime', e.target.value)}
                  inputProps={{ 'data-testid': 'hotel-registration-check-in-time-input' }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <PremiumTextField
                  label={t('admin.hotelManagement.fields.checkOutTime')}
                  type="time"
                  fullWidth
                  value={registrationForm.checkOutTime}
                  onChange={(e) => handleRegistrationFormChange('checkOutTime', e.target.value)}
                  inputProps={{ 'data-testid': 'hotel-registration-check-out-time-input' }}
                />
              </Grid>
            </Grid>
        </StandardDialog>

        {/* Registration View Dialog - 2-Step Wizard */}
        <StandardDialog
          open={registrationViewDialogOpen}
          onClose={() => setRegistrationViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
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
          }
          actions={registrationEditMode ? (
            <>
              <Button variant="outlined" sx={dialogSecondaryActionSx} onClick={handleCancelRegistrationEdit}>Cancel</Button>
              <Box sx={{ flex: 1 }} />
              {registrationWizardStep === 0 ? (
                <Button
                  variant="contained"
                  endIcon={<NavigateNext />}
                  onClick={() => setRegistrationWizardStep(1)}
                >
                  Next
                </Button>
              ) : (
                <>
                  <Button
                    startIcon={<NavigateBefore />}
                    onClick={() => setRegistrationWizardStep(0)}
                  >
                    Back
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handleSaveRegistrationEdit}
                    disabled={!editRegistrationForm.hotelName || !editRegistrationForm.contactPerson || !editRegistrationForm.contactEmail}
                  >
                    Save Changes
                  </Button>
                </>
              )}
            </>
          ) : (
            registrationWizardStep === 0 ? (
              <>
                <Button 
                  onClick={() => setRegistrationViewDialogOpen(false)}
                  sx={{ color: 'text.secondary' }}
                >
                  Cancel
                </Button>
                <Box sx={{ flex: 1 }} />
                <Button
                  variant="contained"
                  endIcon={<NavigateNext />}
                  onClick={() => setRegistrationWizardStep(1)}
                >
                  Next
                </Button>
              </>
            ) : (
              <>
                <Button
                  startIcon={<NavigateBefore />}
                  onClick={() => setRegistrationWizardStep(0)}
                >
                  Back
                </Button>
                <Box sx={{ flex: 1 }} />
                <Button 
                  onClick={() => setRegistrationViewDialogOpen(false)}
                  sx={{ color: 'text.secondary' }}
                >
                  Cancel
                </Button>
                {selectedRegistration?.status === 'PENDING' && (
                  <>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<RejectIcon />}
                      onClick={() => openRejectionDialog(selectedRegistration)}
                      sx={adminDangerOutlinedActionSx}
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
            )
          )}
          contentSx={{ pt: 2.5 }}
        >
          <Box sx={{ mb: 3 }}>
            <Stepper activeStep={registrationWizardStep} alternativeLabel>
              {wizardSteps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          {selectedRegistration && (
              <Box sx={{ mt: 1 }}>
                {/* Step 1: Hotel & Admin Info */}
                {registrationWizardStep === 0 && (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={adminSectionTitleSx}>
                        Hotel Information
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>
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
                        <PremiumDisplayField
                          label="Hotel Name"
                          value={selectedRegistration.hotelName}
                          isEditMode={false}
                        />
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <PremiumDisplayField
                        label="Status"
                        value={selectedRegistration.status}
                        isEditMode={false}
                      />
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
                        <PremiumDisplayField
                          label="Address"
                          value={selectedRegistration.address}
                          isEditMode={false}
                        />
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
                        label="Submitted At"
                        value={formatDate(selectedRegistration.submittedAt)}
                        isEditMode={false}
                      />
                    </Grid>
                    {selectedRegistration.reviewedAt && (
                      <Grid item xs={12} sm={6}>
                        <PremiumDisplayField
                          label="Reviewed At"
                          value={formatDate(selectedRegistration.reviewedAt)}
                          isEditMode={false}
                        />
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={adminSectionTitleWithTopSpacingSx}>
                        Registered Hotel Admin
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
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
                        <PremiumDisplayField
                          label="Contact Person"
                          value={selectedRegistration.contactPerson}
                          isEditMode={false}
                        />
                      )}
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
                  </Grid>
                )}

                {/* Step 2: Additional Details */}
                {registrationWizardStep === 1 && (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={adminSectionTitleSx}>
                        Business Details
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
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
                        <PremiumDisplayField
                          label="Description"
                          value={selectedRegistration.description}
                          isEditMode={false}
                          multiline
                          rows={3}
                        />
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <PremiumDisplayField
                        label="Phone"
                        value={registrationEditMode ? editRegistrationForm.phone : selectedRegistration.phone}
                        isEditMode={registrationEditMode}
                        onChange={(value) => handleEditRegistrationFormChange('phone', value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <PremiumDisplayField
                        label="Website URL"
                        value={registrationEditMode ? editRegistrationForm.websiteUrl : (selectedRegistration.websiteUrl || '')}
                        isEditMode={registrationEditMode}
                        onChange={(value) => handleEditRegistrationFormChange('websiteUrl', value)}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={adminSectionTitleWithTopSpacingSx}>
                        Payment Information
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <PremiumDisplayField
                        label="Mobile Payment Phone"
                        value={registrationEditMode ? editRegistrationForm.mobilePaymentPhone : (selectedRegistration.mobilePaymentPhone || '')}
                        isEditMode={registrationEditMode}
                        onChange={(value) => handleEditRegistrationFormChange('mobilePaymentPhone', value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <PremiumDisplayField
                        label="Mobile Payment Phone 2"
                        value={registrationEditMode ? editRegistrationForm.mobilePaymentPhone2 : (selectedRegistration.mobilePaymentPhone2 || '')}
                        isEditMode={registrationEditMode}
                        onChange={(value) => handleEditRegistrationFormChange('mobilePaymentPhone2', value)}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={adminSectionTitleWithTopSpacingSx}>
                        Tax & License
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <PremiumDisplayField
                        label="License Number"
                        value={registrationEditMode ? editRegistrationForm.licenseNumber : (selectedRegistration.licenseNumber || '')}
                        isEditMode={registrationEditMode}
                        onChange={(value) => handleEditRegistrationFormChange('licenseNumber', value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <PremiumDisplayField
                        label="Tax ID"
                        value={registrationEditMode ? editRegistrationForm.taxId : (selectedRegistration.taxId || '')}
                        isEditMode={registrationEditMode}
                        onChange={(value) => handleEditRegistrationFormChange('taxId', value)}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={adminSectionTitleWithTopSpacingSx}>
                        Facility Information
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>
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
                    <Grid item xs={12} sm={4}>
                      <PremiumDisplayField
                        label="Number of Rooms"
                        value={registrationEditMode ? editRegistrationForm.numberOfRooms : (selectedRegistration.numberOfRooms?.toString() || '')}
                        isEditMode={registrationEditMode}
                        onChange={(value) => handleEditRegistrationFormChange('numberOfRooms', value)}
                        placeholder="Enter number of rooms"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <PremiumDisplayField
                        label="Check-in Time"
                        value={registrationEditMode ? editRegistrationForm.checkInTime : (selectedRegistration.checkInTime || '')}
                        isEditMode={registrationEditMode}
                        onChange={(value) => handleEditRegistrationFormChange('checkInTime', value)}
                        type="time"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <PremiumDisplayField
                        label="Check-out Time"
                        value={registrationEditMode ? editRegistrationForm.checkOutTime : (selectedRegistration.checkOutTime || '')}
                        isEditMode={registrationEditMode}
                        onChange={(value) => handleEditRegistrationFormChange('checkOutTime', value)}
                        type="time"
                      />
                    </Grid>

                    {!registrationEditMode && selectedRegistration.reviewComments && (
                      <>
                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />
                        </Grid>
                        <Grid item xs={12}>
                          <PremiumDisplayField
                            label="Review Comments"
                            value={selectedRegistration.reviewComments}
                            isEditMode={false}
                            multiline
                            rows={3}
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                )}
              </Box>
            )}
        </StandardDialog>

        {/* Toggle Status Confirmation Dialog */}
        <StandardDialog
          open={toggleStatusDialogOpen}
          onClose={() => {
            setToggleStatusDialogOpen(false);
            setToggleStatusReason('');
          }}
          maxWidth="sm"
          fullWidth
          title={selectedHotel?.isActive ? 'Deactivate Hotel' : 'Activate Hotel'}
          actions={
            <>
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
            </>
          }
        >
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
        </StandardDialog>

        {/* Toggle Public Listing Confirmation Dialog */}
        <StandardDialog
          open={togglePublicDialogOpen}
          onClose={() => { setTogglePublicDialogOpen(false); setTogglePublicReason(''); }}
          maxWidth="sm"
          fullWidth
          title={selectedHotel?.isPubliclyListed ? 'Unpublish Hotel' : 'Publish Hotel to Public Search'}
          actions={
            <>
              <Button onClick={() => { setTogglePublicDialogOpen(false); setTogglePublicReason(''); }}>
                Cancel
              </Button>
              <Button
                onClick={() => selectedHotel && handleTogglePublicListing(selectedHotel)}
                variant="contained"
                color={selectedHotel?.isPubliclyListed ? 'warning' : 'info'}
                disabled={!togglePublicReason.trim() || loading}
              >
                {loading ? <CircularProgress size={20} /> : (selectedHotel?.isPubliclyListed ? 'Unpublish' : 'Publish')}
              </Button>
            </>
          }
        >
          <Typography sx={{ mb: 2 }}>
              {selectedHotel?.isPubliclyListed
                ? `Unpublishing "${selectedHotel?.name}" will hide it from public guest search. Hotel admin will retain management access.`
                : `Publishing "${selectedHotel?.name}" will make it visible to guests in the public hotel search. Ensure all hotel details, rooms, and pricing are configured before publishing.`}
          </Typography>
          <PremiumTextField
            label="Reason"
            fullWidth
            required
            multiline
            rows={3}
            value={togglePublicReason}
            onChange={(e) => setTogglePublicReason(e.target.value)}
            placeholder={selectedHotel?.isPubliclyListed ? 'Reason for unpublishing...' : 'Reason for publishing...'}
          />
        </StandardDialog>

        {/* View Hotel Dialog */}
        <StandardDialog
          open={viewDialogOpen}
          onClose={handleCloseViewDialog}
          maxWidth="md"
          fullWidth
          title="Hotel Details"
          actions={
            <>
              <Button variant="outlined" sx={dialogSecondaryActionSx} onClick={handleCloseViewDialog}>Close</Button>
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
            </>
          }
        >
            {selectedHotel && (
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
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
        </StandardDialog>

        {/* Hotel Edit Dialog */}
        <HotelEditDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          onSave={handleUpdateHotel}
          hotel={selectedHotel}
          loading={loading}
        />

        {/* Approve Registration Dialog */}
        <StandardDialog
          open={approveDialogOpen}
          onClose={() => setApproveDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          title="Approve Hotel Registration"
          description={`You are about to approve the registration for "${selectedRegistration?.hotelName}". This will create a new hotel in the system and automatically assign it to the default tenant.`}
          actions={
            <>
              <Button onClick={() => setApproveDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleApproveRegistration}
                variant="contained"
                sx={adminPrimaryContainedActionSx}
              >
                Approve Registration
              </Button>
            </>
          }
        >
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
        </StandardDialog>

        {/* Reject Registration Dialog */}
        <StandardDialog
          open={rejectDialogOpen}
          onClose={() => setRejectDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          title="Reject Hotel Registration"
          description={`You are about to reject the registration for "${selectedRegistration?.hotelName}". Please provide a reason for the rejection.`}
          actions={
            <>
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
            </>
          }
        >
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
        </StandardDialog>
    </PageContainer>
  );
};

export default HotelManagementAdmin;
