import React, { useState, useEffect } from 'react';
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
import { shopApiService } from '../../services/shopApi';
import { ShopDashboardStats } from '../../types/shop';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import OrderCreation from './OrderCreation';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentTab, setCurrentTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const tabMap = { 'new-order': 0, 'products': 1, 'orders': 2 };
      return tabMap[tabParam as keyof typeof tabMap] ?? 0;
    }
    return 0;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<ShopDashboardStats | null>(null);

  // Get hotel ID from context or props (you might need to adjust this based on your auth context)
  const hotelId = 1; // This should come from your auth context

  useEffect(() => {
    loadDashboardData();
  }, [hotelId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const stats = await shopApiService.getDashboardStats(hotelId);

      setDashboardStats(stats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    // Update URL parameter to remember the tab
    const tabNames = ['new-order', 'products', 'orders'];
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
                    ${dashboardStats.todayRevenue.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    ETB {(dashboardStats.todayRevenue * 55).toFixed(0)}
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
                    {t('shop.products.status.outOfStock')} {t('shop.dashboard.tabs.products')}
                  </Typography>
                  <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                    {dashboardStats.lowStockProducts}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    Need restocking
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
          <Tab label={t('shop.dashboard.tabs.orders')} />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={currentTab} index={0}>
        <OrderCreation />
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <ProductManagement />
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        <OrderManagement />
      </TabPanel>
    </Box>
  );
};

export default ShopDashboard;
