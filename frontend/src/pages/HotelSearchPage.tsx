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
  Card,
} from '@mui/material';
import {
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import VerticalHotelAdvertisementBanner from '../components/VerticalHotelAdvertisementBanner';
import HotelSearchForm from '../components/hotel/HotelSearchForm';
import { hotelApiService } from '../services/hotelApi';
import { useAuth } from '../contexts/AuthContext';
import { 
  HotelSearchRequest,
} from '../types/hotel';

const HotelSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Check if user is operations staff who shouldn't see ads
  const isOperationsUser = user?.role === 'OPERATIONS_SUPERVISOR' || 
                           user?.role === 'HOUSEKEEPING' || 
                           user?.role === 'MAINTENANCE';

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
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Responsive layout: Desktop (3-column), Mobile (single column with search top, ads bottom) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr', // Mobile: single column
            md: isOperationsUser ? '1fr' : '1fr 3fr 1fr' // Desktop: 20% - 60% - 20% split for non-operations users
          },
          gridTemplateRows: {
            xs: isOperationsUser ? '1fr' : 'auto auto auto', // Mobile: search + 2 ad sections
            md: '1fr' // Desktop: single row
          },
          gridTemplateAreas: {
            xs: isOperationsUser ? `"main"` : `"main" "leftAd" "rightAd"`, // Mobile: main top, ads bottom
            md: isOperationsUser ? `"main"` : `"leftAd main rightAd"` // Desktop: side-by-side
          },
          minHeight: {
            xs: 'auto', // Mobile: auto height
            md: 'calc(100vh - 200px)' // Desktop: fixed viewport height
          },
          maxHeight: {
            xs: 'none', // Mobile: no max height restriction
            md: 'calc(100vh - 200px)' // Desktop: fixed viewport height
          },
          gap: 2,
        }}
      >
        {/* Left Advertisement Pane - Responsive: side pane on desktop, bottom section on mobile */}
        {!isOperationsUser && (
          <Box sx={{ gridArea: 'leftAd' }}>
            <Card 
              sx={{ 
                height: {
                  xs: '500px', // Mobile: increased height for better hotel visibility
                  md: '100%' // Desktop: full height
                },
                border: '1px solid #e0e0e0',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ textAlign: 'center', mb: 0, fontWeight: 'bold' }}>
                  Special Deals
                </Typography>
              </Box>
              <Box sx={{ 
                flex: 1, 
                overflowY: 'auto',
                overflowX: 'hidden',
                // Enhanced scrollbar styling for mobile
                '&::-webkit-scrollbar': {
                  width: {
                    xs: '8px', // Wider scrollbar on mobile for easier touch interaction
                    md: '6px'
                  }
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#c1c1c1',
                  borderRadius: '4px',
                  '&:hover': {
                    background: '#a8a8a8',
                  }
                }
              }}>
                <VerticalHotelAdvertisementBanner maxHotels={6} />
              </Box>
            </Card>
          </Box>
        )}

        {/* Center Search Form - Responsive: main content area */}
        <Box sx={{ gridArea: 'main' }}>
          <Card 
            sx={{ 
              height: {
                xs: 'auto', // Mobile: auto height
                md: '100%' // Desktop: full height
              },
              border: '1px solid #e0e0e0',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Header Section */}
            <Box sx={{ p: 3, backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', textAlign: 'center' }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Find Your Perfect Hotel
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Find and book your perfect stay
              </Typography>
            </Box>

            {/* Search Form Section */}
            <Box sx={{ 
              flex: 1, 
              p: { xs: 2, md: 4 }, // Smaller padding on mobile
              overflowY: {
                xs: 'visible', // Mobile: no scroll restriction
                md: 'auto' // Desktop: scrollable
              }
            }}>
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
                  background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                  color: 'white'
                }}
              >
                <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Already Have a Booking?
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
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
                    py: 1.5,
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    color: 'white',
                    '&:hover': { 
                      borderColor: 'white', 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)' 
                    }
                  }}
                >
                  Find My Booking
                </Button>
              </Paper>
            </Box>
          </Card>
        </Box>

        {/* Right Advertisement Pane - Responsive: side pane on desktop, bottom section on mobile */}
        {!isOperationsUser && (
          <Box sx={{ gridArea: 'rightAd' }}>
            <Card 
              sx={{ 
                height: {
                  xs: '500px', // Mobile: increased height for better hotel visibility
                  md: '100%' // Desktop: full height
                },
                border: '1px solid #e0e0e0',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ textAlign: 'center', mb: 0, fontWeight: 'bold' }}>
                  Featured Hotels
                </Typography>
              </Box>
              <Box sx={{ 
                flex: 1, 
                overflowY: 'auto',
                overflowX: 'hidden',
                // Enhanced scrollbar styling for mobile
                '&::-webkit-scrollbar': {
                  width: {
                    xs: '8px', // Wider scrollbar on mobile for easier touch interaction
                    md: '6px'
                  }
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#c1c1c1',
                  borderRadius: '4px',
                  '&:hover': {
                    background: '#a8a8a8',
                  }
                }
              }}>
                <VerticalHotelAdvertisementBanner maxHotels={6} />
              </Box>
            </Card>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default HotelSearchPage;
