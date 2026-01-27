import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { API_CONFIG } from '../config/apiConfig';
import {
  Box,
  Typography,
  Button,
  Grid,
  MenuItem,
  Alert,
  Switch,
  FormControlLabel,
  CircularProgress,
  Tooltip,
  IconButton,
  Card,
  CardContent,
  useTheme,
  alpha
} from '@mui/material';
import PremiumTextField from './common/PremiumTextField';
import PremiumSelect from './common/PremiumSelect';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Receipt as ReceiptIcon,
  Discount as DiscountIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { getGradient, getInteractiveColor, getFormColor } from '../theme/themeColors';

// Utility functions for converting between percentage (0-100) and decimal (0.0-1.0) values
const toDecimal = (percentage: number): number => {
  return percentage / 100;
};

// Smart conversion that handles both decimal and percentage values from backend
const smartToPercentage = (value: number): number => {
  // If value is already in percentage range (>1), return as is
  // If value is in decimal range (0-1), convert to percentage
  return value > 1 ? value : Math.round(value * 100);
};

// Convert backend values to percentage for display
const convertConfigForDisplay = (backendConfig: any): PricingConfiguration => {
  return {
    ...backendConfig,
    vatRate: smartToPercentage(backendConfig.vatRate || 0),
    serviceTaxRate: smartToPercentage(backendConfig.serviceTaxRate || 0),
    cityTaxRate: smartToPercentage(backendConfig.cityTaxRate || 0),
    earlyBookingDiscountRate: smartToPercentage(backendConfig.earlyBookingDiscountRate || 0),
    loyaltyDiscountRate: smartToPercentage(backendConfig.loyaltyDiscountRate || 0),
    cancellationFeeRate: smartToPercentage(backendConfig.cancellationFeeRate || 0),
    modificationFeeRate: smartToPercentage(backendConfig.modificationFeeRate || 0),
    noShowPenaltyRate: smartToPercentage(backendConfig.noShowPenaltyRate || 0),
    refundPolicy7PlusDays: smartToPercentage(backendConfig.refundPolicy7PlusDays || 1.0),
    refundPolicy3To7Days: smartToPercentage(backendConfig.refundPolicy3To7Days || 0.5),
    refundPolicy1To2Days: smartToPercentage(backendConfig.refundPolicy1To2Days || 0.25),
    refundPolicySameDay: smartToPercentage(backendConfig.refundPolicySameDay || 0)
  };
};

// Convert percentage values to decimal for backend API
const convertConfigForBackend = (displayConfig: PricingConfiguration): any => {
  return {
    ...displayConfig,
    vatRate: toDecimal(displayConfig.vatRate),
    serviceTaxRate: toDecimal(displayConfig.serviceTaxRate),
    cityTaxRate: toDecimal(displayConfig.cityTaxRate),
    earlyBookingDiscountRate: toDecimal(displayConfig.earlyBookingDiscountRate),
    loyaltyDiscountRate: toDecimal(displayConfig.loyaltyDiscountRate),
    cancellationFeeRate: toDecimal(displayConfig.cancellationFeeRate),
    modificationFeeRate: toDecimal(displayConfig.modificationFeeRate),
    noShowPenaltyRate: toDecimal(displayConfig.noShowPenaltyRate),
    refundPolicy7PlusDays: toDecimal(displayConfig.refundPolicy7PlusDays || 100),
    refundPolicy3To7Days: toDecimal(displayConfig.refundPolicy3To7Days || 50),
    refundPolicy1To2Days: toDecimal(displayConfig.refundPolicy1To2Days || 25),
    refundPolicySameDay: toDecimal(displayConfig.refundPolicySameDay || 0)
  };
};

// Interface for the pricing configuration
// Note: All rate fields are stored as decimal values (0.0-1.0) in backend but displayed as percentages (0-100) in UI
interface PricingConfiguration {
  id?: number;
  hotelId: number;
  pricingStrategy: 'FIXED' | 'DYNAMIC' | 'SEASONAL';
  vatRate: number; // Stored as decimal (0.0-1.0), displayed as percentage (0-100)
  serviceTaxRate: number; // Stored as decimal (0.0-1.0), displayed as percentage (0-100)
  cityTaxRate: number; // Stored as decimal (0.0-1.0), displayed as percentage (0-100)
  taxInclusivePricing: boolean;
  peakSeasonMultiplier: number;
  offSeasonMultiplier: number;
  minimumStayNights: number;
  minimumAdvanceBookingHours: number;
  maximumAdvanceBookingDays: number;
  earlyBookingDaysThreshold: number;
  earlyBookingDiscountRate: number; // Stored as decimal (0.0-1.0), displayed as percentage (0-100)
  loyaltyDiscountRate: number; // Stored as decimal (0.0-1.0), displayed as percentage (0-100)
  cancellationFeeRate: number; // Stored as decimal (0.0-1.0), displayed as percentage (0-100)
  modificationFeeRate: number; // Stored as decimal (0.0-1.0), displayed as percentage (0-100)
  noShowPenaltyRate: number; // Stored as decimal (0.0-1.0), displayed as percentage (0-100)
  dynamicPricingEnabled: boolean;
  currencyCode: string;
  notes?: string;
  // Cancellation refund policy fields - stored as decimal (0.0-1.0), displayed as percentage (0-100)
  refundPolicy7PlusDays?: number;
  refundPolicy3To7Days?: number;
  refundPolicy1To2Days?: number;
  refundPolicySameDay?: number;
}

const PricingConfigurationComponent: React.FC = () => {
  const { user, token } = useAuth();
  const { t } = useTranslation();
  const theme = useTheme();
  const [config, setConfig] = useState<PricingConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch current configuration
  const fetchConfiguration = useCallback(async () => {
    if (!token || !user?.hotelId) return;

    // Default configuration values - Fixed pricing without tax (values in percentage for display)
    const defaultConfig: PricingConfiguration = {
      hotelId: typeof user?.hotelId === 'string' ? parseInt(user.hotelId) : (user?.hotelId || 1),
      pricingStrategy: 'FIXED',
      vatRate: 15, // 15% VAT (Ethiopian standard) - displayed as percentage
      serviceTaxRate: 5, // 5% service tax - displayed as percentage
      cityTaxRate: 0, // No city tax by default - displayed as percentage
      taxInclusivePricing: false, // Prices shown without tax, tax added during booking
      peakSeasonMultiplier: 1.0, // No change - set to 1.0 to not affect pricing
      offSeasonMultiplier: 1.0, // No change - set to 1.0 to not affect pricing
      minimumStayNights: 1,
      minimumAdvanceBookingHours: 2,
      maximumAdvanceBookingDays: 365,
      earlyBookingDaysThreshold: 30,
      earlyBookingDiscountRate: 10, // 10% early booking discount - displayed as percentage
      loyaltyDiscountRate: 5, // 5% loyalty discount - displayed as percentage
      cancellationFeeRate: 10, // 10% cancellation fee - displayed as percentage
      modificationFeeRate: 5, // 5% modification fee - displayed as percentage
      noShowPenaltyRate: 100, // 100% no-show penalty - displayed as percentage
      dynamicPricingEnabled: false, // Always use fixed pricing
      currencyCode: 'ETB',
      notes: 'Fixed pricing configuration - taxes applied during booking process',
      // Default refund policy values (displayed as percentages)
      refundPolicy7PlusDays: 100, // 100% refund for cancellations 7+ days before
      refundPolicy3To7Days: 50,   // 50% refund for cancellations 3-7 days before
      refundPolicy1To2Days: 25,   // 25% refund for cancellations 1-2 days before
      refundPolicySameDay: 0      // 0% refund for same-day cancellations
    };

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/hotel-admin/pricing-config/hotel/${user.hotelId}/active-or-create`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const configData = await response.json();
        // Convert backend decimal values to percentage for display
        setConfig(convertConfigForDisplay(configData));
      } else {
        throw new Error('Failed to fetch pricing configuration');
      }
    } catch (err) {
      // console.error('Error fetching configuration:', err);
      setError('Failed to load pricing configuration');
      // Set default configuration if fetch fails
      setConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  }, [token, user?.hotelId]);

  // Save configuration
  const saveConfiguration = async () => {
    if (!token || !user?.hotelId || !config) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const endpoint = config.id
        ? `${API_CONFIG.BASE_URL}/hotel-admin/pricing-config/${config.id}`
        : `${API_CONFIG.BASE_URL}/hotel-admin/pricing-config/hotel/${user.hotelId}/replace-active`;

      const method = config.id ? 'PUT' : 'POST';

      // Convert percentage values to decimal for backend
      const backendConfig = convertConfigForBackend(config);
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...backendConfig,
          hotel: { id: config.hotelId } // Add hotel object for backend validation
        })
      });

      if (response.ok) {
        const savedConfig = await response.json();
        // Convert backend decimal values to percentage for display
        setConfig(convertConfigForDisplay(savedConfig));
        setSuccess('Pricing configuration saved successfully!');
        setTimeout(() => setSuccess(null), 5000);
      } else {
        throw new Error('Failed to save pricing configuration');
      }
    } catch (err) {
      // console.error('Error saving configuration:', err);
      setError('Failed to save pricing configuration');
    } finally {
      setSaving(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof PricingConfiguration, value: any) => {
    if (!config) return;

    setConfig(prev => prev ? {
      ...prev,
      [field]: value
    } : null);
  };

  // Helper functions to calculate dynamic percentages (now working with percentage values)
  const calculatePercentageChange = (multiplier: number): string => {
    if (multiplier === 1.0) return '0% (no change)';
    const percentage = Math.round((multiplier - 1) * 100);
    if (percentage > 0) {
      return `${percentage}% increase`;
    } else {
      return `${Math.abs(percentage)}% decrease`;
    }
  };

  const calculateDiscountPercentage = (rate: number): string => {
    return `${Math.round(rate)}% discount`; // rate is already a percentage
  };

  const calculateFeePercentage = (rate: number): string => {
    return `${Math.round(rate)}% fee`; // rate is already a percentage
  };

  const calculateTaxPercentage = (rate: number): string => {
    return `${Math.round(rate)}%`; // rate is already a percentage
  };

  // Load configuration on component mount
  useEffect(() => {
    fetchConfiguration();
  }, [fetchConfiguration]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!config) {
    return (
      <Alert severity="error">
        Failed to load pricing configuration. Please try refreshing the page.
      </Alert>
    );
  }

  return (
    <Box sx={{ 
      p: 3, 
      bgcolor: 'background.default', 
      minHeight: '100vh'
    }}>
      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 3 }}>
        <Tooltip title={t('dashboard.hotelAdmin.pricingConfiguration.actions.refreshConfiguration')}>
          <IconButton 
            onClick={fetchConfiguration} 
            disabled={loading}
            sx={{
              color: getInteractiveColor(),
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                bgcolor: alpha(getInteractiveColor(), 0.1)
              }
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={saveConfiguration}
          disabled={saving}
          sx={{ 
            background: getGradient('primary'),
            color: 'white',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: `0 4px 12px ${alpha(getInteractiveColor(), 0.2)}`,
            '&:hover': {
              background: getGradient('primary'),
              transform: 'translateY(-1px)',
              boxShadow: `0 6px 16px ${alpha(getInteractiveColor(), 0.3)}`
            },
            '&:active': {
              transform: 'translateY(0px)'
            },
            '&:disabled': {
              bgcolor: alpha(getInteractiveColor(), 0.3),
              color: alpha('#ffffff', 0.7),
              transform: 'none',
              boxShadow: 'none'
            }
          }}
        >
          {saving ? t('dashboard.hotelAdmin.pricingConfiguration.actions.saving') : t('dashboard.hotelAdmin.pricingConfiguration.actions.saveChanges')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Pricing Policy Information */}
      <Alert 
        severity="info" 
        icon={<InfoIcon />}
        sx={{ 
          mb: 3,
          borderRadius: 2,
          bgcolor: alpha(getInteractiveColor(), 0.1),
          border: `1px solid ${alpha(getInteractiveColor(), 0.2)}`,
          '& .MuiAlert-message': {
            color: theme.palette.text.primary
          },
          '& .MuiAlert-icon': {
            color: getInteractiveColor()
          }
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {t('dashboard.hotelAdmin.pricingConfiguration.pricingPolicy')}
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12}>
          <Card sx={{ 
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            elevation: 0,
          }}>
            <CardContent sx={{ p: 4 }}>
              {/* General Settings Section */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                mb: 4,
                p: 2,
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
                borderLeft: '4px solid #E8B86D',
                borderRadius: 2,
              }}>
                <SettingsIcon sx={{ color: '#B8860B' }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5, color: '#B8860B' }}>
                    {t('dashboard.hotelAdmin.pricingConfiguration.generalSettings.title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('dashboard.hotelAdmin.pricingConfiguration.generalSettings.description')}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <PremiumSelect
                    fullWidth
                    label={t('dashboard.hotelAdmin.pricingConfiguration.generalSettings.pricingStrategy')}
                    value={config.pricingStrategy}
                    onChange={(e) => handleInputChange('pricingStrategy', e.target.value)}
                    disabled
                  >
                    <MenuItem value="FIXED">{t('dashboard.hotelAdmin.pricingConfiguration.generalSettings.fixedPricing')}</MenuItem>
                    <MenuItem value="SEASONAL" disabled>{t('dashboard.hotelAdmin.pricingConfiguration.generalSettings.seasonalPricing')}</MenuItem>
                    <MenuItem value="DYNAMIC" disabled>{t('dashboard.hotelAdmin.pricingConfiguration.generalSettings.dynamicPricing')}</MenuItem>
                  </PremiumSelect>
                </Grid>
                <Grid item xs={12} md={6}>
                  <PremiumTextField
                    fullWidth
                    label={t('dashboard.hotelAdmin.pricingConfiguration.generalSettings.currencyCode')}
                    value={config.currencyCode}
                    onChange={(e) => handleInputChange('currencyCode', e.target.value)}
                    placeholder="ETB"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={false} // Always false - tax added during booking
                        disabled
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {t('dashboard.hotelAdmin.pricingConfiguration.generalSettings.taxInclusivePricing')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('dashboard.hotelAdmin.pricingConfiguration.generalSettings.taxInclusivePricingDescription')}
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={false} // Always false - only fixed pricing
                        disabled
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {t('dashboard.hotelAdmin.pricingConfiguration.generalSettings.enableDynamicPricing')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('dashboard.hotelAdmin.pricingConfiguration.generalSettings.dynamicPricingDisabled')}
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Tax Configuration */}
        <Grid item xs={12}>
          <Card sx={{ 
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            elevation: 0,
          }}>
            <CardContent sx={{ p: 4 }}>
              {/* Tax Configuration Section */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                mb: 4,
                p: 2,
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
                borderLeft: '4px solid #E8B86D',
                borderRadius: 2,
              }}>
                <ReceiptIcon sx={{ color: '#B8860B' }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5, color: '#B8860B' }}>
                    {t('dashboard.hotelAdmin.pricingConfiguration.taxConfiguration.title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('dashboard.hotelAdmin.pricingConfiguration.taxConfiguration.description')}
                  </Typography>
                </Box>
              </Box>

              <Alert 
                severity="info" 
                sx={{ 
                  mb: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                }}
              >
                <Typography variant="body2">
                  {t('dashboard.hotelAdmin.pricingConfiguration.taxConfiguration.taxAlert')}
                </Typography>
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <PremiumTextField
                    fullWidth
                    label={t('dashboard.hotelAdmin.pricingConfiguration.taxConfiguration.vatRate')}
                    type="number"
                    value={config.vatRate}
                    onChange={(e) => handleInputChange('vatRate', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    helperText={t('dashboard.hotelAdmin.pricingConfiguration.taxConfiguration.vatRateHelper', { rate: calculateTaxPercentage(config.vatRate) })}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <PremiumTextField
                    fullWidth
                    label={t('dashboard.hotelAdmin.pricingConfiguration.taxConfiguration.serviceTaxRate')}
                    type="number"
                    value={config.serviceTaxRate}
                    onChange={(e) => handleInputChange('serviceTaxRate', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    helperText={t('dashboard.hotelAdmin.pricingConfiguration.taxConfiguration.serviceTaxRateHelper', { rate: calculateTaxPercentage(config.serviceTaxRate) })}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <PremiumTextField
                    fullWidth
                    label={t('dashboard.hotelAdmin.pricingConfiguration.taxConfiguration.cityTaxRate')}
                    type="number"
                    value={config.cityTaxRate}
                    onChange={(e) => handleInputChange('cityTaxRate', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    helperText={t('dashboard.hotelAdmin.pricingConfiguration.taxConfiguration.cityTaxRateHelper', { rate: calculateTaxPercentage(config.cityTaxRate) })}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Seasonal Pricing */}
        <Grid item xs={12}>
          <Card sx={{ 
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            elevation: 0,
          }}>
            <CardContent sx={{ p: 4 }}>
              {/* Seasonal Pricing Section */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                mb: 4,
                p: 2,
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
                borderLeft: '4px solid #E8B86D',
                borderRadius: 2,
              }}>
                <DiscountIcon sx={{ color: '#B8860B' }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5, color: '#B8860B' }}>
                    {t('dashboard.hotelAdmin.pricingConfiguration.seasonalMultipliers.title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('dashboard.hotelAdmin.pricingConfiguration.seasonalMultipliers.description')}
                  </Typography>
                </Box>
              </Box>

              <Alert 
                severity="info" 
                sx={{ 
                  mb: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                }}
              >
                <Typography variant="body2">
                  <strong>{t('dashboard.hotelAdmin.pricingConfiguration.refundPolicyNote.title')}</strong> {t('dashboard.hotelAdmin.pricingConfiguration.seasonalMultipliers.note')}
                </Typography>
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <PremiumTextField
                    fullWidth
                    label={t('dashboard.hotelAdmin.pricingConfiguration.seasonalMultipliers.peakSeasonMultiplier')}
                    type="number"
                    value={config.peakSeasonMultiplier}
                    onChange={(e) => handleInputChange('peakSeasonMultiplier', parseFloat(e.target.value) || 1)}
                    inputProps={{ min: 0.1, step: 0.1 }}
                    helperText={t('dashboard.hotelAdmin.pricingConfiguration.seasonalMultipliers.peakSeasonHelper', { value: config.peakSeasonMultiplier.toFixed(1), percentage: calculatePercentageChange(config.peakSeasonMultiplier) })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <PremiumTextField
                    fullWidth
                    label={t('dashboard.hotelAdmin.pricingConfiguration.seasonalMultipliers.offSeasonMultiplier')}
                    type="number"
                    value={config.offSeasonMultiplier}
                    onChange={(e) => handleInputChange('offSeasonMultiplier', parseFloat(e.target.value) || 1)}
                    inputProps={{ min: 0.1, step: 0.1 }}
                    helperText={t('dashboard.hotelAdmin.pricingConfiguration.seasonalMultipliers.offSeasonHelper', { value: config.offSeasonMultiplier.toFixed(1), percentage: calculatePercentageChange(config.offSeasonMultiplier) })}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Booking Rules */}
        <Grid item xs={12}>
          <Card sx={{ 
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            elevation: 0,
          }}>
            <CardContent sx={{ p: 4 }}>
              {/* Booking Rules Section */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                mb: 4,
                p: 2,
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
                borderLeft: '4px solid #E8B86D',
                borderRadius: 2,
              }}>
                <SettingsIcon sx={{ color: '#B8860B' }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5, color: '#B8860B' }}>
                    {t('dashboard.hotelAdmin.pricingConfiguration.bookingRules.title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('dashboard.hotelAdmin.pricingConfiguration.bookingRules.description')}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <PremiumTextField
                    fullWidth
                    label={t('dashboard.hotelAdmin.pricingConfiguration.bookingRules.minimumStayNights')}
                    type="number"
                    value={config.minimumStayNights}
                    onChange={(e) => handleInputChange('minimumStayNights', parseInt(e.target.value) || 1)}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <PremiumTextField
                    fullWidth
                    label={t('dashboard.hotelAdmin.pricingConfiguration.bookingRules.minimumAdvanceBookingHours')}
                    type="number"
                    value={config.minimumAdvanceBookingHours}
                    onChange={(e) => handleInputChange('minimumAdvanceBookingHours', parseInt(e.target.value) || 0)}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <PremiumTextField
                    fullWidth
                    label={t('dashboard.hotelAdmin.pricingConfiguration.bookingRules.maximumAdvanceBookingDays')}
                    type="number"
                    value={config.maximumAdvanceBookingDays}
                    onChange={(e) => handleInputChange('maximumAdvanceBookingDays', parseInt(e.target.value) || 365)}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Discounts & Fees */}
        <Grid item xs={12}>
          <Card sx={{ 
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            elevation: 0,
          }}>
            <CardContent sx={{ p: 4 }}>
              {/* Discounts & Fees Section */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                mb: 4,
                p: 2,
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}>
                <DiscountIcon sx={{ color: getInteractiveColor() }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5, color: getInteractiveColor() }}>
                    {t('dashboard.hotelAdmin.pricingConfiguration.discountsFees.title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('dashboard.hotelAdmin.pricingConfiguration.discountsFees.description')}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <PremiumTextField
                    fullWidth
                    label={t('dashboard.hotelAdmin.pricingConfiguration.discountsFees.earlyBookingDaysThreshold')}
                    type="number"
                    value={config.earlyBookingDaysThreshold}
                    onChange={(e) => handleInputChange('earlyBookingDaysThreshold', parseInt(e.target.value) || 30)}
                    inputProps={{ min: 1 }}
                    helperText={t('dashboard.hotelAdmin.pricingConfiguration.discountsFees.earlyBookingDaysHelperText')}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <PremiumTextField
                    fullWidth
                    label={t('dashboard.hotelAdmin.pricingConfiguration.discountsFees.earlyBookingDiscountRate')}
                    type="number"
                    value={config.earlyBookingDiscountRate}
                    onChange={(e) => handleInputChange('earlyBookingDiscountRate', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    helperText={t('dashboard.hotelAdmin.pricingConfiguration.discountsFees.discountHelper', { value: config.earlyBookingDiscountRate.toFixed(1), percentage: calculateDiscountPercentage(config.earlyBookingDiscountRate) })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <PremiumTextField
                    fullWidth
                    label={t('dashboard.hotelAdmin.pricingConfiguration.discountsFees.loyaltyDiscountRate')}
                    type="number"
                    value={config.loyaltyDiscountRate}
                    onChange={(e) => handleInputChange('loyaltyDiscountRate', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    helperText={t('dashboard.hotelAdmin.pricingConfiguration.discountsFees.discountHelper', { value: config.loyaltyDiscountRate.toFixed(1), percentage: calculateDiscountPercentage(config.loyaltyDiscountRate) })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <PremiumTextField
                    fullWidth
                    label={t('dashboard.hotelAdmin.pricingConfiguration.discountsFees.cancellationFeeRate')}
                    type="number"
                    value={config.cancellationFeeRate}
                    onChange={(e) => handleInputChange('cancellationFeeRate', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    helperText={t('dashboard.hotelAdmin.pricingConfiguration.discountsFees.feeHelper', { value: config.cancellationFeeRate.toFixed(1), percentage: calculateFeePercentage(config.cancellationFeeRate) })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <PremiumTextField
                    fullWidth
                    label={t('dashboard.hotelAdmin.pricingConfiguration.discountsFees.modificationFeeRate')}
                    type="number"
                    value={config.modificationFeeRate}
                    onChange={(e) => handleInputChange('modificationFeeRate', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    helperText={t('dashboard.hotelAdmin.pricingConfiguration.discountsFees.feeHelper', { value: config.modificationFeeRate.toFixed(1), percentage: calculateFeePercentage(config.modificationFeeRate) })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <PremiumTextField
                    fullWidth
                    label={t('dashboard.hotelAdmin.pricingConfiguration.discountsFees.noShowPenaltyRate')}
                    type="number"
                    value={config.noShowPenaltyRate}
                    onChange={(e) => handleInputChange('noShowPenaltyRate', parseFloat(e.target.value) || 1)}
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    helperText={t('dashboard.hotelAdmin.pricingConfiguration.discountsFees.penaltyHelper', { value: config.noShowPenaltyRate.toFixed(1), percentage: calculateFeePercentage(config.noShowPenaltyRate) })}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cancellation Refund Policies */}
        <Grid item xs={12}>
          <Card sx={{ 
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            elevation: 0,
          }}>
            <CardContent sx={{ p: 4 }}>
              {/* Cancellation Refund Policies Section */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                mb: 4,
                p: 2,
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}>
                <ReceiptIcon sx={{ color: getInteractiveColor() }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5, color: getInteractiveColor() }}>
                    {t('dashboard.hotelAdmin.pricingConfiguration.cancellationRefundPolicies.title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('dashboard.hotelAdmin.pricingConfiguration.cancellationRefundPolicies.description')}
                  </Typography>
                </Box>
              </Box>

              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                }}
              >
                <Typography variant="body2">
                  {t('dashboard.hotelAdmin.pricingConfiguration.cancellationRefundPolicies.alertDescription')}
                </Typography>
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <PremiumTextField
                    fullWidth
                    label={t('dashboard.hotelAdmin.pricingConfiguration.cancellationRefundPolicies.refund7PlusDays')}
                    type="number"
                    value={config.refundPolicy7PlusDays || 100}
                    onChange={(e) => handleInputChange('refundPolicy7PlusDays', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 100, step: 1 }}
                    helperText={t('dashboard.hotelAdmin.pricingConfiguration.cancellationRefundPolicies.refundHelper7Plus', { value: config.refundPolicy7PlusDays || 100 })}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <PremiumTextField
                    fullWidth
                    label={t('dashboard.hotelAdmin.pricingConfiguration.cancellationRefundPolicies.refund3To7Days')}
                    type="number"
                    value={config.refundPolicy3To7Days || 50}
                    onChange={(e) => handleInputChange('refundPolicy3To7Days', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 100, step: 1 }}
                    helperText={t('dashboard.hotelAdmin.pricingConfiguration.cancellationRefundPolicies.refundHelper3To7', { value: config.refundPolicy3To7Days || 50 })}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <PremiumTextField
                    fullWidth
                    label={t('dashboard.hotelAdmin.pricingConfiguration.cancellationRefundPolicies.refund1To2Days')}
                    type="number"
                    value={config.refundPolicy1To2Days || 25}
                    onChange={(e) => handleInputChange('refundPolicy1To2Days', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 100, step: 1 }}
                    helperText={t('dashboard.hotelAdmin.pricingConfiguration.cancellationRefundPolicies.refundHelper1To2', { value: config.refundPolicy1To2Days || 25 })}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <PremiumTextField
                    fullWidth
                    label={t('dashboard.hotelAdmin.pricingConfiguration.cancellationRefundPolicies.refundSameDay')}
                    type="number"
                    value={config.refundPolicySameDay || 0}
                    onChange={(e) => handleInputChange('refundPolicySameDay', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 100, step: 1 }}
                    helperText={t('dashboard.hotelAdmin.pricingConfiguration.cancellationRefundPolicies.refundHelperSameDay', { value: config.refundPolicySameDay || 0 })}
                  />
                </Grid>
              </Grid>

              <Alert 
                severity="warning" 
                sx={{ 
                  mt: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
                }}
              >
                <Typography variant="body2">
                  <strong>{t('dashboard.hotelAdmin.pricingConfiguration.refundPolicyNote.title')}</strong> {t('dashboard.hotelAdmin.pricingConfiguration.refundPolicyNote.description')}
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Notes */}
        <Grid item xs={12}>
          <Card sx={{ 
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            elevation: 0,
          }}>
            <CardContent sx={{ p: 4 }}>
              {/* Notes Section */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                mb: 4,
                p: 2,
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}>
                <InfoIcon sx={{ color: getInteractiveColor() }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5, color: getInteractiveColor() }}>
                    {t('dashboard.hotelAdmin.pricingConfiguration.additionalNotes.title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('dashboard.hotelAdmin.pricingConfiguration.additionalNotes.description')}
                  </Typography>
                </Box>
              </Box>

              <PremiumTextField
                fullWidth
                label={t('dashboard.hotelAdmin.pricingConfiguration.additionalNotes.configurationNotes')}
                multiline
                rows={3}
                value={config.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder={t('dashboard.hotelAdmin.pricingConfiguration.additionalNotes.placeholder')}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Fixed Pricing Confirmation */}
      <Alert 
        severity="success" 
        sx={{ 
          mt: 3,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.success.main, 0.1),
          border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
          '& .MuiAlert-message': {
            color: theme.palette.text.primary
          },
          '& .MuiAlert-icon': {
            color: theme.palette.success.main
          }
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          <strong>Fixed Pricing Strategy Active:</strong> Room prices will remain consistent based on your configured rates. 
          All taxes will be automatically calculated and added during the booking process to ensure transparent pricing for your customers.
        </Typography>
      </Alert>
    </Box>
  );
};

export default PricingConfigurationComponent;