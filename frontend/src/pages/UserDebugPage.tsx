import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip, Alert, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import TokenManager from '../utils/tokenManager';

const UserDebugPage: React.FC = () => {
  const { user } = useAuth();
  const [tokenData, setTokenData] = useState<any>(null);
  const [localStorageData, setLocalStorageData] = useState<any>(null);
  const [authoritiesData, setAuthoritiesData] = useState<any>(null);
  const [testingAuthorities, setTestingAuthorities] = useState(false);

  useEffect(() => {
    // Get token data from TokenManager
    const currentUser = TokenManager.getUser();
    const currentToken = TokenManager.getToken();
    
    setLocalStorageData({
      user: currentUser,
      token: currentToken
    });

    // Decode JWT token if available
    if (currentToken) {
      try {
        const base64Url = currentToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        setTokenData(JSON.parse(jsonPayload));
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
  }, []);

  const handleRefreshUser = () => {
    window.location.reload();
  };

  const testBackendAuthorities = async () => {
    setTestingAuthorities(true);
    try {
      const token = TokenManager.getToken();
      if (!token) {
        setAuthoritiesData({ error: 'No token found' });
        return;
      }

      const response = await fetch('/api/auth/debug/authorities', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAuthoritiesData(data);
      } else {
        const errorText = await response.text();
        setAuthoritiesData({ error: `HTTP ${response.status}: ${errorText}` });
      }
    } catch (error) {
      setAuthoritiesData({ error: `Network error: ${error}` });
    } finally {
      setTestingAuthorities(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        User Authentication Debug
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This page shows the current user authentication state for debugging 403 errors.
      </Alert>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        {/* Auth Context Data */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Auth Context Data
          </Typography>
          
          {user ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography><strong>ID:</strong> {user.id}</Typography>
              <Typography><strong>Email:</strong> {user.email}</Typography>
              <Typography><strong>Name:</strong> {user.firstName} {user.lastName}</Typography>
              <Typography><strong>Primary Role:</strong> {user.role}</Typography>
              
              <Box>
                <Typography><strong>All Roles:</strong></Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  {user.roles?.map((role, index) => (
                    <Chip 
                      key={index} 
                      label={role} 
                      color={role === 'HOTEL_ADMIN' ? 'success' : 'default'}
                      variant={role === 'HOTEL_ADMIN' ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
              </Box>
              
              <Typography><strong>Tenant ID:</strong> {user.tenantId || 'null'}</Typography>
              <Typography><strong>Hotel ID:</strong> {user.hotelId || 'none'}</Typography>
              <Typography><strong>Hotel Name:</strong> {user.hotelName || 'none'}</Typography>
              <Typography><strong>Is System Wide:</strong> {user.isSystemWide ? 'Yes' : 'No'}</Typography>
              <Typography><strong>Is Tenant Bound:</strong> {user.isTenantBound ? 'Yes' : 'No'}</Typography>
              
              <Alert 
                severity={user.roles?.includes('HOTEL_ADMIN') ? 'success' : 'error'}
                sx={{ mt: 2 }}
              >
                {user.roles?.includes('HOTEL_ADMIN') 
                  ? '✅ User has HOTEL_ADMIN role - should have access'
                  : '❌ User does NOT have HOTEL_ADMIN role - this is why 403 errors occur'
                }
              </Alert>
            </Box>
          ) : (
            <Typography color="error">No user data found in Auth Context</Typography>
          )}
        </Paper>

        {/* Local Storage Data */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Local Storage Data
          </Typography>
          
          {localStorageData?.user ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle2">Raw localStorage user data:</Typography>
              <Box sx={{ 
                bgcolor: 'grey.100', 
                p: 2, 
                borderRadius: 1, 
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                overflow: 'auto',
                maxHeight: 300
              }}>
                <pre>{JSON.stringify(localStorageData.user, null, 2)}</pre>
              </Box>
            </Box>
          ) : (
            <Typography color="error">No user data found in localStorage</Typography>
          )}
        </Paper>

        {/* JWT Token Data */}
        <Paper sx={{ p: 3, gridColumn: { md: 'span 2' } }}>
          <Typography variant="h6" gutterBottom>
            JWT Token Payload
          </Typography>
          
          {tokenData ? (
            <Box sx={{ 
              bgcolor: 'grey.100', 
              p: 2, 
              borderRadius: 1, 
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              overflow: 'auto',
              maxHeight: 400
            }}>
              <pre>{JSON.stringify(tokenData, null, 2)}</pre>
            </Box>
          ) : (
            <Typography color="error">No valid JWT token found</Typography>
          )}
        </Paper>

        {/* Backend Authorities Test */}
        <Paper sx={{ p: 3, gridColumn: { md: 'span 2' } }}>
          <Typography variant="h6" gutterBottom>
            Backend Authorities Test
          </Typography>
          
          <Button 
            variant="contained" 
            onClick={testBackendAuthorities}
            disabled={testingAuthorities}
            sx={{ mb: 2 }}
          >
            {testingAuthorities ? 'Testing...' : 'Test Backend Authorities'}
          </Button>
          
          {authoritiesData && (
            <Box sx={{ 
              bgcolor: authoritiesData.error ? 'error.light' : 'success.light', 
              p: 2, 
              borderRadius: 1, 
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              overflow: 'auto',
              maxHeight: 400
            }}>
              <pre>{JSON.stringify(authoritiesData, null, 2)}</pre>
            </Box>
          )}
        </Paper>
      </Box>

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={handleRefreshUser}>
          Refresh Data
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => window.open('/login', '_blank')}
        >
          Re-login as Different User
        </Button>
      </Box>
    </Box>
  );
};

export default UserDebugPage;