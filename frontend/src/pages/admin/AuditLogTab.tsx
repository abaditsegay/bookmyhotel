import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Paper,
  Grid,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Visibility as ViewIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { adminApiService, SystemAuditLogDto, AuditLogParams } from '../../services/adminApi';
import { useAuthenticatedApi } from '../../hooks/useAuthenticatedApi';
import PremiumTextField from '../../components/common/PremiumTextField';
import PremiumSelect from '../../components/common/PremiumSelect';
import { dialogSecondaryActionSx } from '../../theme/sxHelpers';
import { formatDateTimeForDisplay } from '../../utils/dateUtils';
import { useTranslation } from 'react-i18next';

const ENTITY_TYPES = ['SYSTEM', 'USER', 'HOTEL', 'ROOM', 'TENANT', 'HOTEL_REGISTRATION'];
const ACTIONS = [
  'CREATE', 'UPDATE', 'DELETE', 'TOGGLE_STATUS',
  'ASSIGN_ADMIN', 'ADD_ROLE', 'REMOVE_ROLE',
  'RESET_PASSWORD', 'APPROVE', 'REJECT', 'UNDER_REVIEW', 'ACTION',
];

const AuditLogTab: React.FC = () => {
  useAuthenticatedApi();
  const theme = useTheme();
  const { t } = useTranslation();

  const [logs, setLogs] = useState<SystemAuditLogDto[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [statsTotal, setStatsTotal] = useState<number | null>(null);
  const [statsFailed, setStatsFailed] = useState<number | null>(null);

  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Detail dialog
  const [selectedLog, setSelectedLog] = useState<SystemAuditLogDto | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const translateAuditAction = useCallback(
    (action: string) => t(`admin.auditLog.actions.${action}`, action.replace(/_/g, ' ')),
    [t],
  );

  const translateEntityType = useCallback(
    (entityType: string) => t(`admin.auditLog.entityTypes.${entityType}`, entityType.replace(/_/g, ' ')),
    [t],
  );

  const loadStats = useCallback(async () => {
    try {
      const stats = await adminApiService.getAuditStats();
      setStatsTotal(stats.totalToday);
      setStatsFailed(stats.failedToday);
    } catch {
      // Stats are non-critical; silently ignore
    }
  }, []);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: AuditLogParams = {
        page,
        size: rowsPerPage,
        sort: 'performedAt,desc',
        action: actionFilter || undefined,
        entityType: entityTypeFilter || undefined,
        userEmail: emailFilter || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      };
      const result = await adminApiService.getAuditLogs(params);
      setLogs(result.content || []);
      setTotalElements(result.totalElements || 0);
    } catch {
      setError(t('admin.auditLog.errors.loadFailed'));
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, actionFilter, entityTypeFilter, emailFilter, fromDate, toDate, t]);

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [loadLogs, loadStats]);

  const handleViewDetail = (log: SystemAuditLogDto) => {
    setSelectedLog(log);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedLog(null);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const resetFilters = () => {
    setActionFilter('');
    setEntityTypeFilter('');
    setEmailFilter('');
    setFromDate('');
    setToDate('');
    setPage(0);
  };

  const formatDateTime = (dt: string) => {
    try {
      return formatDateTimeForDisplay(dt);
    } catch {
      return dt;
    }
  };

  return (
    <Box>
      {/* Stats Banner */}
      {statsTotal !== null && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Box sx={{
            px: 3, py: 1.5, borderRadius: 1,
            backgroundColor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.18 : 0.08),
            display: 'flex', alignItems: 'center', gap: 1,
          }}>
            <Typography variant="body2" color="text.secondary">{t('admin.auditLog.stats.actionsToday')}</Typography>
            <Typography variant="h6" fontWeight={600}>{statsTotal}</Typography>
          </Box>
          <Box sx={{
            px: 3, py: 1.5, borderRadius: 1,
            backgroundColor: alpha(
              statsFailed && statsFailed > 0 ? theme.palette.error.main : theme.palette.success.main,
              theme.palette.mode === 'dark' ? 0.18 : 0.08,
            ),
            display: 'flex', alignItems: 'center', gap: 1,
          }}>
            <Typography variant="body2" color="text.secondary">{t('admin.auditLog.stats.failedToday')}</Typography>
            <Typography
              variant="h6"
              fontWeight={600}
              color={statsFailed && statsFailed > 0 ? 'error' : 'success.main'}
            >
              {statsFailed}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <PremiumSelect
          label={t('admin.auditLog.filters.action')}
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
          fullWidth={false}
          sx={{ minWidth: 160 }}
        >
          <option value="">{t('admin.auditLog.filters.allActions')}</option>
          {ACTIONS.map(a => <option key={a} value={a}>{translateAuditAction(a)}</option>)}
        </PremiumSelect>
        <PremiumSelect
          label={t('admin.auditLog.filters.entityType')}
          value={entityTypeFilter}
          onChange={(e) => { setEntityTypeFilter(e.target.value); setPage(0); }}
          fullWidth={false}
          sx={{ minWidth: 180 }}
        >
          <option value="">{t('admin.auditLog.filters.allTypes')}</option>
          {ENTITY_TYPES.map(entityType => <option key={entityType} value={entityType}>{translateEntityType(entityType)}</option>)}
        </PremiumSelect>
        <PremiumTextField
          size="small"
          placeholder={t('admin.auditLog.filters.emailPlaceholder')}
          value={emailFilter}
          onChange={(e) => { setEmailFilter(e.target.value); setPage(0); }}
          sx={{ minWidth: 220 }}
        />
        <PremiumTextField
          size="small"
          label={t('admin.auditLog.filters.fromDate')}
          type="datetime-local"
          value={fromDate}
          onChange={(e) => { setFromDate(e.target.value); setPage(0); }}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 200 }}
        />
        <PremiumTextField
          size="small"
          label={t('admin.auditLog.filters.toDate')}
          type="datetime-local"
          value={toDate}
          onChange={(e) => { setToDate(e.target.value); setPage(0); }}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 200 }}
        />
        <Tooltip title={t('common.refresh')}>
          <IconButton onClick={() => { loadLogs(); loadStats(); }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        {(actionFilter || entityTypeFilter || emailFilter || fromDate || toDate) && (
          <Button size="small" variant="outlined" onClick={resetFilters}>
            {t('admin.auditLog.filters.clear')}
          </Button>
        )}
      </Box>

      {/* Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ py: 2 }}>{error}</Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('admin.auditLog.table.timestamp')}</TableCell>
                <TableCell>{t('admin.auditLog.table.actor')}</TableCell>
                <TableCell>{t('admin.auditLog.table.role')}</TableCell>
                <TableCell>{t('admin.auditLog.table.action')}</TableCell>
                <TableCell>{t('admin.auditLog.table.entityType')}</TableCell>
                <TableCell>{t('admin.auditLog.table.entityId')}</TableCell>
                <TableCell>{t('admin.auditLog.table.description')}</TableCell>
                <TableCell>{t('admin.auditLog.table.status')}</TableCell>
                <TableCell>IP</TableCell>
                <TableCell align="center">{t('admin.auditLog.table.details')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      {t('admin.auditLog.emptyState')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Typography variant="caption" noWrap>
                        {formatDateTime(log.performedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" noWrap>{log.performedByUserName ?? '—'}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {log.performedByUserEmail ?? ''}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{log.performedByUserRole ?? '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={translateAuditAction(log.action)} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{translateEntityType(log.entityType)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{log.entityId ?? '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {log.description || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {log.success ? (
                        <Chip
                          icon={<SuccessIcon />}
                          label={t('common.success')}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      ) : (
                        <Chip
                          icon={<ErrorIcon />}
                          label={t('admin.auditLog.status.failed')}
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{log.ipAddress ?? '—'}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={t('admin.auditLog.table.viewFullDetails')}>
                        <IconButton size="small" onClick={() => handleViewDetail(log)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10, 20, 50]}
            component="div"
            count={totalElements}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={t('admin.auditLog.table.rowsPerPage')}
          />
        </TableContainer>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={handleCloseDetail} maxWidth="md" fullWidth>
        <DialogTitle>
          {t('admin.auditLog.detail.title')}
          {selectedLog && (
            <Chip
              label={selectedLog.success ? t('common.success') : t('admin.auditLog.status.failed')}
              color={selectedLog.success ? 'success' : 'error'}
              size="small"
              sx={{ ml: 2 }}
            />
          )}
        </DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">{t('admin.auditLog.detail.timestamp')}</Typography>
                <Typography variant="body2">{formatDateTime(selectedLog.performedAt)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">{t('admin.auditLog.detail.action')}</Typography>
                <Typography variant="body2">{translateAuditAction(selectedLog.action)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">{t('admin.auditLog.detail.entityType')}</Typography>
                <Typography variant="body2">{translateEntityType(selectedLog.entityType)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">{t('admin.auditLog.detail.entityId')}</Typography>
                <Typography variant="body2">{selectedLog.entityId ?? '—'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">{t('admin.auditLog.detail.description')}</Typography>
                <Typography variant="body2">{selectedLog.description || '—'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">{t('admin.auditLog.detail.performedBy')}</Typography>
                <Typography variant="body2">{selectedLog.performedByUserName ?? '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">{t('admin.auditLog.detail.email')}</Typography>
                <Typography variant="body2">{selectedLog.performedByUserEmail ?? '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">{t('admin.auditLog.detail.role')}</Typography>
                <Typography variant="body2">{selectedLog.performedByUserRole ?? '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">{t('admin.auditLog.detail.ipAddress')}</Typography>
                <Typography variant="body2">{selectedLog.ipAddress ?? '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">{t('admin.auditLog.detail.request')}</Typography>
                <Typography variant="body2">
                  {selectedLog.requestMethod ?? ''} {selectedLog.requestPath ?? '—'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">{t('admin.auditLog.detail.responseStatus')}</Typography>
                <Typography variant="body2">{selectedLog.responseStatus ?? '—'}</Typography>
              </Grid>
              {selectedLog.errorMessage && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">{t('common.error')}</Typography>
                  <Typography variant="body2" color="error">{selectedLog.errorMessage}</Typography>
                </Grid>
              )}
              {selectedLog.oldValues && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">{t('admin.auditLog.detail.oldValues')}</Typography>
                  <Paper variant="outlined" sx={{ p: 1, mt: 0.5, fontFamily: 'monospace', fontSize: 12, overflow: 'auto' }}>
                    {selectedLog.oldValues}
                  </Paper>
                </Grid>
              )}
              {selectedLog.newValues && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">{t('admin.auditLog.detail.newValues')}</Typography>
                  <Paper variant="outlined" sx={{ p: 1, mt: 0.5, fontFamily: 'monospace', fontSize: 12, overflow: 'auto' }}>
                    {selectedLog.newValues}
                  </Paper>
                </Grid>
              )}
              {selectedLog.userAgent && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">{t('admin.auditLog.detail.userAgent')}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                    {selectedLog.userAgent}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>{t('common.close')}</Button>
          <Button variant="outlined" sx={dialogSecondaryActionSx} onClick={handleCloseDetail}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditLogTab;
