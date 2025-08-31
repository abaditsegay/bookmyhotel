import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Snackbar
} from '@mui/material';
import OperationsSupervisorDashboard from '../../components/operations/OperationsSupervisorDashboard';

interface User {
  id: number;
  username: string;
  role: string;
  permissions: string[];
}

const OperationsPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // In a real implementation, get user from authentication context
    // For demo purposes, using mock data
    const mockUser: User = {
      id: 1,
      username: 'operations_supervisor',
      role: 'OPERATIONS_SUPERVISOR',
      permissions: [
        'MANAGE_HOUSEKEEPING_TASKS',
        'ASSIGN_HOUSEKEEPING_TASKS',
        'MANAGE_MAINTENANCE_TASKS',
        'ASSIGN_MAINTENANCE_TASKS',
        'VIEW_OPERATIONS_DASHBOARD',
        'MANAGE_STAFF'
      ]
    };
    setUser(mockUser);
  }, []);

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) || false;
  };

  if (!user) {
    return (
      <Box sx={{ width: '100%', p: 3 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6">Loading...</Typography>
        </Box>
      </Box>
    );
  }

  if (!hasPermission('VIEW_OPERATIONS_DASHBOARD')) {
    return (
      <Box sx={{ width: '100%', p: 3 }}>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            You don't have permission to access the operations dashboard.
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Box sx={{ width: '100%', p: 3 }}>
        <OperationsSupervisorDashboard />

        {/* Success/Error Messages */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={() => setSuccessMessage(null)}
        >
          <Alert severity="success" onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default OperationsPage;
