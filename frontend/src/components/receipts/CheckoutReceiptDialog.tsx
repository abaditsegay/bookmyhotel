import React from 'react';
import { formatCurrency } from '../../utils/currencyUtils';
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
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
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
  if (!receipt) return null;

  const formatDate = (dateString: string) => formatDateForDisplay(dateString);
  const formatDateTime = (dateString: string) => new Date(dateString).toLocaleString();

  const handlePrint = () => {
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
                background: linear-gradient(135deg, #1976d2, #1565c0);
                color: white;
                padding: 40px 20px;
                text-align: center;
                margin-bottom: 20px;
                position: relative;
              }
              
              .header h1 {
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 8px;
              }
              
              .header .address {
                font-size: 18px;
                opacity: 0.9;
                margin-bottom: 20px;
              }
              
              .badges {
                display: flex;
                gap: 20px;
                justify-content: center;
                align-items: center;
              }
              
              .badge {
                background: rgba(255,255,255,0.2);
                padding: 10px 20px;
                border-radius: 25px;
                border: 1px solid rgba(255,255,255,0.3);
              }
              
              .badge.receipt {
                font-size: 18px;
                font-weight: 600;
              }
              
              .badge.number {
                background: rgba(255,255,255,0.15);
                padding: 5px 15px;
                border-radius: 15px;
                font-size: 14px;
              }
              
              .content {
                max-width: 800px;
                margin: 0 auto;
                padding: 0 20px;
              }
              
              .section {
                background: white;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
                border: 1px solid #e0e0e0;
                border-left: 4px solid #1976d2;
              }
              
              .section h2 {
                color: #1976d2;
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                gap: 8px;
              }
              
              .section h2::before {
                content: '';
                width: 8px;
                height: 8px;
                background: #1976d2;
                border-radius: 50%;
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
                color: #1976d2;
                font-size: 16px;
              }
              
              .divider {
                height: 2px;
                background: linear-gradient(90deg, transparent, #1976d2, transparent);
                margin: 20px 0;
              }
              
              .table {
                width: 100%;
                border-collapse: collapse;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                border: 1px solid #e0e0e0;
              }
              
              .table thead th {
                background: linear-gradient(135deg, #1976d2, #1565c0);
                color: white;
                padding: 15px 12px;
                text-align: left;
                font-weight: 700;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
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
                background: linear-gradient(135deg, #1976d2, #1565c0);
              }
              
              .table tbody tr.total td {
                color: white;
                border-bottom: none;
                padding: 20px 12px;
                font-weight: 700;
              }
              
              .table tbody tr.total td.amount {
                font-size: 18px;
              }
              
              .footer {
                text-align: center;
                margin-top: 30px;
                padding: 20px;
                background: white;
                border-radius: 8px;
                border: 1px solid #e0e0e0;
              }
              
              .footer h3 {
                color: #1976d2;
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 10px;
              }
              
              .footer p {
                color: #666;
                font-size: 12px;
                margin-bottom: 5px;
              }
              
              @media print {
                .header {
                  -webkit-print-color-adjust: exact;
                  color-adjust: exact;
                }
                
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
                    <td class="center">${formatCurrency(receipt.roomChargePerNight)}</td>
                    <td class="right">${formatCurrency(receipt.totalRoomCharges)}</td>
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
                        <td class="center">${formatCurrency(unitPrice)}</td>
                        <td class="right">${formatCurrency(total)}</td>
                      </tr>
                    `;
                  }).join('') || ''}

                  ${receipt.taxesAndFees?.map(tax => {
                    const quantity = tax.quantity || 1;
                    const unitPrice = (tax.unitPrice && tax.unitPrice > 0) 
                      ? tax.unitPrice 
                      : (tax.amount || 0) / quantity;
                    const total = unitPrice * quantity;
                    return `
                      <tr>
                        <td>${tax.description || 'Service Charge & VAT (20.0%)'}</td>
                        <td class="center">${quantity}</td>
                        <td class="center">${formatCurrency(unitPrice)}</td>
                        <td class="right">${formatCurrency(total)}</td>
                      </tr>
                    `;
                  }).join('') || ''}

                  ${(receipt.totalTaxesAndFees || 0) > 0 ? `
                  <tr class="subtotal">
                    <td colspan="3">Taxes & Fees Subtotal</td>
                    <td class="right">${formatCurrency(receipt.totalTaxesAndFees)}</td>
                  </tr>
                  ` : ''}

                  <!-- Total Amount -->
                  <tr class="total">
                    <td>TOTAL AMOUNT</td>
                    <td class="center"></td>
                    <td class="center"></td>
                    <td class="right amount">${formatCurrency(receipt.grandTotal)}</td>
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
          overflow: 'hidden',
        }
      }}
    >
      {/* Header with hotel name and receipt info - matching the blue header in image */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1976d2, #1565c0)',
        color: 'white',
        p: 4,
        textAlign: 'center',
        position: 'relative',
      }}>
        {/* Action buttons in top right */}
        <Box sx={{ 
          position: 'absolute', 
          top: 16, 
          right: 16,
          display: 'flex', 
          gap: 1 
        }}>
          <Tooltip title="Print Receipt">
            <IconButton 
              onClick={handlePrint} 
              sx={{ 
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
              }}
            >
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download PDF">
            <IconButton 
              onClick={handleDownload} 
              sx={{ 
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
              }}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Email Receipt">
            <IconButton 
              onClick={handleEmail} 
              sx={{ 
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
              }}
            >
              <EmailIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Hotel name and address */}
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          {receipt.hotelName}
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
          {receipt.hotelAddress}
        </Typography>

        {/* Receipt badges */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
          <Box sx={{
            bgcolor: 'rgba(255,255,255,0.2)',
            px: 3,
            py: 1,
            borderRadius: 25,
            border: '1px solid rgba(255,255,255,0.3)',
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Official Receipt
            </Typography>
          </Box>
          <Box sx={{
            bgcolor: 'rgba(255,255,255,0.15)',
            px: 2,
            py: 0.5,
            borderRadius: 15,
          }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Receipt #{receipt.receiptNumber}
            </Typography>
          </Box>
        </Box>

        {/* Arrow pointing down */}
        <Box sx={{
          position: 'absolute',
          bottom: -12,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '24px solid transparent',
          borderRight: '24px solid transparent',
          borderTop: '24px solid #1565c0',
        }} />
      </Box>

      <DialogContent sx={{ p: 0, bgcolor: '#f5f5f5' }}>
        <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
          {/* Guest Information Section */}
          <Box sx={{
            bgcolor: 'white',
            borderRadius: 2,
            p: 3,
            mb: 3,
            border: '1px solid #e0e0e0',
            borderLeft: '4px solid #1976d2',
          }}>
            <Typography variant="h6" sx={{ 
              color: '#1976d2', 
              fontWeight: 600, 
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}>
              <Box component="span" sx={{ 
                width: 8, 
                height: 8, 
                bgcolor: '#1976d2', 
                borderRadius: '50%' 
              }} />
              Guest Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#666', mb: 0.5 }}>
                    Full Name:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {receipt.guestName}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#666', mb: 0.5 }}>
                    Email:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {receipt.guestEmail}
                  </Typography>
                </Box>
                {receipt.guestPhone && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#666', mb: 0.5 }}>
                      Phone:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {receipt.guestPhone}
                    </Typography>
                  </Box>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#666', mb: 0.5 }}>
                    Confirmation:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#1976d2' }}>
                    {receipt.confirmationNumber}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#666', mb: 0.5 }}>
                    Guests:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {receipt.numberOfGuests}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Stay Details Section */}
          <Box sx={{
            bgcolor: 'white',
            borderRadius: 2,
            p: 3,
            mb: 3,
            border: '1px solid #e0e0e0',
            borderLeft: '4px solid #1976d2',
          }}>
            <Typography variant="h6" sx={{ 
              color: '#1976d2', 
              fontWeight: 600, 
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}>
              <Box component="span" sx={{ 
                width: 8, 
                height: 8, 
                bgcolor: '#1976d2', 
                borderRadius: '50%' 
              }} />
              Stay Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#666', mb: 0.5 }}>
                    Room:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {receipt.roomNumber} ({receipt.roomType})
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#666', mb: 0.5 }}>
                    Check-in:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formatDate(receipt.checkInDate)}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#666', mb: 0.5 }}>
                    Check-out:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formatDate(receipt.checkOutDate)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#666', mb: 0.5 }}>
                    Duration:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {receipt.numberOfNights} night{receipt.numberOfNights !== 1 ? 's' : ''}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#666', mb: 0.5 }}>
                    Rate per Night:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formatCurrency(receipt.roomChargePerNight)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Divider line */}
          <Box sx={{ 
            height: 2, 
            background: 'linear-gradient(90deg, transparent, #1976d2, transparent)', 
            mb: 3 
          }} />

          {/* Billing Table - matching the exact format from the image */}
          <Box sx={{
            bgcolor: 'white',
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid #e0e0e0',
          }}>
            <TableContainer>
              <Table>
                {/* Blue header matching the image */}
                <TableHead sx={{ 
                  background: 'linear-gradient(135deg, #1976d2, #1565c0)',
                }}>
                  <TableRow>
                    <TableCell sx={{ 
                      color: 'white', 
                      fontWeight: 700, 
                      fontSize: '0.95rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      DESCRIPTION
                    </TableCell>
                    <TableCell align="center" sx={{ 
                      color: 'white', 
                      fontWeight: 700, 
                      fontSize: '0.95rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      QTY
                    </TableCell>
                    <TableCell align="center" sx={{ 
                      color: 'white', 
                      fontWeight: 700, 
                      fontSize: '0.95rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      UNIT PRICE
                    </TableCell>
                    <TableCell align="right" sx={{ 
                      color: 'white', 
                      fontWeight: 700, 
                      fontSize: '0.95rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      AMOUNT
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Room Accommodation */}
                  <TableRow sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                    <TableCell sx={{ py: 2, fontWeight: 500 }}>
                      Room Accommodation ({receipt.numberOfNights} night{receipt.numberOfNights !== 1 ? 's' : ''})
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2, fontWeight: 500 }}>
                      {receipt.numberOfNights}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2, fontWeight: 500 }}>
                      {formatCurrency(receipt.roomChargePerNight)}
                    </TableCell>
                    <TableCell align="right" sx={{ py: 2, fontWeight: 600 }}>
                      {formatCurrency(receipt.totalRoomCharges)}
                    </TableCell>
                  </TableRow>

                  {/* Additional Charges */}
                  {receipt.additionalCharges?.map((charge, index) => {
                    const quantity = charge.quantity || 1;
                    const unitPrice = (charge.unitPrice && charge.unitPrice > 0) 
                      ? charge.unitPrice 
                      : (charge.amount || 0) / quantity;
                    const total = unitPrice * quantity;
                    return (
                      <TableRow key={`additional-${index}`} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                        <TableCell sx={{ py: 2, fontWeight: 500 }}>
                          {charge.description || 'Additional Service'}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 2, fontWeight: 500 }}>
                          {quantity}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 2, fontWeight: 500 }}>
                          {formatCurrency(unitPrice)}
                        </TableCell>
                        <TableCell align="right" sx={{ py: 2, fontWeight: 600 }}>
                          {formatCurrency(total)}
                        </TableCell>
                      </TableRow>
                    );
                  }) || []}

                  {/* Taxes and Fees */}
                  {receipt.taxesAndFees?.map((tax, index) => {
                    const quantity = tax.quantity || 1;
                    const unitPrice = (tax.unitPrice && tax.unitPrice > 0) 
                      ? tax.unitPrice 
                      : (tax.amount || 0) / quantity;
                    const total = unitPrice * quantity;
                    return (
                      <TableRow key={`tax-${index}`} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                        <TableCell sx={{ py: 2, fontWeight: 500 }}>
                          {tax.description || 'Service Charge & VAT (20.0%)'}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 2, fontWeight: 500 }}>
                          {quantity}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 2, fontWeight: 500 }}>
                          {formatCurrency(unitPrice)}
                        </TableCell>
                        <TableCell align="right" sx={{ py: 2, fontWeight: 600 }}>
                          {formatCurrency(total)}
                        </TableCell>
                      </TableRow>
                    );
                  }) || []}

                  {/* Subtotal row for taxes/fees if there are any */}
                  {(receipt.totalTaxesAndFees || 0) > 0 && (
                    <TableRow sx={{ bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
                      <TableCell colSpan={3} sx={{ 
                        py: 2, 
                        fontWeight: 600, 
                        fontSize: '1rem',
                      }}>
                        Taxes & Fees Subtotal
                      </TableCell>
                      <TableCell align="right" sx={{ 
                        py: 2, 
                        fontWeight: 700,
                        fontSize: '1rem',
                      }}>
                        {formatCurrency(receipt.totalTaxesAndFees)}
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Total Amount - blue background matching the image */}
                  <TableRow sx={{ 
                    background: 'linear-gradient(135deg, #1976d2, #1565c0)',
                    '& .MuiTableCell-root': {
                      color: 'white',
                      borderBottom: 'none',
                    }
                  }}>
                    <TableCell sx={{ 
                      py: 3, 
                      fontWeight: 700, 
                      fontSize: '1.1rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      TOTAL AMOUNT
                    </TableCell>
                    <TableCell />
                    <TableCell />
                    <TableCell align="right" sx={{ 
                      py: 3, 
                      fontWeight: 700, 
                      fontSize: '1.3rem',
                    }}>
                      {formatCurrency(receipt.grandTotal)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Footer section */}
          <Box sx={{ 
            textAlign: 'center', 
            mt: 4, 
            p: 3,
            bgcolor: 'white',
            borderRadius: 2,
            border: '1px solid #e0e0e0',
          }}>
            <Typography variant="h5" sx={{ 
              color: '#1976d2', 
              fontWeight: 600, 
              mb: 2 
            }}>
              Thank you for choosing {receipt.hotelName}!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Generated on {formatDateTime(receipt.generatedAt)}
            </Typography>
            {receipt.generatedBy && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Generated by: {receipt.generatedBy}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              This is an official receipt for your stay.
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
        <Button 
          onClick={onClose} 
          variant="contained" 
          size="large"
          sx={{ 
            px: 4,
            fontWeight: 600,
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckoutReceiptDialog;
