import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Box,
  Stack,
  useTheme,
  useMediaQuery,
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

// Professional room images based on room type
const getRoomImage = (roomType: string): string => {
  const images = {
    SINGLE: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=250&fit=crop&crop=center', // Modern single bedroom with workspace
    DOUBLE: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=250&fit=crop&crop=center', // Modern hotel room with two beds and desk area
    SUITE: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=250&fit=crop&crop=center', // Luxury suite with living area
    DELUXE: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=250&fit=crop&crop=center', // Deluxe room with premium finishes
    PRESIDENTIAL: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=400&h=250&fit=crop&crop=center', // Presidential suite with panoramic views
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down(400));

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
        height={isMobile ? "140" : "160"}
        image={getRoomImage(room.roomType)}
        alt={`${room.roomType} room`}
        sx={{ objectFit: 'cover' }}
      />
      
      <CardContent sx={{ p: isMobile ? 1.2 : 1.5 }}>
        {/* Mobile Layout - Stacked */}
        {isMobile ? (
          <Stack spacing={1.5}>
            <Box>
              <Typography 
                variant={isSmallMobile ? "body1" : "subtitle1"} 
                component="h3" 
                gutterBottom
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: isSmallMobile ? '0.95rem' : undefined,
                }}
              >
                Room {room.roomNumber}
              </Typography>
              <Chip 
                label={room.roomType} 
                color="primary" 
                variant="outlined" 
                size="small"
                sx={{ 
                  mb: 1, 
                  fontSize: isSmallMobile ? '0.65rem' : '0.7rem',
                  height: isSmallMobile ? '20px' : '24px',
                }}
              />
            </Box>
            <Box sx={{ 
              textAlign: 'center',
              p: 1.5,
              backgroundColor: 'primary.light',
              borderRadius: 1,
            }}>
              <Typography 
                variant="h6" 
                color="primary.main" 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: isSmallMobile ? '1rem' : '1.25rem',
                }}
              >
                ETB {room.pricePerNight?.toFixed(0)}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: isSmallMobile ? '0.7rem' : undefined }}
              >
                per night
              </Typography>
            </Box>
          </Stack>
        ) : (
          /* Desktop Layout - Side by Side */
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom>
                Room {room.roomNumber}
              </Typography>
              <Chip 
                label={room.roomType} 
                color="primary" 
                variant="outlined" 
                size="small"
                sx={{ mb: 1, fontSize: '0.7rem' }}
              />
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                ETB {room.pricePerNight?.toFixed(0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                per night
              </Typography>
            </Box>
          </Box>
        )}

        {/* Room Details - Mobile Responsive */}
        {isMobile ? (
          <Stack spacing={0.8} sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleIcon sx={{ fontSize: 14, mr: 0.8, color: 'text.secondary' }} />
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: isSmallMobile ? '0.7rem' : '0.75rem' }}
              >
                Up to {room.capacity} guests
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BedIcon sx={{ fontSize: 14, mr: 0.8, color: 'text.secondary' }} />
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: isSmallMobile ? '0.7rem' : '0.75rem' }}
              >
                {room.roomType === 'SINGLE' ? '1 bed' : 
                 room.roomType === 'DOUBLE' ? '2 beds' :
                 room.roomType === 'SUITE' ? 'Multiple rooms' :
                 room.roomType === 'DELUXE' ? 'King bed' :
                 'Luxury suite'}
              </Typography>
            </Box>
          </Stack>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PeopleIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              Up to {room.capacity} guests
            </Typography>
            <BedIcon sx={{ fontSize: 16, ml: 2, mr: 1, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {room.roomType === 'SINGLE' ? '1 bed' : 
               room.roomType === 'DOUBLE' ? '2 beds' :
               room.roomType === 'SUITE' ? 'Multiple rooms' :
               room.roomType === 'DELUXE' ? 'King bed' :
               'Luxury suite'}
            </Typography>
          </Box>
        )}

        {/* Description - Mobile Responsive */}
        {room.description && (
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ 
              mb: isMobile ? 1.2 : 1,
              fontSize: isMobile ? '0.7rem' : '0.75rem',
              lineHeight: 1.3,
            }}
          >
            {room.description}
          </Typography>
        )}

        {/* Amenities - Mobile Responsive */}
        <Box sx={{ mb: isMobile ? 1.2 : 1.5 }}>
          <Typography 
            variant="caption" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold', 
              fontSize: isMobile ? '0.7rem' : '0.75rem',
            }}
          >
            Room Amenities
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: isMobile ? 0.2 : 0.25,
          }}>
            {amenities.slice(0, isMobile ? 3 : amenities.length).map((amenity, index) => (
              <Chip 
                key={index} 
                label={amenity} 
                size="small" 
                variant="outlined"
                sx={{ 
                  fontSize: isMobile ? '0.6rem' : '0.65rem', 
                  height: isMobile ? 18 : 20,
                }}
              />
            ))}
            {isMobile && amenities.length > 3 && (
              <Chip 
                label={`+${amenities.length - 3} more`} 
                size="small" 
                variant="outlined"
                sx={{ 
                  fontSize: '0.6rem', 
                  height: 18,
                  color: 'primary.main',
                }}
              />
            )}
          </Box>
        </Box>

        {/* Book Buttons - Mobile Responsive */}
        <Box sx={{ mt: 'auto' }}>
          {isAuthenticated ? (
            // For authenticated users - show primary book button
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => onBookRoom(hotelId, room.id)}
              sx={{ 
                borderRadius: isMobile ? 1.5 : 2,
                textTransform: 'none',
                fontWeight: 'bold',
                mb: isMobile ? 0.5 : 1,
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                py: isMobile ? 0.8 : 1,
              }}
            >
              Book Now
            </Button>
          ) : (
            // For non-authenticated users - show both options
            <Stack spacing={isMobile ? 0.8 : 1}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => onBookRoom(hotelId, room.id)}
                sx={{ 
                  borderRadius: isMobile ? 1.5 : 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  fontSize: isMobile ? '0.8rem' : '0.875rem',
                  py: isMobile ? 0.8 : 1,
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
                  borderRadius: isMobile ? 1.5 : 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  fontSize: isMobile ? '0.75rem' : '0.8rem',
                  py: isMobile ? 0.6 : 0.8,
                }}
              >
                Book as Guest
              </Button>
            </Stack>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default RoomCard;
