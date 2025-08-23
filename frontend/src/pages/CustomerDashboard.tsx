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
  Restaurant,
  MusicNote,
  Place,
  Star,
  TrendingUp,
  FlightTakeoff,
  LocalActivity,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * Dashboard page for customer users
 * Shows travel destinations, hotels, restaurants, concerts and places to visit
 */
export const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Featured destinations
  const featuredDestinations = [
    {
      id: 1,
      name: 'New York City',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop',
      description: 'The city that never sleeps',
      hotels: '1,200+ hotels',
      rating: 4.5,
      startingPrice: '$149'
    },
    {
      id: 2,
      name: 'Paris, France',
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop',
      description: 'City of lights and romance',
      hotels: '800+ hotels',
      rating: 4.7,
      startingPrice: '$89'
    },
    {
      id: 3,
      name: 'Tokyo, Japan',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
      description: 'Modern culture meets tradition',
      hotels: '600+ hotels',
      rating: 4.6,
      startingPrice: '$112'
    },
    {
      id: 4,
      name: 'London, England',
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop',
      description: 'Rich history and royal heritage',
      hotels: '900+ hotels',
      rating: 4.4,
      startingPrice: '$95'
    }
  ];

  // Popular hotel types
  const hotelTypes = [
    {
      type: 'Luxury Hotels',
      icon: <Hotel sx={{ fontSize: 40, color: 'primary.main' }} />,
      description: 'Premium accommodations with world-class amenities',
      count: '2,500+ properties'
    },
    {
      type: 'Business Hotels',
      icon: <FlightTakeoff sx={{ fontSize: 40, color: 'info.main' }} />,
      description: 'Perfect for business travelers and conferences',
      count: '1,800+ properties'
    },
    {
      type: 'Boutique Hotels',
      icon: <Star sx={{ fontSize: 40, color: 'warning.main' }} />,
      description: 'Unique character and personalized service',
      count: '1,200+ properties'
    },
    {
      type: 'Resort Hotels',
      icon: <LocalActivity sx={{ fontSize: 40, color: 'success.main' }} />,
      description: 'All-inclusive vacation experiences',
      count: '900+ properties'
    }
  ];

  // Featured experiences
  const featuredExperiences = [
    {
      category: 'Dining',
      icon: <Restaurant />,
      title: 'Michelin Star Restaurants',
      description: 'Discover world-renowned dining experiences in your destination',
      color: 'secondary'
    },
    {
      category: 'Entertainment',
      icon: <MusicNote />,
      title: 'Concerts & Shows',
      description: 'Book tickets to the hottest concerts, theaters, and live performances',
      color: 'info'
    },
    {
      category: 'Attractions',
      icon: <Place />,
      title: 'Tourist Attractions',
      description: 'Explore must-see landmarks, museums, and cultural sites',
      color: 'warning'
    },
    {
      category: 'Activities',
      icon: <TrendingUp />,
      title: 'Local Experiences',
      description: 'Unique activities and tours curated by local experts',
      color: 'success'
    }
  ];

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
                  <Star color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary="Check Hotel Reviews"
                  secondary="Read recent guest reviews to ensure your stay meets expectations"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Place color="info" />
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
                  <Restaurant color="secondary" />
                </ListItemIcon>
                <ListItemText
                  primary="Try Local Cuisine"
                  secondary="Explore authentic local restaurants recommended by your hotel"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <MusicNote color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Book Entertainment Early"
                  secondary="Popular shows and concerts sell out quickly, especially in peak season"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <FlightTakeoff color="primary" />
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
