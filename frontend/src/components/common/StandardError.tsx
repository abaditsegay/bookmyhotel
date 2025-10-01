import React from 'react';
import { Alert, AlertTitle, Box, Button, Typography, Fade } from '@mui/material';
import { 
  Error as ErrorIcon, 
  Warning as WarningIcon, 
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Refresh as RefreshIcon 
} from '@mui/icons-material';
import { designSystem } from '../../theme/designSystem';

interface StandardErrorProps {
  /**
   * Error state - whether to show the error
   */
  error: boolean;
  
  /**
   * Error message to display
   */
  message?: string;
  
  /**
   * Error title (optional)
   */
  title?: string;
  
  /**
   * Severity level of the error
   */
  severity?: 'error' | 'warning' | 'info' | 'success';
  
  /**
   * Whether to show retry button
   */
  showRetry?: boolean;
  
  /**
   * Retry function to call when retry button is clicked
   */
  onRetry?: () => void;
  
  /**
   * Custom retry button text
   */
  retryText?: string;
  
  /**
   * Children to show when no error
   */
  children?: React.ReactNode;
  
  /**
   * Whether to show as full-width alert or inline
   */
  fullWidth?: boolean;
}

/**
 * StandardError - A themed error display component with consistent styling and behavior
 * 
 * @description
 * Provides consistent error handling display across the application with smooth transitions.
 * Supports different severity levels and optional retry functionality.
 * 
 * @example
 * ```tsx
 * // Basic error display
 * <StandardError 
 *   error={hasError} 
 *   message="Failed to load hotels. Please try again." 
 * />
 * 
 * // Error with retry
 * <StandardError
 *   error={hasError}
 *   title="Connection Error"
 *   message="Unable to connect to server"
 *   showRetry
 *   onRetry={() => refetch()}
 * />
 * 
 * // Error boundary with children
 * <StandardError error={hasError} message="Something went wrong">
 *   <YourContent />
 * </StandardError>
 * ```
 */
const StandardError: React.FC<StandardErrorProps> = ({
  error,
  message = 'An unexpected error occurred. Please try again.',
  title,
  severity = 'error',
  showRetry = false,
  onRetry,
  retryText = 'Try Again',
  children,
  fullWidth = true,
}) => {
  const getIcon = () => {
    switch (severity) {
      case 'warning':
        return <WarningIcon />;
      case 'info':
        return <InfoIcon />;
      case 'success':
        return <SuccessIcon />;
      default:
        return <ErrorIcon />;
    }
  };

  const ErrorDisplay = () => (
    <Box
      sx={{
        width: fullWidth ? '100%' : 'auto',
        mb: designSystem.spacing.md, // 16px
      }}
    >
      <Alert
        severity={severity}
        icon={getIcon()}
        sx={{
          borderRadius: `${designSystem.spacing.xs}px`, // 4px consistent border radius
          '& .MuiAlert-icon': {
            fontSize: '24px',
          },
        }}
        action={
          showRetry && onRetry ? (
            <Button
              color="inherit"
              size="small"
              onClick={onRetry}
              startIcon={<RefreshIcon />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: `${designSystem.spacing.xs}px`,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {retryText}
            </Button>
          ) : undefined
        }
      >
        {title && <AlertTitle sx={{ fontWeight: 600 }}>{title}</AlertTitle>}
        <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
          {message}
        </Typography>
      </Alert>
    </Box>
  );

  if (error) {
    return (
      <Fade in={error} timeout={300}>
        <Box>
          <ErrorDisplay />
        </Box>
      </Fade>
    );
  }

  return <>{children}</>;
};

export default StandardError;