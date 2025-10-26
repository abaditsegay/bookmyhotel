import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { shopApiService } from '../../services/shopApi';
import { formatCurrencyWithDecimals } from '../../utils/currencyUtils';
import { ShopDashboardStats } from '../../types/shop';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import OrderCreation from './OrderCreation';
import LowStockProducts from './LowStockProducts';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`shop-tabpanel-${index}`}
      aria-labelledby={`shop-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ShopDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentTab, setCurrentTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const tabMap = { 'new-order': 0, 'products': 1, 'low-stock': 2, 'orders': 3 };
      return tabMap[tabParam as keyof typeof tabMap] ?? 0;
    }
    return 0;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<ShopDashboardStats | null>(null);

  // Get hotel ID from authenticated user
  const hotelId = user?.hotelId ? parseInt(user.hotelId) : null;

  const loadDashboardData = useCallback(async () => {
    if (!hotelId) {
      console.error('Cannot load dashboard data: No hotel ID available');
      return;
    }

    // Ensure we have authentication before making API calls
    if (!token) {
      console.warn('Cannot load dashboard data: No authentication token available');
      setError('Authentication required. Please ensure you are logged in.');
      return;
    }

    try {
      setLoading(true);
      
      // Configure shop API service with authentication
      console.info('Configuring shop API service with authentication...');
      shopApiService.setToken(token);
      console.info('Shop API service configured with token');

      if (user?.tenantId) {
        shopApiService.setTenantId(user.tenantId);
        console.info(`Shop API service configured with tenant ID: ${user.tenantId}`);
      } else {
        console.warn('No tenant ID available for shop API');
      }

      console.info(`Loading dashboard stats for hotel ${hotelId}...`);
      const stats = await shopApiService.getDashboardStats(hotelId);
      console.info('Dashboard stats loaded successfully:', stats);

      // Additional validation of stats
      const hasValidStats = stats && (
        stats.totalProducts > 0 || 
        stats.totalOrders > 0 || 
        stats.totalRevenue > 0
      );
      
      console.info('Stats validation:', {
        hasStats: !!stats,
        hasValidStats,
        statsKeys: stats ? Object.keys(stats) : [],
        sampleValues: stats ? {
          totalProducts: stats.totalProducts,
          totalOrders: stats.totalOrders,
          totalRevenue: stats.totalRevenue
        } : null
      });

      setDashboardStats(stats);
      setError(null);
    } catch (err) {
      console.error('Dashboard data loading error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [hotelId, token, user?.tenantId]);

  useEffect(() => {
    if (hotelId) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [hotelId, loadDashboardData]);

  // Early return if no hotel ID is available (after all hooks)
  if (!hotelId) {
    return (
      <Box p={2}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Unable to determine hotel ID for the current user. Please ensure you are logged in as a hotel staff member.
        </Alert>
        <Alert severity="info" sx={{ mb: 2 }}>
          Current user: {user?.email} | Hotel ID: {user?.hotelId || 'Not assigned'}
        </Alert>
      </Box>
    );
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    // Update URL parameter to remember the tab
    const tabNames = ['new-order', 'products', 'low-stock', 'orders'];
    setSearchParams({ tab: tabNames[newValue] });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={loadDashboardData} size="small" sx={{ ml: 2 }}>
          {t('common.refresh')}
        </Button>
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Quick Stats Cards */}
      {dashboardStats && (
        <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ py: 1, px: 1.5 }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="caption" sx={{ fontSize: '0.7rem' }}>
                    {t('shop.dashboard.stats.totalProducts')}
                  </Typography>
                  <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                    {dashboardStats.totalProducts}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {dashboardStats.activeProducts} {t('shop.dashboard.stats.activeProducts').toLowerCase()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ py: 1, px: 1.5 }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="caption" sx={{ fontSize: '0.7rem' }}>
                    {t('shop.orders.status.pending')} {t('shop.dashboard.tabs.orders')}
                  </Typography>
                  <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                    {dashboardStats.pendingOrders}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    of {dashboardStats.totalOrders} {t('shop.dashboard.stats.totalOrders').toLowerCase()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ py: 1, px: 1.5 }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="caption" sx={{ fontSize: '0.7rem' }}>
                    {t('shop.dashboard.stats.revenue')}
                  </Typography>
                  <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                    ${dashboardStats.totalRevenue.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {formatCurrencyWithDecimals(dashboardStats.totalRevenue || 0)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ py: 1, px: 1.5 }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="caption" sx={{ fontSize: '0.7rem' }}>
                    Low Stock Products
                  </Typography>
                  <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                    {dashboardStats.lowStockProducts}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {dashboardStats.outOfStockProducts} out of stock
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={t('shop.dashboard.tabs.newOrder')} />
          <Tab label={t('shop.dashboard.tabs.products')} />
          <Tab label={t('shop.dashboard.tabs.lowStock')} />
          <Tab label={t('shop.dashboard.tabs.orders')} />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={currentTab} index={0}>
        <OrderCreation onOrderComplete={loadDashboardData} />
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <ProductManagement />
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        <LowStockProducts />
      </TabPanel>

      <TabPanel value={currentTab} index={3}>
        <OrderManagement />
      </TabPanel>
    </Box>
  );
};

export default ShopDashboard;
