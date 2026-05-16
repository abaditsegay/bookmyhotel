import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  alpha,
  Typography,
  Box,
  Snackbar,
  useMediaQuery,
  useTheme,
  Stack,
} from '@mui/material';

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HotelDetailsCard from '../components/hotel/HotelDetailsCard';
import { DataState, PageContainer } from '../components/common';
import { PageHeader, SurfaceCard } from '../components/ui';
import StandardButton from '../components/common/StandardButton';
import { usePublicHotelSearchResults, PublicHotelSearchLocationState, formatHotelSearchSummary } from '../hooks/usePublicHotelSearchResults';
import { getPageShellBackground } from '../theme/surfaces';
import { designSystem } from '../theme/designSystem';
import { tintedPanelSx } from '../theme/sxHelpers';
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
    <PageContainer
      maxWidth="lg"
      sx={{
        minHeight: '100vh',
        backgroundColor: getPageShellBackground(theme),
        py: isMobile ? 3 : 4,
      }}
    >
      <Stack spacing={designSystem.layout.sectionGap.md}>
      <Box>
        <StandardButton
          onClick={handleBackToSearch}
          variant="outlined"
          sx={{ 
            minWidth: 'auto',
          }}
        >
          {t('hotelSearch.results.backToSearch')}
        </StandardButton>
      </Box>

      {/* Search Summary and Actions */}
      <SurfaceCard 
        variantStyle="default"
        sx={{ 
          boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.06)}`,
        }}
        contentSx={{ p: { xs: 2.5, md: 3 } }}
      >
        <Stack spacing={2}>
          <PageHeader
            title={t('hotelSearch.results.title')}
            description={searchRequest ? `${t('hotelSearch.results.descriptionPrefix')} ${searchSummary}` : t('hotelSearch.results.loadingDescription')}
          />
          <Box sx={{
            ...tintedPanelSx('primary'),
            display: 'flex',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 2,
          }}>
            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
              {hotels.length === 1
                ? t('hotelSearch.results.hotelsFoundSingle', { count: hotels.length })
                : t('hotelSearch.results.hotelsFoundPlural', { count: hotels.length })}
            </Typography>
            <StandardButton variant="outlined" onClick={handleBackToSearch} sx={{ minWidth: 'auto' }}>
              {t('hotelSearch.results.modifySearch')}
            </StandardButton>
          </Box>
        </Stack>
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
      </Stack>
    </PageContainer>
  );
};

export default SearchResultsPage;
