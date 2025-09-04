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
import performanceUtils from '../utils/performanceUtils';

const HomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const enableAnimations = !performanceUtils.isSlowConnection();

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {isMobile ? (
        // Mobile Layout: Stack vertically
        <Box>
          {/* Main Content */}
          <Card sx={{ mb: 3, border: 1, borderColor: 'divider' }}>
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
                      ...performanceUtils.getAnimationStyles(enableAnimations),
                      background: (theme) => theme.custom.constants.gradients.primaryButton,
                      color: 'white',
                      ...performanceUtils.getHoverStyles(enableAnimations),
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
                      ...performanceUtils.getAnimationStyles(enableAnimations),
                      background: (theme) => theme.custom.constants.gradients.successButton,
                      color: 'white',
                      ...performanceUtils.getHoverStyles(enableAnimations),
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
          <Card sx={{ mb: 3, border: 1, borderColor: 'divider' }}>
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
                border: 1,
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <CardContent sx={{ p: 2, backgroundColor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ textAlign: 'center', mb: 0, fontWeight: 'bold' }}>
                  Special Deals
                </Typography>
              </CardContent>
              <Box sx={{ 
                flex: 1, 
                overflowY: 'auto',
                overflowX: 'hidden',
                '&::-webkit-scrollbar': {
                  width: (theme) => theme.custom.constants.scrollbar.width,
                },
                '&::-webkit-scrollbar-track': {
                  background: (theme) => theme.custom.constants.scrollbar.track,
                },
                '&::-webkit-scrollbar-thumb': {
                  background: (theme) => theme.custom.constants.scrollbar.thumb,
                  borderRadius: (theme) => theme.custom.constants.scrollbar.thumbRadius,
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: (theme) => theme.custom.constants.scrollbar.thumbHover,
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
                border: 1,
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Header Section */}
              <CardContent sx={{ p: 3, backgroundColor: 'grey.50', borderBottom: 1, borderColor: 'divider', textAlign: 'center' }}>
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
                      background: (theme) => theme.custom.constants.gradients.primaryButton,
                      color: 'white',
                      textAlign: 'center'
                    }}
                  >
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
                            backgroundColor: (theme) => `rgba(255, 255, 255, ${theme.custom.constants.alpha.low})`,
                            borderRadius: 1,
                            p: 2,
                            border: (theme) => `1px solid rgba(255, 255, 255, ${theme.custom.constants.alpha.high})`,
                            cursor: 'pointer',
                            ...performanceUtils.getAnimationStyles(enableAnimations),
                            ...(enableAnimations && !performanceUtils.isSlowConnection() ? {
                              '&:hover': {
                                backgroundColor: (theme) => `rgba(255, 255, 255, ${theme.custom.constants.alpha.medium})`,
                              }
                            } : {})
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
                            ...performanceUtils.getAnimationStyles(enableAnimations),
                            ...(enableAnimations && !performanceUtils.isSlowConnection() ? {
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                              }
                            } : {})
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
                            ...performanceUtils.getAnimationStyles(enableAnimations),
                            ...(enableAnimations && !performanceUtils.isSlowConnection() ? {
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                              }
                            } : {})
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
                        color: 'primary.main',
                        borderRadius: 2,
                        p: 2,
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        ...performanceUtils.getAnimationStyles(enableAnimations),
                        ...(enableAnimations && !performanceUtils.isSlowConnection() ? {
                          '&:hover': {
                            backgroundColor: 'white',
                            transform: 'translateY(-1px)',
                          }
                        } : {})
                      }}
                      onClick={() => navigate('/hotels/search')}
                    >
                      Search Hotels
                    </Box>
                  </Card>

                  {/* Booking Management */}
                  <Card 
                    sx={{ 
                      p: 3,
                      background: (theme) => theme.custom.constants.gradients.successButton,
                      color: 'white',
                      textAlign: 'center',
                      cursor: 'pointer',
                      ...performanceUtils.getAnimationStyles(enableAnimations),
                      ...performanceUtils.getHoverStyles(enableAnimations),
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
                border: 1,
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <CardContent sx={{ p: 2, backgroundColor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ textAlign: 'center', mb: 0, fontWeight: 'bold' }}>
                  Featured Hotels
                </Typography>
              </CardContent>
              <Box sx={{ 
                flex: 1, 
                overflowY: 'auto',
                overflowX: 'hidden',
                '&::-webkit-scrollbar': {
                  width: (theme) => theme.custom.constants.scrollbar.width,
                },
                '&::-webkit-scrollbar-track': {
                  background: (theme) => theme.custom.constants.scrollbar.track,
                },
                '&::-webkit-scrollbar-thumb': {
                  background: (theme) => theme.custom.constants.scrollbar.thumb,
                  borderRadius: (theme) => theme.custom.constants.scrollbar.thumbRadius,
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: (theme) => theme.custom.constants.scrollbar.thumbHover,
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
