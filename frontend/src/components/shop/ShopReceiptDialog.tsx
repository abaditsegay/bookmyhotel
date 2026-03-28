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
import { COLORS, addAlpha } from '../../theme/themeColors';
import { formatDateTimeForDisplay } from '../../utils/dateUtils';

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

  // Helper function to safely format dates
  const formatDate = (dateString: string) => {
    try {
      return formatDateTimeForDisplay(dateString) || 'N/A';
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

  const subtotalAmount = order.totalAmount || 0;
  const vatAmount = order.vatAmount || 0;
  const serviceTaxAmount = order.serviceTaxAmount || 0;
  const taxAmount = order.taxAmount != null ? order.taxAmount : vatAmount + serviceTaxAmount;
  const cityTaxAmount = Math.max(0, taxAmount - vatAmount - serviceTaxAmount);
  const totalWithTax = subtotalAmount + taxAmount;

  const calculateRatePercent = (amount: number) => {
    if (subtotalAmount <= 0) {
      return 0;
    }
    return (amount / subtotalAmount) * 100;
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
      case 'PAID': return COLORS.SUCCESS;
      case 'CHARGED TO ROOM': return COLORS.SLATE_600;
      case 'PROCESSING': return COLORS.WARNING;
      case 'COMPLETED': return COLORS.SUCCESS;
      case 'PENDING': return COLORS.WARNING;
      case 'CONFIRMED': return COLORS.SLATE_600;
      case 'PREPARING': return COLORS.SLATE_600;
      case 'READY': return COLORS.SLATE_600;
      case 'CANCELLED': return COLORS.ERROR;
      default: return COLORS.TEXT_DISABLED;
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
              background: ${COLORS.WHITE};
              padding: 20px;
              font-family: 'Roboto', sans-serif;
            }
            
            .print-header {
              background: ${COLORS.GRADIENT_SLATE} !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
              color: ${COLORS.WHITE} !important;
              padding: 24px !important;
              margin-bottom: 24px !important;
              border-radius: 8px !important;
            }
            
            .print-card {
              border: 1px solid ${COLORS.BORDER_LIGHT} !important;
              border-radius: 8px !important;
              margin-bottom: 16px !important;
              padding: 16px !important;
            }
            
            .print-table th {
              background: ${COLORS.GRADIENT_SLATE} !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
              color: ${COLORS.WHITE} !important;
              font-weight: bold !important;
            }
            
            .print-table {
              border-collapse: collapse !important;
              width: 100% !important;
            }
            
            .print-table th,
            .print-table td {
              border: 1px solid ${COLORS.BORDER_LIGHT} !important;
              padding: 12px !important;
              text-align: left !important;
            }
            
            .print-status {
              background-color: ${getStatusColor(order.status)} !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
              color: ${COLORS.WHITE} !important;
              padding: 6px 12px !important;
              border-radius: 12px !important;
              font-weight: bold !important;
              text-transform: uppercase !important;
            }
            
            .print-total-row {
              background-color: ${COLORS.WHITE} !important;
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
            bgcolor: COLORS.BG_DEFAULT,
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box className="print-content" sx={{ 
            bgcolor: COLORS.WHITE, 
            m: 2, 
            borderRadius: 2,
            boxShadow: `0 1px 3px ${addAlpha(COLORS.BLACK, 0.1)}`
          }}>
            {/* Header Section */}
            <Box sx={{ 
              p: 2.5, 
              borderBottom: `1px solid ${COLORS.BORDER_LIGHT}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1.5
            }}>
              {/* Centered Hotel Info */}
              <Box sx={{ textAlign: 'center', width: '100%' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.25, color: COLORS.TEXT_PRIMARY }}>
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
                      border: `1px solid ${COLORS.BORDER_LIGHT}`,
                      '&:hover': { bgcolor: COLORS.BG_DEFAULT },
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
                      border: `1px solid ${COLORS.BORDER_LIGHT}`,
                      '&:hover': { bgcolor: COLORS.BG_DEFAULT },
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
                  color: COLORS.TEXT_PRIMARY,
                  borderLeft: (theme) => `4px solid ${theme.palette.primary.main}`,
                  pl: 1.5
                }}
              >
                {t('shopReceipt.customerInformation')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="body2" sx={{ color: COLORS.TEXT_SECONDARY, mb: 0.25, fontSize: '0.8rem' }}>
                      {t('shopReceipt.name')}:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {order.customerName || t('shopReceipt.anonymousCustomer')}
                    </Typography>
                  </Box>
                  {order.customerEmail && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="body2" sx={{ color: COLORS.TEXT_SECONDARY, mb: 0.25, fontSize: '0.8rem' }}>
                        {t('shopReceipt.email')}:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {order.customerEmail}
                      </Typography>
                    </Box>
                  )}
                  {order.customerPhone && (
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.TEXT_SECONDARY, mb: 0.25, fontSize: '0.8rem' }}>
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
                    <Typography variant="body2" sx={{ color: COLORS.TEXT_SECONDARY, mb: 0.25, fontSize: '0.8rem' }}>
                      {t('shopReceipt.orderDate')}:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatDate(order.orderDate)}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="body2" sx={{ color: COLORS.TEXT_SECONDARY, mb: 0.25, fontSize: '0.8rem' }}>
                      {t('shopReceipt.paymentMethod')}:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {order.paymentMethod === 'CASH' ? t('shopReceipt.cash') : (order.paymentMethod || t('shopReceipt.cash'))}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: COLORS.TEXT_SECONDARY, mb: 0.5 }}>
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
                  color: COLORS.TEXT_PRIMARY,
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
                      sx={{ '&:hover': { bgcolor: COLORS.BG_LIGHT } }}
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
                  {vatAmount > 0 && (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ pt: 2, borderBottom: 'none' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontStyle: 'italic', fontSize: '0.85rem' }}>
                          VAT ({calculateRatePercent(vatAmount).toFixed(2)}%)
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ pt: 2, borderBottom: 'none' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontStyle: 'italic', fontSize: '0.85rem' }}>
                          {formatCurrencyWithDecimals(vatAmount)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Service Tax Row */}
                  {serviceTaxAmount > 0 && (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ borderBottom: `2px solid ${COLORS.BORDER_LIGHT}`, pb: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontStyle: 'italic', fontSize: '0.85rem' }}>
                          Service Tax ({calculateRatePercent(serviceTaxAmount).toFixed(2)}%)
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ borderBottom: `2px solid ${COLORS.BORDER_LIGHT}`, pb: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontStyle: 'italic', fontSize: '0.85rem' }}>
                          {formatCurrencyWithDecimals(serviceTaxAmount)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* City Tax Row */}
                  {cityTaxAmount > 0 && (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ borderBottom: `2px solid ${COLORS.BORDER_LIGHT}`, pb: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontStyle: 'italic', fontSize: '0.85rem' }}>
                          City Tax ({calculateRatePercent(cityTaxAmount).toFixed(2)}%)
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ borderBottom: `2px solid ${COLORS.BORDER_LIGHT}`, pb: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontStyle: 'italic', fontSize: '0.85rem' }}>
                          {formatCurrencyWithDecimals(cityTaxAmount)}
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
                        {formatCurrencyWithDecimals(totalWithTax)}
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
                    color: COLORS.TEXT_PRIMARY,
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
              borderTop: `1px solid ${COLORS.BORDER_LIGHT}`,
              textAlign: 'center',
              bgcolor: COLORS.BG_LIGHT
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

        <DialogActions sx={{ p: 3, bgcolor: COLORS.BG_DEFAULT, justifyContent: 'space-between' }}>
          <Button 
            onClick={onClose} 
            variant="outlined"
            color="error"
            sx={{ 
              minWidth: 120,
              textTransform: 'none',
              borderColor: COLORS.ERROR,
              color: COLORS.ERROR,
              '&:hover': {
                borderColor: COLORS.ERROR,
                bgcolor: addAlpha(COLORS.ERROR, 0.04)
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
              background: COLORS.GRADIENT_PRIMARY,
              boxShadow: `0 4px 15px ${addAlpha(COLORS.PRIMARY, 0.25)}`,
              '&:hover': {
                background: `linear-gradient(135deg, ${COLORS.PRIMARY_HOVER} 0%, ${COLORS.PRIMARY} 100%)`,
                boxShadow: `0 6px 20px ${addAlpha(COLORS.PRIMARY, 0.35)}`,
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
