import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatCurrencyWithDecimals } from '../../utils/currencyUtils';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  useTheme,
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
  DialogTitle,
} from '@mui/material';
import {
  Print as PrintIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { ConsolidatedReceipt, frontDeskApiService } from '../../services/frontDeskApi';
import { formatDateForDisplay, formatDateTimeForDisplay } from '../../utils/dateUtils';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, addAlpha } from '../../theme/themeColors';

interface CheckoutReceiptDialogProps {
  open: boolean;
  onClose: () => void;
  receipt: ConsolidatedReceipt | null;
  guestName: string;
}

const CheckoutReceiptDialog: React.FC<CheckoutReceiptDialogProps> = ({
  open,
  onClose,
  receipt,
  guestName,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user, token } = useAuth();
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  if (!receipt) return null;

  const formatDate = (dateString: string) => formatDateForDisplay(dateString);
  const formatDateTime = (dateString: string) => formatDateTimeForDisplay(dateString);
  const getNightLabel = (count: number) => count === 1 ? t('receipts.nightSingle') : t('receipts.nightPlural');

  const handlePrint = () => {
    const primaryColor = theme.palette.primary.main;
    
    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${receipt.hotelName} - ${t('receipts.receiptNumber', { number: receipt.receiptNumber })}</title>
            <style>
              @page {
                size: A4;
                margin: 0.5in;
              }
              
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.4;
                color: ${COLORS.TEXT_PRIMARY};
                background: ${COLORS.WHITE};
              }
              
              .header {
                padding: 30px 20px 20px;
                border-bottom: 1px solid ${COLORS.BORDER_LIGHT};
                margin-bottom: 20px;
                text-align: center;
              }
              
              .header h1 {
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 6px;
                color: ${COLORS.TEXT_PRIMARY};
              }
              
              .header .address {
                font-size: 14px;
                color: ${COLORS.TEXT_SECONDARY};
                margin-bottom: 15px;
              }
              
              .badges {
                display: flex;
                gap: 15px;
                align-items: center;
                justify-content: center;
              }
              
              .badge {
                font-size: 13px;
                color: ${COLORS.TEXT_SECONDARY};
              }
              
              .badge.receipt {
                font-weight: 600;
              }
              
              .badge.number {
                color: ${COLORS.TEXT_SECONDARY};
                font-size: 13px;
              }
              
              .content {
                max-width: 800px;
                margin: 0 auto;
                padding: 0 20px;
              }
              
              .section {
                background: ${COLORS.WHITE};
                padding: 20px;
                margin-bottom: 20px;
                border: 1px solid ${COLORS.BORDER_LIGHT};
                border-left: 4px solid ${primaryColor};
              }
              
              .section h2 {
                color: ${COLORS.TEXT_PRIMARY};
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 15px;
              }
              
              .section h2::before {
                display: none;
              }
              
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
              }
              
              .info-item {
                margin-bottom: 15px;
              }
              
              .info-label {
                font-size: 12px;
                font-weight: 600;
                color: ${COLORS.TEXT_SECONDARY};
                text-transform: uppercase;
                margin-bottom: 4px;
              }
              
              .info-value {
                font-size: 14px;
                font-weight: 500;
                color: ${COLORS.TEXT_PRIMARY};
              }
              
              .info-value.highlight {
                font-weight: 700;
                color: ${primaryColor};
                font-size: 16px;
              }
              
              .divider {
                height: 1px;
                background: ${COLORS.BORDER_LIGHT};
                margin: 20px 0;
              }
              
              .table {
                width: 100%;
                border-collapse: collapse;
                background: ${COLORS.WHITE};
                border: 1px solid ${COLORS.BORDER_LIGHT};
              }
              
              .table thead th {
                background: ${COLORS.BG_LIGHT};
                color: ${COLORS.TEXT_SECONDARY};
                padding: 12px;
                text-align: left;
                font-weight: 600;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                border-bottom: 1px solid ${COLORS.BORDER_LIGHT};
              }
              
              .table thead th.center {
                text-align: center;
              }
              
              .table thead th.right {
                text-align: right;
              }
              
              .table tbody td {
                padding: 15px 12px;
                border-bottom: 1px solid ${COLORS.DIVIDER};
                font-size: 14px;
                font-weight: 500;
              }
              
              .table tbody td.center {
                text-align: center;
              }
              
              .table tbody td.right {
                text-align: right;
                font-weight: 600;
              }
              
              .table tbody tr:hover {
                background-color: ${COLORS.BG_LIGHT};
              }
              
              .table tbody tr.subtotal td {
                background-color: ${COLORS.BG_DEFAULT};
                border-top: 1px solid ${COLORS.BORDER_LIGHT};
                font-weight: 600;
              }
              
              .table tbody tr.total {
                background: ${COLORS.WHITE};
                border-top: 2px solid ${COLORS.TEXT_PRIMARY};
              }
              
              .table tbody tr.total td {
                color: ${COLORS.TEXT_PRIMARY};
                border-bottom: none;
                padding: 15px 12px;
                font-weight: 700;
              }
              
              .table tbody tr.total td.amount {
                font-size: 16px;
                font-weight: 700;
              }
              
              .footer {
                text-align: center;
                margin-top: 30px;
                padding: 20px;
                background: ${COLORS.WHITE};
                border-top: 1px solid ${COLORS.BORDER_LIGHT};
              }
              
              .footer h3 {
                color: ${COLORS.TEXT_PRIMARY};
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 10px;
              }
              
              .footer p {
                color: ${COLORS.TEXT_SECONDARY};
                font-size: 12px;
                margin-bottom: 5px;
              }
              
              @media print {
                .header,
                .table thead th,
                .table tbody tr.total td {
                  -webkit-print-color-adjust: exact;
                  color-adjust: exact;
                }
              }
            </style>
          </head>
          <body>
            <!-- Header -->
            <div class="header">
              <h1>${receipt.hotelName}</h1>
              <div class="address">${receipt.hotelAddress}</div>
              <div class="badges">
                <div class="badge receipt">${t('receipts.official')}</div>
                <div class="badge number">${t('receipts.receiptNumber', { number: receipt.receiptNumber })}</div>
              </div>
            </div>

            <div class="content">
              <!-- Guest Information Section -->
              <div class="section">
                <h2>${t('receipts.guestInformation')}</h2>
                <div class="info-grid">
                  <div>
                    <div class="info-item">
                      <div class="info-label">${t('receipts.fullName')}:</div>
                      <div class="info-value">${receipt.guestName}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">${t('receipts.email')}:</div>
                      <div class="info-value">${receipt.guestEmail || t('receipts.notAvailable')}</div>
                    </div>
                    ${receipt.guestPhone ? `
                    <div class="info-item">
                      <div class="info-label">${t('receipts.phone')}:</div>
                      <div class="info-value">${receipt.guestPhone}</div>
                    </div>
                    ` : ''}
                  </div>
                  <div>
                    <div class="info-item">
                      <div class="info-label">${t('receipts.confirmation')}:</div>
                      <div class="info-value highlight">${receipt.confirmationNumber}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">${t('receipts.guests')}:</div>
                      <div class="info-value">${receipt.numberOfGuests}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Stay Details Section -->
              <div class="section">
                <h2>${t('receipts.stayDetails')}</h2>
                <div class="info-grid">
                  <div>
                    <div class="info-item">
                      <div class="info-label">${t('receipts.room')}:</div>
                      <div class="info-value">${receipt.roomNumber} (${receipt.roomType})</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">${t('receipts.checkIn')}:</div>
                      <div class="info-value">${formatDate(receipt.checkInDate)}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">${t('receipts.checkOut')}:</div>
                      <div class="info-value">${formatDate(receipt.checkOutDate)}</div>
                    </div>
                  </div>
                  <div>
                    <div class="info-item">
                      <div class="info-label">${t('receipts.duration')}:</div>
                      <div class="info-value">${receipt.numberOfNights} ${getNightLabel(receipt.numberOfNights)}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">${t('receipts.ratePerNight')}:</div>
                      <div class="info-value">${formatCurrency(receipt.roomChargePerNight)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="divider"></div>

              <!-- Billing Table -->
              <table class="table">
                <thead>
                  <tr>
                    <th>${t('receipts.billing.description')}</th>
                    <th class="center">${t('receipts.billing.qty')}</th>
                    <th class="center">${t('receipts.billing.unitPrice')}</th>
                    <th class="right">${t('receipts.billing.amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Room Accommodation -->
                  <tr>
                    <td>${t('receipts.roomAccommodation')} (${receipt.numberOfNights} ${getNightLabel(receipt.numberOfNights)})</td>
                    <td class="center">${receipt.numberOfNights}</td>
                    <td class="center">${formatCurrencyWithDecimals(receipt.roomChargePerNight)}</td>
                    <td class="right">${formatCurrencyWithDecimals(receipt.totalRoomCharges)}</td>
                  </tr>

                  ${receipt.additionalCharges?.map(charge => {
                    const quantity = charge.quantity || 1;
                    const unitPrice = (charge.unitPrice && charge.unitPrice > 0) 
                      ? charge.unitPrice 
                      : (charge.amount || 0) / quantity;
                    const total = unitPrice * quantity;
                    return `
                      <tr>
                        <td>${charge.description || t('receipts.additionalService')}</td>
                        <td class="center">${quantity}</td>
                        <td class="center">${formatCurrencyWithDecimals(unitPrice)}</td>
                        <td class="right">${formatCurrencyWithDecimals(total)}</td>
                      </tr>
                    `;
                  }).join('') || ''}

                  ${receipt.taxesAndFees?.map(tax => {
                    return `
                      <tr>
                        <td colspan="3">${tax.description || t('receipts.tax')}</td>
                        <td class="right">${formatCurrencyWithDecimals(tax.amount || 0)}</td>
                      </tr>
                    `;
                  }).join('') || ''}

                  ${(receipt.totalTaxesAndFees || 0) > 0 ? `
                  <tr class="subtotal">
                    <td colspan="3">${t('receipts.billing.taxesAndFees')}</td>
                    <td class="right">${formatCurrencyWithDecimals(receipt.totalTaxesAndFees)}</td>
                  </tr>
                  ` : ''}

                  <!-- Total Amount -->
                  <tr class="total">
                    <td>${t('receipts.billing.totalAmount')}</td>
                    <td class="center"></td>
                    <td class="center"></td>
                    <td class="right amount">${formatCurrencyWithDecimals(receipt.grandTotal)}</td>
                  </tr>
                </tbody>
              </table>

              <!-- Footer -->
              <div class="footer">
                <h3>${t('receipts.thankYouHotel', { hotelName: receipt.hotelName })}</h3>
                <p>${t('receipts.generatedOn', { date: formatDateTime(receipt.generatedAt) })}</p>
                ${receipt.generatedBy ? `<p>${t('receipts.generatedBy', { name: receipt.generatedBy })}</p>` : ''}
                <p>${t('receipts.billing.officialReceipt')}</p>
              </div>
            </div>
          </body>
        </html>
      `);
      iframeDoc.close();
      
      // Wait for content to load, then print
      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        
        // Remove iframe after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      };
    }
  };

  const handleDownload = () => {
    // For now, use print functionality - can be enhanced with PDF generation later
    handlePrint();
  };

  const handleEmail = () => {
    // Open email dialog with guest's email pre-filled
    setRecipientEmail(receipt.guestEmail || '');
    setEmailDialogOpen(true);
  };

  const handleCloseEmailDialog = () => {
    setEmailDialogOpen(false);
    setRecipientEmail('');
  };

  const handleSendEmail = async () => {
    if (!receipt.reservationId || !token) {
      setSnackbar({
        open: true,
        message: t('receipts.emailDialog.errors.missingReservationInfo'),
        severity: 'error',
      });
      return;
    }

    if (!recipientEmail || !recipientEmail.trim()) {
      setSnackbar({
        open: true,
        message: t('receipts.emailDialog.errors.invalidEmail'),
        severity: 'error',
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      setSnackbar({
        open: true,
        message: t('receipts.emailDialog.errors.invalidEmail'),
        severity: 'error',
      });
      return;
    }

    setEmailLoading(true);
    try {
      const result = await frontDeskApiService.emailReceipt(
        token,
        receipt.reservationId,
        user?.tenantId || null,
        recipientEmail
      );

      if (result.success) {
        setSnackbar({
          open: true,
          message: t('receipts.emailDialog.success', { email: recipientEmail }),
          severity: 'success',
        });
        handleCloseEmailDialog();
      } else {
        setSnackbar({
          open: true,
          message: result.message || t('receipts.emailDialog.errors.failedToSend'),
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: t('receipts.emailDialog.errors.unexpectedError'),
        severity: 'error',
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { 
          minHeight: '90vh',
          borderRadius: 2,
          bgcolor: COLORS.BG_DEFAULT,
        }
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Main content wrapper with white background */}
        <Box sx={{ 
          bgcolor: COLORS.WHITE, 
          m: 3, 
          borderRadius: 2,
          boxShadow: `0 1px 3px ${addAlpha(COLORS.BLACK, 0.1)}`
        }}>
          {/* Header Section */}
          <Box sx={{ 
            p: 4, 
            borderBottom: `1px solid ${COLORS.BORDER_LIGHT}`,
            textAlign: 'center'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: COLORS.TEXT_PRIMARY }}>
              {receipt.hotelName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {receipt.hotelAddress}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.TEXT_SECONDARY }}>
                {t('receipts.official')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('receipts.receiptNumber', { number: receipt.receiptNumber })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Tooltip title={t('receipts.actions.printReceipt')}>
                <IconButton 
                  size="small"
                  onClick={handlePrint} 
                  sx={{ 
                    border: `1px solid ${COLORS.BORDER_LIGHT}`,
                    '&:hover': { bgcolor: COLORS.BG_DEFAULT },
                  }}
                >
                  <PrintIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('receipts.actions.downloadPdf')}>
                <IconButton 
                  size="small"
                  onClick={handleDownload} 
                  sx={{ 
                    border: `1px solid ${COLORS.BORDER_LIGHT}`,
                    '&:hover': { bgcolor: COLORS.BG_DEFAULT },
                  }}
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('receipts.actions.emailReceipt')}>
                <IconButton 
                  size="small"
                  onClick={handleEmail} 
                  sx={{ 
                    border: `1px solid ${COLORS.BORDER_LIGHT}`,
                    '&:hover': { bgcolor: COLORS.BG_DEFAULT },
                  }}
                >
                  <EmailIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Guest Information Section */}
          <Box sx={{ 
            mx: 4, 
            mt: 4,
            p: 3,
            border: `1px solid ${COLORS.BORDER_LIGHT}`,
            borderLeft: `4px solid ${theme.palette.primary.main}`
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                mb: 3,
                color: COLORS.TEXT_PRIMARY,
                fontSize: '1rem'
              }}
            >
              {t('receipts.guestInformation')}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: COLORS.TEXT_SECONDARY, textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                    {t('receipts.fullName')}:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {guestName}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: COLORS.TEXT_SECONDARY, textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                    {t('receipts.email')}:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {receipt.guestEmail || t('receipts.notAvailable')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: COLORS.TEXT_SECONDARY, textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                    {t('receipts.phone')}:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {receipt.guestPhone || t('receipts.notAvailable')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: COLORS.TEXT_SECONDARY, textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                    {t('receipts.confirmation')}:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.primary.main, mt: 0.5 }}>
                    {receipt.confirmationNumber}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: COLORS.TEXT_SECONDARY, textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                    {t('receipts.guests')}:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {receipt.numberOfGuests}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Stay Details Section */}
          <Box sx={{ 
            mx: 4, 
            mt: 3,
            p: 3,
            border: `1px solid ${COLORS.BORDER_LIGHT}`,
            borderLeft: `4px solid ${theme.palette.primary.main}`
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                mb: 3,
                color: COLORS.TEXT_PRIMARY,
                fontSize: '1rem'
              }}
            >
              {t('receipts.stayDetails')}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: COLORS.TEXT_SECONDARY, textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                    {t('receipts.room')}:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {receipt.roomNumber} ({receipt.roomType})
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: COLORS.TEXT_SECONDARY, textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                    {t('receipts.checkIn')}:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {formatDate(receipt.checkInDate)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: COLORS.TEXT_SECONDARY, textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                    {t('receipts.checkOut')}:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {formatDate(receipt.checkOutDate)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: COLORS.TEXT_SECONDARY, textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                    {t('receipts.duration')}:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {receipt.numberOfNights} {getNightLabel(receipt.numberOfNights)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: COLORS.TEXT_SECONDARY, textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                    {t('receipts.ratePerNight')}:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {formatCurrency(receipt.roomChargePerNight)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Charges Section */}
          <Box sx={{ mx: 4, mt: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    bgcolor: COLORS.BG_LIGHT,
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                    letterSpacing: '0.5px',
                    color: COLORS.TEXT_SECONDARY,
                    border: `1px solid ${COLORS.BORDER_LIGHT}`,
                    borderBottom: `2px solid ${COLORS.BORDER_LIGHT}`
                  }}>
                    {t('receipts.billing.description')}
                  </TableCell>
                  <TableCell align="center" sx={{ 
                    fontWeight: 700, 
                    bgcolor: COLORS.BG_LIGHT,
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                    letterSpacing: '0.5px',
                    color: COLORS.TEXT_SECONDARY,
                    border: `1px solid ${COLORS.BORDER_LIGHT}`,
                    borderBottom: `2px solid ${COLORS.BORDER_LIGHT}`
                  }}>
                    {t('receipts.billing.qty')}
                  </TableCell>
                  <TableCell align="right" sx={{ 
                    fontWeight: 700, 
                    bgcolor: COLORS.BG_LIGHT,
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                    letterSpacing: '0.5px',
                    color: COLORS.TEXT_SECONDARY,
                    border: `1px solid ${COLORS.BORDER_LIGHT}`,
                    borderBottom: `2px solid ${COLORS.BORDER_LIGHT}`
                  }}>
                    {t('receipts.billing.unitPrice')}
                  </TableCell>
                  <TableCell align="right" sx={{ 
                    fontWeight: 700, 
                    bgcolor: COLORS.BG_LIGHT,
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                    letterSpacing: '0.5px',
                    color: COLORS.TEXT_SECONDARY,
                    border: `1px solid ${COLORS.BORDER_LIGHT}`,
                    borderBottom: `2px solid ${COLORS.BORDER_LIGHT}`
                  }}>
                    {t('receipts.billing.amount')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Room charges */}
                <TableRow>
                  <TableCell sx={{ border: `1px solid ${COLORS.BORDER_LIGHT}` }}>
                    {t('receipts.roomAccommodation')} ({receipt.numberOfNights} {getNightLabel(receipt.numberOfNights)})
                  </TableCell>
                  <TableCell align="center" sx={{ border: `1px solid ${COLORS.BORDER_LIGHT}` }}>
                    {receipt.numberOfNights}
                  </TableCell>
                  <TableCell align="right" sx={{ border: `1px solid ${COLORS.BORDER_LIGHT}` }}>
                    {formatCurrency(receipt.roomChargePerNight)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, border: `1px solid ${COLORS.BORDER_LIGHT}` }}>
                    {formatCurrency(receipt.totalRoomCharges)}
                  </TableCell>
                </TableRow>

                {/* Shop/Additional charges */}
                {receipt.additionalCharges && receipt.additionalCharges.length > 0 && receipt.additionalCharges.map((charge: any, index: number) => {
                  const quantity = charge.quantity || 1;
                  const unitPrice = (charge.unitPrice && charge.unitPrice > 0)
                    ? charge.unitPrice
                    : (charge.amount || 0) / quantity;
                  const total = unitPrice * quantity;

                  return (
                    <TableRow key={index}>
                      <TableCell sx={{ border: `1px solid ${COLORS.BORDER_LIGHT}` }}>
                        {charge.description || t('receipts.additionalService')}
                      </TableCell>
                      <TableCell align="center" sx={{ border: `1px solid ${COLORS.BORDER_LIGHT}` }}>
                        {quantity}
                      </TableCell>
                      <TableCell align="right" sx={{ border: `1px solid ${COLORS.BORDER_LIGHT}` }}>
                        {formatCurrency(unitPrice)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, border: `1px solid ${COLORS.BORDER_LIGHT}` }}>
                        {formatCurrency(total)}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {/* Taxes and fees */}
                {receipt.taxesAndFees && receipt.taxesAndFees.length > 0 && receipt.taxesAndFees.map((tax: any, index: number) => (
                  <TableRow key={`tax-${index}`}>
                    <TableCell colSpan={3} sx={{ textAlign: 'right', fontWeight: 500, border: `1px solid ${COLORS.BORDER_LIGHT}` }}>
                      {tax.description || t('receipts.tax')}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, border: `1px solid ${COLORS.BORDER_LIGHT}` }}>
                      {formatCurrency(tax.amount)}
                    </TableCell>
                  </TableRow>
                ))}

                {/* Taxes & Fees Subtotal */}
                <TableRow>
                  <TableCell colSpan={3} sx={{ textAlign: 'right', fontWeight: 700, border: `1px solid ${COLORS.BORDER_LIGHT}` }}>
                    {t('receipts.billing.taxesAndFees')}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, border: `1px solid ${COLORS.BORDER_LIGHT}` }}>
                    {formatCurrency(receipt.totalTaxesAndFees)}
                  </TableCell>
                </TableRow>

                {/* Total Row */}
                <TableRow>
                  <TableCell 
                    colSpan={3} 
                    sx={{ 
                      textAlign: 'right', 
                      fontWeight: 700,
                      fontSize: '1rem',
                      bgcolor: COLORS.WHITE,
                      border: `2px solid ${COLORS.TEXT_PRIMARY}`,
                      borderRight: 'none'
                    }}
                  >
                    {t('receipts.billing.totalAmount')}
                  </TableCell>
                  <TableCell 
                    align="right" 
                    sx={{ 
                      fontWeight: 700,
                      fontSize: '1rem',
                      bgcolor: COLORS.WHITE,
                      border: `2px solid ${COLORS.TEXT_PRIMARY}`,
                      borderLeft: 'none'
                    }}
                  >
                    {formatCurrency(receipt.grandTotal)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>

          {/* Footer Section */}
          <Box sx={{ 
            mx: 4,
            mt: 4,
            mb: 4,
            pt: 3,
            borderTop: `1px solid ${COLORS.BORDER_LIGHT}`,
            textAlign: 'center'
          }}>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
              {t('receipts.thankYouHotel', { hotelName: receipt.hotelName })}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              {t('receipts.generatedOn', { date: formatDateTime(receipt.generatedAt) })}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: COLORS.BG_DEFAULT }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{ 
            minWidth: 120,
            textTransform: 'none',
            borderColor: COLORS.BORDER_LIGHT,
            color: COLORS.TEXT_SECONDARY,
            '&:hover': {
              borderColor: COLORS.TEXT_DISABLED,
              bgcolor: COLORS.BG_LIGHT
            }
          }}
        >
          {t('receipts.actions.close')}
        </Button>
      </DialogActions>

      {/* Email Dialog */}
      <Dialog
        open={emailDialogOpen}
        onClose={handleCloseEmailDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('receipts.emailDialog.title')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('receipts.emailDialog.description')}
            </Typography>
            <TextField
              autoFocus
              fullWidth
              label={t('receipts.emailDialog.recipientLabel')}
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder={t('receipts.emailDialog.recipientPlaceholder')}
              helperText={t('receipts.emailDialog.recipientHelper')}
              disabled={emailLoading}
              sx={{ mb: 2 }}
            />
            <Typography variant="caption" color="text.secondary">
              <strong>{t('receipts.emailDialog.bookingLabel')}</strong> {receipt.confirmationNumber}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseEmailDialog}
            disabled={emailLoading}
            sx={{ textTransform: 'none' }}
          >
            {t('receipts.emailDialog.cancel')}
          </Button>
          <Button 
            onClick={handleSendEmail}
            variant="contained"
            disabled={emailLoading || !recipientEmail.trim()}
            startIcon={emailLoading ? <CircularProgress size={20} /> : <EmailIcon />}
            sx={{ textTransform: 'none' }}
          >
            {emailLoading ? t('receipts.emailDialog.sending') : t('receipts.emailDialog.send')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for email notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default CheckoutReceiptDialog;
