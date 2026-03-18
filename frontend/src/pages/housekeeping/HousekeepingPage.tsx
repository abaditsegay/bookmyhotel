import React from 'react';
import { Box } from '@mui/material';
import RoleBasedHousekeepingView from '../../components/Housekeeping/RoleBasedHousekeepingView';

const HousekeepingPage: React.FC = () => {
  return (
    <Box>
      <Box sx={{ mt: 4, mb: 4 }}>
        <RoleBasedHousekeepingView />
      </Box>
    </Box>
  );
};

export default HousekeepingPage;