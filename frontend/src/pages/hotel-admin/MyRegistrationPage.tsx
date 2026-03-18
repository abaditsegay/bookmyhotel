import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Divider,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Button,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  NavigateNext,
  NavigateBefore,
  HourglassEmpty,
  CheckCircle,
  Cancel,
  Refresh,
  Dashboard,
  Edit,
  Close,
  Save,
} from '@mui/icons-material';
import PremiumDisplayField from '../../components/common/PremiumDisplayField';
import { COLORS, addAlpha } from '../../theme/themeColors';
import TokenManager from '../../utils/tokenManager';
import { useAuth } from '../../contexts/AuthContext';
import { API_CONFIG } from '../../config/apiConfig';

interface HotelRegistration {
  id: number;
  hotelName: string;
  description: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  mobilePaymentPhone: string;
  mobilePaymentPhone2: string;
  contactEmail: string;
  contactPerson: string;
  licenseNumber: string;
  taxId: string;
  websiteUrl: string;
  facilityAmenities: string;
  numberOfRooms: number | null;
  checkInTime: string;
  checkOutTime: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  submittedAt: string;
  reviewedAt?: string;
  reviewComments?: string;
}

interface StatusConfig {
  severity: 'warning' | 'info' | 'success' | 'error';
  label: string;
  chipColor: 'warning' | 'info' | 'success' | 'error' | 'default';
  message: string;
  icon: React.ReactNode;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  PENDING: {
    severity: 'warning',
    label: 'Pending Review',
    chipColor: 'warning',
    message:
      'Your hotel registration has been submitted and is awaiting review by the system administrator. You will receive an email notification once a decision is made.',
    icon: <HourglassEmpty fontSize="small" />,
  },
  UNDER_REVIEW: {
    severity: 'info',
    label: 'Under Review',
    chipColor: 'info',
    message:
      'Your hotel registration is currently being reviewed by our team. Please check back shortly for an update.',
    icon: <HourglassEmpty fontSize="small" />,
  },
  APPROVED: {
    severity: 'success',
    label: 'Approved',
    chipColor: 'success',
    message:
      'Congratulations! Your hotel registration has been approved and your hotel account is now active.',
    icon: <CheckCircle fontSize="small" />,
  },
  REJECTED: {
    severity: 'error',
    label: 'Rejected',
    chipColor: 'error',
    message:
      'Your hotel registration was not approved. Please review the administrator comments below.',
    icon: <Cancel fontSize="small" />,
  },
  CANCELLED: {
    severity: 'error',
    label: 'Cancelled',
    chipColor: 'default',
    message: 'Your hotel registration has been cancelled.',
    icon: <Cancel fontSize="small" />,
  },
};

const WIZARD_STEPS = ['Hotel & Admin Info', 'Business & Facility Details'];

const MyRegistrationPage: React.FC = () => {
  const { setAccountStatus, user } = useAuth();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState<HotelRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draft, setDraft] = useState<Partial<HotelRegistration>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetchRegistration();
  }, []);

  const fetchRegistration = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = TokenManager.getToken();
      const response = await fetch(`${API_CONFIG.BASE_URL}/hotel-onboarding/registration`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data: HotelRegistration = await response.json();
        setRegistration(data);
      } else if (response.status === 404) {
        setError('No registration record found for your account. Please contact support.');
      } else {
        setError('Failed to load registration details. Please try again.');
      }
    } catch {
      setError('Unable to connect to the server. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEdit = () => {
    if (!registration) return;
    setDraft({ ...registration });
    setSaveError(null);
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setDraft({});
    setSaveError(null);
  };

  const set = (field: keyof HotelRegistration, value: string) => {
    setDraft(prev => ({
      ...prev,
      [field]: field === 'numberOfRooms' ? (value === '' ? null : parseInt(value, 10)) : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const token = TokenManager.getToken();
      const response = await fetch(`${API_CONFIG.BASE_URL}/hotel-onboarding/complete`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotelName: draft.hotelName,
          description: draft.description,
          address: draft.address,
          city: draft.city,
          country: draft.country,
          phone: draft.phone,
          mobilePaymentPhone: draft.mobilePaymentPhone,
          mobilePaymentPhone2: draft.mobilePaymentPhone2,
          contactEmail: draft.contactEmail,
          contactPerson: draft.contactPerson,
          licenseNumber: draft.licenseNumber,
          taxId: draft.taxId,
          websiteUrl: draft.websiteUrl,
          facilityAmenities: draft.facilityAmenities,
          numberOfRooms: draft.numberOfRooms ?? null,
          checkInTime: draft.checkInTime,
          checkOutTime: draft.checkOutTime,
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        setSaveError(text || 'Failed to save. Please try again.');
        return;
      }
      const updated: HotelRegistration = await response.json();
      setRegistration(updated);
      setIsEditMode(false);
      setDraft({});
    } catch {
      setSaveError('Unable to connect to the server. Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={48} sx={{ color: COLORS.PRIMARY }} />
        <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading your registration details…
        </Typography>
      </Container>
    );
  }

  if (error || !registration) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" startIcon={<Refresh />} onClick={fetchRegistration}>
              Retry
            </Button>
          }
        >
          {error ?? 'Registration not found.'}
        </Alert>
      </Container>
    );
  }

  const statusCfg = STATUS_CONFIG[registration.status] ?? STATUS_CONFIG.PENDING;

  return (
    <Container maxWidth="md" sx={{ py: 4, pb: 8 }}>
      {/* Page title */}
      <Typography variant="h4" component="h1" gutterBottom
        sx={{ color: COLORS.PRIMARY, fontWeight: 700, mb: 1 }}
      >
        Hotel Registration
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        View and update the details submitted during your hotel registration.
      </Typography>

      {/* Status banner */}
      <Alert
        severity={statusCfg.severity}
        icon={statusCfg.icon}
        sx={{ mb: 3, alignItems: 'flex-start' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <strong>{statusCfg.label}</strong>
          <Chip label={registration.status} color={statusCfg.chipColor} size="small" />
        </Box>
        {statusCfg.message}
        {registration.reviewComments && registration.status === 'REJECTED' && (
          <Box sx={{ mt: 1.5, p: 1.5, bgcolor: addAlpha('#000', 0.05), borderRadius: 1 }}>
            <Typography variant="caption" display="block" fontWeight={600} gutterBottom>
              Administrator Comments:
            </Typography>
            <Typography variant="body2">{registration.reviewComments}</Typography>
          </Box>
        )}
        {registration.status === 'APPROVED' && user?.accountStatus !== 'ACTIVE' && (
          <Box sx={{ mt: 1.5 }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<Dashboard />}
              onClick={() => {
                setAccountStatus('ACTIVE');
                navigate('/hotel-admin/dashboard');
              }}
              sx={{ fontWeight: 600 }}
            >
              Go to Dashboard
            </Button>
          </Box>
        )}
      </Alert>

      <Paper
        elevation={2}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          border: `1px solid ${addAlpha(COLORS.PRIMARY, 0.12)}`,
        }}
      >
        {/* Stepper header */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            bgcolor: addAlpha(COLORS.PRIMARY, 0.04),
            borderBottom: `1px solid ${addAlpha(COLORS.PRIMARY, 0.1)}`,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {WIZARD_STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          {isEditMode ? (
            <Button
              startIcon={<Close />}
              size="small"
              onClick={handleCancel}
              color="error"
              variant="outlined"
              sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              Cancel
            </Button>
          ) : (
            <Button
              startIcon={<Edit />}
              size="small"
              onClick={handleEdit}
              variant="outlined"
              sx={{ borderColor: COLORS.PRIMARY, color: COLORS.PRIMARY, whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              Edit
            </Button>
          )}
        </Box>

        {/* Step content */}
        <Box sx={{ p: 3 }}>
          {saveError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSaveError(null)}>
              {saveError}
            </Alert>
          )}

          {/* ── STEP 0: Hotel Information + Admin Info ── */}
          {activeStep === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: COLORS.PRIMARY, mb: 0.5 }}>
                  Hotel Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PremiumDisplayField
                  label="Hotel Name"
                  value={isEditMode ? draft.hotelName : registration.hotelName}
                  isEditMode={isEditMode}
                  required
                  onChange={v => set('hotelName', v)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <PremiumDisplayField label="Status" value={registration.status} isEditMode={false} />
              </Grid>
              <Grid item xs={12}>
                <PremiumDisplayField
                  label="Address"
                  value={isEditMode ? draft.address : registration.address}
                  isEditMode={isEditMode}
                  required
                  onChange={v => set('address', v)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <PremiumDisplayField
                  label="City"
                  value={isEditMode ? draft.city : registration.city}
                  isEditMode={isEditMode}
                  required
                  onChange={v => set('city', v)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <PremiumDisplayField
                  label="Country"
                  value={isEditMode ? draft.country : registration.country}
                  isEditMode={isEditMode}
                  required
                  onChange={v => set('country', v)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <PremiumDisplayField label="Submitted At" value={formatDate(registration.submittedAt)} isEditMode={false} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <PremiumDisplayField label="Reviewed At" value={formatDate(registration.reviewedAt)} isEditMode={false} />
              </Grid>

              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: COLORS.PRIMARY, mb: 0.5 }}>
                  Registered Hotel Admin
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <PremiumDisplayField
                  label="Contact Person"
                  value={isEditMode ? draft.contactPerson : registration.contactPerson}
                  isEditMode={isEditMode}
                  required
                  onChange={v => set('contactPerson', v)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <PremiumDisplayField
                  label="Contact Email"
                  value={isEditMode ? draft.contactEmail : registration.contactEmail}
                  isEditMode={isEditMode}
                  required
                  type="email"
                  onChange={v => set('contactEmail', v)}
                />
              </Grid>
            </Grid>
          )}

          {/* ── STEP 1: Business Details + Payment + Tax + Facility ── */}
          {activeStep === 1 && (
            <Grid container spacing={2}>
              {/* Business Details */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: COLORS.PRIMARY, mb: 0.5 }}>
                  Business Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid item xs={12}>
                <PremiumDisplayField
                  label="Description"
                  value={isEditMode ? draft.description : registration.description}
                  isEditMode={isEditMode}
                  multiline
                  rows={3}
                  onChange={v => set('description', v)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <PremiumDisplayField
                  label="Phone"
                  value={isEditMode ? draft.phone : registration.phone}
                  isEditMode={isEditMode}
                  onChange={v => set('phone', v)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <PremiumDisplayField
                  label="Website URL"
                  value={isEditMode ? draft.websiteUrl : registration.websiteUrl}
                  isEditMode={isEditMode}
                  onChange={v => set('websiteUrl', v)}
                />
              </Grid>

              {/* Payment Info */}
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: COLORS.PRIMARY, mb: 0.5 }}>
                  Payment Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <PremiumDisplayField
                  label="Mobile Payment Phone"
                  value={isEditMode ? draft.mobilePaymentPhone : registration.mobilePaymentPhone}
                  isEditMode={isEditMode}
                  onChange={v => set('mobilePaymentPhone', v)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <PremiumDisplayField
                  label="Mobile Payment Phone 2"
                  value={isEditMode ? draft.mobilePaymentPhone2 : registration.mobilePaymentPhone2}
                  isEditMode={isEditMode}
                  onChange={v => set('mobilePaymentPhone2', v)}
                />
              </Grid>

              {/* Tax & License */}
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: COLORS.PRIMARY, mb: 0.5 }}>
                  Tax & License Info
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <PremiumDisplayField
                  label="License Number"
                  value={isEditMode ? draft.licenseNumber : registration.licenseNumber}
                  isEditMode={isEditMode}
                  onChange={v => set('licenseNumber', v)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <PremiumDisplayField
                  label="Tax ID"
                  value={isEditMode ? draft.taxId : registration.taxId}
                  isEditMode={isEditMode}
                  onChange={v => set('taxId', v)}
                />
              </Grid>

              {/* Facility Info */}
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: COLORS.PRIMARY, mb: 0.5 }}>
                  Facility Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid item xs={12}>
                <PremiumDisplayField
                  label="Facility Amenities"
                  value={isEditMode ? draft.facilityAmenities : registration.facilityAmenities}
                  isEditMode={isEditMode}
                  multiline
                  rows={2}
                  onChange={v => set('facilityAmenities', v)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <PremiumDisplayField
                  label="Number of Rooms"
                  value={isEditMode ? (draft.numberOfRooms ?? '') : (registration.numberOfRooms ?? '—')}
                  isEditMode={isEditMode}
                  type="number"
                  onChange={v => set('numberOfRooms', v)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <PremiumDisplayField
                  label="Check-in Time"
                  value={isEditMode ? draft.checkInTime : registration.checkInTime}
                  isEditMode={isEditMode}
                  onChange={v => set('checkInTime', v)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <PremiumDisplayField
                  label="Check-out Time"
                  value={isEditMode ? draft.checkOutTime : registration.checkOutTime}
                  isEditMode={isEditMode}
                  onChange={v => set('checkOutTime', v)}
                />
              </Grid>

              {/* Review Comments (read-only) */}
              {registration.reviewComments && (
                <>
                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <PremiumDisplayField
                      label="Review Comments"
                      value={registration.reviewComments}
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

        {/* Navigation footer */}
        <Box
          sx={{
            px: 3,
            py: 2,
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: `1px solid ${addAlpha(COLORS.PRIMARY, 0.1)}`,
            bgcolor: addAlpha(COLORS.PRIMARY, 0.02),
          }}
        >
          {isEditMode ? (
            <>
              <Button
                startIcon={<Close />}
                onClick={handleCancel}
                variant="outlined"
                color="error"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                startIcon={saving ? <CircularProgress size={16} /> : <Save />}
                onClick={handleSave}
                variant="contained"
                disabled={saving}
                sx={{ bgcolor: COLORS.PRIMARY, '&:hover': { bgcolor: COLORS.PRIMARY_DARK ?? COLORS.PRIMARY } }}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <>
              <Button
                startIcon={<NavigateBefore />}
                onClick={() => setActiveStep(0)}
                disabled={activeStep === 0}
                variant="outlined"
                sx={{ borderColor: COLORS.PRIMARY, color: COLORS.PRIMARY }}
              >
                Previous
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                Step {activeStep + 1} of {WIZARD_STEPS.length}
              </Typography>
              <Button
                endIcon={<NavigateNext />}
                onClick={() => setActiveStep(1)}
                disabled={activeStep === WIZARD_STEPS.length - 1}
                variant="outlined"
                sx={{ borderColor: COLORS.PRIMARY, color: COLORS.PRIMARY }}
              >
                Next
              </Button>
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default MyRegistrationPage;
