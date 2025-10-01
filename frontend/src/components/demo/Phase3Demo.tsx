import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Alert,
  Tab,
  Tabs,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import TableViewIcon from '@mui/icons-material/TableView';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import BookIcon from '@mui/icons-material/Book';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import AdvancedSearch, { SearchFilter } from '../common/AdvancedSearch';
import AdvancedTable, { TableColumn, TableAction } from '../common/AdvancedTable';
import { MetricCard, BarChart, DonutChart, ProgressChart } from '../common/DataVisualization';
import { designSystem } from '../../theme/designSystem';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`phase3-tabpanel-${index}`}
      aria-labelledby={`phase3-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Sample data for demonstrations
const sampleBookings = [
  {
    id: 1,
    guestName: 'John Smith',
    hotelName: 'Grand Plaza Hotel',
    roomType: 'Deluxe Suite',
    checkIn: '2024-01-15',
    checkOut: '2024-01-18',
    status: 'Confirmed',
    amount: 450.00,
  },
  {
    id: 2,
    guestName: 'Sarah Johnson',
    hotelName: 'Ocean View Resort',
    roomType: 'Standard Room',
    checkIn: '2024-01-20',
    checkOut: '2024-01-22',
    status: 'Pending',
    amount: 320.00,
  },
  {
    id: 3,
    guestName: 'Michael Brown',
    hotelName: 'City Center Inn',
    roomType: 'Executive Room',
    checkIn: '2024-01-25',
    checkOut: '2024-01-27',
    status: 'Cancelled',
    amount: 280.00,
  },
  {
    id: 4,
    guestName: 'Emily Davis',
    hotelName: 'Mountain Lodge',
    roomType: 'Family Suite',
    checkIn: '2024-02-01',
    checkOut: '2024-02-04',
    status: 'Confirmed',
    amount: 600.00,
  },
  {
    id: 5,
    guestName: 'David Wilson',
    hotelName: 'Business Hotel',
    roomType: 'Standard Room',
    checkIn: '2024-02-10',
    checkOut: '2024-02-12',
    status: 'Confirmed',
    amount: 380.00,
  },
];

const bookingColumns: TableColumn[] = [
  { id: 'guestName', label: 'Guest Name', sortable: true },
  { id: 'hotelName', label: 'Hotel', sortable: true },
  { id: 'roomType', label: 'Room Type', sortable: true },
  { id: 'checkIn', label: 'Check In', sortable: true },
  { id: 'checkOut', label: 'Check Out', sortable: true },
  { id: 'status', label: 'Status', sortable: true },
  { id: 'amount', label: 'Amount', sortable: true, format: (value: any) => `$${value.toFixed(2)}` },
];

const revenueData = [
  { label: 'Jan', value: 12500 },
  { label: 'Feb', value: 15800 },
  { label: 'Mar', value: 18200 },
  { label: 'Apr', value: 16900 },
  { label: 'May', value: 21300 },
  { label: 'Jun', value: 24700 },
];

const bookingStatusData = [
  { label: 'Confirmed', value: 65, color: '#4caf50' },
  { label: 'Pending', value: 20, color: '#ff9800' },
  { label: 'Cancelled', value: 15, color: '#f44336' },
];

const hotelOccupancyData = [
  { label: 'Grand Plaza', value: 85 },
  { label: 'Ocean View', value: 92 },
  { label: 'City Center', value: 78 },
  { label: 'Mountain Lodge', value: 88 },
];

export const Phase3Demo: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSearch = (query: string, filters: SearchFilter[]) => {
    console.log('Search:', query, filters);
    // Simulate search results
    const filteredBookings = sampleBookings.filter(booking =>
      booking.guestName.toLowerCase().includes(query.toLowerCase()) ||
      booking.hotelName.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filteredBookings);
  };

  const handleRowAction = (action: string, rowId: number) => {
    console.log(`Action ${action} on row ${rowId}`);
    // Handle actions like edit, delete, view details
  };

  const searchFilters: SearchFilter[] = [
    { 
      id: 'status', 
      label: 'Status', 
      value: 'All',
      type: 'select',
      options: [
        { label: 'All', value: 'All' },
        { label: 'Confirmed', value: 'Confirmed' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Cancelled', value: 'Cancelled' }
      ]
    },
    { 
      id: 'hotel', 
      label: 'Hotel', 
      value: 'All',
      type: 'select',
      options: [
        { label: 'All', value: 'All' },
        { label: 'Grand Plaza Hotel', value: 'Grand Plaza Hotel' },
        { label: 'Ocean View Resort', value: 'Ocean View Resort' },
        { label: 'City Center Inn', value: 'City Center Inn' }
      ]
    },
    { 
      id: 'dateRange', 
      label: 'Date Range', 
      value: '',
      type: 'date'
    },
  ];

  const searchSuggestions = [
    'John Smith',
    'Grand Plaza Hotel',
    'Ocean View Resort',
    'Deluxe Suite',
    'Standard Room',
    'Confirmed bookings',
    'Pending bookings',
  ];

  const tableActions: TableAction[] = [
    { id: 'view', label: 'View Details', onClick: (row) => handleRowAction('view', row.id) },
    { id: 'edit', label: 'Edit Booking', onClick: (row) => handleRowAction('edit', row.id) },
    { id: 'cancel', label: 'Cancel Booking', onClick: (row) => handleRowAction('cancel', row.id) },
    { id: 'confirm', label: 'Send Confirmation', onClick: (row) => handleRowAction('confirm', row.id) },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 'bold',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          Phase 3: Advanced Features & Data Visualization
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Sophisticated search, data tables, and analytics visualization components
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Phase 3 Features:</strong> Advanced search with filtering and suggestions, 
          feature-rich data tables with sorting and actions, comprehensive data visualization 
          with charts and metrics for business intelligence.
        </Alert>
      </Box>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3, borderRadius: designSystem.borderRadius.lg }}>
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
            icon={<SearchIcon />} 
            label="Advanced Search" 
            iconPosition="start"
            sx={{ gap: 1 }}
          />
          <Tab 
            icon={<TableViewIcon />} 
            label="Data Tables" 
            iconPosition="start"
            sx={{ gap: 1 }}
          />
          <Tab 
            icon={<BarChartIcon />} 
            label="Data Visualization" 
            iconPosition="start"
            sx={{ gap: 1 }}
          />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          Advanced Search Component
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, borderRadius: designSystem.borderRadius.lg }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Booking Search
              </Typography>
              <AdvancedSearch
                placeholder="Search bookings by guest name, hotel, or room type..."
                filters={searchFilters}
                suggestions={searchSuggestions}
                onSearch={handleSearch}
                debounceMs={300}
              />
              
              {searchResults.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Search Results ({searchResults.length} found)
                  </Typography>
                  <Grid container spacing={2}>
                    {searchResults.map((booking) => (
                      <Grid item xs={12} md={6} key={booking.id}>
                        <Paper 
                          sx={{ 
                            p: 2, 
                            borderRadius: designSystem.borderRadius.md,
                            border: `1px solid ${theme.palette.divider}`,
                            '&:hover': {
                              boxShadow: designSystem.shadows.md,
                              borderColor: theme.palette.primary.main,
                            }
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {booking.guestName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {booking.hotelName} - {booking.roomType}
                          </Typography>
                          <Typography variant="body2">
                            {booking.checkIn} to {booking.checkOut}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                px: 1, 
                                py: 0.5, 
                                borderRadius: 1,
                                backgroundColor: booking.status === 'Confirmed' ? 'success.main' : 
                                                booking.status === 'Pending' ? 'warning.main' : 'error.main',
                                color: 'white',
                                fontWeight: 'bold',
                              }}
                            >
                              {booking.status}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              ${booking.amount}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, borderRadius: designSystem.borderRadius.lg, height: 'fit-content' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Search Features
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    🔍 Real-time Search
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Debounced search with instant results
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    🏷️ Smart Filtering
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Multiple filter types with dynamic options
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    💡 Auto-suggestions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Contextual suggestions based on data
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    🎯 Advanced Matching
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fuzzy search and partial matching
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          Advanced Data Table
        </Typography>
        
        <Paper sx={{ borderRadius: designSystem.borderRadius.lg, overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Booking Management
            </Typography>
          </Box>
          <AdvancedTable
            data={sampleBookings}
            columns={bookingColumns}
            selectable
            expandable
            actions={tableActions}
            onSelectionChange={(selectedIds) => setSelectedRows(selectedIds.map(id => parseInt(id)))}
            rowsPerPageOptions={[5, 10, 25]}
            defaultRowsPerPage={5}
            renderExpandedRow={(row: any) => (
              <Box sx={{ p: 2, backgroundColor: theme.palette.grey[50] }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Booking Details
                    </Typography>
                    <Typography variant="body2">
                      <strong>Booking ID:</strong> #{row.id}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Guest:</strong> {row.guestName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Contact:</strong> guest{row.id}@example.com
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Additional Information
                    </Typography>
                    <Typography variant="body2">
                      <strong>Guests:</strong> 2 Adults, 1 Child
                    </Typography>
                    <Typography variant="body2">
                      <strong>Special Requests:</strong> Late check-in
                    </Typography>
                    <Typography variant="body2">
                      <strong>Payment Method:</strong> Credit Card
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          />
        </Paper>

        <Box sx={{ mt: 3 }}>
          <Alert severity="success">
            <strong>Selected Rows:</strong> {selectedRows.length > 0 ? selectedRows.join(', ') : 'None'}
          </Alert>
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          Data Visualization & Analytics
        </Typography>
        
        {/* Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <MetricCard
              title="Total Bookings"
              value={1247}
              trend="up"
              trendValue={12}
              icon={<BookIcon />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <MetricCard
              title="Active Guests"
              value={856}
              trend="up"
              trendValue={8}
              icon={<PeopleIcon />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <MetricCard
              title="Monthly Revenue"
              value={124750}
              format="currency"
              trend="up"
              trendValue={15}
              icon={<AttachMoneyIcon />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <MetricCard
              title="Occupancy Rate"
              value={87.5}
              format="percentage"
              trend="up"
              trendValue={3}
              icon={<TrendingUpIcon />}
              color="info"
            />
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, borderRadius: designSystem.borderRadius.lg }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Monthly Revenue Trend
              </Typography>
              <BarChart
                data={revenueData}
                height={300}
                animated
              />
            </Paper>
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, borderRadius: designSystem.borderRadius.lg, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Booking Status Distribution
              </Typography>
              <DonutChart
                data={bookingStatusData}
                size={200}
                thickness={30}
              />
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: designSystem.borderRadius.lg }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Hotel Occupancy Rates
              </Typography>
              <Grid container spacing={3}>
                {hotelOccupancyData.map((hotel, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <ProgressChart
                      data={[hotel]}
                      title={hotel.label}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => window.open('/hotels/search', '_blank')}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: designSystem.borderRadius.md,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 'bold',
          }}
        >
          Apply to Hotel Search
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={() => window.open('/demo/phase2', '_blank')}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: designSystem.borderRadius.md,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 'bold',
          }}
        >
          View Phase 2 Demo
        </Button>
      </Box>
    </Container>
  );
};

export default Phase3Demo;