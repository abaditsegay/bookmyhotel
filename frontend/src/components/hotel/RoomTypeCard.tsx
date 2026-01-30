import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  People as PeopleIcon,
  Bed as BedIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { RoomTypeAvailability } from '../../types/hotel';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../theme/themeColors';
import { getRoomBedInfo } from '../../constants/roomTypes';

interface RoomTypeCardProps {
  roomType: RoomTypeAvailability;
  hotelId: number;
  onBookRoomType: (hotelId: number, roomType: string, asGuest?: boolean) => void;
}

// Professional room images based on room type (fallback images)
const getFallbackRoomImage = (roomType: string): string => {
  const images = {
    SINGLE: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=250&fit=crop&crop=center', // Modern single bedroom with workspace
    DOUBLE: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=250&fit=crop&crop=center', // Modern hotel room with two beds and desk area
    SUITE: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=250&fit=crop&crop=center', // Luxury suite with living area
    DELUXE: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=250&fit=crop&crop=center', // Deluxe room with premium finishes
    PRESIDENTIAL: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=400&h=250&fit=crop&crop=center', // Presidential suite with panoramic views
  };
  return images[roomType as keyof typeof images] || images.DOUBLE;
};

// Get room image - use S3 image if available, otherwise fallback to hardcoded images
const getRoomImage = (roomType: RoomTypeAvailability): string => {
  // Use S3 image if available
  if (roomType.imageUrl) {
    return roomType.imageUrl;
  }
  // Fallback to hardcoded images
  return getFallbackRoomImage(roomType.roomType);
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isAvailable = roomType.availableCount > 0;

  return (
    <Card 
      sx={{ 
        height: '100%',
        background: isAvailable 
          ? '#ffffff'
          : theme.palette.action.disabledBackground,
        border: isAvailable ? '2px solid #E8B86D' : `1px solid ${theme.palette.action.disabled}`,
        borderRadius: 2,
        boxShadow: isAvailable ? '0 4px 12px rgba(232, 184, 109, 0.15)' : theme.shadows[1],
        transition: 'all 0.3s ease-in-out',
        opacity: isAvailable ? 1 : 0.7,
        '&:hover': {
          transform: isAvailable ? 'translateY(-8px)' : 'none',
          boxShadow: isAvailable ? '0 8px 20px rgba(232, 184, 109, 0.25)' : theme.shadows[1],
          borderColor: isAvailable ? '#d4a45a' : theme.palette.action.disabled,
        },
      }}
    >
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          height={isMobile ? "240" : "300"}
          image={getRoomImage(roomType)}
          alt={`${roomType.roomType} room`}
          sx={{ 
            objectFit: 'cover',
            transition: 'transform 0.4s ease-in-out',
            '&:hover': {
              transform: isAvailable ? 'scale(1.08)' : 'none',
            }
          }}
        />
        {/* Professional overlay gradient */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(180deg, transparent 0%, transparent 60%, ${theme.palette.action.disabled} 100%)`,
            pointerEvents: 'none',
          }}
        />
        {isAvailable && (
          <Box
            sx={{
              position: 'absolute',
              top: isMobile ? 8 : 12,
              right: isMobile ? 8 : 12,
              background: theme.palette.success.main,
              color: 'white',
              borderRadius: 2,
              padding: isMobile ? '6px 8px' : '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? 0.5 : 0.75,
              zIndex: 2,
              fontSize: isMobile ? '0.7rem' : '0.8rem',
              fontWeight: 700,
              boxShadow: theme.shadows[3],
              border: `1px solid ${COLORS.CARD_BORDER}`,
            }}
          >
            <CheckCircleIcon sx={{ 
              fontSize: isMobile ? 14 : 16, 
            }} />
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 700,
                fontSize: isMobile ? '0.7rem' : '0.8rem',
                color: 'inherit',
                lineHeight: 1,
              }}
            >
              {roomType.availableCount} Available
            </Typography>
          </Box>
        )}
        {!isAvailable && (
          <Box
            sx={{
              position: 'absolute',
              top: isMobile ? 8 : 12,
              right: isMobile ? 8 : 12,
              background: theme.palette.error.main,
              color: 'white',
              borderRadius: 2,
              padding: isMobile ? '6px 8px' : '8px 12px',
              zIndex: 2,
              fontWeight: 700,
              boxShadow: theme.shadows[3],
              border: `1px solid ${COLORS.CARD_BORDER}`,
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 700,
                fontSize: isMobile ? '0.7rem' : '0.8rem',
                color: 'inherit',
                lineHeight: 1,
              }}
            >
              Fully Booked
            </Typography>
          </Box>
        )}
      </Box>
      
      <CardContent 
        sx={{ 
          p: isMobile ? 2 : 2.5,
          background: theme.palette.background.paper,
          '&:last-child': { pb: isMobile ? 2 : 2.5 },
        }}
      >
        {/* Mobile: Stack name and price, Desktop: Side by side */}
        {isMobile ? (
          <Box sx={{ mb: 1.5 }}>
            <Typography 
              variant="h6" 
              component="h3" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                fontSize: isMobile ? '1.1rem' : '1.25rem',
                lineHeight: 1.2,
                color: '#2c5282',
              }}
            >
              {formatRoomTypeName(roomType.roomType)}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              alignItems: 'center',
              mb: 1,
            }}>
              <Box 
                sx={{ 
                  textAlign: 'right',
                  background: 'rgba(232, 184, 109, 0.1)',
                  borderRadius: 2,
                  padding: 1,
                  border: '2px solid #E8B86D',
                }}
              >
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: COLORS.PRIMARY,
                    fontWeight: 700,
                    fontSize: isMobile ? '1.2rem' : '1.3rem',
                    lineHeight: 1.2,
                  }}
                >
                  ETB {roomType.pricePerNight.toLocaleString()}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: isMobile ? '0.75rem' : '0.8rem',
                    fontWeight: 500,
                  }}
                >
                  per night
                </Typography>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom sx={{ fontWeight: 700, color: '#2c5282' }}>
                {formatRoomTypeName(roomType.roomType)}
              </Typography>
            </Box>
            <Box 
              sx={{ 
                textAlign: 'right',
                background: COLORS.CARD_HOVER,
                borderRadius: 2,
                padding: 1.5,
                border: `1px solid ${COLORS.CARD_BORDER}`,
              }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  color: COLORS.PRIMARY,
                  fontWeight: 700,
                }}
              >
                ETB {roomType.pricePerNight.toLocaleString()}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                per night
              </Typography>
            </Box>
          </Box>
        )}

        {/* Room Details - Mobile Responsive */}
        {isMobile ? (
          <Box sx={{ mb: 1.2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <PeopleIcon sx={{ fontSize: 14, mr: 0.8, color: 'text.secondary' }} />
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: '0.75rem' }}
              >
                Up to {roomType.capacity} guests
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BedIcon sx={{ fontSize: 14, mr: 0.8, color: 'text.secondary' }} />
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: '0.75rem' }}
              >
                {getRoomBedInfo(roomType.roomType)}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PeopleIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              Up to {roomType.capacity} guests
            </Typography>
            <BedIcon sx={{ fontSize: 16, ml: 2, mr: 1, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {getRoomBedInfo(roomType.roomType)}
            </Typography>
          </Box>
        )}

        {/* Availability Message */}
        <Box sx={{ mb: 1 }}>
          <Typography 
            variant="caption" 
            color={isAvailable ? "success.main" : "error.main"} 
            sx={{ fontWeight: 'medium' }}
          >
            {roomType.displayMessage}
          </Typography>
        </Box>

        {/* Description */}
        {roomType.description && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
            {roomType.description}
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
            {(isMobile ? amenities.slice(0, 3) : amenities).map((amenity, index) => (
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
                  color: COLORS.PRIMARY,
                  borderColor: COLORS.PRIMARY,
                }}
              />
            )}
          </Box>
        </Box>

        {/* Book Buttons - Mobile Enhanced */}
        <Box sx={{ mt: 'auto' }}>
          {isAvailable ? (
            isAuthenticated ? (
              // For authenticated users - show primary book button
              <Button
                fullWidth
                variant="contained"
                onClick={() => onBookRoomType(hotelId, roomType.roomType)}
                sx={{ 
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 700,
                  mb: isMobile ? 0.5 : 1,
                  fontSize: isMobile ? '0.85rem' : '0.95rem',
                  py: isMobile ? 1 : 1.2,
                  minHeight: isMobile ? '44px' : '48px',
                  backgroundColor: '#2c5282',
                  color: 'white',
                  border: '2px solid #E8B86D',
                  boxShadow: '0 2px 8px rgba(232, 184, 109, 0.2)',
                  '&:hover': {
                    backgroundColor: '#1e3a5f',
                    border: '2px solid #d4a45a',
                    boxShadow: '0 4px 12px rgba(232, 184, 109, 0.3)',
                    transform: 'translateY(-1px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  }
                }}
              >
                Book Now
              </Button>
            ) : (
              // For non-authenticated users - show both options
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 0.8 : 1 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => onBookRoomType(hotelId, roomType.roomType)}
                  sx={{ 
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: isMobile ? '0.85rem' : '0.95rem',
                    py: isMobile ? 1 : 1.2,
                    minHeight: isMobile ? '44px' : '48px',
                    backgroundColor: '#2c5282',
                    color: 'white',
                    border: '2px solid #E8B86D',
                    boxShadow: '0 2px 8px rgba(232, 184, 109, 0.2)',
                    '&:hover': {
                      backgroundColor: '#1e3a5f',
                      border: '2px solid #d4a45a',
                      boxShadow: '0 4px 12px rgba(232, 184, 109, 0.3)',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    }
                  }}
                >
                  Sign in to Book
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => onBookRoomType(hotelId, roomType.roomType, true)} // true indicates guest booking
                  sx={{ 
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: isMobile ? '0.8rem' : '0.85rem',
                    py: isMobile ? 0.8 : 1,
                    minHeight: isMobile ? '40px' : '42px',
                    backgroundColor: 'transparent',
                    color: '#2c5282',
                    border: '2px solid #E8B86D',
                    '&:hover': {
                      backgroundColor: 'rgba(232, 184, 109, 0.1)',
                      border: '2px solid #d4a45a',
                      color: '#1e3a5f',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(232, 184, 109, 0.3)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    }
                  }}
                >
                  Book as Guest
                </Button>
              </Box>
            )
          ) : (
            <Button
              fullWidth
              variant="outlined"
              disabled
              sx={{ 
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: isMobile ? '0.85rem' : '0.95rem',
                py: isMobile ? 1 : 1.2,
                minHeight: isMobile ? '44px' : '48px',
                backgroundColor: theme.palette.action.disabledBackground,
                color: theme.palette.text.disabled,
                border: '2px solid #E8B86D',
                '&.Mui-disabled': {
                  backgroundColor: theme.palette.action.disabledBackground,
                  color: theme.palette.text.disabled,
                  border: '2px solid #E8B86D',
                }
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
