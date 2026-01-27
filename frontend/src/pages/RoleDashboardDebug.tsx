import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableRow } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

/**
 * Debug page to check role-based dashboard routing
 */
const RoleDashboardDebug: React.FC = () => {
  const { user, isAuthenticated, token } = useAuth();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Role Dashboard Debug
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Authentication Status
        </Typography>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Is Authenticated</TableCell>
              <TableCell>{isAuthenticated ? 'Yes' : 'No'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Has Token</TableCell>
              <TableCell>{token ? 'Yes' : 'No'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>User Object Exists</TableCell>
              <TableCell>{user ? 'Yes' : 'No'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>

      {user && (
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            User Information
          </Typography>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>{user.email}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>{user.firstName} {user.lastName}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Primary Role</TableCell>
                <TableCell><strong>{user.role}</strong></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>All Roles</TableCell>
                <TableCell>{user.roles ? user.roles.join(', ') : 'None'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Tenant ID</TableCell>
                <TableCell>{user.tenantId || 'None'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Hotel ID</TableCell>
                <TableCell>{user.hotelId || 'None'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Hotel Name</TableCell>
                <TableCell>{user.hotelName || 'None'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      )}

      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Expected Dashboard Routes
        </Typography>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>SYSTEM_ADMIN</TableCell>
              <TableCell>/system-dashboard</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>HOTEL_ADMIN</TableCell>
              <TableCell>/hotel-admin/dashboard</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>FRONTDESK</TableCell>
              <TableCell>/frontdesk/dashboard</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>OPERATIONS_SUPERVISOR</TableCell>
              <TableCell>/operations/dashboard</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>HOUSEKEEPING or MAINTENANCE</TableCell>
              <TableCell>/staff/dashboard</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>

      {user && (
        <Paper sx={{ p: 3, mt: 2, bgcolor: '#e3f2fd' }}>
          <Typography variant="h6" gutterBottom color="primary">
            Your Expected Route
          </Typography>
          <Typography variant="body1">
            {user.roles?.includes('SYSTEM_ADMIN') && '/system-dashboard'}
            {user.roles?.includes('HOTEL_ADMIN') && '/hotel-admin/dashboard'}
            {user.roles?.includes('FRONTDESK') && '/frontdesk/dashboard'}
            {user.roles?.includes('OPERATIONS_SUPERVISOR') && '/operations/dashboard'}
            {(user.roles?.includes('HOUSEKEEPING') || user.roles?.includes('MAINTENANCE')) && '/staff/dashboard'}
            {!user.roles && user.role === 'FRONTDESK' && '/frontdesk/dashboard (legacy role)'}
          </Typography>
        </Paper>
      )}

      <Paper sx={{ p: 3, mt: 2, bgcolor: '#fff3e0' }}>
        <Typography variant="h6" gutterBottom>
          Debugging Tips
        </Typography>
        <Typography variant="body2" component="div">
          <ul>
            <li>If "All Roles" is empty or undefined, the backend may not be sending the roles array</li>
            <li>If "Hotel ID" is missing for FRONTDESK users, they may not be able to access hotel-specific data</li>
            <li>Check the browser console for any errors or warnings</li>
            <li>Verify the backend API is returning complete user data</li>
          </ul>
        </Typography>
      </Paper>
    </Box>
  );
};

export default RoleDashboardDebug;
