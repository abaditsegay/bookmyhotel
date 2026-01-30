import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  Snackbar,
  Grid,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { hotelApiService } from '../services/hotelApi';
import HotelListCard from '../components/hotel/HotelListCard';
import { COLORS, addAlpha } from '../theme/themeColors';
import { 
  HotelSearchRequest, 
  HotelSearchResult,
} from '../types/hotel';
import { HotelCardSkeleton } from '../components/common/SkeletonLoaders';
import { NoHotels } from '../components/common/EmptyState';

const HotelListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State from search parameters
  const [searchRequest, setSearchRequest] = useState<HotelSearchRequest | null>(null);
  const [hotels, setHotels] = useState<HotelSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Success/error feedback
  const [successMessage, setSuccessMessage] = useState('');

  // Function to perform a new search when we have searchRequest but no hotels
  const performSearch = useCallback(async (searchReq: HotelSearchRequest) => {
    try {
      setLoading(true);
      setError('');
      // console.log('🔍 Performing hotel search:', searchReq);
      const results = await hotelApiService.searchHotelsPublic(searchReq);
      setHotels(results);
    } catch (err) {
      // console.error('❌ Hotel search failed:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while searching for hotels');
      // If search fails, redirect back to search page
      navigate('/hotels/search');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Extract search parameters from location state or URL
  useEffect(() => {
    const state = location.state as { 
      searchRequest?: HotelSearchRequest; 
      hotels?: HotelSearchResult[];
      successMessage?: string;
    };
    
    if (state?.searchRequest && state?.hotels && state.hotels.length > 0) {
      // If we have data passed from the search page
      setSearchRequest(state.searchRequest);
      setHotels(state.hotels);
      setLoading(false);
    } else if (state?.searchRequest) {
      // If we have searchRequest but no hotels, perform a new search
      setSearchRequest(state.searchRequest);
      performSearch(state.searchRequest);
    } else {
      // If no data, redirect back to search
      navigate('/hotels/search');
    }

    // Handle success message from booking
    if (state?.successMessage) {
      setSuccessMessage(state.successMessage);
    }
  }, [location, navigate, performSearch]);

  const handleViewHotel = (hotelId: number) => {
    navigate(`/hotels/${hotelId}`, {
      state: {
        searchRequest: searchRequest
      }
    });
  };

  const handleCloseSuccess = () => {
    setSuccessMessage('');
  };

  const handleBackToSearch = () => {
    navigate('/hotels/search', { 
      state: { 
        searchRequest: searchRequest 
      } 
    });
  };

  const formatSearchSummary = () => {
    if (!searchRequest) return '';
    
    const parts = [];
    if (searchRequest.location) {
      parts.push(`in ${searchRequest.location}`);
    }
    parts.push(`from ${searchRequest.checkInDate} to ${searchRequest.checkOutDate}`);
    parts.push(`for ${searchRequest.guests} guest${searchRequest.guests > 1 ? 's' : ''}`);
    
    return parts.join(' ');
  };

  if (loading) {
    return (
      <Container 
        maxWidth="lg"
        sx={{ py: isMobile ? 2 : 4, px: isMobile ? 1 : 3 }}
      >
        <Typography variant="h5" sx={{ mb: 3 }}>
          Searching for hotels...
        </Typography>
        <Grid container spacing={isMobile ? 2 : 3}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Grid item xs={12} key={index}>
              <HotelCardSkeleton />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: isMobile ? 2 : 4,
        px: isMobile ? 1 : 3,
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
      }}
    >
      {/* Combined Header and Actions Section */}
      <Card 
        sx={{ 
          mb: isMobile ? 3 : 4,
          backgroundColor: '#ffffff',
          border: `2px solid ${COLORS.PRIMARY}`,
          borderRadius: 2,
          boxShadow: `0 4px 12px ${addAlpha(COLORS.PRIMARY, 0.15)}`,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: isMobile ? 3 : 4 }}>
          {/* Combined Header Section */}
          <Box sx={{ 
            p: 3,
            bgcolor: '#fafafa',
            borderRadius: 2,
            border: `1px solid ${COLORS.PRIMARY}`,
          }}>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              sx={{ 
                fontWeight: 700,
                color: COLORS.PRIMARY,
                mb: 1,
              }}
            >
              Search Results
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
              Hotels {formatSearchSummary()}
            </Typography>
            
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 2,
              mb: 2,
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  display: 'inline-block',
                  bgcolor: addAlpha(COLORS.PRIMARY, 0.1),
                  color: COLORS.PRIMARY,
                  px: 2,
                  py: 0.75,
                  borderRadius: 1,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: '1px solid #E8B86D',
                }}
              >
                {hotels.length} hotel{hotels.length === 1 ? '' : 's'} found
              </Typography>
              
              <Button 
                onClick={() => console.log('Open sort options')}
                sx={{ 
                  py: 1,
                  px: 2.5,
                  bgcolor: '#ffffff',
                  color: '#2c5282',
                  border: '1px solid #E8B86D',
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  minWidth: 'auto',
                  '&:hover': {
                    bgcolor: 'rgba(232, 184, 109, 0.1)',
                    borderColor: '#d4a45a',
                  },
                }}
              >
                Sort By Price
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Results Section */}
      {hotels.length > 0 ? (
        <Box>
          <Grid 
            container 
            spacing={isMobile ? 2 : 3}
          >
            {hotels.map((hotel) => (
              <Grid item xs={12} key={hotel.id}>
                <HotelListCard
                  hotel={hotel}
                  onViewHotel={handleViewHotel}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <NoHotels onRegister={handleBackToSearch} />
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default HotelListPage;
