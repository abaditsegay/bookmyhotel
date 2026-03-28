import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { normalizeEthiopianPhone } from '../../utils/phoneUtils';
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
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addDays, format, differenceInDays } from 'date-fns';
import { BookingRequest, AvailableRoom } from '../../types/hotel';
import { LoadingSpinner } from '../common/LoadingComponents';
import { ValidatedInput, ValidationSummary, ValidationStatus } from '../common/ValidationComponents';
import { useAsyncOperation } from '../../hooks/useLoading';
import { useFormValidation } from '../../hooks/useFormValidation';
import PremiumDatePicker from '../common/PremiumDatePicker';
import NumberStepper from '../common/NumberStepper';
import { COLORS, addAlpha } from '../../theme/themeColors';
import { formatCurrencyWithDecimals } from '../../utils/currencyUtils';

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
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Focus management - auto-focus first input when dialog opens
  const firstInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (open && firstInputRef.current) {
      // Delay focus to ensure dialog is fully rendered
      const timeoutId = setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [open]);
  
  const [checkInDate, setCheckInDate] = useState<Date | null>(
    defaultCheckIn ? defaultCheckIn : new Date()
  );
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(
    defaultCheckOut ? defaultCheckOut : addDays(new Date(), 1)
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
        required: t('booking.form.validation.guestsRequired'),
        min: t('booking.form.validation.guestsMin'),
        max: t('booking.form.validation.guestsMax', { count: room?.capacity || 10 }),
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
        required: t('booking.form.validation.guestNameRequired'),
        minLength: t('booking.form.validation.nameMinLength'),
        maxLength: t('booking.form.validation.nameMaxLength'),
        pattern: t('booking.form.validation.namePattern'),
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
        required: t('booking.form.validation.emailRequired'),
        email: t('booking.form.validation.validEmail'),
        maxLength: t('booking.form.validation.emailMaxLength'),
      },
      initialValue: '',
    },
    guestPhone: {
      rules: {
        required: true,
        phone: true,
        minLength: 10,
        maxLength: 15,
      },
      messages: {
        required: t('booking.form.validation.phoneRequired'),
        phone: t('booking.form.validation.validPhone'),
        minLength: t('booking.form.validation.phoneMinLength'),
        maxLength: t('booking.form.validation.phoneMaxLength'),
      },
      initialValue: '',
    },
    specialRequests: {
      rules: {
        maxLength: 500,
      },
      messages: {
        maxLength: t('booking.form.validation.specialRequestsMaxLength'),
      },
      initialValue: '',
    },
  });

  const calculateTotalAmount = () => {
    if (!room || !checkInDate || !checkOutDate) return 0;
    const nights = differenceInDays(checkOutDate, checkInDate);
    return room.pricePerNight * nights;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!room || !checkInDate || !checkOutDate) {
      setError(t('booking.form.fillAllRequiredFields'));
      return;
    }

    if (checkInDate >= checkOutDate) {
      setError(t('booking.form.checkOutAfterCheckIn'));
      return;
    }

    // Validate form using our validation hook
    const isFormValid = formValidation.validateAll();
    if (!isFormValid) {
      setError(t('booking.form.validation.fixValidationErrors'));
      return;
    }

    const bookingRequest: BookingRequest = {
      roomId: room.id,
      checkInDate: format(checkInDate, 'yyyy-MM-dd'),
      checkOutDate: format(checkOutDate, 'yyyy-MM-dd'),
      guests: formValidation.values.guests,
      specialRequests: formValidation.values.specialRequests?.trim() || undefined,
      guestName: formValidation.values.guestName.trim(),
      guestEmail: formValidation.values.guestEmail.trim(),
      guestPhone: formValidation.values.guestPhone?.trim() ? normalizeEthiopianPhone(formValidation.values.guestPhone.trim()) : undefined,
    };

    await bookingOperation.execute(
      async () => {
        await onSubmit(bookingRequest);
        onClose();
        return bookingRequest;
      },
      {
        onError: (err: any) => {
          setError(err.message || t('booking.form.validation.createBookingFailed'));
        }
      }
    );
  };

  const totalAmount = calculateTotalAmount();
  const nights = checkInDate && checkOutDate 
    ? differenceInDays(checkOutDate, checkInDate)
    : 0;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ p: { xs: 2, md: 3 } }}>
          {hotelName && (
            <Typography variant={isMobile ? "body1" : "subtitle1"} color="text.secondary">
              {hotelName}
            </Typography>
          )}
        </DialogTitle>

        <DialogContent sx={{ 
          position: 'relative',
          p: { xs: 2, md: 3 },
          pt: { xs: 1, md: 2 }
        }}>
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
                message={t('booking.form.processing')}
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
            <Paper 
              elevation={0} 
              sx={{ 
                p: { xs: 2, md: 3 }, 
                mb: { xs: 2, md: 3 }, 
                backgroundColor: 'background.paper',
                border: `1px solid ${COLORS.CARD_BORDER}`,
                borderRadius: 2,
                boxShadow: `0 2px 8px ${addAlpha(COLORS.BLACK, 0.08)}`,
              }}
            >
              <Typography 
                variant="h6" 
                component="div" 
                gutterBottom
                sx={{ 
                  fontWeight: 700,
                  color: 'text.primary',
                  mb: 2,
                }}
              >
                {t('booking.details.roomDetails')}
              </Typography>
              <Grid container spacing={{ xs: 1.5, md: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    <strong>{t('booking.form.room')}:</strong> {room.roomNumber}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    <strong>{t('booking.details.roomType')}:</strong> {t(`hotelSearch.roomTypes.${room.roomType.toLowerCase()}`)}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    <strong>{t('booking.form.numberOfGuests')}:</strong> {t('hotelSearch.roomCard.upToGuests', { count: room.capacity })}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    <strong>{t('booking.form.pricePerNight')}:</strong> ETB {room.pricePerNight}
                  </Typography>
                  {nights > 0 && (
                    <>
                      <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                        <strong>{t('booking.form.nights')}:</strong> {nights}
                      </Typography>
                      <Box 
                        sx={{ 
                          backgroundColor: addAlpha(COLORS.PRIMARY, 0.1),
                          border: `1px solid ${addAlpha(COLORS.PRIMARY, 0.3)}`,
                          borderRadius: 2,
                          padding: 1.5,
                          mt: 1,
                        }}
                      >
                        <Typography 
                          variant="h6" 
                          component="div" 
                          sx={{ 
                            color: COLORS.SUCCESS,
                            fontWeight: 700,
                            textAlign: 'center',
                          }}
                        >
                          <strong>{t('booking.form.totalAmount')}: ${totalAmount}</strong>
                        </Typography>
                      </Box>
                    </>
                  )}
                </Grid>
              </Grid>
              {room.description && (
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mt: 2, 
                    pt: 2,
                    borderTop: `1px solid ${COLORS.CARD_BORDER}`,
                    fontStyle: 'italic',
                  }}
                >
                  {room.description}
                </Typography>
              )}
            </Paper>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* Dates and Guests */}
              <Grid item xs={12} sm={4}>
                <PremiumDatePicker
                  label={t('booking.form.checkInDate')}
                  value={checkInDate}
                  onChange={setCheckInDate}
                  minDate={new Date()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      size: isMobile ? "small" : "medium",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <PremiumDatePicker
                  label={t('booking.form.checkOutDate')}
                  value={checkOutDate}
                  onChange={setCheckOutDate}
                  minDate={checkInDate || new Date()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      size: isMobile ? "small" : "medium",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <NumberStepper
                  value={formValidation.values.guests || 1}
                  onChange={(newValue) => formValidation.setFieldValue('guests', newValue)}
                  min={1}
                  max={room?.capacity || 10}
                  label={t('booking.form.numberOfGuests')}
                  fullWidth
                />
                {formValidation.validation.guests?.error && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {formValidation.validation.guests.error}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: { xs: 1, md: 1 } }} />
                <Typography variant={isMobile ? "subtitle1" : "h6"} component="div" gutterBottom>
                  {t('booking.form.guestInformation')}
                </Typography>
              </Grid>

              {/* Guest Details */}
              <Grid item xs={12} sm={6}>
                <ValidatedInput
                  fullWidth
                  label={t('booking.form.fullName')}
                  {...formValidation.getFieldProps('guestName')}
                  helperText={formValidation.getFieldProps('guestName').helperText || undefined}
                  required
                  size={isMobile ? "small" : "medium"}
                  inputRef={firstInputRef}
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
                  label={t('booking.form.emailAddress')}
                  type="email"
                  {...formValidation.getFieldProps('guestEmail')}
                  helperText={formValidation.getFieldProps('guestEmail').helperText || undefined}
                  required
                  size={isMobile ? "small" : "medium"}
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
                  label={t('booking.form.phoneNumber')}
                  {...formValidation.getFieldProps('guestPhone')}
                  helperText={formValidation.getFieldProps('guestPhone').helperText || t('booking.form.phonePlaceholder')}
                  placeholder={t('booking.form.phonePlaceholder')}
                  required
                  size={isMobile ? "small" : "medium"}
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
                  label={t('booking.form.specialRequests')}
                  multiline
                  rows={isMobile ? 2 : 3}
                  {...formValidation.getFieldProps('specialRequests')}
                  helperText={formValidation.getFieldProps('specialRequests').helperText || t('booking.form.specialRequestsPlaceholder')}
                  placeholder={t('booking.form.specialRequestsPlaceholder')}
                  size={isMobile ? "small" : "medium"}
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

        <DialogActions sx={{ 
          p: { xs: 2, md: 3 }, 
          pt: { xs: 1, md: 1 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 }
        }}>
          <Button 
            onClick={onClose} 
            disabled={bookingOperation.loading}
            fullWidth={isMobile}
            size={isMobile ? "medium" : "large"}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            variant="contained"
            disabled={bookingOperation.loading}
            fullWidth={isMobile}
            size={isMobile ? "medium" : "large"}
            sx={{ 
              ml: { xs: 0, sm: 1 },
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
            {bookingOperation.loading
              ? t('booking.form.processing')
              : t('booking.form.bookNowWithAmount', { amount: formatCurrencyWithDecimals(totalAmount || 0) })}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default BookingForm;
