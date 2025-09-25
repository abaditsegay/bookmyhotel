import React, { useState, useEffect, useCallback } from 'react';
import { API_CONFIG } from '../config/apiConfig';
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
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, addAlpha } from '../theme/themeColors';

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

    // Default configuration values - Fixed pricing without tax
    const defaultConfig: PricingConfiguration = {
      hotelId: typeof user?.hotelId === 'string' ? parseInt(user.hotelId) : (user?.hotelId || 1),
      pricingStrategy: 'FIXED',
      vatRate: 0.15, // 15% VAT (Ethiopian standard) - applied during booking
      serviceTaxRate: 0.05, // 5% service tax - applied during booking
      cityTaxRate: 0.00, // No city tax by default
      taxInclusivePricing: false, // Prices shown without tax, tax added during booking
      peakSeasonMultiplier: 1.0, // No change - set to 1.0 to not affect pricing
      offSeasonMultiplier: 1.0, // No change - set to 1.0 to not affect pricing
      minimumStayNights: 1,
      minimumAdvanceBookingHours: 2,
      maximumAdvanceBookingDays: 365,
      earlyBookingDaysThreshold: 30,
      earlyBookingDiscountRate: 0.10, // 10% early booking discount
      loyaltyDiscountRate: 0.05, // 5% loyalty discount
      cancellationFeeRate: 0.10, // 10% cancellation fee
      modificationFeeRate: 0.05, // 5% modification fee
      noShowPenaltyRate: 1.00, // 100% no-show penalty
      dynamicPricingEnabled: false, // Always use fixed pricing
      currencyCode: 'ETB',
      notes: 'Fixed pricing configuration - taxes applied during booking process'
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
        ? `${API_CONFIG.BASE_URL}/hotel-admin/pricing-config/${config.id}`
        : `${API_CONFIG.BASE_URL}/hotel-admin/pricing-config/hotel/${user.hotelId}/replace-active`;

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
        <Typography variant="h4" component="h1" sx={{ color: COLORS.PRIMARY }}>
          Pricing & Tax Configuration
        </Typography>
        <Box>
          <Tooltip title="Refresh Configuration">
            <IconButton 
              onClick={fetchConfiguration} 
              disabled={loading}
              sx={{
                color: COLORS.PRIMARY,
                '&:hover': {
                  backgroundColor: addAlpha(COLORS.PRIMARY, 0.1)
                }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={saveConfiguration}
            disabled={saving}
            sx={{ 
              ml: 1,
              backgroundColor: COLORS.PRIMARY,
              '&:hover': {
                backgroundColor: addAlpha(COLORS.PRIMARY, 0.8)
              }
            }}
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

      {/* Pricing Policy Information */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Pricing Policy:</strong> Room prices are displayed without taxes. All applicable taxes 
          (VAT, service tax, city tax) will be calculated and added during the booking process. This 
          ensures transparent pricing for customers while maintaining compliance with tax regulations.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: addAlpha(COLORS.PRIMARY, 0.05),
                '&:hover': {
                  backgroundColor: addAlpha(COLORS.PRIMARY, 0.1)
                }
              }}
            >
              <Typography variant="h6" sx={{ color: COLORS.PRIMARY, fontWeight: 'bold' }}>
                General Settings
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: COLORS.PRIMARY }}>Pricing Strategy</InputLabel>
                    <Select
                      value={config.pricingStrategy}
                      onChange={(e) => handleInputChange('pricingStrategy', e.target.value)}
                      label="Pricing Strategy"
                      disabled // Always use Fixed Pricing
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: addAlpha(COLORS.PRIMARY, 0.3)
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY
                        }
                      }}
                    >
                      <MenuItem value="FIXED">Fixed Pricing</MenuItem>
                      <MenuItem value="SEASONAL" disabled>Seasonal Pricing (Contact Support)</MenuItem>
                      <MenuItem value="DYNAMIC" disabled>Dynamic Pricing (Contact Support)</MenuItem>
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
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: COLORS.PRIMARY
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: addAlpha(COLORS.PRIMARY, 0.3)
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: COLORS.PRIMARY
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={false} // Always false - tax added during booking
                        disabled
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: COLORS.PRIMARY,
                            '& + .MuiSwitch-track': {
                              backgroundColor: COLORS.PRIMARY
                            }
                          }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">
                          Tax Inclusive Pricing (prices shown include taxes)
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Disabled: Taxes will be calculated and added during the booking process
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
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: COLORS.PRIMARY,
                            '& + .MuiSwitch-track': {
                              backgroundColor: COLORS.PRIMARY
                            }
                          }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">
                          Enable Dynamic Pricing (adjust prices based on demand)
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Disabled: Using fixed pricing strategy only
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Tax Configuration */}
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: addAlpha(COLORS.PRIMARY, 0.05),
                '&:hover': {
                  backgroundColor: addAlpha(COLORS.PRIMARY, 0.1)
                }
              }}
            >
              <Typography variant="h6" sx={{ color: COLORS.PRIMARY, fontWeight: 'bold' }}>
                Tax Configuration
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  These tax rates will be automatically applied during the booking process. 
                  Room prices displayed to customers will not include these taxes.
                </Typography>
              </Alert>
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
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: COLORS.PRIMARY
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: addAlpha(COLORS.PRIMARY, 0.3)
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: COLORS.PRIMARY
                      }
                    }}
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
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: COLORS.PRIMARY
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: addAlpha(COLORS.PRIMARY, 0.3)
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: COLORS.PRIMARY
                      }
                    }}
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
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: COLORS.PRIMARY
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: addAlpha(COLORS.PRIMARY, 0.3)
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: COLORS.PRIMARY
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Seasonal Pricing */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: addAlpha(COLORS.PRIMARY, 0.05),
                '&:hover': {
                  backgroundColor: addAlpha(COLORS.PRIMARY, 0.1)
                }
              }}
            >
              <Typography variant="h6" sx={{ color: COLORS.PRIMARY, fontWeight: 'bold' }}>
                Seasonal Pricing Multipliers
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> Seasonal multipliers are set to 1.0 (no change) by default. 
                  Adjust these values if you want to modify prices during peak or off seasons.
                </Typography>
              </Alert>
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
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: COLORS.PRIMARY
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: addAlpha(COLORS.PRIMARY, 0.3)
                      }
                    }}
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
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: COLORS.PRIMARY
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: addAlpha(COLORS.PRIMARY, 0.3)
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Booking Rules */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: addAlpha(COLORS.PRIMARY, 0.05),
                '&:hover': {
                  backgroundColor: addAlpha(COLORS.PRIMARY, 0.1)
                }
              }}
            >
              <Typography variant="h6" sx={{ color: COLORS.PRIMARY, fontWeight: 'bold' }}>
                Booking Rules
              </Typography>
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
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: COLORS.PRIMARY
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: addAlpha(COLORS.PRIMARY, 0.3)
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: COLORS.PRIMARY
                      }
                    }}
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
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: COLORS.PRIMARY
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: addAlpha(COLORS.PRIMARY, 0.3)
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: COLORS.PRIMARY
                      }
                    }}
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
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: COLORS.PRIMARY
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: addAlpha(COLORS.PRIMARY, 0.3)
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: COLORS.PRIMARY
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Discounts & Fees */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: addAlpha(COLORS.PRIMARY, 0.05),
                '&:hover': {
                  backgroundColor: addAlpha(COLORS.PRIMARY, 0.1)
                }
              }}
            >
              <Typography variant="h6" sx={{ color: COLORS.PRIMARY, fontWeight: 'bold' }}>
                Discounts & Fees
              </Typography>
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
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: COLORS.PRIMARY
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: addAlpha(COLORS.PRIMARY, 0.3)
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: COLORS.PRIMARY
                      }
                    }}
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
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: COLORS.PRIMARY
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: addAlpha(COLORS.PRIMARY, 0.3)
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: COLORS.PRIMARY
                      }
                    }}
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
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: COLORS.PRIMARY
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: addAlpha(COLORS.PRIMARY, 0.3)
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: COLORS.PRIMARY
                      }
                    }}
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
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: COLORS.PRIMARY
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: addAlpha(COLORS.PRIMARY, 0.3)
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: COLORS.PRIMARY
                      }
                    }}
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
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: COLORS.PRIMARY
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: addAlpha(COLORS.PRIMARY, 0.3)
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: COLORS.PRIMARY
                      }
                    }}
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
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: COLORS.PRIMARY
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: addAlpha(COLORS.PRIMARY, 0.3)
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: COLORS.PRIMARY
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Notes */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: addAlpha(COLORS.PRIMARY, 0.05),
                '&:hover': {
                  backgroundColor: addAlpha(COLORS.PRIMARY, 0.1)
                }
              }}
            >
              <Typography variant="h6" sx={{ color: COLORS.PRIMARY, fontWeight: 'bold' }}>
                Additional Notes
              </Typography>
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
                sx={{
                  '& .MuiInputLabel-root': {
                    color: COLORS.PRIMARY
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: addAlpha(COLORS.PRIMARY, 0.3)
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: COLORS.PRIMARY
                  }
                }}
              />
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>

      {/* Fixed Pricing Confirmation */}
      <Alert severity="success" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Fixed Pricing Strategy Active:</strong> Room prices will remain consistent based on your configured rates. 
          All taxes (VAT: {calculateTaxPercentage(config.vatRate)}, Service Tax: {calculateTaxPercentage(config.serviceTaxRate)}, 
          {config.cityTaxRate > 0 && `City Tax: ${calculateTaxPercentage(config.cityTaxRate)}`}) 
          will be automatically calculated and added during the booking process to ensure transparent pricing for your customers.
        </Typography>
      </Alert>
    </Box>
  );
};

export default PricingConfigurationComponent;