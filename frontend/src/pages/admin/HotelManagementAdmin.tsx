import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  InputAdornment,
  Avatar,
  IconButton,
  Tooltip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  LinearProgress,
  Snackbar,
  Alert,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Hotel as HotelIcon,
  LocationOn as LocationIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { adminApiService, HotelDTO, PagedResponse } from '../../services/adminApi';

const HotelManagementAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [hotels, setHotels] = useState<HotelDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHotel, setSelectedHotel] = useState<HotelDTO | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Changed back to 10 for testing
  const [totalHotels, setTotalHotels] = useState(0);
  const [success, setSuccess] = useState<string | null>(null);

  console.log('Component render - State:', { page, rowsPerPage, totalHotels });

  // Set token in API service when component mounts
  useEffect(() => {
    if (token) {
      adminApiService.setToken(token);
    }
  }, [token]);

  const loadHotelsData = async () => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result: PagedResponse<HotelDTO>;
      
      console.log('Making API call with:', { searchTerm: searchTerm.trim(), page, rowsPerPage });
      
      if (searchTerm.trim()) {
        result = await adminApiService.searchHotels(searchTerm, page, rowsPerPage);
      } else {
        result = await adminApiService.getHotels(page, rowsPerPage);
      }

      console.log('API Response:', result);
      console.log('API Response structure:');
      console.log('- content:', result.content?.length);
      console.log('- totalElements:', result.totalElements);
      console.log('- totalPages:', result.totalPages);
      console.log('- number (current page):', result.number);
      console.log('- size:', result.size);
      console.log('- first:', result.first);
      console.log('- last:', result.last);
      
      setHotels(result.content || []);
      
      // Handle Spring Boot Page structure
      const totalCount = result.totalElements || 0;
      console.log('Setting total hotels count:', totalCount);
      console.log('Current page state:', page);
      console.log('Current rowsPerPage state:', rowsPerPage);
      setTotalHotels(totalCount);
    } catch (error) {
      console.error('Error loading hotels:', error);
      setError('Failed to load hotels. Please try again.');
      setHotels([]);
      setTotalHotels(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadHotelsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, rowsPerPage, searchTerm]);

  const loadHotels = async () => {
    await loadHotelsData();
  };

  const handleViewDetails = (hotel: HotelDTO) => {
    setSelectedHotel(hotel);
    setDetailsDialogOpen(true);
  };

  const handleToggleHotelStatus = async (hotelId: number) => {
    try {
      await adminApiService.toggleHotelStatus(hotelId);
      setSuccess('Hotel status updated successfully');
      await loadHotelsData(); // Refresh the list
    } catch (error) {
      console.error('Error toggling hotel status:', error);
      setError('Failed to update hotel status');
    }
  };

  const HotelDetailsDialog = () => (
    <Dialog
      open={detailsDialogOpen}
      onClose={() => setDetailsDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <HotelIcon />
          Hotel Details - {selectedHotel?.name}
        </Box>
      </DialogTitle>
      <DialogContent>
        {selectedHotel && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Name</Typography>
                <Typography variant="body1">{selectedHotel.name}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Description</Typography>
                <Typography variant="body1">{selectedHotel.description || 'No description available'}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Address</Typography>
                <Typography variant="body1">
                  {selectedHotel.address}, {selectedHotel.city}, {selectedHotel.country}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Contact</Typography>
                <Typography variant="body1">📞 {selectedHotel.phone || 'Not provided'}</Typography>
                <Typography variant="body1">✉️ {selectedHotel.email || 'Not provided'}</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Operational Details</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Rooms</Typography>
                <Typography variant="body1">
                  {selectedHotel.availableRooms || 0}/{selectedHotel.totalRooms || 0} available
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Tenant ID</Typography>
                <Typography variant="body1">{selectedHotel.tenantId || 'Not assigned'}</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Created</Typography>
                  <Typography variant="body1">{selectedHotel.createdAt || 'Unknown'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                  <Typography variant="body1">{selectedHotel.updatedAt || 'Unknown'}</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/admin')}
          sx={{ mb: 2 }}
        >
          ← Back to Admin Dashboard
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Hotels</Typography>
              <Typography variant="h4">{totalHotels}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Listed Hotels</Typography>
              <Typography variant="h4">{hotels.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Rooms</Typography>
              <Typography variant="h4">
                {hotels.reduce((sum, hotel) => sum + (hotel.totalRooms || 0), 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Available Rooms</Typography>
              <Typography variant="h4">
                {hotels.reduce((sum, hotel) => sum + (hotel.availableRooms || 0), 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search hotels by name, city, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={() => {/* Add filter functionality */}}
                >
                  Filters
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadHotels}
                >
                  Refresh
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Hotels Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading && <LinearProgress />}
          
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Hotel</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Rooms</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hotels.map((hotel) => (
                  <TableRow key={hotel.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <HotelIcon />
                        </Avatar>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {hotel.name}
                            </Typography>
                            <Chip
                              size="small"
                              label={hotel.isActive ? "Active" : "Inactive"}
                              color={hotel.isActive ? "success" : "error"}
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {hotel.tenantId || 'No tenant ID'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {hotel.city}, {hotel.country}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{hotel.phone || 'Not provided'}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {hotel.email || 'Not provided'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {hotel.availableRooms || 0}/{hotel.totalRooms || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        available
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(hotel)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={hotel.isActive ? "Deactivate Hotel" : "Activate Hotel"}>
                          <IconButton
                            size="small"
                            color={hotel.isActive ? "success" : "error"}
                            onClick={() => handleToggleHotelStatus(hotel.id)}
                          >
                            {hotel.isActive ? <ToggleOnIcon /> : <ToggleOffIcon />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Debug information */}
          <Box sx={{ p: 2, bgcolor: 'grey.100', fontSize: '12px' }}>
            <Typography variant="caption">
              Debug: page={page}, rowsPerPage={rowsPerPage}, totalHotels={totalHotels}, 
              hotels.length={hotels.length}, totalPages={Math.ceil(totalHotels / rowsPerPage)}
            </Typography>
          </Box>

          <TablePagination
            component="div"
            count={totalHotels || 0}
            page={page}
            onPageChange={(event, newPage) => {
              console.log('=== PAGINATION DEBUG ===');
              console.log('Current page:', page);
              console.log('New page:', newPage);
              console.log('Total hotels:', totalHotels);
              console.log('Rows per page:', rowsPerPage);
              console.log('Total pages calculated:', Math.ceil(totalHotels / rowsPerPage));
              console.log('Is next button disabled?', page >= Math.ceil(totalHotels / rowsPerPage) - 1);
              console.log('Is prev button disabled?', page <= 0);
              console.log('========================');
              setPage(newPage);
            }}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              const newRowsPerPage = parseInt(event.target.value, 10);
              console.log('Rows per page change:', newRowsPerPage);
              setRowsPerPage(newRowsPerPage);
              setPage(0); // Reset to first page when changing page size
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            showFirstButton
            showLastButton
          />
        </CardContent>
      </Card>

      <HotelDetailsDialog />

      {/* Success Snackbar */}
      <Snackbar
        open={Boolean(success)}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default HotelManagementAdmin;
