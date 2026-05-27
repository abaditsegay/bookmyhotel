import React, { useState, useEffect } from 'react';
import {
  useTheme,
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
import { useTranslation } from 'react-i18next';
import PremiumDisplayField from '../../components/common/PremiumDisplayField';
import { dialogSecondaryActionSx, tableHeadRowSx } from '../../theme/sxHelpers';
import { getReadableAccentTextColor } from '../../theme/surfaces';
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
  const theme = useTheme();
  const { t } = useTranslation();
  const [registrations, setRegistrations] = useState<HotelRegistration[]>([]);
  const [statistics, setStatistics] = useState<RegistrationStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<HotelRegistration | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'view'>('view');
  const [comments, setComments] = useState('');
  const [wizardStep, setWizardStep] = useState(0);

  const wizardSteps = [
    t('admin.hotelRegistrationAdmin.steps.hotelAndAdminInfo'),
    t('admin.hotelRegistrationAdmin.steps.additionalDetails')
  ];


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

  const adminTableHeaderSx = tableHeadRowSx();
  const readableAccentText = getReadableAccentTextColor(theme);

  const adminSectionTitleSx = {
    color: readableAccentText,
    fontWeight: 600,
  } as const;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{
        color: readableAccentText,
        fontWeight: 600
      }}>
        {t('admin.hotelRegistrationAdmin.title')}
      </Typography>

      {/* Statistics Cards */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  {t('admin.hotelRegistrationAdmin.stats.total')}
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
                <Typography color="text.secondary" gutterBottom>
                  {t('admin.hotelRegistrationAdmin.stats.pending')}
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
                <Typography color="text.secondary" gutterBottom>
                  {t('admin.hotelRegistrationAdmin.stats.underReview')}
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
                <Typography color="text.secondary" gutterBottom>
                  {t('admin.hotelRegistrationAdmin.stats.approved')}
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
                <Typography color="text.secondary" gutterBottom>
                  {t('admin.hotelRegistrationAdmin.stats.rejected')}
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
          {t('common.refresh')}
        </Button>
      </Box>

      {/* Registration Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={adminTableHeaderSx}>
              <TableCell>{t('admin.hotelRegistrationAdmin.table.hotelName')}</TableCell>
              <TableCell>{t('admin.hotelRegistrationAdmin.table.contactPerson')}</TableCell>
              <TableCell>{t('admin.hotelRegistrationAdmin.table.email')}</TableCell>
              <TableCell>{t('admin.hotelRegistrationAdmin.table.city')}</TableCell>
              <TableCell>{t('admin.hotelRegistrationAdmin.table.status')}</TableCell>
              <TableCell>{t('admin.hotelRegistrationAdmin.table.submitted')}</TableCell>
              <TableCell>{t('admin.hotelRegistrationAdmin.table.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registrations.map((registration) => (
              <TableRow key={registration.id}>
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
                      {t('common.view')}
                    </Button>
                    {registration.status === 'PENDING' && (
                      <>
                        <Button
                          size="small"
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={() => openDialog(registration, 'approve')}
                        >
                          {t('admin.hotelRegistrationAdmin.actions.approve')}
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => openDialog(registration, 'reject')}
                        >
                          {t('admin.hotelRegistrationAdmin.actions.reject')}
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
          {actionType === 'view' && t('admin.hotelRegistrationAdmin.dialogs.viewTitle')}
          {actionType === 'approve' && t('admin.hotelRegistrationAdmin.dialogs.approveTitle')}
          {actionType === 'reject' && t('admin.hotelRegistrationAdmin.dialogs.rejectTitle')}
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
                    <Typography variant="subtitle1" sx={adminSectionTitleSx}>
                      {t('admin.hotelRegistrationAdmin.sections.hotelInformation')}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label={t('admin.hotelRegistrationAdmin.fields.hotelName')}
                      value={selectedRegistration.hotelName}
                      isEditMode={false}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label={t('admin.hotelRegistrationAdmin.fields.status')}
                      value={selectedRegistration.status}
                      isEditMode={false}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <PremiumDisplayField
                      label={t('admin.hotelRegistrationAdmin.fields.address')}
                      value={selectedRegistration.address}
                      isEditMode={false}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label={t('admin.hotelRegistrationAdmin.fields.city')}
                      value={selectedRegistration.city}
                      isEditMode={false}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label={t('admin.hotelRegistrationAdmin.fields.country')}
                      value={selectedRegistration.country}
                      isEditMode={false}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label={t('admin.hotelRegistrationAdmin.fields.submittedAt')}
                      value={formatDate(selectedRegistration.submittedAt)}
                      isEditMode={false}
                    />
                  </Grid>
                  {selectedRegistration.reviewedAt && (
                    <Grid item xs={12} sm={6}>
                      <PremiumDisplayField
                        label={t('admin.hotelRegistrationAdmin.fields.reviewedAt')}
                        value={formatDate(selectedRegistration.reviewedAt)}
                        isEditMode={false}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ ...adminSectionTitleSx, mt: 1, mb: 1 }}>
                      {t('admin.hotelRegistrationAdmin.sections.registeredHotelAdmin')}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label={t('admin.hotelRegistrationAdmin.fields.contactPerson')}
                      value={selectedRegistration.contactPerson}
                      isEditMode={false}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label={t('admin.hotelRegistrationAdmin.fields.contactEmail')}
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
                    <Typography variant="subtitle1" sx={adminSectionTitleSx}>
                      {t('admin.hotelRegistrationAdmin.sections.businessDetails')}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  <Grid item xs={12}>
                    <PremiumDisplayField
                      label={t('admin.hotelRegistrationAdmin.fields.description')}
                      value={selectedRegistration.description}
                      isEditMode={false}
                      multiline
                      rows={3}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label={t('admin.hotelRegistrationAdmin.fields.phone')}
                      value={selectedRegistration.phone}
                      isEditMode={false}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label={t('admin.hotelRegistrationAdmin.fields.website')}
                      value={selectedRegistration.websiteUrl}
                      isEditMode={false}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ ...adminSectionTitleSx, mt: 1, mb: 1 }}>
                      {t('admin.hotelRegistrationAdmin.sections.paymentInformation')}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label={t('admin.hotelRegistrationAdmin.fields.mobilePaymentPhone')}
                      value={selectedRegistration.mobilePaymentPhone}
                      isEditMode={false}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label={t('admin.hotelRegistrationAdmin.fields.mobilePaymentPhone2')}
                      value={selectedRegistration.mobilePaymentPhone2}
                      isEditMode={false}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ ...adminSectionTitleSx, mt: 1, mb: 1 }}>
                      {t('admin.hotelRegistrationAdmin.sections.taxAndLicense')}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label={t('admin.hotelRegistrationAdmin.fields.licenseNumber')}
                      value={selectedRegistration.licenseNumber}
                      isEditMode={false}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PremiumDisplayField
                      label={t('admin.hotelRegistrationAdmin.fields.taxId')}
                      value={selectedRegistration.taxId}
                      isEditMode={false}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ ...adminSectionTitleSx, mt: 1, mb: 1 }}>
                      {t('admin.hotelRegistrationAdmin.sections.facilityInformation')}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  <Grid item xs={12}>
                    <PremiumDisplayField
                      label={t('admin.hotelRegistrationAdmin.fields.facilityAmenities')}
                      value={selectedRegistration.facilityAmenities}
                      isEditMode={false}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <PremiumDisplayField
                      label={t('admin.hotelRegistrationAdmin.fields.numberOfRooms')}
                      value={selectedRegistration.numberOfRooms ?? ''}
                      isEditMode={false}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <PremiumDisplayField
                      label={t('admin.hotelRegistrationAdmin.fields.checkInTime')}
                      value={selectedRegistration.checkInTime}
                      isEditMode={false}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <PremiumDisplayField
                      label={t('admin.hotelRegistrationAdmin.fields.checkOutTime')}
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
                          label={t('admin.hotelRegistrationAdmin.fields.reviewComments')}
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
                          label={actionType === 'approve' ? t('admin.hotelRegistrationAdmin.fields.approvalComments') : t('admin.hotelRegistrationAdmin.fields.rejectionReason')}
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
              <Button variant="outlined" sx={dialogSecondaryActionSx} onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
              <Box sx={{ flex: 1 }} />
              <Button
                variant="contained"
                endIcon={<NavigateNext />}
                onClick={() => setWizardStep(1)}
              >
                {t('common.next')}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                sx={dialogSecondaryActionSx}
                startIcon={<NavigateBefore />}
                onClick={() => setWizardStep(0)}
              >
                {t('common.back')}
              </Button>
              <Box sx={{ flex: 1 }} />
              <Button variant="outlined" sx={dialogSecondaryActionSx} onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
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
                      {t('admin.hotelRegistrationAdmin.actions.reject')}
                    </Button>
                  )}
                  <Button
                    onClick={handleAction}
                    variant="contained"
                    color={actionType === 'approve' ? 'success' : 'error'}
                    disabled={actionType === 'reject' && !comments.trim()}
                    startIcon={actionType === 'approve' ? <CheckCircle /> : <Cancel />}
                  >
                    {actionType === 'approve' ? t('admin.hotelRegistrationAdmin.actions.approve') : t('admin.hotelRegistrationAdmin.actions.reject')}
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
