import React from 'react';
import { Box, CircularProgress, Typography, Fade } from '@mui/material';
import { themeConstants } from '../../theme/theme';

interface StandardLoadingProps {
  /**
   * Loading state - whether to show the loading spinner
   */
  loading: boolean;
  
  /**
   * Size of the loading spinner
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Loading message to display
   */
  message?: string;
  
  /**
   * Whether to show loading overlay (full container coverage)
   */
  overlay?: boolean;
  
  /**
   * Children to show when not loading
   */
  children?: React.ReactNode;
  
  /**
   * Minimum height for the loading container
   */
  minHeight?: string | number;
}

/**
 * StandardLoading - A themed loading component with consistent styling and behavior
 * 
 * @description
 * Provides consistent loading states across the application with smooth transitions.
 * Can be used as an overlay or inline loading indicator.
 * 
 * @example
 * ```tsx
 * // Basic loading spinner
 * <StandardLoading loading={isLoading} message="Loading hotels..." />
 * 
 * // Loading overlay
 * <StandardLoading loading={isLoading} overlay>
 *   <YourContent />
 * </StandardLoading>
 * 
 * // Inline loading with children
 * <StandardLoading loading={isLoading} message="Saving...">
 *   <StandardButton>Submit</StandardButton>
 * </StandardLoading>
 * ```
 */
const StandardLoading: React.FC<StandardLoadingProps> = ({
  loading,
  size = 'medium',
  message,
  overlay = false,
  children,
  minHeight,
}) => {
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 56,
  };

  const LoadingSpinner = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: themeConstants.spacing.md, // 16px
        minHeight: minHeight || '100px',
        ...(overlay && {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 1000,
          backdropFilter: 'blur(2px)',
        }),
      }}
    >
      <CircularProgress
        size={sizeMap[size]}
        thickness={4}
        sx={{
          color: 'primary.main',
          // Add subtle pulsing animation
          animation: 'pulse 2s ease-in-out infinite',
          '@keyframes pulse': {
            '0%': { opacity: 1 },
            '50%': { opacity: 0.6 },
            '100%': { opacity: 1 },
          },
        }}
      />
      {message && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            textAlign: 'center',
            fontSize: size === 'small' ? '12px' : '14px',
            fontWeight: 500,
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  if (overlay && children) {
    return (
      <Box sx={{ position: 'relative', minHeight }}>
        {children}
        <Fade in={loading} timeout={200}>
          <Box>
            <LoadingSpinner />
          </Box>
        </Fade>
      </Box>
    );
  }

  if (loading) {
    return (
      <Fade in={loading} timeout={200}>
        <Box>
          <LoadingSpinner />
        </Box>
      </Fade>
    );
  }

  return <>{children}</>;
};

export default StandardLoading;