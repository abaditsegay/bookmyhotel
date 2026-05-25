import { alpha, createTheme, ThemeOptions } from '@mui/material/styles';

// Extend Material UI's Palette with our custom tokens
declare module '@mui/material/styles' {
  interface Palette {
    status: {
      available: string;
      booked: string;
      occupied: string;
      maintenance: string;
      cleaning: string;
      pending: string;
      checkedOut: string;
    };
    glass: {
      light: string;
      dark: string;
    };
    gradients: {
      primary: string;
      secondary: string;
      accent: string;
      warm: string;
      slate: string;
      purple: string;
      white: string;
      dark: string;
    };
    brand: {
      mbirr: string;
      telebirr: string;
    };
    slate: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    purple: {
      main: string;
    };
  }
  interface PaletteOptions {
    status?: Partial<Palette['status']>;
    glass?: Partial<Palette['glass']>;
    gradients?: Partial<Palette['gradients']>;
    brand?: Partial<Palette['brand']>;
    slate?: Partial<Palette['slate']>;
    purple?: Partial<Palette['purple']>;
  }
}

export const createAppTheme = (mode: 'light' | 'dark' = 'light') => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#1a365d',
        light: '#2d63ab',
        dark: '#0f2744',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#E8B86D',
        light: '#F0C880',
        dark: '#D4A355',
        contrastText: '#1a365d',
      },
      success: {
        main: '#2e7d32',
      },
      warning: {
        main: '#f57c00',
      },
      error: {
        main: '#d32f2f',
      },
      info: {
        main: '#63B3ED',
      },
      status: {
        available: '#4CAF50',
        booked: '#2196F3',
        occupied: '#FF9800',
        maintenance: '#F44336',
        cleaning: '#FFD54F',
        pending: '#9E9E9E',
        checkedOut: '#607D8B',
      },
      brand: {
        mbirr: '#FFA500',
        telebirr: '#4CAF50',
      },
      slate: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
      },
      purple: {
        main: '#a855f7',
      },
      glass: {
        light: 'rgba(255, 255, 255, 0.7)',
        dark: 'rgba(30, 30, 30, 0.7)',
      },
      gradients: {
        primary: 'linear-gradient(135deg, #1a365d 0%, #0f2744 100%)',
        secondary: 'linear-gradient(135deg, #E8B86D 0%, #D4A355 100%)',
        accent: 'linear-gradient(135deg, #63B3ED 0%, #3182CE 100%)',
        warm: 'linear-gradient(135deg, #F0C880 0%, #E8B86D 100%)',
        slate: 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)',
        purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        white: 'linear-gradient(135deg, #ffffff 0%, #ffffff 100%)',
        dark: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      },
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '10px 24px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: 'none',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
    },
  });
};