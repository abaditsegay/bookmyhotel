import React from 'react';
import { alpha } from '@mui/material/styles';
import { Box, Alert, Button, useTheme } from '@mui/material';
import RoomChargesManagement from './RoomChargesManagement';
import { useAuth } from '../../contexts/AuthContext';
import { getReadableAccentTextColor } from '../../theme/surfaces';

const RoomCharges: React.FC = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const readableAccentColor = getReadableAccentTextColor(theme);
  const accentBorder = alpha(readableAccentColor, theme.palette.mode === 'dark' ? 0.34 : 0.18);
  const accentHover = alpha(readableAccentColor, theme.palette.mode === 'dark' ? 0.14 : 0.08);
  
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
        <Button
          variant="outlined"
          onClick={logout}
          sx={{
            borderColor: accentBorder,
            color: readableAccentColor,
            '&:hover': {
              borderColor: readableAccentColor,
              backgroundColor: accentHover,
            },
          }}
        >
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
