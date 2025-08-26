import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Hotel as HotelIcon,
  Search as SearchIcon,
  AccountCircle as AccountIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import VerticalHotelAdvertisementBanner from '../components/VerticalHotelAdvertisementBanner';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated } = useAuth();

  const mainContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          py: 6,
          px: 4,
          borderRadius: 2,
          textAlign: 'center',
          mb: 4,
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          BookMyHotel
        </Typography>
        <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
          Your Gateway to Amazing Hotel Experiences
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            startIcon={<SearchIcon />}
            onClick={() => navigate('/hotels/search')}
            sx={{ px: 3, py: 1.5, borderRadius: 2 }}
          >
            Search Hotels
          </Button>
          
          {!isAuthenticated ? (
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              startIcon={<AccountIcon />}
              onClick={() => navigate('/login')}
              sx={{ 
                px: 3, 
                py: 1.5, 
                borderRadius: 2,
                borderColor: 'rgba(255, 255, 255, 0.5)',
                '&:hover': { 
                  borderColor: 'white', 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)' 
                }
              }}
            >
              Sign In
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              onClick={() => navigate('/my-bookings')}
              sx={{ 
                px: 3, 
                py: 1.5, 
                borderRadius: 2,
                borderColor: 'rgba(255, 255, 255, 0.5)',
                '&:hover': { 
                  borderColor: 'white', 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)' 
                }
              }}
            >
              My Bookings
            </Button>
          )}
        </Box>
      </Box>

      {/* Quick Actions Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card 
            sx={{ 
              textAlign: 'center', 
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 3,
              }
            }}
            onClick={() => navigate('/hotels/search')}
          >
            <CardContent>
              <SearchIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Find Hotels
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Search and compare hotels worldwide
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card 
            sx={{ 
              textAlign: 'center', 
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 3,
              }
            }}
            onClick={() => navigate('/find-booking')}
          >
            <CardContent>
              <HotelIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Manage Booking
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View or modify your reservations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card 
            sx={{ 
              textAlign: 'center', 
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 3,
              }
            }}
            onClick={() => navigate('/register-hotel-admin')}
          >
            <CardContent>
              <AccountIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Hotel Partners
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Register your hotel with us
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Welcome Message */}
      {isAuthenticated && user && (
        <Card sx={{ mb: 4, background: 'linear-gradient(45deg, #f5f5f5 0%, #ffffff 100%)' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Welcome back, {user.firstName || user.email || 'valued guest'}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Ready to plan your next adventure? Explore our featured hotels and exclusive deals.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Features Section */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
          Why Choose BookMyHotel?
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                ✓
              </Box>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Best Price Guarantee
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We offer competitive rates and price matching to ensure you get the best deal.
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                ✓
              </Box>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Instant Confirmation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Get immediate booking confirmation and manage your reservations online.
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                ✓
              </Box>
              <Box>
                <Typography variant="h6" gutterBottom>
                  24/7 Support
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Our customer service team is available around the clock to assist you.
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                ✓
              </Box>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Secure Booking
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your personal and payment information is protected with enterprise-grade security.
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {isMobile ? (
        // Mobile Layout: Stack vertically
        <Box>
          {/* Main Content */}
          <Card sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
            <CardContent sx={{ p: 3 }}>
              {mainContent}
            </CardContent>
          </Card>
          
          {/* Sidebar Advertisement */}
          <Card sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
            <VerticalHotelAdvertisementBanner maxHotels={3} />
          </Card>
        </Box>
      ) : (
        // Desktop Layout: Grid as per your design
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 300px', // Main content + Right sidebar
            gridTemplateRows: '1fr', // Main area only
            gridTemplateAreas: `
              "main sidebar"
            `,
            minHeight: 'calc(100vh - 200px)',
            gap: 2,
          }}
        >
          {/* Main Content */}
          <Box sx={{ gridArea: 'main' }}>
            <Card 
              sx={{ 
                height: '100%', 
                border: '1px solid #e0e0e0',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <CardContent sx={{ p: 3, flex: 1 }}>
                {mainContent}
              </CardContent>
            </Card>
          </Box>

          {/* Sidebar Advertisement */}
          <Box sx={{ gridArea: 'sidebar' }}>
            <Card 
              sx={{ 
                height: '100%',
                border: '1px solid #e0e0e0',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <VerticalHotelAdvertisementBanner maxHotels={4} />
            </Card>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default HomePage;
