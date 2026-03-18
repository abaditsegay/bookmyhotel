import React from 'react';
import {
  Box,
  CircularProgress,
  LinearProgress,
  Typography,
  Skeleton,
  useTheme,
  keyframes,
} from '@mui/material';
import { designSystem } from '../../theme/designSystem';
import { COLORS, addAlpha } from '../../theme/themeColors';

// Pulse animation for enhanced loading
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

// Shimmer animation for skeleton loading
const shimmerAnimation = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

interface EnhancedLoadingProps {
  variant?: 'circular' | 'linear' | 'skeleton' | 'pulse' | 'dots';
  size?: 'small' | 'medium' | 'large';
  message?: string;
  overlay?: boolean;
  progress?: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  fullScreen?: boolean;
  skeletonLines?: number;
  skeletonHeight?: number;
  animated?: boolean;
}

const EnhancedLoading: React.FC<EnhancedLoadingProps> = ({
  variant = 'circular',
  size = 'medium',
  message,
  overlay = false,
  progress,
  color = 'primary',
  fullScreen = false,
  skeletonLines = 3,
  skeletonHeight = 20,
  animated = true,
}) => {
  const theme = useTheme();

  const getSizeValue = () => {
    switch (size) {
      case 'small': return 24;
      case 'large': return 60;
      default: return 40;
    }
  };

  const getContainerStyles = () => ({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: designSystem.spacing.md,
    ...(overlay && {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: addAlpha(COLORS.WHITE, 0.9),
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
    }),
    ...(fullScreen && {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.palette.background.default,
      zIndex: 9999,
    }),
    padding: designSystem.spacing.lg,
  });

  const renderLoadingVariant = () => {
    switch (variant) {
      case 'circular':
        return (
          <CircularProgress
            size={getSizeValue()}
            color={color}
            value={progress}
            variant={progress !== undefined ? 'determinate' : 'indeterminate'}
            sx={{
              ...(animated && {
                animation: `${pulseAnimation} 2s ease-in-out infinite`,
              }),
            }}
          />
        );

      case 'linear':
        return (
          <Box sx={{ width: '100%', maxWidth: 300 }}>
            <LinearProgress
              color={color}
              value={progress}
              variant={progress !== undefined ? 'determinate' : 'indeterminate'}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: theme.palette.grey[200],
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].dark})`,
                },
              }}
            />
            {progress !== undefined && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                {Math.round(progress)}%
              </Typography>
            )}
          </Box>
        );

      case 'skeleton':
        return (
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            {Array.from({ length: skeletonLines }).map((_, index) => (
              <Skeleton
                key={index}
                variant="rectangular"
                height={skeletonHeight}
                sx={{
                  mb: 1,
                  borderRadius: 1,
                  ...(animated && {
                    background: `linear-gradient(90deg, ${theme.palette.grey[300]} 25%, ${theme.palette.grey[200]} 50%, ${theme.palette.grey[300]} 75%)`,
                    backgroundSize: '1000px 100%',
                    animation: `${shimmerAnimation} 2s infinite linear`,
                  }),
                }}
              />
            ))}
          </Box>
        );

      case 'pulse':
        return (
          <Box
            sx={{
              width: getSizeValue(),
              height: getSizeValue(),
              borderRadius: '50%',
              backgroundColor: theme.palette[color].main,
              animation: `${pulseAnimation} 1.5s ease-in-out infinite`,
            }}
          />
        );

      case 'dots':
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {[0, 1, 2].map((index) => (
              <Box
                key={index}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: theme.palette[color].main,
                  animation: `${pulseAnimation} 1.4s ease-in-out infinite`,
                  animationDelay: `${index * 0.2}s`,
                }}
              />
            ))}
          </Box>
        );

      default:
        return <CircularProgress size={getSizeValue()} color={color} />;
    }
  };

  return (
    <Box sx={getContainerStyles()}>
      {renderLoadingVariant()}
      {message && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            textAlign: 'center',
            fontWeight: 500,
            ...(animated && {
              animation: `${pulseAnimation} 2s ease-in-out infinite`,
            }),
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default EnhancedLoading;