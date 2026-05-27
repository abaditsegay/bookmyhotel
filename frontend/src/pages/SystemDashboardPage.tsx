import React, { useState, useEffect } from 'react';
import PremiumTextField from '../components/common/PremiumTextField';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  Container,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Dashboard,
  Hotel,
  People,
  TrendingUp,
  ExpandMore as ExpandMoreIcon,
  Settings,
  Refresh,
  BarChart as BarChartIcon,
  Description as ApiIcon,
  Search as SearchIcon,
  ContentCopy,
  OpenInNew,
  Link as LinkIcon,
  History,
} from '@mui/icons-material';
import { MetricCard, BarChart, DonutChart } from '../components/common/DataVisualization';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BookIcon from '@mui/icons-material/Book';
import { useThemeColors } from '../theme/useThemeColors';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TokenManager from '../utils/tokenManager';
import { 
  getAllEndpoints
} from '../data/apiDocumentation';
import AuditLogTab from './admin/AuditLogTab';
import TabPanel from '../components/common/TabPanel';
import { getReadableAccentTextColor, getSectionTint } from '../theme/surfaces';
import { composeSx, infoPanelSx, surfaceCardSx } from '../theme/sxHelpers';
import { adminApiService, HotelStatistics, SystemAnalyticsOverview, TenantStatistics, UserStatistics } from '../services/adminApi';

/**
 * Dashboard page for system-wide users (ADMIN and CUSTOMER roles)
 * Shows different content based on user role
 */
export const SystemDashboardPage: React.FC = () => {
  const { COLORS } = useThemeColors();
  const theme = useTheme();
  const readableAccentColor = getReadableAccentTextColor(theme);
  const { t } = useTranslation();
  const allCategoryValue = '__ALL__';
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [apiSearchQuery, setApiSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(allCategoryValue);
  const [onboardingUrlCopied, setOnboardingUrlCopied] = useState(false);

  // Get all API endpoints from our organized documentation
  const allEndpoints = getAllEndpoints();

  // Get unique categories for the dropdown
  const categories = [
    { value: allCategoryValue, label: t('dashboard.system.apiDocs.allCategories') },
    ...Array.from(new Set(allEndpoints.map(endpoint => endpoint.category))).sort().map((category) => ({
      value: category,
      label: category,
    })),
  ];


  const [stats, setStats] = useState<{
    hotelStats: HotelStatistics | null;
    userStats: UserStatistics | null;
    tenantStats: TenantStatistics | null;
    systemAnalytics: SystemAnalyticsOverview | null;
    loading: boolean;
  }>({
    hotelStats: null,
    userStats: null,
    tenantStats: null,
    systemAnalytics: null,
    loading: true,
  });

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = TokenManager.getToken();
        adminApiService.setToken(token);

        const [hotelStats, userStats, tenantStats, systemAnalytics] = await Promise.all([
          adminApiService.getHotelStatistics(),
          adminApiService.getUserStatistics(),
          adminApiService.getTenantStatistics(),
          adminApiService.getSystemAnalyticsOverview(),
        ]);

        setStats({
          hotelStats,
          userStats,
          tenantStats,
          systemAnalytics,
          loading: false,
        });
      } catch (error) {
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    if (user && !user.tenantId) {
      fetchStats();
    }
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle refresh without full page reload to preserve language selection
  const handleRefresh = () => {
    setStats(prev => ({ ...prev, loading: true }));

    const fetchStats = async () => {
      try {
        const token = TokenManager.getToken();
        adminApiService.setToken(token);

        const [hotelStats, userStats, tenantStats, systemAnalytics] = await Promise.all([
          adminApiService.getHotelStatistics(),
          adminApiService.getUserStatistics(),
          adminApiService.getTenantStatistics(),
          adminApiService.getSystemAnalyticsOverview(),
        ]);

        setStats({
          hotelStats,
          userStats,
          tenantStats,
          systemAnalytics,
          loading: false,
        });
      } catch (error) {
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    if (user && !user.tenantId) {
      fetchStats();
    }
  };

  if (!user || user.tenantId) {
    // Redirect non-system users
    navigate('/dashboard');
    return null;
  }

  const isSystemAdmin = user.roles.includes('SUPER_ADMIN') || user.roles.includes('ADMIN') || user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
  const isSystemCustomer = user.roles.includes('CUSTOMER');
  const totalHotels = stats.hotelStats?.totalHotels ?? 0;
  const totalUsers = stats.userStats?.total ?? stats.tenantStats?.totalUsers ?? 0;
  const activeTenants = stats.tenantStats?.activeTenants ?? 0;
  const totalBookings = stats.systemAnalytics?.totalBookings ?? 0;
  const activeBookings = stats.systemAnalytics?.activeBookings ?? 0;
  const completedPayments = stats.systemAnalytics?.completedPayments ?? 0;
  const currentMonthBookings = stats.systemAnalytics?.currentMonthBookings ?? 0;
  const currentMonthRevenue = stats.systemAnalytics?.currentMonthRevenue ?? 0;
  const currentYearRevenue = stats.systemAnalytics?.currentYearRevenue ?? 0;

  const revenueTrendData = stats.systemAnalytics?.monthlyTrends.map((trend) => ({
    label: trend.label,
    value: trend.revenue,
    color: COLORS.PRIMARY,
  })) ?? [];

  const bookingTrendData = stats.systemAnalytics?.monthlyTrends.map((trend) => ({
    label: trend.label,
    value: trend.bookings,
    color: COLORS.INFO,
  })) ?? [];

  const bookingStatusPalette: Record<string, string> = {
    BOOKED: COLORS.PRIMARY,
    CHECKED_IN: COLORS.SUCCESS,
    CHECKED_OUT: COLORS.INFO,
    CANCELLED: COLORS.ERROR,
    PENDING: COLORS.WARNING,
    NO_SHOW: COLORS.ERROR,
  };

  const reservationStatusData = Object.entries(stats.systemAnalytics?.reservationStatusBreakdown ?? {})
    .map(([label, value]) => ({
      label: label.replace(/_/g, ' '),
      value,
      color: bookingStatusPalette[label] ?? readableAccentColor,
    }))
    .filter((item) => item.value > 0);

  const paymentStatusPalette: Record<string, string> = {
    COMPLETED: COLORS.SUCCESS,
    PENDING: COLORS.WARNING,
    PROCESSING: COLORS.INFO,
    FAILED: COLORS.ERROR,
    CANCELLED: COLORS.ERROR,
    REFUNDED: COLORS.SECONDARY,
    REFUND_PENDING: COLORS.WARNING,
    PARTIALLY_REFUNDED: COLORS.INFO,
    FORFEITED: readableAccentColor,
  };

  const paymentStatusData = Object.entries(stats.systemAnalytics?.paymentStatusBreakdown ?? {})
    .map(([label, value]) => ({
      label: label.replace(/_/g, ' '),
      value,
      color: paymentStatusPalette[label] ?? readableAccentColor,
    }))
    .filter((item) => item.value > 0);

  // If statistics are still loading, show loading indicator
  if (stats.loading) {
    return (
      <Box sx={{ width: '100%', p: 3, mt: 4, mb: 4 }}>
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="400px"
          flexDirection="column"
          gap={2}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            {t('dashboard.system.loadingStats')}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Container maxWidth={false} sx={{ width: '100%', p: 3 }} data-testid="system-dashboard">
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {isSystemAdmin ? t('dashboard.system.title') : t('dashboard.customer.title')}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          data-testid="refresh-dashboard"
          disabled={stats.loading}
        >
          {t('common.refresh')}
        </Button>
      </Box>

      {/* Navigation Tabs */}
      <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
            }
          }}
        >
          <Tab 
            icon={<Dashboard />} 
            label={t('dashboard.system.overview')} 
            iconPosition="start"
            sx={{ gap: 1 }}
          />
          {isSystemAdmin && (
            <Tab 
              icon={<BarChartIcon />} 
              label={t('dashboard.system.analytics')} 
              iconPosition="start"
              sx={{ gap: 1 }}
            />
          )}
          {isSystemAdmin && (
            <Tab 
              icon={<ApiIcon />} 
              label={t('dashboard.system.apiDocs.tabLabel')} 
              iconPosition="start"
              sx={{ gap: 1 }}
            />
          )}
          {isSystemAdmin && (
            <Tab 
              icon={<History />} 
              label={t('dashboard.system.auditLogTab')} 
              iconPosition="start"
              sx={{ gap: 1 }}
            />
          )}
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0} idPrefix="system-dashboard" contentSx={{ py: 3 }}>
        {/* Overview Tab - Original Dashboard Content */}

        {/* Business Onboarding URL — share with businesses to submit hotel registration */}
        <Paper
          elevation={0}
          sx={composeSx(infoPanelSx, {
            p: 3,
            mb: 4,
          })}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LinkIcon sx={{ mr: 1, color: readableAccentColor }} />
            <Typography variant="h6" fontWeight="bold" sx={{ color: readableAccentColor }}>
              {t('dashboard.system.businessOnboarding.title')}
            </Typography>
            <Chip
              label={t('dashboard.system.businessOnboarding.shareChip')}
              size="small"
              sx={{ ml: 1.5, bgcolor: COLORS.PRIMARY, color: '#fff', fontSize: '0.7rem' }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('dashboard.system.businessOnboarding.description')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Box
              component="input"
              readOnly
              value={`${window.location.origin}/business-onboarding`}
              sx={{
                flex: 1,
                p: '10px 14px',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'background.paper',
                color: 'text.primary',
                outline: 'none',
                cursor: 'text',
              }}
            />
            <Tooltip title={onboardingUrlCopied ? t('dashboard.system.businessOnboarding.copied') : t('dashboard.system.businessOnboarding.copyUrl')}>
              <IconButton
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/business-onboarding`);
                  setOnboardingUrlCopied(true);
                  setTimeout(() => setOnboardingUrlCopied(false), 2500);
                }}
                color={onboardingUrlCopied ? 'success' : undefined}
                sx={{ flexShrink: 0, color: onboardingUrlCopied ? undefined : readableAccentColor }}
              >
                <ContentCopy />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('dashboard.system.businessOnboarding.openInNewTab')}>
              <IconButton
                onClick={() => window.open(`${window.location.origin}/business-onboarding`, '_blank')}
                sx={{ flexShrink: 0, color: readableAccentColor }}
              >
                <OpenInNew />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>

        {/* Summary Stats */}
        {isSystemAdmin && (
          <Grid container spacing={3} sx={{ mb: 4 }} data-testid="stats-cards">
            <Grid item xs={12} sm={6} md={4}>
              <MetricCard
                title={t('dashboard.system.totalHotels', 'Total Hotels')}
                value={totalHotels}
                icon={<Hotel />}
                color="primary"
                data-testid="total-hotels"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MetricCard
                title={t('dashboard.system.totalUsers', 'Total Users')}
                value={totalUsers}
                icon={<People />}
                color="secondary"
                data-testid="total-users"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MetricCard
                title={t('dashboard.system.activeTenants', 'Active Tenants')}
                value={activeTenants}
                icon={<BookIcon />}
                color="success"
              />
            </Grid>
          </Grid>
        )}

        {/* System Status and Information */}
        <Grid container spacing={3}>
          {isSystemAdmin && (
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={composeSx(surfaceCardSx('default'), { p: 3 })}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUp sx={{ mr: 1 }} />
                  {t('dashboard.system.systemOverview')}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Hotel sx={{ color: readableAccentColor }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t('dashboard.system.hotelApproval')} 
                      secondary={t('dashboard.system.hotelApprovalDesc')}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <People sx={{ color: 'secondary.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t('dashboard.system.userAdministration')} 
                      secondary={t('dashboard.system.userAdministrationDesc')}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <Settings sx={{ color: 'warning.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t('dashboard.system.globalConfiguration')} 
                      secondary={t('dashboard.system.globalConfigurationDesc')}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          )}

          <Grid item xs={12} md={isSystemAdmin ? 6 : 12}>
            <Paper elevation={0} sx={composeSx(surfaceCardSx('default'), { p: 3 })}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Dashboard sx={{ mr: 1 }} />
                {t('dashboard.system.recentActivity')}
              </Typography>
              <List dense data-testid="recent-activities">
                <ListItem>
                  <ListItemText 
                    primary={isSystemAdmin ? t('dashboard.system.systemAdminLogin') : t('dashboard.system.accountLogin')}
                    secondary={t('dashboard.system.accessedAt', { time: new Date().toLocaleString() })}
                  />
                </ListItem>
                <Divider />
                {isSystemAdmin && (
                  <>
                    <ListItem>
                      <ListItemText 
                        primary={t('dashboard.system.hotelRegistrationReview')}
                        secondary={t('dashboard.system.hotelRegistrationReviewDesc')}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText 
                        primary={t('dashboard.system.systemConfiguration')}
                        secondary={t('dashboard.system.systemConfigurationDesc')}
                      />
                    </ListItem>
                  </>
                )}
                {isSystemCustomer && (
                  <>
                    <ListItem>
                      <ListItemText 
                        primary={t('dashboard.system.hotelSearchAvailable')}
                        secondary={t('dashboard.system.hotelSearchAvailableDesc')}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText 
                        primary={t('dashboard.system.bookingManagement')}
                        secondary={t('dashboard.system.bookingManagementDesc')}
                      />
                    </ListItem>
                  </>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Analytics Tab */}
      {isSystemAdmin && (
        <TabPanel value={activeTab} index={1} idPrefix="system-dashboard" contentSx={{ py: 3 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            {t('dashboard.system.analyticsVisualization')}
          </Typography>
          
          {/* Metrics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard
                title={t('dashboard.system.totalBookings')}
                value={totalBookings}
                icon={<BookIcon />}
                color="primary"
                subtitle={t('dashboard.system.totalBookingsSubtitle', { count: currentMonthBookings })}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard
                title={t('dashboard.system.activeBookings')}
                value={activeBookings}
                icon={<Hotel />}
                color="success"
                subtitle={t('dashboard.system.activeBookingsSubtitle')}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard
                title={t('dashboard.system.currentMonthRevenue')}
                value={currentMonthRevenue}
                format="currency"
                icon={<AttachMoneyIcon />}
                color="warning"
                subtitle={t('dashboard.system.currentMonthRevenueSubtitle', { count: completedPayments })}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard
                title={t('dashboard.system.currentYearRevenue')}
                value={currentYearRevenue}
                format="currency"
                icon={<TrendingUp />}
                color="info"
                subtitle={t('dashboard.system.currentYearRevenueSubtitle')}
              />
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
              <Paper elevation={0} sx={composeSx(surfaceCardSx('default'), { p: 3 })}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  {t('dashboard.system.monthlyRevenueChart')}
                </Typography>
                <BarChart
                  data={revenueTrendData}
                  height={350}
                  animated
                />
              </Paper>
            </Grid>
            
            <Grid item xs={12} lg={6}>
              <Paper elevation={0} sx={composeSx(surfaceCardSx('default'), { p: 3 })}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  {t('dashboard.system.monthlyBookingVolumeChart')}
                </Typography>
                <BarChart
                  data={bookingTrendData}
                  height={350}
                  animated
                />
              </Paper>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Paper elevation={0} sx={composeSx(surfaceCardSx('default'), { p: 3, height: '100%' })}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  {t('dashboard.system.bookingStatusChart')}
                </Typography>
                <DonutChart
                  data={reservationStatusData}
                  size={220}
                  thickness={40}
                  centerText={String(totalBookings)}
                  centerSubtext={t('dashboard.system.totalBookingsCenterSubtext')}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Paper elevation={0} sx={composeSx(surfaceCardSx('default'), { p: 3, height: '100%' })}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  {t('dashboard.system.paymentStatusChart')}
                </Typography>
                <DonutChart
                  data={paymentStatusData}
                  size={220}
                  thickness={40}
                  centerText={String(completedPayments)}
                  centerSubtext={t('dashboard.system.completedPaymentsCenterSubtext')}
                />
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      )}

      {/* Audit Log Tab */}
      {isSystemAdmin && (
        <TabPanel value={activeTab} index={3} idPrefix="system-dashboard" contentSx={{ py: 3 }}>
          <AuditLogTab />
        </TabPanel>
      )}

      {/* API Documentation Tab */}
      {isSystemAdmin && (
        <TabPanel value={activeTab} index={2} idPrefix="system-dashboard" contentSx={{ py: 3 }}>
          <Grid container spacing={3}>
            {/* API Documentation Card */}
            <Grid item xs={12}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  {/* Search and Filter Controls */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    {/* Search Field */}
                    <PremiumTextField
                      fullWidth
                      placeholder={t('dashboard.system.apiDocs.searchPlaceholder')}
                      value={apiSearchQuery}
                      onChange={(e) => setApiSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        )
                      }}
                    />
                    
                    {/* Category Filter */}
                    <FormControl sx={{ minWidth: 200 }}>
                      <InputLabel>{t('dashboard.system.apiDocs.categoryLabel')}</InputLabel>
                      <Select
                        value={selectedCategory}
                        label={t('dashboard.system.apiDocs.categoryLabel')}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        {categories.map((category) => (
                          <MenuItem key={category.value} value={category.value}>
                            {category.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Endpoint Count */}
                  <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
                    {(() => {
                      const filteredCount = allEndpoints.filter(endpoint => 
                        (apiSearchQuery === '' || 
                        endpoint.path.toLowerCase().includes(apiSearchQuery.toLowerCase()) ||
                        endpoint.description.toLowerCase().includes(apiSearchQuery.toLowerCase()) ||
                        endpoint.method.toLowerCase().includes(apiSearchQuery.toLowerCase())) &&
                        (selectedCategory === allCategoryValue || endpoint.category === selectedCategory)
                      ).length;
                      
                      return t('dashboard.system.apiDocs.showingCount', {
                        filtered: filteredCount,
                        total: allEndpoints.length,
                      });
                    })()}
                  </Typography>

                  <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
                    {allEndpoints
                      .filter(endpoint => 
                        (apiSearchQuery === '' || 
                        endpoint.path.toLowerCase().includes(apiSearchQuery.toLowerCase()) ||
                        endpoint.description.toLowerCase().includes(apiSearchQuery.toLowerCase()) ||
                        endpoint.method.toLowerCase().includes(apiSearchQuery.toLowerCase())) &&
                        (selectedCategory === allCategoryValue || endpoint.category === selectedCategory)
                      )
                      .map((endpoint, index) => (
                        <Accordion key={index} sx={{ mb: 1, '&:before': { display: 'none' } }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                              <Box
                                component="span"
                                sx={{
                                  display: 'inline-block',
                                  minWidth: 60,
                                  textAlign: 'center',
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: 1,
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  color: 'white',
                                  bgcolor: 
                                    endpoint.method === 'GET' ? 'success.main' :
                                    endpoint.method === 'POST' ? 'warning.main' :
                                    endpoint.method === 'PUT' ? 'info.main' :
                                    endpoint.method === 'DELETE' ? 'error.main' : 'grey.500'
                                }}
                              >
                                {endpoint.method}
                              </Box>
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body2" component="code" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                                  {endpoint.path}
                                </Typography>
                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                                  {endpoint.description}
                                </Typography>
                              </Box>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box sx={{ mt: 1 }}>
                              {/* Request Section */}
                              {endpoint.request && (
                                <Box sx={{ mb: 3 }}>
                                  <Typography variant="h6" sx={{ mb: 1, color: readableAccentColor }}>
                                    {t('dashboard.system.apiDocs.requestSection')}
                                  </Typography>
                                  
                                  {endpoint.request.headers && (
                                    <Box sx={{ mb: 2 }}>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{t('dashboard.system.apiDocs.headersLabel')}</Typography>
                                      <Box component="pre" sx={{ 
                                        bgcolor: getSectionTint(theme, 'primary'),
                                        p: 1, 
                                        borderRadius: 1, 
                                        fontSize: '0.875rem',
                                        overflow: 'auto',
                                        fontFamily: 'monospace'
                                      }}>
                                        {JSON.stringify(endpoint.request.headers, null, 2)}
                                      </Box>
                                    </Box>
                                  )}
                                  
                                  {endpoint.request.params && (
                                    <Box sx={{ mb: 2 }}>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{t('dashboard.system.apiDocs.pathParametersLabel')}</Typography>
                                      <Box component="pre" sx={{ 
                                        bgcolor: getSectionTint(theme, 'primary'),
                                        p: 1, 
                                        borderRadius: 1, 
                                        fontSize: '0.875rem',
                                        overflow: 'auto',
                                        fontFamily: 'monospace'
                                      }}>
                                        {JSON.stringify(endpoint.request.params, null, 2)}
                                      </Box>
                                    </Box>
                                  )}
                                  
                                  {endpoint.request.query && (
                                    <Box sx={{ mb: 2 }}>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{t('dashboard.system.apiDocs.queryParametersLabel')}</Typography>
                                      <Box component="pre" sx={{ 
                                        bgcolor: getSectionTint(theme, 'primary'),
                                        p: 1, 
                                        borderRadius: 1, 
                                        fontSize: '0.875rem',
                                        overflow: 'auto',
                                        fontFamily: 'monospace'
                                      }}>
                                        {JSON.stringify(endpoint.request.query, null, 2)}
                                      </Box>
                                    </Box>
                                  )}
                                  
                                  {endpoint.request.body && (
                                    <Box sx={{ mb: 2 }}>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{t('dashboard.system.apiDocs.requestBodyLabel')}</Typography>
                                      <Box component="pre" sx={{ 
                                        bgcolor: getSectionTint(theme, 'primary'),
                                        p: 1, 
                                        borderRadius: 1, 
                                        fontSize: '0.875rem',
                                        overflow: 'auto',
                                        fontFamily: 'monospace'
                                      }}>
                                        {JSON.stringify(endpoint.request.body, null, 2)}
                                      </Box>
                                    </Box>
                                  )}
                                </Box>
                              )}

                              {/* Response Section */}
                              {endpoint.response && (
                                <Box>
                                  <Typography variant="h6" sx={{ mb: 1, color: 'success.main' }}>
                                    {t('dashboard.system.apiDocs.responseSection')}
                                  </Typography>
                                  
                                  {endpoint.response.success && (
                                    <Box sx={{ mb: 2 }}>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                        {t('dashboard.system.apiDocs.successResponseLabel')}
                                      </Typography>
                                      <Box component="pre" sx={{ 
                                        bgcolor: 'success.lighter', 
                                        p: 1, 
                                        borderRadius: 1, 
                                        fontSize: '0.875rem',
                                        overflow: 'auto',
                                        fontFamily: 'monospace',
                                        border: '1px solid',
                                        borderColor: 'success.light'
                                      }}>
                                        {JSON.stringify(endpoint.response.success, null, 2)}
                                      </Box>
                                    </Box>
                                  )}
                                  
                                  {endpoint.response.error && (
                                    <Box sx={{ mb: 2 }}>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                                        {t('dashboard.system.apiDocs.errorResponseLabel')}
                                      </Typography>
                                      <Box component="pre" sx={{ 
                                        bgcolor: 'error.lighter', 
                                        p: 1, 
                                        borderRadius: 1, 
                                        fontSize: '0.875rem',
                                        overflow: 'auto',
                                        fontFamily: 'monospace',
                                        border: '1px solid',
                                        borderColor: 'error.light'
                                      }}>
                                        {JSON.stringify(endpoint.response.error, null, 2)}
                                      </Box>
                                    </Box>
                                  )}
                                </Box>
                              )}
                              
                              {!endpoint.request && !endpoint.response && (
                                <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                                  {t('dashboard.system.apiDocs.noExamples')}
                                </Typography>
                              )}
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      )}
    </Container>
  );
};
