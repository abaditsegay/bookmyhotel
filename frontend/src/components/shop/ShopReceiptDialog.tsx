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
  Close as CloseIcon,
} from '@mui/icons-material';
import { ShopOrder } from '../../types/shop';

interface ShopReceiptDialogProps {
  open: boolean;
  onClose: () => void;
  order: ShopOrder | null;
  hotelName?: string;
  hotelAddress?: string;
  hotelTaxId?: string;
  frontDeskPerson?: string;
  onOrderAdded?: () => void; // Callback to refresh order list
}

const ShopReceiptDialog: React.FC<ShopReceiptDialogProps> = ({
  open,
  onClose,
  order,
  hotelName,
  hotelAddress,
  hotelTaxId,
  frontDeskPerson,
  onOrderAdded,
}) => {
  if (!order) return null;

  // Use order.hotelName if available, otherwise fall back to prop or default
  const displayHotelName = order.hotelName || hotelName || 'BookMyHotel';

  // Get customer-friendly receipt status
  const getReceiptStatus = (status: string, paymentMethod: string) => {
    // For customer receipts, show more friendly status
    if (status === 'PENDING' && paymentMethod === 'ROOM_CHARGE') {
      return 'CHARGED TO ROOM';
    }
    if (status === 'PENDING') {
      return 'PROCESSING';
    }
    if (status === 'COMPLETED') {
      return 'PAID';
    }
    return status;
  };

  const receiptStatus = getReceiptStatus(order.status, order.paymentMethod || '');

  // Helper function to safely format dates
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
    } catch (error) {
      return 'N/A';
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Shop Receipt - ${order.orderNumber}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                background: white;
                color: black;
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #ccc;
                padding-bottom: 20px;
              }
              .hotel-info { margin-bottom: 20px; }
              .order-info { margin-bottom: 20px; }
              .items-table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-bottom: 20px; 
              }
              .items-table th, .items-table td { 
                border: 1px solid #ddd; 
                padding: 10px; 
                text-align: left; 
              }
              .items-table th { 
                background-color: #f2f2f2; 
                font-weight: bold;
              }
              .total-row { 
                font-weight: bold; 
                background-color: #f8f9fa; 
                font-size: 1.1em;
              }
              .footer { 
                margin-top: 30px; 
                text-align: center; 
                font-size: 12px; 
                color: #666; 
                border-top: 1px solid #ccc;
                padding-top: 20px;
              }
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
              }
              .info-section {
                border: 1px solid #ddd;
                padding: 15px;
                border-radius: 5px;
              }
              .status {
                display: inline-block;
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
              }
              .status.completed { background-color: #d4edda; color: #155724; }
              .status.paid { background-color: #d4edda; color: #155724; }
              .status.pending { background-color: #fff3cd; color: #856404; }
              .status.processing { background-color: #fff3cd; color: #856404; }
              .status.chargedtoroom { background-color: #cce5ff; color: #004085; }
              .status.confirmed { background-color: #cce5ff; color: #004085; }
              .status.preparing { background-color: #e2f3ff; color: #0056b3; }
              .status.ready { background-color: #d1ecf1; color: #0c5460; }
              .status.cancelled { background-color: #f8d7da; color: #721c24; }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${displayHotelName}</h1>
              ${hotelAddress ? `<p>${hotelAddress}</p>` : ''}
              ${hotelTaxId ? `<p><small>Tax ID: ${hotelTaxId}</small></p>` : ''}
              <h2>Shop Purchase Receipt</h2>
              <p><strong>Order #:</strong> ${order.orderNumber}</p>
              <span class="status ${receiptStatus.toLowerCase().replace(' ', '')}">${receiptStatus}</span>
            </div>
            
            <div class="info-grid">
              <div class="info-section">
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> ${order.customerName || 'Anonymous Customer'}</p>
                ${order.customerEmail ? `<p><strong>Email:</strong> ${order.customerEmail}</p>` : ''}
                ${order.customerPhone ? `<p><strong>Phone:</strong> ${order.customerPhone}</p>` : ''}
                ${order.roomNumber ? `<p><strong>Room:</strong> ${order.roomNumber}</p>` : ''}
              </div>
              
              <div class="info-section">
                <h3>Order Information</h3>
                <p><strong>Order Date:</strong> ${formatDate(order.orderDate)}</p>
                <p><strong>Payment Method:</strong> ${order.paymentMethod || 'N/A'}</p>
                <p><strong>Delivery:</strong> ${order.isDelivery ? `Yes (${order.deliveryType})` : 'No (Pickup)'}</p>
                ${order.completedAt ? `<p><strong>Completed:</strong> ${formatDate(order.completedAt)}</p>` : ''}
              </div>
            </div>
            
            <h3>Items Purchased</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>SKU</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>
                      <strong>${item.productName}</strong>
                      ${item.productDescription ? `<br><small>${item.productDescription}</small>` : ''}
                      ${item.notes ? `<br><small><em>Note: ${item.notes}</em></small>` : ''}
                    </td>
                    <td>${item.productSku}</td>
                    <td>${item.quantity}</td>
                    <td>ETB ${(item.unitPrice * 55).toFixed(0)} ($${item.unitPrice.toFixed(2)})</td>
                    <td>ETB ${(item.unitPrice * item.quantity * 55).toFixed(0)} ($${(item.unitPrice * item.quantity).toFixed(2)})</td>
                  </tr>
                `).join('')}
                ${order.taxAmount > 0 ? `
                  <tr>
                    <td colspan="4"><strong>Tax</strong></td>
                    <td><strong>ETB ${(order.taxAmount * 55).toFixed(0)} ($${order.taxAmount.toFixed(2)})</strong></td>
                  </tr>
                ` : ''}
                <tr class="total-row">
                  <td colspan="4"><strong>TOTAL</strong></td>
                  <td><strong>ETB ${(order.totalAmount * 55).toFixed(0)} ($${order.totalAmount.toFixed(2)})</strong></td>
                </tr>
              </tbody>
            </table>
            
            ${order.notes ? `
              <div class="info-section">
                <h3>Order Notes</h3>
                <p>${order.notes}</p>
              </div>
            ` : ''}
            
            <div class="footer">
              <p>Receipt generated on: ${formatDate(new Date().toISOString())}</p>
              ${frontDeskPerson ? `<p>Front Desk Person: ${frontDeskPerson}</p>` : ''}
              <p>Thank you for your purchase!</p>
              ${order.isDelivery && order.deliveryType === 'ROOM_DELIVERY' ? 
                '<p><strong>Your order will be delivered to your room.</strong></p>' : 
                '<p><strong>Please collect your order from the shop.</strong></p>'
              }
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    // For now, use the print functionality which can save as PDF
    handlePrint();
  };

  const handleCloseAndRefresh = () => {
    onClose();
    // Call the callback to refresh the order list if provided
    if (onOrderAdded) {
      onOrderAdded();
    }
  };

  const getStatusColor = (status: string) => {
    const friendlyStatus = getReceiptStatus(status, order?.paymentMethod || '');
    switch (friendlyStatus.toUpperCase()) {
      case 'PAID': return 'success';
      case 'CHARGED TO ROOM': return 'info';
      case 'PROCESSING': return 'warning';
      case 'COMPLETED': return 'success';
      case 'PENDING': return 'warning';
      case 'CONFIRMED': return 'info';
      case 'PREPARING': return 'info';
      case 'READY': return 'primary';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
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
            Shop Receipt - {order.customerName || 'Anonymous Customer'}
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
            <Tooltip title="Close">
              <IconButton onClick={onClose} color="default">
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Paper sx={{ p: 3, mb: 2 }}>
          {/* Hotel Information */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" gutterBottom>{displayHotelName}</Typography>
            {hotelAddress && (
              <Typography variant="body1" color="text.secondary">{hotelAddress}</Typography>
            )}
            {hotelTaxId && (
              <Typography variant="body2" color="text.secondary">Tax ID: {hotelTaxId}</Typography>
            )}
            <Typography variant="h6" sx={{ mt: 2, color: 'primary.main' }}>
              Shop Purchase Receipt
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Order #: {order.orderNumber}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  px: 2, 
                  py: 0.5, 
                  borderRadius: 2, 
                  backgroundColor: `${getStatusColor(order.status)}.light`,
                  color: `${getStatusColor(order.status)}.contrastText`,
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}
              >
                {receiptStatus}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Customer and Order Information */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Customer Information</Typography>
              <Typography><strong>Name:</strong> {order.customerName || 'Anonymous Customer'}</Typography>
              {order.customerEmail && (
                <Typography><strong>Email:</strong> {order.customerEmail}</Typography>
              )}
              {order.customerPhone && (
                <Typography><strong>Phone:</strong> {order.customerPhone}</Typography>
              )}
              {order.roomNumber && (
                <Typography><strong>Room:</strong> {order.roomNumber}</Typography>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Order Information</Typography>
              <Typography><strong>Order Date:</strong> {formatDate(order.orderDate)}</Typography>
              <Typography><strong>Payment Method:</strong> {order.paymentMethod || 'N/A'}</Typography>
              <Typography><strong>Delivery:</strong> {order.isDelivery ? `Yes (${order.deliveryType})` : 'No (Pickup)'}</Typography>
              {order.completedAt && (
                <Typography><strong>Completed:</strong> {formatDate(order.completedAt)}</Typography>
              )}
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Items */}
          <Typography variant="h6" gutterBottom>Items Purchased</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Item</strong></TableCell>
                  <TableCell><strong>SKU</strong></TableCell>
                  <TableCell align="center"><strong>Qty</strong></TableCell>
                  <TableCell align="right"><strong>Unit Price</strong></TableCell>
                  <TableCell align="right"><strong>Total</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {item.productName}
                      </Typography>
                      {item.productDescription && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {item.productDescription}
                        </Typography>
                      )}
                      {item.notes && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }} display="block">
                          Note: {item.notes}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{item.productSku}</TableCell>
                    <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        ETB {(item.unitPrice * 55).toFixed(0)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        (${item.unitPrice.toFixed(2)})
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        ETB {(item.unitPrice * item.quantity * 55).toFixed(0)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        (${(item.unitPrice * item.quantity).toFixed(2)})
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Tax Row */}
                {order.taxAmount > 0 && (
                  <TableRow>
                    <TableCell colSpan={4}><strong>Tax</strong></TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        <strong>ETB {(order.taxAmount * 55).toFixed(0)}</strong>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        (${order.taxAmount.toFixed(2)})
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {/* Total Row */}
                <TableRow sx={{ backgroundColor: 'primary.light' }}>
                  <TableCell colSpan={4}>
                    <Typography variant="h6" sx={{ color: 'primary.contrastText' }}>
                      <strong>TOTAL</strong>
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" sx={{ color: 'primary.contrastText' }}>
                      <strong>ETB {(order.totalAmount * 55).toFixed(0)}</strong>
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'primary.contrastText', opacity: 0.8 }}>
                      (${order.totalAmount.toFixed(2)})
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Order Notes */}
          {order.notes && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Order Notes</Typography>
              <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                <Typography variant="body2">{order.notes}</Typography>
              </Paper>
            </Box>
          )}

          {/* Footer */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Receipt generated on: {formatDate(new Date().toISOString())}
            </Typography>
            {frontDeskPerson && (
              <Typography variant="body2" color="text.secondary">
                Front Desk Person: {frontDeskPerson}
              </Typography>
            )}
            <Typography variant="body1" sx={{ mt: 2, fontStyle: 'italic', color: 'primary.main' }}>
              Thank you for your purchase!
            </Typography>
            {order.isDelivery && order.deliveryType === 'ROOM_DELIVERY' ? (
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 'medium' }}>
                Your order will be delivered to your room.
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 'medium' }}>
                Please collect your order from the shop.
              </Typography>
            )}
          </Box>
        </Paper>
      </DialogContent>

      <DialogActions>
        <Button onClick={handlePrint} variant="outlined" color="primary" startIcon={<PrintIcon />}>
          Print Receipt
        </Button>
        <Button onClick={handleCloseAndRefresh} variant="contained" color="primary">
          Close & Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShopReceiptDialog;
