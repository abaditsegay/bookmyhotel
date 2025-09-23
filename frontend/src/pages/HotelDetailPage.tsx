import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Breadcrumbs,
  Link,
  IconButton,
  Grid,
  CardMedia,
  Rating,
  useMediaQuery,
  useTheme,
  Stack,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Hotel as HotelIcon,
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hotelApiService } from '../services/hotelApi';
import RoomCard from '../components/hotel/RoomCard';
import RoomTypeCard from '../components/hotel/RoomTypeCard';
import { 
  HotelSearchRequest, 
  HotelSearchResult,
} from '../types/hotel';

const HotelDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hotelId } = useParams<{ hotelId: string }>();
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State from search parameters
  const [searchRequest, setSearchRequest] = useState<HotelSearchRequest | null>(null);
  const [hotel, setHotel] = useState<HotelSearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get hotel images - uses uploaded S3 images if available, otherwise fallback to city-based defaults
  const getHotelImage = (imageType: 'hero' | 'gallery' = 'hero'): string => {
    // Use uploaded hotel images if available
    if (hotel?.heroImageUrl && imageType === 'hero') {
      return hotel.heroImageUrl;
    }
    
    if (hotel?.galleryImageUrls && hotel.galleryImageUrls.length > 0 && imageType === 'gallery') {
      return hotel.galleryImageUrls[0];
    }

    // Fallback to city-based default images if no uploaded images are available
    const cityImages = {
      'New York': 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&h=400&fit=crop&crop=center',
      'Miami': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=400&fit=crop&crop=center',
      'Los Angeles': 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=1200&h=400&fit=crop&crop=center',
      'San Francisco': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&h=400&fit=crop&crop=center',
      'Chicago': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=400&fit=crop&crop=center',
      'Philadelphia': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&h=400&fit=crop&crop=center',
      'Seattle': 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&h=400&fit=crop&crop=center',
      'San Diego': 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&h=400&fit=crop&crop=center',
      'Las Vegas': 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&h=400&fit=crop&crop=center',
      'Boston': 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&h=400&fit=crop&crop=center',
      // Default fallback for Addis Ababa and other cities
      'Addis Ababa': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=400&fit=crop&crop=center',
    };
    
    const city = hotel?.city || 'New York';
    return cityImages[city as keyof typeof cityImages] || cityImages['New York'];
  };

  // Load hotel details
  useEffect(() => {
    const loadHotelDetails = async () => {
      if (!hotelId) {
        navigate('/hotels/search');
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        // Get search request from location state
        const state = location.state as { 
          searchRequest?: HotelSearchRequest; 
        };
        
        if (state?.searchRequest) {
          setSearchRequest(state.searchRequest);
        }

        // Fetch hotel details
        console.log('🏨 Loading hotel details for:', hotelId);
        const hotelDetails = await hotelApiService.getHotelDetailsPublic(
          parseInt(hotelId),
          state?.searchRequest?.checkInDate,
          state?.searchRequest?.checkOutDate,
          state?.searchRequest?.guests
        );
        console.log('✅ Hotel details loaded:', hotelDetails);
        setHotel(hotelDetails);
      } catch (err) {
        console.error('❌ Failed to load hotel details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load hotel details');
      } finally {
        setLoading(false);
      }
    };

    loadHotelDetails();
  }, [hotelId, location, navigate]);

  const handleBookRoom = async (hotelId: number, roomId: number, asGuest: boolean = false) => {
    if (!hotel || !searchRequest) return;
    
    const room = hotel.availableRooms.find((r: any) => r.id === roomId);
    if (!room) return;

    if (asGuest) {
      navigate('/booking', {
        state: {
          room,
          hotelName: hotel.name,
          hotelId: hotelId,
          searchRequest: searchRequest,
          asGuest: true
        }
      });
    } else if (!isAuthenticated) {
      navigate('/login', {
        state: {
          redirectTo: '/booking',
          bookingData: {
            room,
            hotelName: hotel.name,
            hotelId: hotelId,
            searchRequest: searchRequest,
            asGuest: false
          }
        }
      });
    } else {
      navigate('/booking', {
        state: {
          room,
          hotelName: hotel.name,
          hotelId: hotelId,
          searchRequest: searchRequest,
          asGuest: false
        }
      });
    }
  };

  const handleBookRoomType = async (hotelId: number, roomType: string, asGuest: boolean = false) => {
    if (!hotel || !searchRequest) return;
    
    const roomTypeInfo = hotel.roomTypeAvailability?.find((rt: any) => rt.roomType === roomType);
    if (!roomTypeInfo) return;

    if (asGuest) {
      navigate('/booking', {
        state: {
          roomType: roomTypeInfo,
          hotelName: hotel.name,
          hotelId: hotelId,
          searchRequest: searchRequest,
          asGuest: true
        }
      });
    } else if (!isAuthenticated) {
      navigate('/login', {
        state: {
          redirectTo: '/booking',
          bookingData: {
            roomType: roomTypeInfo,
            hotelName: hotel.name,
            hotelId: hotelId,
            searchRequest: searchRequest,
            asGuest: false
          }
        }
      });
    } else {
      navigate('/booking', {
        state: {
          roomType: roomTypeInfo,
          hotelName: hotel.name,
          hotelId: hotelId,
          searchRequest: searchRequest,
          asGuest: false
        }
      });
    }
  };

  const handleBackToResults = () => {
    navigate('/hotels/search-results', { 
      state: { 
        searchRequest: searchRequest 
      } 
    });
  };

  const formatSearchSummary = () => {
    if (!searchRequest) return 'Hotel Details';
    
    const parts = [];
    if (searchRequest.location) {
      parts.push(`in ${searchRequest.location}`);
    }
    parts.push(`from ${searchRequest.checkInDate} to ${searchRequest.checkOutDate}`);
    parts.push(`for ${searchRequest.guests} guest${searchRequest.guests > 1 ? 's' : ''}`);
    
    return parts.join(' ');
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={48} />
        </Box>
      </Container>
    );
  }

  if (!hotel) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          Hotel not found. Please try searching again.
        </Alert>
      </Container>
    );
  }

  // Determine if we should use room types or individual rooms
  const useRoomTypes = hotel.roomTypeAvailability && hotel.roomTypeAvailability.length > 0;
  const hasAvailableRooms = useRoomTypes ? 
    hotel.roomTypeAvailability?.some(rt => rt.availableCount > 0) || false : 
    hotel.availableRooms && hotel.availableRooms.length > 0;

  // Mock rating (in a real app, this would come from the backend)
  const hotelRating = 4.2 + (hotel.id % 10) / 10;

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: isMobile ? 2 : 4,
        px: isMobile ? 1 : 3,
      }}
    >
      {/* Professional Header Section */}
      <Card 
        elevation={2}
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`,
          border: `1px solid ${theme.palette.primary.main}20`,
          borderRadius: 3,
          mb: isMobile ? 2 : 3,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          {/* Back Navigation with Professional Styling */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton 
              onClick={handleBackToResults}
              sx={{ 
                mr: 2,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  borderColor: 'primary.main',
                },
                transition: 'all 0.2s ease-in-out',
              }}
              aria-label="back to search results"
            >
              <ArrowBackIcon />
            </IconButton>
            
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <HotelIcon 
                sx={{ 
                  fontSize: isMobile ? 24 : 28, 
                  mr: 1.5,
                  color: 'primary.main',
                }} 
              />
              <Box>
                <Typography 
                  variant={isMobile ? "h6" : "h5"} 
                  sx={{ 
                    fontWeight: 'bold',
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.2,
                  }}
                >
                  Hotel Details
                </Typography>
                {!isSmallMobile && searchRequest && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: '0.875rem' }}
                  >
                    {formatSearchSummary()}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Enhanced Breadcrumbs */}
          {!isSmallMobile && (
            <Box sx={{ pl: 8 }}>
              <Breadcrumbs 
                aria-label="breadcrumb"
                sx={{
                  '& .MuiBreadcrumbs-separator': {
                    color: 'primary.main',
                    fontWeight: 'bold',
                  },
                }}
              >
                <Link 
                  component="button" 
                  variant="body2" 
                  onClick={() => navigate('/hotels/search')}
                  sx={{ 
                    textDecoration: 'none',
                    color: 'primary.main',
                    fontWeight: 'medium',
                    '&:hover': {
                      color: 'primary.dark',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Hotel Search
                </Link>
                <Link 
                  component="button" 
                  variant="body2" 
                  onClick={handleBackToResults}
                  sx={{ 
                    textDecoration: 'none',
                    color: 'primary.main',
                    fontWeight: 'medium',
                    '&:hover': {
                      color: 'primary.dark',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Search Results
                </Link>
                <Typography variant="body2" color="text.primary" sx={{ fontWeight: 'medium' }}>
                  {hotel?.name || 'Hotel Details'}
                </Typography>
              </Breadcrumbs>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Hotel Hero Image - Mobile Responsive */}
      <CardMedia
        component="img"
        height={isMobile ? "200" : "300"}
        image={getHotelImage('hero')}
        alt={hotel.name}
        sx={{ 
          borderRadius: isMobile ? 1 : 2, 
          mb: isMobile ? 2 : 3,
          objectFit: 'cover',
        }}
      />

      {/* Hotel Information - Mobile Responsive */}
      <Card 
        elevation={2}
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`,
          border: `1px solid ${theme.palette.primary.main}20`,
          borderRadius: 3,
          mb: isMobile ? 2 : 3,
        }}
      >
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
        {/* Mobile Layout - Stacked */}
        {isMobile ? (
          <Stack spacing={2}>
            <Box>
              <Typography 
                variant={isSmallMobile ? "h5" : "h4"} 
                component="h1" 
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
                <Rating 
                  value={hotelRating} 
                  precision={0.1} 
                  size={isSmallMobile ? "small" : "medium"} 
                  readOnly 
                />
                <Typography 
                  variant="body2" 
                  sx={{ fontWeight: 'medium' }}
                >
                  {hotelRating.toFixed(1)}
                </Typography>
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
            {searchRequest && (
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
            )}
          </Stack>
        ) : (
          /* Desktop Layout - Side by Side */
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {hotel.name}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Rating value={hotelRating} precision={0.1} size="medium" readOnly />
                <Typography variant="body1" sx={{ ml: 1, fontWeight: 'medium' }}>
                  {hotelRating.toFixed(1)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <LocationIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1" color="text.secondary">
                  {hotel.address}, {hotel.city}, {hotel.country}
                </Typography>
              </Box>
            </Box>
            
            {searchRequest && (
              <Box sx={{ textAlign: 'right', ml: 3 }}>
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
            )}
          </Box>
        )}

        {/* Hotel Description - Mobile Responsive */}
        {hotel.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            paragraph 
            sx={{ 
              fontSize: isMobile ? '0.85rem' : '0.95rem', 
              lineHeight: 1.5,
              mb: isMobile ? 1.5 : 2,
            }}
          >
            {hotel.description}
          </Typography>
        )}

        {/* Contact Information - Mobile Responsive */}
        {isMobile ? (
          /* Mobile Layout - Stacked */
          <Stack spacing={1.5} sx={{ mt: 2 }}>
            {hotel.phone && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: '0.85rem' }}
                >
                  {hotel.phone}
                </Typography>
              </Box>
            )}
            {hotel.email && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: '0.85rem',
                    wordBreak: 'break-word',
                  }}
                >
                  {hotel.email}
                </Typography>
              </Box>
            )}
          </Stack>
        ) : (
          /* Desktop Layout - Side by Side */
          <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
            {hotel.phone && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {hotel.phone}
                </Typography>
              </Box>
            )}
            {hotel.email && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {hotel.email}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Search Summary */}
        {searchRequest && (
          <Box sx={{ mt: 2, p: 1.5, backgroundColor: 'primary.50', borderRadius: 1 }}>
            <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'medium' }}>
              Showing availability {formatSearchSummary()}
            </Typography>
          </Box>
        )}
        </CardContent>
      </Card>

      {/* Professional Rooms Section */}
      {searchRequest && (
        <Card 
          elevation={2}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.secondary.main}08 0%, ${theme.palette.primary.main}08 100%)`,
            border: `1px solid ${theme.palette.secondary.main}20`,
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: isMobile ? 2 : 3 }}>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              sx={{ 
                fontWeight: 'bold', 
                mb: isMobile ? 1.5 : 2,
                fontSize: isMobile ? '1.1rem' : undefined,
                color: 'text.primary',
              }}
            >
              {useRoomTypes ? 
                `Available Room Types (${hotel.roomTypeAvailability?.length || 0})` :
                `Available Rooms (${hotel.availableRooms?.length || 0})`
              }
          </Typography>

          {hasAvailableRooms ? (
            <Grid 
              container 
              spacing={isMobile ? 1.5 : 2}
              sx={{
                // Ensure proper mobile spacing
                '& .MuiGrid-item': {
                  paddingTop: isMobile ? '12px !important' : undefined,
                  paddingLeft: isMobile ? '12px !important' : undefined,
                },
                // Mobile-specific grid improvements
                ...(isMobile && {
                  '& .MuiGrid-root': {
                    width: '100%',
                    margin: 0,
                  }
                })
              }}
            >
              {useRoomTypes ? (
                // Display room types - Mobile responsive grid
                hotel.roomTypeAvailability?.map((roomType) => (
                  <Grid 
                    item 
                    xs={12} 
                    sm={isMobile ? 12 : 6} 
                    md={4} 
                    lg={3} 
                    key={roomType.roomType}
                  >
                    <RoomTypeCard
                      roomType={roomType}
                      hotelId={hotel.id}
                      onBookRoomType={handleBookRoomType}
                    />
                  </Grid>
                ))
              ) : (
                // Display individual rooms - Mobile responsive grid
                hotel.availableRooms?.map((room) => (
                  <Grid 
                    item 
                    xs={12} 
                    sm={isMobile ? 12 : 6} 
                    md={4} 
                    lg={3} 
                    key={room.id}
                  >
                    <RoomCard
                      room={room}
                      hotelId={hotel.id}
                      onBookRoom={handleBookRoom}
                    />
                  </Grid>
                ))
              )}
            </Grid>
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              py: isMobile ? 4 : 6,
              px: isMobile ? 2 : 0,
            }}>
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                color="text.secondary" 
                gutterBottom
                sx={{ fontSize: isMobile ? '1.1rem' : undefined }}
              >
                No rooms available
              </Typography>
              <Typography 
                variant={isMobile ? "body2" : "body1"} 
                color="text.secondary" 
                paragraph
                sx={{ 
                  fontSize: isMobile ? '0.875rem' : undefined,
                  lineHeight: 1.4,
                }}
              >
                We couldn't find any available rooms for your selected dates.
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontSize: isMobile ? '0.8rem' : undefined,
                }}
              >
                Try adjusting your search dates or criteria.
              </Typography>
            </Box>
          )}
          </CardContent>
        </Card>
      )}

      {/* No Search Request - Hotel Info Only - Mobile Responsive */}
      {!searchRequest && (
        <Card 
          elevation={2}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`,
            border: `1px solid ${theme.palette.primary.main}20`,
            borderRadius: 3,
            textAlign: 'center',
          }}
        >
          <CardContent sx={{ p: isMobile ? 3 : 4 }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Search for availability
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            To see available rooms and make a booking, please use our hotel search.
          </Typography>
          <Box sx={{ mt: 3 }}>
            <IconButton 
              onClick={() => navigate('/hotels/search')}
              color="primary"
              size="large"
            >
              Search Hotels
            </IconButton>
          </Box>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default HotelDetailPage;
