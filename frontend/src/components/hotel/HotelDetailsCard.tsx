import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Box,
  Grid,
  Divider,
  Collapse,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { HotelSearchResult } from '../../types/hotel';
import RoomCard from './RoomCard';

interface HotelDetailsCardProps {
  hotel: HotelSearchResult;
  onBookRoom: (hotelId: number, roomId: number) => void;
  defaultExpanded?: boolean;
}

// Mock hotel images based on hotel name/location
const getHotelImage = (hotelName: string, city: string): string => {
  const cityImages = {
    'New York': 'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=800&h=400&fit=crop&crop=center',
    'Miami': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&crop=center',
    'Los Angeles': 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&h=400&fit=crop&crop=center',
    'San Francisco': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=400&fit=crop&crop=center',
    'Chicago': 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&h=400&fit=crop&crop=center',
    'Philadelphia': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=400&fit=crop&crop=center',
    'Seattle': 'https://images.unsplash.com/photo-1541697549-39ecbf2e7067?w=800&h=400&fit=crop&crop=center',
  };
  return cityImages[city as keyof typeof cityImages] || cityImages['New York'];
};

const HotelDetailsCard: React.FC<HotelDetailsCardProps> = ({ 
  hotel, 
  onBookRoom, 
  defaultExpanded = false 
}) => {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const hasAvailableRooms = hotel.availableRooms && hotel.availableRooms.length > 0;

  // Mock rating (in a real app, this would come from the backend)
  const hotelRating = 4.2 + (hotel.id % 10) / 10; // Generates ratings between 4.2-5.1

  return (
    <Card 
      elevation={3} 
      sx={{ 
        mb: 3,
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Hotel Header with Image */}
      <CardMedia
        component="img"
        height="300"
        image={getHotelImage(hotel.name, hotel.city)}
        alt={hotel.name}
        sx={{ objectFit: 'cover' }}
      />
      
      <CardContent sx={{ p: 3 }}>
        {/* Hotel Info Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {hotel.name}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                  {[...Array(5)].map((_, i) => (
                    <StarIcon 
                      key={i} 
                      sx={{ 
                        fontSize: 18,
                        color: i < Math.floor(hotelRating) ? 'warning.main' : 'grey.300' 
                      }} 
                    />
                  ))}
                  <Typography variant="body2" sx={{ ml: 1, fontWeight: 'medium' }}>
                    {hotelRating.toFixed(1)}
                  </Typography>
                </Box>
                <Chip 
                  label={`${hotel.availableRooms.length} rooms available`} 
                  color="success" 
                  variant="outlined"
                  size="small"
                />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1" color="text.secondary">
                  {hotel.address}, {hotel.city}, {hotel.country}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ textAlign: 'right', ml: 2 }}>
              <Typography variant="h5" color="success.main" sx={{ fontWeight: 'bold' }}>
                From ${hotel.minPrice}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                per night
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Up to ${hotel.maxPrice}
              </Typography>
            </Box>
          </Box>

          {/* Hotel Description */}
          {hotel.description && (
            <Typography variant="body1" color="text.secondary" paragraph>
              {hotel.description}
            </Typography>
          )}

          {/* Contact Info */}
          <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
            {hotel.phone && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {hotel.phone}
                </Typography>
              </Box>
            )}
            {hotel.email && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {hotel.email}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Rooms Section Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Available Rooms ({hotel.availableRooms.length})
          </Typography>
          <Button
            onClick={() => setExpanded(!expanded)}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            variant="outlined"
            size="small"
          >
            {expanded ? 'Hide Rooms' : 'Show All Rooms'}
          </Button>
        </Box>

        {/* Quick Room Preview (always visible) */}
        {hasAvailableRooms && !expanded && (
          <Box sx={{ mb: 2 }}>
            <Grid container spacing={2}>
              {hotel.availableRooms.slice(0, 2).map((room) => (
                <Grid item xs={12} sm={6} key={room.id}>
                  <RoomCard
                    room={room}
                    hotelId={hotel.id}
                    onBookRoom={onBookRoom}
                  />
                </Grid>
              ))}
            </Grid>
            {hotel.availableRooms.length > 2 && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button
                  variant="text"
                  onClick={() => setExpanded(true)}
                  color="primary"
                >
                  View {hotel.availableRooms.length - 2} more rooms
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Expandable Room Details */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {hotel.availableRooms.map((room) => (
                <Grid item xs={12} sm={6} md={4} key={room.id}>
                  <RoomCard
                    room={room}
                    hotelId={hotel.id}
                    onBookRoom={onBookRoom}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Collapse>

        {/* No Rooms Available */}
        {!hasAvailableRooms && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No rooms available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search dates or criteria
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default HotelDetailsCard;
