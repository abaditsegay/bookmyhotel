import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Grid,
  Divider,
  Rating,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Hotel as HotelIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { HotelSearchResult } from '../../types/hotel';

interface HotelCardProps {
  hotel: HotelSearchResult;
  onViewDetails: (hotelId: number) => void;
  onBookRoom: (hotelId: number, roomId: number) => void;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel, onViewDetails, onBookRoom }) => {
  const hasAvailableRooms = hotel.availableRooms && hotel.availableRooms.length > 0;

  return (
    <Card 
      elevation={2} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Hotel Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <HotelIcon sx={{ mr: 1, mt: 0.5, color: 'primary.main' }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              {hotel.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {hotel.address}, {hotel.city}, {hotel.country}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Hotel Description */}
        {hotel.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {hotel.description}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Available Rooms */}
        {hasAvailableRooms ? (
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Available Rooms ({hotel.availableRooms.length})
            </Typography>
            <Grid container spacing={1} sx={{ mb: 2 }}>
              {hotel.availableRooms.slice(0, 3).map((room) => (
                <Grid item xs={12} key={room.id}>
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      border: 1, 
                      borderColor: 'divider', 
                      borderRadius: 1,
                      backgroundColor: 'grey.50',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          Room {room.roomNumber} - {room.roomType}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <PeopleIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            Up to {room.capacity} guests
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                          ${room.pricePerNight}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          per night
                        </Typography>
                      </Box>
                    </Box>
                    {room.description && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {room.description}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
            
            {hotel.availableRooms.length > 3 && (
              <Typography variant="caption" color="primary.main">
                +{hotel.availableRooms.length - 3} more rooms available
              </Typography>
            )}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body2" color="text.secondary">
              No rooms available for selected dates
            </Typography>
          </Box>
        )}

        {/* Price Range */}
        {hasAvailableRooms && hotel.minPrice && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MoneyIcon sx={{ fontSize: 18, mr: 0.5, color: 'success.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                ${hotel.minPrice} - ${hotel.maxPrice} per night
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Button 
              fullWidth 
              variant="outlined" 
              onClick={() => onViewDetails(hotel.id)}
              size="small"
            >
              View Details
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button 
              fullWidth 
              variant="contained" 
              disabled={!hasAvailableRooms}
              onClick={() => hasAvailableRooms && onBookRoom(hotel.id, hotel.availableRooms[0].id)}
              size="small"
            >
              {hasAvailableRooms ? 'Book Now' : 'Unavailable'}
            </Button>
          </Grid>
        </Grid>
      </CardActions>
    </Card>
  );
};

export default HotelCard;
