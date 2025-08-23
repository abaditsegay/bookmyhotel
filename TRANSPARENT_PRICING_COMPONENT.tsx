// Enhanced Pricing Display Component

interface PriceBreakdownProps {
  basePrice: number;
  taxes: number;
  fees: number;
  discounts: number;
  currency: string;
}

export const TransparentPricing: React.FC<PriceBreakdownProps> = ({
  basePrice, taxes, fees, discounts, currency
}) => {
  const total = basePrice + taxes + fees - discounts;
  
  return (
    <Card sx={{ mt: 2, p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Price Breakdown
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Box display="flex" justifyContent="space-between">
          <Typography>Room rate (per night)</Typography>
          <Typography>{currency}{basePrice.toFixed(2)}</Typography>
        </Box>
        
        <Box display="flex" justifyContent="space-between">
          <Typography>Taxes & fees</Typography>
          <Typography>{currency}{taxes.toFixed(2)}</Typography>
        </Box>
        
        {fees > 0 && (
          <Box display="flex" justifyContent="space-between">
            <Typography>Service fees</Typography>
            <Typography>{currency}{fees.toFixed(2)}</Typography>
          </Box>
        )}
        
        {discounts > 0 && (
          <Box display="flex" justifyContent="space-between" color="success.main">
            <Typography>Discount</Typography>
            <Typography>-{currency}{discounts.toFixed(2)}</Typography>
          </Box>
        )}
      </Box>
      
      <Divider />
      
      <Box display="flex" justifyContent="space-between" sx={{ mt: 1 }}>
        <Typography variant="h6">Total</Typography>
        <Typography variant="h6" color="primary">
          {currency}{total.toFixed(2)}
        </Typography>
      </Box>
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
        ✓ No hidden fees ✓ Free cancellation ✓ Best price guaranteed
      </Typography>
    </Card>
  );
};
