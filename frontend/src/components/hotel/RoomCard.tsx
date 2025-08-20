import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Box,
} from '@mui/material';
import {
  People as PeopleIcon,
  Bed as BedIcon,
} from '@mui/icons-material';
import { AvailableRoom } from '../../types/hotel';
import { useAuth } from '../../contexts/AuthContext';

interface RoomCardProps {
  room: AvailableRoom;
  hotelId: number;
  onBookRoom: (hotelId: number, roomId: number, asGuest?: boolean) => void;
}

// Mock room images based on room type
const getRoomImage = (roomType: string): string => {
  const images = {
    SINGLE: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=250&fit=crop&crop=center',
    DOUBLE: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop&crop=center',
    SUITE: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=250&fit=crop&crop=center',
    DELUXE: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&h=250&fit=crop&crop=center',
    PRESIDENTIAL: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop&crop=center',
  };
  return images[roomType as keyof typeof images] || images.DOUBLE;
};

// Mock amenities based on room type
const getRoomAmenities = (roomType: string): string[] => {
  const baseAmenities = ['Free WiFi', 'Air Conditioning', 'Room Service'];
  const typeAmenities = {
    SINGLE: [...baseAmenities, 'Work Desk'],
    DOUBLE: [...baseAmenities, 'Mini Bar', 'Safe'],
    SUITE: [...baseAmenities, 'Living Area', 'Kitchenette', 'Balcony'],
    DELUXE: [...baseAmenities, 'Premium Bedding', 'City View', 'Mini Bar'],
    PRESIDENTIAL: [...baseAmenities, 'Butler Service', 'Private Terrace', 'Jacuzzi', 'Premium Amenities'],
  };
  return typeAmenities[roomType as keyof typeof typeAmenities] || baseAmenities;
};

const RoomCard: React.FC<RoomCardProps> = ({ room, hotelId, onBookRoom }) => {
  const amenities = getRoomAmenities(room.roomType);
  const { isAuthenticated } = useAuth();

  return (
    <Card 
      elevation={1} 
      sx={{ 
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={getRoomImage(room.roomType)}
        alt={`${room.roomType} room`}
        sx={{ objectFit: 'cover' }}
      />
      
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" component="h3" gutterBottom>
              Room {room.roomNumber}
            </Typography>
            <Chip 
              label={room.roomType} 
              color="primary" 
              variant="outlined" 
              size="small"
              sx={{ mb: 1 }}
            />
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h5" color="primary.main" sx={{ fontWeight: 'bold' }}>
              ${room.pricePerNight}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              per night
            </Typography>
          </Box>
        </Box>

        {/* Room Details */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PeopleIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            Up to {room.capacity} guests
          </Typography>
          <BedIcon sx={{ fontSize: 18, ml: 2, mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {room.roomType === 'SINGLE' ? '1 bed' : 
             room.roomType === 'DOUBLE' ? '2 beds' :
             room.roomType === 'SUITE' ? 'Multiple rooms' :
             room.roomType === 'DELUXE' ? 'King bed' :
             'Luxury suite'}
          </Typography>
        </Box>

        {/* Description */}
        {room.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {room.description}
          </Typography>
        )}

        {/* Amenities */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
            Room Amenities
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {amenities.slice(0, 4).map((amenity, index) => (
              <Chip 
                key={index} 
                label={amenity} 
                size="small" 
                variant="outlined"
                sx={{ fontSize: '0.75rem', height: 24 }}
              />
            ))}
            {amenities.length > 4 && (
              <Chip 
                label={`+${amenities.length - 4} more`} 
                size="small" 
                variant="filled"
                color="secondary"
                sx={{ fontSize: '0.75rem', height: 24 }}
              />
            )}
          </Box>
        </Box>

        {/* Book Buttons */}
        <Box sx={{ mt: 'auto' }}>
          {isAuthenticated ? (
            // For authenticated users - show primary book button
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => onBookRoom(hotelId, room.id)}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'bold',
                mb: 1,
              }}
            >
              Book Now
            </Button>
          ) : (
            // For non-authenticated users - show both options
            <>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => onBookRoom(hotelId, room.id)}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  mb: 1,
                }}
              >
                Sign in to Book
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={() => onBookRoom(hotelId, room.id, true)} // true indicates guest booking
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                }}
              >
                Book as Guest
              </Button>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default RoomCard;
