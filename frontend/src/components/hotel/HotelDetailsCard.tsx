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
  useMediaQuery,
  useTheme,
  Stack,
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
import RoomTypeCard from './RoomTypeCard';

interface HotelDetailsCardProps {
  hotel: HotelSearchResult;
  onBookRoom?: (hotelId: number, roomId: number, asGuest?: boolean) => void;
  onBookRoomType?: (hotelId: number, roomType: string, asGuest?: boolean) => void;
  defaultExpanded?: boolean;
  horizontalLayout?: boolean; // New prop for horizontal layout in search results
}

// Professional hotel images based on hotel name/location
const getHotelImage = (hotelName: string, city: string): string => {
  const cityImages = {
    'New York': 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=400&fit=crop&crop=center', // Luxury NYC hotel exterior
    'Miami': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=400&fit=crop&crop=center', // Modern Miami beachfront hotel
    'Los Angeles': 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&h=400&fit=crop&crop=center', // Elegant LA hotel facade
    'San Francisco': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=400&fit=crop&crop=center', // Victorian SF hotel
    'Chicago': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop&crop=center', // Modern Chicago hotel
    'Philadelphia': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=400&fit=crop&crop=center', // Historic Philadelphia hotel
    'Seattle': 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=400&fit=crop&crop=center', // Seattle waterfront hotel
    'San Diego': 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=400&fit=crop&crop=center', // San Diego resort hotel
    'Las Vegas': 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&h=400&fit=crop&crop=center', // Vegas luxury hotel
    'Boston': 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&h=400&fit=crop&crop=center', // Historic Boston hotel
  };
  return cityImages[city as keyof typeof cityImages] || cityImages['New York'];
};

const HotelDetailsCard: React.FC<HotelDetailsCardProps> = ({ 
  hotel, 
  onBookRoom, 
  onBookRoomType,
  defaultExpanded = false,
  horizontalLayout = false 
}) => {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg')); // 1200px+
  
  // Determine if we should use room types or individual rooms
  const useRoomTypes = hotel.roomTypeAvailability && hotel.roomTypeAvailability.length > 0;
  const hasAvailableRooms = useRoomTypes ? 
    hotel.roomTypeAvailability?.some(rt => rt.availableCount > 0) || false : 
    hotel.availableRooms && hotel.availableRooms.length > 0;
  
  const totalAvailableCount = useRoomTypes ? 
    hotel.roomTypeAvailability?.reduce((sum, rt) => sum + rt.availableCount, 0) || 0 :
    hotel.availableRooms?.length || 0;

  // Mock rating (in a real app, this would come from the backend)
  const hotelRating = 4.2 + (hotel.id % 10) / 10; // Generates ratings between 4.2-5.1

  return (
    <Card 
      elevation={isMobile ? 1 : 3} 
      sx={{ 
        mb: isMobile ? 2 : 3,
        borderRadius: isMobile ? 1 : 2,
        overflow: 'hidden',
        display: horizontalLayout && isLargeScreen ? 'flex' : 'block',
        flexDirection: horizontalLayout && isLargeScreen ? 'row' : 'column',
      }}
    >
      {/* Hotel Header with Image */}
      <CardMedia
        component="img"
        height={isMobile ? "200" : horizontalLayout && isLargeScreen ? "250" : "300"}
        image={getHotelImage(hotel.name, hotel.city)}
        alt={hotel.name}
        sx={{ 
          objectFit: 'cover',
          width: horizontalLayout && isLargeScreen ? '400px' : '100%',
          flexShrink: 0,
        }}
      />
      
      {/* Content Container */}
      <Box sx={{ 
        flex: horizontalLayout && !isMobile ? 1 : 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: horizontalLayout && !isMobile ? '250px' : 'auto',
      }}>
        <CardContent sx={{ p: isMobile ? 2 : 3, flex: 1 }}>
        {/* Hotel Info Header */}
        <Box sx={{ mb: isMobile ? 2 : 3 }}>
          {/* Mobile Layout - Stacked */}
          {isMobile ? (
            <Stack spacing={2}>
              <Box>
                <Typography 
                  variant={isSmallMobile ? "h5" : "h4"} 
                  component="h2" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: 'primary.main',
                    lineHeight: 1.2,
                  }}
                >
                  {hotel.name}
                </Typography>
                
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {[...Array(5)].map((_, i) => (
                      <StarIcon 
                        key={i} 
                        sx={{ 
                          fontSize: 16,
                          color: i < Math.floor(hotelRating) ? 'warning.main' : 'grey.300' 
                        }} 
                      />
                    ))}
                    <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 'medium' }}>
                      {hotelRating.toFixed(1)}
                    </Typography>
                  </Box>
                  <Chip 
                    label={useRoomTypes ? 
                      `${totalAvailableCount} available` : 
                      `${hotel.availableRooms?.length || 0} available`
                    } 
                    color="success" 
                    variant="outlined"
                    size="small"
                    sx={{ fontSize: '0.75rem' }}
                  />
                </Stack>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                  <LocationIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary', mt: 0.25 }} />
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      lineHeight: 1.3,
                      fontSize: '0.85rem',
                    }}
                  >
                    {hotel.address}, {hotel.city}, {hotel.country}
                  </Typography>
                </Box>
              </Box>
              
              {/* Price Section - Mobile */}
              <Box 
                sx={{ 
                  textAlign: 'center',
                  p: 2,
                  backgroundColor: 'success.light',
                  borderRadius: 1,
                }}
              >
                <Typography variant="h5" color="success.main" sx={{ fontWeight: 'bold' }}>
                  From ETB {hotel.minPrice?.toFixed(0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  per night
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Up to ETB {hotel.maxPrice?.toFixed(0)}
                </Typography>
              </Box>
            </Stack>
          ) : (
            /* Desktop Layout - Side by Side */
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
                    label={useRoomTypes ? 
                      `${totalAvailableCount} rooms available` : 
                      `${hotel.availableRooms?.length || 0} rooms available`
                    } 
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
                  From ETB {hotel.minPrice?.toFixed(0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  per night
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Up to ETB {hotel.maxPrice?.toFixed(0)}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Hotel Description */}
          {hotel.description && (
            <Typography 
              variant={isMobile ? "body2" : "body1"} 
              color="text.secondary" 
              paragraph
              sx={{
                fontSize: isMobile ? '0.85rem' : undefined,
                lineHeight: isMobile ? 1.4 : undefined,
              }}
            >
              {hotel.description}
            </Typography>
          )}

          {/* Contact Info - Mobile Responsive */}
          <Stack 
            direction={isMobile ? "column" : "row"} 
            spacing={isMobile ? 1 : 3} 
            sx={{ mb: 2 }}
          >
            {hotel.phone && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: isMobile ? '0.8rem' : undefined }}
                >
                  {hotel.phone}
                </Typography>
              </Box>
            )}
            {hotel.email && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: isMobile ? '0.8rem' : undefined }}
                >
                  {hotel.email}
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Rooms Section Header - Mobile Responsive */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center', 
          mb: 2,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1 : 0,
        }}>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            sx={{ 
              fontWeight: 'bold',
              fontSize: isMobile ? '1.1rem' : undefined,
            }}
          >
            {useRoomTypes ? 
              `Room Types (${hotel.roomTypeAvailability?.length || 0})` :
              `Rooms (${hotel.availableRooms?.length || 0})`
            }
          </Typography>
          <Button
            onClick={() => setExpanded(!expanded)}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            variant="outlined"
            size={isMobile ? "medium" : "small"}
            fullWidth={isMobile}
            sx={{ minWidth: isMobile ? '100%' : 'auto' }}
          >
            {expanded ? 'Hide Rooms' : 'Show All Rooms'}
          </Button>
        </Box>

        {/* Quick Room Preview (always visible) */}
        {hasAvailableRooms && !expanded && (
          <Box sx={{ mb: 2 }}>
            <Grid container spacing={isMobile ? 1 : 2}>
              {useRoomTypes ? (
                // Display room types
                hotel.roomTypeAvailability?.slice(0, isMobile ? 1 : 2).map((roomType) => (
                  <Grid 
                    item 
                    xs={12} 
                    sm={isMobile ? 12 : 6} 
                    key={roomType.roomType}
                  >
                    <RoomTypeCard
                      roomType={roomType}
                      hotelId={hotel.id}
                      onBookRoomType={onBookRoomType || (() => {})}
                    />
                  </Grid>
                ))
              ) : (
                // Display individual rooms (backward compatibility)
                hotel.availableRooms?.slice(0, isMobile ? 1 : 2).map((room) => (
                  <Grid 
                    item 
                    xs={12} 
                    sm={isMobile ? 12 : 6} 
                    key={room.id}
                  >
                    <RoomCard
                      room={room}
                      hotelId={hotel.id}
                      onBookRoom={onBookRoom || (() => {})}
                    />
                  </Grid>
                ))
              )}
            </Grid>
            {((useRoomTypes && hotel.roomTypeAvailability && hotel.roomTypeAvailability.length > (isMobile ? 1 : 2)) ||
              (!useRoomTypes && hotel.availableRooms && hotel.availableRooms.length > (isMobile ? 1 : 2))) && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button
                  variant="text"
                  onClick={() => setExpanded(true)}
                  color="primary"
                  fullWidth={isMobile}
                  sx={{ py: isMobile ? 1.5 : undefined }}
                >
                  View {useRoomTypes ? 
                    (hotel.roomTypeAvailability!.length - (isMobile ? 1 : 2)) : 
                    (hotel.availableRooms!.length - (isMobile ? 1 : 2))
                  } more {useRoomTypes ? 'room types' : 'rooms'}
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Expandable Room Details */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={isMobile ? 1 : 2}>
              {useRoomTypes ? (
                // Display room types
                hotel.roomTypeAvailability?.map((roomType) => (
                  <Grid 
                    item 
                    xs={12} 
                    sm={isMobile ? 12 : 6} 
                    md={isMobile ? 12 : 4} 
                    key={roomType.roomType}
                  >
                    <RoomTypeCard
                      roomType={roomType}
                      hotelId={hotel.id}
                      onBookRoomType={onBookRoomType || (() => {})}
                    />
                  </Grid>
                ))
              ) : (
                // Display individual rooms (backward compatibility)
                hotel.availableRooms?.map((room) => (
                  <Grid 
                    item 
                    xs={12} 
                    sm={isMobile ? 12 : 6} 
                    md={isMobile ? 12 : 4} 
                    key={room.id}
                  >
                    <RoomCard
                      room={room}
                      hotelId={hotel.id}
                      onBookRoom={onBookRoom || (() => {})}
                    />
                  </Grid>
                ))
              )}
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
      </Box>
    </Card>
  );
};

export default HotelDetailsCard;
