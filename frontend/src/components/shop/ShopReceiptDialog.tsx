import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,

  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import {
  Print as PrintIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
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
  onPaymentRequired?: () => void; // Callback when payment is required
  requiresPayment?: boolean; // Whether payment is still required
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
  onPaymentRequired,
  requiresPayment = false,
}) => {
  const { t } = useTranslation();
  
  if (!order) return null;

  // Use order.hotelName if available, otherwise fall back to prop or default
  const displayHotelName = order.hotelName || hotelName || 'BookMyHotel';

  // Get customer-friendly receipt status
  const getReceiptStatus = (status: string, paymentMethod: string) => {
    // For customer receipts, show more friendly status
    if (status === 'PENDING' && paymentMethod === 'ROOM_CHARGE') {
      return t('shopReceipt.chargedToRoom');
    }
    if (status === 'PENDING') {
      return t('shopReceipt.processing');
    }
    if (status === 'COMPLETED') {
      return t('shopReceipt.paid');
    }
    // Map other statuses
    switch (status.toUpperCase()) {
      case 'PAID': return t('shopReceipt.paid');
      case 'CONFIRMED': return t('shopReceipt.confirmed');
      case 'PREPARING': return t('shopReceipt.preparing');
      case 'READY': return t('shopReceipt.ready');
      case 'CANCELLED': return t('shopReceipt.cancelled');
      default: return status;
    }
  };

  const receiptStatus = getReceiptStatus(order.status, order.paymentMethod || '');

  // Helper function to safely format dates
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    const safeAmount = amount || 0;
    return `ETB ${safeAmount.toFixed(0)}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // For now, use the print functionality which can save as PDF
    handlePrint();
  };

  const handleCloseAndRefresh = () => {
    console.log('handleCloseAndRefresh called:', {
      requiresPayment,
      onPaymentRequired: !!onPaymentRequired,
      order: order?.id
    });
    
    // If payment is required, trigger payment dialog instead of closing
    if (requiresPayment && onPaymentRequired) {
      console.log('Calling onPaymentRequired...');
      onPaymentRequired();
      return;
    }
    
    console.log('Closing receipt dialog normally');
    onClose();
    // Call the callback to refresh the order list if provided
    if (onOrderAdded) {
      onOrderAdded();
    }
  };

  const getStatusColor = (status: string) => {
    const friendlyStatus = getReceiptStatus(status, order?.paymentMethod || '');
    switch (friendlyStatus.toUpperCase()) {
      case 'PAID': return '#16a34a'; // Professional green
      case 'CHARGED TO ROOM': return '#475569'; // Muted slate
      case 'PROCESSING': return '#ea580c'; // Professional orange
      case 'COMPLETED': return '#16a34a'; // Professional green
      case 'PENDING': return '#ea580c'; // Professional orange
      case 'CONFIRMED': return '#475569'; // Muted slate
      case 'PREPARING': return '#475569'; // Muted slate
      case 'READY': return '#475569'; // Muted slate
      case 'CANCELLED': return '#dc2626'; // Professional red
      default: return '#6b7280'; // Professional gray
    }
  };

  return (
    <>
      {/* Professional Print Styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            
            .print-content, .print-content * {
              visibility: visible;
            }
            
            .print-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              background: white;
              padding: 20px;
              font-family: 'Roboto', sans-serif;
            }
            
            .print-header {
              background: linear-gradient(135deg, #475569 0%, #64748b 100%) !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
              color: white !important;
              padding: 24px !important;
              margin-bottom: 24px !important;
              border-radius: 8px !important;
            }
            
            .print-card {
              border: 1px solid #e0e0e0 !important;
              border-radius: 8px !important;
              margin-bottom: 16px !important;
              padding: 16px !important;
            }
            
            .print-table th {
              background: linear-gradient(135deg, #475569 0%, #64748b 100%) !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
              color: white !important;
              font-weight: bold !important;
            }
            
            .print-table {
              border-collapse: collapse !important;
              width: 100% !important;
            }
            
            .print-table th,
            .print-table td {
              border: 1px solid #e0e0e0 !important;
              padding: 12px !important;
              text-align: left !important;
            }
            
            .print-status {
              background-color: ${getStatusColor(order.status)} !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
              color: white !important;
              padding: 6px 12px !important;
              border-radius: 12px !important;
              font-weight: bold !important;
              text-transform: uppercase !important;
            }
            
            .print-total-row {
              background-color: #ffffff !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-weight: bold !important;
            }
            
            @page {
              margin: 0.5in;
              size: A4;
            }
          }
        `}
      </style>

      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '95vh',
            borderRadius: 2,
          },
        }}
      >
        {/* Dialog Header - Hidden in Print */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
            color: 'white',
            '@media print': { display: 'none' },
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('shopReceipt.title')} - {order.customerName || t('shopReceipt.anonymousCustomer')}
          </Typography>
          <Box>
            <Tooltip title={t('shopReceipt.printReceipt')}>
              <IconButton 
                onClick={handlePrint} 
                sx={{ mr: 1, color: 'white' }}
                size="small"
              >
                <PrintIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('shopReceipt.downloadReceipt')}>
              <IconButton 
                onClick={handleDownload} 
                sx={{ mr: 1, color: 'white' }}
                size="small"
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('shopReceipt.close')}>
              <IconButton 
                onClick={onClose} 
                sx={{ color: 'white' }}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <DialogContent sx={{ p: 0 }}>
          <Box className="print-content" sx={{ p: 3 }}>
            {/* Professional Header */}
            <Box 
              className="print-header"
              sx={{
                background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
                color: 'white',
                p: 3,
                borderRadius: 2,
                mb: 3,
                textAlign: 'center',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {displayHotelName}
              </Typography>
              {(order.hotelAddress || hotelAddress) && (
                <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>
                  {order.hotelAddress || hotelAddress}
                </Typography>
              )}
              {(order.hotelTaxId || hotelTaxId) && (
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Tax ID: {order.hotelTaxId || hotelTaxId}
                </Typography>
              )}
              <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
                {t('shopReceipt.receiptNumber')}{order.orderNumber}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography 
                  className="print-status"
                  variant="caption" 
                  sx={{ 
                    px: 2, 
                    py: 0.8, 
                    borderRadius: 2, 
                    backgroundColor: getStatusColor(order.status),
                    color: 'white',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem'
                  }}
                >
                  {receiptStatus}
                </Typography>
              </Box>
            </Box>

            {/* Customer & Order Information Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Card 
                  className="print-card"
                  sx={{ 
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'grey.200',
                  }}
                >
                  <CardContent sx={{ pb: '16px !important' }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: '#475569', 
                        fontWeight: 600, 
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {t('shopReceipt.customerInformation')}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">{t('shopReceipt.name')}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {order.customerName || t('shopReceipt.anonymousCustomer')}
                        </Typography>
                      </Box>
                      {order.customerEmail && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">{t('shopReceipt.email')}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {order.customerEmail}
                          </Typography>
                        </Box>
                      )}
                      {order.customerPhone && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">{t('shopReceipt.phone')}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {order.customerPhone}
                          </Typography>
                        </Box>
                      )}
                      {order.roomNumber && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">{t('shopReceipt.room')}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {order.roomNumber}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card 
                  className="print-card"
                  sx={{ 
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'grey.200',
                  }}
                >
                  <CardContent sx={{ pb: '16px !important' }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: '#475569', 
                        fontWeight: 600, 
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {t('shopReceipt.orderDetails')}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">{t('shopReceipt.orderDate')}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatDate(order.orderDate)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">{t('shopReceipt.paymentMethod')}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {order.paymentMethod === 'CASH' ? t('shopReceipt.cash') : (order.paymentMethod || t('shopReceipt.cash'))}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">{t('shopReceipt.delivery')}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {order.isDelivery ? `${t('shopReceipt.yesDelivery')} (${order.deliveryType})` : t('shopReceipt.noPickup')}
                        </Typography>
                      </Box>
                      {order.completedAt && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">{t('shopReceipt.completedAt')}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formatDate(order.completedAt)}
                          </Typography>
                        </Box>
                      )}
                      {order.isDelivery && order.deliveryAddress && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">{t('shopReceipt.address')}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500, maxWidth: '60%', textAlign: 'right' }}>
                            {order.deliveryAddress}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Order Items Table */}
            <Card className="print-card" sx={{ mb: 3, border: '1px solid', borderColor: 'grey.200' }}>
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Table className="print-table" sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell 
                        sx={{ 
                          background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      >
                        {t('shopReceipt.product')}
                      </TableCell>
                      <TableCell 
                        align="center"
                        sx={{ 
                          background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      >
                        {t('shopReceipt.sku')}
                      </TableCell>
                      <TableCell 
                        align="center"
                        sx={{ 
                          background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      >
                        {t('shopReceipt.qty')}
                      </TableCell>
                      <TableCell 
                        align="right"
                        sx={{ 
                          background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      >
                        {t('shopReceipt.unitPrice')}
                      </TableCell>
                      <TableCell 
                        align="right"
                        sx={{ 
                          background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      >
                        {t('shopReceipt.total')}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items.map((item, index) => (
                      <TableRow 
                        key={item.id}
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.productName}
                          </Typography>
                          {item.productDescription && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {item.productDescription}
                            </Typography>
                          )}
                          {item.notes && (
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: '#475569', 
                                fontStyle: 'italic',
                                display: 'block',
                                mt: 0.5
                              }}
                            >
                              Note: {item.notes}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">{item.productSku}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.quantity}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatCurrency(item.unitPrice)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Tax Row */}
                    {(order.taxAmount || 0) > 0 && (
                      <TableRow 
                        className="print-total-row"
                        sx={{
                          backgroundColor: '#ffffff',
                        }}
                      >
                        <TableCell colSpan={4}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>Tax</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatCurrency(order.taxAmount || 0)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Total Row */}
                    <TableRow 
                      className="print-total-row"
                      sx={{
                        backgroundColor: '#475569',
                        '& .MuiTableCell-root': {
                          color: 'white',
                          fontWeight: 700,
                        }
                      }}
                    >
                      <TableCell colSpan={4}>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                          TOTAL
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                          {formatCurrency(order.totalAmount)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Order Summary & Notes */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={8}>
                {order.notes && (
                  <Card className="print-card" sx={{ border: '1px solid', borderColor: 'grey.200' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#475569', fontWeight: 600, mb: 2 }}>
                        Order Notes
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.notes}
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                <Card className="print-card" sx={{ border: '1px solid', borderColor: 'grey.200' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: '#475569', fontWeight: 600, mb: 2 }}>
                      {t('shopReceipt.orderSummary')}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">{t('shopReceipt.subtotal')}:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatCurrency((order.totalAmount || 0) - (order.taxAmount || 0))}
                        </Typography>
                      </Box>
                      {(order.taxAmount || 0) > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">{t('shopReceipt.tax')}:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formatCurrency(order.taxAmount || 0)}
                          </Typography>
                        </Box>
                      )}
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{t('shopReceipt.totalLabel')}:</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#475569' }}>
                          {formatCurrency(order.totalAmount || 0)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Professional Footer */}
            <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
              <Typography variant="h6" sx={{ color: '#475569', fontWeight: 600, mb: 1 }}>
                {t('shopReceipt.thankYou')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {order.isDelivery && order.deliveryType === 'ROOM_DELIVERY' 
                  ? t('shopReceipt.roomDeliveryMessage')
                  : t('shopReceipt.pickupMessage')
                }
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {t('shopReceipt.receiptGenerated')} {formatDate(new Date().toISOString())}
              </Typography>
              {frontDeskPerson && (
                <Typography variant="body2" color="text.secondary">
                  {t('shopReceipt.frontDeskPerson')} {frontDeskPerson}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions 
          sx={{ 
            p: 2, 
            borderTop: '1px solid #e0e0e0',
            '@media print': { display: 'none' } 
          }}
        >
          <Button 
            onClick={handlePrint} 
            startIcon={<PrintIcon />} 
            variant="outlined"
            sx={{ color: '#475569', borderColor: '#475569' }}
          >
            {t('shopReceipt.printReceipt')}
          </Button>
          <Button 
            onClick={handleDownload} 
            startIcon={<DownloadIcon />} 
            variant="outlined"
            sx={{ color: '#475569', borderColor: '#475569' }}
          >
            {t('shopReceipt.download')}
          </Button>
          <Button 
            onClick={handleCloseAndRefresh} 
            variant="contained"
            sx={{ 
              background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
              }
            }}
          >
            {requiresPayment ? t('shopReceipt.continueToPayment') : t('shopReceipt.closeContinue')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ShopReceiptDialog;
