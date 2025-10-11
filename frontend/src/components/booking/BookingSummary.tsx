import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Alert,
  alpha,
} from '@mui/material';
import { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/currencyUtils';
import { COLORS } from '../../theme/themeColors';

interface BookingSummaryProps {
  hotelName: string;
  roomData: {
    roomType: string;
    pricePerNight?: number;
  };
  checkInDate: Dayjs | null;
  checkOutDate: Dayjs | null;
  guests: number;
  nights: number;
  totalAmount: number;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  hotelName,
  roomData,
  checkInDate,
  checkOutDate,
  guests,
  nights,
  totalAmount,
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ position: 'sticky', top: 24 }}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 2,
          border: `1px solid ${alpha(COLORS.PRIMARY, 0.1)}`,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            bgcolor: COLORS.PRIMARY,
            color: 'white',
            p: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('booking.summary.title')}
          </Typography>
        </Box>
        
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
              {t('booking.summary.hotel')}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.PRIMARY }}>
              {hotelName}
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
              {t('booking.summary.roomType')}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {roomData.roomType}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">{t('booking.summary.checkIn')}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {checkInDate?.format('MMM DD, YYYY')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">{t('booking.summary.checkOut')}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {checkOutDate?.format('MMM DD, YYYY')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">{t('booking.summary.guests')}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {guests} {t(guests === 1 ? 'booking.summary.guest' : 'booking.summary.guestsPlural')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">{t('booking.summary.nights')}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {nights} {t(nights === 1 ? 'booking.summary.night' : 'booking.summary.nightsPlural')}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">
                {t('booking.summary.pricePerNight', { 
                  price: formatCurrency(roomData.pricePerNight || 0), 
                  nights: nights 
                })}
              </Typography>
              <Typography variant="body2">
                {formatCurrency((roomData.pricePerNight || 0) * nights)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">{t('booking.summary.taxesAndFees')}</Typography>
              <Typography variant="body2">
                {formatCurrency(0)}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.PRIMARY }}>
              {t('booking.summary.total')}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.PRIMARY }}>
              {formatCurrency(totalAmount || 0)}
            </Typography>
          </Box>

          <Alert 
            severity="info" 
            sx={{ 
              borderRadius: 2,
              bgcolor: alpha(COLORS.PRIMARY, 0.05),
              color: COLORS.PRIMARY,
              '& .MuiAlert-icon': { color: COLORS.PRIMARY },
            }}
          >
            <Typography variant="caption">
              {t('booking.summary.cancellationPolicy')}
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BookingSummary;