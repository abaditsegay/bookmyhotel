import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Box,
  Badge,
} from '@mui/material';
import {
  People as PeopleIcon,
  Bed as BedIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { RoomTypeAvailability } from '../../types/hotel';
import { useAuth } from '../../contexts/AuthContext';

interface RoomTypeCardProps {
  roomType: RoomTypeAvailability;
  hotelId: number;
  onBookRoomType: (hotelId: number, roomType: string, asGuest?: boolean) => void;
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

// Format room type display name
const formatRoomTypeName = (roomType: string): string => {
  const formatted = roomType.replace(/_/g, ' ').toLowerCase();
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const RoomTypeCard: React.FC<RoomTypeCardProps> = ({ roomType, hotelId, onBookRoomType }) => {
  const amenities = getRoomAmenities(roomType.roomType);
  const { isAuthenticated } = useAuth();
  const isAvailable = roomType.availableCount > 0;

  return (
    <Card 
      elevation={1} 
      sx={{ 
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        opacity: isAvailable ? 1 : 0.7,
        '&:hover': {
          transform: isAvailable ? 'translateY(-2px)' : 'none',
          boxShadow: isAvailable ? 3 : 1,
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={getRoomImage(roomType.roomType)}
          alt={`${roomType.roomType} room`}
          sx={{ objectFit: 'cover' }}
        />
        {isAvailable && (
          <Badge
            badgeContent={
              <Box sx={{ display: 'flex', alignItems: 'center', px: 1 }}>
                <CheckCircleIcon sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                  {roomType.availableCount} Available
                </Typography>
              </Box>
            }
            color="success"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              '& .MuiBadge-badge': {
                backgroundColor: 'success.main',
                color: 'white',
                borderRadius: 1,
                height: 'auto',
                padding: '4px 8px',
              }
            }}
          />
        )}
        {!isAvailable && (
          <Chip
            label="Fully Booked"
            color="error"
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              fontWeight: 'bold',
            }}
          />
        )}
      </Box>
      
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" component="h3" gutterBottom>
              {formatRoomTypeName(roomType.roomType)}
            </Typography>
            <Chip 
              label={roomType.roomType} 
              color="primary" 
              variant="outlined" 
              size="small"
              sx={{ mb: 1 }}
            />
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h5" color="primary.main" sx={{ fontWeight: 'bold' }}>
              ${roomType.pricePerNight}
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
            Up to {roomType.capacity} guests
          </Typography>
          <BedIcon sx={{ fontSize: 18, ml: 2, mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {roomType.roomType === 'SINGLE' ? '1 bed' : 
             roomType.roomType === 'DOUBLE' ? '2 beds' :
             roomType.roomType === 'SUITE' ? 'Multiple rooms' :
             roomType.roomType === 'DELUXE' ? 'King bed' :
             'Luxury suite'}
          </Typography>
        </Box>

        {/* Availability Message */}
        <Box sx={{ mb: 2 }}>
          <Typography 
            variant="body2" 
            color={isAvailable ? "success.main" : "error.main"} 
            sx={{ fontWeight: 'medium' }}
          >
            {roomType.displayMessage}
          </Typography>
        </Box>

        {/* Description */}
        {roomType.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {roomType.description}
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
          {isAvailable ? (
            isAuthenticated ? (
              // For authenticated users - show primary book button
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => onBookRoomType(hotelId, roomType.roomType)}
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
                  onClick={() => onBookRoomType(hotelId, roomType.roomType)}
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
                  onClick={() => onBookRoomType(hotelId, roomType.roomType, true)} // true indicates guest booking
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 'bold',
                  }}
                >
                  Book as Guest
                </Button>
              </>
            )
          ) : (
            <Button
              fullWidth
              variant="outlined"
              disabled
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'bold',
              }}
            >
              Not Available
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default RoomTypeCard;
