import React from 'react';
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
} from '@mui/material';
import {
  Print as PrintIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { ConsolidatedReceipt } from '../../services/frontDeskApi';
import { formatDateForDisplay } from '../../utils/dateUtils';

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
  const theme = useTheme();
  if (!receipt) return null;

  const formatDate = (dateString: string) => formatDateForDisplay(dateString);
  const formatDateTime = (dateString: string) => new Date(dateString).toLocaleString();

  const handlePrint = () => {
    const primaryColor = theme.palette.primary.main;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Hotel Receipt - ${receipt.receiptNumber}</title>
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
                color: #333;
                background: white;
              }
              
              .header {
                padding: 30px 20px 20px;
                border-bottom: 1px solid #e0e0e0;
                margin-bottom: 20px;
              }
              
              .header h1 {
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 6px;
                color: #212121;
              }
              
              .header .address {
                font-size: 14px;
                color: #666;
                margin-bottom: 15px;
              }
              
              .badges {
                display: flex;
                gap: 15px;
                align-items: center;
              }
              
              .badge {
                font-size: 13px;
                color: #666;
              }
              
              .badge.receipt {
                font-weight: 600;
              }
              
              .badge.number {
                color: #666;
                font-size: 13px;
              }
              
              .content {
                max-width: 800px;
                margin: 0 auto;
                padding: 0 20px;
              }
              
              .section {
                background: white;
                padding: 20px;
                margin-bottom: 20px;
                border: 1px solid #e0e0e0;
                border-left: 4px solid ${primaryColor};
              }
              
              .section h2 {
                color: #212121;
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
                color: #666;
                text-transform: uppercase;
                margin-bottom: 4px;
              }
              
              .info-value {
                font-size: 14px;
                font-weight: 500;
                color: #333;
              }
              
              .info-value.highlight {
                font-weight: 700;
                color: ${primaryColor};
                font-size: 16px;
              }
              
              .divider {
                height: 1px;
                background: #e0e0e0;
                margin: 20px 0;
              }
              
              .table {
                width: 100%;
                border-collapse: collapse;
                background: white;
                border: 1px solid #e0e0e0;
              }
              
              .table thead th {
                background: #fafafa;
                color: #666;
                padding: 12px;
                text-align: left;
                font-weight: 600;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                border-bottom: 1px solid #e0e0e0;
              }
              
              .table thead th.center {
                text-align: center;
              }
              
              .table thead th.right {
                text-align: right;
              }
              
              .table tbody td {
                padding: 15px 12px;
                border-bottom: 1px solid #f0f0f0;
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
                background-color: #f9f9f9;
              }
              
              .table tbody tr.subtotal td {
                background-color: #f5f5f5;
                border-top: 1px solid #e0e0e0;
                font-weight: 600;
              }
              
              .table tbody tr.total {
                background: white;
                border-top: 2px solid #212121;
              }
              
              .table tbody tr.total td {
                color: #212121;
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
                background: white;
                border-top: 1px solid #e0e0e0;
              }
              
              .footer h3 {
                color: #212121;
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 10px;
              }
              
              .footer p {
                color: #666;
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
                <div class="badge receipt">Official Receipt</div>
                <div class="badge number">Receipt #${receipt.receiptNumber}</div>
              </div>
            </div>

            <div class="content">
              <!-- Guest Information Section -->
              <div class="section">
                <h2>Guest Information</h2>
                <div class="info-grid">
                  <div>
                    <div class="info-item">
                      <div class="info-label">Full Name:</div>
                      <div class="info-value">${receipt.guestName}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">Email:</div>
                      <div class="info-value">${receipt.guestEmail}</div>
                    </div>
                    ${receipt.guestPhone ? `
                    <div class="info-item">
                      <div class="info-label">Phone:</div>
                      <div class="info-value">${receipt.guestPhone}</div>
                    </div>
                    ` : ''}
                  </div>
                  <div>
                    <div class="info-item">
                      <div class="info-label">Confirmation:</div>
                      <div class="info-value highlight">${receipt.confirmationNumber}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">Guests:</div>
                      <div class="info-value">${receipt.numberOfGuests}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Stay Details Section -->
              <div class="section">
                <h2>Stay Details</h2>
                <div class="info-grid">
                  <div>
                    <div class="info-item">
                      <div class="info-label">Room:</div>
                      <div class="info-value">${receipt.roomNumber} (${receipt.roomType})</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">Check-in:</div>
                      <div class="info-value">${formatDate(receipt.checkInDate)}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">Check-out:</div>
                      <div class="info-value">${formatDate(receipt.checkOutDate)}</div>
                    </div>
                  </div>
                  <div>
                    <div class="info-item">
                      <div class="info-label">Duration:</div>
                      <div class="info-value">${receipt.numberOfNights} night${receipt.numberOfNights !== 1 ? 's' : ''}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">Rate per Night:</div>
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
                    <th>DESCRIPTION</th>
                    <th class="center">QTY</th>
                    <th class="center">UNIT PRICE</th>
                    <th class="right">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Room Accommodation -->
                  <tr>
                    <td>Room Accommodation (${receipt.numberOfNights} night${receipt.numberOfNights !== 1 ? 's' : ''})</td>
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
                        <td>${charge.description || 'Additional Service'}</td>
                        <td class="center">${quantity}</td>
                        <td class="center">${formatCurrencyWithDecimals(unitPrice)}</td>
                        <td class="right">${formatCurrencyWithDecimals(total)}</td>
                      </tr>
                    `;
                  }).join('') || ''}

                  ${receipt.taxesAndFees?.map(tax => {
                    return `
                      <tr>
                        <td colspan="3">${tax.description || 'Tax'}</td>
                        <td class="right">${formatCurrencyWithDecimals(tax.amount || 0)}</td>
                      </tr>
                    `;
                  }).join('') || ''}

                  ${(receipt.totalTaxesAndFees || 0) > 0 ? `
                  <tr class="subtotal">
                    <td colspan="3">Taxes & Fees Subtotal</td>
                    <td class="right">${formatCurrencyWithDecimals(receipt.totalTaxesAndFees)}</td>
                  </tr>
                  ` : ''}

                  <!-- Total Amount -->
                  <tr class="total">
                    <td>TOTAL AMOUNT</td>
                    <td class="center"></td>
                    <td class="center"></td>
                    <td class="right amount">${formatCurrencyWithDecimals(receipt.grandTotal)}</td>
                  </tr>
                </tbody>
              </table>

              <!-- Footer -->
              <div class="footer">
                <h3>Thank you for choosing ${receipt.hotelName}!</h3>
                <p>Generated on ${formatDateTime(receipt.generatedAt)}</p>
                ${receipt.generatedBy ? `<p>Generated by: ${receipt.generatedBy}</p>` : ''}
                <p>This is an official receipt for your stay.</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    // For now, use print functionality - can be enhanced with PDF generation later
    handlePrint();
  };

  const handleEmail = () => {
    // This would integrate with the existing email receipt functionality
    alert('Email receipt functionality would be integrated here');
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
          bgcolor: '#f5f5f5',
        }
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Main content wrapper with white background */}
        <Box sx={{ 
          bgcolor: 'white', 
          m: 3, 
          borderRadius: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {/* Header Section */}
          <Box sx={{ 
            p: 4, 
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: '#212121' }}>
                {receipt.hotelName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {receipt.hotelAddress}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Receipt #{receipt.receiptNumber}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Print Receipt">
                  <IconButton 
                    size="small"
                    onClick={handlePrint} 
                    sx={{ 
                      border: '1px solid #e0e0e0',
                      '&:hover': { bgcolor: '#f5f5f5' },
                    }}
                  >
                    <PrintIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download PDF">
                  <IconButton 
                    size="small"
                    onClick={handleDownload} 
                    sx={{ 
                      border: '1px solid #e0e0e0',
                      '&:hover': { bgcolor: '#f5f5f5' },
                    }}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Email Receipt">
                  <IconButton 
                    size="small"
                    onClick={handleEmail} 
                    sx={{ 
                      border: '1px solid #e0e0e0',
                      '&:hover': { bgcolor: '#f5f5f5' },
                    }}
                  >
                    <EmailIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>

          {/* Booking Summary Section */}
          <Box sx={{ p: 4, borderBottom: '1px solid #e0e0e0' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600, 
                mb: 1,
                color: '#666',
                textTransform: 'uppercase',
                fontSize: '0.7rem',
                letterSpacing: '0.5px'
              }}
            >
              Official Receipt
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem' }}>
              Receipt #{receipt.receiptNumber}
            </Typography>
          </Box>

          {/* Guest Information Section */}
          <Box sx={{ 
            mx: 4, 
            mt: 4,
            p: 3,
            border: '1px solid #e0e0e0',
            borderLeft: `4px solid ${theme.palette.primary.main}`
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                mb: 3,
                color: '#212121',
                fontSize: '1rem'
              }}
            >
              Guest Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                    Full Name:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {guestName}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                    Email:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {receipt.guestEmail || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                    Phone:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {receipt.guestPhone || 'N/A'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                    Confirmation:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.primary.main, mt: 0.5 }}>
                    {receipt.confirmationNumber}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                    Guests:
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
            border: '1px solid #e0e0e0',
            borderLeft: `4px solid ${theme.palette.primary.main}`
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                mb: 3,
                color: '#212121',
                fontSize: '1rem'
              }}
            >
              Stay Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                    Room:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {receipt.roomNumber} ({receipt.roomType})
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                    Check-in:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {formatDate(receipt.checkInDate)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                    Check-out:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {formatDate(receipt.checkOutDate)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                    Duration:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {receipt.numberOfNights} night{receipt.numberOfNights > 1 ? 's' : ''}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                    Rate per night:
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
                    bgcolor: '#fafafa',
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                    letterSpacing: '0.5px',
                    color: '#666',
                    border: '1px solid #e0e0e0',
                    borderBottom: '2px solid #e0e0e0'
                  }}>
                    Description
                  </TableCell>
                  <TableCell align="center" sx={{ 
                    fontWeight: 700, 
                    bgcolor: '#fafafa',
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                    letterSpacing: '0.5px',
                    color: '#666',
                    border: '1px solid #e0e0e0',
                    borderBottom: '2px solid #e0e0e0'
                  }}>
                    QTY
                  </TableCell>
                  <TableCell align="right" sx={{ 
                    fontWeight: 700, 
                    bgcolor: '#fafafa',
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                    letterSpacing: '0.5px',
                    color: '#666',
                    border: '1px solid #e0e0e0',
                    borderBottom: '2px solid #e0e0e0'
                  }}>
                    Unit Price
                  </TableCell>
                  <TableCell align="right" sx={{ 
                    fontWeight: 700, 
                    bgcolor: '#fafafa',
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                    letterSpacing: '0.5px',
                    color: '#666',
                    border: '1px solid #e0e0e0',
                    borderBottom: '2px solid #e0e0e0'
                  }}>
                    Amount
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Room charges */}
                <TableRow>
                  <TableCell sx={{ border: '1px solid #e0e0e0' }}>
                    Room Accommodation ({receipt.numberOfNights} night{receipt.numberOfNights > 1 ? 's' : ''})
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid #e0e0e0' }}>
                    {receipt.numberOfNights}
                  </TableCell>
                  <TableCell align="right" sx={{ border: '1px solid #e0e0e0' }}>
                    {formatCurrency(receipt.roomChargePerNight)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, border: '1px solid #e0e0e0' }}>
                    {formatCurrency(receipt.totalRoomCharges)}
                  </TableCell>
                </TableRow>

                {/* Shop/Additional charges */}
                {receipt.additionalCharges && receipt.additionalCharges.length > 0 && receipt.additionalCharges.map((charge: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell sx={{ border: '1px solid #e0e0e0' }}>
                      {charge.description}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid #e0e0e0' }}>
                      {charge.quantity || 1}
                    </TableCell>
                    <TableCell align="right" sx={{ border: '1px solid #e0e0e0' }}>
                      {formatCurrency(charge.unitPrice || charge.amount)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, border: '1px solid #e0e0e0' }}>
                      {formatCurrency(charge.amount)}
                    </TableCell>
                  </TableRow>
                ))}

                {/* Taxes and fees */}
                {receipt.taxesAndFees && receipt.taxesAndFees.length > 0 && receipt.taxesAndFees.map((tax: any, index: number) => (
                  <TableRow key={`tax-${index}`}>
                    <TableCell colSpan={3} sx={{ textAlign: 'right', fontWeight: 500, border: '1px solid #e0e0e0' }}>
                      {tax.description}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, border: '1px solid #e0e0e0' }}>
                      {formatCurrency(tax.amount)}
                    </TableCell>
                  </TableRow>
                ))}

                {/* Taxes & Fees Subtotal */}
                <TableRow>
                  <TableCell colSpan={3} sx={{ textAlign: 'right', fontWeight: 700, border: '1px solid #e0e0e0' }}>
                    Taxes & Fees Subtotal
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, border: '1px solid #e0e0e0' }}>
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
                      bgcolor: '#fff',
                      border: '2px solid #212121',
                      borderRight: 'none'
                    }}
                  >
                    TOTAL AMOUNT
                  </TableCell>
                  <TableCell 
                    align="right" 
                    sx={{ 
                      fontWeight: 700,
                      fontSize: '1rem',
                      bgcolor: '#fff',
                      border: '2px solid #212121',
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
            borderTop: '1px solid #e0e0e0',
            textAlign: 'center'
          }}>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
              Thank you for choosing {receipt.hotelName}!
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              Generated on {formatDateTime(receipt.generatedAt)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{ 
            minWidth: 120,
            textTransform: 'none',
            borderColor: '#e0e0e0',
            color: '#616161',
            '&:hover': {
              borderColor: '#bdbdbd',
              bgcolor: '#fafafa'
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckoutReceiptDialog;
