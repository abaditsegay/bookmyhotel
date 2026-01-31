import React, { useState } from 'react';
import {
  Paper,
  Grid,
  Typography,
  Box,
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
import { useNotification } from '../common/NotificationSystem';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import { COLORS, addAlpha } from '../../theme/themeColors';

interface HotelSearchFormProps {
  onSearch: (searchRequest: HotelSearchRequest) => void;
  loading?: boolean;
}

const HotelSearchForm: React.FC<HotelSearchFormProps> = ({ onSearch, loading = false }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { showNotification } = useNotification();
  
  const [location, setLocation] = useState('');
  const [checkInDate, setCheckInDate] = useState<Date | null>(addDays(new Date(), 7));
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(addDays(new Date(), 9));
  const [guests, setGuests] = useState(1);

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
    <Paper 
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4, md: 3 },
          mb: { xs: 2, sm: 3 },
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          borderRadius: 1,
          background: theme.palette.background.paper,
          border: `2px solid ${COLORS.PRIMARY}`,
          boxShadow: `0 2px 8px ${addAlpha(COLORS.PRIMARY, 0.1)}`,
        }}
      >
        {/* Mobile-Optimized Header */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: { xs: 3, md: 4 },
          px: { xs: 1, sm: 0 },
        }}>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h2"
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              fontSize: { 
                xs: '1.5rem',   // 24px - Mobile friendly
                sm: '1.75rem',  // 28px - Small tablet
                md: '2rem'      // 32px - Desktop
              },
              color: COLORS.PRIMARY,
              lineHeight: 1.2,
              mb: 1,
            }}
          >
            {t('hotelSearch.title')}
          </Typography>
          {isMobile && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontSize: '0.9rem',
                px: 2,
              }}
            >
              {t('hotelSearch.subtitle')}
            </Typography>
          )}
        </Box>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={{ xs: 3, md: 3 }}>
            {/* Location Field - Mobile-First */}
            <Grid item xs={12} md={6}>
              <PremiumTextField
                label={t('hotelSearch.form.destination')}
                placeholder={isMobile ? "Where are you going?" : t('hotelSearch.form.destinationPlaceholder')}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                helperText={t('hotelSearch.form.destinationHelper')}
                fullWidth
                InputProps={{
                  startAdornment: <LocationOnIcon sx={{ mr: 1, color: COLORS.PRIMARY }} />,
                }}
              />
            </Grid>

            {/* Guests Field - Mobile-First */}
            <Grid item xs={12} md={6}>
              <PremiumTextField
                label={t('hotelSearch.form.guests')}
                type="number"
                value={guests.toString()}
                onChange={(e) => setGuests(Number(e.target.value))}
                helperText={t('hotelSearch.form.guestsHelper')}
                fullWidth
                InputProps={{
                  startAdornment: <PeopleIcon sx={{ mr: 1, color: COLORS.PRIMARY }} />,
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
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mt: { xs: 2, md: 3 },
                px: { xs: 1, sm: 0 },
              }}>
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
                    fontWeight: 500,
                    width: { 
                      xs: '100%',
                      sm: 'auto',
                    },
                    maxWidth: { 
                      xs: 'none',
                      sm: '400px',
                    },
                    backgroundColor: COLORS.PRIMARY,
                    border: `2px solid ${COLORS.PRIMARY}`,
                    color: COLORS.WHITE,
                    '&:hover': {
                      backgroundColor: COLORS.SECONDARY,
                      borderColor: COLORS.SECONDARY,
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                    '&:disabled': {
                      backgroundColor: 'action.disabled',
                      color: 'action.disabled',
                      border: `2px solid ${addAlpha(COLORS.BLACK, 0.12)}`,
                    },
                  }}
                >
                  {loading ? t('hotelSearch.form.searching') : t('hotelSearch.form.searchButton')}
                </StandardButton>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
  );
};

export default HotelSearchForm;
