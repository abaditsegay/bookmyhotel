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
import { StatCardSkeleton } from '../common/SkeletonLoaders';

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
      // console.error('Cannot load dashboard data: No hotel ID available');
      return;
    }

    // Ensure we have authentication before making API calls
    if (!token) {
      // console.warn('Cannot load dashboard data: No authentication token available');
      setError('Authentication required. Please ensure you are logged in.');
      return;
    }

    try {
      setLoading(true);
      
      // Configure shop API service with authentication
      // console.info('Configuring shop API service with authentication...');
      shopApiService.setToken(token);
      // console.info('Shop API service configured with token');

      if (user?.tenantId) {
        shopApiService.setTenantId(user.tenantId);
        // console.info(`Shop API service configured with tenant ID: ${user.tenantId}`);
      } else {
        // console.warn('No tenant ID available for shop API');
      }

      // console.info(`Loading dashboard stats for hotel ${hotelId}...`);
      const stats = await shopApiService.getDashboardStats(hotelId);
      // console.info('Dashboard stats loaded successfully:', stats);

      // Additional validation of stats
      const hasValidStats = stats && (
        stats.totalProducts > 0 || 
        stats.totalOrders > 0 || 
        stats.totalRevenue > 0
      );
      
      // console.info('Stats validation:', {
      //   hasStats: !!stats,
      //   hasValidStats,
      //   statsKeys: stats ? Object.keys(stats) : [],
      //   sampleValues: stats ? {
      //     totalProducts: stats.totalProducts,
      //     totalOrders: stats.totalOrders,
      //     totalRevenue: stats.totalRevenue
      //   } : null
      // });

      setDashboardStats(stats);
      setError(null);
    } catch (err) {
      // console.error('Dashboard data loading error:', err);
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
      {loading ? (
        <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StatCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : dashboardStats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{
                background: 'linear-gradient(135deg, rgba(26, 54, 93, 0.05) 0%, rgba(232, 184, 109, 0.05) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(26, 54, 93, 0.1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(26, 54, 93, 0.15)'
                }
              }}
            >
              <CardContent sx={{ py: 2, px: 2.5 }}>
                <Box>
                  <Typography 
                    color="textSecondary" 
                    gutterBottom 
                    variant="caption" 
                    sx={{ 
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#1a365d'
                    }}
                  >
                    {t('shop.dashboard.stats.totalProducts')}
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      lineHeight: 1.2,
                      fontWeight: 700,
                      color: '#1a365d',
                      mb: 0.5
                    }}
                  >
                    {dashboardStats.totalProducts}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: '0.75rem',
                      color: '#E8B86D',
                      fontWeight: 600
                    }}
                  >
                    {dashboardStats.activeProducts} {t('shop.dashboard.stats.activeProducts').toLowerCase()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(26, 54, 93, 0.05) 0%, rgba(232, 184, 109, 0.05) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(26, 54, 93, 0.1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(26, 54, 93, 0.15)'
                }
              }}
            >
              <CardContent sx={{ py: 2, px: 2.5 }}>
                <Box>
                  <Typography 
                    color="textSecondary" 
                    gutterBottom 
                    variant="caption" 
                    sx={{ 
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#1a365d'
                    }}
                  >
                    {t('shop.orders.status.pending')} {t('shop.dashboard.tabs.orders')}
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      lineHeight: 1.2,
                      fontWeight: 700,
                      color: '#1a365d',
                      mb: 0.5
                    }}
                  >
                    {dashboardStats.pendingOrders}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: '0.75rem',
                      color: '#E8B86D',
                      fontWeight: 600
                    }}
                  >
                    of {dashboardStats.totalOrders} {t('shop.dashboard.stats.totalOrders').toLowerCase()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(232, 184, 109, 0.1) 0%, rgba(26, 54, 93, 0.05) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(232, 184, 109, 0.2)',
                boxShadow: '0 4px 12px rgba(232, 184, 109, 0.15)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(232, 184, 109, 0.25)'
                }
              }}
            >
              <CardContent sx={{ py: 2, px: 2.5 }}>
                <Box>
                  <Typography 
                    color="textSecondary" 
                    gutterBottom 
                    variant="caption" 
                    sx={{ 
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#1a365d'
                    }}
                  >
                    {t('shop.dashboard.stats.revenue')}
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      lineHeight: 1.2,
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #E8B86D 0%, #D4A05D 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 0.5
                    }}
                  >
                    ${dashboardStats.totalRevenue.toFixed(2)}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: '0.75rem',
                      color: '#1a365d',
                      fontWeight: 600
                    }}
                  >
                    {formatCurrencyWithDecimals(dashboardStats.totalRevenue || 0)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(26, 54, 93, 0.05) 0%, rgba(232, 184, 109, 0.05) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(26, 54, 93, 0.1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(26, 54, 93, 0.15)'
                }
              }}
            >
              <CardContent sx={{ py: 2, px: 2.5 }}>
                <Box>
                  <Typography 
                    color="textSecondary" 
                    gutterBottom 
                    variant="caption" 
                    sx={{ 
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#1a365d'
                    }}
                  >
                    Low Stock Products
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      lineHeight: 1.2,
                      fontWeight: 700,
                      color: '#ff9800',
                      mb: 0.5
                    }}
                  >
                    {dashboardStats.lowStockProducts}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: '0.75rem',
                      color: '#d32f2f',
                      fontWeight: 600
                    }}
                  >
                    {dashboardStats.outOfStockProducts} out of stock
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Navigation Tabs with premium styling */}
      <Paper sx={{ 
        mb: 3,
        background: 'linear-gradient(135deg, rgba(26, 54, 93, 0.02) 0%, rgba(232, 184, 109, 0.03) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(26, 54, 93, 0.1)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: '0.95rem',
              textTransform: 'none',
              color: '#64748b',
              minHeight: 56,
              transition: 'all 0.3s ease',
              '&:hover': {
                color: '#1a365d',
                background: 'rgba(26, 54, 93, 0.04)'
              },
              '&.Mui-selected': {
                color: '#1a365d',
                fontWeight: 700
              }
            },
            '& .MuiTabs-indicator': {
              height: 3,
              background: 'linear-gradient(90deg, #E8B86D 0%, #D4A05D 100%)',
              borderRadius: '3px 3px 0 0',
              boxShadow: '0 -2px 8px rgba(232, 184, 109, 0.3)'
            }
          }}
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
