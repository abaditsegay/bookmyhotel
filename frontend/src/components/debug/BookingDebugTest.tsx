import React, { useState } from 'react';
import { Box, Button, Typography, Card, CardContent, Alert } from '@mui/material';
import BookingManagementTable from '../booking/BookingManagementTable';

const BookingDebugTest: React.FC = () => {
  const [mode, setMode] = useState<'front-desk' | 'hotel-admin'>('front-desk');

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Booking Table Debug Test
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            This is a debug page to test the booking table pagination issue.
            Check the browser console for detailed logs.
          </Alert>

          <Box sx={{ mb: 2 }}>
            <Button 
              variant={mode === 'front-desk' ? 'contained' : 'outlined'}
              onClick={() => setMode('front-desk')}
              sx={{ mr: 1 }}
            >
              Front Desk Mode
            </Button>
            <Button 
              variant={mode === 'hotel-admin' ? 'contained' : 'outlined'}
              onClick={() => setMode('hotel-admin')}
            >
              Hotel Admin Mode
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary">
            Current Mode: {mode}
          </Typography>
        </CardContent>
      </Card>

      <BookingManagementTable
        mode={mode}
        title={`${mode === 'front-desk' ? 'Front Desk' : 'Hotel Admin'} Bookings (Debug)`}
        showActions={true}
        showCheckInOut={mode === 'front-desk'}
      />
    </Box>
  );
};

export default BookingDebugTest;
