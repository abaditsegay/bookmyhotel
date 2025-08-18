import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Hotel } from '../../types/hotel';

interface HotelEditDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (hotelData: Partial<Hotel>) => Promise<void>;
  hotel: Hotel | null;
  loading?: boolean;
  error?: string;
}

const HotelEditDialog: React.FC<HotelEditDialogProps> = ({
  open,
  onClose,
  onSave,
  hotel,
  loading = false,
  error,
}) => {
  const [formData, setFormData] = useState<Partial<Hotel>>({
    name: '',
    description: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    email: '',
  });

  const [localError, setLocalError] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // Update form data when hotel prop changes
  useEffect(() => {
    if (hotel) {
      setFormData({
        name: hotel.name || '',
        description: hotel.description || '',
        address: hotel.address || '',
        city: hotel.city || '',
        country: hotel.country || '',
        phone: hotel.phone || '',
        email: hotel.email || '',
      });
    }
  }, [hotel]);

  // Clear errors when dialog opens
  useEffect(() => {
    if (open) {
      setLocalError('');
    }
  }, [open]);

  const handleInputChange = (field: keyof Hotel) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    if (localError) setLocalError('');
  };

  const validateForm = (): boolean => {
    if (!formData.name?.trim()) {
      setLocalError('Hotel name is required');
      return false;
    }
    if (!formData.address?.trim()) {
      setLocalError('Address is required');
      return false;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setLocalError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to update hotel details');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  const displayError = error || localError;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      disableEscapeKeyDown={saving}
    >
      <DialogTitle>Edit Hotel Details</DialogTitle>
      <DialogContent>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <CircularProgress />
          </div>
        ) : (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {displayError && (
              <Grid item xs={12}>
                <Alert severity="error">{displayError}</Alert>
              </Grid>
            )}
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Hotel Name"
                fullWidth
                required
                value={formData.name || ''}
                onChange={handleInputChange('name')}
                disabled={saving}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={formData.email || ''}
                onChange={handleInputChange('email')}
                disabled={saving}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description"
                multiline
                rows={3}
                fullWidth
                value={formData.description || ''}
                onChange={handleInputChange('description')}
                disabled={saving}
                inputProps={{ maxLength: 500 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Address"
                fullWidth
                required
                value={formData.address || ''}
                onChange={handleInputChange('address')}
                disabled={saving}
                inputProps={{ maxLength: 200 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="City"
                fullWidth
                value={formData.city || ''}
                onChange={handleInputChange('city')}
                disabled={saving}
                inputProps={{ maxLength: 50 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Country"
                fullWidth
                value={formData.country || ''}
                onChange={handleInputChange('country')}
                disabled={saving}
                inputProps={{ maxLength: 50 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                fullWidth
                value={formData.phone || ''}
                onChange={handleInputChange('phone')}
                disabled={saving}
                inputProps={{ maxLength: 20 }}
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleClose} 
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving || loading}
          startIcon={saving ? <CircularProgress size={20} /> : null}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HotelEditDialog;
