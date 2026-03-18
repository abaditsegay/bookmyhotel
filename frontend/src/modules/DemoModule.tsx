import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Typography, Paper, Alert } from '@mui/material';

// Demo dashboard for development and testing
const DemoDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        This demo module is only available in development mode.
      </Alert>
      <Typography variant="h4" gutterBottom>
        Demo & Testing
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Development Tools
        </Typography>
        <Typography color="textSecondary">
          Demo features and testing utilities will be available here during development.
        </Typography>
      </Paper>
    </Box>
  );
};

const DemoModule: React.FC = () => {
  // Only render in development mode
  if (process.env.NODE_ENV !== 'development') {
    return <div>Demo module not available in production</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<DemoDashboard />} />
      <Route path="/dashboard" element={<DemoDashboard />} />
    </Routes>
  );
};

export default DemoModule;