import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Refresh as RefreshIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import PremiumSelect from '../../components/common/PremiumSelect';
import PremiumTextField from '../../components/common/PremiumTextField';
import { useAuth } from '../../contexts/AuthContext';
import {
  hotelAdminApi,
  HotelActivityLogParams,
  HotelActivityLog,
} from '../../services/hotelAdminApi';
import { formatDateTimeForDisplay } from '../../utils/dateUtils';
import { useTranslation } from 'react-i18next';

const ENTITY_TYPES = [
  'RESERVATION',
  'ROOM',
  'USER',
  'HOUSEKEEPING_TASK',
  'SHOP_ORDER',
  'PRODUCT',
  'PRICING_CONFIG',
  'PAYMENT',
];

const ACTIONS = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'STATUS_CHANGE',
  'CHECK_IN',
  'CHECK_OUT',
  'ASSIGN',
  'CANCEL',
  'NO_SHOW',
];

const prettyLabel = (value: string) => value.replace(/_/g, ' ');

const HotelActivityTab: React.FC = () => {
  const { token } = useAuth();
  const theme = useTheme();
  const { t } = useTranslation();

  const [logs, setLogs] = useState<HotelActivityLog[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [statsTotal, setStatsTotal] = useState<number | null>(null);
  const [statsSensitive, setStatsSensitive] = useState<number | null>(null);

  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const loadStats = useCallback(async () => {
    if (!token) {
      return;
    }

    const result = await hotelAdminApi.getActivityStats(token);
    if (result.success && result.data) {
      setStatsTotal(result.data.totalToday);
      setStatsSensitive(result.data.sensitiveToday);
    }
  }, [token]);

  const loadLogs = useCallback(async () => {
    if (!token) {
      setLogs([]);
      setTotalElements(0);
      setError(t('dashboard.hotelAdmin.activities.errors.authRequired', 'Authentication is required to load activities.'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params: HotelActivityLogParams = {
        page,
        size: rowsPerPage,
        sort: 'timestamp,desc',
        action: actionFilter || undefined,
        entityType: entityTypeFilter || undefined,
        userEmail: emailFilter || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      };

      const result = await hotelAdminApi.getActivityLogs(token, params);
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to load activities');
      }

      setLogs(result.data.content || []);
      setTotalElements(result.data.totalElements || 0);
    } catch (loadError) {
      setLogs([]);
      setTotalElements(0);
      setError(loadError instanceof Error
        ? loadError.message
        : t('dashboard.hotelAdmin.activities.errors.loadFailed', 'Failed to load hotel activities.'));
    } finally {
      setLoading(false);
    }
  }, [token, page, rowsPerPage, actionFilter, entityTypeFilter, emailFilter, fromDate, toDate, t]);

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [loadLogs, loadStats]);

  const resetFilters = () => {
    setActionFilter('');
    setEntityTypeFilter('');
    setEmailFilter('');
    setFromDate('');
    setToDate('');
    setPage(0);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Paper sx={{ px: 3, py: 2, minWidth: 180, backgroundColor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.16 : 0.08) }}>
          <Typography variant="body2" color="text.secondary">
            {t('dashboard.hotelAdmin.activities.stats.actionsToday', 'Actions Today')}
          </Typography>
          <Typography variant="h5" fontWeight={700}>{statsTotal ?? '--'}</Typography>
        </Paper>
        <Paper sx={{ px: 3, py: 2, minWidth: 180, backgroundColor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.16 : 0.08) }}>
          <Typography variant="body2" color="text.secondary">
            {t('dashboard.hotelAdmin.activities.stats.sensitiveToday', 'Sensitive Actions Today')}
          </Typography>
          <Typography variant="h5" fontWeight={700}>{statsSensitive ?? '--'}</Typography>
        </Paper>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <PremiumSelect
          label={t('dashboard.hotelAdmin.activities.filters.action', 'Action')}
          value={actionFilter}
          onChange={(event) => { setActionFilter(event.target.value); setPage(0); }}
          fullWidth={false}
          sx={{ minWidth: 170 }}
        >
          <option value="">{t('dashboard.hotelAdmin.activities.filters.allActions', 'All Actions')}</option>
          {ACTIONS.map((action) => (
            <option key={action} value={action}>{prettyLabel(action)}</option>
          ))}
        </PremiumSelect>
        <PremiumSelect
          label={t('dashboard.hotelAdmin.activities.filters.entityType', 'Entity Type')}
          value={entityTypeFilter}
          onChange={(event) => { setEntityTypeFilter(event.target.value); setPage(0); }}
          fullWidth={false}
          sx={{ minWidth: 180 }}
        >
          <option value="">{t('dashboard.hotelAdmin.activities.filters.allEntityTypes', 'All Entity Types')}</option>
          {ENTITY_TYPES.map((entityType) => (
            <option key={entityType} value={entityType}>{prettyLabel(entityType)}</option>
          ))}
        </PremiumSelect>
        <PremiumTextField
          size="small"
          label={t('dashboard.hotelAdmin.activities.filters.staffEmail', 'Staff Email')}
          placeholder={t('dashboard.hotelAdmin.activities.filters.staffEmailPlaceholder', 'Filter by staff email')}
          value={emailFilter}
          onChange={(event) => { setEmailFilter(event.target.value); setPage(0); }}
          sx={{ minWidth: 220 }}
        />
        <PremiumTextField
          size="small"
          label={t('dashboard.hotelAdmin.activities.filters.fromDate', 'From')}
          type="datetime-local"
          value={fromDate}
          onChange={(event) => { setFromDate(event.target.value); setPage(0); }}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 200 }}
        />
        <PremiumTextField
          size="small"
          label={t('dashboard.hotelAdmin.activities.filters.toDate', 'To')}
          type="datetime-local"
          value={toDate}
          onChange={(event) => { setToDate(event.target.value); setPage(0); }}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 200 }}
        />
        <Tooltip title={t('common.refresh', 'Refresh')}>
          <IconButton onClick={() => { loadLogs(); loadStats(); }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        {(actionFilter || entityTypeFilter || emailFilter || fromDate || toDate) && (
          <Button variant="outlined" size="small" onClick={resetFilters}>
            {t('dashboard.hotelAdmin.activities.filters.clear', 'Clear')}
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ py: 2 }}>{error}</Typography>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('dashboard.hotelAdmin.activities.table.timestamp', 'Timestamp')}</TableCell>
                  <TableCell>{t('dashboard.hotelAdmin.activities.table.actor', 'Actor')}</TableCell>
                  <TableCell>{t('dashboard.hotelAdmin.activities.table.role', 'Role')}</TableCell>
                  <TableCell>{t('dashboard.hotelAdmin.activities.table.action', 'Action')}</TableCell>
                  <TableCell>{t('dashboard.hotelAdmin.activities.table.entityType', 'Entity Type')}</TableCell>
                  <TableCell>{t('dashboard.hotelAdmin.activities.table.reason', 'Reason')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Box sx={{ py: 5 }}>
                        <HistoryIcon color="disabled" sx={{ fontSize: 36, mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {t('dashboard.hotelAdmin.activities.empty', 'No hotel activities matched the current filters.')}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>{formatDateTimeForDisplay(log.timestamp)}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{log.userName || t('dashboard.hotelAdmin.activities.systemActor', 'System')}</Typography>
                        {log.userEmail && <Typography variant="caption" color="text.secondary">{log.userEmail}</Typography>}
                      </Box>
                    </TableCell>
                    <TableCell>{log.userRole || '—'}</TableCell>
                    <TableCell>
                      <Chip size="small" label={prettyLabel(log.action)} color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>{prettyLabel(log.entityType)}</TableCell>
                    <TableCell>{log.reason || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalElements}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 20, 50]}
          />
        </>
      )}
    </Box>
  );
};

export default HotelActivityTab;