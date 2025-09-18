import React from 'react';
import { Box, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import BookingManagementTable from '../../components/booking/BookingManagementTable';

const HotelBookings: React.FC = () => {
  const { canAccessCheckout } = useAuth();

  // Debug logging for checkout access
  console.log('HotelBookings - Can access checkout:', canAccessCheckout());
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Hotel Bookings Management
      </Typography>
      
      <BookingManagementTable
        mode="front-desk"
        title="Booking Management"
        showActions={true}
        showCheckInOut={canAccessCheckout()}
        currentTab={0}
        onBookingAction={(booking, action) => {
          console.log(`${action} for booking:`, booking);
        }}
      />
    </Box>
  );
};

export default HotelBookings;
