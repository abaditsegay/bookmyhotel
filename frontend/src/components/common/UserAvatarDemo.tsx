import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { UserAvatar } from './index';

/**
 * Demo component to showcase different UserAvatar configurations
 * This can be used for testing and documentation purposes
 */
export const UserAvatarDemo: React.FC = () => {
  const sampleUsers = [
    { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
    { firstName: 'Sarah', email: 'sarah@example.com' },
    { firstName: 'Michael', lastName: 'Chen', email: 'michael.chen@example.com' },
    { email: 'guest@example.com' },
    { firstName: 'Emma', lastName: 'Wilson', email: 'emma.wilson@example.com' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        User Avatar Component Demo
      </Typography>

      <Grid container spacing={3}>
        {/* Size Variations */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Size Variations
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <UserAvatar user={sampleUsers[0]} size="small" />
              <UserAvatar user={sampleUsers[0]} size="medium" />
              <UserAvatar user={sampleUsers[0]} size="large" />
            </Box>
            <Typography variant="caption">
              Small, Medium, Large
            </Typography>
          </Paper>
        </Grid>

        {/* Variant Styles */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Shape Variants
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <UserAvatar user={sampleUsers[1]} variant="circular" />
              <UserAvatar user={sampleUsers[1]} variant="rounded" />
              <UserAvatar user={sampleUsers[1]} variant="square" />
            </Box>
            <Typography variant="caption">
              Circular, Rounded, Square
            </Typography>
          </Paper>
        </Grid>

        {/* Online Status */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Online Status
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <UserAvatar user={sampleUsers[2]} showOnlineStatus={false} />
              <UserAvatar user={sampleUsers[2]} showOnlineStatus={true} />
            </Box>
            <Typography variant="caption">
              Offline, Online
            </Typography>
          </Paper>
        </Grid>

        {/* Different Users (Different Colors) */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Different Users (Auto-generated Colors)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              {sampleUsers.map((user, index) => (
                <Box key={index} sx={{ textAlign: 'center' }}>
                  <UserAvatar user={user} size="medium" />
                  <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                    {user.firstName || user.email?.split('@')[0] || 'Guest'}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>
              Each user gets a unique gradient color based on their initials
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserAvatarDemo;
