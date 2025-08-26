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
        {/* Three Column Layout for Hotel Staff */}
        <Box sx={{ display: 'flex', gap: 3, width: '100%', maxWidth: 1400 }}>
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
                  <Chip label="Quick Login - System Users" size="small" color="primary" />
                </Divider>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 1 }}>
                    ✅ System users - Click to auto-fill and test:
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => fillSampleUser('admin@bookmyhotel.com', 'password')}
                    sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
                  >
                    <Typography variant="body2" fontWeight="bold">🔧 System Administrator</Typography>
                    <Typography variant="caption" color="textSecondary">
                      admin@bookmyhotel.com / password
                    </Typography>
                  </Button>
                </Box>
              </>
            )}
            </CardContent>
          </Card>

          {/* Ethiopian Heritage Hotels Section */}
          <Card sx={{ flex: 1, maxWidth: 400, maxHeight: '90vh', overflow: 'auto' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom align="center" color="primary">
                🇪🇹 Ethiopian Heritage Hotels
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
                Authentic Ethiopian hospitality - New!
              </Typography>

              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  🆕 <strong>NEW:</strong> Ethiopian hotels with 68+ staff members! International-ready with English interface ✅
                </Typography>
              </Alert>

              <Divider sx={{ my: 2 }}>
                <Chip label="Ethiopian Hotel Credentials" size="small" />
              </Divider>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('admin@ethiopian-heritage.et', 'password123')}
                  sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 2 }}
                >
                  <Typography variant="body2" fontWeight="bold">🔧 System Administrator</Typography>
                  <Typography variant="caption" color="textSecondary">
                    admin@ethiopian-heritage.et
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Password: password123
                  </Typography>
                  <Typography variant="caption" color="success.main" sx={{ mt: 0.5 }}>
                    ✅ Abebe Tesfaye - System Admin
                  </Typography>
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('hotel.admin@sheraton-addis.et', 'password123')}
                  sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 2 }}
                >
                  <Typography variant="body2" fontWeight="bold">🏨 Sheraton Addis Ababa</Typography>
                  <Typography variant="caption" color="textSecondary">
                    hotel.admin@sheraton-addis.et
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Password: password123
                  </Typography>
                  <Typography variant="caption" color="success.main" sx={{ mt: 0.5 }}>
                    ✅ Hawaryat Bekele - Hotel Admin
                  </Typography>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('hotel.admin@lalibela-lodge.et', 'password123')}
                  sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 2 }}
                >
                  <Typography variant="body2" fontWeight="bold">🏛️ Lalibela Cultural Lodge</Typography>
                  <Typography variant="caption" color="textSecondary">
                    hotel.admin@lalibela-lodge.et
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Password: password123
                  </Typography>
                  <Typography variant="caption" color="success.main" sx={{ mt: 0.5 }}>
                    ✅ Zera Yacob - Hotel Admin
                  </Typography>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('frontdesk@sheraton-addis.et', 'password123')}
                  sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
                >
                  <Typography variant="body2" fontWeight="bold">🎯 Sheraton Front Desk</Typography>
                  <Typography variant="caption" color="textSecondary">
                    frontdesk@sheraton-addis.et
                  </Typography>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('frontdesk@lalibela-lodge.et', 'password123')}
                  sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
                >
                  <Typography variant="body2" fontWeight="bold">🎯 Lalibela Front Desk</Typography>
                  <Typography variant="caption" color="textSecondary">
                    frontdesk@lalibela-lodge.et
                  </Typography>
                </Button>
              </Box>

              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  <strong>Ethiopian Hotels Info:</strong><br/>
                  📍 Addis Ababa & Lalibela, Ethiopia<br/>
                  👥 68 total staff members<br/>
                  🏨 2 hotels with 19 premium rooms<br/>
                  ✨ Authentic Ethiopian culture & hospitality
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Grand Plaza Hotel Credentials */}
          <Card sx={{ flex: 1, maxWidth: 400, maxHeight: '90vh', overflow: 'auto' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom align="center" color="primary">
                🏛️ Grand Plaza Hotel
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
                Luxury Hotel Chain - New York
              </Typography>

              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  🔧 <strong>UPDATED:</strong> All hotel staff credentials now use standardized password "password" for easy testing! All accounts verified ✅
                </Typography>
              </Alert>

              <Divider sx={{ my: 2 }}>
                <Chip label="Staff Login Credentials" size="small" />
              </Divider>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('hotel.admin@grandplaza.com', 'password')}
                  sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 2 }}
                >
                  <Typography variant="body2" fontWeight="bold">🏨 Hotel Administrator</Typography>
                  <Typography variant="caption" color="textSecondary">
                    hotel.admin@grandplaza.com
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Password: password
                  </Typography>
                  <Typography variant="caption" color="success.main" sx={{ mt: 0.5 }}>
                    ✅ John Manager - Working Perfectly
                  </Typography>
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('frontdesk@grandplaza.com', 'password')}
                  sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 2 }}
                >
                  <Typography variant="body2" fontWeight="bold">🎯 Front Desk Staff</Typography>
                  <Typography variant="caption" color="textSecondary">
                    frontdesk@grandplaza.com
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Password: password
                  </Typography>
                  <Typography variant="caption" color="success.main" sx={{ mt: 0.5 }}>
                    ✅ Jane Desk - Working Perfectly
                  </Typography>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('housekeeping@grandplaza.com', 'password')}
                  sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 2 }}
                >
                  <Typography variant="body2" fontWeight="bold">🧹 Housekeeping Staff</Typography>
                  <Typography variant="caption" color="textSecondary">
                    housekeeping@grandplaza.com
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Password: password
                  </Typography>
                  <Typography variant="caption" color="success.main" sx={{ mt: 0.5 }}>
                    ✅ Anna Miller - Working Perfectly
                  </Typography>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('maintenance@grandplaza.com', 'password')}
                  sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 2 }}
                >
                  <Typography variant="body2" fontWeight="bold">🔨 Maintenance Staff</Typography>
                  <Typography variant="caption" color="textSecondary">
                    maintenance@grandplaza.com
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Password: password
                  </Typography>
                  <Typography variant="caption" color="success.main" sx={{ mt: 0.5 }}>
                    ✅ Carlos Rodriguez - Working Perfectly
                  </Typography>
                </Button>
              </Box>

              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  <strong>Hotel Info:</strong><br/>
                  📍 123 Royal Avenue, New York<br/>
                  📞 +1-212-555-0101<br/>
                  ✨ Luxury accommodations & service
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Multi-Hotel Credentials Section */}
          <Card sx={{ flex: 1, maxWidth: 400, maxHeight: '90vh', overflow: 'auto' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom align="center" color="primary">
                � More Hotels - All Use "password"
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
                All 13 hotels standardized with "password"
              </Typography>

              <Divider sx={{ my: 2 }}>
                <Chip label="Quick Test Credentials" size="small" />
              </Divider>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('hoteladmin@grandtesthotel.com', 'password')}
                  sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
                >
                  <Typography variant="body2" fontWeight="bold">🏨 Grand Test Hotel</Typography>
                  <Typography variant="caption" color="textSecondary">
                    hoteladmin@grandtesthotel.com
                  </Typography>
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('hoteladmin@sunshineresort.com', 'password')}
                  sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
                >
                  <Typography variant="body2" fontWeight="bold">🌞 Sunshine Family Resort</Typography>
                  <Typography variant="caption" color="textSecondary">
                    hoteladmin@sunshineresort.com
                  </Typography>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('hoteladmin@grandluxuryresort.com', 'password')}
                  sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
                >
                  <Typography variant="body2" fontWeight="bold">✨ Grand Luxury Resort & Spa</Typography>
                  <Typography variant="caption" color="textSecondary">
                    hoteladmin@grandluxuryresort.com
                  </Typography>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('hoteladmin@metrobusinesshotel.com', 'password')}
                  sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
                >
                  <Typography variant="body2" fontWeight="bold">🏢 Metropolitan Business Hotel</Typography>
                  <Typography variant="caption" color="textSecondary">
                    hoteladmin@metrobusinesshotel.com
                  </Typography>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('admin@maritimegrand.com', 'password')}
                  sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
                >
                  <Typography variant="body2" fontWeight="bold">🌊 The Maritime Grand Hotel</Typography>
                  <Typography variant="caption" color="textSecondary">
                    admin@maritimegrand.com
                  </Typography>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('admin@urbanbusinesshub.com', 'password')}
                  sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
                >
                  <Typography variant="body2" fontWeight="bold">🏙️ Urban Business Hub</Typography>
                  <Typography variant="caption" color="textSecondary">
                    admin@urbanbusinesshub.com
                  </Typography>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fillSampleUser('hoteladmin@globalhotel.co.uk', 'password')}
                  sx={{ textTransform: 'none', display: 'flex', flexDirection: 'column', py: 1.5 }}
                >
                  <Typography variant="body2" fontWeight="bold">🌍 Global International Hotel</Typography>
                  <Typography variant="caption" color="textSecondary">
                    hoteladmin@globalhotel.co.uk
                  </Typography>
                </Button>
              </Box>

              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  <strong>All Hotels Info:</strong><br/>
                  � Password: "password" for ALL users<br/>
                  👥 Each hotel has: hoteladmin, frontdesk, housekeeping, maintenance<br/>
                  🏨 13 hotels total with comprehensive room data<br/>
                  📋 See STANDARDIZED_LOGIN_CREDENTIALS.md for complete list
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Customer Credentials Row - Spans across all three columns */}
        <Card sx={{ width: '100%', maxWidth: 1400 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" component="h3" gutterBottom align="center" color="primary">
              👤 Customer Portal Access
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
              Regular customers can book hotels, manage reservations, and access their account
            </Typography>

            <Divider sx={{ my: 2 }}>
              <Chip label="Customer Login Credentials" size="small" />
            </Divider>

            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={() => fillSampleUser('customer@example.com', 'password')}
                sx={{ 
                  textTransform: 'none', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  py: 2,
                  minWidth: 280
                }}
              >
                <Typography variant="body2" fontWeight="bold">👤 Regular Customer</Typography>
                <Typography variant="caption" color="textSecondary">
                  customer@example.com
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Password: password
                </Typography>
                <Typography variant="caption" color="success.main" sx={{ mt: 0.5 }}>
                  ✅ John Customer - Working
                </Typography>
              </Button>

              <Button
                variant="outlined"
                onClick={() => fillSampleUser('sarah.guest@email.com', 'password')}
                sx={{ 
                  textTransform: 'none', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  py: 2,
                  minWidth: 280
                }}
              >
                <Typography variant="body2" fontWeight="bold">👩‍💼 Premium Customer</Typography>
                <Typography variant="caption" color="textSecondary">
                  sarah.guest@email.com
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Password: password
                </Typography>
                <Typography variant="caption" color="success.main" sx={{ mt: 0.5 }}>
                  ✅ Sarah Guest - Working
                </Typography>
              </Button>
            </Box>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" color="textSecondary" align="center" display="block">
                <strong>Customer Features:</strong><br/>
                🔍 Search and browse hotels  •  📅 Make reservations  •  💳 Secure payments  •  📱 Manage bookings  •  ⭐ Review hotels
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginPage;
