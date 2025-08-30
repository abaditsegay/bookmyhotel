import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Container, TextField, Typography, Alert, Divider, Chip } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

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
          // Navigate to home page, which will redirect based on user role
          navigate('/');
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
      const response = await fetch('http://localhost:8080/api/auth/register', {
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
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          gap: 3,
        }}
      >
        {/* Two Column Layout for Login */}
        <Box sx={{ display: 'flex', gap: 3, width: '100%', maxWidth: 900 }}>
          {/* Main Login Form */}
          <Card sx={{ flex: 1, maxWidth: 450, maxHeight: '90vh', overflow: 'auto' }}>
            <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              BookMyHotel
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

            {/* Test Users Section - Only show on Sign In */}
            {!showSignUp && (
              <>
                <Divider sx={{ my: 3 }}>
                  <Chip label="Quick Login - System Administrators" size="small" color="primary" />
                </Divider>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 1 }}>
                    ✅ System administrators - Click to auto-fill and test:
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => fillSampleUser('admin@bookmyhotel.com', 'password')}
                    sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
                  >
                    <Typography variant="body2" fontWeight="bold">🔧 System Administrator 1</Typography>
                    <Typography variant="caption" color="textSecondary">
                      admin@bookmyhotel.com / password
                    </Typography>
                    <Typography variant="caption" color="success.main" sx={{ mt: 0.5 }}>
                      ✅ Primary System Admin
                    </Typography>
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => fillSampleUser('admin2@bookmyhotel.com', 'password123')}
                    sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
                  >
                    <Typography variant="body2" fontWeight="bold">🔧 System Administrator 2</Typography>
                    <Typography variant="caption" color="textSecondary">
                      admin2@bookmyhotel.com / password123
                    </Typography>
                    <Typography variant="caption" color="success.main" sx={{ mt: 0.5 }}>
                      ✅ Secondary System Admin
                    </Typography>
                  </Button>
                </Box>
              </>
            )}
            </CardContent>
          </Card>

          {/* Addis Sunshine Hotel Section */}
          <Card sx={{ flex: 1, maxWidth: 400, maxHeight: '90vh', overflow: 'auto' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom align="center" color="primary">
                🇪🇹 Addis Sunshine Hotel
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
                Demo Hotel - Comprehensive Staff & Data
              </Typography>

              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  ✨ <strong>DEMO READY:</strong> Complete hotel operation with 5 staff roles, 33 rooms, current guests, and realistic operational data! ✅
                </Typography>
              </Alert>

              <Divider sx={{ my: 2 }}>
                <Chip label="Addis Sunshine Hotel Staff" size="small" />
              </Divider>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('bookmyhotel2025+newhotel001@gmail.com', 'password')}
                  sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 2 }}
                >
                  <Typography variant="body2" fontWeight="bold">🏨 Hotel Administrator</Typography>
                  <Typography variant="caption" color="textSecondary">
                    bookmyhotel2025+newhotel001@gmail.com
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Password: password
                  </Typography>
                  <Typography variant="caption" color="success.main" sx={{ mt: 0.5 }}>
                    ✅ Almaz Kebede - Hotel Admin
                  </Typography>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('bookmyhotel2025+newhotelfd001@gmail.com', 'password')}
                  sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 2 }}
                >
                  <Typography variant="body2" fontWeight="bold">🎯 Front Desk Staff</Typography>
                  <Typography variant="caption" color="textSecondary">
                    bookmyhotel2025+newhotelfd001@gmail.com
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Password: password
                  </Typography>
                  <Typography variant="caption" color="success.main" sx={{ mt: 0.5 }}>
                    ✅ Dawit Tadesse - Front Desk
                  </Typography>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('operations@addissunshine.com', 'password')}
                  sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 2 }}
                >
                  <Typography variant="body2" fontWeight="bold">🔧 Operations Supervisor</Typography>
                  <Typography variant="caption" color="textSecondary">
                    operations@addissunshine.com
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Password: password
                  </Typography>
                  <Typography variant="caption" color="success.main" sx={{ mt: 0.5 }}>
                    ✅ Yohannes Getachew - Operations
                  </Typography>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('housekeeping@addissunshine.com', 'password')}
                  sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 2 }}
                >
                  <Typography variant="body2" fontWeight="bold">🧹 Housekeeping Staff</Typography>
                  <Typography variant="caption" color="textSecondary">
                    housekeeping@addissunshine.com
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Password: password
                  </Typography>
                  <Typography variant="caption" color="success.main" sx={{ mt: 0.5 }}>
                    ✅ Tigist Haile - Housekeeping
                  </Typography>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('maintenance@addissunshine.com', 'password')}
                  sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 2 }}
                >
                  <Typography variant="body2" fontWeight="bold">⚙️ Maintenance Staff</Typography>
                  <Typography variant="caption" color="textSecondary">
                    maintenance@addissunshine.com
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Password: password
                  </Typography>
                  <Typography variant="caption" color="success.main" sx={{ mt: 0.5 }}>
                    ✅ Bekele Mengistu - Maintenance
                  </Typography>
                </Button>
              </Box>

              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  <strong>Addis Sunshine Hotel Info:</strong><br/>
                  📍 Addis Ababa, Ethiopia<br/>
                  🏨 33 rooms (Standard, Deluxe, Suite)<br/>
                  👥 5 staff members with different roles<br/>
                  ✨ Complete demo data with real bookings
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
