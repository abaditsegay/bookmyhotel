// Enhanced Material-UI Theme Configuration
// Integrates our design system with Material-UI components

import { alpha, createTheme, ThemeOptions } from '@mui/material/styles';
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
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '-0.01em'
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.45,
      letterSpacing: '0.01em'
    },
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
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          colorScheme: 'light',
          '--app-bg': designSystem.colors.background.default,
          '--app-surface': designSystem.colors.background.paper,
          '--app-border': alpha(designSystem.colors.primary.main, 0.08),
          '--app-text-primary': designSystem.colors.text.primary,
          '--app-text-secondary': designSystem.colors.text.secondary,
          '--app-focus': alpha(designSystem.colors.primary.main, 0.34),
        },
        'html, body, #root': {
          minHeight: '100%',
        },
        html: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          scrollBehavior: 'smooth',
        },
        body: {
          backgroundColor: designSystem.colors.background.default,
          color: designSystem.colors.text.primary,
          fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
        },
        a: {
          color: 'inherit',
          textDecorationColor: alpha(designSystem.colors.primary.main, 0.28),
          textUnderlineOffset: '0.18em',
        },
        '::selection': {
          backgroundColor: alpha(designSystem.colors.secondary.main, 0.32),
          color: designSystem.colors.primary.dark,
        },
      },
    },

    // Button component customization - Premium
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: designSystem.borderRadius.md,
          padding: '10px 20px',
          minHeight: 44,
          transition: `all ${animations.duration.standard}ms ${animations.easing.easeInOut}`,
          boxShadow: 'none',
        },
        contained: {
          background: designSystem.colors.primary.main,
          boxShadow: `0 10px 24px ${alpha(designSystem.colors.primary.main, 0.18)}`,
          '&:hover': {
            background: designSystem.colors.primary.dark,
            boxShadow: `0 14px 28px ${alpha(designSystem.colors.primary.main, 0.22)}`,
          },
          '&:active': {
            boxShadow: `0 8px 18px ${alpha(designSystem.colors.primary.main, 0.2)}`,
          },
          '&.Mui-disabled': {
            background: designSystem.colors.background.light,
            color: designSystem.colors.text.disabled,
            boxShadow: 'none',
            border: `1px solid ${alpha(designSystem.colors.primary.main, 0.08)}`,
          }
        },
        outlined: {
          borderWidth: '1px',
          borderColor: alpha(designSystem.colors.primary.main, 0.22),
          '&:hover': {
            borderWidth: '1px',
            borderColor: alpha(designSystem.colors.primary.main, 0.36),
            backgroundColor: alpha(designSystem.colors.primary.main, 0.04),
          }
        },
        text: {
          '&:hover': {
            backgroundColor: alpha(designSystem.colors.primary.main, 0.04)
          }
        }
      }
    },

    // Card component customization - Premium
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: designSystem.borderRadius.lg,
          border: `1px solid ${alpha(designSystem.colors.primary.main, 0.08)}`,
          boxShadow: `0 10px 30px ${alpha('#0f172a', 0.06)}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: `0 14px 34px ${alpha('#0f172a', 0.09)}`,
            borderColor: alpha(designSystem.colors.primary.main, 0.14),
            transform: 'translateY(-1px)'
          }
        }
      }
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: designSystem.borderRadius.lg,
        },
      },
    },

    // TextField component customization - Premium
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: designSystem.borderRadius.md,
            backgroundColor: designSystem.colors.background.paper,
            transition: `all ${animations.duration.standard}ms ${animations.easing.easeInOut}`,
            '& fieldset': {
              borderColor: alpha(designSystem.colors.primary.main, 0.12),
              borderWidth: '1px'
            },
            '&:hover fieldset': {
              borderColor: alpha(designSystem.colors.primary.main, 0.22),
              borderWidth: '1px'
            },
            '&.Mui-focused fieldset': {
              borderColor: designSystem.colors.primary.main,
              borderWidth: '1px',
              boxShadow: `0 0 0 4px ${alpha(designSystem.colors.primary.main, 0.1)}`
            }
          },
          '& .MuiInputLabel-root': {
            fontWeight: 500,
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: designSystem.colors.primary.main,
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
            backgroundColor: designSystem.colors.background.paper,
            transition: `all ${animations.duration.standard}ms ${animations.easing.easeInOut}`,
            '& fieldset': {
              borderColor: alpha(designSystem.colors.primary.main, 0.12),
              borderWidth: '1px'
            },
            '&:hover fieldset': {
              borderColor: alpha(designSystem.colors.primary.main, 0.22),
              borderWidth: '1px'
            },
            '&.Mui-focused fieldset': {
              borderColor: designSystem.colors.primary.main,
              borderWidth: '1px',
              boxShadow: `0 0 0 4px ${alpha(designSystem.colors.primary.main, 0.1)}`
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
          boxShadow: `0 32px 72px ${alpha('#0f172a', 0.18)}`,
          backgroundColor: designSystem.colors.background.paper,
          border: `1px solid ${alpha(designSystem.colors.primary.main, 0.08)}`,
        }
      }
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: '24px 24px 8px',
          ...designSystem.typography.h5,
        },
      },
    },

    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '8px 24px 24px',
        },
      },
    },

    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '0 24px 24px',
          gap: 12,
        },
      },
    },

    // Chip component customization - Premium
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: designSystem.borderRadius.md,
          fontWeight: 600,
          transition: 'all 0.2s ease',
          border: `1px solid ${alpha(designSystem.colors.primary.main, 0.08)}`,
        },
        filled: {
          '&:hover': {
            transform: 'translateY(-1px)'
          }
        }
      }
    },

    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 52,
        },
        indicator: {
          height: 3,
          borderRadius: 999,
          backgroundColor: designSystem.colors.secondary.main,
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 52,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.95rem',
          color: alpha(designSystem.colors.text.primary, 0.72),
          '&.Mui-selected': {
            color: designSystem.colors.primary.main,
          },
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: alpha(designSystem.colors.primary.main, 0.08),
        },
        head: {
          fontSize: '0.78rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: alpha(designSystem.colors.text.primary, 0.7),
          backgroundColor: alpha(designSystem.colors.primary.main, 0.02),
        },
        body: {
          fontSize: '0.92rem',
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: designSystem.borderRadius.lg,
          alignItems: 'center',
        },
        standardInfo: {
          backgroundColor: alpha(designSystem.colors.info.main, 0.08),
          color: designSystem.colors.primary.dark,
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: `0 1px 0 ${alpha(designSystem.colors.primary.main, 0.08)}`,
          backdropFilter: 'blur(14px)',
          backgroundImage: 'none',
        },
      },
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
