import React from 'react';
import { useTranslation } from 'react-i18next';
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
import { COLORS, addAlpha } from '../../theme/themeColors';
import { formatCurrency } from '../../utils/currencyUtils';

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
    STANDARD: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=250&fit=crop&crop=center', // Standard room (same as double)
    FAMILY: 'https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=400&h=250&fit=crop&crop=center', // Family room with multiple beds
    ACCESSIBLE: 'https://images.unsplash.com/photo-1631049035182-249067d7618e?w=400&h=250&fit=crop&crop=center', // Accessible room
    SUITE: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=250&fit=crop&crop=center', // Luxury suite with living area
    DELUXE: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=250&fit=crop&crop=center', // Deluxe room with premium finishes
    PRESIDENTIAL: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=400&h=250&fit=crop&crop=center', // Presidential suite with panoramic views
  };
  return images[roomType as keyof typeof images] || images.DOUBLE;
};

// Mock amenities based on room type
const getRoomAmenities = (roomType: string): string[] => {
  const baseAmenities = ['freeWifi', 'airConditioning', 'roomService'];
  const typeAmenities = {
    SINGLE: [...baseAmenities, 'workDesk'],
    DOUBLE: [...baseAmenities, 'miniBar', 'safe'],
    STANDARD: [...baseAmenities, 'miniBar', 'safe'],
    FAMILY: [...baseAmenities, 'extraSpace', 'multipleBeds', 'kidsWelcome'],
    ACCESSIBLE: [...baseAmenities, 'wheelchairAccessible', 'rollInShower', 'grabBars'],
    SUITE: [...baseAmenities, 'livingArea', 'kitchenette', 'balcony'],
    DELUXE: [...baseAmenities, 'premiumBedding', 'cityView', 'miniBar'],
    PRESIDENTIAL: [...baseAmenities, 'butlerService', 'privateTerrace', 'jacuzzi', 'premiumAmenities'],
  };
  return typeAmenities[roomType as keyof typeof typeAmenities] || baseAmenities;
};

const getRoomTypeLabelKey = (roomType: string): string => roomType.toLowerCase();

const getBedInfoKey = (roomType: string): string => {
  const bedInfo = {
    SINGLE: 'single',
    DOUBLE: 'double',
    STANDARD: 'standard',
    DELUXE: 'deluxe',
    SUITE: 'suite',
    FAMILY: 'family',
    ACCESSIBLE: 'accessible',
    PRESIDENTIAL: 'presidential',
  };

  return bedInfo[roomType as keyof typeof bedInfo] || 'presidential';
};

const RoomCard: React.FC<RoomCardProps> = ({ room, hotelId, onBookRoom }) => {
  const { t } = useTranslation();
  const amenities = getRoomAmenities(room.roomType);
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down(400));

  return (
    <Card 
      sx={{ 
        height: '100%',
        backgroundColor: COLORS.WHITE,
        borderRadius: 2,
        boxShadow: `0 4px 12px ${addAlpha(COLORS.SECONDARY, 0.15)}`,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 8px 20px ${addAlpha(COLORS.SECONDARY, 0.25)}`,
        },
      }}
    >
      <CardMedia
        component="img"
        height={isMobile ? "220" : "280"}
        image={getRoomImage(room.roomType)}
        alt={`${room.roomType} room`}
        sx={{ 
          objectFit: 'cover',
          transition: 'transform 0.4s ease-in-out',
          '&:hover': {
            transform: 'scale(1.08)',
          },
        }}
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
                  color: COLORS.PRIMARY,
                }}
              >
                {t('hotelSearch.roomCard.roomNumber', { roomNumber: room.roomNumber })}
              </Typography>
              <Chip 
                label={t(`hotelSearch.roomTypes.${getRoomTypeLabelKey(room.roomType)}`)} 
                variant="outlined" 
                size="small"
                sx={{ 
                  mb: 1, 
                  fontSize: isSmallMobile ? '0.65rem' : '0.7rem',
                  height: isSmallMobile ? '20px' : '24px',
                  borderColor: theme.palette.divider,
                  color: 'text.primary',
                  fontWeight: 600,
                }}
              />
            </Box>
            <Box sx={{ 
              textAlign: 'center',
              p: 1.5,
              backgroundColor: addAlpha(COLORS.SECONDARY, 0.1),
              borderRadius: 1,
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: COLORS.PRIMARY,
                  fontWeight: 700,
                  fontSize: isSmallMobile ? '1rem' : '1.25rem',
                }}
              >
                {formatCurrency(room.pricePerNight || 0)}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: isSmallMobile ? '0.7rem' : undefined, fontWeight: 500 }}
              >
                {t('hotelSearch.detail.perNight')}
              </Typography>
            </Box>
          </Stack>
        ) : (
          /* Desktop Layout - Side by Side */
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Box>
              <Typography variant="subtitle1" component="h3" gutterBottom sx={{ fontWeight: 'bold', color: COLORS.PRIMARY }}>
                {t('hotelSearch.roomCard.roomNumber', { roomNumber: room.roomNumber })}
              </Typography>
              <Chip 
                label={t(`hotelSearch.roomTypes.${getRoomTypeLabelKey(room.roomType)}`)} 
                variant="outlined" 
                size="small"
                sx={{ 
                  mb: 1, 
                  fontSize: '0.7rem',
                  borderColor: theme.palette.divider,
                  color: 'text.primary',
                  fontWeight: 600,
                }}
              />
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" sx={{ 
                color: COLORS.PRIMARY,
                fontWeight: 700 
              }}>
                {formatCurrency(room.pricePerNight || 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {t('hotelSearch.detail.perNight')}
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
                {t('hotelSearch.roomCard.upToGuests', { count: room.capacity })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BedIcon sx={{ fontSize: 14, mr: 0.8, color: 'text.secondary' }} />
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: isSmallMobile ? '0.7rem' : '0.75rem' }}
              >
                {t(`hotelSearch.bedInfo.${getBedInfoKey(room.roomType)}`)}
              </Typography>
            </Box>
          </Stack>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PeopleIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {t('hotelSearch.roomCard.upToGuests', { count: room.capacity })}
            </Typography>
            <BedIcon sx={{ fontSize: 16, ml: 2, mr: 1, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {t(`hotelSearch.bedInfo.${getBedInfoKey(room.roomType)}`)}
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
              fontWeight: 700, 
              fontSize: isMobile ? '0.7rem' : '0.75rem',
            }}
          >
            {t('hotelSearch.roomCard.amenities')}
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: isMobile ? 0.2 : 0.25,
          }}>
            {amenities.slice(0, isMobile ? 3 : amenities.length).map((amenity, index) => (
              <Chip 
                key={index} 
                label={t(`hotelSearch.amenities.${amenity}`)} 
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
                label={t('hotelSearch.roomCard.moreAmenities', { count: amenities.length - 3 })} 
                size="small" 
                variant="outlined"
                sx={{ 
                  fontSize: '0.6rem', 
                  height: 18,
                  color: 'text.primary',
                  borderColor: theme.palette.divider,
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
              onClick={() => onBookRoom(hotelId, room.id)}
              sx={{ 
                borderRadius: isMobile ? 1.5 : 2,
                textTransform: 'none',
                fontWeight: 700,
                mb: isMobile ? 0.5 : 1,
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                py: isMobile ? 0.8 : 1,
                backgroundColor: COLORS.PRIMARY,
                color: COLORS.WHITE,
                boxShadow: `0 2px 8px ${addAlpha(COLORS.SECONDARY, 0.2)}`,
                '&:hover': {
                  backgroundColor: COLORS.PRIMARY_HOVER,
                  boxShadow: `0 4px 12px ${addAlpha(COLORS.SECONDARY, 0.3)}`,
                },
              }}
            >
              {t('hotelSearch.roomCard.bookNow')}
            </Button>
          ) : (
            // For non-authenticated users - show both options
            <Stack spacing={isMobile ? 0.8 : 1}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => onBookRoom(hotelId, room.id)}
                sx={{ 
                  borderRadius: isMobile ? 1.5 : 2,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: isMobile ? '0.8rem' : '0.875rem',
                  py: isMobile ? 0.8 : 1,
                  backgroundColor: COLORS.PRIMARY,
                  color: COLORS.WHITE,
                  boxShadow: `0 2px 8px ${addAlpha(COLORS.SECONDARY, 0.2)}`,
                  '&:hover': {
                    backgroundColor: COLORS.PRIMARY_HOVER,
                    boxShadow: `0 4px 12px ${addAlpha(COLORS.SECONDARY, 0.3)}`,
                  },
                }}
              >
                {t('hotelSearch.roomCard.signInToBook')}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => onBookRoom(hotelId, room.id, true)} // true indicates guest booking
                sx={{ 
                  borderRadius: isMobile ? 1.5 : 2,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: isMobile ? '0.75rem' : '0.8rem',
                  py: isMobile ? 0.6 : 0.8,
                  color: COLORS.PRIMARY,
                  '&:hover': {
                    backgroundColor: addAlpha(COLORS.SECONDARY, 0.1),
                    color: COLORS.PRIMARY_HOVER,
                  },
                }}
              >
                {t('hotelSearch.roomCard.bookAsGuest')}
              </Button>
            </Stack>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default RoomCard;
