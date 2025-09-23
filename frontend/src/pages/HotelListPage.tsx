import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Snackbar,
  Paper,
  Breadcrumbs,
  Link,
  IconButton,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { hotelApiService } from '../services/hotelApi';
import HotelListCard from '../components/hotel/HotelListCard';
import { 
  HotelSearchRequest, 
  HotelSearchResult,
} from '../types/hotel';

const HotelListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
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
      console.log('🔍 Performing hotel search:', searchReq);
      const results = await hotelApiService.searchHotelsPublic(searchReq);
      console.log('✅ Hotel search results:', results);
      setHotels(results);
    } catch (err) {
      console.error('❌ Hotel search failed:', err);
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
        maxWidth="xl" 
        sx={{ 
          py: { xs: 2, md: 4 },
          px: { xs: 1, md: 3 },
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: { xs: '50vh', md: '60vh' },
          textAlign: 'center',
        }}>
          <CircularProgress 
            size={48}
            sx={{ 
              mb: 2,
              width: { xs: '40px !important', md: '48px !important' },
              height: { xs: '40px !important', md: '48px !important' },
            }}
          />
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
          >
            Searching for hotels...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        py: { xs: 2, sm: 3, md: 4 }, // Mobile-first padding
        px: { xs: 1, sm: 2, md: 3 }, // Tighter mobile margins
      }}
    >
      {/* Header Section - Mobile Optimized */}
      <Box sx={{ mb: { xs: 2, md: 4 } }}>
        {/* Back Navigation - Mobile Enhanced */}
        <Box sx={{ mb: { xs: 1.5, md: 2 } }}>
          <IconButton 
            onClick={handleBackToSearch}
            sx={{ 
              mr: 1,
              p: { xs: 1.5, md: 1 }, // Larger touch target on mobile
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
            aria-label="back to search"
          >
            <ArrowBackIcon sx={{ fontSize: { xs: 24, md: 20 } }} />
          </IconButton>
          
          {/* Hide breadcrumbs on small mobile to save space */}
          <Box sx={{ display: { xs: 'none', sm: 'inline-block' } }}>
            <Breadcrumbs aria-label="breadcrumb">
              <Link 
                component="button" 
                variant="body2" 
                onClick={handleBackToSearch}
                sx={{ textDecoration: 'none' }}
              >
                Hotel Search
              </Link>
              <Typography variant="body2" color="text.primary">
                Search Results
              </Typography>
            </Breadcrumbs>
          </Box>
          
          {/* Mobile-only back text */}
          <Box sx={{ display: { xs: 'inline-block', sm: 'none' }, ml: 1 }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: '0.9rem' }}
            >
              Back to Search
            </Typography>
          </Box>
        </Box>

        {/* Search Summary - Mobile Optimized */}
        <Paper 
          elevation={1} 
          sx={{ 
            p: { xs: 2.5, sm: 3, md: 3 }, 
            mb: { xs: 2, md: 3 }, 
            backgroundColor: 'primary.50',
            borderRadius: { xs: 2, md: 1 },
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              fontSize: { 
                xs: '1.5rem',   // Mobile: 24px
                sm: '1.75rem',  // Small tablet: 28px
                md: '2rem'      // Desktop: 32px
              },
              lineHeight: 1.2,
              mb: 1,
            }}
          >
            Hotels Found
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            gutterBottom
            sx={{
              fontSize: { 
                xs: '1rem',     // Mobile: 16px
                sm: '1.1rem',   // Small tablet: 17.6px
                md: '1.25rem'   // Desktop: 20px
              },
              lineHeight: 1.3,
              mb: 1,
            }}
          >
            Hotels {formatSearchSummary()}
          </Typography>
          <Typography 
            variant="body1" 
            color="success.main" 
            sx={{ 
              fontWeight: 'medium',
              fontSize: { xs: '0.95rem', md: '1rem' },
            }}
          >
            {hotels.length} hotel{hotels.length === 1 ? '' : 's'} available
          </Typography>
        </Paper>
      </Box>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Results Section - Mobile Optimized */}
      {hotels.length > 0 ? (
        <Box>
          <Grid 
            container 
            spacing={{ xs: 2, sm: 2, md: 3 }} // Tighter spacing on mobile
            sx={{
              // Ensure proper mobile spacing
              '& .MuiGrid-item': {
                paddingTop: { xs: '16px !important', md: '24px !important' },
                paddingLeft: { xs: '16px !important', md: '24px !important' },
              }
            }}
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
        <Paper 
          elevation={1} 
          sx={{ 
            p: { xs: 4, sm: 5, md: 6 }, // Responsive padding
            textAlign: 'center',
            borderRadius: { xs: 2, md: 1 },
          }}
        >
          <Typography 
            variant="h5" 
            color="text.secondary" 
            gutterBottom
            sx={{
              fontSize: { xs: '1.25rem', md: '1.5rem' }, // Mobile-friendly size
            }}
          >
            No hotels found
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            paragraph
            sx={{
              fontSize: { xs: '0.95rem', md: '1rem' },
              px: { xs: 1, md: 0 }, // Add horizontal padding on mobile
            }}
          >
            We couldn't find any hotels matching your search criteria.
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.875rem', md: '0.875rem' },
              px: { xs: 1, md: 0 },
            }}
          >
            Try adjusting your search dates, location, or filters.
          </Typography>
        </Paper>
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
