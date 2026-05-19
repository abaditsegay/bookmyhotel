import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { BookingService } from '../services/BookingService';
import { useTranslation } from 'react-i18next';
import { designSystem } from '../theme/designSystem';
import PremiumTextField from '../components/common/PremiumTextField';
import StandardButton from '../components/common/StandardButton';
import { PageContainer, SurfaceCard } from '../components/common';
import {
  alpha,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Snackbar,
  useTheme,
  useMediaQuery,
  Link,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Download as DownloadIcon,
  Home as HomeIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useAuthenticatedApi } from '../hooks/useAuthenticatedApi';
import { useAuth } from '../contexts/AuthContext';
import { buildApiUrl } from '../config/apiConfig';
import { formatCurrencyWithDecimals } from '../utils/currencyUtils';
import { formatDateForDisplay, formatDateLongForDisplay, formatDateTimeForDisplay } from '../utils/dateUtils';
import { getPageShellBackground } from '../theme/surfaces';
import { formActionsRowSx, tintedPanelSx } from '../theme/sxHelpers';

// Print-specific CSS styles
const PRINT_COLORS = {
  BLACK: designSystem.colors.text.primary,
  WHITE: designSystem.colors.background.paper,
  BORDER_DEFAULT: designSystem.colors.divider,
} as const;

const printStyles = `
  @media screen {
    .print-only {
      display: none !important;
    }
  }
  
  @media print {
    .no-print {
      display: none !important;
    }
    
    .print-only {
      display: block !important;
    }
    
    body {
      margin: 0;
      padding: 0;
      font-size: 12pt;
      line-height: 1.4;
      color: ${PRINT_COLORS.BLACK} !important;
      background: white !important;
    }
    
    .print-container {
      margin: 0 !important;
      padding: 20pt !important;
      box-shadow: none !important;
      border: none !important;
      max-width: none !important;
    }
    
    .print-header {
      text-align: center;
      margin-bottom: 20pt;
    }
    
    .print-app-name {
      font-size: 20pt;
      font-weight: bold;
      margin-bottom: 10pt;
      color: ${PRINT_COLORS.BLACK} !important;
    }
    
    .print-title {
      font-size: 16pt;
      font-weight: bold;
      margin-bottom: 10pt;
      color: ${PRINT_COLORS.BLACK} !important;
    }
    
    .print-confirmation {
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 20pt;
      color: ${PRINT_COLORS.BLACK} !important;
    }
    
    .print-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20pt;
    }
    
    .print-table td {
      padding: 8pt;
      border: 1px solid ${PRINT_COLORS.BORDER_DEFAULT};
      vertical-align: top;
    }
    
    .print-table .label {
      width: 30%;
      font-weight: bold;
      background-color: ${PRINT_COLORS.WHITE};
    }
    
    .print-table .value {
      width: 70%;
    }
    
    .print-section {
      margin-bottom: 20pt;
    }
    
    .print-section-title {
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 10pt;
      color: ${PRINT_COLORS.BLACK} !important;
    }
    
    .print-bullet {
      margin-bottom: 5pt;
    }
    
    .print-footer {
      text-align: center;
      margin-top: 20pt;
      font-size: 12pt;
      color: ${PRINT_COLORS.BLACK} !important;
    }
  }
`;

// Add styles to document head
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('booking-print-styles');
  if (existingStyle) {
    existingStyle.remove();
  }
  const styleSheet = document.createElement('style');
  styleSheet.id = 'booking-print-styles';
  styleSheet.type = 'text/css';
  styleSheet.innerText = printStyles;
  document.head.appendChild(styleSheet);
}

interface BookingData {
  reservationId: number;
  confirmationNumber: string;
  guestName: string;
  guestEmail: string;
  numberOfGuests?: number;
  hotelId?: number;
  hotelName: string;
  hotelAddress: string;
  roomNumber?: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  pricePerNight: number;
  status: string;
  createdAt: string;
  paymentStatus: string;
  paymentReference?: string;
  paymentIntentId?: string;
  paymentType?: string;
  paymentProvider?: string;
  paymentUrl?: string;
  paymentQrCode?: string;
  paymentInstructions?: string;
  paymentExpiresAt?: string;
}

const BookingConfirmationPage: React.FC = () => {
  const { reservationId } = useParams<{ reservationId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { hotelApiService } = useAuthenticatedApi();
  const { token } = useAuth();
  const { t } = useTranslation();
  
  // Mobile responsiveness
  const theme = useTheme();
  const addAlpha = alpha;
  const COLORS = {
    PRIMARY: theme.palette.primary.main,
    PRIMARY_HOVER: theme.palette.primary.dark,
    SUCCESS: theme.palette.success.main,
    CHECKED_IN: theme.palette.success.dark,
    BOOKED: theme.palette.info.main,
    WHITE: theme.palette.common.white,
    BLACK: theme.palette.common.black,
    BORDER_DEFAULT: theme.palette.divider,
  } as const;
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [includeItinerary, setIncludeItinerary] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  // Tax rate states
  const [hotelVatRate, setHotelVatRate] = useState<number>(0);
  const [hotelServiceTaxRate, setHotelServiceTaxRate] = useState<number>(0);
  
  // Get booking data from location state if available (from successful booking)
  const locationBooking = location.state?.booking;
  const fromSearch = location.state?.fromSearch; // Flag indicating this came from search

  const fetchBookingData = useCallback(async () => {
    if (!reservationId) return;
    
    try {
      setLoading(true);
      const response = await hotelApiService.getBooking(Number(reservationId));
      setBooking(response);
      setEmailAddress(response.guestEmail);
    } catch (err) {
      setError('Failed to load booking details');
      // console.error('Error fetching booking:', err);
    } finally {
      setLoading(false);
    }
  }, [reservationId, hotelApiService]);

  useEffect(() => {
    if (locationBooking) {
      // Use booking data from successful booking flow or search
      setBooking(locationBooking);
      setEmailAddress(locationBooking.guestEmail);
      setLoading(false);
    } else if (reservationId && !fromSearch) {
      // Only fetch booking data if not from search (to avoid auth issues for guests)
      fetchBookingData();
    } else {
      setError(t('bookingConfirmation.errorNoBookingInformation'));
      setLoading(false);
    }
  }, [reservationId, locationBooking, fromSearch, fetchBookingData, t]);

  // Fetch hotel tax rates when booking data is available
  useEffect(() => {
    const fetchTaxRates = async () => {
      if (!booking?.hotelId) {
        // console.log('🏨 Cannot fetch tax rates - missing hotelId');
        return;
      }
      
      try {
        // console.log('🔍 Fetching tax rates for hotel:', booking.hotelId);
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(buildApiUrl(`/hotels/${booking.hotelId}/tax-rate`), {
          headers
        });
        
        if (response.ok) {
          const taxData = await response.json();
          // console.log('📊 Tax rates loaded:', taxData);
          setHotelVatRate(taxData.vatRate || 0);
          setHotelServiceTaxRate(taxData.serviceTaxRate || 0);
        } else {
          // console.error('Failed to fetch tax rates:', response.status);
          // Set default tax rates if fetch fails
          setHotelVatRate(0);
          setHotelServiceTaxRate(0);
        }
      } catch (error) {
        // console.error('Error fetching tax rates:', error);
        // Set default tax rates if error occurs
        setHotelVatRate(0);
        setHotelServiceTaxRate(0);
      }
    };
    
    fetchTaxRates();
  }, [booking?.hotelId, token]);

  const calculateNights = (checkIn: string, checkOut: string) => {
    // Parse as local dates to avoid timezone conversion issues
    const [checkInYear, checkInMonth, checkInDay] = checkIn.split('-').map(Number);
    const [checkOutYear, checkOutMonth, checkOutDay] = checkOut.split('-').map(Number);
    
    const checkInDate = new Date(checkInYear, checkInMonth - 1, checkInDay);
    const checkOutDate = new Date(checkOutYear, checkOutMonth - 1, checkOutDay);
    
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString: string) => {
    return formatDateForDisplay(dateString);
  };

  const formatDateLong = (dateString: string) => {
    return formatDateLongForDisplay(dateString);
  };

  const formatDateTimeLong = (dateTimeString: string) => {
    return formatDateTimeForDisplay(dateTimeString);
  };

  const formatCurrency = (amount: number) => {
    // Format currency with thousand separators
    return `ETB ${amount.toLocaleString('en-US', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    })}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'booked': return 'primary';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'checked in': return 'info';
      case 'checked out': return 'default';
      default: return 'default';
    }
  };

  const formatPaymentStatus = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAY_AT_FRONTDESK': return t('bookingConfirmation.status.payAtFrontDesk');
      case 'PAID':
      case 'COMPLETED': return t('booking.paymentStatus.completed');
      case 'PROCESSING': return t('booking.paymentStatus.processing');
      case 'PENDING': return t('booking.paymentStatus.pending');
      case 'FAILED': return t('booking.paymentStatus.failed');
      case 'CANCELLED': return t('bookingConfirmation.status.cancelled');
      case 'REFUNDED': return t('bookingConfirmation.status.refunded');
      case 'PARTIALLY_REFUNDED': return t('bookingConfirmation.status.partiallyRefunded');
      case 'FORFEITED': return t('bookingConfirmation.status.forfeited');
      default: return status;
    }
  };

  const formatBookingStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'booked':
      case 'confirmed':
        return t('bookingConfirmation.status.confirmed');
      case 'pending':
        return t('bookingConfirmation.status.pending');
      case 'cancelled':
        return t('bookingConfirmation.status.cancelled');
      case 'checked in':
      case 'checked_in':
        return t('bookingConfirmation.status.checkedIn');
      case 'checked out':
      case 'checked_out':
        return t('bookingConfirmation.status.checkedOut');
      default:
        return status;
    }
  };

  const isEthiopianPendingPayment = Boolean(
    booking &&
    booking.paymentStatus?.toUpperCase() === 'PROCESSING' &&
    booking.paymentProvider &&
    ['MBIRR', 'TELEBIRR'].indexOf(booking.paymentProvider.toUpperCase()) !== -1
  );

  const formatPaymentExpiry = (dateTimeString?: string) => {
    if (!dateTimeString) {
      return null;
    }

    const formatted = formatDateTimeForDisplay(dateTimeString);
    if (!formatted) {
      return null;
    }

    return formatted;
  };

  // Calculate price breakdown with taxes
  const calculatePriceBreakdown = () => {
    if (!booking) {
      return {
        subtotal: 0,
        vatAmount: 0,
        serviceTaxAmount: 0,
        total: 0,
      };
    }

    const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
    const subtotal = booking.pricePerNight * nights;
    // Tax rates are already decimals (e.g., 0.15 for 15%), so multiply directly
    const vatAmount = subtotal * hotelVatRate;
    const serviceTaxAmount = subtotal * hotelServiceTaxRate;
    const total = subtotal + vatAmount + serviceTaxAmount;

    return {
      subtotal,
      vatAmount,
      serviceTaxAmount,
      total,
    };
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmailBooking = async () => {
    if (!emailAddress.trim() || !booking) {
      return;
    }

    try {
      setSendingEmail(true);
      await hotelApiService.sendBookingEmail(booking.reservationId, emailAddress, includeItinerary);
      setEmailDialogOpen(false);
      setSnackbarMessage(t('bookingConfirmation.messages.emailSuccess'));
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      // console.error('Error sending email:', err);
      let errorMessage = t('bookingConfirmation.messages.emailError') + ' ';
      
      if (err instanceof Error) {
        if (err.message.includes('500')) {
          errorMessage += t('bookingConfirmation.messages.emailErrorServer');
        } else if (err.message.includes('400')) {
          errorMessage += t('bookingConfirmation.messages.emailErrorInvalid');
        } else {
          errorMessage += t('bookingConfirmation.messages.emailErrorRetry');
        }
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!booking) return;
    
    try {
      setDownloadingPDF(true);
      await hotelApiService.downloadBookingPDF(booking.reservationId);
      setSnackbarMessage(t('bookingConfirmation.messages.pdfSuccess'));
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      // console.error('Error downloading PDF:', err);
      let errorMessage = t('bookingConfirmation.messages.pdfError') + ' ';
      
      if (err instanceof Error) {
        if (err.message.includes('500')) {
          errorMessage += t('bookingConfirmation.messages.pdfErrorServer');
        } else if (err.message.includes('404')) {
          errorMessage += t('bookingConfirmation.messages.pdfErrorNotFound');
        } else if (err.message.includes('401') || err.message.includes('403')) {
          errorMessage += t('bookingConfirmation.messages.pdfErrorAuth');
        } else {
          errorMessage += t('bookingConfirmation.messages.pdfErrorRetry');
        }
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setDownloadingPDF(false);
    }
  };

  if (loading) {
    return (
      <PageContainer 
        maxWidth="md" 
        sx={{ 
          py: isMobile ? 4 : 8,
          backgroundColor: getPageShellBackground(theme),
          minHeight: '100vh',
        }}
      >
        <SurfaceCard elevation={0} contentSx={{ p: isMobile ? 3 : 6 }}>
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            minHeight={isMobile ? "300px" : "400px"}
          >
            <CircularProgress 
              size={isMobile ? 60 : 80} 
              thickness={4} 
              sx={{ color: theme.palette.primary.main, mb: isMobile ? 3 : 4 }} 
            />
            <Typography 
              variant={isMobile ? 'h6' : 'h5'} 
              component="div" 
              sx={{ 
                fontWeight: 'bold', 
                mb: 2,
                textAlign: 'center',
              }}
            >
              {t('bookingConfirmation.loading')}
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                textAlign: 'center',
                px: isMobile ? 2 : 0,
              }}
            >
              {t('bookingConfirmation.loadingSubtitle')}
            </Typography>
          </Box>
        </SurfaceCard>
      </PageContainer>
    );
  }

  if (error || !booking) {
    return (
      <PageContainer 
        maxWidth="md" 
        sx={{ 
          py: isMobile ? 4 : 8,
          backgroundColor: getPageShellBackground(theme),
          minHeight: '100vh',
        }}
      >
        <SurfaceCard elevation={0} contentSx={{ p: isMobile ? 3 : 6 }}>
          <Box sx={{ ...tintedPanelSx('error'), mb: isMobile ? 3 : 4 }}>
          <Alert severity="error" sx={{ mb: isMobile ? 3 : 4, borderRadius: 2 }}>
            <Typography 
              variant={isMobile ? 'subtitle1' : 'h6'} 
              sx={{ fontWeight: 'bold', mb: 1 }}
            >
              {error || t('bookingConfirmation.errorNotFound')}
            </Typography>
            <Typography variant="body2">
              {t('bookingConfirmation.errorDescription')}
            </Typography>
          </Alert>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <StandardButton
              variant="contained"
              onClick={() => navigate('/')}
              startIcon={<HomeIcon />}
              buttonSize="large"
              sx={{ 
                px: isMobile ? 3 : 4, 
                py: 1.5,
                minHeight: 48,
              }}
            >
              {t('bookingConfirmation.actions.returnHome')}
            </StandardButton>
          </Box>
        </SurfaceCard>
      </PageContainer>
    );
  }

  const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
  const priceBreakdown = calculatePriceBreakdown();

  // Print-only PDF format component
  const PrintOnlyLayout = () => (
    <div className="print-only">
      {/* Print Header */}
      <div className="print-header">
        <div className="print-app-name">{booking.hotelName}</div>
        <div className="print-title">{t('bookingConfirmation.print.title')}</div>
        <div className="print-confirmation">
          {t('bookingConfirmation.print.confirmationNumber', { confirmationNumber: booking.confirmationNumber })}
        </div>
      </div>

      {/* Print Details Table */}
      <table className="print-table">
        <tbody>
          <tr>
            <td className="label">{t('bookingConfirmation.print.labels.guestName')}</td>
            <td className="value">{booking.guestName}</td>
          </tr>
          <tr>
            <td className="label">{t('bookingConfirmation.print.labels.email')}</td>
            <td className="value">{booking.guestEmail}</td>
          </tr>
          <tr>
            <td className="label">{t('bookingConfirmation.print.labels.numberOfGuests')}</td>
            <td className="value">{booking.numberOfGuests || 1}</td>
          </tr>
          <tr>
            <td className="label">{t('bookingConfirmation.print.labels.hotel')}</td>
            <td className="value">{booking.hotelName}</td>
          </tr>
          <tr>
            <td className="label">{t('bookingConfirmation.print.labels.address')}</td>
            <td className="value">{booking.hotelAddress}</td>
          </tr>
          <tr>
            <td className="label">{t('bookingConfirmation.print.labels.roomType')}</td>
            <td className="value">{booking.roomType}</td>
          </tr>
          <tr>
            <td className="label">{t('bookingConfirmation.print.labels.roomAssignment')}</td>
            <td className="value">{t('bookingConfirmation.room.roomAssignmentMessage')}</td>
          </tr>
          <tr>
            <td className="label">{t('bookingConfirmation.print.labels.checkIn')}</td>
            <td className="value">{formatDateLong(booking.checkInDate)}</td>
          </tr>
          <tr>
            <td className="label">{t('bookingConfirmation.print.labels.checkOut')}</td>
            <td className="value">{formatDateLong(booking.checkOutDate)}</td>
          </tr>
          <tr>
            <td className="label">{t('bookingConfirmation.print.labels.nights')}</td>
            <td className="value">{nights}</td>
          </tr>
          <tr>
            <td className="label">{t('bookingConfirmation.print.labels.ratePerNight')}</td>
            <td className="value">{formatCurrency(booking.pricePerNight || 0)}</td>
          </tr>
          <tr>
            <td className="label">{t('bookingConfirmation.pricing.subtotal')}:</td>
            <td className="value">{formatCurrencyWithDecimals(priceBreakdown.subtotal)}</td>
          </tr>
          <tr>
            <td className="label">{t('bookingConfirmation.pricing.vat')} ({(hotelVatRate * 100).toFixed(2)}%):</td>
            <td className="value">{formatCurrencyWithDecimals(priceBreakdown.vatAmount)}</td>
          </tr>
          <tr>
            <td className="label">{t('bookingConfirmation.pricing.serviceTax')} ({(hotelServiceTaxRate * 100).toFixed(2)}%):</td>
            <td className="value">{formatCurrencyWithDecimals(priceBreakdown.serviceTaxAmount)}</td>
          </tr>
          <tr>
            <td className="label">{t('bookingConfirmation.pricing.totalAmount')}:</td>
            <td className="value"><strong>{formatCurrencyWithDecimals(priceBreakdown.total)}</strong></td>
          </tr>
          <tr>
            <td className="label">{t('bookingConfirmation.print.labels.status')}</td>
            <td className="value">{formatBookingStatus(booking.status)}</td>
          </tr>
          <tr>
            <td className="label">{t('bookingConfirmation.print.labels.paymentStatus')}</td>
            <td className="value">{formatPaymentStatus(booking.paymentStatus)}</td>
          </tr>
        </tbody>
      </table>

      {/* Important Information */}
      <div className="print-section">
        <div className="print-section-title">{t('bookingConfirmation.importantInfo.title')}:</div>
        <div className="print-bullet">• {t('bookingConfirmation.importantInfo.roomAssignment')}</div>
        <div className="print-bullet">• {t('bookingConfirmation.importantInfo.bringId')}</div>
        <div className="print-bullet">• {t('bookingConfirmation.importantInfo.checkInTime')}</div>
        <div className="print-bullet">• {t('bookingConfirmation.importantInfo.changesContact')}</div>
        <div className="print-bullet">• {t('bookingConfirmation.importantInfo.keepConfirmation')}</div>
      </div>

      {/* Footer */}
      <div className="print-footer">
        {t('bookingConfirmation.print.footerThankYou', { hotelName: booking.hotelName })}
      </div>
    </div>
  );

  return (
    <PageContainer 
      maxWidth="lg" 
      className="print-container"
      sx={{ 
        py: isMobile ? 3 : 6,
        backgroundColor: getPageShellBackground(theme),
      }}
    >
      {/* Print-only PDF format layout */}
      <PrintOnlyLayout />

      {/* Screen-only layout */}
      <div className="no-print">
      {/* Success Header */}
      <SurfaceCard 
        elevation={0}
        className="print-paper print-header"
        contentSx={{ p: isMobile ? 3 : 4 }}
        sx={{ mb: isMobile ? 3 : 4, textAlign: 'center' }}
      >
        <Box sx={{
          p: isMobile ? 3 : 4,
          borderRadius: 2,
          backgroundColor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.16 : 0.08),
          border: `1px solid ${alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.32 : 0.14)}`,
        }}>
        <CheckCircleIcon 
          sx={{ 
            fontSize: isMobile ? 48 : 60, 
            mb: isMobile ? 1.5 : 2, 
            color: theme.palette.success.main,
            filter: `drop-shadow(0 4px 8px ${addAlpha(COLORS.BLACK, 0.14)})`,
          }} 
        />
        <Typography 
          variant={isMobile ? 'h5' : 'h4'} 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold', 
            mb: 1.5,
            color: theme.palette.success.contrastText ?? theme.palette.common.white,
          }}
        >
          {t('bookingConfirmation.title')}
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            mb: isMobile ? 2 : 3, 
            color: alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.82 : 0.88),
            fontSize: isMobile ? '0.95rem' : '1rem',
          }}
        >
          {t('bookingConfirmation.subtitle')}
        </Typography>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 2, 
            flexWrap: 'wrap',
          }}
        >
          <Chip
            label={t('bookingConfirmation.confirmationLabel', { confirmationNumber: booking.confirmationNumber })}
            variant="filled"
            className="print-chip"
            sx={{ 
              bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.18 : 0.12), 
              color: theme.palette.success.contrastText ?? theme.palette.common.white,
              fontWeight: 'bold', 
              fontSize: isMobile ? '1rem' : '1.3rem',
              px: isMobile ? 2 : 3,
              py: isMobile ? 1.5 : 2,
              height: 'auto',
              border: `1px solid ${alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.34 : 0.18)}`,
              '& .MuiChip-label': {
                fontSize: isMobile ? '1rem' : '1.3rem',
                fontWeight: 'bold',
                padding: isMobile ? '6px 10px' : '8px 12px',
              }
            }}
          />
        </Box>
        </Box>
      </SurfaceCard>

      {/* Action Buttons */}
      <Box 
        className="no-print"
        sx={{ 
          ...formActionsRowSx,
          justifyContent: 'center', 
          mb: isMobile ? 3 : 4, 
          alignItems: 'stretch',
        }}
      >
        <StandardButton
          variant="contained"
          startIcon={<EmailIcon />}
          onClick={() => setEmailDialogOpen(true)}
          buttonSize="large"
          sx={{ 
            px: isMobile ? 2 : 3, 
            py: 1.5,
            minHeight: 48,
            flex: isMobile ? '1' : '0 0 auto',
          }}
        >
          {isMobile ? t('bookingConfirmation.actions.emailConfirmationShort') : t('bookingConfirmation.actions.emailConfirmation')}
        </StandardButton>
        <StandardButton
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          buttonSize="large"
          sx={{ 
            px: isMobile ? 2 : 3, 
            py: 1.5,
            minHeight: 48,
            flex: isMobile ? '1' : '0 0 auto',
          }}
        >
          {t('bookingConfirmation.actions.print')}
        </StandardButton>
        <StandardButton
          variant="outlined"
          startIcon={downloadingPDF ? <CircularProgress size={20} /> : <DownloadIcon />}
          onClick={handleDownloadPDF}
          disabled={downloadingPDF}
          buttonSize="large"
          sx={{ 
            px: isMobile ? 2 : 3, 
            py: 1.5,
            minHeight: 48,
            flex: isMobile ? '1' : '0 0 auto',
          }}
        >
          {downloadingPDF 
            ? t('bookingConfirmation.actions.downloading')
            : (isMobile ? t('bookingConfirmation.actions.downloadPdfShort') : t('bookingConfirmation.actions.downloadPdf'))
          }
        </StandardButton>
      </Box>

      {/* Booking Details */}
      <SurfaceCard 
        elevation={0} 
        className="print-paper"
        contentSx={{ p: isMobile ? 3 : 4 }}
        sx={{ mb: isMobile ? 3 : 4 }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: isMobile ? 'center' : 'flex-start', 
            mb: isMobile ? 3 : 4,
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 2 : 0,
            textAlign: isMobile ? 'center' : 'left',
            ...tintedPanelSx('primary'),
          }}
        >
          <Box sx={{ order: isMobile ? 2 : 1 }}>
            <Typography 
              variant={isMobile ? 'h5' : 'h4'} 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold', 
                color: theme.palette.primary.main,
                mb: isMobile ? 1 : 'initial',
              }}
            >
              {t('bookingConfirmation.sections.bookingDetails')}
            </Typography>
          </Box>
          <Box 
            sx={{ 
              display: 'flex', 
              gap: isMobile ? 1.5 : 3, 
              flexDirection: 'row', 
              alignItems: 'center',
              order: isMobile ? 1 : 2,
              justifyContent: 'center',
            }}
          >
            {/* Booking Status */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: '600',
                  fontSize: isMobile ? '0.75rem' : '0.8rem',
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {t('bookingConfirmation.status.bookingStatus')}
              </Typography>
              <Chip
                label={BookingService.getStatusDisplayLabel(booking.status)}
                color={getStatusColor(booking.status) as any}
                variant="filled"
                className="print-chip"
                sx={{ 
                  fontWeight: 'bold', 
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                }}
              />
            </Box>
            
            {/* Payment Status */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: '600',
                  fontSize: isMobile ? '0.75rem' : '0.8rem',
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {t('bookingConfirmation.status.paymentStatus')}
              </Typography>
              <Chip
                label={formatPaymentStatus(booking.paymentStatus)}
                variant="outlined"
                className="print-chip"
                sx={{ 
                  fontWeight: '500',
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  backgroundColor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.18 : 0.08),
                  color: theme.palette.warning.dark,
                  borderColor: theme.palette.warning.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.24 : 0.12),
                  }
                }}
              />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: isMobile ? 2 : 3 }} />

        {isEthiopianPendingPayment && booking && (
          <SurfaceCard
            elevation={0}
            sx={{ mb: isMobile ? 3 : 4 }}
            contentSx={{ p: isMobile ? 2 : 3 }}
          >
            <Box sx={tintedPanelSx('primary')}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Complete your {booking.paymentProvider?.toUpperCase() === 'MBIRR' ? 'M-birr' : 'Telebirr'} payment
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                {booking.paymentInstructions || 'Your reservation is pending until the mobile wallet payment is completed.'}
              </Typography>
              {booking.paymentExpiresAt && formatPaymentExpiry(booking.paymentExpiresAt) && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Complete payment before {formatPaymentExpiry(booking.paymentExpiresAt)}.
                </Alert>
              )}
              {booking.paymentReference && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Reference: <strong>{booking.paymentReference}</strong>
                </Typography>
              )}
              {booking.paymentIntentId && booking.paymentIntentId !== booking.paymentReference && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Transaction ID: <strong>{booking.paymentIntentId}</strong>
                </Typography>
              )}
              {booking.paymentUrl && (
                <StandardButton
                  variant="contained"
                  color="primary"
                  component={Link}
                  href={booking.paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ mb: booking.paymentQrCode ? 2 : 0 }}
                >
                  Open payment page
                </StandardButton>
              )}
              {booking.paymentQrCode && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Scan the QR code if your wallet app supports QR checkout.
                  </Typography>
                  <Box
                    component="img"
                    src={booking.paymentQrCode}
                    alt={`${booking.paymentProvider} payment QR code`}
                    sx={{
                      width: isMobile ? 180 : 220,
                      maxWidth: '100%',
                      borderRadius: 2,
                      backgroundColor: COLORS.WHITE,
                      p: 1,
                      boxShadow: `0 6px 18px ${addAlpha(COLORS.BLACK, 0.08)}`,
                    }}
                  />
                </Box>
              )}
            </Box>
          </SurfaceCard>
        )}

        {/* Quick Info Grid */}
        <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: isMobile ? 3 : 4 }}>
          <Grid item xs={6} sm={6} md={3}>
            <SurfaceCard elevation={0} contentSx={{ textAlign: 'center', py: isMobile ? 2 : 3, px: isMobile ? 1 : 3 }}>
                <Typography 
                  variant="subtitle2" 
                  color="text.secondary" 
                  sx={{ 
                    fontSize: isMobile ? '0.75rem' : '0.9rem', 
                    fontWeight: '600', 
                    mb: 1,
                  }}
                >
                  {t('bookingConfirmation.quickInfo.checkIn')}
                </Typography>
                <Typography 
                  variant={isMobile ? 'body2' : 'h6'} 
                  sx={{ 
                    fontWeight: 'bold', 
                    fontSize: isMobile ? '0.85rem' : '1.1rem',
                    lineHeight: 1.2,
                  }}
                >
                  {formatDate(booking.checkInDate)}
                </Typography>
            </SurfaceCard>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <SurfaceCard elevation={0} contentSx={{ textAlign: 'center', py: isMobile ? 2 : 3, px: isMobile ? 1 : 3 }}>
                <Typography 
                  variant="subtitle2" 
                  color="text.secondary" 
                  sx={{ 
                    fontSize: isMobile ? '0.75rem' : '0.9rem', 
                    fontWeight: '600', 
                    mb: 1,
                  }}
                >
                  {t('bookingConfirmation.quickInfo.checkOut')}
                </Typography>
                <Typography 
                  variant={isMobile ? 'body2' : 'h6'} 
                  sx={{ 
                    fontWeight: 'bold', 
                    fontSize: isMobile ? '0.85rem' : '1.1rem',
                    lineHeight: 1.2,
                  }}
                >
                  {formatDate(booking.checkOutDate)}
                </Typography>
            </SurfaceCard>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <SurfaceCard elevation={0} contentSx={{ textAlign: 'center', py: isMobile ? 2 : 3, px: isMobile ? 1 : 3 }}>
                <Typography 
                  variant="subtitle2" 
                  color="text.secondary" 
                  sx={{ 
                    fontSize: isMobile ? '0.75rem' : '0.9rem', 
                    fontWeight: '600', 
                    mb: 1,
                  }}
                >
                  {t('bookingConfirmation.quickInfo.nights')}
                </Typography>
                <Typography 
                  variant={isMobile ? 'body2' : 'h6'} 
                  sx={{ 
                    fontWeight: 'bold', 
                    fontSize: isMobile ? '0.85rem' : '1.1rem',
                  }}
                >
                  {nights}
                </Typography>
            </SurfaceCard>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <SurfaceCard elevation={0} contentSx={{ textAlign: 'center', py: isMobile ? 2 : 3, px: isMobile ? 1 : 3 }}>
              <Box sx={tintedPanelSx('success')}>
                <Typography 
                  variant="subtitle2" 
                  color="text.secondary" 
                  sx={{ 
                    fontSize: isMobile ? '0.75rem' : '0.9rem', 
                    fontWeight: '600', 
                    mb: 1,
                  }}
                >
                  {t('bookingConfirmation.quickInfo.totalAmount')}
                </Typography>
                <Typography 
                  variant={isMobile ? 'subtitle1' : 'h5'} 
                  component="div" 
                  className="print-total"
                  sx={{ 
                    fontWeight: 'bold', 
                    color: COLORS.SUCCESS,
                    fontSize: isMobile ? '1rem' : '1.25rem',
                  }}
                >
                  {formatCurrencyWithDecimals(priceBreakdown.total)}
                </Typography>
              </Box>
            </SurfaceCard>
          </Grid>
        </Grid>

        {/* Detailed Information */}
        <Grid container spacing={isMobile ? 2 : 4}>
          {/* Hotel Information */}
          <Grid item xs={12} md={6}>
            <SurfaceCard elevation={0} contentSx={{ p: isMobile ? 2 : 3, height: '100%' }}>
              <Typography 
                variant={isMobile ? 'subtitle1' : 'h6'} 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold', 
                  color: 'text.primary',
                  mb: isMobile ? 1.5 : 2,
                }}
              >
                {t('bookingConfirmation.sections.hotelInformation')}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant={isMobile ? 'body1' : 'h6'} 
                  sx={{ 
                    fontWeight: 'bold', 
                    mb: 1,
                    fontSize: isMobile ? '1rem' : '1.25rem',
                  }}
                >
                  {booking.hotelName}
                </Typography>
                
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  sx={{ 
                    lineHeight: 1.6,
                    fontSize: isMobile ? '0.9rem' : '1rem',
                  }}
                >
                  {booking.hotelAddress}
                </Typography>
              </Box>
            </SurfaceCard>
          </Grid>

          {/* Room Information */}
          <Grid item xs={12} md={6}>
            <SurfaceCard elevation={0} contentSx={{ p: isMobile ? 2 : 3, height: '100%' }}>
              <Typography 
                variant={isMobile ? 'subtitle1' : 'h6'} 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold', 
                  color: 'text.primary',
                  mb: isMobile ? 1.5 : 2,
                }}
              >
                {t('bookingConfirmation.sections.roomInformation')}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 1,
                    fontSize: isMobile ? '0.9rem' : '1rem',
                  }}
                >
                  <strong>{t('bookingConfirmation.room.roomType')}</strong> {booking.roomType}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 1,
                    fontSize: isMobile ? '0.9rem' : '1rem',
                  }}
                >
                  <strong>{t('bookingConfirmation.room.rate')}</strong> {formatCurrency(booking.pricePerNight || 0)}{t('bookingConfirmation.room.perNight')}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'success.main', 
                    fontWeight: 'bold',
                    fontSize: isMobile ? '0.9rem' : '1rem',
                  }}
                >
                  <strong>{t('bookingConfirmation.room.roomAssignment')}</strong> {t('bookingConfirmation.room.roomAssignmentMessage')}
                </Typography>
              </Box>
            </SurfaceCard>
          </Grid>

          {/* Guest Information */}
          <Grid item xs={12} md={6}>
            <SurfaceCard elevation={0} contentSx={{ p: isMobile ? 2 : 3, height: '100%' }}>
              <Typography 
                variant={isMobile ? 'subtitle1' : 'h6'} 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold', 
                  color: 'text.primary',
                  mb: isMobile ? 1.5 : 2,
                }}
              >
                {t('bookingConfirmation.sections.guestInformation')}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 1,
                    fontSize: isMobile ? '0.9rem' : '1rem',
                  }}
                >
                  <strong>{t('bookingConfirmation.guest.name')}</strong> {booking.guestName}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 1,
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    wordBreak: 'break-word',
                  }}
                >
                  <strong>{t('bookingConfirmation.guest.email')}</strong> {booking.guestEmail}
                </Typography>
                <Typography 
                  variant="body1"
                  sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}
                >
                  <strong>{t('bookingConfirmation.guest.numberOfGuests')}</strong> {booking.numberOfGuests || 1}
                </Typography>
              </Box>
            </SurfaceCard>
          </Grid>

          {/* Booking Summary */}
          <Grid item xs={12} md={6}>
            <SurfaceCard elevation={0} contentSx={{ p: isMobile ? 2 : 3, height: '100%' }}>
              <Typography 
                variant={isMobile ? 'subtitle1' : 'h6'} 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold', 
                  color: 'text.primary',
                  mb: isMobile ? 1.5 : 2,
                }}
              >
                {t('bookingConfirmation.sections.bookingSummary')}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 1,
                    fontSize: isMobile ? '0.9rem' : '1rem',
                  }}
                >
                  <strong>{t('bookingConfirmation.summary.bookedOn')}</strong> {formatDateTimeLong(booking.createdAt)}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 1,
                    fontSize: isMobile ? '0.9rem' : '1rem',
                  }}
                >
                  <strong>{t('bookingConfirmation.summary.duration')}</strong> {nights} {nights !== 1 ? t('bookingConfirmation.summary.nightPlural') : t('bookingConfirmation.summary.nightSingle')}
                </Typography>
              </Box>
            </SurfaceCard>
          </Grid>
        </Grid>

        {/* Pricing Summary with Tax Breakdown */}
        <Box sx={{ ...tintedPanelSx('success'), mt: isMobile ? 3 : 4 }}>
          <Typography 
            variant={isMobile ? 'subtitle1' : 'h6'} 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold', 
              color: 'text.primary',
              mb: isMobile ? 1.5 : 2,
            }}
          >
            {t('bookingConfirmation.sections.pricingSummary')}
          </Typography>
          <Box>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mb: 1,
                fontSize: isMobile ? '0.9rem' : '1rem',
              }}
            >
              <Typography variant="body1">
                {t('bookingConfirmation.pricing.subtotal')} ({formatCurrencyWithDecimals(booking.pricePerNight || 0)}{t('bookingConfirmation.room.perNight')} × {nights} {nights !== 1 ? t('bookingConfirmation.summary.nightPlural') : t('bookingConfirmation.summary.nightSingle')})
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formatCurrencyWithDecimals(priceBreakdown.subtotal)}
              </Typography>
            </Box>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mb: 1,
                fontSize: isMobile ? '0.9rem' : '1rem',
              }}
            >
              <Typography variant="body1" color="text.secondary">
                {t('bookingConfirmation.pricing.vat')} ({(hotelVatRate * 100).toFixed(2)}%)
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {formatCurrencyWithDecimals(priceBreakdown.vatAmount)}
              </Typography>
            </Box>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mb: 2,
                fontSize: isMobile ? '0.9rem' : '1rem',
              }}
            >
              <Typography variant="body1" color="text.secondary">
                {t('bookingConfirmation.pricing.serviceTax')} ({(hotelServiceTaxRate * 100).toFixed(2)}%)
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {formatCurrencyWithDecimals(priceBreakdown.serviceTaxAmount)}
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: isMobile ? '1rem' : '1.1rem',
              }}
            >
              <Typography variant={isMobile ? 'subtitle1' : 'h6'} sx={{ fontWeight: 'bold' }}>
                {t('bookingConfirmation.pricing.totalAmount')}
              </Typography>
              <Typography 
                variant={isMobile ? 'subtitle1' : 'h6'} 
                sx={{ 
                  fontWeight: 'bold', 
                  color: 'success.main',
                }}
              >
                {formatCurrencyWithDecimals(priceBreakdown.total)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </SurfaceCard>

      {/* Important Information */}
      <Alert 
        severity="info" 
        sx={{ 
          mb: 4, 
          p: 3,
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          {t('bookingConfirmation.importantInfo.title')}
        </Typography>
        <Box sx={{ '& > div': { mb: 1 } }}>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mr: 2, flexShrink: 0 }} />
            <strong>{t('bookingConfirmation.importantInfo.roomAssignment')}</strong>
          </Typography>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mr: 2, flexShrink: 0 }} />
            {t('bookingConfirmation.importantInfo.bringId')}
          </Typography>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mr: 2, flexShrink: 0 }} />
            {t('bookingConfirmation.importantInfo.checkInTime')}
          </Typography>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mr: 2, flexShrink: 0 }} />
            {t('bookingConfirmation.importantInfo.changesContact')}
          </Typography>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mr: 2, flexShrink: 0 }} />
            {t('bookingConfirmation.importantInfo.keepConfirmation')}
          </Typography>
        </Box>
      </Alert>

      {/* Navigation Buttons */}
      <Box 
        className="no-print"
        sx={{ 
          ...formActionsRowSx,
          justifyContent: 'center', 
          alignItems: 'stretch',
        }}
      >
        <StandardButton
          variant="contained"
          onClick={() => navigate('/')}
          startIcon={<HomeIcon />}
          buttonSize="large"
          color="success"
          sx={{ 
            px: isMobile ? 3 : 4, 
            py: 1.5,
            minHeight: 48,
            flex: isMobile ? '1' : '0 0 auto',
          }}
        >
          {t('bookingConfirmation.actions.returnHome')}
        </StandardButton>
        <StandardButton
          variant="outlined"
          onClick={() => navigate('/hotels/search')}
          startIcon={<SearchIcon />}
          buttonSize="large"
          sx={{ 
            px: isMobile ? 3 : 4, 
            py: 1.5,
            minHeight: 48,
            flex: isMobile ? '1' : '0 0 auto',
          }}
        >
          {isMobile ? t('bookingConfirmation.actions.searchHotelsShort') : t('bookingConfirmation.actions.searchHotels')}
        </StandardButton>
      </Box>

      {/* Email Dialog */}
      <Dialog 
        open={emailDialogOpen} 
        onClose={() => setEmailDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            p: isMobile ? 1 : 2,
            m: isMobile ? 0 : 2,
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography 
            variant={isMobile ? 'h6' : 'h5'} 
            component="div" 
            sx={{ 
              fontWeight: 'bold', 
              color: 'text.primary',
            }}
          >
            {t('bookingConfirmation.emailDialog.title')}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <PremiumTextField
            autoFocus={!isMobile}
            margin="dense"
            label={t('bookingConfirmation.emailDialog.emailLabel')}
            type="email"
            fullWidth
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            sx={{ mb: 3 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={includeItinerary}
                onChange={(e) => setIncludeItinerary(e.target.checked)}
                sx={{ 
                  color: COLORS.PRIMARY,
                  '& .MuiSvgIcon-root': {
                    fontSize: isMobile ? '1.5rem' : '1.25rem',
                  }
                }}
              />
            }
            label={t('bookingConfirmation.emailDialog.includeItinerary')}
            sx={{ 
              mb: 1,
              '& .MuiFormControlLabel-label': {
                fontSize: isMobile ? '1rem' : '0.875rem',
              }
            }}
          />
        </DialogContent>
        <DialogActions 
          sx={{ 
            p: isMobile ? 2 : 3, 
            pt: 1,
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 1 : 0,
          }}
        >
          <StandardButton 
            onClick={() => setEmailDialogOpen(false)}
            variant="text"
            buttonSize="large"
            sx={{ 
              px: 3,
              minHeight: 48,
              width: isMobile ? '100%' : 'auto',
            }}
          >
            {t('bookingConfirmation.emailDialog.cancel')}
          </StandardButton>
          <StandardButton
            onClick={handleEmailBooking}
            variant="contained"
            disabled={!emailAddress.trim() || sendingEmail}
            loading={sendingEmail}
            loadingText={t('bookingConfirmation.emailDialog.sending')}
            startIcon={!sendingEmail ? <EmailIcon /> : undefined}
            buttonSize="large"
            sx={{ 
              px: 4,
              minHeight: 48,
              width: isMobile ? '100%' : 'auto',
            }}
          >
            {t('bookingConfirmation.emailDialog.sendEmail')}
          </StandardButton>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      </div> {/* End no-print */}
    </PageContainer>
  );
};

export default BookingConfirmationPage;
