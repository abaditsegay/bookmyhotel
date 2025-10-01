import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  useTheme,
  Divider,
} from '@mui/material';
import {
  EnhancedLoading,
  EnhancedTextField,
  useNotification,
  InteractiveCard,
  AnimatedCounter,
  AnimatedProgressBar,
  validationRules,
} from '../components/common';
import StandardCard from '../components/common/StandardCard';
import StandardButton from '../components/common/StandardButton';

const Phase2Demo: React.FC = () => {
  const theme = useTheme();
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [progress, setProgress] = useState(0);
  const [counter, setCounter] = useState(0);

  const handleNotificationDemo = (type: 'success' | 'error' | 'warning' | 'info') => {
    const messages = {
      success: { title: 'Success!', message: 'Your action was completed successfully.' },
      error: { title: 'Error', message: 'Something went wrong. Please try again.' },
      warning: { title: 'Warning', message: 'Please review your input before proceeding.' },
      info: { title: 'Information', message: 'Here\'s some helpful information for you.' },
    };

    showNotification({
      type,
      title: messages[type].title,
      message: messages[type].message,
      action: {
        label: 'View Details',
        onClick: () => alert('Action clicked!'),
      },
    });
  };

  const incrementProgress = () => {
    setProgress(prev => Math.min(prev + 20, 100));
  };

  const incrementCounter = () => {
    setCounter(prev => prev + 100);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)'
          : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <StandardCard cardVariant="elevated" sx={{ mb: 4 }}>
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
              Phase 2: Enhanced UX & Interactions
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Micro-interactions, loading states, and user feedback systems
            </Typography>
          </Box>
        </StandardCard>

        <Grid container spacing={4}>
          {/* Enhanced Loading States */}
          <Grid item xs={12} md={6}>
            <StandardCard cardVariant="outlined" sx={{ height: '100%' }}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}>
                  Enhanced Loading States
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Circular with Animation
                  </Typography>
                  <EnhancedLoading
                    variant="circular"
                    size="medium"
                    message="Processing your request..."
                    animated={true}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Progress Bar
                  </Typography>
                  <EnhancedLoading
                    variant="linear"
                    progress={progress}
                    message={`${progress}% complete`}
                  />
                  <StandardButton
                    variant="outlined"
                    onClick={incrementProgress}
                    sx={{ mt: 1 }}
                    disabled={progress >= 100}
                  >
                    Increment Progress
                  </StandardButton>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Animated Dots
                  </Typography>
                  <EnhancedLoading
                    variant="dots"
                    color="secondary"
                    message="Loading content..."
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Skeleton Loading
                  </Typography>
                  <EnhancedLoading
                    variant="skeleton"
                    skeletonLines={4}
                    skeletonHeight={20}
                    animated={true}
                  />
                </Box>
              </Box>
            </StandardCard>
          </Grid>

          {/* Interactive Cards */}
          <Grid item xs={12} md={6}>
            <StandardCard cardVariant="outlined" sx={{ height: '100%' }}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}>
                  Interactive Cards
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <InteractiveCard
                      variant="hover-lift"
                      onClick={() => showNotification({ type: 'info', message: 'Hover-lift card clicked!' })}
                      sx={{ p: 2, textAlign: 'center', height: 100 }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Hover Lift
                      </Typography>
                    </InteractiveCard>
                  </Grid>

                  <Grid item xs={6}>
                    <InteractiveCard
                      variant="hover-glow"
                      onClick={() => showNotification({ type: 'success', message: 'Glow card clicked!' })}
                      sx={{ p: 2, textAlign: 'center', height: 100 }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Hover Glow
                      </Typography>
                    </InteractiveCard>
                  </Grid>

                  <Grid item xs={6}>
                    <InteractiveCard
                      variant="hover-scale"
                      onClick={() => showNotification({ type: 'warning', message: 'Scale card clicked!' })}
                      sx={{ p: 2, textAlign: 'center', height: 100 }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Hover Scale
                      </Typography>
                    </InteractiveCard>
                  </Grid>

                  <Grid item xs={6}>
                    <InteractiveCard
                      variant="float"
                      sx={{ p: 2, textAlign: 'center', height: 100 }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Float Animation
                      </Typography>
                    </InteractiveCard>
                  </Grid>
                </Grid>
              </Box>
            </StandardCard>
          </Grid>

          {/* Enhanced Form Fields */}
          <Grid item xs={12} md={6}>
            <StandardCard cardVariant="gradient" sx={{ height: '100%' }}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'text.primary' }}>
                  Enhanced Form Fields
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <EnhancedTextField
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
                    required
                    validationRules={[validationRules.email]}
                    realTimeValidation
                    placeholder="Enter your email"
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <EnhancedTextField
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
                    required
                    validationRules={[validationRules.strongPassword]}
                    helperText="Must include uppercase, lowercase, number, and special character"
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <EnhancedTextField
                    label="Full Name"
                    value={formData.name}
                    onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
                    required
                    maxLength={50}
                    showCharacterCount
                    validationRules={[
                      validationRules.minLength(2),
                      validationRules.noSpecialChars,
                    ]}
                  />
                </Box>
              </Box>
            </StandardCard>
          </Grid>

          {/* Notifications & Counters */}
          <Grid item xs={12} md={6}>
            <StandardCard cardVariant="outlined" sx={{ height: '100%' }}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}>
                  Notifications & Animations
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Notification System
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <StandardButton
                        variant="contained"
                        color="success"
                        fullWidth
                        onClick={() => handleNotificationDemo('success')}
                      >
                        Success
                      </StandardButton>
                    </Grid>
                    <Grid item xs={6}>
                      <StandardButton
                        variant="contained"
                        color="error"
                        fullWidth
                        onClick={() => handleNotificationDemo('error')}
                      >
                        Error
                      </StandardButton>
                    </Grid>
                    <Grid item xs={6}>
                      <StandardButton
                        variant="contained"
                        color="warning"
                        fullWidth
                        onClick={() => handleNotificationDemo('warning')}
                      >
                        Warning
                      </StandardButton>
                    </Grid>
                    <Grid item xs={6}>
                      <StandardButton
                        variant="contained"
                        color="info"
                        fullWidth
                        onClick={() => handleNotificationDemo('info')}
                      >
                        Info
                      </StandardButton>
                    </Grid>
                  </Grid>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Animated Counter
                  </Typography>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      <AnimatedCounter value={counter} prefix="$" suffix="" decimals={0} />
                    </Typography>
                  </Box>
                  <StandardButton
                    variant="outlined"
                    fullWidth
                    onClick={incrementCounter}
                  >
                    Add $100
                  </StandardButton>
                </Box>

                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Animated Progress Bar
                  </Typography>
                  <AnimatedProgressBar
                    value={progress}
                    color="primary"
                    height={12}
                    showLabel
                    animated
                  />
                </Box>
              </Box>
            </StandardCard>
          </Grid>
        </Grid>

        {/* Implementation Summary */}
        <StandardCard cardVariant="elevated" sx={{ mt: 4 }}>
          <Box sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}>
              Phase 2 Implementation Summary
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'success.main' }}>
                    ✅ Enhanced Loading States
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Multiple loading variants (circular, linear, skeleton, dots, pulse)<br/>
                    • Smooth animations and transitions<br/>
                    • Progress indicators with percentage<br/>
                    • Overlay and full-screen options
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'success.main' }}>
                    ✅ Micro-Interactions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Interactive cards with hover effects<br/>
                    • Ripple animations on click<br/>
                    • Smooth transitions and transforms<br/>
                    • Animated counters and progress bars
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'success.main' }}>
                    ✅ User Feedback Systems
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Advanced notification system<br/>
                    • Real-time form validation<br/>
                    • Enhanced text fields with icons<br/>
                    • Character count and helper text
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </StandardCard>
      </Container>
    </Box>
  );
};

export default Phase2Demo;