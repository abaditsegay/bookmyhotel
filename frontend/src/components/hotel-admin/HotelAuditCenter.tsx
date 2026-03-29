import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  List,
  ListItem,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../contexts/AuthContext';
import processMonitoringService from '../../services/processMonitoringService';
import { AuditTaxonomyDto, AuditTrailDto } from '../../types/monitoring';
import { formatDateTimeForDisplay } from '../../utils/dateUtils';

interface HotelAuditCenterProps {
  hotelId?: number;
}

const emptyTaxonomy: AuditTaxonomyDto = {
  entityTypes: [],
  actions: [],
  complianceCategories: [],
};

const initialManualAuditForm = {
  entityType: '',
  entityId: '',
  action: '',
  reason: '',
  changedFields: '',
  oldValues: '',
  newValues: '',
  complianceCategory: '',
  isSensitive: false,
};

const HotelAuditCenter: React.FC<HotelAuditCenterProps> = ({ hotelId }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [taxonomy, setTaxonomy] = useState<AuditTaxonomyDto>(emptyTaxonomy);
  const [recentLogs, setRecentLogs] = useState<AuditTrailDto[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditTrailDto[]>([]);
  const [complianceLogs, setComplianceLogs] = useState<AuditTrailDto[]>([]);
  const [entityType, setEntityType] = useState('');
  const [entityId, setEntityId] = useState('');
  const [complianceCategory, setComplianceCategory] = useState('');
  const [loadingTaxonomy, setLoadingTaxonomy] = useState(false);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [loadingTrail, setLoadingTrail] = useState(false);
  const [loadingCompliance, setLoadingCompliance] = useState(false);
  const [submittingManualAudit, setSubmittingManualAudit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [manualAuditForm, setManualAuditForm] = useState(initialManualAuditForm);

  const parsedUserId = user?.id ? Number(user.id) : NaN;
  const canSubmitManualAudit = Boolean(
    hotelId
    && manualAuditForm.entityType
    && manualAuditForm.action
    && manualAuditForm.entityId.trim()
    && Number.isInteger(parsedUserId)
    && parsedUserId > 0
    && user?.email
  );
  const currentUserName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || '';

  const updateManualAuditForm = <K extends keyof typeof initialManualAuditForm>(key: K, value: (typeof initialManualAuditForm)[K]) => {
    setManualAuditForm((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    if (!hotelId) {
      return;
    }

    let active = true;

    const loadInitialData = async () => {
      setLoadingTaxonomy(true);
      setLoadingRecent(true);
      setError(null);

      try {
        const [taxonomyResponse, logsResponse] = await Promise.all([
          processMonitoringService.getAuditTaxonomy(hotelId),
          processMonitoringService.getAuditLogs(hotelId, 0, 8, 'timestamp,desc'),
        ]);

        if (!active) {
          return;
        }

        setTaxonomy(taxonomyResponse);
        setRecentLogs(logsResponse.content || []);
        setEntityType((current) => current || taxonomyResponse.entityTypes[0] || '');
        setComplianceCategory((current) => current || taxonomyResponse.complianceCategories[0] || '');
        setManualAuditForm((current) => ({
          ...current,
          entityType: current.entityType || taxonomyResponse.entityTypes[0] || '',
          action: current.action || taxonomyResponse.actions[0] || '',
        }));
      } catch {
        if (active) {
          setError(t('dashboard.hotelAdmin.audit.errors.loadInitial'));
        }
      } finally {
        if (active) {
          setLoadingTaxonomy(false);
          setLoadingRecent(false);
        }
      }
    };

    void loadInitialData();

    return () => {
      active = false;
    };
  }, [hotelId, t]);

  const loadRecentLogs = async () => {
    if (!hotelId) {
      return;
    }

    setLoadingRecent(true);
    setError(null);

    try {
      const logsResponse = await processMonitoringService.getAuditLogs(hotelId, 0, 8, 'timestamp,desc');
      setRecentLogs(logsResponse.content || []);
    } catch {
      setError(t('dashboard.hotelAdmin.audit.errors.loadRecent'));
    } finally {
      setLoadingRecent(false);
    }
  };

  const loadAuditTrail = async () => {
    if (!hotelId || !entityType || !entityId.trim()) {
      return;
    }

    setLoadingTrail(true);
    setError(null);

    try {
      const trail = await processMonitoringService.getAuditTrail(hotelId, entityType, Number(entityId));
      setAuditTrail(trail);
    } catch {
      setError(t('dashboard.hotelAdmin.audit.errors.loadTrail'));
      setAuditTrail([]);
    } finally {
      setLoadingTrail(false);
    }
  };

  const loadComplianceLogs = async () => {
    if (!hotelId || !complianceCategory) {
      return;
    }

    setLoadingCompliance(true);
    setError(null);

    try {
      const report = await processMonitoringService.getComplianceReport(hotelId, complianceCategory, 0, 8);
      setComplianceLogs(report.content || []);
    } catch {
      setError(t('dashboard.hotelAdmin.audit.errors.loadCompliance'));
      setComplianceLogs([]);
    } finally {
      setLoadingCompliance(false);
    }
  };

  const submitManualAudit = async () => {
    if (!hotelId || !canSubmitManualAudit || !user?.email) {
      return;
    }

    setSubmittingManualAudit(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await processMonitoringService.createAuditLog(hotelId, {
        entityType: manualAuditForm.entityType,
        entityId: Number(manualAuditForm.entityId),
        action: manualAuditForm.action,
        oldValues: manualAuditForm.oldValues || undefined,
        newValues: manualAuditForm.newValues || undefined,
        changedFields: manualAuditForm.changedFields || undefined,
        userId: parsedUserId,
        userName: currentUserName,
        userEmail: user.email,
        userRole: user.role,
        reason: manualAuditForm.reason || undefined,
        isSensitive: manualAuditForm.isSensitive,
        complianceCategory: manualAuditForm.complianceCategory || undefined,
      });

      setSuccessMessage(t('dashboard.hotelAdmin.audit.messages.createSuccess'));
      setEntityType(manualAuditForm.entityType);
      setEntityId(manualAuditForm.entityId);
      if (manualAuditForm.complianceCategory) {
        setComplianceCategory(manualAuditForm.complianceCategory);
      }
      setManualAuditForm((current) => ({
        ...initialManualAuditForm,
        entityType: current.entityType,
        action: current.action,
      }));

      await Promise.all([
        loadRecentLogs(),
        processMonitoringService.getAuditTrail(hotelId, manualAuditForm.entityType, Number(manualAuditForm.entityId))
          .then(setAuditTrail)
          .catch(() => setAuditTrail([])),
        manualAuditForm.complianceCategory
          ? processMonitoringService.getComplianceReport(hotelId, manualAuditForm.complianceCategory, 0, 8)
              .then((report) => setComplianceLogs(report.content || []))
              .catch(() => setComplianceLogs([]))
          : Promise.resolve(),
      ]);
    } catch {
      setError(t('dashboard.hotelAdmin.audit.errors.createManual'));
    } finally {
      setSubmittingManualAudit(false);
    }
  };

  const renderAuditList = (items: AuditTrailDto[], emptyMessage: string) => {
    if (items.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          {emptyMessage}
        </Typography>
      );
    }

    return (
      <List disablePadding>
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            <ListItem disableGutters sx={{ display: 'block', py: 1.5 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1, alignItems: { sm: 'center' } }}>
                <Chip label={item.action} size="small" variant="outlined" />
                <Chip label={item.entityType} size="small" color="primary" variant="outlined" />
                {item.complianceCategory && (
                  <Chip label={item.complianceCategory} size="small" color="secondary" variant="outlined" />
                )}
              </Stack>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {item.userName} · {formatDateTimeForDisplay(item.timestamp)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.reason || item.details || t('dashboard.hotelAdmin.audit.noDetails')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                #{item.entityId} · {item.userRole}
              </Typography>
            </ListItem>
            {index < items.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    );
  };

  if (!hotelId) {
    return <Alert severity="warning">{t('dashboard.hotelAdmin.audit.hotelUnavailable')}</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            {t('dashboard.hotelAdmin.audit.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('dashboard.hotelAdmin.audit.subtitle')}
          </Typography>
        </Box>
        <Button variant="outlined" onClick={loadRecentLogs} disabled={loadingRecent || loadingTaxonomy}>
          {t('dashboard.hotelAdmin.audit.refresh')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {t('dashboard.hotelAdmin.audit.manualEntryTitle')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('dashboard.hotelAdmin.audit.manualEntryDescription')}
              </Typography>
              {!Number.isInteger(parsedUserId) || !user?.email ? (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {t('dashboard.hotelAdmin.audit.userContextUnavailable')}
                </Alert>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t('dashboard.hotelAdmin.audit.loggedInAs', { name: currentUserName, role: user.role })}
                </Typography>
              )}
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    label={t('dashboard.hotelAdmin.audit.entityType')}
                    value={manualAuditForm.entityType}
                    onChange={(event) => updateManualAuditForm('entityType', event.target.value)}
                    fullWidth
                    size="small"
                  >
                    {taxonomy.entityTypes.map((value) => (
                      <MenuItem key={value} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    label={t('dashboard.hotelAdmin.audit.action')}
                    value={manualAuditForm.action}
                    onChange={(event) => updateManualAuditForm('action', event.target.value)}
                    fullWidth
                    size="small"
                  >
                    {taxonomy.actions.map((value) => (
                      <MenuItem key={value} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label={t('dashboard.hotelAdmin.audit.entityId')}
                    value={manualAuditForm.entityId}
                    onChange={(event) => updateManualAuditForm('entityId', event.target.value.replace(/[^0-9]/g, ''))}
                    placeholder={t('dashboard.hotelAdmin.audit.entityIdPlaceholder')}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    label={t('dashboard.hotelAdmin.audit.complianceCategoryOptional')}
                    value={manualAuditForm.complianceCategory}
                    onChange={(event) => updateManualAuditForm('complianceCategory', event.target.value)}
                    fullWidth
                    size="small"
                  >
                    <MenuItem value="">{t('dashboard.hotelAdmin.audit.none')}</MenuItem>
                    {taxonomy.complianceCategories.map((value) => (
                      <MenuItem key={value} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label={t('dashboard.hotelAdmin.audit.reason')}
                    value={manualAuditForm.reason}
                    onChange={(event) => updateManualAuditForm('reason', event.target.value)}
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label={t('dashboard.hotelAdmin.audit.changedFields')}
                    value={manualAuditForm.changedFields}
                    onChange={(event) => updateManualAuditForm('changedFields', event.target.value)}
                    fullWidth
                    size="small"
                    placeholder={t('dashboard.hotelAdmin.audit.changedFieldsPlaceholder')}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label={t('dashboard.hotelAdmin.audit.oldValues')}
                    value={manualAuditForm.oldValues}
                    onChange={(event) => updateManualAuditForm('oldValues', event.target.value)}
                    fullWidth
                    size="small"
                    multiline
                    minRows={3}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label={t('dashboard.hotelAdmin.audit.newValues')}
                    value={manualAuditForm.newValues}
                    onChange={(event) => updateManualAuditForm('newValues', event.target.value)}
                    fullWidth
                    size="small"
                    multiline
                    minRows={3}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
                    <FormControlLabel
                      control={(
                        <Checkbox
                          checked={manualAuditForm.isSensitive}
                          onChange={(event) => updateManualAuditForm('isSensitive', event.target.checked)}
                        />
                      )}
                      label={t('dashboard.hotelAdmin.audit.sensitiveEntry')}
                    />
                    <Button
                      variant="contained"
                      onClick={submitManualAudit}
                      disabled={!canSubmitManualAudit || submittingManualAudit}
                    >
                      {submittingManualAudit
                        ? t('dashboard.hotelAdmin.audit.submitting')
                        : t('dashboard.hotelAdmin.audit.createEntry')}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {t('dashboard.hotelAdmin.audit.recentActivity')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('dashboard.hotelAdmin.audit.recentActivityDescription')}
              </Typography>
              {loadingRecent ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : (
                renderAuditList(recentLogs, t('dashboard.hotelAdmin.audit.emptyRecent'))
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {t('dashboard.hotelAdmin.audit.taxonomyTitle')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('dashboard.hotelAdmin.audit.taxonomyDescription')}
              </Typography>
              {loadingTaxonomy ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : (
                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      {t('dashboard.hotelAdmin.audit.supportedEntityTypes')}
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      {taxonomy.entityTypes.map((value) => (
                        <Chip key={value} label={value} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      {t('dashboard.hotelAdmin.audit.supportedActions')}
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      {taxonomy.actions.map((value) => (
                        <Chip key={value} label={value} size="small" color="primary" variant="outlined" />
                      ))}
                    </Stack>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      {t('dashboard.hotelAdmin.audit.supportedComplianceCategories')}
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      {taxonomy.complianceCategories.map((value) => (
                        <Chip key={value} label={value} size="small" color="secondary" variant="outlined" />
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {t('dashboard.hotelAdmin.audit.auditTrailTitle')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('dashboard.hotelAdmin.audit.auditTrailDescription')}
              </Typography>
              <Stack spacing={2} sx={{ mb: 2 }}>
                <TextField
                  select
                  label={t('dashboard.hotelAdmin.audit.entityType')}
                  value={entityType}
                  onChange={(event) => setEntityType(event.target.value)}
                  fullWidth
                  size="small"
                >
                  {taxonomy.entityTypes.map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label={t('dashboard.hotelAdmin.audit.entityId')}
                  value={entityId}
                  onChange={(event) => setEntityId(event.target.value.replace(/[^0-9]/g, ''))}
                  placeholder={t('dashboard.hotelAdmin.audit.entityIdPlaceholder')}
                  fullWidth
                  size="small"
                />
                <Button variant="contained" onClick={loadAuditTrail} disabled={loadingTrail || !entityType || !entityId.trim()}>
                  {t('dashboard.hotelAdmin.audit.loadTrail')}
                </Button>
              </Stack>
              {loadingTrail ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : (
                renderAuditList(auditTrail, t('dashboard.hotelAdmin.audit.emptyTrail'))
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {t('dashboard.hotelAdmin.audit.complianceTitle')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('dashboard.hotelAdmin.audit.complianceDescription')}
              </Typography>
              <Stack spacing={2} sx={{ mb: 2 }}>
                <TextField
                  select
                  label={t('dashboard.hotelAdmin.audit.complianceCategory')}
                  value={complianceCategory}
                  onChange={(event) => setComplianceCategory(event.target.value)}
                  fullWidth
                  size="small"
                >
                  {taxonomy.complianceCategories.map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </TextField>
                <Button variant="contained" color="secondary" onClick={loadComplianceLogs} disabled={loadingCompliance || !complianceCategory}>
                  {t('dashboard.hotelAdmin.audit.loadCompliance')}
                </Button>
              </Stack>
              {loadingCompliance ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : (
                renderAuditList(complianceLogs, t('dashboard.hotelAdmin.audit.emptyCompliance'))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HotelAuditCenter;