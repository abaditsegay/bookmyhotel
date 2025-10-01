import React, { useState, createContext, useContext } from 'react';
import {
  Box,
  IconButton,
  Typography,
  useTheme,
  keyframes,
  Grow,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import { designSystem } from '../../theme/designSystem';

// Animation for notification entrance
const slideInRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

export interface NotificationOptions {
  id?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

interface NotificationContextType {
  showNotification: (options: NotificationOptions) => void;
  hideNotification: (id?: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationState extends NotificationOptions {
  id: string;
  visible: boolean;
}

const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationState[]>([]);
  const theme = useTheme();

  const showNotification = (options: NotificationOptions) => {
    const id = options.id || `notification-${Date.now()}-${Math.random()}`;
    const notification: NotificationState = {
      ...options,
      id,
      visible: true,
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-hide if not persistent
    if (!options.persistent) {
      setTimeout(() => {
        hideNotification(id);
      }, options.duration || 5000);
    }
  };

  const hideNotification = (id?: string) => {
    if (id) {
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, visible: false }
            : notification
        )
      );
      // Remove after animation
      setTimeout(() => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
      }, 300);
    } else {
      // Hide all
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, visible: false }))
      );
      setTimeout(() => {
        setNotifications([]);
      }, 300);
    }
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircleIcon />;
      case 'error': return <ErrorIcon />;
      case 'warning': return <WarningIcon />;
      case 'info': return <InfoIcon />;
      default: return <InfoIcon />;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'success':
        return {
          bg: theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.05)',
          border: theme.palette.success.main,
          icon: theme.palette.success.main,
        };
      case 'error':
        return {
          bg: theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.05)',
          border: theme.palette.error.main,
          icon: theme.palette.error.main,
        };
      case 'warning':
        return {
          bg: theme.palette.mode === 'dark' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255, 152, 0, 0.05)',
          border: theme.palette.warning.main,
          icon: theme.palette.warning.main,
        };
      case 'info':
        return {
          bg: theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.1)' : 'rgba(33, 150, 243, 0.05)',
          border: theme.palette.info.main,
          icon: theme.palette.info.main,
        };
      default:
        return {
          bg: theme.palette.background.paper,
          border: theme.palette.divider,
          icon: theme.palette.text.secondary,
        };
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification, clearAll }}>
      {children}
      
      {/* Notification Container */}
      <Box
        sx={{
          position: 'fixed',
          top: designSystem.spacing.xl,
          right: designSystem.spacing.lg,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: designSystem.spacing.sm,
          maxWidth: 400,
          width: '100%',
          '@media (max-width: 600px)': {
            left: designSystem.spacing.md,
            right: designSystem.spacing.md,
            maxWidth: 'none',
          },
        }}
      >
        {notifications.map((notification) => {
          const colors = getColors(notification.type);
          
          return (
            <Grow
              key={notification.id}
              in={notification.visible}
              timeout={300}
            >
              <Box
                sx={{
                  backgroundColor: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: designSystem.borderRadius.lg,
                  padding: designSystem.spacing.md,
                  boxShadow: designSystem.shadows.lg,
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: designSystem.spacing.sm,
                  animation: `${slideInRight} 0.3s ease-out`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: designSystem.shadows.xl,
                  },
                }}
              >
                {/* Icon */}
                <Box
                  sx={{
                    color: colors.icon,
                    mt: 0.5,
                    '& svg': {
                      fontSize: 20,
                    },
                  }}
                >
                  {getIcon(notification.type)}
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {notification.title && (
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                        mb: 0.5,
                      }}
                    >
                      {notification.title}
                    </Typography>
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      lineHeight: 1.4,
                    }}
                  >
                    {notification.message}
                  </Typography>
                  
                  {/* Action Button */}
                  {notification.action && (
                    <Box sx={{ mt: 1 }}>
                      <Typography
                        variant="body2"
                        component="button"
                        onClick={notification.action.onClick}
                        sx={{
                          color: colors.icon,
                          textDecoration: 'underline',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 600,
                          '&:hover': {
                            opacity: 0.8,
                          },
                        }}
                      >
                        {notification.action.label}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Close Button */}
                <IconButton
                  size="small"
                  onClick={() => {
                    hideNotification(notification.id);
                    notification.onClose?.();
                  }}
                  sx={{
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Grow>
          );
        })}
      </Box>
    </NotificationContext.Provider>
  );
};

export { NotificationProvider };