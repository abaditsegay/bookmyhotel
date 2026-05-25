import React, { useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  Box,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addDays, format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { HotelSearchRequest } from '../../types/hotel';
import StandardButton from '../common/StandardButton';
import PremiumTextField from '../common/PremiumTextField';
import PremiumDatePicker from '../common/PremiumDatePicker';
import { SurfaceCard } from '../common';
import { useNotification } from '../common/NotificationSystem';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import { formActionsRowSx } from '../../theme/sxHelpers';

interface HotelSearchFormProps {
  onSearch: (searchRequest: HotelSearchRequest) => void;
  loading?: boolean;
  initialValues?: Partial<HotelSearchRequest> | null;
}

const defaultCheckInDate = () => addDays(new Date(), 7);
const defaultCheckOutDate = () => addDays(new Date(), 9);

const parseDateOrFallback = (value: string | undefined, fallback: Date): Date => {
  if (!value) {
    return fallback;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
};

const HotelSearchForm: React.FC<HotelSearchFormProps> = ({ onSearch, loading = false, initialValues = null }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { showNotification } = useNotification();
  
  const [location, setLocation] = useState(initialValues?.location || '');
  const [checkInDate, setCheckInDate] = useState<Date | null>(parseDateOrFallback(initialValues?.checkInDate, defaultCheckInDate()));
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(parseDateOrFallback(initialValues?.checkOutDate, defaultCheckOutDate()));
  const [guests, setGuests] = useState(initialValues?.guests || 1);

  useEffect(() => {
    setLocation(initialValues?.location || '');
    setCheckInDate(parseDateOrFallback(initialValues?.checkInDate, defaultCheckInDate()));
    setCheckOutDate(parseDateOrFallback(initialValues?.checkOutDate, defaultCheckOutDate()));
    setGuests(initialValues?.guests || 1);
  }, [initialValues?.location, initialValues?.checkInDate, initialValues?.checkOutDate, initialValues?.guests]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkInDate || !checkOutDate) {
      showNotification({
        type: 'warning',
        title: t('errors.required'),
        message: t('hotelSearch.errors.invalidDates'),
      });
      return;
    }

    if (checkInDate >= checkOutDate) {
      showNotification({
        type: 'error',
        title: t('errors.required'),
        message: t('hotelSearch.errors.invalidDates'),
      });
      return;
    }

    const searchRequest: HotelSearchRequest = {
      checkInDate: format(checkInDate, 'yyyy-MM-dd'),
      checkOutDate: format(checkOutDate, 'yyyy-MM-dd'),
      guests,
      location: location || undefined,
    };

    onSearch(searchRequest);
  };

  const handleCheckInDateChange = (newDate: Date | null) => {
    setCheckInDate(newDate);
    // If check-out is before new check-in, adjust it
    if (newDate && checkOutDate && newDate >= checkOutDate) {
      setCheckOutDate(addDays(newDate, 1));
    }
  };

  const handleCheckOutDateChange = (newDate: Date | null) => {
    setCheckOutDate(newDate);
  };

  return (
    <SurfaceCard
      variantStyle="elevated"
      contentSx={{
        p: { xs: 3, sm: 4, md: 4 },
      }}
    >
        <Stack sx={{ mb: { xs: 3, md: 4 }, px: { xs: 1, sm: 0 } }} spacing={2}>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h2"
            gutterBottom 
            sx={{ 
              fontSize: { 
                xs: '1.5rem',   // 24px - Mobile friendly
                sm: '1.75rem',  // 28px - Small tablet
                md: '2rem'      // 32px - Desktop
              },
              color: 'text.primary',
              lineHeight: 1.2,
            }}
          >
            {t('hotelSearch.title')}
          </Typography>
          <Typography 
            variant={isMobile ? 'body2' : 'body1'} 
            color="text.secondary"
            sx={{ px: isMobile ? 2 : 0 }}
          >
            {t('hotelSearch.subtitle')}
          </Typography>
        </Stack>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={{ xs: 3, md: 3 }}>
            {/* Location Field - Mobile-First */}
            <Grid item xs={12} md={6}>
              <PremiumTextField
                label={t('hotelSearch.form.destination')}
                placeholder={t('hotelSearch.form.destinationPlaceholder')}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                helperText={t('hotelSearch.form.destinationHelper')}
                fullWidth
                InputProps={{
                  startAdornment: <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>

            {/* Guests Field - Mobile-First */}
            <Grid item xs={12} md={6}>
              <PremiumTextField
                label={t('hotelSearch.form.guests')}
                type="number"
                value={guests.toString()}
                onChange={(e) => {
                  const parsedGuests = Number(e.target.value);
                  setGuests(Number.isNaN(parsedGuests) ? 1 : Math.min(10, Math.max(1, parsedGuests)));
                }}
                helperText={t('hotelSearch.form.guestsHelper')}
                fullWidth
                InputProps={{
                  startAdornment: <PeopleIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  inputProps: { min: 1, max: 10 }
                }}
              />
            </Grid>

            {/* Date Fields - Stack on mobile for better UX */}
            <Grid item xs={12} sm={6} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <PremiumDatePicker
                  label={t('hotelSearch.form.checkin')}
                  value={checkInDate}
                  onChange={handleCheckInDateChange}
                  minDate={new Date()}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <PremiumDatePicker
                  label={t('hotelSearch.form.checkout')}
                  value={checkOutDate}
                  onChange={handleCheckOutDateChange}
                  minDate={checkInDate || addDays(new Date(), 1)}
                />
              </LocalizationProvider>
            </Grid>

            {/* Search Button - Mobile-Optimized */}
            <Grid item xs={12}>
              <Box sx={{ ...formActionsRowSx, mt: { xs: 2, md: 3 }, px: { xs: 1, sm: 0 } }}>
                <StandardButton
                  type="submit"
                  variant="contained"
                  buttonSize="large"
                  disabled={loading}
                  sx={{
                    minHeight: { xs: '50px', md: '48px' },
                    px: { xs: 4, sm: 6, md: 4 },
                    py: { xs: 1.2, md: 1.1 },
                    fontSize: { 
                      xs: '1.05rem',
                      sm: '1.1rem', 
                      md: '1rem' 
                    },
                    fontWeight: 600,
                    width: { 
                      xs: '100%',
                      sm: 'auto',
                    },
                    maxWidth: { 
                      xs: 'none',
                      sm: '400px',
                    },
                  }}
                >
                  {loading ? t('hotelSearch.form.searching') : t('hotelSearch.form.searchButton')}
                </StandardButton>
              </Box>
            </Grid>
          </Grid>
        </form>
      </SurfaceCard>
  );
};

export default HotelSearchForm;
