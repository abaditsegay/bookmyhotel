import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Alert,
  Divider,
  Paper,
  Box,
  LinearProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { BookingRequest, AvailableRoom } from '../../types/hotel';
import { LoadingSpinner } from '../common/LoadingComponents';
import { ValidatedInput, ValidationSummary, ValidationStatus } from '../common/ValidationComponents';
import { useAsyncOperation } from '../../hooks/useLoading';
import { useFormValidation } from '../../hooks/useFormValidation';

interface BookingFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (booking: BookingRequest) => Promise<void>;
  room: AvailableRoom | null;
  hotelName?: string;
  defaultCheckIn?: Date;
  defaultCheckOut?: Date;
  defaultGuests?: number;
}

const BookingForm: React.FC<BookingFormProps> = ({
  open,
  onClose,
  onSubmit,
  room,
  hotelName,
  defaultCheckIn,
  defaultCheckOut,
  defaultGuests = 1,
}) => {
  const [checkInDate, setCheckInDate] = useState<Dayjs | null>(
    defaultCheckIn ? dayjs(defaultCheckIn) : dayjs()
  );
  const [checkOutDate, setCheckOutDate] = useState<Dayjs | null>(
    defaultCheckOut ? dayjs(defaultCheckOut) : dayjs().add(1, 'day')
  );
  const [error, setError] = useState('');
  const bookingOperation = useAsyncOperation();

  // Form validation setup
  const formValidation = useFormValidation({
    guests: {
      rules: {
        required: true,
        min: 1,
        max: room?.capacity || 10,
      },
      messages: {
        required: 'Number of guests is required',
        min: 'At least 1 guest is required',
        max: `Maximum ${room?.capacity || 10} guests allowed`,
      },
      initialValue: defaultGuests,
    },
    guestName: {
      rules: {
        required: true,
        minLength: 2,
        maxLength: 100,
        pattern: /^[a-zA-Z\s]+$/,
      },
      messages: {
        required: 'Guest name is required',
        minLength: 'Name must be at least 2 characters',
        maxLength: 'Name must be less than 100 characters',
        pattern: 'Name can only contain letters and spaces',
      },
      initialValue: '',
    },
    guestEmail: {
      rules: {
        required: true,
        email: true,
        maxLength: 255,
      },
      messages: {
        required: 'Email address is required',
        email: 'Please enter a valid email address',
        maxLength: 'Email must be less than 255 characters',
      },
      initialValue: '',
    },
    guestPhone: {
      rules: {
        phone: true,
        minLength: 10,
        maxLength: 15,
      },
      messages: {
        phone: 'Please enter a valid phone number',
        minLength: 'Phone number must be at least 10 digits',
        maxLength: 'Phone number must be less than 15 digits',
      },
      initialValue: '',
    },
    specialRequests: {
      rules: {
        maxLength: 500,
      },
      messages: {
        maxLength: 'Special requests must be less than 500 characters',
      },
      initialValue: '',
    },
  });

  const calculateTotalAmount = () => {
    if (!room || !checkInDate || !checkOutDate) return 0;
    const nights = checkOutDate.diff(checkInDate, 'day');
    return room.pricePerNight * nights;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!room || !checkInDate || !checkOutDate) {
      setError('Please fill in all required fields');
      return;
    }

    if (checkInDate >= checkOutDate) {
      setError('Check-out date must be after check-in date');
      return;
    }

    // Validate form using our validation hook
    const isFormValid = formValidation.validateAll();
    if (!isFormValid) {
      setError('Please fix the validation errors before submitting');
      return;
    }

    const bookingRequest: BookingRequest = {
      roomId: room.id,
      checkInDate: checkInDate.format('YYYY-MM-DD'),
      checkOutDate: checkOutDate.format('YYYY-MM-DD'),
      guests: formValidation.values.guests,
      specialRequests: formValidation.values.specialRequests?.trim() || undefined,
      guestName: formValidation.values.guestName.trim(),
      guestEmail: formValidation.values.guestEmail.trim(),
      guestPhone: formValidation.values.guestPhone?.trim() || undefined,
    };

    await bookingOperation.execute(
      async () => {
        await onSubmit(bookingRequest);
        onClose();
        return bookingRequest;
      },
      {
        onError: (err: any) => {
          setError(err.message || 'Failed to create booking. Please try again.');
        }
      }
    );
  };

  const totalAmount = calculateTotalAmount();
  const nights = checkInDate && checkOutDate 
    ? checkOutDate.diff(checkInDate, 'day')
    : 0;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h5" component="h2">
            Book Your Stay
          </Typography>
          {hotelName && (
            <Typography variant="subtitle1" color="text.secondary">
              {hotelName}
            </Typography>
          )}
        </DialogTitle>

        <DialogContent sx={{ position: 'relative' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Validation Summary */}
          <ValidationSummary
            errors={formValidation.errors}
            touched={Object.fromEntries(
              Object.entries(formValidation.validation).map(([key, val]) => [key, val.touched])
            )}
            showOnlyTouched={true}
            maxErrors={5}
          />

          {/* Form Validation Status */}
          <ValidationStatus
            isValid={formValidation.isValid}
            isDirty={formValidation.isDirty}
            hasErrors={formValidation.hasError}
            validationText={
              formValidation.isValid && formValidation.isDirty 
                ? 'All fields are valid - ready to book!' 
                : formValidation.hasError 
                ? 'Please fix the errors above' 
                : undefined
            }
          />

          {/* Loading overlay for booking form */}
                    {bookingOperation.loading && (
            <Box display="flex" justifyContent="center" alignItems="center" py={2}>
              <LoadingSpinner 
                message="Processing your booking..."
                size={40}
              />
            </Box>
          )}

          {bookingOperation.loading && (
            <LinearProgress 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0,
                borderRadius: '4px 4px 0 0'
              }} 
            />
          )}

          {room && (
            <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
              <Typography variant="h6" component="div" gutterBottom>
                Room Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Room:</strong> {room.roomNumber}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Type:</strong> {room.roomType}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Capacity:</strong> Up to {room.capacity} guests
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Price per night:</strong> ${room.pricePerNight}
                  </Typography>
                  {nights > 0 && (
                    <>
                      <Typography variant="body2">
                        <strong>Nights:</strong> {nights}
                      </Typography>
                      <Typography variant="h6" component="div" color="primary.main">
                        <strong>Total: ${totalAmount}</strong>
                      </Typography>
                    </>
                  )}
                </Grid>
              </Grid>
              {room.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {room.description}
                </Typography>
              )}
            </Paper>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Dates and Guests */}
              <Grid item xs={12} sm={4}>
                <DatePicker
                  label="Check-in Date"
                  value={checkInDate}
                  onChange={setCheckInDate}
                  minDate={dayjs()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <DatePicker
                  label="Check-out Date"
                  value={checkOutDate}
                  onChange={setCheckOutDate}
                  minDate={checkInDate || dayjs()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <ValidatedInput
                  fullWidth
                  label="Number of Guests"
                  type="number"
                  {...formValidation.getFieldProps('guests')}
                  InputProps={{ inputProps: { min: 1, max: room?.capacity || 10 } }}
                  required
                  validationState={
                    formValidation.validation.guests?.error ? 'error' : 
                    formValidation.validation.guests?.touched && !formValidation.validation.guests?.error ? 'success' : 
                    undefined
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" component="div" gutterBottom>
                  Guest Information
                </Typography>
              </Grid>

              {/* Guest Details */}
              <Grid item xs={12} sm={6}>
                <ValidatedInput
                  fullWidth
                  label="Full Name"
                  {...formValidation.getFieldProps('guestName')}
                  helperText={formValidation.getFieldProps('guestName').helperText || undefined}
                  required
                  validationState={
                    formValidation.validation.guestName?.error ? 'error' : 
                    formValidation.validation.guestName?.touched && !formValidation.validation.guestName?.error ? 'success' : 
                    undefined
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <ValidatedInput
                  fullWidth
                  label="Email Address"
                  type="email"
                  {...formValidation.getFieldProps('guestEmail')}
                  helperText={formValidation.getFieldProps('guestEmail').helperText || undefined}
                  required
                  validationState={
                    formValidation.validation.guestEmail?.error ? 'error' : 
                    formValidation.validation.guestEmail?.touched && !formValidation.validation.guestEmail?.error ? 'success' : 
                    undefined
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <ValidatedInput
                  fullWidth
                  label="Phone Number"
                  {...formValidation.getFieldProps('guestPhone')}
                  helperText={formValidation.getFieldProps('guestPhone').helperText || 'Optional'}
                  placeholder="Optional"
                  validationState={
                    formValidation.validation.guestPhone?.error ? 'error' : 
                    formValidation.validation.guestPhone?.touched && !formValidation.validation.guestPhone?.error ? 'success' : 
                    undefined
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <ValidatedInput
                  fullWidth
                  label="Special Requests"
                  multiline
                  rows={3}
                  {...formValidation.getFieldProps('specialRequests')}
                  helperText={formValidation.getFieldProps('specialRequests').helperText || 'Any special requests or requirements...'}
                  placeholder="Any special requests or requirements..."
                  validationState={
                    formValidation.validation.specialRequests?.error ? 'error' : 
                    formValidation.validation.specialRequests?.touched && !formValidation.validation.specialRequests?.error ? 'success' : 
                    undefined
                  }
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={onClose} disabled={bookingOperation.loading}>
            Cancel
          </Button>
          <Button
            onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            variant="contained"
            disabled={bookingOperation.loading}
            sx={{ 
              ml: 1,
              position: 'relative'
            }}
            startIcon={bookingOperation.loading ? (
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  '& .MuiCircularProgress-root': {
                    width: '16px !important',
                    height: '16px !important'
                  }
                }}
              >
                <LoadingSpinner size={16} />
              </Box>
            ) : undefined}
          >
            {bookingOperation.loading ? 'Processing...' : `Book Now - ETB ${totalAmount?.toFixed(0)}`}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default BookingForm;
