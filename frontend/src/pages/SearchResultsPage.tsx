import React, { useEffect, useMemo, useState } from 'react';
import { COLORS, addAlpha } from '../theme/themeColors';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Typography,
  Box,
  Snackbar,
  Container,
  useMediaQuery,
  useTheme,
  Stack,
  Button,
} from '@mui/material';

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HotelDetailsCard from '../components/hotel/HotelDetailsCard';
import { DataState } from '../components/common';
import { PageHeader, SurfaceCard } from '../components/ui';
import { usePublicHotelSearchResults, PublicHotelSearchLocationState, formatHotelSearchSummary } from '../hooks/usePublicHotelSearchResults';
import { 
  HotelSearchResult,
  AvailableRoom,
} from '../types/hotel';

const SearchResultsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const locationState = (location.state as PublicHotelSearchLocationState | null) ?? null;
  const { searchRequest, hotels, successMessage: initialSuccessMessage, isLoading, error, hasSearchRequest, refetch } =
    usePublicHotelSearchResults(locationState);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!hasSearchRequest) {
      navigate('/hotels/search', { replace: true });
    }
  }, [hasSearchRequest, navigate]);

  useEffect(() => {
    if (initialSuccessMessage) {
      setSuccessMessage(initialSuccessMessage);
    }
  }, [initialSuccessMessage]);

  const handleBookRoom = async (hotelId: number, roomId: number, asGuest: boolean = false) => {
    const hotel = hotels.find((h: HotelSearchResult) => h.id === hotelId);
    if (!hotel) return;
    
    const room = hotel.availableRooms.find((availableRoom: AvailableRoom) => availableRoom.id === roomId);
    if (!room) return;

    if (asGuest) {
      // For explicit guest bookings, navigate directly to booking page
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
      // For "Sign in to Book" when user is not authenticated, redirect to login page
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
      // For authenticated users who want to book with their account
      navigate('/booking', {
        state: {
          room,
          hotelName: hotel.name,
          hotelId: hotelId,
          searchRequest: searchRequest,
          asGuest: false // Authenticated user booking
        }
      });
    }
  };

  const handleBookRoomType = async (hotelId: number, roomType: string, asGuest: boolean = false) => {
    const hotel = hotels.find((h: HotelSearchResult) => h.id === hotelId);
    if (!hotel) return;
    
    const roomTypeInfo = hotel.roomTypeAvailability?.find((rt: any) => rt.roomType === roomType);
    if (!roomTypeInfo) return;

    if (asGuest) {
      // For explicit guest bookings, navigate directly to booking page
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
      // For "Sign in to Book" when user is not authenticated, redirect to login page
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
      // For authenticated users who want to book with their account
      navigate('/booking', {
        state: {
          roomType: roomTypeInfo,
          hotelName: hotel.name,
          hotelId: hotelId,
          searchRequest: searchRequest,
          asGuest: false // Authenticated user booking
        }
      });
    }
  };

  const handleCloseSuccess = () => {
    setSuccessMessage('');
  };

  const handleBackToSearch = () => {
    navigate('/hotels/search', { 
      state: { 
        searchRequest: searchRequest 
      } 
    });
  };

  const searchSummary = useMemo(
    () =>
      formatHotelSearchSummary(searchRequest, {
        inLabel: t('hotelSearch.summary.in'),
        fromLabel: t('hotelSearch.summary.from'),
        toLabel: t('hotelSearch.summary.to'),
        forLabel: t('hotelSearch.summary.for'),
        guestSingular: t('hotelSearch.summary.guestSingle'),
        guestPlural: t('hotelSearch.summary.guestPlural'),
      }),
    [searchRequest, t],
  );

  if (!hasSearchRequest) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container 
        maxWidth="lg" 
        sx={{ 
          py: isMobile ? 2 : 4,
          px: isMobile ? 1 : 3,
        }}
      >
      <Box sx={{ mb: 3 }}>
        <Button 
          onClick={handleBackToSearch}
          variant="outlined"
          sx={{ 
            borderRadius: 1,
            textTransform: 'none',
            fontWeight: 500,
            borderColor: COLORS.SECONDARY,
            borderWidth: '2px',
            color: COLORS.PRIMARY,
            backgroundColor: COLORS.WHITE,
            '&:hover': {
              borderColor: COLORS.SECONDARY_HOVER,
              backgroundColor: COLORS.BG_LIGHT,
              borderWidth: '2px',
              transform: 'translateY(-1px)',
            },
          }}
        >
          {t('hotelSearch.results.backToSearch')}
        </Button>
      </Box>

      {/* Search Summary and Actions */}
      <SurfaceCard 
        variantStyle="default"
        sx={{ 
          mb: 3,
          boxShadow: `0 2px 8px ${addAlpha(COLORS.SECONDARY, 0.1)}`,
        }}
        contentSx={{ p: { xs: 2.5, md: 3 } }}
      >
        <PageHeader
          title={t('hotelSearch.results.title')}
          description={searchRequest ? `${t('hotelSearch.results.descriptionPrefix')} ${searchSummary}` : t('hotelSearch.results.loadingDescription')}
          actions={
            <Stack direction={isMobile ? 'column' : 'row'} spacing={2} justifyContent="flex-start">
              <Button 
                variant="outlined"
                onClick={handleBackToSearch}
                sx={{ 
                  borderRadius: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: addAlpha(COLORS.SECONDARY, 0.8),
                  borderWidth: '1px',
                  color: COLORS.PRIMARY,
                  backgroundColor: COLORS.BG_LIGHT,
                  '&:hover': {
                    borderColor: COLORS.SECONDARY_HOVER,
                    backgroundColor: COLORS.BG_DEFAULT,
                    borderWidth: '1px',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                {t('hotelSearch.results.modifySearch')}
              </Button>
            </Stack>
          }
        />
        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600, mt: 2 }}>
          {hotels.length === 1
            ? t('hotelSearch.results.hotelsFoundSingle', { count: hotels.length })
            : t('hotelSearch.results.hotelsFoundPlural', { count: hotels.length })}
        </Typography>
      </SurfaceCard>

      <DataState
        loading={isLoading}
        error={error}
        isEmpty={!isLoading && hotels.length === 0}
        loadingMessage={t('hotelSearch.results.searching')}
        fallbackErrorMessage={t('hotelSearch.results.refreshError')}
        emptyTitle={t('hotelSearch.results.emptyTitle')}
        emptyMessage={t('hotelSearch.results.emptyMessage')}
        emptyAction={{
          label: t('hotelSearch.results.modifySearch'),
          onClick: handleBackToSearch,
          variant: 'contained',
        }}
        onRetry={() => {
          void refetch();
        }}
        minHeight="40vh"
      >
        <Box>
          {hotels.map((hotel, index) => (
            <Box key={hotel.id} sx={{ mb: isMobile ? 2 : 3 }}>
              <HotelDetailsCard
                hotel={hotel}
                onBookRoom={handleBookRoom}
                onBookRoomType={handleBookRoomType}
                defaultExpanded={index === 0}
                horizontalLayout={true}
              />
            </Box>
          ))}
        </Box>
      </DataState>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
      </Container>
    </Box>
  );
};

export default SearchResultsPage;
