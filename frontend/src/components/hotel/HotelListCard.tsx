import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Rating,
  useMediaQuery,
  useTheme,
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

// Get hotel image - uses uploaded S3 images if available, otherwise fallback to city-based defaults
const getHotelImage = (hotel: HotelSearchResult): string => {
  // Use uploaded hotel hero image if available
  if (hotel.heroImageUrl) {
    return hotel.heroImageUrl;
  }

  // Fallback to city-based default images if no uploaded images are available
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
    // Default fallback for Addis Ababa and other cities
    'Addis Ababa': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop&crop=center',
  };
  
  return cityImages[hotel.city as keyof typeof cityImages] || cityImages['New York'];
};

const HotelListCard: React.FC<HotelListCardProps> = ({ hotel, onViewHotel }) => {
  // Responsive breakpoints
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg')); // 1200px+
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Below 960px

  // Determine if we should use room types or individual rooms
  const useRoomTypes = hotel.roomTypeAvailability && hotel.roomTypeAvailability.length > 0;

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
      elevation={isMobile ? 1 : 2}
      sx={{ 
        display: 'flex',
        flexDirection: isLargeScreen ? 'row' : 'column',
        height: isLargeScreen ? '280px' : 'auto',
        mb: { xs: 2, md: 2 },
        borderRadius: { xs: 2, md: 1 },
        overflow: 'hidden',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: isMobile ? 'none' : 'translateY(-2px)', // Disable transform on mobile
          boxShadow: isMobile ? 2 : 4,
        },
        '&:active': isMobile ? {
          transform: 'scale(0.98)',
          transition: 'transform 0.1s ease-in-out',
        } : {},
        cursor: 'pointer',
        // Mobile-specific styling
        ...(isMobile && {
          boxShadow: theme.shadows[2],
          background: theme.palette.background.paper,
        }),
      }}
      onClick={() => onViewHotel(hotel.id)}
    >
      {/* Hotel Image - Mobile Optimized */}
      <CardMedia
        component="img"
        sx={{ 
          width: isLargeScreen ? 300 : '100%', 
          height: { 
            xs: '200px',    // Mobile: fixed height for consistency
            sm: '220px',    // Small tablet
            md: '250px',    // Medium screens
            lg: '100%'      // Large screens: full height
          }, 
          objectFit: 'cover',
          flexShrink: 0,
          // Mobile-specific image optimizations
          ...(isMobile && {
            borderRadius: '0', // Remove border radius for seamless mobile look
            maxHeight: '200px',
          }),
        }}
        image={getHotelImage(hotel)}
        alt={hotel.name}
        loading="lazy" // Improve mobile performance
      />
      
      {/* Hotel Content - Mobile Optimized */}
      <CardContent sx={{ 
        flex: 1, 
        p: { xs: 2.5, sm: 3, md: 3 }, // Enhanced mobile padding
        display: 'flex', 
        flexDirection: 'column',
        // Mobile-specific content styling
        ...(isMobile && {
          paddingBottom: '20px',
        }),
      }}>
        {/* Header - Mobile-First Layout */}
        <Box sx={{ mb: { xs: 1.5, md: 2 } }}>
          {/* Mobile: Stack hotel name and price */}
          {isMobile ? (
            <>
              <Typography 
                variant="h6" 
                component="h3" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: 'primary.main',
                  fontSize: '1.2rem',
                  lineHeight: 1.3,
                  mb: 1,
                }}
              >
                {hotel.name}
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 1,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Rating value={hotelRating} precision={0.1} size="small" readOnly />
                  <Typography variant="body2" sx={{ ml: 1, fontWeight: 'medium' }}>
                    {hotelRating.toFixed(1)}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography 
                    variant="h6" 
                    color="success.main" 
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      lineHeight: 1.2,
                    }}
                  >
                    From ETB {hotel.minPrice?.toFixed(0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    per night
                  </Typography>
                </Box>
              </Box>
            </>
          ) : (
            /* Desktop: Side-by-side layout */
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
          )}
        </Box>
          
          {/* Rating - Desktop Only (mobile rating moved to header) */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Rating value={hotelRating} precision={0.1} size="small" readOnly />
                <Typography variant="body2" sx={{ ml: 1, fontWeight: 'medium' }}>
                  {hotelRating.toFixed(1)}
                </Typography>
              </Box>
            </Box>
          )}

        {/* Location - Mobile Optimized */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          mb: { xs: 1.5, md: 2 },
          flexWrap: isMobile ? 'wrap' : 'nowrap',
        }}>
          <LocationIcon sx={{ 
            fontSize: { xs: 16, md: 18 }, 
            mr: 1, 
            color: 'text.secondary',
            mt: 0.25, // Align with text baseline
            flexShrink: 0,
          }} />
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.85rem', md: '0.875rem' },
              lineHeight: 1.4,
              // Mobile: Better text wrapping
              ...(isMobile && {
                wordBreak: 'break-word',
              }),
            }}
          >
            {hotel.address}, {hotel.city}, {hotel.country}
          </Typography>
        </Box>

        {/* Description - Mobile Optimized */}
        {hotel.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: { xs: 1.5, md: 2 },
              display: '-webkit-box',
              WebkitLineClamp: isMobile ? 2 : 2, // Consistent line clamp
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: { xs: '0.85rem', md: '0.875rem' },
              lineHeight: 1.4,
            }}
          >
            {hotel.description}
          </Typography>
        )}

        {/* Room Types Preview - Mobile Optimized */}
        <Box sx={{ mb: { xs: 2, md: 2 }, flexGrow: 1 }}>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '0.85rem', md: '0.875rem' },
              lineHeight: 1.3,
            }}
          >
            <strong>Available:</strong> {getPopularRoomTypes()}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              fontSize: { xs: '0.85rem', md: '0.875rem' },
              lineHeight: 1.3,
            }}
          >
            <strong>Price range:</strong> ETB {hotel.minPrice?.toFixed(0)} - ETB {hotel.maxPrice?.toFixed(0)} per night
          </Typography>
        </Box>

        {/* Contact Info & Action - Mobile-First Layout */}
        {isMobile ? (
          /* Mobile: Stacked layout with prominent button */
          <Box sx={{ mt: 'auto' }}>
            {/* Contact info row */}
            {(hotel.phone || hotel.email) && (
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                mb: 2,
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}>
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
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ 
                        maxWidth: '120px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {hotel.email}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
            
            {/* Full-width button */}
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<ViewIcon />}
              fullWidth
              onClick={(e) => {
                e.stopPropagation();
                onViewHotel(hotel.id);
              }}
              sx={{
                minHeight: '48px', // Larger touch target
                borderRadius: 2,
                fontWeight: 'bold',
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 3,
                },
              }}
            >
              View Hotel Details
            </Button>
          </Box>
        ) : (
          /* Desktop: Side-by-side layout */
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
        )}
      </CardContent>
    </Card>
  );
};

export default HotelListCard;
