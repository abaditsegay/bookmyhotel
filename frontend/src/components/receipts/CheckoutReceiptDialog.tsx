import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Divider,
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

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Final Receipt - ${receipt.receiptNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .hotel-info { margin-bottom: 20px; }
              .guest-info { margin-bottom: 20px; }
              .charges-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              .charges-table th, .charges-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .charges-table th { background-color: #f2f2f2; }
              .total-row { font-weight: bold; background-color: #f8f9fa; }
              .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${receipt.hotelName}</h1>
              <p>${receipt.hotelAddress}</p>
              <h2>Final Receipt</h2>
              <p>Receipt #: ${receipt.receiptNumber}</p>
            </div>
            
            <div class="guest-info">
              <h3>Guest Information</h3>
              <p><strong>Name:</strong> ${receipt.guestName}</p>
              <p><strong>Email:</strong> ${receipt.guestEmail}</p>
              <p><strong>Confirmation:</strong> ${receipt.confirmationNumber}</p>
            </div>
            
            <div class="stay-info">
              <h3>Stay Information</h3>
              <p><strong>Room:</strong> ${receipt.roomNumber} (${receipt.roomType})</p>
              <p><strong>Check-in:</strong> ${new Date(receipt.checkInDate).toLocaleDateString()}</p>
              <p><strong>Check-out:</strong> ${new Date(receipt.checkOutDate).toLocaleDateString()}</p>
              <p><strong>Nights:</strong> ${receipt.numberOfNights}</p>
            </div>
            
            <table class="charges-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Room Charges (${receipt.numberOfNights} nights)</td>
                  <td>${receipt.numberOfNights}</td>
                  <td>$${(receipt.roomChargePerNight || 0).toFixed(2)}</td>
                  <td>$${(receipt.totalRoomCharges || 0).toFixed(2)}</td>
                </tr>
                ${receipt.additionalCharges?.map(charge => {
                  const quantity = charge.quantity || 1;
                  // If unitPrice is provided and not zero, use it; otherwise fall back to amount/quantity
                  const unitPrice = (charge.unitPrice && charge.unitPrice > 0) 
                    ? charge.unitPrice 
                    : (charge.amount || 0) / quantity;
                  const total = unitPrice * quantity;
                  return `
                    <tr>
                      <td>${charge.description || 'N/A'}</td>
                      <td>${quantity}</td>
                      <td>$${unitPrice.toFixed(2)}</td>
                      <td>$${total.toFixed(2)}</td>
                    </tr>
                  `;
                }).join('') || ''}
                ${receipt.taxesAndFees?.map(tax => {
                  const quantity = tax.quantity || 1;
                  // If unitPrice is provided and not zero, use it; otherwise fall back to amount/quantity
                  const unitPrice = (tax.unitPrice && tax.unitPrice > 0) 
                    ? tax.unitPrice 
                    : (tax.amount || 0) / quantity;
                  const total = unitPrice * quantity;
                  return `
                    <tr>
                      <td>${tax.description || 'N/A'}</td>
                      <td>${quantity}</td>
                      <td>$${unitPrice.toFixed(2)}</td>
                      <td>$${total.toFixed(2)}</td>
                    </tr>
                  `;
                }).join('') || ''}
                <tr class="total-row">
                  <td colspan="3"><strong>Grand Total</strong></td>
                  <td><strong>$${(receipt.grandTotal || 0).toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>
            
            <div class="footer">
              <p>Generated on: ${new Date(receipt.generatedAt).toLocaleString()}</p>
              <p>Thank you for your stay!</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    // This could be enhanced to generate and download a PDF
    // For now, we'll use the print functionality
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
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">
            Final Receipt - {guestName} Checkout
          </Typography>
          <Box>
            <Tooltip title="Print Receipt">
              <IconButton onClick={handlePrint} color="primary">
                <PrintIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download Receipt">
              <IconButton onClick={handleDownload} color="primary">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Email Receipt">
              <IconButton onClick={handleEmail} color="primary">
                <EmailIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Paper sx={{ p: 3, mb: 2 }}>
          {/* Hotel Information */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" gutterBottom>{receipt.hotelName}</Typography>
            <Typography variant="body1" color="text.secondary">{receipt.hotelAddress}</Typography>
            <Typography variant="h6" sx={{ mt: 2, color: 'primary.main' }}>
              Final Receipt
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Receipt #: {receipt.receiptNumber}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Guest and Stay Information */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Guest Information</Typography>
              <Typography><strong>Name:</strong> {receipt.guestName}</Typography>
              <Typography><strong>Email:</strong> {receipt.guestEmail}</Typography>
              {receipt.guestPhone && (
                <Typography><strong>Phone:</strong> {receipt.guestPhone}</Typography>
              )}
              <Typography><strong>Confirmation:</strong> {receipt.confirmationNumber}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Stay Information</Typography>
              <Typography><strong>Room:</strong> {receipt.roomNumber} ({receipt.roomType})</Typography>
              <Typography><strong>Check-in:</strong> {new Date(receipt.checkInDate).toLocaleDateString()}</Typography>
              <Typography><strong>Check-out:</strong> {new Date(receipt.checkOutDate).toLocaleDateString()}</Typography>
              <Typography><strong>Nights:</strong> {receipt.numberOfNights}</Typography>
              <Typography><strong>Guests:</strong> {receipt.numberOfGuests}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Charges Breakdown */}
          <Typography variant="h6" gutterBottom>Charges Summary</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell align="center"><strong>Quantity</strong></TableCell>
                  <TableCell align="right"><strong>Unit Price</strong></TableCell>
                  <TableCell align="right"><strong>Total</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Room Charges */}
                <TableRow>
                  <TableCell>Room Charges ({receipt.numberOfNights} nights)</TableCell>
                  <TableCell align="center">{receipt.numberOfNights}</TableCell>
                  <TableCell align="right">${(receipt.roomChargePerNight || 0).toFixed(2)}</TableCell>
                  <TableCell align="right">${(receipt.totalRoomCharges || 0).toFixed(2)}</TableCell>
                </TableRow>

                {/* Additional Charges (Shop Orders, etc.) */}
                {receipt.additionalCharges?.map((charge, index) => {
                  const quantity = charge.quantity || 1;
                  // If unitPrice is provided and not zero, use it; otherwise fall back to amount/quantity
                  const unitPrice = (charge.unitPrice && charge.unitPrice > 0) 
                    ? charge.unitPrice 
                    : (charge.amount || 0) / quantity;
                  const total = unitPrice * quantity;
                  return (
                    <TableRow key={`additional-${index}`}>
                      <TableCell>{charge.description || 'N/A'}</TableCell>
                      <TableCell align="center">{quantity}</TableCell>
                      <TableCell align="right">${unitPrice.toFixed(2)}</TableCell>
                      <TableCell align="right">${total.toFixed(2)}</TableCell>
                    </TableRow>
                  );
                }) || []}

                {/* Taxes and Fees */}
                {receipt.taxesAndFees?.map((tax, index) => {
                  const quantity = tax.quantity || 1;
                  // If unitPrice is provided and not zero, use it; otherwise fall back to amount/quantity
                  const unitPrice = (tax.unitPrice && tax.unitPrice > 0) 
                    ? tax.unitPrice 
                    : (tax.amount || 0) / quantity;
                  const total = unitPrice * quantity;
                  return (
                    <TableRow key={`tax-${index}`}>
                      <TableCell>{tax.description || 'N/A'}</TableCell>
                      <TableCell align="center">{quantity}</TableCell>
                      <TableCell align="right">${unitPrice.toFixed(2)}</TableCell>
                      <TableCell align="right">${total.toFixed(2)}</TableCell>
                    </TableRow>
                  );
                }) || []}

                {/* Subtotals */}
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                  <TableCell><strong>Room Subtotal</strong></TableCell>
                  <TableCell align="center">-</TableCell>
                  <TableCell align="center">-</TableCell>
                  <TableCell align="right"><strong>${(receipt.totalRoomCharges || 0).toFixed(2)}</strong></TableCell>
                </TableRow>
                {(receipt.totalAdditionalCharges || 0) > 0 && (
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell><strong>Additional Charges Subtotal</strong></TableCell>
                    <TableCell align="center">-</TableCell>
                    <TableCell align="center">-</TableCell>
                    <TableCell align="right"><strong>${(receipt.totalAdditionalCharges || 0).toFixed(2)}</strong></TableCell>
                  </TableRow>
                )}
                {(receipt.totalTaxesAndFees || 0) > 0 && (
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell><strong>Taxes & Fees Subtotal</strong></TableCell>
                    <TableCell align="center">-</TableCell>
                    <TableCell align="center">-</TableCell>
                    <TableCell align="right"><strong>${(receipt.totalTaxesAndFees || 0).toFixed(2)}</strong></TableCell>
                  </TableRow>
                )}

                {/* Grand Total */}
                <TableRow sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
                  <TableCell><strong>GRAND TOTAL</strong></TableCell>
                  <TableCell align="center">-</TableCell>
                  <TableCell align="center">-</TableCell>
                  <TableCell align="right"><strong>${(receipt.grandTotal || 0).toFixed(2)}</strong></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Generated on: {new Date(receipt.generatedAt).toLocaleString()}
            </Typography>
            {receipt.generatedBy && (
              <Typography variant="body2" color="text.secondary">
                Generated by: {receipt.generatedBy}
              </Typography>
            )}
            <Typography variant="body1" sx={{ mt: 2, fontStyle: 'italic', color: 'primary.main' }}>
              Thank you for your stay!
            </Typography>
          </Box>
        </Paper>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckoutReceiptDialog;
