// Enhanced Material-UI Theme Configuration
// Integrates our design system with Material-UI components

import { createTheme, ThemeOptions } from '@mui/material/styles';
import { designSystem, animations } from './designSystem';

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: designSystem.colors.primary,
    secondary: designSystem.colors.secondary,
    success: designSystem.colors.success,
    warning: designSystem.colors.warning,
    error: designSystem.colors.error,
    info: designSystem.colors.info,
    text: designSystem.colors.text,
    background: designSystem.colors.background,
    divider: designSystem.colors.divider
  },
  
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: {
      ...designSystem.typography.h1,
      fontSize: '3rem',
      fontWeight: 700,
      letterSpacing: '-0.02em'
    },
    h2: {
      ...designSystem.typography.h2,
      fontSize: '2.25rem',
      fontWeight: 700
    },
    h3: {
      ...designSystem.typography.h3,
      fontWeight: 600
    },
    h4: {
      ...designSystem.typography.h4,
      fontWeight: 600
    },
    h5: designSystem.typography.h5,
    h6: designSystem.typography.h6,
    body1: designSystem.typography.body1,
    body2: designSystem.typography.body2,
    caption: designSystem.typography.caption,
    button: {
      ...designSystem.typography.button,
      fontWeight: 600,
      letterSpacing: '0.02em'
    }
  },

  spacing: designSystem.spacing.sm, // Base spacing unit (8px)

  shape: {
    borderRadius: designSystem.borderRadius.md
  },

  shadows: [
    'none',
    designSystem.shadows.xs,
    designSystem.shadows.sm,
    designSystem.shadows.sm,
    designSystem.shadows.md,
    designSystem.shadows.md,
    designSystem.shadows.lg,
    designSystem.shadows.lg,
    designSystem.shadows.xl,
    designSystem.shadows.xl,
    designSystem.shadows.xl,
    designSystem.shadows.xl,
    designSystem.shadows.xl,
    designSystem.shadows.xl,
    designSystem.shadows.xl,
    designSystem.shadows.xl,
    designSystem.shadows.xl,
    designSystem.shadows.xl,
    designSystem.shadows.xl,
    designSystem.shadows.xl,
    designSystem.shadows.xl,
    designSystem.shadows.xl,
    designSystem.shadows.xl,
    designSystem.shadows.xl,
    designSystem.shadows.xl
  ],

  components: {
    // Button component customization - Premium
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: designSystem.borderRadius.md,
          padding: '10px 24px',
          transition: `all ${animations.duration.standard}ms ${animations.easing.easeInOut}`
        },
        contained: {
          background: 'linear-gradient(135deg, #1a365d 0%, #0f2744 100%)',
          boxShadow: '0 4px 15px rgba(26, 54, 93, 0.25)',
          '&:hover': {
            background: 'linear-gradient(135deg, #2a4a6d 0%, #1a365d 100%)',
            boxShadow: '0 6px 20px rgba(26, 54, 93, 0.35)',
            transform: 'translateY(-2px)'
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: '0 2px 8px rgba(26, 54, 93, 0.25)'
          },
          '&.Mui-disabled': {
            background: '#f5f5f5',
            color: '#999',
            boxShadow: 'none',
            border: '2px solid #E8B86D',
          }
        },
        outlined: {
          borderWidth: '2px',
          borderColor: designSystem.colors.primary.main,
          '&:hover': {
            borderWidth: '2px',
            backgroundColor: 'rgba(26, 54, 93, 0.04)',
            transform: 'translateY(-1px)'
          }
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(26, 54, 93, 0.04)'
          }
        }
      }
    },

    // Card component customization - Premium
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: designSystem.borderRadius.xl,
          border: 'none',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-4px)'
          }
        }
      }
    },

    // TextField component customization - Premium
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: designSystem.borderRadius.md,
            backgroundColor: '#FFFFFF',
            transition: `all ${animations.duration.standard}ms ${animations.easing.easeInOut}`,
            '& fieldset': {
              borderColor: '#E0E0E0',
              borderWidth: '1.5px'
            },
            '&:hover fieldset': {
              borderColor: designSystem.colors.primary.light,
              borderWidth: '1.5px'
            },
            '&.Mui-focused fieldset': {
              borderColor: designSystem.colors.primary.main,
              borderWidth: '2px',
              boxShadow: '0 0 0 3px rgba(26, 54, 93, 0.1)'
            }
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: designSystem.colors.primary.main
          }
        }
      }
    },

    // FormControl component customization - Premium
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: designSystem.borderRadius.md,
            backgroundColor: '#FFFFFF',
            transition: `all ${animations.duration.standard}ms ${animations.easing.easeInOut}`,
            '& fieldset': {
              borderColor: '#E0E0E0',
              borderWidth: '1.5px'
            },
            '&:hover fieldset': {
              borderColor: designSystem.colors.primary.light,
              borderWidth: '1.5px'
            },
            '&.Mui-focused fieldset': {
              borderColor: designSystem.colors.primary.main,
              borderWidth: '2px',
              boxShadow: '0 0 0 3px rgba(26, 54, 93, 0.1)'
            }
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: designSystem.colors.primary.main
          }
        }
      }
    },

    // Dialog component customization - Premium
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: designSystem.borderRadius.xl,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
          backgroundColor: '#FFFFFF'
        }
      }
    },

    // Chip component customization - Premium
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: designSystem.borderRadius.md,
          fontWeight: 600,
          transition: 'all 0.2s ease'
        },
        filled: {
          '&:hover': {
            transform: 'scale(1.02)'
          }
        }
      }
    },

    // Divider component customization
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: designSystem.colors.primary[50]
        }
      }
    }
  }
};

export const theme = createTheme(themeOptions);

// Extend theme with custom properties for backward compatibility
declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      designSystem: typeof designSystem;
    };
  }
  interface ThemeOptions {
    custom?: {
      designSystem?: typeof designSystem;
    };
  }
}

// Create the extended theme with design system access
const extendedTheme = createTheme(theme, {
  custom: {
    designSystem,
  },
});

export default extendedTheme;
