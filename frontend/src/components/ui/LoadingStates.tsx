// Loading States Component
// Consistent loading indicators and skeletons

import React from 'react';
import { 
  Box, 
  CircularProgress, 
  LinearProgress, 
  Skeleton,
  Typography,
  Card,
  CardContent
} from '@mui/material';
import { designSystem } from '../../theme/designSystem';

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
  color?: 'primary' | 'secondary' | 'inherit';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  message,
  color = 'primary'
}) => (
  <Box 
    sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      gap: 2,
      py: 4
    }}
  >
    <CircularProgress size={size} color={color} />
    {message && (
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    )}
  </Box>
);

interface LoadingBarProps {
  progress?: number;
  message?: string;
  color?: 'primary' | 'secondary' | 'inherit';
}

export const LoadingBar: React.FC<LoadingBarProps> = ({
  progress,
  message,
  color = 'primary'
}) => (
  <Box sx={{ width: '100%' }}>
    <LinearProgress 
      variant={progress !== undefined ? 'determinate' : 'indeterminate'}
      value={progress}
      color={color}
      sx={{
        borderRadius: designSystem.borderRadius.sm,
        height: 6,
      }}
    />
    {message && (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {message}
      </Typography>
    )}
  </Box>
);

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4
}) => (
  <Box>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <Box 
        key={rowIndex}
        sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 2,
          alignItems: 'center'
        }}
      >
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton 
            key={colIndex}
            variant="text" 
            width={colIndex === 0 ? '25%' : '20%'}
            height={40}
          />
        ))}
      </Box>
    ))}
  </Box>
);

interface CardSkeletonProps {
  count?: number;
  height?: number;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  count = 3,
  height = 200
}) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    {Array.from({ length: count }).map((_, index) => (
      <Card key={index} sx={{ height }}>
        <CardContent>
          <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={80} sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton variant="rectangular" width={80} height={32} />
            <Skeleton variant="rectangular" width={80} height={32} />
          </Box>
        </CardContent>
      </Card>
    ))}
  </Box>
);

interface FormSkeletonProps {
  fields?: number;
}

export const FormSkeleton: React.FC<FormSkeletonProps> = ({
  fields = 4
}) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    {Array.from({ length: fields }).map((_, index) => (
      <Box key={index}>
        <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" width="100%" height={56} />
      </Box>
    ))}
    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
      <Skeleton variant="rectangular" width={100} height={44} />
      <Skeleton variant="rectangular" width={100} height={44} />
    </Box>
  </Box>
);

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon
}) => (
  <Box 
    sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      textAlign: 'center',
      py: 6,
      px: 3
    }}
  >
    {icon && (
      <Box sx={{ mb: 3, opacity: 0.6 }}>
        {icon}
      </Box>
    )}
    <Typography variant="h6" color="text.primary" gutterBottom>
      {title}
    </Typography>
    {description && (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
        {description}
      </Typography>
    )}
    {action}
  </Box>
);