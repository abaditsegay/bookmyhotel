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
  Chip,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { shopApiService } from '../../services/shopApi';
import { ShopDashboardStats, ProductStock } from '../../types/shop';

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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentTab, setCurrentTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const tabMap = { 'overview': 0, 'products': 1, 'orders': 2, 'room-charges': 3 };
      return tabMap[tabParam as keyof typeof tabMap] ?? 0;
    }
    return 0;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<ShopDashboardStats | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<ProductStock[]>([]);

  // Get hotel ID from context or props (you might need to adjust this based on your auth context)
  const hotelId = 1; // This should come from your auth context

  useEffect(() => {
    loadDashboardData();
  }, [hotelId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [stats, stockResponse] = await Promise.all([
        shopApiService.getDashboardStats(hotelId),
        shopApiService.getProductStock(hotelId)
      ]);

      setDashboardStats(stats);
      setLowStockProducts(stockResponse.content.filter(item => item.isLowStock));
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
    const tabNames = ['overview', 'products', 'orders', 'room-charges'];
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
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Hotel Shop Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/shop/new-order')}
        >
          New Order
        </Button>
      </Box>

      {/* Quick Stats Cards */}
      {dashboardStats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Products
                  </Typography>
                  <Typography variant="h4">
                    {dashboardStats.totalProducts}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dashboardStats.activeProducts} active
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Pending Orders
                  </Typography>
                  <Typography variant="h4">
                    {dashboardStats.pendingOrders}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    of {dashboardStats.totalOrders} total
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Today's Revenue
                  </Typography>
                  <Typography variant="h4">
                    ${dashboardStats.todayRevenue.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ETB {(dashboardStats.todayRevenue * 55).toFixed(0)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Low Stock Items
                  </Typography>
                  <Typography variant="h4">
                    {dashboardStats.lowStockProducts}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
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
          <Tab label="Overview" />
          <Tab label="Products" />
          <Tab label="Orders" />
          <Tab label="Room Charges" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={currentTab} index={0}>
        <Grid container spacing={3}>
          {/* Top Selling Products */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Selling Products
                </Typography>
                {dashboardStats?.topSellingProducts.length === 0 ? (
                  <Typography color="text.secondary">No sales data yet</Typography>
                ) : (
                  <List dense>
                    {dashboardStats?.topSellingProducts.map((item, index) => (
                      <React.Fragment key={item.product.id}>
                        <ListItem>
                          <ListItemText
                            primary={item.product.name}
                            secondary={
                              <Box>
                                <Typography variant="body2" component="span">
                                  Sold: {item.quantitySold} units
                                </Typography>
                                <br />
                                <Typography variant="body2" component="span" color="success.main">
                                  Revenue: ETB {(item.revenue * 55).toFixed(0)}
                                </Typography>
                              </Box>
                            }
                          />
                          <Chip
                            label={`#${index + 1}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </ListItem>
                        {index < (dashboardStats?.topSellingProducts.length || 0) - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Low Stock Alert */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Low Stock Alert
                </Typography>
                {lowStockProducts.length === 0 ? (
                  <Alert severity="success">All products are well stocked!</Alert>
                ) : (
                  <List dense>
                    {lowStockProducts.map((item, index) => (
                      <React.Fragment key={item.productId}>
                        <ListItem>
                          <ListItemText
                            primary={item.productName}
                            secondary={
                              <Box>
                                <Typography variant="body2" component="span">
                                  Current: {item.currentStock} units
                                </Typography>
                                <br />
                                <Typography variant="body2" component="span" color="error">
                                  Minimum: {item.minimumLevel} units
                                </Typography>
                              </Box>
                            }
                          />
                          <Chip
                            label="LOW"
                            size="small"
                            color="error"
                            variant="filled"
                          />
                        </ListItem>
                        {index < lowStockProducts.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
                {lowStockProducts.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={() => navigate('/shop/products?filter=low-stock')}
                    >
                      Manage Stock
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Product Management</Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/shop/products')}
          >
            Manage Products
          </Button>
        </Box>
        {/* Product management content will be loaded here */}
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Order Management</Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/shop/orders')}
          >
            View All Orders
          </Button>
        </Box>
        {/* Order management content will be loaded here */}
      </TabPanel>

      <TabPanel value={currentTab} index={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Room Charges</Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/shop/room-charges')}
          >
            View All Charges
          </Button>
        </Box>
        {/* Room charges content will be loaded here */}
      </TabPanel>
    </Box>
  );
};

export default ShopDashboard;
