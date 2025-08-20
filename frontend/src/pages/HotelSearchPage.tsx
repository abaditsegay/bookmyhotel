import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Button,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import HotelSearchForm from '../components/hotel/HotelSearchForm';
import { hotelApiService } from '../services/hotelApi';
import { 
  HotelSearchRequest,
  HotelSearchResult,
} from '../types/hotel';

const HotelSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (searchRequest: HotelSearchRequest) => {
    setLoading(true);
    setError('');
    
    try {
      // Use public API call for hotel search (no authentication/tenant headers)
      console.log('🔍 Performing public hotel search:', searchRequest);
      const results = await hotelApiService.searchHotelsPublic(searchRequest);
      
      console.log('✅ Hotel search results:', results);
      
      // Navigate to search results page with the data
      navigate('/search-results', {
        state: {
          searchRequest,
          hotels: results
        }
      });
    } catch (err) {
      console.error('❌ Hotel search failed:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while searching for hotels');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Find Your Perfect Hotel
      </Typography>

      <Box sx={{ mb: 4 }}>
        <HotelSearchForm onSearch={handleSearch} loading={loading} />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box display="flex" justifyContent="center" sx={{ my: 4 }}>
          <CircularProgress size={60} />
        </Box>
      )}

      {/* Find My Booking Section */}
      <Divider sx={{ my: 4 }} />
      
      <Paper 
        elevation={1} 
        sx={{ 
          p: 3, 
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef'
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Already Have a Booking?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage your existing reservation or view booking details
        </Typography>
        <Button
          variant="outlined"
          size="large"
          startIcon={<SearchIcon />}
          onClick={() => navigate('/find-booking')}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 'bold',
            px: 4,
            py: 1.5
          }}
        >
          Find My Booking
        </Button>
      </Paper>

    </Container>
  );
};

export default HotelSearchPage;
