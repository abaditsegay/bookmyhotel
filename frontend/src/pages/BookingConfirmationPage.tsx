import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { COLORS, addAlpha } from '../theme/themeColors';
import PremiumTextField from '../components/common/PremiumTextField';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Snackbar,
  useTheme,
  useMediaQuery,
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

// Print-specific CSS styles
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
      color: ${COLORS.BLACK} !important;
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
      color: ${COLORS.BLACK} !important;
    }
    
    .print-title {
      font-size: 16pt;
      font-weight: bold;
      margin-bottom: 10pt;
      color: ${COLORS.BLACK} !important;
    }
    
    .print-confirmation {
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 20pt;
      color: ${COLORS.BLACK} !important;
    }
    
    .print-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20pt;
    }
    
    .print-table td {
      padding: 8pt;
      border: 1px solid ${COLORS.BORDER_DEFAULT};
      vertical-align: top;
    }
    
    .print-table .label {
      width: 30%;
      font-weight: bold;
      background-color: ${COLORS.WHITE};
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
      color: ${COLORS.BLACK} !important;
    }
    
    .print-bullet {
      margin-bottom: 5pt;
    }
    
    .print-footer {
      text-align: center;
      margin-top: 20pt;
      font-size: 12pt;
      color: ${COLORS.BLACK} !important;
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
      setError('No booking information available');
      setLoading(false);
    }
  }, [reservationId, locationBooking, fromSearch, fetchBookingData]);

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
    // Parse as local date to avoid timezone conversion issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // Month is 0-indexed
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateLong = (dateString: string) => {
    // Parse as local date to avoid timezone conversion issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // Month is 0-indexed
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTimeLong = (dateTimeString: string) => {
    // Handle datetime strings (ISO format like "2025-10-06T14:30:00")
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
      case 'confirmed': return 'primary';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'checked in': return 'info';
      case 'checked out': return 'default';
      default: return 'default';
    }
  };

  const formatPaymentStatus = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAY_AT_FRONTDESK': return 'Pay at Front Desk';
      case 'PAID':
      case 'COMPLETED': return t('booking.paymentStatus.completed');
      case 'PROCESSING': return t('booking.paymentStatus.processing');
      case 'PENDING': return t('booking.paymentStatus.pending');
      case 'FAILED': return t('booking.paymentStatus.failed');
      case 'CANCELLED': return 'CANCELLED';
      case 'REFUNDED': return 'REFUNDED';
      case 'PARTIALLY_REFUNDED': return 'PARTIALLY REFUNDED';
      case 'FORFEITED': return 'FORFEITED';
      default: return status;
    }
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
      <Container 
        maxWidth="md" 
        sx={{ 
          py: isMobile ? 4 : 8,
          px: isMobile ? 1 : 3,
        }}
      >
        <Paper 
          elevation={2} 
          sx={{ 
            p: isMobile ? 3 : 6, 
            borderRadius: 0,
          }}
        >
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
        </Paper>
      </Container>
    );
  }

  if (error || !booking) {
    return (
      <Container 
        maxWidth="md" 
        sx={{ 
          py: isMobile ? 4 : 8,
          px: isMobile ? 1 : 3,
        }}
      >
        <Paper 
          elevation={2} 
          sx={{ 
            p: isMobile ? 3 : 6, 
            borderRadius: 0,
          }}
        >
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
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              startIcon={<HomeIcon />}
              size="large"
              sx={{ 
                px: isMobile ? 3 : 4, 
                py: 1.5,
                minHeight: 48,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              }}
            >
              {t('bookingConfirmation.actions.returnHome')}
            </Button>
          </Box>
        </Paper>
      </Container>
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
        <div className="print-title">Booking Confirmation</div>
        <div className="print-confirmation">
          Confirmation Number: {booking.confirmationNumber}
        </div>
      </div>

      {/* Print Details Table */}
      <table className="print-table">
        <tbody>
          <tr>
            <td className="label">Guest Name:</td>
            <td className="value">{booking.guestName}</td>
          </tr>
          <tr>
            <td className="label">Email:</td>
            <td className="value">{booking.guestEmail}</td>
          </tr>
          <tr>
            <td className="label">Number of Guests:</td>
            <td className="value">{booking.numberOfGuests || 1}</td>
          </tr>
          <tr>
            <td className="label">Hotel:</td>
            <td className="value">{booking.hotelName}</td>
          </tr>
          <tr>
            <td className="label">Address:</td>
            <td className="value">{booking.hotelAddress}</td>
          </tr>
          <tr>
            <td className="label">Room Type:</td>
            <td className="value">{booking.roomType}</td>
          </tr>
          <tr>
            <td className="label">Room Assignment:</td>
            <td className="value">Room will be assigned at check-in</td>
          </tr>
          <tr>
            <td className="label">Check-in:</td>
            <td className="value">{formatDateLong(booking.checkInDate)}</td>
          </tr>
          <tr>
            <td className="label">Check-out:</td>
            <td className="value">{formatDateLong(booking.checkOutDate)}</td>
          </tr>
          <tr>
            <td className="label">Nights:</td>
            <td className="value">{nights}</td>
          </tr>
          <tr>
            <td className="label">Rate per night:</td>
            <td className="value">{formatCurrency(booking.pricePerNight || 0)}</td>
          </tr>
          <tr>
            <td className="label">Subtotal:</td>
            <td className="value">{formatCurrencyWithDecimals(priceBreakdown.subtotal)}</td>
          </tr>
          <tr>
            <td className="label">VAT ({(hotelVatRate * 100).toFixed(2)}%):</td>
            <td className="value">{formatCurrencyWithDecimals(priceBreakdown.vatAmount)}</td>
          </tr>
          <tr>
            <td className="label">Service Tax ({(hotelServiceTaxRate * 100).toFixed(2)}%):</td>
            <td className="value">{formatCurrencyWithDecimals(priceBreakdown.serviceTaxAmount)}</td>
          </tr>
          <tr>
            <td className="label">Total Amount:</td>
            <td className="value"><strong>{formatCurrencyWithDecimals(priceBreakdown.total)}</strong></td>
          </tr>
          <tr>
            <td className="label">Status:</td>
            <td className="value">{booking.status}</td>
          </tr>
          <tr>
            <td className="label">Payment Status:</td>
            <td className="value">{formatPaymentStatus(booking.paymentStatus)}</td>
          </tr>
        </tbody>
      </table>

      {/* Important Information */}
      <div className="print-section">
        <div className="print-section-title">Important Information:</div>
        <div className="print-bullet">• Your specific room number will be assigned at check-in</div>
        <div className="print-bullet">• Please bring a valid ID for check-in</div>
        <div className="print-bullet">• Check-in time: 3:00 PM | Check-out time: 11:00 AM</div>
        <div className="print-bullet">• For any changes or cancellations, please contact the hotel directly</div>
        <div className="print-bullet">• Keep your reservation ID and confirmation number for reference</div>
      </div>

      {/* Footer */}
      <div className="print-footer">
        Thank you for choosing {booking.hotelName}!
      </div>
    </div>
  );

  return (
    <Container 
      maxWidth="lg" 
      className="print-container"
      sx={{ 
        py: isMobile ? 3 : 6,
        px: isMobile ? 1 : 3,
      }}
    >
      {/* Print-only PDF format layout */}
      <PrintOnlyLayout />

      {/* Screen-only layout */}
      <div className="no-print">
      {/* Success Header */}
      <Paper 
        elevation={0}
        className="print-paper print-header"
        sx={{ 
          p: isMobile ? 3 : 4, 
          mb: isMobile ? 3 : 4, 
          textAlign: 'center', 
          background: `linear-gradient(135deg, ${COLORS.SUCCESS} 0%, ${COLORS.CHECKED_IN} 100%)`,
          color: 'white',
          borderRadius: 0
        }}
      >
        <CheckCircleIcon 
          sx={{ 
            fontSize: isMobile ? 48 : 60, 
            mb: isMobile ? 1.5 : 2, 
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
          }} 
        />
        <Typography 
          variant={isMobile ? 'h5' : 'h4'} 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold', 
            mb: 1.5,
          }}
        >
          {t('bookingConfirmation.title')}
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            mb: isMobile ? 2 : 3, 
            opacity: 0.9,
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
              bgcolor: 'rgba(255,255,255,0.2)', 
              color: 'white', 
              fontWeight: 'bold', 
              fontSize: isMobile ? '1rem' : '1.3rem',
              px: isMobile ? 2 : 3,
              py: isMobile ? 1.5 : 2,
              height: 'auto',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
              '& .MuiChip-label': {
                fontSize: isMobile ? '1rem' : '1.3rem',
                fontWeight: 'bold',
                padding: isMobile ? '6px 10px' : '8px 12px',
              }
            }}
          />
        </Box>
      </Paper>

      {/* Action Buttons */}
      <Box 
        className="no-print"
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: isMobile ? 1.5 : 2, 
          mb: isMobile ? 3 : 4, 
          flexWrap: 'wrap',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'stretch',
        }}
      >
        <Button
          variant="contained"
          startIcon={<EmailIcon />}
          onClick={() => setEmailDialogOpen(true)}
          sx={{ 
            px: isMobile ? 2 : 3, 
            py: 1.5,
            minHeight: 48,
            flex: isMobile ? '1' : '0 0 auto',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            }
          }}
        >
          {isMobile ? t('bookingConfirmation.actions.emailConfirmationShort') : t('bookingConfirmation.actions.emailConfirmation')}
        </Button>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          sx={{ 
            px: isMobile ? 2 : 3, 
            py: 1.5,
            minHeight: 48,
            flex: isMobile ? '1' : '0 0 auto',
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            '&:hover': {
              borderColor: theme.palette.primary.dark,
              backgroundColor: theme.palette.action.hover,
            }
          }}
        >
          {t('bookingConfirmation.actions.print')}
        </Button>
        <Button
          variant="outlined"
          startIcon={downloadingPDF ? <CircularProgress size={20} /> : <DownloadIcon />}
          onClick={handleDownloadPDF}
          disabled={downloadingPDF}
          sx={{ 
            px: isMobile ? 2 : 3, 
            py: 1.5,
            minHeight: 48,
            flex: isMobile ? '1' : '0 0 auto',
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            '&:hover': {
              borderColor: theme.palette.primary.dark,
              backgroundColor: theme.palette.action.hover,
            },
            '&:disabled': {
              borderColor: theme.palette.action.disabled,
              color: theme.palette.action.disabled,
            }
          }}
        >
          {downloadingPDF 
            ? t('bookingConfirmation.actions.downloading')
            : (isMobile ? t('bookingConfirmation.actions.downloadPdfShort') : t('bookingConfirmation.actions.downloadPdf'))
          }
        </Button>
      </Box>

      {/* Booking Details */}
      <Paper 
        elevation={2} 
        className="print-paper"
        sx={{ 
          p: isMobile ? 3 : 4, 
          mb: isMobile ? 3 : 4, 
          borderRadius: 0,
        }}
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
                label={booking.status.toUpperCase()}
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
                  backgroundColor: 'orange',
                  color: 'white',
                  borderColor: 'orange',
                  '&:hover': {
                    backgroundColor: 'darkorange',
                  }
                }}
              />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: isMobile ? 2 : 3 }} />

        {/* Quick Info Grid */}
        <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: isMobile ? 3 : 4 }}>
          <Grid item xs={6} sm={6} md={3}>
            <Card 
              elevation={0}
              sx={{ 
                border: `2px solid ${COLORS.CARD_BORDER}`,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: COLORS.PRIMARY,
                  transform: isMobile ? 'none' : 'translateY(-2px)',
                  boxShadow: isMobile ? 'none' : `0 8px 16px ${addAlpha(COLORS.PRIMARY, 0.1)}`
                }
              }}
            >
              <CardContent 
                sx={{ 
                  textAlign: 'center', 
                  py: isMobile ? 2 : 3,
                  px: isMobile ? 1 : 3,
                }}
              >
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
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card 
              elevation={0}
              sx={{ 
                border: `2px solid ${COLORS.CARD_BORDER}`,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: COLORS.PRIMARY,
                  transform: isMobile ? 'none' : 'translateY(-2px)',
                  boxShadow: isMobile ? 'none' : `0 8px 16px ${addAlpha(COLORS.PRIMARY, 0.1)}`
                }
              }}
            >
              <CardContent 
                sx={{ 
                  textAlign: 'center', 
                  py: isMobile ? 2 : 3,
                  px: isMobile ? 1 : 3,
                }}
              >
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
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card 
              elevation={0}
              sx={{ 
                border: `2px solid ${COLORS.CARD_BORDER}`,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: COLORS.PRIMARY,
                  transform: isMobile ? 'none' : 'translateY(-2px)',
                  boxShadow: isMobile ? 'none' : `0 8px 16px ${addAlpha(COLORS.PRIMARY, 0.1)}`
                }
              }}
            >
              <CardContent 
                sx={{ 
                  textAlign: 'center', 
                  py: isMobile ? 2 : 3,
                  px: isMobile ? 1 : 3,
                }}
              >
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
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card 
              elevation={0}
              sx={{ 
                border: `2px solid ${COLORS.SUCCESS}`,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                background: `linear-gradient(135deg, ${addAlpha(COLORS.SUCCESS, 0.1)} 0%, ${addAlpha(COLORS.SUCCESS, 0.05)} 100%)`,
                '&:hover': {
                  transform: isMobile ? 'none' : 'translateY(-2px)',
                  boxShadow: isMobile ? 'none' : '0 8px 16px rgba(76, 175, 80, 0.2)'
                }
              }}
            >
              <CardContent 
                sx={{ 
                  textAlign: 'center', 
                  py: isMobile ? 2 : 3,
                  px: isMobile ? 1 : 3,
                }}
              >
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
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Detailed Information */}
        <Grid container spacing={isMobile ? 2 : 4}>
          {/* Hotel Information */}
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                p: isMobile ? 2 : 3, 
                border: `1px solid ${COLORS.BORDER_LIGHT}`, 
                borderRadius: 2, 
                height: '100%',
              }}
            >
              <Typography 
                variant={isMobile ? 'subtitle1' : 'h6'} 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold', 
                  color: COLORS.PRIMARY, 
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
            </Box>
          </Grid>

          {/* Room Information */}
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                p: isMobile ? 2 : 3, 
                border: `1px solid ${COLORS.BORDER_LIGHT}`, 
                borderRadius: 2, 
                height: '100%',
              }}
            >
              <Typography 
                variant={isMobile ? 'subtitle1' : 'h6'} 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold', 
                  color: COLORS.PRIMARY, 
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
                    color: COLORS.SUCCESS, 
                    fontWeight: 'bold',
                    fontSize: isMobile ? '0.9rem' : '1rem',
                  }}
                >
                  <strong>{t('bookingConfirmation.room.roomAssignment')}</strong> {t('bookingConfirmation.room.roomAssignmentMessage')}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Guest Information */}
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                p: isMobile ? 2 : 3, 
                border: `1px solid ${COLORS.BORDER_LIGHT}`, 
                borderRadius: 2, 
                height: '100%',
              }}
            >
              <Typography 
                variant={isMobile ? 'subtitle1' : 'h6'} 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold', 
                  color: COLORS.PRIMARY, 
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
            </Box>
          </Grid>

          {/* Booking Summary */}
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                p: isMobile ? 2 : 3, 
                border: `1px solid ${COLORS.BORDER_LIGHT}`, 
                borderRadius: 2, 
                height: '100%',
              }}
            >
              <Typography 
                variant={isMobile ? 'subtitle1' : 'h6'} 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold', 
                  color: COLORS.PRIMARY, 
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
            </Box>
          </Grid>
        </Grid>

        {/* Pricing Summary with Tax Breakdown */}
        <Box 
          sx={{ 
            mt: isMobile ? 3 : 4,
            p: isMobile ? 2 : 3, 
            border: `2px solid ${COLORS.SUCCESS}`, 
            borderRadius: 2,
            background: `linear-gradient(135deg, ${addAlpha(COLORS.SUCCESS, 0.05)} 0%, ${addAlpha(COLORS.SUCCESS, 0.02)} 100%)`,
          }}
        >
          <Typography 
            variant={isMobile ? 'subtitle1' : 'h6'} 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold', 
              color: COLORS.PRIMARY, 
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
                {t('bookingConfirmation.pricing.subtotal')} ({formatCurrencyWithDecimals(booking.pricePerNight || 0)}/night × {nights} {nights !== 1 ? 'nights' : 'night'})
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
                  color: COLORS.SUCCESS,
                }}
              >
                {formatCurrencyWithDecimals(priceBreakdown.total)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Important Information */}
      <Alert 
        severity="info" 
        sx={{ 
          mb: 4, 
          p: 3,
          borderRadius: 2,
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
            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS.PRIMARY, mr: 2, flexShrink: 0 }} />
            <strong>{t('bookingConfirmation.importantInfo.roomAssignment')}</strong>
          </Typography>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS.PRIMARY, mr: 2, flexShrink: 0 }} />
            {t('bookingConfirmation.importantInfo.bringId')}
          </Typography>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS.PRIMARY, mr: 2, flexShrink: 0 }} />
            {t('bookingConfirmation.importantInfo.checkInTime')}
          </Typography>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS.PRIMARY, mr: 2, flexShrink: 0 }} />
            {t('bookingConfirmation.importantInfo.changesContact')}
          </Typography>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS.PRIMARY, mr: 2, flexShrink: 0 }} />
            {t('bookingConfirmation.importantInfo.keepConfirmation')}
          </Typography>
        </Box>
      </Alert>

      {/* Navigation Buttons */}
      <Box 
        className="no-print"
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: isMobile ? 2 : 3, 
          flexWrap: 'wrap',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'stretch',
        }}
      >
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          startIcon={<HomeIcon />}
          size="large"
          sx={{ 
            px: isMobile ? 3 : 4, 
            py: 1.5,
            minHeight: 48,
            flex: isMobile ? '1' : '0 0 auto',
            background: `linear-gradient(135deg, ${COLORS.SUCCESS} 0%, ${COLORS.CHECKED_IN} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${COLORS.CHECKED_IN} 0%, ${COLORS.SUCCESS} 100%)`,
            }
          }}
        >
          {t('bookingConfirmation.actions.returnHome')}
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/hotels/search')}
          startIcon={<SearchIcon />}
          size="large"
          sx={{ 
            px: isMobile ? 3 : 4, 
            py: 1.5,
            minHeight: 48,
            flex: isMobile ? '1' : '0 0 auto',
            borderColor: COLORS.PRIMARY,
            color: COLORS.PRIMARY,
            '&:hover': {
              borderColor: COLORS.CONFIRMED,
              backgroundColor: addAlpha(COLORS.PRIMARY, 0.04),
            }
          }}
        >
          {isMobile ? t('bookingConfirmation.actions.searchHotelsShort') : t('bookingConfirmation.actions.searchHotels')}
        </Button>
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
              color: COLORS.PRIMARY,
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
          <Button 
            onClick={() => setEmailDialogOpen(false)}
            sx={{ 
              px: 3,
              minHeight: 48,
              width: isMobile ? '100%' : 'auto',
            }}
          >
            {t('bookingConfirmation.emailDialog.cancel')}
          </Button>
          <Button
            onClick={handleEmailBooking}
            variant="contained"
            disabled={!emailAddress.trim() || sendingEmail}
            startIcon={sendingEmail ? <CircularProgress size={20} /> : <EmailIcon />}
            sx={{ 
              px: 4,
              minHeight: 48,
              width: isMobile ? '100%' : 'auto',
              background: `linear-gradient(135deg, ${COLORS.PRIMARY} 0%, ${COLORS.CONFIRMED} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${COLORS.CONFIRMED} 0%, ${COLORS.PRIMARY} 100%)`,
              }
            }}
          >
            {sendingEmail ? t('bookingConfirmation.emailDialog.sending') : t('bookingConfirmation.emailDialog.sendEmail')}
          </Button>
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
    </Container>
  );
};

export default BookingConfirmationPage;
