import React, { useState } from 'react';
import {
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
    <Box sx={{ 
      // Force full viewport width using CSS tricks
      width: '100vw',
      position: 'relative',
      left: '50%',
      right: '50%',
      marginLeft: '-50vw',
      marginRight: '-50vw',
      backgroundColor: '#f8fafc',
      minHeight: 'calc(100vh - 64px)', // Account for navbar
      p: { xs: 2, md: 3 }, // Add our own padding
    }}>
      {/* Responsive layout: Desktop (3-column), Mobile (single column with search top, ads bottom) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr', // Mobile: single column
            md: isOperationsUser ? '1fr' : '1fr 2fr 1fr' // Desktop: 25% - 50% - 25% split for non-operations users
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
            md: 'calc(100vh - 300px)' // Desktop: fixed viewport height accounting for header
          },
          gap: 3, // Increased gap for better spacing
        }}
      >
        {/* Left Advertisement Pane - Responsive: side pane on desktop, bottom section on mobile */}
        {!isOperationsUser && (
          <Box sx={{ gridArea: 'leftAd' }}>
            <Card 
              elevation={1}
              sx={{ 
                height: {
                  xs: '400px', // Mobile: increased height for better hotel visibility
                  md: '100%' // Desktop: full height
                },
                border: '1px solid rgba(224, 224, 224, 0.2)', // Much more subtle border
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 3, // Reduced shadow
                  transform: 'translateY(-1px)', // Reduced transform
                }
              }}
            >
              <Box sx={{ 
                p: 3, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderBottom: '1px solid #e0e0e0' 
              }}>
                <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 0, fontWeight: 'bold' }}>
                  🎉 Special Deals
                </Typography>
              </Box>
              <Box sx={{ 
                flex: 1, 
                overflowY: 'auto',
                overflowX: 'hidden',
                // Enhanced scrollbar styling for modern look
                '&::-webkit-scrollbar': {
                  width: {
                    xs: '8px', // Wider scrollbar on mobile for easier touch interaction
                    md: '6px'
                  }
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f8f9fa',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '4px',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #556bea 0%, #653ba2 100%)',
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
            elevation={1}
            sx={{ 
              height: {
                xs: 'auto', // Mobile: auto height
                md: '100%' // Desktop: full height
              },
              border: '1px solid rgba(224, 224, 224, 0.2)', // Much more subtle border
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)',
            }}
          >
            {/* Header Section */}
            <Box sx={{ 
              p: 4, 
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              color: 'white',
              textAlign: 'center' 
            }}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                🏨 Hotel Search
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Find and book your perfect stay worldwide
              </Typography>
            </Box>

            {/* Search Form Section */}
            <Box sx={{ 
              flex: 1, 
              p: { xs: 3, md: 4 }, // Consistent padding
              overflowY: {
                xs: 'visible', // Mobile: no scroll restriction
                md: 'auto' // Desktop: scrollable
              }
            }}>
              <Box sx={{ mb: 4 }}>
                <HotelSearchForm onSearch={handleSearch} loading={loading} />
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              {loading && (
                <Box display="flex" justifyContent="center" sx={{ my: 4 }}>
                  <CircularProgress size={60} thickness={4} />
                </Box>
              )}

              {/* Find My Booking Section */}
              <Divider sx={{ my: 4 }} />
              
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                  color: 'white',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 6,
                  }
                }}
              >
                <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                  📋 Already Have a Booking?
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, opacity: 0.9, fontSize: '1.1rem' }}>
                  Manage your existing reservation or view booking details
                </Typography>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<SearchIcon />}
                  onClick={() => navigate('/find-booking')}
                  sx={{ 
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderColor: 'rgba(255, 255, 255, 0.7)',
                    color: 'white',
                    '&:hover': { 
                      borderColor: 'white', 
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      transform: 'scale(1.05)',
                    }
                  }}
                >
                  Find My Booking
                </Button>
              </Paper>

              {/* Why Choose Us Section */}
              <Divider sx={{ my: 4 }} />
              
              <Paper 
                elevation={1}
                sx={{ 
                  p: 4, 
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                  borderRadius: 3,
                  border: '1px solid rgba(224, 224, 224, 0.3)',
                }}
              >
                <Typography variant="h5" component="h3" gutterBottom sx={{ 
                  fontWeight: 'bold', 
                  color: '#1976d2',
                  textAlign: 'center',
                  mb: 3
                }}>
                  🌟 Why Choose BookMyHotel?
                </Typography>
                
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
                  gap: 3,
                  mt: 2 
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 'bold', 
                      color: '#2e7d32',
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1
                    }}>
                      🔒 Bank-Level Security
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.6 }}>
                      Your personal data and payment information are protected with enterprise-grade encryption and secure payment gateways.
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 'bold', 
                      color: '#2e7d32',
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1
                    }}>
                      ⚡ Lightning Performance
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.6 }}>
                      Advanced caching and optimized search algorithms deliver instant results and seamless booking experience.
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 'bold', 
                      color: '#2e7d32',
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1
                    }}>
                      📱 Modern Experience
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.6 }}>
                      Intuitive design that works flawlessly across all devices - mobile, tablet, and desktop with responsive layouts.
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 'bold', 
                      color: '#2e7d32',
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1
                    }}>
                      🎧 24/7 Support
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.6 }}>
                      Round-the-clock customer support team ready to assist you with bookings, changes, or any travel concerns.
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Typography variant="body1" sx={{ 
                    color: '#1976d2', 
                    fontWeight: 'medium',
                    fontStyle: 'italic'
                  }}>
                    Join thousands of satisfied travelers who trust BookMyHotel for their accommodation needs
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Card>
        </Box>

        {/* Right Advertisement Pane - Responsive: side pane on desktop, bottom section on mobile */}
        {!isOperationsUser && (
          <Box sx={{ gridArea: 'rightAd' }}>
            <Card 
              elevation={1}
              sx={{ 
                height: {
                  xs: '400px', // Mobile: increased height for better hotel visibility
                  md: '100%' // Desktop: full height
                },
                border: '1px solid rgba(224, 224, 224, 0.2)', // Much more subtle border
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 3, // Reduced shadow
                  transform: 'translateY(-1px)', // Reduced transform
                }
              }}
            >
              <Box sx={{ 
                p: 3, 
                background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                color: 'white',
                borderBottom: '1px solid #e0e0e0' 
              }}>
                <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 0, fontWeight: 'bold' }}>
                  ⭐ Featured Hotels
                </Typography>
              </Box>
              <Box sx={{ 
                flex: 1, 
                overflowY: 'auto',
                overflowX: 'hidden',
                // Enhanced scrollbar styling for modern look
                '&::-webkit-scrollbar': {
                  width: {
                    xs: '8px', // Wider scrollbar on mobile for easier touch interaction
                    md: '6px'
                  }
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f8f9fa',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                  borderRadius: '4px',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #ff6b9e 0%, #fea9ef 100%)',
                  }
                }
              }}>
                <VerticalHotelAdvertisementBanner maxHotels={6} />
              </Box>
            </Card>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default HotelSearchPage;
