import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Snackbar,
  Breadcrumbs,
  Link,
  IconButton,
  Grid,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Button,
  Stack,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Hotel as HotelIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
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
      maxWidth="lg" 
      sx={{ 
        py: isMobile ? 2 : 4,
        px: isMobile ? 1 : 3,
      }}
    >
      {/* Enhanced Header Section */}
      <Card 
        elevation={2}
        sx={{ 
          mb: isMobile ? 3 : 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`,
          border: `1px solid ${theme.palette.primary.main}20`,
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: isMobile ? 2.5 : 4 }}>
          {/* Back Navigation */}
          <Box sx={{ mb: isMobile ? 2 : 3 }}>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              mb: isMobile ? 1.5 : 2,
            }}>
              <IconButton 
                onClick={handleBackToSearch}
                sx={{ 
                  mr: 2,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    borderColor: 'primary.main',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
                aria-label="back to search"
              >
                <ArrowBackIcon />
              </IconButton>
              
              {!isMobile && (
                <Breadcrumbs 
                  aria-label="breadcrumb"
                  sx={{
                    '& .MuiBreadcrumbs-separator': {
                      color: 'primary.main',
                      fontWeight: 'bold',
                    },
                  }}
                >
                  <Link 
                    component="button" 
                    variant="body2" 
                    onClick={handleBackToSearch}
                    sx={{ 
                      textDecoration: 'none',
                      color: 'primary.main',
                      fontWeight: 'medium',
                      '&:hover': {
                        color: 'primary.dark',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Hotel Search
                  </Link>
                  <Typography variant="body2" color="text.primary" sx={{ fontWeight: 'medium' }}>
                    Search Results
                  </Typography>
                </Breadcrumbs>
              )}
            </Box>
          </Box>

          {/* Professional Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: isMobile ? 2 : 3,
            p: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, ${theme.palette.secondary.main}10 100%)`,
            borderRadius: 2,
          }}>
            <Box sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 2,
            }}>
              <HotelIcon sx={{ fontSize: 28, color: 'white' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                sx={{ 
                  fontWeight: 'bold',
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5,
                }}
              >
                Search Results
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                Hotels {formatSearchSummary()}
              </Typography>
              <Box sx={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: 'success.main',
                color: 'success.contrastText',
                px: 2,
                py: 0.5,
                borderRadius: 2,
                fontSize: '0.875rem',
                fontWeight: 'bold',
              }}>
                <SearchIcon sx={{ fontSize: 16 }} />
                {hotels.length} hotel{hotels.length === 1 ? '' : 's'} found
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Action Buttons Section */}
      <Card 
        elevation={2}
        sx={{ 
          mb: isMobile ? 3 : 4,
          background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.05) 0%, rgba(233, 30, 99, 0.05) 100%)',
          border: '1px solid rgba(156, 39, 176, 0.2)',
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: isMobile ? 2.5 : 3 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: isMobile ? 2 : 2.5,
            p: 2,
            background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(233, 30, 99, 0.1) 100%)',
            borderRadius: 2,
          }}>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: 'secondary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 2,
            }}>
              <FilterIcon sx={{ fontSize: 24, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                Refine Your Search
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Filter and sort to find your perfect hotel
              </Typography>
            </Box>
          </Box>

          <Stack 
            direction={isMobile ? "column" : "row"} 
            spacing={isMobile ? 2 : 3}
            justifyContent="center"
          >
            <Button 
              variant={isMobile ? "contained" : "outlined"}
              startIcon={<FilterIcon />}
              onClick={() => console.log('Open filters')}
              size="large"
              sx={{ 
                py: 1.5,
                px: 3,
                borderRadius: 3,
                fontWeight: 'bold',
                textTransform: 'none',
                minWidth: isMobile ? 'auto' : 160,
                ...(isMobile ? {
                  bgcolor: 'secondary.main',
                  color: 'secondary.contrastText',
                  '&:hover': {
                    bgcolor: 'secondary.dark',
                  },
                } : {
                  borderColor: 'secondary.main',
                  color: 'secondary.main',
                  '&:hover': {
                    bgcolor: 'secondary.main',
                    color: 'secondary.contrastText',
                    borderColor: 'secondary.main',
                  },
                }),
              }}
            >
              Filter Results
            </Button>
            <Button 
              variant={isMobile ? "outlined" : "contained"}
              startIcon={<SortIcon />}
              onClick={() => console.log('Open sort options')}
              size="large"
              sx={{ 
                py: 1.5,
                px: 3,
                borderRadius: 3,
                fontWeight: 'bold',
                textTransform: 'none',
                minWidth: isMobile ? 'auto' : 160,
                ...(isMobile ? {
                  borderColor: 'secondary.main',
                  color: 'secondary.main',
                  '&:hover': {
                    bgcolor: 'secondary.main',
                    color: 'secondary.contrastText',
                    borderColor: 'secondary.main',
                  },
                } : {
                  bgcolor: 'secondary.main',
                  color: 'secondary.contrastText',
                  '&:hover': {
                    bgcolor: 'secondary.dark',
                  },
                }),
              }}
            >
              Sort By Price
            </Button>
          </Stack>
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
        <Card 
          elevation={2}
          sx={{ 
            background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.05) 0%, rgba(255, 152, 0, 0.05) 100%)',
            border: '1px solid rgba(255, 193, 7, 0.2)',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: isMobile ? 4 : 6, textAlign: 'center' }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              mb: 3,
            }}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: 4,
                bgcolor: 'warning.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 3,
              }}>
                <SearchIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                sx={{ 
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #ff9800, #ffc107)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                No Hotels Found
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 2 }}>
              We couldn't find any hotels matching your search criteria.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your search dates, location, or filters to find more options.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleBackToSearch}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 'bold',
                px: 4,
                py: 1.5,
                bgcolor: 'warning.main',
                color: 'warning.contrastText',
                '&:hover': {
                  bgcolor: 'warning.dark',
                },
              }}
            >
              Modify Search
            </Button>
          </CardContent>
        </Card>
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
