import React, { useEffect, useMemo } from 'react';
import { formatEthiopianPhone } from '../utils/phoneUtils';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  IconButton,
  Button,
  Chip,
  Grid,
  CardMedia,
  useMediaQuery,
  useTheme,
  Stack,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hotelApiService } from '../services/hotelApi';
import RoomCard from '../components/hotel/RoomCard';
import RoomTypeCard from '../components/hotel/RoomTypeCard';
import { DataState } from '../components/common';
import { SurfaceCard } from '../components/ui';
import { COLORS, addAlpha } from '../theme/themeColors';
import { formatCurrencyWithDecimals } from '../utils/currencyUtils';
import { formatHotelSearchSummary } from '../hooks/usePublicHotelSearchResults';
import { 
  HotelSearchRequest, 
  HotelSearchResult,
  AvailableRoom,
} from '../types/hotel';

const HotelDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { hotelId } = useParams<{ hotelId: string }>();
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const parsedHotelId = Number.parseInt(hotelId || '', 10);
  const hasValidHotelId = Number.isInteger(parsedHotelId);
  const locationState = (location.state as { searchRequest?: HotelSearchRequest } | null) ?? null;
  const searchRequest = locationState?.searchRequest ?? null;

  const hotelQuery = useQuery<HotelSearchResult>({
    queryKey: [
      'public-hotel-details',
      parsedHotelId,
      searchRequest?.checkInDate,
      searchRequest?.checkOutDate,
      searchRequest?.guests,
    ],
    enabled: hasValidHotelId,
    queryFn: () =>
      hotelApiService.getHotelDetailsPublic(
        parsedHotelId,
        searchRequest?.checkInDate,
        searchRequest?.checkOutDate,
        searchRequest?.guests
      ),
  });

  const hotel = hotelQuery.data ?? null;
  const amenityHighlights = hotel?.facilityAmenities
    ? hotel.facilityAmenities
        .split(/[\n,]/)
        .map((amenity) => amenity.trim())
        .filter(Boolean)
        .slice(0, 8)
    : [];
  const websiteUrl = hotel?.websiteUrl
    ? (hotel.websiteUrl.startsWith('http://') || hotel.websiteUrl.startsWith('https://')
        ? hotel.websiteUrl
        : `https://${hotel.websiteUrl}`)
    : null;

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

  useEffect(() => {
    if (!hasValidHotelId) {
      navigate('/hotels/search', { replace: true });
    }
  }, [hasValidHotelId, navigate]);

  const formatSearchSummary = useMemo(
    () => () => formatHotelSearchSummary(searchRequest, {
      inLabel: t('hotelSearch.summary.in'),
      fromLabel: t('hotelSearch.summary.from'),
      toLabel: t('hotelSearch.summary.to'),
      forLabel: t('hotelSearch.summary.for'),
      guestSingular: t('hotelSearch.summary.guestSingle'),
      guestPlural: t('hotelSearch.summary.guestPlural'),
    }) || t('hotelSearch.detail.hotelDetails'),
    [searchRequest, t]
  );

  if (!hasValidHotelId) {
    return null;
  }

  const handleBookRoom = async (hotelId: number, roomId: number, asGuest: boolean = false) => {
    if (!hotel || !searchRequest) return;
    
    const room = hotel.availableRooms.find((availableRoom: AvailableRoom) => availableRoom.id === roomId);
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

  // Determine if we should use room types or individual rooms
  const useRoomTypes = Boolean(hotel?.roomTypeAvailability && hotel.roomTypeAvailability.length > 0);
  const hasAvailableRooms = useRoomTypes ? 
    hotel?.roomTypeAvailability?.some(rt => rt.availableCount > 0) || false : 
    Boolean(hotel?.availableRooms && hotel.availableRooms.length > 0);

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: isMobile ? 2 : 4,
        px: isMobile ? 1 : 3,
      }}
    >
      {/* Back Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: isMobile ? 2 : 3 }}>
        <IconButton 
          onClick={handleBackToResults}
          sx={{ 
            mr: 2,
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            '&:hover': {
              bgcolor: theme.palette.action.hover,
            },
            transition: 'all 0.2s ease-in-out',
          }}
          aria-label={t('hotelSearch.detail.backToSearchResults')}
        >
          <ArrowBackIcon />
        </IconButton>
        
        {!isSmallMobile && (
          <Breadcrumbs 
            aria-label="breadcrumb"
            sx={{
              '& .MuiBreadcrumbs-separator': {
                color: 'text.secondary',
              },
            }}
          >
            <Link 
              component="button" 
              variant="body2" 
              onClick={() => navigate('/hotels/search')}
              sx={{ 
                textDecoration: 'none',
                color: 'text.secondary',
                fontWeight: 500,
                '&:hover': {
                  color: 'text.primary',
                  textDecoration: 'underline',
                },
              }}
            >
              {t('hotelSearch.title')}
            </Link>
            <Link 
              component="button" 
              variant="body2" 
              onClick={handleBackToResults}
              sx={{ 
                textDecoration: 'none',
                color: 'text.secondary',
                fontWeight: 500,
                '&:hover': {
                  color: 'text.primary',
                  textDecoration: 'underline',
                },
              }}
            >
              {t('hotelSearch.results.title')}
            </Link>
            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
              {hotel?.name || t('hotelSearch.detail.hotelDetails')}
            </Typography>
          </Breadcrumbs>
        )}
      </Box>

      <DataState
        loading={hotelQuery.isLoading}
        error={hotelQuery.error}
        isEmpty={!hotel}
        loadingMessage={t('hotelSearch.detail.loadingHotelDetails')}
        fallbackErrorMessage={t('hotelSearch.detail.loadHotelError')}
        emptyTitle={t('hotelSearch.detail.hotelNotFoundTitle')}
        emptyMessage={t('hotelSearch.detail.hotelNotFoundMessage')}
        emptyAction={{
          label: t('hotelSearch.detail.searchHotels'),
          onClick: () => navigate('/hotels/search'),
        }}
        onRetry={() => {
          void hotelQuery.refetch();
        }}
        minHeight="60vh"
      >
        {hotel && (
        <>
          {/* Hotel Hero Image - Mobile Responsive */}
          <CardMedia
            component="img"
            height={isMobile ? "200" : "300"}
            image={getHotelImage('hero')}
            alt={hotel?.name || 'Hotel'}
            sx={{ 
              borderRadius: 2, 
              mb: isMobile ? 2 : 3,
              objectFit: 'cover',
            }}
          />

          {/* Hotel Information - Mobile Responsive */}
          <SurfaceCard 
            variantStyle="elevated"
            sx={{
              mb: isMobile ? 2 : 3,
            }}
            contentSx={{ p: isMobile ? 2 : 3 }}
          >
        {/* Mobile Layout - Stacked */}
        {isMobile ? (
          <Stack spacing={2}>
            <Box>
              <Typography 
                variant={isSmallMobile ? "h5" : "h4"} 
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700, 
                  color: COLORS.PRIMARY,
                  lineHeight: 1.2,
                }}
              >
                {hotel.name}
              </Typography>
              

              
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
                  backgroundColor: addAlpha(COLORS.PRIMARY, 0.1),
                  borderRadius: 1,
                }}
              >
                <Typography variant="h5" sx={{ 
                  color: COLORS.PRIMARY,
                  fontWeight: 700 
                }}>
                  {t('hotelSearch.detail.fromPrice')} {formatCurrencyWithDecimals(hotel.minPrice || 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {t('hotelSearch.detail.perNight')}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {t('hotelSearch.detail.upToPrice')} {formatCurrencyWithDecimals(hotel.maxPrice || 0)}
                </Typography>
              </Box>
            )}
          </Stack>
        ) : (
          /* Desktop Layout - Side by Side */
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: COLORS.PRIMARY }}>
                {hotel.name}
              </Typography>
              

              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <LocationIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1" color="text.secondary">
                  {hotel.address}, {hotel.city}, {hotel.country}
                </Typography>
              </Box>
            </Box>
            
            {searchRequest && (
              <Box sx={{ textAlign: 'right', ml: 3 }}>
                <Typography variant="h5" sx={{ 
                  color: COLORS.PRIMARY,
                  fontWeight: 700 
                }}>
                  {t('hotelSearch.detail.fromPrice')} {formatCurrencyWithDecimals(hotel.minPrice || 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {t('hotelSearch.detail.perNight')}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {t('hotelSearch.detail.upToPrice')} {formatCurrencyWithDecimals(hotel.maxPrice || 0)}
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
                  {formatEthiopianPhone(hotel.phone)}
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
                  {formatEthiopianPhone(hotel.phone)}
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

        {(hotel.checkInTime || hotel.checkOutTime || hotel.numberOfRooms || websiteUrl || amenityHighlights.length > 0) && (
          <Box sx={{ mt: 2.5 }}>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: amenityHighlights.length > 0 || websiteUrl ? 1.5 : 0 }}>
              {hotel.checkInTime && <Chip size="small" label={`${t('hotelSearch.detail.checkIn')} ${hotel.checkInTime}`} variant="outlined" />}
              {hotel.checkOutTime && <Chip size="small" label={`${t('hotelSearch.detail.checkOut')} ${hotel.checkOutTime}`} variant="outlined" />}
              {hotel.numberOfRooms && hotel.numberOfRooms > 0 && (
                <Chip size="small" label={t('hotelSearch.detail.roomsCount', { count: hotel.numberOfRooms })} variant="outlined" />
              )}
            </Stack>

            {websiteUrl && (
              <Link
                href={websiteUrl}
                target="_blank"
                rel="noreferrer"
                sx={{ display: 'inline-block', mb: amenityHighlights.length > 0 ? 1.5 : 0, fontWeight: 600 }}
              >
                {t('hotelSearch.detail.visitWebsite')}
              </Link>
            )}

            {amenityHighlights.length > 0 && (
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: COLORS.PRIMARY }}>
                  {t('hotelSearch.detail.guestAmenities')}
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {amenityHighlights.map((amenity) => (
                    <Chip key={amenity} size="small" label={amenity} sx={{ bgcolor: addAlpha(COLORS.PRIMARY, 0.08) }} />
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        )}

        {/* Search Summary */}
        {searchRequest && (
          <Box sx={{ 
            mt: 2, 
            p: 1.5, 
            backgroundColor: COLORS.BG_LIGHT, 
            borderRadius: 1 
          }}>
            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
              {t('hotelSearch.detail.showingAvailability')} {formatSearchSummary()}
            </Typography>
          </Box>
        )}
          </SurfaceCard>

          {/* Professional Rooms Section */}
          {searchRequest && hotel && (
            <SurfaceCard 
              variantStyle="elevated"
              sx={{}}
              contentSx={{ p: isMobile ? 2 : 3 }}
            >
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              sx={{ 
                fontWeight: 700, 
                mb: isMobile ? 1.5 : 2,
                fontSize: isMobile ? '1.1rem' : undefined,
                color: COLORS.PRIMARY,
              }}
            >
              {useRoomTypes ? 
                t('hotelSearch.detail.availableRoomTypes', { count: hotel.roomTypeAvailability?.length || 0 }) :
                t('hotelSearch.detail.availableRooms', { count: hotel.availableRooms?.length || 0 })
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
                // Display room types - 3 columns horizontally
                hotel.roomTypeAvailability?.map((roomType) => (
                  <Grid 
                    item 
                    xs={12} 
                    sm={4} 
                    md={4} 
                    lg={4} 
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
                {t('hotelSearch.detail.noRoomsAvailableTitle')}
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
                {t('hotelSearch.detail.noRoomsAvailableMessage')}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontSize: isMobile ? '0.8rem' : undefined,
                }}
              >
                {t('hotelSearch.detail.noRoomsAvailableHint')}
              </Typography>
            </Box>
          )}
            </SurfaceCard>
          )}

          {/* No Search Request - Hotel Info Only - Mobile Responsive */}
          {!searchRequest && (
            <SurfaceCard 
              variantStyle="subtle"
              sx={{
                textAlign: 'center',
              }}
              contentSx={{ p: isMobile ? 3 : 4 }}
            >
              <Typography variant="h5" color="text.primary" gutterBottom sx={{ fontWeight: 700 }}>
                {t('hotelSearch.detail.searchForAvailability')}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ fontWeight: 500 }}>
                {t('hotelSearch.detail.searchForAvailabilityDescription')}
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={() => navigate('/hotels/search')}
                  size="large"
                >
                  {t('hotelSearch.detail.searchHotels')}
                </Button>
              </Box>
            </SurfaceCard>
          )}
        </>
        )}
      </DataState>
    </Container>
  );
};

export default HotelDetailPage;
