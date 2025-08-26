import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import HousekeepingDashboard from '../../components/Housekeeping/HousekeepingDashboard';

const HousekeepingPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Housekeeping Management
        </Typography>
        <HousekeepingDashboard />
      </Box>
    </Container>
  );
};

export default HousekeepingPage;