import React from 'react';
import { Box, CircularProgress, LinearProgress, Skeleton, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// Styled components for custom loading animations
const pulseAnimation = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
`;

const shimmerAnimation = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
`;

const StyledLoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '200px',
  padding: theme.spacing(3),
}));

const ShimmerBox = styled(Box)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.grey[300]} 25%, ${theme.palette.grey[200]} 50%, ${theme.palette.grey[300]} 75%)`,
  backgroundSize: '200px 100%',
  animation: `${shimmerAnimation} 1.5s infinite`,
  borderRadius: theme.shape.borderRadius,
}));

const PulsingBox = styled(Box)(() => ({
  animation: `${pulseAnimation} 1.5s ease-in-out infinite`,
}));

// Loading Component Props Interfaces
interface LoadingSpinnerProps {
  size?: number;
  color?: 'primary' | 'secondary' | 'inherit';
  message?: string;
  fullHeight?: boolean;
}

interface LoadingProgressProps {
  progress?: number;
  message?: string;
  variant?: 'determinate' | 'indeterminate';
}

interface SkeletonLoaderProps {
  type: 'text' | 'rectangular' | 'circular' | 'card' | 'table' | 'list';
  count?: number;
  height?: number | string;
  width?: number | string;
  animation?: 'pulse' | 'wave' | false;
}

interface LoadingOverlayProps {
  open: boolean;
  message?: string;
  backdrop?: boolean;
}

/**
 * Basic Loading Spinner Component
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  color = 'primary',
  message,
  fullHeight = false,
}) => {
  return (
    <StyledLoadingContainer
      sx={{
        minHeight: fullHeight ? '100vh' : '200px',
      }}
    >
      <CircularProgress size={size} color={color} />
      {message && (
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ mt: 2, textAlign: 'center' }}
        >
          {message}
        </Typography>
      )}
    </StyledLoadingContainer>
  );
};

/**
 * Loading Progress Bar Component
 */
export const LoadingProgress: React.FC<LoadingProgressProps> = ({
  progress,
  message,
  variant = 'indeterminate',
}) => {
  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {message && (
        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
          {message}
        </Typography>
      )}
      <LinearProgress
        variant={variant}
        value={progress}
        sx={{
          height: 8,
          borderRadius: 4,
        }}
      />
      {variant === 'determinate' && progress !== undefined && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="textSecondary">
              {`${Math.round(progress)}%`}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

/**
 * Skeleton Loader Component for different content types
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type,
  count = 1,
  height = 'auto',
  width = '100%',
  animation = 'wave',
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return (
          <Box>
            {Array.from({ length: count }).map((_, index) => (
              <Skeleton
                key={index}
                variant="text"
                width={width}
                height={height}
                animation={animation}
                sx={{ mb: 1 }}
              />
            ))}
          </Box>
        );

      case 'rectangular':
        return (
          <Box>
            {Array.from({ length: count }).map((_, index) => (
              <Skeleton
                key={index}
                variant="rectangular"
                width={width}
                height={height}
                animation={animation}
                sx={{ mb: 2 }}
              />
            ))}
          </Box>
        );

      case 'circular':
        return (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {Array.from({ length: count }).map((_, index) => (
              <Skeleton
                key={index}
                variant="circular"
                width={height}
                height={height}
                animation={animation}
              />
            ))}
          </Box>
        );

      case 'card':
        return (
          <Box>
            {Array.from({ length: count }).map((_, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Skeleton variant="rectangular" width="100%" height={200} animation={animation} />
                <Box sx={{ pt: 1 }}>
                  <Skeleton width="60%" animation={animation} />
                  <Skeleton width="80%" animation={animation} />
                  <Skeleton width="40%" animation={animation} />
                </Box>
              </Box>
            ))}
          </Box>
        );

      case 'table':
        return (
          <Box>
            {Array.from({ length: count }).map((_, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="circular" width={40} height={40} animation={animation} sx={{ mr: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="80%" animation={animation} />
                  <Skeleton width="60%" animation={animation} />
                </Box>
                <Skeleton width={80} animation={animation} />
              </Box>
            ))}
          </Box>
        );

      case 'list':
        return (
          <Box>
            {Array.from({ length: count }).map((_, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="circular" width={24} height={24} animation={animation} sx={{ mr: 2 }} />
                <Skeleton width="70%" animation={animation} />
              </Box>
            ))}
          </Box>
        );

      default:
        return <Skeleton variant="text" width={width} height={height} animation={animation} />;
    }
  };

  return <>{renderSkeleton()}</>;
};

/**
 * Loading Overlay Component
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  open,
  message = 'Loading...',
  backdrop = true,
}) => {
  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: backdrop ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <Box
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 2,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: 24,
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {message}
        </Typography>
      </Box>
    </Box>
  );
};

/**
 * Shimmer Loading Component for custom shapes
 */
export const ShimmerLoader: React.FC<{
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
}> = ({ width = '100%', height = 20, borderRadius = 4 }) => {
  return (
    <ShimmerBox
      sx={{
        width,
        height,
        borderRadius,
      }}
    />
  );
};

/**
 * Pulsing Loading Component
 */
export const PulsingLoader: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <PulsingBox>{children}</PulsingBox>;
};

/**
 * Button Loading State Component
 */
export const LoadingButton: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'inherit';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}> = ({
  loading,
  children,
  onClick,
  disabled = false,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  fullWidth = false,
}) => {
  const { Button } = require('@mui/material');
  
  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      onClick={onClick}
      disabled={disabled || loading}
      sx={{
        position: 'relative',
      }}
    >
      {loading && (
        <CircularProgress
          size={24}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-12px',
            marginLeft: '-12px',
          }}
        />
      )}
      <Box sx={{ opacity: loading ? 0 : 1 }}>{children}</Box>
    </Button>
  );
};

/**
 * Content Loading Wrapper - Shows skeleton while loading
 */
export const ContentLoader: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  skeletonType?: 'text' | 'rectangular' | 'circular' | 'card' | 'table' | 'list';
  skeletonCount?: number;
}> = ({ loading, children, skeletonType = 'text', skeletonCount = 3 }) => {
  if (loading) {
    return <SkeletonLoader type={skeletonType} count={skeletonCount} />;
  }

  return <>{children}</>;
};

// Export all components
const LoadingComponents = {
  LoadingSpinner,
  LoadingProgress,
  SkeletonLoader,
  LoadingOverlay,
  ShimmerLoader,
  PulsingLoader,
  LoadingButton,
  ContentLoader,
};

export default LoadingComponents;