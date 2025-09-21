import { createTheme } from '@mui/material/styles';

// Custom theme constants (shared between light and dark themes)
export const themeConstants = {
  // Brand colors
  brandGold: '#FFD700',
  hotelShopRed: '#cc0000',
  
  // Payment method colors
  mbirrOrange: '#FF6B35',
  telebirrGreen: '#00A651',
  
  // Layout constants
  logoHeight: 32, // 32px - compact navbar logo
  headerMaxWidths: {
    xs: '280px',
    sm: '400px', 
    md: '600px'
  },
  
  // Common dimensions
  commonHeights: {
    loading: '200px',
    scrollableArea: '300px',
    uploadArea: '400px'
  },
  
  // Shadows and effects
  shadows: {
    textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
    cardShadow: '0 8px 32px rgba(0,0,0,0.3)',
    buttonShadow: '0 4px 20px rgba(0,0,0,0.5)'
  },
  
  // Border styles
  borders: {
    light: '1px solid',
    medium: '2px solid',
    dashed: '2px dashed'
  },
  
  // Scrollbar styles - different for light and dark themes
  scrollbar: {
    light: {
      width: 6,
      track: '#f1f1f1',
      thumb: '#c1c1c1',
      thumbRadius: 3,
      thumbHover: '#a8a8a8',
    },
    dark: {
      width: 6,
      track: '#2c2c2c',
      thumb: '#555555',
      thumbRadius: 3,
      thumbHover: '#777777',
    }
  },
  
  // Transparency values
  alpha: {
    low: 0.1,
    medium: 0.2,
    high: 0.3,
  },
  
  // Gradient styles - different for light and dark themes
  gradients: {
    light: {
      primaryButton: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
      successButton: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
      heroBackground: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
    },
    dark: {
      primaryButton: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
      successButton: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
      heroBackground: 'linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)',
    }
  },
  
  // Performance-optimized animation styles
  animations: {
    fast: 'all 0.15s ease',
    normal: 'all 0.2s ease', 
    slow: 'all 0.3s ease',
    none: 'none',
  },
  
  // Lightweight shadow alternatives - different for light and dark themes
  lightShadows: {
    light: {
      minimal: '0 1px 3px rgba(0,0,0,0.1)',
      light: '0 2px 4px rgba(0,0,0,0.1)', 
      medium: '0 4px 8px rgba(0,0,0,0.1)',
    },
    dark: {
      minimal: '0 1px 3px rgba(0,0,0,0.3)',
      light: '0 2px 4px rgba(0,0,0,0.3)', 
      medium: '0 4px 8px rgba(0,0,0,0.3)',
    }
  },
};

// Base theme configuration
const baseThemeConfig = {
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8, // Base spacing unit
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          '&::-webkit-scrollbar': {
            width: '6px',
          },
        },
      },
    },
  },
};

// Light Theme  
const lightThemeBase = createTheme({
  ...baseThemeConfig,
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#f50057',
      light: '#ff5983',
      dark: '#c51162',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
    success: {
      main: themeConstants.telebirrGreen,
      light: '#F0FFF4',
    },
    warning: {
      main: themeConstants.mbirrOrange,
      light: '#FFF5F0',
    },
    info: {
      main: '#2196f3',
      light: '#e3f2fd',
    },
    error: {
      main: '#f44336',
      light: '#ffebee',
    },
  },
  components: {
    ...baseThemeConfig.components,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          '&::-webkit-scrollbar': {
            width: themeConstants.scrollbar.light.width,
          },
          '&::-webkit-scrollbar-track': {
            background: themeConstants.scrollbar.light.track,
          },
          '&::-webkit-scrollbar-thumb': {
            background: themeConstants.scrollbar.light.thumb,
            borderRadius: themeConstants.scrollbar.light.thumbRadius,
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: themeConstants.scrollbar.light.thumbHover,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          // Don't override AppBar colors - let the component control its own colors
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

// Extend light theme with custom properties
const extendedLightTheme = createTheme(lightThemeBase, {
  custom: {
    constants: {
      ...themeConstants,
      scrollbar: themeConstants.scrollbar.light,
      gradients: themeConstants.gradients.light,
      lightShadows: themeConstants.lightShadows.light,
    },
  },
} as any);

// Dark Theme
const darkThemeBase = createTheme({
  ...baseThemeConfig,
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    secondary: {
      main: '#f48fb1',
      light: '#f8bbd9',
      dark: '#f06292',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
    success: {
      main: '#4caf50',
      light: '#c8e6c9',
    },
    warning: {
      main: '#ff9800',
      light: '#ffe0b2',
    },
    info: {
      main: '#2196f3',
      light: '#bbdefb',
    },
    error: {
      main: '#f44336',
      light: '#ffcdd2',
    },
    divider: '#333333',
  },
  components: {
    ...baseThemeConfig.components,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#121212',
          '&::-webkit-scrollbar': {
            width: themeConstants.scrollbar.dark.width,
          },
          '&::-webkit-scrollbar-track': {
            background: themeConstants.scrollbar.dark.track,
          },
          '&::-webkit-scrollbar-thumb': {
            background: themeConstants.scrollbar.dark.thumb,
            borderRadius: themeConstants.scrollbar.dark.thumbRadius,
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: themeConstants.scrollbar.dark.thumbHover,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          color: '#ffffff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e1e1e',
          borderRight: '1px solid #333333',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#555555',
            },
            '&:hover fieldset': {
              borderColor: '#777777',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          },
        },
      },
    },
  },
});

// Extend dark theme with custom properties
const extendedDarkTheme = createTheme(darkThemeBase, {
  custom: {
    constants: {
      ...themeConstants,
      scrollbar: themeConstants.scrollbar.dark,
      gradients: themeConstants.gradients.dark,
      lightShadows: themeConstants.lightShadows.dark,
    },
  },
} as any);

// Type declarations are already defined in theme.ts

// Export the extended themes
export { extendedLightTheme as lightTheme, extendedDarkTheme as darkTheme };

// Export the original light theme for backward compatibility  
export default extendedLightTheme;