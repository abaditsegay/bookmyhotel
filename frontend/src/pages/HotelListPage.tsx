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
  Button,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import HotelListCard from '../components/hotel/HotelListCard';
import { DataState, PageContainer } from '../components/common';
import { PageHeader, SurfaceCard } from '../components/ui';
import { PublicHotelSearchLocationState, usePublicHotelSearchResults, formatHotelSearchSummary } from '../hooks/usePublicHotelSearchResults';

const HotelListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
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
        py: isMobile ? 2 : 4,
        px: isMobile ? 1 : 3,
        minHeight: '100vh',
        background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${theme.palette.background.default} 42%, ${theme.palette.background.paper} 100%)`,
      }}
    >
      {/* Combined Header and Actions Section */}
      <SurfaceCard 
        variantStyle="elevated"
        sx={{ 
          mb: isMobile ? 3 : 4,
          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
        }}
        contentSx={{ p: { xs: 2, md: 2.5 } }}
      >
          {/* Combined Header Section */}
          <Box sx={{ 
            p: { xs: 1, md: 1.5 },
            bgcolor: 'transparent',
          }}>
            <PageHeader
              title={t('hotelSearch.results.title')}
              description={`${t('hotelSearch.results.descriptionPrefix')} ${searchSummary}`}
            />
            
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 2,
              mb: 2,
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  display: 'inline-block',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  px: 2,
                  py: 0.75,
                  borderRadius: 1,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: `1px solid ${theme.palette.secondary.main}`,
                }}
              >
                {hotels.length === 1
                  ? t('hotelSearch.results.hotelsFoundSingle', { count: hotels.length })
                  : t('hotelSearch.results.hotelsFoundPlural', { count: hotels.length })}
              </Typography>
              
              <Button 
                onClick={handleBackToSearch}
                sx={{ 
                  py: 1,
                  px: 2.5,
                  bgcolor: 'common.white',
                  color: 'primary.main',
                  border: `1px solid ${theme.palette.secondary.main}`,
                  borderRadius: 1,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  minWidth: 'auto',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    borderColor: theme.palette.secondary.dark,
                  },
                }}
              >
                {t('hotelSearch.results.modifySearch')}
              </Button>
            </Box>
          </Box>
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
        <Box>
          <Grid 
            container 
            spacing={isMobile ? 2 : 3}
          >
            {hotels.map((hotel) => (
              <Grid item xs={12} key={hotel.id}>
                <HotelListCard
                  hotel={hotel}
                  onViewHotel={handleViewHotel}
                />
              </Grid>
            ))}
          </Grid>
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
    </PageContainer>
  );
};

export default HotelListPage;
