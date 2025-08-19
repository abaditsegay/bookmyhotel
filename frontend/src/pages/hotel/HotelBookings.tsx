import React from 'react';
import { Box, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import BookingManagementTable from '../../components/booking/BookingManagementTable';

const HotelBookings: React.FC = () => {
  const { user } = useAuth();
  
  // Determine mode based on user role
  const mode = user?.roles?.includes('HOTEL_ADMIN') ? 'hotel-admin' : 'front-desk';
  
  // Show check-in/out actions for front desk users
  const showCheckInOut = user?.roles?.includes('FRONTDESK') || user?.role === 'FRONTDESK';
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        Hotel Bookings
      </Typography>
      
      <BookingManagementTable
        mode={mode}
        title="All Bookings"
        showActions={true}
        showCheckInOut={showCheckInOut}
        onBookingAction={(booking, action) => {
          console.log(`${action} for booking:`, booking);
          // Handle booking actions like check-in/check-out
        }}
      />
    </Box>
  );
};

export default HotelBookings;
