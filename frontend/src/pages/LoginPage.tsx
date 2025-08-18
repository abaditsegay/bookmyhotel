import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Container, TextField, Typography, Alert, Divider, Chip } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        // Navigate to home page, which will redirect based on user role
        navigate('/');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillSampleUser = (sampleEmail: string, samplePassword: string) => {
    setEmail(sampleEmail);
    setPassword(samplePassword);
    setError('');
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 400 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              BookMyHotel
            </Typography>
            <Typography variant="h6" component="h2" gutterBottom align="center" color="textSecondary">
              Admin Login
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                autoComplete="email"
                autoFocus
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="current-password"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Box>

            {/* Sample Users Section */}
            <Divider sx={{ my: 3 }}>
              <Chip label="Demo Users - Click to Test" size="small" color="primary" />
            </Divider>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 1 }}>
                Use sample credentials for testing:
              </Typography>
              
              <Button
                variant="outlined"
                size="small"
                onClick={() => fillSampleUser('admin@grandplaza.com', 'password')}
                sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
              >
                <Typography variant="body2" fontWeight="bold">System Admin</Typography>
                <Typography variant="caption" color="textSecondary">
                  admin@grandplaza.com / password
                </Typography>
              </Button>
              
              <Button
                variant="outlined"
                size="small"
                onClick={() => fillSampleUser('hoteladmin@bookmyhotel.com', 'password')}
                sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
              >
                <Typography variant="body2" fontWeight="bold">Hotel Admin</Typography>
                <Typography variant="caption" color="textSecondary">
                  hoteladmin@bookmyhotel.com / password
                </Typography>
              </Button>

              <Button
                variant="outlined"
                size="small"
                onClick={() => fillSampleUser('frontdesk1@grandplaza.com', 'password')}
                sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
              >
                <Typography variant="body2" fontWeight="bold">Front Desk Staff</Typography>
                <Typography variant="caption" color="textSecondary">
                  frontdesk1@grandplaza.com / password
                </Typography>
              </Button>
            </Box>

            <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
              Click a test user button to auto-fill credentials, then "Sign In"
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginPage;
