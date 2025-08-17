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
  Chip,
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
} from '@mui/material';
import {
  Search as SearchIcon,
  Hotel as HotelIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Hotel {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  rating: number;
  totalRooms: number;
  availableRooms: number;
  priceRange: string;
  amenities: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  tenantId: string;
  createdAt: string;
  lastModified: string;
}

// Mock data - replace with actual API calls
const mockHotels: Hotel[] = [
  {
    id: 1,
    name: "Grand Plaza Hotel",
    description: "Luxury hotel in downtown with premium amenities",
    address: "123 Main Street",
    city: "New York",
    country: "USA",
    phone: "+1-555-0123",
    email: "info@grandplaza.com",
    rating: 4.5,
    totalRooms: 150,
    availableRooms: 45,
    priceRange: "$200-$500",
    amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym"],
    status: "ACTIVE",
    tenantId: "grand-plaza",
    createdAt: "2024-01-15",
    lastModified: "2024-08-10",
  },
  {
    id: 2,
    name: "Seaside Resort",
    description: "Beautiful beachfront resort with ocean views",
    address: "456 Ocean Drive",
    city: "Miami",
    country: "USA",
    phone: "+1-555-0456",
    email: "reservations@seasideresort.com",
    rating: 4.8,
    totalRooms: 200,
    availableRooms: 78,
    priceRange: "$150-$400",
    amenities: ["Beach Access", "Pool", "Restaurant", "WiFi", "Spa"],
    status: "ACTIVE",
    tenantId: "seaside-resort",
    createdAt: "2024-02-20",
    lastModified: "2024-08-12",
  },
  {
    id: 3,
    name: "Mountain View Inn",
    description: "Cozy mountain retreat with hiking trails",
    address: "789 Mountain Road",
    city: "Denver",
    country: "USA",
    phone: "+1-555-0789",
    email: "contact@mountainview.com",
    rating: 4.2,
    totalRooms: 80,
    availableRooms: 12,
    priceRange: "$100-$250",
    amenities: ["WiFi", "Restaurant", "Hiking", "Pet Friendly"],
    status: "INACTIVE",
    tenantId: "mountain-view",
    createdAt: "2024-03-10",
    lastModified: "2024-07-15",
  },
];

const HotelManagementAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalHotels, setTotalHotels] = useState(0);

  useEffect(() => {
    const loadHotelsData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        let filteredHotels = mockHotels;
        if (searchTerm) {
          filteredHotels = mockHotels.filter(hotel =>
            hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hotel.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hotel.email.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setHotels(filteredHotels);
        setTotalHotels(filteredHotels.length);
      } catch (error) {
        console.error('Error loading hotels:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHotelsData();
  }, [page, rowsPerPage, searchTerm]);

  const loadHotels = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let filteredHotels = mockHotels;
      if (searchTerm) {
        filteredHotels = mockHotels.filter(hotel =>
          hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hotel.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hotel.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setHotels(filteredHotels);
      setTotalHotels(filteredHotels.length);
    } catch (error) {
      console.error('Error loading hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setDetailsDialogOpen(true);
  };

  const handleStatusChange = async (hotelId: number, newStatus: string) => {
    try {
      // Simulate API call
      console.log(`Changing hotel ${hotelId} status to ${newStatus}`);
      await loadHotels(); // Refresh data
    } catch (error) {
      console.error('Error updating hotel status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'INACTIVE': return 'warning';
      case 'SUSPENDED': return 'error';
      default: return 'default';
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon
        key={index}
        sx={{
          fontSize: 16,
          color: index < Math.floor(rating) ? '#ffc107' : '#e0e0e0',
        }}
      />
    ));
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
                <Typography variant="body1">{selectedHotel.description}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Address</Typography>
                <Typography variant="body1">
                  {selectedHotel.address}, {selectedHotel.city}, {selectedHotel.country}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Contact</Typography>
                <Typography variant="body1">📞 {selectedHotel.phone}</Typography>
                <Typography variant="body1">✉️ {selectedHotel.email}</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Operational Details</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Rating</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getRatingStars(selectedHotel.rating)}
                  <Typography variant="body1">({selectedHotel.rating}/5)</Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Rooms</Typography>
                <Typography variant="body1">
                  {selectedHotel.availableRooms}/{selectedHotel.totalRooms} available
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Price Range</Typography>
                <Typography variant="body1">{selectedHotel.priceRange}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Chip
                  label={selectedHotel.status}
                  color={getStatusColor(selectedHotel.status) as any}
                  size="small"
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Tenant ID</Typography>
                <Typography variant="body1">{selectedHotel.tenantId}</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Amenities</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedHotel.amenities.map((amenity, index) => (
                  <Chip key={index} label={amenity} variant="outlined" size="small" />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Created</Typography>
                  <Typography variant="body1">{selectedHotel.createdAt}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Last Modified</Typography>
                  <Typography variant="body1">{selectedHotel.lastModified}</Typography>
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
              <Typography variant="h6" gutterBottom>Active Hotels</Typography>
              <Typography variant="h4">
                {hotels.filter(h => h.status === 'ACTIVE').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Rooms</Typography>
              <Typography variant="h4">
                {hotels.reduce((sum, hotel) => sum + hotel.totalRooms, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Available Rooms</Typography>
              <Typography variant="h4">
                {hotels.reduce((sum, hotel) => sum + hotel.availableRooms, 0)}
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
                  <TableCell>Rating</TableCell>
                  <TableCell>Status</TableCell>
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
                          <Typography variant="subtitle2" fontWeight="bold">
                            {hotel.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {hotel.tenantId}
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
                      <Typography variant="body2">{hotel.phone}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {hotel.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {hotel.availableRooms}/{hotel.totalRooms}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        available
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getRatingStars(hotel.rating)}
                        <Typography variant="body2">({hotel.rating})</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={hotel.status}
                        color={getStatusColor(hotel.status) as any}
                        size="small"
                      />
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
                        <Tooltip title={hotel.status === 'ACTIVE' ? 'Suspend' : 'Activate'}>
                          <IconButton
                            size="small"
                            onClick={() => handleStatusChange(
                              hotel.id, 
                              hotel.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
                            )}
                          >
                            {hotel.status === 'ACTIVE' ? <BlockIcon /> : <CheckCircleIcon />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalHotels}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value))}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </CardContent>
      </Card>

      <HotelDetailsDialog />
    </Container>
  );
};

export default HotelManagementAdmin;
