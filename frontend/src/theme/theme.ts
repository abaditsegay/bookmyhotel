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
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: designSystem.typography.h1,
    h2: designSystem.typography.h2,
    h3: designSystem.typography.h3,
    h4: designSystem.typography.h4,
    h5: designSystem.typography.h5,
    h6: designSystem.typography.h6,
    body1: designSystem.typography.body1,
    body2: designSystem.typography.body2,
    caption: designSystem.typography.caption,
    button: designSystem.typography.button
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
    // Button component customization
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: designSystem.borderRadius.md,
          transition: `all ${animations.duration.short}ms ${animations.easing.easeInOut}`
        },
        contained: {
          boxShadow: designSystem.shadows.sm,
          '&:hover': {
            boxShadow: designSystem.shadows.md
          }
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px'
          }
        }
      }
    },

    // Card component customization
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: designSystem.borderRadius.lg,
          border: `1px solid ${designSystem.colors.primary[50]}`,
          boxShadow: designSystem.shadows.card,
          transition: `all ${animations.duration.short}ms ${animations.easing.easeInOut}`,
          '&:hover': {
            boxShadow: designSystem.shadows.cardHover
          }
        }
      }
    },

    // TextField component customization
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: designSystem.borderRadius.md,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: designSystem.colors.primary.main
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: designSystem.colors.primary.main
            }
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: designSystem.colors.primary.main
          }
        }
      }
    },

    // FormControl component customization
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: designSystem.borderRadius.md,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: designSystem.colors.primary.main
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: designSystem.colors.primary.main
            }
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: designSystem.colors.primary.main
          }
        }
      }
    },

    // Dialog component customization
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: designSystem.borderRadius.lg,
          boxShadow: designSystem.shadows.dialog
        }
      }
    },

    // Chip component customization
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: designSystem.borderRadius.md,
          fontWeight: 500
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
