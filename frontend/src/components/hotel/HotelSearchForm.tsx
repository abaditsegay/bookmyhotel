import React, { useState } from 'react';
import {
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { HotelSearchRequest } from '../../types/hotel';

interface HotelSearchFormProps {
  onSearch: (searchRequest: HotelSearchRequest) => void;
  loading?: boolean;
}

const HotelSearchForm: React.FC<HotelSearchFormProps> = ({ onSearch, loading = false }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [location, setLocation] = useState('');
  const [checkInDate, setCheckInDate] = useState<Dayjs | null>(dayjs().add(7, 'day'));
  const [checkOutDate, setCheckOutDate] = useState<Dayjs | null>(dayjs().add(9, 'day'));
  const [guests, setGuests] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkInDate || !checkOutDate) {
      alert('Please select check-in and check-out dates');
      return;
    }

    if (checkInDate >= checkOutDate) {
      alert('Check-out date must be after check-in date');
      return;
    }

    const searchRequest: HotelSearchRequest = {
      checkInDate: checkInDate.format('YYYY-MM-DD'),
      checkOutDate: checkOutDate.format('YYYY-MM-DD'),
      guests,
      location: location || undefined,
    };

    onSearch(searchRequest);
  };

  const handleCheckInDateChange = (newDate: Dayjs | null) => {
    setCheckInDate(newDate);
    // If check-out is before new check-in, adjust it
    if (newDate && checkOutDate && newDate >= checkOutDate) {
      setCheckOutDate(newDate.add(1, 'day'));
    }
  };

  const handleCheckOutDateChange = (newDate: Dayjs | null) => {
    setCheckOutDate(newDate);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
          border: `1px solid rgba(224, 224, 224, 0.3)`,
          boxShadow: 'none',
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
              color: 'primary.main',
              lineHeight: 1.2,
              mb: 1,
            }}
          >
            Find Your Perfect Stay
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
              Search and book your ideal hotel room
            </Typography>
          )}
        </Box>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={{ xs: 3, md: 3 }}>
            {/* Location Field - Mobile-First */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('hotelSearch.form.destination')}
                placeholder={isMobile ? "Where are you going?" : t('hotelSearch.form.destinationPlaceholder')}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    minHeight: { xs: '48px', md: '52px' },
                    fontSize: { xs: '1rem', md: '1rem' },
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 1,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.95rem', md: '1rem' },
                    fontWeight: 500,
                  },
                }}
              />
            </Grid>

            {/* Guests Field - Mobile-First */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label={t('hotelSearch.form.guests')}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                inputProps={{ 
                  min: 1, 
                  max: 10,
                  style: { fontSize: isMobile ? '1rem' : '1rem' }
                }}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    minHeight: { xs: '48px', md: '52px' },
                    fontSize: { xs: '1rem', md: '1rem' },
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 1,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.95rem', md: '1rem' },
                    fontWeight: 500,
                  },
                }}
              />
            </Grid>

            {/* Date Fields - Stack on mobile for better UX */}
            <Grid item xs={12} sm={6} md={6}>
              <DatePicker
                label={t('hotelSearch.form.checkin')}
                value={checkInDate}
                onChange={handleCheckInDateChange}
                minDate={dayjs()}
                format="MM/DD/YYYY"
                sx={{
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
                    minHeight: { xs: '48px', md: '52px' },
                    fontSize: { xs: '1rem', md: '1rem' },
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 1,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.95rem', md: '1rem' },
                    fontWeight: 500,
                  },
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    variant: 'outlined',
                  },
                  desktopPaper: {
                    sx: {
                      '& .MuiPickersDay-root': {
                        fontSize: isMobile ? '0.9rem' : '0.875rem',
                        minHeight: isMobile ? '40px' : '36px',
                        minWidth: isMobile ? '40px' : '36px',
                      },
                    },
                  },
                  mobilePaper: {
                    sx: {
                      '& .MuiPickersDay-root': {
                        fontSize: '1rem',
                        minHeight: '44px',
                        minWidth: '44px',
                      },
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <DatePicker
                label={t('hotelSearch.form.checkout')}
                value={checkOutDate}
                onChange={handleCheckOutDateChange}
                minDate={checkInDate || dayjs().add(1, 'day')}
                format="MM/DD/YYYY"
                sx={{
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
                    minHeight: { xs: '48px', md: '52px' },
                    fontSize: { xs: '1rem', md: '1rem' },
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 1,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.95rem', md: '1rem' },
                    fontWeight: 500,
                  },
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    variant: 'outlined',
                  },
                  desktopPaper: {
                    sx: {
                      '& .MuiPickersDay-root': {
                        fontSize: isMobile ? '0.9rem' : '0.875rem',
                        minHeight: isMobile ? '40px' : '36px',
                        minWidth: isMobile ? '40px' : '36px',
                      },
                    },
                  },
                  mobilePaper: {
                    sx: {
                      '& .MuiPickersDay-root': {
                        fontSize: '1rem',
                        minHeight: '44px',
                        minWidth: '44px',
                      },
                    },
                  },
                }}
              />
            </Grid>

            {/* Search Button - Mobile-Optimized */}
            <Grid item xs={12}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mt: { xs: 2, md: 3 },
                px: { xs: 1, sm: 0 },
              }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    minHeight: { xs: '50px', md: '48px' },
                    px: { xs: 4, sm: 6, md: 4 },
                    py: { xs: 1.2, md: 1.1 },
                    borderRadius: 1,
                    fontSize: { 
                      xs: '1.05rem',
                      sm: '1.1rem', 
                      md: '1rem' 
                    },
                    fontWeight: 500,
                    textTransform: 'none',
                    width: { 
                      xs: '100%',
                      sm: 'auto',
                    },
                    maxWidth: { 
                      xs: 'none',
                      sm: '400px',
                    },
                    boxShadow: 'none',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: 'none',
                      transform: 'none',
                      opacity: 0.9,
                    },
                    '&:active': {
                      transform: 'none',
                    },
                    '&:disabled': {
                      backgroundColor: 'action.disabled',
                      color: 'action.disabled',
                    },
                  }}
                >
                  {loading ? t('hotelSearch.form.searching') : t('hotelSearch.form.searchButton')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </LocalizationProvider>
  );
};

export default HotelSearchForm;
