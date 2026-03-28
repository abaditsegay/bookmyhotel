import React, { useState, useEffect } from 'react';
import { COLORS, addAlpha } from '../../theme/themeColors';
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
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Divider,
} from '@mui/material';
import { Refresh, CheckCircle, Cancel, Visibility, NavigateNext, NavigateBefore } from '@mui/icons-material';
import PremiumDisplayField from '../../components/common/PremiumDisplayField';
import { formatDateTimeForDisplay } from '../../utils/dateUtils';

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

const HotelRegistrationAdmin: React.FC = () => {
  const [registrations, setRegistrations] = useState<HotelRegistration[]>([]);
  const [statistics, setStatistics] = useState<RegistrationStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<HotelRegistration | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'view'>('view');
  const [comments, setComments] = useState('');
  const [wizardStep, setWizardStep] = useState(0);

  const wizardSteps = ['Hotel & Admin Info', 'Additional Details'];


  const statusColors = {
    PENDING: 'warning',
    UNDER_REVIEW: 'info',
    APPROVED: 'success',
    REJECTED: 'error',
    CANCELLED: 'default',
  } as const;

  useEffect(() => {
    fetchRegistrations();
    fetchStatistics();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/hotel-registrations');
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data.content || data);
      }
    } catch (error) {
      // console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/admin/hotel-registrations/statistics');
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      // console.error('Error fetching statistics:', error);
    }
  };

  const handleAction = async () => {
    if (!selectedRegistration) return;

    try {
      const endpoint = actionType === 'approve' 
        ? `/api/admin/hotel-registrations/${selectedRegistration.id}/approve`
        : `/api/admin/hotel-registrations/${selectedRegistration.id}/reject`;

      const body = actionType === 'approve' 
        ? { comments }
        : { reason: comments };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setDialogOpen(false);
        setComments('');
        setWizardStep(0);
        fetchRegistrations();
        fetchStatistics();
      }
    } catch (error) {
      // console.error('Error processing action:', error);
    }
  };

  const openDialog = (registration: HotelRegistration, type: 'approve' | 'reject' | 'view') => {
    setSelectedRegistration(registration);
    setActionType(type);
    setWizardStep(0);
    setDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return formatDateTimeForDisplay(dateString);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{
        color: COLORS.PRIMARY,
        fontWeight: 600
      }}>
        Hotel Registration Management
      </Typography>

      {/* Statistics Cards */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total
                </Typography>
                <Typography variant="h4">
                  {statistics.total}
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
                  {statistics.pending}
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
                  {statistics.underReview}
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
                  {statistics.approved}
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
                  {statistics.rejected}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Actions */}
      <Box sx={{ mb: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={<Refresh />} 
          onClick={fetchRegistrations}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Registration Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                background: (theme) => `linear-gradient(135deg, ${theme.palette.grey[600]} 0%, ${theme.palette.grey[700]} 50%, ${theme.palette.grey[800]} 100%)`,
                boxShadow: (theme) => `0 4px 12px ${theme.palette.grey[600]}26`,
                '& .MuiTableCell-head': {
                  color: (theme) => theme.palette.grey[50],
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
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => openDialog(registration, 'view')}
                    >
                      View
                    </Button>
                    {registration.status === 'PENDING' && (
                      <>
                        <Button
                          size="small"
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={() => openDialog(registration, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => openDialog(registration, 'reject')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 2-Step Wizard Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          {actionType === 'view' && 'Hotel Registration Details'}
          {actionType === 'approve' && 'Approve Registration'}
          {actionType === 'reject' && 'Reject Registration'}
        </DialogTitle>
        <Box sx={{ px: 3, pb: 1 }}>
          <Stepper activeStep={wizardStep} alternativeLabel>
            {wizardSteps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        <DialogContent>
          {selectedRegistration && (
            <Box sx={{ mt: 1 }}>
              {/* Step 1: Hotel & Admin Info */}
              {wizardStep === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={600} color="primary" sx={{ mb: 1 }}>
                      Hotel Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label="Hotel Name"
                      value={selectedRegistration.hotelName}
                      isEditMode={false}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label="Status"
                      value={selectedRegistration.status}
                      isEditMode={false}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <PremiumDisplayField
                      label="Address"
                      value={selectedRegistration.address}
                      isEditMode={false}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label="City"
                      value={selectedRegistration.city}
                      isEditMode={false}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label="Country"
                      value={selectedRegistration.country}
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
                    <Typography variant="subtitle1" fontWeight={600} color="primary" sx={{ mt: 1, mb: 1 }}>
                      Registered Hotel Admin
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label="Contact Person"
                      value={selectedRegistration.contactPerson}
                      isEditMode={false}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label="Contact Email"
                      value={selectedRegistration.contactEmail}
                      isEditMode={false}
                    />
                  </Grid>
                </Grid>
              )}

              {/* Step 2: Additional Details */}
              {wizardStep === 1 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={600} color="primary" sx={{ mb: 1 }}>
                      Business Details
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  <Grid item xs={12}>
                    <PremiumDisplayField
                      label="Description"
                      value={selectedRegistration.description}
                      isEditMode={false}
                      multiline
                      rows={3}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label="Phone"
                      value={selectedRegistration.phone}
                      isEditMode={false}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label="Website"
                      value={selectedRegistration.websiteUrl}
                      isEditMode={false}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={600} color="primary" sx={{ mt: 1, mb: 1 }}>
                      Payment Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label="Mobile Payment Phone"
                      value={selectedRegistration.mobilePaymentPhone}
                      isEditMode={false}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label="Mobile Payment Phone 2"
                      value={selectedRegistration.mobilePaymentPhone2}
                      isEditMode={false}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={600} color="primary" sx={{ mt: 1, mb: 1 }}>
                      Tax & License
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label="License Number"
                      value={selectedRegistration.licenseNumber}
                      isEditMode={false}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label="Tax ID"
                      value={selectedRegistration.taxId}
                      isEditMode={false}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={600} color="primary" sx={{ mt: 1, mb: 1 }}>
                      Facility Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  <Grid item xs={12}>
                    <PremiumDisplayField
                      label="Facility Amenities"
                      value={selectedRegistration.facilityAmenities}
                      isEditMode={false}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <PremiumDisplayField
                      label="Number of Rooms"
                      value={selectedRegistration.numberOfRooms ?? ''}
                      isEditMode={false}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <PremiumDisplayField
                      label="Check-in Time"
                      value={selectedRegistration.checkInTime}
                      isEditMode={false}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <PremiumDisplayField
                      label="Check-out Time"
                      value={selectedRegistration.checkOutTime}
                      isEditMode={false}
                    />
                  </Grid>

                  {selectedRegistration.reviewComments && (
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

                  {actionType !== 'view' && (
                    <>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          label={actionType === 'approve' ? 'Approval Comments' : 'Rejection Reason'}
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          required={actionType === 'reject'}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {wizardStep === 0 ? (
            <>
              <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Box sx={{ flex: 1 }} />
              <Button
                variant="contained"
                endIcon={<NavigateNext />}
                onClick={() => setWizardStep(1)}
              >
                Next
              </Button>
            </>
          ) : (
            <>
              <Button
                startIcon={<NavigateBefore />}
                onClick={() => setWizardStep(0)}
              >
                Back
              </Button>
              <Box sx={{ flex: 1 }} />
              <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
              {actionType !== 'view' && (
                <>
                  {actionType === 'approve' && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => {
                        setActionType('reject');
                      }}
                    >
                      Reject
                    </Button>
                  )}
                  <Button
                    onClick={handleAction}
                    variant="contained"
                    color={actionType === 'approve' ? 'success' : 'error'}
                    disabled={actionType === 'reject' && !comments.trim()}
                    startIcon={actionType === 'approve' ? <CheckCircle /> : <Cancel />}
                  >
                    {actionType === 'approve' ? 'Approve' : 'Reject'}
                  </Button>
                </>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HotelRegistrationAdmin;
