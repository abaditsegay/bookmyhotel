import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Alert,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { formatCurrencyWithDecimals } from '../../utils/currencyUtils';
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
  vatRate?: number;
  serviceTaxRate?: number;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  hotelName,
  roomData,
  checkInDate,
  checkOutDate,
  guests,
  nights,
  totalAmount,
  vatRate = 0,
  serviceTaxRate = 0,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Calculate pricing breakdown
  const subtotal = (roomData.pricePerNight || 0) * nights;
  const vatAmount = subtotal * vatRate;
  const serviceTaxAmount = subtotal * serviceTaxRate;
  const calculatedTotal = subtotal + vatAmount + serviceTaxAmount;

  return (
    <Box sx={{ position: { xs: 'relative', md: 'sticky' }, top: 24 }}>
      <Card
        elevation={0}
        sx={{
          borderRadius: { xs: 1, md: 2 },
          border: `1px solid ${alpha(COLORS.PRIMARY, 0.1)}`,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            bgcolor: COLORS.PRIMARY,
            color: 'white',
            p: { xs: 1.5, md: 2 },
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '1.1rem', md: '1.25rem' },
            }}
          >
            {t('booking.summary.title')}
          </Typography>
        </Box>
        
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ mb: { xs: 2, md: 3 } }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: 'text.secondary', 
                mb: 1,
                fontSize: { xs: '0.75rem', md: '0.875rem' },
              }}
            >
              {t('booking.summary.hotel')}
            </Typography>
            <Typography 
              variant={isMobile ? 'body1' : 'h6'} 
              sx={{ 
                fontWeight: 600, 
                color: COLORS.PRIMARY,
                fontSize: { xs: '1rem', md: '1.25rem' },
              }}
            >
              {hotelName}
            </Typography>
          </Box>

          <Box sx={{ mb: { xs: 2, md: 3 } }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: 'text.secondary', 
                mb: 1,
                fontSize: { xs: '0.75rem', md: '0.875rem' },
              }}
            >
              {t('booking.summary.roomType')}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: 600,
                fontSize: { xs: '0.9rem', md: '1rem' },
              }}
            >
              {roomData.roomType}
            </Typography>
          </Box>

          <Divider sx={{ my: { xs: 1.5, md: 2 } }} />

          <Box sx={{ mb: { xs: 1.5, md: 2 } }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mb: 1,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 0.5, sm: 0 },
            }}>
              <Typography 
                variant="body2"
                sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
              >
                {t('booking.summary.checkIn')}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '0.8rem', md: '0.875rem' },
                }}
              >
                {checkInDate?.format('MMM DD, YYYY')}
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mb: 1,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 0.5, sm: 0 },
            }}>
              <Typography 
                variant="body2"
                sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
              >
                {t('booking.summary.checkOut')}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '0.8rem', md: '0.875rem' },
                }}
              >
                {checkOutDate?.format('MMM DD, YYYY')}
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mb: 1,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 0.5, sm: 0 },
            }}>
              <Typography 
                variant="body2"
                sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
              >
                {t('booking.summary.guests')}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '0.8rem', md: '0.875rem' },
                }}
              >
                {guests} {t(guests === 1 ? 'booking.summary.guest' : 'booking.summary.guestsPlural')}
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 0.5, sm: 0 },
            }}>
              <Typography 
                variant="body2"
                sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
              >
                {t('booking.summary.nights')}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '0.8rem', md: '0.875rem' },
                }}
              >
                {nights} {t(nights === 1 ? 'booking.summary.night' : 'booking.summary.nightsPlural')}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: { xs: 1.5, md: 2 } }} />

          <Box sx={{ mb: { xs: 1.5, md: 2 } }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mb: 1,
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: { xs: 0.5, sm: 0 },
            }}>
              <Typography 
                variant="body2"
                sx={{ 
                  fontSize: { xs: '0.8rem', md: '0.875rem' },
                  flex: { xs: 'none', sm: 1 },
                }}
              >
                {formatCurrencyWithDecimals(roomData.pricePerNight || 0)} × {nights} {nights !== 1 ? 'nights' : 'night'}
              </Typography>
              <Typography 
                variant="body2"
                sx={{ 
                  fontSize: { xs: '0.8rem', md: '0.875rem' },
                  fontWeight: 600,
                }}
              >
                {formatCurrencyWithDecimals(subtotal)}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mb: 0.5,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 0.5, sm: 0 },
            }}>
              <Typography 
                variant="body2"
                sx={{ 
                  fontSize: { xs: '0.75rem', md: '0.8rem' },
                  fontStyle: 'italic',
                  color: 'text.secondary',
                }}
              >
                VAT ({vatRate > 0 ? (vatRate * 100).toFixed(2) : '0.00'}%)
              </Typography>
              <Typography 
                variant="body2"
                sx={{ 
                  fontSize: { xs: '0.75rem', md: '0.8rem' },
                  fontWeight: 500,
                  fontStyle: 'italic',
                  color: 'text.secondary',
                }}
              >
                {formatCurrencyWithDecimals(vatAmount)}
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mb: 1,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 0.5, sm: 0 },
            }}>
              <Typography 
                variant="body2"
                sx={{ 
                  fontSize: { xs: '0.75rem', md: '0.8rem' },
                  fontStyle: 'italic',
                  color: 'text.secondary',
                }}
              >
                Service Tax ({serviceTaxRate > 0 ? (serviceTaxRate * 100).toFixed(2) : '0.00'}%)
              </Typography>
              <Typography 
                variant="body2"
                sx={{ 
                  fontSize: { xs: '0.75rem', md: '0.8rem' },
                  fontWeight: 500,
                  fontStyle: 'italic',
                  color: 'text.secondary',
                }}
              >
                {formatCurrencyWithDecimals(serviceTaxAmount)}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: { xs: 1.5, md: 2 } }} />

          {/* Total Section with Distinct Background */}
          <Box sx={{ 
            backgroundColor: alpha(COLORS.PRIMARY, 0.08),
            borderRadius: 2,
            p: { xs: 1.5, md: 2 },
            mb: { xs: 1.5, md: 2 },
            border: `1px solid ${alpha(COLORS.PRIMARY, 0.15)}`,
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: { xs: 0.5, sm: 0 },
            }}>
              <Typography 
                variant={isMobile ? 'body1' : 'h6'} 
                sx={{ 
                  fontWeight: 700, 
                  color: COLORS.PRIMARY,
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                }}
              >
                {t('booking.summary.total')}
              </Typography>
              <Typography 
                variant={isMobile ? 'body1' : 'h6'} 
                sx={{ 
                  fontWeight: 700, 
                  color: COLORS.PRIMARY,
                  fontSize: { xs: '1.2rem', md: '1.25rem' },
                }}
              >
                {formatCurrencyWithDecimals(calculatedTotal)}
              </Typography>
            </Box>
          </Box>

          <Alert 
            severity="info" 
            sx={{ 
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
              color: 'text.secondary',
              '& .MuiAlert-icon': { color: 'primary.main' },
              mb: 2,
            }}
          >
            <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
              <strong>Note:</strong> Taxes will be calculated and applied at checkout based on your final bill.
            </Typography>
          </Alert>

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