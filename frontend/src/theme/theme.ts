// Enhanced Material-UI Theme Configuration
// Integrates our design system with Material-UI components

import { alpha, createTheme, ThemeOptions } from '@mui/material/styles';
import { animations, designSystem } from './designSystem';

export type AppThemeMode = 'light' | 'dark';

declare module '@mui/material/styles' {
  interface TypeBackground {
    light: string;
    dark: string;
  }
}

const getPaletteTokens = (mode: AppThemeMode) => {
  const isDark = mode === 'dark';

  return {
    mode,
    primary: designSystem.colors.primary,
    secondary: designSystem.colors.secondary,
    success: designSystem.colors.success,
    warning: designSystem.colors.warning,
    error: designSystem.colors.error,
    info: designSystem.colors.info,
    text: isDark
      ? {
          primary: '#f8fafc',
          secondary: 'rgba(248, 250, 252, 0.72)',
          disabled: 'rgba(248, 250, 252, 0.42)',
        }
      : designSystem.colors.text,
    background: {
      default: isDark ? '#0f172a' : designSystem.colors.background.default,
      paper: isDark ? '#111827' : designSystem.colors.background.paper,
      light: isDark ? '#182235' : designSystem.colors.background.light,
      dark: isDark ? '#020617' : '#e2e8f0',
    },
    divider: isDark ? 'rgba(148, 163, 184, 0.18)' : designSystem.colors.divider,
  };
};

const getThemeOptions = (mode: AppThemeMode): ThemeOptions => {
  const isDark = mode === 'dark';
  const palette = getPaletteTokens(mode);
  const elevatedBorder = alpha(palette.primary.main, isDark ? 0.18 : 0.08);
  const elevatedBorderHover = alpha(palette.primary.main, isDark ? 0.28 : 0.14);
  const fieldBackground = isDark ? alpha(palette.background.paper, 0.92) : palette.background.paper;
  const surfaceShadow = isDark
    ? `0 18px 40px ${alpha('#020617', 0.42)}`
    : `0 10px 30px ${alpha('#0f172a', 0.06)}`;
  const surfaceHoverShadow = isDark
    ? `0 24px 48px ${alpha('#020617', 0.52)}`
    : `0 14px 34px ${alpha('#0f172a', 0.09)}`;
  const dialogShadow = isDark
    ? `0 36px 72px ${alpha('#020617', 0.56)}`
    : `0 32px 72px ${alpha('#0f172a', 0.18)}`;

  return {
    palette,
  
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

    spacing: designSystem.spacing.sm,

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
            colorScheme: mode,
            '--app-bg': palette.background.default,
            '--app-surface': palette.background.paper,
            '--app-border': elevatedBorder,
            '--app-text-primary': palette.text.primary,
            '--app-text-secondary': palette.text.secondary,
            '--app-focus': alpha(palette.primary.main, isDark ? 0.42 : 0.34),
            '--color-primary': palette.primary.main,
            '--color-warning': palette.warning.main,
            '--color-focus': palette.primary.main,
            '--color-focus-alt': palette.secondary.main,
            '--color-white': palette.common?.white ?? '#ffffff',
            '--color-bg-default': palette.background.default,
            '--color-bg-dark': palette.background.dark,
            '--color-scrollbar-track': isDark ? '#0b1220' : '#f1f1f1',
            '--color-scrollbar-thumb': isDark ? '#475569' : '#888',
            '--color-scrollbar-thumb-hover': isDark ? '#64748b' : '#555',
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
            backgroundColor: palette.background.default,
            color: palette.text.primary,
            fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
          },
          a: {
            color: 'inherit',
            textDecorationColor: alpha(palette.primary.main, isDark ? 0.4 : 0.28),
            textUnderlineOffset: '0.18em',
          },
          '::selection': {
            backgroundColor: alpha(palette.secondary.main, isDark ? 0.42 : 0.32),
            color: isDark ? palette.text.primary : palette.primary.dark,
          },
        },
      },

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
            background: palette.primary.main,
            boxShadow: `0 10px 24px ${alpha(palette.primary.main, isDark ? 0.32 : 0.18)}`,
            '&:hover': {
              background: palette.primary.dark,
              boxShadow: `0 14px 28px ${alpha(palette.primary.main, isDark ? 0.38 : 0.22)}`,
            },
            '&:active': {
              boxShadow: `0 8px 18px ${alpha(palette.primary.main, isDark ? 0.34 : 0.2)}`,
            },
            '&.Mui-disabled': {
              background: palette.background.light,
              color: palette.text.disabled,
              boxShadow: 'none',
              border: `1px solid ${elevatedBorder}`,
            }
          },
          outlined: {
            borderWidth: '1px',
            borderColor: alpha(palette.primary.main, isDark ? 0.38 : 0.22),
            '&:hover': {
              borderWidth: '1px',
              borderColor: alpha(palette.primary.main, isDark ? 0.52 : 0.36),
              backgroundColor: alpha(palette.primary.main, isDark ? 0.12 : 0.04),
            }
          },
          text: {
            '&:hover': {
              backgroundColor: alpha(palette.primary.main, isDark ? 0.12 : 0.04)
            }
          }
        }
      },

      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: designSystem.borderRadius.lg,
            border: `1px solid ${elevatedBorder}`,
            backgroundImage: 'none',
            boxShadow: surfaceShadow,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: surfaceHoverShadow,
              borderColor: elevatedBorderHover,
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

      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: designSystem.borderRadius.md,
              backgroundColor: fieldBackground,
              transition: `all ${animations.duration.standard}ms ${animations.easing.easeInOut}`,
              '& fieldset': {
                borderColor: alpha(palette.primary.main, isDark ? 0.24 : 0.12),
                borderWidth: '1px'
              },
              '&:hover fieldset': {
                borderColor: alpha(palette.primary.main, isDark ? 0.38 : 0.22),
                borderWidth: '1px'
              },
              '&.Mui-focused fieldset': {
                borderColor: palette.primary.main,
                borderWidth: '1px',
                boxShadow: `0 0 0 4px ${alpha(palette.primary.main, isDark ? 0.22 : 0.1)}`
              }
            },
            '& .MuiInputLabel-root': {
              fontWeight: 500,
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: palette.primary.main,
            }
          }
        }
      },

      MuiFormControl: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: designSystem.borderRadius.md,
              backgroundColor: fieldBackground,
              transition: `all ${animations.duration.standard}ms ${animations.easing.easeInOut}`,
              '& fieldset': {
                borderColor: alpha(palette.primary.main, isDark ? 0.24 : 0.12),
                borderWidth: '1px'
              },
              '&:hover fieldset': {
                borderColor: alpha(palette.primary.main, isDark ? 0.38 : 0.22),
                borderWidth: '1px'
              },
              '&.Mui-focused fieldset': {
                borderColor: palette.primary.main,
                borderWidth: '1px',
                boxShadow: `0 0 0 4px ${alpha(palette.primary.main, isDark ? 0.22 : 0.1)}`
              }
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: palette.primary.main
            }
          }
        }
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: designSystem.borderRadius.xl,
            boxShadow: dialogShadow,
            backgroundColor: palette.background.paper,
            border: `1px solid ${elevatedBorder}`,
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

      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: designSystem.borderRadius.md,
            fontWeight: 600,
            transition: 'all 0.2s ease',
            border: `1px solid ${elevatedBorder}`,
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
            backgroundColor: palette.secondary.main,
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
            color: alpha(palette.text.primary, 0.72),
            '&.Mui-selected': {
              color: palette.primary.main,
            },
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottomColor: elevatedBorder,
          },
          head: {
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: alpha(palette.text.primary, 0.7),
            backgroundColor: alpha(palette.primary.main, isDark ? 0.12 : 0.02),
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
            backgroundColor: alpha(palette.info.main, isDark ? 0.18 : 0.08),
            color: isDark ? palette.text.primary : palette.primary.dark,
          },
        },
      },

      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: `0 1px 0 ${elevatedBorder}`,
            backdropFilter: 'blur(14px)',
            backgroundImage: 'none',
          },
        },
      },

      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: isDark ? elevatedBorder : designSystem.colors.primary[50]
          }
        }
      }
    }
  };
};

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

export const createAppTheme = (mode: AppThemeMode = 'light') => {
  const baseTheme = createTheme(getThemeOptions(mode));

  return createTheme(baseTheme, {
    custom: {
      designSystem,
    },
  });
};

export const theme = createAppTheme('light');

export default theme;
