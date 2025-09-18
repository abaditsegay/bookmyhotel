import React from 'react';
import { Box, Alert, Button } from '@mui/material';
import RoomChargesManagement from './RoomChargesManagement';
import { useAuth } from '../../contexts/AuthContext';

const RoomCharges: React.FC = () => {
  const { user, logout } = useAuth();
  
  // Get hotel ID from the authenticated user
  const hotelId = user?.hotelId ? parseInt(user.hotelId) : null;

  if (!hotelId) {
    return (
      <Box p={2}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Unable to determine hotel ID for the current user. Please ensure you are logged in as a hotel staff member.
        </Alert>
        <Alert severity="info" sx={{ mb: 2 }}>
          Current user: {user?.email} | Tenant: {user?.tenantId} | Hotel ID: {user?.hotelId || 'Not assigned'}
        </Alert>
        <Button variant="outlined" onClick={logout}>
          Log out and try different account
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Room Charges Management Component */}
      <RoomChargesManagement hotelId={hotelId} />
    </Box>
  );
};

export default RoomCharges;
