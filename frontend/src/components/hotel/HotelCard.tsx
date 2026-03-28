import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Typography,
  Button,
  Box,
  Grid,
  Divider,
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
  onBookRoom: (hotelId: number, roomId: number, asGuest?: boolean) => void;
}

// Get hotel image - uses uploaded S3 images if available, otherwise fallback to city-based defaults
const getHotelImage = (hotel: HotelSearchResult): string => {
  // Use uploaded hotel hero image if available
  if (hotel.heroImageUrl) {
    return hotel.heroImageUrl;
  }

  // Fallback to city-based default images if no uploaded images are available
  const cityImages = {
    'New York': 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=200&fit=crop&crop=center', // Luxury NYC hotel exterior
    'Miami': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=200&fit=crop&crop=center', // Modern Miami beachfront hotel
    'Los Angeles': 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=400&h=200&fit=crop&crop=center', // Elegant LA hotel facade
    'San Francisco': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=200&fit=crop&crop=center', // Victorian SF hotel
    'Chicago': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=200&fit=crop&crop=center', // Modern Chicago hotel
    'Philadelphia': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=200&fit=crop&crop=center', // Historic Philadelphia hotel
    'Seattle': 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=200&fit=crop&crop=center', // Seattle waterfront hotel
    'San Diego': 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=200&fit=crop&crop=center', // San Diego resort hotel
    'Las Vegas': 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400&h=200&fit=crop&crop=center', // Vegas luxury hotel
    'Boston': 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=400&h=200&fit=crop&crop=center', // Historic Boston hotel
    // Default fallback for Addis Ababa and other cities
    'Addis Ababa': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=200&fit=crop&crop=center',
  };
  
  return cityImages[hotel.city as keyof typeof cityImages] || cityImages['New York'];
};

const HotelCard: React.FC<HotelCardProps> = ({ hotel, onViewDetails, onBookRoom }) => {
  const { t } = useTranslation();
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
      {/* Hotel Image */}
      <CardMedia
        component="img"
        height="200"
        image={getHotelImage(hotel)}
        alt={hotel.name}
        sx={{
          objectFit: 'cover',
        }}
      />
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
              {t('hotelSearch.hotelCard.availableRoomsCount', { count: hotel.availableRooms.length })}
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
                          {t('hotelSearch.roomCard.roomNumber', { roomNumber: room.roomNumber })} - {t(`hotelSearch.roomTypes.${room.roomType.toLowerCase()}`)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <PeopleIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {t('hotelSearch.roomCard.upToGuests', { count: room.capacity })}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                          ${room.pricePerNight}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('hotelSearch.detail.perNight')}
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
                {t('hotelSearch.hotelCard.moreRoomsAvailable', { count: hotel.availableRooms.length - 3 })}
              </Typography>
            )}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {t('hotelSearch.hotelCard.noRoomsAvailableForDates')}
            </Typography>
          </Box>
        )}

        {/* Price Range */}
        {hasAvailableRooms && hotel.minPrice && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MoneyIcon sx={{ fontSize: 18, mr: 0.5, color: 'success.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                ${hotel.minPrice} - ${hotel.maxPrice} {t('hotelSearch.detail.perNight')}
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
              {t('hotelBanner.viewDetails')}
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button 
              fullWidth 
              variant="contained" 
              disabled={!hasAvailableRooms}
              onClick={() => hasAvailableRooms && onBookRoom(hotel.id, hotel.availableRooms[0].id, false)}
              size="small"
            >
              {hasAvailableRooms ? t('hotelSearch.roomCard.bookNow') : t('hotelSearch.hotelCard.unavailable')}
            </Button>
          </Grid>
        </Grid>
      </CardActions>
    </Card>
  );
};

export default HotelCard;
