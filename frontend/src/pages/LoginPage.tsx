import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Container, TextField, Typography, Alert, Divider, Chip } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_CONFIG } from '../config/apiConfig';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);
  
  // Registration form state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  
  const { login, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect info from location state
  const redirectTo = location.state?.redirectTo;
  const bookingData = location.state?.bookingData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError(); // Clear previous auth errors
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        // Check if there's a redirect with booking data
        if (redirectTo && bookingData) {
          navigate(redirectTo, { state: bookingData });
        } else {
          // Navigate to dashboard, which will redirect based on user role
          navigate('/dashboard');
        }
      }
      // Note: If login fails, the error will be set in authError by AuthContext
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    clearError();

    // Validation
    if (registerPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (registerPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerEmail)) {
      setError('Please provide a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
          firstName,
          lastName,
          phone: phone || undefined,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Registration failed');
      }

      const registrationData = await response.json();
      
      // Store authentication data (same format as login)
      const user = {
        id: registrationData.id.toString(),
        email: registrationData.email,
        firstName: registrationData.firstName || '',
        lastName: registrationData.lastName || '',
        phone: '',
        role: Array.isArray(registrationData.roles) ? registrationData.roles[0] : registrationData.roles,
        roles: Array.isArray(registrationData.roles) ? registrationData.roles : [registrationData.roles],
        hotelId: undefined,
        hotelName: undefined,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true,
      };

      // Store in localStorage (mimicking the login process)
      localStorage.setItem('auth_token', registrationData.token);
      localStorage.setItem('auth_user', JSON.stringify(user));

      setSuccess('Registration successful! Redirecting...');

      // Small delay to show success message
      setTimeout(() => {
        if (redirectTo && bookingData) {
          navigate(redirectTo, { state: bookingData });
        } else {
          navigate('/');
        }
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fillSampleUser = (sampleEmail: string, samplePassword: string) => {
    setEmail(sampleEmail);
    setPassword(samplePassword);
    clearError(); // Clear any existing errors
    setError(''); // Clear local errors
    setSuccess(''); // Clear success messages
  };

  // Get the error to display (prefer auth context error, then local error)
  const displayError = authError || error;

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          gap: 4,
        }}
      >
        {/* Main Login Form */}
        <Card sx={{ maxWidth: 500, width: '100%', height: 'fit-content' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Manage My Hotel
            </Typography>
            
            {bookingData && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Sign in to complete your booking for <strong>{bookingData.hotelName}</strong>
                </Typography>
              </Alert>
            )}

            <Typography variant="h5" component="h2" gutterBottom align="center">
              {!showSignUp ? 'Sign In' : 'Create Account'}{bookingData ? ' to Book' : ''}
            </Typography>

            {displayError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {displayError}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            {!showSignUp ? (
              // Sign In Form
              <Box component="form" onSubmit={handleSubmit} data-testid="login-form">
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
                  inputProps={{ 'data-testid': 'email-input' }}
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
                  inputProps={{ 'data-testid': 'password-input' }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                  data-testid="login-button"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </Box>
            ) : (
              // Sign Up Form
              <Box component="form" onSubmit={handleRegister}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  margin="normal"
                  required
                  autoComplete="email"
                />
                <TextField
                  fullWidth
                  label="Phone (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  margin="normal"
                  required
                  autoComplete="new-password"
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  margin="normal"
                  required
                  autoComplete="new-password"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </Box>
            )}

            <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
              {!showSignUp ? (
                <>
                  Don't have an account?{' '}
                  <Button 
                    variant="text" 
                    onClick={() => setShowSignUp(true)}
                    sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
                  >
                    Sign up here
                  </Button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Button 
                    variant="text" 
                    onClick={() => setShowSignUp(false)}
                    sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
                  >
                    Sign in here
                  </Button>
                </>
              )}
            </Typography>

            {/* Test Credentials Hint - Only show on Sign In */}
            {!showSignUp && (
              <Divider sx={{ my: 3 }}>
                <Chip label="Test Credentials Available on the Right →" size="small" color="primary" />
              </Divider>
            )}
          </CardContent>
        </Card>

        {/* Test Credentials Panel - Only show on Sign In */}
        {!showSignUp && (
          <Card sx={{ maxWidth: 400, width: '100%', height: 'fit-content' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom align="center" color="primary">
                Quick Login - Test Credentials
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 2 }}>
                Click any button below to auto-fill credentials for testing:
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('admin@bookmyhotel.com', 'admin123')}
                  sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 2 }}
                >
                  <Typography variant="body2" fontWeight="bold">🔧 System Admin</Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                    admin@bookmyhotel.com
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Password: admin123
                  </Typography>
                  <Typography variant="caption" color="success.main" sx={{ mt: 0.5 }}>
                    ✅ Full System Access
                  </Typography>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('admin.grandplaza@bookmyhotel.com', 'admin123')}
                  sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 2 }}
                >
                  <Typography variant="body2" fontWeight="bold">🏨 Hotel Admin - Grand Plaza</Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                    admin.grandplaza@bookmyhotel.com
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Password: admin123
                  </Typography>
                  <Typography variant="caption" color="info.main" sx={{ mt: 0.5 }}>
                    🏨 Grand Plaza Hotel (100 rooms)
                  </Typography>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('frontdesk.grandplaza@bookmyhotel.com', 'front123')}
                  sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 2 }}
                >
                  <Typography variant="body2" fontWeight="bold">🎯 Front Desk - Grand Plaza</Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                    frontdesk.grandplaza@bookmyhotel.com
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Password: front123
                  </Typography>
                  <Typography variant="caption" color="warning.main" sx={{ mt: 0.5 }}>
                    🎯 Grand Plaza Hotel Front Desk
                  </Typography>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('admin.samhotel@bookmyhotel.com', 'admin123')}
                  sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 2 }}
                >
                  <Typography variant="body2" fontWeight="bold">🏨 Hotel Admin - Sam Hotel</Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                    admin.samhotel@bookmyhotel.com
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Password: admin123
                  </Typography>
                  <Typography variant="caption" color="info.main" sx={{ mt: 0.5 }}>
                    🏨 Sam Hotel ! (0 rooms)
                  </Typography>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('frontdesk.samhotel@bookmyhotel.com', 'front123')}
                  sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 2 }}
                >
                  <Typography variant="body2" fontWeight="bold">🎯 Front Desk - Sam Hotel</Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                    frontdesk.samhotel@bookmyhotel.com
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Password: front123
                  </Typography>
                  <Typography variant="caption" color="warning.main" sx={{ mt: 0.5 }}>
                    🎯 Sam Hotel ! Front Desk
                  </Typography>
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default LoginPage;
