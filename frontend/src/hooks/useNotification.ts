import { useSnackbar, VariantType } from 'notistack';

/**
 * Custom hook for displaying toast notifications throughout the application
 * Provides a consistent interface for success, error, warning, and info messages
 */
export const useNotification = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const showNotification = (message: string, variant: VariantType = 'default') => {
    enqueueSnackbar(message, {
      variant,
      autoHideDuration: variant === 'error' ? 6000 : 3000,
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'right',
      },
    });
  };

  return {
    success: (message: string) => showNotification(message, 'success'),
    error: (message: string) => showNotification(message, 'error'),
    warning: (message: string) => showNotification(message, 'warning'),
    info: (message: string) => showNotification(message, 'info'),
    notify: showNotification,
    close: closeSnackbar,
  };
};
