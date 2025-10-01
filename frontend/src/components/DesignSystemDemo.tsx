import React from 'react';
import { Box, Typography, Grid, Container } from '@mui/material';
import StandardCard from './common/StandardCard';
import StandardButton from './common/StandardButton';
import MuiCard from './ui/MuiCard';
import { Button } from './ui/MuiButton';
import { designSystem } from '../theme/designSystem';

const DesignSystemDemo: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Design System Showcase
      </Typography>
      
      {/* Card Variants */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Enhanced Card Components
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <StandardCard cardVariant="default">
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Default Card</Typography>
              <Typography variant="body2" color="text.secondary">
                Standard card with subtle shadow and hover effects
              </Typography>
            </Box>
          </StandardCard>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <StandardCard cardVariant="elevated">
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Elevated Card</Typography>
              <Typography variant="body2" color="text.secondary">
                Prominent shadow with lift animation on hover
              </Typography>
            </Box>
          </StandardCard>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <StandardCard cardVariant="gradient">
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Gradient Card</Typography>
              <Typography variant="body2" color="text.secondary">
                Subtle gradient background with smooth transitions
              </Typography>
            </Box>
          </StandardCard>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <StandardCard cardVariant="glass">
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Glass Card</Typography>
              <Typography variant="body2" color="text.secondary">
                Frosted glass effect with backdrop blur
              </Typography>
            </Box>
          </StandardCard>
        </Grid>
      </Grid>

      {/* Button Variants */}
      <Typography variant="h5" gutterBottom sx={{ mt: 6, mb: 2 }}>
        Enhanced Button Components
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StandardButton variant="contained" fullWidth>
            Standard Button
          </StandardButton>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StandardButton variant="contained" gradient fullWidth>
            Gradient Button
          </StandardButton>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StandardButton variant="contained" elevated fullWidth>
            Elevated Button
          </StandardButton>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StandardButton variant="outlined" fullWidth>
            Outlined Button
          </StandardButton>
        </Grid>
      </Grid>

      {/* Modern UI Components */}
      <Typography variant="h5" gutterBottom sx={{ mt: 6, mb: 2 }}>
        Modern UI Components
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <MuiCard sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Modern Card Component</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Built with our new design system, featuring consistent spacing, shadows, and interactions.
            </Typography>
            <Button variant="contained" size="small">
              Modern Button
            </Button>
          </MuiCard>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <MuiCard sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Professional Styling</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enhanced visual hierarchy, consistent spacing, and smooth animations create a professional feel.
            </Typography>
            <Button variant="outlined" size="small">
              Outline Button
            </Button>
          </MuiCard>
        </Grid>
      </Grid>

      {/* Design Tokens */}
      <Typography variant="h5" gutterBottom sx={{ mt: 6, mb: 2 }}>
        Design System Tokens
      </Typography>
      <StandardCard cardVariant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Spacing Scale</Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          {Object.entries(designSystem.spacing).map(([key, value]) => (
            <Box
              key={key}
              sx={{
                width: `${value}px`,
                height: `${value}px`,
                backgroundColor: 'primary.main',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '10px',
                fontWeight: 'bold',
                minWidth: '32px',
                minHeight: '32px',
              }}
            >
              {key}
            </Box>
          ))}
        </Box>
        
        <Typography variant="h6" gutterBottom>Shadow Scale</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {Object.entries(designSystem.shadows).slice(0, 6).map(([key, value]) => (
            <Box
              key={key}
              sx={{
                width: 80,
                height: 60,
                backgroundColor: 'background.paper',
                borderRadius: 1,
                boxShadow: value,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
              }}
            >
              {key}
            </Box>
          ))}
        </Box>
      </StandardCard>
    </Container>
  );
};

export default DesignSystemDemo;