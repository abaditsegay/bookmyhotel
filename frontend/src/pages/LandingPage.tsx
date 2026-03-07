import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import {
  Hotel as HotelIcon,
  Search as SearchIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Devices as DevicesIcon,
  SupportAgent as SupportIcon,
  Handshake as HandshakeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HotelSearchForm from '../components/hotel/HotelSearchForm';
import StandardCard from '../components/common/StandardCard';
import StandardButton from '../components/common/StandardButton';
import { StandardLoading, StandardError, ErrorBoundary } from '../components/common';
import { hotelApiService } from '../services/hotelApi';
import { HotelSearchRequest } from '../types/hotel';
import { COLORS, addAlpha, getGradient } from '../theme/themeColors';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (searchRequest: HotelSearchRequest) => {
    setLoading(true);
    setError('');
    try {
      const results = await hotelApiService.searchHotelsPublic(searchRequest);
      navigate('/hotels/search-results', { state: { searchRequest, hotels: results } });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('hotelSearch.errors.searchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const whyChooseUsItems = [
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      titleKey: 'hotelSearch.whyChooseUs.security.title',
      descKey: 'hotelSearch.whyChooseUs.security.description',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      titleKey: 'hotelSearch.whyChooseUs.performance.title',
      descKey: 'hotelSearch.whyChooseUs.performance.description',
    },
    {
      icon: <DevicesIcon sx={{ fontSize: 40 }} />,
      titleKey: 'hotelSearch.whyChooseUs.modern.title',
      descKey: 'hotelSearch.whyChooseUs.modern.description',
    },
    {
      icon: <SupportIcon sx={{ fontSize: 40 }} />,
      titleKey: 'hotelSearch.whyChooseUs.support.title',
      descKey: 'hotelSearch.whyChooseUs.support.description',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark'
          ? getGradient('dark')
          : getGradient('white'),
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          background: getGradient('primary'),
          color: '#fff',
          py: isMobile ? 5 : 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: isMobile ? 3 : 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <HotelIcon sx={{ fontSize: isMobile ? 36 : 48, mr: 1.5 }} />
              <Typography
                variant={isMobile ? 'h4' : 'h3'}
                component="h1"
                sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}
              >
                {t('landing.hero.title')}
              </Typography>
            </Box>
            <Typography
              variant={isMobile ? 'body1' : 'h6'}
              sx={{ opacity: 0.9, maxWidth: 600, mx: 'auto', fontWeight: 400 }}
            >
              {t('landing.hero.subtitle')}
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: isMobile ? -3 : -4, position: 'relative', zIndex: 1, pb: 6 }}>
        {/* Search Form Card */}
        <StandardCard
          elevation={3}
          sx={{
            mb: isMobile ? 4 : 6,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ p: isMobile ? 2 : 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SearchIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {t('landing.search.title')}
              </Typography>
            </Box>
            <ErrorBoundary level="component">
              <HotelSearchForm onSearch={handleSearch} loading={loading} />
            </ErrorBoundary>
            {error && (
              <Box sx={{ mt: 2 }}>
                <StandardError error={true} message={error} severity="error" showRetry={false} />
              </Box>
            )}
            <StandardLoading loading={loading} message={t('hotelSearch.form.searching')} size="large" overlay={false} />
          </Box>
        </StandardCard>

        {/* Find My Booking */}
        <StandardCard cardVariant="gradient" sx={{ mb: isMobile ? 4 : 6 }}>
          <Box sx={{ p: isMobile ? 2.5 : 4, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
              {t('hotelSearch.alreadyHaveBooking.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {t('hotelSearch.alreadyHaveBooking.subtitle')}
            </Typography>
            <StandardButton
              variant="contained"
              buttonSize="large"
              gradient
              fullWidth={isMobile}
              onClick={() => navigate('/find-booking')}
              sx={{
                py: 1.5,
                fontSize: '1.05rem',
                fontWeight: 600,
              }}
            >
              {t('hotelSearch.alreadyHaveBooking.button')}
            </StandardButton>
          </Box>
        </StandardCard>

        {/* Why Choose Us Section */}
        <Box sx={{ mb: isMobile ? 4 : 6, textAlign: 'center' }}>
          <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
            {t('hotelSearch.whyChooseUs.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            {t('hotelSearch.whyChooseUs.trustMessage')}
          </Typography>
          <Grid container spacing={3}>
            {whyChooseUsItems.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <StandardCard
                  elevation={0}
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ color: 'primary.main', mb: 2 }}>{item.icon}</Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      {t(item.titleKey)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t(item.descKey)}
                    </Typography>
                  </Box>
                </StandardCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ mb: isMobile ? 4 : 6 }} />

        {/* Partner With Us & Contact Us */}
        <Grid container spacing={isMobile ? 3 : 4}>
          {/* Partner With Us */}
          <Grid item xs={12} md={6}>
            <StandardCard
              elevation={0}
              sx={{
                height: '100%',
                border: `1px solid ${theme.palette.divider}`,
                background: theme.palette.mode === 'dark'
                  ? addAlpha(COLORS.PRIMARY, 0.08)
                  : addAlpha(COLORS.PRIMARY, 0.03),
              }}
            >
              <Box sx={{ p: isMobile ? 3 : 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HandshakeIcon sx={{ fontSize: 36, color: 'primary.main', mr: 1.5 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {t('landing.partner.title')}
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                  {t('landing.partner.description')}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {(['benefit1', 'benefit2', 'benefit3'] as const).map((key) => (
                    <Box key={key} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                          mr: 1.5,
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {t(`landing.partner.${key}`)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <StandardButton
                  variant="contained"
                  buttonSize="large"
                  gradient
                  fullWidth={isSmall}
                  onClick={() => navigate('/register-hotel')}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    fontWeight: 600,
                  }}
                >
                  {t('landing.partner.registerButton')}
                </StandardButton>
              </Box>
            </StandardCard>
          </Grid>

          {/* Contact Us */}
          <Grid item xs={12} md={6}>
            <StandardCard
              elevation={0}
              sx={{
                height: '100%',
                border: `1px solid ${theme.palette.divider}`,
                background: theme.palette.mode === 'dark'
                  ? addAlpha(COLORS.SECONDARY, 0.08)
                  : addAlpha(COLORS.SECONDARY, 0.03),
              }}
            >
              <Box sx={{ p: isMobile ? 3 : 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                  {t('landing.contact.title')}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                  {t('landing.contact.description')}
                </Typography>

                {/* Email */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <EmailIcon sx={{ fontSize: 28, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {t('landing.contact.emailLabel')}
                    </Typography>
                    <Typography
                      variant="body1"
                      component="a"
                      href={`mailto:${t('landing.contact.email')}`}
                      sx={{
                        fontWeight: 600,
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      {t('landing.contact.email')}
                    </Typography>
                  </Box>
                </Box>

                {/* Phone */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <PhoneIcon sx={{ fontSize: 28, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {t('landing.contact.phoneLabel')}
                    </Typography>
                    <Typography
                      variant="body1"
                      component="a"
                      href={`tel:${t('landing.contact.phone')}`}
                      sx={{
                        fontWeight: 600,
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      {t('landing.contact.phone')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </StandardCard>
          </Grid>
        </Grid>

        {/* Footer tagline */}
        <Box sx={{ textAlign: 'center', mt: isMobile ? 4 : 6, pb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t('landing.footer.tagline')}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
