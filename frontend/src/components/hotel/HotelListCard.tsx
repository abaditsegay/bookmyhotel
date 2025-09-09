import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Box,
  Rating,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { HotelSearchResult } from '../../types/hotel';

interface HotelListCardProps {
  hotel: HotelSearchResult;
  onViewHotel: (hotelId: number) => void;
}

// Professional hotel images based on hotel name/location
const getHotelImage = (hotelName: string, city: string): string => {
  const cityImages = {
    'New York': 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=250&fit=crop&crop=center',
    'Miami': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=250&fit=crop&crop=center',
    'Los Angeles': 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=400&h=250&fit=crop&crop=center',
    'San Francisco': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=250&fit=crop&crop=center',
    'Chicago': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop&crop=center',
    'Philadelphia': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=250&fit=crop&crop=center',
    'Seattle': 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=250&fit=crop&crop=center',
    'San Diego': 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=250&fit=crop&crop=center',
    'Las Vegas': 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400&h=250&fit=crop&crop=center',
    'Boston': 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=400&h=250&fit=crop&crop=center',
  };
  return cityImages[city as keyof typeof cityImages] || cityImages['New York'];
};

const HotelListCard: React.FC<HotelListCardProps> = ({ hotel, onViewHotel }) => {
  // Determine if we should use room types or individual rooms
  const useRoomTypes = hotel.roomTypeAvailability && hotel.roomTypeAvailability.length > 0;
  
  const totalAvailableCount = useRoomTypes ? 
    hotel.roomTypeAvailability?.reduce((sum, rt) => sum + rt.availableCount, 0) || 0 :
    hotel.availableRooms?.length || 0;

  // Mock rating (in a real app, this would come from the backend)
  const hotelRating = 4.2 + (hotel.id % 10) / 10; // Generates ratings between 4.2-5.1

  // Get most popular room types for preview
  const getPopularRoomTypes = () => {
    if (useRoomTypes && hotel.roomTypeAvailability) {
      return hotel.roomTypeAvailability
        .filter(rt => rt.availableCount > 0)
        .slice(0, 3)
        .map(rt => rt.roomType)
        .join(', ');
    } else if (hotel.availableRooms) {
      const roomTypes = hotel.availableRooms.map(room => room.roomType);
      const uniqueTypes = Array.from(new Set(roomTypes));
      return uniqueTypes.slice(0, 3).join(', ');
    }
    return 'No rooms available';
  };

  return (
    <Card 
      elevation={2} 
      sx={{ 
        display: 'flex',
        height: '280px',
        mb: 2,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        },
        cursor: 'pointer',
      }}
      onClick={() => onViewHotel(hotel.id)}
    >
      {/* Hotel Image */}
      <CardMedia
        component="img"
        sx={{ width: 300, height: '100%', objectFit: 'cover' }}
        image={getHotelImage(hotel.name, hotel.city)}
        alt={hotel.name}
      />
      
      {/* Hotel Content */}
      <CardContent sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {hotel.name}
            </Typography>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>
                From ETB {hotel.minPrice?.toFixed(0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                per night
              </Typography>
            </Box>
          </Box>
          
          {/* Rating and Availability */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Rating value={hotelRating} precision={0.1} size="small" readOnly />
              <Typography variant="body2" sx={{ ml: 1, fontWeight: 'medium' }}>
                {hotelRating.toFixed(1)}
              </Typography>
            </Box>
            <Chip 
              label={`${totalAvailableCount} rooms available`} 
              color="success" 
              variant="outlined"
              size="small"
            />
          </Box>

          {/* Location */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {hotel.address}, {hotel.city}, {hotel.country}
            </Typography>
          </Box>
        </Box>

        {/* Description */}
        {hotel.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              display: '-webkit-box',
              '-webkit-line-clamp': 2,
              '-webkit-box-orient': 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {hotel.description}
          </Typography>
        )}

        {/* Room Types Preview */}
        <Box sx={{ mb: 2, flexGrow: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Available:</strong> {getPopularRoomTypes()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Price range:</strong> ETB {hotel.minPrice?.toFixed(0)} - ETB {hotel.maxPrice?.toFixed(0)} per night
          </Typography>
        </Box>

        {/* Contact Info & Action */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {hotel.phone && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {hotel.phone}
                </Typography>
              </Box>
            )}
            {hotel.email && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {hotel.email}
                </Typography>
              </Box>
            )}
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<ViewIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onViewHotel(hotel.id);
            }}
          >
            View Hotel
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default HotelListCard;
