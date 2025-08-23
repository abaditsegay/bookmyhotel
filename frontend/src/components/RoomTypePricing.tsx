import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Tooltip,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MonetizationOn as PriceIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import roomTypePricingService, { 
  RoomTypePricingRequest, 
  RoomTypePricingResponse 
} from '../services/roomTypePricingApi';

const ROOM_TYPES = [
  { value: 'SINGLE', label: 'Single Room' },
  { value: 'DOUBLE', label: 'Double Room' },
  { value: 'SUITE', label: 'Suite' },
  { value: 'DELUXE', label: 'Deluxe Room' },
  { value: 'PRESIDENTIAL', label: 'Presidential Suite' }
];

interface RoomTypePricingProps {
  onPricingUpdate?: () => void;
}

const RoomTypePricing: React.FC<RoomTypePricingProps> = ({ onPricingUpdate }) => {
  const { token } = useAuth();
  const [pricingList, setPricingList] = useState<RoomTypePricingResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPricing, setEditingPricing] = useState<RoomTypePricingResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPricing, setSelectedPricing] = useState<RoomTypePricingResponse | null>(null);

  const [formData, setFormData] = useState<RoomTypePricingRequest>({
    roomType: 'SINGLE',
    basePricePerNight: 100,
    weekendMultiplier: 1.2,
    holidayMultiplier: 1.5,
    peakSeasonMultiplier: 1.3,
    isActive: true,
    currency: 'USD',
    description: ''
  });

  const loadPricing = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await roomTypePricingService.getRoomTypePricing(token);
      if (response.success && response.data) {
        setPricingList(response.data);
        setError(null);
      } else {
        setError(response.message || 'Failed to load pricing');
      }
    } catch (err) {
      console.error('Error loading pricing:', err);
      setError('Failed to load pricing');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadPricing();
  }, [loadPricing]);

  const handleOpenDialog = (pricing?: RoomTypePricingResponse) => {
    if (pricing) {
      setEditingPricing(pricing);
      setFormData({
        roomType: pricing.roomType,
        basePricePerNight: pricing.basePricePerNight,
        weekendMultiplier: pricing.weekendMultiplier,
        holidayMultiplier: pricing.holidayMultiplier,
        peakSeasonMultiplier: pricing.peakSeasonMultiplier,
        isActive: pricing.isActive,
        currency: pricing.currency,
        description: pricing.description || ''
      });
    } else {
      setEditingPricing(null);
      // Find unused room type
      const usedTypes = pricingList.map(p => p.roomType);
      const availableType = ROOM_TYPES.find(t => !usedTypes.includes(t.value));
      
      setFormData({
        roomType: availableType?.value || 'SINGLE',
        basePricePerNight: 100,
        weekendMultiplier: 1.2,
        holidayMultiplier: 1.5,
        peakSeasonMultiplier: 1.3,
        isActive: true,
        currency: 'USD',
        description: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPricing(null);
  };

  const handleSubmit = async () => {
    if (!token) return;

    try {
      setLoading(true);
      let response;
      
      if (editingPricing) {
        response = await roomTypePricingService.updateRoomTypePricing(
          token, 
          editingPricing.id, 
          formData
        );
      } else {
        response = await roomTypePricingService.saveRoomTypePricing(token, formData);
      }

      if (response.success) {
        handleCloseDialog();
        await loadPricing();
        if (onPricingUpdate) {
          onPricingUpdate();
        }
        setError(null);
      } else {
        setError(response.message || 'Failed to save pricing');
      }
    } catch (err) {
      console.error('Error saving pricing:', err);
      setError('Failed to save pricing');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !selectedPricing) return;

    try {
      setLoading(true);
      const response = await roomTypePricingService.deleteRoomTypePricing(token, selectedPricing.id);
      
      if (response.success) {
        setDeleteDialogOpen(false);
        setSelectedPricing(null);
        await loadPricing();
        if (onPricingUpdate) {
          onPricingUpdate();
        }
        setError(null);
      } else {
        setError(response.message || 'Failed to delete pricing');
      }
    } catch (err) {
      console.error('Error deleting pricing:', err);
      setError('Failed to delete pricing');
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeDefaults = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await roomTypePricingService.initializeDefaultPricing(token);
      
      if (response.success) {
        await loadPricing();
        if (onPricingUpdate) {
          onPricingUpdate();
        }
        setError(null);
      } else {
        setError(response.message || 'Failed to initialize default pricing');
      }
    } catch (err) {
      console.error('Error initializing defaults:', err);
      setError('Failed to initialize default pricing');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getRoomTypeLabel = (roomType: string) => {
    return ROOM_TYPES.find(t => t.value === roomType)?.label || roomType;
  };

  const calculateWeekendPrice = (basePrice: number, multiplier: number) => {
    return basePrice * multiplier;
  };

  if (!token) {
    return (
      <Alert severity="error">
        Authentication required. Please log in.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PriceIcon color="primary" />
          <Typography variant="h5" fontWeight="bold">
            Room Type Pricing
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {pricingList.length === 0 && (
            <Button
              variant="outlined"
              onClick={handleInitializeDefaults}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <InfoIcon />}
            >
              Initialize Defaults
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={loading}
          >
            Add Pricing
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Info Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Pricing Information
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Set base prices for each room type. New rooms will automatically inherit these prices, 
            but individual room prices can still be customized. Multipliers apply automatically 
            based on booking dates.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" display="block" color="text.secondary">
                Weekend Multiplier
              </Typography>
              <Typography variant="body2">
                Applied on Fridays & Saturdays
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" display="block" color="text.secondary">
                Holiday Multiplier
              </Typography>
              <Typography variant="body2">
                Applied on recognized holidays
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" display="block" color="text.secondary">
                Peak Season Multiplier
              </Typography>
              <Typography variant="body2">
                Applied during high-demand periods
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" display="block" color="text.secondary">
                Active Status
              </Typography>
              <Typography variant="body2">
                Only active pricing rules apply
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Pricing Table */}
      <Card>
        <CardContent>
          {loading && pricingList.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : pricingList.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h6" gutterBottom>
                No Pricing Configuration Found
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Set up pricing for your room types to automatically assign prices to new rooms.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add Your First Pricing Rule
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Room Type</TableCell>
                    <TableCell>Base Price</TableCell>
                    <TableCell>Weekend Price</TableCell>
                    <TableCell>Holiday Price</TableCell>
                    <TableCell>Peak Season</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pricingList.map((pricing) => (
                    <TableRow key={pricing.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {getRoomTypeLabel(pricing.roomType)}
                        </Typography>
                        {pricing.description && (
                          <Typography variant="caption" color="text.secondary">
                            {pricing.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" color="primary">
                          {formatCurrency(pricing.basePricePerNight)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          per night
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatCurrency(calculateWeekendPrice(pricing.basePricePerNight, pricing.weekendMultiplier))}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({pricing.weekendMultiplier}x)
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatCurrency(calculateWeekendPrice(pricing.basePricePerNight, pricing.holidayMultiplier))}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({pricing.holidayMultiplier}x)
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatCurrency(calculateWeekendPrice(pricing.basePricePerNight, pricing.peakSeasonMultiplier))}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({pricing.peakSeasonMultiplier}x)
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={pricing.isActive ? 'Active' : 'Inactive'}
                          color={pricing.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Edit Pricing">
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              onClick={() => handleOpenDialog(pricing)}
                              disabled={loading}
                            >
                              <EditIcon fontSize="small" />
                            </Button>
                          </Tooltip>
                          <Tooltip title="Delete Pricing">
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => {
                                setSelectedPricing(pricing);
                                setDeleteDialogOpen(true);
                              }}
                              disabled={loading}
                            >
                              <DeleteIcon fontSize="small" />
                            </Button>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Pricing Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPricing ? 'Edit Room Type Pricing' : 'Add Room Type Pricing'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Room Type</InputLabel>
                <Select
                  value={formData.roomType}
                  label="Room Type"
                  onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                  disabled={!!editingPricing}
                >
                  {ROOM_TYPES.map((type) => (
                    <MenuItem 
                      key={type.value} 
                      value={type.value}
                      disabled={pricingList.some(p => p.roomType === type.value && p.id !== editingPricing?.id)}
                    >
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Base Price per Night"
                type="number"
                value={formData.basePricePerNight}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  basePricePerNight: parseFloat(e.target.value) 
                })}
                required
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Weekend Multiplier"
                type="number"
                value={formData.weekendMultiplier}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  weekendMultiplier: parseFloat(e.target.value) 
                })}
                inputProps={{ min: 0.1, step: 0.1 }}
                helperText="1.2 = 20% increase"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Holiday Multiplier"
                type="number"
                value={formData.holidayMultiplier}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  holidayMultiplier: parseFloat(e.target.value) 
                })}
                inputProps={{ min: 0.1, step: 0.1 }}
                helperText="1.5 = 50% increase"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Peak Season Multiplier"
                type="number"
                value={formData.peakSeasonMultiplier}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  peakSeasonMultiplier: parseFloat(e.target.value) 
                })}
                inputProps={{ min: 0.1, step: 0.1 }}
                helperText="1.3 = 30% increase"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                placeholder="USD"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description for this pricing rule..."
              />
            </Grid>
          </Grid>

          {/* Price Preview */}
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Price Preview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" display="block" color="text.secondary">
                  Base Price
                </Typography>
                <Typography variant="h6" color="primary">
                  {formatCurrency(formData.basePricePerNight)}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" display="block" color="text.secondary">
                  Weekend Price
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(formData.basePricePerNight * (formData.weekendMultiplier || 1))}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" display="block" color="text.secondary">
                  Holiday Price
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(formData.basePricePerNight * (formData.holidayMultiplier || 1))}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" display="block" color="text.secondary">
                  Peak Season Price
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(formData.basePricePerNight * (formData.peakSeasonMultiplier || 1))}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : (editingPricing ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the pricing for{' '}
            {selectedPricing && getRoomTypeLabel(selectedPricing.roomType)}?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. Existing rooms will keep their current prices.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoomTypePricing;
