import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Hotel as HotelIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import VerticalHotelAdvertisementBanner from '../components/VerticalHotelAdvertisementBanner';

const HomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {isMobile ? (
        // Mobile Layout: Stack vertically
        <Box>
          {/* Main Content */}
          <Card sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
            <CardContent sx={{ p: 3 }}>
              {/* Mobile Header */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  BookMyHotel
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Find Your Perfect Hotel
                </Typography>
              </Box>

              {/* Mobile Action Cards */}
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card 
                    sx={{ 
                      textAlign: 'center', 
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                      color: 'white',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 6,
                      }
                    }}
                    onClick={() => navigate('/hotels/search')}
                  >
                    <CardContent sx={{ py: 4 }}>
                      <SearchIcon sx={{ fontSize: 60, mb: 2 }} />
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Search
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        Find your perfect hotel
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card 
                    sx={{ 
                      textAlign: 'center', 
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                      color: 'white',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 6,
                      }
                    }}
                    onClick={() => navigate('/find-booking')}
                  >
                    <CardContent sx={{ py: 4 }}>
                      <HotelIcon sx={{ fontSize: 60, mb: 2 }} />
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Already have a booking?
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        View or modify your reservations
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          {/* Advertisement */}
          <Card sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
            <VerticalHotelAdvertisementBanner maxHotels={3} />
          </Card>
        </Box>
      ) : (
        // Desktop Layout: Three-column layout with scrollable ad panes on sides and 50% center content
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr 1fr', // 25% - 50% - 25% split
            gridTemplateRows: '1fr',
            gridTemplateAreas: `
              "leftAd main rightAd"
            `,
            minHeight: 'calc(100vh - 120px)',
            maxHeight: 'calc(100vh - 120px)',
            gap: 2,
          }}
        >
          {/* Left Advertisement Pane - 25% Scrollable */}
          <Box sx={{ gridArea: 'leftAd' }}>
            <Card 
              sx={{ 
                height: '100%',
                border: '1px solid #e0e0e0',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <CardContent sx={{ p: 2, backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ textAlign: 'center', mb: 0, fontWeight: 'bold' }}>
                  Special Deals
                </Typography>
              </CardContent>
              <Box sx={{ 
                flex: 1, 
                overflowY: 'auto',
                overflowX: 'hidden',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#c1c1c1',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#a8a8a8',
                }
              }}>
                <VerticalHotelAdvertisementBanner maxHotels={8} />
              </Box>
            </Card>
          </Box>

          {/* Main Content - 50% with Search Form */}
          <Box sx={{ gridArea: 'main' }}>
            <Card 
              sx={{ 
                height: '100%', 
                border: '1px solid #e0e0e0',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Header Section */}
              <CardContent sx={{ p: 3, backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', textAlign: 'center' }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  BookMyHotel
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Find Your Perfect Hotel
                </Typography>
              </CardContent>

              {/* Search Section */}
              <Box sx={{ flex: 1, p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ maxWidth: 500, margin: '0 auto', width: '100%' }}>
                  {/* Search Form */}
                  <Card 
                    sx={{ 
                      p: 4, 
                      mb: 4,
                      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                      color: 'white',
                      textAlign: 'center'
                    }}
                  >
                    <SearchIcon sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Search Hotels
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                      Find and book your perfect stay
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12}>
                        <Box
                          sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 1,
                            p: 2,
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            }
                          }}
                          onClick={() => navigate('/hotels/search')}
                        >
                          <Typography variant="body2" sx={{ opacity: 0.8, textAlign: 'left' }}>
                            Destination
                          </Typography>
                          <Typography variant="body1" sx={{ textAlign: 'left' }}>
                            Where would you like to stay?
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box
                          sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 1,
                            p: 2,
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            }
                          }}
                          onClick={() => navigate('/hotels/search')}
                        >
                          <Typography variant="body2" sx={{ opacity: 0.8, textAlign: 'left' }}>
                            Check-in
                          </Typography>
                          <Typography variant="body1" sx={{ textAlign: 'left' }}>
                            Select date
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box
                          sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 1,
                            p: 2,
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            }
                          }}
                          onClick={() => navigate('/hotels/search')}
                        >
                          <Typography variant="body2" sx={{ opacity: 0.8, textAlign: 'left' }}>
                            Check-out
                          </Typography>
                          <Typography variant="body1" sx={{ textAlign: 'left' }}>
                            Select date
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    
                    <Box
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        color: '#1976d2',
                        borderRadius: 2,
                        p: 2,
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'white',
                          transform: 'translateY(-1px)',
                        }
                      }}
                      onClick={() => navigate('/hotels/search')}
                    >
                      <SearchIcon sx={{ mr: 1, fontSize: 20 }} />
                      Search Hotels
                    </Box>
                  </Card>

                  {/* Booking Management */}
                  <Card 
                    sx={{ 
                      p: 3,
                      background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                      color: 'white',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 6,
                      }
                    }}
                    onClick={() => navigate('/find-booking')}
                  >
                    <HotelIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Already have a booking?
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      View or modify your reservations
                    </Typography>
                  </Card>
                </Box>
              </Box>
            </Card>
          </Box>

          {/* Right Advertisement Pane - 25% Scrollable */}
          <Box sx={{ gridArea: 'rightAd' }}>
            <Card 
              sx={{ 
                height: '100%',
                border: '1px solid #e0e0e0',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <CardContent sx={{ p: 2, backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ textAlign: 'center', mb: 0, fontWeight: 'bold' }}>
                  Featured Hotels
                </Typography>
              </CardContent>
              <Box sx={{ 
                flex: 1, 
                overflowY: 'auto',
                overflowX: 'hidden',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#c1c1c1',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#a8a8a8',
                }
              }}>
                <VerticalHotelAdvertisementBanner maxHotels={8} />
              </Box>
            </Card>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default HomePage;
