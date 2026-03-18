import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Rating,
} from '@mui/material';
import {
  Hotel,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * Dashboard page for customer users
 * Shows travel destinations, hotels, restaurants, concerts and places to visit
 */
export const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Featured destinations - dynamic data populated from API
  const [featuredDestinations, setFeaturedDestinations] = React.useState<any[]>([]);
  
  // Load featured destinations from API or use empty array if not available
  React.useEffect(() => {
    // TODO: Replace with actual API call to get featured destinations
    // For now, keep empty to avoid hardcoded data
    setFeaturedDestinations([]);
  }, []);

  // Popular hotel types - dynamic data
  const [hotelTypes, setHotelTypes] = React.useState<any[]>([]);
  
  // Load hotel types from API or configuration
  React.useEffect(() => {
    // TODO: Replace with actual API call to get hotel types and their counts
    // For now, keep empty to avoid hardcoded data
    setHotelTypes([]);
  }, []);

  // Featured experiences - dynamic data
  const [featuredExperiences, setFeaturedExperiences] = React.useState<any[]>([]);
  
  // Load featured experiences from API or configuration
  React.useEffect(() => {
    // TODO: Replace with actual API call to get featured experiences
    // For now, keep empty to avoid hardcoded data
    setFeaturedExperiences([]);
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Welcome Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Welcome to BookMyHotel
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Discover amazing destinations, book extraordinary hotels, and create unforgettable memories
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/hotels/search')}
          sx={{ px: 4, py: 1.5, fontSize: '1.1rem', borderRadius: 3 }}
        >
          Start Your Journey
        </Button>
      </Box>

      {/* Featured Destinations */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Featured Destinations
        </Typography>
        <Grid container spacing={3}>
          {featuredDestinations.map((destination) => (
            <Grid item xs={12} sm={6} md={3} key={destination.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  }
                }}
                onClick={() => navigate('/hotels/search', { state: { destination: destination.name } })}
              >
                <Box
                  sx={{
                    height: 200,
                    backgroundImage: `url(${destination.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}
                >
                  <Chip
                    label={destination.startingPrice}
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {destination.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {destination.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      {destination.hotels}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating value={destination.rating} readOnly size="small" precision={0.1} />
                      <Typography variant="caption" sx={{ ml: 0.5 }}>
                        {destination.rating}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Hotel Types */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Explore Hotel Categories
        </Typography>
        <Grid container spacing={3}>
          {hotelTypes.map((hotel, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
                onClick={() => navigate('/hotels/search', { state: { category: hotel.type } })}
              >
                <Box sx={{ mb: 2 }}>
                  {hotel.icon}
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {hotel.type}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {hotel.description}
                </Typography>
                <Typography variant="caption" color="primary.main" sx={{ fontWeight: 'bold' }}>
                  {hotel.count}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Featured Experiences */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Complete Your Experience
        </Typography>
        <Grid container spacing={3}>
          {featuredExperiences.map((experience, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      bgcolor: `${experience.color}.light`,
                      color: `${experience.color}.contrastText`
                    }}
                  >
                    {React.cloneElement(experience.icon, { sx: { fontSize: 28 } })}
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {experience.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {experience.description}
                  </Typography>
                  <Button
                    variant="outlined"
                    color={experience.color as any}
                    size="small"
                    sx={{ mt: 2 }}
                  >
                    Explore {experience.category}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Travel Tips */}
      <Paper sx={{ p: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Travel Tips & Recommendations
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Hotel color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Book Early for Best Deals"
                  secondary="Reserve your hotel 2-3 months in advance for significant savings"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Hotel color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary="Check Hotel Reviews"
                  secondary="Read recent guest reviews to ensure your stay meets expectations"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Hotel color="info" />
                </ListItemIcon>
                <ListItemText
                  primary="Location Matters"
                  secondary="Choose hotels near attractions or public transport for convenience"
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Hotel color="secondary" />
                </ListItemIcon>
                <ListItemText
                  primary="Try Local Cuisine"
                  secondary="Explore authentic local restaurants recommended by your hotel"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Hotel color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Book Entertainment Early"
                  secondary="Popular shows and concerts sell out quickly, especially in peak season"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Hotel color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Plan Your Activities"
                  secondary="Research and book tours and activities in advance for better prices"
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};
