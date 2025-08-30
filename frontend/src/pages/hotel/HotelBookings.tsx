import React, { useState } from 'react';
import { Box, Typography, Snackbar, Alert } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import BookingManagementTable from '../../components/booking/BookingManagementTable';
import WalkInBookingModal from '../../components/booking/WalkInBookingModal';

const HotelBookings: React.FC = () => {
  const { canAccessCheckout } = useAuth();
  const [walkInModalOpen, setWalkInModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

  // Debug logging for checkout access
  console.log('HotelBookings - Can access checkout:', canAccessCheckout());
  
  const handleWalkInSuccess = (booking: any) => {
    console.log('Walk-in booking created successfully:', booking);
    setSnackbar({
      open: true,
      message: `Walk-in booking created successfully for ${booking.guestName}`,
      severity: 'success'
    });
    setWalkInModalOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Hotel Bookings Management
      </Typography>
      
      <BookingManagementTable
        mode="hotel-admin"
        title="Booking Management"
        showActions={true}
        showCheckInOut={true}
        currentTab={0}
        onBookingAction={(booking, action) => {
          console.log(`${action} for booking:`, booking);
        }}
        onWalkInRequest={() => {
          console.log('Walk-in booking requested from BookingManagementTable'); 
          setWalkInModalOpen(true);
        }}
      />
      
      {/* Walk-in Booking Modal */}
      <WalkInBookingModal
        key={walkInModalOpen ? 'modal-open' : 'modal-closed'} // Force re-render
        open={walkInModalOpen}
        onClose={() => {
          console.log('Closing walk-in modal'); // Debug log
          setWalkInModalOpen(false);
        }}
        onSuccess={handleWalkInSuccess}
      />

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HotelBookings;
