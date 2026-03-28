import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { BugReport, FactCheck, Save } from '@mui/icons-material';
import PremiumTextField from '../components/common/PremiumTextField';
import { useAuth } from '../contexts/AuthContext';
import {
  uatApi,
  UatChecklist,
  UatChecklistRequest,
  UatDefect,
  UatDefectRequest,
  UatDefectSeverity,
  UatDefectStatus,
  UatFinalDecision,
  UatWorkspaceHotel,
} from '../services/uatApi';

type ChecklistSection = {
  title: string;
  items: { key: string; label: string }[];
};

const CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    title: 'A. Tenant / Hotel Admin Sign-Off',
    items: [
      { key: 'hotelRegistrationApprovalWorksCorrectly', label: 'Hotel registration approval works correctly' },
      { key: 'hotelRegistrationRejectionWorksCorrectly', label: 'Hotel registration rejection works correctly' },
      { key: 'hotelOnboardingCompletedSuccessfully', label: 'Hotel onboarding can be completed successfully' },
      { key: 'roomsCanBeCreatedAndSaved', label: 'Rooms can be created and saved' },
      { key: 'pricingAndTaxesConfiguredAndSaved', label: 'Pricing and taxes can be configured and saved' },
      { key: 'frontDeskStaffCreatedByHotelAdmin', label: 'Front desk staff can be created by hotel admin' },
      { key: 'approvedHotelsAppearInPublicSearch', label: 'Approved hotels appear in public search when expected' },
      { key: 'hotelAdminCannotAccessSystemAdminFunctions', label: 'Hotel admin cannot access system admin-only functions' },
    ],
  },
  {
    title: 'B. Customer / Guest Sign-Off',
    items: [
      { key: 'customerRegistrationWorksCorrectly', label: 'Customer registration works correctly' },
      { key: 'customerLoginWorksCorrectly', label: 'Customer login works correctly' },
      { key: 'hotelSearchReturnsCorrectHotels', label: 'Hotel search returns correct hotels for valid dates' },
      { key: 'hotelDetailsAndRoomOptionsShownCorrectly', label: 'Hotel details and room options are shown correctly' },
      { key: 'registeredCustomerBookingEndToEnd', label: 'Registered customer booking works end-to-end' },
      { key: 'guestBookingEndToEnd', label: 'Guest booking works end-to-end' },
      { key: 'bookingConfirmationShownClearly', label: 'Booking confirmation is shown clearly' },
      { key: 'bookingLookupWorksUsingReference', label: 'Booking lookup works using booking reference' },
      { key: 'bookingModificationWorksWhenAllowed', label: 'Booking modification works when allowed' },
      { key: 'bookingCancellationWorksWhenAllowed', label: 'Booking cancellation works when allowed' },
      { key: 'customerReceivesConfirmationThroughChannels', label: 'Customer receives confirmation through enabled channels' },
      { key: 'customerCannotAccessAdminOrStaffFeatures', label: 'Customer cannot access admin or staff features' },
    ],
  },
  {
    title: 'C. Front Desk Sign-Off',
    items: [
      { key: 'frontDeskLoginWorksCorrectly', label: 'Front desk login works correctly' },
      { key: 'walkInBookingWorksCorrectly', label: 'Walk-in booking works correctly' },
      { key: 'frontDeskCanSearchExistingBookings', label: 'Front desk can search existing bookings' },
      { key: 'checkInWorksAndRoomAssignmentRecorded', label: 'Check-in works and room assignment is recorded' },
      { key: 'roomChargesCanBeAddedCorrectly', label: 'Room charges can be added correctly' },
      { key: 'checkoutWorksCorrectly', label: 'Checkout works correctly' },
      { key: 'receiptCanBeGeneratedCorrectly', label: 'Receipt can be generated correctly' },
      { key: 'payAtDeskSettlementWorksCorrectly', label: 'Pay-at-desk settlement works correctly' },
      { key: 'frontDeskCanModifyOrCancelBookingsWhenAllowed', label: 'Front desk can modify or cancel bookings when allowed' },
      { key: 'frontDeskCannotAccessHotelSetupFunctions', label: 'Front desk cannot access hotel setup functions' },
    ],
  },
  {
    title: 'D. Inventory And Availability Sign-Off',
    items: [
      { key: 'bookingReducesAvailabilityCorrectly', label: 'Booking reduces availability correctly' },
      { key: 'checkInUpdatesRoomStatusCorrectly', label: 'Check-in updates room status correctly' },
      { key: 'checkoutUpdatesRoomStatusCorrectly', label: 'Checkout updates room status correctly' },
      { key: 'tenantOrHotelDataIsolatedCorrectly', label: 'Tenant or hotel data is isolated correctly between hotels' },
      { key: 'bookingChangesReflectedAcrossRoles', label: 'Booking changes are reflected across user roles correctly' },
    ],
  },
  {
    title: 'E. Edge Case Sign-Off',
    items: [
      { key: 'pastDateBookingBlocked', label: 'Past-date booking is blocked' },
      { key: 'checkoutBeforeCheckInBlocked', label: 'Checkout before check-in is blocked' },
      { key: 'paymentFailureHandledCorrectly', label: 'Payment failure is handled correctly' },
      { key: 'doubleBookingPrevented', label: 'Double booking of the same room is prevented' },
      { key: 'overbookingPreventedWhenInventoryExhausted', label: 'Overbooking is prevented when inventory is exhausted' },
      { key: 'concurrentLastRoomAttemptsDoNotDuplicate', label: 'Concurrent attempts for the last room do not create duplicate bookings' },
      { key: 'cancellationTimingRulesAppliedCorrectly', label: 'Cancellation timing rules are applied correctly' },
    ],
  },
  {
    title: 'F. Data Validation Sign-Off',
    items: [
      { key: 'nightlySubtotalCalculationsAreCorrect', label: 'Nightly subtotal calculations are correct' },
      { key: 'taxesAndFeesAddedCorrectly', label: 'Taxes and fees are added correctly' },
      { key: 'discountsAppliedCorrectlyWhenEnabled', label: 'Discounts are applied correctly when enabled' },
      { key: 'refundAmountsAreCorrect', label: 'Refund amounts are correct when applicable' },
      { key: 'stayDurationAndDateLogicAreCorrect', label: 'Stay duration and date logic are correct' },
      { key: 'currencyFormattingIsClearAndConsistent', label: 'Currency formatting is clear and consistent' },
    ],
  },
];

const defaultChecklistItems = CHECKLIST_SECTIONS.reduce<Record<string, boolean>>((accumulator, section) => {
  section.items.forEach(item => {
    accumulator[item.key] = false;
  });
  return accumulator;
}, {});

const FINAL_DECISION_OPTIONS: { value: UatFinalDecision; label: string }[] = [
  { value: 'READY_FOR_RELEASE', label: 'Ready for release' },
  { value: 'READY_FOR_RELEASE_WITH_MINOR_ISSUES', label: 'Ready for release with minor known issues' },
  { value: 'NOT_READY_FOR_RELEASE', label: 'Not ready for release' },
];

const SEVERITY_OPTIONS: UatDefectSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUS_OPTIONS: UatDefectStatus[] = ['OPEN', 'IN_PROGRESS', 'FIXED', 'CLOSED'];

const UatTestingPage: React.FC = () => {
  const { token, hasAnyRole } = useAuth();
  const isPlatformAdmin = hasAnyRole(['ADMIN', 'SUPER_ADMIN']);

  const [activeTab, setActiveTab] = useState(0);
  const [selectedHotelId, setSelectedHotelId] = useState<number | ''>('');
  const [workspaceHotel, setWorkspaceHotel] = useState<UatWorkspaceHotel | null>(null);
  const [checklist, setChecklist] = useState<UatChecklist | null>(null);
  const [defects, setDefects] = useState<UatDefect[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingChecklist, setSavingChecklist] = useState(false);
  const [defectDialogOpen, setDefectDialogOpen] = useState(false);
  const [editingDefect, setEditingDefect] = useState<UatDefect | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [defectForm, setDefectForm] = useState<UatDefectRequest>({
    summary: '',
    testerDetail: '',
    severity: 'MEDIUM',
    blockingRelease: false,
    adminNotes: '',
    fixDetails: '',
    status: 'OPEN',
  });

  const [formState, setFormState] = useState<UatChecklistRequest>({
    testerName: '',
    testEnvironment: '',
    testDate: '',
    buildVersion: '',
    hotelTenantTested: '',
    checklistItems: defaultChecklistItems,
    finalDecision: undefined,
    qaLead: '',
    businessOwner: '',
    productOwner: '',
    approvalDate: '',
  });

  useEffect(() => {
    if (!token) {
      return;
    }

    uatApi.getWorkspaceHotel(token)
      .then(result => {
        setWorkspaceHotel(result);
        setSelectedHotelId(result.hotelId);
      })
      .catch(fetchError => {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to resolve shared UAT hotel');
      });
  }, [token]);

  useEffect(() => {
    if (!token || !selectedHotelId) {
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([
      uatApi.getChecklist(token, Number(selectedHotelId)),
      uatApi.getDefects(token, Number(selectedHotelId)),
    ])
      .then(([checklistResponse, defectResponse]) => {
        setChecklist(checklistResponse);
        setDefects(defectResponse);
        setFormState({
          testerName: checklistResponse.testerName || '',
          testEnvironment: checklistResponse.testEnvironment || '',
          testDate: checklistResponse.testDate || '',
          buildVersion: checklistResponse.buildVersion || '',
          hotelTenantTested: checklistResponse.hotelTenantTested || checklistResponse.hotelName || '',
          checklistItems: { ...defaultChecklistItems, ...(checklistResponse.checklistItems || {}) },
          finalDecision: checklistResponse.finalDecision,
          qaLead: checklistResponse.qaLead || '',
          businessOwner: checklistResponse.businessOwner || '',
          productOwner: checklistResponse.productOwner || '',
          approvalDate: checklistResponse.approvalDate || '',
        });
      })
      .catch(fetchError => {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load UAT workspace');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, selectedHotelId]);

  const refreshDefects = async () => {
    if (!token || !selectedHotelId) {
      return;
    }

    const updatedDefects = await uatApi.getDefects(token, Number(selectedHotelId));
    setDefects(updatedDefects);
  };

  const handleChecklistItemChange = (key: string, checked: boolean) => {
    setFormState(prev => ({
      ...prev,
      checklistItems: {
        ...prev.checklistItems,
        [key]: checked,
      },
    }));
  };

  const handleChecklistSave = async () => {
    if (!token || !selectedHotelId) {
      return;
    }

    try {
      setSavingChecklist(true);
      const savedChecklist = await uatApi.saveChecklist(token, Number(selectedHotelId), formState);
      setChecklist(savedChecklist);
      setSuccess('UAT checklist saved');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save UAT checklist');
    } finally {
      setSavingChecklist(false);
    }
  };

  const openCreateDefectDialog = () => {
    setEditingDefect(null);
    setDefectForm({
      summary: '',
      testerDetail: '',
      severity: 'MEDIUM',
      blockingRelease: false,
      adminNotes: '',
      fixDetails: '',
      status: 'OPEN',
    });
    setDefectDialogOpen(true);
  };

  const openEditDefectDialog = (defect: UatDefect) => {
    setEditingDefect(defect);
    setDefectForm({
      summary: defect.summary,
      testerDetail: defect.testerDetail || '',
      severity: defect.severity,
      blockingRelease: defect.blockingRelease,
      adminNotes: defect.adminNotes || '',
      fixDetails: defect.fixDetails || '',
      status: defect.status,
    });
    setDefectDialogOpen(true);
  };

  const handleDefectSave = async () => {
    if (!token || !selectedHotelId) {
      return;
    }

    try {
      if (editingDefect) {
        await uatApi.updateDefect(token, Number(selectedHotelId), editingDefect.id, defectForm);
      } else {
        await uatApi.createDefect(token, Number(selectedHotelId), defectForm);
      }
      await refreshDefects();
      setDefectDialogOpen(false);
      setSuccess(editingDefect ? 'Defect updated' : 'Defect created');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save defect');
    }
  };

  const selectedHotelIdNumber = selectedHotelId ? Number(selectedHotelId) : null;

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            UAT Testing Workspace
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Use the sign-off checklist during UAT and track open defects, admin notes, fix details, and closure state for the shared platform test hotel.
          </Typography>
        </Box>
        {selectedHotelIdNumber && (
          <Chip color="primary" label={workspaceHotel?.hotelName || checklist?.hotelName || `Hotel ${selectedHotelIdNumber}`} />
        )}
      </Box>

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

      {workspaceHotel && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">Shared UAT Hotel</Typography>
          <Typography variant="h6">{workspaceHotel.hotelName}</Typography>
          <Typography variant="body2" color="text.secondary">
            {workspaceHotel.city ? `${workspaceHotel.city}${workspaceHotel.country ? `, ${workspaceHotel.country}` : ''}` : 'Platform-wide UAT workspace'}
          </Typography>
          {isPlatformAdmin && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Admin access uses this single shared hotel for all UAT execution. Hotel switching is intentionally disabled here.
            </Typography>
          )}
        </Paper>
      )}

      {!selectedHotelId && !loading && (
        <Alert severity="info">
          Waiting for the shared UAT hotel to be resolved.
        </Alert>
      )}

      {selectedHotelId && (
        <Paper>
          <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
            <Tab icon={<FactCheck />} iconPosition="start" label="UAT Sign-Off Checklist" />
            <Tab icon={<BugReport />} iconPosition="start" label="Open Defects And Notes" />
          </Tabs>

          {loading ? (
            <Box sx={{ p: 4 }}>
              <Typography>Loading UAT workspace...</Typography>
            </Box>
          ) : (
            <>
              {activeTab === 0 && (
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                      <PremiumTextField fullWidth label="Tester Name" value={formState.testerName || ''} onChange={event => setFormState(prev => ({ ...prev, testerName: event.target.value }))} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <PremiumTextField fullWidth label="Test Environment" value={formState.testEnvironment || ''} onChange={event => setFormState(prev => ({ ...prev, testEnvironment: event.target.value }))} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <PremiumTextField fullWidth type="date" label="Test Date" value={formState.testDate || ''} onChange={event => setFormState(prev => ({ ...prev, testDate: event.target.value }))} InputLabelProps={{ shrink: true }} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <PremiumTextField fullWidth label="Build Version" value={formState.buildVersion || ''} onChange={event => setFormState(prev => ({ ...prev, buildVersion: event.target.value }))} />
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <PremiumTextField fullWidth label="Hotel / Tenant Tested" value={formState.hotelTenantTested || ''} onChange={event => setFormState(prev => ({ ...prev, hotelTenantTested: event.target.value }))} />
                    </Grid>
                  </Grid>

                  <Grid container spacing={2}>
                    {CHECKLIST_SECTIONS.map(section => (
                      <Grid item xs={12} md={6} key={section.title}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent>
                            <Typography variant="h6" sx={{ mb: 1.5 }}>{section.title}</Typography>
                            <FormGroup>
                              {section.items.map(item => (
                                <FormControlLabel
                                  key={item.key}
                                  control={
                                    <Checkbox
                                      checked={Boolean(formState.checklistItems[item.key])}
                                      onChange={event => handleChecklistItemChange(item.key, event.target.checked)}
                                    />
                                  }
                                  label={item.label}
                                />
                              ))}
                            </FormGroup>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel id="final-decision-label">Final UAT Decision</InputLabel>
                        <Select
                          labelId="final-decision-label"
                          label="Final UAT Decision"
                          value={formState.finalDecision || ''}
                          onChange={(event: SelectChangeEvent<string>) => setFormState(prev => ({ ...prev, finalDecision: event.target.value as UatFinalDecision }))}
                        >
                          {FINAL_DECISION_OPTIONS.map(option => (
                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <PremiumTextField fullWidth label="QA Lead" value={formState.qaLead || ''} onChange={event => setFormState(prev => ({ ...prev, qaLead: event.target.value }))} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <PremiumTextField fullWidth type="date" label="Approval Date" value={formState.approvalDate || ''} onChange={event => setFormState(prev => ({ ...prev, approvalDate: event.target.value }))} InputLabelProps={{ shrink: true }} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <PremiumTextField fullWidth label="Business Owner" value={formState.businessOwner || ''} onChange={event => setFormState(prev => ({ ...prev, businessOwner: event.target.value }))} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <PremiumTextField fullWidth label="Product Owner" value={formState.productOwner || ''} onChange={event => setFormState(prev => ({ ...prev, productOwner: event.target.value }))} />
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button variant="contained" startIcon={<Save />} onClick={handleChecklistSave} disabled={savingChecklist}>
                      {savingChecklist ? 'Saving...' : 'Save Checklist'}
                    </Button>
                  </Box>
                </Box>
              )}

              {activeTab === 1 && (
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="h6">Open Defects And Notes</Typography>
                    <Button variant="contained" startIcon={<BugReport />} onClick={openCreateDefectDialog}>
                      Add Defect
                    </Button>
                  </Box>

                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Defect ID</TableCell>
                          <TableCell>Summary</TableCell>
                          <TableCell>Severity</TableCell>
                          <TableCell>Blocking Release?</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Notes</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {defects.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6}>
                              <Typography color="text.secondary">No defects have been logged yet.</Typography>
                            </TableCell>
                          </TableRow>
                        )}
                        {defects.map(defect => (
                          <TableRow key={defect.id} hover sx={{ cursor: 'pointer' }} onClick={() => openEditDefectDialog(defect)}>
                            <TableCell>{defect.defectId}</TableCell>
                            <TableCell>{defect.summary}</TableCell>
                            <TableCell>
                              <Chip size="small" label={defect.severity} color={defect.severity === 'CRITICAL' ? 'error' : defect.severity === 'HIGH' ? 'warning' : 'default'} />
                            </TableCell>
                            <TableCell>{defect.blockingRelease ? 'Yes' : 'No'}</TableCell>
                            <TableCell>
                              <Chip size="small" label={defect.status.replace('_', ' ')} color={defect.status === 'CLOSED' ? 'success' : defect.status === 'FIXED' ? 'primary' : 'default'} />
                            </TableCell>
                            <TableCell>{defect.adminNotes || defect.fixDetails || defect.testerDetail || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </>
          )}
        </Paper>
      )}

      <Dialog open={defectDialogOpen} onClose={() => setDefectDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingDefect ? 'Edit Defect' : 'Add Defect'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <PremiumTextField fullWidth label="Summary" value={defectForm.summary} onChange={event => setDefectForm(prev => ({ ...prev, summary: event.target.value }))} required />
            </Grid>
            <Grid item xs={12}>
              <PremiumTextField fullWidth multiline minRows={4} label="Tester Detail" value={defectForm.testerDetail || ''} onChange={event => setDefectForm(prev => ({ ...prev, testerDetail: event.target.value }))} />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="defect-severity-label">Severity</InputLabel>
                <Select
                  labelId="defect-severity-label"
                  label="Severity"
                  value={defectForm.severity || 'MEDIUM'}
                  onChange={(event: SelectChangeEvent<string>) => setDefectForm(prev => ({ ...prev, severity: event.target.value as UatDefectSeverity }))}
                >
                  {SEVERITY_OPTIONS.map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="defect-status-label">Status</InputLabel>
                <Select
                  labelId="defect-status-label"
                  label="Status"
                  value={defectForm.status || 'OPEN'}
                  disabled={!isPlatformAdmin}
                  onChange={(event: SelectChangeEvent<string>) => setDefectForm(prev => ({ ...prev, status: event.target.value as UatDefectStatus }))}
                >
                  {STATUS_OPTIONS.map(option => (
                    <MenuItem key={option} value={option}>{option.replace('_', ' ')}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={<Checkbox checked={Boolean(defectForm.blockingRelease)} onChange={event => setDefectForm(prev => ({ ...prev, blockingRelease: event.target.checked }))} />}
                label="Blocking Release?"
              />
            </Grid>
            <Grid item xs={12}>
              <PremiumTextField
                fullWidth
                multiline
                minRows={3}
                label="Admin Notes"
                value={defectForm.adminNotes || ''}
                disabled={!isPlatformAdmin}
                onChange={event => setDefectForm(prev => ({ ...prev, adminNotes: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <PremiumTextField
                fullWidth
                multiline
                minRows={3}
                label="Fix Details"
                value={defectForm.fixDetails || ''}
                disabled={!isPlatformAdmin}
                onChange={event => setDefectForm(prev => ({ ...prev, fixDetails: event.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDefectDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleDefectSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UatTestingPage;