import React from 'react';
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
} from '@mui/material';
import {
  Print as PrintIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { ShopOrder } from '../../types/shop';
import { getPremiumTableHeadSx } from './premiumStyles';

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

  const formatCurrencyWithDecimals = (amount: number | null | undefined) => {
    const safeAmount = amount || 0;
    return `ETB ${safeAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // For now, use the print functionality which can save as PDF
    handlePrint();
  };

  const handleCloseAndRefresh = () => {
    // console.log('handleCloseAndRefresh called:', {
    //   requiresPayment,
    //   onPaymentRequired: !!onPaymentRequired,
    //   order: order?.id
    // });
    
    // If payment is required, trigger payment dialog instead of closing
    if (requiresPayment && onPaymentRequired) {
      // console.log('Calling onPaymentRequired...');
      onPaymentRequired();
      return;
    }
    
    // console.log('Closing receipt dialog normally');
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
            minHeight: '90vh',
            borderRadius: 2,
            bgcolor: '#f5f5f5',
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box className="print-content" sx={{ 
            bgcolor: 'white', 
            m: 2, 
            borderRadius: 2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            {/* Header Section */}
            <Box sx={{ 
              p: 2.5, 
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1.5
            }}>
              {/* Centered Hotel Info */}
              <Box sx={{ textAlign: 'center', width: '100%' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.25, color: '#212121' }}>
                  {displayHotelName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  {order.hotelAddress || hotelAddress || '123 Main Street, Downtown'}
                </Typography>
                {(order.hotelTaxId || hotelTaxId) && (
                  <Typography variant="body2" color="text.secondary">
                    Tax ID: {order.hotelTaxId || hotelTaxId}
                  </Typography>
                )}
              </Box>
              
              {/* Centered Receipt Number/Title */}
              <Box sx={{ textAlign: 'center', width: '100%' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  {t('shopReceipt.receiptNumber')}{order.orderNumber}
                </Typography>
              </Box>
              
              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title={t('shopReceipt.printReceipt')}>
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
                <Tooltip title={t('shopReceipt.downloadReceipt')}>
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
              </Box>
            </Box>

            {/* Customer & Order Information */}
            <Box sx={{ p: 2.5 }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 2,
                  color: '#212121',
                  borderLeft: (theme) => `4px solid ${theme.palette.primary.main}`,
                  pl: 1.5
                }}
              >
                {t('shopReceipt.customerInformation')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="body2" sx={{ color: '#666', mb: 0.25, fontSize: '0.8rem' }}>
                      {t('shopReceipt.name')}:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {order.customerName || t('shopReceipt.anonymousCustomer')}
                    </Typography>
                  </Box>
                  {order.customerEmail && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="body2" sx={{ color: '#666', mb: 0.25, fontSize: '0.8rem' }}>
                        {t('shopReceipt.email')}:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {order.customerEmail}
                      </Typography>
                    </Box>
                  )}
                  {order.customerPhone && (
                    <Box>
                      <Typography variant="body2" sx={{ color: '#666', mb: 0.25, fontSize: '0.8rem' }}>
                        {t('shopReceipt.phone')}:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {order.customerPhone}
                      </Typography>
                    </Box>
                  )}
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="body2" sx={{ color: '#666', mb: 0.25, fontSize: '0.8rem' }}>
                      {t('shopReceipt.orderDate')}:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatDate(order.orderDate)}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="body2" sx={{ color: '#666', mb: 0.25, fontSize: '0.8rem' }}>
                      {t('shopReceipt.paymentMethod')}:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {order.paymentMethod === 'CASH' ? t('shopReceipt.cash') : (order.paymentMethod || t('shopReceipt.cash'))}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                      {t('shopReceipt.delivery')}:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {order.isDelivery ? `${t('shopReceipt.yesDelivery')} (${order.deliveryType})` : t('shopReceipt.noPickup')}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Order Items Table */}
            <Box sx={{ px: 2.5, pb: 2.5 }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 2,
                  fontSize: '0.9rem',
                  color: '#212121',
                  borderLeft: (theme) => `4px solid ${theme.palette.primary.main}`,
                  pl: 2
                }}
              >
                Order Items
              </Typography>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={getPremiumTableHeadSx({ compact: true })}>
                    <TableCell>
                      {t('shopReceipt.product')}
                    </TableCell>
                    <TableCell align="center">
                      {t('shopReceipt.sku')}
                    </TableCell>
                    <TableCell align="center">
                      {t('shopReceipt.qty')}
                    </TableCell>
                    <TableCell align="right">
                      {t('shopReceipt.unitPrice')}
                    </TableCell>
                    <TableCell align="right">
                      {t('shopReceipt.total')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item, index) => (
                    <TableRow 
                      key={item.id}
                      sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}
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
                              color: (theme) => theme.palette.primary.main, 
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
                          {formatCurrencyWithDecimals(item.unitPrice)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatCurrencyWithDecimals(item.unitPrice * item.quantity)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* VAT Row */}
                  {(order.vatAmount || 0) > 0 && (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ pt: 2, borderBottom: 'none' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontStyle: 'italic', fontSize: '0.85rem' }}>
                          VAT (15.00%)
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ pt: 2, borderBottom: 'none' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontStyle: 'italic', fontSize: '0.85rem' }}>
                          {formatCurrencyWithDecimals(order.vatAmount || 0)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Service Tax Row */}
                  {(order.serviceTaxAmount || 0) > 0 && (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ borderBottom: '2px solid #e0e0e0', pb: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontStyle: 'italic', fontSize: '0.85rem' }}>
                          Service Tax (5.00%)
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ borderBottom: '2px solid #e0e0e0', pb: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontStyle: 'italic', fontSize: '0.85rem' }}>
                          {formatCurrencyWithDecimals(order.serviceTaxAmount || 0)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Total Row */}
                  <TableRow>
                    <TableCell colSpan={4} sx={{ borderBottom: 'none', pt: 1.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        TOTAL
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ borderBottom: 'none', pt: 1.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                        {formatCurrencyWithDecimals(order.totalAmount)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            {/* Order Notes if any */}
            {order.notes && (
              <Box sx={{ px: 2.5, pb: 1.5 }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 1.5,
                    fontSize: '0.9rem',
                    color: '#212121',
                    borderLeft: (theme) => `4px solid ${theme.palette.primary.main}`,
                    pl: 2
                  }}
                >
                  Order Notes
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  {order.notes}
                </Typography>
              </Box>
            )}

            {/* Footer */}
            <Box sx={{ 
              p: 2.5, 
              borderTop: '1px solid #e0e0e0',
              textAlign: 'center',
              bgcolor: '#fafafa'
            }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, fontSize: '0.9rem' }}>
                {t('shopReceipt.thankYou')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.85rem' }}>
                {order.isDelivery && order.deliveryType === 'ROOM_DELIVERY' 
                  ? t('shopReceipt.roomDeliveryMessage')
                  : t('shopReceipt.pickupMessage')
                }
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, fontSize: '0.75rem' }}>
                {t('shopReceipt.receiptGenerated')} {formatDate(new Date().toISOString())}
              </Typography>
              {frontDeskPerson && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {t('shopReceipt.frontDeskPerson')} {frontDeskPerson}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5', justifyContent: 'space-between' }}>
          <Button 
            onClick={onClose} 
            variant="outlined"
            color="error"
            sx={{ 
              minWidth: 120,
              textTransform: 'none',
              borderColor: '#f44336',
              color: '#d32f2f',
              '&:hover': {
                borderColor: '#d32f2f',
                bgcolor: 'rgba(244, 67, 54, 0.04)'
              }
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleCloseAndRefresh} 
            variant="contained"
            sx={{ 
              minWidth: 120,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #1a365d 0%, #0f2744 100%)',
              boxShadow: '0 4px 15px rgba(26, 54, 93, 0.25)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2a4a6d 0%, #1a365d 100%)',
                boxShadow: '0 6px 20px rgba(26, 54, 93, 0.35)',
                transform: 'translateY(-2px)'
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
