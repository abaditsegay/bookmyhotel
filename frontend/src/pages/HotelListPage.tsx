import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography,
  Box,
  Alert,
  Snackbar,
  Grid,
  useTheme,
  useMediaQuery,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import HotelListCard from '../components/hotel/HotelListCard';
import { DataState, PageContainer } from '../components/common';
import { PageHeader, SurfaceCard } from '../components/ui';
import StandardButton from '../components/common/StandardButton';
import { PublicHotelSearchLocationState, usePublicHotelSearchResults, formatHotelSearchSummary } from '../hooks/usePublicHotelSearchResults';
import { getPageShellBackground, getReadableAccentTextColor } from '../theme/surfaces';
import { designSystem } from '../theme/designSystem';
import { tintedPanelSx } from '../theme/sxHelpers';

const HotelListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const readableAccentColor = getReadableAccentTextColor(theme);

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

  const handleViewHotel = (hotelId: number) => {
    navigate(`/hotels/${hotelId}`, {
      state: {
        searchRequest: searchRequest
      }
    });
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
        py: isMobile ? 3 : 4,
        minHeight: '100vh',
        backgroundColor: getPageShellBackground(theme),
      }}
    >
      <Stack spacing={designSystem.layout.sectionGap.md}>
      <SurfaceCard 
        variantStyle="elevated"
        sx={{ 
          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
        }}
        contentSx={{ p: { xs: 2, md: 2.5 } }}
      >
          <Stack spacing={2}>
            <PageHeader
              title={t('hotelSearch.results.title')}
              description={`${t('hotelSearch.results.descriptionPrefix')} ${searchSummary}`}
            />
            
            <Box sx={{
              ...tintedPanelSx('primary'),
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 2,
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  display: 'inline-block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'text.primary',
                }}
              >
                {hotels.length === 1
                  ? t('hotelSearch.results.hotelsFoundSingle', { count: hotels.length })
                  : t('hotelSearch.results.hotelsFoundPlural', { count: hotels.length })}
              </Typography>
              
              <StandardButton 
                variant="outlined"
                onClick={handleBackToSearch}
                sx={{ 
                  minWidth: 'auto',
                  color: readableAccentColor,
                  borderColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.2),
                }}
              >
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
        fallbackErrorMessage={t('hotelSearch.results.refreshListError')}
        emptyTitle={t('hotelSearch.results.emptyTitle')}
        emptyMessage={t('hotelSearch.results.listEmptyMessage')}
        emptyAction={{
          label: t('hotelSearch.results.modifySearch'),
          onClick: handleBackToSearch,
          variant: 'outlined',
        }}
        onRetry={() => {
          void refetch();
        }}
        minHeight="40vh"
      >
        <Grid container spacing={isMobile ? 2 : 3}>
          {hotels.map((hotel) => (
            <Grid item xs={12} key={hotel.id}>
              <HotelListCard
                hotel={hotel}
                onViewHotel={handleViewHotel}
              />
            </Grid>
          ))}
        </Grid>
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

export default HotelListPage;
