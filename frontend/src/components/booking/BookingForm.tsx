import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Alert,
  Divider,
  Paper,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { BookingRequest, AvailableRoom } from '../../types/hotel';

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
  const [guests, setGuests] = useState(defaultGuests);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    if (!guestName.trim() || !guestEmail.trim()) {
      setError('Please provide guest name and email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
      setError('Please provide a valid email address');
      return;
    }

    setLoading(true);

    try {
      const bookingRequest: BookingRequest = {
        roomId: room.id,
        checkInDate: checkInDate.format('YYYY-MM-DD'),
        checkOutDate: checkOutDate.format('YYYY-MM-DD'),
        guests,
        specialRequests: specialRequests.trim() || undefined,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
        guestPhone: guestPhone.trim() || undefined,
      };

      await onSubmit(bookingRequest);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while booking');
    } finally {
      setLoading(false);
    }
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

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {room && (
            <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom>
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
                      <Typography variant="h6" color="primary.main">
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
                <TextField
                  fullWidth
                  label="Number of Guests"
                  type="number"
                  value={guests}
                  onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 1))}
                  inputProps={{ min: 1, max: room?.capacity || 10 }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Guest Information
                </Typography>
              </Grid>

              {/* Guest Details */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="Optional"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Special Requests"
                  multiline
                  rows={3}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any special requests or requirements..."
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{ ml: 1 }}
          >
            {loading ? 'Processing...' : `Book Now - $${totalAmount}`}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default BookingForm;
