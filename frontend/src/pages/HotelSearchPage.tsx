import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HotelSearchForm from '../components/hotel/HotelSearchForm';
import { useAuthenticatedApi } from '../hooks/useAuthenticatedApi';
import { 
  HotelSearchRequest,
} from '../types/hotel';

const HotelSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { hotelApiService } = useAuthenticatedApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (searchRequest: HotelSearchRequest) => {
    setLoading(true);
    setError('');
    
    try {
      const results = await hotelApiService.searchHotels(searchRequest);
      
      // Navigate to search results page with the data
      navigate('/search-results', {
        state: {
          searchRequest,
          hotels: results
        }
      });
    } catch (err) {
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

    </Container>
  );
};

export default HotelSearchPage;
