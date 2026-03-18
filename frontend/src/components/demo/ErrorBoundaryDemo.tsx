import React, { useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { BugReport as BugIcon } from '@mui/icons-material';
import { ErrorBoundary } from '../common';

/**
 * Test component to demonstrate ErrorBoundary functionality
 * This component can be used to test error boundaries in development
 */
const ErrorBoundaryDemo: React.FC = () => {
  const [shouldError, setShouldError] = useState(false);
  const [componentError, setComponentError] = useState(false);

  const handleThrowError = () => {
    setShouldError(true);
  };

  const handleThrowComponentError = () => {
    setComponentError(true);
  };

  const handleReset = () => {
    setShouldError(false);
    setComponentError(false);
  };

  if (shouldError) {
    // This will trigger the page-level error boundary
    throw new Error('This is a test error to demonstrate the ErrorBoundary functionality!');
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Error Boundary Demo
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Use these buttons to test different error boundary scenarios:
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          color="error"
          startIcon={<BugIcon />}
          onClick={handleThrowError}
        >
          Throw Page Error
        </Button>

        <Button
          variant="outlined"
          color="warning"
          startIcon={<BugIcon />}
          onClick={handleThrowComponentError}
        >
          Throw Component Error
        </Button>

        <Button
          variant="text"
          onClick={handleReset}
        >
          Reset All
        </Button>
      </Box>

      {/* Component-level error boundary demonstration */}
      <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Component with Error Boundary
        </Typography>
        
        <ErrorBoundary level="component">
          <ErrorProneComponent shouldError={componentError} />
        </ErrorBoundary>
      </Paper>
    </Box>
  );
};

/**
 * A component that can throw an error to test component-level error boundaries
 */
const ErrorProneComponent: React.FC<{ shouldError: boolean }> = ({ shouldError }) => {
  if (shouldError) {
    throw new Error('Component-level error for testing!');
  }

  return (
    <Box sx={{ p: 2, backgroundColor: 'success.light', borderRadius: 1 }}>
      <Typography variant="body2" color="success.contrastText">
        ✅ This component is working normally. Click "Throw Component Error" to see how it's handled.
      </Typography>
    </Box>
  );
};

export default ErrorBoundaryDemo;