import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Switch,
  FormControlLabel,
  CircularProgress,
  Tooltip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

// Interface for the pricing configuration
interface PricingConfiguration {
  id?: number;
  hotelId: number;
  pricingStrategy: 'FIXED' | 'DYNAMIC' | 'SEASONAL';
  vatRate: number;
  serviceTaxRate: number;
  cityTaxRate: number;
  taxInclusivePricing: boolean;
  peakSeasonMultiplier: number;
  offSeasonMultiplier: number;
  minimumStayNights: number;
  minimumAdvanceBookingHours: number;
  maximumAdvanceBookingDays: number;
  earlyBookingDaysThreshold: number;
  earlyBookingDiscountRate: number;
  loyaltyDiscountRate: number;
  cancellationFeeRate: number;
  modificationFeeRate: number;
  noShowPenaltyRate: number;
  dynamicPricingEnabled: boolean;
  currencyCode: string;
  notes?: string;
}

const PricingConfigurationComponent: React.FC = () => {
  const { user, token } = useAuth();
  const [config, setConfig] = useState<PricingConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch current configuration
  const fetchConfiguration = useCallback(async () => {
    if (!token || !user?.hotelId) return;

    // Default configuration values
    const defaultConfig: PricingConfiguration = {
      hotelId: typeof user?.hotelId === 'string' ? parseInt(user.hotelId) : (user?.hotelId || 1),
      pricingStrategy: 'FIXED',
      vatRate: 0.15, // 15% VAT (Ethiopian standard)
      serviceTaxRate: 0.05, // 5% service tax
      cityTaxRate: 0.00, // No city tax by default
      taxInclusivePricing: true,
      peakSeasonMultiplier: 1.30, // 30% increase for peak season
      offSeasonMultiplier: 0.80, // 20% decrease for off season
      minimumStayNights: 1,
      minimumAdvanceBookingHours: 2,
      maximumAdvanceBookingDays: 365,
      earlyBookingDaysThreshold: 30,
      earlyBookingDiscountRate: 0.10, // 10% early booking discount
      loyaltyDiscountRate: 0.05, // 5% loyalty discount
      cancellationFeeRate: 0.10, // 10% cancellation fee
      modificationFeeRate: 0.05, // 5% modification fee
      noShowPenaltyRate: 1.00, // 100% no-show penalty
      dynamicPricingEnabled: false,
      currencyCode: 'ETB',
      notes: 'Default pricing configuration'
    };

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:8080/managemyhotel/api/hotel-admin/pricing-config/hotel/${user.hotelId}/active-or-create`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const configData = await response.json();
        setConfig(configData);
      } else {
        throw new Error('Failed to fetch pricing configuration');
      }
    } catch (err) {
      console.error('Error fetching configuration:', err);
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
        ? `http://localhost:8080/managemyhotel/api/hotel-admin/pricing-config/${config.id}`
        : `http://localhost:8080/managemyhotel/api/hotel-admin/pricing-config/hotel/${user.hotelId}/replace-active`;

      const method = config.id ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        const savedConfig = await response.json();
        setConfig(savedConfig);
        setSuccess('Pricing configuration saved successfully!');
        setTimeout(() => setSuccess(null), 5000);
      } else {
        throw new Error('Failed to save pricing configuration');
      }
    } catch (err) {
      console.error('Error saving configuration:', err);
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

  // Helper functions to calculate dynamic percentages
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
    return `${Math.round(rate * 100)}% discount`;
  };

  const calculateFeePercentage = (rate: number): string => {
    return `${Math.round(rate * 100)}% fee`;
  };

  const calculateTaxPercentage = (rate: number): string => {
    return `${Math.round(rate * 100)}%`;
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
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Pricing & Tax Configuration
        </Typography>
        <Box>
          <Tooltip title="Refresh Configuration">
            <IconButton onClick={fetchConfiguration} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={saveConfiguration}
            disabled={saving}
            sx={{ ml: 1 }}
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </Box>
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

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">General Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Pricing Strategy</InputLabel>
                    <Select
                      value={config.pricingStrategy}
                      onChange={(e) => handleInputChange('pricingStrategy', e.target.value)}
                      label="Pricing Strategy"
                    >
                      <MenuItem value="FIXED">Fixed Pricing</MenuItem>
                      <MenuItem value="SEASONAL">Seasonal Pricing</MenuItem>
                      <MenuItem value="DYNAMIC">Dynamic Pricing</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Currency Code"
                    value={config.currencyCode}
                    onChange={(e) => handleInputChange('currencyCode', e.target.value)}
                    placeholder="ETB"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.taxInclusivePricing}
                        onChange={(e) => handleInputChange('taxInclusivePricing', e.target.checked)}
                      />
                    }
                    label="Tax Inclusive Pricing (prices shown include taxes)"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.dynamicPricingEnabled}
                        onChange={(e) => handleInputChange('dynamicPricingEnabled', e.target.checked)}
                      />
                    }
                    label="Enable Dynamic Pricing (adjust prices based on demand)"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Tax Configuration */}
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Tax Configuration</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="VAT Rate"
                    type="number"
                    value={config.vatRate}
                    onChange={(e) => handleInputChange('vatRate', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 1, step: 0.01 }}
                    helperText={`Current VAT: ${calculateTaxPercentage(config.vatRate)} (Ethiopian standard: 15%)`}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Service Tax Rate"
                    type="number"
                    value={config.serviceTaxRate}
                    onChange={(e) => handleInputChange('serviceTaxRate', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 1, step: 0.01 }}
                    helperText={`Current service tax: ${calculateTaxPercentage(config.serviceTaxRate)} (Ethiopian standard: 5%)`}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="City Tax Rate"
                    type="number"
                    value={config.cityTaxRate}
                    onChange={(e) => handleInputChange('cityTaxRate', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 1, step: 0.01 }}
                    helperText={`Current city tax: ${calculateTaxPercentage(config.cityTaxRate)} (Usually 0% in Ethiopia)`}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Seasonal Pricing */}
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Seasonal Pricing Multipliers</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Peak Season Multiplier"
                    type="number"
                    value={config.peakSeasonMultiplier}
                    onChange={(e) => handleInputChange('peakSeasonMultiplier', parseFloat(e.target.value) || 1)}
                    inputProps={{ min: 0.1, step: 0.1 }}
                    helperText={`${config.peakSeasonMultiplier.toFixed(1)} = ${calculatePercentageChange(config.peakSeasonMultiplier)} during peak season`}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Off Season Multiplier"
                    type="number"
                    value={config.offSeasonMultiplier}
                    onChange={(e) => handleInputChange('offSeasonMultiplier', parseFloat(e.target.value) || 1)}
                    inputProps={{ min: 0.1, step: 0.1 }}
                    helperText={`${config.offSeasonMultiplier.toFixed(1)} = ${calculatePercentageChange(config.offSeasonMultiplier)} during off season`}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Booking Rules */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Booking Rules</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Minimum Stay (nights)"
                    type="number"
                    value={config.minimumStayNights}
                    onChange={(e) => handleInputChange('minimumStayNights', parseInt(e.target.value) || 1)}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Minimum Advance Booking (hours)"
                    type="number"
                    value={config.minimumAdvanceBookingHours}
                    onChange={(e) => handleInputChange('minimumAdvanceBookingHours', parseInt(e.target.value) || 0)}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Maximum Advance Booking (days)"
                    type="number"
                    value={config.maximumAdvanceBookingDays}
                    onChange={(e) => handleInputChange('maximumAdvanceBookingDays', parseInt(e.target.value) || 365)}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Discounts & Fees */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Discounts & Fees</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Early Booking Days Threshold"
                    type="number"
                    value={config.earlyBookingDaysThreshold}
                    onChange={(e) => handleInputChange('earlyBookingDaysThreshold', parseInt(e.target.value) || 30)}
                    inputProps={{ min: 1 }}
                    helperText="Days in advance to qualify for early booking discount"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Early Booking Discount Rate"
                    type="number"
                    value={config.earlyBookingDiscountRate}
                    onChange={(e) => handleInputChange('earlyBookingDiscountRate', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 1, step: 0.01 }}
                    helperText={`${config.earlyBookingDiscountRate.toFixed(2)} = ${calculateDiscountPercentage(config.earlyBookingDiscountRate)}`}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Loyalty Discount Rate"
                    type="number"
                    value={config.loyaltyDiscountRate}
                    onChange={(e) => handleInputChange('loyaltyDiscountRate', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 1, step: 0.01 }}
                    helperText={`${config.loyaltyDiscountRate.toFixed(2)} = ${calculateDiscountPercentage(config.loyaltyDiscountRate)}`}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Cancellation Fee Rate"
                    type="number"
                    value={config.cancellationFeeRate}
                    onChange={(e) => handleInputChange('cancellationFeeRate', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 1, step: 0.01 }}
                    helperText={`${config.cancellationFeeRate.toFixed(2)} = ${calculateFeePercentage(config.cancellationFeeRate)}`}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Modification Fee Rate"
                    type="number"
                    value={config.modificationFeeRate}
                    onChange={(e) => handleInputChange('modificationFeeRate', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 1, step: 0.01 }}
                    helperText={`${config.modificationFeeRate.toFixed(2)} = ${calculateFeePercentage(config.modificationFeeRate)}`}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="No-Show Penalty Rate"
                    type="number"
                    value={config.noShowPenaltyRate}
                    onChange={(e) => handleInputChange('noShowPenaltyRate', parseFloat(e.target.value) || 1)}
                    inputProps={{ min: 0, max: 1, step: 0.01 }}
                    helperText={`${config.noShowPenaltyRate.toFixed(2)} = ${calculateFeePercentage(config.noShowPenaltyRate)} penalty`}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Notes */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Additional Notes</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                fullWidth
                label="Configuration Notes"
                multiline
                rows={3}
                value={config.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any notes about this pricing configuration..."
              />
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>

      {/* Warning for Dynamic Pricing */}
      {config.dynamicPricingEnabled && (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Dynamic Pricing is enabled.</strong> Room prices will automatically adjust based on demand, 
            occupancy rates, and market conditions. The multipliers above will be used as base values for calculations.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default PricingConfigurationComponent;