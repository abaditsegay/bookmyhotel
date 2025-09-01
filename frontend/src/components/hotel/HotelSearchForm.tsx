import React, { useState } from 'react';
import {
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { 
  Search as SearchIcon, 
  LocationOn as LocationIcon, 
  People as PeopleIcon 
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { HotelSearchRequest } from '../../types/hotel';

interface HotelSearchFormProps {
  onSearch: (searchRequest: HotelSearchRequest) => void;
  loading?: boolean;
}

const HotelSearchForm: React.FC<HotelSearchFormProps> = ({ onSearch, loading = false }) => {
  const { t } = useTranslation();
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
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
          Find Your Perfect Stay
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Location Field */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('hotelSearch.form.destination')}
                placeholder={t('hotelSearch.form.destinationPlaceholder')}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Guests Field */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label={t('hotelSearch.form.guests')}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                inputProps={{ min: 1, max: 10 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PeopleIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Check-in Date */}
            <Grid item xs={12} md={6}>
              <DatePicker
                label={t('hotelSearch.form.checkin')}
                value={checkInDate}
                onChange={handleCheckInDateChange}
                minDate={dayjs()}
                format="MM/DD/YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
            </Grid>

            {/* Check-out Date */}
            <Grid item xs={12} md={6}>
              <DatePicker
                label={t('hotelSearch.form.checkout')}
                value={checkOutDate}
                onChange={handleCheckOutDateChange}
                minDate={checkInDate || dayjs().add(1, 'day')}
                format="MM/DD/YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
            </Grid>

            {/* Search Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={<SearchIcon />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976D2 30%, #1BA3D3 90%)',
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
