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
  Card,
  CardContent,
  useTheme,
  alpha
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Receipt as ReceiptIcon,
  Discount as DiscountIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../theme/themeColors';

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
      minHeight: '100vh',
      '& .MuiTextField-root': {
        '& .MuiOutlinedInput-root': {
          '&:hover fieldset': {
            borderColor: '#4A9B9B',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#4A9B9B',
          },
        },
        '& .MuiInputLabel-root': {
          '&.Mui-focused': {
            color: '#4A9B9B',
          },
        },
      },
      '& .MuiFormControl-root': {
        '& .MuiOutlinedInput-root': {
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#4A9B9B',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#4A9B9B',
          },
        },
        '& .MuiInputLabel-root': {
          '&.Mui-focused': {
            color: '#4A9B9B',
          },
        },
      },
    }}>
      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 3 }}>
        <Tooltip title="Refresh Configuration">
          <IconButton 
            onClick={fetchConfiguration} 
            disabled={loading}
            sx={{
              color: COLORS.PRIMARY,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                bgcolor: alpha(COLORS.PRIMARY, 0.1)
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
            bgcolor: COLORS.PRIMARY,
            color: 'white',
            '&:hover': {
              bgcolor: alpha(COLORS.PRIMARY, 0.8)
            },
            '&:disabled': {
              bgcolor: alpha(COLORS.PRIMARY, 0.3),
              color: alpha('#ffffff', 0.7)
            }
          }}
        >
          {saving ? 'Saving...' : 'Save Configuration'}
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
          bgcolor: alpha('#4A9B9B', 0.1),
          border: `1px solid ${alpha('#4A9B9B', 0.2)}`,
          '& .MuiAlert-message': {
            color: theme.palette.text.primary
          },
          '& .MuiAlert-icon': {
            color: '#4A9B9B'
          }
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          <strong>Pricing Policy:</strong> Room prices are displayed without taxes. All applicable taxes 
          (VAT, service tax, city tax) will be calculated and added during the booking process. This 
          ensures transparent pricing for customers while maintaining compliance with tax regulations.
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
                borderRadius: 2,
              }}>
                <SettingsIcon sx={{ color: COLORS.PRIMARY }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5, color: COLORS.PRIMARY }}>
                    General Settings
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Configure basic pricing policies and settings
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Pricing Strategy</InputLabel>
                    <Select
                      value={config.pricingStrategy}
                      onChange={(e) => handleInputChange('pricingStrategy', e.target.value)}
                      label="Pricing Strategy"
                      disabled // Always use Fixed Pricing
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'background.paper',
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: COLORS.PRIMARY,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: COLORS.PRIMARY,
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: COLORS.PRIMARY,
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
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: COLORS.PRIMARY,
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
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
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
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
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
                borderRadius: 2,
              }}>
                <ReceiptIcon sx={{ color: COLORS.PRIMARY }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5, color: COLORS.PRIMARY }}>
                    Tax Configuration
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Configure applicable tax rates for booking calculations
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
                  These tax rates will be automatically applied during the booking process. 
                  Room prices displayed to customers will not include these taxes.
                </Typography>
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="VAT Rate (%)"
                    type="number"
                    value={config.vatRate}
                    onChange={(e) => handleInputChange('vatRate', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    helperText={`Current VAT: ${calculateTaxPercentage(config.vatRate)} (Ethiopian standard: 15%)`}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: COLORS.PRIMARY,
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Service Tax Rate (%)"
                    type="number"
                    value={config.serviceTaxRate}
                    onChange={(e) => handleInputChange('serviceTaxRate', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    helperText={`Current service tax: ${calculateTaxPercentage(config.serviceTaxRate)} (Ethiopian standard: 5%)`}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: COLORS.PRIMARY,
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="City Tax Rate (%)"
                    type="number"
                    value={config.cityTaxRate}
                    onChange={(e) => handleInputChange('cityTaxRate', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    helperText={`Current city tax: ${calculateTaxPercentage(config.cityTaxRate)} (Usually 0% in Ethiopia)`}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: COLORS.PRIMARY,
                      }
                    }}
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
                borderRadius: 2,
              }}>
                <DiscountIcon sx={{ color: COLORS.PRIMARY }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5, color: COLORS.PRIMARY }}>
                    Seasonal Pricing Multipliers
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Configure pricing adjustments for peak and off seasons
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
                  <strong>Note:</strong> Seasonal multipliers are set to 1.0 (no change) by default. 
                  Adjust these values if you want to modify prices during peak or off seasons.
                </Typography>
              </Alert>

              <Grid container spacing={3}>
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
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: COLORS.PRIMARY,
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
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: COLORS.PRIMARY,
                      }
                    }}
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
                borderRadius: 2,
              }}>
                <SettingsIcon sx={{ color: COLORS.PRIMARY }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5, color: COLORS.PRIMARY }}>
                    Booking Rules
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Configure booking restrictions and requirements
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Minimum Stay (nights)"
                    type="number"
                    value={config.minimumStayNights}
                    onChange={(e) => handleInputChange('minimumStayNights', parseInt(e.target.value) || 1)}
                    inputProps={{ min: 1 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: COLORS.PRIMARY,
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
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: COLORS.PRIMARY,
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
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: COLORS.PRIMARY,
                      }
                    }}
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
                <DiscountIcon sx={{ color: COLORS.PRIMARY }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5, color: COLORS.PRIMARY }}>
                    Discounts & Fees
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Configure discount rates and penalty fees
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
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
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: COLORS.PRIMARY,
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Early Booking Discount Rate (%)"
                    type="number"
                    value={config.earlyBookingDiscountRate}
                    onChange={(e) => handleInputChange('earlyBookingDiscountRate', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    helperText={`${config.earlyBookingDiscountRate.toFixed(1)} = ${calculateDiscountPercentage(config.earlyBookingDiscountRate)}`}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: COLORS.PRIMARY,
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Loyalty Discount Rate (%)"
                    type="number"
                    value={config.loyaltyDiscountRate}
                    onChange={(e) => handleInputChange('loyaltyDiscountRate', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    helperText={`${config.loyaltyDiscountRate.toFixed(1)} = ${calculateDiscountPercentage(config.loyaltyDiscountRate)}`}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: COLORS.PRIMARY,
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Cancellation Fee Rate (%)"
                    type="number"
                    value={config.cancellationFeeRate}
                    onChange={(e) => handleInputChange('cancellationFeeRate', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    helperText={`${config.cancellationFeeRate.toFixed(1)} = ${calculateFeePercentage(config.cancellationFeeRate)}`}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: COLORS.PRIMARY,
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Modification Fee Rate (%)"
                    type="number"
                    value={config.modificationFeeRate}
                    onChange={(e) => handleInputChange('modificationFeeRate', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    helperText={`${config.modificationFeeRate.toFixed(1)} = ${calculateFeePercentage(config.modificationFeeRate)}`}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: COLORS.PRIMARY,
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="No-Show Penalty Rate (%)"
                    type="number"
                    value={config.noShowPenaltyRate}
                    onChange={(e) => handleInputChange('noShowPenaltyRate', parseFloat(e.target.value) || 1)}
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    helperText={`${config.noShowPenaltyRate.toFixed(1)} = ${calculateFeePercentage(config.noShowPenaltyRate)} penalty`}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: COLORS.PRIMARY,
                      }
                    }}
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
                <ReceiptIcon sx={{ color: COLORS.PRIMARY }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5, color: COLORS.PRIMARY }}>
                    Cancellation Refund Policies
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Configure refund percentages based on cancellation timing
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
                  Set the refund percentage customers receive when they cancel their booking at different time periods before check-in. 
                  These policies will be automatically applied when processing cancellations.
                </Typography>
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="7+ Days Before Check-in"
                    type="number"
                    value={config.refundPolicy7PlusDays || 100}
                    onChange={(e) => handleInputChange('refundPolicy7PlusDays', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 100, step: 1 }}
                    helperText={`Current: ${config.refundPolicy7PlusDays || 100}% refund (recommended: 100%)`}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: COLORS.PRIMARY,
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="3-7 Days Before Check-in"
                    type="number"
                    value={config.refundPolicy3To7Days || 50}
                    onChange={(e) => handleInputChange('refundPolicy3To7Days', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 100, step: 1 }}
                    helperText={`Current: ${config.refundPolicy3To7Days || 50}% refund (recommended: 50%)`}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: COLORS.PRIMARY,
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="1-2 Days Before Check-in"
                    type="number"
                    value={config.refundPolicy1To2Days || 25}
                    onChange={(e) => handleInputChange('refundPolicy1To2Days', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 100, step: 1 }}
                    helperText={`Current: ${config.refundPolicy1To2Days || 25}% refund (recommended: 25%)`}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: COLORS.PRIMARY,
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Same Day Cancellation"
                    type="number"
                    value={config.refundPolicySameDay || 0}
                    onChange={(e) => handleInputChange('refundPolicySameDay', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 100, step: 1 }}
                    helperText={`Current: ${config.refundPolicySameDay || 0}% refund (recommended: 0%)`}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.PRIMARY,
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: COLORS.PRIMARY,
                      }
                    }}
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
                  <strong>Note:</strong> These refund policies will replace the existing hardcoded cancellation rules. 
                  Make sure to set policies that align with your business requirements and local regulations.
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
                <InfoIcon sx={{ color: COLORS.PRIMARY }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5, color: COLORS.PRIMARY }}>
                    Additional Notes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add any additional configuration notes or comments
                  </Typography>
                </Box>
              </Box>

              <TextField
                fullWidth
                label="Configuration Notes"
                multiline
                rows={3}
                value={config.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any notes about this pricing configuration..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper',
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: COLORS.PRIMARY,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: COLORS.PRIMARY,
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: COLORS.PRIMARY,
                  }
                }}
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
          bgcolor: alpha('#4A9B9B', 0.1),
          border: `1px solid ${alpha('#4A9B9B', 0.3)}`,
          '& .MuiAlert-message': {
            color: theme.palette.text.primary
          },
          '& .MuiAlert-icon': {
            color: '#4A9B9B'
          }
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
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