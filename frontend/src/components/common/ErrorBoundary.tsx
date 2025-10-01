import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Container, Typography, Button, Card, CardContent } from '@mui/material';
import { 
  BugReport as BugIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  ContactSupport as SupportIcon
} from '@mui/icons-material';
import StandardError from './StandardError';
import { designSystem } from '../../theme/designSystem';

interface ErrorBoundaryProps {
  /**
   * Child components to render
   */
  children: ReactNode;
  
  /**
   * Fallback component to render when error occurs
   */
  fallback?: React.ComponentType<ErrorFallbackProps>;
  
  /**
   * Callback function called when error occurs
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  
  /**
   * Whether to show detailed error information (development mode)
   */
  showDetails?: boolean;
  
  /**
   * Custom error message to display
   */
  errorMessage?: string;
  
  /**
   * Whether to show navigation buttons
   */
  showNavigation?: boolean;
  
  /**
   * Boundary level - affects error display severity
   */
  level?: 'page' | 'component' | 'critical';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  resetError: () => void;
  level: 'page' | 'component' | 'critical';
  showDetails: boolean;
}

/**
 * Default error fallback component using our StandardError
 */
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  resetError,
  level,
  showDetails
}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const handleReportError = () => {
    // In a real app, this would send error to logging service
    console.error('Error reported:', { error, errorInfo });
    
    // Could integrate with services like Sentry, LogRocket, etc.
    // Example: Sentry.captureException(error);
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const getErrorTitle = () => {
    switch (level) {
      case 'critical':
        return 'Critical Application Error';
      case 'page':
        return 'Page Error';
      case 'component':
        return 'Component Error';
      default:
        return 'Something went wrong';
    }
  };

  const getErrorMessage = () => {
    switch (level) {
      case 'critical':
        return 'A critical error has occurred that prevents the application from functioning properly.';
      case 'page':
        return 'This page encountered an error and cannot be displayed properly.';
      case 'component':
        return 'A component on this page encountered an error.';
      default:
        return 'An unexpected error occurred. Please try refreshing the page.';
    }
  };

  const getSeverity = () => {
    switch (level) {
      case 'critical':
        return 'error' as const;
      case 'page':
        return 'error' as const;
      case 'component':
        return 'warning' as const;
      default:
        return 'error' as const;
    }
  };

  if (level === 'component') {
    // For component-level errors, show a compact error display
    return (
      <StandardError
        error={true}
        title="Component Error"
        message="This component encountered an error and cannot be displayed."
        severity="warning"
        showRetry={true}
        onRetry={resetError}
        retryText="Try Again"
      />
    );
  }

  // For page-level and critical errors, show full error page
  return (
    <Container maxWidth="md" sx={{ 
      mt: 4, 
      mb: 4,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '50vh',
      justifyContent: 'center'
    }}>
      <Box sx={{ 
        textAlign: 'center',
        mb: 4,
        opacity: 0.7
      }}>
        <BugIcon sx={{ fontSize: 80, color: 'error.main' }} />
      </Box>

      <StandardError
        error={true}
        title={getErrorTitle()}
        message={getErrorMessage()}
        severity={getSeverity()}
        showRetry={false}
      />

      {/* Action Buttons */}
      <Box sx={{ 
        mt: 4, 
        display: 'flex', 
        gap: 2, 
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={resetError}
          sx={{ 
            minWidth: 120,
            height: '44px'
          }}
        >
          Try Again
        </Button>

        {(level === 'page' || level === 'critical') && (
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={handleGoHome}
            sx={{ 
              minWidth: 120,
              height: '44px'
            }}
          >
            Go Home
          </Button>
        )}

        <Button
          variant="text"
          startIcon={<SupportIcon />}
          onClick={handleReportError}
          sx={{ 
            minWidth: 120,
            height: '44px'
          }}
        >
          Report Issue
        </Button>
      </Box>

      {/* Development Details */}
      {(isDevelopment || showDetails) && error && (
        <Card sx={{ 
          mt: 4, 
          width: '100%', 
          maxWidth: 800,
          backgroundColor: 'grey.50',
          border: '1px solid',
          borderColor: 'grey.300'
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="error">
              Error Details (Development Mode)
            </Typography>
            
            <Typography variant="body2" sx={{ 
              mb: 2, 
              fontFamily: 'monospace',
              backgroundColor: 'grey.100',
              p: 2,
              borderRadius: 1,
              wordBreak: 'break-all'
            }}>
              <strong>Error:</strong> {error.message}
            </Typography>

            {error.stack && (
              <Typography variant="body2" sx={{ 
                fontFamily: 'monospace',
                backgroundColor: 'grey.100',
                p: 2,
                borderRadius: 1,
                fontSize: '0.75rem',
                lineHeight: 1.4,
                maxHeight: 200,
                overflow: 'auto'
              }}>
                <strong>Stack Trace:</strong><br />
                {error.stack}
              </Typography>
            )}

            {errorInfo?.componentStack && (
              <Typography variant="body2" sx={{ 
                mt: 2,
                fontFamily: 'monospace',
                backgroundColor: 'grey.100',
                p: 2,
                borderRadius: 1,
                fontSize: '0.75rem',
                lineHeight: 1.4,
                maxHeight: 200,
                overflow: 'auto'
              }}>
                <strong>Component Stack:</strong><br />
                {errorInfo.componentStack}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

/**
 * ErrorBoundary component to catch and handle React errors gracefully
 * 
 * @example
 * ```tsx
 * // Wrap entire app
 * <ErrorBoundary level="critical">
 *   <App />
 * </ErrorBoundary>
 * 
 * // Wrap specific page
 * <ErrorBoundary level="page">
 *   <HotelSearchPage />
 * </ErrorBoundary>
 * 
 * // Wrap individual component
 * <ErrorBoundary level="component">
 *   <ComplexComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state to trigger error UI
    return { 
      hasError: true, 
      error 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error info
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    }
  }

  resetError = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
          level={this.props.level || 'page'}
          showDetails={this.props.showDetails || false}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;